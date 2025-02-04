
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface GradeData {
  grade: number;
}

export async function POST(
  request: Request,
  { params }: { params: { submissionId: string } }
) {
  try {
    const { submissionId } = await params;
    const body: GradeData = await request.json();

    // Validate the grade
    if (
      body.grade === undefined ||
      typeof body.grade !== "number" ||
      body.grade < 0 ||
      body.grade > 100
    ) {
      return NextResponse.json(
        { error: "Invalid grade. Must be a number between 0 and 100." },
        { status: 400 }
      );
    }

    // 1. Grab the token cookie
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("authToken");

    // If there's no token, return 401 Unauthorized
    if (!tokenCookie) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    const token = tokenCookie.value;

    // 2. Send the grade to the Java backend
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/submissions/grade/${submissionId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ grade: body.grade }),
      }
    );

    // If the external API returns an error status
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error from Java server:", errorText);
      return NextResponse.json(
        { error: "Failed to grade submission" },
        { status: res.status }
      );
    }

    // 3. Parse and return the response
    const responseData = await res.json();
    return NextResponse.json({ success: true, data: responseData }, { status: 200 });
  } catch (error) {
    console.error(
      `Error grading submission ID ${params.submissionId}:`,
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}