import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
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
import { Lock, Check, AlertCircle } from "lucide-react";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string>("");
  const [tokenError, setTokenError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get token from URL query params
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    
    if (!tokenParam) {
      setTokenError(true);
      toast({
        title: "Invalid Link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive",
      });
    } else {
      setToken(tokenParam);
    }
  }, [toast]);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reset password");
      }

      setIsSuccess(true);
      toast({
        title: "Password Reset Successfully",
        description: "You can now log in with your new password.",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        setLocation("/auth");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-teal-50 p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2" data-testid="heading-invalid-token">Invalid or Expired Link</h1>
              <p className="text-muted-foreground">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/forgot-password">
                <Button className="w-full bg-gradient-admin" data-testid="button-request-new-link">
                  Request New Link
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-teal-50 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-admin rounded-2xl flex items-center justify-center mx-auto mb-4">
              {isSuccess ? (
                <Check className="w-8 h-8 text-white" />
              ) : (
                <Lock className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gradient-admin" data-testid="heading-reset-password">
              {isSuccess ? "Password Reset!" : "Reset Password"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSuccess ? "Your password has been updated" : "Enter your new password"}
            </p>
          </div>

          {!isSuccess ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          {...field}
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          {...field}
                          data-testid="input-confirm-password"
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
                  data-testid="button-reset-password"
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Redirecting to login page...
              </p>
              <Link href="/auth">
                <Button className="w-full bg-gradient-admin" data-testid="button-go-to-login">
                  Go to Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
