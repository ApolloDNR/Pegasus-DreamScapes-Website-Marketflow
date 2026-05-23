import { Link } from "wouter";
import { Mail, MapPin, ArrowUpRight, Phone, LogIn } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import logoImage from "@/assets/brand/pegasus-mark-full.png";
import wordmarkImage from "@/assets/brand/pegasus-wordmark.svg";
import { ThemeToggle } from "./theme-toggle";
import {
  NAV_PRIMARY,
  NAV_MORE,
  FOOTER_MORE_EXTRA,
} from "@/config/navigation";

// Empire Doctrine v1.0.1 / Website Brief v1.0 §3 — footer link grid uses
// the four canonical columns: Company / Services / Network / Legal.
// Per nav-parity test every NAV_PRIMARY label must appear as a
// `link-footer-{slug}` testid and every NAV_MORE label as a
// `link-footer-more-{slug}` testid somewhere in the footer (any column).
type FooterLink = { href: string; label: string; testId: string };

const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

function navPrimary(href: string): FooterLink {
  const item = NAV_PRIMARY.find((i) => i.href === href);
  if (!item) throw new Error(`Footer: NAV_PRIMARY missing ${href}`);
  return { href: item.href, label: item.label, testId: `link-footer-${slugify(item.label)}` };
}

function navMore(href: string): FooterLink {
  const item = [...NAV_MORE, ...FOOTER_MORE_EXTRA].find((i) => i.href === href);
  if (!item) throw new Error(`Footer: NAV_MORE missing ${href}`);
  return { href: item.href, label: item.label, testId: `link-footer-more-${slugify(item.label)}` };
}

function extraLink(href: string, label: string, slug: string): FooterLink {
  return { href, label, testId: `link-footer-extra-${slug}` };
}

const COLUMNS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Company",
    links: [
      navPrimary("/about"),
      navMore("/library"),
      navMore("/connect"),
      navMore("/contact"),
    ],
  },
  {
    heading: "Services",
    links: [
      navPrimary("/strategy-lab"),
      extraLink("/submit", "Submit a Property", "submit"),
      navPrimary("/development"),
      navPrimary("/projects"),
    ],
  },
  {
    heading: "Network",
    links: [
      navPrimary("/marketflow"),
      navMore("/vendor-network"),
      navMore("/capital"),
    ],
  },
  {
    heading: "Legal",
    links: [
      extraLink("/privacy", "Privacy", "privacy"),
      extraLink("/terms", "Terms", "terms"),
      navMore("/disclosures"),
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          <div className="md:col-span-4 space-y-5">
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
            <div className="space-y-3 pt-3 border-t border-border/40 mt-4">
              <a
                href="mailto:apollo@pegasusdreamscapes.com"
                onClick={() => trackEvent("email_tap", { location: "footer" })}
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                data-testid="link-footer-email"
              >
                <Mail className="w-4 h-4 text-primary/70 group-hover:text-primary flex-shrink-0" />
                apollo@pegasusdreamscapes.com
              </a>
              <a
                href="tel:+19257448525"
                onClick={() => trackEvent("phone_tap", { location: "footer" })}
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                data-testid="link-footer-phone"
              >
                <Phone className="w-4 h-4 text-primary/70 group-hover:text-primary flex-shrink-0" />
                925-744-8525
              </a>
              <div className="flex items-center gap-3 text-sm text-muted-foreground" data-testid="text-footer-location">
                <MapPin className="w-4 h-4 text-primary/70 flex-shrink-0" />
                Pleasant Hill, California
              </div>
              <p className="text-xs text-muted-foreground/85 pt-2 leading-relaxed" data-testid="text-footer-response">
                We respond to every serious submission within 48 hours, Monday through Friday.
              </p>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading} className="md:col-span-2">
              <h3
                className="font-supporting font-semibold mb-5 text-[10px] uppercase tracking-[0.3em] text-primary"
                data-testid={`heading-footer-${slugify(col.heading)}`}
              >
                {col.heading}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.testId}>
                    <Link href={link.href}>
                      <span
                        className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1.5 group"
                        data-testid={link.testId}
                      >
                        {link.label}
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-border/40">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              <span>Appearance</span>
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-5 text-xs">
              <Link href="/marketflow">
                <span className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-footer-marketflow-beta">
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
          <p className="text-xs uppercase tracking-[0.22em] text-foreground/75 font-supporting font-medium" data-testid="text-footer-dre">
            Founder · Paolo &ldquo;Apollo&rdquo; Duran · DRE #02333658 · Keller Williams East Bay
          </p>
          <div className="mt-3 flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5 text-muted-foreground/80 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
              data-testid="img-footer-eho"
            >
              <path d="M12 3 3 9v12h18V9z" />
              <path d="M9 21v-6h6v6" />
              <path d="M8 13h8" />
            </svg>
            <p className="text-[11px] text-muted-foreground/85 leading-relaxed" data-testid="text-footer-kw">
              <span className="sr-only">Equal Housing Opportunity. </span>Each office is independently owned and operated.
            </p>
          </div>
          <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
                  Nothing on this website is an offer or solicitation to buy or sell securities, real property, or investment products. Capital relationships are private and discussed individually under written agreement. Information shown here is preliminary and informational only. Real estate transactions are facilitated through licensed partners. See our <Link href="/disclosures"><span className="underline hover:text-foreground transition-colors cursor-pointer">Disclosures</span></Link> page for full terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
