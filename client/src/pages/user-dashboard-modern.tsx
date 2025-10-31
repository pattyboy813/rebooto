import { useQuery } from "@tanstack/react-query";
import { ModernBackground } from "@/components/modern/ModernBackground";
import { ModernCard } from "@/components/modern/ModernCard";
import { ModernPageHeader } from "@/components/modern/ModernPageHeader";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { BookOpen, Trophy, Zap, ArrowRight, Target } from "lucide-react";
import { motion } from "framer-motion";
import type { User, Enrollment } from "@shared/schema";

export default function UserDashboardModern() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: enrollments } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments"],
  });

  const stats = [
    {
      title: "XP Earned",
      value: user?.xp || 0,
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Current Level",
      value: user?.level || 1,
      icon: Trophy,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Courses Enrolled",
      value: enrollments?.length || 0,
      icon: BookOpen,
      color: "from-teal-500 to-emerald-500",
    },
    {
      title: "Completion Rate",
      value: `${enrollments?.filter(e => e.completedAt).length || 0}/${enrollments?.length || 0}`,
      icon: Target,
      color: "from-blue-500 to-cyan-500",
    },
  ];

  return (
    <div className="relative min-h-screen p-8">
      <ModernBackground />

      <ModernPageHeader
        title={`Welcome back, ${user?.firstName || "Learner"}!`}
        description="Continue your IT support learning journey"
        icon={BookOpen}
        action={
          <Link href="/app/courses">
            <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white" data-testid="button-browse-courses">
              Browse Courses
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, index) => (
          <ModernCard key={stat.title} delay={index * 0.1}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
              </div>
            </div>
          </ModernCard>
        ))}
      </div>

      <ModernCard delay={0.4}>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            My Courses
          </h3>
          {enrollments && enrollments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {enrollments.map((enrollment, index) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Link href={`/app/courses/${enrollment.courseId}`}>
                    <div className="p-4 rounded-lg border border-gray-200 hover-elevate active-elevate-2 cursor-pointer">
                      <h4 className="font-medium mb-2">Course #{enrollment.courseId}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Progress</span>
                          <span>{Math.round(enrollment.progress)}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                      </div>
                      {enrollment.completedAt && (
                        <div className="mt-3 inline-flex items-center gap-1 text-sm text-green-600">
                          <Trophy className="h-4 w-4" />
                          Completed
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet</p>
              <Link href="/app/courses">
                <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
                  Browse Courses
                </Button>
              </Link>
            </div>
          )}
        </div>
      </ModernCard>
    </div>
  );
}
