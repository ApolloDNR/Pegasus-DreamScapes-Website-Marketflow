import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight } from 'lucide-react';
import type { Nav } from './theme';

/* ================================================================
   PROPERTY OWNERS — Master Blueprint v5.1 (§9, §32.3)
   Hero and situations from §9. Signature moment: a calm
   situation-to-path stepper — pick the situation, read the honest
   path. The four-step process and the "what we will not promise"
   restraint block render statically; nothing essential is gated.
   ================================================================ */

type Situation = { label: string; path: string };

const SITUATIONS: Situation[] = [
  { label: 'Significant repairs', path: 'We price the real scope, not the fear of it. Often we buy as-is with our own crew ready; sometimes the honest answer is a light touch-up and a clean listing.' },
  { label: 'Vacant property', path: 'An empty house burns money quietly. We move on a short timeline: direct purchase, or a prepared listing with the carrying costs counted honestly.' },
  { label: 'Inherited property', path: 'Probate timing, siblings, and an old house at once. We map the estate steps with your attorney and hold the property decision until the family is actually ready.' },
  { label: 'Unfinished construction', path: 'Half-done work scares retail buyers and most investors. Our own crew can finish the scope, or we buy it standing exactly as it stands.' },
  { label: 'Tenant or occupancy issues', path: 'Occupied is workable. We buy with tenants in place, respect the tenancy rules, and never ask you to solve the hard part before the sale.' },
  { label: 'Code or permit concerns', path: 'Open permits and violations are a paperwork problem with a price. We underwrite the cure cost and carry the resolution ourselves after closing.' },
  { label: 'Time-sensitive sale', path: 'When the calendar is the pressure, certainty beats the last dollar. We give you a written read fast and close on the date the situation needs.' },
  { label: 'ADU or development potential', path: 'Unbuilt value is real but not automatic. We read the lot against local rules and tell you whether the upside is worth building, selling with, or ignoring.' },
  { label: 'A listing that is not working', path: 'Expired or sitting still usually means price, prep, or story. We tell you which one, then either fix the listing or make a direct offer.' },
];

export function PropertyOwnersPage({ go }: { go: Nav }) {
  const [, setLocation] = useLocation();
  const toIntake = (e: React.MouseEvent) => { e.preventDefault(); setLocation('/bring-an-opportunity'); };
  const [idx, setIdx] = useState(0);

  return (
    <div className="po">
      {/* Hero — v5.1 §9 locked promise */}
      <section className="po-hero hv-grain">
        <div className="hv-wrap">
          <div className="hv-rule" />
          <div className="pg-label hv-eyebrow">Property Owners</div>
          <h1 className="hwo-h1 font-serif-display">
            A difficult property does not always need a conventional solution.
          </h1>
          <p className="hv-lead">
            Pegasus acquires selected properties directly and reviews situations involving condition,
            timing, inheritance, occupancy, unfinished work, title complications, or unrealized
            development potential. You get a straight read before you commit to anything.
          </p>
          <div className="hv-cta-row">
            <a href="/bring-an-opportunity" onClick={toIntake}
              className="btn-solid-light inline-flex items-center gap-3 px-7 py-4 pg-label !text-[10px] group">
              Tell Us About the Property <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
            <button type="button" onClick={() => go('strategylab')} className="hv-hero-link">
              Open Strategy Lab
            </button>
          </div>
        </div>
      </section>

      {/* Signature: situation → path stepper */}
      <section className="po-stepper hv-pad" data-testid="situation-stepper">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow-copper">Start with the situation</div>
          <h2 className="hv-h2 font-serif-display">Pick the one that sounds like yours.</h2>
          <div className="po-step-grid">
            <div className="po-situations" role="tablist" aria-label="Common owner situations">
              {SITUATIONS.map((s, i) => (
                <button key={s.label} type="button" role="tab" aria-selected={i === idx}
                  className="po-situation" data-on={i === idx || undefined}
                  onClick={() => setIdx(i)}>
                  {s.label}
                </button>
              ))}
            </div>
            <div className="po-path" key={SITUATIONS[idx].label} aria-live="polite">
              <div className="pg-label hv-eyebrow-copper">The honest path</div>
              <p className="po-path-copy font-serif-display">{SITUATIONS[idx].path}</p>
              <a href="/bring-an-opportunity" onClick={toIntake} className="hv-proof-link hv-link-ink">
                Start with this situation <ArrowRight className="inline h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Process — §9, static */}
      <section className="po-process hv-pad-lg hv-grain">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow">What happens next</div>
          <h2 className="hv-h2-cream font-serif-display">Four steps, no pressure at any of them.</h2>
          <ol className="po-steps">
            <li><b>Tell Pegasus about the property.</b> Address, condition, timing, and what you want out of it.</li>
            <li><b>We review the facts and circumstances.</b> The numbers, the title, the tenancy, the local rules.</li>
            <li><b>We determine whether a direct purchase or another path fits.</b> Sometimes the answer is a listing, or a wait.</li>
            <li><b>The role, the economics, and the next steps are explained before commitment.</b> In writing, in plain language.</li>
          </ol>
        </div>
      </section>

      {/* Restraint — §9 "required restraint" as a trust panel (§32.13) */}
      <section className="po-restraint hv-pad">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow-copper">What we will not promise</div>
          <h2 className="hv-h2 font-serif-display">The limits, stated plainly.</h2>
          <p className="hv-muted">
            No guaranteed offer. No guaranteed closing date. We do not purchase every property, and a
            review is not a valuation, an appraisal, or foreclosure rescue. If Pegasus is not the right
            participant, we say so and point you somewhere better.
          </p>
        </div>
      </section>

      {/* Close */}
      <section className="po-close hv-pad-lg hv-grain">
        <div className="hv-wrap">
          <h2 className="hv-h2-cream font-serif-display">One conversation. A written read. Your decision.</h2>
          <div className="ow-close-ctas">
            <a href="/bring-an-opportunity" onClick={toIntake}
              className="btn-solid-light inline-flex items-center gap-3 px-7 py-4 pg-label !text-[10px] group">
              Tell Us About the Property <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
            <button type="button" className="hv-hero-link" onClick={() => go('ourwork')}>
              See a finished project
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
