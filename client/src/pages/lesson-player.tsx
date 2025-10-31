import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Award, CheckCircle2, Sparkles, XCircle, Clock, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Lesson, Course, QuizBlock } from "@shared/schema";

interface LessonContent {
  type: "text" | "scenario" | "quiz";
  content?: string;
  title?: string;
  question?: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
}

interface CourseWithLessons extends Course {
  lessons: Lesson[];
}

interface QuizAnswer {
  selected: number;
  isCorrect: boolean;
  shown: boolean;
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
  const [quizAnswers, setQuizAnswers] = useState<Map<number, QuizAnswer>>(new Map());
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<number | null>(null);

  const parsedCourseId = parseInt(courseId || "0");
  const parsedLessonId = parseInt(lessonId || "0");

  // Reset currentStep when lessonId changes
  useEffect(() => {
    setCurrentStep(0);
    setUserChoices([]);
    setQuizAnswers(new Map());
    setAutoAdvanceTimer(null);
  }, [parsedLessonId]);

  const { data: lesson, isLoading: lessonLoading } = useQuery<Lesson>({
    queryKey: ["/api/lessons", parsedLessonId],
  });

  const { data: courseData } = useQuery<CourseWithLessons>({
    queryKey: ["/api/courses", parsedCourseId],
  });

  const content = useMemo(() => {
    if (!lesson) return [];
    const lessonContentObj = lesson.content as any;
    
    return Array.isArray(lessonContentObj) 
      ? lessonContentObj as LessonContent[] 
      : lessonContentObj?.problem && lessonContentObj?.steps && lessonContentObj?.solution
      ? [
          { type: "scenario" as const, content: lessonContentObj.problem },
          ...lessonContentObj.steps.map((step: string) => ({ type: "text" as const, content: step })),
          { type: "text" as const, content: lessonContentObj.solution }
        ]
      : [];
  }, [lesson]);

