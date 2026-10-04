import { useRef, useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import { PUBLIC_ACTIONS } from './public-content';
import { GuideInvite } from './journey';
import { PropertySketch } from './property-sketch';
import './experience.css';
import './tools-journey.css';

const TASKS = ['Understand a property', 'Check a number', 'Continue my work'] as const;
export const TOOL_CALCULATORS = [
  ['arv', 'After-repair value', 'Compare value assumptions'], ['roi', 'Renovation return', 'Explore cost and potential return'],
  ['brrrr', 'BRRRR', 'Model a refinance and rental'], ['cashflow', 'Rental cash flow', 'Compare income and expenses'],
  ['wholesale', 'Wholesale', 'Work through acquisition assumptions'], ['piti', 'Monthly payment', 'Estimate principal, interest, tax and insurance'],
  ['ownvsrent', 'Own vs. rent', 'Compare housing costs'], ['hardmoney', 'Hard money', 'Estimate short-term borrowing costs'],
] as const;

export function ToolsPage() {
  const [task, setTask] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const selectTask = (index: number, reveal = false) => {
    setTask(index);
    if (reveal) requestAnimationFrame(() => panel.current?.focus({ preventScroll: false }));
  };
  return <div className="experience-tools tools-journey"><div className="experience-wrap">
    <header className="tools-opening">
      <h1 data-peggy-summary="Choose what you need to do: understand a property, check an estimate, or return to saved work. Each tool helps you prepare questions using your own assumptions.">Useful tools.<br /> Clearer decisions.</h1>
      <div><p>Work through the assumptions yourself, or ask about a scoped property review.</p><GuideInvite compact /></div>
    </header>
    <section className="tools-finder" aria-label="Find a useful tool">
      <div className="tools-task-list" role="group" aria-label="What would you like to do?">{TASKS.map((label, index) => <button type="button" key={label} aria-pressed={task === index} aria-controls="tools-task-detail" onClick={() => selectTask(index)}>
        <span>{String(index + 1).padStart(2, '0')}</span><strong>{label}</strong>{task === index ? <Check size={19} aria-hidden="true" /> : <ChevronDown size={19} aria-hidden="true" />}
      </button>)}</div>
      <div ref={panel} id="tools-task-detail" className="tools-task-detail" role="region" aria-label={TASKS[task]} tabIndex={-1}>
        {task === 0 ? <div className="tools-lab-layout"><div>
          <p className="tools-destination-name">Strategy Lab</p><h2 data-peggy-summary="Start with what you know about the property. Strategy Lab connects price, improvements, financing and possible exits, with the assumptions visible for review.">See how the pieces fit.</h2>
          <p>Explore price, improvement costs, financing, and possible exits using your own assumptions.</p>
          <Link href={PUBLIC_ACTIONS.lab.href} className="experience-button">{PUBLIC_ACTIONS.lab.label}<ArrowRight size={18} aria-hidden="true" /></Link>
          <div><button type="button" className="experience-link" onClick={() => selectTask(1, true)}>Explore eight calculators<ArrowRight size={17} aria-hidden="true" /></button></div>
        </div><PropertySketch /></div> : task === 1 ? <>
          <p className="tools-destination-name">Eight calculators</p><h2 data-peggy-summary="Choose a calculator for the question in front of you. Each opens the same Strategy Lab workspace with that calculator selected.">Start with one question.</h2>
          <p>Open a calculator in Strategy Lab. Review its assumptions before using the estimate.</p>
          <div className="tools-calculators">{TOOL_CALCULATORS.map(([key, title, note]) => <Link key={key} href={`/strategy-lab?tool=calculators&tab=${key}`}><span><strong>{title}</strong><small>{note}</small></span><ArrowRight size={16} aria-hidden="true" /></Link>)}</div>
        </> : <>
          <p className="tools-destination-name">Saved work</p><h2 data-peggy-summary="Resume a Strategy Lab draft or Peggy transcript saved in this browser. Saved work is local and does not mean anything has been submitted.">Pick up where you left off.</h2>
          <p>Resume a saved Strategy Lab draft or Peggy transcript. Saved work stays in this browser and does not mean it was submitted.</p>
          <Link href="/saved" className="experience-button">View saved work<ArrowRight size={17} aria-hidden="true" /></Link>
        </>}
        {task !== 2 && <p className="experience-notice">Free planning tool. Educational modeling, not an appraisal, advice, offer, or funding decision.</p>}
      </div>
    </section>
    <section className="tools-review"><div><h2 data-peggy-summary="You can ask about a separately scoped Property Review. Submission does not promise acceptance or a deliverable; scope and fees require a separate agreement.">Prefer a second set of eyes?</h2></div><div><h3>Property Review</h3><p>Have a specific property or decision in mind? Share the context to ask about a separately scoped review.</p><Link href="/deal-blueprint" className="experience-link">Request a Property Review<ArrowRight size={17} aria-hidden="true" /></Link><p className="experience-notice">Request-based. Submission does not promise acceptance, a written review, a response, or a delivery date. Any scope and fees require separate agreement.</p></div></section>
    <p className="experience-notice tools-network">Working with Pegasus on a project? <Link href="/marketflow">Learn about the private MarketFlow network.</Link></p>
  </div></div>;
}
