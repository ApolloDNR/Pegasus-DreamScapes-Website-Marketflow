import { T, FONT_LINK, STRATEGIES_14 } from "./_tokens";
import { BrandBar, FooterDisclosure, Kicker } from "./_chrome";

const sorted = [...STRATEGIES_14].sort((a, b) => b.score - a.score);
const top = sorted.slice(0, 3);
const mid = sorted.filter((s) => s.score >= 20 && !top.includes(s));
const low = sorted.filter((s) => s.score < 20);

export default function Result() {
  return (
    <div style={{ backgroundColor: T.cream, color: T.midnight, fontFamily: T.sans, minHeight: "100vh" }}>
      {FONT_LINK}
      <BrandBar />

      {/* SUBJECT HEADER */}
      <div className="px-10 pt-10 pb-6 border-b" style={{ borderColor: T.rule }}>
        <div className="flex items-end justify-between gap-8 flex-wrap">
          <div>
            <Kicker>Strategy Snapshot · Run #PD-26-0418</Kicker>
            <h1
              className="mt-2 text-[42px] leading-[1.05] font-semibold"
              style={{ fontFamily: T.serif, letterSpacing: "-0.02em" }}
            >
              1247 Aberdeen Way
              <span className="text-[22px] font-normal ml-3" style={{ color: T.muted, fontFamily: T.serif }}>
                Concord, CA 94521
              </span>
            </h1>
            <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: T.muted }}>
              <Pill label="3 / 2 · 1,850 sqft · 1985" />
              <Pill label="Condition · Moderate" />
              <Pill label="Vacant · 30–60 days" />
              <Pill label="Goal · Sell as-is" />
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.28em] font-semibold" style={{ color: T.muted }}>
              Run summary
            </div>
            <div className="mt-2 text-[15px] leading-snug max-w-sm" style={{ fontFamily: T.serif, color: T.midnight }}>
              Three paths fit. <span style={{ color: T.copper, fontWeight: 600 }}>BRRRR leads at 88</span>, with
              Light Flip and Value-Add Flip both above 75. Six paths are viable. Five are weak. The deal
              hinges on rehab discipline and rate drift.
            </div>
          </div>
        </div>
      </div>

      {/* BEST FIT */}
      <section className="px-10 pt-10 pb-6">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <Kicker>Best Fit · Top 3 of 14</Kicker>
            <h2 className="mt-2 text-[28px] font-semibold" style={{ fontFamily: T.serif, letterSpacing: "-0.015em" }}>
              These are the paths Pegasus would actually pursue.
            </h2>
          </div>
          <div className="text-[11px]" style={{ color: T.muted }}>
            Scored 0–100. Higher = better fit for this exact property + situation.
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {top.map((s) => (
            <StrategyCard key={s.name} s={s} bestFit />
          ))}
        </div>
      </section>

      {/* OTHER STRATEGIES */}
      <section className="px-10 pt-6 pb-10">
        <div className="flex items-baseline justify-between mb-5">
          <Kicker>Other Paths · {mid.length} viable</Kicker>
          <div className="text-[11px]" style={{ color: T.muted }}>
            Expand any card to see the math.
          </div>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {mid.map((s) => (
            <StrategyCard key={s.name} s={s} />
          ))}
        </div>

        <div className="mt-8">
          <button
            className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] font-semibold pb-1"
            style={{ color: T.copper, borderBottom: `1px solid ${T.copper}` }}
          >
            ▾ Show {low.length} low-fit paths (score &lt; 20)
          </button>
          <div className="mt-2 text-[11px]" style={{ color: T.muted }}>
            Collapsed by default. Pegasus reviewed them and ruled them out — the why is visible when you expand.
          </div>
        </div>
      </section>

      {/* WHAT KILLS THIS DEAL */}
      <section className="px-10 pb-10">
        <div
          className="p-9"
          style={{
            backgroundColor: T.creamSoft,
            border: `1px solid ${T.rule}`,
            borderLeft: `6px solid ${T.copper}`,
            borderRadius: 2,
          }}
        >
          <div className="flex items-baseline justify-between flex-wrap gap-4">
            <div>
              <Kicker>Sensitivity · Brand-differentiator</Kicker>
              <h2
                className="mt-2 text-[32px] font-semibold"
                style={{ fontFamily: T.sans, fontWeight: 600, letterSpacing: "-0.01em", color: T.midnight }}
              >
                What kills this deal?
              </h2>
            </div>
            <div className="text-[12px] max-w-sm" style={{ color: T.muted }}>
              Two or three numbers move the verdict from Yes to No. Watch these.
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-6">
            <KillCard
              n="01"
              headline="If renovation costs exceed $78k"
              body="BRRRR drops below break-even on refi. Top three collapse to one. Most likely cause: hidden electrical or sewer line work in the 1985 build."
            />
            <KillCard
              n="02"
              headline="If rates drift +75 bps before refi"
              body="DSCR falls under 1.10. BRRRR becomes a 'left $90k+ in' deal. Light Flip and Value-Add Flip stay intact — but cashflow plays weaken."
            />
            <KillCard
              n="03"
              headline="If ARV comes in under $590k"
              body="Three of the four scored comps are within 0.4 mi, so this is the tightest number. A $590k ARV trims net flip margin by ~$22k."
            />
          </div>
        </div>
      </section>

      {/* HOW PEGASUS COULD PARTICIPATE */}
      <section className="px-10 pb-10">
        <Kicker>Disclosure · How Pegasus could participate</Kicker>
        <h2 className="mt-2 mb-2 text-[24px] font-semibold" style={{ fontFamily: T.serif, letterSpacing: "-0.015em" }}>
          On the record, before you decide.
        </h2>
        <p className="text-[13px] max-w-3xl leading-relaxed" style={{ color: T.muted }}>
          The strategy recommendation above is independent of how Pegasus could earn on this property.
          We disclose every lane up front so you can weigh the advice on its merits.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-5">
          <LaneCard
            tag="Lane 1 · Acquisition"
            title="Pegasus buys at a Pegasus number."
            range="Target spread: $35k–$70k net at exit · paid only if we close and execute the path."
            note="Disclosed because BRRRR and Value-Add Flip are top-3 paths Pegasus would consider directly."
          />
          <LaneCard
            tag="Lane 4 · GC / Build"
            title="Pegasus runs the rehab as GC."
            range="GC fee: 12–18% of hard costs · only paid if you hire us; you may use any contractor."
            note="Disclosed because the Value-Add Flip path benefits from in-house construction."
          />
          <LaneCard
            tag="Lane 5 · Agent"
            title="Apollo lists or buy-side via Keller Williams."
            range="Standard commission: 2.5–3.0% · paid by the seller of record at close."
            note="Disclosed because the Light Flip exit lists on the MLS through KW East Bay."
          />
        </div>
        <div className="mt-4 text-[11px]" style={{ color: T.muted }}>
          The recommendation above does not change based on which lane(s) Pegasus is in. Conversations,
          not pitches. Written agreement on every deal.
        </div>
      </section>

      {/* PRIMARY CTA + secondary affordances */}
      <section className="px-10 pb-14">
        <div
          className="p-10 grid grid-cols-[1fr_auto] gap-10 items-center"
          style={{ backgroundColor: T.midnight, color: T.cream, borderRadius: 2 }}
        >
          <div>
            <Kicker dark>Next Step · The path forward</Kicker>
            <div className="mt-3 text-[28px] leading-snug max-w-2xl" style={{ fontFamily: T.serif, fontWeight: 500, letterSpacing: "-0.015em" }}>
              Want a human to review this? Submit for a free Strategy Snapshot. Most Strategy Snapshots
              are reviewed within 5 business days.
            </div>
          </div>
          <button
            className="h-14 px-10 text-[12px] uppercase tracking-[0.18em] font-semibold inline-flex items-center gap-3 whitespace-nowrap"
            style={{ backgroundColor: T.copper, color: T.cream, borderRadius: 2 }}
          >
            Request a Strategy Review →
          </button>
        </div>

        {/* Secondary affordances — visually subordinate */}
        <div className="mt-4 flex items-center gap-6 text-[11px] uppercase tracking-[0.22em] font-semibold" style={{ color: T.muted }}>
          <div className="flex items-center gap-2">
            <Lock /> Save this analysis
          </div>
          <span style={{ color: T.rule }}>·</span>
          <div className="flex items-center gap-2">
            <Lock /> Share via link
          </div>
          <span style={{ color: T.rule }}>·</span>
          <div className="flex items-center gap-2">
            <Lock /> Export as PDF
          </div>
          <div className="ml-auto text-[10px] normal-case tracking-normal" style={{ color: T.muted, fontFamily: T.sans, fontWeight: 400 }}>
            All three open the account wall — Pegasus needs a verified email to store, share, or export your analysis.
          </div>
        </div>
      </section>

      <FooterDisclosure />
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center px-3 h-7"
      style={{
        backgroundColor: "rgba(200,122,58,0.08)",
        color: T.copper,
        border: `1px solid rgba(200,122,58,0.3)`,
        borderRadius: 2,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}

function StrategyCard({ s, bestFit = false }: { s: (typeof STRATEGIES_14)[number]; bestFit?: boolean }) {
  const scoreColor = s.score >= 70 ? T.copper : s.score >= 40 ? T.midnight : T.muted;
  return (
    <div
      className="p-6 flex flex-col"
      style={{
        backgroundColor: "#fff",
        border: bestFit ? `2px solid ${T.copper}` : `1px solid ${T.rule}`,
        borderRadius: 2,
        position: "relative",
      }}
    >
      {bestFit && (
        <div
          className="absolute -top-3 left-5 px-3 h-6 inline-flex items-center text-[10px] uppercase tracking-[0.22em] font-semibold"
          style={{ backgroundColor: T.copper, color: T.cream, borderRadius: 2 }}
        >
          ◆ Best Fit
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] font-semibold" style={{ color: T.muted }}>
            Strategy
          </div>
          <h3 className="mt-1 text-[19px] leading-tight font-semibold" style={{ fontFamily: T.serif, letterSpacing: "-0.01em" }}>
            {s.name}
          </h3>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.22em] font-semibold" style={{ color: T.muted }}>
            Fit
          </div>
          <div className="text-[34px] leading-none font-semibold tabular-nums" style={{ fontFamily: T.serif, color: scoreColor }}>
            {s.score}
          </div>
        </div>
      </div>

      <div className="mt-3 text-[12.5px] leading-relaxed" style={{ color: T.muted }}>
        {s.why}
      </div>

      {/* Scenario triplet */}
      <div className="mt-5 grid grid-cols-3 gap-2 text-[11px]">
        {[
          { tag: "Base", v: s.base, color: T.midnight },
          { tag: "Stressed", v: s.stressed, color: T.muted },
          { tag: "Worst", v: s.worst, color: T.muted },
        ].map((sc) => (
          <div
            key={sc.tag}
            className="p-2.5"
            style={{
              backgroundColor: sc.tag === "Base" ? "rgba(200,122,58,0.06)" : "rgba(26,35,50,0.03)",
              borderLeft: `2px solid ${sc.tag === "Base" ? T.copper : T.rule}`,
              borderRadius: 2,
            }}
          >
            <div className="text-[9px] uppercase tracking-[0.22em] font-semibold mb-1" style={{ color: sc.tag === "Base" ? T.copper : T.muted }}>
              {sc.tag}
            </div>
            <div className="leading-snug" style={{ color: sc.color, fontFamily: T.serif }}>
              {sc.v}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] font-semibold border-t" style={{ borderColor: T.rule, color: T.muted }}>
        <button>▸ Expand math</button>
        <span>v1 engine</span>
      </div>
    </div>
  );
}

function KillCard({ n, headline, body }: { n: string; headline: string; body: string }) {
  return (
    <div
      className="p-5"
      style={{ backgroundColor: "#fff", border: `1px solid ${T.rule}`, borderRadius: 2 }}
    >
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-[26px] font-semibold tabular-nums" style={{ fontFamily: T.serif, color: T.copper }}>
          {n}
        </span>
        <div className="text-[15px] leading-snug font-semibold" style={{ color: T.midnight }}>
          {headline}
        </div>
      </div>
      <div className="text-[12.5px] leading-relaxed" style={{ color: T.muted }}>
        {body}
      </div>
    </div>
  );
}

function LaneCard({ tag, title, range, note }: { tag: string; title: string; range: string; note: string }) {
  return (
    <div
      className="p-5"
      style={{ backgroundColor: "#fff", border: `1px solid ${T.rule}`, borderRadius: 2 }}
    >
      <div className="text-[10px] uppercase tracking-[0.22em] font-semibold" style={{ color: T.copper }}>
        {tag}
      </div>
      <div className="mt-2 text-[16px] leading-tight font-semibold" style={{ fontFamily: T.serif, color: T.midnight }}>
        {title}
      </div>
      <div className="mt-3 text-[12.5px] leading-relaxed font-medium" style={{ color: T.midnight }}>
        {range}
      </div>
      <div className="mt-3 pt-3 border-t text-[11.5px] leading-relaxed italic" style={{ borderColor: T.rule, color: T.muted }}>
        {note}
      </div>
    </div>
  );
}

function Lock() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <rect x="4" y="11" width="16" height="10" rx="1" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
