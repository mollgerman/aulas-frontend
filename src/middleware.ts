import { NextResponse } from 'next/server';

export async function middleware(req: any) {
  const token = req.cookies.get('authToken')?.value; // Get the authToken cookie
  const { pathname } = req.nextUrl;

  console.log("--- middleware ---");
  console.log("Pathname:", pathname);

  // Routes that don't require authentication
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return NextResponse.next();
  }

  // Check if the token exists
  if (!token) {
    console.log("No token found, redirecting to login");
    return NextResponse.redirect(new URL('/login', req.nextUrl.origin));
  }

  try {
    // Decode the token without verifying the signature
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString('utf-8')
    );

    // Check if the token is expired
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    if (payload.exp && payload.exp < now) {
      console.log("Token is expired, redirecting to login");
      return NextResponse.redirect(new URL('/login', req.nextUrl.origin));
    }

    console.log("Token is valid, proceeding");
    return NextResponse.next();
  } catch (error) {
    // Invalid token format or other issues
    console.error("Failed to parse or validate token:", error);
    return NextResponse.redirect(new URL('/login', req.nextUrl.origin));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/assignments/:path*', '/my-submissions/:path*'], // Routes requiring authentication
};
