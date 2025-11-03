import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save, Database, Shield, Bell, Palette, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    siteName: "Rebooto",
    betaEndDate: "2025-12-31",
    emailNotifications: true,
    newUserNotifications: true,
    courseCompletionNotifications: false,
    maintenanceMode: false,
    autoBackup: true,
    allowSignups: true,
    requireEmailVerification: false,
  });

  const handleSave = () => {
    toast({
      title: "Backend Integration Required",
      description: "Settings persistence will be available once backend API is implemented.",
      variant: "default",
    });
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gradient-admin mb-2" data-testid="heading-settings">
          Platform Settings
        </h1>
        <p className="text-muted-foreground">
          Configure platform features and preferences
        </p>
      </div>

      {/* Integration Notice */}
      <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <Settings className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Backend Integration Required</h3>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Settings persistence requires backend API implementation. Changes made here are currently stored in browser state only.
            </p>
          </div>
        </div>
      </Card>

      {/* General Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-admin/10 flex items-center justify-center">
              <Settings className="w-6 h-6 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold">General Settings</h2>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                data-testid="input-site-name"
              />
            </div>

            <div>
              <Label htmlFor="betaEndDate">Beta End Date</Label>
              <Input
                id="betaEndDate"
                type="date"
                value={settings.betaEndDate}
                onChange={(e) => setSettings({ ...settings, betaEndDate: e.target.value })}
                data-testid="input-beta-end-date"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Countdown timer will show this date on the landing page
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowSignups">Allow New Signups</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable new user registrations
                </p>
              </div>
              <Switch
                id="allowSignups"
                checked={settings.allowSignups}
                onCheckedChange={(checked) => setSettings({ ...settings, allowSignups: checked })}
                data-testid="switch-allow-signups"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Disable the platform for maintenance
                </p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                data-testid="switch-maintenance-mode"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-admin/10 flex items-center justify-center">
              <Bell className="w-6 h-6 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold">Notification Settings</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email updates to admins
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                data-testid="switch-email-notifications"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newUserNotifications">New User Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new users sign up
                </p>
              </div>
              <Switch
                id="newUserNotifications"
                checked={settings.newUserNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, newUserNotifications: checked })}
                data-testid="switch-new-user-notifications"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="courseCompletionNotifications">Course Completion Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when users complete courses
                </p>
              </div>
              <Switch
                id="courseCompletionNotifications"
                checked={settings.courseCompletionNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, courseCompletionNotifications: checked })}
                data-testid="switch-course-completion-notifications"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-admin/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold">Security Settings</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Users must verify email before accessing platform
                </p>
              </div>
              <Switch
                id="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
                data-testid="switch-email-verification"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Database Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-admin/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold">Database Settings</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoBackup">Automatic Backups</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically backup database daily
                </p>
              </div>
              <Switch
                id="autoBackup"
                checked={settings.autoBackup}
                onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
                data-testid="switch-auto-backup"
              />
            </div>

            <Separator />

            <div className="flex gap-4">
              <Button variant="outline" data-testid="button-export-data">
                <Database className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" data-testid="button-view-logs">
                View System Logs
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          size="lg"
          className="bg-gradient-admin text-white"
          onClick={handleSave}
          data-testid="button-save-settings"
        >
          <Save className="w-4 h-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
