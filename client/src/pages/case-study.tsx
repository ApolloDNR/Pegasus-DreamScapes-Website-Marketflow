import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
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
  return (
    <div className="min-h-screen bg-[#091421] text-[#f4efe6]">
      {/* hero — real project photo */}
      <section className="relative">
        <img
          src="/images/nelson/nelson-hero-1280.jpg"
          alt="Nelson Dr finished exterior shown in the public project record"
          className="h-[52vh] min-h-[380px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#091421] via-[#091421]/55 to-[#091421]/35" />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c8915b] mb-4">
              Case study · {NELSON_FACTS.areaLabel} · settled {NELSON_FACTS.settled}
            </p>
            <h1 className="font-serif text-4xl sm:text-6xl leading-[1.05]">
              A documented acquisition, improvement, and sale.
            </h1>
          </div>
        </div>
      </section>

      {/* locked summary + figures */}
      <section className="px-6 py-14 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[17px] leading-relaxed text-[#e8ded0]/85">
            {NELSON_PUBLIC_DESCRIPTION} The record is presented with actual project images,
            fixed figures, and explicit limits on cost and execution claims.
          </p>
          <dl className="mt-10 grid gap-4 sm:grid-cols-5">
            {FIGURES.map((f) => (
              <div
                key={f.label}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-6 py-6"
              >
                <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c8915b]">
                  {f.label}
                </dt>
                <dd className="mt-2 font-serif text-3xl">{f.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-[12px] uppercase tracking-[0.18em] text-[#e8ded0]/45">
            One completed project · approximate project-level figures · stated cost limits
          </p>
        </div>
      </section>

      {/* before / after — actual photos of the property */}
      <section className="border-t border-white/10 bg-[#0d1b2a] px-6 py-14 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c8915b] mb-6 text-center">
            The kitchen, before and after
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <figure>
              <img
                src="/images/nelson/nelson-before-kitchen-1280.jpg"
                alt="Nelson Dr kitchen before documented improvements"
                loading="lazy"
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
              <figcaption className="mt-3 text-[12px] uppercase tracking-[0.18em] text-[#e8ded0]/50">
                Before
              </figcaption>
            </figure>
            <figure>
              <img
                src="/images/nelson/nelson-kitchen-1280.jpg"
                alt="Nelson Dr kitchen after documented improvements"
                loading="lazy"
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
              <figcaption className="mt-3 text-[12px] uppercase tracking-[0.18em] text-[#c8915b]">
                After
              </figcaption>
            </figure>
          </div>
          <p className="mt-6 text-center text-[13px] text-[#e8ded0]/55">
            These images are presented as documentation of this case study.{" "}
            <Link href="/projects/nelson-dr" className="text-[#c8915b] underline underline-offset-4">
              See the full photo essay
            </Link>
          </p>
        </div>
      </section>

      {/* the story */}
      <section className="border-t border-white/10 px-6 py-14 lg:py-20">
        <div className="mx-auto max-w-3xl space-y-12">
          {STORY.map((s, i) => (
            <div key={s.heading}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c8915b] mb-3">
                {String(i + 1).padStart(2, "0")} · {s.heading}
              </p>
              <p className="text-[16px] leading-relaxed text-[#e8ded0]/85">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 bg-[#0d1b2a] px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl sm:text-4xl leading-snug">
            Have a property that needs the same honest read?
          </h2>
          <div className="mt-9">
            <a
              href="/bring-an-opportunity"
              className="inline-flex items-center gap-2 rounded-md bg-[#b47645] px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#8b5a36] transition-colors"
            >
            Share a Property for Consideration <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
