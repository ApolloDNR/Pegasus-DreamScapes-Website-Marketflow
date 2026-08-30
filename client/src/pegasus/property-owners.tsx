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
  { label: 'Significant repairs', path: 'Document the known condition, completed inspections or estimates, occupancy, and timing. Those facts can frame questions for possible consideration; they do not establish value, scope, or a Pegasus role.' },
  { label: 'Vacant property', path: 'Record when the property became vacant, the carrying-cost assumptions you know, current access, and your preferred timing. The intake does not create a sale process or closing commitment.' },
  { label: 'Inherited property', path: 'Record the known ownership, probate or trust status, decision-makers, and timing. An attorney or title professional should confirm authority and legal requirements before anyone relies on them.' },
  { label: 'Unfinished construction', path: 'Share the current condition, available plans, permits, invoices, and remaining-scope estimates. Submission does not promise a contractor, project team, purchase, budget, or completion path.' },
  { label: 'Tenant or occupancy issues', path: 'Share the occupancy facts you are authorized to disclose, including any written agreement and known dates. Tenancy rights and next steps require qualified legal and property professionals.' },
  { label: 'Code or permit concerns', path: 'Attach notices, permit records, and correspondence you already have. The local authority and qualified professionals determine status, cure requirements, cost, and timing.' },
  { label: 'Time-sensitive sale', path: 'State the target date, why it matters, and any known title, loan, or occupancy constraints. A requested date is useful context, not a promised review, response, offer, or closing.' },
  { label: 'ADU or development potential', path: 'Record parcel facts and the assumptions you want to explore. Strategy Lab can model visitor-entered assumptions directionally; local agencies and qualified professionals determine what is allowed.' },
  { label: 'A listing that is not working', path: 'Share the listing history, current agreement, feedback, condition, and your objective. The intake cannot diagnose the cause, promise representation, or create an offer.' },
];

export function PropertyOwnersPage({ go }: { go: Nav }) {
  const [, setLocation] = useLocation();
  const toIntake = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setLocation(e.currentTarget.getAttribute('href') ?? '/bring-an-opportunity');
  };
  const [idx, setIdx] = useState(0);
  const selectedSituationHref =
    `/bring-an-opportunity?intent=property&owner_situation=${encodeURIComponent(SITUATIONS[idx].label)}`;

  return (
    <div className="po">
      {/* Hero — v5.1 §9 locked promise */}
      <section className="po-hero hv-grain">
        <div className="po-hero-media" aria-hidden="true">
          <div className="po-hero-plate">
            <img
              src="/images/nelson/nelson-before-exterior-front-1280.jpg"
              alt=""
              width="1280"
              height="941"
              loading="eager"
              decoding="async"
            />
            <span>Nelson Drive &middot; before renovation &middot; real project record</span>
          </div>
        </div>
        <div className="hv-wrap">
          <div className="hv-rule" />
          <div className="pg-label hv-eyebrow">Property Owners</div>
          <h1 className="hwo-h1 font-serif-display">
            A complex property starts with accurate facts, not a promised outcome.
          </h1>
          <p className="hv-lead">
            Use the private intake to document condition, timing, ownership, occupancy, unfinished
            work, title questions, or development assumptions. Submission may be considered, but no
            written review, response, route, or offer is promised.
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
          <p className="po-hero-caption">Real project photography &middot; Nelson Drive, before renovation</p>
        </div>
      </section>

      {/* Signature: situation → path stepper */}
      <section className="po-stepper hv-pad" data-testid="situation-stepper">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow-copper">Start with the known facts</div>
          <h2 className="hv-h2 font-serif-display">Choose the situation you need to document.</h2>
          <div className="po-step-grid reveal">
            <div className="po-situations" role="group" aria-label="Common owner situations">
              {SITUATIONS.map((s, i) => (
                <button key={s.label} type="button" aria-pressed={i === idx}
                  className="po-situation" data-on={i === idx || undefined}
                  onClick={() => setIdx(i)}>
                  {s.label}
                </button>
              ))}
            </div>
            <div className="po-path" key={SITUATIONS[idx].label} aria-live="polite">
              <div className="pg-label hv-eyebrow-copper">A bounded starting point</div>
              <p className="po-path-copy font-serif-display">{SITUATIONS[idx].path}</p>
              <a href={selectedSituationHref} onClick={toIntake} className="hv-proof-link hv-link-ink">
                Start with this situation <ArrowRight className="inline h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Intake boundary — static */}
      <section className="po-process hv-pad-lg hv-grain">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow">What the intake records</div>
          <h2 className="hv-h2-cream font-serif-display">Four ways to make the submission clearer.</h2>
          <ol className="po-steps reveal">
            <li><b>Describe the property.</b> Add the address, known condition, occupancy, timing, and your objective.</li>
            <li><b>Separate facts from assumptions.</b> Label estimates and unknowns instead of presenting them as verified.</li>
            <li><b>Share only what you are authorized to share.</b> Supporting files remain subject to the site privacy terms.</li>
            <li><b>Submit without assuming an outcome.</b> Any later role, economics, or service requires separate diligence and written terms.</li>
          </ol>
        </div>
      </section>

      {/* Restraint — §9 "required restraint" as a trust panel (§32.13) */}
      <section className="po-restraint hv-pad">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow-copper">What we will not promise</div>
          <h2 className="hv-h2 font-serif-display">The limits, stated plainly.</h2>
          <p className="hv-muted">
            Submission may be considered, but no written review, response, route, or offer is promised.
            It is not a valuation, appraisal, legal opinion, foreclosure-rescue service, representation
            agreement, or closing commitment.
          </p>
        </div>
      </section>

      {/* Close */}
      <section className="po-close hv-pad-lg hv-grain">
        <div className="hv-wrap">
          <h2 className="hv-h2-cream font-serif-display">Share the facts. Keep control of the decision.</h2>
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
