import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserLayout } from "@/components/layouts/user-layout";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { PremiumAuth } from "@/components/sections/premium-auth";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users, BookOpen, Mail, TrendingUp, Sparkles, UserPlus, FileText } from "lucide-react";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/course-detail";
import LessonPlayer from "@/pages/lesson-player";
import AdminCourseCreator from "@/pages/admin-course-creator";
import AdminUsersPage from "@/pages/admin-users";
import AdminCampaignsPage from "@/pages/admin-campaigns";
import AdminSettingsPage from "@/pages/admin-settings";
import AdminBlogPage from "@/pages/admin-blog";
import AdminUserManagement from "@/pages/admin-user-management";
import AdminBlogModern from "@/pages/admin-blog-modern";
import AdminNotices from "@/pages/admin-notices";
import AdminSupportLogs from "@/pages/admin-support-logs";
import AdminEmail from "@/pages/admin-email";
import AdminDashboardModern from "@/pages/admin-dashboard-modern";
import { AdminLayout as ModernAdminLayout } from "@/layouts/AdminLayout";
import Documentation from "@/pages/documentation";
import Blog from "@/pages/blog";
import FAQ from "@/pages/faq";
import Support from "@/pages/support";
import About from "@/pages/about";
import Pricing from "@/pages/pricing";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import UserSettings from "@/pages/user-settings";
import NotFound from "@/pages/not-found";

function UserDashboard() {
  return (
    <UserLayout>
      <Dashboard />
    </UserLayout>
  );
}

function UserCourses() {
  return (
    <UserLayout>
      <Courses />
    </UserLayout>
  );
}

function UserCourseDetail() {
  return (
    <UserLayout>
      <CourseDetail />
    </UserLayout>
  );
}

function UserLessonPlayer() {
  return (
    <UserLayout>
      <LessonPlayer />
    </UserLayout>
  );
}

function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery<{
    totalUsers: number;
    activeCourses: number;
    emailSignups: number;
    completionRate: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-admin mb-2" data-testid="heading-admin-dashboard">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-lg" data-testid="text-admin-welcome">
            Monitor your platform's performance and user activity
          </p>
        </motion.div>

        {/* Stats Grid with Staggered Animation */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Users",
              value: isLoading ? "..." : stats?.totalUsers || 0,
              Icon: Users,
              testId: "card-total-users",
              statTestId: "stat-total-users"
            },
            {
              title: "Active Courses",
              value: isLoading ? "..." : stats?.activeCourses || 0,
              Icon: BookOpen,
              testId: "card-active-courses",
              statTestId: "stat-active-courses"
            },
            {
              title: "Email Signups",
              value: isLoading ? "..." : stats?.emailSignups || 0,
              Icon: Mail,
              testId: "card-email-signups",
              statTestId: "stat-email-signups"
            },
            {
              title: "Completion Rate",
              value: isLoading ? "..." : `${stats?.completionRate || 0}%`,
              Icon: TrendingUp,
              testId: "card-completion-rate",
              statTestId: "stat-completion-rate"
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden hover-elevate group" data-testid={stat.testId}>
                {/* Gradient Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                
                <div className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30">
                      <stat.Icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    {stat.title}
                  </h3>
                  <p className="text-4xl font-bold text-gradient-admin" data-testid={stat.statTestId}>
                    {stat.value}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gradient-admin mb-4">Quick Actions</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <a
                href="/admin/courses"
                className="block p-4 rounded-lg border border-border hover-elevate active-elevate-2 transition-all"
                data-testid="link-create-course"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="font-semibold mb-1">Create Course</h3>
                <p className="text-sm text-muted-foreground">Generate AI-powered courses</p>
              </a>
              <a
                href="/admin/users"
                className="block p-4 rounded-lg border border-border hover-elevate active-elevate-2 transition-all"
                data-testid="link-manage-users"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 flex items-center justify-center mb-3">
                  <UserPlus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="font-semibold mb-1">Manage Users</h3>
                <p className="text-sm text-muted-foreground">View and edit user accounts</p>
              </a>
              <a
                href="/admin/blog"
                className="block p-4 rounded-lg border border-border hover-elevate active-elevate-2 transition-all"
                data-testid="link-write-post"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="font-semibold mb-1">Write Post</h3>
                <p className="text-sm text-muted-foreground">Create blog content</p>
              </a>
            </div>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

function AdminCourseCreatorPage() {
  return (
    <AdminLayout>
      <AdminCourseCreator />
    </AdminLayout>
  );
}

function AdminLoginPage() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    setLocation("/auth");
  }, [setLocation]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-teal-50">
      <Card className="p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gradient-admin mb-6" data-testid="heading-admin-login">
          Admin Login
        </h1>
        <p className="text-muted-foreground mb-8">
          Redirecting to login page...
        </p>
      </Card>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/auth" component={PremiumAuth} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/documentation" component={Documentation} />
      <Route path="/blog" component={Blog} />
      <Route path="/faq" component={FAQ} />
      <Route path="/support" component={Support} />
      <Route path="/about" component={About} />
      <Route path="/pricing" component={Pricing} />
      
      {/* User portal routes - protected by UserLayout */}
      <Route path="/app/dashboard" component={UserDashboard} />
      <Route path="/app/courses" component={UserCourses} />
      <Route path="/app/courses/:id" component={UserCourseDetail} />
      <Route path="/app/courses/:courseId/lessons/:lessonId" component={UserLessonPlayer} />
      <Route path="/app/settings" component={() => <UserLayout><UserSettings /></UserLayout>} />
      
      {/* Admin portal routes - protected by AdminLayout */}
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/dashboard" component={() => <ModernAdminLayout><AdminDashboardModern /></ModernAdminLayout>} />
      <Route path="/admin/courses" component={() => <ModernAdminLayout><AdminCourseCreator /></ModernAdminLayout>} />
      <Route path="/admin/users" component={() => <ModernAdminLayout><AdminUserManagement /></ModernAdminLayout>} />
      <Route path="/admin/blog" component={() => <ModernAdminLayout><AdminBlogModern /></ModernAdminLayout>} />
      <Route path="/admin/email" component={() => <ModernAdminLayout><AdminEmail /></ModernAdminLayout>} />
      <Route path="/admin/support-logs" component={() => <ModernAdminLayout><AdminSupportLogs /></ModernAdminLayout>} />
      <Route path="/admin/notices" component={() => <ModernAdminLayout><AdminNotices /></ModernAdminLayout>} />
      <Route path="/admin/campaigns" component={AdminCampaignsPage} />
      <Route path="/admin/settings" component={AdminSettingsPage} />
      
      {/* Catch all */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
