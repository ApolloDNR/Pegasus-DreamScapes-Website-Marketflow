import React from 'react';
import { useLocation } from 'wouter';
import { ArrowRight } from 'lucide-react';
import type { Nav } from './theme';
import {
  NELSON_COST_DISCLOSURE,
  NELSON_EXECUTION_DISCLOSURE,
  NELSON_FACTS,
  NELSON_PUBLIC_DESCRIPTION,
} from '@shared/nelson-facts';

/* ================================================================
   OUR WORK — Master Blueprint v5.1 (§11, §32.4, §32.13)
   One bounded case study, driven by the canonical Nelson public record.
   Photographs show the visible transformation. The financial register
   states only the supported figures and does not assign project roles.
   ================================================================ */

const PAIRS: Array<{ title: string; before: string; after: string; beforeAlt: string; afterAlt: string; note: string; tag?: string }> = [
  {
    title: 'The kitchen',
    before: '/images/nelson/kitchen-before.webp',
    after: '/images/nelson/kitchen-after.webp',
    beforeAlt: 'Nelson Drive kitchen before: dated galley kitchen with laminate counters',
    afterAlt: 'Nelson Drive kitchen after: deep-navy cabinetry, waterfall quartz island, statement hood',
    note: 'The finished image shows deep-navy cabinetry, a waterfall quartz island, and a statement hood.',
  },
  {
    title: 'The primary bath',
    tag: 'Built from the studs',
    before: '/images/nelson/bath-before.webp',
    after: '/images/nelson/bath-after.webp',
    beforeAlt: 'Primary bath during construction: open stud framing and rough plumbing',
    afterAlt: 'Primary bath finished: freestanding soaking tub, glass walk-in shower, warm wood paneling',
    note: 'The construction image shows exposed framing; the finished image shows a soaking tub, glass shower, and warm wood paneling.',
  },
  {
    title: 'The living space',
    before: '/images/nelson/living-before.webp',
    after: '/images/nelson/living-after.webp',
    beforeAlt: 'Living room before: dark wood paneling and a dropped soffit',
    afterAlt: 'Living room after: one open, staged great room across living, dining, and kitchen',
    note: 'The paired images show a transition from dark paneling and a dropped soffit to an open, staged living, dining, and kitchen area.',
  },
];

const dollars = (value: number) => `$${value.toLocaleString('en-US')}`;

const FINISH_STRIP: Array<[string, string]> = [
  ['/images/nelson/bath2-after.webp', 'Second bath finished with tub, glass shower, and tile surround'],
  ['/images/nelson/bed-after.webp', 'Staged bedroom with French doors and natural light'],
  ['/images/nelson/office-after.webp', 'Flexible office corner, staged with desk and reading chair'],
];

