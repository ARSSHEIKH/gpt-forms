import { NextRequest, NextResponse } from "next/server";
import { deleteDocuments, findDocByKey, } from "../../firestoreService";

export async function POST(request: NextRequest) {
    try {
        const ids = await request.json()

        const authHeader = await request.headers.get("authorization")

        // const id = await request.nextUrl.searchParams.get("id")

        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized: Missing Authorization header' }, { status: 401 });
        }


        const encodedToken = authHeader.split(' ')[1];
        const decodedToken = Buffer.from(encodedToken, 'base64').toString('utf-8');
        const user: any = await findDocByKey("uid", decodedToken)
        // Check if the user exists in the database
        if (user) {
            const deleted: any = await deleteDocuments("gpt-forms", ids);
            if (deleted)
                return NextResponse.json({ message: "Deleted successfully" });
        }
        return NextResponse.json({ error: "Not Validate" }, { status: 400 });

    } catch (error: any) {
        console.error("Error:", error?.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
