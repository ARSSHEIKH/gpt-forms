

export async function fetchingChat(token: any) {
  console.log("token", process.env.NEXT_APP_HOST_URL)
  const base64Credentials = btoa(token);
  try {
    const response = await fetch('http://localhost:3000/api/forms/chat', {
      headers: {
        'Authorization': `Basic ${base64Credentials}`,
      },
      cache: 'no-store'
    })
    if (response.ok) {
      const result = await response.json();
      return { data: result.data, status: response.status }
    } else {
      const { error } = await response.json();
      // alert(error)
      return { error, status: response.status, data: [] }
    }
  } catch (error: any) {
    return { error: error?.message, status: 500, data: [] }
  }
}


export async function sendChat(data: any, token: any) {
  const base64Credentials = btoa(token);
  try {
    const response = await fetch('/api/chats/send', {
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