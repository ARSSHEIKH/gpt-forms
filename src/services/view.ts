import Cookies from "js-cookie";
import { IDataFields } from "../types/interfaces";

interface PageProps {
  data: IDataFields | undefined;
  status: number;
  error?: any;
}

export const getView = async (token: any, id: string | undefined): Promise<PageProps> => {
  const base64Credentials = btoa(token);
  try {
    const response = await fetch(`http://localhost:3000/api/forms/view/:${id}?id=${id}`, {
      headers: {
        'Authorization': `Basic ${base64Credentials}`,
      },
      cache: 'no-store'
    })
    if (response.ok) {
      const result = await response.json();
      const promptId = result?.data?.id;
      Cookies.set("promptId", promptId);
      sessionStorage.setItem("promptId", result?.data?.id)

      return { data: result.data, status: response.status }
    } else {
      const { error } = await response.json();
      // alert(error)
      return { error, status: response.status, data: undefined }
    }
  } catch (error: any) {
    console.error('Registration error:', error.message);
    return { error: error?.message, status: 500, data: undefined }
  }
}