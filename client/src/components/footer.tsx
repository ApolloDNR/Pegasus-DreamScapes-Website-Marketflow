import { Link } from "wouter";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";
import { PegasusMark } from "@/components/brand/pegasus-mark";

const company = [
  { href: "/about", label: "About" },
  { href: "/development", label: "Development" },
  { href: "/investments", label: "Investments" },
  { href: "/systems", label: "Systems" },
  { href: "/contact", label: "Contact" },
];

const opportunities = [
  { href: "/sell", label: "Submit a Property" },
  { href: "/submit-deal", label: "Submit a Deal" },
  { href: "/contact?subject=partnership", label: "Partner with Pegasus" },
  { href: "/marketflow-beta", label: "Request MarketFlow Access" },
];

const legal = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export function Footer() {
  return (
    <footer className="relative bg-[hsl(220_35%_4%)] border-t border-copper/15">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-copper/40 to-transparent" />

      <div className="container-premium pt-20 pb-12">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3" data-testid="link-footer-logo">
              <PegasusMark size={48} />
              <div className="leading-none">
                <p className="font-display-uppercase text-ivory text-[16px]">
                  Pegasus Dreamscapes
                </p>
                <p className="kicker mt-1.5 text-copper/80 text-[10px] tracking-[0.28em]">
                  Dream it. Build it. Live it.
                </p>
              </div>
            </Link>

            <p className="mt-8 max-w-md text-[15px] leading-relaxed text-muted-ivory">
              Pegasus Dreamscapes is a real estate development, investment, and
              systems company building disciplined infrastructure for modern
              real estate execution.
            </p>

            <div className="mt-8 space-y-3 text-sm">
              <a
                href="mailto:hello@pegasusdreamscapes.com"
                className="inline-flex items-center gap-2.5 text-ivory/85 transition hover:text-copper"
                data-testid="link-footer-email"
              >
                <Mail className="h-4 w-4 text-copper/80" />
                hello@pegasusdreamscapes.com
              </a>
              <p className="inline-flex items-center gap-2.5 text-ivory/85">
                <MapPin className="h-4 w-4 text-copper/80" />
                East Bay, California
              </p>
            </div>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h4 className="kicker mb-5 text-copper/80">Company</h4>
            <ul className="space-y-3">
              {company.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="text-[14px] text-ivory/80 transition hover:text-copper"
                    data-testid={`link-footer-company-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="lg:col-span-3">
            <h4 className="kicker mb-5 text-copper/80">Opportunities</h4>
            <ul className="space-y-3">
              {opportunities.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="group inline-flex items-center gap-2 text-[14px] text-ivory/80 transition hover:text-copper"
                    data-testid={`link-footer-opps-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {l.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-50 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2">
            <h4 className="kicker mb-5 text-copper/80">Legal</h4>
            <ul className="space-y-3">
              {legal.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[14px] text-ivory/80 transition hover:text-copper"
                    data-testid={`link-footer-legal-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-copper/10 pt-6 sm:flex-row sm:items-center">
          <p className="text-[12px] tracking-[0.12em] text-ivory/40">
            © {new Date().getFullYear()} Pegasus Dreamscapes. All rights reserved.
          </p>
          <p className="text-[11px] uppercase tracking-[0.32em] text-copper/60">
            Development · Investments · Systems
          </p>
        </div>
      </div>
    </footer>
  );
}
