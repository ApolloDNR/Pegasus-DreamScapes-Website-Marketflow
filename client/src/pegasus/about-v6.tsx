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
    title: 'Separate, verified, and written',
    copy: 'This site uses Paolo “Apollo” Duran as a public-facing name. CA DRE #02333658 is listed under Duran Ramirez, Paolo Ariel, with responsible broker BMP Realty Inc DBA Keller Williams Realty-East Bay. Verify current status. Representation may be available only through a separate written brokerage agreement.',
  },
  {
    label: 'Project delivery',
    title: 'Roles established project by project',
    copy: 'If construction or another specialized service is engaged, provider qualifications, licensing, scope, capacity, and responsibility must be established in separate project agreements. This page does not imply a standing team.',
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
              Pegasus is a founder-led real estate strategy company for consequential property decisions—organizing assumptions, roles, constraints, and possible paths in one line of sight.
            </p>
            <div className="ab6-actions">
              <a className="ab6-button ab6-button-light" href="/bring-an-opportunity">
                Bring an Opportunity <ArrowRight aria-hidden="true" />
              </a>
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
              <span>Possible consideration · case by case</span>
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
            {CONVICTIONS.map((item) => (
              <li key={item.number}>
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
              Apollo founded Pegasus to publish a disciplined way to frame complicated real estate opportunities—one grounded in basis, scope, timing, and the intended outcome.
            </p>
            <div className="ab6-founder-body">
              <p>
                He sets the company&apos;s published strategy framework. Whether he or Pegasus participates in a specific opportunity is determined case by case and requires the applicable written agreement.
              </p>
              <p>
                Licensed representation may be available separately. The public-facing name used here is not itself the license record: CA DRE #02333658 is listed under Duran Ramirez, Paolo Ariel, with responsible broker BMP Realty Inc DBA Keller Williams Realty-East Bay.
              </p>
            </div>
            <div className="ab6-founder-credential">
              <span>License record: Duran Ramirez, Paolo Ariel</span>
              <strong>CA DRE #02333658 · verify current status</strong>
            </div>
            <div className="ab6-actions">
              <button type="button" className="ab6-button ab6-button-navy" onClick={() => go('apollo')}>
                Ask About Representation <ArrowRight aria-hidden="true" />
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
            {BOUNDARIES.map((item) => (
              <article key={item.label}>
                <div className="ab6-boundary-label">{item.label}</div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
          <p className="ab6-disclosure">
            Pegasus is not a real estate brokerage. No agency relationship is created without a separate written brokerage agreement. Strategy tools and intake materials are educational and are not legal, tax, lending, appraisal, financial, or investment advice.
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
              Bring a property, a deal, or an unanswered question to the appropriate request path. Submission does not promise review, advice, a response, or participation.
            </p>
            <div className="ab6-actions">
              <a className="ab6-button ab6-button-navy" href="/bring-an-opportunity">
                Bring an Opportunity <ArrowRight aria-hidden="true" />
              </a>
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
