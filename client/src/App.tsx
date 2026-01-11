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

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  
  return null;
}
import Home from "@/pages/home";
import About from "@/pages/about";
import Services from "@/pages/services";
import Sell from "@/pages/sell";
import Invest from "@/pages/invest";
import Projects from "@/pages/projects";
import ProjectDetail from "@/pages/project-detail";
import Calculators from "@/pages/calculators";
import Resources from "@/pages/resources";
import ArticleDetail from "@/pages/article-detail";
import Dreamspace from "@/pages/dreamspace";
import Contact from "@/pages/contact";
import HQ from "@/pages/hq";
import Wholesale from "@/pages/wholesale";
import Buyers from "@/pages/buyers";
import Buy from "@/pages/buy";
import PortalSelect from "@/pages/portal-select";
import InvestorPortal from "@/pages/investor-portal";
import WholesalerPortal from "@/pages/wholesaler-portal";
import BuyerPortal from "@/pages/buyer-portal";
import DreamscaperPortal from "@/pages/dreamscaper-portal";
import Community from "@/pages/community";
import CapitalRaising from "@/pages/capital-raising";
import DealflowOffice from "@/pages/dealflow-office";
import DealflowDeals from "@/pages/dealflow-deals";
import DealflowProject from "@/pages/dealflow-project";
import DealflowCommunity from "@/pages/dealflow-community";
import DealflowMessages from "@/pages/dealflow-messages";
import UserProfile from "@/pages/user-profile";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Marketplace from "@/pages/marketplace";
import MarketplaceWholesaler from "@/pages/marketplace-wholesaler";
import MarketplaceDreamscaper from "@/pages/marketplace-dreamscaper";
import MarketplaceInvestor from "@/pages/marketplace-investor";
import MarketplaceBuyer from "@/pages/marketplace-buyer";
import MarketplaceAdmin from "@/pages/marketplace-admin";
import Partner from "@/pages/partner";
import Dashboard from "@/pages/dashboard";
import MarketplaceDeals from "@/pages/marketplace-deals";
import MarketplaceDealDetail from "@/pages/marketplace-deal-detail";
import MarketplaceCapital from "@/pages/marketplace-capital";
import MarketplaceCapitalDetail from "@/pages/marketplace-capital-detail";
import MarketplaceProperties from "@/pages/marketplace-properties";
import MarketplacePropertyDetail from "@/pages/marketplace-property-detail";
import MarketplaceCalculators from "@/pages/marketplace-calculators";
import MarketplaceResources from "@/pages/marketplace-resources";
import SubmitDeal from "@/pages/submit-deal";
import MarketflowSubmit from "@/pages/marketflow-submit";
import MarketflowDeals from "@/pages/marketflow-deals";
import MarketflowNegotiate from "@/pages/marketflow-negotiate";
import MarketflowDashboard from "@/pages/marketflow-dashboard";
import MyDealsPage from "@/pages/my-deals";
import OfferStudioPage from "@/pages/offer-studio";
import AnalyticsPage from "@/pages/analytics";
import MyAnalyticsPage from "@/pages/my-analytics";
import NotFound from "@/pages/not-found";

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
      <Route path="/marketflow/dashboard" component={MarketflowDashboard} />
      <Route path="/marketflow/my-deals" component={MyDealsPage} />
      <Route path="/marketflow/analytics" component={AnalyticsPage} />
      <Route path="/marketflow/my-analytics" component={MyAnalyticsPage} />
      
      {/* Offer Studio - Full page deal offer experience */}
      <Route path="/offer-studio/:dealType/:dealId" component={OfferStudioPage} />
      
      <Route path="/profile/:userId" component={UserProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <DemoModeProvider>
          <TooltipProvider>
            <DealActionProvider>
              <PeggyProvider>
                <ScrollToTop />
                <div className="min-h-screen flex flex-col">
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
              </PeggyProvider>
            </DealActionProvider>
          </TooltipProvider>
        </DemoModeProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
