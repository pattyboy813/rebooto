import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus, Mail, Lock, User, Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { localLoginSchema, localSignupSchema, type LocalLogin, type LocalSignup } from "@shared/schema";

export function PremiumAuth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("signup");
  const [loginStep, setLoginStep] = useState(1);
  const [signupStep, setSignupStep] = useState(1);

  const loginForm = useForm<LocalLogin>({
    resolver: zodResolver(localLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<LocalSignup>({
    resolver: zodResolver(localSignupSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LocalLogin) => {
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
    mutationFn: async (data: LocalSignup) => {
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

  const handleLoginStepNext = async () => {
    const isValid = await loginForm.trigger("email");
    if (isValid && loginStep === 1) {
      setLoginStep(2);
    }
  };

  const handleSignupStepNext = async () => {
    if (signupStep === 1) {
      const isValid = await signupForm.trigger(["firstName", "lastName"]);
      if (isValid) setSignupStep(2);
    } else if (signupStep === 2) {
      const isValid = await signupForm.trigger("email");
      if (isValid) setSignupStep(3);
    } else if (signupStep === 3) {
      const isValid = await signupForm.trigger(["password", "dateOfBirth"]);
      if (isValid) signupForm.handleSubmit(onSignupSubmit)();
    }
  };

  const onLoginSubmit = (data: LocalLogin) => {
    loginMutation.mutate(data);
  };

  const onSignupSubmit = (data: LocalSignup) => {
    signupMutation.mutate(data);
  };

  const isPending = loginMutation.isPending || signupMutation.isPending;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <section
      id="auth"
      className="py-20 md:py-32 px-4 md:px-6 bg-gradient-to-br from-teal-50 via-white to-emerald-50 relative overflow-hidden"
    >
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-teal-200/20 to-emerald-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl pointer-events-none" />
      
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
              setLoginStep(1);
              setSignupStep(1);
              loginForm.reset();
              signupForm.reset();
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

              <TabsContent value="login" className="space-y-4">
                <div className="min-h-[300px] relative overflow-hidden">
                  <AnimatePresence mode="wait" custom={loginStep}>
                    {loginStep === 1 && (
                      <motion.div
                        key="login-step-1"
                        custom={1}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h3>
                          <p className="text-gray-600">Enter your email to continue</p>
                        </div>

                        <div>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                              className="pl-12 rounded-xl bg-white/80 backdrop-blur-sm border-gray-300 h-12"
                              {...loginForm.register("email")}
                              data-testid="input-email-login"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleLoginStepNext();
                                }
                              }}
                            />
                          </div>
                          {loginForm.formState.errors.email && (
                            <p className="text-destructive text-sm mt-2 ml-4" data-testid="error-email-login">
                              {loginForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        <Button
                          type="button"
                          size="lg"
                          onClick={handleLoginStepNext}
                          className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white border-0 shadow-lg"
                          data-testid="button-login-next"
                        >
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </motion.div>
                    )}

                    {loginStep === 2 && (
                      <motion.div
                        key="login-step-2"
                        custom={1}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">Enter Password</h3>
                          <p className="text-gray-600 text-sm truncate">{loginForm.watch("email")}</p>
                        </div>

                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <div>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <Input
                                type="password"
                                placeholder="Enter your password"
                                className="pl-12 rounded-xl bg-white/80 backdrop-blur-sm border-gray-300 h-12"
                                {...loginForm.register("password")}
                                data-testid="input-password-login"
                                autoFocus
                              />
                            </div>
                            {loginForm.formState.errors.password && (
                              <p className="text-destructive text-sm mt-2 ml-4" data-testid="error-password-login">
                                {loginForm.formState.errors.password.message}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="lg"
                              onClick={() => setLoginStep(1)}
                              className="rounded-xl"
                              data-testid="button-login-back"
                            >
                              <ArrowLeft className="w-4 h-4 mr-2" />
                              Back
                            </Button>
                            <Button
                              type="submit"
                              size="lg"
                              disabled={isPending}
                              className="flex-1 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white border-0 shadow-lg"
                              data-testid="button-login-submit"
                            >
                              {loginMutation.isPending ? "Logging in..." : "Sign In"}
                            </Button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="min-h-[400px] relative overflow-hidden">
                  <AnimatePresence mode="wait" custom={signupStep}>
                    {signupStep === 1 && (
                      <motion.div
                        key="signup-step-1"
                        custom={1}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h3>
                          <p className="text-gray-600">Let's start with your name</p>
                        </div>

                        <div>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              type="text"
                              placeholder="First Name"
                              className="pl-12 rounded-xl bg-white/80 backdrop-blur-sm border-gray-300 h-12"
                              {...signupForm.register("firstName")}
                              data-testid="input-firstname-signup"
                            />
                          </div>
                          {signupForm.formState.errors.firstName && (
                            <p className="text-destructive text-sm mt-2 ml-4" data-testid="error-firstname-signup">
                              {signupForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              type="text"
                              placeholder="Last Name"
                              className="pl-12 rounded-xl bg-white/80 backdrop-blur-sm border-gray-300 h-12"
                              {...signupForm.register("lastName")}
                              data-testid="input-lastname-signup"
                            />
                          </div>
                          {signupForm.formState.errors.lastName && (
                            <p className="text-destructive text-sm mt-2 ml-4" data-testid="error-lastname-signup">
                              {signupForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>

                        <Button
                          type="button"
                          size="lg"
                          onClick={handleSignupStepNext}
                          className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white border-0 shadow-lg"
                          data-testid="button-signup-next-1"
                        >
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </motion.div>
                    )}

                    {signupStep === 2 && (
                      <motion.div
                        key="signup-step-2"
                        custom={1}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">What's your email?</h3>
                          <p className="text-gray-600">We'll use this for your account</p>
                        </div>

                        <div>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                              className="pl-12 rounded-xl bg-white/80 backdrop-blur-sm border-gray-300 h-12"
                              {...signupForm.register("email")}
                              data-testid="input-email-signup"
                              autoFocus
                            />
                          </div>
                          {signupForm.formState.errors.email && (
                            <p className="text-destructive text-sm mt-2 ml-4" data-testid="error-email-signup">
                              {signupForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => setSignupStep(1)}
                            className="rounded-xl"
                            data-testid="button-signup-back-1"
                          >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                          </Button>
                          <Button
                            type="button"
                            size="lg"
                            onClick={handleSignupStepNext}
                            className="flex-1 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white border-0 shadow-lg"
                            data-testid="button-signup-next-2"
                          >
                            Continue
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {signupStep === 3 && (
                      <motion.div
                        key="signup-step-3"
                        custom={1}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">Almost done!</h3>
                          <p className="text-gray-600">Create a password and add your birth date</p>
                        </div>

                        <div>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              type="password"
                              placeholder="Create a password"
                              className="pl-12 rounded-xl bg-white/80 backdrop-blur-sm border-gray-300 h-12"
                              {...signupForm.register("password")}
                              data-testid="input-password-signup"
                              autoFocus
                            />
                          </div>
                          {signupForm.formState.errors.password && (
                            <p className="text-destructive text-sm mt-2 ml-4" data-testid="error-password-signup">
                              {signupForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              type="date"
                              placeholder="Date of Birth"
                              className="pl-12 rounded-xl bg-white/80 backdrop-blur-sm border-gray-300 h-12"
                              {...signupForm.register("dateOfBirth")}
                              data-testid="input-dob-signup"
                            />
                          </div>
                          {signupForm.formState.errors.dateOfBirth && (
                            <p className="text-destructive text-sm mt-2 ml-4" data-testid="error-dob-signup">
                              {signupForm.formState.errors.dateOfBirth.message}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => setSignupStep(2)}
                            className="rounded-xl"
                            data-testid="button-signup-back-2"
                          >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                          </Button>
                          <Button
                            type="button"
                            size="lg"
                            disabled={isPending}
                            onClick={handleSignupStepNext}
                            className="flex-1 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white border-0 shadow-lg"
                            data-testid="button-signup-submit"
                          >
                            {signupMutation.isPending ? "Creating account..." : "Create Account"}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
