import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Users, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";

const campaignSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
  audience: z.enum(["all_users", "admins", "beta_users", "active_users"]),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

export default function AdminCampaigns() {
  const { toast } = useToast();
  const [previewMode, setPreviewMode] = useState(false);

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      subject: "",
      message: "",
      audience: "all_users",
    },
  });

  const onSubmit = (data: CampaignFormData) => {
    toast({
      title: "Email Feature Coming Soon",
      description: "Email campaigns will be available once Microsoft Outlook integration is configured.",
      variant: "default",
    });
  };

  const watchedValues = form.watch();

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gradient-admin mb-2" data-testid="heading-campaigns">
          Email Campaigns
        </h1>
        <p className="text-muted-foreground">
          Send announcements and updates to your users
        </p>
      </div>

      {/* Integration Notice */}
      <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Email Integration Required</h3>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Configure your Microsoft Outlook integration to start sending email campaigns to your users. 
              Once set up, you'll be able to send announcements, updates, and notifications directly from this page.
            </p>
          </div>
        </div>
      </Card>

      {/* Campaign Composer */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6">Create New Campaign</h2>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                id="subject"
                {...form.register("subject")}
                placeholder="e.g., New Course Available!"
                data-testid="input-subject"
              />
              {form.formState.errors.subject && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.subject.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="audience">Audience *</Label>
              <Select
                value={form.watch("audience")}
                onValueChange={(value) => form.setValue("audience", value as any)}
              >
                <SelectTrigger data-testid="select-audience">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_users">All Users</SelectItem>
                  <SelectItem value="admins">Admins Only</SelectItem>
                  <SelectItem value="beta_users">Beta Users</SelectItem>
                  <SelectItem value="active_users">Active Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              {...form.register("message")}
              placeholder="Write your email message here..."
              rows={10}
              data-testid="input-message"
            />
            {form.formState.errors.message && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.message.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              data-testid="button-preview"
            >
              {previewMode ? "Hide Preview" : "Show Preview"}
            </Button>
            <Button
              type="submit"
              className="bg-gradient-admin text-white"
              disabled={form.formState.isSubmitting}
              data-testid="button-send"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Campaign
            </Button>
          </div>
        </form>

        {/* Preview */}
        {previewMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-8 pt-8 border-t"
          >
            <h3 className="text-xl font-bold mb-4">Email Preview</h3>
            <Card className="p-6 bg-gray-50">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">Subject:</p>
                <p className="font-semibold text-lg">{watchedValues.subject || "(No subject)"}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">To:</p>
                <p className="font-medium">{watchedValues.audience?.replace('_', ' ') || "Not selected"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Message:</p>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{watchedValues.message || "(No message)"}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </Card>

      {/* Campaign History - Will populate once email integration is active */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6">Campaign History</h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-admin/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-teal-600" />
          </div>
          <p className="text-muted-foreground text-lg mb-2">No campaigns sent yet</p>
          <p className="text-sm text-muted-foreground">
            Campaign history will appear here once you configure email integration and send your first campaign.
          </p>
        </div>
      </Card>
    </div>
  );
}
