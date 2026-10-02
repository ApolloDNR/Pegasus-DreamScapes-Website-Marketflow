import { useSEO } from '@/hooks/use-seo';
import { PageAction, PageOpening, PageClosing } from '@/pegasus/experience-page';

export default function DealBlueprintPage() {
  useSEO({ title: 'Property Review | Deal Blueprint', description: 'Request a separately scoped property review. Availability, work, fees, and timing require a written engagement.' });
  return <article className="experience-page">
    <PageOpening title="Request a property review." action={{ href: '/bring-an-opportunity?intent=blueprint', label: 'Request a Deal Blueprint' }}>
      <p>A Deal Blueprint is a possible separately scoped written analysis for a specific property. Availability is reviewed case by case.</p>
      <p className="ep-notice">A request is not an order or acceptance. Pegasus may decline, request more information, or suggest a public self-service tool.</p>
      <PageAction href="/strategy-lab" secondary>Start with Strategy Lab</PageAction>
    </PageOpening>
    <section id="blueprint-contents" className="ep-section"><div className="experience-wrap ep-split"><div><h2>Possible sections, set by scope.</h2><p>The final contents and delivery format exist only if confirmed in a written engagement.</p></div><dl className="ep-rows">
      <div><dt>Property assumptions</dt><dd>Possible acquisition, improvement, holding, and exit assumptions, with stated limits and sensitivity where scoped.</dd></div>
      <div><dt>Possible structures</dt><dd>A comparison of relevant structures may be included when supported by the facts and written scope.</dd></div>
      <div><dt>Material risks</dt><dd>Known title, scope, market, or counterparty risks may be identified, without replacing legal or specialist diligence.</dd></div>
      <div><dt>Communication notes</dt><dd>A scope may include non-legal discussion prompts for a seller, lender, or other counterparty.</dd></div>
    </dl></div></section>
    <section id="blueprint-fit" className="ep-section ep-dark"><div className="experience-wrap ep-split"><h2>When the property needs a closer look.</h2><div><p>Start with Strategy Lab. A separate Blueprint may be considered when the facts call for deeper work, a comparison of structures, or written analysis of a specific question.</p><p className="ep-notice">No service, work, review, or delivery is promised by this page.</p></div></div></section>
    <section id="blueprint-process" className="ep-section"><div className="experience-wrap ep-split"><div><h2>From request to a possible engagement.</h2><p>There is no public turnaround commitment. Timing begins only after a written scope is accepted and required information is received.</p></div><ol className="ep-rows ep-numbered">
      <li><div><h3>Share the property and question.</h3><p>Bring the address, situation, and information you already have to the canonical inquiry.</p></div></li>
      <li><div><h3>Possible fit review.</h3><p>Pegasus may review the intake for fit, information needs, and current capacity.</p></div></li>
      <li><div><h3>Written terms, if offered.</h3><p>Any offered engagement identifies the scope, author, fee, timing, and limitations before work begins.</p></div></li>
      <li><div><h3>Work under the agreed scope.</h3><p>Deliverables and any clarification period are limited to the signed terms; none are promised by this page.</p></div></li>
    </ol></div></section>
    <section id="blueprint-pricing" className="ep-section ep-warm"><div className="experience-wrap ep-split"><h2>Quoted per property.</h2><div><p>No public price is advertised. If Pegasus offers a Blueprint, the written proposal sets the fee and explains the work included.</p><p className="ep-notice">A request does not create a service obligation. Do not rely on a Blueprint until both parties accept the written terms.</p></div></div></section>
    <PageClosing title="What would you like to understand?" href="/bring-an-opportunity?intent=blueprint" label="Request a Deal Blueprint" />
  </article>;
}
