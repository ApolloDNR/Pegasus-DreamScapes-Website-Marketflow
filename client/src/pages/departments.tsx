import { ArrowRight } from "lucide-react";

/**
 * Public Website v1 (issue #22) — Departments.
 * PRD §7.2 + COPY_DECK §4: the operating model page. Four departments,
 * each with its role, what it handles, and an example route. Copy is
 * locked; the operating spine is Acquisitions → Development →
 * Dispositions → Asset Management.
 */

const DEPARTMENTS: {
  name: string;
  role: string;
  handles: string[];
  example: string;
}[] = [
  {
    name: "Acquisitions",
    role: "Acquisitions reviews and structures incoming opportunities.",
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
    role: "Development creates value when the property needs work.",
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
    role: "Dispositions moves the asset toward the right exit.",
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
    role: "Asset Management protects and operates long-term holds.",
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
            Four departments. One operating system.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-[#e8ded0]/80">
            Every opportunity moves through the departments it actually needs. Some deals only
            require acquisition and disposition. Others need development, asset management, or
            licensed representation. Pegasus routes the path before forcing the outcome.
          </p>
          <p className="mt-8 text-[12px] uppercase tracking-[0.2em] text-[#e8ded0]/50">
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
                Department {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl">{d.name}</h2>
              <p className="mt-4 text-[16px] leading-relaxed text-[#e8ded0]/80">{d.role}</p>
              <p className="mt-6 text-[13px] leading-relaxed text-[#e8ded0]/55">
                <span className="font-semibold uppercase tracking-[0.14em] text-[#c8915b]/80 text-[11px]">
                  Example route:{" "}
                </span>
                {d.example}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e8ded0]/45 mb-4">
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
            Submit the property, explain the situation, and Pegasus will route it to the right
            lane.
          </p>
          <div className="mt-9">
            <a
              href="/submit-property"
              className="inline-flex items-center gap-2 rounded-md bg-[#b47645] px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-[#8b5a36] transition-colors"
            >
              Submit a Property <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
