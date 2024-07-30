import { NextRequest, NextResponse } from "next/server";
import { findDocByKey, getChats, getDocumentByID, getDocumentWithID } from "../../../firestoreService";
export async function GET(request: NextRequest) {
    try {
        const authHeader = await request.headers.get("authorization")

        const id = await request.nextUrl.searchParams.get("id")

        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized: Missing Authorization header' }, { status: 401 });
        }

        const encodedToken = authHeader.split(' ')[1];
        const uid = Buffer.from(encodedToken, 'base64').toString('utf-8');
        const user: any = await findDocByKey("uid", uid)
        const collectionName = process.env.DB_COLLECTION_FORM;
        const promptsCollection = process.env.DB_COLLECTION_PROMPTS
        let chatsData: any = await getDocumentByID(promptsCollection, id);

        const prompts = chatsData.prompts;
        const isSubmitted = prompts?.length ? prompts[0]?.requiredFields ? true : false : false;
        console.log("isSubmitted", isSubmitted)

        if (user) {
            const document: any = await getDocumentWithID(collectionName, user?.uid, id);
            // console.log(document)
            if (document)
                return NextResponse.json({ data: document[0], isSubmitted }, { status: 200 });
        }
        return NextResponse.json({ error: "User not Found" }, { status: 400 });
    } catch (error: any) {
        console.error("Error:", error?.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
