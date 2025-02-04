// /app/api/classes/[classId]/route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface ClassInfo {
  id: number;
  title: string;
  description: string;
  place: string | null;
  startDate: string | null;
  endDate: string | null;
  teacherName: string | null;
}

export async function GET(request: Request, { params }: { params: { classId: string } }) {
  const classId = await params.classId;

  // 1. Grab the token cookie
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("authToken");

  // If there's no token, return 401 Unauthorized
  if (!tokenCookie) {
    return NextResponse.json({ error: "No token found" }, { status: 401 });
  }

  const token = tokenCookie.value;

  try {
    // 2. Fetch class details from external API
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/classId/${classId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // If the external API returns an error status
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch class details" },
        { status: res.status }
      );
    }

    // 3. Return the class data as JSON
    const data: ClassInfo = await res.json();
    console.log(`Class Details for ID ${classId}:`, data);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching class details for ID ${classId}:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
