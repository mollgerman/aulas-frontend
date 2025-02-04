"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeft, Award, Calendar, Check, Clock, FileText, GraduationCap, Mail, MapPin, Upload, User } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TeacherAssignments } from "@/components/teacher-assignments";
import { set } from "date-fns";
import AddStudentsToClass from "@/components/AddStudentsToClass";
import AddAssignmentToClass from "@/components/AddAssignmentToClass";

interface ClassInfo {
  id: number;
  title: string;
  description: string;
  place: string | null;
  startDate: string | null;
  endDate: string | null;
  teacherName: string | null;
}

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

type SubmissionInfo = {
  submissionFile: string;
  submissionDate: string;
  grade?: number;
};

interface SubmissionInfoTeacher {
  id: number;
  studentName: string;
  submissionFile: string;
  submissionDate: string;
  grade?: number;
}

export default function ClassPage({ userRole }: { userRole: string }) {
  const params = useParams();
  const classId = params?.id || 0;

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep track of existing submissions, keyed by assignmentId
  const [existingSubmissions, setExistingSubmissions] = useState<{
    [assignmentId: number]: SubmissionInfo | null;
  }>({});


  
  const [submissions, setSubmissions] = useState<{ [assignmentId: number]: SubmissionInfoTeacher[] }>({});
  // States for grading
  const [gradeInputs, setGradeInputs] = useState<{ [submissionId: number]: number }>({});
  const [gradingStatus, setGradingStatus] = useState<{ [submissionId: number]: string }>({});


  // State to manage file uploads for each assignment
  const [selectedFiles, setSelectedFiles] = useState<{ [id: number]: File | null }>(
    {}
  );
  const [submissionStatus, setSubmissionStatus] = useState<{ [id: number]: string }>(
    {}
  );

  // ---------------------------------
  // 1. Fetch Class & Assignments & Submissions
  // ---------------------------------
  useEffect(() => {
    if (!classId) {
      setError("No class ID provided.");
      setLoading(false);
      return;
    }

    // A single function to fetch class, assignments, and check submissions
    async function fetchAll() {
      try {
        // ----------------------------
        // Fetch class info
        // ----------------------------
        const classRes = await fetch(`/api/classes/${classId}`);
        if (!classRes.ok) {
          if (classRes.status === 401) {
            setError("Unauthorized: Please log in.");
          } else if (classRes.status === 404) {
            setError("Class not found.");
          } else {
            setError("Failed to load class details.");
          }
          return;
        }
        const classData: ClassInfo = await classRes.json();
        setClassInfo(classData);

        // ----------------------------
        // Fetch assignments
        // ----------------------------
        
        const assignmentsRes = await fetch(`/api/assignments/class/${classId}`);
        if (!assignmentsRes.ok) {
          if (assignmentsRes.status === 401) {
            setError("Unauthorized: Please log in.");
          } else {
            setError("Failed to load assignments.");
          }
          return;
        }
        const assignmentsData: AssignmentData[] = await assignmentsRes.json();
        setAssignments(assignmentsData);

        if(userRole !== "TEACHER") {
        // ----------------------------
        // For each assignment, check if there's a submission
        // ----------------------------
        const submissionsMap: { [id: number]: SubmissionInfoTeacher | null } = {};
        for (const assignment of assignmentsData) {
          try {
            const res = await fetch(`/api/submissions/submit/${assignment.id}`, {
              method: "GET",
            });
            if (res.ok) {
              // user already has a submission
              const data: SubmissionInfoTeacher = await res.json();
              submissionsMap[assignment.id] = data;
            } else if (res.status === 404) {
              // no submission
              submissionsMap[assignment.id] = null;
            } else {
              // Some other error
              console.error(
                "Error checking submission for assignment:",
                assignment.id
              );
              submissionsMap[assignment.id] = null;
            }
          } catch (checkErr) {
            console.error("Error fetching submission data:", checkErr);
            submissionsMap[assignment.id] = null;
          }
        }

        setExistingSubmissions(submissionsMap);
      }
      else {
        const submissionsMap: { [assignmentId: number]: SubmissionInfoTeacher[] } = {};

        for (const assignment of assignmentsData) {
          try {
            const res = await fetch(`/api/submissions/assignment/${assignment.id}`);
            if (res.ok) {
              const data: SubmissionInfoTeacher[] = await res.json();
              submissionsMap[assignment.id] = data;
            } else {
              console.error(
                `Failed to fetch submissions for assignment ID ${assignment.id}`
              );
              submissionsMap[assignment.id] = [];
            }
          } catch (err) {
            console.error(
              `Error fetching submissions for assignment ID ${assignment.id}:`,
              err
            );
            submissionsMap[assignment.id] = [];
          }
        }

        setSubmissions(submissionsMap);
      }
      } catch (err) {
        console.error("Error fetching class/assignments:", err);
        setError("Internal Server Error.");
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [classId]);

 // Handle grade input change
 const handleGradeChange = (submissionId: number, grade: number) => {
  setGradeInputs((prev) => ({
    ...prev,
    [submissionId]: grade,
  }));
};

// Handle grade submission
const handleGradeSubmit = async (submissionId: number) => {
  const grade = gradeInputs[submissionId];
  if (grade === undefined || grade < 0 || grade > 100) {
    alert("Please enter a valid grade between 0 and 100.");
    return;
  }

  try {
    setGradingStatus((prev) => ({
      ...prev,
      [submissionId]: "Grading...",
    }));

    const res = await fetch(`/api/submissions/grade/${submissionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ grade }),
    });

    const result = await res.json();

    if (res.ok && result.success) {
      setGradingStatus((prev) => ({
        ...prev,
        [submissionId]: "Grade submitted successfully!",
      }));

      // Update the submission's grade in state
      setSubmissions((prev) => {
        const updated = { ...prev };
        for (const assignmentId in updated) {
          updated[assignmentId] = updated[assignmentId].map((submission) =>
            submission.id === submissionId
              ? { ...submission, grade }
              : submission
          );
        }
        return updated;
      });
    } else {
      setGradingStatus((prev) => ({
        ...prev,
        [submissionId]: `Error: ${result.error || "Failed to submit grade."}`,
      }));
    }
  } catch (error) {
    console.error("Error submitting grade:", error);
    setGradingStatus((prev) => ({
      ...prev,
      [submissionId]: "An unexpected error occurred.",
    }));
  }
};

// Handle file download
const handleDownload = async (fileName: string) => {
  try {
    const res = await fetch(`/api/files/${encodeURIComponent(fileName)}`, {
      method: "GET",
    });

    if (!res.ok) {
      alert("Failed to download file.");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading file:", error);
    alert("An unexpected error occurred while downloading the file.");
  }
};



  // ---------------------------------
  // 2. Handle File Selection
  // ---------------------------------
  const handleFileChange = (assignmentId: number, file: File | null) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [assignmentId]: file,
    }));
  };

  // ---------------------------------
  // 3. Handle File Submission
  // ---------------------------------
  const handleSubmit = async (assignmentId: number) => {
    const file = selectedFiles[assignmentId];

    if (!file) {
      setSubmissionStatus((prev) => ({
        ...prev,
        [assignmentId]: "Please select a file before submitting.",
      }));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setSubmissionStatus((prev) => ({
        ...prev,
        [assignmentId]: "Submitting...",
      }));

      // POST to Next.js route, which forwards to Java server
      const res = await fetch(`/api/submissions/submit/${assignmentId}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        setSubmissionStatus((prev) => ({
          ...prev,
          [assignmentId]: `Error: ${errorData.error ?? "Unknown error"}`,
        }));
        return;
      }

      // success
      await res.json(); // or do something with the success message
      setSubmissionStatus((prev) => ({
        ...prev,
        [assignmentId]: "Submitted successfully!",
      }));

      // Mark that we have a submission now
      setExistingSubmissions((prev) => ({
        ...prev,
        [assignmentId]: {
          submissionFile: file.name,
          submissionDate: new Date().toISOString(),
        },
      }));

      // Optionally reset the selected file input
      setSelectedFiles((prev) => ({
        ...prev,
        [assignmentId]: null,
      }));
    } catch (uploadErr) {
      console.error("Submission error:", uploadErr);
      setSubmissionStatus((prev) => ({
        ...prev,
        [assignmentId]: "An unexpected error occurred.",
      }));
    }
  };

  // ---------------------------------
  // 4. Render
  // ---------------------------------
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="container mx-auto p-4">
        <p>Class not found.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-gray-50/40">
      <div className="container mx-auto p-4 pt-20 space-y-6">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Class Info Card */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold">{classInfo.title}</CardTitle>
                <CardDescription className="text-base">{classInfo.description}</CardDescription>
              </div>
              <Badge variant="secondary" className="px-3 py-1">
                Active Course
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Instructor</span>
                  <span className="font-medium">{classInfo.teacherName ?? "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{classInfo.place ?? "Remote"}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">
                    {formatDate(classInfo.startDate)} - {formatDate(classInfo.endDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Assignments</span>
                  <span className="font-medium">{assignments.length} Total</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {userRole === "TEACHER" ? 
        <>
        <div className="flex justify-between">
          <AddStudentsToClass classId={classId} />
          <AddAssignmentToClass classId={classId} />
        </div>
        <TeacherAssignments 
          assignments={assignments} 
          submissions={submissions} 
          handleDownload={handleDownload} 
          handleGradeChange={handleGradeChange} 
          handleGradeSubmit={handleGradeSubmit} 
          gradeInputs={gradeInputs} 
          gradingStatus={gradingStatus}
        /></>
        :
        <AssignmentCard
          assignments={assignments}
          handleFileChange={handleFileChange}
          submissionStatus={submissionStatus}
          handleSubmit={handleSubmit}
          existingSubmissions={existingSubmissions}
          />
        
        }
      </div>
    </div>
  </TooltipProvider>
  );
}


const AssignmentCard = ({assignments, handleFileChange, submissionStatus, handleSubmit, existingSubmissions} : {
  assignments: AssignmentData[],
  handleFileChange: (assignmentId: number, file: File | null) => void,
  submissionStatus: { [id: number]: string },
  handleSubmit: (assignmentId: number) => void,
  existingSubmissions: { [assignmentId: number]: SubmissionInfo | null }
}) => {
  // Track which assignments are expanded (show full description)
  // assignmentId -> boolean
  const [showFullDescription, setShowFullDescription] = useState<{
    [id: number]: boolean;
  }>({});
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
          <CardDescription>Submit and track your assignments</CardDescription>
        </div>
        <Badge variant="outline" className="gap-2">
          <GraduationCap className="h-4 w-4" />
          {assignments.length} Tasks
        </Badge>
      </div>
    </CardHeader>
    <CardContent>
      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No Assignments Yet</h3>
          <p className="text-muted-foreground">Check back later for new assignments.</p>
        </div>
      ) : (
        <ScrollArea className="h-[40rem] w-full rounded-lg border">
          <div className="p-4 space-y-6">
            {assignments.map((assignment, index) => {
              const existing = existingSubmissions[assignment.id];
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
                          <Calendar className="h-3 w-3" />
                          Due: {formatDate(assignment.dueDate)}
                        </Badge>
                        {existing && (
                          // @ts-expect-error
                          <Badge variant="success" className="bg-green-500/15 text-green-600 gap-1">
                            <Check className="h-3 w-3" />
                            Submitted
                          </Badge>
                        )}
                      </div>
                    </div>

                    {existing ? (
                      <Card className="bg-muted/50">
                        <CardContent className="pt-6">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                            <div className="space-y-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <FileText className="h-4 w-4" />
                                  <span>{existing.submissionFile}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatDate(existing.submissionDate)}</span>
                                </div>
                              </div>
                            </div>

                            {existing.grade !== undefined && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
                                    <CardContent className="pt-6 px-6 pb-6">
                                      <div className="flex flex-col items-center gap-2">
                                        <Award className="h-8 w-8 text-primary" />
                                        <div className="text-center">
                                          <div className="text-sm font-medium text-muted-foreground">
                                            Grade
                                          </div>
                                          <div className="text-2xl font-bold">
                                            {existing.grade}
                                          </div>
                                          <Progress 
                                            value={existing.grade} 
                                            className="h-1.5 w-24 mt-2"
                                            // @ts-expect-error
                                            indicatorClassName={cn(
                                              existing.grade < 60 ? "bg-destructive" :
                                              existing.grade < 80 ? "bg-yellow-500" :
                                              "bg-green-500"
                                            )}
                                          />
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Assignment Score: {existing.grade}/100</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="bg-muted/50">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Upload className="h-5 w-5" />
                              <span className="font-medium">Submit Your Work</span>
                            </div>

                            <div className="space-y-4">
                              <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Input
                                  type="file"
                                  id={`file-input-${assignment.id}`}
                                  accept=".pdf,.doc,.docx,.jpg,.png"
                                  onChange={(e) =>
                                    handleFileChange(assignment.id, e.target.files?.[0] || null)
                                  }
                                  className="cursor-pointer"
                                />
                                <p className="text-sm text-muted-foreground">
                                  Accepted formats: PDF, DOC, DOCX, JPG, PNG
                                </p>
                              </div>

                              <div className="flex flex-col gap-3">
                                <Button
                                  onClick={() => handleSubmit(assignment.id)}
                                  className="w-fit"
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Submit Assignment
                                </Button>

                                {submissionStatus[assignment.id] && (
                                  <div className="text-sm text-muted-foreground">
                                    {submissionStatus[assignment.id]}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
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
  )
}