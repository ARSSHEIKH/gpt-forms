import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";


export async function createChat(slug: string, token: string) {
  const base64Credentials = btoa(token);
   try {
     const response = await fetch(`http://localhost:3000/api/chats/create?slug=${slug}`, {
      headers: {
        'Authorization': `Basic ${base64Credentials}`,
      },
       cache: 'no-store'
     })
     if (response.ok) {
       const result = await response.json();
 
       // localStorage.setItem("email", result?.email)
       
       return { data: result.data, status: response.status }
     } else {
       const { error } = await response.json();
       // alert(error)
       return { error, status: response.status, data: [] }
     }
   } catch (error: any) {
     console.error('Registration error:', error.message);
     return { error: error?.message, status: 500, data: [] }
   }
 }