import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SmoothScroll } from "@/components/smooth-scroll";
import { FloatingNav } from "@/components/floating-nav";
import { AdminPanel } from "@/components/admin-panel";
import { useKonami } from "@/hooks/use-konami";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/course-detail";
import LessonPlayer from "@/pages/lesson-player";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/courses" component={Courses} />
      <Route path="/courses/:id" component={CourseDetail} />
      <Route path="/courses/:courseId/lessons/:lessonId" component={LessonPlayer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  useKonami(() => {
    setAdminPanelOpen(true);
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SmoothScroll>
          <FloatingNav />
          <AdminPanel isOpen={adminPanelOpen} onClose={() => setAdminPanelOpen(false)} />
          <Toaster />
          <Router />
        </SmoothScroll>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
