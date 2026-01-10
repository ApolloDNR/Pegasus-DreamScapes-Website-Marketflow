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
import OfferStudioPage from "@/pages/offer-studio";
import AnalyticsPage from "@/pages/analytics";
import MyAnalyticsPage from "@/pages/my-analytics";
import NotFound from "@/pages/not-found";

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
      {/* Legacy HQ routes redirect to marketflow admin */}
      <Route path="/dealflow/hq">{() => <Redirect to="/marketflow/admin" />}</Route>
      <Route path="/hq">{() => <Redirect to="/marketflow/admin" />}</Route>
      
      {/* Legacy portal routes redirect to marketflow */}
      <Route path="/portal">{() => <Redirect to="/marketflow" />}</Route>
      <Route path="/portal/investor">{() => <Redirect to="/marketflow/investor" />}</Route>
      <Route path="/portal/wholesaler">{() => <Redirect to="/marketflow/wholesaler" />}</Route>
      <Route path="/portal/buyer">{() => <Redirect to="/marketflow/buyer" />}</Route>
      <Route path="/portal/dreamscaper">{() => <Redirect to="/marketflow/dreamscaper" />}</Route>
      <Route path="/capital-raising" component={CapitalRaising} />
      <Route path="/community">{() => <Redirect to="/marketflow/community" />}</Route>
      
      {/* Legacy /dealflow routes redirect to /marketflow */}
      <Route path="/dealflow">{() => <Redirect to="/marketflow" />}</Route>
      <Route path="/dealflow/office">{() => <Redirect to="/marketflow" />}</Route>
      <Route path="/dealflow/deals">{() => <Redirect to="/marketflow/deals" />}</Route>
      <Route path="/dealflow/project/:id" component={DealflowProject} />
      <Route path="/dealflow/community">{() => <Redirect to="/marketflow/community" />}</Route>
      <Route path="/dealflow/messages">{() => <Redirect to="/marketflow/messages" />}</Route>
      
      {/* Legacy /marketplace routes redirect to /marketflow */}
      <Route path="/marketplace">{() => <Redirect to="/marketflow" />}</Route>
      <Route path="/marketplace/wholesaler/:rest*">{() => <Redirect to="/marketflow/wholesaler" />}</Route>
      <Route path="/marketplace/wholesaler">{() => <Redirect to="/marketflow/wholesaler" />}</Route>
      <Route path="/marketplace/dreamscaper/:rest*">{() => <Redirect to="/marketflow/dreamscaper" />}</Route>
      <Route path="/marketplace/dreamscaper">{() => <Redirect to="/marketflow/dreamscaper" />}</Route>
      <Route path="/marketplace/investor/:rest*">{() => <Redirect to="/marketflow/investor" />}</Route>
      <Route path="/marketplace/investor">{() => <Redirect to="/marketflow/investor" />}</Route>
      <Route path="/marketplace/buyer/:rest*">{() => <Redirect to="/marketflow/buyer" />}</Route>
      <Route path="/marketplace/buyer">{() => <Redirect to="/marketflow/buyer" />}</Route>
      <Route path="/marketplace/admin/:rest*">{() => <Redirect to="/marketflow/admin" />}</Route>
      <Route path="/marketplace/admin">{() => <Redirect to="/marketflow/admin" />}</Route>
      <Route path="/marketplace/discover">{() => <Redirect to="/marketflow/deals" />}</Route>
      <Route path="/marketplace/calculators">{() => <Redirect to="/marketflow/calculators" />}</Route>
      <Route path="/marketplace/resources">{() => <Redirect to="/marketflow/resources" />}</Route>
      <Route path="/marketplace/community">{() => <Redirect to="/marketflow/community" />}</Route>
      <Route path="/marketplace/messages">{() => <Redirect to="/marketflow/messages" />}</Route>
      <Route path="/marketplace/deals/:id">{() => <Redirect to="/marketflow/deals" />}</Route>
      <Route path="/marketplace/deals">{() => <Redirect to="/marketflow/deals" />}</Route>
      <Route path="/marketplace/capital/:id">{() => <Redirect to="/marketflow/capital" />}</Route>
      <Route path="/marketplace/capital">{() => <Redirect to="/marketflow/capital" />}</Route>
      <Route path="/marketplace/properties/:id">{() => <Redirect to="/marketflow/properties" />}</Route>
      <Route path="/marketplace/properties">{() => <Redirect to="/marketflow/properties" />}</Route>
      
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
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
