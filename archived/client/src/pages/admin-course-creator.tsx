import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  BookOpen,
  Zap,
  Loader2,
  Edit3,
} from "lucide-react";
import { z } from "zod";

const courseFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["Hardware Headaches", "Network Nightmares", "Software Struggles"]),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  lessonCount: z.number().min(1).max(10).default(5),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

interface GeneratedLesson {
  title: string;
  description: string;
  content: {
    problem: string;
    steps: string[];
    solution: string;
  };
  xpReward: number;
}

export default function AdminCourseCreator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [generatedLessons, setGeneratedLessons] = useState<GeneratedLesson[]>([]);
  const [editingLessonIndex, setEditingLessonIndex] = useState<number | null>(null);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Software Struggles",
      difficulty: "Beginner",
      lessonCount: 5,
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      const res = await apiRequest("POST", "/api/admin/courses/generate", data);
      return await res.json();
    },
    onSuccess: (data: { lessons: GeneratedLesson[] }) => {
      setGeneratedLessons(data.lessons || []);
      toast({
        title: "Course Generated!",
        description: `Successfully generated ${data.lessons?.length || 0} lessons with AI.`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Failed to generate course content.",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const courseData = {
        title: form.getValues("title"),
        description: form.getValues("description"),
        category: form.getValues("category"),
        difficulty: form.getValues("difficulty"),
      };

      const res = await apiRequest("POST", "/api/admin/courses", {
        course: courseData,
        lessons: generatedLessons,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Course Published!",
        description: "Your course has been successfully created.",
      });
      setLocation("/admin/dashboard");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Publish Failed",
        description: error.message || "Failed to publish course.",
      });
    },
  });

  const handleGenerate = () => {
    const values = form.getValues();
    const result = courseFormSchema.safeParse(values);
    
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
      });
      return;
    }

    generateMutation.mutate(values);
  };

  const handlePublish = () => {
    if (generatedLessons.length === 0) {
      toast({
        variant: "destructive",
        title: "No Lessons",
        description: "Please generate or add lessons before publishing.",
      });
      return;
    }

    publishMutation.mutate();
  };

  const handleDeleteLesson = (index: number) => {
    setGeneratedLessons((prev) => prev.filter((_, i) => i !== index));
    toast({
      title: "Lesson Deleted",
      description: "Lesson removed from course.",
    });
  };

  const handleUpdateLesson = (index: number, updates: Partial<GeneratedLesson>) => {
    setGeneratedLessons((prev) =>
      prev.map((lesson, i) => (i === index ? { ...lesson, ...updates } : lesson))
    );
    setEditingLessonIndex(null);
    toast({
      title: "Lesson Updated",
      description: "Changes saved successfully.",
    });
  };

  const handleAddLesson = () => {
    const newLesson: GeneratedLesson = {
      title: "New Lesson",
      description: "Add a description for this lesson",
      content: {
        problem: "Describe the problem",
        steps: ["Step 1", "Step 2", "Step 3"],
        solution: "Describe the solution",
      },
      xpReward: 100,
    };
    setGeneratedLessons((prev) => [...prev, newLesson]);
    setEditingLessonIndex(generatedLessons.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/70 border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/admin/dashboard")}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AI Course Creator</h1>
                  <p className="text-sm text-gray-600">Generate courses with AI assistance</p>
                </div>
              </div>
            </div>
            <Button
              onClick={handlePublish}
              disabled={publishMutation.isPending || generatedLessons.length === 0}
              className="rounded-full"
              data-testid="button-publish-course"
            >
              {publishMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Publish Course
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Information Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Course Information</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Windows Troubleshooting Fundamentals"
                    {...form.register("title")}
                    data-testid="input-course-title"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what students will learn in this course..."
                    rows={4}
                    {...form.register("description")}
                    data-testid="input-course-description"
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={form.watch("category")}
                      onValueChange={(value) => form.setValue("category", value as any)}
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
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={form.watch("difficulty")}
                      onValueChange={(value) => form.setValue("difficulty", value as any)}
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

                <div className="space-y-2">
                  <Label htmlFor="lessonCount">Number of Lessons</Label>
                  <Input
                    id="lessonCount"
                    type="number"
                    min="1"
                    max="10"
                    {...form.register("lessonCount", { valueAsNumber: true })}
                    data-testid="input-lesson-count"
                  />
                  {form.formState.errors.lessonCount && (
                    <p className="text-sm text-red-600">{form.formState.errors.lessonCount.message}</p>
                  )}
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Course with AI
                    </>
                  )}
                </Button>

                {generateMutation.isPending && (
                  <div className="space-y-2">
                    <Progress value={33} className="h-2" />
                    <p className="text-sm text-center text-gray-600">
                      Creating your course content...
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Generated Lessons Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Generated Lessons ({generatedLessons.length})
              </h2>
              <Button
                variant="outline"
                onClick={handleAddLesson}
                className="rounded-full"
                data-testid="button-add-lesson"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Lesson
              </Button>
            </div>

            {generatedLessons.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lessons Yet</h3>
                <p className="text-gray-600 mb-4">
                  Generate lessons with AI or add them manually
                </p>
              </Card>
            ) : (
              <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                <AnimatePresence>
                  {generatedLessons.map((lesson, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LessonCard
                        lesson={lesson}
                        index={index}
                        isEditing={editingLessonIndex === index}
                        onEdit={() => setEditingLessonIndex(index)}
                        onUpdate={(updates) => handleUpdateLesson(index, updates)}
                        onDelete={() => handleDeleteLesson(index)}
                        onCancelEdit={() => setEditingLessonIndex(null)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

interface LessonCardProps {
  lesson: GeneratedLesson;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (updates: Partial<GeneratedLesson>) => void;
  onDelete: () => void;
  onCancelEdit: () => void;
}

function LessonCard({
  lesson,
  index,
  isEditing,
  onEdit,
  onUpdate,
  onDelete,
  onCancelEdit,
}: LessonCardProps) {
  const [editedLesson, setEditedLesson] = useState(lesson);

  const handleSave = () => {
    onUpdate(editedLesson);
  };

  if (isEditing) {
    return (
      <Card className="p-6 border-2 border-blue-500">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary">Lesson {index + 1}</Badge>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={onCancelEdit}
                data-testid={`button-cancel-edit-${index}`}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} data-testid={`button-save-lesson-${index}`}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={editedLesson.title}
              onChange={(e) => setEditedLesson({ ...editedLesson, title: e.target.value })}
              data-testid={`input-lesson-title-${index}`}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={editedLesson.description}
              onChange={(e) => setEditedLesson({ ...editedLesson, description: e.target.value })}
              rows={3}
              data-testid={`input-lesson-description-${index}`}
            />
          </div>

          <div className="space-y-2">
            <Label>XP Reward</Label>
            <Input
              type="number"
              value={editedLesson.xpReward}
              onChange={(e) =>
                setEditedLesson({ ...editedLesson, xpReward: parseInt(e.target.value) || 100 })
              }
              data-testid={`input-lesson-xp-${index}`}
            />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover-elevate">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Lesson {index + 1}</Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {lesson.xpReward} XP
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            data-testid={`button-edit-lesson-${index}`}
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            data-testid={`button-delete-lesson-${index}`}
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid={`text-lesson-title-${index}`}>
        {lesson.title}
      </h3>
      <p className="text-gray-600 text-sm mb-4" data-testid={`text-lesson-description-${index}`}>
        {lesson.description}
      </p>

      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-700 uppercase">Content Preview</p>
        {Array.isArray(lesson.content) ? (
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <strong>Content Blocks:</strong> {lesson.content.length} blocks
            </p>
            <p className="text-sm text-gray-600">
              <strong>Quiz Questions:</strong> {lesson.content.filter((block: any) => block.type === 'quiz').length}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Text/Scenarios:</strong> {lesson.content.filter((block: any) => block.type === 'text' || block.type === 'scenario').length}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-600 italic">Legacy content format</p>
        )}
      </div>
    </Card>
  );
}
