
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { fileName: string } }
) {
  try {
    const { fileName } = params;

    // 1. Grab the token cookie
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("authToken");

    // If there's no token, return 401 Unauthorized
    if (!tokenCookie) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    const token = tokenCookie.value;

    // 2. Fetch the file from the Java backend
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/${fileName}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // If the external API returns an error status
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error from Java server:", errorText);
      return NextResponse.json(
        { error: "Failed to download file" },
        { status: res.status }
      );
    }

    // 3. Stream the file back to the client
    const headers = new Headers();
    headers.set("Content-Type", res.headers.get("Content-Type") || "application/octet-stream");
    headers.set(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    // Read the response as a blob
    const blob = await res.blob();
    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error(`Error downloading file ${params.fileName}:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}