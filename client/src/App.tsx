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
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/course-detail";
import LessonPlayer from "@/pages/lesson-player";
import AdminCourseCreator from "@/pages/admin-course-creator";
import AdminUsersPage from "@/pages/admin-users";
import AdminCampaignsPage from "@/pages/admin-campaigns";
import AdminSettingsPage from "@/pages/admin-settings";
import Documentation from "@/pages/documentation";
import Blog from "@/pages/blog";
import FAQ from "@/pages/faq";
import Support from "@/pages/support";
import About from "@/pages/about";
import Pricing from "@/pages/pricing";
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
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-admin" data-testid="heading-admin-dashboard">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-lg" data-testid="text-admin-welcome">
            Welcome to the Rebooto admin portal
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6 hover-elevate" data-testid="card-total-users">
            <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
            <p className="text-3xl font-bold mt-2 text-gradient-admin" data-testid="stat-total-users">
              {isLoading ? "..." : stats?.totalUsers || 0}
            </p>
          </Card>
          <Card className="p-6 hover-elevate" data-testid="card-active-courses">
            <h3 className="text-sm font-medium text-muted-foreground">Active Courses</h3>
            <p className="text-3xl font-bold mt-2 text-gradient-admin" data-testid="stat-active-courses">
              {isLoading ? "..." : stats?.activeCourses || 0}
            </p>
          </Card>
          <Card className="p-6 hover-elevate" data-testid="card-email-signups">
            <h3 className="text-sm font-medium text-muted-foreground">Email Signups</h3>
            <p className="text-3xl font-bold mt-2 text-gradient-admin" data-testid="stat-email-signups">
              {isLoading ? "..." : stats?.emailSignups || 0}
            </p>
          </Card>
          <Card className="p-6 hover-elevate" data-testid="card-completion-rate">
            <h3 className="text-sm font-medium text-muted-foreground">Completion Rate</h3>
            <p className="text-3xl font-bold mt-2 text-gradient-admin" data-testid="stat-completion-rate">
              {isLoading ? "..." : `${stats?.completionRate || 0}%`}
            </p>
          </Card>
        </div>
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
      
      {/* Admin portal routes - protected by AdminLayout */}
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/dashboard" component={AdminDashboardPage} />
      <Route path="/admin/courses" component={AdminCourseCreatorPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
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
