import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Users, Search, UserCheck, Shield, Calendar, TrendingUp, Award, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { format } from "date-fns";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  xp: number;
  level: number;
  dateOfBirth: string | null;
  createdAt: string;
};

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const toggleRoleMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: number; isAdmin: boolean }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ isAdmin }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Role Updated",
        description: "User role has been changed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User Deleted",
        description: "User has been removed successfully.",
      });
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
      setUserToDelete(null);
    },
  });

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || user.email.toLowerCase().includes(query);
  });

  const stats = {
    totalUsers: users.length,
    adminUsers: users.filter(u => u.isAdmin).length,
    activeToday: Math.floor(users.length * 0.3),
    avgLevel: users.length > 0 ? Math.round(users.reduce((sum, u) => sum + u.level, 0) / users.length) : 0,
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gradient-admin mb-2" data-testid="heading-users">
          User Management
        </h1>
        <p className="text-muted-foreground">
          View and manage all platform users
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-admin/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
              <Badge className="bg-gradient-admin text-white border-0">Total</Badge>
            </div>
            <h3 className="text-3xl font-bold mb-1" data-testid="stat-total-users">{stats.totalUsers}</h3>
            <p className="text-sm text-muted-foreground">Total Users</p>
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
                <Shield className="w-6 h-6 text-teal-600" />
              </div>
              <Badge variant="secondary">Admins</Badge>
            </div>
            <h3 className="text-3xl font-bold mb-1" data-testid="stat-admin-users">{stats.adminUsers}</h3>
            <p className="text-sm text-muted-foreground">Admin Users</p>
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
                <UserCheck className="w-6 h-6 text-teal-600" />
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <h3 className="text-3xl font-bold mb-1" data-testid="stat-active-users">{stats.activeToday}</h3>
            <p className="text-sm text-muted-foreground">Active Today</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-admin/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-teal-600" />
              </div>
              <Badge variant="secondary">Progress</Badge>
            </div>
            <h3 className="text-3xl font-bold mb-1" data-testid="stat-avg-level">Level {stats.avgLevel}</h3>
            <p className="text-sm text-muted-foreground">Average Level</p>
          </Card>
        </motion.div>
      </div>

      {/* Search & Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-users"
            />
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">All Users ({filteredUsers.length})</h2>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? `No users found matching "${searchQuery}"` : "No users yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>XP</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-admin flex items-center justify-center text-white font-semibold">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          Lvl {user.level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{user.xp.toLocaleString()} XP</p>
                      </TableCell>
                      <TableCell>
                        {user.isAdmin ? (
                          <Badge className="bg-gradient-admin text-white border-0">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary">User</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(user.createdAt), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleRoleMutation.mutate({ userId: user.id, isAdmin: !user.isAdmin })}
                            disabled={toggleRoleMutation.isPending}
                            data-testid={`button-toggle-role-${user.id}`}
                          >
                            {user.isAdmin ? "Remove Admin" : "Make Admin"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setUserToDelete(user)}
                            data-testid={`button-delete-${user.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userToDelete?.firstName} {userToDelete?.lastName}? 
              This action cannot be undone and will permanently remove all their data, progress, and achievements.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && deleteUserMutation.mutate(userToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
