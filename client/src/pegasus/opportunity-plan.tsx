import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowDown, ArrowRight, Check, MapPin } from 'lucide-react';
import './opportunity-plan.css';

const NEEDS = [
  { key: 'control', label: 'Control', companion: 'Underwriting', title: 'Establish the right to move forward.', caption: 'Test whether contract terms, access, and decision rights support further diligence.', href: '/deal-partners', action: 'Explore the partner path' },
  { key: 'underwriting', label: 'Underwriting', companion: 'Capital', title: 'Make the assumptions visible.', caption: 'Organize supplied assumptions around price, scope, carry, exit, and unresolved evidence.', href: '/strategy-lab', action: 'Work through the numbers' },
  { key: 'buyer', label: 'Buyer', companion: 'Disposition', title: 'Define the possible buyer path.', caption: 'Identify what a potential buyer path would require; no buyer, introduction, or closing is promised.', href: '/deal-partners', action: 'Explore the partner path' },
  { key: 'capital', label: 'Capital', companion: 'Underwriting', title: 'Understand the capital question.', caption: 'Map the capital question without implying funding, solicitation, matching, or availability.', href: '/strategy-lab', action: 'Model the assumptions' },
  { key: 'development', label: 'Development', companion: 'Local context', title: 'Connect the scope to the property.', caption: 'Frame scope, budget, permits, and specialist roles that would need project-specific verification.', href: '/development', action: 'Explore project planning' },
  { key: 'local', label: 'Local context', companion: 'Development', title: 'Bring the location into the plan.', caption: 'Surface location-specific constraints without promising field work or project management.', href: '/property-owners', action: 'Explore the property path' },
  { key: 'disposition', label: 'Disposition', companion: 'Buyer', title: 'Compare the possible exits.', caption: 'Compare possible sale, listing, refinance, or hold scenarios without recommending an outcome.', href: '/strategy-lab', action: 'Compare the modeled paths' },
  { key: 'assetops', label: 'Asset operations', companion: 'Underwriting', title: 'Read beyond the acquisition.', caption: 'List the operating questions a hold scenario would need to answer.', href: '/strategy-lab', action: 'Explore a hold scenario' },
] as const;

export function OpportunityPlan() {
  const [active, setActive] = useState<string | null>(null);
  const selected = NEEDS.find((need) => need.key === active);

  return (
    <div className="hv-plan-stage op-plan" data-testid="opportunity-plan">
      <div className="op-plan-bar">
        <span className="font-serif-display">Opportunity Plan</span>
        <span>Interactive guide</span>
      </div>
      <div className="op-plan-body">
        <div className="op-plan-intro">
          <span className="op-step">01</span>
          <div>
            <h3>What is the missing piece?</h3>
            <p>Start with the property. Choose one need to see the connected questions.</p>
          </div>
        </div>
        <div className="op-choices" role="group" aria-label="What is your deal missing?">
          {NEEDS.map((need) => (
            <button key={need.key} type="button" aria-pressed={active === need.key}
              aria-controls="opportunity-plan-read" onClick={() => setActive(active === need.key ? null : need.key)}>
              <span>{need.label}</span>
              {active === need.key ? <Check aria-hidden="true" /> : <span className="op-choice-mark" aria-hidden="true" />}
            </button>
          ))}
        </div>

        <div className="op-map" role="group" aria-label="Property and connected planning questions">
          <div className="op-map-origin">
            <MapPin aria-hidden="true" />
            <div><span>Starting point</span><strong>Property + known constraints</strong></div>
          </div>
          <div className="op-map-junction" aria-hidden="true"><ArrowDown /></div>
          <div className="op-map-branches">
            <div className="op-map-node op-map-focus" data-selected={Boolean(selected)}>
              <span>Selected need</span>
              <strong>{selected?.label ?? 'Your missing piece'}</strong>
            </div>
            <div className="op-map-node">
              <span>Consider alongside</span>
              <strong>{selected?.companion ?? 'The related questions'}</strong>
            </div>
          </div>
        </div>

        <div className="op-read" id="opportunity-plan-read" aria-live="polite" aria-atomic="true">
          <span className="op-step">02</span>
          <div>
            <span className="op-read-label">Illustrative quick read</span>
            <h4>{selected?.title ?? 'One connected plan.'}</h4>
            <p>{selected?.caption ?? 'Choose a need above. The map will connect it to a second question and a useful place to continue.'}</p>
            {selected && <Link href={selected.href} className="op-next">{selected.action}<ArrowRight aria-hidden="true" /></Link>}
          </div>
        </div>
      </div>
      <p className="op-plan-note">A planning prompt, not a commitment to participate in a deal.</p>
    </div>
  );
}
