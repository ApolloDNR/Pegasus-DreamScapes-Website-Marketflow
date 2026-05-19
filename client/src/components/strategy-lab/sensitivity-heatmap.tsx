/**
 * Sensitivity Heatmap — custom SVG color grid.
 *
 * Cells colored on a copper (positive / pass) → muted (neutral) → red-warm
 * (negative / fail) ramp. Center cell is the base case and is outlined.
 */
import type { SensitivityGrid } from "@shared/strategy-lab";
import { fmtDollars } from "@shared/strategy-lab";

interface Props {
  grid: SensitivityGrid;
}

function cellColor(v: number, max: number): string {
  if (max <= 0) return "hsl(var(--muted))";
  const ratio = Math.max(-1, Math.min(1, v / max));
  if (ratio >= 0) {
    // copper at ratio=1 → cream at 0
    const alpha = 0.12 + ratio * 0.55;
    return `hsl(27 56% 50% / ${alpha.toFixed(2)})`;
  }
  // negative — warm red
  const alpha = 0.12 + Math.abs(ratio) * 0.55;
  return `hsl(8 65% 50% / ${alpha.toFixed(2)})`;
}

export function SensitivityHeatmap({ grid }: Props) {
  const cols = grid.xAxis.values.length;
  const rows = grid.yAxis.values.length;
  if (cols === 0 || rows === 0) return null;
  const cellW = 100 / cols;
  const cellH = 100 / rows;
  const max = Math.max(...grid.cells.map((c: number) => Math.abs(c)));
  const baseCol = Math.floor(cols / 2);
  const baseRow = Math.floor(rows / 2);

  function fmtAxis(v: number, unit: string): string {
    if (unit === "currency") return v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`;
    if (unit === "percent") return `${v}%`;
    return String(v);
  }

  return (
    <div className="space-y-2" data-testid="sensitivity-heatmap">
      <div className="flex items-baseline justify-between">
        <div className="text-[10px] uppercase tracking-[0.18em] font-supporting font-semibold text-muted-foreground">
          {grid.yAxis.label} × {grid.xAxis.label}
        </div>
        <div className="text-[10px] font-supporting text-muted-foreground">
          {grid.metric === "monthly_cash_flow"
            ? "monthly cash flow"
            : grid.metric === "cash_left_in"
              ? "cash left in"
              : "net profit"}
        </div>
      </div>
      <div className="flex gap-2">
        {/* Y axis labels */}
        <div
          className="flex flex-col justify-between text-[9px] tabular-nums text-muted-foreground py-0.5 pr-1 border-r border-[hsl(var(--rule))]"
          style={{ minWidth: 36 }}
        >
          {[...grid.yAxis.values].reverse().map((v, i) => (
            <div key={i} className="text-right leading-none">
              {fmtAxis(v, grid.yAxis.unit)}
            </div>
          ))}
        </div>
        {/* Grid */}
        <div className="flex-1">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full"
            style={{ height: rows * 32 }}
          >
            {grid.cells.map((v: number, idx: number) => {
              const r = Math.floor(idx / cols);
              const c = idx % cols;
              // Display top-down with first row at top of grid (high values).
              const renderRow = rows - 1 - r;
              return (
                <g key={idx}>
                  <rect
                    x={c * cellW}
                    y={renderRow * cellH}
                    width={cellW}
                    height={cellH}
                    fill={cellColor(v, max)}
                    stroke={
                      r === baseRow && c === baseCol
                        ? "hsl(var(--ink))"
                        : "hsl(var(--background))"
                    }
                    strokeWidth={r === baseRow && c === baseCol ? 1.5 : 0.5}
                  />
                  <text
                    x={c * cellW + cellW / 2}
                    y={renderRow * cellH + cellH / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={2.6}
                    fontFamily="var(--font-sans)"
                    fontWeight={r === baseRow && c === baseCol ? 700 : 500}
                    fill="hsl(var(--ink))"
                  >
                    {v >= 1000 || v <= -1000 ? `${(v / 1000).toFixed(0)}k` : v}
                  </text>
                </g>
              );
            })}
          </svg>
          {/* X axis labels */}
          <div className="flex justify-between text-[9px] tabular-nums text-muted-foreground pt-1 mt-1 border-t border-[hsl(var(--rule))]">
            {grid.xAxis.values.map((v: number, i: number) => (
              <div key={i} className="leading-none">
                {fmtAxis(v, grid.xAxis.unit)}
              </div>
            ))}
          </div>
        </div>
      </div>
      {grid.baseFails && (
        <div className="text-[11px] text-[hsl(8_65%_38%)] font-supporting">
          Base case currently breaks this lane. Adjust inputs to recover.
        </div>
      )}
      <div className="text-[10px] text-muted-foreground">
        Center cell ({fmtDollars(grid.cells[baseRow * cols + baseCol] ?? 0)}) is the base case.
      </div>
    </div>
  );
}
