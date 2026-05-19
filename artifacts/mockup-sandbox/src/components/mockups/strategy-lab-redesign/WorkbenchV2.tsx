import { useState } from "react";
import "./_group.css";

/**
 * Workbench v2 — Resolved.
 * Same 3-pane workstation as v1. Refinements:
 *  - Tighter header rhythm, page fills to a natural baseline (~1700)
 *  - CENTER: adds Lane Comparison strip below inputs + Comps preview teaser
 *  - RIGHT: confidence ring +30%, top-3 lane ranking with hairline bars,
 *    mini sensitivity row, "answered so far" input trail
 *  - Subject sheet: condensed, gains a "review pulse" stat (8 props this wk)
 */

type Step = { key: string; label: string; status: "done" | "active" | "pending" };
const STEPS: Step[] = [
  { key: "property", label: "Property", status: "done" },
  { key: "situation", label: "Situation", status: "done" },
  { key: "numbers", label: "Numbers", status: "active" },
  { key: "comps", label: "Comps", status: "pending" },
  { key: "risk", label: "Risk", status: "pending" },
  { key: "strategy", label: "Strategy", status: "pending" },
  { key: "exit", label: "Exit", status: "pending" },
  { key: "next", label: "Next Step", status: "pending" },
];

const LANES = [
  { name: "BRRRR", sub: "Refi-and-hold", score: 72, top: true },
  { name: "Fix & Flip", sub: "Exit in 9 mo", score: 64 },
  { name: "Rental Hold", sub: "Long-term cash flow", score: 51 },
  { name: "Wholesale", sub: "Assign to operator", score: 38 },
  { name: "Creative Finance", sub: "Sub-to / seller-finance", score: 22 },
];

const SENS = [
  { label: "ARV −10%", delta: -38, neg: true },
  { label: "Rehab +15%", delta: -22, neg: true },
  { label: "Rate +50bps", delta: -8, neg: true },
  { label: "Offer −$20k", delta: +18, neg: false },
];

