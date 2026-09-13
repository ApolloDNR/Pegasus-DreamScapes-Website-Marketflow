import React from 'react';
import { useLocation } from 'wouter';
import { ArrowRight } from 'lucide-react';
import type { Nav } from './theme';
import { ProjectGallery } from './project-gallery';
import { SectionNav } from './section-nav';
import './our-work.css';
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
    note: 'Deep-navy cabinetry, a waterfall quartz island, and a statement hood in the finished kitchen.',
  },
  {
    title: 'The primary bath',
    tag: 'During construction',
    before: '/images/nelson/bath-before.webp',
    after: '/images/nelson/bath-after.webp',
    beforeAlt: 'Primary bath during construction: open stud framing and rough plumbing',
    afterAlt: 'Primary bath finished: freestanding soaking tub, glass walk-in shower, warm wood paneling',
    note: 'From exposed framing to a freestanding tub, glass shower, and warm wood paneling.',
  },
  {
    title: 'The living space',
    before: '/images/nelson/living-before.webp',
    after: '/images/nelson/living-after.webp',
    beforeAlt: 'Living room before: dark wood paneling and a dropped soffit',
    afterAlt: 'Living room after: one open, staged great room across living, dining, and kitchen',
    note: 'Dark paneling and a dropped soffit give way to an open, staged living, dining, and kitchen area.',
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
          <h1 className="ow-h1 font-serif-display">Nelson Drive</h1>
          <p className="ow-hero-subtitle font-serif-display">An East Bay transformation</p>
          <p className="ow-loc">{NELSON_FACTS.areaLabel} &middot; Settled {NELSON_FACTS.settled}</p>
        </div>
      </section>

      <SectionNav items={[['project-record', 'The figures'], ['project-gallery', 'The photographs'], ['project-lessons', 'The takeaway']]} />

      {/* Thesis + numbers */}
      <section className="ow-numbers hv-pad" id="project-record">
        <div className="hv-wrap ow-numbers-grid reveal">
          <div>
            <div className="pg-label hv-eyebrow-copper">The figures</div>
            <h2 className="hv-h2 font-serif-display">Acquisition to sale.</h2>
            <p className="hv-muted">
              {NELSON_PUBLIC_DESCRIPTION}
            </p>
            <p className="hv-muted">
              The amounts below are the available financial record, not a complete project
              accounting. The subtotal includes acquisition and improvements only.
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
              <p>gross spread before other costs</p>
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
          <div className="pg-label hv-eyebrow">Project context</div>
          <h2 className="hv-h2-cream font-serif-display">About this case study.</h2>
          <p className="hv-lead-dim">
            {NELSON_EXECUTION_DISCLOSURE}
          </p>
        </div>
      </section>

      {/* Transformation */}
      <section className="ow-transform hv-pad-lg" id="project-gallery">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow-copper">The transformation</div>
          <h2 className="hv-h2 font-serif-display">Before, during, and after.</h2>
          <ProjectGallery pairs={PAIRS} finishes={FINISH_STRIP} />
        </div>
      </section>

      {/* Lessons */}
      <section className="ow-lessons" id="project-lessons">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow-copper">The takeaway</div>
          <h2 className="hv-h2 font-serif-display">Every property has its own starting point.</h2>
          <p className="ow-lesson">
            These photographs and figures describe one property. They do not establish a
            participant&apos;s role, net profit, return, savings, or a result another property will repeat.
          </p>
        </div>
      </section>

      {/* Close */}
      <section className="ow-close hv-pad-lg hv-grain">
        <div className="hv-wrap">
          <h2 className="hv-h2-cream font-serif-display">
            What are you considering for your property?
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
