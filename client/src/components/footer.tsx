import { Link } from "wouter";
import { Mail, Phone, MapPin } from "lucide-react";
import { NAV_PRIMARY, NAV_MORE, FOOTER_MORE_EXTRA } from "@/config/navigation";

// Empire Doctrine v1.0.1 footer — four locked columns + disclosure block.
// Columns: Company / Services / Network / Legal.
// Brand block carries "Dream it. Build it. Live it." (locked motto).
// Disclosure paragraph carries DRE #02333658, KW East Bay affiliation,
// "Each office is independently owned and operated", "not a solicitation
// of securities", and the Equal Housing Opportunity SVG.
//
// Test IDs preserved from prior Pass D so nav-parity.test.tsx still
// resolves the link-footer-* identifiers it asserts.

type FooterLink = { href: string; label: string };

const COMPANY: FooterLink[] = [
  { href: "/about", label: "About" },
  { href: "/development", label: "Development" },
  { href: "/contact", label: "Contact" },
  { href: "/submit", label: "Submit a Property" },
];

const SERVICES: FooterLink[] = [
  { href: "/strategy-lab", label: "Strategy Lab" },
  { href: "/library", label: "Strategy Library" },
  { href: "/capital", label: "Capital" },
  { href: "/marketflow", label: "MarketFlow" },
];

const NETWORK: FooterLink[] = [
  { href: "/vendor-network", label: "Vendor Network" },
  { href: "/projects", label: "Projects" },
  { href: "/connect", label: "Connect" },
];

const LEGAL: FooterLink[] = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/disclosures", label: "Disclosures" },
];

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

function EhoMark({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Equal Housing Opportunity"
      fill="none"
    >
      <rect x="1" y="1" width="30" height="30" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6 18 L16 9 L26 18 V25 H6 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect x="14" y="19" width="4" height="6" stroke="currentColor" strokeWidth="1.3" />
      <text x="16" y="6" textAnchor="middle" fontSize="3.2" fill="currentColor" fontFamily="Inter, sans-serif">
        EHO
      </text>
    </svg>
  );
}

function Column({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className="font-supporting font-semibold mb-5 text-[10px] uppercase tracking-[0.3em] text-primary">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => {
          // Some labels appear in multiple columns (e.g. /vendor-network).
          // Render under the canonical test IDs the nav-parity test expects.
          const isPrimary = NAV_PRIMARY.some((p) => p.href === link.href);
          const isMore = NAV_MORE.some((m) => m.href === link.href);
          const moreExtra = FOOTER_MORE_EXTRA.some((m) => m.href === link.href);
          const testId = isPrimary
            ? `link-footer-${slug(NAV_PRIMARY.find((p) => p.href === link.href)!.label)}`
            : isMore || moreExtra
            ? `link-footer-more-${slug(
                (NAV_MORE.find((m) => m.href === link.href) ||
                  FOOTER_MORE_EXTRA.find((m) => m.href === link.href))!.label,
              )}`
            : `link-footer-extra-${slug(link.label)}`;
          return (
            <li key={link.href + link.label}>
              <Link href={link.href}>
                <span
                  className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  data-testid={testId}
                >
                  {link.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand block — carries the locked motto "Dream it. Build it. Live it." */}
          <div className="md:col-span-4 space-y-5">
            <Link href="/" className="block" aria-label="Pegasus DreamScapes home">
              <span
                className="font-serif text-2xl font-semibold text-foreground tracking-tight"
                data-testid="text-footer-brand"
              >
                Pegasus DreamScapes
              </span>
            </Link>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
              The Deal Architect
            </p>
            <p className="font-serif text-lg text-foreground italic" data-testid="text-footer-motto">
              Dream it. Build it. Live it.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Pegasus DreamScapes is a California real estate operating company. We review complex
              property situations in the East Bay and design the right path forward.
            </p>
            <p className="text-xs text-muted-foreground/85 font-supporting">
              Founder · Paolo &ldquo;Apollo&rdquo; Duran
            </p>
          </div>

          {/* Four-column link grid */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <Column title="Company" links={COMPANY} />
            <Column title="Services" links={SERVICES} />
            <Column title="Network" links={NETWORK} />
            <Column title="Legal" links={LEGAL} />
          </div>
        </div>

        {/* Contact strip */}
        <div className="mt-12 pt-8 border-t border-border grid sm:grid-cols-3 gap-5 text-sm">
          <a
            href="mailto:apollo@pegasusdreamscapes.com"
            className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
            data-testid="link-footer-email"
          >
            <Mail className="w-4 h-4 text-primary/70" />
            apollo@pegasusdreamscapes.com
          </a>
          <a
            href="tel:+19257448525"
            className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
            data-testid="link-footer-phone"
          >
            <Phone className="w-4 h-4 text-primary/70" />
            925-744-8525
          </a>
          <div className="flex items-center gap-3 text-muted-foreground" data-testid="text-footer-location">
            <MapPin className="w-4 h-4 text-primary/70" />
            Pleasant Hill, California · East Bay
          </div>
        </div>

        {/* Approved disclosure block (Brief §8 verbatim). */}
        <div className="mt-10 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="text-muted-foreground/90 shrink-0" aria-hidden="true">
              <EhoMark className="w-9 h-9" />
            </div>
            <div className="space-y-3 text-[12px] leading-relaxed text-muted-foreground/90 max-w-4xl">
              <p data-testid="text-footer-disclosure">
                Pegasus DreamScapes Corp. is a California operating company. Real estate brokerage
                services are provided through Paolo &ldquo;Apollo&rdquo; Duran, a licensed California real
                estate salesperson (DRE #02333658) affiliated with Keller Williams East Bay. Each
                office is independently owned and operated.
              </p>
              <p>
                Nothing on this website is an offer, recommendation, or solicitation to buy or sell
                securities, real property, or investment products. Capital relationships are private
                and discussed individually under written agreement. Equal Housing Opportunity.
              </p>
              <p className="text-muted-foreground/75">
                See our{" "}
                <Link href="/disclosures">
                  <span className="underline hover:text-foreground transition-colors cursor-pointer">
                    Disclosures
                  </span>
                </Link>{" "}
                page for full terms.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground/85" data-testid="text-copyright">
              &copy; {new Date().getFullYear()} Pegasus DreamScapes Corp. All rights reserved.
            </p>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70 font-supporting">
              Empire Doctrine v1.0.1
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