export function WorkbenchV2() {
  const [mode, setMode] = useState<"quick" | "full">("quick");
  const [asking, setAsking] = useState("425,000");
  const [rehab, setRehab] = useState("65,000");
  const [arv, setArv] = useState("610,000");

  const navy = "var(--pd-navy)";
  const copper = "var(--pd-copper)";
  const cream = "var(--pd-cream)";
  const rule = "var(--pd-rule)";
  const muted = "var(--pd-muted)";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: cream, color: navy, fontFamily: "var(--pd-font-sans)" }}
    >
      {/* slim brand bar */}
      <div
        className="flex items-center justify-between px-10 h-12 border-b"
        style={{ borderColor: rule, backgroundColor: "rgba(255,255,255,0.4)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: copper }} />
          <div
            className="text-[11px] tracking-[0.2em] uppercase"
            style={{ fontFamily: "var(--pd-font-display)", color: navy }}
          >
            Pegasus Dreamscapes
          </div>
          <div
            className="text-[9px] tracking-[0.22em] uppercase pl-3 ml-1 border-l"
            style={{ borderColor: rule, fontFamily: "var(--pd-font-supporting)", color: muted }}
          >
            The Deal Architect
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div
            className="text-[10px] tracking-[0.18em] uppercase"
            style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
          >
            Strategy Lab
          </div>
          <button
            className="text-[10px] tracking-[0.18em] uppercase font-semibold border-b pb-0.5"
            style={{ fontFamily: "var(--pd-font-supporting)", color: copper, borderColor: copper }}
          >
            Start a Strategy Review →
          </button>
        </div>
      </div>

      {/* workspace header */}
      <div className="px-10 pt-5 pb-4 border-b" style={{ borderColor: rule }}>
        <div className="flex items-end justify-between gap-8">
          <div className="flex-1">
            <div
              className="text-[10px] tracking-[0.28em] uppercase mb-1"
              style={{ fontFamily: "var(--pd-font-supporting)", color: copper, fontWeight: 600 }}
            >
              Active Subject
            </div>
            <div className="flex items-baseline gap-4 flex-wrap">
              <h1
                className="text-[32px] leading-none"
                style={{ fontFamily: "var(--pd-font-serif)", fontWeight: 500, letterSpacing: "-0.01em" }}
              >
                1247 Aberdeen Way
              </h1>
              <div className="text-sm" style={{ color: muted, fontFamily: "var(--pd-font-serif)" }}>
                Concord, CA 94521
              </div>
              <div
                className="text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-sm"
                style={{
                  backgroundColor: "rgba(199,122,58,0.1)",
                  color: copper,
                  fontFamily: "var(--pd-font-supporting)",
                  fontWeight: 600,
                }}
              >
                Off-market · Wholesaler
              </div>
            </div>
            <div className="text-[12px] mt-2 italic" style={{ fontFamily: "var(--pd-font-serif)", color: copper }}>
              One address in. Every angle out.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center rounded-sm border p-0.5"
              style={{ borderColor: rule, backgroundColor: "rgba(255,255,255,0.6)" }}
            >
              {(["quick", "full"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="px-3.5 py-1.5 text-[10px] tracking-[0.18em] uppercase font-semibold rounded-sm"
                  style={{
                    fontFamily: "var(--pd-font-supporting)",
                    backgroundColor: mode === m ? navy : "transparent",
                    color: mode === m ? cream : muted,
                  }}
                >
                  {m === "quick" ? "Quick Read" : "Full Path"}
                </button>
              ))}
            </div>
            <Tool label="Reset" />
            <Tool label="Save" />
            <Tool label="Share" />
          </div>
        </div>

        {/* path map */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <div
              className="text-[9px] tracking-[0.28em] uppercase"
              style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
            >
              Path · Stage 3 of 8 · Quick Read
            </div>
            <div
              className="text-[9px] tracking-[0.2em] uppercase"
              style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
            >
              Auto-saved · 2 min ago
            </div>
          </div>
          <PathMap steps={STEPS} />
        </div>
      </div>

      {/* 3 panes */}
      <div className="flex-1 grid grid-cols-[280px_1fr_400px] gap-0 px-10 py-7">
        {/* LEFT — subject */}
        <aside className="pr-8 border-r" style={{ borderColor: rule }}>
          <Kicker num="§ 1–2" label="Subject" locked />
          <div className="mt-4 space-y-4">
            <Fact k="Address" v="1247 Aberdeen Way" />
            <Fact k="City" v="Concord, CA 94521" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Fact k="Beds" v="3" compact />
              <Fact k="Baths" v="2" compact />
              <Fact k="SQFT" v="1,850" compact />
              <Fact k="Built" v="1985" compact />
            </div>
            <Fact k="Condition" v="Moderate rehab" />
            <Fact k="Status" v="Off-market" />
            <Fact k="Source" v="Wholesaler" />
          </div>

          <button
            className="mt-6 text-[10px] tracking-[0.2em] uppercase font-semibold border-b pb-0.5"
            style={{ fontFamily: "var(--pd-font-supporting)", color: copper, borderColor: copper }}
          >
            Edit subject
          </button>

          {/* review pulse */}
          <div className="mt-8 pt-5 border-t" style={{ borderColor: rule }}>
            <div
              className="text-[9px] tracking-[0.25em] uppercase mb-3 font-semibold"
              style={{ fontFamily: "var(--pd-font-supporting)", color: navy }}
            >
              Review Pulse
            </div>
            <div className="grid grid-cols-2 gap-4">
              <PulseStat n="8" l="Properties this week" />
              <PulseStat n="3" l="Submitted" />
              <PulseStat n="12" l="In library" />
              <PulseStat n="2" l="Routed" />
            </div>
          </div>

          <div
            className="mt-8 pt-5 border-t text-[11px] leading-relaxed"
            style={{ borderColor: rule, color: muted }}
          >
            <div
              className="text-[9px] tracking-[0.25em] uppercase mb-2 font-semibold"
              style={{ fontFamily: "var(--pd-font-supporting)", color: navy }}
            >
              Doctrine
            </div>
            Every property gets a serious review. Not every property gets an offer.
          </div>
        </aside>

        {/* CENTER */}
        <section className="px-10">
          <Kicker num="§ 3" label="Numbers" active />
          <h2
            className="text-[26px] mt-3 mb-1.5 leading-tight"
            style={{ fontFamily: "var(--pd-font-serif)", fontWeight: 500, letterSpacing: "-0.015em" }}
          >
            What does this property cost to do?
          </h2>
          <p className="text-[13px] leading-relaxed max-w-md mb-6" style={{ color: muted }}>
            Three numbers drive every lane. Enter your best estimate. The verdict on the right will move
            as you type. Try changing one to see what flips.
          </p>

          <div className="space-y-5">
            <BigInput label="Asking Price" prefix="$" value={asking} onChange={setAsking}
              hint="What it would take to put under contract." />
            <BigInput label="Estimated Rehab" prefix="$" value={rehab} onChange={setRehab}
              hint="Scope-of-work estimate. Pessimistic beats optimistic." />
            <BigInput label="Target ARV" prefix="$" value={arv} onChange={setArv}
              hint="After-repair value, supported by your comps." />
          </div>

          {/* think out loud */}
          <div
            className="mt-6 p-4 rounded-sm border-l-2"
            style={{ borderColor: copper, backgroundColor: "rgba(199,122,58,0.04)" }}
          >
            <div
              className="text-[9px] tracking-[0.25em] uppercase font-semibold mb-2"
              style={{ fontFamily: "var(--pd-font-supporting)", color: copper }}
            >
              Think out loud
            </div>
            <div className="text-[13px] flex items-center gap-3 flex-wrap" style={{ color: navy }}>
              <span>Try:</span>
              <Chip label="↓ offer −$15k" />
              <Chip label="↑ rehab +$10k" />
              <Chip label="↓ ARV −$25k" />
              <span style={{ color: muted }}>· verdict re-scores live</span>
            </div>
          </div>

          {/* NEW: Lane comparison */}
          <div className="mt-8">
            <div className="flex items-baseline justify-between mb-3">
              <Kicker num="§" label="Lane Fit Comparison" />
              <div
                className="text-[10px] tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
              >
                5 of 8 lanes scored
              </div>
            </div>
            <div className="space-y-2.5">
              {LANES.map((l) => (
                <LaneBar key={l.name} {...l} />
              ))}
            </div>
            <button
              className="mt-3 text-[10px] tracking-[0.2em] uppercase font-semibold"
              style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
            >
              + Show all 8 lanes
            </button>
          </div>

          {/* Step nav */}
          <div className="flex items-center justify-between mt-9 pt-5 border-t" style={{ borderColor: rule }}>
            <button
              className="text-[10px] tracking-[0.2em] uppercase font-semibold"
              style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
            >
              ← Back: Situation
            </button>
            <div className="flex items-center gap-3">
              <div
                className="text-[10px] tracking-[0.18em] uppercase"
                style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
              >
                Up next: Comps → Risk → Strategy → Exit → Next Step
              </div>
              <button
                className="px-5 py-2.5 text-[11px] tracking-[0.2em] uppercase font-semibold flex items-center gap-2"
                style={{
                  fontFamily: "var(--pd-font-supporting)",
                  backgroundColor: navy,
                  color: cream,
                }}
              >
                Next: Comps →
              </button>
            </div>
          </div>

          {/* NEW: Comps preview teaser */}
          <div
            className="mt-6 p-5 rounded-sm border"
            style={{ borderColor: rule, backgroundColor: "rgba(255,255,255,0.5)" }}
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div
                  className="text-[9px] tracking-[0.25em] uppercase font-semibold mb-1.5"
                  style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
                >
                  Next Stage Preview · Comps
                </div>
                <div
                  className="text-[15px] leading-snug mb-1"
                  style={{ fontFamily: "var(--pd-font-serif)", color: navy }}
                >
                  Your target ARV needs <span style={{ color: copper, fontWeight: 600 }}>5 closed comps</span>{" "}
                  within 0.5mi, 90-180 days. We've pre-pulled 3.
                </div>
                <div className="text-[11px]" style={{ color: muted }}>
                  Add two more for high-confidence sensitivity bands.
                </div>
              </div>
              <button
                className="text-[10px] tracking-[0.2em] uppercase font-semibold border-b pb-0.5 flex-shrink-0"
                style={{ fontFamily: "var(--pd-font-supporting)", color: copper, borderColor: copper }}
              >
                Pull comps →
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT — Verdict (taller, richer) */}
        <aside className="pl-2">
          <div
            className="rounded-sm overflow-hidden"
            style={{ backgroundColor: navy, color: cream }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "#5fbf7f", boxShadow: "0 0 8px #5fbf7f" }}
                />
                <div
                  className="text-[9px] tracking-[0.28em] uppercase font-semibold"
                  style={{ fontFamily: "var(--pd-font-supporting)", color: "rgba(246,239,228,0.7)" }}
                >
                  Verdict · Live
                </div>
              </div>
              <div
                className="text-[9px] tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--pd-font-supporting)", color: "rgba(246,239,228,0.5)" }}
              >
                Updated 0s ago
              </div>
            </div>

            {/* big confidence + top lane */}
            <div className="px-5 pt-6 pb-5 flex items-center gap-5 border-b border-white/10">
              <Ring pct={72} size={104} />
              <div className="flex-1">
                <div
                  className="text-[9px] tracking-[0.25em] uppercase mb-1.5"
                  style={{ fontFamily: "var(--pd-font-supporting)", color: "rgba(246,239,228,0.55)" }}
                >
                  Top Lane
                </div>
                <div
                  className="text-[24px] leading-tight"
                  style={{ fontFamily: "var(--pd-font-serif)", fontWeight: 500 }}
                >
                  BRRRR
                </div>
                <div
                  className="text-[13px] mt-0.5 italic"
                  style={{ fontFamily: "var(--pd-font-serif)", color: "rgba(246,239,228,0.7)" }}
                >
                  Refi-and-hold
                </div>
                <div className="flex items-center gap-3 mt-2.5">
                  <Tag>Strong fit</Tag>
                  <Tag tone="soft">5 lanes scored</Tag>
                </div>
              </div>
            </div>

            {/* top 3 lane ranking */}
            <div className="px-5 pt-4 pb-4 border-b border-white/10">
              <div
                className="text-[9px] tracking-[0.25em] uppercase mb-3 font-semibold flex items-center justify-between"
                style={{ fontFamily: "var(--pd-font-supporting)", color: copper }}
              >
                <span>Lane Ranking</span>
                <span style={{ color: "rgba(246,239,228,0.4)" }}>top 3</span>
              </div>
              {LANES.slice(0, 3).map((l) => (
                <DarkLaneBar key={l.name} {...l} />
              ))}
            </div>

            {/* economics */}
            <div className="px-5 pt-4 pb-4 border-b border-white/10">
              <div
                className="text-[9px] tracking-[0.25em] uppercase mb-3 font-semibold"
                style={{ fontFamily: "var(--pd-font-supporting)", color: copper }}
              >
                Economics · BRRRR base case
              </div>
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 text-[12px]">
                <Econ k="All-in basis" v="$498,000" />
                <Econ k="Refi at 75%" v="$458,000" />
                <Econ k="Cash left in" v="$40,000" accent />
                <Econ k="Cash flow" v="$1,240/mo" accent />
                <Econ k="DSCR" v="1.42" />
                <Econ k="Equity captured" v="$112k" />
              </div>
            </div>

            {/* sensitivity */}
            <div className="px-5 pt-4 pb-4 border-b border-white/10">
              <div
                className="text-[9px] tracking-[0.25em] uppercase mb-3 font-semibold"
                style={{ fontFamily: "var(--pd-font-supporting)", color: copper }}
              >
                What Moves the Verdict
              </div>
              <div className="space-y-2">
                {SENS.map((s) => (
                  <SensRow key={s.label} {...s} />
                ))}
              </div>
            </div>

            {/* memo */}
            <div className="px-5 pt-4 pb-4 border-b border-white/10">
              <div
                className="text-[9px] tracking-[0.25em] uppercase mb-2 font-semibold"
                style={{ fontFamily: "var(--pd-font-supporting)", color: copper }}
              >
                Memo
              </div>
              <p
                className="text-[12.5px] leading-[1.6]"
                style={{ fontFamily: "var(--pd-font-serif)", color: "rgba(246,239,228,0.92)" }}
              >
                Property reads as a strong fit for BRRRR. ARV-to-rehab spread supports a 75% refi pulling
                most capital back. Comp depth and 90s-era plumbing are the two variables to firm before
                offering. The deal is live, not theoretical.
              </p>
            </div>

            {/* risks */}
            <div className="px-5 pt-4 pb-4 border-b border-white/10">
              <div
                className="text-[9px] tracking-[0.25em] uppercase mb-3 font-semibold"
                style={{ fontFamily: "var(--pd-font-supporting)", color: copper }}
              >
                Watch
              </div>
              <Risk text="Comp depth thin — 3 comps in 0.5mi, prefer 5." />
              <Risk text="1985 build, plumbing unknown — pad rehab 10%." />
              <Risk text="Refi rate assumed 7.25% — verify with lender." />
            </div>

            {/* actions */}
            <div className="px-5 pt-4 pb-4 space-y-2">
              <button
                className="w-full py-3 text-[11px] tracking-[0.22em] uppercase font-semibold"
                style={{ fontFamily: "var(--pd-font-supporting)", backgroundColor: copper, color: cream }}
              >
                Generate Strategy Snapshot
              </button>
              <button
                className="w-full py-3 text-[11px] tracking-[0.22em] uppercase font-semibold border"
                style={{
                  fontFamily: "var(--pd-font-supporting)",
                  borderColor: "rgba(246,239,228,0.3)",
                  color: cream,
                }}
              >
                Submit to Pegasus
              </button>
            </div>

            {/* disclosure */}
            <div
              className="px-5 py-3 text-[10px] leading-relaxed border-t border-white/10"
              style={{
                color: "rgba(246,239,228,0.55)",
                fontFamily: "var(--pd-font-sans)",
                backgroundColor: "rgba(0,0,0,0.18)",
              }}
            >
              Preliminary analysis. Human review required before any offer, strategy release, or
              execution decision.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ─── helpers ─── */

