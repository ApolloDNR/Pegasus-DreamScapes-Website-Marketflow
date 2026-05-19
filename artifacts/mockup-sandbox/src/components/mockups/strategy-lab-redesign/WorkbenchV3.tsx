import { useState } from "react";
import "./_group.css";

/**
 * Workbench v3 — Living Document.
 * Same 3-pane DNA. Refinement intent: make the verdict feel ALIVE, not static.
 *
 *  - Verdict panel becomes a vertical timeline that BUILDS as you complete
 *    stages. Each completed stage drops a "finding" pill into the timeline
 *    with what it contributed to the score. The current stage shows a
 *    pulsing "live" indicator. Future stages are ghosted with what they'll
 *    add.
 *  - Confidence ring shows a confidence BAND not a single number — 65–78%
 *    range narrowing as you add inputs.
 *  - Center pane gains a "Stage Output" footer summarizing what this stage
 *    produced for the verdict, before the Next button.
 *  - Subject sheet gains a small inline lane-shortlist preview.
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

type Finding = {
  stage: string;
  status: "done" | "active" | "pending";
  headline: string;
  body?: string;
  contribution?: string;
};

const FINDINGS: Finding[] = [
  {
    stage: "Property",
    status: "done",
    headline: "SFR · 1,850 sqft · 1985",
    body: "Mid-size single-family, mature neighborhood.",
    contribution: "Eligible for 6 of 8 lanes.",
  },
  {
    stage: "Situation",
    status: "done",
    headline: "Off-market · moderate rehab",
    body: "Wholesaler-sourced; condition allows BRRRR or flip.",
    contribution: "Narrowed to 5 lanes. Wholesale ranked low.",
  },
  {
    stage: "Numbers",
    status: "active",
    headline: "BRRRR leads at 72%",
    body: "$498k all-in vs $610k ARV — refi pulls $458k back, leaving $40k in.",
    contribution: "Top lane locked in. Range 65–78%.",
  },
  {
    stage: "Comps",
    status: "pending",
    headline: "Will narrow confidence band",
    body: "5 comps within 0.5mi will tighten ARV ±$15k → ±$6k.",
  },
  {
    stage: "Risk",
    status: "pending",
    headline: "Will adjust rehab buffer",
    body: "1985 plumbing/electrical assumptions can push rehab ±15%.",
  },
  {
    stage: "Strategy",
    status: "pending",
    headline: "Will assign lane + structure",
    body: "Debt-only or JV equity split for the refi cash.",
  },
];

const LANES_SHORT = [
  { name: "BRRRR", score: 72, top: true },
  { name: "Flip", score: 64 },
  { name: "Hold", score: 51 },
];

export function WorkbenchV3() {
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
      {/* brand bar */}
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
        {/* LEFT */}
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

          {/* lane shortlist preview */}
          <div className="mt-8 pt-5 border-t" style={{ borderColor: rule }}>
            <div
              className="text-[9px] tracking-[0.25em] uppercase mb-3 font-semibold"
              style={{ fontFamily: "var(--pd-font-supporting)", color: navy }}
            >
              Lane Shortlist
            </div>
            <div className="space-y-2.5">
              {LANES_SHORT.map((l) => (
                <div key={l.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {l.top && (
                      <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: copper }} />
                    )}
                    {!l.top && <div className="w-1.5" />}
                    <div
                      className="text-[13px]"
                      style={{
                        fontFamily: "var(--pd-font-serif)",
                        fontWeight: l.top ? 600 : 500,
                        color: navy,
                      }}
                    >
                      {l.name}
                    </div>
                  </div>
                  <div
                    className="text-[11px] tabular-nums"
                    style={{
                      fontFamily: "var(--pd-font-serif)",
                      color: l.top ? copper : muted,
                      fontWeight: l.top ? 600 : 400,
                    }}
                  >
                    {l.score}%
                  </div>
                </div>
              ))}
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

          {/* NEW: Stage Output summary */}
          <div
            className="mt-6 p-5 rounded-sm border-l-4"
            style={{ borderColor: navy, backgroundColor: "rgba(13,27,45,0.04)" }}
          >
            <div
              className="text-[9px] tracking-[0.25em] uppercase font-semibold mb-2"
              style={{ fontFamily: "var(--pd-font-supporting)", color: navy }}
            >
              What This Stage Just Told Us
            </div>
            <div className="space-y-1.5">
              <OutputLine k="All-in basis" v="$498,000" />
              <OutputLine k="Spread to ARV" v="$112,000 (18.4%)" />
              <OutputLine k="BRRRR feasible?" v="Yes — 75% refi pulls $458k back" />
              <OutputLine k="Top lane updated" v="BRRRR · 72% confidence" highlight />
            </div>
          </div>

          {/* Step nav */}
          <div className="flex items-center justify-between mt-7 pt-5 border-t" style={{ borderColor: rule }}>
            <button
              className="text-[10px] tracking-[0.2em] uppercase font-semibold"
              style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
            >
              ← Back: Situation
            </button>
            <button
              className="px-6 py-2.5 text-[11px] tracking-[0.2em] uppercase font-semibold flex items-center gap-2"
              style={{ fontFamily: "var(--pd-font-supporting)", backgroundColor: navy, color: cream }}
            >
              Next: Comps →
            </button>
          </div>

          {/* preview ribbon */}
          <div
            className="mt-5 px-4 py-3 rounded-sm flex items-center justify-between gap-4"
            style={{ backgroundColor: "rgba(255,255,255,0.5)", border: `1px solid ${rule}` }}
          >
            <div className="flex items-center gap-4 flex-wrap">
              <div
                className="text-[9px] tracking-[0.25em] uppercase font-semibold"
                style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
              >
                Up Next
              </div>
              {["Comps", "Risk", "Strategy", "Exit", "Next Step"].map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div
                    className="text-[11px]"
                    style={{
                      fontFamily: "var(--pd-font-serif)",
                      color: i === 0 ? navy : muted,
                      fontWeight: i === 0 ? 600 : 400,
                    }}
                  >
                    {s}
                  </div>
                  {i < 4 && <div className="text-[10px]" style={{ color: muted }}>→</div>}
                </div>
              ))}
            </div>
            <div
              className="text-[10px] tracking-[0.15em] uppercase"
              style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
            >
              ~4 min remaining
            </div>
          </div>
        </section>

        {/* RIGHT — Living verdict timeline */}
        <aside className="pl-2">
          <div className="rounded-sm overflow-hidden" style={{ backgroundColor: navy, color: cream }}>
            {/* live header */}
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
                  Verdict · Live · Building
                </div>
              </div>
              <div
                className="text-[9px] tracking-[0.2em] uppercase"
                style={{ fontFamily: "var(--pd-font-supporting)", color: "rgba(246,239,228,0.5)" }}
              >
                3 / 8
              </div>
            </div>

            {/* hero verdict */}
            <div className="px-5 pt-6 pb-5 border-b border-white/10">
              <div className="flex items-center gap-5 mb-4">
                <BandRing low={65} high={78} />
                <div className="flex-1">
                  <div
                    className="text-[9px] tracking-[0.25em] uppercase mb-1.5"
                    style={{ fontFamily: "var(--pd-font-supporting)", color: "rgba(246,239,228,0.55)" }}
                  >
                    Top Lane
                  </div>
                  <div
                    className="text-[26px] leading-tight"
                    style={{ fontFamily: "var(--pd-font-serif)", fontWeight: 500 }}
                  >
                    BRRRR
                  </div>
                  <div
                    className="text-[13px] italic mt-0.5"
                    style={{ fontFamily: "var(--pd-font-serif)", color: "rgba(246,239,228,0.7)" }}
                  >
                    Refi-and-hold
                  </div>
                </div>
              </div>
              <div
                className="text-[11px] leading-relaxed pt-3 border-t border-white/10"
                style={{ color: "rgba(246,239,228,0.7)" }}
              >
                Confidence range narrows from{" "}
                <span style={{ color: copper, fontWeight: 600 }}>13 points</span> to{" "}
                <span style={{ color: copper, fontWeight: 600 }}>~6 points</span> after you add comps.
              </div>
            </div>

            {/* TIMELINE — the living document */}
            <div className="px-5 pt-5 pb-3">
              <div
                className="text-[9px] tracking-[0.25em] uppercase mb-4 font-semibold"
                style={{ fontFamily: "var(--pd-font-supporting)", color: copper }}
              >
                What We've Learned · So Far
              </div>
              <div className="relative">
                {/* spine */}
                <div
                  className="absolute left-[5px] top-1.5 bottom-0 w-px"
                  style={{ backgroundColor: "rgba(246,239,228,0.15)" }}
                />
                {FINDINGS.map((f, i) => (
                  <FindingRow key={f.stage} {...f} last={i === FINDINGS.length - 1} />
                ))}
              </div>
            </div>

            {/* actions */}
            <div className="px-5 pt-3 pb-4 border-t border-white/10 space-y-2">
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
      <div className="flex items-center border-b-2 pb-1" style={{ borderColor: "var(--pd-navy)" }}>
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

