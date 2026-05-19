import { WorkbenchChassis } from "./_ChassisV2";
import "./_group.css";

/**
 * Verdict-as-Dialogue.
 * The answer is a conversation. Peggy reasons aloud with you. She
 * references your inputs, surfaces tradeoffs, lets you push back. The
 * trust signal isn't a confidence ring — it's that you watched her think.
 */

export function WorkbenchDialogue() {
  return <WorkbenchChassis verdict={<DialogueVerdict />} />;
}

function DialogueVerdict() {
  const navy = "var(--pd-navy)";
  const copper = "var(--pd-copper)";
  const cream = "var(--pd-cream)";
  const muted = "var(--pd-muted)";

  return (
    <div
      className="rounded-sm overflow-hidden flex flex-col"
      style={{ backgroundColor: navy, color: cream, minHeight: "100%" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <PeggyAvatar />
          <div>
            <div
              className="text-[12px] leading-tight"
              style={{ fontFamily: "var(--pd-font-serif)", fontWeight: 600 }}
            >
              Peggy
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: "#5fbf7f", boxShadow: "0 0 4px #5fbf7f" }}
              />
              <div
                className="text-[9px] tracking-[0.2em] uppercase"
                style={{
                  fontFamily: "var(--pd-font-supporting)",
                  color: "rgba(246,239,228,0.55)",
                }}
              >
                Reasoning · live
              </div>
            </div>
          </div>
        </div>
        <div
          className="text-[9px] tracking-[0.2em] uppercase"
          style={{ fontFamily: "var(--pd-font-supporting)", color: "rgba(246,239,228,0.45)" }}
        >
          Stage 3 of 8
        </div>
      </div>

      {/* Anchor verdict pill — always at top so the answer is visible */}
      <div
        className="px-5 py-3 border-b border-white/10 flex items-center gap-3"
        style={{ backgroundColor: "rgba(199,122,58,0.08)" }}
      >
        <div
          className="w-1 h-8 rounded-sm"
          style={{ backgroundColor: copper }}
        />
        <div className="flex-1">
          <div
            className="text-[9px] tracking-[0.25em] uppercase font-semibold"
            style={{ fontFamily: "var(--pd-font-supporting)", color: copper }}
          >
            Current Read
          </div>
          <div
            className="text-[14px]"
            style={{ fontFamily: "var(--pd-font-serif)", fontWeight: 500 }}
          >
            BRRRR · 72% confidence · $40k left in, $1,240/mo
          </div>
        </div>
      </div>

      {/* Thread */}
      <div className="px-5 py-5 flex-1 flex flex-col gap-5 overflow-y-auto">
        <PeggyMsg ts="just now">
          Okay — at <Hl>$425k</Hl> asking and <Hl>$65k</Hl> of rehab, your
          all-in lands near <Hl>$498k</Hl>. That's <Hl>18% below</Hl> your
          ARV target.
        </PeggyMsg>

        <PeggyMsg ts="just now">
          That spread is meaningful. A conventional <Hl>75% refi</Hl> pulls
          <Hl> $458k</Hl> back, leaving <Hl>$40k</Hl> in the deal — small
          enough to be a real BRRRR, not a "BRRRR-ish hold."
        </PeggyMsg>

        <PeggyMsg ts="just now">
          So my read is <Hl>BRRRR, refi-and-hold</Hl>. Cash flow looks like{" "}
          <Hl>$1,240/mo</Hl> at conservative rent, DSCR <Hl>1.42</Hl>.
        </PeggyMsg>

        <PeggyMsg ts="just now" thinking>
          Two things I'd want to firm before you offer:
          <ul className="mt-2 ml-3 space-y-1.5 list-none">
            <ListDot>
              Only <Hl>3 closed comps</Hl> within 0.5mi — I'd prefer 5 before
              committing to the ARV.
            </ListDot>
            <ListDot>
              1985 build means plumbing and electrical are unknowns. I'd
              pad rehab by <Hl>10%</Hl> until you walk it.
            </ListDot>
          </ul>
        </PeggyMsg>

        <PeggyMsg ts="just now" suggest>
          Want to stress-test it? Or move on to Comps and I'll firm the
          confidence band?
        </PeggyMsg>

        {/* Action suggestions Peggy offers */}
        <div className="flex flex-wrap gap-2 -mt-2">
          <SuggestChip label="Drop offer to $410k — what happens?" />
          <SuggestChip label="What if ARV is really $585k?" />
          <SuggestChip label="Compare against Flip lane" />
          <SuggestChip label="Next: Comps →" primary />
        </div>
      </div>

      {/* Composer */}
      <div
        className="px-5 py-4 border-t border-white/10"
        style={{ backgroundColor: "rgba(0,0,0,0.18)" }}
      >
        <div
          className="flex items-end gap-2 p-3 rounded-sm"
          style={{ backgroundColor: "rgba(246,239,228,0.06)", border: "1px solid rgba(246,239,228,0.15)" }}
        >
          <textarea
            placeholder="Push back, ask follow-ups, or refine numbers…"
            className="flex-1 bg-transparent focus:outline-none resize-none text-[13px] leading-snug placeholder:text-white/30"
            style={{ color: cream, fontFamily: "var(--pd-font-sans)" }}
            rows={2}
            defaultValue=""
          />
          <button
            className="text-[10px] tracking-[0.18em] uppercase font-semibold px-3 py-2 self-end"
            style={{ fontFamily: "var(--pd-font-supporting)", backgroundColor: copper, color: cream }}
          >
            Send
          </button>
        </div>

        {/* Hand-off actions */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            className="py-2.5 text-[10px] tracking-[0.18em] uppercase font-semibold border"
            style={{
              fontFamily: "var(--pd-font-supporting)",
              borderColor: "rgba(246,239,228,0.3)",
              color: cream,
            }}
          >
            Save transcript
          </button>
          <button
            className="py-2.5 text-[10px] tracking-[0.18em] uppercase font-semibold"
            style={{ fontFamily: "var(--pd-font-supporting)", backgroundColor: copper, color: cream }}
          >
            Submit to Pegasus
          </button>
        </div>

        <div
          className="text-[10px] leading-relaxed mt-3"
          style={{
            color: "rgba(246,239,228,0.5)",
            fontFamily: "var(--pd-font-sans)",
          }}
        >
          Peggy's read is preliminary. Human review required before any
          offer, strategy release, or execution decision.
        </div>
      </div>
    </div>
  );
}

function PeggyAvatar() {
  const copper = "var(--pd-copper)";
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center relative"
      style={{
        background: `radial-gradient(circle at 30% 30%, ${copper} 0%, #8a4d24 100%)`,
        boxShadow: "0 0 0 2px rgba(246,239,228,0.12)",
      }}
    >
      <div
        className="text-[14px]"
        style={{
          fontFamily: "var(--pd-font-display)",
          color: "var(--pd-cream)",
          letterSpacing: "0.05em",
        }}
      >
        P
      </div>
    </div>
  );
}