function Tool({ label }: { label: string }) {
  return (
    <button
      className="px-3 py-1.5 text-[10px] tracking-[0.18em] uppercase font-semibold rounded-sm border"
      style={{
        fontFamily: "var(--pd-font-supporting)",
        borderColor: "var(--pd-rule)",
        color: "var(--pd-muted)",
        backgroundColor: "rgba(255,255,255,0.5)",
      }}
    >
      {label}
    </button>
  );
}

function PathMap({ steps }: { steps: Step[] }) {
  const copper = "var(--pd-copper)";
  const rule = "var(--pd-rule)";
  const navy = "var(--pd-navy)";
  const muted = "var(--pd-muted)";
  const cream = "var(--pd-cream)";
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => {
        const isLast = i === steps.length - 1;
        const dot =
          s.status === "done" ? (
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: copper }} />
          ) : s.status === "active" ? (
            <div
              className="w-3.5 h-3.5 rotate-45"
              style={{ backgroundColor: copper, boxShadow: "0 0 0 4px rgba(199,122,58,0.15)" }}
            />
          ) : (
            <div
              className="w-2.5 h-2.5 rounded-full border"
              style={{ borderColor: rule, backgroundColor: cream }}
            />
          );
        return (
          <div key={s.key} className="flex-1 flex flex-col items-center">
            <div className="flex items-center w-full">
              <div
                className="flex-1 h-px"
                style={{
                  backgroundColor:
                    i === 0
                      ? "transparent"
                      : s.status === "pending" && steps[i - 1].status === "pending"
                      ? rule
                      : copper,
                  opacity: s.status === "pending" ? 0.4 : 1,
                }}
              />
              {dot}
              <div
                className="flex-1 h-px"
                style={{
                  backgroundColor: isLast ? "transparent" : s.status === "done" ? copper : rule,
                  opacity: s.status === "pending" ? 0.4 : 1,
                }}
              />
            </div>
            <div
              className="mt-2 text-[9px] tracking-[0.18em] uppercase font-semibold"
              style={{
                fontFamily: "var(--pd-font-supporting)",
                color: s.status === "active" ? navy : s.status === "done" ? copper : muted,
                opacity: s.status === "pending" ? 0.6 : 1,
              }}
            >
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Kicker({ num, label, active, locked }: { num: string; label: string; active?: boolean; locked?: boolean }) {
  const copper = "var(--pd-copper)";
  const muted = "var(--pd-muted)";
  return (
    <div className="flex items-center gap-3">
      <div
        className="text-[10px] tracking-[0.28em] uppercase font-semibold"
        style={{ fontFamily: "var(--pd-font-supporting)", color: active ? copper : muted }}
      >
        {num} · {label}
      </div>
      {active && <div className="w-12 h-px" style={{ backgroundColor: copper }} />}
      {locked && (
        <div
          className="text-[8px] tracking-[0.2em] uppercase"
          style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
        >
          locked
        </div>
      )}
    </div>
  );
}

function Fact({ k, v, compact = false }: { k: string; v: string; compact?: boolean }) {
  return (
    <div>
      <div
        className="text-[9px] tracking-[0.22em] uppercase font-semibold mb-0.5"
        style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
      >
        {k}
      </div>
      <div
        className={compact ? "text-[14px]" : "text-[15px]"}
        style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-navy)" }}
      >
        {v}
      </div>
    </div>
  );
}

