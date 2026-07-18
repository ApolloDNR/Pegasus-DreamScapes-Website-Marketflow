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
    claim: 'Find, receive, or build the opportunity.',
    detail: 'Deals reach us three ways: we source them, partners bring them, or owners walk in the front door. However it arrives, it gets the same first pass: the situation, the property, and the people, written down before anyone talks numbers.',
    decided: ['Where the deal came from', 'Who the parties are', 'What the pressure is'],
  },
  {
    num: '02', name: 'Structure',
    claim: 'Set the role, the strategy, and the terms.',
    detail: 'Structure is where most deals are actually won or lost. We decide what should happen to the property, in what capacity we participate, how the deal is controlled, how it is funded, and how everyone is paid. All of it in writing before material action.',
    decided: ['Our role and its limits', 'The business plan', 'Control, capital, and compensation'],
  },
  {
    num: '03', name: 'Operate',
    claim: 'Bring the capital and the crew. Manage the work.',
    detail: 'Only the capabilities the deal needs are switched on: acquisitions, development, dispositions, asset operations, capital, finance. On Nelson Drive that meant our own crew running a studs-out rebuild at roughly half a retail bid.',
    decided: ['Which departments activate', 'The schedule and the budget', 'Who is accountable for what'],
  },
  {
    num: '04', name: 'Realize',
    claim: 'Sell, hold, refinance, or pass. Decided up front.',
    detail: 'The exit is chosen at Structure, not improvised at the end. Realize is execution: list it, place it, refinance it, keep it, or walk away because the numbers said so. Passing on a deal is an outcome we respect.',
    decided: ['The exit actually taken', 'Final economics against plan', 'What each party receives'],
  },
  {
    num: '05', name: 'Learn',
    claim: 'Turn the result into a better next deal.',
    detail: 'Every closed file becomes evidence: what the scope really cost, what the market really paid, where the plan bent. That record is why the read on the next property gets sharper instead of staying a guess.',
    decided: ['Actuals versus underwriting', 'What we would repeat', 'What we will not repeat'],
  },
];

const ROLES: Array<[string, string]> = [
  ['Principal', 'We buy it ourselves and carry the outcome.'],
  ['Joint-venture partner', 'We share the deal, with the split in writing.'],
  ['Co-GP', 'We stand beside another sponsor and fill their gaps.'],
  ['Operating partner', 'You hold the deal; we run the execution.'],
  ['Development partner', 'We carry scope, permits, and build discipline.'],
  ['Licensed representative', 'Listing or buyer representation through Keller Williams East Bay.'],
  ['Referral or defined service', 'When someone else is the right fit, we route it and say so.'],
];

const ACTIVATIONS: Array<[string, string]> = [
  ['Wholesale placement', 'Acquisitions + Dispositions'],
  ['Fix and flip', 'Acquisitions + Development + Dispositions'],
  ['BRRRR', 'Acquisitions + Development + Asset Management'],
  ['Ground-up to sell', 'Acquisitions + Development + Dispositions'],
  ['Ground-up to hold', 'Acquisitions + Development + Asset Management'],
  ['Co-GP engagement', 'Custom, based on the role split'],
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
        <div className="hv-wrap">
          <div className="hv-rule" />
          <div className="pg-label hv-eyebrow">How We Operate</div>
          <h1 className="hwo-h1 font-serif-display">
            Complex opportunities fail when the pieces are fragmented.
          </h1>
          <p className="hv-lead">
            Sourcing, strategy, capital, construction, disposition, and ownership usually live in
            different hands. Pegasus coordinates the capabilities each path requires, so one accountable
            operator carries the deal from first read to final outcome.
          </p>
        </div>
      </section>

      {/* Signature: the lifecycle rail */}
      <section className="hwo-cycle hv-pad" data-testid="lifecycle-rail">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow-copper">The operating sequence</div>
          <h2 className="hv-h2 font-serif-display">Originate. Structure. Operate. Realize. Learn.</h2>
          <div className="hwo-rail reveal" role="tablist" aria-label="The five operating stages">
            {STAGES.map((s, i) => (
              <button key={s.num} type="button" role="tab" aria-selected={i === stageIdx}
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
          <div className="hwo-stage" key={stage.num}>
            <div>
              <h3 className="hwo-stage-claim font-serif-display">{stage.claim}</h3>
              <p className="hv-muted">{stage.detail}</p>
            </div>
            <div className="hwo-stage-side">
              <div className="pg-label hv-eyebrow-copper">Settled here</div>
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
            Pegasus may participate in one of several capacities. Which one is decided by the facts of
            the deal, put in writing, and never mixed.
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
          <div className="pg-label hv-eyebrow">Department activation</div>
          <h2 className="hv-h2-cream font-serif-display">Not every deal uses every department.</h2>
          <p className="hv-lead-dim">
            The selected path switches on only the capabilities it needs. A few common patterns:
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
          <h2 className="hv-h2 font-serif-display">Bring the deal. We will show you the sequence on it.</h2>
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
