import { useState } from "react";
import "./_group.css";

/**
 * Workbench v4 — The Instrument.
 *
 * Pulls the spine (3-pane chassis, lane board, path map) together with the
 * 14 unfair-advantage moves identified in the doctrine audit:
 *
 *   1.  All 8 lanes scored, not just one
 *   2.  Confidence as a band, not a point
 *   3.  One-click reverse solver
 *   4.  Side-by-side scenarios (Conservative / Base / Aggressive)
 *   5.  Status-aware verdict framing (Owner / Wholesaler / Capital / Admin)
 *   6.  Risk register with named mitigations
 *   7.  Capital stack modeler (Blueprint-tier preview)
 *   8.  Comp band distribution viz, not a point ARV
 *   9.  "What would change my mind" panel
 *  10.  Auditable trail drawer
 *  11.  Submit-to-Pegasus with 48-hour SLA badge
 *  12.  Contextual Peggy explainer on needs_more_data
 *  13.  Snapshot PDF action
 *  14.  Free → signed-in run-claim banner
 */

type Tone = "owner" | "wholesaler" | "capital" | "admin";
type Scenario = "conservative" | "base" | "aggressive";

const NAVY = "var(--pd-navy)";
const COPPER = "var(--pd-copper)";
const CREAM = "var(--pd-cream)";
const RULE = "var(--pd-rule)";
const MUTED = "var(--pd-muted)";

const TONE_FRAMES: Record<Tone, { kicker: string; verdict: string; cta: string }> = {
  owner: {
    kicker: "For the homeowner",
    verdict:
      "Your home reads as a viable refi-and-hold for a long-term operator. If you sell as-is, a serious buyer pays in the $410–$430k range. If you'd rather not list, we can talk about a private path.",
    cta: "Talk to Apollo about a private offer",
  },
  wholesaler: {
    kicker: "For the wholesaler",
    verdict:
      "Property assigns. Spread to ARV is 18%, refi math holds at 75% LTV with $40k cash left in. If your buyer is a BRRRR operator, push assignment at $425–$435k. If you're walking, comp depth is the only thing in the way.",
    cta: "Submit to Pegasus's buyer list",
  },
  capital: {
    kicker: "For the capital partner",
    verdict:
      "Deal structures as a 75% senior + 25% LP equity refinance with $40k of operator capital at close. DSCR 1.42 at 7.25%. Two open variables would tighten confidence: comp depth and a walk-through of 1985-era systems.",
    cta: "Open the capital stack modeler",
  },
  admin: {
    kicker: "For Pegasus HQ",
    verdict:
      "Route: BRRRR operator network (3 active). Submission SLA 48h. Confidence 72%, range 65–78%. Two flags before any offer: comp depth (3/5) and unverified plumbing/electrical on a 1985 build.",
    cta: "Route to operator network",
  },
};

const SCENARIO_NUMBERS: Record<Scenario, { asking: string; rehab: string; arv: string; conf: number; band: [number, number]; lane: string; metric: string }> = {
  conservative: { asking: "440,000", rehab: "85,000", arv: "585,000", conf: 51, band: [44, 58], lane: "Rental Hold", metric: "Cash flow $980/mo · DSCR 1.18" },
  base:         { asking: "425,000", rehab: "65,000", arv: "610,000", conf: 72, band: [65, 78], lane: "BRRRR",       metric: "$40k left in · $1,240/mo · DSCR 1.42" },
  aggressive:   { asking: "410,000", rehab: "55,000", arv: "640,000", conf: 84, band: [78, 90], lane: "BRRRR",       metric: "$22k left in · $1,420/mo · DSCR 1.58" },
};

export function WorkbenchInstrument() {
  const [tone, setTone] = useState<Tone>("wholesaler");
  const [scenario, setScenario] = useState<Scenario>("base");
  const [showSolver, setShowSolver] = useState(true);
  const [showTrail, setShowTrail] = useState(false);

  const s = SCENARIO_NUMBERS[scenario];
  const frame = TONE_FRAMES[tone];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: CREAM, color: NAVY, fontFamily: "var(--pd-font-sans)" }}
    >
      <SiteNav />
      <BrandBar />
      <SubjectHeader tone={tone} setTone={setTone} />
      <PathMap />

      <div className="flex-1 grid grid-cols-[260px_1fr_440px] gap-0 px-10 py-7">
        <LeftRail />
        <CenterColumn
          scenario={scenario}
          setScenario={setScenario}
          numbers={s}
          showSolver={showSolver}
          setShowSolver={setShowSolver}
        />
        <RightVerdict tone={tone} frame={frame} numbers={s} />
      </div>

      <TrailDrawer show={showTrail} toggle={() => setShowTrail((v) => !v)} />
      <SiteFooter />
    </div>
  );
}

/* ────────────── SITE CHROME ────────────── */

function SiteNav() {
  const items = ["Approach", "Projects", "Capital", "MarketFlow", "About"];
  return (
    <div className="flex items-center justify-between px-10 h-14 border-b" style={{ borderColor: RULE, backgroundColor: "rgba(246,239,228,0.7)", backdropFilter: "blur(6px)" }}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-sm flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY} 60%, ${COPPER} 60%, ${COPPER} 100%)` }}>
          <span className="text-[14px]" style={{ color: CREAM, fontFamily: "var(--pd-font-display)" }}>P</span>
        </div>
        <div>
          <div className="text-[12px] tracking-[0.22em] uppercase leading-none" style={{ fontFamily: "var(--pd-font-display)", color: NAVY, fontWeight: 600 }}>
            Pegasus Dreamscapes
          </div>
          <div className="text-[8px] tracking-[0.28em] uppercase mt-1" style={{ fontFamily: "var(--pd-font-supporting)", color: COPPER }}>
            The Deal Architect
          </div>
        </div>
      </div>
      <nav className="flex items-center gap-7">
        {items.map((it) => (
          <a key={it} href="#" className="text-[11px] tracking-[0.18em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", color: NAVY }}>
            {it}
          </a>
        ))}
        <span className="text-[11px] tracking-[0.18em] uppercase font-semibold pb-1 border-b-2" style={{ fontFamily: "var(--pd-font-supporting)", color: COPPER, borderColor: COPPER }}>
          More ▾
        </span>
        <span className="ml-2 px-2 py-1 text-[9px] tracking-[0.2em] uppercase font-semibold rounded-sm border" style={{ fontFamily: "var(--pd-font-supporting)", color: MUTED, borderColor: RULE }}>
          ◐ Auto
        </span>
        <a href="#" className="text-[11px] tracking-[0.18em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", color: NAVY }}>
          Sign in
        </a>
      </nav>
    </div>
  );
}

function SiteFooter() {
  return (
    <>
      <div className="px-10 py-5 border-t flex items-center justify-between" style={{ borderColor: RULE, backgroundColor: "rgba(13,27,45,0.03)" }}>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-sm flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY} 60%, ${COPPER} 60%, ${COPPER} 100%)` }}>
            <span className="text-[11px]" style={{ color: CREAM, fontFamily: "var(--pd-font-display)" }}>P</span>
          </div>
          <div className="text-[10px] tracking-[0.22em] uppercase" style={{ fontFamily: "var(--pd-font-supporting)", color: MUTED }}>
            Pegasus Dreamscapes Corp · Private network · Apollo · 925-744-8525
          </div>
        </div>
        <div className="text-[10px] tracking-[0.22em] uppercase italic" style={{ fontFamily: "var(--pd-font-serif)", color: MUTED }}>
          Dream it. Build it. Live it.
        </div>
      </div>
      <div className="h-1.5 w-full" style={{ backgroundColor: COPPER }} />
    </>
  );
}

