import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import type { Nav } from './theme';
import { HOME_PATHS, PUBLIC_ACTIONS, REPRESENTATION_NOTICE, SUBMISSION_NOTICE } from './public-content';
import './experience.css';
import './arrival-refinement.css';

const OpportunityPlan = lazy(() => import('./opportunity-plan').then(module => ({ default: module.OpportunityPlan })));

function DeferredOpportunityPlan() {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!host.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setReady(true); observer.disconnect(); }
    }, { rootMargin: '400px' });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  const fallback = <div className="experience-plan-placeholder">
    <h3>Opportunity Plan</h3>
    <p>Pick the question closest to your situation. Exploring is optional.</p>
    <button type="button" className="experience-link" onClick={() => setReady(true)}>Open the planning guide <ArrowRight aria-hidden="true" size={17} /></button>
  </div>;
  return <div ref={host} className="experience-plan-host">{ready ? <Suspense fallback={fallback}><OpportunityPlan /></Suspense> : fallback}</div>;
}

export function HomePageV51(_props: { go: Nav; openPeggy: () => void }) {
  return <div className="experience-home">
    <section className="experience-arrival" data-hv="arrival" data-hero-composition="approved-bay-colonnade-v1">
      <img className="experience-hero-image" src="/images/hero/pegasus-v6-arrival.webp" data-testid="approved-home-hero-image"
        width={1672} height={941} alt="" loading="eager" decoding="async" {...{ fetchpriority: 'high' }} />
      <div className="experience-wrap experience-arrival-copy">
        <p className="experience-geography">Contra Costa &amp; Alameda</p>
        <h1><span>Complex real estate,</span><br /> <em>a clear way forward.</em></h1>
        <p className="experience-intro">Property strategy, renovation insight, and execution for East Bay owners and partners. Led by Apollo Duran.</p>
        <div className="experience-actions">
          <Link href={PUBLIC_ACTIONS.opportunity.href} className="experience-button">{PUBLIC_ACTIONS.opportunity.label}<ArrowRight aria-hidden="true" size={18} /></Link>
          <Link href={PUBLIC_ACTIONS.work.href} className="experience-link">{PUBLIC_ACTIONS.work.label}<ArrowRight aria-hidden="true" size={17} /></Link>
        </div>
      </div>
      <p className="experience-wrap experience-image-notice">Architectural vision · East Bay, California · Not property inventory</p>
    </section>
    <section className="experience-orientation experience-section" data-hv="router" aria-labelledby="home-paths-title">
      <div className="experience-wrap">
        <h2 id="home-paths-title">What brings you here?</h2>
        <div className="experience-paths">{HOME_PATHS.map(path => <Link key={path.href} href={path.href} className="experience-path">
          <span><strong>{path.label}</strong><span>{path.note}</span></span><ArrowRight aria-hidden="true" size={22} />
        </Link>)}</div>
      </div>
    </section>
    <section className="experience-evidence experience-section" data-hv="proof" aria-labelledby="home-proof-title">
      <div className="experience-wrap">
        <div className="experience-section-head"><h2 id="home-proof-title">Nelson Drive,<br /> before and after.</h2><p>The renovation moved the cooktop to a waterfall island with seating. Navy cabinetry and a statement hood give the finished kitchen a clear focal point.</p></div>
        <div className="experience-photo-pair">
          <figure><img src="/images/nelson/kitchen-before.webp" alt="Nelson Drive kitchen before the renovation" width={1600} height={999} loading="lazy" decoding="async" /><figcaption>Before · Original kitchen</figcaption></figure>
          <figure><img src="/images/nelson/kitchen-after.webp" alt="Nelson Drive kitchen after the renovation: navy cabinetry and a waterfall island" width={1600} height={996} loading="lazy" decoding="async" /><figcaption>After · Completed interior</figcaption></figure>
        </div>
        <div className="experience-proof-note"><p>The useful comparison goes beyond the finishes: follow the original condition, the documented improvement budget, and the sale, with the limits of the record kept in view.</p><Link href="/projects/nelson-dr" className="experience-link">Explore the case study<ArrowRight aria-hidden="true" size={17} /></Link></div>
      </div>
    </section>
    <section className="experience-founder experience-section" data-hv="founder" aria-labelledby="home-founder-title">
      <div className="experience-wrap experience-founder-layout">
        <figure><img src="/images/founder/apollo.webp" alt="Apollo Duran, founder of Pegasus Dreamscapes" width={1100} height={1375} loading="lazy" decoding="async" /></figure>
        <div className="experience-founder-copy"><h2 id="home-founder-title">Apollo Duran</h2><p className="experience-founder-role">Founder, Pegasus Dreamscapes</p>
          <p>Apollo’s background is in residential construction and real estate operations. He sets Pegasus’s operating direction, bringing purchase basis, renovation scope, timing, and the intended sale or hold into the same conversation.</p>
          <p>Each accepted opportunity defines Pegasus’s role and responsibilities in writing. That is where the property strategy becomes a specific scope of work.</p>
          <Link href="/about" className="experience-link">Meet Apollo<ArrowRight aria-hidden="true" size={17} /></Link>
          <div className="experience-representation"><Link href="/work-with-apollo" className="experience-link">Buy or sell with Apollo<ArrowRight aria-hidden="true" size={17} /></Link><p className="experience-notice">{REPRESENTATION_NOTICE}</p></div>
        </div>
      </div>
    </section>
    <section className="experience-usefulness experience-section" data-hv="plan" aria-labelledby="home-tool-title">
      <div className="experience-wrap">
        <div className="experience-section-head"><h2 id="home-tool-title">A clearer view<br /> of the next move.</h2><p>Not sure where to begin? Pick a question below, or go straight to Strategy Lab.</p></div>
        <DeferredOpportunityPlan />
        <div className="experience-actions"><Link href={PUBLIC_ACTIONS.lab.href} className="experience-button">{PUBLIC_ACTIONS.lab.label}<ArrowRight aria-hidden="true" size={18} /></Link><Link href={PUBLIC_ACTIONS.tools.href} className="experience-link">{PUBLIC_ACTIONS.tools.label}<ArrowRight aria-hidden="true" size={17} /></Link></div>
      </div>
    </section>
    <section className="experience-invitation experience-section" data-hv="final" aria-labelledby="home-invitation-title">
      <div className="experience-wrap"><h2 id="home-invitation-title">Start with what you have.</h2><p>A property, a challenge, or an idea. You don’t need a finished plan.</p>
        <div className="experience-actions"><Link href={PUBLIC_ACTIONS.opportunity.href} className="experience-button">{PUBLIC_ACTIONS.opportunity.label}<ArrowRight aria-hidden="true" size={18} /></Link><Link href={PUBLIC_ACTIONS.contact.href} className="experience-link">{PUBLIC_ACTIONS.contact.label}<ArrowRight aria-hidden="true" size={17} /></Link></div>
        <p className="experience-notice">{SUBMISSION_NOTICE}</p>
      </div>
    </section>
  </div>;
}
