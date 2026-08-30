import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowRight } from 'lucide-react';
import type { Nav } from './theme';

/* ================================================================
   HOW WE OPERATE — Master Blueprint v5.1 (§8, §32.3)
   The intellectual center of the website: the operating thesis, the
   five-stage sequence, role selection, strategy versus structure,
   and department activation. One signature moment (§32.3): the
   lifecycle rail — select a stage and it reveals what actually
   happens there. Everything essential is readable with no
   interaction; the rail deepens, it does not gate.
   ================================================================ */

type Stage = {
  num: string;
  name: string;
  claim: string;
  detail: string;
  decided: string[];
};

const STAGES: Stage[] = [
  {
    num: '01', name: 'Originate',
    claim: 'Record the opportunity and its source.',
    detail: 'An owner, deal source, or prospective partner can submit known facts and constraints. The intake creates a record; it does not promise review, confidentiality, source protection, or a response.',
    decided: ['Source information to verify', 'Known parties and permissions', 'Property facts and constraints'],
  },
  {
    num: '02', name: 'Structure',
    claim: 'Compare possible roles, strategies, and required terms.',
    detail: 'The framework asks what could happen to the property, which roles would be required, how control and capital might work, and what must be verified. Any actual role, payment, duty, or transaction requires separate diligence and written agreements.',
    decided: ['Possible role and its limits', 'Illustrative business plan', 'Required control and transaction terms'],
  },
  {
    num: '03', name: 'Operate',
    claim: 'Define required capabilities before work begins.',
    detail: 'A possible project may require acquisition, development, disposition, asset operations, capital, finance, or licensed representation. This map describes responsibilities—not current staff, a contractor bench, available capital, or promised services.',
    decided: ['Capabilities the scenario would require', 'Budget and schedule assumptions', 'Roles requiring qualified providers'],
  },
  {
    num: '04', name: 'Realize',
    claim: 'Model a possible sale, hold, refinance, or pass.',
    detail: 'Each exit scenario has different evidence, professional roles, costs, risks, approvals, and written terms. The framework compares those questions; it does not choose or execute an exit for the visitor.',
    decided: ['Exit assumptions to test', 'Economics to verify', 'Approvals and agreements required'],
  },
  {
    num: '05', name: 'Learn',
    claim: 'Compare documented actuals with prior assumptions.',
    detail: 'When verified project records are available, actual acquisition, scope, carry, disposition, and timeline data can be compared with the original model. One case study does not establish volume or predict another outcome.',
    decided: ['Actuals versus assumptions', 'Evidence worth retaining', 'Limits on future inference'],
  },
];

const ROLES: Array<[string, string]> = [
  ['Possible principal', 'A direct acquisition would require diligence, capacity, and accepted written purchase terms.'],
  ['Possible joint venture', 'Roles, control, economics, risks, and remedies would require a signed JV agreement.'],
  ['Possible co-GP', 'Any sponsor role and responsibility would be defined for the specific project.'],
  ['Possible operating role', 'Scope, authority, reporting, compensation, and performance duties would be written separately.'],
  ['Possible development role', 'Property scope, providers, permits, budget, schedule, and completion duties would require project documents.'],
  ['Licensed representation request', 'Availability is separate from Pegasus. CA DRE #02333658 is listed under Duran Ramirez, Paolo Ariel; responsible broker BMP Realty Inc DBA Keller Williams Realty-East Bay. Verify current status; agency requires a separate written agreement.'],
  ['Possible introduction', 'No referral, buyer, route, compensation, or service is promised; permission and separate written terms control.'],
];

const ACTIVATIONS: Array<[string, string]> = [
  ['Possible assignment', 'Control + authorization + separate disposition terms'],
  ['Value-add sale scenario', 'Acquisition + project controls + possible disposition'],
  ['Hold scenario', 'Acquisition + project controls + operating questions'],
  ['Ground-up sale scenario', 'Entitlements + project controls + possible disposition'],
  ['Ground-up hold scenario', 'Entitlements + project controls + operating questions'],
  ['Possible co-GP discussion', 'Project-specific role, capacity, diligence, and written terms'],
];

