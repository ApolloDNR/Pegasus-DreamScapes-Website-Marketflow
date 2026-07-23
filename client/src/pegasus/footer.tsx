import type { ReactNode } from 'react';
import { useLocation } from 'wouter';
import type { Nav } from './theme';
import { BrandMark } from './primitives';

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="md:col-span-2">
      <div className="pg-label !text-[9px] text-[var(--accent-bright)] mb-5">{title}</div>
      <ul className="space-y-3 pg-label !text-[10px] !tracking-[0.16em] text-[var(--cream)]/70">{children}</ul>
    </div>
  );
}

function FooterLink({ label, onClick, tag }: { label: string; onClick: () => void; tag?: string }) {
  return (
    <li>
      <button type="button" onClick={onClick} className="link-underline text-left">
        {label}
        {tag && <span className="ml-2 align-middle text-[var(--accent-bright)] !text-[8px]">{tag}</span>}
      </button>
    </li>
  );
}

export function Footer({ go }: { go: Nav }) {
  const [, setLocation] = useLocation();
  return (
    <footer className="bg-[var(--navy)] text-[var(--cream)]">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10 lg:gap-12">
          <div className="col-span-2 md:col-span-4">
            <button type="button" onClick={() => go('home')} className="flex items-center gap-3.5 mb-6">
              <BrandMark boxClassName="w-12 h-12" onDark />
              <div className="flex flex-col leading-none text-left">
                <span className="font-serif-display text-[24px] tracking-[0.05em]">Pegasus Dreamscapes</span>
                <span className="pg-label !text-[9px] !tracking-[0.34em] text-[var(--accent-bright)] mt-1.5">Development &middot; Investments &middot; Systems</span>
              </div>
            </button>
            <p className="font-serif-display italic text-xl text-[var(--cream)]/80 max-w-sm leading-snug">
              Dream it. Build it. Live it.
            </p>
            <ul className="mt-6 space-y-2.5 pg-label !text-[10px] !tracking-[0.16em] text-[var(--cream)]/70">
              <li><a href="mailto:apollo@pegasusdreamscapes.com" className="link-underline break-all">apollo@pegasusdreamscapes.com</a></li>
              <li><a href="tel:9257448525" className="link-underline">925-744-8525</a></li>
              <li>East Bay · CA</li>
            </ul>
          </div>

          {/* Footer link map per PRD §5.2 (issue #22): the audience lanes,
              the proof + vision pages, and the legal set. */}
          <FooterCol title="Who We Serve">
            <FooterLink label="Property Owners" onClick={() => go('sellers')} />
            <FooterLink label="Deal Partners" onClick={() => go('dealfinders')} />
            <FooterLink label="Buyers" onClick={() => go('buyers')} />
            <FooterLink label="Capital Partners" onClick={() => go('capital')} />
            <FooterLink label="Operators & Vendors" onClick={() => go('operators')} />
            <FooterLink label="Referral Partners" onClick={() => go('referral')} />
          </FooterCol>

          <FooterCol title="Company">
            <FooterLink label="About the Firm" onClick={() => go('about')} />
            <FooterLink label="How We Operate" onClick={() => go('dealstrategy')} />
            <FooterLink label="Our Work" onClick={() => go('ourwork')} />
            <FooterLink label="Departments" onClick={() => setLocation('/departments')} />
            <FooterLink label="Work With Apollo" onClick={() => go('apollo')} />
            <FooterLink label="Case Study" onClick={() => setLocation('/case-study')} />
            <FooterLink label="The Pegasus Standard" onClick={() => setLocation('/pegasus-standard')} />
          </FooterCol>

          <FooterCol title="Start Here">
            {/* v5.1 §31: the primary public action. */}
            <FooterLink label="Bring an Opportunity" onClick={() => setLocation('/bring-an-opportunity')} />
            <FooterLink label="Strategy Lab" onClick={() => go('strategylab')} />
            <FooterLink label="MarketFlow" onClick={() => go('marketflow')} />
            <FooterLink label="Contact" onClick={() => go('contact')} />
          </FooterCol>

          <FooterCol title="Legal">
            <FooterLink label="Privacy Policy" onClick={() => setLocation('/privacy')} />
            <FooterLink label="Terms" onClick={() => setLocation('/terms')} />
            <FooterLink label="Disclosures" onClick={() => setLocation('/disclosures')} />
            <FooterLink label="FAQ" onClick={() => setLocation('/faq')} />
          </FooterCol>
        </div>
        <div className="mt-16 pt-8 border-t border-[rgba(239,231,218,0.16)] flex flex-col gap-5">
          <p className="text-[var(--cream)]/55 text-[11px] leading-relaxed tracking-[0.03em] max-w-3xl" data-testid="text-footer-identity">
            Pegasus Dreamscapes Corp. is a real estate investment, development, and strategy company. Pegasus Dreamscapes Corp. is not a real estate brokerage. Licensed real estate representation, when applicable, is provided by Paolo &ldquo;Apollo&rdquo; Duran through Keller Williams East Bay. CA DRE #02333658. No agency relationship is created without a written agreement. Strategy reviews are preliminary and are not legal, tax, lending, appraisal, financial, or investment advice. Each Keller Williams office is independently owned and operated. Equal Housing Opportunity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between pg-label !text-[9px] !tracking-[0.16em] text-[var(--cream)]/55">
            <span>© {new Date().getFullYear()} Pegasus Dreamscapes Corp. All rights reserved.</span>
            <span>NAR · CAR · Equal Housing Opportunity</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
