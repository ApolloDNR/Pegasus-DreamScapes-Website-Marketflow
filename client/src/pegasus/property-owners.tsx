import React, { useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import type { Nav } from './theme';
import { ResponsiveChoiceList } from './responsive-choice-list';
import { PageAction, PageOpening, PageClosing, ProjectEvidence } from './experience-page';
import { REPRESENTATION_NOTICE } from './public-content';

type Situation = { label: string; path: string };

const SITUATIONS: Situation[] = [
  { label: 'Significant repairs', path: 'Document the known condition, completed inspections or estimates, occupancy, and timing. Those facts can frame questions for possible consideration; they do not establish value, scope, or a Pegasus role.' },
  { label: 'Vacant property', path: 'Record when the property became vacant, the carrying-cost assumptions you know, current access, and your preferred timing. The intake does not create a sale process or closing commitment.' },
  { label: 'Inherited property', path: 'Record the known ownership, probate or trust status, decision-makers, and timing. An attorney or title professional should confirm authority and legal requirements before anyone relies on them.' },
  { label: 'Unfinished construction', path: 'Share the current condition, available plans, permits, invoices, and remaining-scope estimates. Submission does not promise a contractor, project team, purchase, budget, or completion path.' },
  { label: 'Tenant or occupancy issues', path: 'Share the occupancy facts you are authorized to disclose, including any written agreement and known dates. Tenancy rights and next steps require qualified legal and property professionals.' },
  { label: 'Code or permit concerns', path: 'Attach notices, permit records, and correspondence you already have. The local authority and qualified professionals determine status, cure requirements, cost, and timing.' },
  { label: 'Time-sensitive sale', path: 'State the target date, why it matters, and any known title, loan, or occupancy constraints. A requested date is useful context, not a promised review, response, offer, or closing.' },
  { label: 'ADU or development potential', path: 'Record parcel facts and the assumptions you want to explore. Strategy Lab can model visitor-entered assumptions directionally; local agencies and qualified professionals determine what is allowed.' },
  { label: 'A listing that is not working', path: 'Share the listing history, current agreement, feedback, condition, and your objective. The intake cannot diagnose the cause, promise representation, or create an offer.' },
];

export function PropertyOwnersPage({ go: _go }: { go: Nav }) {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const requested = new URLSearchParams(search).get('owner_situation');
  const [idx, setIdx] = useState(() => Math.max(0, SITUATIONS.findIndex(item => item.label === requested)));
  useEffect(() => { setIdx(Math.max(0, SITUATIONS.findIndex(item => item.label === requested))); }, [requested]);
  const selectSituation = (next: number) => {
    setIdx(next);
    const params = new URLSearchParams(search);
    params.set('owner_situation', SITUATIONS[next].label);
    setLocation(`/property-owners?${params.toString()}`, { replace: true });
  };
  const selectedSituationHref = `/bring-an-opportunity?intent=property&owner_situation=${encodeURIComponent(SITUATIONS[idx].label)}`;
  return <article className="experience-page po">
    <PageOpening title="A clear next step for your property." action={{ label: 'Tell us about the property', href: '/bring-an-opportunity?intent=property' }}>
      <p>Repairs, inherited ownership, unfinished work, or a difficult timeline. Start with your situation and what you want to resolve.</p>
    </PageOpening>
    <section className="ep-section" data-testid="situation-stepper">
      <div className="experience-wrap">
        <h2>What are you working through?</h2>
        <div className="ep-choice-layout">
          <ResponsiveChoiceList id="owner-situation" label="Common owner situations" options={SITUATIONS} value={idx} onChange={selectSituation} controls="owner-path" className="ep-choices" itemClassName="ep-choice" />
          <div className="ep-choice-answer" id="owner-path" aria-live="polite" aria-atomic="true">
            <h3>{SITUATIONS[idx].label}</h3><p>{SITUATIONS[idx].path}</p>
            <PageAction href={selectedSituationHref}>Start with this situation</PageAction>
          </div>
        </div>
      </div>
    </section>
    <section className="ep-section ep-dark"><div className="experience-wrap ep-split">
      <div><h2>Different paths. Clear roles.</h2><p>Pegasus considers opportunities case by case, with any acquisition, project role, or licensed representation defined separately.</p></div>
      <div><dl className="ep-rows">
        <div><dt>A possible direct acquisition</dt><dd>A purchase would require property-specific diligence, capacity, and accepted written terms.</dd></div>
        <div><dt>A project or renovation conversation</dt><dd>Scope, qualifications, permits, responsibilities, and availability must be established for the specific work.</dd></div>
        <div><dt>Selling with representation</dt><dd>Discuss a separately documented brokerage relationship with Apollo.</dd></div>
      </dl><PageAction href="/work-with-apollo" secondary>Buy or sell with Apollo</PageAction><p className="ep-notice ep-rule">{REPRESENTATION_NOTICE}</p></div>
    </div></section>
    <ProjectEvidence />
    <section className="ep-section ep-warm"><div className="experience-wrap ep-split">
      <div><h2>A useful starting point.</h2><p>Bring the facts you know. Leave estimates and unknowns clearly identified.</p></div>
      <ol className="ep-rows ep-numbered">
        <li><div><h3>Describe the property.</h3><p>Add the address, known condition, occupancy, timing, and your objective.</p></div></li>
        <li><div><h3>Share the relevant context.</h3><p>Separate facts from assumptions. Share only what you are authorized to share; supporting files remain subject to the site privacy terms.</p></div></li>
        <li><div><h3>Review before submitting.</h3><p>Any later role, economics, or service requires separate diligence and written terms.</p></div></li>
      </ol>
    </div></section>
    <PageClosing title="Tell us about the property." href={selectedSituationHref} label="Tell us about the property">
      <p className="ep-notice">Submission may be considered, but no written review, response, route, or offer is promised. It is not a valuation, appraisal, legal opinion, foreclosure-rescue service, representation agreement, or closing commitment.</p>
    </PageClosing>
  </article>;
}
