import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus, Mail, Lock } from "lucide-react";
import { SiGoogle, SiGithub, SiApple, SiX } from "react-icons/si";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthForm = z.infer<typeof authSchema>;

export function PremiumAuth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("signup");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: AuthForm) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully.",
      });
      setLocation("/app/dashboard");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: AuthForm) => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Signup failed");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account created!",
        description: "Welcome to Rebooto. Redirecting to your dashboard...",
      });
      setLocation("/app/dashboard");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: AuthForm) => {
    if (activeTab === "login") {
      loginMutation.mutate(data);
    } else {
      signupMutation.mutate(data);
    }
  };

  const handleReplitAuth = () => {
    window.location.href = "/api/replit-auth/login";
  };

  const isPending = loginMutation.isPending || signupMutation.isPending;

  return (
    <section
      id="auth"
      className="py-20 md:py-32 px-4 md:px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Start Learning Today
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Create your account or sign in to continue
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="backdrop-blur-lg bg-white/60 border border-gray-200/50 rounded-3xl shadow-xl p-6 md:p-8">
            <Tabs value={activeTab} onValueChange={(v) => {
              setActiveTab(v as "login" | "signup");
              reset();
            }}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signup" data-testid="tab-signup">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </TabsTrigger>
                <TabsTrigger value="login" data-testid="tab-login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-12 rounded-xl bg-white/80 backdrop-blur-sm border-gray-300 h-12"
                        {...register("email")}
                        data-testid="input-email-signup"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-destructive text-sm mt-2 ml-4" data-testid="error-email">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Choose a password"
                        className="pl-12 rounded-xl bg-white/80 backdrop-blur-sm border-gray-300 h-12"
                        {...register("password")}
                        data-testid="input-password-signup"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-destructive text-sm mt-2 ml-4" data-testid="error-password">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isPending}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
                    data-testid="button-signup-submit"
                  >
                    {signupMutation.isPending ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-12 rounded-xl bg-white/80 backdrop-blur-sm border-gray-300 h-12"
                        {...register("email")}
                        data-testid="input-email-login"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-destructive text-sm mt-2 ml-4" data-testid="error-email">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        className="pl-12 rounded-xl bg-white/80 backdrop-blur-sm border-gray-300 h-12"
                        {...register("password")}
                        data-testid="input-password-login"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-destructive text-sm mt-2 ml-4" data-testid="error-password">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isPending}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
                    data-testid="button-login-submit"
                  >
                    {loginMutation.isPending ? "Logging in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/60 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleReplitAuth}
                disabled={isPending}
                className="w-full rounded-xl border-2 bg-white/80 backdrop-blur-sm hover:bg-white"
                data-testid="button-replit-auth"
              >
                <img 
                  src="https://replit.com/public/images/logo-small.png" 
                  alt="Replit" 
                  className="w-5 h-5 mr-2"
                />
                Continue with Replit
              </Button>

              <div className="grid grid-cols-4 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleReplitAuth}
                  disabled={isPending}
                  className="rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white"
                  data-testid="button-google"
                >
                  <SiGoogle className="w-5 h-5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleReplitAuth}
                  disabled={isPending}
                  className="rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white"
                  data-testid="button-github"
                >
                  <SiGithub className="w-5 h-5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleReplitAuth}
                  disabled={isPending}
                  className="rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white"
                  data-testid="button-apple"
                >
                  <SiApple className="w-5 h-5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleReplitAuth}
                  disabled={isPending}
                  className="rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white"
                  data-testid="button-x"
                >
                  <SiX className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
