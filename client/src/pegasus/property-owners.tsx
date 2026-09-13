import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight } from 'lucide-react';
import type { Nav } from './theme';
import { ResponsiveChoiceList } from './responsive-choice-list';
import './property-owners.css';

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
      <section className="po-hero">
        <div className="po-hero-grid">
          <div className="po-hero-copy">
            <div className="pg-label po-kicker">Property Owners</div>
            <h1 className="po-title font-serif-display">
              A complex property needs a clear plan.
            </h1>
            <p className="po-hero-lead">
              Repairs, inherited ownership, unfinished work, or a difficult timeline can change the
              right path for a property. Start with your situation and objective.
            </p>
            <div className="po-hero-actions">
              <a href="/bring-an-opportunity" onClick={toIntake}
                className="btn-solid-light po-primary-action">
                Tell Us About the Property <ArrowRight aria-hidden="true" />
              </a>
              <button type="button" onClick={() => go('strategylab')} className="po-secondary-action">
                Open Strategy Lab <ArrowRight aria-hidden="true" />
              </button>
            </div>
          </div>
          <figure className="po-hero-figure">
            <img
              src="/images/nelson/nelson-before-exterior-front-1280.jpg"
              alt="Nelson Drive before renovation, with the original front entrance and garden"
              width="1280"
              height="941"
              loading="eager"
              decoding="async"
            />
            <figcaption>
              <span className="po-photo-title font-serif-display">Nelson Drive</span>
              <span>Before renovation &middot; real project photography</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Signature: situation → path stepper */}
      <section className="po-stepper hv-pad" data-testid="situation-stepper">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow-copper">Start with your situation</div>
          <h2 className="hv-h2 font-serif-display">Start with what needs to be resolved.</h2>
          <div className="po-step-grid reveal">
            <ResponsiveChoiceList id="owner-situation" label="Common owner situations" options={SITUATIONS}
              value={idx} onChange={setIdx} controls="owner-path" className="po-situations" itemClassName="po-situation" />
            <div className="po-path" id="owner-path" aria-live="polite" aria-atomic="true">
              <div className="pg-label hv-eyebrow-copper">Where to start</div>
              <h3 className="pg-choice-title font-serif-display">{SITUATIONS[idx].label}</h3>
              <p className="po-path-copy">{SITUATIONS[idx].path}</p>
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
          <h2 className="hv-h2-cream font-serif-display">A useful starting point.</h2>
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
          <div className="pg-label hv-eyebrow-copper">Before you submit</div>
          <h2 className="hv-h2 font-serif-display">The limits, stated plainly.</h2>
          <div className="po-boundary-copy">
            <p className="hv-muted">
              Pegasus considers opportunities case by case, with any acquisition, project role, or
              licensed representation defined separately.
            </p>
            <p className="hv-muted">
              Submission may be considered, but no written review, response, route, or offer is promised.
              It is not a valuation, appraisal, legal opinion, foreclosure-rescue service, representation
              agreement, or closing commitment.
            </p>
          </div>
        </div>
      </section>

      {/* Close */}
      <section className="po-close hv-pad-lg hv-grain">
        <div className="hv-wrap">
          <h2 className="hv-h2-cream font-serif-display">Share the facts. Keep control of the decision.</h2>
          <div className="po-hero-actions">
            <a href="/bring-an-opportunity" onClick={toIntake}
              className="btn-solid-light po-primary-action">
              Tell Us About the Property <ArrowRight aria-hidden="true" />
            </a>
            <button type="button" className="po-secondary-action" onClick={() => go('ourwork')}>
              See a finished project <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
