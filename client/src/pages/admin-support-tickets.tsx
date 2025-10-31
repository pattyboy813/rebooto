import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ModernBackground } from "@/components/modern/ModernBackground";
import { ModernCard } from "@/components/modern/ModernCard";
import { ModernPageHeader } from "@/components/modern/ModernPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  MessageSquare,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Trash2,
  User,
  Calendar,
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import type { SupportLog, SupportTicketResponse } from "@shared/schema";

interface TicketWithResponses {
  ticket: SupportLog;
  responses: SupportTicketResponse[];
}

const statusColors = {
  open: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  resolved: "bg-green-500/20 text-green-400 border-green-500/30",
  closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const priorityColors = {
  low: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  urgent: "bg-red-500/20 text-red-400 border-red-500/30",
};

const categoryColors = {
  general: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  technical: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  billing: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  account: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export default function AdminSupportTickets() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [responseMessage, setResponseMessage] = useState("");

  const { data: tickets = [], isLoading } = useQuery<SupportLog[]>({
    queryKey: ["/api/admin/support"],
  });

  const { data: selectedTicketData, refetch: refetchTicket } = useQuery<TicketWithResponses>({
    queryKey: [`/api/support/${selectedTicketId}`],
    enabled: selectedTicketId !== null,
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<SupportLog> }) => {
      return await apiRequest(`/api/admin/support/${id}`, "PUT", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support"] });
      if (selectedTicketId) {
        queryClient.invalidateQueries({ queryKey: [`/api/support/${selectedTicketId}`] });
      }
      toast({
        title: "Success",
        description: "Ticket updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update ticket",
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support"] });
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

  const deleteTicketMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/support/${id}`, "DELETE", {});
    },
    onSuccess: () => {
      setSelectedTicketId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support"] });
      toast({
        title: "Success",
        description: "Ticket deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete ticket",
        variant: "destructive",
      });
    },
  });

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      searchQuery === "" ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const handleSendResponse = async () => {
    if (!selectedTicketId || !responseMessage.trim()) return;
    await addResponseMutation.mutateAsync({
      ticketId: selectedTicketId,
      message: responseMessage,
    });
  };

  return (
    <div className="min-h-screen relative">
      <ModernBackground />

      <div className="relative z-10 p-6">
        <ModernPageHeader
          title="Support Tickets"
          description="Manage and respond to user support requests"
          icon={MessageSquare}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ModernCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                  <AlertCircle className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Open Tickets</p>
                  <p className="text-2xl font-bold text-foreground">
                    {tickets.filter((t) => t.status === "open").length}
                  </p>
                </div>
              </div>
            </ModernCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ModernCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-foreground">
                    {tickets.filter((t) => t.status === "in_progress").length}
                  </p>
                </div>
              </div>
            </ModernCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ModernCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold text-foreground">
                    {tickets.filter((t) => t.status === "resolved").length}
                  </p>
                </div>
              </div>
            </ModernCard>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ModernCard className="p-6 h-[calc(100vh-24rem)] flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-tickets"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status-filter">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger data-testid="select-priority-filter">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger data-testid="select-category-filter">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3">
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    <div className="text-center text-muted-foreground py-8">Loading tickets...</div>
                  ) : filteredTickets.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">No tickets found</div>
                  ) : (
                    filteredTickets.map((ticket, index) => (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border backdrop-blur-sm cursor-pointer transition-all ${
                          selectedTicketId === ticket.id
                            ? "bg-primary/10 border-primary/50"
                            : "bg-card/40 border-border/50 hover-elevate"
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
                            <User className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">{ticket.userEmail}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </ModernCard>
          </motion.div>

          {/* Ticket Details & Conversation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <ModernCard className="p-6 h-[calc(100vh-24rem)] flex flex-col">
              {!selectedTicketId ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a ticket to view details</p>
                  </div>
                </div>
              ) : selectedTicketData ? (
                <>
                  {/* Ticket Header */}
                  <div className="border-b border-border/50 pb-4 mb-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h2 className="text-xl font-bold text-foreground">{selectedTicketData.ticket.subject}</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTicketMutation.mutate(selectedTicketId)}
                        data-testid="button-delete-ticket"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <Select
                        value={selectedTicketData.ticket.status}
                        onValueChange={(value) =>
                          updateTicketMutation.mutate({ id: selectedTicketId, updates: { status: value } })
                        }
                      >
                        <SelectTrigger className="w-32" data-testid="select-ticket-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedTicketData.ticket.priority}
                        onValueChange={(value) =>
                          updateTicketMutation.mutate({ id: selectedTicketId, updates: { priority: value } })
                        }
                      >
                        <SelectTrigger className="w-32" data-testid="select-ticket-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(selectedTicketData.ticket.createdAt), "MMM d, yyyy")}</span>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">From:</span> {selectedTicketData.ticket.userEmail}
                    </div>
                  </div>

                  {/* Conversation */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {/* Initial Ticket Message */}
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                        <User className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl p-4">
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
                          <User className={`w-4 h-4 ${response.isAdminResponse ? "text-emerald-400" : "text-blue-400"}`} />
                        </div>
                        <div className="flex-1">
                          <div className={`backdrop-blur-sm border rounded-xl p-4 ${
                            response.isAdminResponse
                              ? "bg-emerald-500/10 border-emerald-500/30"
                              : "bg-card/60 border-border/50"
                          }`}>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{response.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(new Date(response.createdAt), "MMM d, yyyy 'at' h:mm a")}
                              {response.isAdminResponse && <span className="ml-2 text-emerald-400">• Admin</span>}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Response Input */}
                  <div className="border-t border-border/50 pt-4">
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
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">Loading ticket...</div>
                </div>
              )}
            </ModernCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
