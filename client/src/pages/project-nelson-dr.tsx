import { ProjectGallery } from '@/pegasus/project-gallery';
import { NELSON_PAIRS, NELSON_FINISHES } from '@/pegasus/nelson-gallery-data';
import { PageAction, PageOpening, PageClosing } from '@/pegasus/experience-page';
import { NELSON_FACTS, NELSON_PUBLIC_DESCRIPTION, NELSON_COST_DISCLOSURE, NELSON_EXECUTION_DISCLOSURE } from '@shared/nelson-facts';

const dollars = (amount: number) => `$${amount.toLocaleString('en-US')}`;
export default function NelsonDrPage() {
  return <article className="experience-page nelson-case-study">
    <PageOpening title="Nelson Drive." action={{ href: '#project-gallery', label: 'Explore the photographs' }} image={{ src: '/images/nelson/curb.webp', alt: 'Nelson Drive exterior after renovation', width: 1600, height: 1067, caption: 'Completed property · Real project photography' }}>
      <p>{NELSON_FACTS.address}, {NELSON_FACTS.city}, {NELSON_FACTS.state} {NELSON_FACTS.postalCode}</p>
      <p>A completed East Bay residential transformation. Follow the property from its original condition to the finished kitchen, living spaces, and bathrooms.</p>
      <PageAction href="/our-work" secondary>Back to Our Work</PageAction>
    </PageOpening>
    <section className="ep-section" id="project-gallery"><div className="experience-wrap"><h2>Before, during, and after.</h2><p>Different camera angles are shown as separate photographs so you can see each space clearly.</p><ProjectGallery pairs={NELSON_PAIRS} finishes={NELSON_FINISHES} /></div></section>
    <section className="ep-section ep-dark" id="project-context"><div className="experience-wrap ep-split">
      <div><h2>The documented transformation.</h2><p>Kitchen photographs show deep-navy cabinetry, a waterfall quartz island, and a statement hood. Living-space photographs show the change from dark paneling to an open, staged interior.</p><p>The primary bathroom is documented during construction and in its finished condition, with a freestanding tub, glass shower, and warm wood paneling.</p></div>
      <div><h3>Scope and responsibilities</h3><p>{NELSON_EXECUTION_DISCLOSURE}</p><p className="ep-notice">Photographs do not establish permits, exact project dates, licensed work, or which party performed a particular service. This case study does not identify who provided brokerage representation on Nelson.</p></div>
    </div></section>
    <section className="ep-section" id="project-record"><div className="experience-wrap ep-split">
      <div><h2>The available financial record.</h2><p>{NELSON_PUBLIC_DESCRIPTION}</p><p>Settled {NELSON_FACTS.settled}. The subtotal includes acquisition and improvements only.</p></div>
      <div><dl className="ep-financial-record">{[
        ['Approx. acquisition', NELSON_FACTS.acquired], ['Approx. improvement budget', NELSON_FACTS.improvementBudget], ['Basis before other costs', NELSON_FACTS.totalBasisBeforeOtherCosts], ['Approx. sale', NELSON_FACTS.salePrice], ['Gross spread before other costs', NELSON_FACTS.grossSpreadBeforeOtherCosts],
      ].map(([label, amount]) => <div key={label}><dt>{label}</dt><dd>{dollars(Number(amount))}</dd></div>)}</dl><p className="ep-notice ep-rule">{NELSON_COST_DISCLOSURE}</p></div>
    </div></section>
    <section className="ep-section ep-warm" id="project-lessons"><div className="experience-wrap ep-split"><h2>Every property starts somewhere different.</h2><p>These photographs and figures describe one property. They do not establish a participant’s role, net profit, return, savings, or a result another property will repeat.</p></div></section>
    <PageClosing title="What are you considering for your property?" href="/bring-an-opportunity?intent=property" label="Discuss a property" />
  </article>;
}
