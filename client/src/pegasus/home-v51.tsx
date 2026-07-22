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
/* Cinematic nocturne colonnade — painted with light, not outlined (owner note
   2026-07-19: "editorial cinematic premium, not a sketch"). Code-drawn, so it
   stays bespoke (§32.4-safe); one warm source low right, stone modeled by
   gradient, polished-floor reflection. Static per §32 restraint. */
export function ColonnadeArt({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 820 920" fill="none" preserveAspectRatio="xMidYMid slice" stroke="none">
        <defs>
          {/* stone cylinder, lit from the right */}
          <linearGradient id="hv-shaft" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#122031" />
            <stop offset="0.3" stopColor="#2b2519" />
            <stop offset="0.56" stopColor="#5d4a31" />
            <stop offset="0.8" stopColor="#9a7c54" />
            <stop offset="0.92" stopColor="#c9ab7d" />
            <stop offset="1" stopColor="#1d1710" />
          </linearGradient>
          <linearGradient id="hv-cap" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#152234" />
            <stop offset="0.55" stopColor="#6e5334" />
            <stop offset="0.86" stopColor="#c69d66" />
            <stop offset="1" stopColor="#241c12" />
          </linearGradient>
          <linearGradient id="hv-stone-v" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#101f31" />
            <stop offset="1" stopColor="#0b1726" />
          </linearGradient>
          <linearGradient id="hv-beam" x1="0.85" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="#d4aa6e" stopOpacity="0.13" />
            <stop offset="0.55" stopColor="#d4aa6e" stopOpacity="0.05" />
            <stop offset="1" stopColor="#d4aa6e" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="hv-dusk" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#c98d4e" stopOpacity="0.34" />
            <stop offset="0.45" stopColor="#b07a42" stopOpacity="0.14" />
            <stop offset="1" stopColor="#b07a42" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hv-horizon" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#c9945a" stopOpacity="0" />
            <stop offset="0.4" stopColor="#c9945a" stopOpacity="0.16" />
            <stop offset="0.75" stopColor="#dfb37c" stopOpacity="0.26" />
            <stop offset="1" stopColor="#c9945a" stopOpacity="0.1" />
          </linearGradient>
          {/* left-edge depth wash so the temple recedes toward the headline */}
          <linearGradient id="hv-wash" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#091421" stopOpacity="0.62" />
            <stop offset="0.45" stopColor="#091421" stopOpacity="0.2" />
            <stop offset="1" stopColor="#091421" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hv-refl-fade" x1="0" y1="782" x2="0" y2="898" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="hv-refl-mask">
            <rect x="0" y="778" width="820" height="142" fill="url(#hv-refl-fade)" />
          </mask>
          <filter id="hv-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          {/* one column, painted */}
          <g id="hv-col">
            <rect x="-13" y="-20" width="88" height="8" fill="url(#hv-cap)" />
            <line x1="-13" y1="-19" x2="75" y2="-19" stroke="#e9cf9f" strokeWidth="1" opacity="0.4" />
            <rect x="-6" y="-12" width="74" height="12" fill="url(#hv-cap)" opacity="0.94" />
            <rect x="0" y="0" width="62" height="560" fill="url(#hv-shaft)" />
            <line x1="17" y1="4" x2="17" y2="556" stroke="#0a1524" strokeWidth="1.2" opacity="0.62" />
            <line x1="31" y1="4" x2="31" y2="556" stroke="#0a1524" strokeWidth="1.2" opacity="0.46" />
            <line x1="45" y1="4" x2="45" y2="556" stroke="#f0d9ae" strokeWidth="0.9" opacity="0.28" />
            <rect x="-6" y="560" width="74" height="10" fill="url(#hv-cap)" opacity="0.94" />
            <rect x="-13" y="570" width="88" height="8" fill="url(#hv-cap)" />
            <line x1="-13" y1="570" x2="75" y2="570" stroke="#e9cf9f" strokeWidth="0.9" opacity="0.3" />
          </g>
        </defs>

        {/* golden-hour atmosphere behind the temple */}
        <ellipse cx="590" cy="660" rx="520" ry="420" fill="url(#hv-dusk)" />
        <rect x="0" y="706" width="820" height="26" fill="url(#hv-horizon)" opacity="0.7" />
        {/* volumetric light falling between the columns (soft-edged) */}
        <g filter="url(#hv-soft)">
          <polygon points="560,176 820,176 820,920 300,920" fill="url(#hv-beam)" opacity="0.8" />
          <polygon points="330,176 470,176 120,920 20,920" fill="url(#hv-beam)" opacity="0.45" />
        </g>

        {/* pediment + entablature, mostly silhouette with a lit lower rim */}
        <polygon points="70,150 750,150 410,44" fill="url(#hv-stone-v)" />
        <polygon points="70,150 750,150 410,44" fill="none" stroke="#c9a84c" strokeWidth="0.8" opacity="0.34" />
        <rect x="70" y="150" width="680" height="20" fill="url(#hv-stone-v)" />
        <line x1="70" y1="170" x2="750" y2="170" stroke="#c9a84c" strokeWidth="1.3" opacity="0.6" />
        <line x1="60" y1="176" x2="760" y2="176" stroke="#e8cf9e" strokeWidth="0.8" opacity="0.22" />

        <use href="#hv-col" x="96" y="196" /><use href="#hv-col" x="232" y="196" />
        <use href="#hv-col" x="368" y="196" /><use href="#hv-col" x="504" y="196" />
        <use href="#hv-col" x="640" y="196" />
        {/* depth falloff toward the text column */}
        <rect x="60" y="40" width="480" height="740" fill="url(#hv-wash)" />

        {/* polished floor: hairlines + mirrored columns dissolving into stone */}
        <line x1="40" y1="778" x2="780" y2="778" stroke="#e8cf9e" strokeWidth="1" opacity="0.34" />
        <line x1="24" y1="800" x2="796" y2="800" stroke="#c9a84c" strokeWidth="0.9" opacity="0.2" />
        <line x1="8" y1="824" x2="812" y2="824" stroke="#e8cf9e" strokeWidth="0.8" opacity="0.1" />
        <g mask="url(#hv-refl-mask)" opacity="0.14" transform="translate(0,1556) scale(1,-1)">
          <use href="#hv-col" x="96" y="196" /><use href="#hv-col" x="232" y="196" />
          <use href="#hv-col" x="368" y="196" /><use href="#hv-col" x="504" y="196" />
          <use href="#hv-col" x="640" y="196" />
        </g>
        <ellipse cx="600" cy="810" rx="360" ry="70" fill="url(#hv-dusk)" opacity="0.5" />
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
          <circle className="hv-ring-outer" cx="380" cy="380" r="318" />
          {/* Instrument ticks at the midpoints between nodes (§32.2 signature refinement). */}
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

/* ── The Four Pillars ──────────────────────────────────────────────
   The operating company as four departments — Acquisitions, Development,
   Dispositions, Asset Management (source · build · sell · hold). Presented
   as an editorial rank beneath a cinematic marble capital (the brand's
   classical DNA, rendered as real material, not a diagram). */

type DeptKey = 'acq' | 'dev' | 'dis' | 'am';

const DEPARTMENTS: { key: DeptKey; name: string; verb: string; line: string }[] = [
  { key: 'acq', name: 'Acquisitions', verb: 'Source', line: 'We find and secure the opportunity — the overlooked, the complicated, the one that stalled.' },
  { key: 'dev', name: 'Development', verb: 'Build', line: 'We scope, permit, and build it with our own crew. We own the work, so we own the result.' },
  { key: 'dis', name: 'Dispositions', verb: 'Sell', line: 'We position and place the finished home — our list, our lane, or the right buyer for it.' },
  { key: 'am', name: 'Asset Management', verb: 'Hold', line: 'When the plan is to keep it, we stabilize, operate, and manage it for the long term.' },
];

function FourPillars() {
  return (
    <ol className="hv-dept-grid">
      {DEPARTMENTS.map((d, i) => (
        <li key={d.key} className="hv-dept">
          <span className="hv-dept-num font-serif-display">{String(i + 1).padStart(2, '0')}</span>
          <span className="hv-dept-verb pg-label">{d.verb}</span>
          <h3 className="hv-dept-name font-serif-display">{d.name}</h3>
          <p className="hv-dept-line">{d.line}</p>
        </li>
      ))}
    </ol>
  );
}

/* Engraved brass line-marks for the hero stat rail (classical, not app-generic):
   a temple front, an olive sprig, a laurel wreath, a compass rose. */
function StatIcon({ name }: { name: 'temple' | 'sprig' | 'wreath' | 'compass' }) {
  const p = {
    width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  if (name === 'temple') {
    return (
      <svg {...p}>
        <path d="M12 3 3.5 7.5h17L12 3Z" />
        <path d="M5 8v9M9 8v9M15 8v9M19 8v9" />
        <path d="M3.5 20.5h17M4.5 17.5h15" />
      </svg>
    );
  }
  if (name === 'sprig') {
    return (
      <svg {...p}>
        <path d="M12 21V8" />
        <path d="M12 13c-1.6 0-4-.7-4-3.6 2.5 0 4 1.5 4 3.6Z" />
        <path d="M12 10.5c0-2.1 1.7-4 4.2-4 .2 2.7-1.6 4-4.2 4Z" />
        <path d="M12 16.5c-1.4 0-3.2-.5-3.2-2.7 1.8 0 3.2 1 3.2 2.7Z" />
      </svg>
    );
  }
  if (name === 'wreath') {
    return (
      <svg {...p}>
        <path d="M9 20.5c-3.2-1.4-5-4.6-5-8.3S5.8 5.3 9 3.9" />
        <path d="M15 20.5c3.2-1.4 5-4.6 5-8.3S18.2 5.3 15 3.9" />
        <path d="M7 8.5c-.9.5-1.5 1.5-1.6 2.7M6.6 12.5c-.9.5-1.5 1.5-1.6 2.7M17 8.5c.9.5 1.5 1.5 1.6 2.7M17.4 12.5c.9.5 1.5 1.5 1.6 2.7" />
        <path d="M12 21.5v-3.2" />
      </svg>
    );
  }
  return (
    <svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" />
    </svg>
  );
}

export function HomePageV51({ go }: { go: Nav; openPeggy: () => void }) {
  const [, setLocation] = useLocation();
  const toIntake = (e: React.MouseEvent) => { e.preventDefault(); setLocation('/bring-an-opportunity'); };

  return (
    <div className="hv">
      {/* 1 · ARRIVAL — cinematic split: cream headline on the navy field at
          left; a classical marble terrace opening onto the East Bay at
          golden hour on the right (the brand's classical DNA meeting the
          real market). Rendered, not stock. */}
      <section className="hv-hero hv-hero-editorial hv-grain" data-hv="arrival">
        <div className="hv-hero-top">
          <div className="hv-hero-marble" aria-hidden="true">
            <img src={`${import.meta.env.BASE_URL}images/hero/bay.webp`}
              alt="" loading="eager" decoding="async" />
          </div>
          <div className="hv-wrap hv-hero-inner">
          <div className="hv-eyebrow-row">
            <span className="hv-rule" />
            <span className="pg-label hv-eyebrow">Real estate operating company<br />Contra Costa &amp; Alameda</span>
          </div>
          <h1 className="hv-h1 font-serif-display">
            {"Complex real estate, "}<br className="hv-h1-break" /><em>made executable.</em>
          </h1>
          <p className="hv-lead">
            Pegasus Dreamscapes originates, structures, and operates opportunities that require more
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
        </div>
        <div className="hv-hero-statbar">
          <ul className="hv-wrap hv-hero-facts">
            <li className="hv-fact">
              <span className="hv-fact-ic"><StatIcon name="temple" /></span>
              <span className="hv-fact-txt">
                <span className="hv-fact-k font-serif-display">Founder-led</span>
                <span className="hv-fact-v">Sourced, built, and sold in-house.</span>
              </span>
            </li>
            <li className="hv-fact">
              <span className="hv-fact-ic"><StatIcon name="sprig" /></span>
              <span className="hv-fact-txt">
                <span className="hv-fact-k font-serif-display">Nelson Drive</span>
                <span className="hv-fact-v">A 3/2 rebuilt into a 4/3.</span>
              </span>
            </li>
            <li className="hv-fact">
              <span className="hv-fact-ic"><StatIcon name="wreath" /></span>
              <span className="hv-fact-txt">
                <span className="hv-fact-k font-serif-display">East Bay</span>
                <span className="hv-fact-v">Contra Costa &amp; Alameda County.</span>
              </span>
            </li>
            <li className="hv-fact">
              <span className="hv-fact-ic"><StatIcon name="compass" /></span>
              <span className="hv-fact-txt">
                <span className="hv-fact-k font-serif-display">Strategy First</span>
                <span className="hv-fact-v">We structure the route. You own the outcome.</span>
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* SIGNATURE · THE FOUR PILLARS — a cinematic marble capital crowns the
          section (the classical DNA as real material); the four departments
          rank beneath it. No data-hv: a visual identity beat, not one of the
          seven governed movements. */}
      <section className="hv-pillars hv-grain" aria-labelledby="hv-pillars-h">
        <figure className="hv-pillars-band">
          <img src={`${import.meta.env.BASE_URL}images/marble/capital.webp`}
            alt="" loading="lazy" decoding="async" />
          <div className="hv-pillars-band-cap hv-wrap">
            <div className="pg-label hv-eyebrow">The operating company</div>
            <h2 id="hv-pillars-h" className="hv-h2-cream font-serif-display">
              Four departments hold up the whole company.
            </h2>
          </div>
        </figure>
        <div className="hv-wrap">
          <p className="hv-lead-dim hv-pillars-lead reveal">
            Source it. Build it. Sell it. Hold it. Four departments run inside one company, so a
            single opportunity can travel the whole path — first look to final outcome — without
            being handed off to strangers.
          </p>
          <FourPillars />
        </div>
      </section>

      {/* 2 · VISITOR ROUTER */}
      <section className="hv-router hv-pad" data-hv="router">
        <div className="hv-wrap">
          <div className="hv-router-head reveal">
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
        <div className="hv-wrap hv-proof-grid reveal">
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
          <div className="hv-steps reveal">
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
          <div className="hv-plan-head reveal">
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
        <div className="hv-wrap hv-partner-grid reveal">
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
        <div className="hv-wrap hv-founder-grid reveal">
          <figure className="hv-founder-photo">
            <img src="/images/founder/apollo.webp" alt="Paolo 'Apollo' Duran, founder of Pegasus Dreamscapes" loading="lazy" />
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