/* ────────────── HEADER ZONE ────────────── */

function BrandBar() {
  return (
    <div
      className="flex items-center justify-between px-10 h-12 border-b"
      style={{ borderColor: RULE, backgroundColor: "rgba(255,255,255,0.4)" }}
    >
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: COPPER }} />
        <span className="text-[11px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--pd-font-display)", color: NAVY }}>
          Pegasus Dreamscapes
        </span>
        <span className="text-[9px] tracking-[0.22em] uppercase pl-3 ml-1 border-l" style={{ borderColor: RULE, fontFamily: "var(--pd-font-supporting)", color: MUTED }}>
          The Deal Architect
        </span>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-[10px] tracking-[0.18em] uppercase" style={{ fontFamily: "var(--pd-font-supporting)", color: MUTED }}>
          Strategy Lab · Instrument
        </span>
        <button className="text-[10px] tracking-[0.18em] uppercase font-semibold border-b pb-0.5" style={{ fontFamily: "var(--pd-font-supporting)", color: COPPER, borderColor: COPPER }}>
          Submit to Pegasus →
        </button>
      </div>
    </div>
  );
}

function SubjectHeader({ tone, setTone }: { tone: Tone; setTone: (t: Tone) => void }) {
  return (
    <div className="px-10 pt-5 pb-4 border-b" style={{ borderColor: RULE }}>
      <div className="flex items-end justify-between gap-8">
        <div className="flex-1">
          <div className="text-[10px] tracking-[0.28em] uppercase mb-1 font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", color: COPPER }}>
            Active Subject · Scenario set
          </div>
          <div className="flex items-baseline gap-4 flex-wrap">
            <h1 className="text-[32px] leading-none" style={{ fontFamily: "var(--pd-font-serif)", fontWeight: 500, letterSpacing: "-0.01em" }}>
              1247 Aberdeen Way
            </h1>
            <span className="text-sm" style={{ color: MUTED, fontFamily: "var(--pd-font-serif)" }}>
              Concord, CA 94521
            </span>
            <span className="text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-sm font-semibold" style={{ backgroundColor: "rgba(199,122,58,0.1)", color: COPPER, fontFamily: "var(--pd-font-supporting)" }}>
              Off-market · Wholesaler
            </span>
            <span className="text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-sm font-semibold border" style={{ borderColor: NAVY, color: NAVY, fontFamily: "var(--pd-font-supporting)" }}>
              Free · Snapshot tier
            </span>
          </div>
          <div className="text-[12px] mt-2 italic" style={{ fontFamily: "var(--pd-font-serif)", color: COPPER }}>
            One address in. Every angle out.
          </div>
        </div>

        {/* Tone switcher — Status-Aware Framing (move #5) */}
        <div>
          <div className="text-[9px] tracking-[0.25em] uppercase mb-1.5 font-semibold text-right" style={{ fontFamily: "var(--pd-font-supporting)", color: MUTED }}>
            Reading lens
          </div>
          <div className="flex items-center rounded-sm border p-0.5" style={{ borderColor: RULE, backgroundColor: "rgba(255,255,255,0.6)" }}>
            {(["owner", "wholesaler", "capital", "admin"] as Tone[]).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className="px-2.5 py-1.5 text-[10px] tracking-[0.18em] uppercase font-semibold rounded-sm"
                style={{
                  fontFamily: "var(--pd-font-supporting)",
                  backgroundColor: tone === t ? NAVY : "transparent",
                  color: tone === t ? CREAM : MUTED,
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PathMap() {
  const steps = [
    { l: "Property", s: "done" },
    { l: "Situation", s: "done" },
    { l: "Numbers", s: "active" },
    { l: "Comps", s: "active" },
    { l: "Risk", s: "active" },
    { l: "Capital", s: "done" },
    { l: "Verdict", s: "active" },
    { l: "Next Step", s: "pending" },
  ] as const;
  return (
    <div className="px-10 pt-4 pb-4 border-b" style={{ borderColor: RULE }}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[9px] tracking-[0.28em] uppercase" style={{ fontFamily: "var(--pd-font-supporting)", color: MUTED }}>
          Path · Stage 7 of 8 · Full read
        </div>
        <div className="text-[9px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--pd-font-supporting)", color: MUTED }}>
          Auto-saved · 4s ago
        </div>
      </div>
      <div className="flex items-center gap-0">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          const dot =
            step.s === "done" ? (
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COPPER }} />
            ) : step.s === "active" ? (
              <div className="w-3.5 h-3.5 rotate-45" style={{ backgroundColor: COPPER, boxShadow: "0 0 0 4px rgba(199,122,58,0.15)" }} />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full border" style={{ borderColor: RULE, backgroundColor: CREAM }} />
            );
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                <div className="flex-1 h-px" style={{ backgroundColor: i === 0 ? "transparent" : step.s === "pending" ? RULE : COPPER, opacity: step.s === "pending" ? 0.4 : 1 }} />
                {dot}
                <div className="flex-1 h-px" style={{ backgroundColor: isLast ? "transparent" : step.s === "done" ? COPPER : RULE, opacity: step.s === "pending" ? 0.4 : 1 }} />
              </div>
              <div className="mt-2 text-[9px] tracking-[0.18em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", color: step.s === "active" ? NAVY : step.s === "done" ? COPPER : MUTED, opacity: step.s === "pending" ? 0.6 : 1 }}>
                {step.l}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────── LEFT RAIL ────────────── */

