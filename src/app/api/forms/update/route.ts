import { NextRequest, NextResponse } from "next/server";
import { findDocByKey, getChats, getDocumentByID, updateDocument } from "../../firestoreService";
import getOpenAIChatResponse from "../openaiChatCompletion";
import { OpenAIChatMessageType } from "../../types";
import { Chat, ChatCompletionMessageToolCall, ErrorObject } from "openai/resources";
import openaiGetJson from "../openaiGetJson";
import { tableRowDataType } from "@/app/types/types";
import { convertTimeStampToDate } from "@/utils/dateTimeFormats";
// let recursiveIndex = 0;
const recursiveFields = async (messages, requiredFields, i, fieldsArray = []) => {

    const requiredField = requiredFields[i];
    console.log("recursive", requiredField)
    console.log("recursive", i)
    const jsonResponse: tableRowDataType[] | undefined = await openaiGetJson(messages, requiredField)
    fieldsArray.push({
        id: jsonResponse[0]?.id,
        function: {
            arguments: jsonResponse[0]?.function?.arguments,
            name: jsonResponse[0]?.function?.name,
        },
    });



    if (i == 2) {
        return fieldsArray;
    }
    return await recursiveFields(messages, requiredFields, ++i, fieldsArray);
}

export async function PUT(request: NextRequest) {
    try {
        const authHeader = await request.headers.get("authorization");

        const id = await request.nextUrl.searchParams.get("id");

        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized: Missing Authorization header' }, { status: 401 });
        }

        const encodedToken = authHeader.split(' ')[1];
        const decodedToken = Buffer.from(encodedToken, 'base64').toString('utf-8');
        const user: any = await findDocByKey("uid", decodedToken)

        const reqBody = await request.json();
        const collectionName = process.env.DB_COLLECTION_FORM;
        const promptsCollection = process.env.DB_COLLECTION_PROMPTS

        if (user) {
            // const document: any = await getDocumentByID("prompts", id);
            const getPrompts = await getDocumentByID(promptsCollection, id);
            // const document: any = await getChats("conversations", id, );
            const prompts = getPrompts.prompts;
            // const conversations = await prompts?.map(async (c) => await getChats("conversations", id, c?.uid));
            // console.log("conversations", conversations)
            // const messages = prompts.messages;
            // const requiredFields: [] = chats?.requiredFields;
            if (reqBody?.save == 1) {

                const jsonResponse = await new Promise(async (resolve, reject) => {
                    try {
                        let jsonArray = [];
                        // Use Promise.all to wait for all async operations to complete
                        const promises = prompts?.map(async (prompt) => {
                            // const conversations = await getChats("conversations", id, prompt?.uid);
                            // const messages = conversations?.data?.messages;
                            // const json = await openaiGetJson(messages, prompt?.requiredFields[0]);
                            // console.log("prompt", prompt)
                            jsonArray.push({ ...prompt.requiredFields[0], endDate: prompt?.chatEndDate ? convertTimeStampToDate(prompt?.chatEndDate) : "" });
                        });

                        await Promise.all(promises); // Wait for all promises to resolve
                        resolve(jsonArray);
                    } catch (error) {
                        reject(error);
                    }
                });
                // console.log("jsonResponse", await jsonResponse)


                const docForm: any = await updateDocument(collectionName, { save: reqBody?.save }, id);
                // const getPrompts = await getDocumentByID(promptsCollection, id);

                // console.log("messages", messages)

                // uids.map(uid => uid == 
                // const document: any = await getChats("conversations", id,);
                // const requiredFields = await prompts?.map(async (prompt) => prompt?.requiredFields?.length > 0 ? await openaiGetJson(messages, prompt?.requiredFields[0]) : {})

                // console.log('====================================');
                // console.log("requiredFields", requiredFields);
                // console.log('====================================');

                // if (requiredFields.length) {
                return NextResponse.json({ message: "Table Generated", data: { ...reqBody, tableData: jsonResponse } });
                // };


                return NextResponse.json({ error: "Server Error" }, { status: 500 });
            }

            const document: any = await getChats("conversations", id, decodedToken);
            console.log("document", document)
            let chats: any = document?.data;
            const docForm: any = await updateDocument(collectionName, { ...reqBody }, id);
            if (docForm?.prevData?.description != docForm?.updatedData?.description) {
                const messages: OpenAIChatMessageType[] = [
                    {
                        "role": "system",
                        "content": reqBody.description
                    },
                ];

                const openaiResponse: OpenAIChatMessageType | undefined | ErrorObject = await getOpenAIChatResponse(messages);

                if (openaiResponse?.role) {
                    messages.push(openaiResponse);
                    if (openaiResponse) {
                        chats.questions = [{
                            id: chats?.questions[0].id,
                            question: {
                                text: openaiResponse?.content,
                                createdAt: new Date(),
                            },
                        }]
                        chats.messages = messages;
                        await updateDocument(promptsCollection, chats, id);
                    }
                }

            };

            if (docForm) return NextResponse.json({ message: "Updated successfully", data: { ...reqBody, promptId: id } }, { status: 200 });
            return NextResponse.json({ error: "Server Error" }, { status: 500 });
        }
        return NextResponse.json({ error: "User not Validate" }, { status: 400 });

    } catch (error: any) {
        console.error("Error:", error?.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
