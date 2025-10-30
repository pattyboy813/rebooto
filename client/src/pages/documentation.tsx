import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, BookOpen, Zap, Shield, Users, GraduationCap, Trophy, Settings } from "lucide-react";
import { motion } from "framer-motion";

const docCategories = [
  {
    title: "Getting Started",
    icon: Zap,
    articles: [
      { title: "Quick Start Guide", slug: "quick-start", description: "Get up and running in 5 minutes" },
      { title: "Creating Your Account", slug: "create-account", description: "Sign up and set up your profile" },
      { title: "Taking Your First Lesson", slug: "first-lesson", description: "Navigate the lesson player and earn XP" },
      { title: "Understanding XP & Levels", slug: "xp-levels", description: "How progression works" },
    ],
  },
  {
    title: "Learning Platform",
    icon: GraduationCap,
    articles: [
      { title: "How Courses Work", slug: "courses", description: "Browse, enroll, and complete courses" },
      { title: "Lesson Types Explained", slug: "lesson-types", description: "Interactive scenarios and troubleshooting" },
      { title: "Progress Tracking", slug: "progress", description: "Monitor your learning journey" },
      { title: "Achievements System", slug: "achievements", description: "Unlock badges and rewards" },
    ],
  },
  {
    title: "Account & Settings",
    icon: Settings,
    articles: [
      { title: "Profile Settings", slug: "profile", description: "Manage your account information" },
      { title: "Password & Security", slug: "security", description: "Keep your account secure" },
      { title: "Notification Preferences", slug: "notifications", description: "Control email and in-app notifications" },
    ],
  },
  {
    title: "For Administrators",
    icon: Shield,
    articles: [
      { title: "Admin Dashboard Overview", slug: "admin-dashboard", description: "Navigate the admin portal" },
      { title: "Creating Courses with AI", slug: "ai-courses", description: "Use AI to generate practical IT scenarios" },
      { title: "Managing Users", slug: "user-management", description: "View and manage platform users" },
      { title: "Email Campaigns", slug: "email-campaigns", description: "Send announcements to users" },
    ],
  },
];

const sampleArticle = {
  title: "Quick Start Guide",
  content: `
# Getting Started with Rebooto

Welcome to Rebooto - your gamified IT support learning platform! This guide will help you get started in just a few minutes.

## 1. Create Your Account

Click "Sign Up Free" on the homepage and complete the registration process:
- Enter your name and email
- Create a secure password
- Provide your date of birth

## 2. Explore the Dashboard

Once logged in, you'll see your personalized dashboard with:
- **Current XP and Level**: Track your progression
- **Available Courses**: Browse courses you can enroll in
- **Achievements**: View unlocked badges and goals
- **Progress Overview**: See your learning stats

## 3. Enroll in Your First Course

1. Navigate to the "Courses" page
2. Browse courses by category (Hardware, Network, Software)
3. Click "Enroll Now" on a course that interests you
4. Start with Beginner courses if you're new to IT support

## 4. Complete Lessons and Earn XP

Each lesson is a hands-on IT support scenario:
- Read the problem description (like a real help desk ticket)
- Follow the troubleshooting steps
- Review the solution and root cause analysis
- Complete the lesson to earn XP and unlock the next one

## 5. Level Up and Unlock Achievements

As you complete lessons:
- Earn XP to level up
- Unlock achievements for milestones
- Track your progress over time
- Build real-world IT support skills

## Tips for Success

✅ **Start with Beginner courses** to build a strong foundation
✅ **Read each scenario carefully** - they're based on real support tickets
✅ **Practice the commands and steps** in a safe environment if possible
✅ **Review the solutions** to understand the "why" behind each fix
✅ **Complete courses in order** for the best learning experience

## Need Help?

- Check out our [FAQ](/faq) for common questions
- Contact our [Support team](/support) for assistance
- Join the community to learn with others

Happy learning! 🚀
  `,
};

export default function Documentation() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const filteredCategories = docCategories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.articles.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/70 border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/")}
                data-testid="button-back-home"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setLocation("/auth")}
                data-testid="button-login"
              >
                Login
              </Button>
              <Button
                className="bg-gradient-admin text-white"
                onClick={() => setLocation("/auth")}
                data-testid="button-signup"
              >
                Sign Up Free
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-admin flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gradient-admin mb-6" data-testid="heading-docs">
            Documentation
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Everything you need to know about Rebooto
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg"
                data-testid="input-search-docs"
              />
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {!selectedArticle ? (
          <div className="grid gap-8">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, idx) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-8 hover-elevate">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-admin/10 flex items-center justify-center">
                        <category.icon className="w-6 h-6 text-teal-600" />
                      </div>
                      <h2 className="text-2xl font-bold" data-testid={`heading-${category.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        {category.title}
                      </h2>
                    </div>
                    <div className="grid gap-4">
                      {category.articles.map((article) => (
                        <button
                          key={article.slug}
                          onClick={() => setSelectedArticle(article.slug)}
                          className="text-left p-4 rounded-lg hover-elevate active-elevate-2 border border-border"
                          data-testid={`article-${article.slug}`}
                        >
                          <h3 className="font-semibold text-lg mb-1">{article.title}</h3>
                          <p className="text-muted-foreground text-sm">{article.description}</p>
                        </button>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg">
                  No articles found for "{searchQuery}"
                </p>
              </Card>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Button
              variant="ghost"
              onClick={() => setSelectedArticle(null)}
              className="mb-6"
              data-testid="button-back-docs"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Documentation
            </Button>
            <Card className="p-12">
              <h1 className="text-4xl font-bold mb-8 text-gradient-admin">{sampleArticle.title}</h1>
              <div className="prose prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: sampleArticle.content.replace(/\n/g, '<br />') }} />
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
