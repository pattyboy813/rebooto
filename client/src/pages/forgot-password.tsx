import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, Check } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [devToken, setDevToken] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send reset email");
      }

      const result = await response.json();
      
      // Store dev token if provided
      if (result.devToken) {
        setDevToken(result.devToken);
      }

      setIsSuccess(true);
      toast({
        title: "Email Sent",
        description: "Check your inbox for the password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-teal-50 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-admin rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gradient-admin" data-testid="heading-forgot-password">
              Forgot Password?
            </h1>
            <p className="text-muted-foreground mt-2">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {!isSuccess ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          {...field}
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-admin"
                  disabled={isSubmitting}
                  data-testid="button-send-reset-link"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Check Your Email</h3>
                <p className="text-muted-foreground text-sm">
                  We've sent a password reset link to <strong>{form.getValues("email")}</strong>
                </p>
                {devToken && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs font-semibold text-yellow-800 mb-2">Development Mode</p>
                    <p className="text-xs text-yellow-700 mb-2">Reset link:</p>
                    <Link href={`/reset-password?token=${devToken}`}>
                      <a className="text-xs text-blue-600 hover:underline break-all" data-testid="link-dev-reset">
                        /reset-password?token={devToken}
                      </a>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Back to login */}
          <div className="text-center pt-4 border-t">
            <Link href="/auth">
              <a className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2" data-testid="link-back-to-login">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </a>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
