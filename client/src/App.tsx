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
const Services = lazy(() => import("@/pages/services"));
const Sell = lazy(() => import("@/pages/sell"));
const Invest = lazy(() => import("@/pages/invest"));
const Projects = lazy(() => import("@/pages/projects"));
const ProjectDetail = lazy(() => import("@/pages/project-detail"));
const Calculators = lazy(() => import("@/pages/calculators"));
const Resources = lazy(() => import("@/pages/resources"));
const ArticleDetail = lazy(() => import("@/pages/article-detail"));
const Dreamspace = lazy(() => import("@/pages/dreamspace"));
const Contact = lazy(() => import("@/pages/contact"));
const HQ = lazy(() => import("@/pages/hq"));
const Wholesale = lazy(() => import("@/pages/wholesale"));
const Buyers = lazy(() => import("@/pages/buyers"));
const Buy = lazy(() => import("@/pages/buy"));
const PortalSelect = lazy(() => import("@/pages/portal-select"));
const InvestorPortal = lazy(() => import("@/pages/investor-portal"));
const WholesalerPortal = lazy(() => import("@/pages/wholesaler-portal"));
const BuyerPortal = lazy(() => import("@/pages/buyer-portal"));
const DreamscaperPortal = lazy(() => import("@/pages/dreamscaper-portal"));
const Community = lazy(() => import("@/pages/community"));
const CapitalRaising = lazy(() => import("@/pages/capital-raising"));
const DealflowOffice = lazy(() => import("@/pages/dealflow-office"));
const DealflowDeals = lazy(() => import("@/pages/dealflow-deals"));
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
const Partner = lazy(() => import("@/pages/partner"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const MarketplaceDeals = lazy(() => import("@/pages/marketplace-deals"));
const MarketplaceDealDetail = lazy(() => import("@/pages/marketplace-deal-detail"));
const MarketplaceCapital = lazy(() => import("@/pages/marketplace-capital"));
const MarketplaceCapitalDetail = lazy(() => import("@/pages/marketplace-capital-detail"));
const MarketplaceProperties = lazy(() => import("@/pages/marketplace-properties"));
const MarketplacePropertyDetail = lazy(() => import("@/pages/marketplace-property-detail"));
const MarketplaceCalculators = lazy(() => import("@/pages/marketplace-calculators"));
const MarketplaceResources = lazy(() => import("@/pages/marketplace-resources"));
const SubmitDeal = lazy(() => import("@/pages/submit-deal"));
const MarketflowSubmit = lazy(() => import("@/pages/marketflow-submit"));
const MarketflowDeals = lazy(() => import("@/pages/marketflow-deals"));
const MarketflowNegotiate = lazy(() => import("@/pages/marketflow-negotiate"));
const MarketflowDashboard = lazy(() => import("@/pages/marketflow-dashboard"));
const MyDealsPage = lazy(() => import("@/pages/my-deals"));
const OfferStudioPage = lazy(() => import("@/pages/offer-studio"));
const AnalyticsPage = lazy(() => import("@/pages/analytics"));
const MyAnalyticsPage = lazy(() => import("@/pages/my-analytics"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));

const legacyRedirects: [string, string][] = [
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
      <Route path="/services" component={Services} />
      <Route path="/sell" component={Sell} />
      <Route path="/invest" component={Invest} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/:slug" component={ProjectDetail} />
      <Route path="/calculators" component={Calculators} />
      <Route path="/resources" component={Resources} />
      <Route path="/resources/:slug" component={ArticleDetail} />
      <Route path="/wholesale" component={Wholesale} />
      <Route path="/buyers" component={Buyers} />
      <Route path="/buy" component={Buy} />
      <Route path="/dreamspace" component={Dreamspace} />
      <Route path="/contact" component={Contact} />
      <Route path="/partner" component={Partner} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/submit-deal" component={SubmitDeal} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/capital-raising" component={CapitalRaising} />
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
      <ThemeProvider defaultTheme="light" storageKey="pegasus-ui-theme">
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
                        <div className="min-h-screen flex flex-col bg-background text-foreground">
                          <Navigation />
                          <main className="flex-1">
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
