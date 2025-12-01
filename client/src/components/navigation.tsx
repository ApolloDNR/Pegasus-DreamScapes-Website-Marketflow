import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  ChevronDown, 
  Calculator, 
  TrendingUp, 
  Home,
  DollarSign,
  BookOpen,
  Users,
  Building2,
  FileText,
  Target,
  Award,
  BarChart3,
  Briefcase,
  Sparkles
} from "lucide-react";
import logoImage from "@assets/image_1764616120774.png";

const homeLinks = [
  { href: "#services", label: "Services" },
  { href: "#sell", label: "Sell" },
  { href: "#invest", label: "Invest" },
  { href: "#creed", label: "Dreamscaper" },
  { href: "#contact", label: "Contact" },
];

const megaMenuSections = {
  tools: {
    title: "Investment Tools",
    icon: Calculator,
    items: [
      { href: "/calculators", label: "ARV Calculator", description: "Estimate after-repair value", icon: Home },
      { href: "/calculators", label: "ROI Calculator", description: "Cash-on-cash returns", icon: TrendingUp },
      { href: "/calculators", label: "BRRRR Calculator", description: "Buy, rehab, rent, refi, repeat", icon: BarChart3 },
      { href: "/calculators", label: "Cash Flow Analyzer", description: "Monthly income projections", icon: DollarSign },
    ]
  },
  resources: {
    title: "Resources",
    icon: BookOpen,
    items: [
      { href: "/resources", label: "Investment Guides", description: "Learn the fundamentals", icon: FileText },
      { href: "/projects", label: "Case Studies", description: "Real project examples", icon: Target },
      { href: "/resources", label: "Market Insights", description: "Trends and analysis", icon: BarChart3 },
    ]
  },
  company: {
    title: "Company",
    icon: Building2,
    items: [
      { href: "/about", label: "About Us", description: "Our story and mission", icon: Users },
      { href: "/about", label: "Team", description: "Meet the Dreamscapers", icon: Award },
      { href: "/projects", label: "Portfolio", description: "Completed projects", icon: Briefcase },
    ]
  }
};

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  const isHomePage = location === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#") && isHomePage) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      setIsOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className={`transition-all duration-500 ${scrolled || !isHomePage ? 'bg-background/98 backdrop-blur-lg shadow-sm border-b border-border/30' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group" data-testid="link-logo">
            <img 
              src={logoImage} 
              alt="Pegasus Dreamscapes" 
              className="h-12 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {isHomePage ? (
              <>
                {homeLinks.map((link) => (
                  <a 
                    key={link.href} 
                    href={link.href}
                    onClick={(e) => handleScrollClick(e, link.href)}
                    className={`text-sm font-medium tracking-wide transition-colors cursor-pointer relative group ${scrolled ? 'text-foreground hover:text-primary' : 'text-white/90 hover:text-white'}`}
                    data-testid={`link-nav-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                    <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${scrolled ? 'bg-primary' : 'bg-white'}`} />
                  </a>
                ))}
              </>
            ) : (
              <Link 
                href="/"
                className="text-sm font-medium tracking-wide transition-colors hover:text-primary text-foreground relative group"
                data-testid="link-nav-home"
              >
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            )}
            
            <div 
              className="relative"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <button 
                className={`flex items-center gap-1 text-sm font-medium tracking-wide cursor-pointer transition-colors ${(scrolled || !isHomePage) ? 'text-foreground hover:text-primary' : 'text-white/90 hover:text-white'}`}
                data-testid="button-nav-explore"
                aria-expanded={megaMenuOpen}
              >
                Explore
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {megaMenuOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[700px] bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-l border-t border-border rotate-45" />
                  
                  <div className="grid grid-cols-3 divide-x divide-border">
                    {Object.entries(megaMenuSections).map(([key, section]) => (
                      <div key={key} className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <section.icon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-semibold text-sm text-foreground">{section.title}</span>
                        </div>
                        <div className="space-y-1">
                          {section.items.map((item, idx) => (
                            <Link
                              key={idx}
                              href={item.href}
                              className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                              onClick={() => setMegaMenuOpen(false)}
                              data-testid={`link-mega-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <div className="w-8 h-8 rounded-md bg-secondary/50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                                <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-secondary/30 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-tan" />
                      <span className="text-sm text-muted-foreground">Ready to start investing?</span>
                    </div>
                    <Link href="/sell" onClick={() => setMegaMenuOpen(false)}>
                      <Button size="sm" data-testid="button-mega-cta">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/hq" 
              className={`hidden sm:block text-sm font-medium tracking-wide transition-colors ${(scrolled || !isHomePage) ? 'text-muted-foreground hover:text-primary' : 'text-white/70 hover:text-white'}`}
              data-testid="link-nav-dashboard"
            >
              Dashboard
            </Link>
            {isHomePage && (
              <a href="#sell" onClick={(e) => handleScrollClick(e, "#sell")}>
                <Button size="sm" className={`hidden sm:flex text-xs uppercase tracking-widest font-medium ${scrolled ? '' : 'bg-white text-foreground hover:bg-white/90'}`} data-testid="button-nav-cta">
                  Get Started
                </Button>
              </a>
            )}
            <button
              className={`lg:hidden p-2 hover-elevate rounded-md ${(scrolled || !isHomePage) ? 'text-foreground' : 'text-white'}`}
              onClick={() => setIsOpen(!isOpen)}
              data-testid="button-mobile-menu"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>
      <div className="h-1 bg-gradient-to-r from-tan via-primary to-tan" />

      {isOpen && (
        <div id="mobile-menu" className="lg:hidden bg-card/95 backdrop-blur-lg border-b border-border">
          <div className="px-6 py-4 space-y-2 max-h-[80vh] overflow-y-auto">
            {isHomePage ? (
              <>
                {homeLinks.map((link) => (
                  <a 
                    key={link.href} 
                    href={link.href}
                    onClick={(e) => handleScrollClick(e, link.href)}
                    className="block py-3 px-4 rounded-md text-sm font-medium transition-colors text-foreground hover:bg-secondary cursor-pointer"
                    data-testid={`link-mobile-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </a>
                ))}
              </>
            ) : (
              <Link 
                href="/"
                className="block py-3 px-4 rounded-md text-sm font-medium transition-colors text-foreground hover:bg-secondary"
                onClick={() => setIsOpen(false)}
                data-testid="link-mobile-home"
              >
                Home
              </Link>
            )}
            
            {Object.entries(megaMenuSections).map(([key, section]) => (
              <div key={key} className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 px-4 py-2">
                  <section.icon className="w-4 h-4 text-tan" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-tan">{section.title}</span>
                </div>
                {section.items.map((item, idx) => (
                  <Link 
                    key={idx}
                    href={item.href}
                    className="flex items-center gap-3 py-3 px-4 rounded-md text-sm font-medium transition-colors text-foreground hover:bg-secondary"
                    onClick={() => setIsOpen(false)}
                    data-testid={`link-mobile-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
            
            <div className="pt-4 border-t border-border space-y-2">
              <Link 
                href="/hq"
                className="block py-3 px-4 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)} 
                data-testid="link-mobile-dashboard"
              >
                Dashboard
              </Link>
              <Link href="/sell" onClick={() => setIsOpen(false)}>
                <Button className="w-full" data-testid="button-mobile-cta">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
