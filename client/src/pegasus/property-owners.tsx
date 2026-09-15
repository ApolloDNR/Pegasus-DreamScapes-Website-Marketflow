import React, { useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import type { Nav } from './theme';
import { ResponsiveChoiceList } from './responsive-choice-list';
import { PageAction, PageOpening, PageClosing, ProjectEvidence } from './experience-page';
import { REPRESENTATION_NOTICE } from './public-content';

type Situation = { label: string; path: string; limit: string };

const SITUATIONS: Situation[] = [
  { label: 'Significant repairs', path: 'Start with the repairs you know about, whether anyone lives there, and what you want to do next. Existing inspections or estimates can help explain the condition.', limit: 'Those facts can frame questions for possible consideration; they do not establish value, scope, or a Pegasus role.' },
  { label: 'Vacant property', path: 'How long has it been empty, and what is it costing to hold? Include current access and when you would like to make a change.', limit: 'The intake does not create a sale process or closing commitment.' },
  { label: 'Inherited property', path: 'Start with who owns the property, who is involved in the decision, and any probate or trust process already underway. Include the timing you have in mind.', limit: 'An attorney or title professional should confirm authority and legal requirements before anyone relies on them.' },
  { label: 'Unfinished construction', path: 'Show where the work stands and what remains. Plans, permits, invoices, and existing estimates can help explain what has already been done.', limit: 'Submission does not promise a contractor, project team, purchase, budget, or completion path.' },
  { label: 'Tenant or occupancy issues', path: 'Describe the current occupancy and the question you need to resolve. Include relevant agreements and dates you are authorized to share.', limit: 'Tenancy rights and next steps require qualified legal and property professionals.' },
  { label: 'Code or permit concerns', path: 'Start with the notice or permit question. Include any records and correspondence you already have, along with a deadline if one applies.', limit: 'The local authority and qualified professionals determine status, cure requirements, cost, and timing.' },
  { label: 'Time-sensitive sale', path: 'What date matters, and why? Include any title, loan, or occupancy constraints that could affect the next step.', limit: 'A requested date is useful context, not a promised review, response, offer, or closing.' },
  { label: 'ADU or development potential', path: 'Describe what you would like to explore and the parcel facts you know. Strategy Lab can help compare your own cost and value assumptions.', limit: 'Strategy Lab can model visitor-entered assumptions directionally; local agencies and qualified professionals determine what is allowed.' },
  { label: 'A listing that is not working', path: 'What would you like to change? Include the listing history, buyer feedback, property condition, and any current representation agreement.', limit: 'The intake cannot diagnose the cause, promise representation, or create an offer.' },
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
            <p className="ep-notice">{SITUATIONS[idx].limit}</p>
          </div>
        </div>
      </div>
    </section>
    <section className="ep-section ep-warm"><div className="experience-wrap ep-split">
      <div><h2>Different paths. Clear roles.</h2><p>Pegasus considers opportunities case by case, with any acquisition, project role, or licensed representation defined separately.</p></div>
      <div><dl className="ep-rows">
        <div><dt>A possible direct acquisition</dt><dd>A purchase would require property-specific diligence, capacity, and accepted written terms.</dd></div>
        <div><dt>A project or renovation conversation</dt><dd>Scope, qualifications, permits, responsibilities, and availability must be established for the specific work.</dd></div>
        <div><dt>Selling with representation</dt><dd>Discuss a separately documented brokerage relationship with Apollo.</dd></div>
      </dl><PageAction href="/work-with-apollo" secondary>Buy or sell with Apollo</PageAction><p className="ep-notice ep-rule">{REPRESENTATION_NOTICE}</p></div>
    </div></section>
    <ProjectEvidence />
    <section className="ep-section ep-process"><div className="experience-wrap">
      <h2>Start with what you know.</h2>
      <ol className="ep-rows ep-numbered">
        <li><div><h3>Describe the property.</h3><p>Add the address, condition, occupancy, and what you want to resolve.</p></div></li>
        <li><div><h3>Add the context.</h3><p>Identify estimates and unknowns. Share only what you are authorized to share; supporting files remain subject to the site privacy terms.</p></div></li>
        <li><div><h3>Review before submitting.</h3><p>Any later role, economics, or service requires separate diligence and written terms.</p></div></li>
      </ol>
    </div></section>
    <PageClosing title="Tell us about the property." href={selectedSituationHref} label="Tell us about the property">
      <p className="ep-notice">Submission may be considered, but no written review, response, route, or offer is promised. It is not a valuation, appraisal, legal opinion, foreclosure-rescue service, representation agreement, or closing commitment.</p>
    </PageClosing>
  </article>;
}
