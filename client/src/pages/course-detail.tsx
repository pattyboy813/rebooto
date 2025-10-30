import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, Award, CheckCircle2, Circle, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Course, Lesson, Enrollment, UserProgress } from "@shared/schema";

interface CourseWithLessons extends Course {
  lessons: Lesson[];
}

export default function CourseDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const courseId = parseInt(id || "0");

  const { data: courseData, isLoading: courseLoading } = useQuery<CourseWithLessons>({
    queryKey: ["/api/courses", courseId],
  });

  const { data: enrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments"],
    enabled: isAuthenticated,
  });

  const { data: progressList } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
    enabled: isAuthenticated,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        window.location.href = "/api/auth/login";
        return;
      }
      const res = await apiRequest("POST", `/api/courses/${courseId}/enroll`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      toast({
        title: "Enrolled Successfully!",
        description: "You can now start learning. Good luck!",
      });
    },
    onError: (error: any) => {
      if (error.message.includes("Already enrolled")) {
        toast({
          variant: "destructive",
          title: "Already Enrolled",
          description: "You're already enrolled in this course.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Enrollment Failed",
          description: "Failed to enroll in the course. Please try again.",
        });
      }
    },
  });

  const isEnrolled = enrollments?.some((e) => e.courseId === courseId);
  const completedLessons = progressList?.filter(
    (p) => p.completed && courseData?.lessons.some((l) => l.id === p.lessonId)
  ) || [];
  const totalLessons = courseData?.lessons.length || 0;
  const progressPercentage = totalLessons > 0 ? (completedLessons.length / totalLessons) * 100 : 0;

  const isLessonCompleted = (lessonId: number) => {
    return progressList?.some((p) => p.lessonId === lessonId && p.completed);
  };

  const handleStartLearning = () => {
    if (courseData?.lessons && courseData.lessons.length > 0) {
      const firstIncompleteLesson = courseData.lessons.find(
        (lesson) => !isLessonCompleted(lesson.id)
      );
      const targetLesson = firstIncompleteLesson || courseData.lessons[0];
      setLocation(`/courses/${courseId}/lessons/${targetLesson.id}`);
    }
  };

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Course not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setLocation("/courses")}
            data-testid="button-back-to-courses"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Button
          variant="ghost"
          className="mb-8 hover-elevate rounded-xl"
          onClick={() => setLocation("/courses")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 md:p-12 backdrop-blur-lg bg-white/60 border border-gray-200/50 rounded-3xl shadow-xl mb-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1
                    className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
                    data-testid="text-course-title"
                  >
                    {courseData.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" data-testid="badge-category">
                      {courseData.category}
                    </Badge>
                    <Badge variant="outline" data-testid="badge-difficulty">
                      {courseData.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Award className="w-4 h-4" />
                      <span data-testid="text-xp-total">{courseData.xpTotal} XP</span>
                    </div>
                  </div>
                </div>
              </div>
              {!isEnrolled ? (
                <Button
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
                  onClick={() => enrollMutation.mutate()}
                  disabled={enrollMutation.isPending}
                  data-testid="button-enroll-now"
                >
                  {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                </Button>
              ) : (
                <Button
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
                  onClick={handleStartLearning}
                  data-testid="button-start-learning"
                >
                  {completedLessons.length > 0 ? "Continue Learning" : "Start Learning"}
                </Button>
              )}
            </div>

            <p
              className="text-gray-600 text-lg mb-6 leading-relaxed"
              data-testid="text-course-description"
            >
              {courseData.description}
            </p>

            {isEnrolled && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Progress
                  </span>
                  <span className="text-sm text-gray-600" data-testid="text-progress">
                    {completedLessons.length} / {totalLessons} lessons
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" data-testid="progress-bar" />
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Lessons</h2>
            {courseData.lessons.map((lesson, index) => {
              const completed = isLessonCompleted(lesson.id);
              const isAccessible = isEnrolled;

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                >
                  <Card
                    className={`p-6 backdrop-blur-lg bg-white/60 border border-gray-200/50 rounded-2xl shadow-lg transition-all ${
                      isAccessible
                        ? "hover-elevate cursor-pointer"
                        : "opacity-60 cursor-not-allowed"
                    }`}
                    onClick={() => {
                      if (isAccessible) {
                        setLocation(`/courses/${courseId}/lessons/${lesson.id}`);
                      }
                    }}
                    data-testid={`card-lesson-${lesson.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {completed ? (
                          <CheckCircle2
                            className="w-6 h-6 text-green-600"
                            data-testid={`icon-completed-${lesson.id}`}
                          />
                        ) : isAccessible ? (
                          <Circle
                            className="w-6 h-6 text-gray-400"
                            data-testid={`icon-incomplete-${lesson.id}`}
                          />
                        ) : (
                          <Lock
                            className="w-6 h-6 text-gray-400"
                            data-testid={`icon-locked-${lesson.id}`}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3
                            className="text-lg font-semibold text-gray-900"
                            data-testid={`text-lesson-title-${lesson.id}`}
                          >
                            Lesson {index + 1}: {lesson.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className="flex-shrink-0"
                            data-testid={`badge-xp-${lesson.id}`}
                          >
                            <Award className="w-3 h-3 mr-1" />
                            {lesson.xpReward} XP
                          </Badge>
                        </div>
                        <p
                          className="text-sm text-gray-600"
                          data-testid={`text-lesson-description-${lesson.id}`}
                        >
                          {lesson.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
