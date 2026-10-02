import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { ArrowDown, ArrowRight } from 'lucide-react';
import type { Nav } from './theme';
import { PUBLIC_ACTIONS, REPRESENTATION_NOTICE, SUBMISSION_NOTICE } from './public-content';
import './experience.css';
import './arrival-refinement.css';
import { BeforeYouBegin } from './journey';
import { HomePathways } from './home-pathways';
import { HomeProject } from './home-project';
import { CinematicScene } from './cinematic-scene';
import './cinematic.css';

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
    <h3>A question to start with.</h3>
    <p>Pick the question closest to your situation. Exploring is optional.</p>
    <button type="button" className="experience-link" onClick={() => setReady(true)}>Open the planning guide <ArrowRight aria-hidden="true" size={17} /></button>
  </div>;
  return <div ref={host} className="experience-plan-host">{ready ? <Suspense fallback={fallback}><OpportunityPlan /></Suspense> : fallback}</div>;
}

export function HomePageV51(_props: { go: Nav; openPeggy: () => void }) {
  return <div className="experience-home">
    <section className="experience-arrival" data-hv="arrival" data-hero-composition="approved-bay-colonnade-v1">
      <CinematicScene src="/images/hero/pegasus-v6-arrival.webp" testId="approved-home-hero-image"
        width={1672} height={941} priority imageClassName="experience-hero-image" />
      <div className="experience-wrap experience-arrival-copy">
        <p className="experience-geography">Contra Costa &amp; Alameda</p>
        <h1 data-peggy-summary="Start with the big picture: Pegasus connects property strategy, renovation insight and execution in the East Bay."><span>Complex real estate,</span><br /> <em>a clear way forward.</em></h1>
        <p className="experience-intro">Property strategy, renovation insight, and execution for East Bay owners and partners. Led by Apollo Duran.</p>
        <div className="experience-actions">
          <Link href={PUBLIC_ACTIONS.opportunity.href} className="experience-button">{PUBLIC_ACTIONS.opportunity.label}<ArrowRight aria-hidden="true" size={18} /></Link>
          <Link href={PUBLIC_ACTIONS.work.href} className="experience-link">{PUBLIC_ACTIONS.work.label}<ArrowRight aria-hidden="true" size={17} /></Link>
        </div>
      </div>
      <div className="experience-wrap cinematic-arrival-foot">
        <p className="experience-image-notice">Architectural vision · East Bay, California · Not property inventory</p>
        <a href="#home-paths-title" className="cinematic-explore"><ArrowDown size={20} aria-hidden="true" />Explore Pegasus</a>
      </div>
    </section>
    <section className="experience-orientation experience-section" data-hv="router" aria-labelledby="home-paths-title">
      <HomePathways />
    </section>
    <HomeProject />
    <section className="experience-founder experience-section" data-hv="founder" aria-labelledby="home-founder-title">
      <div className="experience-wrap experience-founder-layout">
        <figure><img src="/images/founder/apollo.webp" alt="Apollo Duran, founder of Pegasus Dreamscapes" width={1100} height={1375} loading="lazy" decoding="async" /></figure>
        <div className="experience-founder-copy"><h2 id="home-founder-title" data-peggy-summary="Meet Apollo, the founder of Pegasus Dreamscapes. Read his background and how his licensed representation work is separate.">Apollo Duran</h2><p className="experience-founder-role">Founder, Pegasus Dreamscapes</p>
          <p>Apollo’s background is in residential construction and real estate operations. He brings the property’s price, renovation needs, timing, and possible next steps into one conversation.</p>
          <p>For each accepted project, Pegasus’s role and responsibilities are agreed in writing.</p>
          <Link href="/about" className="experience-link">Meet Apollo<ArrowRight aria-hidden="true" size={17} /></Link>
          <div className="experience-representation"><Link href="/work-with-apollo" className="experience-link">Buy or sell with Apollo<ArrowRight aria-hidden="true" size={17} /></Link><p className="experience-notice">{REPRESENTATION_NOTICE}</p></div>
        </div>
      </div>
    </section>
    <section className="experience-usefulness experience-section" data-hv="plan" aria-labelledby="home-tool-title">
      <div className="experience-wrap">
        <div className="experience-section-head"><h2 id="home-tool-title" data-peggy-summary="Choose a planning question, or open Strategy Lab to work through your own assumptions. These tools help you prepare; they do not make a property decision.">A clearer view<br /> of the <em>next move.</em></h2><p>Not sure where to begin? Pick a question below, or go straight to Strategy Lab.</p></div>
        <DeferredOpportunityPlan />
        <div className="experience-actions"><Link href={PUBLIC_ACTIONS.lab.href} className="experience-button">{PUBLIC_ACTIONS.lab.label}<ArrowRight aria-hidden="true" size={18} /></Link><Link href={PUBLIC_ACTIONS.tools.href} className="experience-link">{PUBLIC_ACTIONS.tools.label}<ArrowRight aria-hidden="true" size={17} /></Link></div>
      </div>
    </section>
    <section className="experience-invitation experience-section" data-hv="final" aria-labelledby="home-invitation-title">
      <CinematicScene src="/images/hero/pegasus-v6-arrival.webp" width={1672} height={941} />
      <div className="experience-wrap"><h2 id="home-invitation-title" data-peggy-summary="When you are ready, bring your property or question forward. You can review your information before submitting it for possible consideration.">Start with<br /> what you <em>have.</em></h2><p>A property, a challenge, or an idea. You don’t need a finished plan.</p>
        <div className="experience-actions"><Link href={PUBLIC_ACTIONS.opportunity.href} className="experience-button">{PUBLIC_ACTIONS.opportunity.label}<ArrowRight aria-hidden="true" size={18} /></Link><Link href={PUBLIC_ACTIONS.contact.href} className="experience-link">{PUBLIC_ACTIONS.contact.label}<ArrowRight aria-hidden="true" size={17} /></Link></div>
        <BeforeYouBegin />
        <p className="experience-notice">{SUBMISSION_NOTICE}</p>
        <p className="cinematic-closing-caption">Architectural vision · Not property inventory</p>
      </div>
    </section>
  </div>;
}
