import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, Compass, House, MapPin, UserRound } from 'lucide-react';
import {
  NELSON_COST_DISCLOSURE,
  NELSON_EXECUTION_DISCLOSURE,
  NELSON_FACTS,
  NELSON_PUBLIC_DESCRIPTION,
} from '@shared/nelson-facts';
import type { Nav } from './theme';

/* ── Opportunity Plan (v5.1 §32.2) — the one signature interaction ── */

type PlanKey =
  | 'control' | 'underwriting' | 'buyer' | 'capital'
  | 'development' | 'local' | 'disposition' | 'assetops';

type PlanItem = {
  key: PlanKey;
  label: string;
  caption: string;
  /** ring nodes that brighten when this need is selected */
  lights: PlanKey[];
};

const PLAN_ITEMS: PlanItem[] = [
  { key: 'control', label: 'Control', caption: 'Test whether contract terms, access, and decision rights support further diligence.', lights: ['control', 'underwriting'] },
  { key: 'underwriting', label: 'Underwriting', caption: 'Organize supplied assumptions around price, scope, carry, exit, and unresolved evidence.', lights: ['underwriting', 'capital'] },
  { key: 'buyer', label: 'Buyer', caption: 'Identify what a potential buyer path would require; no buyer, introduction, or closing is promised.', lights: ['buyer', 'disposition'] },
  { key: 'capital', label: 'Capital', caption: 'Map the capital question without implying funding, solicitation, matching, or availability.', lights: ['capital', 'underwriting'] },
  { key: 'development', label: 'Development', caption: 'Frame scope, budget, permits, and specialist roles that would need project-specific verification.', lights: ['development', 'local'] },
  { key: 'local', label: 'Local context', caption: 'Surface location-specific constraints without promising field work or project management.', lights: ['local', 'development'] },
  { key: 'disposition', label: 'Disposition', caption: 'Compare possible sale, listing, refinance, or hold scenarios without recommending an outcome.', lights: ['disposition', 'buyer'] },
  { key: 'assetops', label: 'Asset operations', caption: 'List the operating questions a hold scenario would need to answer.', lights: ['assetops', 'underwriting'] },
];

/* Node positions on the ring (percent of the square stage). */
const NODE_POS: Record<PlanKey, { x: number; y: number }> = {
  buyer: { x: 89.5, y: 50 },
  disposition: { x: 77.9, y: 77.9 },
  assetops: { x: 50, y: 89.5 },
  local: { x: 22.1, y: 77.9 },
  control: { x: 10.5, y: 50 },
  underwriting: { x: 22.1, y: 22.1 },
  capital: { x: 50, y: 10.5 },
  development: { x: 77.9, y: 22.1 },
};

