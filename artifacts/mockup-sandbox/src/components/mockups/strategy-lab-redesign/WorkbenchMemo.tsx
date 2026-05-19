import { WorkbenchChassis } from "./_ChassisV2";
import "./_group.css";

/**
 * Verdict-as-Memo.
 * The answer is a document. A signed underwriting memo, like a senior
 * partner wrote it. Numbers embedded in prose. No dashboard, no rings,
 * no cards. The trust signal is that you could print it and send it.
 */

export function WorkbenchMemo() {
  return <WorkbenchChassis verdict={<MemoVerdict />} />;
}

function MemoVerdict() {
  const navy = "var(--pd-navy)";
  const copper = "var(--pd-copper)";
  const cream = "var(--pd-cream)";
  const ink = "#1a1410";
  const paper = "#FAF5EA";
  const muted = "var(--pd-muted)";

  return (
    <div className="flex flex-col gap-4">
      {/* Live status strip — outside the paper */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "#5fbf7f", boxShadow: "0 0 6px #5fbf7f" }}
          />
          <div
            className="text-[9px] tracking-[0.28em] uppercase font-semibold"
            style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
          >
            Memo · Drafting live
          </div>
        </div>
        <div
          className="text-[9px] tracking-[0.2em] uppercase"
          style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
        >
          Auto-revised 0s ago
        </div>
      </div>

      {/* The paper */}
      <div
        className="relative p-8 pt-9"
        style={{
          backgroundColor: paper,
          color: ink,
          boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 12px 32px -16px rgba(13,27,45,0.18)",
          border: "1px solid rgba(13,27,45,0.08)",
        }}
      >
        {/* Letterhead */}
        <div className="flex items-start justify-between pb-3 mb-5 border-b" style={{ borderColor: "rgba(13,27,45,0.12)" }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-1 rounded-sm" style={{ backgroundColor: copper }} />
              <div
                className="text-[10px] tracking-[0.28em] uppercase font-semibold"
                style={{ fontFamily: "var(--pd-font-display)", color: navy }}
              >
                Pegasus Dreamscapes
              </div>
            </div>
            <div
              className="text-[8px] tracking-[0.22em] uppercase"
              style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
            >
              Internal Underwriting Memorandum
            </div>
          </div>
          <div
            className="text-[8px] tracking-[0.2em] uppercase text-right"
            style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
          >
            File · SL-2026-0147<br />
            May 17, 2026
          </div>
        </div>

        {/* Subject header (legal-memo style) */}
        <div className="space-y-1 text-[10.5px] mb-5" style={{ fontFamily: "var(--pd-font-supporting)" }}>
          <MemoHead k="TO" v="Apollo · Principal" />
          <MemoHead k="FROM" v="Strategy Lab · automated read" />
          <MemoHead k="RE" v="1247 Aberdeen Way, Concord CA 94521" />
          <MemoHead k="LANE" v="BRRRR · Refi-and-hold · 72% confidence" />
        </div>

        <div className="h-px mb-5" style={{ backgroundColor: copper }} />

        {/* Body — actual prose, embedded numbers */}
        <div
          className="text-[12.5px] leading-[1.7]"
          style={{ fontFamily: "var(--pd-font-serif)", color: ink }}
        >
          <p className="mb-3">
            <span
              className="text-[10px] tracking-[0.22em] uppercase font-semibold mr-2 align-baseline"
              style={{ fontFamily: "var(--pd-font-supporting)", color: copper }}
            >
              Recommendation.
            </span>
            BRRRR with a conventional 75% refinance. The property reads as a
            structurally sound buy-rehab-refinance candidate at the numbers
            entered.
          </p>

          <p className="mb-3">
            <span
              className="text-[10px] tracking-[0.22em] uppercase font-semibold mr-2 align-baseline"
              style={{ fontFamily: "var(--pd-font-supporting)", color: copper }}
            >
              Basis.
            </span>
            Asking <Num>$425,000</Num>, estimated rehab <Num>$65,000</Num>,
            closing and carry <Num>$8,000</Num> — all-in basis of{" "}
            <Num>$498,000</Num> against a target ARV of <Num>$610,000</Num>.
            The <Num>$112,000</Num> spread is 18% of ARV, inside our band
            for refi-and-hold work.
          </p>

          <p className="mb-3">
            <span
              className="text-[10px] tracking-[0.22em] uppercase font-semibold mr-2 align-baseline"
              style={{ fontFamily: "var(--pd-font-supporting)", color: copper }}
            >
              Refinance.
            </span>
            A conventional refi at <Num>75%</Num> of ARV pulls{" "}
            <Num>$458,000</Num> of capital back. Cash left in:{" "}
            <Num>$40,000</Num>, against <Num>$1,240/month</Num> of net cash
            flow at conservative rent. DSCR <Num>1.42</Num> at 7.25%.
          </p>

          <p className="mb-3">
            <span
              className="text-[10px] tracking-[0.22em] uppercase font-semibold mr-2 align-baseline"
              style={{ fontFamily: "var(--pd-font-supporting)", color: copper }}
            >
              Open variables.
            </span>
            Two items warrant firming before any offer. <em>First</em>, comp
            depth is thin — 3 closed within 0.5 mi and 90–180 days, against
            our preferred 5. <em>Second</em>, a 1985 build with unknown
            plumbing and electrical merits a 10% rehab buffer until a walk.
          </p>

          <p className="mb-1">
            <span
              className="text-[10px] tracking-[0.22em] uppercase font-semibold mr-2 align-baseline"
              style={{ fontFamily: "var(--pd-font-supporting)", color: copper }}
            >
              Next step.
            </span>
            Pull two additional comps; schedule a walk before tightening
            offer. The deal is live, not theoretical.
          </p>
        </div>

        {/* Signature block */}
        <div className="mt-7 pt-4 border-t flex items-end justify-between" style={{ borderColor: "rgba(13,27,45,0.12)" }}>
          <div>
            <div
              className="text-[18px] mb-0.5"
              style={{
                fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive",
                color: navy,
                fontStyle: "italic",
              }}
            >
              P. Apollo Duran
            </div>
            <div
              className="text-[9px] tracking-[0.2em] uppercase"
              style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
            >
              Founder & Principal
            </div>
          </div>
          <div
            className="text-[8px] tracking-[0.2em] uppercase text-right"
            style={{ fontFamily: "var(--pd-font-supporting)", color: muted }}
          >
            Preliminary draft<br />
            Human review required
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2 mt-1">
        <button
          className="py-3 text-[10px] tracking-[0.18em] uppercase font-semibold"
          style={{ fontFamily: "var(--pd-font-supporting)", backgroundColor: copper, color: cream }}
        >
          Generate PDF
        </button>
        <button
          className="py-3 text-[10px] tracking-[0.18em] uppercase font-semibold border"
          style={{
            fontFamily: "var(--pd-font-supporting)",
            borderColor: navy,
            color: navy,
            backgroundColor: "transparent",
          }}
        >
          Email Memo
        </button>
        <button
          className="py-3 text-[10px] tracking-[0.18em] uppercase font-semibold"
          style={{ fontFamily: "var(--pd-font-supporting)", backgroundColor: navy, color: cream }}
        >
          Submit
        </button>
      </div>

      <div
        className="text-[10px] leading-relaxed mt-1"
        style={{ color: muted, fontFamily: "var(--pd-font-sans)" }}
      >
        Memo updates as inputs change. Print, share, or sign — never an offer
        of guaranteed returns or principal protection.
      </div>
    </div>
  );
}

function MemoHead({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3">
      <div
        className="w-14 text-[9px] tracking-[0.22em] uppercase font-semibold"
        style={{ color: "var(--pd-muted)" }}
      >
        {k}
      </div>
      <div className="flex-1" style={{ color: "var(--pd-navy)" }}>
        {v}
      </div>
    </div>
  );
}

function Num({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="tabular-nums font-semibold"
      style={{ color: "var(--pd-navy)" }}
    >
      {children}
    </span>
  );
}
