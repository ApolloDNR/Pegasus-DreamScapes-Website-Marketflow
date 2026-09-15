import type { Nav } from './theme';
import { PageAction, PageOpening, PageClosing } from './experience-page';
import { REPRESENTATION_NOTICE } from './public-content';

export function AboutPageV6({ go: _go }: { go: Nav }) {
  return <article className="experience-page">
    <PageOpening title="Apollo Duran." image={{ src: '/images/founder/apollo.webp', alt: 'Apollo Duran, founder of Pegasus Dreamscapes', width: 1100, height: 1375, portrait: true, caption: 'Paolo “Apollo” Duran · Founder, Pegasus Dreamscapes' }} action={{ href: '/contact', label: 'Start a conversation' }}>
      <p>A background in residential construction and real estate operations. A practical interest in how a property gets from its current condition to a considered next step.</p>
      <p>Apollo founded Pegasus to connect property strategy with the work required to carry it out.</p>
    </PageOpening>
    <section className="ep-section"><div className="experience-wrap ep-split">
      <h2>The property comes first.</h2><div><p>The work starts with the property, its constraints, and the outcome being considered. Acquisition basis, scope, timing, and the intended sale or hold all belong in the same conversation.</p><p>Apollo sets the company’s operating direction. Pegasus’s participation, authority, responsibilities, and compensation are defined for each accepted opportunity in the applicable written agreement.</p><PageAction href="/our-work" secondary>See the work</PageAction></div>
    </div></section>
    <section className="ep-section ep-dark"><div className="experience-wrap ep-split">
      <div><h2>One company. Three connected areas.</h2><p>Pegasus Dreamscapes is a founder-led East Bay real estate operating company. Its structure connects the property, the transaction, and the systems that support the work.</p></div>
      <dl className="ep-rows"><div><dt>Development</dt><dd>Property scope, renovation planning, and project-specific responsibilities.</dd></div><div><dt>Investments</dt><dd>Acquisition, deal structure, and ownership questions, considered case by case.</dd></div><div><dt>Systems</dt><dd>Tools for organizing assumptions, decisions, and operating information.</dd></div></dl>
    </div></section>
    <section className="ep-section"><div className="experience-wrap ep-split">
      <div><h2>Buy or sell with Apollo.</h2><p>Representation is a separately documented brokerage relationship.</p><PageAction href="/work-with-apollo">Discuss representation</PageAction></div>
      <div><p>{REPRESENTATION_NOTICE}</p><p className="ep-notice">Pegasus Dreamscapes Corp. is a real estate operating company focused on investment and development. It is not a licensed real estate brokerage. If construction or another specialized service is engaged, provider qualifications, licensing, scope, capacity, and responsibility must be established in separate project agreements. This page does not imply a standing team.</p></div>
    </div></section>
    <PageClosing title="Start a conversation." href="/contact" label="Contact Apollo" />
  </article>;
}
export default AboutPageV6;
