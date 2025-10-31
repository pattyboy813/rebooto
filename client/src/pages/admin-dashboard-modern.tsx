import { useQuery } from "@tanstack/react-query";
import { ModernBackground } from "@/components/modern/ModernBackground";
import { ModernCard } from "@/components/modern/ModernCard";
import { ModernPageHeader } from "@/components/modern/ModernPageHeader";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Mail,
  TrendingUp,
  Sparkles,
  UserPlus,
  FileText,
  ArrowRight,
  Activity,
  Award,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboardModern() {
  const { data: stats, isLoading } = useQuery<{
    totalUsers: number;
    activeCourses: number;
    emailSignups: number;
    completionRate: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  const statCards = [
    {
      title: "Total Users",
      value: isLoading ? "..." : stats?.totalUsers || 0,
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      testId: "card-total-users",
      statTestId: "stat-total-users",
    },
    {
      title: "Active Courses",
      value: isLoading ? "..." : stats?.activeCourses || 0,
      icon: BookOpen,
      gradient: "from-teal-500 to-emerald-500",
      bgGradient: "from-teal-50 to-emerald-50",
      testId: "card-active-courses",
      statTestId: "stat-active-courses",
    },
    {
      title: "Email Signups",
      value: isLoading ? "..." : stats?.emailSignups || 0,
      icon: Mail,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      testId: "card-email-signups",
      statTestId: "stat-email-signups",
    },
    {
      title: "Completion Rate",
      value: isLoading ? "..." : `${stats?.completionRate || 0}%`,
      icon: TrendingUp,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      testId: "card-completion-rate",
      statTestId: "stat-completion-rate",
    },
  ];

  const quickActions = [
    {
      title: "AI Course Creator",
      description: "Generate intelligent courses with GPT-4o",
      icon: Sparkles,
      href: "/admin/courses",
      gradient: "from-teal-500 to-emerald-500",
      testId: "link-create-course",
    },
    {
      title: "User Management",
      description: "Manage users, roles, and permissions",
      icon: UserPlus,
      href: "/admin/users",
      gradient: "from-blue-500 to-cyan-500",
      testId: "link-manage-users",
    },
    {
      title: "Blog Admin",
      description: "Create and publish blog content",
      icon: FileText,
      href: "/admin/blog",
      gradient: "from-purple-500 to-pink-500",
      testId: "link-manage-blog",
    },
    {
      title: "Email Sender",
      description: "Send emails and manage templates",
      icon: Mail,
      href: "/admin/email",
      gradient: "from-orange-500 to-red-500",
      testId: "link-send-email",
    },
  ];

  const recentActivity = [
    {
      icon: Users,
      title: "New user registration",
      description: "5 new users joined today",
      time: "2 hours ago",
    },
    {
      icon: BookOpen,
      title: "Course completion",
      description: "12 courses completed this week",
      time: "5 hours ago",
    },
    {
      icon: Award,
      title: "Achievement unlocked",
      description: "Users earned 45 new achievements",
      time: "1 day ago",
    },
  ];

  return (
    <div className="relative min-h-screen p-8">
      <ModernBackground />

      <ModernPageHeader
        title="Admin Dashboard"
        description="Monitor platform performance and manage your learning ecosystem"
        icon={LayoutDashboard}
      />

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ModernCard delay={index * 0.1}>
              <div className="p-6" data-testid={stat.testId}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient}`}>
                    <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`} />
                  </div>
                  <Activity className="w-4 h-4 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  {stat.title}
                </h3>
                <p 
                  className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                  data-testid={stat.statTestId}
                >
                  {stat.value}
                </p>
              </div>
            </ModernCard>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <ModernCard delay={0.5} className="mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-6">
            Quick Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <Link key={action.title} href={action.href}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="group relative overflow-hidden rounded-xl p-6 border border-gray-200 hover-elevate active-elevate-2 cursor-pointer"
                  data-testid={action.testId}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center justify-between">
                      {action.title}
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
                    </h3>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </ModernCard>

      {/* Recent Activity */}
      <ModernCard delay={0.9}>
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-lg hover-elevate"
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50">
                  <activity.icon className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{activity.title}</h4>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Clock className="w-3 h-3" />
                  {activity.time}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </ModernCard>
    </div>
  );
}