export function OurWorkPage({ go }: { go: Nav }) {
  const [, setLocation] = useLocation();
  const toIntake = (e: React.MouseEvent) => { e.preventDefault(); setLocation('/bring-an-opportunity'); };

  return (
    <div className="ow">
      {/* Hero */}
      <section className="ow-hero hv-grain">
        <div className="ow-hero-media" aria-hidden="true">
          <img src="/images/nelson/curb.webp" alt="" loading="eager" />
        </div>
        <div className="hv-wrap ow-hero-inner">
          <div className="pg-label hv-eyebrow">Our Work &middot; Completed</div>
          <h1 className="ow-h1 font-serif-display">Nelson Drive: a documented East Bay transformation.</h1>
          <p className="ow-loc pg-label">{NELSON_FACTS.name} &middot; {NELSON_FACTS.areaLabel}</p>
          <p className="hv-lead-dim">
            {NELSON_PUBLIC_DESCRIPTION} The paired photographs show visible before, construction,
            and finished conditions; they do not by themselves establish who performed each role.
          </p>
        </div>
      </section>

      {/* Thesis + numbers */}
      <section className="ow-numbers hv-pad">
        <div className="hv-wrap ow-numbers-grid reveal">
          <div>
            <div className="pg-label hv-eyebrow-copper">The public record</div>
            <h2 className="hv-h2 font-serif-display">Documented figures, with their limits intact.</h2>
            <p className="hv-muted">
              The available record supports the acquisition amount, improvement budget, subtotal
              before other costs, sale amount, and settlement month shown here.
            </p>
            <p className="hv-muted">
              It does not document every project cost, participant, contract, permit, license,
              financing term, or service relationship. No broader conclusion is stated as fact.
            </p>
          </div>
          <div>
            <dl className="hv-stack ow-stack">
              <div><dt>Acquisition</dt><dd>{dollars(NELSON_FACTS.acquired)}</dd></div>
              <div><dt>Improvement budget</dt><dd>{dollars(NELSON_FACTS.improvementBudget)}</dd></div>
              <div><dt>Basis before other costs</dt><dd>{dollars(NELSON_FACTS.totalBasisBeforeOtherCosts)}</dd></div>
              <div><dt>Sale</dt><dd>{dollars(NELSON_FACTS.salePrice)}</dd></div>
            </dl>
            <div className="hv-edge ow-edge">
              <div className="hv-edge-big font-serif-display">{dollars(NELSON_FACTS.grossSpreadBeforeOtherCosts)}</div>
              <p>gross spread before other costs, calculated from the three documented figures.</p>
            </div>
            <p className="ow-lift">{dollars(NELSON_FACTS.grossSpreadBeforeOtherCosts)} gross spread. Not net profit or return.</p>
            <p className="hv-fine">
              {NELSON_COST_DISCLOSURE}
            </p>
          </div>
        </div>
      </section>

      {/* Evidence boundary */}
      <section className="ow-operator">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow">Evidence boundary</div>
          <h2 className="hv-h2-cream font-serif-display">What the record does not assign.</h2>
          <p className="hv-lead-dim">
            {NELSON_EXECUTION_DISCLOSURE}
          </p>
        </div>
      </section>

      {/* Transformation */}
      <section className="ow-transform hv-pad-lg">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow-copper">The transformation</div>
          <h2 className="hv-h2 font-serif-display">Room by room, honestly shown.</h2>
          <div className="ow-pairs reveal">
            {PAIRS.map((p) => (
              <figure key={p.title} className="ow-pair">
                <div className="ow-pair-media">
                  <span className="ow-shot">
                    <img src={p.before} alt={p.beforeAlt} loading="lazy" />
                    <i>Before{p.tag ? ` · ${p.tag}` : ''}</i>
                  </span>
                  <span className="ow-shot ow-shot-after">
                    <img src={p.after} alt={p.afterAlt} loading="lazy" />
                    <i>After</i>
                  </span>
                </div>
                <figcaption>
                  <strong className="font-serif-display">{p.title}</strong>
                  <span>{p.note}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="ow-strip reveal">
            {FINISH_STRIP.map(([src, alt]) => (
              <img key={src} src={src} alt={alt} loading="lazy" />
            ))}
          </div>
        </div>
      </section>

      {/* Lessons */}
      <section className="ow-lessons">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow-copper">Carried forward</div>
          <p className="ow-lesson font-serif-display">
            The photographs document visible change. The financial register documents limited
            arithmetic. Neither is presented as proof of a participant&apos;s role, net profit, return,
            savings, or a result another property will repeat.
          </p>
        </div>
      </section>

      {/* Close */}
      <section className="ow-close hv-pad-lg hv-grain">
        <div className="hv-wrap">
          <h2 className="hv-h2-cream font-serif-display">
            Have a property or proposal you want to document clearly?
          </h2>
          <p className="hv-lead-dim">
            Use the intake to share facts for possible consideration. Submission does not promise
            review, response, routing, an offer, a service, or a timeline.
          </p>
          <div className="ow-close-ctas">
            <a href="/bring-an-opportunity" onClick={toIntake}
              className="btn-solid-light inline-flex items-center gap-3 px-7 py-4 pg-label !text-[10px] group">
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
