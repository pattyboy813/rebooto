import { useQuery } from "@tanstack/react-query";
import { ModernBackground } from "@/components/modern/ModernBackground";
import { ModernCard } from "@/components/modern/ModernCard";
import { ModernPageHeader } from "@/components/modern/ModernPageHeader";
import { Users, BookOpen, Mail, TrendingUp, MessageSquare, Bell, FileText } from "lucide-react";
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
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "from-teal-500 to-emerald-500",
    },
    {
      title: "Active Courses",
      value: stats?.activeCourses || 0,
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Email Signups",
      value: stats?.emailSignups || 0,
      icon: Mail,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Completion Rate",
      value: `${stats?.completionRate || 0}%`,
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
    },
  ];

  const quickActions = [
    {
      title: "User Management",
      description: "Manage users and permissions",
      icon: Users,
      link: "/admin/users",
    },
    {
      title: "Create Course",
      description: "Generate AI-powered courses",
      icon: BookOpen,
      link: "/admin/courses",
    },
    {
      title: "Send Email",
      description: "Send emails to users",
      icon: Mail,
      link: "/admin/email",
    },
    {
      title: "Support Logs",
      description: "View support tickets",
      icon: MessageSquare,
      link: "/admin/support-logs",
    },
    {
      title: "System Notices",
      description: "Manage announcements",
      icon: Bell,
      link: "/admin/notices",
    },
    {
      title: "Blog Admin",
      description: "Manage blog posts",
      icon: FileText,
      link: "/admin/blog",
    },
  ];

  return (
    <div className="relative min-h-screen p-8">
      <ModernBackground />

      <ModernPageHeader
        title="Admin Dashboard"
        description="Monitor your platform's performance and manage content"
        icon={TrendingUp}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat, index) => (
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
                  {isLoading ? "..." : stat.value}
                </p>
              </div>
            </div>
          </ModernCard>
        ))}
      </div>

      <ModernCard delay={0.4}>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-6 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            Quick Actions
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action, index) => (
              <motion.a
                key={action.title}
                href={action.link}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="group p-4 rounded-lg border border-gray-200 hover-elevate active-elevate-2 cursor-pointer"
                data-testid={`quick-action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                    <action.icon className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{action.title}</h4>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </ModernCard>
    </div>
  );
}
