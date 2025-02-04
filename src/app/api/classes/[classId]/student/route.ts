
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface AddStudentsPayload {
  studentIds: number[];
}

export async function POST(
  request: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const { classId } = params;
    const body: AddStudentsPayload = await request.json();

    // Validate payload
    if (
      !body.studentIds ||
      !Array.isArray(body.studentIds) ||
      body.studentIds.some((id) => typeof id !== "number")
    ) {
      return NextResponse.json(
        { error: "Invalid payload. 'studentIds' must be an array of numbers." },
        { status: 400 }
      );
    }

    // 1. Retrieve the authToken from cookies
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("authToken");

    if (!tokenCookie) {
      return NextResponse.json({ error: "Unauthorized: No token found." }, { status: 401 });
    }

    const token = tokenCookie.value;

    // 2. Send the request to the Java backend to add students
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/classes/add-students`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error from Java backend:", errorText);
      return NextResponse.json(
        { error: "Failed to add students to the class." },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error(`Error adding students to class ID ${params.classId}:`, error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}