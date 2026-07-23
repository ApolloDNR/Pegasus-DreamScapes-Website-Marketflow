import React from 'react';
import { ArrowRight } from 'lucide-react';
import { BrandMark } from './primitives';
import type { Nav } from './theme';
import './about-v6.css';

const CONVICTIONS = [
  {
    number: '01',
    title: 'Write the exit first.',
    copy: 'A property is not a plan. Before structure, scope, or capital, define the finished outcome and the conditions required to reach it.',
  },
  {
    number: '02',
    title: 'Let the basis hold.',
    copy: 'Underwrite the real acquisition, renovation, carry, and disposition costs. If the opportunity only works on optimism, it does not work yet.',
  },
  {
    number: '03',
    title: 'Coordinate the right specialists.',
    copy: 'Strategy stays accountable while licensed contractors and other qualified professionals are engaged for the work their roles require.',
  },
  {
    number: '04',
    title: 'Tell the truth early.',
    copy: 'A clear no is more useful than an attractive maybe. Pegasus names the tradeoffs, the boundaries, and the next decision before momentum obscures them.',
  },
] as const;

const BOUNDARIES = [
  {
    label: 'Pegasus Dreamscapes Corp.',
    title: 'Investment, development, and strategy',
    copy: 'Pegasus Dreamscapes Corp. is a real estate investment, development, and strategy company. It is not a licensed real estate brokerage.',
  },
  {
    label: 'Licensed representation',
    title: 'Apollo through Keller Williams East Bay',
    copy: 'When buyer or seller representation is the appropriate lane, it is provided separately by Paolo “Apollo” Duran through Keller Williams Realty East Bay, CA DRE #02333658. No agency relationship is created without a written agreement.',
  },
  {
    label: 'Project delivery',
    title: 'Qualified professionals, engaged by project',
    copy: 'Construction and other specialized services are performed by appropriately licensed professionals under the agreements applicable to each project.',
  },
] as const;

