import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight } from 'lucide-react';
import type { Nav } from './theme';

/* ================================================================
   DEAL PARTNERS — Master Blueprint v5.1 (§10, §32.3)
   Hero from §10. Signature moment: the "what is missing?" composer —
   name the missing piece, read the capacity Pegasus can take and
   what stays yours. The wholesaler and GP lanes render statically.
   The source-attribution compliance note is preserved verbatim
   (issue #22 requirement carried forward by §21).
   ================================================================ */

type Missing = { label: string; records: string; limit: string };

const MISSING: Missing[] = [
  { label: 'Seller access or negotiation', records: 'Identify who has authority, who is represented, and the current communication status.', limit: 'Submission does not appoint Pegasus as principal, broker, negotiator, or representative.' },
  { label: 'Contract control', records: 'Identify the contract holder, relevant dates, and any known assignment, consent, option, or joint-venture restrictions.', limit: 'Recording a proposed structure is not acceptance of the contract or a commitment to participate.' },
  { label: 'Underwriting', records: 'Separate supported property facts from visitor-entered scope, comparable, carry, and exit assumptions.', limit: 'The intake is not Pegasus underwriting, a valuation, an appraisal, or an opinion that the numbers are reliable.' },
  { label: 'Buyer placement', records: 'State the distribution request, the source of the opportunity, and what authorization exists to share it.', limit: 'Submission does not provide a buyer, buyer list, distribution, brokerage, placement, or referral.' },
  { label: 'Capital planning', records: 'Describe the proposed capital need, timing, sources, and debt, equity, seller-term, or hybrid assumptions.', limit: 'The intake is not a funding commitment, securities offering, allocation, term sheet, or capital match.' },
  { label: 'Renovation execution', records: 'Share the known scope, available plans, bids, permits, schedule assumptions, and current project status.', limit: 'Submission does not provide project management, a contractor, a licensed team, a budget, or a completion schedule.' },
  { label: 'Local operations', records: 'Describe location, access, property type, current responsibilities, and the on-site gap you believe exists.', limit: 'The intake does not promise staffing, vendors, inspections, management, or local coverage.' },
  { label: 'Disposition or asset operations', records: 'Describe the proposed exit or hold path and the facts supporting that assumption.', limit: 'Submission does not create a listing, placement, refinance, management role, operating plan, or outcome split.' },
];

export function DealPartnersPage({ go }: { go: Nav }) {
  const [, setLocation] = useLocation();
  const toDeal = (e: React.MouseEvent) => { e.preventDefault(); setLocation('/bring-an-opportunity?intent=deal-jv'); };
  const toPartnership = (e: React.MouseEvent) => { e.preventDefault(); setLocation('/bring-an-opportunity?intent=partnership'); };
  const [idx, setIdx] = useState(0);
  const pick = MISSING[idx];

  return (
    <div className="dp">
      {/* Hero — v5.1 §10 locked promise */}
      <section className="dp-hero hv-grain">
        <div className="dp-hero-media" aria-hidden="true">
          <img src="/images/pegasus-craft-blueprint.webp" alt="" loading="eager" decoding="async" />
        </div>
        <div className="hv-wrap">
          <div className="hv-rule" />
          <div className="pg-label hv-eyebrow">Deal Partners</div>
          <h1 className="hwo-h1 font-serif-display">
            A credible deal submission makes the facts and the proposed role clear.
          </h1>
          <p className="hv-lead">
            Deal finders, wholesalers, agents, and operating sponsors can document an opportunity and
            proposed structure for possible private review. No response, buyer, written terms,
            distribution, funding, or closing is promised.
          </p>
          <div className="hv-cta-row">
            <a href="/bring-an-opportunity?intent=deal-jv" onClick={toDeal}
              className="btn-solid-light inline-flex items-center gap-3 px-7 py-4 pg-label !text-[10px] group">
              Submit a Deal <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="/bring-an-opportunity?intent=partnership" onClick={toPartnership} className="hv-hero-link">
              Share a Partnership Proposal
            </a>
          </div>
          <p className="dp-hero-caption">Strategy, scope, and execution &middot; Illustrative planning image</p>
        </div>
      </section>

      {/* Signature: the "what is missing?" composer */}
      <section className="dp-composer hv-pad" data-testid="missing-composer">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow-copper">Define the unresolved piece</div>
          <h2 className="hv-h2 font-serif-display">What does the submission need to explain?</h2>
          <div className="dp-composer-grid reveal">
            <div className="dp-missing" role="group" aria-label="What the deal is missing">
              {MISSING.map((m, i) => (
                <button key={m.label} type="button" aria-pressed={i === idx}
                  className="dp-missing-item" data-on={i === idx || undefined}
                  onClick={() => setIdx(i)}>
                  {m.label}
                </button>
              ))}
            </div>
            <div className="dp-answer" key={pick.label} aria-live="polite">
              <div className="dp-answer-block">
                <div className="pg-label hv-eyebrow-copper">What to document</div>
                <p>{pick.records}</p>
              </div>
              <div className="dp-answer-block">
                <div className="pg-label hv-eyebrow-copper">What this does not establish</div>
                <p>{pick.limit}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wholesaler lane */}
      <section className="dp-lane hv-pad-lg hv-grain">
        <div className="hv-wrap dp-lane-grid reveal">
          <div>
            <div className="pg-label hv-eyebrow">Deal finders and wholesalers</div>
            <h2 className="hv-h2-cream font-serif-display">One submission. One clear record.</h2>
            <p className="hv-lead-dim">
              The intake can record a proposed principal, joint-venture, disposition, operating,
              brokerage, or referral role. Actual involvement would depend on capacity, diligence,
              applicable law, and separate written terms; receipt creates none of those relationships.
            </p>
          </div>
          <div className="dp-lane-note">
            <div className="pg-label hv-eyebrow-copper">On the record</div>
            <p>
              The intake records the submitter and the information provided. Any joint venture,
              assignment, referral, distribution, representation, or compensation arrangement would
              require a separate written agreement before anyone relies on it.
            </p>
          </div>
        </div>
      </section>

      {/* GP / operator lane */}
      <section className="dp-gp hv-pad">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow-copper">Sponsors and operators</div>
          <h2 className="hv-h2 font-serif-display">Define what is in place and what remains unresolved.</h2>
          <p className="hv-muted">
            A proposal can describe sourcing, market, development, underwriting, project-control,
            disposition, asset-operation, or infrastructure needs. It should not assume Pegasus fills
            any role. A role exists only after diligence, legal compliance, capacity review, and signed terms.
          </p>
          <a href="/bring-an-opportunity?intent=partnership" onClick={toPartnership} className="hv-proof-link hv-link-ink">
            Share a Partnership Proposal <ArrowRight className="inline h-3.5 w-3.5" />
          </a>
        </div>
      </section>

      {/* Boundary + close */}
      <section className="dp-close hv-pad-lg hv-grain">
        <div className="hv-wrap">
          <h2 className="hv-h2-cream font-serif-display">Document the opportunity without assuming the outcome.</h2>
          <p className="hv-lead-dim">
            No response, buyer, written terms, distribution, funding, or closing is promised.
            Brokerage activity, if any, requires the appropriate separately documented licensed relationship.
          </p>
          <div className="ow-close-ctas">
            <a href="/bring-an-opportunity?intent=deal-jv" onClick={toDeal}
              className="btn-solid-light inline-flex items-center gap-3 px-7 py-4 pg-label !text-[10px] group">
              Submit a Deal <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
            <button type="button" className="hv-hero-link" onClick={() => go('ourwork')}>
              Review the Nelson Drive record
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
