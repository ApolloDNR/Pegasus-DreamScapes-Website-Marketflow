/**
 * Public Strategy Snapshot view (Task #84).
 *
 * Routed at /snapshot/property/:token. Renders a tier-aware view of a shared
 * property analysis. Summary tier shows a modeled path + summary only; full
 * tier shows numbers, risk, capital stack, and sensitivity. PDF + OG card
 * are minted from the same token.
 */
import { useMemo } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Download, ArrowRight, AlertTriangle, ShieldCheck } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import type { StrategySnapshot, LaneFitResult, RiskFlag, CapitalStackEntry } from "@shared/strategy-lab/types";

interface SharedPropertyInput {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  askingPrice?: number | null;
  arvEstimate?: number | null;
  rehabBudget?: number | null;
  marketRent?: number | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
}

interface SharedAnalysis {
  id?: number;
  visibility: "summary" | "full";
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  propertyInput?: SharedPropertyInput;
  snapshot?: Partial<StrategySnapshot>;
  createdAt?: string;
  outputContext: {
    source: "user_entered_inputs_and_automated_model";
    verifiedByPegasus: false;
    label: string;
    disclaimer: string;
  };
}

function modelFitLabel(value: unknown): string {
  return String(value ?? "Needs more data")
    .replace(/^Automated model fit:\s*/i, "")
    .trim() || "Needs more data";
}

// The snapshot mixes a permanent navy hero with theme-adaptive editorial
// surfaces. The global copper token is intentionally darker in light mode,
// which is appropriate on paper but not legible as small text on navy. Keep
// the two contrast roles explicit and local to this functional share view.
const HERO_ACCENT_CLASS = "text-[#D89A63]";
const BODY_ACCENT_CLASS = "text-[#965025] dark:text-[#D89A63]";
const ACTION_CLASS = "bg-[#965025] text-white dark:bg-[#D89A63] dark:text-[#17233A]";