export function AboutPageV6({ go }: { go: Nav }) {
  return (
    <article className="about-v6">
      <header className="ab6-arrival">
        <div className="ab6-arrival-lines" aria-hidden="true" />
        <div className="ab6-shell ab6-arrival-grid">
          <div className="ab6-arrival-main reveal">
            <div className="ab6-kicker ab6-kicker-on-dark">About Pegasus Dreamscapes</div>
            <h1>A single, accountable point of view.</h1>
            <p className="ab6-arrival-lead">
              Pegasus is a founder-led real estate operating company built for consequential property decisions—bringing the read, the plan, and the right path forward into one line of sight.
            </p>
            <div className="ab6-actions">
              <button type="button" className="ab6-button ab6-button-light" onClick={() => go('submit')}>
                Bring an Opportunity <ArrowRight aria-hidden="true" />
              </button>
              <button type="button" className="ab6-text-link ab6-text-link-light" onClick={() => go('dealstrategy')}>
                How we operate <ArrowRight aria-hidden="true" />
              </button>
            </div>
          </div>

          <aside className="ab6-arrival-aside reveal delay-100" aria-label="Pegasus operating position">
            <BrandMark boxClassName="ab6-mark" onDark />
            <p className="ab6-doctrine">
              Read the situation clearly. Write the outcome first. Build only what the numbers can carry.
            </p>
            <div className="ab6-arrival-meta">
              <span>Founder-led</span>
              <span>East Bay, California</span>
              <span>Reviewed deal by deal</span>
            </div>
          </aside>
        </div>

        <div className="ab6-arrival-rail" aria-label="Pegasus principles at a glance">
          <div className="ab6-shell">
            <span>Clarity before structure</span>
            <span>Real numbers before narrative</span>
            <span>One accountable strategy</span>
          </div>
        </div>
      </header>

      <section className="ab6-convictions" aria-labelledby="ab6-convictions-title">
        <div className="ab6-shell">
          <div className="ab6-section-intro reveal">
            <div>
              <div className="ab6-kicker">Operating convictions</div>
              <h2 id="ab6-convictions-title">Discipline before momentum.</h2>
            </div>
            <p>
              Pegasus was created around a simple belief: complex property decisions become more manageable when someone owns the whole read without pretending to perform every role.
            </p>
          </div>

          <ol className="ab6-conviction-list">
            {CONVICTIONS.map((item, index) => (
              <li key={item.number} className="reveal" style={{ animationDelay: `${index * 70}ms` }}>
                <span className="ab6-conviction-number" aria-hidden="true">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="ab6-founder" aria-labelledby="ab6-founder-title">
        <div className="ab6-shell ab6-founder-grid">
          <figure className="ab6-founder-portrait reveal">
            <img
              src="/images/founder/apollo.webp"
              alt="Paolo ‘Apollo’ Duran, founder of Pegasus Dreamscapes"
              loading="lazy"
              decoding="async"
            />
            <figcaption>Paolo “Apollo” Duran · Founder &amp; Principal</figcaption>
          </figure>

          <div className="ab6-founder-copy reveal delay-100">
            <div className="ab6-kicker">The founder</div>
            <h2 id="ab6-founder-title">The work stays personal by design.</h2>
            <p className="ab6-founder-deck">
              Apollo founded Pegasus to give complicated real estate opportunities a more coherent read—one grounded in basis, scope, timing, and the finished outcome.
            </p>
            <div className="ab6-founder-body">
              <p>
                He leads strategy and underwriting on each opportunity. The company is intentionally founder-led, with qualified professionals brought into the work when their expertise and licensing are required.
              </p>
              <p>
                When agency representation is the right lane, Apollo provides those services separately through Keller Williams Realty East Bay. The role may change by opportunity; the standard of candor does not.
              </p>
            </div>
            <div className="ab6-founder-credential">
              <span>Licensed California real estate salesperson</span>
              <strong>CA DRE #02333658</strong>
            </div>
            <div className="ab6-actions">
              <button type="button" className="ab6-button ab6-button-navy" onClick={() => go('apollo')}>
                Represent With Apollo <ArrowRight aria-hidden="true" />
              </button>
              <button type="button" className="ab6-text-link" onClick={() => go('ourwork')}>
                View the work <ArrowRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="ab6-boundary" aria-labelledby="ab6-boundary-title">
        <div className="ab6-shell">
          <div className="ab6-boundary-heading reveal">
            <div className="ab6-kicker ab6-kicker-on-dark">Credential boundary</div>
            <h2 id="ab6-boundary-title">The boundary matters.</h2>
            <p>
              Clear roles protect the quality of the decision. Pegasus distinguishes operating strategy, licensed representation, and specialized project work rather than blurring them into one claim.
            </p>
          </div>

          <div className="ab6-boundary-list">
            {BOUNDARIES.map((item, index) => (
              <article key={item.label} className="reveal" style={{ animationDelay: `${index * 70}ms` }}>
                <div className="ab6-boundary-label">{item.label}</div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
          <p className="ab6-disclosure">
            Each Keller Williams office is independently owned and operated. Strategy reviews are preliminary and are not legal, tax, lending, appraisal, financial, or investment advice.
          </p>
        </div>
      </section>

      <section className="ab6-next" aria-labelledby="ab6-next-title">
        <div className="ab6-shell ab6-next-grid">
          <div className="reveal">
            <div className="ab6-kicker">The next step</div>
            <h2 id="ab6-next-title">Bring the real situation.</h2>
          </div>
          <div className="ab6-next-copy reveal delay-100">
            <p>
              A property, a deal, or an unanswered question. Pegasus will begin with a plain read and tell you which lane—if any—fits.
            </p>
            <div className="ab6-actions">
              <button type="button" className="ab6-button ab6-button-navy" onClick={() => go('submit')}>
                Bring an Opportunity <ArrowRight aria-hidden="true" />
              </button>
              <button type="button" className="ab6-text-link" onClick={() => go('ourwork')}>
                See the evidence <ArrowRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

export default AboutPageV6;
