import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useSearchParams } from "react-router-dom";
import { ThemeProvider } from "./hooks/useTheme";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { GoalAlertsProvider } from "./components/GoalAlertsProvider";
import { featureFlags } from "./config/featureFlags";
// the landing page is the usual entry, everything else is loaded when it is opened
import Landing from "./pages/Landing";
const PreLaunch = lazy(() => import("./pages/PreLaunch"));
const Index = lazy(() => import("./pages/Index"));
const Trades = lazy(() => import("./pages/Trades"));
const Days = lazy(() => import("./pages/Days"));
const Import = lazy(() => import("./pages/Import"));
const Journal = lazy(() => import("./pages/Journal"));
const Settings = lazy(() => import("./pages/Settings"));
const Account = lazy(() => import("./pages/Account"));
const Glossary = lazy(() => import("./pages/Glossary"));
const Reports = lazy(() => import("./pages/Reports"));
const Auth = lazy(() => import("./pages/Auth"));
const Kontakt = lazy(() => import("./pages/Kontakt"));
const Hilfe = lazy(() => import("./pages/Hilfe"));
const Status = lazy(() => import("./pages/Status"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));
const AGB = lazy(() => import("./pages/AGB"));
const Impressum = lazy(() => import("./pages/Impressum"));
const SharedTrade = lazy(() => import("./pages/SharedTrade"));
const NotFound = lazy(() => import("./pages/NotFound"));
const WhyJournal = lazy(() => import("./pages/WhyJournal"));
const Features = lazy(() => import("./pages/Features"));

const queryClient = new QueryClient();

// shown while a page's code is loading
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

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
  <Suspense fallback={<PageLoading />}>
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
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <GoalAlertsProvider>
                    <Layout>
                      {/* inside the layout, so the sidebar stays while a page loads */}
                      <Suspense fallback={<PageLoading />}>
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
                      </Suspense>
                    </Layout>
                  </GoalAlertsProvider>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  </Suspense>
);

export default App;
