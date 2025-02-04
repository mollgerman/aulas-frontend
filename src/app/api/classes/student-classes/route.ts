import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  // 1. Grab the token cookie
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get("authToken")

  // If there's no token, return 401 Unauthorized
  if (!tokenCookie) {
    return NextResponse.json({ error: "No token found" }, { status: 401 })
  }

  const token = tokenCookie.value

  try {
    // 2. Fetch your external API, adding the Bearer token to the Authorization header
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/student-classes/with-teacher`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Optionally disable Next.js caching if needed:
      // next: { revalidate: 0 }
    })

    // If the external API returns an error status
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch student classes" },
        { status: res.status }
      )
    }

    // 3. Return the data as JSON
    const data = await res.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error("Error fetching student classes:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
