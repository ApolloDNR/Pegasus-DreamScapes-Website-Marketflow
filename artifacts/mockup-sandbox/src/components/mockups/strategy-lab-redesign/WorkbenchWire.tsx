import { WorkbenchChassis } from "./_ChassisV2";
import "./_group.css";

/**
 * Verdict-as-Wire.
 * The answer is a trail. A timestamped wire feed of findings as they
 * happen — Bloomberg war-room aesthetic. Auditable. The trust signal
 * is traceability: you can see every step that produced the verdict.
 */

export function WorkbenchWire() {
  return <WorkbenchChassis verdict={<WireVerdict />} />;
}

type WireEntry = {
  ts: string;
  tag: "INPUT" | "CALC" | "LANE" | "RISK" | "SENS" | "VERDICT";
  msg: React.ReactNode;
  tone?: "neutral" | "up" | "down" | "warn" | "verdict";
};

const FEED: WireEntry[] = [
  { ts: "10:41:58", tag: "INPUT",   msg: "Property loaded · 1247 Aberdeen Way · SFR 3/2 1850sf 1985" },
  { ts: "10:42:01", tag: "INPUT",   msg: "Situation locked · off-market · wholesaler-sourced · moderate rehab" },
  { ts: "10:42:01", tag: "LANE",    msg: "8 lanes eligible · narrowed to 5 (excl. Operator Referral, Strategy Education)" },
  { ts: "10:42:03", tag: "INPUT",   msg: <>Asking <N>$425,000</N> committed</> },
  { ts: "10:42:04", tag: "INPUT",   msg: <>Rehab <N>$65,000</N> committed</> },
  { ts: "10:42:05", tag: "INPUT",   msg: <>ARV target <N>$610,000</N> committed</> },
  { ts: "10:42:05", tag: "CALC",    msg: <>All-in basis <N>$498,000</N> (asking + rehab + carry $8k)</> },
  { ts: "10:42:05", tag: "CALC",    msg: <>Spread to ARV <N>$112,000</N> · <N>18.4%</N></> },
  { ts: "10:42:05", tag: "CALC",    msg: <>75% refi proceeds <N>$458,000</N> · cash left in <N>$40,000</N></> },
  { ts: "10:42:05", tag: "CALC",    msg: <>Cash flow <N>$1,240/mo</N> · DSCR <N>1.42</N> at 7.25%</>, tone: "up" },
  { ts: "10:42:05", tag: "LANE",    msg: <>BRRRR rises <N>67% → 72%</N> · top lane</>, tone: "up" },
  { ts: "10:42:05", tag: "LANE",    msg: "Fix & Flip: 64% · Rental Hold: 51% · Wholesale: 38%" },
  { ts: "10:42:06", tag: "RISK",    msg: <>Comp depth <N>3 of 5</N> within 0.5mi · confidence wide</>, tone: "warn" },
  { ts: "10:42:06", tag: "RISK",    msg: "Built 1985 · plumbing/electrical unverified · pad rehab 10%", tone: "warn" },
  { ts: "10:42:06", tag: "SENS",    msg: <>If ARV −10%: BRRRR <N>72% → 38%</N></>, tone: "down" },
  { ts: "10:42:06", tag: "SENS",    msg: <>If rehab +15%: BRRRR <N>72% → 50%</N></>, tone: "down" },
  { ts: "10:42:06", tag: "SENS",    msg: <>If offer −$20k: BRRRR <N>72% → 90%</N></>, tone: "up" },
  { ts: "10:42:07", tag: "VERDICT", msg: <>BRRRR · refi-and-hold · <N>72%</N> confidence · range <N>65–78%</N></>, tone: "verdict" },
];