  const calculateScore = () => {
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

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        window.location.href = "/api/login";
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

  // Auto-advance timer for non-interactive content
  useEffect(() => {
    if (!content || content.length === 0) return;
    
    const currentContent = content[currentStep];
    const isLastStep = currentStep === content.length - 1;
    
    // Only auto-advance for text and scenario blocks (not quiz, not last step)
    if (!isLastStep && (currentContent.type === "text" || currentContent.type === "scenario")) {
      // Calculate reading time: ~200 words per minute, minimum 5 seconds
      const wordCount = (currentContent.content || "").split(" ").length;
      const readingTimeMs = Math.max(5000, (wordCount / 200) * 60 * 1000);
      
      const timer = window.setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setAutoAdvanceTimer(null);
      }, readingTimeMs);
      
      setAutoAdvanceTimer(readingTimeMs);
      
      return () => {
        window.clearTimeout(timer);
        setAutoAdvanceTimer(null);
      };
    } else {
      setAutoAdvanceTimer(null);
    }
  }, [currentStep, content]);

  const handleChoice = (choiceIndex: number) => {
    if (!content || !content[currentStep]) return;
    
    const currentContent = content[currentStep];
    if (currentContent.type !== "quiz") return;
    
    const isCorrect = currentContent.correctAnswer === choiceIndex;
    
    // Store the quiz answer with feedback
    const newAnswers = new Map(quizAnswers);
    newAnswers.set(currentStep, {
      selected: choiceIndex,
      isCorrect,
      shown: true,
    });
    setQuizAnswers(newAnswers);
    
    // Update user choices for score tracking
    const quizIndex = content.slice(0, currentStep + 1).filter(c => c.type === "quiz").length - 1;
    const newChoices = [...userChoices];
    newChoices[quizIndex] = choiceIndex;
    setUserChoices(newChoices);
  };

  const handleNext = () => {
    if (content && currentStep < content.length - 1) {
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

  const canProceed = () => {
    if (!content || !content[currentStep]) return true;
    const currentContent = content[currentStep];
    
    // For quiz blocks, user must answer before proceeding
    if (currentContent.type === "quiz") {
      return quizAnswers.has(currentStep);
    }
    
    return true;
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
        `/app/courses/${parsedCourseId}/lessons/${courseData.lessons[currentLessonIndex + 1].id}`
      );
    } else {
      setLocation(`/app/courses/${parsedCourseId}`);
    }
  };

  if (lessonLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600/20 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Lesson not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setLocation(`/app/courses/${parsedCourseId}`)}
            data-testid="button-back-to-course"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Lesson content is not available</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setLocation(`/app/courses/${parsedCourseId}`)}
            data-testid="button-back-to-course"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  const currentContent = content[currentStep];
  const isLastStep = currentStep === content.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Button
          variant="ghost"
          className="mb-8 hover-elevate rounded-xl"
          onClick={() => setLocation(`/app/courses/${parsedCourseId}`)}
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
                  className="text-3xl md:text-4xl font-bold text-gradient-admin mb-2"
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
                  className="h-full bg-gradient-admin"
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
                  <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-teal-600" />
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
                    <div className="space-y-3 mb-6">
                      {currentContent.options?.map((option: string, index: number) => {
                        const answer = quizAnswers.get(currentStep);
                        const isSelected = answer?.selected === index;
                        const isCorrect = currentContent.correctAnswer === index;
                        const showFeedback = answer?.shown;
                        
                        return (
                          <Card
                            key={index}
                            className={`p-4 transition-all ${
                              !showFeedback ? "cursor-pointer hover-elevate" : ""
                            } ${
                              showFeedback && isCorrect
                                ? "border-green-500 bg-green-50"
                                : showFeedback && isSelected && !isCorrect
                                ? "border-red-500 bg-red-50"
                                : isSelected
                                ? "border-teal-600 bg-teal-50"
                                : "border-gray-200"
                            }`}
                            onClick={() => !showFeedback && handleChoice(index)}
                            data-testid={`option-${index}`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                  showFeedback && isCorrect
                                    ? "border-green-600 bg-green-600"
                                    : showFeedback && isSelected && !isCorrect
                                    ? "border-red-600 bg-red-600"
                                    : isSelected
                                    ? "border-teal-600 bg-teal-600"
                                    : "border-gray-300"
                                }`}
                              >
                                {showFeedback && isCorrect && (
                                  <Check className="w-4 h-4 text-white" />
                                )}
                                {showFeedback && isSelected && !isCorrect && (
                                  <X className="w-4 h-4 text-white" />
                                )}
                                {!showFeedback && isSelected && (
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <p className={`text-gray-700 ${showFeedback && isCorrect ? "font-semibold" : ""}`}>
                                {option}
                              </p>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                    
                    {quizAnswers.has(currentStep) && (
                      <Alert className={`${
                        quizAnswers.get(currentStep)?.isCorrect
                          ? "border-green-500 bg-green-50"
                          : "border-orange-500 bg-orange-50"
                      }`}>
                        <div className="flex gap-3">
                          {quizAnswers.get(currentStep)?.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className={`font-semibold mb-2 ${
                              quizAnswers.get(currentStep)?.isCorrect
                                ? "text-green-900"
                                : "text-orange-900"
                            }`}>
                              {quizAnswers.get(currentStep)?.isCorrect ? "Correct!" : "Not quite right"}
                            </p>
                            {currentContent.explanation ? (
                              <AlertDescription className="text-gray-700">
                                {currentContent.explanation}
                              </AlertDescription>
                            ) : (
                              <AlertDescription className="text-gray-600 italic">
                                {quizAnswers.get(currentStep)?.isCorrect 
                                  ? "Great job! You selected the correct answer."
                                  : "Review the lesson content to understand the correct answer."}
                              </AlertDescription>
                            )}
                          </div>
                        </div>
                      </Alert>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Auto-advance timer indicator */}
            {autoAdvanceTimer && (currentContent.type === "text" || currentContent.type === "scenario") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center gap-2 text-sm text-gray-600"
              >
                <Clock className="w-4 h-4" />
                <span>Auto-advancing in {Math.ceil(autoAdvanceTimer / 1000)}s... (or click Next)</span>
              </motion.div>
            )}

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
                {content.map((item, index) => {
                  const isQuiz = item.type === "quiz";
                  const isAnswered = quizAnswers.has(index);
                  const isCorrect = quizAnswers.get(index)?.isCorrect;
                  
                  return (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep
                          ? "bg-teal-600"
                          : isQuiz && isAnswered
                          ? isCorrect
                            ? "bg-green-500"
                            : "bg-orange-500"
                          : index < currentStep
                          ? "bg-gray-400"
                          : "bg-gray-300"
                      }`}
                      data-testid={`progress-dot-${index}`}
                    />
                  );
                })}
              </div>
              {!isLastStep ? (
                <Button
                  className="rounded-xl bg-gradient-admin text-white"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  data-testid="button-next"
                >
                  Next
                </Button>
              ) : (
                <Button
                  className="rounded-xl bg-gradient-admin text-white"
                  onClick={handleComplete}
                  disabled={completeMutation.isPending || !canProceed()}
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
              className="w-full rounded-xl bg-gradient-admin text-white"
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
