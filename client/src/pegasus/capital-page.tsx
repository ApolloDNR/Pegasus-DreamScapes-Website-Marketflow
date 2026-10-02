import type { Nav } from './theme';
import { CAPITAL_RELATIONSHIP_FORM, LeadForm } from './forms';
import { PageOpening, ProjectEvidence } from './experience-page';

export function CapitalPage({ go: _go }: { go: Nav }) {
  return <article className="experience-page">
    <PageOpening title="Start with the project and the relationship." action={{ href: '#capital-introduction', label: 'Continue an introduction' }}><p>Pegasus begins these conversations only through an existing relationship or a personal introduction. This page records relationship context; it does not present project terms or create access, eligibility, or an agreement.</p></PageOpening>
    <section id="relationship-guidelines" className="ep-section"><div className="experience-wrap ep-split"><h2>An existing connection. A private conversation.</h2><div><p>If Apollo already knows you or someone personally connected you, use the introduction form below to identify that relationship. Do not send account details, tax identifiers, or other sensitive financial information.</p><p>A form submission records context only. Any later conversation is separate and conditional; neither side makes a commitment here.</p></div></div></section>
    <ProjectEvidence />
    <section id="capital-introduction" className="ep-section ep-warm"><div className="experience-wrap ep-split"><div><h2>Continue the relationship privately.</h2><p>Identify who connected you and provide enough context for Apollo to recognize the relationship. This is not a general application.</p></div><div className="ep-form-surface"><LeadForm cfg={CAPITAL_RELATIONSHIP_FORM} /></div></div></section>
  </article>;
}
