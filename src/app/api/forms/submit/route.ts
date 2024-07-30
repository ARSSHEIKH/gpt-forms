import { NextRequest, NextResponse } from "next/server";
import { findDocByKey, setDocument, setDocumentByID, setDocumentByIDs, updateDocument } from "../../firestoreService";
import { v4 as uuidv4 } from 'uuid';
import getOpenAIResponse from "../openai";
import getOpenAIChatResponse from "../openaiChatCompletion";
import OpenAI from "openai";
import { OpenAIChatMessageType } from "../../types";
import { ChatCompletionMessage, ErrorObject } from "openai/resources";

export const systemMessage = `And at the last when all required information gathered provide me parameters of all required information after getting all info don't returned all required info infront of user provide me with different format so hide that content provide me like example: parameters: email, full name. I want to use them in function calling. and start direct Questioning without telling me 'I understand'`


export async function POST(request: NextRequest) {
    try {
        const uuid: string = uuidv4()
        const authHeader = await request.headers.get("authorization")

        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized: Missing Authorization header' }, { status: 401 });
        }

        const encodedToken = authHeader.split(' ')[1];
        const decodedToken = Buffer.from(encodedToken, 'base64').toString('utf-8');
        const user: any = await findDocByKey("uid", decodedToken);
        const promptsCollection = process.env.DB_COLLECTION_PROMPTS;
        const conversationCollection = process.env.DB_COLLECTION_CONVERSATIONS;

        const reqBody: {
            heading: string,
            title: string,
            description: string,
        } = await request.json();

        const messages: OpenAIChatMessageType[] = [
            {
                "role": "system",
                "content": `${reqBody.description}, `
            },
            {
                "role": "system",
                "content": `${systemMessage}`
            },

        ];

        if (user) {
            const collectionName = process.env.DB_COLLECTION_FORM;
            const addedID: any = await setDocument(collectionName, { ...reqBody }, user?.uid);
            const openaiResponse: OpenAIChatMessageType | undefined | ErrorObject = await getOpenAIChatResponse(messages);

            if (openaiResponse?.role) {

                // const addedChat: any = await setDocumentByID(conversationCollection, [{
                //     id: uuid,
                //     question: {
                //         text: openaiResponse?.content,
                //         createdAt: new Date(),
                //     },

                // }], addedID);


                const data = [
                    {
                        uid: decodedToken,
                        questions: [{
                            id: uuid,
                            question: {
                                text: openaiResponse?.content,
                                createdAt: new Date(),
                            },

                        }],
                        messages,
                        createdAt: new Date(),
                    }
                ]

                messages.push(openaiResponse);

                const createdChat = await setDocumentByIDs(
                    conversationCollection,
                    { data },
                    addedID
                );

                const promptResponse = await setDocumentByIDs(
                    promptsCollection,
                    {
                        prompts: [
                            {
                                uid: decodedToken,
                                requiredFields: {}
                            }
                        ]
                    }
                    ,
                    addedID
                );
                const questions = [
                    {
                        id: uuid,
                        question: {
                            text: openaiResponse?.content,
                            createdAt: new Date(),
                        }
                    }
                ]


                if (addedID && createdChat)
                    return NextResponse.json({ message: "Create successfully", data: { ...reqBody, promptId: addedID } });
            }
            return NextResponse.json({ error: "Something went wrong from openai" }, { status: 403 });
        }
        return NextResponse.json({ error: "Not Validate" }, { status: 400 });

    } catch (error: any) {
        console.error("Error:", error?.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
