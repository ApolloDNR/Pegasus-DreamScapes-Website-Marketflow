import { Link } from "wouter";
import { Mail, MapPin } from "lucide-react";
import logoImage from "@assets/image_1765405939117.png";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/development", label: "Development" },
  { href: "/investments", label: "Investments" },
  { href: "/systems", label: "Systems" },
  { href: "/marketflow-beta", label: "MarketFlow Beta" },
  { href: "/contact", label: "Contact" },
];

const opportunityLinks = [
  { href: "/sell", label: "Submit a Property" },
  { href: "/submit-deal", label: "Submit a Deal" },
  { href: "/contact?subject=partnership", label: "Partner with Pegasus" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4">
            <Link href="/" className="block">
              <img 
                src={logoImage} 
                alt="Pegasus Dreamscapes" 
                className="h-20 w-auto"
                data-testid="img-footer-logo"
              />
            </Link>
            <p className="text-primary text-sm font-medium">
              Dream it. Build it. Live it.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pegasus Dreamscapes is a real estate development, investment, and systems company building disciplined infrastructure for modern real estate execution.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-foreground/70">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid={`link-footer-${link.label.toLowerCase()}`}>
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-foreground/70">Opportunities</h3>
            <ul className="space-y-2">
              {opportunityLinks.map((link, index) => (
                <li key={link.label + index}>
                  <Link href={link.href}>
                    <span
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      data-testid={`link-footer-opp-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-foreground/70">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <a href="mailto:hello@pegasusdreamscapes.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-email">
                  hello@pegasusdreamscapes.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground" data-testid="text-footer-location">
                  East Bay, California
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground" data-testid="text-copyright">
              &copy; {new Date().getFullYear()} Pegasus Dreamscapes Corp. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Development · Investments · Systems
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
