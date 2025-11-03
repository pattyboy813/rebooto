import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ModernBackground } from "@/components/modern/ModernBackground";
import { ModernCard } from "@/components/modern/ModernCard";
import { ModernPageHeader } from "@/components/modern/ModernPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Shield, Key, Trash2, Search, UserCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User, UserRole } from "@shared/schema";
import { motion } from "framer-motion";

export default function AdminUserManagement() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();

  // Fetch all users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch all user roles
  const { data: allRoles } = useQuery<UserRole[]>({
    queryKey: ["/api/admin/roles"],
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      return await apiRequest("/api/admin/roles", "POST", { userId, role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/roles"] });
      toast({ title: "Role assigned successfully" });
      setRoleDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to assign role", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: number; newPassword: string }) => {
      return await apiRequest(`/api/admin/users/${userId}/reset-password`, "POST", { newPassword });
    },
    onSuccess: () => {
      toast({ title: "Password reset successfully" });
      setPasswordDialogOpen(false);
      setNewPassword("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to reset password", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const getUserRoles = (userId: number) => {
    return allRoles?.filter(r => r.userId === userId).map(r => r.role) || [];
  };

  const filteredUsers = users?.filter(user =>
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-screen p-8">
      <ModernBackground />

      <ModernPageHeader
        title="User Management"
        description="Manage users, roles, and permissions"
        icon={Users}
        action={
          <Button 
            size="lg"
            className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg"
            data-testid="button-export-users"
          >
            Export Users
          </Button>
        }
      />

      <ModernCard delay={0.1} className="mb-6">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-users"
              />
            </div>
            <Button variant="outline" data-testid="button-filters">
              Filters
            </Button>
          </div>
        </div>
      </ModernCard>

      <ModernCard delay={0.2}>
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>XP / Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user, index) => {
                  const roles = getUserRoles(user.id);
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover-elevate"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-gray-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{user.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.isAdmin && (
                            <Badge className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white">
                              Admin
                            </Badge>
                          )}
                          {roles.map(role => (
                            <Badge key={role} variant="outline">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{user.xp} XP</div>
                          <div className="text-gray-500">Level {user.level}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setRoleDialogOpen(true);
                            }}
                            data-testid={`button-manage-roles-${user.id}`}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setPasswordDialogOpen(true);
                            }}
                            data-testid={`button-reset-password-${user.id}`}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </ModernCard>

      {/* Assign Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent data-testid="dialog-assign-role">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-teal-600" />
              Assign Role
            </DialogTitle>
            <DialogDescription>
              Assign a role to {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <Select
            onValueChange={(role) => {
              if (selectedUser) {
                assignRoleMutation.mutate({ userId: selectedUser.id, role });
              }
            }}
          >
            <SelectTrigger data-testid="select-role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="blog">Blog Manager</SelectItem>
              <SelectItem value="course">Course Manager</SelectItem>
              <SelectItem value="support">Support Agent</SelectItem>
            </SelectContent>
          </Select>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent data-testid="dialog-reset-password">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-teal-600" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <Input
            type="password"
            placeholder="New password (min 8 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            data-testid="input-new-password"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
              onClick={() => {
                if (selectedUser && newPassword.length >= 8) {
                  resetPasswordMutation.mutate({ userId: selectedUser.id, newPassword });
                }
              }}
              disabled={newPassword.length < 8 || resetPasswordMutation.isPending}
              data-testid="button-confirm-reset"
            >
              {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
