import { NextRequest, NextResponse } from "next/server";
import { addDocument, addDocumentByEmail, findDocument, findUserByEmailOrUsername } from "../firestoreService";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { email, password } = reqBody;

    // Check if the user exists in the database
    const response: any = await findUserByEmailOrUsername("email", email, true);
    if (!response?.success) {
      return NextResponse.json({ error: response?.message }, { status: response?.status, });
    }

    // Verify the password
    if (response.data?.password !== password) {

      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    // If the user exists and the password is correct, return success
    return NextResponse.json({ message: "Sign-in successful", data: response.data });
  } catch (error: any) {
    console.error("Error:", error?.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