function PulseStat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div
        className="text-[22px] leading-none tabular-nums"
        style={{ fontFamily: "var(--pd-font-serif)", fontWeight: 500, color: "var(--pd-navy)" }}
      >
        {n}
      </div>
      <div
        className="text-[9px] tracking-[0.2em] uppercase mt-1 leading-tight"
        style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
      >
        {l}
      </div>
    </div>
  );
}

function BigInput({
  label, prefix, value, onChange, hint,
}: { label: string; prefix?: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <div
          className="text-[10px] tracking-[0.22em] uppercase font-semibold"
          style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
        >
          {label}
        </div>
        {hint && (
          <div
            className="text-[11px]"
            style={{ color: "var(--pd-muted)", fontFamily: "var(--pd-font-serif)", fontStyle: "italic" }}
          >
            {hint}
          </div>
        )}
      </div>
      <div
        className="flex items-center border-b-2 pb-1"
        style={{ borderColor: "var(--pd-navy)" }}
      >
        {prefix && (
          <span
            className="text-[22px] mr-2"
            style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-muted)" }}
          >
            {prefix}
          </span>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent focus:outline-none text-[24px]"
          style={{ fontFamily: "var(--pd-font-serif)", fontWeight: 500, color: "var(--pd-navy)" }}
        />
      </div>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <button
      className="px-2.5 py-1 text-[11px] rounded-sm border"
      style={{
        fontFamily: "var(--pd-font-sans)",
        borderColor: "var(--pd-copper)",
        color: "var(--pd-copper)",
        backgroundColor: "rgba(255,255,255,0.5)",
      }}
    >
      {label}
    </button>
  );
}

function LaneBar({ name, sub, score, top }: { name: string; sub: string; score: number; top?: boolean }) {
  const copper = "var(--pd-copper)";
  const navy = "var(--pd-navy)";
  const muted = "var(--pd-muted)";
  const rule = "var(--pd-rule)";
  return (
    <div className="flex items-center gap-4">
      <div className="w-2.5 flex-shrink-0">
        {top && <div className="w-2 h-2 rotate-45" style={{ backgroundColor: copper }} />}
      </div>
      <div className="w-40 flex-shrink-0">
        <div
          className="text-[13px] leading-tight"
          style={{ fontFamily: "var(--pd-font-serif)", fontWeight: top ? 600 : 500, color: navy }}
        >
          {name}
        </div>
        <div
          className="text-[10px] tracking-wide leading-tight"
          style={{ fontFamily: "var(--pd-font-sans)", color: muted, fontStyle: "italic" }}
        >
          {sub}
        </div>
      </div>
      <div className="flex-1 h-1.5 rounded-sm overflow-hidden" style={{ backgroundColor: rule }}>
        <div
          className="h-full rounded-sm"
          style={{ width: `${score}%`, backgroundColor: top ? copper : "rgba(199,122,58,0.45)" }}
        />
      </div>
      <div
        className="w-10 text-right text-[12px] tabular-nums"
        style={{ fontFamily: "var(--pd-font-serif)", color: top ? copper : muted, fontWeight: top ? 600 : 500 }}
      >
        {score}%
      </div>
    </div>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone?: "soft" }) {
  return (
    <div
      className="text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-sm font-semibold"
      style={{
        fontFamily: "var(--pd-font-supporting)",
        backgroundColor: tone === "soft" ? "rgba(246,239,228,0.1)" : "rgba(199,122,58,0.2)",
        color: tone === "soft" ? "rgba(246,239,228,0.7)" : "var(--pd-copper)",
        border: tone === "soft" ? "1px solid rgba(246,239,228,0.15)" : "1px solid rgba(199,122,58,0.4)",
      }}
    >
      {children}
    </div>
  );
}

function Ring({ pct, size = 80 }: { pct: number; size?: number }) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(246,239,228,0.15)" strokeWidth="3"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="var(--pd-copper)" strokeWidth="3"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ color: "var(--pd-cream)" }}>
        <div
          className="leading-none"
          style={{
            fontFamily: "var(--pd-font-serif)",
            fontWeight: 500,
            fontSize: size > 90 ? 26 : 20,
          }}
        >
          {pct}%
        </div>
        <div
          className="text-[8px] tracking-[0.22em] uppercase mt-0.5"
          style={{ fontFamily: "var(--pd-font-supporting)", color: "rgba(246,239,228,0.55)" }}
        >
          confidence
        </div>
      </div>
    </div>
  );
}

