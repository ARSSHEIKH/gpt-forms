import { NextRequest, NextResponse } from "next/server";
import { findDocByKey, findDocument, getChats, getDocument, getDocumentByID, setDocumentByID, setDocumentByIDs, updateConversations, updateDocument } from "../../firestoreService";
import { GptChatDataType, OpenAIChatMessageType } from "../../types";
import { ErrorObject } from "openai/resources";
import getOpenAIChatResponse from "../../forms/openaiChatCompletion";
import { v4 } from "uuid";
import openaiGetJson from "../../forms/openaiGetJson";


const openaiChat = async (messages) => {
    let openaiResponse: OpenAIChatMessageType | ErrorObject = await getOpenAIChatResponse(messages)
    console.log("openaiResponse", openaiResponse)
    let content = openaiResponse.content?.toString()?.toLocaleLowerCase()
    let requiredFields: {} | undefined = undefined;
    if (content?.includes("parameters:")) {
        try {

            const json = content?.split("parameters:")[1];
           
            openaiResponse.content = content?.split("parameters:")[0];
            console.log(openaiResponse.content)
            requiredFields = json?.split(", ");
        } catch (error) {
            console.log("error", error)
            // openaiChat(messages)
        }
    }
    return {
        openaiResponse, requiredFields
    }
}
export async function POST(request: NextRequest) {
    try {
        const uuid: string = v4()
        const authHeader = await request.headers.get("authorization")
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized: Missing Authorization header' }, { status: 401 });
        }
        const encodedToken = authHeader.split(' ')[1];
        const uid = Buffer.from(encodedToken, 'base64').toString('utf-8');
        const user: any = await findDocByKey("uid", uid)
        const body = await request.json();
        const collectionName = "conversations";

        const id = await request.nextUrl.searchParams.get("id");

        const gpt_form = process.env.DB_COLLECTION_FORM;

        // Check if the user exists in the database
        if (user) {
            const checkPrompt = await findDocument(gpt_form, id)
            if (!checkPrompt) {
                return NextResponse.json({ error: "Invalid Prompt" }, { status: 400 });
            }
            else {

                let { data, currentIndex }: any = await getChats(collectionName, id, uid);


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
                };
                data = {
                    uid,
                    questions: chats,
                    messages,
                    createdAt: data?.createdAt ?? new Date(),
                    chatStarted: data?.chatStarted ?? new Date(),

                }




                // console.log("sended", data)
                // return
                const sended = await updateConversations(collectionName, data, id, currentIndex);
                if (messages) {


                    const { openaiResponse, requiredFields } = await openaiChat(messages)

                    openaiResponse && chats.push({
                        id: uuid,
                        question: {
                            text: openaiResponse.content || "",
                            createdAt: new Date(),
                        },
                    });
                    console.log("openaiResponse", openaiResponse)
                    messages?.push(openaiResponse);


                    // const updated = await setDocumentByID(
                    //     collectionName,
                    //     chats,
                    //     id,
                    // );


                    const sended = await updateConversations(collectionName, data, id, currentIndex)

                    // const added: any = await updateDocument(collectionName, { messages }, id);
                    let getPrompts = await getDocumentByID("prompts", id);
                    let prompts = getPrompts.prompts;
                    let findCurrentPromptIndex = prompts.findIndex(prompt => prompt.uid === uid)

                    // let requiredFieldsArray = [];
                    // console.log("requiredFields", requiredFields)
                    // requiredFieldsArray.push(requiredFields)



                    if (sended && requiredFields) {

                        const response = await openaiGetJson(messages, requiredFields)
                        data = {
                            uid,
                            requiredFields: response,
                            chatEndDate: new Date(),
                        }

                        if (findCurrentPromptIndex >= 0) {
                            prompts[findCurrentPromptIndex] = data
                        }
                        else {
                            prompts.push(data)
                        }


                        // await updateDocument("prompts", { ...data, }, id);
                        await updateDocument("prompts", { prompts }, id);
                        chatEnded = true
                        return NextResponse.json({
                            message: "submitted", data: { chatEnded }
                        }, { status: 200 });
                    }


                    return NextResponse.json({
                        message: "submitted", data: { chatEnded }
                    }, { status: 200 });



                }


                return NextResponse.json({
                }, { status: 200 });
            }





        }
        return NextResponse.json({ error: "Not Found" }, { status: 400 });
    } catch (error: any) {
        console.error("Error:", error?.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}