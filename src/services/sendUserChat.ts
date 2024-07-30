export async function sendUserChat(data: any, token: any, slug?: string) {
    const base64Credentials = btoa(token);
    console.log("base64Credentials", base64Credentials)
    try {
      const response = await fetch(`/api/chats/send?id=${slug}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${base64Credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const result = await response.json();
        return { message: result.message, status: response.status, data: result?.data };
      } else {
        const { error } = await response.json();
        // alert(error)
        return { error, status: response.status }
      }
    } catch (error: any) {
      console.error('Registration error:', error.message);
      return { error: error.message, status: 500 }
    }
  }