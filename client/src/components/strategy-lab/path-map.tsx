/**
 * Pegasus Path Map — signature horizontal node-flow SVG.
 *
 * Eight nodes light up as the user populates each input group. Click a
 * node to scroll to its input section. Custom SVG (no chart lib).
 */
import type { ReactNode } from "react";

export interface PathNode {
  id: string;
  label: string;
  active: boolean;
  /** id of the DOM section to scroll to */
  scrollTo?: string;
}

interface Props {
  nodes: PathNode[];
}

export function PathMap({ nodes }: Props) {
  // Labels are centered under each node and the longest ("STRATEGY PATHS",
  // "NEXT STEP") render ~140px wide at fontSize 11 + 0.12em letter-spacing.
  // Pad must reserve at least half-the-widest-label so the first and last
  // labels don't get clipped at the SVG edges (was 28 → "ROPERTY" / "NEXT STE").
  const w = 1200;
  const h = 96;
  const pad = 88;
  const usable = w - pad * 2;
  const step = nodes.length > 1 ? usable / (nodes.length - 1) : 0;

  function handleClick(n: PathNode) {
    if (!n.scrollTo) return;
    const el = document.getElementById(n.scrollTo);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div
      className="border-y border-[hsl(var(--rule))] py-6 bg-background"
      data-testid="strategy-lab-path-map"
    >
      <div className="px-6 mb-3 text-[10px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold">
        Pegasus Path Map
      </div>
      <div className="overflow-x-auto px-6 pr-20 lg:pr-24">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          width="100%"
          preserveAspectRatio="xMidYMid meet"
          className="min-w-[860px] block"
          role="img"
          aria-label="Pegasus Path Map"
        >
          {/* Connecting hairline */}
          <line
            x1={pad}
            y1={h / 2}
            x2={w - pad}
            y2={h / 2}
            stroke="hsl(var(--rule))"
            strokeWidth={1}
          />
          {/* Active progress overlay */}
          {(() => {
            const lastActive = nodes
              .map((n, i) => ({ n, i }))
              .filter(({ n }) => n.active)
              .map(({ i }) => i)
              .pop();
            if (lastActive == null || lastActive < 0) return null;
            return (
              <line
                x1={pad}
                y1={h / 2}
                x2={pad + step * lastActive}
                y2={h / 2}
                stroke="hsl(var(--copper))"
                strokeWidth={2}
              />
            );
          })()}
          {nodes.map((n, i) => {
            const cx = pad + step * i;
            const cy = h / 2;
            return (
              <g
                key={n.id}
                style={{ cursor: n.scrollTo ? "pointer" : "default" }}
                onClick={() => handleClick(n)}
                data-testid={`path-node-${n.id}`}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={n.active ? 9 : 6}
                  fill={n.active ? "hsl(var(--copper))" : "hsl(var(--background))"}
                  stroke={n.active ? "hsl(var(--copper))" : "hsl(var(--rule))"}
                  strokeWidth={n.active ? 0 : 1.5}
                />
                {n.active && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={14}
                    fill="none"
                    stroke="hsl(var(--copper))"
                    strokeOpacity={0.25}
                    strokeWidth={1}
                  />
                )}
                <text
                  x={cx}
                  y={cy + 30}
                  textAnchor="middle"
                  fontSize={11}
                  fontFamily="var(--font-supporting)"
                  fontWeight={600}
                  letterSpacing="0.12em"
                  fill={n.active ? "hsl(var(--ink))" : "hsl(var(--muted-text))"}
                  style={{ textTransform: "uppercase" }}
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function pathBadge(active: boolean): ReactNode {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${
        active ? "bg-[hsl(var(--copper))]" : "bg-[hsl(var(--rule))]"
      }`}
    />
  );
}
