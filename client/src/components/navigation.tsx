import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "Welcome" },
  { href: "/services", label: "Service List" },
  { href: "/resources", label: "Blog Feed" },
  { href: "/projects", label: "Projects" },
];

const moreLinks = [
  { href: "/calculators", label: "Calculators" },
  { href: "/sell", label: "Sell" },
  { href: "/invest", label: "Invest" },
  { href: "/contact", label: "Contact" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" data-testid="link-logo">
          <span className="font-serif text-xl font-medium text-foreground tracking-tight">Pegasus Dreamscapes</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === link.href ? "text-primary" : "text-foreground"
              }`}
              data-testid={`link-nav-${link.label.toLowerCase().replace(' ', '-')}`}
            >
              {link.label}
            </Link>
          ))}
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
                className="absolute top-full right-0 mt-2 py-2 bg-card rounded-md shadow-lg border border-border min-w-[140px]"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setMoreOpen(false);
                }}
              >
                {moreLinks.map((link, index) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className="block px-4 py-2 text-sm hover:bg-secondary text-foreground focus:bg-secondary focus:outline-none"
                    data-testid={`link-nav-${link.label.toLowerCase()}`}
                    onClick={() => setMoreOpen(false)}
                    onBlur={(e) => {
                      if (index === moreLinks.length - 1 && !e.relatedTarget?.closest('#more-menu')) {
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
            data-testid="link-nav-hq"
          >
            Pegasus HQ
          </Link>
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
      </nav>

      {isOpen && (
        <div id="mobile-menu" className="lg:hidden bg-card border-b border-border">
          <div className="px-6 py-4 space-y-2">
            {[...navLinks, ...moreLinks].map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`block py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  location === link.href ? "text-primary bg-secondary" : "text-foreground hover:bg-secondary"
                }`}
                onClick={() => setIsOpen(false)}
                data-testid={`link-mobile-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border">
              <Link 
                href="/hq"
                className="block py-3 px-4 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)} 
                data-testid="link-mobile-hq"
              >
                Pegasus HQ Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
