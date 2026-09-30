import { useState } from 'react';
import { PageOpening, PageClosing, PageAction } from '@/pegasus/experience-page';
import './pegasus-standard.css';

const POSTER = '/images/standard/descent-poster.webp';

const ARCHITECTURE = [
  "Pale limestone", "Ivory plaster", "Travertine", "Simplified Greek-style columns",
  "Flat rooflines", "Courtyards", "Colonnades", "Pergolas", "Olive trees",
  "Cypress trees", "Fountains", "Water channels", "Fire bowls", "Open-air living",
];

const COMMUNITY = [
  "Walkable paths", "Courtyards", "Small plazas", "Shared gardens",
  "Homes with identity", "Beauty without chaos", "Density with dignity",
];

export default function PegasusStandardPage() {
  const [filmFailed, setFilmFailed] = useState(false);
  return <article className="experience-page standard-page">
    <PageOpening title="The Pegasus Standard"
      image={{ src:POSTER, alt:'Concept render of a marble colonnade toward the sea. Future vision, not a current Pegasus property.', width:1920, height:1080, caption:'Future vision · Concept imagery · Not current inventory or an active development' }}
      action={{ href:'#standard-vision', label:'Explore the vision' }} secondaryAction={{ href:'#architectural-film', label:'Watch the architectural film' }}>
      <p>A future living standard shaped by beauty, durability, calm, nature, and human flourishing.</p>
    </PageOpening>
    <section id="standard-vision" className="ep-section"><div className="experience-wrap ep-split">
      <h2>Beauty with a purpose.</h2><div><p><em>Eudaimonia</em> means human flourishing. For Pegasus, it means real estate should help people live better, with attention to how a place feels and functions.</p><p>Cool stone. Warm light. Moving water. Natural shade. Fresh airflow. Quiet focus. Grounded living.</p></div>
    </div></section>
    <section id="architectural-film" className="ep-section ep-dark"><div className="experience-wrap">
      <div className="ep-section-title"><h2>An architectural walk.</h2><p>A concept film of the long-term design direction. Play, pause, or seek at your own pace.</p></div>
      <figure className="standard-film">
        <video controls playsInline muted preload="none" poster={POSTER} aria-label="Architectural vision film, a silent walk through a colonnade" onError={() => setFilmFailed(true)}>
          <source src="/media/walk-land.mp4" type='video/mp4; codecs="avc1.640028"' />
          <source src="/media/walk-port-test.webm" type='video/webm; codecs="vp09.00.40.08"' />
        </video>
        <figcaption>Future vision · Concept imagery · Not current inventory</figcaption>
      </figure>
      {filmFailed && <p role="status" className="ep-notice">The film could not load. The still image and the written vision remain available.</p>}
    </div></section>
    <section className="ep-section"><div className="experience-wrap ep-split">
      <div><h2>Hellenic Modern / Classical Mediterranean.</h2><p>Natural materials, open-air living, and a consistent architectural language.</p></div>
      <ul className="standard-materials">{ARCHITECTURE.map(material => <li key={material}>{material}</li>)}</ul>
    </div></section>
    <section className="ep-section ep-warm"><div className="experience-wrap ep-split">
      <div><h2>The community standard.</h2><p>A vision for places that leave room for everyday life and shared space.</p></div>
      <ul className="ep-rows">{COMMUNITY.map(item => <li key={item}>{item}</li>)}</ul>
    </div></section>
    <section className="ep-section"><div className="experience-wrap ep-split">
      <h2>From vision to responsibility.</h2><div><p>The operating model describes acquisitions, development, dispositions, and asset management as possible accountability lanes. It is a framework, not a claim of separately staffed departments, current inventory, or service availability.</p><PageAction href="/departments" secondary>Explore the operating model</PageAction><p className="ep-notice ep-rule">Future vision, not current inventory or an active development.</p></div>
    </div></section>
    <PageClosing title="Have a property or idea to discuss?" label="Submit a Property"><p>Start with the property and situation you have in mind.</p><PageAction href="/marketflow" secondary>Learn About MarketFlow</PageAction></PageClosing>
  </article>;
}
