import { ExplainWithPeggy } from './journey';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { ArrowRight } from 'lucide-react';
import type { Nav } from './theme';
import { ResponsiveChoiceList } from './responsive-choice-list';
import { PageAction, PageOpening, PageClosing } from './experience-page';
import { normalizePartnerNeed, type PartnerNeed } from './partner-intake-context';

type Missing = { label: PartnerNeed; records: string; limit: string };

const MISSING: Missing[] = [
  { label: 'Seller access or negotiation', records: 'Identify who has authority, who is represented, and the current communication status.', limit: 'Submission does not appoint Pegasus as principal, broker, negotiator, or representative.' },
  { label: 'Contract control', records: 'Identify the contract holder, relevant dates, and any known assignment, consent, option, or joint-venture restrictions.', limit: 'Recording a proposed structure is not acceptance of the contract or a commitment to participate.' },
  { label: 'Underwriting', records: 'Separate supported property facts from visitor-entered scope, comparable, carry, and exit assumptions.', limit: 'The intake is not Pegasus underwriting, a valuation, an appraisal, or an opinion that the numbers are reliable.' },
  { label: 'Buyer placement', records: 'State the distribution request, the source of the opportunity, and what authorization exists to share it.', limit: 'Submission does not provide a buyer, buyer list, distribution, brokerage, placement, or referral.' },
  { label: 'Capital planning', records: 'Describe the proposed capital need, timing, sources, and debt, equity, seller-term, or hybrid assumptions.', limit: 'The intake is not a funding commitment, securities offering, allocation, term sheet, or capital match.' },
  { label: 'Renovation execution', records: 'Share the known scope, available plans, bids, permits, schedule assumptions, and current project status.', limit: 'Submission does not provide project management, a contractor, a licensed team, a budget, or a completion schedule.' },
  { label: 'Local operations', records: 'Describe location, access, property type, current responsibilities, and the on-site gap you believe exists.', limit: 'The intake does not promise staffing, vendors, inspections, management, or local coverage.' },
  { label: 'Disposition or asset operations', records: 'Describe the proposed exit or hold path and the facts supporting that assumption.', limit: 'Submission does not create a listing, placement, refinance, management role, operating plan, or outcome split.' },
];

export function DealPartnersPage({ go: _go }: { go: Nav }) {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const requested = normalizePartnerNeed(new URLSearchParams(search).get('partner_need'));
  const [idx, setIdx] = useState(() => Math.max(0, MISSING.findIndex(item => item.label === requested)));
  useEffect(() => {
    setIdx(Math.max(0, MISSING.findIndex(item => item.label === requested)));
  }, [requested]);
  const selectNeed = (next: number) => {
    setIdx(next);
    const params = new URLSearchParams(search);
    params.set('partner_need', MISSING[next].label);
    setLocation(`/deal-partners?${params.toString()}`, { replace: true });
  };
  const pick = MISSING[idx];
  const opportunityHref = (need?: string, chooseRequest = false) => `/bring-an-opportunity?${chooseRequest ? '' : 'intent=deal-jv&'}ref=deal-partners${need ? `&partner_need=${encodeURIComponent(need)}` : ''}`;
  const selectedNeedHref = opportunityHref(pick.label);
  const pageIntakeHref = opportunityHref(requested);
  const proposalHref = opportunityHref(requested, true);
  return <article className="experience-page dp">
    <PageOpening title="Bring the property. Define the next decision." action={{ label: 'Bring a deal', href: pageIntakeHref }} secondaryAction={{ label:'Choose a partnership request', href: proposalHref }}>
      <p>Tell Apollo what you control, what you know, and where the deal is stuck. Start with the property, your proposed role, and the decision you want to work through.</p>
      <p className="ep-notice">Pegasus considers each proposal individually; participation requires separate written terms.</p>
    </PageOpening>
    <section className="ep-section" data-testid="missing-composer"><div className="experience-wrap">
      <h2 data-peggy-summary="Choose the missing piece. The details explain which facts to gather and which questions need a separate agreement.">What does the deal need next?</h2>
      <div className="ep-choice-layout">
        <ResponsiveChoiceList id="partner-need" label="What the deal is missing" options={MISSING} value={idx} onChange={selectNeed} controls="partner-answer" className="ep-choices" itemClassName="ep-choice" />
        <div className="ep-choice-answer" id="partner-answer" aria-live="polite" aria-atomic="true"><h3>{pick.label}</h3><p>{pick.records}</p><PageAction href={selectedNeedHref}>Bring this opportunity</PageAction><p className="ep-notice">{pick.limit}</p><ExplainWithPeggy /></div>
      </div>
    </div></section>
    <section className="ep-section ep-dark"><div className="experience-wrap ep-split">
      <div><h2 data-peggy-summary="Identify the property, your authority and your proposed contribution. Sharing a proposal does not create a partnership or compensation agreement.">Put the proposal on the record.</h2><p>The intake can record a proposed principal, joint-venture, disposition, operating, brokerage, or referral role. Actual involvement would depend on capacity, diligence, applicable law, and separate written terms; receipt creates none of those relationships.</p></div>
      <div><ol className="ep-rows ep-numbered">
        <li><div><h3>The property.</h3><p>Share the address, current condition, and the facts or records you already have.</p></div></li>
        <li><div><h3>Control and permissions.</h3><p>Identify who owns or controls the opportunity, your role, and what you are authorized to share.</p></div></li>
        <li><div><h3>The unresolved decision.</h3><p>Explain your proposed contribution and the question holding the deal back.</p></div></li>
        <li><div><h3>Timing.</h3><p>Include contract dates, access constraints, and the next decision deadline.</p></div></li>
      </ol><p className="ep-notice ep-rule">The intake records the submitter and the information provided. A role exists only after diligence, legal compliance, capacity review, and signed terms. Any joint venture, assignment, referral, distribution, representation, or compensation arrangement would require a separate written agreement before anyone relies on it.</p></div>
    </div></section>
    <section className="ep-section"><div className="experience-wrap ep-split">
      <h2>Find the relevant conversation.</h2>
      <div className="ep-link-list">{[
        ['/operators', 'Operators', 'Project responsibilities and operating experience.'],
        ['/capital', 'Capital relationships', 'Existing relationships and personal introductions.'],
        ['/vendor-network', 'Vendors and specialists', 'Qualifications, eligibility, and project-specific roles.'],
        ['/referral', 'Referrals', 'Permissions, boundaries, and separate written terms.'],
      ].map(([href,label,note]) => <Link key={href} href={href}><span><strong>{label}</strong><small>{note}</small></span><ArrowRight aria-hidden="true" /></Link>)}</div>
    </div></section>
    <PageClosing title="Bring the facts and your proposed role." href={pageIntakeHref} label="Bring a deal"><p className="ep-notice">No response, buyer, written terms, distribution, funding, or closing is promised. Brokerage activity, if any, requires the appropriate separately documented licensed relationship.</p></PageClosing>
  </article>;
}
