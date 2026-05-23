import { T, FONT_LINK, STRATEGIES_14 } from "./_tokens";
import { Kicker } from "./_chrome";

const sorted = [...STRATEGIES_14].sort((a, b) => b.score - a.score);
const top = sorted.slice(0, 3);
const mid = sorted.filter((s) => s.score >= 20 && !top.includes(s)).slice(0, 4);

export default function ResultMobile() {
  return (
    <div style={{ backgroundColor: T.cream, color: T.midnight, fontFamily: T.sans, minHeight: "100vh" }}>
      {FONT_LINK}
      <div className="flex items-center justify-between px-5 h-14 border-b" style={{ borderColor: T.rule }}>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: T.copper }} />
          <div className="text-[13px] font-semibold" style={{ fontFamily: T.serif }}>
            Pegasus DreamScapes
          </div>
        </div>
        <div className="text-[9px] uppercase tracking-[0.22em] font-semibold" style={{ color: T.muted }}>
          ☰
        </div>
      </div>

      {/* Subject */}
      <div className="px-5 pt-6 pb-4 border-b" style={{ borderColor: T.rule }}>
        <Kicker>Strategy Snapshot · #PD-26-0418</Kicker>
        <h1 className="mt-2 text-[26px] leading-tight font-semibold" style={{ fontFamily: T.serif, letterSpacing: "-0.02em" }}>
          1247 Aberdeen Way
        </h1>
        <div className="text-[13px]" style={{ color: T.muted, fontFamily: T.serif }}>
          Concord, CA · 3 / 2 · 1,850 sqft
        </div>
        <div className="mt-3 text-[13px] leading-snug" style={{ fontFamily: T.serif }}>
          Three paths fit. <span style={{ color: T.copper, fontWeight: 600 }}>BRRRR leads at 88.</span>{" "}
          The deal hinges on rehab discipline and rate drift.
        </div>
      </div>

      {/* Best fit cards */}
      <div className="px-5 pt-6">
        <Kicker>Best Fit · Top 3 of 14</Kicker>
        <div className="mt-4 space-y-4">
          {top.map((s) => (
            <MCard key={s.name} s={s} best />
          ))}
        </div>
      </div>

      <div className="px-5 pt-6">
        <Kicker>Other paths · viable</Kicker>
        <div className="mt-3 space-y-2">
          {mid.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between px-4 py-3"
              style={{ backgroundColor: "#fff", border: `1px solid ${T.rule}`, borderRadius: 2 }}
            >
              <div>
                <div className="text-[14px] font-semibold" style={{ fontFamily: T.serif }}>{s.name}</div>
                <div className="text-[11px]" style={{ color: T.muted }}>Base: {s.base}</div>
              </div>
              <div className="text-[22px] tabular-nums font-semibold" style={{ fontFamily: T.serif, color: T.midnight }}>
                {s.score}
              </div>
            </div>
          ))}
          <button
            className="mt-2 w-full py-3 text-[10px] uppercase tracking-[0.22em] font-semibold"
            style={{ border: `1px solid ${T.rule}`, color: T.copper, borderRadius: 2 }}
          >
            ▾ Show all 14 paths
          </button>
        </div>
      </div>

      {/* Kills */}
      <div className="px-5 pt-6">
        <div
          className="p-5"
          style={{
            backgroundColor: T.creamSoft,
            border: `1px solid ${T.rule}`,
            borderLeft: `5px solid ${T.copper}`,
            borderRadius: 2,
          }}
        >
          <Kicker>Sensitivity</Kicker>
          <h2 className="mt-1 text-[22px] font-semibold" style={{ fontFamily: T.sans, fontWeight: 600 }}>
            What kills this deal?
          </h2>
          <div className="mt-3 space-y-3">
            {[
              ["If renovation costs exceed $78k", "BRRRR breaks below refi break-even."],
              ["If rates drift +75 bps", "DSCR falls under 1.10."],
              ["If ARV comes in under $590k", "Trims flip margin by ~$22k."],
            ].map(([h, b], i) => (
              <div key={i} className="flex gap-3 pb-3 border-b last:border-b-0" style={{ borderColor: T.rule }}>
                <span className="text-[18px] font-semibold tabular-nums" style={{ fontFamily: T.serif, color: T.copper }}>
                  0{i + 1}
                </span>
                <div>
                  <div className="text-[13px] font-semibold leading-snug">{h}</div>
                  <div className="text-[11.5px] mt-1" style={{ color: T.muted }}>{b}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lanes */}
      <div className="px-5 pt-6">
        <Kicker>How Pegasus could participate</Kicker>
        <p className="mt-2 text-[11.5px]" style={{ color: T.muted }}>
          On the record, before you decide. Recommendation is independent of lane.
        </p>
        <div className="mt-3 space-y-2">
          {[
            ["Lane 1 · Acquisition", "Buy at a Pegasus number · spread $35k–$70k net at exit"],
            ["Lane 4 · GC / Build", "Rehab as GC · 12–18% of hard costs"],
            ["Lane 5 · Agent", "List via KW East Bay · 2.5–3.0% commission"],
          ].map(([t, v]) => (
            <div key={t} className="px-4 py-3" style={{ backgroundColor: "#fff", border: `1px solid ${T.rule}`, borderRadius: 2 }}>
              <div className="text-[10px] uppercase tracking-[0.22em] font-semibold" style={{ color: T.copper }}>
                {t}
              </div>
              <div className="text-[12px] mt-1" style={{ color: T.midnight }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pt-6 pb-6">
        <div
          className="p-6"
          style={{ backgroundColor: T.midnight, color: T.cream, borderRadius: 2 }}
        >
          <Kicker dark>Next step</Kicker>
          <div className="mt-2 text-[18px] leading-snug" style={{ fontFamily: T.serif }}>
            Want a human to review this? Submit for a free Strategy Snapshot. Most Strategy Snapshots
            are reviewed within 5 business days.
          </div>
          <button
            className="mt-5 w-full py-4 text-[11px] uppercase tracking-[0.18em] font-semibold"
            style={{ backgroundColor: T.copper, color: T.cream, borderRadius: 2 }}
          >
            Request a Strategy Review →
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] uppercase tracking-[0.18em] font-semibold text-center" style={{ color: T.muted }}>
          <div className="py-3" style={{ border: `1px solid ${T.rule}`, borderRadius: 2 }}>🔒 Save</div>
          <div className="py-3" style={{ border: `1px solid ${T.rule}`, borderRadius: 2 }}>🔒 Share</div>
          <div className="py-3" style={{ border: `1px solid ${T.rule}`, borderRadius: 2 }}>🔒 PDF</div>
        </div>
        <div className="mt-2 text-[10.5px] text-center" style={{ color: T.muted }}>
          All three open the account wall — verified email required to store, share, or export.
        </div>
      </div>

      <div className="px-5 py-7 border-t" style={{ borderColor: T.rule }}>
        <div className="text-[10px] uppercase tracking-[0.28em] font-semibold mb-2">Disclosures</div>
        <div className="text-[10.5px] leading-relaxed" style={{ color: T.muted }}>
          DRE #02333658 · KW East Bay. Each office independently owned and operated. Illustrative
          math only — not investment advice, not an offer, not a solicitation of securities.
        </div>
      </div>
    </div>
  );
}

function MCard({ s, best }: { s: (typeof STRATEGIES_14)[number]; best?: boolean }) {
  return (
    <div
      className="p-4"
      style={{
        backgroundColor: "#fff",
        border: best ? `2px solid ${T.copper}` : `1px solid ${T.rule}`,
        borderRadius: 2,
        position: "relative",
      }}
    >
      {best && (
        <div
          className="absolute -top-2.5 left-4 px-2 h-5 inline-flex items-center text-[9px] uppercase tracking-[0.22em] font-semibold"
          style={{ backgroundColor: T.copper, color: T.cream, borderRadius: 2 }}
        >
          ◆ Best Fit
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[16px] font-semibold leading-tight" style={{ fontFamily: T.serif }}>{s.name}</div>
          <div className="text-[11.5px] mt-1" style={{ color: T.muted }}>{s.why}</div>
        </div>
        <div className="text-[28px] leading-none tabular-nums font-semibold" style={{ fontFamily: T.serif, color: T.copper }}>
          {s.score}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px]">
        {[
          { tag: "Base", v: s.base, hi: true },
          { tag: "Stressed", v: s.stressed },
          { tag: "Worst", v: s.worst },
        ].map((sc) => (
          <div
            key={sc.tag}
            className="p-2"
            style={{
              backgroundColor: sc.hi ? "rgba(200,122,58,0.07)" : "rgba(26,35,50,0.03)",
              borderLeft: `2px solid ${sc.hi ? T.copper : T.rule}`,
            }}
          >
            <div className="text-[8px] uppercase tracking-[0.22em] font-semibold mb-0.5" style={{ color: sc.hi ? T.copper : T.muted }}>
              {sc.tag}
            </div>
            <div style={{ fontFamily: T.serif, color: T.midnight }}>{sc.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
