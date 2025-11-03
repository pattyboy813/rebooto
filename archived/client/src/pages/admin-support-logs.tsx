import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ModernBackground } from "@/components/modern/ModernBackground";
import { ModernCard } from "@/components/modern/ModernCard";
import { ModernPageHeader } from "@/components/modern/ModernPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquare, Search, Filter } from "lucide-react";
import type { SupportLog } from "@shared/schema";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function AdminSupportLogs() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: logs, isLoading } = useQuery<SupportLog[]>({
    queryKey: ["/api/admin/support-logs"],
  });

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = 
      log.subject?.toLowerCase().includes(search.toLowerCase()) ||
      log.userId?.toString().includes(search);
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-700 border-green-300";
      case "in_progress":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-orange-100 text-orange-700 border-orange-300";
    }
  };

  return (
    <div className="relative min-h-screen p-8">
      <ModernBackground />

      <ModernPageHeader
        title="Support Logs"
        description="View and manage customer support tickets"
        icon={MessageSquare}
      />

      <ModernCard delay={0.1} className="mb-6">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by subject or user ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-logs"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
              data-testid="select-status-filter"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </ModernCard>

      <ModernCard delay={0.2}>
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
            </div>
          ) : filteredLogs && filteredLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover-elevate"
                  >
                    <TableCell className="font-mono text-sm">{log.id}</TableCell>
                    <TableCell className="font-mono text-sm">{log.userId || "N/A"}</TableCell>
                    <TableCell className="font-medium">{log.subject}</TableCell>
                    <TableCell className="text-gray-600 max-w-md truncate">{log.message}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(log.status)}>
                        {log.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(new Date(log.createdAt), "MMM d, yyyy HH:mm")}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No support logs found</p>
            </div>
          )}
        </div>
      </ModernCard>
    </div>
  );
}
