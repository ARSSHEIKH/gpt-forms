import { NextRequest, NextResponse } from "next/server";
import { findDocByKey, getChats, getDocumentByID, setDocumentByID, setDocumentByIDs, updateConversations } from "../../firestoreService";
import { OpenAIChatMessageType } from "../../types";
import { ErrorObject } from "openai/resources";
import getOpenAIChatResponse from "../../forms/openaiChatCompletion";
import { v4 } from "uuid";
import { systemMessage } from "../../forms/submit/route";

export async function GET(request: NextRequest) {
    try {
        const uuid: string = v4()
        const authHeader = await request.headers.get("authorization")
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized: Missing Authorization header' }, { status: 401 });
        }
        const encodedToken = authHeader.split(' ')[1];
        const decodedToken = Buffer.from(encodedToken, 'base64').toString('utf-8');
        const user: any = await findDocByKey("uid", decodedToken)
        const collectionName = process.env.DB_COLLECTION_FORM;
        const conversationCollection = process.env.DB_COLLECTION_CONVERSATIONS;

        const slug = await request.nextUrl.searchParams.get("slug");

        const response = await getDocumentByID(
            collectionName,
            slug
        )

        let { data: chatsData, currentIndex } = await getChats('conversations', slug, decodedToken);


        const prompt = response?.description;


        const messages: OpenAIChatMessageType[] = [
            {
                "role": "system",
                "content": `${prompt}, `
            },
            {
                "role": "system",
                "content": `${systemMessage}`
            },

        ];
        const openaiResponse: OpenAIChatMessageType | undefined | ErrorObject = await getOpenAIChatResponse(messages);


        const questions = [
            {
                id: uuid,
                question: {
                    text: openaiResponse?.content,
                    createdAt: new Date(),
                }
            }
        ]
        messages.push(openaiResponse);

        const data =
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
            updated: false,
            createdAt: new Date(),
        };
        console.log(data);
        let createdChat;
        if (currentIndex == undefined || currentIndex == null || currentIndex == -1) {
            chatsData.push(data);
            createdChat = await setDocumentByIDs(
                conversationCollection,
                { data: chatsData },
                slug
            );

            return NextResponse.json({ status: 200, createdChat });
        } else {

            // chatsData = data;
            createdChat = await updateConversations(conversationCollection, chatsData, slug, currentIndex)

            return NextResponse.json({ status: 200, createdChat });
        }


        // Check if the user exists in the database
        // if (user) {
        //     const document: any = await getDocument(collectionName, user?.uid);
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