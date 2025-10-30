import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Mail, BarChart3, LogOut, Calendar, Trophy, Award, BookOpen, Zap, Star, Lock, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { EmailSignup, Course, Enrollment, Achievement, UserAchievement, UserProgress, Lesson } from "@shared/schema";
import { Link } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [showSignupsDialog, setShowSignupsDialog] = useState(false);
  const { toast } = useToast();

  // Check authentication
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Please log in to access the dashboard.",
      });
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation, toast]);

  const { data: signupStats } = useQuery<{ count: number }>({
    queryKey: ["/api/signups/count"],
  });

  const { data: signups } = useQuery<EmailSignup[]>({
    queryKey: ["/api/signups"],
    enabled: !!user,
  });

  const { data: enrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments"],
    enabled: !!user,
  });

  const { data: allCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  const { data: userAchievements } = useQuery<UserAchievement[]>({
    queryKey: ["/api/user/achievements"],
    enabled: !!user,
  });

  const { data: userProgress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const enrolledCourses = allCourses?.filter(course => 
    enrollments?.some(e => e.courseId === course.id)
  );

  // Fetch course details with lessons for each enrolled course
  const enrolledCoursesWithLessons = useQuery({
    queryKey: ["/api/courses", "with-lessons", enrolledCourses?.map(c => c.id)],
    queryFn: async () => {
      if (!enrolledCourses || enrolledCourses.length === 0) return [];
      const promises = enrolledCourses.map(course => 
        fetch(`/api/courses/${course.id}`).then(res => res.json())
      );
      return Promise.all(promises);
    },
    enabled: !!enrolledCourses && enrolledCourses.length > 0,
  });

  // Helper function to calculate course progress
  const getCourseProgress = (courseId: number, lessons: Lesson[]) => {
    if (!userProgress || !lessons || lessons.length === 0) return { completed: 0, total: lessons?.length || 0, percentage: 0, xpEarned: 0 };
    
    const completedLessons = lessons.filter(lesson => 
      userProgress.some(p => p.lessonId === lesson.id && p.completed)
    );
    
    const xpEarned = completedLessons.reduce((sum, lesson) => sum + lesson.xpReward, 0);
    
    return {
      completed: completedLessons.length,
      total: lessons.length,
      percentage: (completedLessons.length / lessons.length) * 100,
      xpEarned
    };
  };

  // Helper function to check if achievement is unlocked
  const isAchievementUnlocked = (achievementId: number) => {
    return userAchievements?.some(ua => ua.achievementId === achievementId);
  };

  // Helper function to get unlock date
  const getUnlockDate = (achievementId: number) => {
    const userAchievement = userAchievements?.find(ua => ua.achievementId === achievementId);
    return userAchievement?.unlockedAt;
  };

  // Helper function to get Lucide icon by name
  const getIconByName = (iconName: string) => {
    const icons: Record<string, any> = {
      Trophy, Award, Star, Zap, BookOpen, CheckCircle2
    };
    return icons[iconName] || Award;
  };

  const xpToNextLevel = ((user?.level || 1) * 500) - (user?.xp || 0);
  const xpProgress = ((user?.xp || 0) % 500) / 500 * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/70 border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-sm">TR</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Learning Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {(user as any).firstName || 'User'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full border border-blue-200">
                <Trophy className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Level</p>
                  <p className="text-lg font-bold text-gray-900" data-testid="text-user-level">{user?.level || 1}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full border border-purple-200">
                <Zap className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-600">XP</p>
                  <p className="text-lg font-bold text-gray-900" data-testid="text-user-xp">{user?.xp || 0}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="rounded-full"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress to Level {(user?.level || 1) + 1}</span>
                <span className="text-gray-900 font-medium">{xpToNextLevel} XP to go</span>
              </div>
              <Progress value={xpProgress} className="h-2" data-testid="progress-xp" />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Enrolled Courses Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">My Courses</h2>
              <Link href="/courses">
                <Button variant="outline" className="rounded-full" data-testid="button-browse-courses">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
            </div>

            {enrolledCoursesWithLessons.data && enrolledCoursesWithLessons.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCoursesWithLessons.data.map((course: any, index: number) => {
                  const progress = getCourseProgress(course.id, course.lessons);
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      data-testid={`course-card-${course.id}`}
                    >
                      <Card className="p-6 backdrop-blur-lg bg-white/60 border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all hover-elevate">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-lg font-bold text-gray-900 flex-1" data-testid={`course-title-${course.id}`}>
                              {course.title}
                            </h3>
                            <Badge className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 text-blue-700 border-blue-200 flex-shrink-0" data-testid={`course-category-${course.id}`}>
                              {course.category}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="text-gray-900 font-medium" data-testid={`course-progress-text-${course.id}`}>
                                {progress.completed} / {progress.total} lessons
                              </span>
                            </div>
                            <Progress value={progress.percentage} className="h-2" data-testid={`course-progress-${course.id}`} />
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-purple-600" />
                              <span className="text-sm text-gray-600">
                                <span className="font-bold text-purple-600" data-testid={`course-xp-${course.id}`}>{progress.xpEarned}</span> XP earned
                              </span>
                            </div>
                          </div>

                          <Link href={`/courses/${course.id}`}>
                            <Button 
                              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                              data-testid={`button-continue-${course.id}`}
                            >
                              Continue Learning
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 backdrop-blur-lg bg-white/60 border border-gray-200/50 rounded-2xl shadow-lg text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No courses yet</h3>
                <p className="text-gray-600 mb-6">Start learning by enrolling in your first course</p>
                <Link href="/courses">
                  <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" data-testid="button-browse-courses-empty">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Courses
                  </Button>
                </Link>
              </Card>
            )}
          </motion.div>

          {/* Achievements Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Achievements</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Trophy className="w-4 h-4" />
                <span data-testid="text-achievements-count">
                  {userAchievements?.length || 0} / {achievements?.length || 0} unlocked
                </span>
              </div>
            </div>

            {achievements && achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement, index) => {
                  const unlocked = isAchievementUnlocked(achievement.id);
                  const unlockDate = getUnlockDate(achievement.id);
                  const IconComponent = getIconByName(achievement.iconName);

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      data-testid={`achievement-card-${achievement.id}`}
                    >
                      <Card className={`p-6 backdrop-blur-lg border rounded-2xl shadow-lg transition-all ${
                        unlocked 
                          ? 'bg-gradient-to-br from-blue-50/80 to-purple-50/80 border-blue-200/50 hover:shadow-xl hover-elevate' 
                          : 'bg-white/40 border-gray-200/50 opacity-60'
                      }`}>
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                              unlocked
                                ? 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-blue-500/30'
                                : 'bg-gray-300'
                            }`}>
                              {unlocked ? (
                                <IconComponent className="w-6 h-6 text-white" />
                              ) : (
                                <Lock className="w-6 h-6 text-gray-500" />
                              )}
                            </div>
                            {unlocked && (
                              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" data-testid={`achievement-unlocked-${achievement.id}`} />
                            )}
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1" data-testid={`achievement-title-${achievement.id}`}>
                              {achievement.title}
                            </h3>
                            <p className="text-sm text-gray-600" data-testid={`achievement-description-${achievement.id}`}>
                              {achievement.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-200/50">
                            <div className="flex items-center gap-2">
                              <Zap className={`w-4 h-4 ${unlocked ? 'text-purple-600' : 'text-gray-400'}`} />
                              <span className={`text-sm ${unlocked ? 'text-purple-600 font-bold' : 'text-gray-500'}`} data-testid={`achievement-xp-${achievement.id}`}>
                                {achievement.xpRequired} XP
                              </span>
                            </div>
                            {unlocked && unlockDate && (
                              <span className="text-xs text-gray-500" data-testid={`achievement-unlock-date-${achievement.id}`}>
                                {new Date(unlockDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 backdrop-blur-lg bg-white/60 border border-gray-200/50 rounded-2xl shadow-lg text-center">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No achievements yet</h3>
                <p className="text-gray-600">Complete lessons to unlock achievements</p>
              </Card>
            )}
          </motion.div>

          {/* Admin Quick Actions (Hidden in bottom) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-6 backdrop-blur-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Admin Portal
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    You have access to the admin portal. Create courses with AI and manage signups.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/admin/courses/new">
                      <Button
                        variant="default"
                        className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        data-testid="button-create-course"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Course with AI
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      data-testid="button-view-signups"
                      onClick={() => setShowSignupsDialog(true)}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      View All Signups ({signupStats?.count || 0})
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Signups Dialog */}
      <Dialog open={showSignupsDialog} onOpenChange={setShowSignupsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Email Signups</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {signups && signups.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {signups.map((signup, index) => (
                  <div
                    key={signup.id}
                    className="py-4 flex items-center justify-between hover-elevate rounded-lg px-4"
                    data-testid={`signup-item-${index}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900" data-testid={`signup-email-${index}`}>
                          {signup.email}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span data-testid={`signup-date-${index}`}>
                            {new Date(signup.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No signups yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
