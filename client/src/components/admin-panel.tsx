import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, LogIn, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleLoginClick = () => {
    window.location.href = "/api/login";
  };

  const handleDashboardClick = () => {
    setLocation("/dashboard");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Admin Portal</h2>
                    <p className="text-sm text-gray-500">Developer access</p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onClose}
                  data-testid="button-close-admin-panel"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Success message for finding easter egg */}
              <div className="mb-8 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">🎉 Easter egg found!</span>
                  <br />
                  You've discovered the secret admin portal.
                </p>
              </div>

              {/* Auth Status & Actions */}
              <div className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-gray-600">Checking authentication...</p>
                  </div>
                ) : isAuthenticated && user ? (
                  <>
                    <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-green-700">✓ Authenticated</span>
                        <br />
                        Logged in as <strong>{(user as any).firstName || 'User'}</strong>
                      </p>
                    </div>
                    <Button
                      onClick={handleDashboardClick}
                      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      data-testid="button-admin-dashboard"
                    >
                      Go to Dashboard
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <p className="text-sm text-gray-700">
                        Login with Replit Auth to access the developer dashboard.
                      </p>
                    </div>
                    <Button
                      onClick={handleLoginClick}
                      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      data-testid="button-admin-login"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Login with Replit
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                )}
              </div>

              {/* Info */}
              <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-600">
                  <strong>Pro tip:</strong> The Konami code (↑↑↓↓←→←→BA) unlocks this panel anywhere on the site.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
