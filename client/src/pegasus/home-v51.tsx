import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight } from 'lucide-react';
import type { Nav } from './theme';

/* ================================================================
   HOMEPAGE — Master Blueprint v5.1 (§7, §32.1, §32.2)
   Seven movements: Arrival → Visitor Router → Proof → Method →
   Opportunity Plan (signature) → Partner Proposition → Founder Trust
   + Final Invitation. Copy is the approved v5.1 copy deck
   (docs/design/copy-deck/01-homepage.md). Supersedes issue #22 §6.2.

   Design: drawn-colonnade hero (bespoke SVG linework on warm navy),
   editorial light sections, one interactive signature (the Opportunity
   Plan). All motion is CSS transform/opacity; reduced-motion safe.
   ================================================================ */

/* Bespoke classical linework — the brand motif. Drawn, not stock. */
function ColonnadeArt({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 820 920" fill="none" preserveAspectRatio="xMidYMid slice"
        stroke="rgba(212,170,110,0.6)" strokeWidth="1.4">
        <polygon points="70,150 750,150 410,44" stroke="rgba(245,230,211,0.4)" />
        <line x1="70" y1="150" x2="750" y2="150" />
        <rect x="70" y="150" width="680" height="20" />
        <line x1="60" y1="176" x2="760" y2="176" stroke="rgba(245,230,211,0.24)" />
        <defs>
          <g id="hv-col">
            <rect x="0" y="0" width="62" height="560" stroke="rgba(245,230,211,0.55)" />
            <line x1="12" y1="6" x2="12" y2="554" /><line x1="24" y1="6" x2="24" y2="554" />
            <line x1="38" y1="6" x2="38" y2="554" /><line x1="50" y1="6" x2="50" y2="554" />
            <rect x="-9" y="-20" width="80" height="20" stroke="rgba(245,230,211,0.55)" />
            <rect x="-9" y="560" width="80" height="18" stroke="rgba(245,230,211,0.55)" />
          </g>
        </defs>
        <use href="#hv-col" x="96" y="196" /><use href="#hv-col" x="232" y="196" />
        <use href="#hv-col" x="368" y="196" /><use href="#hv-col" x="504" y="196" />
        <use href="#hv-col" x="640" y="196" />
        <line x1="40" y1="778" x2="780" y2="778" stroke="rgba(245,230,211,0.45)" />
        <line x1="24" y1="800" x2="796" y2="800" />
        <line x1="8" y1="824" x2="812" y2="824" stroke="rgba(245,230,211,0.24)" />
      </svg>
    </div>
  );
}

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
  { key: 'development', label: 'Development', caption: 'Scope, budget, permits, and build, run by our own crew.', lights: ['development', 'local'] },
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
      <div className="hv-orbit" aria-hidden="true">
        <svg viewBox="0 0 760 760">
          <circle className="hv-ring" cx="380" cy="380" r="300" />
          {PLAN_ITEMS.map(({ key }) => {
            const p = NODE_POS[key];
            return (
              <line key={key} data-state={state(key)} className="hv-spoke"
                x1="380" y1="380" x2={(p.x / 100) * 760} y2={(p.y / 100) * 760} />
            );
          })}
        </svg>
        <div className="hv-core">
          <span className="hv-core-k">An opportunity</span>
          <span className="hv-core-v">{item ? item.label : 'What does it need?'}</span>
        </div>
        {PLAN_ITEMS.map(({ key, label }) => {
          const p = NODE_POS[key];
          return (
            <span key={key} data-state={state(key)} className="hv-node"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}>{label}</span>
          );
        })}
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
    </div>
  );
}

/* ── The page ── */

