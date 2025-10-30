import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmailSignupSchema, type InsertEmailSignup } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function ModernCTA() {
  const { toast } = useToast();

  const form = useForm<InsertEmailSignup>({
    resolver: zodResolver(insertEmailSignupSchema),
    defaultValues: {
      email: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: InsertEmailSignup) => {
      return apiRequest("/api/signups", "POST", data);
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

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-r from-teal-500 to-emerald-500 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" data-testid="heading-cta">
            Ready to Level Up Your IT Skills?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto" data-testid="text-cta-description">
            Join the waitlist and be the first to know when Rebooto launches in 2025.
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex items-center gap-4 bg-white rounded-full p-2 shadow-xl max-w-lg mx-auto"
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
                        data-testid="input-email-cta"
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
                className="bg-gray-900 text-white rounded-full font-semibold whitespace-nowrap hover:bg-gray-800 transition-all"
                data-testid="button-signup-cta"
              >
                {signupMutation.isPending ? "Joining..." : "Get Early Access"}
                <ArrowRight className="w-4 h-4 ml-2" data-testid="icon-arrow-cta" />
              </Button>
            </form>
          </Form>
        </motion.div>
      </div>
    </section>
  );
}
