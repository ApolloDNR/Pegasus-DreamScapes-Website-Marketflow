/**
 * Public, read-only view of a saved calculator analysis (any type).
 * URL: /snapshot/calc/:token — token minted when the owner flips isShared.
 */
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/use-seo";
import { Loader2, AlertCircle, ArrowRight, Calculator, FileDown, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, extractProjection, type ProjectionSpec } from "@/components/calculator-shared";
import { SendAnalysisPdfDialog } from "@/components/send-analysis-pdf-dialog";
import type { SavedAnalysis } from "@shared/schema";

const LINE_COLORS = ["#C77A3A", "#0D1B2D", "#3b82f6", "#22c55e"];

function formatProjValue(v: number, format?: string): string {
  if (format === "percent") return `${v.toFixed(1)}%`;
  if (format === "number") return v.toLocaleString();
  const abs = Math.abs(v);
  if (abs >= 1000) return `$${Math.round(v / 1000).toLocaleString()}k`;
  return `$${Math.round(v).toLocaleString()}`;
}

function ProjectionChart({ projection }: { projection: ProjectionSpec }) {
  const width = 720;
  const height = 320;
  const padding = { top: 16, right: 24, bottom: 44, left: 64 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const allPoints = projection.series.flatMap((s) => s.points);
  if (allPoints.length === 0) return null;
  const xs = allPoints.map((p) => p.year);
  const ys = allPoints.map((p) => p.value);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  let minY = Math.min(...ys, 0);
  let maxY = Math.max(...ys, 0);
  if (minY === maxY) maxY = minY + 1;
  const padY = (maxY - minY) * 0.05;
  minY -= padY;
  maxY += padY;

  const xScale = (x: number) =>
    padding.left + ((x - minX) / Math.max(1, maxX - minX)) * innerW;
  const yScale = (v: number) =>
    padding.top + innerH - ((v - minY) / (maxY - minY)) * innerH;

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => minY + ((maxY - minY) * i) / ticks);

  return (
    <div className="overflow-x-auto" data-testid="projection-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-full h-auto"
        role="img"
        aria-label={projection.title}
      >
        {yTicks.map((v, i) => {
          const yy = yScale(v);
          return (
            <g key={i}>
              <line x1={padding.left} y1={yy} x2={width - padding.right} y2={yy} stroke="#e5e5e5" strokeWidth={0.5} />
              <text x={padding.left - 8} y={yy + 4} fontSize={10} textAnchor="end" fill="#6b6b6b">
                {formatProjValue(v, projection.format)}
              </text>
            </g>
          );
        })}
        {minY < 0 && maxY > 0 && (
          <line
            x1={padding.left}
            y1={yScale(0)}
            x2={width - padding.right}
            y2={yScale(0)}
            stroke="#6b6b6b"
            strokeWidth={0.75}
          />
        )}
        {projection.series[0]?.points.map((p, i) => {
          const x = xScale(p.year);
          return (
            <text key={i} x={x} y={height - padding.bottom + 16} fontSize={10} textAnchor="middle" fill="#6b6b6b">
              Yr {p.year}
            </text>
          );
        })}
        {projection.series.map((s, idx) => {
          const color = LINE_COLORS[idx % LINE_COLORS.length];
          const path = s.points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.year)} ${yScale(p.value)}`)
            .join(" ");
          return (
            <g key={s.name}>
              <path d={path} fill="none" stroke={color} strokeWidth={2} />
              {s.points.map((p, i) => (
                <circle key={i} cx={xScale(p.year)} cy={yScale(p.value)} r={3} fill={color} />
              ))}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
        {projection.series.map((s, idx) => (
          <div key={s.name} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-1 rounded"
              style={{ backgroundColor: LINE_COLORS[idx % LINE_COLORS.length] }}
            />
            {s.name}
          </div>
        ))}
      </div>
    </div>
  );
}

const CALC_LABELS: Record<string, string> = {
  arv: "ARV / Flip",
  roi: "Investment ROI",
  brrrr: "BRRRR",
  cashflow: "Cash Flow",
  mao: "Wholesale (MAO)",
  piti: "Mortgage / PITI",
  ownvsrent: "Own vs Rent",
  hardmoney: "Hard Money",
};

function formatValue(k: string, v: unknown): string {
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") {
    const isPct =
      /rate|return|roi|cashOnCash|capRate|expenseRatio|appreciation|growth|ltv|vacancy|crossover/i.test(
        k,
      );
    if (isPct && Math.abs(v) < 200) return `${v.toFixed(2)}%`;
    return formatCurrency(v);
  }
  if (v == null) return "—";
  return String(v);
}

function humanLabel(k: string): string {
  return k
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export default function SnapshotCalc() {
  const [, params] = useRoute("/snapshot/calc/:token");
  const token = params?.token ?? "";
  const [pdfBusy, setPdfBusy] = useState(false);
  const { toast } = useToast();

  const downloadPdf = async (name: string) => {
    try {
      setPdfBusy(true);
      const res = await fetch(`/api/pdf/calculator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareToken: token }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safe = name.replace(/[^a-zA-Z0-9-_]+/g, "-").slice(0, 60) || "analysis";
      link.download = `pegasus-${safe}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Could not generate PDF", variant: "destructive" });
    } finally {
      setPdfBusy(false);
    }
  };

  useSEO({
    title: "Strategy Snapshot: Calculator",
    description:
      "A read-only strategy snapshot from the Pegasus Dreamscapes calculator suite.",
    noIndex: true,
  });

  const { data, isLoading, isError } = useQuery<SavedAnalysis>({
    queryKey: ["/api/shared-analyses", token],
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="min-h-screen pt-32 px-6">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto" />
          <h1 className="font-serif text-3xl font-semibold">Snapshot not found</h1>
          <p className="text-muted-foreground">
            This share link is no longer active. The owner may have removed it.
          </p>
          <Link href="/calculators">
            <Button>Open the calculators</Button>
          </Link>
        </div>
      </div>
    );
  }

  const inputs = (data.inputs ?? {}) as Record<string, unknown>;
  const results = (data.results ?? {}) as Record<string, unknown>;
  const projection = extractProjection(results);
  const calcLabel = CALC_LABELS[data.calculatorType] ?? data.calculatorType.toUpperCase();

  return (
    <div className="min-h-screen pt-24 pb-20">
      <section className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-10 bg-primary/60" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
              Strategy Snapshot
            </p>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-normal leading-[1.05] mb-3">
            {data.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="outline">{calcLabel}</Badge>
            {data.dealGrade && <Badge variant="outline">Grade {data.dealGrade}</Badge>}
            <span>
              Shared {data.sharedAt ? new Date(data.sharedAt as unknown as string).toLocaleDateString() : ""}
            </span>
            {typeof data.viewCount === "number" && data.viewCount > 0 && (
              <span>· {data.viewCount} views</span>
            )}
          </div>
          {data.primaryMetric && (
            <div className="mt-8 flex items-baseline gap-4">
              <span className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                {data.primaryMetric}
              </span>
              <span className="font-serif text-5xl font-semibold tabular-nums text-primary">
                {data.primaryValue}
              </span>
            </div>
          )}
          {data.notes && (
            <p className="mt-6 text-base text-muted-foreground italic max-w-2xl">"{data.notes}"</p>
          )}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
              Inputs
            </p>
            <dl className="space-y-2.5">
              {Object.entries(inputs).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 text-sm">
                  <dt className="text-muted-foreground">{humanLabel(k)}</dt>
                  <dd className="font-medium tabular-nums text-right">{formatValue(k, v)}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
              Results
            </p>
            <dl className="space-y-2.5">
              {Object.entries(results)
                .filter(([k, v]) => !k.startsWith("__") && (v === null || typeof v !== "object"))
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 text-sm">
                    <dt className="text-muted-foreground">{humanLabel(k)}</dt>
                    <dd className="font-medium tabular-nums text-right">{formatValue(k, v)}</dd>
                  </div>
                ))}
            </dl>
          </CardContent>
        </Card>
      </section>

      {projection && (
        <section className="max-w-4xl mx-auto px-6 pb-12">
          <Card>
            <CardContent className="p-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-2">
                Projection
              </p>
              <h2 className="font-serif text-2xl font-semibold tracking-tight leading-tight mb-4">
                {projection.title}
              </h2>
              <ProjectionChart projection={projection} />
              <p className="text-xs text-muted-foreground italic mt-4">
                Illustrative projection. Assumes default rent / appreciation growth rates and is not a forecast.
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      <section className="max-w-3xl mx-auto px-6 pt-4 pb-16 text-center">
        <p className="text-xs text-muted-foreground italic mb-6">
          Illustrative math only. Not investment advice and not an offer.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="secondary"
            className="gap-2"
            onClick={() => downloadPdf(data.name)}
            disabled={pdfBusy}
            data-testid="button-snapshot-pdf"
          >
            {pdfBusy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            Download PDF
          </Button>
          <SendAnalysisPdfDialog
            shareToken={token}
            analysisName={data.name}
            trigger={
              <Button
                variant="secondary"
                className="gap-2"
                data-testid="button-snapshot-send-pdf"
              >
                <Send className="w-4 h-4" />
                Send PDF
              </Button>
            }
          />
          <Link href="/strategy-lab/classic">
            <Button className="gap-2" data-testid="button-snapshot-run-your-own">
              <Calculator className="w-4 h-4" />
              Run your own
            </Button>
          </Link>
          <Link href="/submit?intent=snapshot">
            <Button variant="outline" className="gap-2" data-testid="button-snapshot-submit">
              Submit a property
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
