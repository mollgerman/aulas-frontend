"use client";  // So we can use useState, useEffect, etc.

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Adjust fields to match the shape returned by your Java endpoint
interface Assignment {
  id: number;
  title: string;
  dueDate: string;
  subject: string;
  status: string;
  assignedClass: any;
}

export default function PendingAssignments() {
  // 1. State to store fetched assignments
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  // 2. Loading & error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Fetch data on mount
  useEffect(() => {
    async function fetchAssignments() {
      try {
        const response = await fetch("/api/assignments/student-assignments/pending");
        if (!response.ok) {
          throw new Error("Failed to fetch assignments");
        }
        const data: Assignment[] = await response.json();
        setAssignments(data);
      } catch (err) {
        console.error("Error fetching assignments:", err);
        setError("Unable to load assignments.");
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments();
  }, []);

  // 4. Handle loading/error states
  if (loading) {
    return <div className="p-4">Loading assignments...</div>;
  }
  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  // 5. Render the assignments
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Pending Assignments</CardTitle>
        <CardDescription>Your upcoming homework and tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[19rem] gap-2 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-100"> 
          {assignments.map((assignment: any) => (
            <Link href={`/class/${assignment.assignedClass.id}`} key={assignment.id} className="my-1">
            <div
              key={assignment.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
                
              <div className="space-y-1">
                <h4 className="font-medium">{assignment.title}</h4>
                <p className="text-sm text-muted-foreground">
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
              </div>
              {/* You can show subject or status or both */}
              <Badge variant="secondary">{assignment.subject}</Badge>
              {assignment.assignedClass.title}
            </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}