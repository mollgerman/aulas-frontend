"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Download, Award, Clock, XIcon } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface AssignmentData {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  assignedClass: {
    id: number;
    title: string;
    description: string;
    place: string;
    startDate: string;
    endDate: string;
  };
}

interface SubmissionInfo {
  id: number;
  studentName: string;
  submissionFile: string;
  submissionDate: string;
  grade?: number; // If undefined or null, it means not graded yet
}

interface TeacherAssignmentsProps {
  assignments: AssignmentData[];
  submissions: { [assignmentId: number]: SubmissionInfo[] };
  handleGradeChange: (submissionId: number, grade: number) => void;
  handleGradeSubmit: (submissionId: number) => void;
  handleDownload: (fileName: string) => void;
  gradeInputs: { [submissionId: number]: number };
  gradingStatus: { [submissionId: number]: string };
}

export const TeacherAssignments = ({
  assignments,
  submissions,
  handleGradeChange,
  handleGradeSubmit,
  handleDownload,
  gradeInputs,
  gradingStatus,
}: TeacherAssignmentsProps) => {
  // Track "re-grade mode" for each submission in a local state object (submissionId -> boolean)
  const [regradingMode, setRegradingMode] = useState<{ [id: number]: boolean }>(
    {}
  );

  // Track which assignments are expanded (show full description)
  // assignmentId -> boolean
  const [showFullDescription, setShowFullDescription] = useState<{
    [id: number]: boolean;
  }>({});

  // Helper: toggle re-grading mode for a given submission
  const handleToggleRegrade = (submissionId: number, shouldRegrade: boolean) => {
    setRegradingMode((prev) => ({
      ...prev,
      [submissionId]: shouldRegrade,
    }));
  };

  // Helper: toggle description expansion for a given assignment
  const toggleDescription = (assignmentId: number) => {
    setShowFullDescription((prev) => ({
      ...prev,
      [assignmentId]: !prev[assignmentId],
    }));
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Assignments</CardTitle>
            <CardDescription>Manage and grade student submissions</CardDescription>
          </div>
          <Badge variant="outline" className="gap-2">
            {assignments.length} Assignments
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Award className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Assignments Yet</h3>
            <p className="text-muted-foreground">
              Create assignments to start collecting submissions.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[40rem] w-full rounded-lg border">
            <div className="p-4 space-y-6">
              {assignments.map((assignment, index) => {
                const assignmentSubmissions = submissions[assignment.id] || [];

                // Is this assignment's description fully shown?
                const isExpanded = showFullDescription[assignment.id] || false;

                // Truncate to ~100 characters if not expanded
                const MAX_LENGTH = 100;
                const desc = assignment.description || "";
                const truncatedDesc =
                  desc.length > MAX_LENGTH
                    ? desc.slice(0, MAX_LENGTH) + "..."
                    : desc;

                return (
                  <div key={assignment.id}>
                    {index > 0 && <Separator className="my-6" />}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight">
                          {assignment.title}
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          {isExpanded ? desc : truncatedDesc}
                        </p>
                        {/* Show the "Show More/Less" button if the description is long */}
                        {desc.length > MAX_LENGTH && (
                          <Button
                            variant="link"
                            className="p-0 mt-1 h-auto text-sm underline-offset-4"
                            onClick={() => toggleDescription(assignment.id)}
                          >
                            {isExpanded ? "Show Less" : "Show More"}
                          </Button>
                        )}

                        <div className="flex items-center mt-2 gap-4">
                          <Badge variant="secondary" className="gap-1">
                            <Download className="h-3 w-3" />
                            Due: {formatDate(assignment.dueDate)}
                          </Badge>
                        </div>
                      </div>

                      {/* Submissions List */}
                      <div>
                        <h4 className="text-md font-medium">Submissions</h4>
                        {assignmentSubmissions.length === 0 ? (
                          <p className="text-muted-foreground">
                            No submissions yet.
                          </p>
                        ) : (
                          <div className="space-y-4 mt-2">
                            {assignmentSubmissions.map((submission) => {
                              const isAlreadyGraded = submission.grade != null;
                              const isInRegradeMode = regradingMode[submission.id] === true;

                              return (
                                <Card key={submission.id} className="bg-muted/50">
                                  <CardContent className="pt-6">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                      {/* Left side: Submission info */}
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Award className="h-4 w-4" />
                                          <span className="font-medium">
                                            {submission.studentName}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Download className="h-4 w-4" />
                                          <span
                                            className="cursor-pointer font-medium text-blue-600 hover:underline"
                                            onClick={() =>
                                              handleDownload(submission.submissionFile)
                                            }
                                          >
                                            {submission.submissionFile}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Clock className="h-4 w-4" />
                                          <span>
                                            Submitted:{" "}
                                            {formatDate(submission.submissionDate)}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Right side: Grading Section */}
                                      <div className="space-y-4 p-4 bg-card rounded-lg border shadow-sm">
                                        {/* If submission not graded OR user clicked "Re-grade" => show input & button */}
                                        {!isAlreadyGraded || isInRegradeMode ? (
                                          <div className="space-y-2 relative">
                                            <Label
                                              htmlFor={`grade-input-${submission.id}`}
                                              className="text-sm font-medium"
                                            >
                                              Grade (0-100)
                                            </Label>
                                            {isAlreadyGraded && (
                                              <Button
                                                variant="outline"
                                                className="rounded-full absolute top-[-20] right-[-10] p-1"
                                                size="sm"
                                                onClick={() =>
                                                  handleToggleRegrade(submission.id, false)
                                                }
                                              >
                                                <XIcon />
                                              </Button>
                                            )}
                                            <div className="flex gap-2">
                                              <Input
                                                type="number"
                                                id={`grade-input-${submission.id}`}
                                                min={0}
                                                max={100}
                                                value={gradeInputs[submission.id] ?? ""}
                                                onChange={(e) =>
                                                  handleGradeChange(
                                                    submission.id,
                                                    parseInt(e.target.value, 10)
                                                  )
                                                }
                                                placeholder="Enter grade"
                                                className="w-32"
                                              />
                                              <Button
                                                size="sm"
                                                onClick={() => handleGradeSubmit(submission.id)}
                                                className="whitespace-nowrap"
                                              >
                                                <Check className="mr-2 h-4 w-4" />
                                                {isAlreadyGraded ? "Update Grade" : "Submit Grade"}
                                              </Button>
                                            </div>
                                          </div>
                                        ) : null}

                                        {/* If we have a grading status message */}
                                        {gradingStatus[submission.id] && (
                                          <p className="text-sm text-muted-foreground italic">
                                            {gradingStatus[submission.id]}
                                          </p>
                                        )}

                                        {/* If submission is already graded and not in re-grade mode, show read-only grade + Re-grade button */}
                                        {isAlreadyGraded && !isInRegradeMode && (
                                          <>
                                            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-md">
                                              <Check className="h-4 w-4" />
                                              <span className="font-medium">
                                                Grade: {submission.grade}/100
                                              </span>
                                            </div>
                                            {/* Re-grade button */}
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                handleToggleRegrade(submission.id, true)
                                              }
                                            >
                                              Re-grade
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