function LeftRail() {
  return (
    <aside className="pr-6 border-r" style={{ borderColor: RULE }}>
      <Kicker num="§ 1–2" label="Subject" locked />
      <div className="mt-3 space-y-3">
        <Fact k="Address" v="1247 Aberdeen Way" />
        <Fact k="City" v="Concord, CA 94521" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          <Fact k="Beds" v="3" compact />
          <Fact k="Baths" v="2" compact />
          <Fact k="SQFT" v="1,850" compact />
          <Fact k="Built" v="1985" compact />
        </div>
        <Fact k="Condition" v="Moderate rehab" compact />
        <Fact k="Source" v="Wholesaler · Off-market" compact />
      </div>

      {/* Tier badge with Blueprint tease (move #14 + tier honesty) */}
      <div className="mt-6 pt-4 border-t" style={{ borderColor: RULE }}>
        <div className="text-[9px] tracking-[0.25em] uppercase font-semibold mb-2" style={{ fontFamily: "var(--pd-font-supporting)", color: NAVY }}>
          Tier · what's unlocked
        </div>
        <div className="space-y-1.5">
          <TierRow label="Lane Fit Board" on />
          <TierRow label="Confidence band" on />
          <TierRow label="Reverse solver" on />
          <TierRow label="Capital stack model" />
          <TierRow label="Scenario library" />
          <TierRow label="Operator routing" />
          <TierRow label="Execution roadmap" />
        </div>
        <button className="mt-3 w-full py-2 text-[10px] tracking-[0.2em] uppercase font-semibold border" style={{ fontFamily: "var(--pd-font-supporting)", borderColor: COPPER, color: COPPER, backgroundColor: "rgba(199,122,58,0.04)" }}>
          Unlock Blueprint · $897
        </button>
      </div>

      {/* Run-claim banner (move #14) */}
      <div className="mt-6 p-3 rounded-sm" style={{ backgroundColor: "rgba(13,27,45,0.04)", border: `1px dashed ${RULE}` }}>
        <div className="text-[9px] tracking-[0.25em] uppercase font-semibold mb-1" style={{ fontFamily: "var(--pd-font-supporting)", color: NAVY }}>
          Run history
        </div>
        <div className="text-[11px] leading-relaxed" style={{ color: MUTED, fontFamily: "var(--pd-font-serif)" }}>
          <span className="font-semibold" style={{ color: NAVY }}>3 runs</span> claimed ·{" "}
          <span style={{ color: COPPER }}>2 anonymous</span>
        </div>
        <button className="text-[10px] tracking-[0.18em] uppercase font-semibold mt-1.5 border-b pb-0.5" style={{ fontFamily: "var(--pd-font-supporting)", color: COPPER, borderColor: COPPER }}>
          Claim anonymous runs →
        </button>
      </div>

      {/* Doctrine */}
      <div className="mt-6 pt-4 border-t text-[11px] leading-relaxed" style={{ borderColor: RULE, color: MUTED }}>
        <div className="text-[9px] tracking-[0.25em] uppercase mb-1.5 font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", color: NAVY }}>
          Doctrine
        </div>
        Every property gets a serious review. Not every property gets an offer.
      </div>
    </aside>
  );
}

function TierRow({ label, on }: { label: string; on?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={on ? "" : "line-through"} style={{ fontSize: 11, color: on ? NAVY : MUTED, fontFamily: "var(--pd-font-serif)" }}>
        {label}
      </span>
      <span className="text-[8px] tracking-[0.2em] uppercase ml-auto" style={{ fontFamily: "var(--pd-font-supporting)", color: on ? COPPER : MUTED, fontWeight: 600 }}>
        {on ? "Free" : "Blueprint"}
      </span>
    </div>
  );
}

/* ────────────── CENTER COLUMN ────────────── */

