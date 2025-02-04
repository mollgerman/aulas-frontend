import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface Student {
  id: number;
  name: string;
  email: string;
}

export async function GET(
  request: Request,
) {
  try {

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("authToken");

    if (!tokenCookie) {
      return NextResponse.json({ error: "Unauthorized: No token found." }, { status: 401 });
    }

    const token = tokenCookie.value;

    // 2. Fetch available students from the Java backend
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/students`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error from Java backend:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch available students." },
        { status: res.status }
      );
    }

    const data: Student[] = await res.json();
    console.log(data)
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`Error fetching available students`, error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}