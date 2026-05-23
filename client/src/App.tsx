import { useEffect, Suspense, lazy } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { PeggyProvider } from "@/contexts/peggy-context";
import { PeggyDock } from "@/components/peggy-dock";
import { SupabaseAuthProvider } from "@/contexts/supabase-auth-context";
import { DealActionProvider } from "@/contexts/deal-action-context";
import { DemoModeProvider } from "@/contexts/demo-mode-context";
import { ErrorBoundary, PageLoader } from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import { NotificationProvider } from "@/contexts/notification-context";
import { SiteContentProvider } from "@/contexts/site-content-context";
import { EditModeProvider } from "@/contexts/edit-mode-context";
import { AdminBar } from "@/components/AdminBar";
import { AnonymousClaimWatcher } from "@/components/anonymous-claim-watcher";
import { AuthGuard } from "@/components/auth-guard";

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  
  return null;
}
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Signup from "@/pages/signup";

const About = lazy(() => import("@/pages/about"));
const Development = lazy(() => import("@/pages/development"));
const Sell = lazy(() => import("@/pages/sell"));
const Invest = lazy(() => import("@/pages/invest"));
const Projects = lazy(() => import("@/pages/projects"));
const ProjectDetail = lazy(() => import("@/pages/project-detail"));
const Calculators = lazy(() => import("@/pages/calculators"));
const StrategyLab = lazy(() => import("@/pages/strategy-lab"));
const StrategyLabLibrary = lazy(() => import("@/pages/strategy-lab-library"));
const StrategyLabSubmitted = lazy(() => import("@/pages/strategy-lab-submitted"));
const StrategyLabBlueprintConfirmed = lazy(() => import("@/pages/strategy-lab-blueprint-confirmed"));
const AdminStrategyLab = lazy(() => import("@/pages/admin-strategy-lab"));
const AdminVendors = lazy(() => import("@/pages/admin-vendors"));
const SnapshotProperty = lazy(() => import("@/pages/snapshot-property"));
const Resources = lazy(() => import("@/pages/resources"));
const Library = lazy(() => import("@/pages/library"));
const ArticleDetail = lazy(() => import("@/pages/article-detail"));
const SubmitPage = lazy(() => import("@/pages/submit"));
const CapitalPage = lazy(() => import("@/pages/capital"));
const ConnectPage = lazy(() => import("@/pages/connect"));
const NelsonDrPage = lazy(() => import("@/pages/project-nelson-dr"));
const MarketflowAccess = lazy(() => import("@/pages/marketflow-access"));
const Contact = lazy(() => import("@/pages/contact"));
const DealflowProject = lazy(() => import("@/pages/dealflow-project"));
const DealflowCommunity = lazy(() => import("@/pages/dealflow-community"));
const DealflowMessages = lazy(() => import("@/pages/dealflow-messages"));
const UserProfile = lazy(() => import("@/pages/user-profile"));
const Marketplace = lazy(() => import("@/pages/marketplace"));
const MarketplaceWholesaler = lazy(() => import("@/pages/marketplace-wholesaler"));
const MarketplaceDreamscaper = lazy(() => import("@/pages/marketplace-dreamscaper"));
const MarketplaceInvestor = lazy(() => import("@/pages/marketplace-investor"));
const MarketplaceBuyer = lazy(() => import("@/pages/marketplace-buyer"));
const MarketplaceAdmin = lazy(() => import("@/pages/marketplace-admin"));
const MarketplaceDealDetail = lazy(() => import("@/pages/marketplace-deal-detail"));
const MarketplaceCapital = lazy(() => import("@/pages/marketplace-capital"));
const MarketplaceCapitalDetail = lazy(() => import("@/pages/marketplace-capital-detail"));
const MarketplaceProperties = lazy(() => import("@/pages/marketplace-properties"));
const MarketplacePropertyDetail = lazy(() => import("@/pages/marketplace-property-detail"));
const MarketplaceCalculators = lazy(() => import("@/pages/marketplace-calculators"));
const MarketplaceResources = lazy(() => import("@/pages/marketplace-resources"));
const MarketflowSubmit = lazy(() => import("@/pages/marketflow-submit"));
const MarketflowDeals = lazy(() => import("@/pages/marketflow-deals"));
const MarketflowNegotiate = lazy(() => import("@/pages/marketflow-negotiate"));
const MarketflowDashboard = lazy(() => import("@/pages/marketflow-dashboard"));
const MyDealsPage = lazy(() => import("@/pages/my-deals"));
const OfferStudioPage = lazy(() => import("@/pages/offer-studio"));
const MarketflowOfferStudio = lazy(() => import("@/pages/marketflow/offer-studio"));
const AnalyticsPage = lazy(() => import("@/pages/analytics"));
const MyAnalyticsPage = lazy(() => import("@/pages/my-analytics"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const Disclosures = lazy(() => import("@/pages/disclosures"));
const SnapshotStatus = lazy(() => import("@/pages/snapshot-status"));
const SnapshotCalc = lazy(() => import("@/pages/snapshot-calc"));
const SnapshotCalcGate = lazy(() => import("@/pages/snapshot-calc-gate"));
const DealBlueprint = lazy(() => import("@/pages/deal-blueprint"));
const VendorNetwork = lazy(() => import("@/pages/vendor-network"));
const Systems = lazy(() => import("@/pages/systems"));
const Education = lazy(() => import("@/pages/education"));

const legacyRedirects: [string, string][] = [
  // Empire Doctrine v1.0.1 Foundation Reset: /submit is canonical; the
  // old funnel routes (/sell, /submit-deal, /submit-property, /wholesale)
  // all collapse into /submit with their intent preserved via query.
  // Mirror of server LEGACY_REDIRECTS for SPA-internal navigation only.
  // Server-side 301s / 410s are authoritative for direct HTTP hits.
  ["/sell", "/submit?intent=sell"],
  ["/submit-deal", "/submit?intent=deal-jv"],
  ["/submit-property", "/submit?intent=property"],
  ["/services", "/development"],
  ["/resources", "/library"],
  ["/buy", "/marketflow"],
  ["/partner", "/capital"],
  ["/invest", "/capital"],
  ["/dealflow/hq", "/marketflow/admin"],
  ["/hq", "/marketflow/admin"],
  ["/portal", "/marketflow"],
  ["/portal/investor", "/marketflow/investor"],
  ["/portal/wholesaler", "/marketflow/wholesaler"],
  ["/portal/buyer", "/marketflow/buyer"],
  ["/portal/dreamscaper", "/marketflow/dreamscaper"],
  ["/community", "/marketflow/community"],
  ["/dealflow", "/marketflow"],
  ["/dealflow/office", "/marketflow"],
  ["/dealflow/deals", "/marketflow/deals"],
  ["/dealflow/community", "/marketflow/community"],
  ["/dealflow/messages", "/marketflow/messages"],
  ["/marketplace", "/marketflow"],
  ["/marketplace/wholesaler/:rest*", "/marketflow/wholesaler"],
  ["/marketplace/wholesaler", "/marketflow/wholesaler"],
  ["/marketplace/dreamscaper/:rest*", "/marketflow/dreamscaper"],
  ["/marketplace/dreamscaper", "/marketflow/dreamscaper"],
  ["/marketplace/investor/:rest*", "/marketflow/investor"],
  ["/marketplace/investor", "/marketflow/investor"],
  ["/marketplace/buyer/:rest*", "/marketflow/buyer"],
  ["/marketplace/buyer", "/marketflow/buyer"],
  ["/marketplace/admin/:rest*", "/marketflow/admin"],
  ["/marketplace/admin", "/marketflow/admin"],
  ["/marketplace/discover", "/marketflow/deals"],
  ["/marketplace/calculators", "/marketflow/calculators"],
  ["/marketplace/resources", "/marketflow/resources"],
  ["/marketplace/community", "/marketflow/community"],
  ["/marketplace/messages", "/marketflow/messages"],
  ["/marketplace/deals/:id", "/marketflow/deals"],
  ["/marketplace/deals", "/marketflow/deals"],
  ["/marketplace/capital/:id", "/marketflow/capital"],
  ["/marketplace/capital", "/marketflow/capital"],
  ["/marketplace/properties/:id", "/marketflow/properties"],
  ["/marketplace/properties", "/marketflow/properties"],
];

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/about" component={About} />
      <Route path="/development" component={Development} />
      {/* Empire Doctrine v1.0.1 — canonical submission route. */}
      <Route path="/submit" component={SubmitPage} />
      <Route path="/capital" component={CapitalPage} />
      <Route path="/connect" component={ConnectPage} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/nelson-dr" component={NelsonDrPage} />
      <Route path="/projects/:slug" component={ProjectDetail} />
      <Route path="/strategy-lab" component={StrategyLab} />
      <Route path="/strategy-lab/library" component={StrategyLabLibrary} />
      <Route path="/strategy-lab/submitted" component={StrategyLabSubmitted} />
      <Route path="/strategy-lab/blueprint-confirmed" component={StrategyLabBlueprintConfirmed} />
      <Route path="/admin/strategy-lab" component={AdminStrategyLab} />
      <Route path="/admin/vendors" component={AdminVendors} />
      <Route path="/strategy-lab/classic" component={Calculators} />
      {/* /library is canonical; /resources 301s to /library via legacyRedirects.
       * /library/:slug keeps the existing article shell working. */}
      <Route path="/library" component={Library} />
      <Route path="/library/:slug" component={ArticleDetail} />
      <Route path="/strategy-library">{() => <Redirect to="/library" />}</Route>
      <Route path="/vendor-network" component={VendorNetwork} />
      <Route path="/contact" component={Contact} />
      {/* Empire Doctrine v1.0.1: /systems, /ecosystem, /education, /calculators,
       * /buyers, /wholesale, /capital-raising, /dreamspace are removed from
       * the public surface. /calculators not registered here (only the
       * /strategy-lab/classic alias is kept as an internal sub-route). */}
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/disclosures" component={Disclosures} />
      {/*
       * /snapshot/calc/:token is the canonical share URL. The Gate probes
       * property-analyses first (Task #84) and falls back to legacy
       * calculator-share rendering. /snapshot/property/:token is kept as
       * a permanent alias so existing v1 links remain valid.
       */}
      <Route path="/snapshot/calc/:token" component={SnapshotCalcGate} />
      <Route path="/snapshot/property/:token" component={SnapshotProperty} />
      <Route path="/snapshot/:token" component={SnapshotStatus} />
      {/* Empire Doctrine v1.0.1: /deal-blueprint is removed from the
       * public v1 surface and redirects to /strategy-lab. */}
      <Route path="/deal-blueprint">{() => <Redirect to="/strategy-lab" />}</Route>
      {/* Legacy /dashboard route. Kept as a redirect because the auth-aware
       * destination lives at /marketflow/dashboard; the role router there
       * forwards staff vs. operator vs. investor to the right surface. */}
      <Route path="/dashboard">{() => <Redirect to="/marketflow/dashboard" />}</Route>
      <Route path="/dealflow/project/:id">{() => <AuthGuard><DealflowProject /></AuthGuard>}</Route>
      
      {/* Legacy route redirects to MarketFlow - consolidated for maintainability */}
      {legacyRedirects.map(([from, to]) => (
        <Route key={from} path={from}>{() => <Redirect to={to} />}</Route>
      ))}
      
      {/* MarketFlow Routes with Supabase Auth */}
      <Route path="/marketflow" component={Marketplace} />
      <Route path="/marketflow/access" component={MarketflowAccess} />
      <Route path="/marketflow/wholesaler/:rest*">{() => <AuthGuard><MarketplaceWholesaler /></AuthGuard>}</Route>
      <Route path="/marketflow/wholesaler">{() => <AuthGuard><MarketplaceWholesaler /></AuthGuard>}</Route>
      <Route path="/marketflow/dreamscaper/:rest*">{() => <AuthGuard><MarketplaceDreamscaper /></AuthGuard>}</Route>
      <Route path="/marketflow/dreamscaper">{() => <AuthGuard><MarketplaceDreamscaper /></AuthGuard>}</Route>
      <Route path="/marketflow/investor/:rest*">{() => <AuthGuard><MarketplaceInvestor /></AuthGuard>}</Route>
      <Route path="/marketflow/investor">{() => <AuthGuard><MarketplaceInvestor /></AuthGuard>}</Route>
      <Route path="/marketflow/buyer/:rest*">{() => <AuthGuard><MarketplaceBuyer /></AuthGuard>}</Route>
      <Route path="/marketflow/buyer">{() => <AuthGuard><MarketplaceBuyer /></AuthGuard>}</Route>
      <Route path="/marketflow/admin/:rest*">{() => <AuthGuard><MarketplaceAdmin /></AuthGuard>}</Route>
      <Route path="/marketflow/admin">{() => <AuthGuard><MarketplaceAdmin /></AuthGuard>}</Route>
      <Route path="/marketflow/discover">{() => <Redirect to="/marketflow/deals" />}</Route>
      <Route path="/marketflow/calculators">{() => <AuthGuard><MarketplaceCalculators /></AuthGuard>}</Route>
      <Route path="/marketflow/resources">{() => <AuthGuard><MarketplaceResources /></AuthGuard>}</Route>
      {/* Empire Doctrine v1.0.1 — private MarketFlow surfaces. The public
          v1 surface is /marketflow (gated landing) and /marketflow/access
          (request-access form). All dashboards / deal / capital / property
          / negotiate / offer-studio routes are operator surfaces and
          must be behind AuthGuard so unauthenticated users cannot render
          them. */}
      <Route path="/marketflow/community">{() => <AuthGuard><DealflowCommunity /></AuthGuard>}</Route>
      <Route path="/marketflow/messages">{() => <AuthGuard><DealflowMessages /></AuthGuard>}</Route>
      <Route path="/marketflow/deals">{() => <AuthGuard><MarketflowDeals /></AuthGuard>}</Route>
      <Route path="/marketflow/deals/:id">{() => <AuthGuard><MarketplaceDealDetail /></AuthGuard>}</Route>
      <Route path="/marketflow/capital">{() => <AuthGuard><MarketplaceCapital /></AuthGuard>}</Route>
      <Route path="/marketflow/capital/:id">{() => <AuthGuard><MarketplaceCapitalDetail /></AuthGuard>}</Route>
      <Route path="/marketflow/properties">{() => <AuthGuard><MarketplaceProperties /></AuthGuard>}</Route>
      <Route path="/marketflow/properties/:id">{() => <AuthGuard><MarketplacePropertyDetail /></AuthGuard>}</Route>
      <Route path="/marketflow/submit">{() => <AuthGuard><MarketflowSubmit /></AuthGuard>}</Route>
      <Route path="/marketflow/deals/:id/negotiate">{() => <AuthGuard><MarketflowNegotiate /></AuthGuard>}</Route>
      <Route path="/marketflow/negotiate/:lane/:id">{() => <AuthGuard><MarketflowNegotiate /></AuthGuard>}</Route>
      <Route path="/marketflow/dashboard">{() => <AuthGuard><MarketflowDashboard /></AuthGuard>}</Route>
      <Route path="/marketflow/my-deals">{() => <AuthGuard><MyDealsPage /></AuthGuard>}</Route>
      <Route path="/marketflow/analytics">{() => <AuthGuard><AnalyticsPage /></AuthGuard>}</Route>
      <Route path="/marketflow/my-analytics">{() => <AuthGuard><MyAnalyticsPage /></AuthGuard>}</Route>

      {/* Offer Studio - Full page deal offer experience (operator-only) */}
      <Route path="/marketflow/offer-studio/:dealId">{() => <AuthGuard><MarketflowOfferStudio /></AuthGuard>}</Route>
      <Route path="/offer-studio/:dealType/:dealId">{() => <AuthGuard><OfferStudioPage /></AuthGuard>}</Route>
      
      <Route path="/profile/:userId">{() => <AuthGuard><UserProfile /></AuthGuard>}</Route>
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="pegasus-ui-theme">
        <SupabaseAuthProvider>
          <SiteContentProvider>
            <EditModeProvider>
              <DemoModeProvider>
                <TooltipProvider>
                  <DealActionProvider>
                    <PeggyProvider>
                      <NotificationProvider>
                        <ScrollToTop />
                        <AdminBar />
                        <AnonymousClaimWatcher />
                        <div className="min-h-screen flex flex-col bg-background text-foreground">
                          <a href="#main-content" className="skip-to-content">Skip to main content</a>
                          <Navigation />
                          <main id="main-content" className="flex-1" tabIndex={-1}>
                            <ErrorBoundary>
                              <Router />
                            </ErrorBoundary>
                          </main>
                          <Footer />
                        </div>
                        <PeggyDock />
                        <Toaster />
                      </NotificationProvider>
                    </PeggyProvider>
                  </DealActionProvider>
                </TooltipProvider>
              </DemoModeProvider>
            </EditModeProvider>
          </SiteContentProvider>
        </SupabaseAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