function CenterColumn({
  scenario, setScenario, numbers, showSolver, setShowSolver,
}: {
  scenario: Scenario;
  setScenario: (s: Scenario) => void;
  numbers: typeof SCENARIO_NUMBERS[Scenario];
  showSolver: boolean;
  setShowSolver: (v: boolean) => void;
}) {
  return (
    <section className="px-8">
      {/* Scenario tabs — move #4 */}
      <div className="flex items-end justify-between mb-3">
        <Kicker num="§ 3" label="Numbers · Scenario set" active />
        <div className="flex items-center gap-1">
          {(["conservative", "base", "aggressive"] as Scenario[]).map((s) => (
            <button
              key={s}
              onClick={() => setScenario(s)}
              className="px-2.5 py-1.5 text-[10px] tracking-[0.18em] uppercase font-semibold rounded-sm border"
              style={{
                fontFamily: "var(--pd-font-supporting)",
                backgroundColor: scenario === s ? COPPER : "transparent",
                color: scenario === s ? CREAM : MUTED,
                borderColor: scenario === s ? COPPER : RULE,
              }}
            >
              {s}
            </button>
          ))}
          <button className="px-2.5 py-1.5 text-[10px] tracking-[0.18em] uppercase font-semibold rounded-sm border" style={{ fontFamily: "var(--pd-font-supporting)", borderColor: RULE, color: MUTED }}>
            + New
          </button>
        </div>
      </div>

      {/* Compact input row */}
      <div className="grid grid-cols-4 gap-4 mb-6 pb-5 border-b" style={{ borderColor: RULE }}>
        <CompactInput label="Asking" value={numbers.asking} />
        <CompactInput label="Rehab" value={numbers.rehab} />
        <CompactInput label="ARV" value={numbers.arv} />
        <CompactInput label="Rate" value="7.25%" unit="%" prefix="" />
      </div>

      {/* Lane Fit Board — HEADLINE — move #1 + confidence band move #2 */}
      <div className="mb-7">
        <div className="flex items-baseline justify-between mb-2">
          <Kicker num="§" label="Lane Fit Board · all 9 lanes" />
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--pd-font-supporting)", color: MUTED }}>
            9 of 9 scored · confidence shown as range
          </span>
        </div>
        <div className="flex items-center gap-4 mb-3 pb-2 border-b" style={{ borderColor: RULE }}>
          <span className="text-[9px] tracking-[0.22em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", color: MUTED }}>
            Routed by pillar
          </span>
          <PillarKey letter="D" name="Development" />
          <PillarKey letter="I" name="Investments" />
          <PillarKey letter="S" name="Systems" />
        </div>
        <div className="space-y-2">
          <LaneRow pillar="I" name="BRRRR" sub="Refi-and-hold" band={[65, 78]} verdict="STRONG" top />
          <LaneRow pillar="D" name="Fix & Flip" sub="Light reno · 9 mo exit" band={[55, 68]} verdict="POSSIBLE" />
          <LaneRow pillar="I" name="Rental Hold" sub="Long-term cash flow" band={[42, 56]} verdict="POSSIBLE" />
          <LaneRow pillar="S" name="Wholesale Assignment" sub="Assign to BRRRR operator" band={[35, 48]} verdict="POSSIBLE" />
          <LaneRow pillar="I" name="Creative Finance" sub="Sub-to / seller-carry" band={[15, 30]} verdict="WEAK" />
          <LaneRow pillar="S" name="MLS Listing Referral" sub="Standard sale path" band={[22, 32]} verdict="WEAK" />
          <LaneRow pillar="I" name="Capital Partner Match" sub="JV with capital" band={[40, 55]} verdict="NEEDS DATA" needsData />
          <LaneRow pillar="S" name="Operator Referral" sub="Route to vetted network" band={[60, 70]} verdict="POSSIBLE" />
          <LaneRow pillar="D" name="Ground Up" sub="Tear-down + new construction" band={[18, 30]} verdict="WEAK" />
        </div>
        <div className="text-[10px] mt-3 italic leading-relaxed" style={{ fontFamily: "var(--pd-font-serif)", color: MUTED }}>
          Ground Up reads weak here. Existing structure carries $610k of ARV; lot value alone is roughly
          $260k. Tear-down math only opens up when the standing structure is functionally obsolete or
          the lot supports a denser build (ADU, duplex, lot split).
        </div>
      </div>

      {/* Reverse solver — move #3 */}
      <div className="mb-7 rounded-sm" style={{ backgroundColor: "rgba(13,27,45,0.04)", border: `1px solid ${RULE}` }}>
        <button onClick={() => setShowSolver(!showSolver)} className="w-full flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-[14px]" style={{ color: COPPER }}>↳</span>
            <span className="text-[12px] tracking-[0.2em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", color: NAVY }}>
              Reverse Solver
            </span>
            <span className="text-[11px]" style={{ fontFamily: "var(--pd-font-serif)", color: MUTED, fontStyle: "italic" }}>
              Solve for the offer that hits your confidence target.
            </span>
          </div>
          <span className="text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", color: COPPER }}>
            {showSolver ? "− Collapse" : "+ Open"}
          </span>
        </button>
        {showSolver && (
          <div className="px-4 pb-4 border-t" style={{ borderColor: RULE }}>
            <div className="grid grid-cols-4 gap-4 pt-3 items-end">
              <div>
                <Lbl>Lane</Lbl>
                <select className="mt-1 w-full text-[13px] py-1.5 px-2 bg-white/60 border-0 border-b-2" style={{ borderColor: NAVY, fontFamily: "var(--pd-font-serif)", color: NAVY }}>
                  <option>BRRRR</option><option>Fix &amp; Flip</option><option>Rental Hold</option>
                </select>
              </div>
              <div>
                <Lbl>Target confidence</Lbl>
                <input defaultValue="75%" className="mt-1 w-full text-[13px] py-1.5 px-2 bg-white/60 border-0 border-b-2" style={{ borderColor: NAVY, fontFamily: "var(--pd-font-serif)", color: NAVY }} />
              </div>
              <div>
                <Lbl>Solve for</Lbl>
                <select className="mt-1 w-full text-[13px] py-1.5 px-2 bg-white/60 border-0 border-b-2" style={{ borderColor: NAVY, fontFamily: "var(--pd-font-serif)", color: NAVY }}>
                  <option>Max offer</option><option>Max rehab</option><option>Min ARV</option>
                </select>
              </div>
              <button className="py-2 text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", backgroundColor: NAVY, color: CREAM }}>
                Solve
              </button>
            </div>
            <div className="mt-4 p-3 rounded-sm" style={{ backgroundColor: "rgba(199,122,58,0.08)" }}>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-[10px] tracking-[0.22em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", color: COPPER }}>
                  Solved
                </span>
                <span className="text-[20px] tabular-nums font-semibold" style={{ fontFamily: "var(--pd-font-serif)", color: NAVY }}>
                  $402,000
                </span>
                <span className="text-[12px]" style={{ color: MUTED, fontFamily: "var(--pd-font-serif)" }}>
                  max offer for BRRRR @ 75% confidence
                </span>
              </div>
              <div className="text-[11px] mt-1.5 leading-relaxed" style={{ color: MUTED, fontFamily: "var(--pd-font-serif)" }}>
                Cushion vs. current asking: <Strong>$23,000</Strong>. At $425k you sit at <Strong>72%</Strong>;
                below $402k you cross into <Strong>strong</Strong>; below $390k you start losing operator interest.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comp Band — move #8 */}
      <div className="mb-7">
        <div className="flex items-baseline justify-between mb-3">
          <Kicker num="§ 4" label="Comp Band · ARV distribution" active />
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--pd-font-supporting)", color: MUTED }}>
            5 closed · 0.5mi · 180 days
          </span>
        </div>
        <CompBand />
      </div>

      {/* Risk register — move #6 */}
      <div className="mb-7">
        <div className="flex items-baseline justify-between mb-3">
          <Kicker num="§ 5" label="Risk Register · named with mitigations" active />
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--pd-font-supporting)", color: MUTED }}>
            4 active · 1 critical
          </span>
        </div>
        <div className="space-y-2">
          <Risk severity="critical" name="Comp depth thin · 3 of 5" mitigation="Pull two additional 0.5mi comps before tightening offer." />
          <Risk severity="warn" name="1985 build · plumbing/electrical unverified" mitigation="Schedule a walk; pad rehab by 10% until verified." />
          <Risk severity="warn" name="Refi rate assumed at 7.25%" mitigation="Get a rate quote from preferred lender before offer." />
          <Risk severity="info" name="Wholesaler-sourced · contract chain unverified" mitigation="Pegasus desk verifies clean assignment before closing." />
        </div>
      </div>

      {/* What would change my mind — move #9 */}
      <div className="mb-2">
        <div className="flex items-baseline justify-between mb-3">
          <Kicker num="§ 6" label="What would change my mind" active />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FlipCard finding="Comp depth falls to 2/5" flip="BRRRR drops to 51%, Rental Hold becomes top lane." />
          <FlipCard finding="Rehab quote comes in at $90k" flip="BRRRR drops to 50%, Wholesale Assignment rises to top." />
          <FlipCard finding="Rate quote comes in at 6.75%" flip="BRRRR climbs to 84%, $1,420/mo cash flow." />
        </div>
      </div>
    </section>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9px] tracking-[0.22em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", color: MUTED }}>
      {children}
    </div>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <span className="tabular-nums font-semibold" style={{ color: NAVY }}>{children}</span>;
}

