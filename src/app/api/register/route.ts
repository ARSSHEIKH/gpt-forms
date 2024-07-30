import { NextRequest, NextResponse } from "next/server";
import { addDocument, addDocumentByEmail, findDocument, findUserByEmailOrUsername } from "../firestoreService";

export async function POST(request: NextRequest) {
  try {


    const reqBody = await request.json()
    const { username, email, password } = reqBody;



    const response = await findUserByEmailOrUsername("email", email);
    console.log("searchUser0", response)

    if (!response?.status) {
      return NextResponse.json({ error: response?.message }, { status: response?.status })
    }
    else {

      const added = await addDocumentByEmail({ username, email, password });
      if (added) {

        return NextResponse.json({
          message: "User created successfully",
          success: true,
          savedUser: true,
          data: {
            token: "",
           ...added
          },
        }, { status: 200 })
      }
    }
    return NextResponse.json({ error: "Something went wrong from Server" }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })

  }
}