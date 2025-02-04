"use server";

import { cookies } from "next/headers";

export interface AssignmentInput {
  title: string;
  description: string;
  dueDate: string; // or ISO date string
}

export async function createAssignmentAction(
  classId: number,
  assignmentData: AssignmentInput
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  // Build the POST URL with classId in the path:
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/assignments/create/${classId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // if needed
      },
      body: JSON.stringify({
        // The body must match your @RequestBody Assignment:
        // { title, description, dueDate, ... }
        title: assignmentData.title,
        description: assignmentData.description,
        dueDate: assignmentData.dueDate,
        // The classId is set via the path param, but the backend might also accept
        // an assignedClass field. Typically the path param is enough though.
      }),
    }
  );

  if (!response.ok) {
    // If there's an error, parse text:
    const errText = await response.text();
    throw new Error(errText);
  }

  // Return the created assignment from the response.
  // The backend returns an Assignment as JSON.
  const createdAssignment = await response.json();
  return createdAssignment;
}
