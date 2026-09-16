import { ArrowRight } from "lucide-react";

/**
 * Public Website v1 (issue #22) — Departments.
 * Public explanation of the four operating functions Pegasus may use.
 * These are accountability lanes, not a claim that four separately
 * staffed departments are available on every engagement.
 */

const DEPARTMENTS: {
  name: string;
  role: string;
  handles: string[];
  example: string;
}[] = [
  {
    name: "Acquisitions",
    role: "The acquisitions lane covers initial review and possible transaction structure.",
    handles: [
      "Property intake",
      "Seller motivation",
      "Deal source",
      "Initial underwriting",
      "Creative terms",
      "Partnership structure",
      "Purchase, assignment, or JV possibility",
    ],
    example: "Direct sale: Acquisitions → Dispositions",
  },
  {
    name: "Development",
    role: "The development lane frames a possible improvement scope when a property needs work.",
    handles: [
      "Scope planning",
      "Renovation strategy",
      "ADU potential",
      "Construction coordination",
      "Design standards",
      "Budget control",
      "Repositioning",
    ],
    example: "Value-add flip: Acquisitions → Development → Dispositions",
  },
  {
    name: "Dispositions",
    role: "The dispositions lane considers possible sale, assignment, or partner paths.",
    handles: [
      "Property marketing",
      "Buyer network",
      "Deal packaging",
      "Assignment",
      "Sale strategy",
      "Listing/referral lane when appropriate",
      "MarketFlow",
    ],
    example: "Deal finder needs buyer: Acquisitions → Dispositions / MarketFlow",
  },
  {
    name: "Asset Management",
    role: "The asset-management lane frames responsibilities for a possible long-term hold.",
    handles: [
      "Rental strategy",
      "Portfolio operations",
      "Vendor systems",
      "Tenant coordination",
      "Maintenance planning",
      "Long-term performance",
      "Future communities",
    ],
    example: "Rental hold: Acquisitions → Development → Asset Management",
  },
];

export default function DepartmentsPage() {
  return (
    <div className="min-h-screen bg-[#091421] text-[#f4efe6]">
      {/* hero */}
      <section className="px-6 pt-36 pb-16 lg:pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c8915b] mb-4">
            The Pegasus operating model
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl leading-[1.05]">
            Four functions. One operating model.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-[#e8ded0]/80">
            These labels describe work that may be required; they do not represent a promise of
            separate staffing or service on every submission. Any review, project work, or licensed
            representation depends on fit, diligence, capacity, and a separate written agreement.
          </p>
          <p className="mt-8 text-[12px] uppercase tracking-[0.2em] text-[#e8ded0]/65">
            Acquisitions <span className="text-[#b47645]">→</span> Development{" "}
            <span className="text-[#b47645]">→</span> Dispositions{" "}
            <span className="text-[#b47645]">→</span> Asset Management
          </p>
        </div>
      </section>

      {/* departments */}
      {DEPARTMENTS.map((d, i) => (
        <section
          key={d.name}
          className={`border-t border-white/10 px-6 py-14 lg:py-20 ${i % 2 === 1 ? "bg-[#0d1b2a]" : ""}`}
        >
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c8915b] mb-3">
                Function {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl">{d.name}</h2>
              <p className="mt-4 text-[16px] leading-relaxed text-[#e8ded0]/80">{d.role}</p>
              <p className="mt-6 text-[13px] leading-relaxed text-[#e8ded0]/55">
                <span className="font-semibold uppercase tracking-[0.14em] text-[#c8915b] text-[11px]">
                  Example route:{" "}
                </span>
                {d.example}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e8ded0]/65 mb-4">
                Handles
              </p>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {d.handles.map((h) => (
                  <li
                    key={h}
                    className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 text-[14px] text-[#e8ded0]/90"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="border-t border-white/10 px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl sm:text-4xl leading-snug">
            Have a property, deal, or situation worth reviewing?
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#e8ded0]/70">
            Share the property and situation for possible review. If Pegasus has a responsible
            next step, the applicable lane and terms can be discussed directly.
          </p>
          <div className="mt-9">
            <a
              href="/bring-an-opportunity"
              className="inline-flex items-center gap-2 rounded-md bg-[#9c5a24] px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#8b5a36] transition-colors"
            >
              Submit a Property <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
