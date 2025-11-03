import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { ArrowRight, Sparkles } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmailSignupSchema, type InsertEmailSignup } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { CountdownTimer } from "@/components/countdown-timer";

export function ModernHero() {
  const { toast } = useToast();
  const { scrollY } = useScroll();

  const form = useForm<InsertEmailSignup>({
    resolver: zodResolver(insertEmailSignupSchema),
    defaultValues: {
      email: "",
    },
  });

  const { data: signupCount } = useQuery<{ count: number }>({
    queryKey: ["/api/signups/count"],
  });

  const signupMutation = useMutation({
    mutationFn: async (data: InsertEmailSignup) => {
      return apiRequest("POST", "/api/signups", data);
    },
    onSuccess: () => {
      toast({
        title: "You're on the list!",
        description: "We'll notify you when Rebooto launches.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: InsertEmailSignup) => {
    signupMutation.mutate(data);
  };

  const count = signupCount?.count || 1200;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-teal-50 pt-20">
      {/* Background pattern with parallax */}
      <motion.div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px]"
        style={{ y: useTransform(scrollY, [0, 500], [0, -100]) }}
      />
      
      {/* Gradient orbs with parallax */}
      <motion.div 
        className="absolute top-20 left-20 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
        style={{ y: useTransform(scrollY, [0, 500], [0, 80]) }}
      />
      <motion.div 
        className="absolute top-40 right-20 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
        style={{ y: useTransform(scrollY, [0, 500], [0, 120]) }}
      />
      <motion.div 
        className="absolute -bottom-20 left-1/2 w-96 h-96 bg-coral-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"
        style={{ y: useTransform(scrollY, [0, 500], [0, 60]) }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 mb-8"
            data-testid="badge-launching"
          >
            <Sparkles className="w-4 h-4 text-teal-600" data-testid="icon-sparkles" />
            <span className="text-sm font-semibold text-teal-700" data-testid="text-launch-year">
              Launching 2025
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]"
            data-testid="heading-hero"
          >
            Master IT Support
            <br />
            <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
              Through Real Scenarios
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto"
            data-testid="text-hero-description"
          >
            Learn IT support skills through gamified, AI-powered scenarios.
            Earn XP, unlock achievements, and become job-ready.
          </motion.p>

          {/* Countdown Timer */}
          <div className="mb-12">
            <CountdownTimer />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-center gap-4 bg-white rounded-full p-2 shadow-xl max-w-lg mx-auto border border-gray-200"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="px-6 py-4 bg-transparent border-none focus-visible:ring-0 text-base"
                          data-testid="input-email-hero"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-left ml-6" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={signupMutation.isPending}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full font-semibold whitespace-nowrap hover:shadow-lg transition-all"
                  data-testid="button-signup-hero"
                >
                  {signupMutation.isPending ? "Joining..." : "Get Early Access"}
                  <ArrowRight className="w-4 h-4 ml-2" data-testid="icon-arrow-right" />
                </Button>
              </form>
            </Form>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-sm text-gray-500"
            data-testid="text-trust-indicator"
          >
            Join {count.toLocaleString()}+ IT professionals preparing for 2025
          </motion.p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