function CompactInput({ label, value, prefix = "$", unit }: { label: string; value: string; prefix?: string; unit?: string }) {
  return (
    <div>
      <div className="text-[9px] tracking-[0.22em] uppercase font-semibold mb-1" style={{ fontFamily: "var(--pd-font-supporting)", color: NAVY }}>
        {label}
      </div>
      <div className="flex items-baseline border-b-2 pb-1" style={{ borderColor: NAVY }}>
        {prefix && <span className="text-[14px] mr-1" style={{ color: MUTED, fontFamily: "var(--pd-font-serif)" }}>{prefix}</span>}
        <span className="flex-1 text-[18px]" style={{ fontFamily: "var(--pd-font-serif)", fontWeight: 500, color: NAVY }}>
          {value}
        </span>
        {unit && <span className="text-[12px]" style={{ color: MUTED }}>{unit}</span>}
      </div>
    </div>
  );
}

function PillarKey({ letter, name }: { letter: string; name: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-4 h-4 rounded-sm flex items-center justify-center text-[9px] font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", backgroundColor: NAVY, color: CREAM }}>
        {letter}
      </span>
      <span className="text-[9px] tracking-[0.18em] uppercase" style={{ fontFamily: "var(--pd-font-supporting)", color: MUTED }}>{name}</span>
    </div>
  );
}

function LaneRow({
  pillar, name, sub, band, verdict, top, needsData,
}: { pillar: "D" | "I" | "S"; name: string; sub: string; band: [number, number]; verdict: string; top?: boolean; needsData?: boolean }) {
  const [lo, hi] = band;
  const verdictColor =
    verdict === "STRONG" ? COPPER :
    verdict === "POSSIBLE" ? NAVY :
    verdict === "NEEDS DATA" ? "#b08a4a" :
    MUTED;
  return (
    <div className="flex items-center gap-4 py-1.5">
      <div className="w-2.5 flex-shrink-0">
        {top && <div className="w-2 h-2 rotate-45" style={{ backgroundColor: COPPER }} />}
      </div>
      <span className="w-4 h-4 flex items-center justify-center text-[9px] font-semibold rounded-sm flex-shrink-0" style={{ fontFamily: "var(--pd-font-supporting)", backgroundColor: top ? COPPER : "rgba(13,27,45,0.08)", color: top ? CREAM : NAVY }}>
        {pillar}
      </span>
      <div className="w-48 flex-shrink-0">
        <div className="text-[13px] leading-tight" style={{ fontFamily: "var(--pd-font-serif)", fontWeight: top ? 600 : 500, color: NAVY }}>
          {name}
        </div>
        <div className="text-[10px] leading-tight italic" style={{ fontFamily: "var(--pd-font-sans)", color: MUTED }}>
          {sub}
        </div>
      </div>
      {/* Confidence BAND not bar */}
      <div className="flex-1 relative h-3 rounded-sm" style={{ backgroundColor: RULE }}>
        <div
          className="absolute top-0 bottom-0 rounded-sm"
          style={{
            left: `${lo}%`,
            width: `${hi - lo}%`,
            backgroundColor: top ? COPPER : needsData ? "#d4b483" : "rgba(199,122,58,0.45)",
            opacity: needsData ? 0.5 : 1,
            backgroundImage: needsData ? "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.4) 4px, rgba(255,255,255,0.4) 8px)" : "none",
          }}
        />
        {/* tick markers at 50% and 75% */}
        <div className="absolute top-0 bottom-0 w-px" style={{ left: "50%", backgroundColor: "rgba(13,27,45,0.2)" }} />
        <div className="absolute top-0 bottom-0 w-px" style={{ left: "75%", backgroundColor: "rgba(13,27,45,0.2)" }} />
      </div>
      <div className="w-20 text-right text-[11px] tabular-nums" style={{ fontFamily: "var(--pd-font-serif)", color: top ? COPPER : MUTED, fontWeight: top ? 600 : 500 }}>
        {lo}–{hi}%
      </div>
      <div className="w-24 text-right text-[9px] tracking-[0.18em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", color: verdictColor }}>
        {verdict}
      </div>
    </div>
  );
}

