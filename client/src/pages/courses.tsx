import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Course, Enrollment } from "@shared/schema";

const CATEGORIES = [
  "All",
  "Hardware Headaches",
  "Network Nightmares",
  "Software Struggles",
];

const DIFFICULTY_COLORS = {
  Beginner: "bg-green-100 text-green-800 border-green-200",
  Intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Advanced: "bg-red-100 text-red-800 border-red-200",
};

export default function Courses() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: enrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments"],
    enabled: isAuthenticated,
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      if (!isAuthenticated) {
        window.location.href = "/api/auth/login";
        return;
      }
      const res = await apiRequest("POST", `/api/courses/${courseId}/enroll`, {});
      return res.json();
    },
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      toast({
        title: "Enrolled Successfully!",
        description: "You've been enrolled in the course. Start learning now!",
      });
      setLocation(`/courses/${courseId}`);
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

  const filteredCourses = courses?.filter(
    (course) => selectedCategory === "All" || course.category === selectedCategory
  );

  const isEnrolled = (courseId: number) => {
    return enrollments?.some((e) => e.courseId === courseId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Browse Courses
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Master IT support through hands-on scenarios and interactive learning
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12 flex justify-center"
        >
          <Tabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="w-full max-w-3xl"
          >
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2 bg-white/60 backdrop-blur-lg border border-gray-200/50 p-2 rounded-2xl">
              {CATEGORIES.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="rounded-xl py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                  data-testid={`tab-${category.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>

        {coursesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="p-8 backdrop-blur-lg bg-white/60 border border-gray-200/50 rounded-3xl"
              >
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredCourses && filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <Card
                  className="p-8 backdrop-blur-lg bg-white/60 border border-gray-200/50 rounded-3xl shadow-lg hover-elevate group cursor-pointer transition-all"
                  onClick={() => setLocation(`/courses/${course.id}`)}
                  data-testid={`card-course-${course.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Badge
                      variant="outline"
                      className="text-xs font-semibold"
                      data-testid={`badge-category-${course.id}`}
                    >
                      {course.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={DIFFICULTY_COLORS[course.difficulty as keyof typeof DIFFICULTY_COLORS]}
                      data-testid={`badge-difficulty-${course.id}`}
                    >
                      {course.difficulty}
                    </Badge>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>

                  <h3
                    className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors"
                    data-testid={`text-title-${course.id}`}
                  >
                    {course.title}
                  </h3>

                  <p
                    className="text-sm text-gray-600 mb-6 line-clamp-3"
                    data-testid={`text-description-${course.id}`}
                  >
                    {course.description}
                  </p>

                  <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      <span data-testid={`text-xp-${course.id}`}>
                        {course.xpTotal} XP
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>Level Up</span>
                    </div>
                  </div>

                  <Button
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isEnrolled(course.id)) {
                        setLocation(`/courses/${course.id}`);
                      } else {
                        enrollMutation.mutate(course.id);
                      }
                    }}
                    disabled={enrollMutation.isPending}
                    data-testid={`button-enroll-${course.id}`}
                  >
                    {enrollMutation.isPending
                      ? "Enrolling..."
                      : isEnrolled(course.id)
                      ? "View Course"
                      : "Enroll Now"}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              No courses found in this category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
