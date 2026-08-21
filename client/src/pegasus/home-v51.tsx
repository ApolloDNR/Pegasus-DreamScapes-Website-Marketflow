import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, Compass, House, MapPin, UserRound } from 'lucide-react';
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
  { key: 'control', label: 'Control', caption: 'Acquisitions steps in to secure the contract, with underwriting behind it.', lights: ['control', 'underwriting'] },
  { key: 'underwriting', label: 'Underwriting', caption: 'We run the numbers ourselves. Real comps, real costs, a written read.', lights: ['underwriting', 'capital'] },
  { key: 'buyer', label: 'Buyer', caption: 'Dispositions finds the taker: our list, our brokerage lane, or a partner.', lights: ['buyer', 'disposition'] },
  { key: 'capital', label: 'Capital', caption: 'We bring or arrange the funding, sized to the deal and the timeline.', lights: ['capital', 'underwriting'] },
  { key: 'development', label: 'Development', caption: 'Scope, budget, permits, and build, coordinated with the right licensed project team.', lights: ['development', 'local'] },
  { key: 'local', label: 'Local execution', caption: 'Boots in Contra Costa and Alameda. We walk it, we manage it.', lights: ['local', 'development'] },
  { key: 'disposition', label: 'Disposition', caption: 'Exit planned up front: sell, list, refinance, or hold.', lights: ['disposition', 'buyer'] },
  { key: 'assetops', label: 'Asset operations', caption: 'If the play is hold, we stabilize and operate it.', lights: ['assetops', 'underwriting'] },
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
          {item ? item.caption : 'Choose what your deal is missing, and see what we bring.'}
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
                <span>Real estate operating company</span>
                <span>Contra Costa &amp; Alameda</span>
              </span>
            </div>
            <h1 className="hv-h1 font-serif-display">
              Complex real estate,<br className="hv-h1-break" /> <em>made executable.</em>
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
                <span className="hv-fact-v">Sourced, built, and sold in-house.</span>
              </span>
            </li>
            <li className="hv-fact">
              <span className="hv-fact-ic"><House aria-hidden="true" /></span>
              <span className="hv-fact-txt">
                <span className="hv-fact-k font-serif-display">Nelson Drive</span>
                <span className="hv-fact-v">A 3/2 rebuild into a 4/3.</span>
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
                <span className="hv-fact-v">We structure the route. You own the outcome.</span>
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
            <p className="hv-lead-dim">
              One house, taken down to the studs. Pegasus sourced the opportunity, built the budget
              and design direction, coordinated the project, positioned the home, and carried it to sale.
            </p>
          </div>

          <div className="hv-ba">
            <figure className="hv-ba-after">
              <img src="/images/nelson/kitchen-after.webp" alt="Nelson Drive kitchen after the renovation: navy cabinetry and a waterfall island" loading="lazy" />
              <figcaption>After &middot; 4-bed / 3-bath home</figcaption>
            </figure>
            <figure>
              <img src="/images/nelson/kitchen-before.webp" alt="Nelson Drive kitchen before the renovation" loading="lazy" />
              <figcaption>Before &middot; dated 3-bed / 2-bath</figcaption>
            </figure>
          </div>

          <p className="hv-proof-thesis font-serif-display">Bought a 3/2. Sold a 4/3.</p>
          <dl className="hv-proof-facts">
            <div><dt>Acquired</dt><dd>$600,000</dd></div>
            <div><dt>In-house renovation</dt><dd>$105,000</dd></div>
            <div><dt>All-in</dt><dd>~$705,000</dd></div>
            <div><dt>Sold</dt><dd>$840,000</dd></div>
          </dl>

          <div className="hv-proof-notes">
            <p><strong>~$95K</strong> below the comparable ~$200K retail general-contractor bid.</p>
            <p>Approximately $135K above all-in cost before financing, holding, and selling costs.
              Value shown is not net profit.</p>
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
          <p className="hv-muted">The role, route, and economics stay visible from the first read through the outcome.</p>
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
          <p className="hv-method-fine">Execution is coordinated with appropriately licensed contractors and project specialists.</p>
        </div>
      </section>

      {/* 5 · OPPORTUNITY PLAN — signature */}
      <section className="hv-plan hv-pad-lg" data-hv="plan">
        <div className="hv-wrap hv-plan-layout">
          <div className="hv-plan-head reveal">
            <div className="pg-label hv-eyebrow-copper">The Opportunity Plan</div>
            <h2 className="hv-h2 font-serif-display">Strategy should become visible.</h2>
            <p className="hv-muted">
              Strategy Lab turns a first property read into a clear set of viable lanes. It exposes
              assumptions, gaps, and the next decision. It does not make promises.
            </p>
            <p className="hv-plan-contract">Every deal is missing something.</p>
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
            <h2 className="hv-h2 font-serif-display">Bring what you do well. Pegasus completes the operating picture.</h2>
            <p className="hv-muted">You do not have to hand over the whole deal. Bring the part you are strong in;
              we supply what is missing, on terms set in writing before anyone moves.</p>
            <dl className="hv-relationships">
              <div><dt>Deal finder</dt><dd>Pegasus operating support</dd></div>
              <div><dt>Specialty GP</dt><dd>Pegasus local execution</dd></div>
              <div><dt>Property owner</dt><dd>Pegasus principal review</dd></div>
              <div><dt>Capital relationship</dt><dd>Pegasus operating capability</dd></div>
              <div><dt>Contractor or specialist</dt><dd>Pegasus pipeline</dd></div>
            </dl>
            <button type="button" className="hv-text-link" onClick={() => go('dealfinders')}>
              Explore a partnership <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <p className="hv-partner-fine">Licensed representation is provided separately through Keller Williams East Bay when applicable.</p>
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
          <p className="hv-founder-statement">On Nelson Drive, Apollo sourced the deal, formed the LLC, built the budget,
            ran the schedule and vendors, set the design direction, and carried it to sale.</p>
          <dl className="hv-founder-roles">
            <div><dt>Pegasus</dt><dd>Founder, Pegasus DreamScapes</dd></div>
            <div><dt>Licensed representation</dt><dd>Real Estate Agent, Keller Williams East Bay<br />CA DRE #02333658</dd></div>
          </dl>
        </div>
      </section>
      </div>

      <section className="hv-final hv-pad-lg" data-hv="final">
        <div className="hv-wrap">
          <h2 className="hv-h2-cream font-serif-display">Bring the property, the contract, the project, or the plan.</h2>
          <p className="hv-lead-dim">We&apos;ll begin by determining what is missing and whether Pegasus is the right participant.</p>
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
