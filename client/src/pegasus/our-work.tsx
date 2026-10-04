import type { Nav } from './theme';
import { PageAction, PageOpening, PageClosing } from './experience-page';
import { NELSON_FACTS, NELSON_PUBLIC_HIGHLIGHTS } from '@shared/nelson-facts';

export function OurWorkPage({ go: _go }: { go: Nav }) {
  return <article className="experience-page">
    <PageOpening title="Nelson Drive, documented."
      image={{ src:'/images/nelson/kitchen-after.webp', alt:'The completed Nelson Drive kitchen with navy cabinetry and a waterfall island', width:1600, height:996, caption:'Nelson Drive · Original project photography' }}
      action={{ href:'#project-record', label:'Explore Nelson Drive' }}>
      <p>A completed East Bay residential transformation, documented from its starting condition to the finished home and sale.</p>
      <p className="ep-notice">The available record does not verify Pegasus’s or Apollo’s project role.</p>
    </PageOpening>
    <section className="ep-section"><div className="experience-wrap">
      <div className="ep-section-title"><h2 data-peggy-summary="This is the documented Nelson Drive project. Compare the real photographs and follow the case study for the recorded scope and financial information.">Nelson Drive.</h2><p>Richmond / El Sobrante Area, California</p></div>
      <figure className="ep-wide-photo"><img src="/images/nelson/curb.webp" alt="Nelson Drive exterior after the renovation" width={1600} height={1067} loading="eager" decoding="async" /><figcaption>The completed property · Real project photography</figcaption></figure>
      <div className="ep-project-story ep-rule" id="project-record">
        <div id="published-work" role="group" aria-labelledby="project-lessons"><h3 id="project-lessons">From dated interiors to a coherent home.</h3></div>
        <ol className="ep-project-chapters">
          <li><span>01 · The starting point</span><h4>A home ready for change.</h4><p>The kitchen and living room photographs show dated finishes and a more enclosed layout. The bathroom record begins during construction.</p></li>
          <li><span>02 · The visible changes</span><h4>A new focal point.</h4><p>The cooktop moved to a waterfall island with seating. Navy cabinetry and a statement hood anchor the kitchen, alongside updates throughout the home.</p></li>
          <li><span>03 · The recorded outcome</span><h4>Completed and sold.</h4><p>The finished home sold in {NELSON_FACTS.settled}. The case study brings the original photographs and the available financial record together.</p></li>
        </ol>
        <dl className="ep-project-figures">{NELSON_PUBLIC_HIGHLIGHTS.map(item => { const [label, value] = item.split(' ≈ '); return <div key={label}><dt>{label}</dt><dd>≈ {value}</dd></div>; })}</dl>
        <p className="ep-notice">Approximate recorded figures. Acquisition and improvement budget exclude other project costs; these figures do not establish profit or return.</p>
        <PageAction href="/projects/nelson-dr">Explore the case study</PageAction>
      </div>
    </div></section>
    <section className="ep-section ep-dark" id="project-gallery"><div className="experience-wrap"><div className="ep-photo-pair">
      <figure><img src="/images/nelson/kitchen-before.webp" alt="Nelson Drive kitchen before renovation" width={1600} height={999} loading="lazy" /><figcaption>Before · Original kitchen</figcaption></figure>
      <figure><img src="/images/nelson/kitchen-after.webp" alt="Nelson Drive kitchen after renovation" width={1600} height={996} loading="lazy" /><figcaption>After · Finished kitchen</figcaption></figure>
    </div><PageAction href="/projects/nelson-dr#project-gallery" secondary>View the project photographs</PageAction></div></section>
    <PageClosing title="Have a property in mind?" href="/bring-an-opportunity?intent=property" label="Discuss a property" />
  </article>;
}
