import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Award, CheckCircle2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Lesson, Course } from "@shared/schema";

interface LessonContent {
  type: "text" | "scenario" | "quiz";
  content: string;
  question?: string;
  options?: string[];
  correctAnswer?: number;
}

interface CourseWithLessons extends Course {
  lessons: Lesson[];
}

export default function LessonPlayer() {
  const { courseId, lessonId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [userChoices, setUserChoices] = useState<number[]>([]);
  const [showXPDialog, setShowXPDialog] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(0);

  const parsedCourseId = parseInt(courseId || "0");
  const parsedLessonId = parseInt(lessonId || "0");

  const { data: lesson, isLoading: lessonLoading } = useQuery<Lesson>({
    queryKey: ["/api/lessons", parsedLessonId],
  });

  const { data: courseData } = useQuery<CourseWithLessons>({
    queryKey: ["/api/courses", parsedCourseId],
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        window.location.href = "/api/auth/login";
        return;
      }
      const res = await apiRequest("POST", `/api/lessons/${parsedLessonId}/complete`, {
        choices: userChoices,
        score: calculateScore(),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      setXpAwarded(data.xpAwarded || lesson?.xpReward || 0);
      setShowXPDialog(true);
    },
    onError: (error: any) => {
      if (error.message.includes("already completed")) {
        toast({
          variant: "destructive",
          title: "Already Completed",
          description: "You've already completed this lesson.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to mark lesson as complete. Please try again.",
        });
      }
    },
  });

  const calculateScore = () => {
    if (!lesson?.content) return 0;
    const content = lesson.content as LessonContent[];
    const quizItems = content.filter((item) => item.type === "quiz");
    if (quizItems.length === 0) return 100;

    let correct = 0;
    quizItems.forEach((item, index) => {
      if (item.correctAnswer === userChoices[index]) {
        correct++;
      }
    });
    return Math.round((correct / quizItems.length) * 100);
  };

  const handleChoice = (choiceIndex: number) => {
    const newChoices = [...userChoices];
    newChoices[currentStep] = choiceIndex;
    setUserChoices(newChoices);
  };

  const handleNext = () => {
    if (lesson?.content && currentStep < (lesson.content as LessonContent[]).length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    completeMutation.mutate();
  };

  const handleDialogClose = () => {
    setShowXPDialog(false);
    const currentLessonIndex = courseData?.lessons.findIndex((l) => l.id === parsedLessonId);
    if (
      currentLessonIndex !== undefined &&
      currentLessonIndex !== -1 &&
      courseData?.lessons[currentLessonIndex + 1]
    ) {
      setLocation(
        `/courses/${parsedCourseId}/lessons/${courseData.lessons[currentLessonIndex + 1].id}`
      );
    } else {
      setLocation(`/courses/${parsedCourseId}`);
    }
  };

  if (lessonLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Lesson not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setLocation(`/courses/${parsedCourseId}`)}
            data-testid="button-back-to-course"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  const content = lesson.content as LessonContent[];
  const currentContent = content[currentStep];
  const isLastStep = currentStep === content.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Button
          variant="ghost"
          className="mb-8 hover-elevate rounded-xl"
          onClick={() => setLocation(`/courses/${parsedCourseId}`)}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 md:p-12 backdrop-blur-lg bg-white/60 border border-gray-200/50 rounded-3xl shadow-xl mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
                  data-testid="text-lesson-title"
                >
                  {lesson.title}
                </h1>
                <p
                  className="text-gray-600 text-lg"
                  data-testid="text-lesson-description"
                >
                  {lesson.description}
                </p>
              </div>
              <Badge variant="outline" className="flex-shrink-0" data-testid="badge-xp-reward">
                <Award className="w-4 h-4 mr-1" />
                {lesson.xpReward} XP
              </Badge>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Progress</span>
                <span className="text-sm text-gray-600" data-testid="text-step-progress">
                  Step {currentStep + 1} of {content.length}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / content.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[300px]"
              >
                {currentContent.type === "text" && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 text-lg leading-relaxed" data-testid="text-content">
                      {currentContent.content}
                    </p>
                  </div>
                )}

                {currentContent.type === "scenario" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      Scenario
                    </h3>
                    <p className="text-gray-700 text-lg leading-relaxed" data-testid="text-scenario">
                      {currentContent.content}
                    </p>
                  </div>
                )}

                {currentContent.type === "quiz" && (
                  <div>
                    <h3
                      className="text-xl font-semibold text-gray-900 mb-6"
                      data-testid="text-question"
                    >
                      {currentContent.question}
                    </h3>
                    <div className="space-y-3">
                      {currentContent.options?.map((option, index) => (
                        <Card
                          key={index}
                          className={`p-4 cursor-pointer transition-all hover-elevate ${
                            userChoices[currentStep] === index
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200"
                          }`}
                          onClick={() => handleChoice(index)}
                          data-testid={`option-${index}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                userChoices[currentStep] === index
                                  ? "border-blue-600 bg-blue-600"
                                  : "border-gray-300"
                              }`}
                            >
                              {userChoices[currentStep] === index && (
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <p className="text-gray-700">{option}</p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8 gap-4">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                data-testid="button-previous"
              >
                Previous
              </Button>
              <div className="flex gap-2">
                {content.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              {!isLastStep ? (
                <Button
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  onClick={handleNext}
                  data-testid="button-next"
                >
                  Next
                </Button>
              ) : (
                <Button
                  className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  onClick={handleComplete}
                  disabled={completeMutation.isPending}
                  data-testid="button-complete"
                >
                  {completeMutation.isPending ? "Completing..." : "Complete Lesson"}
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      <Dialog open={showXPDialog} onOpenChange={setShowXPDialog}>
        <DialogContent className="max-w-md" data-testid="dialog-xp-reward">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              Lesson Complete! 🎉
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/50"
            >
              <Award className="w-12 h-12 text-white" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold text-gray-900 mb-2"
              data-testid="text-xp-earned"
            >
              +{xpAwarded} XP
            </motion.p>
            <p className="text-gray-600 mb-6">Great job! Keep up the momentum!</p>
            <Button
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={handleDialogClose}
              data-testid="button-continue"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
