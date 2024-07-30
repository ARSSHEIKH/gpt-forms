
import Cookies from "js-cookie";
export async function updateForm(formData: any, id: string){
  const token: any = Cookies.get("token");
  console.log("token: ", formData)
  const base64Credentials = btoa(token);
  try {
    const response = await fetch(`/api/forms/update?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${base64Credentials}`,
      },
      body: JSON.stringify(formData),
    });
    if (response.ok) {
      const result = await response.json();
      const promptId = result?.data?.promptId;

      // Cookies.set("promptId", promptId);
      // sessionStorage.setItem("promptId", result?.data?.promptId)
      // localStorage.setItem("email", result?.email)
      // alert(result.message)
      return { message: result.message, status: response.status, data: result?.data??[] };
    } else {
      const { error } = await response.json();
      // alert(error)
      return { error, status: response.status, data: [] }
    }
  } catch (error: any) {
    console.error('Registration error:', error.message);
    return { error: error.message, status: 500, data: [] }
  }
}
export default updateForm