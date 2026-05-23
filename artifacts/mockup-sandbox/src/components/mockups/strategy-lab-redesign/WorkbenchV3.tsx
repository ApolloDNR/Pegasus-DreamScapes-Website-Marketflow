import { useState } from "react";
import "./_group.css";

/**
 * Workbench v3 — Living Document.
 * Polish pass: equalized rhythm, unified accent system, depth + premium
 * surfacing on the verdict card, refined micro-interactions.
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
      {/* premium hairline stripe at the very top */}
      <div
        style={{
          height: 3,
          background:
            "linear-gradient(90deg, var(--pd-copper) 0%, #D4B483 28%, var(--pd-navy) 55%, #D4B483 78%, var(--pd-copper) 100%)",
        }}
      />

      {/* brand bar */}
      <div
        className="flex items-center justify-between px-10 h-12 border-b"
        style={{
          borderColor: rule,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.35) 100%)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div className="flex items-center gap-3">
          <BrandMark />
          <div
            className="text-[11px] tracking-[0.24em] uppercase"
            style={{ fontFamily: "var(--pd-font-display)", color: navy, fontWeight: 600 }}
          >
            Pegasus DreamScapes
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
            className="text-[10px] tracking-[0.2em] uppercase"
            style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
          >
            Strategy Lab
          </div>
          <button
            className="group text-[10px] tracking-[0.2em] uppercase font-semibold flex items-center gap-1.5 transition-colors"
            style={{ fontFamily: "var(--pd-font-supporting)", color: copper }}
          >
            <span className="border-b pb-0.5" style={{ borderColor: copper }}>
              Start a Strategy Review
            </span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        </div>
      </div>

      {/* workspace header */}
      <div className="px-10 pt-6 pb-5 border-b" style={{ borderColor: rule }}>
        <div className="flex items-end justify-between gap-8">
          <div className="flex-1 min-w-0">
            <div
              className="text-[10px] tracking-[0.3em] uppercase mb-2 flex items-center gap-2.5"
              style={{ fontFamily: "var(--pd-font-supporting)", color: copper, fontWeight: 600 }}
            >
              <span className="w-6 h-px" style={{ backgroundColor: copper }} />
              Active Subject
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1
                className="text-[34px] leading-none"
                style={{
                  fontFamily: "var(--pd-font-serif)",
                  fontWeight: 500,
                  letterSpacing: "-0.015em",
                }}
              >
                1247 Aberdeen Way
              </h1>
              <span
                className="text-[13px]"
                style={{ color: muted, fontFamily: "var(--pd-font-supporting)" }}
              >
                ·
              </span>
              <div
                className="text-sm"
                style={{ color: muted, fontFamily: "var(--pd-font-serif)", fontStyle: "italic" }}
              >
                Concord, CA 94521
              </div>
              <div
                className="text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-sm ml-1"
                style={{
                  backgroundColor: "rgba(199,122,58,0.1)",
                  color: copper,
                  fontFamily: "var(--pd-font-supporting)",
                  fontWeight: 600,
                  border: "1px solid rgba(199,122,58,0.25)",
                }}
              >
                Off-market · Wholesaler
              </div>
            </div>
            <div
              className="text-[12px] mt-2.5 italic"
              style={{ fontFamily: "var(--pd-font-serif)", color: copper }}
            >
              One address in. Every angle out.
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className="flex items-center rounded-sm border p-0.5"
              style={{
                borderColor: rule,
                backgroundColor: "rgba(255,255,255,0.7)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              {(["quick", "full"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase font-semibold rounded-[2px] transition-all"
                  style={{
                    fontFamily: "var(--pd-font-supporting)",
                    backgroundColor: mode === m ? navy : "transparent",
                    color: mode === m ? cream : muted,
                    boxShadow: mode === m ? "0 1px 2px rgba(13,27,45,0.25)" : "none",
                  }}
                >
                  {m === "quick" ? "Quick Read" : "Full Path"}
                </button>
              ))}
            </div>
            <div className="w-px h-7 mx-1" style={{ backgroundColor: rule }} />
            <Tool label="Reset" />
            <Tool label="Save" />
            <Tool label="Share" />
          </div>
        </div>

        {/* path map */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div
              className="text-[9px] tracking-[0.3em] uppercase flex items-center gap-2"
              style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
            >
              <span style={{ color: copper, fontWeight: 600 }}>Stage 3</span>
              <span style={{ opacity: 0.5 }}>/ 8</span>
              <span className="mx-1.5" style={{ opacity: 0.4 }}>·</span>
              Path · Quick Read
            </div>
            <div
              className="text-[9px] tracking-[0.22em] uppercase flex items-center gap-1.5"
              style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
            >
              <span
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: "#5fbf7f", boxShadow: "0 0 4px #5fbf7f" }}
              />
              Auto-saved · 2 min ago
            </div>
          </div>
          <PathMap steps={STEPS} />
        </div>
      </div>

      {/* 3 panes — equalized rhythm: each rail breathes the same */}
      <div className="flex-1 grid grid-cols-[280px_1fr_400px] gap-0 px-10 py-8">
        {/* LEFT */}
        <aside className="pr-8 border-r" style={{ borderColor: rule }}>
          <Kicker num="§ 1–2" label="Subject" locked />
          <div className="mt-5 space-y-4">
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
            className="group mt-6 text-[10px] tracking-[0.22em] uppercase font-semibold flex items-center gap-1.5 transition-colors"
            style={{ fontFamily: "var(--pd-font-supporting)", color: copper }}
          >
            <span className="border-b pb-0.5" style={{ borderColor: copper }}>
              Edit subject
            </span>
            <span className="opacity-60 transition-transform group-hover:translate-x-0.5">→</span>
          </button>

          {/* lane shortlist preview */}
          <div className="mt-8 pt-5 border-t" style={{ borderColor: rule }}>
            <div
              className="text-[9px] tracking-[0.28em] uppercase mb-3 font-semibold flex items-center justify-between"
              style={{ fontFamily: "var(--pd-font-supporting)", color: navy }}
            >
              <span>Lane Shortlist</span>
              <span
                className="text-[8px] tracking-[0.18em]"
                style={{ color: muted, fontWeight: 500 }}
              >
                live
              </span>
            </div>
            <div className="space-y-2.5">
              {LANES_SHORT.map((l) => (
                <div
                  key={l.name}
                  className="flex items-center justify-between py-1 px-2 -mx-2 rounded-sm transition-colors"
                  style={{
                    backgroundColor: l.top ? "rgba(199,122,58,0.07)" : "transparent",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex items-center justify-center flex-shrink-0"
                      style={{ width: 12, height: 12 }}
                    >
                      {l.top ? (
                        <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
                          <path
                            d="M6 1 L7.4 4.4 L11 4.7 L8.3 7 L9.1 10.5 L6 8.7 L2.9 10.5 L3.7 7 L1 4.7 L4.6 4.4 Z"
                            fill={copper}
                          />
                        </svg>
                      ) : (
                        <span
                          className="block rounded-full"
                          style={{ width: 3, height: 3, backgroundColor: muted, opacity: 0.5 }}
                        />
                      )}
                    </span>
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
                  <div className="flex items-center gap-2">
                    <div
                      className="h-1 rounded-full overflow-hidden"
                      style={{ width: 32, backgroundColor: "rgba(107,98,86,0.18)" }}
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${l.score}%`,
                          backgroundColor: l.top ? copper : "rgba(107,98,86,0.5)",
                        }}
                      />
                    </div>
                    <div
                      className="text-[11px] tabular-nums"
                      style={{
                        fontFamily: "var(--pd-font-serif)",
                        color: l.top ? copper : muted,
                        fontWeight: l.top ? 600 : 500,
                        width: 26,
                        textAlign: "right",
                      }}
                    >
                      {l.score}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="mt-8 pt-5 border-t text-[11px] leading-relaxed italic"
            style={{
              borderColor: rule,
              color: muted,
              fontFamily: "var(--pd-font-serif)",
            }}
          >
            <div
              className="text-[9px] tracking-[0.28em] uppercase mb-2 font-semibold not-italic"
              style={{ fontFamily: "var(--pd-font-supporting)", color: navy }}
            >
              Doctrine
            </div>
            “Every property gets a serious review. Not every property gets an offer.”
          </div>
        </aside>

        {/* CENTER */}
        <section className="px-8">
          <Kicker num="§ 3" label="Numbers" active />
          <h2
            className="text-[28px] mt-3 mb-2 leading-tight"
            style={{
              fontFamily: "var(--pd-font-serif)",
              fontWeight: 500,
              letterSpacing: "-0.018em",
            }}
          >
            What does this property cost to do?
          </h2>
          <p
            className="text-[13px] leading-relaxed max-w-md mb-7"
            style={{ color: muted, fontFamily: "var(--pd-font-serif)" }}
          >
            Three numbers drive every lane. Enter your best estimate. The verdict on the right will
            move as you type. Try changing one to see what flips.
          </p>

          <div className="space-y-5">
            <BigInput
              label="Asking Price"
              prefix="$"
              value={asking}
              onChange={setAsking}
              hint="What it would take to put under contract."
            />
            <BigInput
              label="Estimated Rehab"
              prefix="$"
              value={rehab}
              onChange={setRehab}
              hint="Scope-of-work estimate. Pessimistic beats optimistic."
            />
            <BigInput
              label="Target ARV"
              prefix="$"
              value={arv}
              onChange={setArv}
              hint="After-repair value, supported by your comps."
            />
          </div>

          {/* unified accent: 2px copper rail on hint, 2px navy rail on output */}
          <AccentCard tone="copper" eyebrow="Think out loud">
            <div className="text-[13px] flex items-center gap-2 flex-wrap" style={{ color: navy }}>
              <span>Try:</span>
              <Chip label="↓ offer −$15k" />
              <Chip label="↑ rehab +$10k" />
              <Chip label="↓ ARV −$25k" />
              <span
                className="text-[11px] italic"
                style={{ color: muted, fontFamily: "var(--pd-font-serif)" }}
              >
                · verdict re-scores live
              </span>
            </div>
          </AccentCard>

          <AccentCard tone="navy" eyebrow="What this stage just told us">
            <div className="space-y-2">
              <OutputLine k="All-in basis" v="$498,000" />
              <OutputLine k="Spread to ARV" v="$112,000 (18.4%)" />
              <OutputLine k="BRRRR feasible?" v="Yes — 75% refi pulls $458k back" />
              <div className="pt-2 mt-2 border-t" style={{ borderColor: "rgba(13,27,45,0.08)" }}>
                <OutputLine k="Top lane updated" v="BRRRR · 72% confidence" highlight />
              </div>
            </div>
          </AccentCard>

          {/* Step nav */}
          <div
            className="flex items-center justify-between mt-8 pt-5 border-t"
            style={{ borderColor: rule }}
          >
            <button
              className="group text-[10px] tracking-[0.22em] uppercase font-semibold flex items-center gap-1.5 transition-colors"
              style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
            >
              <span className="transition-transform group-hover:-translate-x-0.5">←</span>
              Back: Situation
            </button>
            <button
              className="group px-7 py-3 text-[11px] tracking-[0.22em] uppercase font-semibold flex items-center gap-2 rounded-sm transition-all"
              style={{
                fontFamily: "var(--pd-font-supporting)",
                backgroundColor: navy,
                color: cream,
                boxShadow: "0 2px 8px rgba(13,27,45,0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              Next: Comps
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </button>
          </div>

          {/* preview ribbon */}
          <div
            className="mt-5 px-5 py-3 rounded-sm flex items-center justify-between gap-4"
            style={{
              backgroundColor: "rgba(255,255,255,0.55)",
              border: `1px solid ${rule}`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <div
                className="text-[9px] tracking-[0.28em] uppercase font-semibold pr-2 mr-1 border-r"
                style={{
                  fontFamily: "var(--pd-font-supporting)",
                  color: muted,
                  borderColor: rule,
                }}
              >
                Up Next
              </div>
              {["Comps", "Risk", "Strategy", "Exit", "Next Step"].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className="text-[11px]"
                    style={{
                      fontFamily: "var(--pd-font-serif)",
                      color: i === 0 ? navy : muted,
                      fontWeight: i === 0 ? 600 : 400,
                      fontStyle: i === 0 ? "normal" : "italic",
                    }}
                  >
                    {s}
                  </div>
                  {i < 4 && (
                    <span
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: rule }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div
              className="text-[10px] tracking-[0.18em] uppercase whitespace-nowrap"
              style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
            >
              ~4 min remaining
            </div>
          </div>
        </section>

        {/* RIGHT — Living verdict timeline */}
        <aside className="pl-8">
          <div
            className="rounded-sm overflow-hidden relative"
            style={{
              background:
                "linear-gradient(180deg, #102035 0%, #0D1B2D 35%, #0A1626 100%)",
              color: cream,
              boxShadow:
                "0 10px 30px -10px rgba(13,27,45,0.45), 0 2px 6px rgba(13,27,45,0.15)",
              border: "1px solid rgba(13,27,45,0.4)",
            }}
          >
            {/* gold inner edge */}
            <div
              className="absolute inset-0 pointer-events-none rounded-sm"
              style={{
                boxShadow: "inset 0 1px 0 rgba(212,180,131,0.18)",
              }}
            />

            {/* live header */}
            <div
              className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10 relative"
              style={{
                background:
                  "linear-gradient(180deg, rgba(199,122,58,0.06) 0%, transparent 100%)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span
                    className="absolute inline-flex h-full w-full rounded-full opacity-60"
                    style={{
                      backgroundColor: "#5fbf7f",
                      animation: "pdPulse 2s ease-out infinite",
                    }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-1.5 w-1.5"
                    style={{ backgroundColor: "#5fbf7f", boxShadow: "0 0 8px #5fbf7f" }}
                  />
                </span>
                <div
                  className="text-[9px] tracking-[0.3em] uppercase font-semibold"
                  style={{
                    fontFamily: "var(--pd-font-supporting)",
                    color: "rgba(246,239,228,0.75)",
                  }}
                >
                  Verdict · Live · Building
                </div>
              </div>
              <div
                className="text-[9px] tracking-[0.22em] uppercase tabular-nums"
                style={{
                  fontFamily: "var(--pd-font-supporting)",
                  color: "rgba(246,239,228,0.55)",
                }}
              >
                <span style={{ color: copper, fontWeight: 600 }}>3</span>
                <span className="opacity-50"> / 8</span>
              </div>
            </div>

            {/* hero verdict */}
            <div className="px-5 pt-6 pb-5 border-b border-white/10 relative">
              <div className="flex items-center gap-5 mb-4">
                <BandRing low={65} high={78} />
                <div className="flex-1">
                  <div
                    className="text-[9px] tracking-[0.28em] uppercase mb-1.5"
                    style={{
                      fontFamily: "var(--pd-font-supporting)",
                      color: "rgba(246,239,228,0.55)",
                    }}
                  >
                    Top Lane
                  </div>
                  <div
                    className="text-[28px] leading-none"
                    style={{
                      fontFamily: "var(--pd-font-serif)",
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    BRRRR
                  </div>
                  <div
                    className="text-[13px] italic mt-1"
                    style={{
                      fontFamily: "var(--pd-font-serif)",
                      color: "rgba(246,239,228,0.65)",
                    }}
                  >
                    Refi-and-hold
                  </div>
                </div>
              </div>
              <div
                className="text-[11px] leading-relaxed pt-3 border-t border-white/10"
                style={{ color: "rgba(246,239,228,0.72)" }}
              >
                Confidence range narrows from{" "}
                <span style={{ color: copper, fontWeight: 600 }}>13 points</span> to{" "}
                <span style={{ color: copper, fontWeight: 600 }}>~6 points</span> after you add
                comps.
              </div>
            </div>

            {/* TIMELINE — the living document */}
            <div className="px-5 pt-5 pb-3">
              <div
                className="text-[9px] tracking-[0.28em] uppercase mb-4 font-semibold flex items-center gap-2.5"
                style={{ fontFamily: "var(--pd-font-supporting)", color: copper }}
              >
                <span className="w-3 h-px" style={{ backgroundColor: copper }} />
                What we've learned · so far
              </div>
              <div className="relative">
                {/* spine — gradient: solid copper through done, fading through pending */}
                <div
                  className="absolute left-[5px] top-2 bottom-2 w-px"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(199,122,58,0.6) 0%, rgba(199,122,58,0.6) 35%, rgba(246,239,228,0.18) 45%, rgba(246,239,228,0.08) 100%)",
                  }}
                />
                {FINDINGS.map((f, i) => (
                  <FindingRow key={f.stage} {...f} last={i === FINDINGS.length - 1} />
                ))}
              </div>
            </div>

            {/* actions */}
            <div className="px-5 pt-3 pb-4 border-t border-white/10 space-y-2">
              <button
                className="group w-full py-3 text-[11px] tracking-[0.24em] uppercase font-semibold rounded-sm transition-all relative overflow-hidden"
                style={{
                  fontFamily: "var(--pd-font-supporting)",
                  background:
                    "linear-gradient(180deg, #D08A4A 0%, #C77A3A 50%, #B86D31 100%)",
                  color: cream,
                  boxShadow:
                    "0 2px 8px rgba(199,122,58,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                }}
              >
                Generate Strategy Snapshot
              </button>
              <button
                className="w-full py-3 text-[11px] tracking-[0.24em] uppercase font-semibold border rounded-sm transition-colors"
                style={{
                  fontFamily: "var(--pd-font-supporting)",
                  borderColor: "rgba(246,239,228,0.28)",
                  color: cream,
                  backgroundColor: "rgba(246,239,228,0.03)",
                }}
              >
                Submit to Pegasus
              </button>
            </div>

            {/* disclosure */}
            <div
              className="px-5 py-3 text-[10px] leading-relaxed border-t border-white/10 flex items-start gap-2"
              style={{
                color: "rgba(246,239,228,0.55)",
                fontFamily: "var(--pd-font-sans)",
                backgroundColor: "rgba(0,0,0,0.22)",
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 16 16"
                fill="none"
                className="mt-0.5 flex-shrink-0"
                aria-hidden="true"
                style={{ opacity: 0.8 }}
              >
                <circle
                  cx="8"
                  cy="8"
                  r="6.5"
                  stroke={copper}
                  strokeWidth="1.2"
                  fill="none"
                />
                <path d="M8 4.5 L8 8.5" stroke={copper} strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="8" cy="11" r="0.8" fill={copper} />
              </svg>
              <span>
                Preliminary analysis. Human review required before any offer, strategy release, or
                execution decision.
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* keyframes for pulse */}
      <style>{`
        @keyframes pdPulse {
          0% { transform: scale(1); opacity: 0.6; }
          70% { transform: scale(2.6); opacity: 0; }
          100% { transform: scale(2.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ─── helpers ─── */

function BrandMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2 L22 12 L12 22 L2 12 Z"
        stroke="var(--pd-copper)"
        strokeWidth="1.5"
        fill="rgba(199,122,58,0.08)"
      />
      <circle cx="12" cy="12" r="2.5" fill="var(--pd-copper)" />
    </svg>
  );
}

function Tool({ label }: { label: string }) {
  return (
    <button
      className="px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase font-semibold rounded-sm border transition-colors"
      style={{
        fontFamily: "var(--pd-font-supporting)",
        borderColor: "var(--pd-rule)",
        color: "var(--pd-muted)",
        backgroundColor: "rgba(255,255,255,0.6)",
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
    <div className="flex items-start gap-0">
      {steps.map((s, i) => {
        const isLast = i === steps.length - 1;
        const isActive = s.status === "active";
        const isDone = s.status === "done";
        const dot = isDone ? (
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor: copper,
              boxShadow: "0 0 0 2px var(--pd-cream), 0 0 0 3px rgba(199,122,58,0.25)",
            }}
          />
        ) : isActive ? (
          <div className="relative flex-shrink-0">
            <div
              className="w-3.5 h-3.5 rounded-full"
              style={{
                backgroundColor: copper,
                boxShadow:
                  "0 0 0 3px var(--pd-cream), 0 0 0 5px rgba(199,122,58,0.25), 0 0 12px rgba(199,122,58,0.5)",
              }}
            />
          </div>
        ) : (
          <div
            className="w-2.5 h-2.5 rounded-full border flex-shrink-0"
            style={{ borderColor: rule, backgroundColor: cream }}
          />
        );
        const leftLineColor =
          i === 0
            ? "transparent"
            : s.status === "pending" && steps[i - 1].status === "pending"
            ? rule
            : copper;
        const rightLineColor = isLast ? "transparent" : isDone ? copper : rule;
        return (
          <div key={s.key} className="flex-1 flex flex-col items-center">
            <div className="flex items-center w-full" style={{ height: 14 }}>
              <div
                className="flex-1 h-px"
                style={{
                  backgroundColor: leftLineColor,
                  opacity: s.status === "pending" ? 0.5 : 1,
                }}
              />
              {dot}
              <div
                className="flex-1 h-px"
                style={{
                  backgroundColor: rightLineColor,
                  opacity: s.status === "pending" ? 0.5 : 1,
                }}
              />
            </div>
            <div
              className="mt-2.5 text-[9px] tracking-[0.2em] uppercase font-semibold text-center"
              style={{
                fontFamily: "var(--pd-font-supporting)",
                color: isActive ? navy : isDone ? copper : muted,
                opacity: s.status === "pending" ? 0.55 : 1,
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

function Kicker({
  num,
  label,
  active,
  locked,
}: {
  num: string;
  label: string;
  active?: boolean;
  locked?: boolean;
}) {
  const copper = "var(--pd-copper)";
  const muted = "var(--pd-muted)";
  return (
    <div className="flex items-center gap-3">
      <div
        className="text-[10px] tracking-[0.3em] uppercase font-semibold"
        style={{ fontFamily: "var(--pd-font-supporting)", color: active ? copper : muted }}
      >
        {num} · {label}
      </div>
      {active && <div className="w-12 h-px" style={{ backgroundColor: copper }} />}
      {locked && (
        <div
          className="text-[8px] tracking-[0.22em] uppercase px-1.5 py-0.5 rounded-sm"
          style={{
            fontFamily: "var(--pd-font-supporting)",
            color: muted,
            backgroundColor: "rgba(107,98,86,0.08)",
            border: "1px solid rgba(107,98,86,0.18)",
          }}
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
        className="text-[9px] tracking-[0.24em] uppercase font-semibold mb-1"
        style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-muted)" }}
      >
        {k}
      </div>
      <div
        className={compact ? "text-[14px] leading-none" : "text-[15px] leading-none"}
        style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-navy)", fontWeight: 500 }}
      >
        {v}
      </div>
    </div>
  );
}

function BigInput({
  label,
  prefix,
  value,
  onChange,
  hint,
}: {
  label: string;
  prefix?: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5 gap-3">
        <div
          className="text-[10px] tracking-[0.24em] uppercase font-semibold"
          style={{ fontFamily: "var(--pd-font-supporting)", color: "var(--pd-navy)" }}
        >
          {label}
        </div>
        {hint && (
          <div
            className="text-[11px] truncate"
            style={{
              color: "var(--pd-muted)",
              fontFamily: "var(--pd-font-serif)",
              fontStyle: "italic",
            }}
          >
            {hint}
          </div>
        )}
      </div>
      <div
        className="flex items-center border-b-2 pb-1 transition-colors"
        style={{ borderColor: "var(--pd-navy)" }}
      >
        {prefix && (
          <span
            className="text-[22px] mr-2 leading-none"
            style={{ fontFamily: "var(--pd-font-serif)", color: "var(--pd-muted)" }}
          >
            {prefix}
          </span>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent focus:outline-none text-[24px] tabular-nums"
          style={{
            fontFamily: "var(--pd-font-serif)",
            fontWeight: 500,
            color: "var(--pd-navy)",
            letterSpacing: "-0.005em",
          }}
        />
      </div>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <button
      className="px-2.5 py-1 text-[11px] rounded-sm border transition-colors"
      style={{
        fontFamily: "var(--pd-font-sans)",
        borderColor: "rgba(199,122,58,0.5)",
        color: "var(--pd-copper)",
        backgroundColor: "rgba(255,255,255,0.6)",
      }}
    >
      {label}
    </button>
  );
}

/** Unified accent card — single visual pattern, just tone swap. */
function AccentCard({
  tone,
  eyebrow,
  children,
}: {
  tone: "copper" | "navy";
  eyebrow: string;
  children: React.ReactNode;
}) {
  const isCopper = tone === "copper";
  const color = isCopper ? "var(--pd-copper)" : "var(--pd-navy)";
  const bg = isCopper ? "rgba(199,122,58,0.05)" : "rgba(13,27,45,0.04)";
  return (
    <div
      className="mt-6 px-5 py-4 rounded-sm relative"
      style={{
        backgroundColor: bg,
        borderLeft: `2px solid ${color}`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
      }}
    >
      <div
        className="text-[9px] tracking-[0.28em] uppercase font-semibold mb-2.5"
        style={{ fontFamily: "var(--pd-font-supporting)", color }}
      >
        {eyebrow}
      </div>
      {children}
    </div>
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
  const size = 108;
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const lowOffset = c * (1 - low / 100);
  const highOffset = c * (1 - high / 100);
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* outer tick marks at 0/25/50/75 */}
        {[0, 0.25, 0.5, 0.75].map((t) => {
          const angle = t * 2 * Math.PI;
          const x1 = size / 2 + (r + 4) * Math.cos(angle);
          const y1 = size / 2 + (r + 4) * Math.sin(angle);
          const x2 = size / 2 + (r + 7) * Math.cos(angle);
          const y2 = size / 2 + (r + 7) * Math.sin(angle);
          return (
            <line
              key={t}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(246,239,228,0.25)"
              strokeWidth="1"
            />
          );
        })}
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(246,239,228,0.1)"
          strokeWidth="5"
        />
        {/* high band (lighter copper) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(199,122,58,0.35)"
          strokeWidth="5"
          strokeDasharray={c}
          strokeDashoffset={highOffset}
          strokeLinecap="round"
        />
        {/* low band (solid copper) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--pd-copper)"
          strokeWidth="5"
          strokeDasharray={c}
          strokeDashoffset={lowOffset}
          strokeLinecap="round"
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ color: "var(--pd-cream)" }}
      >
        <div
          className="text-[19px] leading-none tabular-nums"
          style={{ fontFamily: "var(--pd-font-serif)", fontWeight: 500, letterSpacing: "-0.01em" }}
        >
          {low}–{high}
          <span className="text-[12px]" style={{ color: "rgba(246,239,228,0.55)" }}>
            %
          </span>
        </div>
        <div
          className="text-[8px] tracking-[0.25em] uppercase mt-1.5"
          style={{
            fontFamily: "var(--pd-font-supporting)",
            color: "rgba(246,239,228,0.55)",
          }}
        >
          confidence
        </div>
      </div>
    </div>
  );
}

function FindingRow({
  stage,
  status,
  headline,
  body,
  contribution,
  last,
}: Finding & { last?: boolean }) {
  const copper = "var(--pd-copper)";
  const cream = "var(--pd-cream)";
  const isDone = status === "done";
  const isActive = status === "active";
  const isPending = status === "pending";

  const dot = isDone ? (
    <div
      className="w-2.5 h-2.5 rounded-full"
      style={{
        backgroundColor: copper,
        boxShadow: "0 0 0 2px var(--pd-navy), 0 0 0 3px rgba(199,122,58,0.35)",
      }}
    />
  ) : isActive ? (
    <div className="relative">
      <span
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: copper,
          opacity: 0.4,
          animation: "pdPulse 2s ease-out infinite",
        }}
      />
      <div
        className="relative w-3 h-3 rounded-full"
        style={{
          backgroundColor: copper,
          boxShadow:
            "0 0 0 2px var(--pd-navy), 0 0 0 3px rgba(199,122,58,0.45), 0 0 10px rgba(199,122,58,0.5)",
        }}
      />
    </div>
  ) : (
    <div
      className="w-2 h-2 rounded-full"
      style={{
        backgroundColor: "var(--pd-navy)",
        boxShadow: "0 0 0 1px rgba(246,239,228,0.25)",
        marginLeft: 1,
        marginTop: 1,
      }}
    />
  );

  return (
    <div className={`relative pl-7 ${last ? "" : "pb-4"}`}>
      <div className="absolute left-0 top-1 z-10">{dot}</div>
      <div
        className="text-[9px] tracking-[0.28em] uppercase font-semibold mb-1 flex items-center gap-2"
        style={{
          fontFamily: "var(--pd-font-supporting)",
          color: isDone || isActive ? copper : "rgba(246,239,228,0.5)",
        }}
      >
        {stage}
        {isActive && (
          <span
            className="italic font-normal"
            style={{
              color: "rgba(246,239,228,0.55)",
              letterSpacing: "0.04em",
              textTransform: "none",
              fontSize: 10,
            }}
          >
            updating…
          </span>
        )}
      </div>
      <div
        className="text-[13px] leading-snug mb-0.5"
        style={{
          fontFamily: "var(--pd-font-serif)",
          fontWeight: isActive ? 600 : 500,
          color: isDone ? cream : isActive ? cream : "rgba(246,239,228,0.62)",
          fontStyle: isPending ? "italic" : "normal",
        }}
      >
        {headline}
      </div>
      {body && (
        <div
          className="text-[11.5px] leading-snug"
          style={{
            fontFamily: "var(--pd-font-sans)",
            color: isDone || isActive ? "rgba(246,239,228,0.7)" : "rgba(246,239,228,0.5)",
          }}
        >
          {body}
        </div>
      )}
      {contribution && (
        <div
          className="text-[10px] tracking-[0.16em] uppercase mt-2 italic flex items-center gap-1.5"
          style={{
            fontFamily: "var(--pd-font-supporting)",
            color: isActive ? copper : "rgba(199,122,58,0.7)",
            fontWeight: 600,
          }}
        >
          <span style={{ opacity: 0.6 }}>→</span>
          {contribution}
        </div>
      )}
    </div>
  );
}
