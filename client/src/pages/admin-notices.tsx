import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ModernBackground } from "@/components/modern/ModernBackground";
import { ModernCard } from "@/components/modern/ModernCard";
import { ModernPageHeader } from "@/components/modern/ModernPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bell, Plus, Trash2, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Notice } from "@shared/schema";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function AdminNotices() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info" as "info" | "warning" | "maintenance",
  });
  const { toast } = useToast();

  const { data: notices, isLoading } = useQuery<Notice[]>({
    queryKey: ["/api/admin/notices"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("/api/admin/notices", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notices"] });
      toast({ title: "Notice created successfully" });
      setDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/notices/${id}`, "DELETE", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notices"] });
      toast({ title: "Notice deleted" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "info",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "maintenance":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-blue-100 text-blue-700 border-blue-300";
    }
  };

  return (
    <div className="relative min-h-screen p-8">
      <ModernBackground />

      <ModernPageHeader
        title="System Notices"
        description="Manage platform-wide announcements and maintenance alerts"
        icon={Bell}
        action={
          <Button
            size="lg"
            className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg"
            onClick={() => setDialogOpen(true)}
            data-testid="button-create-notice"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Notice
          </Button>
        }
      />

      <ModernCard delay={0.1}>
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
            </div>
          ) : notices && notices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notices.map((notice, index) => (
                  <motion.tr
                    key={notice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover-elevate"
                  >
                    <TableCell className="font-medium">{notice.title}</TableCell>
                    <TableCell className="text-gray-600 max-w-md truncate">{notice.message}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(notice.type)}>
                        {notice.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {notice.isActive ? (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(new Date(notice.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMutation.mutate(notice.id)}
                        data-testid={`button-delete-${notice.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No notices yet. Create your first system notice!</p>
            </div>
          )}
        </div>
      </ModernCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid="dialog-create-notice">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-teal-600" />
              Create System Notice
            </DialogTitle>
            <DialogDescription>
              Post announcements or maintenance alerts to all users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                placeholder="Scheduled Maintenance"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                data-testid="input-notice-title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                placeholder="We'll be performing system maintenance on..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                data-testid="input-notice-message"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                data-testid="select-notice-type"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
              onClick={() => createMutation.mutate(formData)}
              disabled={createMutation.isPending || !formData.title || !formData.message}
              data-testid="button-submit-notice"
            >
              {createMutation.isPending ? "Creating..." : "Create Notice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
