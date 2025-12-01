import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import logoImage from "@assets/image_1764616120774.png";

const homeLinks = [
  { href: "#services", label: "Services" },
  { href: "#sell", label: "Sell" },
  { href: "#invest", label: "Invest" },
  { href: "#creed", label: "Dreamscaper" },
  { href: "#contact", label: "Contact" },
];

const pageLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/resources", label: "Resources" },
  { href: "/calculators", label: "Calculators" },
  { href: "/about", label: "About" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [location] = useLocation();

  const isHomePage = location === "/";

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
      {/* Main nav - transparent on hero, solid on scroll */}
      <nav className="bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3" data-testid="link-logo">
          <img 
            src={logoImage} 
            alt="Pegasus Dreamscapes" 
            className="h-14 w-auto"
          />
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {isHomePage ? (
            <>
              {homeLinks.map((link) => (
                <a 
                  key={link.href} 
                  href={link.href}
                  onClick={(e) => handleScrollClick(e, link.href)}
                  className="text-sm font-medium transition-colors hover:text-primary text-foreground cursor-pointer"
                  data-testid={`link-nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </a>
              ))}
            </>
          ) : (
            <>
              <Link 
                href="/"
                className="text-sm font-medium transition-colors hover:text-primary text-foreground"
                data-testid="link-nav-home"
              >
                Home
              </Link>
            </>
          )}
          
          <div 
            className="relative"
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button 
              className="flex items-center gap-1 text-sm font-medium text-foreground cursor-pointer hover:text-primary" 
              data-testid="button-nav-more"
              aria-expanded={moreOpen}
              aria-controls="more-menu"
              onClick={() => setMoreOpen(!moreOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setMoreOpen(false);
              }}
            >
              More
              <ChevronDown className={`w-4 h-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
            </button>
            {moreOpen && (
              <div 
                id="more-menu"
                className="absolute top-full right-0 mt-2 py-2 bg-card rounded-md shadow-lg border border-border min-w-[160px]"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setMoreOpen(false);
                }}
              >
                {pageLinks.map((link, index) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className="block px-4 py-2 text-sm hover:bg-secondary text-foreground focus:bg-secondary focus:outline-none"
                    data-testid={`link-nav-${link.label.toLowerCase()}`}
                    onClick={() => setMoreOpen(false)}
                    onBlur={(e) => {
                      if (index === pageLinks.length - 1 && !e.relatedTarget?.closest('#more-menu')) {
                        setMoreOpen(false);
                      }
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/hq" 
            className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            data-testid="link-nav-dashboard"
          >
            Dashboard
          </Link>
          {isHomePage && (
            <a href="#sell" onClick={(e) => handleScrollClick(e, "#sell")}>
              <Button size="sm" className="hidden sm:flex" data-testid="button-nav-cta">
                Get Started
              </Button>
            </a>
          )}
          <button
            className="lg:hidden p-2 hover-elevate rounded-md"
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
      {/* Tan accent bar */}
      <div className="h-1 bg-tan" />

      {isOpen && (
        <div id="mobile-menu" className="lg:hidden bg-card border-b border-border">
          <div className="px-6 py-4 space-y-2">
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
            <div className="pt-2 border-t border-border space-y-2">
              {pageLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`block py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                    location === link.href ? "text-primary bg-secondary" : "text-foreground hover:bg-secondary"
                  }`}
                  onClick={() => setIsOpen(false)}
                  data-testid={`link-mobile-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="pt-4 border-t border-border">
              <Link 
                href="/hq"
                className="block py-3 px-4 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)} 
                data-testid="link-mobile-dashboard"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