export function HomePageV51({ go }: { go: Nav; openPeggy: () => void }) {
  const [, setLocation] = useLocation();
  const toIntake = (e: React.MouseEvent) => { e.preventDefault(); setLocation('/bring-an-opportunity'); };

  return (
    <div className="hv">
      {/* 1 · ARRIVAL */}
      <section className="hv-hero hv-grain" data-hv="arrival">
        <ColonnadeArt className="hv-colonnade" />
        <div className="hv-wrap hv-hero-inner">
          <div className="hv-rule" />
          <div className="pg-label hv-eyebrow">Real estate operating company &middot; Contra Costa &amp; Alameda</div>
          <h1 className="hv-h1 font-serif-display">Complex real estate, made executable.</h1>
          <p className="hv-lead">
            Pegasus DreamScapes originates, structures, and operates opportunities that require more
            than a conventional path. We start with the property, the people, and the economics, then
            determine the role, strategy, and structure that move it toward a controlled outcome.
          </p>
          <div className="hv-cta-row">
            <a href="/bring-an-opportunity" onClick={toIntake}
              className="btn-solid-light inline-flex items-center gap-3 px-7 py-4 pg-label !text-[10px] group">
              Bring an Opportunity <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
            <button type="button" onClick={() => go('dealstrategy')} className="hv-hero-link">
              See How Pegasus Operates
            </button>
            <button type="button" onClick={() => go('strategylab')} className="hv-hero-link">
              Open Strategy Lab
            </button>
          </div>
        </div>
        <div className="hv-wrap hv-hero-meta">
          <div><b>Founder-led.</b> Sourced, built, and sold in-house.</div>
          <div><b>Nelson Drive.</b> A 3/2 rebuilt into a 4/3.</div>
          <div><b>East Bay.</b> Contra Costa &amp; Alameda County.</div>
        </div>
      </section>

      {/* 2 · VISITOR ROUTER */}
      <section className="hv-router hv-pad" data-hv="router">
        <div className="hv-wrap">
          <div className="hv-router-head">
            <div>
              <div className="pg-label hv-eyebrow-copper">Start here</div>
              <h2 className="hv-h2 font-serif-display">What are you bringing to Pegasus?</h2>
            </div>
            <p className="hv-muted">
              Tell us where you are starting. We point you to the right path, and we remember it as you go.
            </p>
          </div>
          {([
            ['01', 'A property I own', 'Condition, timing, inheritance, or a sale that stalled.', 'sellers'],
            ['02', 'A deal I found', 'A lead, a contract, or a buyer, with one piece missing.', 'dealfinders'],
            ['03', 'A project I run', 'You run the deal. You need a specific capability filled.', 'dealfinders'],
            ['04', 'A relationship or specialty', 'Capital, trades, or professional services.', 'operators'],
          ] as const).map(([num, title, sub, route]) => (
            <button key={num} type="button" className="hv-route" onClick={() => go(route)}>
              <span className="hv-route-num font-serif-display">{num}</span>
              <span className="hv-route-body">
                <span className="hv-route-title font-serif-display">{title}</span>
                <span className="hv-route-sub">{sub}</span>
              </span>
              <ArrowRight className="hv-route-arrow h-4 w-4" />
            </button>
          ))}
        </div>
      </section>

      {/* 3 · PROOF — Nelson Drive */}
      <section className="hv-proof hv-pad-lg hv-grain" data-hv="proof">
        <div className="hv-wrap hv-proof-grid">
          <div>
            <div className="pg-label hv-eyebrow">Proof</div>
            <h2 className="hv-h2-cream font-serif-display">One house, taken down to the studs.</h2>
            <p className="hv-lead-dim">
              Nelson Drive was a tired three-bed, two-bath ranch in El Sobrante. We rebuilt it in-house
              into a four-bed, three-bath home, and sold it to a family who wanted to live there.
            </p>
            <div className="hv-ba">
              <figure>
                <img src="/images/nelson/kitchen-before.webp" alt="Nelson Drive kitchen before the rebuild" loading="lazy" />
                <figcaption>Before</figcaption>
              </figure>
              <figure className="hv-ba-after">
                <img src="/images/nelson/kitchen-after.webp" alt="Nelson Drive kitchen after the rebuild: navy cabinetry and a waterfall island" loading="lazy" />
                <figcaption>After</figcaption>
              </figure>
            </div>
            <button type="button" className="hv-proof-link" onClick={() => go('ourwork')}>
              See the full project <ArrowRight className="inline h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <dl className="hv-stack">
              <div><dt>Acquired</dt><dd>$600,000</dd></div>
              <div><dt>Built, in-house</dt><dd>$105,000</dd></div>
              <div><dt>Sold</dt><dd>$840,000</dd></div>
            </dl>
            <div className="hv-edge">
              <div className="hv-edge-big font-serif-display">~$95K</div>
              <p>under a comparable general-contractor bid. Owning the build is the difference
                between a thin flip and a real return.</p>
            </div>
            <p className="hv-fine">
              Figures from the closing statement and project records, rounded. Value shown is not net profit.
            </p>
          </div>
        </div>
      </section>

      {/* 4 · PEGASUS METHOD */}
      <section className="hv-method hv-pad" data-hv="method">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow-copper">How we work</div>
          <h2 className="hv-h2 font-serif-display">A method, not a script.</h2>
          <div className="hv-steps">
            {([
              ['01', 'Originate', 'Find, receive, or build the opportunity.'],
              ['02', 'Structure', 'Set the role, the strategy, and the terms.'],
              ['03', 'Operate', 'Bring the capital and the crew. Manage the work.'],
              ['04', 'Realize', 'Sell, hold, refinance, or pass. Decided up front.'],
              ['05', 'Learn', 'Turn the result into a better next deal.'],
            ] as const).map(([num, title, sub]) => (
              <div key={num} className="hv-step">
                <div className="hv-step-num">{num} / {title.toUpperCase()}</div>
                <h3 className="font-serif-display">{title}</h3>
                <p>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand atmosphere — the colonnade photo, mid-site by design */}
      <section className="hv-photoband" aria-label="Pegasus brand atmosphere">
        <img src="/images/hall/colonnade-hero-1600.webp"
          alt="Concept render: a warm marble colonnade at dusk. Pegasus brand atmosphere, not a current property."
          loading="lazy" />
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow">Brand atmosphere</div>
          <p className="font-serif-display">Built to a standard, not a shortcut.</p>
        </div>
      </section>

      {/* 5 · OPPORTUNITY PLAN — signature */}
      <section className="hv-plan hv-pad-lg hv-grain" data-hv="plan">
        <div className="hv-wrap">
          <div className="hv-plan-head">
            <div className="pg-label hv-eyebrow">The Opportunity Plan</div>
            <h2 className="hv-h2-cream font-serif-display">Every deal is missing something.</h2>
            <p className="hv-lead-dim">
              Tell us what a deal lacks. We show you the parts we can bring, and the ones you keep.
              Not every deal needs every piece.
            </p>
          </div>
          <OpportunityPlan />
          <p className="hv-fine hv-plan-fine">
            Illustrative. It shows how Pegasus participates, not a commitment to any deal.
          </p>
        </div>
      </section>

      {/* 6 · PARTNER PROPOSITION */}
      <section className="hv-partner hv-pad" data-hv="partner">
        <div className="hv-wrap hv-partner-grid">
          <div>
            <div className="pg-label hv-eyebrow-copper">Partners</div>
            <h2 className="hv-h2 font-serif-display">Bring what you do well. Pegasus completes the operating picture.</h2>
          </div>
          <div>
            <p className="hv-muted">
              You do not have to hand over the whole deal. Bring the part you are strong in; we supply
              what is missing, on terms set in writing before anyone moves.
            </p>
            <ul className="hv-pairs">
              <li>Deal finder + Pegasus operating support</li>
              <li>Specialty GP + Pegasus local execution</li>
              <li>Property owner + Pegasus principal review</li>
              <li>Capital relationship + Pegasus operating capability</li>
              <li>Contractor or specialist + Pegasus pipeline</li>
            </ul>
            <button type="button" className="hv-proof-link hv-link-ink" onClick={() => go('dealfinders')}>
              Explore a partnership <ArrowRight className="inline h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 7 · FOUNDER TRUST + FINAL INVITATION */}
      <section className="hv-founder hv-pad-lg" data-hv="founder">
        <div className="hv-wrap hv-founder-grid">
          <figure className="hv-founder-photo">
            <img src="/images/founder/apollo.webp" alt="Paolo 'Apollo' Duran, founder of Pegasus DreamScapes" loading="lazy" />
          </figure>
          <div>
            <div className="pg-label hv-eyebrow-copper">Founder-led</div>
            <h2 className="hv-h2 font-serif-display">You will know who you are dealing with.</h2>
            <p className="hv-muted">
              Pegasus is led by Paolo &ldquo;Apollo&rdquo; Duran. On Nelson Drive he sourced the deal,
              formed the LLC, built the budget, ran the schedule and the crew, set the design, and
              carried it to the sale. One person accountable, with a team built to repeat it.
            </p>
            <p className="hv-cred">
              Licensed representation through Keller Williams East Bay &middot; CA DRE #02333658.
              Role, terms, and any conflicts are made clear before anything begins.
            </p>
          </div>
        </div>
      </section>

      <section className="hv-final hv-pad-lg hv-grain" data-hv="final">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow">Bring it to us</div>
          <h2 className="hv-h2-cream font-serif-display">Bring the property, the deal, or the plan.</h2>
          <p className="hv-lead-dim">We read the situation, run the numbers, and tell you what it actually is.</p>
          <a href="/bring-an-opportunity" onClick={toIntake}
            className="btn-solid-light inline-flex items-center gap-3 px-8 py-4 pg-label !text-[10px] group">
            Bring an Opportunity <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </section>
    </div>
  );
}
