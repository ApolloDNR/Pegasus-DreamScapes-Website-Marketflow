import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useSEO } from "@/hooks/use-seo";
import { useToast } from "@/hooks/use-toast";

type Submission = {
  id: number;
  propertyAnalysisId: number;
  status: string;
  submitterName: string | null;
  submitterEmail: string | null;
  submitterPhone: string | null;
  submitterRole: string | null;
  notes: string | null;
  topLane: string | null;
  topLaneVerdict: string | null;
  slaDueAt: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  createdAt: string;
};

type BlueprintOrder = {
  id: number;
  tier: string;
  priceCents: number;
  contactName: string | null;
  contactEmail: string | null;
  paymentMethod: "stripe" | "invoice";
  paymentStatus: string;
  createdAt: string;
};

type Touchpoint = {
  id: number;
  sessionId: string | null;
  action: string;
  topLane: string | null;
  propertyAnalysisId: number | null;
  createdAt: string;
};

type AdminPayload = {
  sinceDays: number;
  funnel: Record<string, number>;
  submissions: Submission[];
  orders: BlueprintOrder[];
  escalatedCount: number;
  recentTouchpoints: Touchpoint[];
};

const STATUS_OPTIONS = ["received", "in_review", "reviewed", "routed", "escalated"] as const;

