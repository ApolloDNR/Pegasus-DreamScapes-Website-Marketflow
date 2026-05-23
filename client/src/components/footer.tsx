import { Link } from "wouter";
import { Mail, MapPin, ArrowUpRight, Phone, LogIn } from "lucide-react";
// Footer reads NAV_PRIMARY / NAV_MORE / FOOTER_MORE_EXTRA so any nav rename
// or addition lands here automatically. FOOTER_MORE_EXTRA is currently
// empty; it exists so footer-only links (legal etc.) can be added without
// reshuffling the header dropdown. See docs/architecture/navigation-map.md.
import logoImage from "@/assets/brand/pegasus-mark-full.png";
import wordmarkImage from "@/assets/brand/pegasus-wordmark.svg";
import { ThemeToggle } from "./theme-toggle";
import {
  NAV_PRIMARY,
  NAV_MORE,
  FOOTER_MORE_EXTRA,
} from "@/config/navigation";

// Locked Pass D grouping — mirrors the desktop header order so users see one
// consistent navigation map across header and footer. The canonical lists
// live in `@/config/navigation`. Footer's "More" column is the shared
// NAV_MORE (identical to the header dropdown) plus any footer-only extras
// from FOOTER_MORE_EXTRA (currently empty).
const exploreLinks = NAV_PRIMARY.map(({ href, label }) => ({ href, label }));
const moreLinks = [...NAV_MORE, ...FOOTER_MORE_EXTRA];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          <div className="md:col-span-5 space-y-5">
            <Link href="/" className="block" aria-label="Pegasus DreamScapes home">
              <img
                src={logoImage}
                alt=""
                aria-hidden="true"
                className="h-32 w-auto [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.2))]"
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
              Pegasus DreamScapes is a strategy-first real estate operating company and an emerging vertically integrated developer, building from disciplined small-scale execution toward a generational development practice.
            </p>
            <p className="text-xs uppercase tracking-[0.22em] text-foreground/75 font-supporting font-medium pt-1">
              Founder · Paolo &ldquo;Apollo&rdquo; Duran
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-supporting font-semibold mb-5 text-[10px] uppercase tracking-[0.3em] text-primary">Explore</h3>
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
            <h3 className="font-supporting font-semibold mt-8 mb-5 text-[10px] uppercase tracking-[0.3em] text-primary">More</h3>
            <ul className="space-y-3">
              {moreLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href}>
                    <span
                      className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1.5 group"
                      data-testid={`link-footer-more-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
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
            <h3 className="font-supporting font-semibold mb-5 text-[10px] uppercase tracking-[0.3em] text-primary">Start a Conversation</h3>
            <div className="space-y-3 mb-8">
              <Link href="/submit">
                <span
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1.5 group"
                  data-testid="link-footer-engage-submit-a-property"
                >
                  Submit a Property
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </span>
              </Link>
            </div>
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
                href="tel:+19257448525"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                data-testid="link-footer-phone"
              >
                <Phone className="w-4 h-4 text-primary/70 group-hover:text-primary flex-shrink-0" />
                925-744-8525
              </a>
              <div className="flex items-center gap-3 text-sm text-muted-foreground" data-testid="text-footer-location">
                <MapPin className="w-4 h-4 text-primary/70 flex-shrink-0" />
                Pleasant Hill, California · Bay Area · Pacific Time
              </div>
              <p className="text-xs text-muted-foreground/85 pt-1 leading-relaxed" data-testid="text-footer-response">
                We respond to every serious submission within 48 hours, Monday through Friday.
              </p>
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
              <Link href="/login">
                <span
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  data-testid="link-footer-signin"
                >
                  <LogIn className="w-3 h-3" aria-hidden="true" />
                  Sign In
                </span>
              </Link>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-4">
              <img
                src={wordmarkImage}
                alt=""
                aria-hidden="true"
                className="h-7 w-auto opacity-70 hidden sm:block"
                data-testid="img-footer-wordmark"
              />
            <div>
              <p className="text-xs text-muted-foreground" data-testid="text-copyright">
                &copy; {new Date().getFullYear()} Pegasus DreamScapes Corp. · A California Corporation. All rights reserved.
              </p>
              <p className="text-[11px] text-muted-foreground/80 mt-1.5 max-w-2xl leading-relaxed" data-testid="text-footer-disclosure">
                Pegasus DreamScapes Corp. is a California operating company. Nothing on this website is an offer or solicitation to buy or sell securities, real property, or investment products. Capital relationships are private and discussed individually under written agreement. Real estate transactions are facilitated through licensed partners. See our <Link href="/disclosures"><span className="underline hover:text-foreground transition-colors cursor-pointer">Disclosures</span></Link> page for full terms.
              </p>
            </div>
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
              <Link href="/disclosures">
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