function DarkLaneBar({ name, sub, score, top }: { name: string; sub: string; score: number; top?: boolean }) {
  const copper = "var(--pd-copper)";
  return (
    <div className="flex items-center gap-3 mb-2.5 last:mb-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <div
            className="text-[13px] truncate"
            style={{
              fontFamily: "var(--pd-font-serif)",
              fontWeight: top ? 600 : 500,
              color: top ? "var(--pd-cream)" : "rgba(246,239,228,0.85)",
            }}
          >
            {name}
            <span
              className="ml-1.5 text-[10px] italic"
              style={{ color: "rgba(246,239,228,0.5)", fontWeight: 400 }}
            >
              · {sub}
            </span>
          </div>
          <div
            className="text-[12px] tabular-nums"
            style={{
              fontFamily: "var(--pd-font-serif)",
              color: top ? copper : "rgba(246,239,228,0.7)",
              fontWeight: top ? 600 : 400,
            }}
          >
            {score}%
          </div>
        </div>
        <div className="h-1 mt-1.5 rounded-sm overflow-hidden" style={{ backgroundColor: "rgba(246,239,228,0.1)" }}>
          <div
            className="h-full rounded-sm"
            style={{ width: `${score}%`, backgroundColor: top ? copper : "rgba(199,122,58,0.5)" }}
          />
        </div>
      </div>
    </div>
  );
}

