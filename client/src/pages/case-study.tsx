import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

/**
 * Public Website v1 (issue #22) — Case Study.
 * PRD §7.12 + COPY_DECK §14: real proof. The Nelson Dr repositioning with
 * the locked, honest figures — no inflated profit claims, no fake scale,
 * and only the real project photos (before and after are both actual
 * photos of the property). The deeper photo essay lives at
 * /projects/nelson-dr; this page is the PRD's routed case-study summary.
 */

const FIGURES = [
  { label: "Acquired", value: "$600,000" },
  { label: "Renovation", value: "≈ $105,000" },
  { label: "Sold", value: "$840,000" },
];

const STORY: { heading: string; body: string }[] = [
  {
    heading: "What was acquired",
    body: "A dated single-family residential property in Richmond / East Bay — livable but tired, with deferred maintenance, an aging kitchen and baths, and finishes decades past the market. It was the kind of property most buyers scroll past and most sellers do not know how to price.",
  },
  {
    heading: "What changed",
    body: "A scoped renovation of approximately $105,000, focused on the kitchen, the bathrooms, flooring, and finish quality — the improvements that present clearly to retail buyers without overbuilding. The scope was defined up front and managed against budget, not discovered along the way.",
  },
  {
    heading: "The strategy",
    body: "A straightforward value-add repositioning: buy at a defensible basis, renovate to what the neighborhood actually supports, and sell to an owner-occupant who wants a finished home. The exit was understood before entering — the renovation served the exit, not the other way around.",
  },
  {
    heading: "What was learned",
    body: "Honest underwriting beats optimistic underwriting. Scope discipline protects the spread more than any negotiation. Construction management is a daily job, not a weekly check-in. And the buyer who pays best is the one the product was actually designed for.",
  },
  {
    heading: "Why it matters for Pegasus now",
    body: "This project shaped the Pegasus operating standard: underwrite honestly, scope carefully, manage the build, and understand the exit before entering. It is the template every submission is reviewed against — one real, completed cycle through Acquisitions, Development, and Dispositions.",
  },
];

export default function CaseStudyPage() {
  return (
    <div className="min-h-screen bg-[#091421] text-[#f4efe6]">
      {/* hero — real project photo */}
      <section className="relative">
        <img
          src="/images/nelson/nelson-hero-1280.jpg"
          alt="Nelson Dr — finished exterior after the Pegasus repositioning"
          className="h-[52vh] min-h-[380px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#091421] via-[#091421]/55 to-[#091421]/35" />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c8915b] mb-4">
              Case study · Richmond / East Bay
            </p>
            <h1 className="font-serif text-4xl sm:text-6xl leading-[1.05]">
              Founder-led value-add repositioning.
            </h1>
          </div>
        </div>
      </section>

      {/* locked summary + figures */}
      <section className="px-6 py-14 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[17px] leading-relaxed text-[#e8ded0]/85">
            A dated residential property was acquired, renovated, repositioned, and sold to an
            owner-occupant. The project shaped the Pegasus operating standard: underwrite
            honestly, scope carefully, manage construction, and understand the exit before
            entering.
          </p>
          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
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
            Sold to an owner-occupant · real project, real photos, real numbers
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
                alt="Nelson Dr kitchen before renovation — dated cabinets and finishes"
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
                alt="Nelson Dr kitchen after renovation — rebuilt to neighborhood standard"
                loading="lazy"
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
              <figcaption className="mt-3 text-[12px] uppercase tracking-[0.18em] text-[#c8915b]">
                After
              </figcaption>
            </figure>
          </div>
          <p className="mt-6 text-center text-[13px] text-[#e8ded0]/55">
            Every image on this page is an actual photo of the project.{" "}
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
              href="/submit-property"
              className="inline-flex items-center gap-2 rounded-md bg-[#b47645] px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#8b5a36] transition-colors"
            >
              Submit a Property for Review <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
