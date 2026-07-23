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

type Missing = { label: string; brings: string; keeps: string };

const MISSING: Missing[] = [
  { label: 'Seller access or negotiation', brings: 'We step into the conversation as principal or alongside you, with a written read the seller can trust.', keeps: 'Your sourcing credit and your position in the deal.' },
  { label: 'Contract control', brings: 'We can take the purchase ourselves or structure control with you: agreement, option, or JV.', keeps: 'Your economics, agreed in writing before anything moves.' },
  { label: 'Underwriting', brings: 'Our own numbers on the deal: scope, comps, carry, and exit, written down and defensible.', keeps: 'The relationship. You bring the deal; the read is yours to use.' },
  { label: 'Buyer placement', brings: 'Dispositions places it with our list or through the licensed lane when a retail exit is right.', keeps: 'Source attribution on record from the moment you submit.' },
  { label: 'Capital planning', brings: 'We size and arrange the funding against the plan: debt, equity, or seller terms.', keeps: 'Your role in the deal. Capital joins the structure; it does not take it over.' },
  { label: 'Renovation execution', brings: 'Pegasus coordinates scope, budget, schedule, and the appropriately licensed project team. Nelson Drive ran at roughly half a retail bid.', keeps: 'Your deal. We execute inside the structure we agreed.' },
  { label: 'Local operations', brings: 'Contra Costa and Alameda ground presence: walkthroughs, vendors, inspections, and management.', keeps: 'Your market. We operate where you need hands, not a takeover.' },
  { label: 'Disposition or asset operations', brings: 'Exit or hold, run on plan: listing, placement, refinance, or stabilized operations.', keeps: 'The outcome split you signed, honored to the closing statement.' },
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
            You found the opportunity. We help make it executable.
          </h1>
          <p className="hv-lead">
            For deal finders, wholesalers, agents, and operating sponsors. Bring the deal with the part
            you are strong in; Pegasus supplies the missing capability, with the role and the economics
            documented before work begins.
          </p>
          <div className="hv-cta-row">
            <a href="/bring-an-opportunity?intent=deal-jv" onClick={toDeal}
              className="btn-solid-light inline-flex items-center gap-3 px-7 py-4 pg-label !text-[10px] group">
              Submit a Deal <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="/bring-an-opportunity?intent=partnership" onClick={toPartnership} className="hv-hero-link">
              Discuss an Operating Partnership
            </a>
          </div>
          <p className="dp-hero-caption">Strategy, scope, and execution &middot; Illustrative planning image</p>
        </div>
      </section>

      {/* Signature: the "what is missing?" composer */}
      <section className="dp-composer hv-pad" data-testid="missing-composer">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow-copper">Name the missing piece</div>
          <h2 className="hv-h2 font-serif-display">What does your deal lack?</h2>
          <div className="dp-composer-grid reveal">
            <div className="dp-missing" role="tablist" aria-label="What the deal is missing">
              {MISSING.map((m, i) => (
                <button key={m.label} type="button" role="tab" aria-selected={i === idx}
                  className="dp-missing-item" data-on={i === idx || undefined}
                  onClick={() => setIdx(i)}>
                  {m.label}
                </button>
              ))}
            </div>
            <div className="dp-answer" key={pick.label} aria-live="polite">
              <div className="dp-answer-block">
                <div className="pg-label hv-eyebrow-copper">Pegasus brings</div>
                <p>{pick.brings}</p>
              </div>
              <div className="dp-answer-block">
                <div className="pg-label hv-eyebrow-copper">You keep</div>
                <p>{pick.keeps}</p>
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
            <h2 className="hv-h2-cream font-serif-display">One submission. A straight answer.</h2>
            <p className="hv-lead-dim">
              Pegasus may act as principal buyer, JV participant, disposition collaborator, operating
              partner, or referral destination. Whichever it is, you hear it plainly, with written
              terms, instead of silence.
            </p>
          </div>
          <div className="dp-lane-note">
            <div className="pg-label hv-eyebrow-copper">On the record</div>
            <p>
              Source attribution is recorded at submission. Any JV, assignment, referral, or
              compensation structure must be agreed in writing before distribution.
            </p>
          </div>
        </div>
      </section>

      {/* GP / operator lane */}
      <section className="dp-gp hv-pad">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow-copper">Sponsors and operators</div>
          <h2 className="hv-h2 font-serif-display">Keep what you do well. Fill the rest.</h2>
          <p className="hv-muted">
            Pegasus can contribute sourcing, local market execution, development operations,
            underwriting, project controls, disposition, asset operations, or operating
            infrastructure. You stay the sponsor; we fill the seat the deal is missing.
          </p>
          <a href="/bring-an-opportunity?intent=partnership" onClick={toPartnership} className="hv-proof-link hv-link-ink">
            Discuss an Operating Partnership <ArrowRight className="inline h-3.5 w-3.5" />
          </a>
        </div>
      </section>

      {/* Boundary + close */}
      <section className="dp-close hv-pad-lg hv-grain">
        <div className="hv-wrap">
          <h2 className="hv-h2-cream font-serif-display">Bring the deal once. Get an answer you can act on.</h2>
          <p className="hv-lead-dim">
            Pegasus does not perform brokerage activity for another party outside the appropriate
            licensed relationship. The role is documented first; the work follows.
          </p>
          <div className="ow-close-ctas">
            <a href="/bring-an-opportunity?intent=deal-jv" onClick={toDeal}
              className="btn-solid-light inline-flex items-center gap-3 px-7 py-4 pg-label !text-[10px] group">
              Submit a Deal <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
            <button type="button" className="hv-hero-link" onClick={() => go('ourwork')}>
              See how we executed Nelson Drive
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
