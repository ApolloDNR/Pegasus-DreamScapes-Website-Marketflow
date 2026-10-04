import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import { NELSON_PAIRS } from './nelson-gallery-data';
import './home-project.css';

const kitchenDetails = NELSON_PAIRS[0].details!;
const renovationNotes = [
  {
    label: 'Island cooktop',
    note: 'The renovation moved the cooktop to a waterfall island with seating.',
  },
  { label: 'Navy cabinetry', note: kitchenDetails[0].note },
  { label: 'Statement hood', note: kitchenDetails[2].note },
] as const;

/** Original project evidence with optional, local photograph notes. */
export function HomeProject() {
  const [activeNote, setActiveNote] = useState(0);

  return <section className="experience-evidence experience-section home-project" data-hv="proof" aria-labelledby="home-proof-title">
    <div className="experience-wrap">
      <div className="home-project-heading">
        <h2 id="home-proof-title" data-peggy-summary="Compare the actual Nelson Drive photographs. Open the project to inspect the renovation in more detail.">Nelson Drive,<br /> before and after.</h2>
        <p>A dated East Bay home, renewed across the kitchen, living spaces, and bathrooms. Follow the changes and the recorded acquisition, improvement budget, and sale.</p>
      </div>

      <div className="home-project-photographs">
        <figure className="home-project-before">
          <img src="/images/nelson/kitchen-before.webp" alt="Nelson Drive kitchen before the renovation" width={1600} height={999} loading="lazy" decoding="async" />
          <figcaption>Before · Original kitchen</figcaption>
        </figure>
        <figure className="home-project-after">
          <img src="/images/nelson/kitchen-after.webp" alt="Nelson Drive kitchen after the renovation: navy cabinetry and a waterfall island" width={1600} height={996} loading="lazy" decoding="async" />
          <figcaption>After · Completed interior</figcaption>
        </figure>
      </div>

      <div className="home-project-notes">
        <div className="home-project-note-controls" role="group" aria-label="Renovation notes">
          {renovationNotes.map((item, index) => <button
            key={item.label}
            type="button"
            aria-pressed={activeNote === index}
            aria-controls="home-project-note"
            onClick={() => setActiveNote(index)}
          >
            <span className="home-project-note-number" aria-hidden="true">0{index + 1}</span>
            <span>{item.label}</span>
            {activeNote === index ? <Check size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
          </button>)}
        </div>
        <p id="home-project-note" className="home-project-note" role="status" aria-live="polite" aria-atomic="true">{renovationNotes[activeNote].note}</p>
      </div>

      <div className="experience-proof-note home-project-onward">
        <p>See the original condition, the visible changes, and the documented budget and sale. The available record does not verify Pegasus’s or Apollo’s project role.</p>
        <Link href="/projects/nelson-dr" className="experience-link">Explore the case study<ArrowRight aria-hidden="true" size={17} /></Link>
      </div>
    </div>
  </section>;
}
