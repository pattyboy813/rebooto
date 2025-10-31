import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  FileText,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Pencil
} from "lucide-react";
import { motion } from "framer-motion";
import { ModernBackground } from "@/components/modern/ModernBackground";
import type { LessonContentBlock, Course, Lesson } from "@shared/schema";

interface LessonData {
  id?: number;
  title: string;
  description: string;
  xpReward: number;
  content: LessonContentBlock[];
}

interface CourseData {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  lessons: LessonData[];
}

interface CourseWithLessons extends Course {
  lessons: Lesson[];
}

export default function AdminCourseEditor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [step, setStep] = useState<"select" | "course" | "lessons">("select");
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number | null>(null);

  const { data: courses = [], isLoading: loadingCourses } = useQuery<CourseWithLessons[]>({
    queryKey: ["/api/admin/courses"],
  });

  const { data: selectedCourse, isLoading: loadingCourse } = useQuery<CourseWithLessons>({
    queryKey: [`/api/admin/courses/${selectedCourseId}`],
    enabled: selectedCourseId !== null && step === "select",
  });

  const updateCourseMutation = useMutation({
    mutationFn: async (data: CourseData) => {
      return await apiRequest(`/api/admin/courses/${data.id}`, "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setLocation("/admin/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      });
    },
  });

  const handleSelectCourse = (course: CourseWithLessons) => {
    setSelectedCourseId(course.id);
    setCourseData({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      lessons: course.lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        xpReward: lesson.xpReward,
        content: lesson.content as LessonContentBlock[],
      })),
    });
    setStep("course");
  };

  const addLesson = () => {
    if (!courseData) return;
    setCourseData({
      ...courseData,
      lessons: [
        ...courseData.lessons,
        {
          title: "",
          description: "",
          xpReward: 100,
          content: [],
        },
      ],
    });
    setCurrentLessonIndex(courseData.lessons.length);
  };

  const updateLesson = (index: number, lesson: LessonData) => {
    if (!courseData) return;
    const newLessons = [...courseData.lessons];
    newLessons[index] = lesson;
    setCourseData({ ...courseData, lessons: newLessons });
  };

  const deleteLesson = (index: number) => {
    if (!courseData) return;
    const newLessons = courseData.lessons.filter((_, i) => i !== index);
    setCourseData({ ...courseData, lessons: newLessons });
    if (currentLessonIndex === index) {
      setCurrentLessonIndex(null);
    } else if (currentLessonIndex !== null && currentLessonIndex > index) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const moveLessonUp = (index: number) => {
    if (!courseData || index === 0) return;
    const newLessons = [...courseData.lessons];
    [newLessons[index - 1], newLessons[index]] = [newLessons[index], newLessons[index - 1]];
    setCourseData({ ...courseData, lessons: newLessons });
    if (currentLessonIndex === index) {
      setCurrentLessonIndex(index - 1);
    } else if (currentLessonIndex === index - 1) {
      setCurrentLessonIndex(index);
    }
  };

  const moveLessonDown = (index: number) => {
    if (!courseData || index === courseData.lessons.length - 1) return;
    const newLessons = [...courseData.lessons];
    [newLessons[index], newLessons[index + 1]] = [newLessons[index + 1], newLessons[index]];
    setCourseData({ ...courseData, lessons: newLessons });
    if (currentLessonIndex === index) {
      setCurrentLessonIndex(index + 1);
    } else if (currentLessonIndex === index + 1) {
      setCurrentLessonIndex(index);
    }
  };

  const handleSubmit = () => {
    if (!courseData) return;

    if (!courseData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Course title is required",
        variant: "destructive",
      });
      return;
    }

    if (!courseData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Course description is required",
        variant: "destructive",
      });
      return;
    }

    if (courseData.lessons.length === 0) {
      toast({
        title: "Validation Error",
        description: "Course must have at least one lesson",
        variant: "destructive",
      });
      return;
    }

    for (let i = 0; i < courseData.lessons.length; i++) {
      const lesson = courseData.lessons[i];
      if (!lesson.title.trim()) {
        toast({
          title: "Validation Error",
          description: `Lesson ${i + 1} title is required`,
          variant: "destructive",
        });
        return;
      }
      if (!lesson.description.trim()) {
        toast({
          title: "Validation Error",
          description: `Lesson ${i + 1} description is required`,
          variant: "destructive",
        });
        return;
      }
      if (lesson.content.length === 0) {
        toast({
          title: "Validation Error",
          description: `Lesson ${i + 1} must have at least one content block`,
          variant: "destructive",
        });
        return;
      }
    }

    updateCourseMutation.mutate(courseData);
  };

  const handleBackToSelect = () => {
    setStep("select");
    setSelectedCourseId(null);
    setCourseData(null);
    setCurrentLessonIndex(null);
  };

  if (step === "select") {
    return (
      <div className="relative min-h-screen bg-background">
        <ModernBackground />
        
        <div className="relative z-10 container mx-auto p-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent mb-2">
                  Course Editor
                </h1>
                <p className="text-muted-foreground">
                  Select a course to edit its details and lessons
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setLocation("/admin/dashboard")}
                data-testid="button-back"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Courses</CardTitle>
                <CardDescription>
                  Click on a course to start editing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingCourses ? (
                  <p className="text-muted-foreground text-center py-8">Loading courses...</p>
                ) : courses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No courses found. Create a course first.
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                      <Card
                        key={course.id}
                        className="cursor-pointer hover-elevate active-elevate-2 transition-all"
                        onClick={() => handleSelectCourse(course)}
                        data-testid={`course-card-${course.id}`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg mb-1 truncate">
                                {course.title}
                              </CardTitle>
                              <div className="flex gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  {course.category}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {course.difficulty}
                                </Badge>
                              </div>
                            </div>
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <CardDescription className="line-clamp-2">
                            {course.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {course.lessons.length} lesson{course.lessons.length !== 1 ? 's' : ''}
                            </span>
                            <span className="text-muted-foreground">
                              {course.xpTotal} XP
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative min-h-screen bg-background">
      <ModernBackground />
      
      <div className="relative z-10 container mx-auto p-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent mb-2">
                Edit Course: {courseData.title}
              </h1>
              <p className="text-muted-foreground">
                Modify course details, lessons, and content blocks
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleBackToSelect}
              data-testid="button-back-to-select"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Course List
            </Button>
          </div>

          <Tabs value={step} onValueChange={(v) => setStep(v as "course" | "lessons")} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="course" data-testid="tab-course-details">
                <BookOpen className="mr-2 h-4 w-4" />
                Course Details
              </TabsTrigger>
              <TabsTrigger 
                value="lessons" 
                data-testid="tab-lessons"
                disabled={!courseData.title || !courseData.description}
              >
                <FileText className="mr-2 h-4 w-4" />
                Lessons ({courseData.lessons.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="course">
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                  <CardDescription>
                    Update the basic details for your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Introduction to Network Troubleshooting"
                      value={courseData.title}
                      onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                      data-testid="input-course-title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Course Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what students will learn in this course..."
                      value={courseData.description}
                      onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                      rows={4}
                      data-testid="input-course-description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={courseData.category}
                        onValueChange={(value) => setCourseData({ ...courseData, category: value })}
                      >
                        <SelectTrigger id="category" data-testid="select-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hardware Headaches">Hardware Headaches</SelectItem>
                          <SelectItem value="Network Nightmares">Network Nightmares</SelectItem>
                          <SelectItem value="Software Struggles">Software Struggles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty *</Label>
                      <Select
                        value={courseData.difficulty}
                        onValueChange={(value) => setCourseData({ ...courseData, difficulty: value })}
                      >
                        <SelectTrigger id="difficulty" data-testid="select-difficulty">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={() => setStep("lessons")}
                      disabled={!courseData.title || !courseData.description}
                      data-testid="button-next-to-lessons"
                    >
                      Next: Edit Lessons
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lessons" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lessons List - REUSE from manual creator */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Lessons</CardTitle>
                      <Button
                        size="sm"
                        onClick={addLesson}
                        data-testid="button-add-lesson"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {courseData.lessons.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No lessons yet. Click "Add" to create your first lesson.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {courseData.lessons.map((lesson, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border cursor-pointer transition-all hover-elevate ${
                              currentLessonIndex === index
                                ? "border-primary bg-primary/5"
                                : "border-border"
                            }`}
                            onClick={() => setCurrentLessonIndex(index)}
                            data-testid={`lesson-item-${index}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {lesson.title || `Lesson ${index + 1}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {lesson.content.length} blocks
                                </p>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveLessonUp(index);
                                  }}
                                  disabled={index === 0}
                                  data-testid={`button-move-up-${index}`}
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveLessonDown(index);
                                  }}
                                  disabled={index === courseData.lessons.length - 1}
                                  data-testid={`button-move-down-${index}`}
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Lesson Editor */}
                <div className="lg:col-span-2">
                  {currentLessonIndex !== null ? (
                    <LessonEditor
                      lesson={courseData.lessons[currentLessonIndex]}
                      onUpdate={(lesson) => updateLesson(currentLessonIndex, lesson)}
                      onDelete={() => deleteLesson(currentLessonIndex)}
                      lessonNumber={currentLessonIndex + 1}
                    />
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                          Select a lesson to edit, or add a new lesson to get started
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep("course")}
                  data-testid="button-back-to-course"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Course Details
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={updateCourseMutation.isPending || courseData.lessons.length === 0}
                  data-testid="button-update-course"
                >
                  {updateCourseMutation.isPending ? (
                    <>Updating...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

// REUSE LessonEditor and BlockEditor components from manual creator
interface LessonEditorProps {
  lesson: LessonData;
  onUpdate: (lesson: LessonData) => void;
  onDelete: () => void;
  lessonNumber: number;
}

function LessonEditor({ lesson, onUpdate, onDelete, lessonNumber }: LessonEditorProps) {
  const addBlock = (type: "text" | "scenario" | "quiz") => {
    let newBlock: LessonContentBlock;

    if (type === "text") {
      newBlock = { type: "text", content: "" };
    } else if (type === "scenario") {
      newBlock = { type: "scenario", content: "", title: "" };
    } else {
      newBlock = {
        type: "quiz",
        question: "",
        options: ["", ""],
        correctAnswer: 0,
        explanation: "",
      };
    }

    onUpdate({
      ...lesson,
      content: [...lesson.content, newBlock],
    });
  };

  const updateBlock = (index: number, block: LessonContentBlock) => {
    const newContent = [...lesson.content];
    newContent[index] = block;
    onUpdate({ ...lesson, content: newContent });
  };

  const deleteBlock = (index: number) => {
    onUpdate({
      ...lesson,
      content: lesson.content.filter((_, i) => i !== index),
    });
  };

  const moveBlockUp = (index: number) => {
    if (index === 0) return;
    const newContent = [...lesson.content];
    [newContent[index - 1], newContent[index]] = [newContent[index], newContent[index - 1]];
    onUpdate({ ...lesson, content: newContent });
  };

  const moveBlockDown = (index: number) => {
    if (index === lesson.content.length - 1) return;
    const newContent = [...lesson.content];
    [newContent[index], newContent[index + 1]] = [newContent[index + 1], newContent[index]];
    onUpdate({ ...lesson, content: newContent });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lesson {lessonNumber}</CardTitle>
            <CardDescription>Configure lesson details and content blocks</CardDescription>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            data-testid={`button-delete-lesson-${lessonNumber}`}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`lesson-title-${lessonNumber}`}>Lesson Title *</Label>
          <Input
            id={`lesson-title-${lessonNumber}`}
            placeholder="e.g., Understanding Router Configuration"
            value={lesson.title}
            onChange={(e) => onUpdate({ ...lesson, title: e.target.value })}
            data-testid="input-lesson-title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`lesson-description-${lessonNumber}`}>Lesson Description *</Label>
          <Textarea
            id={`lesson-description-${lessonNumber}`}
            placeholder="Brief description of what this lesson covers..."
            value={lesson.description}
            onChange={(e) => onUpdate({ ...lesson, description: e.target.value })}
            rows={2}
            data-testid="input-lesson-description"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`lesson-xp-${lessonNumber}`}>XP Reward</Label>
          <Input
            id={`lesson-xp-${lessonNumber}`}
            type="number"
            min="0"
            step="50"
            value={lesson.xpReward}
            onChange={(e) => onUpdate({ ...lesson, xpReward: parseInt(e.target.value) || 0 })}
            data-testid="input-lesson-xp"
          />
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <Label>Content Blocks</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => addBlock("text")}
                data-testid="button-add-text-block"
              >
                <Plus className="h-3 w-3 mr-1" />
                Text
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addBlock("scenario")}
                data-testid="button-add-scenario-block"
              >
                <Plus className="h-3 w-3 mr-1" />
                Scenario
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addBlock("quiz")}
                data-testid="button-add-quiz-block"
              >
                <Plus className="h-3 w-3 mr-1" />
                Quiz
              </Button>
            </div>
          </div>

          {lesson.content.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6 border rounded-lg">
              No content blocks. Add text, scenarios, or quiz questions above.
            </p>
          ) : (
            <div className="space-y-4">
              {lesson.content.map((block, index) => (
                <BlockEditor
                  key={index}
                  block={block}
                  index={index}
                  onUpdate={(b) => updateBlock(index, b)}
                  onDelete={() => deleteBlock(index)}
                  onMoveUp={() => moveBlockUp(index)}
                  onMoveDown={() => moveBlockDown(index)}
                  isFirst={index === 0}
                  isLast={index === lesson.content.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface BlockEditorProps {
  block: LessonContentBlock;
  index: number;
  onUpdate: (block: LessonContentBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function BlockEditor({ block, index, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: BlockEditorProps) {
  const getBlockTypeBadge = () => {
    if (block.type === "text") return <Badge variant="secondary">Text</Badge>;
    if (block.type === "scenario") return <Badge variant="secondary">Scenario</Badge>;
    return <Badge variant="secondary">Quiz</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Block {index + 1}</span>
            {getBlockTypeBadge()}
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onMoveUp}
              disabled={isFirst}
              className="h-7 w-7 p-0"
              data-testid={`button-move-block-up-${index}`}
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onMoveDown}
              disabled={isLast}
              className="h-7 w-7 p-0"
              data-testid={`button-move-block-down-${index}`}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="h-7 w-7 p-0"
              data-testid={`button-delete-block-${index}`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {block.type === "text" && (
          <div className="space-y-2">
            <Label htmlFor={`text-content-${index}`}>Content *</Label>
            <Textarea
              id={`text-content-${index}`}
              placeholder="Enter the text content for this block..."
              value={block.content}
              onChange={(e) => onUpdate({ ...block, content: e.target.value })}
              rows={4}
              data-testid={`input-text-content-${index}`}
            />
          </div>
        )}

        {block.type === "scenario" && (
          <>
            <div className="space-y-2">
              <Label htmlFor={`scenario-title-${index}`}>Scenario Title (optional)</Label>
              <Input
                id={`scenario-title-${index}`}
                placeholder="e.g., Real-World Case Study"
                value={block.title || ""}
                onChange={(e) => onUpdate({ ...block, title: e.target.value })}
                data-testid={`input-scenario-title-${index}`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`scenario-content-${index}`}>Scenario Content *</Label>
              <Textarea
                id={`scenario-content-${index}`}
                placeholder="Describe the scenario..."
                value={block.content}
                onChange={(e) => onUpdate({ ...block, content: e.target.value })}
                rows={4}
                data-testid={`input-scenario-content-${index}`}
              />
            </div>
          </>
        )}

        {block.type === "quiz" && (
          <>
            <div className="space-y-2">
              <Label htmlFor={`quiz-question-${index}`}>Question *</Label>
              <Textarea
                id={`quiz-question-${index}`}
                placeholder="Enter your quiz question..."
                value={block.question}
                onChange={(e) => onUpdate({ ...block, question: e.target.value })}
                rows={2}
                data-testid={`input-quiz-question-${index}`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Answer Options *</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (block.options.length < 5) {
                      onUpdate({ ...block, options: [...block.options, ""] });
                    }
                  }}
                  disabled={block.options.length >= 5}
                  data-testid={`button-add-option-${index}`}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Option
                </Button>
              </div>
              {block.options.map((option, optIndex) => (
                <div key={optIndex} className="flex gap-2">
                  <Input
                    placeholder={`Option ${optIndex + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...block.options];
                      newOptions[optIndex] = e.target.value;
                      onUpdate({ ...block, options: newOptions });
                    }}
                    data-testid={`input-quiz-option-${index}-${optIndex}`}
                  />
                  <Button
                    size="sm"
                    variant={block.correctAnswer === optIndex ? "default" : "outline"}
                    onClick={() => onUpdate({ ...block, correctAnswer: optIndex })}
                    data-testid={`button-set-correct-${index}-${optIndex}`}
                  >
                    {block.correctAnswer === optIndex ? "Correct" : "Set Correct"}
                  </Button>
                  {block.options.length > 2 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const newOptions = block.options.filter((_, i) => i !== optIndex);
                        onUpdate({
                          ...block,
                          options: newOptions,
                          correctAnswer: block.correctAnswer >= newOptions.length ? 0 : block.correctAnswer,
                        });
                      }}
                      data-testid={`button-delete-option-${index}-${optIndex}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`quiz-explanation-${index}`}>Explanation *</Label>
              <Textarea
                id={`quiz-explanation-${index}`}
                placeholder="Explain why the correct answer is correct..."
                value={block.explanation}
                onChange={(e) => onUpdate({ ...block, explanation: e.target.value })}
                rows={2}
                data-testid={`input-quiz-explanation-${index}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`quiz-difficulty-${index}`}>Difficulty (optional)</Label>
              <Select
                value={block.difficulty || "medium"}
                onValueChange={(value: "easy" | "medium" | "hard") =>
                  onUpdate({ ...block, difficulty: value })
                }
              >
                <SelectTrigger id={`quiz-difficulty-${index}`} data-testid={`select-quiz-difficulty-${index}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
