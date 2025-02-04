import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// If you need Node APIs, ensure the runtime is nodejs (optional if you are just using fetch):
export const runtime = "nodejs";


export async function GET() {
  const cookieStore = await cookies();
      // If you need an auth token from a cookie, e.g. "authToken"
      const authToken = cookieStore.get('authToken')?.value;
  try {
    // Fetch from your Java endpoint
    const javaRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments/student-pending-assignments`, {
      // If the Java endpoint requires a token, add headers here
      headers: { Authorization: `Bearer ${authToken}` },
      cache: "no-store", // ensures fresh data on each request
    });

    if (!javaRes.ok) {
      const errorText = await javaRes.text();
      console.error("Error from Java server:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch assignments from Java" },
        { status: javaRes.status }
      );
    }

    // Parse JSON from the Java response
    const data = await javaRes.json();
    console.log(data)
    // Return the JSON to the client
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/assignments/student-assignments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
