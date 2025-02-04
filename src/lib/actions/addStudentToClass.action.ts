"use server";

import { cookies } from "next/headers";

export async function addStudentsToClassAction(classId: number, studentId: number) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("id");
  const token = cookieStore.get("authToken")?.value;

  if (!userId) {
    throw new Error("User ID not found in cookies");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/classes/add-student`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      classId,
      studentId,
    }),
  });

  const msg = await response.text(); 
  // Spring might return plain text or JSON; adapt as needed.

  if (!response.ok) {
    // If the backend indicates the student is already enrolled or any other error
    // we throw that message as an error
    throw new Error(msg);
  }

  // Otherwise success: return the message from the server
  return msg; 
}