function PeggyMsg({
  children, ts, thinking, suggest,
}: { children: React.ReactNode; ts: string; thinking?: boolean; suggest?: boolean }) {
  const copper = "var(--pd-copper)";
  return (
    <div className="flex gap-2.5">
      <div className="w-1 flex-shrink-0">
        <div
          className="w-1 h-full rounded-sm"
          style={{
            backgroundColor: suggest ? copper : thinking ? "rgba(199,122,58,0.6)" : "rgba(246,239,228,0.15)",
          }}
        />
      </div>
      <div className="flex-1">
        <div
          className="text-[13.5px] leading-[1.6]"
          style={{
            fontFamily: "var(--pd-font-serif)",
            color: "rgba(246,239,228,0.92)",
            fontStyle: suggest ? "italic" : "normal",
          }}
        >
          {children}
        </div>
        <div
          className="text-[9px] tracking-[0.2em] uppercase mt-1.5"
          style={{
            fontFamily: "var(--pd-font-supporting)",
            color: "rgba(246,239,228,0.35)",
          }}
        >
          Peggy · {ts}
          {thinking && (
            <span className="ml-2 italic" style={{ letterSpacing: 0, color: "rgba(199,122,58,0.7)" }}>
              ↳ flagging risk
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Hl({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="tabular-nums font-semibold"
      style={{ color: "var(--pd-copper)" }}
    >
      {children}
    </span>
  );
}

function ListDot({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span
        className="mt-2 w-1 h-1 rounded-full flex-shrink-0"
        style={{ backgroundColor: "var(--pd-copper)" }}
      />
      <span>{children}</span>
    </li>
  );
}

function SuggestChip({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <button
      className="px-3 py-1.5 text-[11px] rounded-sm border"
      style={{
        fontFamily: "var(--pd-font-sans)",
        borderColor: primary ? "var(--pd-copper)" : "rgba(246,239,228,0.2)",
        color: primary ? "var(--pd-copper)" : "rgba(246,239,228,0.8)",
        backgroundColor: primary ? "rgba(199,122,58,0.1)" : "transparent",
        fontWeight: primary ? 600 : 400,
      }}
    >
      {label}
    </button>
  );
}
