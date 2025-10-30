import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserLayout } from "@/components/layouts/user-layout";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { PremiumAuth } from "@/components/sections/premium-auth";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/course-detail";
import LessonPlayer from "@/pages/lesson-player";
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
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gradient-admin">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome to the Rebooto admin portal</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="admin-glass rounded-2xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
            <p className="text-3xl font-bold mt-2">Coming soon</p>
          </div>
          <div className="admin-glass rounded-2xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Active Courses</h3>
            <p className="text-3xl font-bold mt-2">Coming soon</p>
          </div>
          <div className="admin-glass rounded-2xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Email Signups</h3>
            <p className="text-3xl font-bold mt-2">Coming soon</p>
          </div>
          <div className="admin-glass rounded-2xl p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Completion Rate</h3>
            <p className="text-3xl font-bold mt-2">Coming soon</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminUsersPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gradient-admin">User Management</h1>
          <p className="text-muted-foreground mt-2">Manage users, roles, and permissions</p>
        </div>
        <div className="admin-glass rounded-2xl p-8">
          <p className="text-muted-foreground">User management features coming soon</p>
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminCampaignsPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gradient-admin">Email Campaigns</h1>
          <p className="text-muted-foreground mt-2">Create and manage email campaigns</p>
        </div>
        <div className="admin-glass rounded-2xl p-8">
          <p className="text-muted-foreground">Email campaign features coming soon</p>
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gradient-admin">Settings</h1>
          <p className="text-muted-foreground mt-2">Configure system settings</p>
        </div>
        <div className="admin-glass rounded-2xl p-8">
          <p className="text-muted-foreground">Settings page coming soon</p>
        </div>
      </div>
    </AdminLayout>
  );
}

function AdminLoginPage() {
  return (
    <div className="admin-theme min-h-screen flex items-center justify-center">
      <div className="admin-glass rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gradient-admin mb-6">Admin Login</h1>
        <p className="text-muted-foreground mb-8">Please log in with your admin account to access the admin portal.</p>
        <a
          href="/api/auth/replit"
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-admin text-white rounded-lg font-semibold hover-elevate active-elevate-2"
          data-testid="button-login-replit"
        >
          Login with Replit
        </a>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/auth" component={PremiumAuth} />
      
      {/* User portal routes - protected by UserLayout */}
      <Route path="/app/dashboard" component={UserDashboard} />
      <Route path="/app/courses" component={UserCourses} />
      <Route path="/app/courses/:id" component={UserCourseDetail} />
      <Route path="/app/courses/:courseId/lessons/:lessonId" component={UserLessonPlayer} />
      
      {/* Admin portal routes - protected by AdminLayout */}
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/dashboard" component={AdminDashboardPage} />
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
