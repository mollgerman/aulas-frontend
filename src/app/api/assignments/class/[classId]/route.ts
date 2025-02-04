// /app/api/assignments/class/[classId]/route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  assignedClass: {
    id: number;
    title: string;
    description: string;
    place: string;
    startDate: string;
    endDate: string;
  };
}

export async function GET(request: Request, { params }: { params: { classId: string } }) {
  const { classId } = params;

  // 1. Grab the token cookie
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("authToken");

  // If there's no token, return 401 Unauthorized
  if (!tokenCookie) {
    return NextResponse.json({ error: "No token found" }, { status: 401 });
  }

  const token = tokenCookie.value;

  try {
    // 2. Fetch assignments from external API
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments/class/${classId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // If the external API returns an error status
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch assignments" },
        { status: res.status }
      );
    }

    // 3. Return the assignments data as JSON
    const data: Assignment[] = await res.json();
    console.log(`Assignments for Class ID ${classId}:`, data);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching assignments for Class ID ${classId}:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
