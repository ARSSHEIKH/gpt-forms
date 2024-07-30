import { NextRequest, NextResponse } from "next/server";
import firebaseAdmin from '@/app/config/firebaseAdmin';
import { addDocument } from '../firestoreService';

export async function GET(request: NextRequest) {
  try {
    const idToken = request.headers.get('authorization')?.split('Bearer ')[1];

    if (!idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 400 })
    }
    else {

      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      const {
        displayName,
        uid,
        email,
        photoURL
      } = decodedToken;

      const user = {
        displayName: displayName ?? "",
        uid: uid ?? "",
        email: email ?? "",
        photoURL: photoURL ?? "",
      };

      const isAdded = await addDocument("formbuilder-users", user);
      if (isAdded)
        return NextResponse.json({ success: true, data: { email, idToken } }, { status: 200 })
      else
        return NextResponse.json({ success: false }, { status: 400 })
    }
  } catch (error: any) {
    console.log("error", error?.message)
    return NextResponse.json({ error: error.message }, { status: 500 })

  }
}