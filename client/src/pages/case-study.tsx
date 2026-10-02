import { PageOpening, PageClosing, PageAction } from "@/pegasus/experience-page";
import {
  NELSON_COST_DISCLOSURE,
  NELSON_EXECUTION_DISCLOSURE,
  NELSON_FACTS,
  NELSON_PUBLIC_DESCRIPTION,
} from "@shared/nelson-facts";

/**
 * Public Website v1 (issue #22) — Case Study.
 * PRD §7.12 + COPY_DECK §14: real proof. The Nelson Dr public record with
 * the locked, honest figures — no inflated profit claims, no fake scale,
 * and only the real project photos (before and after are both actual
 * photos of the property). The deeper photo essay lives at
 * /projects/nelson-dr; this page is the PRD's routed case-study summary.
 */

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const FIGURES = [
  { label: "Acquired", value: formatCurrency(NELSON_FACTS.acquired) },
  {
    label: "Improvement budget",
    value: `≈ ${formatCurrency(NELSON_FACTS.improvementBudget)}`,
  },
  {
    label: "Basis before other costs",
    value: `≈ ${formatCurrency(NELSON_FACTS.totalBasisBeforeOtherCosts)}`,
  },
  { label: "Sale", value: formatCurrency(NELSON_FACTS.salePrice) },
  {
    label: "Gross spread before other costs",
    value: `≈ ${formatCurrency(NELSON_FACTS.grossSpreadBeforeOtherCosts)}`,
  },
];

const STORY: { heading: string; body: string }[] = [
  {
    heading: "What was acquired",
    body: "The available record documents a dated single-family residential property in Richmond, project photographs, an improvement budget, and a later sale.",
  },
  {
    heading: "What changed",
    body: "Available materials identify an approximate $105,000 improvement budget and show the kitchen, bathrooms, flooring, and other finished-condition work. They do not establish every scope decision or who performed each role.",
  },
  {
    heading: "The strategy",
    body: "The public figures can be read as a value-add sequence: an approximate $600,000 acquisition, $105,000 improvement budget, and $840,000 sale. That sequence is descriptive, not an underwriting recommendation.",
  },
  {
    heading: "What was learned",
    body: NELSON_COST_DISCLOSURE,
  },
  {
    heading: "Why it matters for Pegasus now",
    body: NELSON_EXECUTION_DISCLOSURE,
  },
];

export default function CaseStudyPage() {
  return <article className="experience-page">
    <PageOpening title="A documented acquisition, improvement, and sale."
      image={{ src:'/images/nelson/nelson-hero-1280.jpg', alt:'Nelson Dr finished exterior shown in the public project record', width:1280, height:853, caption:`Case study · ${NELSON_FACTS.areaLabel} · settled ${NELSON_FACTS.settled}` }}
      action={{ href:'#case-record', label:'Read the project record' }}>
      <p>{NELSON_PUBLIC_DESCRIPTION}</p>
    </PageOpening>
    <section id="case-record" className="ep-section"><div className="experience-wrap ep-split">
      <div><h2>The project, in figures.</h2><p>The record is presented with actual project images, fixed figures, and explicit limits on cost and execution claims.</p><p className="ep-notice">One completed project · approximate project-level figures · stated cost limits</p></div>
      <dl className="ep-financial-record">{FIGURES.map(figure => <div key={figure.label}><dt>{figure.label}</dt><dd>{figure.value}</dd></div>)}</dl>
    </div></section>
    <section className="ep-section ep-dark"><div className="experience-wrap">
      <h2>The kitchen, before and after.</h2>
      <div className="ep-photo-pair">
        <figure><img src="/images/nelson/nelson-before-kitchen-1280.jpg" alt="Nelson Dr kitchen before documented improvements" loading="lazy" width={1280} height={853} /><figcaption>Before</figcaption></figure>
        <figure><img src="/images/nelson/nelson-kitchen-1280.jpg" alt="Nelson Dr kitchen after documented improvements" loading="lazy" width={1280} height={853} /><figcaption>After</figcaption></figure>
      </div>
      <p>These images are presented as documentation of this case study.</p><PageAction href="/projects/nelson-dr" secondary>See the full photo essay</PageAction>
    </div></section>
    <section className="ep-section"><div className="experience-wrap ep-split">
      <h2>What the record shows.</h2><ol className="ep-rows ep-numbered">{STORY.map(item => <li key={item.heading}><div><h3>{item.heading}</h3><p>{item.body}</p></div></li>)}</ol>
    </div></section>
    <PageClosing title="Have a property that needs the same honest read?" label="Share a Property for Consideration" />
  </article>;
}
