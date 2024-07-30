

export async function deleteCall(token: any, ids: readonly string[]) {
    const base64Credentials = btoa(token);
    try {
      const response = await fetch(`/api/forms/delete/`, {
        method: "POST",
        headers: {
          'Authorization': `Basic ${base64Credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ids),
        // cache: 'no-store'
      })
      if (response.ok) {
        const result = await response.json();
        // console.log("result", result.data)
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