import React from 'react';
import { useLocation } from 'wouter';
import { ArrowRight } from 'lucide-react';
import type { Nav } from './theme';

/* ================================================================
   OUR WORK — Master Blueprint v5.1 (§11, §32.4, §32.13)
   One excellent, verified case study beats a grid of weak proof.
   This page IS the Nelson Drive case study, built from the approved
   copy deck (docs/design/copy-deck/02-our-work-nelson-drive.md) and
   Apollo's own project photography (watermarks removed, house number
   withheld for the current owner's privacy).

   Numbers framing is the agreed §11-safe stack: transparent stack,
   the in-house edge as the featured stat, market lift stated
   precisely, never "profit".
   ================================================================ */

const PAIRS: Array<{ title: string; before: string; after: string; beforeAlt: string; afterAlt: string; note: string; tag?: string }> = [
  {
    title: 'The kitchen',
    before: '/images/nelson/kitchen-before.webp',
    after: '/images/nelson/kitchen-after.webp',
    beforeAlt: 'Nelson Drive kitchen before: dated galley kitchen with laminate counters',
    afterAlt: 'Nelson Drive kitchen after: deep-navy cabinetry, waterfall quartz island, statement hood',
    note: 'Rebuilt as the center of the home: deep-navy cabinetry, a waterfall quartz island, and a statement hood.',
  },
  {
    title: 'The primary bath',
    tag: 'Built from the studs',
    before: '/images/nelson/bath-before.webp',
    after: '/images/nelson/bath-after.webp',
    beforeAlt: 'Primary bath during construction: open stud framing and rough plumbing',
    afterAlt: 'Primary bath finished: freestanding soaking tub, glass walk-in shower, warm wood paneling',
    note: 'Taken down to the studs and rebuilt as a spa bath: a freestanding soaking tub, a glass walk-in shower, and warm wood paneling.',
  },
  {
    title: 'The living space',
    before: '/images/nelson/living-before.webp',
    after: '/images/nelson/living-after.webp',
    beforeAlt: 'Living room before: dark wood paneling and a dropped soffit',
    afterAlt: 'Living room after: one open, staged great room across living, dining, and kitchen',
    note: 'Dark paneling and a dropped soffit came out, opening one warm great room across living, dining, and kitchen.',
  },
];

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
          <h1 className="ow-h1 font-serif-display">A tired ranch, rebuilt into a home a family bought.</h1>
          <p className="ow-loc pg-label">Nelson Drive &middot; El Sobrante, CA</p>
          <p className="hv-lead-dim">
            We bought a dated three-bed, two-bath ranch with an undersized sunroom and a detached
            shed, took it down to the studs, and rebuilt it in-house as a four-bed, three-bath home.
            Here is the whole project: before, during, and after.
          </p>
        </div>
      </section>

      {/* Thesis + numbers */}
      <section className="ow-numbers hv-pad">
        <div className="hv-wrap ow-numbers-grid reveal">
          <div>
            <div className="pg-label hv-eyebrow-copper">The thesis</div>
            <h2 className="hv-h2 font-serif-display">Bought a 3/2. Sold a 4/3.</h2>
            <p className="hv-muted">
              In this market, price follows bed and bath count. The plan was simple and disciplined:
              turn dead, undersized space into a real bedroom and a real bathroom the market actually
              pays for, then sell to someone who wants to live there.
            </p>
            <p className="hv-muted">
              A comparable retail general-contractor bid for this scope came in around $200K. In-house,
              the build ran about $105K. On a project this size, that discipline is the difference
              between a thin flip and a real return.
            </p>
          </div>
          <div>
            <dl className="hv-stack ow-stack">
              <div><dt>Acquired</dt><dd>$600,000</dd></div>
              <div><dt>Renovation, in-house</dt><dd>$105,000</dd></div>
              <div><dt>All-in</dt><dd>~$705,000</dd></div>
              <div><dt>Sold</dt><dd>$840,000</dd></div>
            </dl>
            <div className="hv-edge ow-edge">
              <div className="hv-edge-big font-serif-display">~$95K</div>
              <p>saved against a comparable retail-GC bid. The operating edge: Pegasus builds, it does not just buy.</p>
            </div>
            <p className="ow-lift">~$135,000 above all-in cost, before financing, holding, and selling costs.</p>
            <p className="hv-fine">
              Figures from the closing statement and project records, rounded. Value shown is not net profit.
            </p>
          </div>
        </div>
      </section>

      {/* Operator */}
      <section className="ow-operator">
        <div className="hv-wrap">
          <div className="pg-label hv-eyebrow">The operator</div>
          <h2 className="hv-h2-cream font-serif-display">One person led it, with a team built to repeat.</h2>
          <p className="hv-lead-dim">
            Paolo &ldquo;Apollo&rdquo; Duran sourced and bought the deal, formed the LLC, built the
            budget, ran the schedule and vendors, set the design direction, and carried it to the
            sale. Construction and repairs were handled in-house, with no retail GC margin, which is
            where the cost edge comes from. Licensed representation through Keller Williams East Bay
            (CA DRE #02333658).
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
            Bed-and-bath count is the lever in this market. Dead space is opportunity when you can
            build it yourself. And the cost edge is not a trick. It is owning the execution.
          </p>
        </div>
      </section>

      {/* Close */}
      <section className="ow-close hv-pad-lg hv-grain">
        <div className="hv-wrap">
          <h2 className="hv-h2-cream font-serif-display">
            Have a property, a partnership, or a stalled project with hidden upside?
          </h2>
          <p className="hv-lead-dim">We read the situation, underwrite the numbers, and tell you what the deal actually is.</p>
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
