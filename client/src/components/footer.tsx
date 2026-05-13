import { Link } from "wouter";
import { Mail, MapPin, ArrowUpRight, Phone, LogIn } from "lucide-react";
import logoImage from "@assets/image_1765405939117.png";
import { ThemeToggle } from "./theme-toggle";

const exploreLinks = [
  { href: "/#development-pathway", label: "Development Pathway" },
  { href: "/#marketflow-beta", label: "MarketFlow Beta" },
  { href: "/projects", label: "Featured Projects" },
  { href: "/deal-blueprint", label: "Deal Blueprint" },
  { href: "/services", label: "Services" },
];

const engageLinks = [
  { href: "/sell", label: "Submit a Property" },
  { href: "/invest", label: "Capital & Partnerships" },
  { href: "/contact", label: "General Contact" },
  { href: "/marketflow", label: "Enter MarketFlow" },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          <div className="md:col-span-5 space-y-5">
            <Link href="/" className="block" aria-label="Pegasus DreamScapes — home">
              <img
                src={logoImage}
                alt=""
                aria-hidden="true"
                className="h-16 w-auto"
                data-testid="img-footer-logo"
              />
            </Link>
            <div>
              <p className="font-display text-xl text-foreground tracking-[0.18em] uppercase">The Deal Architect</p>
              <p className="text-xs uppercase tracking-[0.3em] text-primary/80 mt-2 font-medium font-supporting">
                Dream it. Build it. Live it.
              </p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Pegasus Dreamscapes is a strategy-first real estate operating company and emerging vertically integrated developer — building from disciplined small-scale execution toward a generational development practice.
            </p>
            <p className="text-xs uppercase tracking-[0.22em] text-foreground/75 font-supporting font-medium pt-1">
              Founder · Paolo &ldquo;Apollo&rdquo; Duran
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-semibold mb-5 text-xs uppercase tracking-[0.25em] text-foreground/60">Explore</h3>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href}>
                    <span
                      className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1.5 group"
                      data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="font-semibold mb-5 text-xs uppercase tracking-[0.25em] text-foreground/60">Start a Conversation</h3>
            <ul className="space-y-3 mb-8">
              {engageLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href}>
                    <span
                      className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1.5 group"
                      data-testid={`link-footer-engage-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="space-y-3 pt-5 border-t border-border/50">
              <a
                href="mailto:apollo@pegasusdreamscapes.com"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                data-testid="link-footer-email"
              >
                <Mail className="w-4 h-4 text-primary/70 group-hover:text-primary flex-shrink-0" />
                apollo@pegasusdreamscapes.com
              </a>
              <a
                href="tel:+19259486566"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                data-testid="link-footer-phone"
              >
                <Phone className="w-4 h-4 text-primary/70 group-hover:text-primary flex-shrink-0" />
                925-948-6566
              </a>
              <div className="flex items-center gap-3 text-sm text-muted-foreground" data-testid="text-footer-location">
                <MapPin className="w-4 h-4 text-primary/70 flex-shrink-0" />
                Bay Area, California
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-border/40">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              <span>Appearance</span>
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-5 text-xs">
              <Link href="/marketflow">
                <span className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-footer-marketflow">
                  MarketFlow
                  <span className="px-1.5 py-0.5 text-[9px] font-semibold tracking-wider bg-primary/10 text-primary rounded">BETA</span>
                </span>
              </Link>
              <span className="text-border">·</span>
              <a
                href="/api/login"
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-footer-signin"
              >
                <LogIn className="w-3 h-3" aria-hidden="true" />
                Sign In
              </a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground" data-testid="text-copyright">
                &copy; {new Date().getFullYear()} Pegasus Dreamscapes Corp. All rights reserved.
              </p>
              <p className="text-[11px] text-muted-foreground/70 mt-1.5 max-w-2xl leading-relaxed">
                Private network · Invite-only deal flow. Information on this site is for general purposes only and is not an offer to buy or sell securities, real property, or investment products.
              </p>
            </div>
            <div className="flex items-center gap-5 text-xs">
              <Link href="/privacy">
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-privacy">
                  Privacy
                </span>
              </Link>
              <span className="text-border">·</span>
              <Link href="/terms">
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-terms">
                  Terms
                </span>
              </Link>
              <span className="text-border">·</span>
              <Link href="/contact">
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-footer-disclosures">
                  Disclosures
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
