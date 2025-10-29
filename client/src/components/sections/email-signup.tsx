import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmailSignupSchema } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Mail, Users } from "lucide-react";
import type { z } from "zod";

type EmailSignupForm = z.infer<typeof insertEmailSignupSchema>;

export function EmailSignup() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const { data: stats } = useQuery<{ count: number }>({
    queryKey: ["/api/signups/count"],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmailSignupForm>({
    resolver: zodResolver(insertEmailSignupSchema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: EmailSignupForm) => {
      return apiRequest("POST", "/api/signups", data);
    },
    onSuccess: () => {
      setSubmitted(true);
      reset();
      queryClient.invalidateQueries({ queryKey: ["/api/signups/count"] });
      toast({
        title: "Welcome aboard!",
        description: "You're on the list. We'll notify you when we launch.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Oops!",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EmailSignupForm) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.gsap || !window.ScrollTrigger) return;

    const ctx = window.gsap.context(() => {
      window.gsap.from(".signup-header", {
        scrollTrigger: {
          trigger: ".signup-header",
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });

      window.gsap.from(".signup-form", {
        scrollTrigger: {
          trigger: ".signup-form",
          start: "top 80%",
        },
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="signup"
      ref={sectionRef}
      className="py-16 md:py-24 lg:py-32 px-4 md:px-6 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-chart-2/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-card/50 to-transparent pointer-events-none" />
      
      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="signup-header text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">
            Be First to Learn
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground px-4">
            Join the early access list and get notified when we launch
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="signup-form space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  className="rounded-xl bg-card/50 border-card-border backdrop-blur-sm text-base"
                  {...register("email")}
                  data-testid="input-email"
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-2" data-testid="error-email">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={mutation.isPending}
                className="w-full sm:w-auto bg-gradient-brand text-white border border-primary-border rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
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
            <p className="text-xs md:text-sm text-muted-foreground text-center px-4">
              We respect your privacy. No spam, just launch updates.
            </p>
          </form>
        ) : (
          <div className="signup-form text-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 border border-card-border backdrop-blur-sm">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-brand/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold mb-2">You're in!</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Check your inbox for a confirmation email.
            </p>
          </div>
        )}

        {stats && (
          <div className="mt-6 md:mt-8 flex items-center justify-center gap-2 text-sm md:text-base text-muted-foreground">
            <Users className="w-4 h-4 md:w-5 md:h-5" />
            <span data-testid="text-signup-count">
              Join {stats.count}+ early supporters
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
