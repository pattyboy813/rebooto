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

const campaignHistory = [
  {
    id: 1,
    subject: "Welcome to Rebooto Beta!",
    audience: "All Users",
    sent: "2025-01-20",
    recipients: 245,
    status: "Sent",
  },
  {
    id: 2,
    subject: "New Hardware Course Available",
    audience: "Active Users",
    sent: "2025-01-15",
    recipients: 180,
    status: "Sent",
  },
  {
    id: 3,
    subject: "Beta Feedback Survey",
    audience: "Beta Users",
    sent: "2025-01-10",
    recipients: 245,
    status: "Sent",
  },
];

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
    console.log("Campaign data:", data);
    toast({
      title: "Campaign Sent!",
      description: `Email sent to ${data.audience.replace('_', ' ')}`,
    });
    form.reset();
    setPreviewMode(false);
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-admin/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-teal-600" />
              </div>
              <Badge className="bg-gradient-admin text-white border-0">Total</Badge>
            </div>
            <h3 className="text-3xl font-bold mb-1" data-testid="stat-total-campaigns">3</h3>
            <p className="text-sm text-muted-foreground">Campaigns Sent</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-admin/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
              <Badge variant="secondary">Reach</Badge>
            </div>
            <h3 className="text-3xl font-bold mb-1" data-testid="stat-total-recipients">670</h3>
            <p className="text-sm text-muted-foreground">Total Recipients</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-admin/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-teal-600" />
              </div>
              <Badge variant="secondary">Rate</Badge>
            </div>
            <h3 className="text-3xl font-bold mb-1" data-testid="stat-success-rate">98.5%</h3>
            <p className="text-sm text-muted-foreground">Delivery Rate</p>
          </Card>
        </motion.div>
      </div>

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
                  <SelectItem value="all_users">All Users (245)</SelectItem>
                  <SelectItem value="admins">Admins Only (5)</SelectItem>
                  <SelectItem value="beta_users">Beta Users (245)</SelectItem>
                  <SelectItem value="active_users">Active Users (180)</SelectItem>
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

      {/* Campaign History */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6">Campaign History</h2>
        <div className="space-y-4">
          {campaignHistory.map((campaign, idx) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-6 hover-elevate" data-testid={`campaign-${campaign.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{campaign.subject}</h3>
                      <Badge className="bg-gradient-admin text-white border-0">{campaign.status}</Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{campaign.audience} ({campaign.recipients})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{campaign.sent}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