function OpportunityPlan() {
  const [active, setActive] = useState<PlanKey | null>(null);
  const item = active ? PLAN_ITEMS.find((i) => i.key === active) ?? null : null;
  const lit = new Set<PlanKey>(item ? item.lights : []);
  const state = (k: PlanKey) => (!item ? 'idle' : lit.has(k) ? 'on' : 'dim');

  return (
    <div className="hv-plan-stage" data-testid="opportunity-plan">
      <div className="hv-plan-bar">
        <span className="font-serif-display">Opportunity Plan</span>
        <span>Strategy Lab &middot; Illustrative quick read</span>
      </div>

      <div className="hv-plan-board">
        <div className="hv-plan-seed">
          <div className="pg-label hv-eyebrow">Property seed</div>
          <h3 className="font-serif-display">Start with the property.</h3>
          <dl>
            <div><dt>Location</dt><dd>East Bay, California</dd></div>
            <div><dt>Starting point</dt><dd>Property + known constraints</dd></div>
            <div><dt>Decision</dt><dd>What is the honest route?</dd></div>
          </dl>
          <p>Choose a missing capability below to reveal a possible participation path.</p>
        </div>

        <div className="hv-plan-read">
          <div className="pg-label hv-eyebrow">Quick read</div>
          <div className="hv-orbit" aria-hidden="true">
            <svg viewBox="0 0 760 760">
              <circle className="hv-ring" cx="380" cy="380" r="300" />
              <circle className="hv-ring-outer" cx="380" cy="380" r="318" />
              {Array.from({ length: 8 }, (_, i) => {
                const a = ((22.5 + i * 45) * Math.PI) / 180;
                return (
                  <line key={i} className="hv-tick"
                    x1={380 + 293 * Math.cos(a)} y1={380 + 293 * Math.sin(a)}
                    x2={380 + 307 * Math.cos(a)} y2={380 + 307 * Math.sin(a)} />
                );
              })}
              {PLAN_ITEMS.map(({ key }) => {
                const p = NODE_POS[key];
                return (
                  <line key={key} data-state={state(key)} className="hv-spoke"
                    x1="380" y1="380" x2={(p.x / 100) * 760} y2={(p.y / 100) * 760} />
                );
              })}
            </svg>
            <div className="hv-core">
              <span className="hv-core-k">Opportunity</span>
              <span className="hv-core-v">{item ? item.label : 'What is missing?'}</span>
            </div>
            {PLAN_ITEMS.map(({ key, label }) => {
              const p = NODE_POS[key];
              return (
                <span key={key} data-state={state(key)} className="hv-node"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}>{label}</span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="hv-plan-controls">
        <div className="hv-chips" role="group" aria-label="What is your deal missing?">
          {PLAN_ITEMS.map(({ key, label }) => (
            <button key={key} type="button"
              className="hv-chip" data-on={active === key || undefined}
              aria-pressed={active === key}
              onClick={() => setActive((a) => (a === key ? null : key))}>
              {label}
            </button>
          ))}
        </div>
        <p className="hv-plan-caption" aria-live="polite">
          {item ? item.caption : 'Choose a constraint to explore an illustrative planning prompt.'}
        </p>
      </div>
      <div className="hv-plan-flow" aria-hidden="true">
        <span>Property seed</span><ArrowRight className="hv-plan-flow-arrow" /><span>Strategy read</span>
        <ArrowRight className="hv-plan-flow-arrow" /><span>Participation route</span>
      </div>
    </div>
  );
}

/* ── The page ── */

export function HomePageV51({ go, openPeggy }: { go: Nav; openPeggy: () => void }) {
  const [, setLocation] = useLocation();
  const toIntake = (e: React.MouseEvent) => { e.preventDefault(); setLocation('/bring-an-opportunity'); };

  return (
    <div className="hv">
      {/* 1 · ARRIVAL */}
      <section className="hv-hero hv-hero-editorial" data-hv="arrival"
        data-hero-composition="approved-bay-colonnade-v1">
        <div className="hv-hero-top">
          <div className="hv-hero-marble" aria-hidden="true">
            <img src="/images/hero/pegasus-v6-arrival.webp"
              data-testid="approved-home-hero-image"
              width={1672} height={941} alt="" loading="eager"
              decoding="async" {...{ fetchpriority: 'high' }} />
          </div>
          <div className="hv-wrap hv-hero-inner">
            <div className="hv-eyebrow-row">
              <span className="pg-label hv-eyebrow">
                <span>Real estate strategy company</span>
                <span>Contra Costa &amp; Alameda</span>
              </span>
            </div>
            <h1 className="hv-h1 font-serif-display">
              Complex real estate,<br className="hv-h1-break" /> <em>structured clearly.</em>
            </h1>
            <div className="hv-cta-row">
              <a href="/bring-an-opportunity" onClick={toIntake}
                className="btn-solid-light inline-flex items-center gap-3 px-7 py-4 pg-label !text-[10px] group">
                Bring an Opportunity <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </a>
              <button type="button" onClick={() => go('dealstrategy')} className="hv-hero-link">
                See How We Operate <ArrowRight aria-hidden="true" className="h-3 w-3" />
              </button>
              <button type="button" onClick={() => go('strategylab')} className="hv-hero-link">
                Open Strategy Lab <ArrowRight aria-hidden="true" className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
        <div className="hv-hero-statbar">
          <ul className="hv-wrap hv-hero-facts">
            <li className="hv-fact">
              <span className="hv-fact-ic"><UserRound aria-hidden="true" /></span>
              <span className="hv-fact-txt">
                <span className="hv-fact-k font-serif-display">Founder-led</span>
                <span className="hv-fact-v">A defined point of view, published with boundaries.</span>
              </span>
            </li>
            <li className="hv-fact">
              <span className="hv-fact-ic"><House aria-hidden="true" /></span>
              <span className="hv-fact-txt">
                <span className="hv-fact-k font-serif-display">Nelson Drive</span>
                <span className="hv-fact-v">Documented $600K acquisition to $840K sale.</span>
              </span>
            </li>
            <li className="hv-fact">
              <span className="hv-fact-ic"><MapPin aria-hidden="true" /></span>
              <span className="hv-fact-txt">
                <span className="hv-fact-k font-serif-display">East Bay</span>
                <span className="hv-fact-v">Contra Costa &amp; Alameda County.</span>
              </span>
            </li>
            <li className="hv-fact">
              <span className="hv-fact-ic"><Compass aria-hidden="true" /></span>
              <span className="hv-fact-txt">
                <span className="hv-fact-k font-serif-display">Strategy first</span>
                <span className="hv-fact-v">Start with facts, constraints, roles, and written terms.</span>
              </span>
            </li>
          </ul>
          <p className="hv-hero-place">Architectural vision &middot; East Bay, California &middot; Not property inventory</p>
        </div>
      </section>

      {/* 2 · VISITOR ROUTER */}
      <section className="hv-router hv-pad" data-hv="router">
        <div className="hv-wrap hv-router-layout reveal">
          <div className="hv-router-intro">
            <div className="pg-label hv-eyebrow-copper">Start with what you have</div>
            <h2 className="hv-h2 font-serif-display">What are you bringing to Pegasus?</h2>
            <p className="hv-muted">
              The first question is not which service to buy. It is what you have, what is missing,
              and what a controlled next step should look like.
            </p>
            <button type="button" className="hv-text-link" onClick={() => openPeggy()}>
              Talk to Peggy <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="hv-route-list">
            {([
              ['A property I own', 'Condition, timing, inheritance, or a sale that is not working.', 'sellers'],
              ['A deal I found', 'A lead, a contract, or a buyer — with one piece still missing.', 'dealfinders'],
              ["A project I'm operating", 'You run the deal; you need a specific capability filled.', 'operators'],
              ['A relationship or specialty', 'Capital, trades, or professional services.', 'referral'],
            ] as const).map(([title, sub, route]) => (
              <button key={title} type="button" className="hv-route" onClick={() => go(route)}>
                <span className="hv-route-body">
                  <span className="hv-route-title font-serif-display">{title}</span>
                  <span className="hv-route-sub">{sub}</span>
                </span>
                <ArrowRight className="hv-route-arrow h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3 · PROOF — Nelson Drive */}
      <section className="hv-proof hv-pad-lg" data-hv="proof">
        <div className="hv-wrap reveal">
          <div className="hv-proof-head">
            <div>
              <div className="pg-label hv-eyebrow">Proof before aspiration &middot; Nelson Drive &middot; El Sobrante</div>
              <h2 className="hv-h2-cream font-serif-display">One property, read honestly.</h2>
            </div>
            <p className="hv-lead-dim">{NELSON_PUBLIC_DESCRIPTION}</p>
          </div>

          <div className="hv-ba">
            <figure className="hv-ba-after">
              <img src="/images/nelson/kitchen-after.webp" alt="Nelson Drive kitchen after the renovation: navy cabinetry and a waterfall island" loading="lazy" />
              <figcaption>After &middot; completed interior</figcaption>
            </figure>
            <figure>
              <img src="/images/nelson/kitchen-before.webp" alt="Nelson Drive kitchen before the renovation" loading="lazy" />
              <figcaption>Before &middot; original interior condition</figcaption>
            </figure>
          </div>

          <p className="hv-proof-thesis font-serif-display">Documented basis. Documented sale.</p>
          <dl className="hv-proof-facts">
            <div><dt>Acquired</dt><dd>${NELSON_FACTS.acquired.toLocaleString('en-US')}</dd></div>
            <div><dt>Improvement budget</dt><dd>${NELSON_FACTS.improvementBudget.toLocaleString('en-US')}</dd></div>
            <div><dt>Basis before other costs</dt><dd>${NELSON_FACTS.totalBasisBeforeOtherCosts.toLocaleString('en-US')}</dd></div>
            <div><dt>Sold</dt><dd>${NELSON_FACTS.salePrice.toLocaleString('en-US')}</dd></div>
          </dl>

          <div className="hv-proof-notes">
            <p>{NELSON_COST_DISCLOSURE}</p>
            <p>{NELSON_EXECUTION_DISCLOSURE}</p>
          </div>
          <button type="button" className="hv-proof-link" onClick={() => go('ourwork')}>
            See the full project <ArrowRight className="inline h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      {/* 4 · PEGASUS METHOD */}
      <section className="hv-method" data-hv="method">
        <div className="hv-method-media">
          <img src="/images/hall/pegasus-planning-loggia.webp"
            srcSet="/images/hall/pegasus-planning-loggia-m.webp 1080w, /images/hall/pegasus-planning-loggia.webp 3168w"
            sizes="100vw" width={3168} height={1344}
            alt="A stone planning loggia at blue hour: rolled drawings and a brass lamp on the table, the Bay and its bridges below"
            loading="lazy" decoding="async" />
          <p className="hv-method-media-copy">
            Architectural discipline. Operational clarity.
            <span>Planning loggia &middot; East Bay vision, not inventory</span>
          </p>
        </div>
        <div className="hv-method-content">
          <div className="pg-label hv-eyebrow-copper">How we work</div>
          <h2 className="hv-h2 font-serif-display">A method, not a script.</h2>
          <p className="hv-muted">The framework keeps roles, assumptions, decision points, and economics visible without promising a service or outcome.</p>
          <ol className="hv-steps reveal" aria-label="The Pegasus method">
            {([
              ['Originate', 'Find, receive, or develop the opportunity.'],
              ['Structure', 'Set the role, strategy, control, economics, and approvals.'],
              ['Operate', 'Activate the capabilities and manage the execution.'],
              ['Realize', 'Acquire, sell, assign, refinance, hold, represent, refer, or pass.'],
              ['Learn', 'Turn the outcome into proof, intelligence, and a better system.'],
            ] as const).map(([title, sub]) => (
              <li key={title} className="hv-step">
                <h3 className="font-serif-display">{title}</h3>
                <p>{sub}</p>
              </li>
            ))}
          </ol>
          <p className="hv-method-fine">Any specialist work requires separate project agreements and appropriate qualification or licensing; this framework does not imply a standing team or available capacity.</p>
        </div>
      </section>

      {/* 5 · OPPORTUNITY PLAN — signature */}
      <section className="hv-plan hv-pad-lg" data-hv="plan">
        <div className="hv-wrap hv-plan-layout">
          <div className="hv-plan-head reveal">
            <div className="pg-label hv-eyebrow-copper">The Opportunity Plan</div>
            <h2 className="hv-h2 font-serif-display">Strategy should become visible.</h2>
            <p className="hv-muted">
              Strategy Lab organizes user-supplied inputs into illustrative planning lanes. It can
              expose assumptions and missing evidence, but it is not a valuation, advice, or a promise of human review.
            </p>
            <p className="hv-plan-contract">Most opportunities have a constraint to resolve.</p>
            <div className="hv-plan-actions">
              <button type="button" className="hv-plan-primary inline-flex items-center gap-3 px-7 py-4 pg-label !text-[10px]"
                onClick={() => go('strategylab')}>
                Open Strategy Lab <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="hv-text-link" onClick={() => openPeggy()}>
                Talk to Peggy <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="hv-plan-legal">Illustrative Quick Read. A route is not a commitment to participate in any deal.</p>
          </div>
          <OpportunityPlan />
        </div>
      </section>

      {/* 6 · PARTNER PROPOSITION + ACCOUNTABILITY */}
      <div className="hv-alignment">
      <section className="hv-partner hv-pad" data-hv="partner">
        <div className="hv-wrap hv-partner-shell reveal">
          <div className="hv-partner-copy">
            <div className="pg-label hv-eyebrow-copper">Partners</div>
            <h2 className="hv-h2 font-serif-display">Bring what you do well. Map the missing role before proposing a partnership.</h2>
            <p className="hv-muted">Describe the opportunity, your role, and the unresolved constraint. Any Pegasus participation depends on diligence, availability, alignment, and separate written terms.</p>
            <dl className="hv-relationships">
              <div><dt>Deal finder</dt><dd>Possible operating discussion</dd></div>
              <div><dt>Specialty GP</dt><dd>Role and location fit</dd></div>
              <div><dt>Property owner</dt><dd>Possible property consideration</dd></div>
              <div><dt>Capital relationship</dt><dd>Project-specific context</dd></div>
              <div><dt>Contractor or specialist</dt><dd>Vendor-profile submission</dd></div>
            </dl>
            <button type="button" className="hv-text-link" onClick={() => go('dealfinders')}>
              Explore a partnership <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <p className="hv-partner-fine">Licensed representation may be available only through a separate written brokerage agreement. CA DRE #02333658 is listed under Duran Ramirez, Paolo Ariel; responsible broker: BMP Realty Inc DBA Keller Williams Realty-East Bay. Verify current status.</p>
          </div>
        </div>
      </section>

      <section className="hv-founder" data-hv="founder">
        <div className="hv-founder-inner reveal">
          <div className="pg-label hv-eyebrow">Founder-led</div>
          <figure className="hv-founder-photo">
            <img
              src="/images/founder/apollo.webp"
              alt="Paolo 'Apollo' Duran, founder of Pegasus Dreamscapes"
              loading="lazy"
              decoding="async"
          />
          </figure>
          <h2 className="font-serif-display">Paolo &ldquo;Apollo&rdquo; Duran</h2>
          <p className="hv-founder-title">Founder, Pegasus DreamScapes</p>
          <p className="hv-founder-statement">Apollo founded Pegasus and sets its published strategy framework. Participation in any property, project, or representation request is determined separately and documented in writing.</p>
          <dl className="hv-founder-roles">
            <div><dt>Pegasus</dt><dd>Founder, Pegasus DreamScapes</dd></div>
            <div><dt>Public-facing name</dt><dd>Paolo &ldquo;Apollo&rdquo; Duran</dd></div>
            <div><dt>License record</dt><dd>Duran Ramirez, Paolo Ariel<br />CA DRE #02333658</dd></div>
            <div><dt>Responsible broker</dt><dd>BMP Realty Inc DBA Keller Williams Realty-East Bay</dd></div>
          </dl>
          <p className="hv-founder-statement">The limited public Nelson record does not identify who provided brokerage representation or every project role.</p>
        </div>
      </section>
      </div>

      <section className="hv-final hv-pad-lg" data-hv="final">
        <div className="hv-wrap">
          <h2 className="hv-h2-cream font-serif-display">Bring the property, the contract, the project, or the plan.</h2>
          <p className="hv-lead-dim">Use the intake to provide context. Submission does not create representation, confidentiality, source protection, partnership, review, or a duty to respond.</p>
          <div className="hv-final-actions">
            <a href="/bring-an-opportunity" onClick={toIntake}
              className="btn-solid-light inline-flex items-center gap-3 px-8 py-4 pg-label !text-[10px] group">
              Bring an Opportunity <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
            <button type="button" className="hv-hero-link" onClick={() => go('strategylab')}>
              Open Strategy Lab
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
