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
import Community from "@/pages/community";
import CapitalRaising from "@/pages/capital-raising";
import DealflowOffice from "@/pages/dealflow-office";
import DealflowDeals from "@/pages/dealflow-deals";
import DealflowProject from "@/pages/dealflow-project";
import DealflowCommunity from "@/pages/dealflow-community";
import DealflowMessages from "@/pages/dealflow-messages";
import UserProfile from "@/pages/user-profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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
      <Route path="/dealflow/hq" component={HQ} />
      <Route path="/hq">{() => <Redirect to="/dealflow/hq" />}</Route>
      <Route path="/portal" component={PortalSelect} />
      <Route path="/portal/investor">{() => <Redirect to="/dealflow/office" />}</Route>
      <Route path="/portal/wholesaler">{() => <Redirect to="/dealflow/office" />}</Route>
      <Route path="/portal/buyer">{() => <Redirect to="/dealflow/office" />}</Route>
      <Route path="/capital-raising" component={CapitalRaising} />
      <Route path="/community">{() => <Redirect to="/dealflow/community" />}</Route>
      <Route path="/dealflow">{() => <Redirect to="/dealflow/office" />}</Route>
      <Route path="/dealflow/office" component={DealflowOffice} />
      <Route path="/dealflow/deals" component={DealflowDeals} />
      <Route path="/dealflow/project/:id" component={DealflowProject} />
      <Route path="/dealflow/community" component={DealflowCommunity} />
      <Route path="/dealflow/messages" component={DealflowMessages} />
      <Route path="/profile/:userId" component={UserProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;
