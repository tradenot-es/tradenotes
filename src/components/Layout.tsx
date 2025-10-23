import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Upload, BookOpen, Settings, LogOut } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Trades", url: "/trades", icon: TrendingUp },
  { title: "Import", url: "/import", icon: Upload },
  { title: "Journal", url: "/journal", icon: BookOpen },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function Layout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();

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
                      end={item.url === "/"}
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
                Abmelden
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
