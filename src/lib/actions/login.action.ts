'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function registerAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Registration failed');
    }

  } catch (error: any) {
    console.error('Error during registration:', error);
    // Redirect back to registration page with an error message
    const registerUrl = `/register?error=${encodeURIComponent(error.message || 'Error during registration')}`;
    redirect(registerUrl);
  }
  
  redirect('/login');
}

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      const loginUrl = `/login?error=${encodeURIComponent(errorData.message || 'Invalid credentials.')}`;
      redirect(loginUrl);
      return;
    }

    const data = await res.json();
    const token = data.token;
    const userName = data.username;
    const role = data.role;

    // Set the JWT token and user name in secure HttpOnly cookies
    const responseCookies = await cookies();
    responseCookies.set({
      name: 'authToken',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    responseCookies.set({
      name: 'userName',
      value: userName,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    responseCookies.set({
      name: 'role',
      value: role,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    responseCookies.set({
      name: 'id',
      value: data.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });


  } catch (error: any) {
    console.error('Error in loginAction:', error);
    const loginUrl = `/login?error=${'email or password is incorrect'}`;
    redirect(loginUrl);
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    // Delete all cookies
    allCookies.forEach(cookie => {
      cookieStore.set(cookie.name, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict',
        expires: new Date(0),
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Error in logoutAction:', error);
    return { success: false, message: 'Error logging out.' };
  }
  redirect('/login');
}

export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;

  if (!token) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function getServerUserNameCookie() {
  const cookieStore = await cookies();
  const userNameCookie = cookieStore.get("userName");
  // Return a plain string or `null` if not found
  return userNameCookie ? decodeURIComponent(userNameCookie.value) : null;
}