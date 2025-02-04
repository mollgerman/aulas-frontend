"use client";

import { useState, useTransition } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { addStudentsToClassAction } from "@/lib/actions/addStudentToClass.action";

interface Student {
  id: number;
  name: string;
  email: string;
}

interface AddStudentsToClassProps {
  classId: any;
  onStudentAdded?: () => void; // optional callback
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AddStudentsToClass({
  classId,
  onStudentAdded,
}: AddStudentsToClassProps) {
  const router = useRouter();
  // Load students via SWR
  const { data: students, error, isLoading } = useSWR<Student[]>(
    `/api/users/students`,
    fetcher
  );

  // Single selected student ID
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  // For server actions
  const [isPending, startTransition] = useTransition();

  // We store the server's message (either success or error)
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [isErrorMessage, setIsErrorMessage] = useState<boolean>(false);

  if (isLoading) {
    return <Card className="border-none shadow-md w-full max-w-md">
    <CardHeader>
      <CardTitle>Add Student to Class</CardTitle>
      <CardDescription>Select one student to enroll in this class.</CardDescription>
    </CardHeader>

    <CardContent className="flex w-full justify-center items-center text-neutral-500">
      <p>Loading students...</p>
    </CardContent>
  </Card>
  }
  if (error) {
    return <div>Failed to load students. Please try again.</div>;
  }

  const handleAddStudent = () => {
    if (!selectedStudent) return;

    // Clear old messages
    setServerMessage(null);
    setIsErrorMessage(false);

    startTransition(async () => {
      try {
        // The server action returns either success text
        // or throws an error with the error text
        const messageFromServer = await addStudentsToClassAction(
          Number(classId),
          selectedStudent
        );

        // If we get here, it's a success
        setServerMessage(messageFromServer);
        setIsErrorMessage(false);

        // Optionally refresh data or do something else
        // router.refresh();
        onStudentAdded?.();

        // Clear selection
        setSelectedStudent(null);
      } catch (err: any) {
        // If the server action threw an error, we get it here
        setServerMessage(err.message || "Unknown error occurred.");
        setIsErrorMessage(true);
      }
    });
  };

  return (
    <Card className="border-none shadow-md w-full max-w-md">
      <CardHeader>
        <CardTitle>Add Student to Class</CardTitle>
        <CardDescription>Select one student to enroll in this class.</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4 w-full">
          {/* The shadcn single-select */}
          <Select
            onValueChange={(value) => setSelectedStudent(Number(value))}
            value={selectedStudent ? String(selectedStudent) : ""}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a student" />
            </SelectTrigger>
            <SelectContent>
              {students?.map((student) => (
                <SelectItem key={student.id} value={String(student.id)}>
                  {student.name} ({student.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* The button to add */}
          <Button
            onClick={handleAddStudent}
            disabled={!selectedStudent || isPending}
          >
            {isPending ? "Adding..." : "Add Student"}
          </Button>

          {/* Show server message if we have one */}
          {serverMessage && (
            <p
              className={
                isErrorMessage ? "text-red-600 text-sm" : "text-green-600 text-sm"
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