function Econ({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <>
      <div
        className="text-[10px] tracking-[0.18em] uppercase self-center"
        style={{ fontFamily: "var(--pd-font-supporting)", color: "rgba(246,239,228,0.55)" }}
      >
        {k}
      </div>
      <div
        className="text-right tabular-nums"
        style={{
          fontFamily: "var(--pd-font-serif)",
          fontSize: accent ? "15px" : "13.5px",
          fontWeight: accent ? 600 : 400,
          color: accent ? "var(--pd-copper)" : "var(--pd-cream)",
        }}
      >
        {v}
      </div>
    </>
  );
}

function SensRow({ label, delta, neg }: { label: string; delta: number; neg: boolean }) {
  const copper = "var(--pd-copper)";
  const color = neg ? "#d97a5a" : "#5fbf7f";
  const abs = Math.abs(delta);
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-24 text-[11px]"
        style={{ fontFamily: "var(--pd-font-sans)", color: "rgba(246,239,228,0.8)" }}
      >
        {label}
      </div>
      <div className="flex-1 h-1 rounded-sm overflow-hidden" style={{ backgroundColor: "rgba(246,239,228,0.08)" }}>
        <div className="h-full" style={{ width: `${Math.min(abs * 2, 100)}%`, backgroundColor: color }} />
      </div>
      <div
        className="w-14 text-right text-[11px] tabular-nums font-semibold"
        style={{ fontFamily: "var(--pd-font-serif)", color }}
      >
        {delta > 0 ? "+" : ""}{delta}%
      </div>
    </div>
  );
}

function Risk({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 mb-2 last:mb-0">
      <div
        className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
        style={{ backgroundColor: "var(--pd-copper)" }}
      />
      <div
        className="text-[12px] leading-snug"
        style={{ color: "rgba(246,239,228,0.85)", fontFamily: "var(--pd-font-sans)" }}
      >
        {text}
      </div>
    </div>
  );
}
