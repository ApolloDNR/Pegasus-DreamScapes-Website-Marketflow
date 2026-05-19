/**
 * Branded recharts wrappers used across the calculator suite.
 * Colors pull from CSS vars so dark mode and theme swaps just work.
 */
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  Tooltip as RTooltip,
  Legend,
  ReferenceLine,
} from "recharts";

export const BRAND_CHART_COLORS = {
  copper: "hsl(var(--copper))",
  navy: "hsl(var(--navy))",
  cream: "hsl(var(--cream))",
  copperSoft: "hsl(var(--copper) / 0.45)",
  navySoft: "hsl(var(--navy) / 0.45)",
  muted: "hsl(var(--muted-foreground) / 0.6)",
  border: "hsl(var(--border))",
  destructive: "hsl(var(--destructive))",
  success: "hsl(150 55% 38%)",
};

export function formatUSD(n: number, opts?: { compact?: boolean }) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: opts?.compact ? "compact" : "standard",
    maximumFractionDigits: 0,
  }).format(n);
}

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontFamily: "var(--font-sans)",
  fontSize: 12,
  color: "hsl(var(--foreground))",
};

const axisProps = {
  stroke: "hsl(var(--muted-foreground) / 0.6)",
  tick: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
  tickLine: false,
  axisLine: { stroke: "hsl(var(--border))" },
};

// ──────────────────────────────────────────────────────────────────────────
// Donut: investment / cost breakdown
// ──────────────────────────────────────────────────────────────────────────

export interface DonutDatum {
  name: string;
  value: number;
  fill?: string;
}

export function BrandDonutChart({ data, height = 200 }: { data: DonutDatum[]; height?: number }) {
  const palette = [
    BRAND_CHART_COLORS.copper,
    BRAND_CHART_COLORS.navy,
    BRAND_CHART_COLORS.copperSoft,
    BRAND_CHART_COLORS.navySoft,
    BRAND_CHART_COLORS.muted,
  ];
  const filtered = data.filter((d) => d.value > 0);
  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center text-xs text-muted-foreground" style={{ height }}>
        Enter values to see breakdown
      </div>
    );
  }
  return (
    <div style={{ width: "100%", height }} data-testid="chart-donut">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={filtered}
            cx="42%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            animationDuration={600}
          >
            {filtered.map((entry, i) => (
              <Cell key={i} fill={entry.fill || palette[i % palette.length]} />
            ))}
          </Pie>
          <RTooltip
            formatter={(v: number) => formatUSD(v)}
            contentStyle={tooltipStyle}
          />
          <Legend
            verticalAlign="middle"
            align="right"
            layout="vertical"
            iconSize={10}
            formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Stacked bar: scenario comparison
// ──────────────────────────────────────────────────────────────────────────

export interface ScenarioBarDatum {
  scenario: string;
  monthlyCashFlow: number;
}

export function ScenarioBarChart({ data, height = 220 }: { data: ScenarioBarDatum[]; height?: number }) {
  return (
    <div style={{ width: "100%", height }} data-testid="chart-scenario-bar">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="scenario" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={(v) => formatUSD(v, { compact: true })} />
          <RTooltip
            formatter={(v: number) => formatUSD(v)}
            contentStyle={tooltipStyle}
            cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
          />
          <ReferenceLine y={0} stroke={BRAND_CHART_COLORS.muted} />
          <Bar dataKey="monthlyCashFlow" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={
                  d.monthlyCashFlow >= 0
                    ? BRAND_CHART_COLORS.copper
                    : BRAND_CHART_COLORS.destructive
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Two-line crossover (own vs rent)
// ──────────────────────────────────────────────────────────────────────────

export interface CrossoverDatum {
  year: number;
  ownNetWorth: number;
  rentNetWorth: number;
}

export function CrossoverLineChart({
  data,
  crossoverYear,
  height = 280,
}: {
  data: CrossoverDatum[];
  crossoverYear: number | null;
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }} data-testid="chart-crossover">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 12, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" {...axisProps} tickFormatter={(v) => `Y${v}`} />
          <YAxis {...axisProps} tickFormatter={(v) => formatUSD(v, { compact: true })} />
          <RTooltip
            formatter={(v: number, n: string) => [formatUSD(v), n === "ownNetWorth" ? "Own" : "Rent + Invest"]}
            labelFormatter={(l) => `Year ${l}`}
            contentStyle={tooltipStyle}
          />
          <Legend
            iconSize={10}
            formatter={(v) => (
              <span className="text-xs text-muted-foreground">
                {v === "ownNetWorth" ? "Own (equity)" : "Rent + invest difference"}
              </span>
            )}
          />
          {crossoverYear !== null && (
            <ReferenceLine
              x={crossoverYear}
              stroke={BRAND_CHART_COLORS.copper}
              strokeDasharray="4 4"
              label={{
                value: `Crossover Y${crossoverYear}`,
                fill: BRAND_CHART_COLORS.copper,
                fontSize: 11,
                position: "top",
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="ownNetWorth"
            stroke={BRAND_CHART_COLORS.copper}
            strokeWidth={2.5}
            dot={false}
            animationDuration={600}
          />
          <Line
            type="monotone"
            dataKey="rentNetWorth"
            stroke={BRAND_CHART_COLORS.navy}
            strokeWidth={2.5}
            dot={false}
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Equity / cash flow projection (exit scenarios)
// ──────────────────────────────────────────────────────────────────────────

export interface EquityProjectionDatum {
  year: number;
  equity: number;
  cumulativeCashFlow: number;
}

export function EquityProjectionChart({
  data,
  height = 240,
}: {
  data: EquityProjectionDatum[];
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }} data-testid="chart-equity-projection">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <defs>
            <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND_CHART_COLORS.copper} stopOpacity={0.45} />
              <stop offset="100%" stopColor={BRAND_CHART_COLORS.copper} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="cashFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND_CHART_COLORS.navy} stopOpacity={0.4} />
              <stop offset="100%" stopColor={BRAND_CHART_COLORS.navy} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" {...axisProps} tickFormatter={(v) => `Y${v}`} />
          <YAxis {...axisProps} tickFormatter={(v) => formatUSD(v, { compact: true })} />
          <RTooltip
            formatter={(v: number, n: string) => [
              formatUSD(v),
              n === "equity" ? "Equity" : "Cumulative cash flow",
            ]}
            labelFormatter={(l) => `Year ${l}`}
            contentStyle={tooltipStyle}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke={BRAND_CHART_COLORS.copper}
            fill="url(#equityFill)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="cumulativeCashFlow"
            stroke={BRAND_CHART_COLORS.navy}
            fill="url(#cashFill)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Amortization (principal vs interest stacked over months)
// ──────────────────────────────────────────────────────────────────────────

export interface AmortDatum {
  year: number;
  principal: number;
  interest: number;
}

export function AmortStackChart({ data, height = 220 }: { data: AmortDatum[]; height?: number }) {
  return (
    <div style={{ width: "100%", height }} data-testid="chart-amortization">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" {...axisProps} tickFormatter={(v) => `Y${v}`} />
          <YAxis {...axisProps} tickFormatter={(v) => formatUSD(v, { compact: true })} />
          <RTooltip
            formatter={(v: number) => formatUSD(v)}
            labelFormatter={(l) => `Year ${l}`}
            contentStyle={tooltipStyle}
            cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
          />
          <Legend
            iconSize={10}
            formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>}
          />
          <Bar dataKey="principal" stackId="a" fill={BRAND_CHART_COLORS.copper} name="Principal" />
          <Bar dataKey="interest" stackId="a" fill={BRAND_CHART_COLORS.navy} name="Interest" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