function OutputLine({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <div
        className="text-[11px]"
        style={{ fontFamily: "var(--pd-font-sans)", color: "var(--pd-muted)" }}
      >
        {k}
      </div>
      <div
        className="text-[13px] tabular-nums"
        style={{
          fontFamily: "var(--pd-font-serif)",
          color: highlight ? "var(--pd-copper)" : "var(--pd-navy)",
          fontWeight: highlight ? 600 : 500,
        }}
      >
        {v}
      </div>
    </div>
  );
}

function BandRing({ low, high }: { low: number; high: number }) {
  const size = 104;
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const lowOffset = c * (1 - low / 100);
  const highOffset = c * (1 - high / 100);
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(246,239,228,0.12)" strokeWidth="4"
        />
        {/* high band (lighter) */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(199,122,58,0.4)" strokeWidth="4"
          strokeDasharray={c} strokeDashoffset={highOffset} strokeLinecap="round"
        />
        {/* low band (solid) */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="var(--pd-copper)" strokeWidth="4"
          strokeDasharray={c} strokeDashoffset={lowOffset} strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ color: "var(--pd-cream)" }}>
        <div
          className="text-[20px] leading-none tabular-nums"
          style={{ fontFamily: "var(--pd-font-serif)", fontWeight: 500 }}
        >
          {low}–{high}%
        </div>
        <div
          className="text-[8px] tracking-[0.22em] uppercase mt-1"
          style={{ fontFamily: "var(--pd-font-supporting)", color: "rgba(246,239,228,0.55)" }}
        >
          confidence band
        </div>
      </div>
    </div>
  );
}

