import { useState } from "react";
import { useLocation } from "wouter";
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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, HelpCircle, MessageSquare, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";

const supportFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  category: z.enum(["Technical Issue", "Account Question", "Course Content", "Feature Request", "Other"]),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type SupportFormData = z.infer<typeof supportFormSchema>;

export default function Support() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      name: "",
      email: "",
      category: "Technical Issue",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: SupportFormData) => {
    console.log("Support request:", data);
    setSubmitted(true);
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    form.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/70 border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/")}
                data-testid="button-back-home"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setLocation("/auth")}
                data-testid="button-login"
              >
                Login
              </Button>
              <Button
                className="bg-gradient-admin text-white"
                onClick={() => setLocation("/auth")}
                data-testid="button-signup"
              >
                Sign Up Free
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-admin flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gradient-admin mb-6" data-testid="heading-support">
            Get Support
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're here to help! Send us a message and we'll respond within 24 hours.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Quick Help Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 h-full hover-elevate cursor-pointer" onClick={() => setLocation("/documentation")}>
              <div className="w-12 h-12 rounded-xl bg-gradient-admin/10 flex items-center justify-center mb-4">
                <HelpCircle className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Documentation</h3>
              <p className="text-muted-foreground text-sm">
                Browse our comprehensive guides and tutorials
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 h-full hover-elevate cursor-pointer" onClick={() => setLocation("/faq")}>
              <div className="w-12 h-12 rounded-xl bg-gradient-admin/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">FAQ</h3>
              <p className="text-muted-foreground text-sm">
                Find answers to frequently asked questions
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 h-full">
              <div className="w-12 h-12 rounded-xl bg-gradient-admin/10 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Email Us</h3>
              <p className="text-muted-foreground text-sm mb-4">
                support@rebooto.com
              </p>
              <p className="text-xs text-muted-foreground">
                We respond within 24 hours
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-8 md:p-12">
            {!submitted ? (
              <>
                <h2 className="text-3xl font-bold mb-8 text-gradient-admin">Send Us a Message</h2>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        {...form.register("name")}
                        placeholder="Your name"
                        data-testid="input-name"
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register("email")}
                        placeholder="your@email.com"
                        data-testid="input-email"
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={form.watch("category")}
                      onValueChange={(value) => form.setValue("category", value as any)}
                    >
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                        <SelectItem value="Account Question">Account Question</SelectItem>
                        <SelectItem value="Course Content">Course Content</SelectItem>
                        <SelectItem value="Feature Request">Feature Request</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      {...form.register("subject")}
                      placeholder="Brief description of your issue"
                      data-testid="input-subject"
                    />
                    {form.formState.errors.subject && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      {...form.register("message")}
                      placeholder="Please provide as much detail as possible..."
                      rows={6}
                      data-testid="input-message"
                    />
                    {form.formState.errors.message && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto bg-gradient-admin text-white rounded-full"
                    disabled={form.formState.isSubmitting}
                    data-testid="button-submit"
                  >
                    Send Message
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gradient-admin/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gradient-admin">Message Sent!</h3>
                <p className="text-muted-foreground mb-8">
                  Thank you for contacting us. We'll respond to your message within 24 hours.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                  data-testid="button-send-another"
                >
                  Send Another Message
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
