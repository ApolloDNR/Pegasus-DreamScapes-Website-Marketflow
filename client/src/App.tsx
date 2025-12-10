import { useEffect } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { PeggyProvider } from "@/contexts/peggy-context";
import { PeggyChatBubble } from "@/components/peggy-chat";
import { SupabaseAuthProvider } from "@/contexts/supabase-auth-context";

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
import MarketplaceDiscover from "@/pages/marketplace-discover";
import MarketplaceCalculators from "@/pages/marketplace-calculators";
import MarketplaceResources from "@/pages/marketplace-resources";
import SubmitDeal from "@/pages/submit-deal";
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
      {/* Legacy HQ routes redirect to marketplace admin */}
      <Route path="/dealflow/hq">{() => <Redirect to="/marketplace/admin" />}</Route>
      <Route path="/hq">{() => <Redirect to="/marketplace/admin" />}</Route>
      
      {/* Legacy portal routes redirect to marketplace */}
      <Route path="/portal">{() => <Redirect to="/marketplace" />}</Route>
      <Route path="/portal/investor">{() => <Redirect to="/marketplace/investor" />}</Route>
      <Route path="/portal/wholesaler">{() => <Redirect to="/marketplace/wholesaler" />}</Route>
      <Route path="/portal/buyer">{() => <Redirect to="/marketplace/buyer" />}</Route>
      <Route path="/portal/dreamscaper">{() => <Redirect to="/marketplace/dreamscaper" />}</Route>
      <Route path="/capital-raising" component={CapitalRaising} />
      <Route path="/community">{() => <Redirect to="/marketplace/community" />}</Route>
      
      {/* Legacy /dealflow routes redirect to /marketplace */}
      <Route path="/dealflow">{() => <Redirect to="/marketplace" />}</Route>
      <Route path="/dealflow/office">{() => <Redirect to="/marketplace" />}</Route>
      <Route path="/dealflow/hq">{() => <Redirect to="/marketplace/admin" />}</Route>
      <Route path="/dealflow/deals">{() => <Redirect to="/marketplace/discover" />}</Route>
      <Route path="/dealflow/project/:id" component={DealflowProject} />
      <Route path="/dealflow/community">{() => <Redirect to="/marketplace/community" />}</Route>
      <Route path="/dealflow/messages">{() => <Redirect to="/marketplace/messages" />}</Route>
      
      {/* New Marketplace Routes with Supabase Auth */}
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/marketplace/wholesaler/:rest*" component={MarketplaceWholesaler} />
      <Route path="/marketplace/wholesaler" component={MarketplaceWholesaler} />
      <Route path="/marketplace/dreamscaper/:rest*" component={MarketplaceDreamscaper} />
      <Route path="/marketplace/dreamscaper" component={MarketplaceDreamscaper} />
      <Route path="/marketplace/investor/:rest*" component={MarketplaceInvestor} />
      <Route path="/marketplace/investor" component={MarketplaceInvestor} />
      <Route path="/marketplace/buyer/:rest*" component={MarketplaceBuyer} />
      <Route path="/marketplace/buyer" component={MarketplaceBuyer} />
      <Route path="/marketplace/admin/:rest*" component={MarketplaceAdmin} />
      <Route path="/marketplace/admin" component={MarketplaceAdmin} />
      <Route path="/marketplace/discover" component={MarketplaceDiscover} />
      <Route path="/marketplace/calculators" component={MarketplaceCalculators} />
      <Route path="/marketplace/resources" component={MarketplaceResources} />
      <Route path="/marketplace/community" component={DealflowCommunity} />
      <Route path="/marketplace/messages" component={DealflowMessages} />
      <Route path="/marketplace/deals" component={MarketplaceDeals} />
      <Route path="/marketplace/deals/:id" component={MarketplaceDealDetail} />
      <Route path="/marketplace/capital" component={MarketplaceCapital} />
      <Route path="/marketplace/capital/:id" component={MarketplaceCapitalDetail} />
      <Route path="/marketplace/properties" component={MarketplaceProperties} />
      <Route path="/marketplace/properties/:id" component={MarketplacePropertyDetail} />
      
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
          <PeggyProvider>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-1">
                <Router />
              </main>
              <Footer />
            </div>
            <PeggyChatBubble />
            <Toaster />
          </PeggyProvider>
        </TooltipProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
