import { ArrowRight } from "lucide-react";

/**
 * Public Website v1 (issue #22) — The Pegasus Standard.
 * PRD §7.13 + COPY_DECK §15: the long-term vision page. Clearly labeled
 * future development direction; never implies current inventory. Copy is
 * locked; imagery (Category C, Hellenic Modern) can be added later per
 * IMAGE_DIRECTION_AND_HIGS_PROMPTS.md without changing the structure.
 */

const ARCHITECTURE = [
  "Pale limestone", "Ivory plaster", "Travertine", "Simplified Greek-style columns",
  "Flat rooflines", "Courtyards", "Colonnades", "Pergolas", "Olive trees",
  "Cypress trees", "Fountains", "Water channels", "Fire bowls", "Open-air living",
];

const FEELING = [
  "Cool stone", "Warm light", "Moving water", "Natural shade",
  "Fresh airflow", "Quiet focus", "Grounded living",
];

const COMMUNITY = [
  "Walkable paths", "Courtyards", "Small plazas", "Shared gardens",
  "Homes with identity", "Beauty without chaos", "Density with dignity",
];

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#b47645]/40 px-4 py-2 text-[13px] text-[#e8ded0]">
      {children}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c8915b] mb-4">
      {children}
    </p>
  );
}

export default function PegasusStandardPage() {
  return (
    <main className="min-h-screen bg-[#091421] text-[#f4efe6]">
      {/* hero */}
      <section className="px-6 pt-36 pb-20 lg:pb-28">
        <div className="mx-auto max-w-4xl text-center">
          <SectionLabel>Future vision · long-term development direction</SectionLabel>
          <h1 className="font-serif text-5xl sm:text-6xl leading-[1.05]">The Pegasus Standard</h1>
          <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-relaxed text-[#e8ded0]/80">
            A future living standard shaped by beauty, durability, calm, nature, and human flourishing.
          </p>
          <p className="mx-auto mt-8 max-w-xl text-[15px] italic leading-relaxed text-[#e8ded0]/60">
            <span className="not-italic font-semibold text-[#c8915b]">Eudaimonia</span> means human
            flourishing. For Pegasus, it means real estate should help people live better — not just
            occupy space.
          </p>
        </div>
      </section>

      {/* the architecture */}
      <section className="border-t border-white/10 px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>The Architecture</SectionLabel>
          <h2 className="font-serif text-3xl sm:text-4xl mb-6">Hellenic Modern / Classical Mediterranean.</h2>
          <div className="flex flex-wrap gap-3">
            {ARCHITECTURE.map((a) => <Pill key={a}>{a}</Pill>)}
          </div>
        </div>
      </section>

      {/* the feeling */}
      <section className="border-t border-white/10 bg-[#0d1b2a] px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>The Feeling</SectionLabel>
          <p className="font-serif text-2xl sm:text-3xl leading-relaxed text-[#e8ded0]">
            {FEELING.join(". ")}.
          </p>
        </div>
      </section>

      {/* the community standard */}
      <section className="border-t border-white/10 px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>The Community Standard</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMMUNITY.map((c) => (
              <div key={c} className="rounded-lg border border-white/10 bg-white/[0.03] px-6 py-5 text-[15px] text-[#e8ded0]/90">
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* the business bridge */}
      <section className="border-t border-white/10 bg-[#0d1b2a] px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <SectionLabel>The Business Bridge</SectionLabel>
          <p className="font-serif text-2xl sm:text-3xl leading-relaxed">
            Today Pegasus builds the foundation through acquisitions, development, dispositions,
            and asset management. Long term, those capabilities compound into better homes,
            neighborhoods, and communities.
          </p>
          <p className="mt-8 text-[13px] uppercase tracking-[0.18em] text-[#e8ded0]/45">
            Future vision — not current inventory, not an active development
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href="/submit-property"
              className="inline-flex items-center gap-2 rounded-md bg-[#b47645] px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#8b5a36] transition-colors">
              Submit a Property <ArrowRight className="h-4 w-4" />
            </a>
            <a href="/marketflow"
              className="inline-flex items-center gap-2 rounded-md border border-[#b47645]/60 px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#e8ded0] hover:border-[#b47645] transition-colors">
              Explore Pegasus Opportunities
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
