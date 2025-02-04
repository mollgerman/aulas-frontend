"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Plus, Users } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatDate } from "@/lib/utils";
import { format } from "date-fns";

interface StudentClass {
  id: number;
  title: string;
  description: string;
  place: string | null;
  startDate: string | null;
  endDate: string | null;
  teacherName: string | null;
}

export function StudentClasses({ userRole }: { userRole: string }) {
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredClass, setHoveredClass] = useState<number | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    place: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function fetchClasses() {
      try {
        const response = await fetch(
          userRole === "TEACHER" ? "/api/classes/teacher" : "/api/classes/student-classes/"
        );
        if (!response.ok) throw new Error("Failed to fetch classes");
        const data: StudentClass[] = await response.json();
        setClasses(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, [userRole]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.startDate || !formData.endDate) {
      alert("Please select both start and end dates");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/classes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          place: formData.place,
          startDate: formData.startDate.toISOString(),
          endDate: formData.endDate.toISOString(),
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsDialogOpen(false);
        setFormData({
          title: "",
          description: "",
          place: "",
          startDate: null,
          endDate: null,
        });
        // Refresh the classes list
        const fetchResponse = await fetch(
          userRole === "TEACHER" ? "/api/classes/teacher" : "/api/classes/student-classes/"
        );
        if (fetchResponse.ok) {
          const newClasses: StudentClass[] = await fetchResponse.json();
          setClasses(newClasses);
        }
      } else {
        alert(result.error || "Failed to add class");
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  function computeProgress(class_: StudentClass, currentTime: Date): number {
    const { startDate, endDate } = class_;

    if (!startDate || !endDate) {
      return 0;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0;
    }

    if (start > end) {
      return 0;
    }

    if (currentTime < start) {
      return 0;
    }

    if (currentTime > end) {
      return 100;
    }

    const totalDuration = end.getTime() - start.getTime();
    const elapsed = currentTime.getTime() - start.getTime();

    const ratio = elapsed / totalDuration;
    const percentage = ratio * 100;
    return Math.min(Math.max(percentage, 0), 100);
  }

  const handleClassClick = (classId: number) => {
    router.push(`/class/${classId}`);
  };

  if (loading) {
    return     <TooltipProvider>
    <Card className="h-[19rem] mt-1">
      <CardContent className="h-full">
        <div className="flex items-center justify-center h-full text-2xl text-neutral-500">
          Loading
        </div>
      </CardContent>
    </Card>
  </TooltipProvider>
  }

  return (
    <TooltipProvider>
      <Card className="h-[19rem] mt-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">My Classes</CardTitle>
              <CardDescription>
                {userRole === "TEACHER" ? (
                  <p>Your classes</p>
                ) : (
                  <p>Your enrolled classes and progress</p>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="h-7">
                <Users className="mr-1 h-3 w-3" />
                {classes.length} Classes
              </Badge>
              {userRole === "TEACHER" && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      Add Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Class</DialogTitle>
                      <DialogDescription>
                        Create a new class for your students
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="place">Place</Label>
                        <Input
                          id="place"
                          value={formData.place}
                          onChange={(e) =>
                            setFormData({ ...formData, place: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !formData.startDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.startDate ? (
                                  format(formData.startDate, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={formData.startDate || undefined}
                                onSelect={(date) =>
                                  // @ts-ignore
                                  setFormData({ ...formData, startDate: date })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !formData.endDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.endDate ? (
                                  format(formData.endDate, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={formData.endDate || undefined}
                                // @ts-ignore
                                onSelect={(date: Date) =>
                                  setFormData({ ...formData, endDate: date })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Adding..." : "Add Class"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[13rem] w-full">
            <div className="flex space-x-4 pb-4 pt-1">
              {classes.map((class_) => {
                const progressValue = computeProgress(class_, now);
                return (
                  <Card
                    key={class_.id}
                    className={cn(
                      "w-[300px] shrink-0 cursor-pointer transition-all duration-300",
                      hoveredClass === class_.id ? "scale-[1.02]" : ""
                    )}
                    onMouseEnter={() => setHoveredClass(class_.id)}
                    onMouseLeave={() => setHoveredClass(null)}
                    onClick={() => handleClassClick(class_.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-semibold tracking-tight">
                              {class_.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {class_.teacherName} • {class_.place ?? "remote"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Tooltip>
                            <TooltipTrigger className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {class_.endDate
                                ? formatDate(class_.endDate)
                                : "No end date"}
                            </TooltipTrigger>
                            <TooltipContent>End date of the class</TooltipContent>
                          </Tooltip>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Course Progress
                            </span>
                            <span className="font-medium">
                              {Math.round(progressValue)}%
                            </span>
                          </div>
                          <Progress value={progressValue} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
