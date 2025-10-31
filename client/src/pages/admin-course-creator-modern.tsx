import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ModernBackground } from "@/components/modern/ModernBackground";
import { ModernCard } from "@/components/modern/ModernCard";
import { ModernPageHeader } from "@/components/modern/ModernPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Sparkles, BookOpen, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";

export default function AdminCourseCreatorModern() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
    estimatedHours: 2,
  });
  const [generatedCourse, setGeneratedCourse] = useState<any>(null);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("/api/admin/courses/generate", "POST", data);
    },
    onSuccess: (data) => {
      setGeneratedCourse(data);
      toast({ title: "Course generated successfully!" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/admin/courses", "POST", generatedCourse);
    },
    onSuccess: () => {
      toast({ title: "Course published successfully!" });
      setGeneratedCourse(null);
      setFormData({
        title: "",
        description: "",
        difficulty: "beginner",
        estimatedHours: 2,
      });
    },
  });

  return (
    <div className="relative min-h-screen p-8">
      <ModernBackground />

      <ModernPageHeader
        title="AI Course Creator"
        description="Generate comprehensive IT support courses powered by AI"
        icon={Wand2}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ModernCard delay={0.1}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-600" />
              Course Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Course Title</label>
                <Input
                  placeholder="Network Troubleshooting Fundamentals"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="input-course-title"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Learn how to diagnose and resolve common network issues..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  data-testid="input-course-description"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  data-testid="select-difficulty"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Estimated Hours</label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) })}
                  data-testid="input-estimated-hours"
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
                onClick={() => generateMutation.mutate(formData)}
                disabled={generateMutation.isPending || !formData.title || !formData.description}
                data-testid="button-generate-course"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Course
                  </>
                )}
              </Button>
            </div>
          </div>
        </ModernCard>

        <ModernCard delay={0.2}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-teal-600" />
              Course Preview
            </h3>
            {generatedCourse ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg border border-teal-200">
                  <h4 className="font-semibold text-lg mb-2">{generatedCourse.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{generatedCourse.description}</p>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded">
                      {generatedCourse.difficulty}
                    </span>
                    <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                      {generatedCourse.estimatedHours}h
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Lessons ({generatedCourse.lessons?.length || 0}):
                  </p>
                  {generatedCourse.lessons?.map((lesson: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-white rounded border border-gray-200"
                    >
                      <p className="font-medium text-sm">{lesson.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {lesson.contentBlocks?.length || 0} content blocks
                      </p>
                    </motion.div>
                  ))}
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
                  onClick={() => publishMutation.mutate()}
                  disabled={publishMutation.isPending}
                  data-testid="button-publish-course"
                >
                  {publishMutation.isPending ? "Publishing..." : "Publish Course"}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Wand2 className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">
                  Fill in the course details and click "Generate Course" to see the preview
                </p>
              </div>
            )}
          </div>
        </ModernCard>
      </div>
    </div>
  );
}
