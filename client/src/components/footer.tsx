import { Link } from "wouter";
import { Mail, MapPin, ArrowUpRight, Phone, LogIn } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import logoImage from "@/assets/brand/pegasus-mark-full.png";
import wordmarkImage from "@/assets/brand/pegasus-wordmark-light.svg";
import { ThemeToggle } from "./theme-toggle";
import {
  FOOTER_MORE_EXTRA,
  NAV_MORE,
  NAV_PRIMARY,
} from "@/config/navigation";

type FooterLink = { href: string; label: string; testId: string };

const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

function primaryLink(href: string): FooterLink {
  const item = NAV_PRIMARY.find((i) => i.href === href);
  if (!item) throw new Error(`Footer: NAV_PRIMARY missing ${href}`);
  return { href: item.href, label: item.label, testId: `link-footer-${slugify(item.label)}` };
}

function moreLink(href: string): FooterLink {
  const item = [...NAV_MORE, ...FOOTER_MORE_EXTRA].find((i) => i.href === href);
  if (!item) throw new Error(`Footer: NAV_MORE missing ${href}`);
  return { href: item.href, label: item.label, testId: `link-footer-more-${slugify(item.label)}` };
}

const COLUMNS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Company",
    links: [
      moreLink("/about"),
      moreLink("/connect"),
      moreLink("/ecosystem"),
      primaryLink("/deal-architecture"),
      primaryLink("/development"),
      moreLink("/projects"),
      moreLink("/contact"),
    ],
  },
  {
    heading: "Tools",
    links: [
      primaryLink("/strategy-lab"),
      moreLink("/peggy-ai"),
      moreLink("/library"),
      moreLink("/dreamscaper-standard"),
    ],
  },
  {
    heading: "Network",
    links: [
      primaryLink("/marketflow"),
      primaryLink("/work-with-apollo"),
      moreLink("/capital"),
      moreLink("/vendor-network"),
      moreLink("/login"),
    ],
  },
  {
    heading: "Legal",
    links: [
      moreLink("/disclosures"),
      moreLink("/privacy"),
      moreLink("/terms"),
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[hsl(var(--navy))] text-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          <div className="md:col-span-4 space-y-5">
            <Link href="/" className="block" aria-label="Pegasus Dreamscapes home">
              <img
                src={logoImage}
                alt=""
                aria-hidden="true"
                className="h-24 w-auto [filter:drop-shadow(0_4px_14px_rgba(0,0,0,0.35))]"
                data-testid="img-footer-logo"
              />
            </Link>
            <div>
              <p className="font-display text-xl text-white tracking-[0.18em] uppercase">The Deal Architect</p>
              <p className="text-xs uppercase tracking-[0.3em] text-primary/80 mt-2 font-medium font-supporting">
                Dream it. Build it. Live it.
              </p>
            </div>
            <p className="text-sm text-cream/68 leading-relaxed max-w-md">
              Pegasus Dreamscapes turns complex, distressed, and value-add real estate into structured opportunity through strategy, development, representation, and trusted relationship routing.
            </p>
            <div className="space-y-3 pt-3 border-t border-white/10 mt-4">
              <a
                href="mailto:apollo@pegasusdreamscapes.com"
                onClick={() => trackEvent("email_tap", { location: "footer" })}
                className="flex items-center gap-3 text-sm text-cream/68 hover:text-primary transition-colors group"
                data-testid="link-footer-email"
              >
                <Mail className="w-4 h-4 text-primary/70 group-hover:text-primary flex-shrink-0" aria-hidden="true" />
                apollo@pegasusdreamscapes.com
              </a>
              <a
                href="tel:+19257448525"
                onClick={() => trackEvent("phone_tap", { location: "footer" })}
                className="flex items-center gap-3 text-sm text-cream/68 hover:text-primary transition-colors group"
                data-testid="link-footer-phone"
              >
                <Phone className="w-4 h-4 text-primary/70 group-hover:text-primary flex-shrink-0" aria-hidden="true" />
                925-744-8525
              </a>
              <div className="flex items-center gap-3 text-sm text-cream/68" data-testid="text-footer-location">
                <MapPin className="w-4 h-4 text-primary/70 flex-shrink-0" aria-hidden="true" />
                Pleasant Hill, California
              </div>
              <p className="text-xs text-cream/58 pt-2 leading-relaxed" data-testid="text-footer-response">
                Serious submissions are reviewed by a human before any outcome lane is recommended.
              </p>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading} className="md:col-span-2">
              <h3
                className="font-supporting font-semibold mb-5 text-[10px] uppercase tracking-[0.26em] text-primary"
                data-testid={`heading-footer-${slugify(col.heading)}`}
              >
                {col.heading}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.testId}>
                    <Link href={link.href}>
                      <span
                        className="text-sm text-cream/64 hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1.5 group"
                        data-testid={link.testId}
                      >
                        {link.label}
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-cream/58">
              <span>Appearance</span>
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-5 text-xs">
              <Link href="/marketflow">
                <span className="inline-flex items-center gap-2 text-cream/64 hover:text-primary transition-colors cursor-pointer" data-testid="link-footer-marketflow-beta">
                  MarketFlow
                  <span className="px-1.5 py-0.5 text-[9px] font-semibold tracking-wider bg-primary/10 text-primary rounded">BETA</span>
                </span>
              </Link>
              <span className="text-white/16">|</span>
              <Link href="/login">
                <span
                  className="inline-flex items-center gap-1.5 text-cream/64 hover:text-white transition-colors cursor-pointer"
                  data-testid="link-footer-signin"
                >
                  <LogIn className="w-3 h-3" aria-hidden="true" />
                  Sign In
                </span>
              </Link>
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.22em] text-cream/72 font-supporting font-medium" data-testid="text-footer-dre">
            Founder | Paolo "Apollo" Duran | DRE #02333658 | Keller Williams Realty East Bay
          </p>
          <div className="mt-3 flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5 text-cream/58 shrink-0"
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
            <p className="text-[11px] text-cream/60 leading-relaxed" data-testid="text-footer-kw">
              <span className="sr-only">Equal Housing Opportunity. </span>Equal Housing Opportunity. Each office is independently owned and operated.
            </p>
          </div>
          <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-4">
              <img
                src={wordmarkImage}
                alt=""
                aria-hidden="true"
                className="h-7 w-auto opacity-75 hidden sm:block"
                data-testid="img-footer-wordmark"
              />
              <div>
                <p className="text-xs text-cream/62" data-testid="text-copyright">
                  &copy; {new Date().getFullYear()} Pegasus Dreamscapes Corp. A California Corporation. All rights reserved.
                </p>
                <p className="text-[11px] text-cream/58 mt-1.5 max-w-3xl leading-relaxed" data-testid="text-footer-disclosure">
                  Nothing on this website is an offer or solicitation to buy or sell securities, investment products, partnership interests, or real property. Property analysis, Strategy Lab output, Strategy Snapshots, and written reviews are preliminary and informational only and are not appraisals, offers, ARV opinions, rehab budgets, lending decisions, legal advice, tax advice, or guaranteed results. Licensed real estate services are provided by Paolo "Apollo" Duran through Keller Williams Realty East Bay. Pegasus Dreamscapes Corp is separate from Keller Williams Realty East Bay. See our <Link href="/disclosures"><span className="underline hover:text-white transition-colors cursor-pointer">Disclosures</span></Link> page for full terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
