import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/calculators", label: "Calculators" },
  { href: "/sell", label: "Sell" },
  { href: "/invest", label: "Invest" },
  { href: "/contact", label: "Contact" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" data-testid="link-logo">
          <PegasusLogo />
          <span className="font-semibold text-lg hidden sm:block">Pegasus Dreamscapes</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                size="sm"
                className={location === link.href ? "text-primary" : "text-muted-foreground"}
                data-testid={`link-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm" data-testid="button-login">
              Login
            </Button>
          </Link>
          <Link href="/sell" className="hidden sm:block">
            <Button size="sm" data-testid="button-sell-nav">
              Sell a Property
            </Button>
          </Link>
          <button
            className="lg:hidden p-2 hover-elevate rounded-md"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="button-mobile-menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="lg:hidden bg-background border-b border-border">
          <div className="px-6 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${location === link.href ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
                  onClick={() => setIsOpen(false)}
                  data-testid={`link-mobile-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-2">
              <Link href="/login">
                <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)} data-testid="button-login-mobile">
                  Login to Pegasus HQ
                </Button>
              </Link>
              <Link href="/sell">
                <Button className="w-full" onClick={() => setIsOpen(false)} data-testid="button-sell-mobile">
                  Sell a Property
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function PegasusLogo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M16 2L4 8v8c0 7.732 5.268 12 12 14 6.732-2 12-6.268 12-14V8L16 2z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M12 12c0-2 1.5-4 4-4s4 2 4 4c0 3-2 4-4 6-2-2-4-3-4-6z"
        fill="currentColor"
      />
      <path
        d="M8 18c2-1 3 0 4 2s2 4 4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M24 18c-2-1-3 0-4 2s-2 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
