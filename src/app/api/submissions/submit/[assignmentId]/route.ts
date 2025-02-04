import { NextResponse } from 'next/server';
// If your route needs Node APIs, set the runtime to nodejs (instead of the Edge runtime).
export const runtime = 'nodejs';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const {assignmentId} = params;
    const cookieStore = await cookies();
    // If you need an auth token from a cookie, e.g. "authToken"
    const authToken = cookieStore.get('authToken')?.value;

    // Fetch from your Java endpoint
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/submissions/my-submissions/${assignmentId}`,
      {
        method: 'GET',
        headers: {
          // If you need Bearer token
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
      }
    );

    // If the Java server returns 404, that means "no submission yet"
    if (res.status === 404) {
      return NextResponse.json({ message: 'No submission' }, { status: 404 });
    }

    // If something else is wrong
    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: 'Failed to fetch existing submission', detail: errorText },
        { status: res.status }
      );
    }

    // Otherwise, parse the JSON with the submission info
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching existing submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
/**
 * Handles POST requests to /api/submissions/submit/[assignmentId]
 */
export async function POST(
  request: Request,
  { params }: { params: { assignmentId: string } }
) {
  try {
    // 1. Parse the incoming FormData from the request (App Router provides request.formData()).
    const formData = await request.formData();

    // This must match the key in your client code, e.g. formData.append('file', myFile)
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No file found in the form data.' },
        { status: 400 }
      );
    }

   
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken')?.value;

    // 3. Rebuild a new FormData object to forward to your Java endpoint.
    const forwardFormData = new FormData();
    // If you’d like to preserve the original filename, pass it as the 3rd argument.
    // (The type for 'file' is Blob | File in the browser’s sense, so no formidable needed.)
    forwardFormData.append('file', file);

    // 4. Forward the data to your Java server endpoint at
    //    http://localhost:8080/api/submissions/submit/{assignmentId}
    const assignmentId = params.assignmentId;
    const javaResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/submissions/submit/${assignmentId}`,
      {
        method: 'POST',
        headers: {
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
        body: forwardFormData,
      }
    );

    if (!javaResponse.ok) {
      const errorText = await javaResponse.text();
      console.error('Error from Java server:', errorText);
      return NextResponse.json(
        { error: 'Failed to forward file to Java server', details: errorText },
        { status: javaResponse.status }
      );
    }

    // 5. Return JSON from the Java server’s response
    const data = await javaResponse.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error in POST /submissions/submit/[assignmentId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