function CompBand() {
  const comps = [
    { addr: "1192 Aberdeen", price: 582, sqft: 1810, dist: 0.2 },
    { addr: "1318 Sutter", price: 598, sqft: 1840, dist: 0.4 },
    { addr: "1241 Maple", price: 612, sqft: 1900, dist: 0.3 },
    { addr: "1156 Birch", price: 625, sqft: 1880, dist: 0.5 },
    { addr: "1402 Pine", price: 645, sqft: 1920, dist: 0.4 },
  ];
  const low = 560, high = 660;
  const median = 612;
  const iqr: [number, number] = [598, 625];
  return (
    <div className="p-4 rounded-sm" style={{ backgroundColor: "rgba(255,255,255,0.4)", border: `1px solid ${RULE}` }}>
      <div className="relative h-16 mb-3">
        {/* axis */}
        <div className="absolute left-0 right-0 top-1/2 h-px" style={{ backgroundColor: RULE }} />
        {/* IQR band */}
        <div
          className="absolute top-1/2 h-6 -translate-y-1/2 rounded-sm"
          style={{
            left: `${((iqr[0] - low) / (high - low)) * 100}%`,
            width: `${((iqr[1] - iqr[0]) / (high - low)) * 100}%`,
            backgroundColor: "rgba(199,122,58,0.18)",
          }}
        />
        {/* median */}
        <div
          className="absolute top-1/2 w-0.5 h-10 -translate-y-1/2"
          style={{ left: `${((median - low) / (high - low)) * 100}%`, backgroundColor: COPPER }}
        />
        {/* target ARV marker */}
        <div
          className="absolute top-0 w-px h-full"
          style={{ left: `${((610 - low) / (high - low)) * 100}%`, backgroundColor: NAVY, borderLeft: `1px dashed ${NAVY}` }}
        />
        <div className="absolute -top-0.5 text-[9px] tracking-[0.18em] uppercase font-semibold" style={{ left: `${((610 - low) / (high - low)) * 100}%`, transform: "translateX(-50%)", fontFamily: "var(--pd-font-supporting)", color: NAVY }}>
          Your ARV
        </div>
        {/* comp dots */}
        {comps.map((c, i) => (
          <div
            key={i}
            className="absolute top-1/2 w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 border-2"
            style={{ left: `${((c.price - low) / (high - low)) * 100}%`, backgroundColor: CREAM, borderColor: NAVY }}
            title={`${c.addr} · $${c.price}k`}
          />
        ))}
        {/* labels */}
        <div className="absolute left-0 bottom-0 text-[9px] tabular-nums" style={{ fontFamily: "var(--pd-font-supporting)", color: MUTED }}>${low}k</div>
        <div className="absolute right-0 bottom-0 text-[9px] tabular-nums" style={{ fontFamily: "var(--pd-font-supporting)", color: MUTED }}>${high}k</div>
        <div className="absolute bottom-0 text-[9px] tabular-nums font-semibold" style={{ left: `${((median - low) / (high - low)) * 100}%`, transform: "translateX(-50%)", fontFamily: "var(--pd-font-supporting)", color: COPPER }}>
          Median ${median}k
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 pt-3 border-t" style={{ borderColor: RULE }}>
        <Mini label="Median" value="$612k" />
        <Mini label="IQR" value="$598–625k" />
        <Mini label="Your ARV" value="$610k" tone="ok" />
        <Mini label="Depth" value="3 of 5 needed" tone="warn" />
      </div>
    </div>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  const c = tone === "warn" ? "#b08a4a" : tone === "ok" ? COPPER : NAVY;
  return (
    <div>
      <div className="text-[9px] tracking-[0.2em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", color: MUTED }}>{label}</div>
      <div className="text-[13px] tabular-nums" style={{ fontFamily: "var(--pd-font-serif)", color: c, fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function Risk({ severity, name, mitigation }: { severity: "critical" | "warn" | "info"; name: string; mitigation: string }) {
  const tag = severity === "critical" ? "CRITICAL" : severity === "warn" ? "WATCH" : "NOTE";
  const color = severity === "critical" ? "#c64a3a" : severity === "warn" ? "#b08a4a" : MUTED;
  return (
    <div className="flex items-start gap-3 p-3 rounded-sm" style={{ backgroundColor: "rgba(255,255,255,0.4)", border: `1px solid ${RULE}` }}>
      <span className="text-[9px] tracking-[0.22em] uppercase font-semibold px-2 py-0.5 mt-0.5 flex-shrink-0" style={{ fontFamily: "var(--pd-font-supporting)", color: CREAM, backgroundColor: color }}>
        {tag}
      </span>
      <div className="flex-1">
        <div className="text-[13px]" style={{ fontFamily: "var(--pd-font-serif)", color: NAVY, fontWeight: 500 }}>
          {name}
        </div>
        <div className="text-[11.5px] mt-0.5 leading-relaxed" style={{ fontFamily: "var(--pd-font-serif)", color: MUTED, fontStyle: "italic" }}>
          → {mitigation}
        </div>
      </div>
    </div>
  );
}

function FlipCard({ finding, flip }: { finding: string; flip: string }) {
  return (
    <div className="p-3 rounded-sm" style={{ backgroundColor: "rgba(13,27,45,0.04)", border: `1px solid ${RULE}` }}>
      <div className="text-[9px] tracking-[0.22em] uppercase font-semibold mb-1.5" style={{ fontFamily: "var(--pd-font-supporting)", color: MUTED }}>
        If we learn
      </div>
      <div className="text-[12px] mb-2 leading-snug" style={{ fontFamily: "var(--pd-font-serif)", color: NAVY, fontWeight: 500 }}>
        {finding}
      </div>
      <div className="h-px mb-2" style={{ backgroundColor: COPPER }} />
      <div className="text-[9px] tracking-[0.22em] uppercase font-semibold mb-1" style={{ fontFamily: "var(--pd-font-supporting)", color: COPPER }}>
        Read flips to
      </div>
      <div className="text-[11.5px] leading-snug" style={{ fontFamily: "var(--pd-font-serif)", color: NAVY, fontStyle: "italic" }}>
        {flip}
      </div>
    </div>
  );
}

/* ────────────── RIGHT VERDICT ────────────── */

function RightVerdict({ tone: _tone, frame, numbers }: { tone: Tone; frame: typeof TONE_FRAMES[Tone]; numbers: typeof SCENARIO_NUMBERS[Scenario] }) {
  return (
    <aside className="pl-6 border-l space-y-4" style={{ borderColor: RULE }}>
      {/* Verdict card */}
      <div className="rounded-sm overflow-hidden" style={{ backgroundColor: NAVY, color: CREAM }}>
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#5fbf7f", boxShadow: "0 0 6px #5fbf7f" }} />
            <span className="text-[10px] tracking-[0.28em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", color: COPPER }}>
              Verdict · Live
            </span>
          </div>
          <span className="text-[9px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--pd-font-supporting)", color: "rgba(246,239,228,0.5)" }}>
            Updated 4s ago
          </span>
        </div>

        {/* Confidence band visualization — move #2 */}
        <div className="px-5 pt-4">
          <div className="text-[9px] tracking-[0.25em] uppercase font-semibold mb-1.5" style={{ fontFamily: "var(--pd-font-supporting)", color: "rgba(246,239,228,0.5)" }}>
            Confidence range
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-[32px] tabular-nums leading-none" style={{ fontFamily: "var(--pd-font-serif)", fontWeight: 500, color: CREAM }}>
              {numbers.band[0]}–{numbers.band[1]}%
            </span>
            <span className="text-[11px]" style={{ color: "rgba(246,239,228,0.6)", fontFamily: "var(--pd-font-serif)", fontStyle: "italic" }}>
              point estimate {numbers.conf}%
            </span>
          </div>
          {/* Band visualization */}
          <div className="relative h-2 rounded-sm" style={{ backgroundColor: "rgba(246,239,228,0.12)" }}>
            <div
              className="absolute top-0 bottom-0 rounded-sm"
              style={{ left: `${numbers.band[0]}%`, width: `${numbers.band[1] - numbers.band[0]}%`, backgroundColor: COPPER }}
            />
            <div className="absolute top-0 bottom-0 w-px" style={{ left: `${numbers.conf}%`, backgroundColor: CREAM }} />
            <div className="absolute top-0 bottom-0 w-px" style={{ left: "75%", backgroundColor: "rgba(246,239,228,0.4)" }} />
          </div>
          <div className="flex justify-between text-[8px] tracking-[0.18em] uppercase mt-1" style={{ fontFamily: "var(--pd-font-supporting)", color: "rgba(246,239,228,0.45)" }}>
            <span>0</span><span>50</span><span style={{ color: COPPER }}>75 target</span><span>100</span>
          </div>
        </div>

        {/* Top lane + headline */}
        <div className="px-5 pt-4 pb-2">
          <div className="text-[9px] tracking-[0.25em] uppercase font-semibold mb-1" style={{ fontFamily: "var(--pd-font-supporting)", color: COPPER }}>
            Top lane
          </div>
          <div className="text-[22px] leading-tight" style={{ fontFamily: "var(--pd-font-serif)", fontWeight: 500, color: CREAM }}>
            {numbers.lane}
          </div>
          <div className="text-[11px] mt-0.5" style={{ fontFamily: "var(--pd-font-serif)", color: "rgba(246,239,228,0.65)", fontStyle: "italic" }}>
            {numbers.metric}
          </div>
        </div>

        {/* Drivers */}
        <div className="px-5 py-3 border-t border-white/10 grid grid-cols-2 gap-3">
          <div>
            <div className="text-[9px] tracking-[0.22em] uppercase font-semibold mb-1" style={{ fontFamily: "var(--pd-font-supporting)", color: "#5fbf7f" }}>
              Supports ↑
            </div>
            <ul className="text-[11px] space-y-0.5" style={{ color: "rgba(246,239,228,0.85)", fontFamily: "var(--pd-font-serif)" }}>
              <li>· Spread to ARV 18%</li>
              <li>· Refi math holds at 75%</li>
              <li>· DSCR 1.42</li>
            </ul>
          </div>
          <div>
            <div className="text-[9px] tracking-[0.22em] uppercase font-semibold mb-1" style={{ fontFamily: "var(--pd-font-supporting)", color: "#e8a07a" }}>
              Widens ↓
            </div>
            <ul className="text-[11px] space-y-0.5" style={{ color: "rgba(246,239,228,0.85)", fontFamily: "var(--pd-font-serif)" }}>
              <li>· Comp depth 3/5</li>
              <li>· 1985 systems unverified</li>
              <li>· Rate quote assumed</li>
            </ul>
          </div>
        </div>

        {/* Status-framed memo — move #5 */}
        <div className="px-5 py-4 border-t border-white/10" style={{ backgroundColor: "rgba(199,122,58,0.06)" }}>
          <div className="text-[9px] tracking-[0.25em] uppercase font-semibold mb-1.5" style={{ fontFamily: "var(--pd-font-supporting)", color: COPPER }}>
            {frame.kicker}
          </div>
          <p className="text-[12.5px] leading-[1.6]" style={{ fontFamily: "var(--pd-font-serif)", color: "rgba(246,239,228,0.92)" }}>
            {frame.verdict}
          </p>
        </div>
      </div>

      {/* Capital Stack — move #7 (Blueprint-locked tease) */}
      <div className="rounded-sm overflow-hidden" style={{ border: `1px solid ${RULE}`, backgroundColor: "rgba(255,255,255,0.4)" }}>
        <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b" style={{ borderColor: RULE }}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.25em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", color: NAVY }}>
              Capital Stack
            </span>
            <span className="text-[8px] tracking-[0.2em] uppercase px-1.5 py-0.5 font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", color: COPPER, border: `1px solid ${COPPER}` }}>
              Blueprint preview
            </span>
          </div>
        </div>
        <div className="p-4">
          {/* Stacked bar */}
          <div className="flex h-7 rounded-sm overflow-hidden mb-2">
            <div className="flex items-center justify-center" style={{ width: "75%", backgroundColor: NAVY, color: CREAM, fontFamily: "var(--pd-font-supporting)" }}>
              <span className="text-[9px] tracking-[0.18em] uppercase font-semibold">Senior 75%</span>
            </div>
            <div className="flex items-center justify-center" style={{ width: "17%", backgroundColor: COPPER, color: CREAM }}>
              <span className="text-[9px] tracking-[0.18em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)" }}>LP 17%</span>
            </div>
            <div className="flex items-center justify-center" style={{ width: "8%", backgroundColor: "#a8884a", color: CREAM }}>
              <span className="text-[8px] tracking-[0.15em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)" }}>GP 8%</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]" style={{ fontFamily: "var(--pd-font-serif)" }}>
            <StackRow label="Senior debt" value="$458,000" />
            <StackRow label="LP equity" value="$104,000" />
            <StackRow label="GP / operator" value="$40,000" />
          </div>
          <div className="text-[10px] mt-3 pt-3 border-t leading-relaxed" style={{ borderColor: RULE, color: MUTED, fontFamily: "var(--pd-font-serif)", fontStyle: "italic" }}>
            Pref 8% to LP · 70/30 promote above pref · 24-month exit assumed.
            <button className="ml-2 text-[10px] tracking-[0.18em] uppercase font-semibold border-b pb-0.5 not-italic" style={{ fontFamily: "var(--pd-font-supporting)", color: COPPER, borderColor: COPPER }}>
              Open modeler →
            </button>
          </div>
        </div>
      </div>

      {/* Peggy contextual explainer — move #12 */}
      <div className="rounded-sm p-4" style={{ backgroundColor: "rgba(13,27,45,0.04)", border: `1px solid ${RULE}` }}>
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: `radial-gradient(circle at 30% 30%, ${COPPER}, #8a4d24)` }}>
            <span className="text-[12px]" style={{ color: CREAM, fontFamily: "var(--pd-font-display)" }}>P</span>
          </div>
          <div className="flex-1">
            <div className="text-[10px] tracking-[0.22em] uppercase font-semibold mb-1" style={{ fontFamily: "var(--pd-font-supporting)", color: NAVY }}>
              Peggy · why Capital Partner Match needs data
            </div>
            <p className="text-[11.5px] leading-relaxed" style={{ fontFamily: "var(--pd-font-serif)", color: MUTED }}>
              I can't rank the JV lane until I know your equity contribution and target hold period. Tell
              me those two and I'll re-score it against the other eight.
            </p>
            <div className="flex gap-2 mt-2">
              <button className="text-[10px] px-2 py-1 rounded-sm border" style={{ fontFamily: "var(--pd-font-sans)", borderColor: COPPER, color: COPPER, backgroundColor: "rgba(199,122,58,0.04)" }}>
                Add JV inputs
              </button>
              <button className="text-[10px] px-2 py-1 rounded-sm border" style={{ fontFamily: "var(--pd-font-sans)", borderColor: RULE, color: MUTED }}>
                Skip
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions block + SLA badge */}
      <div className="rounded-sm overflow-hidden" style={{ border: `1px solid ${RULE}` }}>
        <div className="grid grid-cols-2 gap-2 p-3" style={{ backgroundColor: "rgba(255,255,255,0.4)" }}>
          <button className="py-2.5 text-[10px] tracking-[0.18em] uppercase font-semibold border" style={{ fontFamily: "var(--pd-font-supporting)", borderColor: NAVY, color: NAVY }}>
            Save · Library
          </button>
          <button className="py-2.5 text-[10px] tracking-[0.18em] uppercase font-semibold border" style={{ fontFamily: "var(--pd-font-supporting)", borderColor: NAVY, color: NAVY }}>
            Share link
          </button>
          <button className="py-2.5 text-[10px] tracking-[0.18em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", backgroundColor: COPPER, color: CREAM }}>
            Snapshot PDF
          </button>
          <button className="py-2.5 text-[10px] tracking-[0.18em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", backgroundColor: COPPER, color: CREAM }}>
            Order Blueprint
          </button>
        </div>
        {/* Submit + SLA — move #11 */}
        <div className="px-3 py-3 border-t" style={{ borderColor: RULE, backgroundColor: NAVY }}>
          <button className="w-full py-3 text-[11px] tracking-[0.22em] uppercase font-semibold flex items-center justify-center gap-2" style={{ fontFamily: "var(--pd-font-supporting)", backgroundColor: COPPER, color: CREAM }}>
            {frame.cta}
          </button>
          <div className="flex items-center gap-2 mt-2.5">
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "#5fbf7f" }} />
            <span className="text-[9px] tracking-[0.22em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", color: CREAM }}>
              SLA · 48 business hours
            </span>
            <span className="text-[9px]" style={{ color: "rgba(246,239,228,0.55)", fontFamily: "var(--pd-font-serif)", fontStyle: "italic" }}>
              · or it escalates
            </span>
          </div>
        </div>
        <div className="px-3 py-2.5 text-[10px] leading-relaxed border-t" style={{ color: MUTED, fontFamily: "var(--pd-font-sans)", backgroundColor: "rgba(255,255,255,0.3)", borderColor: RULE }}>
          <div className="flex items-start gap-2 mb-1.5">
            <span className="text-[9px] tracking-[0.22em] uppercase font-semibold flex-shrink-0 mt-px" style={{ fontFamily: "var(--pd-font-supporting)", color: NAVY }}>Boundary</span>
            <span style={{ color: MUTED }}>
              The Strategy Lab is a structural read. <span style={{ color: NAVY, fontWeight: 500 }}>MarketFlow</span> is a separate, vetted dealflow layer; nothing lists there without Pegasus review.
            </span>
          </div>
          <div className="text-[10px] italic" style={{ color: MUTED, fontFamily: "var(--pd-font-serif)" }}>
            Preliminary. Human review required before any offer, strategy release, or execution decision.
            Not an offer of guaranteed returns or principal protection.
          </div>
        </div>
      </div>
    </aside>
  );
}

function StackRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[8px] tracking-[0.2em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", color: MUTED }}>{label}</div>
      <div className="text-[12px] tabular-nums" style={{ color: NAVY, fontWeight: 500 }}>{value}</div>
    </div>
  );
}

/* ────────────── TRAIL DRAWER — move #10 ────────────── */

function TrailDrawer({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <div className="border-t" style={{ borderColor: RULE, backgroundColor: show ? "#0a1424" : "rgba(13,27,45,0.04)" }}>
      <button onClick={toggle} className="w-full px-10 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span style={{ color: show ? COPPER : NAVY }}>{show ? "▾" : "▸"}</span>
          <span className="text-[10px] tracking-[0.28em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", color: show ? COPPER : NAVY }}>
            Audit Trail
          </span>
          <span className="text-[10px]" style={{ color: show ? "rgba(246,239,228,0.55)" : MUTED, fontFamily: "var(--pd-font-serif)", fontStyle: "italic" }}>
            22 events · every input, calc, and lane re-score
          </span>
        </div>
        <span className="text-[9px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--pd-font-supporting)", color: show ? "rgba(246,239,228,0.55)" : MUTED }}>
          {show ? "Collapse" : "Expand"}
        </span>
      </button>
      {show && (
        <div className="px-10 pb-4 text-[11px]" style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", color: CREAM }}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-0.5">
            <TrailLine ts="10:42:01" tag="LANE"    msg="9 lanes eligible · scored across 3 pillars" />
            <TrailLine ts="10:42:03" tag="INPUT"   msg="Scenario · BASE selected" />
            <TrailLine ts="10:42:05" tag="CALC"    msg="All-in $498k · spread $112k" />
            <TrailLine ts="10:42:05" tag="LANE"    msg="BRRRR · 67% → 72%" tone="up" />
            <TrailLine ts="10:42:06" tag="RISK"    msg="Comp depth 3/5 flagged" tone="warn" />
            <TrailLine ts="10:42:07" tag="SOLVER"  msg="Reverse · $402k @ 75%" />
            <TrailLine ts="10:42:08" tag="LENS"    msg="Tone frame · WHOLESALER" />
            <TrailLine ts="10:42:09" tag="VERDICT" msg="BRRRR 72% · range 65–78%" tone="verdict" />
            <TrailLine ts="10:42:10" tag="EXPORT"  msg="Snapshot PDF generated" />
            <TrailLine ts="10:42:11" tag="SUBMIT"  msg="Pegasus desk · SLA 48h started" tone="verdict" />
          </div>
        </div>
      )}
    </div>
  );
}

