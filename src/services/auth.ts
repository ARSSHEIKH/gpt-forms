// Example frontend code (React component or similar)

import { registerType } from "@/types/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { googleProvider, auth } from "@/config/firebaseClient"
import cookie from 'js-cookie';

export async function handleGoogleSignIn() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken();
    console.log("token", token)
    // Send the token to your backend for verification
    return token;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}
export async function googleSignMethod() {
  try {
    const token = await handleGoogleSignIn();
    const response = await fetch('/api/protected', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data?.data?.idToken);
      return data?.data?.idToken;
    } else {
      console.error('Failed to access protected route');
    }
  } catch (error) {
    console.error('Error signing in:', error);
  }
}

export async function registerUser(formData: registerType) {
  const registrationData = formData;

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });
    if (response.ok) {
      const result = await response.json();
      const data =  result?.data;
      localStorage.setItem("token", data?.uid)
      localStorage.setItem("user", JSON.stringify(data))
      cookie.set('token', data?.uid, { expires: 1 });
      return { message: result.message, status: response.status }
    } else {
      const { error } = await response.json();
      return { error, status: response.status }
    }
  } catch (error: any) {
    console.error('Registration error:', error.message);
    return { error }
  }
}

export async function signInUser(formData: registerType) {
  try {
    const response = await fetch('/api/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    if (response.ok) {
      const result = await response.json();
      const data =  result?.data;
      localStorage.setItem("token", data?.uid)
      localStorage.setItem("user", JSON.stringify(data))
      cookie.set('token', data?.uid, { expires: 1 });
      return { message: result.message, status: response.status }
    } else {
      const { error } = await response.json();
      return { error, status: response.status }
    }
  } catch (error: any) {
    console.error('Registration error:', error.message);
    return { error }
  }
}

