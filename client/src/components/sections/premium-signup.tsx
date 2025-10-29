import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmailSignupSchema } from "@shared/schema";
import type { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

type EmailSignupForm = z.infer<typeof insertEmailSignupSchema>;

export function PremiumSignup() {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailSignupForm>({
    resolver: zodResolver(insertEmailSignupSchema),
  });

  const { data: stats } = useQuery<{ count: number }>({
    queryKey: ["/api/signups/count"],
  });

  const mutation = useMutation({
    mutationFn: async (data: EmailSignupForm) => {
      const response = await fetch("/api/signups", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to sign up");
      }
      return await response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/signups/count"] });
      toast({
        title: "Success!",
        description: "You've been added to our early access list.",
      });
    },
    onError: (error: any) => {
      if (error.message.includes("already registered")) {
        toast({
          variant: "destructive",
          title: "Already registered",
          description: "This email is already on our waitlist.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Something went wrong. Please try again.",
        });
      }
    },
  });

  const onSubmit = (data: EmailSignupForm) => {
    mutation.mutate(data);
  };

  return (
    <section
      id="signup"
      className="py-20 md:py-32 px-4 md:px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Be First to Learn
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Join the early access list and get notified when we launch
          </p>
        </motion.div>

        {!submitted ? (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 md:space-y-6"
          >
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  className="rounded-full bg-white/80 backdrop-blur-sm border-gray-300 text-base h-12 md:h-14 px-6 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  {...register("email")}
                  data-testid="input-email"
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-2 ml-4" data-testid="error-email">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={mutation.isPending}
                className="w-full sm:w-auto h-12 md:h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/30 px-8 md:px-10"
                data-testid="button-signup"
              >
                {mutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Join Waitlist
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs md:text-sm text-gray-500 text-center">
              We respect your privacy. No spam, just launch updates.
            </p>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center p-8 md:p-12 rounded-3xl backdrop-blur-lg bg-white/80 border border-gray-200/50 shadow-xl"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
              <Mail className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">You're in!</h3>
            <p className="text-base md:text-lg text-gray-600">
              Check your inbox for a confirmation email.
            </p>
          </motion.div>
        )}

        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex items-center justify-center gap-2 text-sm md:text-base text-gray-600"
          >
            <Users className="w-5 h-5" />
            <span data-testid="text-signup-count">
              Join {stats.count}+ early supporters
            </span>
          </motion.div>
        )}
      </div>
    </section>
  );
}