function TrailLine({ ts, tag, msg, tone }: { ts: string; tag: string; msg: string; tone?: "up" | "warn" | "verdict" }) {
  const tagColor: Record<string, string> = {
    INPUT: "rgba(246,239,228,0.5)", CALC: "#a8b8d4", LANE: COPPER,
    RISK: "#e8a07a", SOLVER: "#c8a8e8", LENS: "#a8b8d4",
    VERDICT: "#5fbf7f", EXPORT: "rgba(246,239,228,0.5)", SUBMIT: "#5fbf7f",
  };
  const toneColor = tone === "up" ? "#7fd09a" : tone === "warn" ? "#f0c878" : tone === "verdict" ? CREAM : "rgba(246,239,228,0.85)";
  return (
    <div className="flex items-baseline gap-3 py-0.5">
      <span className="tabular-nums" style={{ color: "rgba(246,239,228,0.35)" }}>{ts}</span>
      <span className="text-[9px] tracking-[0.15em] uppercase font-semibold w-14" style={{ fontFamily: "var(--pd-font-supporting)", color: tagColor[tag] }}>{tag}</span>
      <span className="flex-1" style={{ color: toneColor }}>{msg}</span>
    </div>
  );
}

/* ────────────── shared atoms ────────────── */

function Kicker({ num, label, active, locked }: { num: string; label: string; active?: boolean; locked?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-[10px] tracking-[0.28em] uppercase font-semibold" style={{ fontFamily: "var(--pd-font-supporting)", color: active ? COPPER : MUTED }}>
        {num} · {label}
      </div>
      {active && <div className="w-12 h-px" style={{ backgroundColor: COPPER }} />}
      {locked && (
        <div className="text-[8px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--pd-font-supporting)", color: MUTED }}>
          locked
        </div>
      )}
    </div>
  );
}

function Fact({ k, v, compact = false }: { k: string; v: string; compact?: boolean }) {
  return (
    <div>
      <div className="text-[9px] tracking-[0.22em] uppercase font-semibold mb-0.5" style={{ fontFamily: "var(--pd-font-supporting)", color: MUTED }}>
        {k}
      </div>
      <div className={compact ? "text-[13px]" : "text-[14px]"} style={{ fontFamily: "var(--pd-font-serif)", color: NAVY }}>
        {v}
      </div>
    </div>
  );
}
