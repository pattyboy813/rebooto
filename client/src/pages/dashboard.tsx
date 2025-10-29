import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Mail, BarChart3, LogOut, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import type { EmailSignup } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [showSignupsDialog, setShowSignupsDialog] = useState(false);

  // Check authentication
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  const { data: signupStats } = useQuery<{ count: number }>({
    queryKey: ["/api/signups/count"],
  });

  const { data: signups } = useQuery<EmailSignup[]>({
    queryKey: ["/api/signups"],
    enabled: !!user,
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/70 border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-sm">TR</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {(user as any).username}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="rounded-full"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6 backdrop-blur-lg bg-white/60 border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Signups</p>
                    <p className="text-3xl font-bold text-gray-900" data-testid="text-total-signups">
                      {signupStats?.count || 0}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="p-6 backdrop-blur-lg bg-white/60 border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Campaigns</p>
                    <p className="text-3xl font-bold text-gray-900">1</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-6 backdrop-blur-lg bg-white/60 border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Conversion Rate</p>
                    <p className="text-3xl font-bold text-gray-900">--</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-8 backdrop-blur-lg bg-white/60 border border-gray-200/50 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14"
                  data-testid="button-manage-scenarios"
                >
                  Manage Scenarios
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl h-14"
                  data-testid="button-view-signups"
                  onClick={() => setShowSignupsDialog(true)}
                >
                  View All Signups
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl h-14"
                  data-testid="button-analytics"
                >
                  Analytics Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl h-14"
                  data-testid="button-settings"
                >
                  Settings
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-6 backdrop-blur-lg bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xl">🎉</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    You found the secret admin portal!
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    This dashboard is accessible via the Konami code (↑↑↓↓←→←→BA) anywhere on the site.
                    From here, you can manage scenarios, view signup analytics, and configure the platform.
                    More features coming soon!
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Signups Dialog */}
      <Dialog open={showSignupsDialog} onOpenChange={setShowSignupsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Email Signups</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {signups && signups.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {signups.map((signup, index) => (
                  <div
                    key={signup.id}
                    className="py-4 flex items-center justify-between hover-elevate rounded-lg px-4"
                    data-testid={`signup-item-${index}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900" data-testid={`signup-email-${index}`}>
                          {signup.email}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span data-testid={`signup-date-${index}`}>
                            {new Date(signup.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No signups yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
