import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useSearchParams } from "react-router-dom";
import { ThemeProvider } from "./hooks/useTheme";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CookieConsent } from "./components/CookieConsent";
import { GoalAlertsProvider } from "./components/GoalAlertsProvider";
import { featureFlags } from "./config/featureFlags";
import Landing from "./pages/Landing";
import PreLaunch from "./pages/PreLaunch";
import Index from "./pages/Index";
import Trades from "./pages/Trades";
import Days from "./pages/Days";
import Import from "./pages/Import";
import Journal from "./pages/Journal";
import Settings from "./pages/Settings";
import Account from "./pages/Account";
import Glossary from "./pages/Glossary";
import Reports from "./pages/Reports";
import Auth from "./pages/Auth";
import Kontakt from "./pages/Kontakt";
import Hilfe from "./pages/Hilfe";
import Status from "./pages/Status";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";
import Impressum from "./pages/Impressum";
import SharedTrade from "./pages/SharedTrade";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import NotFound from "./pages/NotFound";
import WhyJournal from "./pages/WhyJournal";
import Features from "./pages/Features";

const queryClient = new QueryClient();

// Conditional Home Route based on feature flags
// Secret preview parameter: ?preview=landing to bypass PreLaunch mode
const HomeRoute = () => {
  const [searchParams] = useSearchParams();
  const previewMode = searchParams.get("preview");
  
  // Allow preview of landing page with secret parameter
  if (previewMode === "landing") return <Landing />;
  
  if (featureFlags.MAINTENANCE_MODE) return <PreLaunch mode="maintenance" />;
  if (featureFlags.PRELAUNCH_MODE) return <PreLaunch mode="prelaunch" />;
  return <Landing />;
};

const App = () => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="tradenotes-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/features" element={<Features />} />
            <Route path="/warum-trading-journal" element={<WhyJournal />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/kontakt" element={<Kontakt />} />
            <Route path="/hilfe" element={<Hilfe />} />
            <Route path="/status" element={<Status />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="/agb" element={<AGB />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/share/:token" element={<SharedTrade />} />
            <Route path="/checkout-success" element={<CheckoutSuccess />} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <GoalAlertsProvider>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/trades" element={<Trades />} />
                        <Route path="/days" element={<Days />} />
                        <Route path="/import" element={<Import />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/journal" element={<Journal />} />
                        <Route path="/account" element={<Account />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/glossary" element={<Glossary />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </GoalAlertsProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </Suspense>
);

export default App;
