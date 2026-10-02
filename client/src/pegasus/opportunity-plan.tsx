import React, { useId, useRef, useState } from 'react';
import { Link } from 'wouter';
import { ArrowDown, ArrowRight, Check, ChevronDown } from 'lucide-react';
import { PropertySketch } from './property-sketch';
import './opportunity-plan.css';

const NEEDS = [
  { key: 'control', question: 'Can the property move forward?', label: 'Control', companion: 'Underwriting', title: 'Start with ownership and access.', caption: 'Check who can approve a sale or project, the current contract terms, and access to inspect the property.', href: '/deal-partners', action: 'Explore the partner path' },
  { key: 'underwriting', question: 'Do the numbers make sense?', label: 'Underwriting', companion: 'Capital', title: 'See the full cost.', caption: 'Compare price, renovation costs, holding costs, and a possible sale price. Keep unverified numbers marked as assumptions.', href: '/strategy-lab', action: 'Work through the numbers' },
  { key: 'buyer', question: 'Who is the potential buyer?', label: 'Buyer', companion: 'Disposition', title: 'Clarify who the property could suit.', caption: 'Consider its condition, possible use, and what a buyer would need to assess. No buyer, introduction, or closing is promised.', href: '/deal-partners', action: 'Explore the partner path' },
  { key: 'capital', question: 'What would funding require?', label: 'Capital', companion: 'Underwriting', title: 'Estimate the cash needed.', caption: 'Model the cash needed to buy, improve, and hold the property. This does not arrange funding or imply that capital is available.', href: '/strategy-lab', action: 'Model the assumptions' },
  { key: 'development', question: 'What work needs to happen?', label: 'Development', companion: 'Local context', title: 'Define the work ahead.', caption: 'Outline the repairs or improvements, budget, permits, and specialists to confirm before moving forward.', href: '/development', action: 'Explore project planning' },
  { key: 'local', question: 'What does the location change?', label: 'Local context', companion: 'Development', title: 'Check what the location changes.', caption: 'Identify zoning, access, and site questions to verify locally. This guide does not include site visits or project management.', href: '/property-owners', action: 'Explore the property path' },
  { key: 'disposition', question: 'Sell, refinance, or keep it?', label: 'Disposition', companion: 'Buyer', title: 'Compare selling with keeping it.', caption: 'Use your own numbers to explore a sale, listing, refinance, or hold. The model compares assumptions; it does not recommend an outcome.', href: '/strategy-lab', action: 'Compare the modeled paths' },
  { key: 'assetops', question: 'What would ownership involve?', label: 'Asset operations', companion: 'Underwriting', title: 'Look beyond the purchase.', caption: 'Consider rent, maintenance, reserves, and the work of managing the property. Start with what you know and leave unknown costs open.', href: '/strategy-lab', action: 'Explore a hold scenario' },
] as const;
const FIRST_QUESTIONS = ['underwriting', 'development', 'disposition'];

export function OpportunityPlan() {
  const resultId = useId();
  const chooserRef = useRef<HTMLButtonElement>(null);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [allQuestions, setAllQuestions] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const selected = NEEDS.find((need) => need.key === active);
  const closeChooser = () => {
    setChooserOpen(false);
    chooserRef.current?.focus({ preventScroll: true });
    requestAnimationFrame(() => chooserRef.current?.scrollIntoView?.({ block: 'start', behavior: 'auto' }));
  };
  const chooseOnMobile = (next: string | null) => {
    setActive(next);
    closeChooser();
  };

  return (
    <div className="op-plan" data-testid="opportunity-plan">
      <div className="op-plan-bar"><h3>A question to start with.</h3><p>Choose a question to find a useful next step.</p></div>
      <div className="op-plan-body">
        <div className="op-choice-column">
          <div className="op-mobile-choice" onKeyDown={event => {
            if (event.key === 'Escape' && chooserOpen) { event.preventDefault(); closeChooser(); }
          }}>
            <p className="sr-only" id={`${resultId}-label`}>Choose a planning question</p>
            <div className="op-select-wrap">
              <button ref={chooserRef} type="button" className="op-select-trigger" aria-expanded={chooserOpen}
                aria-controls={`${resultId}-questions`} aria-labelledby={`${resultId}-label ${resultId}-selection`} onClick={() => setChooserOpen(open => !open)}>
                <span id={`${resultId}-selection`}>{selected?.question ?? 'Choose a question'}</span><ChevronDown aria-hidden="true" />
              </button>
              <div id={`${resultId}-questions`} className="op-mobile-options" role="group" aria-label="Planning questions" hidden={!chooserOpen}>
                {NEEDS.map(need => <button key={need.key} type="button" aria-pressed={active === need.key} aria-controls={resultId}
                  onClick={() => chooseOnMobile(need.key)}><span>{need.question}</span>{active === need.key && <Check aria-hidden="true" />}</button>)}
                <button type="button" className="op-clear" onClick={() => chooseOnMobile(null)}>Clear question</button>
              </div>
            </div>
          </div>
          <div className="op-choices" id={`${resultId}-desktop-questions`} role="group" aria-label="What is your deal missing?">
            {NEEDS.map(need => <button key={need.key} type="button" aria-label={need.question} aria-pressed={active === need.key}
              hidden={!allQuestions && !FIRST_QUESTIONS.includes(need.key) && active !== need.key}
              aria-controls={resultId} aria-describedby={`${resultId}-${need.key}-label`} onClick={() => setActive(active === need.key ? null : need.key)}>
              <span><small>{need.question}</small><strong id={`${resultId}-${need.key}-label`}>{need.label}</strong></span>
              {active === need.key ? <Check aria-hidden="true" /> : <span className="op-choice-mark" aria-hidden="true" />}
            </button>)}
          </div>
          <button type="button" className="op-more" aria-expanded={allQuestions} aria-controls={`${resultId}-desktop-questions`} onClick={() => setAllQuestions(open => !open)}>
            {allQuestions ? 'Fewer planning questions' : 'More planning questions'}<ChevronDown aria-hidden="true" />
          </button>
        </div>
        <div className="op-result" id={resultId} aria-live="polite" aria-atomic="true">
          <div className="op-read">
            <h4>{selected?.title ?? 'What needs a closer look?'}</h4>
            <p>{selected?.caption ?? 'Choose the question closest to your situation. You can change it at any time.'}</p>
            {selected && <p className="op-mobile-connection">{selected.label} <ArrowRight aria-hidden="true" size={14} /> {selected.companion}</p>}
            {selected && <Link href={selected.href} className="op-next">{selected.action}<ArrowRight aria-hidden="true" /></Link>}
          </div>
          <div className="op-map" role="group" aria-label="Property and connected planning questions">
            <div className="op-map-origin"><PropertySketch focus={active === 'local' ? 'site' : ['control', 'buyer', 'disposition'].includes(active ?? '') ? 'access' : 'scope'} /><span>Your property and situation</span></div>
            <div className="op-map-junction" aria-hidden="true"><ArrowDown /></div>
            <div className="op-map-branches">
              <div className="op-map-node op-map-focus" data-selected={Boolean(selected)}><span>Selected need</span><strong>{selected?.label ?? 'Your missing piece'}</strong></div>
              <div className="op-map-node"><span>Consider alongside</span><strong>{selected?.companion ?? 'Connected questions'}</strong></div>
            </div>
          </div>
        </div>
      </div>
      <p className="op-plan-note">A planning prompt, not a commitment to participate in a deal.</p>
    </div>
  );
}
