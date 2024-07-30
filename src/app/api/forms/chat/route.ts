import { NextRequest, NextResponse } from "next/server";
import { findDocByKey, findDocument, getChats, setDocumentByID, updateDocument } from "../../firestoreService";
import getOpenAIResponse from "../openai";
import { v4 as uuidv4 } from 'uuid';
import getOpenAIChatResponse from "../openaiChatCompletion";
import OpenAI from "openai";
import { GptChatDataType, OpenAIChatMessageType } from "../../types";
import { ErrorObject } from "openai/resources";

export async function GET(request: NextRequest) {
    try {
        const authHeader = await request.headers.get("authorization")
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized: Missing Authorization header' }, { status: 401 });
        }
        const encodedToken = authHeader.split(' ')[1];
        const decodedToken = Buffer.from(encodedToken, 'base64').toString('utf-8');
        const user: any = await findDocByKey("uid", decodedToken)
        return NextResponse.json({ status: 200 });
        // Check if the user exists in the database
        // if (user) {
        //     const document: any = await getDocument("gpt-forms", user?.uid);
        //     console.log("document", document)
        //     if (document)
        //         return NextResponse.json({ data: document }, { status: 200 });
        // }
        return NextResponse.json({ error: "Not Found" }, { status: 400 });
    } catch (error: any) {
        console.error("Error:", error?.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const uuid: string = uuidv4()
        const authHeader = await request.headers.get("authorization")

        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized: Missing Authorization header' }, { status: 401 });
        }
        const encodedToken = authHeader.split(' ')[1];
        const decodedToken = Buffer.from(encodedToken, 'base64').toString('utf-8');
        const user: any = await findDocByKey("uid", decodedToken)
        const body = await request.json();
        const collectionName = "prompts"

        // Check if the user exists in the database
        if (user) {
            const checkPrompt = await findDocument("gpt-forms", body?.promptId)
            if (!checkPrompt) {
                return NextResponse.json({ error: "Invalid Prompt" }, { status: 400 });
            }
            else {
                await findDocument(collectionName, body?.promptId);

                let data: any = await getChats(collectionName, body?.promptId);
                const chats: GptChatDataType[] = data?.questions;
                const messages: OpenAIChatMessageType[] = data?.messages;

                const index = chats?.findIndex((chat: GptChatDataType) => chat.id === body?.questionId);
                const chat: GptChatDataType = chats[index];
                let chatEnded = false;

                messages?.push({
                    role: "user",
                    content: body?.answer,
                })
                chats[index] = {
                    id: body?.questionId,
                    question: {
                        text: chat?.question?.text,
                        createdAt: chat?.question?.createdAt,
                    },
                    answer: {
                        text: body?.answer,
                        createdAt: new Date(),
                    }
                }
                const sended = await setDocumentByID(
                    collectionName,
                    chats,
                    body?.promptId,
                )
                if (messages) {


                    let openaiResponse: OpenAIChatMessageType | ErrorObject = await getOpenAIChatResponse(messages)
                    let content = openaiResponse.content?.toString()
                    let requiredFields: {} | undefined = undefined;
                    if (content?.includes("requiredFields:")) {

                        const json = content?.split("requiredFields:")[1]
                        openaiResponse.content = content?.split("requiredFields:")[0];
                        console.log(openaiResponse.content)
                        requiredFields = json ? JSON.parse(json) : undefined

                    }
                    
                    

                    openaiResponse && chats.push({
                        id: uuid,
                        question: {
                            text: openaiResponse.content || "",
                            createdAt: new Date(),
                        },
                    });



                    messages?.push(openaiResponse);
                    if (messages && chats && requiredFields) {
                        data = {
                            questions: [...chats],
                            messages: [...messages],
                            requiredFields,
                        }
                        await updateDocument(collectionName, { ...data, }, body?.promptId);
                        chatEnded = true
                        return NextResponse.json({
                            message: "submitted", data: { chatEnded }
                        }, { status: 200 });
                    }
                    if (!requiredFields) {
                        const updated = await setDocumentByID(
                            collectionName,
                            chats,
                            body?.promptId,
                        )
                        const added: any = await updateDocument(collectionName, { messages }, body?.promptId);

                        return NextResponse.json({
                            message: "submitted", data: { chatEnded }
                        }, { status: 200 });
                    }
                }
            }
        }
        return NextResponse.json({ error: "User not Validate." }, { status: 400 });

    } catch (error: any) {
        console.error("Error:", error?.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
