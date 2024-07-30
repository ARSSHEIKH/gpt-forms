import { NextRequest, NextResponse } from "next/server";
import { findDocByKey, getDocument } from "../../firestoreService";

export async function GET(request: NextRequest) {
    try {
        const authHeader = await request.headers.get("authorization")
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized: Missing Authorization header' }, { status: 401 });
        }

        const encodedToken = authHeader.split(' ')[1]; 
        const decodedToken = Buffer.from(encodedToken, 'base64').toString('utf-8');
        const user: any = await findDocByKey("uid", decodedToken)
        const collectionName = process.env.DB_COLLECTION_FORM;
        console.log("user?.uid", user?.uid)
        // Check if the user exists in the database
        if (user) {
            const document: any = await getDocument(collectionName, user?.uid);
            console.log("document", document)
            if (document)
                return NextResponse.json({ data: document }, { status: 200 });
        }
        return NextResponse.json({ error: "Not Available" }, { status: 400 });

    } catch (error: any) {
        console.error("Error:", error?.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
