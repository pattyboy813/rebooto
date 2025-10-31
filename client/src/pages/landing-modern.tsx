import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModernBackground } from "@/components/modern/ModernBackground";
import { ArrowRight, Sparkles, Trophy, Zap, BookOpen, GraduationCap, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function LandingModern() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const signupMutation = useMutation({
    mutationFn: async (email: string) => {
      return await apiRequest("/api/signups", "POST", { email });
    },
    onSuccess: () => {
      toast({ title: "Thanks for signing up! We'll keep you posted." });
      setEmail("");
    },
  });

  const features = [
    {
      icon: BookOpen,
      title: "AI-Powered Courses",
      description: "Learn IT support through comprehensive, AI-generated courses tailored to your level",
    },
    {
      icon: Trophy,
      title: "Gamified Learning",
      description: "Earn XP, unlock achievements, and level up as you master new skills",
    },
    {
      icon: Zap,
      title: "Interactive Lessons",
      description: "Hands-on practice with real-world scenarios and instant feedback",
    },
    {
      icon: Target,
      title: "Job-Ready Skills",
      description: "Build practical skills that employers are actively looking for",
    },
  ];

  return (
    <div className="relative min-h-screen">
      <ModernBackground />

      {/* Navigation */}
      <nav className="relative z-10 backdrop-blur-md bg-white/80 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Rebooto
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth">
                <Button variant="ghost" data-testid="button-login">
                  Login
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white" data-testid="button-get-started">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 mb-6">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">AI-Powered IT Support Training</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Master IT Support
              <br />
              Through Gamified Learning
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Learn real-world IT support skills through interactive courses, earn XP, unlock achievements, and become job-ready.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth">
                <Button size="lg" className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-lg px-8" data-testid="button-start-learning">
                  Start Learning Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-6 rounded-xl backdrop-blur-xl bg-white/80 border border-gray-200/50 hover-elevate"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="p-12 rounded-2xl backdrop-blur-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 text-center"
        >
          <GraduationCap className="h-12 w-12 text-teal-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            Ready to start your IT support journey?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of learners building job-ready IT support skills through our gamified platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white"
              data-testid="input-signup-email"
            />
            <Button
              className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white whitespace-nowrap"
              onClick={() => signupMutation.mutate(email)}
              disabled={signupMutation.isPending || !email}
              data-testid="button-signup-submit"
            >
              Get Early Access
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200/50 backdrop-blur-md bg-white/80 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2025 Rebooto. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
