import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, TrendingUp, Upload, BookOpen, Settings, User, LogOut, BookMarked, BarChart3 } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { AIAssistantFAB } from "@/components/AIAssistantFAB";

export function Layout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { signOut } = useAuth();

  const navItems = [
    { title: t("nav.dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("nav.trades"), url: "/dashboard/trades", icon: TrendingUp },
    { title: t("nav.import"), url: "/dashboard/import", icon: Upload },
    { title: t("nav.reports"), url: "/dashboard/reports", icon: BarChart3 },
    { title: t("nav.journal"), url: "/dashboard/journal", icon: BookOpen },
    { title: t("nav.glossary"), url: "/dashboard/glossary", icon: BookMarked },
    { title: t("nav.account"), url: "/dashboard/account", icon: User },
    { title: t("nav.settings"), url: "/dashboard/settings", icon: Settings },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <div className="p-4 border-b border-sidebar-border">
              <h1 className="text-xl font-bold text-sidebar-foreground">TradeJournal</h1>
            </div>
            <SidebarMenu className="p-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                     <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className={({ isActive }) =>
                        isActive
                          ? "flex items-center gap-3 px-3 py-2 rounded-md bg-sidebar-accent text-sidebar-accent-foreground"
                          : "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <div className="mt-auto p-4 border-t border-sidebar-border">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 mr-3" />
                {t("nav.logout")}
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
        <AIAssistantFAB />
      </div>
    </SidebarProvider>
  );
}
