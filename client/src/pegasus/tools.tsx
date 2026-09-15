import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { PUBLIC_ACTIONS } from './public-content';
import './experience.css';

export function ToolsPage() {
  return <div className="experience-tools"><div className="experience-wrap">
    <h1>Useful tools.<br /> Clearer decisions.</h1>
    <p>Work through the assumptions yourself, or ask about a scoped property review.</p>
    <section className="experience-tool-feature" aria-labelledby="tools-strategy-title">
      <div><h2 id="tools-strategy-title">Strategy Lab</h2><p>Explore price, improvement costs, financing, and possible exits using your own assumptions.</p>
        <Link href={PUBLIC_ACTIONS.lab.href} className="experience-button">{PUBLIC_ACTIONS.lab.label}<ArrowRight size={18} aria-hidden="true" /></Link>
        <p className="experience-notice">Free planning tool. Educational modeling, not an appraisal, advice, offer, or funding decision.</p>
      </div>
      <aside><h3>Pick up where you left off.</h3><p>Resume a saved Strategy Lab draft or Peggy transcript. Saved work stays in this browser and does not mean it was submitted.</p><Link href="/saved" className="experience-link">View saved work<ArrowRight size={17} aria-hidden="true" /></Link></aside>
    </section>
    <section className="experience-tool-review"><h2>Property Review</h2><p>Have a specific property or decision in mind? Share the context to ask about a separately scoped review.</p><Link href="/deal-blueprint" className="experience-link">Request a Property Review<ArrowRight size={17} aria-hidden="true" /></Link><p className="experience-notice">Request-based. Submission does not promise acceptance, a written review, a response, or a delivery date. Any scope and fees require separate agreement.</p></section>
    <p className="experience-notice">Working with Pegasus on a project? <Link href="/marketflow">Learn about the private MarketFlow network.</Link></p>
  </div></div>;
}
