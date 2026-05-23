import { T, FONT_LINK } from "./_tokens";
import { Kicker } from "./_chrome";

export default function EntryMobile() {
  return (
    <div style={{ backgroundColor: T.cream, color: T.midnight, fontFamily: T.sans, minHeight: "100vh" }}>
      {FONT_LINK}

      {/* compact brand bar */}
      <div
        className="flex items-center justify-between px-5 h-14 border-b"
        style={{ borderColor: T.rule }}
      >
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

      <div className="px-5 pt-8 pb-5">
        <Kicker>Strategy Lab · v1</Kicker>
        <h1
          className="mt-3 text-[34px] leading-[1.05] font-semibold"
          style={{ fontFamily: T.serif, letterSpacing: "-0.02em" }}
        >
          One address in. <span style={{ color: T.copper }}>Every angle out.</span>
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed" style={{ color: T.muted }}>
          Submit a property and Pegasus runs it through fourteen strategic paths.
        </p>
      </div>

      <div className="px-5">
        <div
          className="p-5"
          style={{ backgroundColor: T.creamSoft, border: `1px solid ${T.rule}`, borderRadius: 2 }}
        >
          <Kicker>Property address</Kicker>
          <div
            className="mt-3 flex items-center gap-2 h-12 px-3"
            style={{ backgroundColor: "#fff", border: `1px solid ${T.midnight}`, borderRadius: 2 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.copper} strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
            </svg>
            <span className="text-[13px]" style={{ fontFamily: T.serif }}>
              1247 Aberdeen Way, Concord
            </span>
          </div>
          <div className="mt-1 text-[9px] uppercase tracking-[0.22em] font-semibold" style={{ color: T.muted }}>
            ⌕ Google Places autocomplete
          </div>

          <div className="mt-6">
            <Kicker>Condition (1–5)</Kicker>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((v) => (
                <div
                  key={v}
                  className="h-12 flex items-center justify-center text-[16px] font-semibold"
                  style={{
                    backgroundColor: v === 3 ? T.midnight : "#fff",
                    color: v === 3 ? T.copper : T.copper,
                    border: `1px solid ${v === 3 ? T.midnight : T.rule}`,
                    fontFamily: T.serif,
                    borderRadius: 2,
                  }}
                >
                  {v}
                </div>
              ))}
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.22em] font-semibold" style={{ color: T.muted }}>
              3 · Moderate rehab
            </div>
          </div>

          {[
            ["Occupancy", "Vacant · clean possession"],
            ["Timeline", "30–60 days"],
            ["Goal", "Sell as-is to an operator"],
          ].map(([k, v]) => (
            <div className="mt-5" key={k}>
              <Kicker>{k}</Kicker>
              <div
                className="mt-2 flex items-center justify-between h-12 px-3 text-[13px]"
                style={{ backgroundColor: "#fff", border: `1px solid ${T.rule}`, fontFamily: T.serif, borderRadius: 2 }}
              >
                <span>{v}</span>
                <span style={{ color: T.copper }}>▾</span>
              </div>
            </div>
          ))}

          <div className="mt-5">
            <Kicker>Owner situation</Kicker>
            <div
              className="mt-2 px-3 py-2.5 text-[12.5px] leading-relaxed"
              style={{ backgroundColor: "#fff", border: `1px solid ${T.rule}`, borderRadius: 2, fontFamily: T.serif, minHeight: 80 }}
            >
              Inherited last spring. Vacant. Roof patched, not replaced. Want to close before October.
            </div>
          </div>

          <button
            className="mt-6 w-full h-13 px-6 text-[12px] uppercase tracking-[0.18em] font-semibold inline-flex items-center justify-center gap-2"
            style={{ backgroundColor: T.copper, color: T.cream, borderRadius: 2, height: 52 }}
          >
            Run Analysis →
          </button>
          <div className="mt-2 text-center text-[10px]" style={{ color: T.muted }}>
            ~14 seconds. No account required.
          </div>
        </div>

        <div
          className="mt-5 p-5"
          style={{
            backgroundColor: T.creamSoft,
            border: `1px solid ${T.rule}`,
            borderLeft: `3px solid ${T.copper}`,
            borderRadius: 2,
          }}
        >
          <div className="text-[10px] uppercase tracking-[0.22em] font-semibold mb-2" style={{ color: T.copper }}>
            Privacy · Brief §6.7
          </div>
          <p className="text-[11.5px] leading-relaxed" style={{ color: T.midnight }}>
            This analysis is private. Pegasus does not list your address publicly, does not sell your
            information, and does not contact the homeowner of record without your written permission.
          </p>
        </div>
      </div>

      <div className="px-5 py-8 mt-4 border-t" style={{ borderColor: T.rule }}>
        <div className="text-[10px] uppercase tracking-[0.28em] font-semibold mb-2" style={{ color: T.midnight }}>
          Disclosures
        </div>
        <div className="text-[10.5px] leading-relaxed" style={{ color: T.muted }}>
          DRE #02333658 · KW East Bay. Each office independently owned and operated. Not an offer or
          a solicitation of securities.
        </div>
      </div>
    </div>
  );
}
