/**
 * Strategy Fit Board — all 9 lanes as horizontal fit bars with pillar markers.
 *
 * Confidence score → bar fill rendered as a band (low/mid/high) rather than
 * a hard point. Verdict colors:
 *   strong → copper, possible → tan, weak → muted, not_recommended → grey,
 *   needs_more_data → dashed outline only.
 *
 * Pillar badge (D/I/S) sits to the left of every lane label and routes each
 * lane to its parent pillar in the Three Pillars doctrine.
 */
import type { LaneFitResult, StrategyLane } from "@shared/strategy-lab";
import { LANE_PILLARS, PILLAR_LABELS, type StrategyPillar } from "@shared/strategy-lab/types";

interface Props {
  lanes: LaneFitResult[];
  topLane: string;
  onSelect?: (lane: string) => void;
  selected?: string;
}

const VERDICT_FILL: Record<string, string> = {
  strong: "hsl(var(--copper))",
  possible: "hsl(var(--bronze-soft))",
  weak: "hsl(var(--rule))",
  not_recommended: "hsl(var(--muted))",
  needs_more_data: "transparent",
};

const VERDICT_LABEL_TONE: Record<string, string> = {
  strong: "text-[hsl(var(--copper))]",
  possible: "text-[hsl(var(--ink))]",
  weak: "text-[hsl(var(--muted-text))]",
  not_recommended: "text-[hsl(var(--muted-text))]",
  needs_more_data: "text-[hsl(var(--muted-text))]",
};

const PILLAR_TONE: Record<StrategyPillar, string> = {
  D: "border-[hsl(var(--copper))] text-[hsl(var(--copper))]",
  I: "border-[hsl(var(--ink))] text-[hsl(var(--ink))]",
  S: "border-[hsl(var(--muted-text))] text-[hsl(var(--muted-text))]",
};

export function StrategyFitBoard({ lanes, topLane, onSelect, selected }: Props) {
  return (
    <div className="space-y-2" data-testid="strategy-fit-board">
      {lanes.map((l) => {
        const pct = Math.max(0, Math.min(100, l.confidence.score));
        // Render score as a small confidence BAND (±7) instead of a single
        // point so the UI honors the "confidence ≠ point estimate" doctrine.
        const bandLow = Math.max(0, pct - 7);
        const bandHigh = Math.min(100, pct + 7);
        const bandWidth = bandHigh - bandLow;
        const isTop = l.lane === topLane;
        const isSelected = selected === l.lane;
        const pillar = LANE_PILLARS[l.lane as StrategyLane];
        return (
          <button
            key={l.lane}
            type="button"
            onClick={() => onSelect?.(l.lane)}
            className={`w-full text-left p-3 border transition-colors ${
              isSelected
                ? "border-[hsl(var(--copper))] bg-[hsl(var(--copper)/0.04)]"
                : "border-[hsl(var(--rule))] hover:bg-[hsl(var(--ink)/0.02)]"
            }`}
            data-testid={`fit-lane-${l.lane}`}
            title={`Pillar: ${PILLAR_LABELS[pillar]}`}
          >
            <div className="flex items-baseline justify-between gap-3 mb-1.5">
              <div className="flex items-baseline gap-2 min-w-0">
                <span
                  className={`inline-flex items-center justify-center w-4 h-4 border text-[9px] font-supporting font-bold leading-none shrink-0 ${PILLAR_TONE[pillar]}`}
                  data-testid={`pillar-badge-${l.lane}`}
                  aria-label={`Pillar: ${PILLAR_LABELS[pillar]}`}
                >
                  {pillar}
                </span>
                <span className="font-sans text-sm font-semibold text-foreground truncate">
                  {l.laneLabel}
                </span>
                {isTop && (
                  <span className="text-[9px] uppercase tracking-[0.18em] font-supporting font-bold text-[hsl(var(--copper))]">
                    Top
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] uppercase tracking-[0.16em] font-supporting font-semibold whitespace-nowrap ${VERDICT_LABEL_TONE[l.verdict]}`}
              >
                {l.verdictLabel}
              </span>
            </div>
            <svg viewBox="0 0 100 4" preserveAspectRatio="none" className="w-full h-1.5">
              <rect x={0} y={0} width={100} height={4} fill="hsl(var(--rule))" opacity={0.4} />
              {l.verdict === "needs_more_data" ? (
                <rect
                  x={0}
                  y={0}
                  width={100}
                  height={4}
                  fill="none"
                  stroke="hsl(var(--rule))"
                  strokeDasharray="2 2"
                  strokeWidth={1}
                />
              ) : (
                <>
                  {/* Soft band — full confidence range with low opacity. */}
                  <rect
                    x={bandLow}
                    y={0}
                    width={bandWidth}
                    height={4}
                    fill={VERDICT_FILL[l.verdict] ?? "hsl(var(--rule))"}
                    opacity={0.35}
                  />
                  {/* Solid bar — point score within the band. */}
                  <rect
                    x={0}
                    y={1}
                    width={pct}
                    height={2}
                    fill={VERDICT_FILL[l.verdict] ?? "hsl(var(--rule))"}
                  />
                </>
              )}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
