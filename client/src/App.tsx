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
const SnapshotProperty = lazy(() => import("@/pages/snapshot-property"));
const Resources = lazy(() => import("@/pages/resources"));
const ArticleDetail = lazy(() => import("@/pages/article-detail"));
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
const Education = lazy(() => import("@/pages/education"));

const legacyRedirects: [string, string][] = [
  // v1.3.1 — retired public funnel pages route to their closest current destination.
  ["/wholesale", "/sell"],
  // /submit-deal preserves wholesaler/deal-JV intent via query param so
  // /sell can preselect submitter role + outcome. See Task #119.
  ["/submit-deal", "/sell?intent=deal-jv"],
  ["/services", "/development"],
  ["/buyers", "/marketflow"],
  ["/buy", "/marketflow"],
  ["/dreamspace", "/invest"],
  ["/partner", "/invest"],
  ["/capital-raising", "/invest"],
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
      <Route path="/sell" component={Sell} />
      <Route path="/invest" component={Invest} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/:slug" component={ProjectDetail} />
      <Route path="/strategy-lab" component={StrategyLab} />
      <Route path="/strategy-lab/library" component={StrategyLabLibrary} />
      <Route path="/strategy-lab/submitted" component={StrategyLabSubmitted} />
      <Route path="/strategy-lab/blueprint-confirmed" component={StrategyLabBlueprintConfirmed} />
      <Route path="/admin/strategy-lab" component={AdminStrategyLab} />
      <Route path="/strategy-lab/classic" component={Calculators} />
      <Route path="/calculators" component={Calculators} />
      <Route path="/resources" component={Resources} />
      <Route path="/education" component={Education} />
      {/* Legacy alias — keep parity with the visible "Strategy Library" nav
       * label, which now points at /resources. /education is its own page
       * (the categorized library) and is reachable from the home router. */}
      <Route path="/strategy-library">{() => <Redirect to="/resources" />}</Route>
      <Route path="/vendor-network" component={VendorNetwork} />
      <Route path="/resources/:slug" component={ArticleDetail} />
      <Route path="/contact" component={Contact} />
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
      <Route path="/deal-blueprint" component={DealBlueprint} />
      {/* Legacy /dashboard route. Kept as a redirect because the auth-aware
       * destination lives at /marketflow/dashboard; the role router there
       * forwards staff vs. operator vs. investor to the right surface. */}
      <Route path="/dashboard">{() => <Redirect to="/marketflow/dashboard" />}</Route>
      <Route path="/dealflow/project/:id" component={DealflowProject} />
      
      {/* Legacy route redirects to MarketFlow - consolidated for maintainability */}
      {legacyRedirects.map(([from, to]) => (
        <Route key={from} path={from}>{() => <Redirect to={to} />}</Route>
      ))}
      
      {/* MarketFlow Routes with Supabase Auth */}
      <Route path="/marketflow" component={Marketplace} />
      <Route path="/marketflow/wholesaler/:rest*" component={MarketplaceWholesaler} />
      <Route path="/marketflow/wholesaler" component={MarketplaceWholesaler} />
      <Route path="/marketflow/dreamscaper/:rest*" component={MarketplaceDreamscaper} />
      <Route path="/marketflow/dreamscaper" component={MarketplaceDreamscaper} />
      <Route path="/marketflow/investor/:rest*" component={MarketplaceInvestor} />
      <Route path="/marketflow/investor" component={MarketplaceInvestor} />
      <Route path="/marketflow/buyer/:rest*" component={MarketplaceBuyer} />
      <Route path="/marketflow/buyer" component={MarketplaceBuyer} />
      <Route path="/marketflow/admin/:rest*" component={MarketplaceAdmin} />
      <Route path="/marketflow/admin" component={MarketplaceAdmin} />
      <Route path="/marketflow/discover">{() => <Redirect to="/marketflow/deals" />}</Route>
      <Route path="/marketflow/calculators" component={MarketplaceCalculators} />
      <Route path="/marketflow/resources" component={MarketplaceResources} />
      <Route path="/marketflow/community" component={DealflowCommunity} />
      <Route path="/marketflow/messages" component={DealflowMessages} />
      <Route path="/marketflow/deals" component={MarketflowDeals} />
      <Route path="/marketflow/deals/:id" component={MarketplaceDealDetail} />
      <Route path="/marketflow/capital" component={MarketplaceCapital} />
      <Route path="/marketflow/capital/:id" component={MarketplaceCapitalDetail} />
      <Route path="/marketflow/properties" component={MarketplaceProperties} />
      <Route path="/marketflow/properties/:id" component={MarketplacePropertyDetail} />
      <Route path="/marketflow/submit" component={MarketflowSubmit} />
      <Route path="/marketflow/deals/:id/negotiate" component={MarketflowNegotiate} />
      <Route path="/marketflow/negotiate/:lane/:id" component={MarketflowNegotiate} />
      <Route path="/marketflow/dashboard" component={MarketflowDashboard} />
      <Route path="/marketflow/my-deals" component={MyDealsPage} />
      <Route path="/marketflow/analytics" component={AnalyticsPage} />
      <Route path="/marketflow/my-analytics" component={MyAnalyticsPage} />
      
      {/* Offer Studio - Full page deal offer experience */}
      <Route path="/marketflow/offer-studio/:dealId" component={MarketflowOfferStudio} />
      <Route path="/offer-studio/:dealType/:dealId" component={OfferStudioPage} />
      
      <Route path="/profile/:userId" component={UserProfile} />
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
