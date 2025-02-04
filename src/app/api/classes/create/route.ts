import { NextResponse } from "next/server";
import { cookies } from "next/headers";

interface AddClassData {
  title: string;
  description: string;
  place: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
}

export const runtime = "nodejs";

/**
 * POST /api/classes/create
 * Handles creating a new class by forwarding the data to the Java backend.
 */
export async function POST(request: Request) {
  try {
    const data: AddClassData = await request.json();

    // Validate the received data
    if (
      !data.title ||
      !data.description ||
      !data.place ||
      !data.startDate ||
      !data.endDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate and convert startDate and endDate to "YYYY-MM-DD" format if necessary
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.startDate)) {
      const startDate = new Date(data.startDate);
      if (!isNaN(startDate.getTime())) {
        data.startDate = startDate.toISOString().split('T')[0];
      }
    }
    if (!dateRegex.test(data.endDate)) {
      const endDate = new Date(data.endDate);
      if (!isNaN(endDate.getTime())) {
        data.endDate = endDate.toISOString().split('T')[0];
      }
    }

    // Get authentication token and user ID from cookies
    const cookieStore = await cookies();
    const userId = cookieStore.get('id')?.value;
    const token = cookieStore.get('authToken')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in cookies" },
        { status: 401 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authentication token not found" },
        { status: 401 }
      );
    }

    // Attach teacher_id to the data
    const classData = {
      ...data,
      teacher_id: parseInt(userId, 10),
    };
    console.log(JSON.stringify(classData));

    // Forward the request to the Java backend
    const javaRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(classData),
    });

    if (!javaRes.ok) {
      const errorText = await javaRes.text();
      console.error("Error from Java server:", errorText);
      return NextResponse.json(
        { error: "Failed to add class" },
        { status: javaRes.status }
      );
    }

    // Optionally, parse and return the response from Java backend
    const responseData = await javaRes.json();

    return NextResponse.json(
      { success: true, data: responseData },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/classes/create:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