export default function SnapshotPropertyPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const { data, isLoading, isError } = useQuery<SharedAnalysis>({
    queryKey: ["/api/property-analyses/by-token", token],
  });

  const snap: Partial<StrategySnapshot> = data?.snapshot ?? {};
  const lanes: LaneFitResult[] = snap.lanes ?? [];
  const topLane = lanes.find((l) => l.lane === snap.topLane) ?? lanes[0];
  const isFull = data?.visibility === "full";
  const addr = data?.address || data?.propertyInput?.address || "Property Strategy Snapshot";
  const sub = [data?.city, data?.state, data?.zip].filter(Boolean).join(", ");

  useSEO({
    title: addr
      ? `Strategy Snapshot · ${addr} · Pegasus Dreamscapes`
      : "Strategy Snapshot · Pegasus Dreamscapes",
    description: "Automated model output generated from user-entered, unverified property inputs.",
    image: token ? `/og/snapshot/${token}` : undefined,
    noIndex: true,
    noCanonical: true,
  });

  const fmtMoney = useMemo(
    () => (n: number | null | undefined) => {
      if (n == null || isNaN(Number(n))) return "—";
      const v = Number(n);
      if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
      if (Math.abs(v) >= 1000) return `$${Math.round(v / 1000)}K`;
      return `$${Math.round(v)}`;
    },
    [],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading snapshot…</div>
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className={`text-[10px] uppercase tracking-[0.28em] font-supporting font-semibold mb-3 ${BODY_ACCENT_CLASS}`}>Snapshot not found</div>
          <h1 className="font-serif text-3xl font-semibold mb-3">This share link has expired or was retracted.</h1>
          <p className="text-sm text-muted-foreground mb-6">If you need a fresh read on this property, contact apollo@pegasusdreamscapes.com.</p>
          <Link href="/strategy-lab" className={`inline-block px-5 py-2.5 text-sm font-supporting font-semibold ${ACTION_CLASS}`}>Open Strategy Lab</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="bg-[hsl(var(--navy))] text-cream">
        <div className="border-t-4 border-[hsl(var(--copper))]" />
        <div className="max-w-[1180px] mx-auto px-6 lg:px-10 py-14 lg:py-20">
          <div className={`text-[10px] uppercase tracking-[0.3em] font-supporting font-semibold mb-4 ${HERO_ACCENT_CLASS}`}>
            Property Strategy Snapshot · {data.visibility === "full" ? "Full Tier" : "Summary Tier"}
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] leading-[1.02]">
            {addr}
          </h1>
          {sub && <p className="font-serif italic text-lg sm:text-xl text-cream/80 mt-3">{sub}</p>}
          {topLane && (
            <div className="mt-10 pt-8 border-t border-[hsl(var(--copper))]/40">
              <div className={`text-[10px] uppercase tracking-[0.3em] font-supporting font-semibold mb-2 ${HERO_ACCENT_CLASS}`}>Modeled path · based on user-entered inputs</div>
              <div className="font-serif text-3xl sm:text-4xl font-semibold">{topLane.laneLabel}</div>
              <p className="font-serif italic text-cream/85 mt-2 max-w-3xl">{topLane.headline}</p>
              <div className={`mt-3 text-[10px] uppercase tracking-[0.28em] font-supporting font-semibold ${HERO_ACCENT_CLASS}`}>
                Automated model fit · {modelFitLabel(topLane.verdictLabel)}
              </div>
              {/*
               * Headline metric — visible on BOTH summary and full tiers
               * so the share recipient always sees one anchor number for
               * the modeled path. Full underwriting math (numbers,
               * risks, capital stack, sensitivity) is gated to full tier.
               */}
              {topLane.economics?.primaryValue && (
                <div className="mt-6 inline-flex flex-col border-l-2 border-[hsl(var(--copper))] pl-4" data-testid="text-headline-metric">
                  <span className={`text-[10px] uppercase tracking-[0.28em] font-supporting font-semibold ${HERO_ACCENT_CLASS}`}>
                    Model estimate · {topLane.economics.primaryMetric || "Headline metric"}
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl font-semibold tabular-nums mt-1">
                    {topLane.economics.primaryValue}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <main className="max-w-[1180px] mx-auto px-6 lg:px-10 py-10 lg:py-14 space-y-12">
        <section
          className="border border-[hsl(var(--copper))]/35 bg-card text-card-foreground px-5 py-4"
          aria-label="Snapshot source and verification status"
          data-testid="snapshot-output-context"
        >
          <div className={`flex items-center gap-2 ${BODY_ACCENT_CLASS}`}>
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <p className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold">
              Automated output · not independently verified
            </p>
          </div>
          <p className="mt-2 text-sm font-medium leading-relaxed">{data.outputContext.label}</p>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{data.outputContext.disclaimer}</p>
        </section>

        {/* Numbers — full only */}
        {isFull && (
          <section data-testid="section-numbers">
            <div className={`text-[10px] uppercase tracking-[0.3em] font-supporting font-semibold mb-2 ${BODY_ACCENT_CLASS}`}>Section 01</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-4">User Inputs & Model Estimates</h2>
            <div className="border-t border-[hsl(var(--copper))]" />
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 mt-6">
              {[
                ["Asking price", fmtMoney(data.propertyInput?.askingPrice)],
                ["After-Repair Value", fmtMoney(data.propertyInput?.arvEstimate)],
                ["Rehab budget", fmtMoney(data.propertyInput?.rehabBudget)],
                ["Market rent (mo)", fmtMoney(data.propertyInput?.marketRent)],
                ["Total cash in", fmtMoney(snap.totalCashIn)],
                ["Beds / Baths / Sqft", `${data.propertyInput?.beds ?? "—"} / ${data.propertyInput?.baths ?? "—"} / ${data.propertyInput?.sqft ?? "—"}`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-[hsl(var(--rule))] py-2">
                  <dt className="text-sm text-muted-foreground">{k}</dt>
                  <dd className="font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Risk — full only */}
        {isFull && (snap.risks ?? []).length > 0 && (
          <section data-testid="section-risks">
            <div className={`text-[10px] uppercase tracking-[0.3em] font-supporting font-semibold mb-2 ${BODY_ACCENT_CLASS}`}>Section 02</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-4">Risk Register</h2>
            <div className="border-t border-[hsl(var(--copper))]" />
            <ul className="mt-6 space-y-3">
              {(snap.risks ?? []).map((r: RiskFlag, i: number) => (
                <li key={i} className="border border-[hsl(var(--rule))] p-4 flex gap-3">
                  <AlertTriangle className={`w-4 h-4 mt-1 shrink-0 ${r.severity === "blocker" || r.severity === "high" ? "text-red-700" : BODY_ACCENT_CLASS}`} />
                  <div>
                    <div className={`text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold ${BODY_ACCENT_CLASS}`}>{String(r.severity ?? "info")}</div>
                    <div className="font-serif text-lg font-semibold">{r.title}</div>
                    <p className="text-sm text-muted-foreground mt-1">{r.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Modeled funding assumptions — full only */}
        {isFull && (snap.capitalStack ?? []).length > 0 && (
          <section data-testid="section-stack">
            <div className={`text-[10px] uppercase tracking-[0.3em] font-supporting font-semibold mb-2 ${BODY_ACCENT_CLASS}`}>Section 03</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-4">Modeled Funding Assumptions</h2>
            <div className="border-t border-[hsl(var(--copper))]" />
            <div className="mt-6 space-y-3">
              {((snap.capitalStack ?? []) as CapitalStackEntry[]).map((e, i) => {
                const stack = (snap.capitalStack ?? []) as CapitalStackEntry[];
                const total = stack.reduce((s: number, x: CapitalStackEntry) => s + (x.amount ?? 0), 0) || 1;
                const pct = ((e.amount ?? 0) / total) * 100;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{e.label || String(e.source ?? "—").replace(/_/g, " ")}</span>
                      <span className="font-semibold tabular-nums">{fmtMoney(e.amount)}</span>
                    </div>
                    <div className="h-2 bg-[hsl(var(--rule))] mt-1">
                      <div className="h-2 bg-[hsl(var(--copper))]" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{pct.toFixed(0)}% of stack{e.note ? ` · ${e.note}` : ""}</div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Automated model summary — always */}
        {snap.memo && (
          <section data-testid="section-memo">
            <div className={`text-[10px] uppercase tracking-[0.3em] font-supporting font-semibold mb-2 ${BODY_ACCENT_CLASS}`}>{isFull ? "Section 04" : "Section 01"}</div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-4">Automated Model Summary</h2>
            <div className="border-t border-[hsl(var(--copper))]" />
            <p className="font-serif text-xl leading-relaxed mt-6 max-w-3xl">{snap.memo.paragraph}</p>
            {snap.memo.nextStep && (
              <div className="mt-6 border-l-2 border-[hsl(var(--copper))] pl-4">
                <div className={`text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold mb-1 ${BODY_ACCENT_CLASS}`}>Model consideration</div>
                <p className="font-serif italic text-lg">{snap.memo.nextStep}</p>
              </div>
            )}
          </section>
        )}

        {/* CTA */}
        <section className="bg-card text-card-foreground border border-[hsl(var(--rule))] p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" data-testid="section-cta">
          <div>
            <div className={`text-[10px] uppercase tracking-[0.28em] font-supporting font-semibold mb-1 ${BODY_ACCENT_CLASS}`}>Add private context</div>
            <div className="font-serif text-2xl font-semibold">Request a private property intake.</div>
            <p className="text-sm text-muted-foreground mt-1">Submission does not promise a review, response, offer, or additional output.</p>
          </div>
          <div className="flex gap-2">
            <a href={`/api/pdf/strategy-snapshot/by-token/${token}`} target="_blank" rel="noopener noreferrer"
               className="border border-[hsl(var(--card-foreground))] text-card-foreground px-4 py-2.5 text-sm font-supporting font-semibold inline-flex items-center gap-2"
               data-testid="link-download-pdf">
              <Download className="w-4 h-4" /> Download PDF
            </a>
            <Link href="/bring-an-opportunity" className={`px-4 py-2.5 text-sm font-supporting font-semibold inline-flex items-center gap-2 ${ACTION_CLASS}`} data-testid="link-submit-property">
              Open private intake <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Disclosure */}
        <section className="text-xs text-muted-foreground border-t border-[hsl(var(--rule))] pt-6 max-w-3xl">
          <div className={`flex items-center gap-2 mb-2 ${BODY_ACCENT_CLASS}`}>
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold">Disclosure</span>
          </div>
          <p className="leading-relaxed">
            This output is based on user-entered, unverified inputs and automated assumptions. It does not represent a Pegasus review or recommendation. It is not an offer, valuation, appraisal, financing commitment, investment advice, or guarantee. Comp bands, ARV, rent estimates, and modeled funding assumptions require independent human verification.
          </p>
        </section>
      </main>
    </div>
  );
}