function FindingRow({
  stage, status, headline, body, contribution, last,
}: Finding & { last?: boolean }) {
  const copper = "var(--pd-copper)";
  const cream = "var(--pd-cream)";
  const isDone = status === "done";
  const isActive = status === "active";

  const dot =
    status === "done" ? (
      <div
        className="w-2.5 h-2.5 rounded-full border-2"
        style={{ backgroundColor: copper, borderColor: "var(--pd-navy)" }}
      />
    ) : status === "active" ? (
      <div className="relative">
        <div
          className="w-3 h-3 rotate-45"
          style={{ backgroundColor: copper, boxShadow: "0 0 0 3px rgba(199,122,58,0.25)" }}
        />
      </div>
    ) : (
      <div
        className="w-2.5 h-2.5 rounded-full border-2"
        style={{ backgroundColor: "var(--pd-navy)", borderColor: "rgba(246,239,228,0.25)" }}
      />
    );

  return (
    <div className={`relative pl-7 ${last ? "" : "pb-4"}`}>
      <div className="absolute left-0 top-0.5 z-10">{dot}</div>
      <div
        className="text-[9px] tracking-[0.25em] uppercase font-semibold mb-1"
        style={{
          fontFamily: "var(--pd-font-supporting)",
          color: isDone || isActive ? copper : "rgba(246,239,228,0.4)",
        }}
      >
        {stage}
        {isActive && (
          <span className="ml-2 italic" style={{ color: "rgba(246,239,228,0.6)", letterSpacing: "0" }}>
            updating…
          </span>
        )}
      </div>
      <div
        className="text-[13px] leading-snug mb-0.5"
        style={{
          fontFamily: "var(--pd-font-serif)",
          fontWeight: isActive ? 600 : 500,
          color: isDone || isActive ? cream : "rgba(246,239,228,0.5)",
        }}
      >
        {headline}
      </div>
      {body && (
        <div
          className="text-[11.5px] leading-snug"
          style={{
            fontFamily: "var(--pd-font-sans)",
            color: isDone || isActive ? "rgba(246,239,228,0.7)" : "rgba(246,239,228,0.4)",
          }}
        >
          {body}
        </div>
      )}
      {contribution && (
        <div
          className="text-[10px] tracking-[0.15em] uppercase mt-1.5 italic"
          style={{
            fontFamily: "var(--pd-font-supporting)",
            color: isActive ? copper : "rgba(199,122,58,0.7)",
            fontWeight: 600,
          }}
        >
          → {contribution}
        </div>
      )}
    </div>
  );
}
