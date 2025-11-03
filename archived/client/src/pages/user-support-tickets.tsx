import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MessageSquare,
  Send,
  Plus,
  Calendar,
  Tag,
  User,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import type { SupportLog, SupportTicketResponse } from "@shared/schema";

const ticketFormSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
  category: z.enum(["general", "technical", "billing", "account"]),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

type TicketFormData = z.infer<typeof ticketFormSchema>;

interface TicketWithResponses {
  ticket: SupportLog;
  responses: SupportTicketResponse[];
}

const statusColors = {
  open: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  in_progress: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
  resolved: "bg-green-500/20 text-green-600 border-green-500/30",
  closed: "bg-gray-500/20 text-gray-600 border-gray-500/30",
};

const priorityColors = {
  low: "bg-gray-500/20 text-gray-600 border-gray-500/30",
  medium: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  high: "bg-orange-500/20 text-orange-600 border-orange-500/30",
  urgent: "bg-red-500/20 text-red-600 border-red-500/30",
};

const categoryColors = {
  general: "bg-purple-500/20 text-purple-600 border-purple-500/30",
  technical: "bg-cyan-500/20 text-cyan-600 border-cyan-500/30",
  billing: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
  account: "bg-pink-500/20 text-pink-600 border-pink-500/30",
};

export default function UserSupportTickets() {
  const { toast } = useToast();
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [responseMessage, setResponseMessage] = useState("");

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      subject: "",
      message: "",
      category: "general",
      priority: "medium",
    },
  });

  const { data: tickets = [], isLoading } = useQuery<SupportLog[]>({
    queryKey: ["/api/support/my-tickets"],
  });

  const { data: selectedTicketData, refetch: refetchTicket } = useQuery<TicketWithResponses>({
    queryKey: [`/api/support/${selectedTicketId}`],
    enabled: selectedTicketId !== null,
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      return await apiRequest("/api/support", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/my-tickets"] });
      setShowNewTicketForm(false);
      form.reset();
      toast({
        title: "Success",
        description: "Your support ticket has been submitted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit ticket. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addResponseMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: number; message: string }) => {
      return await apiRequest(`/api/support/${ticketId}/responses`, "POST", { message });
    },
    onSuccess: () => {
      setResponseMessage("");
      if (selectedTicketId) {
        queryClient.invalidateQueries({ queryKey: [`/api/support/${selectedTicketId}`] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/support/my-tickets"] });
      toast({
        title: "Success",
        description: "Response sent successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TicketFormData) => {
    createTicketMutation.mutate(data);
  };

  const handleSendResponse = async () => {
    if (!selectedTicketId || !responseMessage.trim()) return;
    await addResponseMutation.mutateAsync({
      ticketId: selectedTicketId,
      message: responseMessage,
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Support Tickets</h1>
          <p className="text-muted-foreground">Submit and track your support requests</p>
        </div>
        <Button
          onClick={() => setShowNewTicketForm(!showNewTicketForm)}
          className="gap-2"
          data-testid="button-new-ticket"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </Button>
      </div>

      <AnimatePresence>
        {showNewTicketForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold">Submit New Ticket</h2>
                <p className="text-sm text-muted-foreground">
                  Describe your issue and our team will respond as soon as possible
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      {...form.register("subject")}
                      data-testid="input-ticket-subject"
                    />
                    {form.formState.errors.subject && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={form.watch("category")}
                      onValueChange={(value) => form.setValue("category", value as any)}
                    >
                      <SelectTrigger id="category" data-testid="select-ticket-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={form.watch("priority")}
                      onValueChange={(value) => form.setValue("priority", value as any)}
                    >
                      <SelectTrigger id="priority" data-testid="select-ticket-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Provide detailed information about your issue..."
                      rows={6}
                      {...form.register("message")}
                      data-testid="textarea-ticket-message"
                    />
                    {form.formState.errors.message && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.message.message}</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={createTicketMutation.isPending}
                      data-testid="button-submit-ticket"
                    >
                      {createTicketMutation.isPending ? "Submitting..." : "Submit Ticket"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewTicketForm(false)}
                      data-testid="button-cancel-ticket"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets List */}
        <div>
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <h2 className="text-xl font-bold">My Tickets</h2>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    <div className="text-center text-muted-foreground py-8">Loading tickets...</div>
                  ) : tickets.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No tickets yet</p>
                      <p className="text-sm">Click "New Ticket" to submit your first support request</p>
                    </div>
                  ) : (
                    tickets.map((ticket, index) => (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all hover-elevate ${
                          selectedTicketId === ticket.id
                            ? "bg-primary/10 border-primary/50"
                            : "bg-card border-border"
                        }`}
                        onClick={() => setSelectedTicketId(ticket.id)}
                        data-testid={`card-ticket-${ticket.id}`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-semibold text-foreground line-clamp-1">{ticket.subject}</h3>
                          <Badge className={`text-xs ${statusColors[ticket.status as keyof typeof statusColors]}`}>
                            {ticket.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{ticket.message}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-xs ${priorityColors[ticket.priority as keyof typeof priorityColors]}`}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${categoryColors[ticket.category as keyof typeof categoryColors]}`}>
                            {ticket.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(ticket.createdAt), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Conversation */}
        <div>
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <h2 className="text-xl font-bold">
                {selectedTicketId ? "Ticket Conversation" : "Select a Ticket"}
              </h2>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {!selectedTicketId ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a ticket to view conversation</p>
                  </div>
                </div>
              ) : selectedTicketData ? (
                <>
                  {/* Ticket Info */}
                  <div className="border-b border-border pb-4 mb-4">
                    <h3 className="text-lg font-bold mb-2">{selectedTicketData.ticket.subject}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`text-xs ${statusColors[selectedTicketData.ticket.status as keyof typeof statusColors]}`}>
                        {selectedTicketData.ticket.status}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${priorityColors[selectedTicketData.ticket.priority as keyof typeof priorityColors]}`}>
                        {selectedTicketData.ticket.priority}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${categoryColors[selectedTicketData.ticket.category as keyof typeof categoryColors]}`}>
                        {selectedTicketData.ticket.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Conversation */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {/* Initial Message */}
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                        <User className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-card/60 border border-border rounded-xl p-4">
                          <p className="text-sm text-foreground whitespace-pre-wrap">{selectedTicketData.ticket.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(selectedTicketData.ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Responses */}
                    {selectedTicketData.responses.map((response) => (
                      <div key={response.id} className={`flex gap-3 ${response.isAdminResponse ? "flex-row-reverse" : ""}`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                          response.isAdminResponse
                            ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30"
                            : "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30"
                        }`}>
                          {response.isAdminResponse ? (
                            <AlertCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <User className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`border rounded-xl p-4 ${
                            response.isAdminResponse
                              ? "bg-emerald-500/10 border-emerald-500/30"
                              : "bg-card/60 border-border"
                          }`}>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{response.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(new Date(response.createdAt), "MMM d, yyyy 'at' h:mm a")}
                              {response.isAdminResponse && <span className="ml-2 text-emerald-600">• Support Team</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Response Input - only show if ticket is not closed */}
                  {selectedTicketData.ticket.status !== "closed" && (
                    <div className="border-t border-border pt-4">
                      <div className="flex gap-3">
                        <Textarea
                          placeholder="Type your response..."
                          value={responseMessage}
                          onChange={(e) => setResponseMessage(e.target.value)}
                          className="flex-1"
                          rows={3}
                          data-testid="textarea-ticket-response"
                        />
                        <Button
                          onClick={handleSendResponse}
                          disabled={!responseMessage.trim() || addResponseMutation.isPending}
                          className="self-end"
                          data-testid="button-send-response"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">Loading ticket...</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
