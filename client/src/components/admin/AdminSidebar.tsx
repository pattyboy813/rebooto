import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  GraduationCap,
  Wand2,
  Users,
  Mail,
  LifeBuoy,
  Bell,
  Edit3,
  BookOpen,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const menuSections = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, url: "/admin/dashboard" },
    ],
  },
  {
    label: "Content",
    items: [
      { title: "Blog Admin", icon: FileText, url: "/admin/blog" },
      { title: "Manual Course Creator", icon: Edit3, url: "/admin/courses/manual" },
      { title: "Course Editor", icon: BookOpen, url: "/admin/courses/edit" },
      { title: "AI Course Creator", icon: Wand2, url: "/admin/courses/create" },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "User Management", icon: Users, url: "/admin/users" },
      { title: "Email Sender", icon: Mail, url: "/admin/email" },
      { title: "Support Logs", icon: LifeBuoy, url: "/admin/support" },
      { title: "Notices", icon: Bell, url: "/admin/notices" },
    ],
  },
];

export function AdminSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Rebooto
            </h2>
            <p className="text-xs text-gray-500">Admin Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.url}
                      data-testid={`sidebar-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 p-4">
        <Link href="/app/dashboard">
          <Button variant="ghost" className="w-full justify-start gap-2" data-testid="button-exit-admin">
            <LogOut className="h-4 w-4" />
            Exit Admin
          </Button>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