export default function AdminStrategyLabPage() {
  useSEO({ title: "Strategy Lab — Admin", description: "Internal funnel review.", noIndex: true });
  const { toast } = useToast();
  const qc = useQueryClient();

  const adminQuery = useQuery<AdminPayload>({ queryKey: ["/api/admin/strategy-lab"] });

  const updateStatus = useMutation({
    mutationFn: async (vars: { id: number; status: string; reviewNotes?: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/strategy-lab/submissions/${vars.id}/status`, {
        status: vars.status,
        reviewNotes: vars.reviewNotes,
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/strategy-lab"] });
      toast({ title: "Status updated" });
    },
    onError: (err: any) => {
      toast({ title: "Update failed", description: err?.message ?? "", variant: "destructive" });
    },
  });

  const [tab, setTab] = useState<"submissions" | "orders" | "touchpoints">("submissions");

  if (adminQuery.isLoading) {
    return <div className="p-12 text-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (adminQuery.error) {
    return (
      <div className="p-12 text-center">
        <div className="text-sm text-[hsl(8_65%_45%)] font-semibold">Admin access required.</div>
        <div className="text-xs text-muted-foreground mt-2">Sign in with an admin account to view the funnel.</div>
      </div>
    );
  }

  const data = adminQuery.data;
  const submissions = data?.submissions ?? [];
  const orders = data?.orders ?? [];
  const touchpoints = data?.recentTouchpoints ?? [];
  const funnel = data?.funnel ?? {};

  const quickRun = funnel["quick_run"] ?? 0;
  const quickToFull = funnel["quick_to_full"] ?? 0;
  const fullRun = funnel["full_run"] ?? 0;
  const submit = funnel["submit"] ?? 0;
  const pct = (num: number, den: number) =>
    den > 0 ? `${Math.round((num / den) * 100)}%` : "—";
  const conversionSteps: Array<{
    key: string;
    label: string;
    count: number;
    rateLabel: string;
    rate: string;
  }> = [
    { key: "quick_run", label: "Quick Read", count: quickRun, rateLabel: "Start", rate: "100%" },
    { key: "quick_to_full", label: "Opened Full Path", count: quickToFull, rateLabel: "of Quick", rate: pct(quickToFull, quickRun) },
    { key: "full_run", label: "Ran Full Path", count: fullRun, rateLabel: "of Quick→Full", rate: pct(fullRun, quickToFull) },
    { key: "submit", label: "Submitted to Pegasus", count: submit, rateLabel: "of Full Run", rate: pct(submit, fullRun) },
  ];
  const overallRate = pct(submit, quickRun);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="max-w-[1320px] mx-auto px-6 lg:px-10 py-12">
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-3">
          Strategy Lab · Admin
        </div>
        <h1 className="font-serif text-4xl font-semibold tracking-tight mb-2">Funnel review.</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last {data?.sinceDays ?? 30} days. Escalated (overdue SLA): {data?.escalatedCount ?? 0}.
        </p>

        {/* Quick → Full conversion strip */}
        <div className="mb-10" data-testid="conversion-strip">
          <div className="flex items-baseline justify-between mb-3">
            <div className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
              Quick Read → Full Path → Submit
            </div>
            <div className="text-xs text-muted-foreground">
              Quick → Submit:{" "}
              <span className="font-semibold text-foreground tabular-nums" data-testid="text-overall-rate">
                {overallRate}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {conversionSteps.map((step, i) => (
              <div
                key={step.key}
                className="border border-[hsl(var(--rule))] p-4 relative"
                data-testid={`conversion-step-${step.key}`}
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-supporting">
                  Step {i + 1} · {step.label}
                </div>
                <div className="font-serif text-3xl tabular-nums mt-1" data-testid={`conversion-count-${step.key}`}>
                  {step.count}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  <span className="font-semibold text-foreground tabular-nums" data-testid={`conversion-rate-${step.key}`}>
                    {step.rate}
                  </span>{" "}
                  {step.rateLabel}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-10">
          {Object.entries(funnel).map(([action, count]) => (
            <div key={action} className="border border-[hsl(var(--rule))] p-3" data-testid={`funnel-${action}`}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-supporting">{action}</div>
              <div className="font-serif text-2xl tabular-nums">{count}</div>
            </div>
          ))}
          {Object.keys(funnel).length === 0 && (
            <div className="col-span-full text-sm text-muted-foreground">No telemetry events yet.</div>
          )}
        </div>

        <div className="flex gap-2 mb-6 border-b border-[hsl(var(--rule))]">
          {(["submissions", "orders", "touchpoints"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-supporting font-semibold tracking-wide capitalize border-b-2 ${
                tab === t ? "border-[hsl(var(--copper))] text-foreground" : "border-transparent text-muted-foreground"
              }`}
              data-testid={`tab-${t}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "submissions" && (
          <div className="overflow-x-auto" data-testid="table-submissions">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-[hsl(var(--rule))]">
                <tr>
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">Submitter</th>
                  <th className="py-2 pr-4">Lane</th>
                  <th className="py-2 pr-4">SLA</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => {
                  const overdue = s.slaDueAt && !s.reviewedAt && new Date(s.slaDueAt) < new Date();
                  return (
                    <tr key={s.id} className="border-b border-[hsl(var(--rule))]" data-testid={`row-submission-${s.id}`}>
                      <td className="py-3 pr-4 align-top text-xs text-muted-foreground">
                        {new Date(s.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 align-top">
                        <div className="font-semibold">{s.submitterName || "—"}</div>
                        <div className="text-xs text-muted-foreground">{s.submitterEmail || ""}</div>
                        <div className="text-xs text-muted-foreground">{s.submitterPhone || ""}</div>
                        {s.notes && <div className="text-xs text-muted-foreground mt-1 italic line-clamp-2">{s.notes}</div>}
                      </td>
                      <td className="py-3 pr-4 align-top text-xs">
                        <div>{s.topLane || "—"}</div>
                        {s.topLaneVerdict && <div className="text-[10px] uppercase text-muted-foreground">{s.topLaneVerdict}</div>}
                      </td>
                      <td className="py-3 pr-4 align-top text-xs">
                        {s.slaDueAt && (
                          <div className={overdue ? "text-[hsl(8_65%_45%)] font-semibold" : ""}>
                            {new Date(s.slaDueAt).toLocaleString()}
                          </div>
                        )}
                        {overdue && (
                          <div className="text-[10px] uppercase tracking-wider text-[hsl(8_65%_45%)]">Priority — escalated</div>
                        )}
                      </td>
                      <td className="py-3 pr-4 align-top">
                        <select
                          value={s.status}
                          onChange={(e) => updateStatus.mutate({ id: s.id, status: e.target.value })}
                          className="border border-[hsl(var(--rule))] bg-background px-2 py-1 text-xs"
                          data-testid={`select-status-${s.id}`}
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
                {submissions.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-muted-foreground text-sm">No submissions yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "orders" && (
          <div className="overflow-x-auto" data-testid="table-orders">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-[hsl(var(--rule))]">
                <tr>
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">Buyer</th>
                  <th className="py-2 pr-4">Tier</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-4">Payment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-[hsl(var(--rule))]" data-testid={`row-order-${o.id}`}>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <div className="font-semibold">{o.contactName || "—"}</div>
                      <div className="text-xs text-muted-foreground">{o.contactEmail || ""}</div>
                    </td>
                    <td className="py-3 pr-4 text-xs">{o.tier}</td>
                    <td className="py-3 pr-4 text-xs tabular-nums">${(o.priceCents / 100).toLocaleString()}</td>
                    <td className="py-3 pr-4 text-xs">
                      <span className="font-semibold">{o.paymentMethod}</span> · {o.paymentStatus}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-muted-foreground text-sm">No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "touchpoints" && (
          <div className="overflow-x-auto" data-testid="table-touchpoints">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-[hsl(var(--rule))]">
                <tr>
                  <th className="py-2 pr-4">When</th>
                  <th className="py-2 pr-4">Action</th>
                  <th className="py-2 pr-4">Session</th>
                  <th className="py-2 pr-4">Lane</th>
                  <th className="py-2 pr-4">Analysis</th>
                </tr>
              </thead>
              <tbody>
                {touchpoints.map((t) => (
                  <tr key={t.id} className="border-b border-[hsl(var(--rule))]" data-testid={`row-touchpoint-${t.id}`}>
                    <td className="py-2 pr-4 text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-4 text-xs font-semibold">{t.action}</td>
                    <td className="py-2 pr-4 text-xs font-mono text-muted-foreground">{t.sessionId ? t.sessionId.slice(0, 8) + "…" : "—"}</td>
                    <td className="py-2 pr-4 text-xs">{t.topLane || "—"}</td>
                    <td className="py-2 pr-4 text-xs">{t.propertyAnalysisId ?? "—"}</td>
                  </tr>
                ))}
                {touchpoints.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-muted-foreground text-sm">No events yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
