import type { Nav } from './theme';
import { PageAction, PageOpening, PageClosing } from './experience-page';

export function OurWorkPage({ go: _go }: { go: Nav }) {
  return <article className="experience-page">
    <PageOpening title="The work, in detail."><p>A completed East Bay residential transformation, documented from its starting condition to the finished home.</p></PageOpening>
    <section className="ep-section"><div className="experience-wrap">
      <div className="ep-section-title"><h2>Nelson Drive.</h2><p>Richmond / El Sobrante Area, California</p></div>
      <figure className="ep-wide-photo"><img src="/images/nelson/curb.webp" alt="Nelson Drive exterior after the renovation" width={1600} height={1067} loading="eager" decoding="async" /><figcaption>The completed property · Real project photography</figcaption></figure>
      <div className="ep-split ep-rule" id="project-record"><div><h3 id="project-lessons">From dated interiors to a coherent home.</h3><p>Explore the kitchen, living spaces, and bathrooms through the original project photographs.</p></div><div><p>The case study keeps the documented scope, known financial figures, and limits of the available record together.</p><PageAction href="/projects/nelson-dr">Explore the case study</PageAction></div></div>
    </div></section>
    <section className="ep-section ep-dark" id="project-gallery"><div className="experience-wrap"><div className="ep-photo-pair">
      <figure><img src="/images/nelson/kitchen-before.webp" alt="Nelson Drive kitchen before renovation" width={1600} height={999} loading="lazy" /><figcaption>Before · Original kitchen</figcaption></figure>
      <figure><img src="/images/nelson/kitchen-after.webp" alt="Nelson Drive kitchen after renovation" width={1600} height={996} loading="lazy" /><figcaption>After · Finished kitchen</figcaption></figure>
    </div><PageAction href="/projects/nelson-dr#project-gallery" secondary>View the project photographs</PageAction></div></section>
    <PageClosing title="Have a property in mind?" href="/bring-an-opportunity?intent=property" label="Discuss a property" />
  </article>;
}
