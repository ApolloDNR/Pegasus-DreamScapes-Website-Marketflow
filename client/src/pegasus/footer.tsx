import type { ReactNode } from 'react';
import { Link } from 'wouter';
import type { Nav } from './theme';
import { BrandMark } from './primitives';
import { urlFor } from './routes';

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="pg-footer-column lg:col-span-2">
      <div className="pg-label !text-[9px] text-[var(--accent-bright)] mb-5">{title}</div>
      <ul className="space-y-3 pg-label !text-[10px] !tracking-[0.16em] text-[var(--cream)]/70">{children}</ul>
    </div>
  );
}

function FooterLink({ label, href, tag }: { label: string; href: string; tag?: string }) {
  return (
    <li>
      <Link href={href} className="link-underline text-left">
        {label}
        {tag && <span className="ml-2 align-middle text-[var(--accent-bright)] !text-[8px]">{tag}</span>}
      </Link>
    </li>
  );
}

export function Footer({ go: _go }: { go: Nav }) {
  return (
    <footer className="pg-footer bg-[var(--navy)] text-[var(--cream)]">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-10 lg:gap-10">
          <div className="pg-footer-identity col-span-2 lg:col-span-4">
            <Link href={urlFor('home')} aria-label="Pegasus Dreamscapes home" className="pg-footer-signature">
              <BrandMark boxClassName="w-[72px] h-[72px]" onDark />
              <div className="pg-footer-wordmark">
                <span className="pg-footer-name">Pegasus <span>Dreamscapes</span></span>
                <span className="pg-footer-descriptor">Development &middot; Investments &middot; Systems</span>
              </div>
            </Link>
            <div className="pg-footer-seal" aria-hidden="true"><span /></div>
            <p className="pg-footer-motto">
              Dream it. Build it. Live it.
            </p>
            <ul className="pg-footer-contact mt-6 space-y-2.5 pg-label !text-[10px] !tracking-[0.1em] text-[var(--cream)]/70">
              <li><a href="mailto:apollo@pegasusdreamscapes.com" className="link-underline break-all">apollo@pegasusdreamscapes.com</a></li>
              <li><a href="tel:9257448525" className="link-underline">925-744-8525</a></li>
              <li>East Bay · CA</li>
            </ul>
          </div>

          {/* Footer link map per PRD §5.2 (issue #22): the audience lanes,
              the proof + vision pages, and the legal set. */}
          <FooterCol title="Who We Serve">
            <FooterLink label="Property Owners" href={urlFor('sellers')} />
            <FooterLink label="Deal Partners" href={urlFor('dealfinders')} />
            <FooterLink label="Buyers" href={urlFor('buyers')} />
            <FooterLink label="Capital Partners" href={urlFor('capital')} />
            <FooterLink label="Operators & Vendors" href={urlFor('operators')} />
            <FooterLink label="Referral Partners" href={urlFor('referral')} />
          </FooterCol>

          <FooterCol title="Company">
            <FooterLink label="About the Firm" href={urlFor('about')} />
            <FooterLink label="How We Operate" href={urlFor('dealstrategy')} />
            <FooterLink label="Our Work" href={urlFor('ourwork')} />
            <FooterLink label="Departments" href="/departments" />
            <FooterLink label="Work With Apollo" href={urlFor('apollo')} />
            <FooterLink label="Case Study" href="/case-study" />
            <FooterLink label="The Pegasus Standard" href="/pegasus-standard" />
          </FooterCol>

          <FooterCol title="Start Here">
            {/* v5.1 §31: the primary public action. */}
            <FooterLink label="Bring an Opportunity" href="/bring-an-opportunity" />
            <FooterLink label="Strategy Lab" href={urlFor('strategylab')} />
            <FooterLink label="MarketFlow" href={urlFor('marketflow')} />
            <FooterLink label="Contact" href={urlFor('contact')} />
          </FooterCol>

          <FooterCol title="Legal">
            <FooterLink label="Privacy Policy" href="/privacy" />
            <FooterLink label="Terms" href="/terms" />
            <FooterLink label="Disclosures" href="/disclosures" />
            <FooterLink label="FAQ" href="/faq" />
          </FooterCol>
        </div>
        <div className="mt-16 pt-8 border-t border-[rgba(239,231,218,0.16)] flex flex-col gap-5">
          <p className="text-[var(--cream)]/55 text-[11px] leading-relaxed tracking-[0.03em] max-w-3xl" data-testid="text-footer-identity">
            Pegasus Dreamscapes Corp. is a real estate investment, development, and strategy company, not a real estate brokerage. This site uses Paolo &ldquo;Apollo&rdquo; Duran as a public-facing name. For license verification, CA DRE #02333658 is listed under Duran Ramirez, Paolo Ariel. The responsible broker listed in DRE records is BMP Realty Inc DBA Keller Williams Realty-East Bay. Verify current status before engagement. Licensed representation may be available only through a separate written brokerage agreement. Strategy tools and intake materials are preliminary and are not legal, tax, lending, appraisal, financial, or investment advice. Equal Housing Opportunity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between pg-label !text-[9px] !tracking-[0.16em] text-[var(--cream)]/55">
            <span>© {new Date().getFullYear()} Pegasus Dreamscapes Corp. All rights reserved.</span>
            <span>Verify license and broker details · Equal Housing Opportunity</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