export function HowWeOperatePage({ go }: { go: Nav }) {
  const [, setLocation] = useLocation();
  const toIntake = (e: React.MouseEvent) => { e.preventDefault(); setLocation('/bring-an-opportunity'); };
  const [stageIdx, setStageIdx] = useState(0);
  const stage = STAGES[stageIdx];

  return (
    <div className="hwo">
      {/* Thesis */}
      <section className="hwo-hero hv-grain">
        <div className="hwo-hero-media" aria-hidden="true">
          <img src="/images/hall/pegasus-operating-loggia.webp"
            srcSet="/images/hall/pegasus-operating-loggia-m.webp 1080w, /images/hall/pegasus-operating-loggia.webp 2752w"
            sizes="100vw" width={2752} height={1536} alt="" loading="eager" decoding="async" />
        </div>
        <div className="hv-wrap">
          <div className="hv-rule" />
          <div className="pg-label hv-eyebrow">How We Operate</div>
          <h1 className="hwo-h1 font-serif-display">
            Complex opportunities fail when the pieces are fragmented.
          </h1>
          <p className="hv-lead">
            Sourcing, strategy, capital, construction, disposition, and ownership usually live in
            different hands. This page maps the questions and responsibilities that a possible path may
            require. It does not claim one team performs them or promise review, participation, or execution.
          </p>
          <p className="hwo-hero-caption">Architectural vision &middot; Not property inventory</p>
        </div>
      </section>

      {/* Signature: the lifecycle rail */}
      <section className="hwo-cycle hv-pad" data-testid="lifecycle-rail">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow-copper">The operating sequence</div>
          <h2 className="hv-h2 font-serif-display">Originate. Structure. Operate. Realize. Learn.</h2>
          <div className="hwo-rail reveal" role="group" aria-label="The five operating stages">
            {STAGES.map((s, i) => (
              <button key={s.num} type="button" aria-pressed={i === stageIdx}
                className="hwo-rail-stop" data-on={i === stageIdx || undefined}
                onClick={() => setStageIdx(i)}>
                <span className="hwo-rail-num">{s.num}</span>
                <span className="hwo-rail-name font-serif-display">{s.name}</span>
              </button>
            ))}
            <div className="hwo-rail-line" aria-hidden="true">
              <div className="hwo-rail-fill" style={{ width: `${((stageIdx + 1) / STAGES.length) * 100}%` }} />
            </div>
          </div>
          <div className="hwo-stage" key={stage.num} aria-live="polite">
            <div>
              <h3 className="hwo-stage-claim font-serif-display">{stage.claim}</h3>
              <p className="hv-muted">{stage.detail}</p>
            </div>
            <div className="hwo-stage-side">
              <div className="pg-label hv-eyebrow-copper">Questions surfaced</div>
              <ul className="hwo-decided">
                {stage.decided.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Role selection */}
      <section className="hwo-roles hv-pad-lg hv-grain">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow">Role selection</div>
          <h2 className="hv-h2-cream font-serif-display">The role is chosen, not assumed.</h2>
          <p className="hv-lead-dim">
            These are possible role structures, not current service or capacity claims. Any Pegasus role
            would depend on fit, diligence, availability, qualification, and a separate written agreement.
          </p>
          <dl className="hwo-role-list reveal">
            {ROLES.map(([name, desc]) => (
              <div key={name}><dt className="font-serif-display">{name}</dt><dd>{desc}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      {/* Strategy vs structure */}
      <section className="hwo-svss hv-pad">
        <div className="hv-wrap hwo-svss-grid reveal">
          <div>
            <div className="pg-label hv-eyebrow-copper">Strategy</div>
            <h2 className="hwo-svss-q font-serif-display">What should happen to the property?</h2>
            <p className="hv-muted">
              Renovate and sell. Rent and hold. Add the unit. List it as-is. Pass. Strategy is the
              business plan for the asset, chosen from the numbers, not from habit.
            </p>
          </div>
          <div>
            <div className="pg-label hv-eyebrow-copper">Structure</div>
            <h2 className="hwo-svss-q font-serif-display">How is it controlled, funded, and shared?</h2>
            <p className="hv-muted">
              Purchase, option, JV agreement, listing, project entity. Debt, equity, seller terms.
              Who signs, who funds, who earns what. Structure is how the strategy becomes enforceable.
            </p>
          </div>
        </div>
      </section>

      {/* Department activation */}
      <section className="hwo-activate hv-pad-lg hv-grain">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow">Illustrative role maps</div>
          <h2 className="hv-h2-cream font-serif-display">Different scenarios require different responsibilities.</h2>
          <p className="hv-lead-dim">
            These examples do not establish separate departments, headcount, available providers, or a commitment to perform the work.
          </p>
          <dl className="hwo-activate-list reveal">
            {ACTIVATIONS.map(([path, depts]) => (
              <div key={path}><dt>{path}</dt><dd>{depts}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      {/* Close */}
      <section className="hwo-close hv-pad-lg">
        <div className="hv-wrap">
          <h2 className="hv-h2 font-serif-display">Bring the context. Explore the applicable questions.</h2>
          <div className="ow-close-ctas">
            <a href="/bring-an-opportunity" onClick={toIntake}
              className="btn-primary inline-flex items-center gap-3 px-7 py-4 pg-label !text-[10px] group">
              Bring an Opportunity <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
            <button type="button" className="hv-proof-link hv-link-ink" onClick={() => go('ourwork')}>
              See it on Nelson Drive <ArrowRight className="inline h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
