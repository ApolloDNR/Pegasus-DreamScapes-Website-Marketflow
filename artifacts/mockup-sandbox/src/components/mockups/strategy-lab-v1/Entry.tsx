import { T, FONT_LINK } from "./_tokens";
import { BrandBar, FooterDisclosure, Kicker } from "./_chrome";

const CONDITIONS = [
  { v: 1, label: "Gut" },
  { v: 2, label: "Heavy" },
  { v: 3, label: "Moderate" },
  { v: 4, label: "Light" },
  { v: 5, label: "Turnkey" },
];

export default function Entry() {
  return (
    <div style={{ backgroundColor: T.cream, color: T.midnight, fontFamily: T.sans, minHeight: "100vh" }}>
      {FONT_LINK}
      <BrandBar />

      <div className="px-10 pt-14 pb-6">
        <Kicker>Strategy Lab · v1</Kicker>
        <h1
          className="mt-3 text-[56px] leading-[1.02] font-semibold max-w-3xl"
          style={{ fontFamily: T.serif, letterSpacing: "-0.02em" }}
        >
          One address in. <span style={{ color: T.copper }}>Every angle out.</span>
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed max-w-2xl" style={{ color: T.muted }}>
          Submit a property address and the situation around it. Pegasus runs it through fourteen
          strategic paths and shows you which ones actually fit — with the math, the risks, and the
          two or three lines that would kill the deal.
        </p>
      </div>

      <div className="px-10 pb-14 grid grid-cols-[1fr_360px] gap-10">
        {/* FORM CARD */}
        <div
          className="p-10"
          style={{ backgroundColor: T.creamSoft, border: `1px solid ${T.rule}`, borderRadius: 2 }}
        >
          {/* Property address with Places autocomplete affordance */}
          <Kicker>Property</Kicker>
          <label className="block mt-3 mb-2 text-[12px] font-semibold" style={{ color: T.midnight }}>
            Property address
          </label>
          <div className="relative">
            <div
              className="flex items-center gap-3 h-14 px-4"
              style={{
                backgroundColor: "#fff",
                border: `1px solid ${T.midnight}`,
                borderRadius: 2,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.copper} strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span className="text-[16px]" style={{ color: T.midnight, fontFamily: T.serif }}>
                1247 Aberdeen Way, Concord, CA 94521
              </span>
              <span className="ml-auto text-[10px] uppercase tracking-[0.22em] font-semibold" style={{ color: T.muted }}>
                ⌕ Google Places
              </span>
            </div>
            {/* Autocomplete dropdown affordance */}
            <div
              className="absolute left-0 right-0 mt-1 z-10"
              style={{
                backgroundColor: "#fff",
                border: `1px solid ${T.rule}`,
                borderTop: `2px solid ${T.copper}`,
                boxShadow: "0 8px 24px rgba(26,35,50,0.08)",
              }}
            >
              {[
                "1247 Aberdeen Way, Concord, CA 94521, USA",
                "1247 Aberdeen Dr, Pleasant Hill, CA 94523, USA",
                "1247 Aberdeen Ln, Walnut Creek, CA 94595, USA",
              ].map((s, i) => (
                <div
                  key={s}
                  className="flex items-center gap-3 px-4 py-3 text-[13px]"
                  style={{
                    color: i === 0 ? T.midnight : T.muted,
                    backgroundColor: i === 0 ? "rgba(200,122,58,0.06)" : "transparent",
                    fontWeight: i === 0 ? 600 : 400,
                    borderBottom: i < 2 ? `1px solid ${T.rule}` : "none",
                  }}
                >
                  <span style={{ color: T.copper }}>◆</span>
                  {s}
                </div>
              ))}
              <div className="px-4 py-2 text-[10px] uppercase tracking-[0.22em] font-semibold flex items-center justify-between" style={{ color: T.muted, borderTop: `1px solid ${T.rule}` }}>
                <span>Powered by Google Places</span>
                <span>↵ to select</span>
              </div>
            </div>
          </div>

          <div className="h-32" />

          {/* Condition 1-5 */}
          <Kicker>Condition</Kicker>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c.v}
                className="h-14 text-left px-3 transition-colors"
                style={{
                  backgroundColor: c.v === 3 ? T.midnight : "#fff",
                  color: c.v === 3 ? T.cream : T.midnight,
                  border: `1px solid ${c.v === 3 ? T.midnight : T.rule}`,
                  borderRadius: 2,
                }}
              >
                <div
                  className="text-[18px] font-semibold"
                  style={{ fontFamily: T.serif, color: c.v === 3 ? T.copper : T.copper }}
                >
                  {c.v}
                </div>
                <div className="text-[10px] uppercase tracking-[0.18em] font-semibold mt-0.5">
                  {c.label}
                </div>
              </button>
            ))}
          </div>

          {/* Two columns: occupancy + timeline */}
          <div className="mt-8 grid grid-cols-2 gap-6">
            <SelectField
              kicker="Occupancy"
              value="Vacant · clean possession"
              options={["Vacant · clean possession", "Owner-occupied", "Tenant-occupied", "Mixed", "Unknown"]}
            />
            <SelectField
              kicker="Timeline"
              value="30–60 days"
              options={["ASAP (under 14 days)", "30–60 days", "60–90 days", "Flexible", "Not sure"]}
            />
          </div>

          {/* Owner situation textarea */}
          <div className="mt-8">
            <Kicker>Owner Situation</Kicker>
            <label className="block mt-3 mb-2 text-[12px]" style={{ color: T.muted }}>
              Anything Apollo should know — relocation, probate, tired landlord, partner buyout, lien,
              code issue, surprise repair. Plain English is fine.
            </label>
            <div
              className="px-4 py-3 text-[14px] leading-relaxed"
              style={{
                backgroundColor: "#fff",
                border: `1px solid ${T.rule}`,
                borderRadius: 2,
                minHeight: 110,
                color: T.midnight,
                fontFamily: T.serif,
              }}
            >
              Inherited from my father in March. Vacant since. Roof leaked last winter — patched, not
              replaced. Want to close before tax filing in October and split proceeds with my sister.
            </div>
          </div>

          {/* Goal */}
          <div className="mt-8">
            <SelectField
              kicker="Your goal"
              value="Sell as-is to a serious operator"
              options={[
                "Sell as-is to a serious operator",
                "Sell at retail through the MLS",
                "Refi and hold long-term",
                "JV with Pegasus on a value-add",
                "Just exploring — give me the read",
              ]}
            />
          </div>

          {/* Run analysis CTA */}
          <div className="mt-10 flex items-center gap-4">
            <button
              className="h-14 px-10 text-[12px] uppercase tracking-[0.18em] font-semibold inline-flex items-center gap-3"
              style={{ backgroundColor: T.copper, color: T.cream, borderRadius: 2 }}
            >
              Run Analysis
              <span>→</span>
            </button>
            <div className="text-[11px]" style={{ color: T.muted }}>
              ~14 seconds. No account required.
            </div>
          </div>
        </div>

        {/* RIGHT RAIL — Privacy disclosure + what you get */}
        <aside>
          <div
            className="p-7"
            style={{ backgroundColor: T.midnight, color: T.cream, borderRadius: 2 }}
          >
            <Kicker dark>What you get</Kicker>
            <ul className="mt-4 space-y-3 text-[13px] leading-relaxed" style={{ color: T.cream }}>
              <li className="flex gap-3">
                <span style={{ color: T.copper }}>◆</span>
                Fourteen strategy paths scored 0–100, with the two or three that actually fit
                highlighted.
              </li>
              <li className="flex gap-3">
                <span style={{ color: T.copper }}>◆</span>
                Base, stressed, and worst-case math visible on every strategy by default.
              </li>
              <li className="flex gap-3">
                <span style={{ color: T.copper }}>◆</span>
                A &quot;What kills this deal?&quot; panel naming the two or three numbers that would
                flip the verdict.
              </li>
              <li className="flex gap-3">
                <span style={{ color: T.copper }}>◆</span>
                Clear disclosure of how Pegasus could participate in each top path — and which
                strategies recommend you go elsewhere.
              </li>
            </ul>
          </div>

          {/* Privacy disclosure — verbatim Brief §6.7 */}
          <div
            className="mt-5 p-6"
            style={{
              backgroundColor: T.creamSoft,
              border: `1px solid ${T.rule}`,
              borderLeft: `3px solid ${T.copper}`,
              borderRadius: 2,
            }}
          >
            <div className="text-[10px] uppercase tracking-[0.28em] font-semibold mb-2" style={{ color: T.copper }}>
              Privacy · Brief §6.7
            </div>
            <p className="text-[12px] leading-relaxed" style={{ color: T.midnight }}>
              This analysis is private. Pegasus does not list your address publicly, does not sell your
              information, and does not contact the homeowner of record without your written permission.
              The address you enter is used to pull public data and run the math — nothing more. If you
              ask for a human review, only Apollo and the Pegasus team see what you submitted.
            </p>
          </div>

          <div className="mt-5 text-[11px] leading-relaxed" style={{ color: T.muted }}>
            Every property gets a path. Not every property gets an offer. Pegasus reviews honestly
            even when the answer is &quot;walk.&quot;
          </div>
        </aside>
      </div>

      <FooterDisclosure />
    </div>
  );
}

function SelectField({ kicker, value, options }: { kicker: string; value: string; options: string[] }) {
  return (
    <div>
      <Kicker>{kicker}</Kicker>
      <div
        className="mt-3 flex items-center justify-between h-12 px-4 text-[14px]"
        style={{
          backgroundColor: "#fff",
          border: `1px solid ${T.rule}`,
          borderRadius: 2,
          color: T.midnight,
          fontFamily: T.serif,
        }}
      >
        <span>{value}</span>
        <span style={{ color: T.copper }}>▾</span>
      </div>
      <div className="mt-1 text-[10px]" style={{ color: T.muted }}>
        {options.length} options
      </div>
    </div>
  );
}
