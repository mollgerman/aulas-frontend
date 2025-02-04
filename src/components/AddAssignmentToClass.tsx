"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation"; // If you want to refresh or navigate after creation
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { createAssignmentAction, AssignmentInput } from "@/lib/actions/createAssignment.action";
import { Textarea } from "./ui/textarea";

interface AddAssignmentToClassProps {
  classId: any;
  onAssignmentCreated?: (assignment: any) => void; // optional callback
}

export default function AddAssignmentToClass({
  classId,
  onAssignmentCreated,
}: AddAssignmentToClassProps) {
  const router = useRouter();

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(""); // We'll store as a string: "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm"

  // For server action
  const [isPending, startTransition] = useTransition();

  // We'll display the message from the server (success or error)
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleSubmit = () => {
    // Reset any previous server message
    setServerMessage(null);
    setIsError(false);

    // Validate form data if needed:
    if (!title.trim()) {
      setServerMessage("Title is required.");
      setIsError(true);
      return;
    }
    // ... other validations if needed

    startTransition(async () => {
      try {
        const assignmentData: AssignmentInput = {
          title,
          description,
          dueDate, // e.g. "2025-02-12T12:00:00"
        };

        // Call our server action
        const createdAssignment = await createAssignmentAction(
          Number(classId),
          assignmentData
        );

        // If success, we get the created Assignment from Java
        setServerMessage(`Assignment created with ID: ${createdAssignment.id}`);
        setIsError(false);

        // Optionally refresh data
        // router.refresh();
        onAssignmentCreated?.(createdAssignment);

        // Clear form
        setTitle("");
        setDescription("");
        setDueDate("");
      } catch (err: any) {
        setServerMessage(err.message || "Something went wrong.");
        setIsError(true);
      }
    });
  };

  return (
    <Card className="border-none shadow-md w-full ml-4">
      <CardHeader>
        <CardTitle>Add Assignment to Class</CardTitle>
        <CardDescription>Provide assignment details below.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Math Homework #1"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"

              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the assignment"
            />
          </div>

          {/* Due Date */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              type="datetime-local"
              id="dueDate"
              className="w-fit"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            {/* Alternatively, type="date" if you only care about the date, not time */}
          </div>

          {/* Submit button */}
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Creating..." : "Create Assignment"}
          </Button>

          {/* Server message display */}
          {serverMessage && (
            <p
              className={
                isError ? "text-red-600 text-sm mt-2" : "text-green-600 text-sm mt-2"
              }
            >
              {serverMessage}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
