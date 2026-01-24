import { ReactNode } from "react";
import { NavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, TrendingUp, Upload, BookOpen, Settings, User, LogOut, BookMarked, BarChart3 } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { AIAssistantFAB } from "@/components/AIAssistantFAB";
import logo from "@/assets/tradenotes-logo-new-transparent.png";
export function Layout({
  children
}: {
  children: ReactNode;
}) {
  const {
    t
  } = useTranslation();
  const {
    signOut
  } = useAuth();
  const {
    displayName
  } = useProfile();
  const navItems = [{
    title: t("nav.dashboard"),
    url: "/dashboard",
    icon: LayoutDashboard
  }, {
    title: t("nav.trades"),
    url: "/dashboard/trades",
    icon: TrendingUp
  }, {
    title: t("nav.import"),
    url: "/dashboard/import",
    icon: Upload
  }, {
    title: t("nav.reports"),
    url: "/dashboard/reports",
    icon: BarChart3
  }, {
    title: t("nav.journal"),
    url: "/dashboard/journal",
    icon: BookOpen
  }, {
    title: t("nav.glossary"),
    url: "/dashboard/glossary",
    icon: BookMarked
  }, {
    title: t("nav.account"),
    url: "/dashboard/account",
    icon: User
  }, {
    title: t("nav.settings"),
    url: "/dashboard/settings",
    icon: Settings
  }];
  return <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent>
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3 mb-2">
              <img src={logo} alt="TradeNot.es Logo" className="h-24 w-24 drop-shadow-[0_0_15px_hsl(158,100%,45%,0.4)]" />
              <h1 className="text-xl font-bold text-sidebar-foreground">TradeNot.es</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("nav.welcome", {
                name: displayName
              })}
            </p>
          </div>
            <SidebarMenu className="p-2 rounded-sm">
              {navItems.map(item => <SidebarMenuItem key={item.url}>
                     <NavLink to={item.url} end={item.url === "/dashboard"} className={({
                  isActive
                }) => isActive ? "flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground transition-all border-l-4 border-r-4 border-primary" : "flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-all border-l-4 border-r-4 border-transparent"}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                </SidebarMenuItem>)}
            </SidebarMenu>
            <div className="mt-auto p-4 border-t border-sidebar-border">
              <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-3" />
                {t("nav.logout")}
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 flex flex-col overflow-auto">
          <main className="flex-1 p-6">{children}</main>
          <footer className="px-6 py-4 border-t border-border/50">
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <Link to="/datenschutz" className="hover:text-foreground transition-colors">
                {t("landing.footerPrivacy")}
              </Link>
              <span className="text-border">•</span>
              <Link to="/agb" className="hover:text-foreground transition-colors">
                {t("landing.footerTerms")}
              </Link>
              <span className="text-border">•</span>
              <Link to="/impressum" className="hover:text-foreground transition-colors">
                {t("landing.footerImprint")}
              </Link>
            </div>
          </footer>
        </div>
        <AIAssistantFAB />
      </div>
    </SidebarProvider>;
}