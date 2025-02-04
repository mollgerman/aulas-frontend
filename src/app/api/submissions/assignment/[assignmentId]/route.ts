
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface Submission {
  id: number;
  studentName: string;
  submissionFile: string;
  submissionDate: string;
  grade?: number;
}

export async function GET(
  request: Request,
  { params }: { params: { assignmentId: string } }
) {
  const { assignmentId } = params;
  try {

    // 1. Grab the token cookie
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("authToken");

    // If there's no token, return 401 Unauthorized
    if (!tokenCookie) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    const token = tokenCookie.value;
    console.log(assignmentId)
    // 2. Fetch submissions from the Java backend
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/submissions/assignment/${assignmentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // If the external API returns an error status
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error from Java server:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: res.status }
      );
    }

    // 3. Parse and return the submissions data
    const data: Submission[] = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(
      `Error fetching submissions for assignment ID ${params.assignmentId}:`,
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}