function WireVerdict() {
  const navy = "var(--pd-navy)";
  const copper = "var(--pd-copper)";
  const cream = "var(--pd-cream)";
  const muted = "var(--pd-muted)";

  return (
    <div
      className="rounded-sm overflow-hidden flex flex-col"
      style={{
        backgroundColor: "#0a1424",
        color: cream,
        fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace",
        minHeight: "100%",
      }}
    >
      {/* Wire header */}
      <div
        className="flex items-center justify-between px-4 pt-3 pb-3 border-b border-white/10"
        style={{ backgroundColor: "rgba(199,122,58,0.06)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#5fbf7f", boxShadow: "0 0 6px #5fbf7f" }}
            />
            <div
              className="text-[10px] tracking-[0.28em] uppercase font-semibold"
              style={{ fontFamily: "var(--pd-font-supporting)", color: copper }}
            >
              Verdict Wire
            </div>
          </div>
          <div
            className="text-[9px] tracking-[0.2em] uppercase pl-3 border-l border-white/15"
            style={{ fontFamily: "var(--pd-font-supporting)", color: "rgba(246,239,228,0.5)" }}
          >
            Live · 18 events
          </div>
        </div>
        <div
          className="text-[9px] tracking-[0.2em] uppercase tabular-nums"
          style={{ fontFamily: "var(--pd-font-supporting)", color: "rgba(246,239,228,0.5)" }}
        >
          T+00:00:09
        </div>
      </div>

      {/* Current state strip */}
      <div className="px-4 py-3 border-b border-white/10 grid grid-cols-3 gap-3">
        <StateCell label="Top Lane" value="BRRRR" accent />
        <StateCell label="Confidence" value="72%" accent />
        <StateCell label="Cash Left In" value="$40k" />
      </div>

      {/* The feed */}
      <div className="flex-1 px-4 py-3 overflow-y-auto" style={{ maxHeight: 980 }}>
        <div className="space-y-0.5">
          {FEED.map((e, i) => (
            <WireRow key={i} entry={e} />
          ))}
          <div className="flex items-center gap-2 pt-2 pl-[4.75rem]">
            <span
              className="inline-block w-2 h-3 -mb-0.5"
              style={{
                backgroundColor: copper,
                animation: "blink 1s steps(2) infinite",
              }}
            />
            <span
              className="text-[10px] tracking-[0.2em] uppercase"
              style={{ fontFamily: "var(--pd-font-supporting)", color: "rgba(246,239,228,0.4)" }}
            >
              Awaiting · Comps stage
            </span>
          </div>
        </div>
      </div>

      {/* Filter row */}
      <div className="px-4 py-2 border-t border-white/10 flex items-center gap-2 overflow-x-auto">
        <FilterChip label="ALL" active />
        <FilterChip label="LANE" />
        <FilterChip label="CALC" />
        <FilterChip label="RISK" />
        <FilterChip label="SENS" />
        <FilterChip label="VERDICT" />
      </div>

      {/* Actions */}
      <div className="px-4 py-4 border-t border-white/10 space-y-2" style={{ backgroundColor: "rgba(0,0,0,0.25)" }}>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="py-2.5 text-[10px] tracking-[0.18em] uppercase font-semibold border"
            style={{
              fontFamily: "var(--pd-font-supporting)",
              borderColor: "rgba(246,239,228,0.3)",
              color: cream,
            }}
          >
            Export trail
          </button>
          <button
            className="py-2.5 text-[10px] tracking-[0.18em] uppercase font-semibold"
            style={{ fontFamily: "var(--pd-font-supporting)", backgroundColor: copper, color: cream }}
          >
            Snapshot
          </button>
        </div>
        <button
          className="w-full py-2.5 text-[10px] tracking-[0.18em] uppercase font-semibold"
          style={{ fontFamily: "var(--pd-font-supporting)", backgroundColor: navy, color: cream }}
        >
          Submit to Pegasus
        </button>
        <div
          className="text-[10px] leading-relaxed pt-1"
          style={{
            color: "rgba(246,239,228,0.4)",
            fontFamily: "var(--pd-font-sans)",
          }}
        >
          Every line is auditable. Preliminary — human review required.
        </div>
      </div>

      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
}

function StateCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div
        className="text-[8px] tracking-[0.25em] uppercase mb-0.5"
        style={{
          fontFamily: "var(--pd-font-supporting)",
          color: "rgba(246,239,228,0.5)",
        }}
      >
        {label}
      </div>
      <div
        className="text-[14px] tabular-nums leading-none"
        style={{
          fontFamily: accent ? "var(--pd-font-serif)" : "inherit",
          fontWeight: 600,
          color: accent ? "var(--pd-copper)" : "var(--pd-cream)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function WireRow({ entry }: { entry: WireEntry }) {
  const tagColor: Record<WireEntry["tag"], string> = {
    INPUT: "rgba(246,239,228,0.5)",
    CALC: "#a8b8d4",
    LANE: "var(--pd-copper)",
    RISK: "#e8a07a",
    SENS: "#c8a8e8",
    VERDICT: "#5fbf7f",
  };
  const toneColor: Record<NonNullable<WireEntry["tone"]>, string> = {
    neutral: "rgba(246,239,228,0.85)",
    up: "#7fd09a",
    down: "#e8a07a",
    warn: "#f0c878",
    verdict: "var(--pd-cream)",
  };
  const tone = entry.tone ?? "neutral";
  const isVerdict = entry.tag === "VERDICT";

  return (
    <div
      className="flex items-baseline gap-3 text-[11.5px] leading-relaxed py-0.5 px-1"
      style={{
        backgroundColor: isVerdict ? "rgba(95,191,122,0.06)" : "transparent",
        borderLeft: isVerdict ? "2px solid #5fbf7f" : "2px solid transparent",
      }}
    >
      <span
        className="tabular-nums flex-shrink-0"
        style={{ color: "rgba(246,239,228,0.35)" }}
      >
        {entry.ts}
      </span>
      <span
        className="text-[9px] tracking-[0.15em] uppercase font-semibold flex-shrink-0 w-14"
        style={{
          fontFamily: "var(--pd-font-supporting)",
          color: tagColor[entry.tag],
        }}
      >
        {entry.tag}
      </span>
      <span
        className="flex-1"
        style={{
          color: toneColor[tone],
          fontWeight: isVerdict ? 600 : 400,
        }}
      >
        {entry.msg}
      </span>
    </div>
  );
}

function FilterChip({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className="px-2.5 py-1 text-[9px] tracking-[0.18em] uppercase font-semibold rounded-sm border flex-shrink-0"
      style={{
        fontFamily: "var(--pd-font-supporting)",
        borderColor: active ? "var(--pd-copper)" : "rgba(246,239,228,0.2)",
        color: active ? "var(--pd-copper)" : "rgba(246,239,228,0.6)",
        backgroundColor: active ? "rgba(199,122,58,0.08)" : "transparent",
      }}
    >
      {label}
    </button>
  );
}

function N({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="tabular-nums"
      style={{ color: "var(--pd-cream)", fontWeight: 600 }}
    >
      {children}
    </span>
  );
}
