import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
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
      <Route path="/dreamspace" component={Dreamspace} />
      <Route path="/contact" component={Contact} />
      <Route path="/hq" component={HQ} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
