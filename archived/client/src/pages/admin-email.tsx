import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ModernBackground } from "@/components/modern/ModernBackground";
import { ModernCard } from "@/components/modern/ModernCard";
import { ModernPageHeader } from "@/components/modern/ModernPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AdminEmail() {
  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    body: "",
  });
  const { toast } = useToast();

  const sendEmailMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("/api/admin/send-email", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Email sent successfully" });
      setFormData({ to: "", subject: "", body: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="relative min-h-screen p-8">
      <ModernBackground />

      <ModernPageHeader
        title="Email Sender"
        description="Send emails to users and manage email templates"
        icon={Mail}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <ModernCard delay={0.1}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Compose Email</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">To (Email Address)</label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  data-testid="input-email-to"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input
                  placeholder="Welcome to Rebooto!"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  data-testid="input-email-subject"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <Textarea
                  placeholder="Write your email message here..."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  rows={10}
                  data-testid="input-email-body"
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
                onClick={() => sendEmailMutation.mutate(formData)}
                disabled={sendEmailMutation.isPending || !formData.to || !formData.subject || !formData.body}
                data-testid="button-send-email"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
              </Button>
            </div>
          </div>
        </ModernCard>

        <ModernCard delay={0.2}>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Email Templates</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setFormData({
                  to: "",
                  subject: "Welcome to Rebooto!",
                  body: "Hi there,\n\nWelcome to Rebooto! We're excited to have you join our IT support learning platform.\n\nGet started by exploring our courses and begin your journey to becoming an IT support professional.\n\nBest regards,\nThe Rebooto Team"
                })}
                data-testid="button-template-welcome"
              >
                Welcome Email
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setFormData({
                  to: "",
                  subject: "Password Reset Request",
                  body: "Hi there,\n\nYou've requested a password reset for your Rebooto account.\n\nIf you didn't make this request, please ignore this email.\n\nBest regards,\nThe Rebooto Team"
                })}
                data-testid="button-template-reset"
              >
                Password Reset
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setFormData({
                  to: "",
                  subject: "Course Completion Congratulations",
                  body: "Congratulations!\n\nYou've successfully completed a course on Rebooto. Keep up the great work!\n\nBest regards,\nThe Rebooto Team"
                })}
                data-testid="button-template-completion"
              >
                Course Completion
              </Button>
            </div>
          </div>
        </ModernCard>
      </div>
    </div>
  );
}
