/**
 * Strategy Lab — Property Library (Task #84).
 *
 * Auth-only list of saved property analyses. Quick actions: open in Lab,
 * share, export PDF, delete.
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import { Download, Share2, Trash2, ArrowRight, Library as LibraryIcon, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AnalysisRow {
  id: number;
  shareToken: string | null;
  isShared: boolean;
  visibility: "summary" | "full";
  submittedToPegasus: boolean;
  address: string | null;
  city: string | null;
  state: string | null;
  topLane: string | null;
  topLaneVerdict: string | null;
  topLaneScore: number | null;
  createdAt: string;
  updatedAt: string;
  snapshot?: any;
}

const LANE_LABELS: Record<string, string> = {
  flip: "Flip",
  rental: "Rental Hold",
  brrrr: "BRRRR",
  wholesale: "Wholesale",
  jv: "JV",
  creative: "Creative Finance",
  capital_partner: "Capital Partner",
  mls_referral: "MLS Referral",
  operator_referral: "Operator Referral",
};

export default function StrategyLabLibraryPage() {
  useSEO({
    title: "Property Library — Strategy Lab",
    description: "Your saved property snapshots. Open, share, or export any analysis you've run through the Pegasus lens.",
  });
  const { isAuthenticated, isLoading: authLoading } = useSupabaseAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [shareTarget, setShareTarget] = useState<AnalysisRow | null>(null);
  // Full-tier sharing exposes raw underwriting math; require a separate
  // confirmation step before /share is called with visibility="full".
  const [pendingFullShareConfirm, setPendingFullShareConfirm] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  const { data, isLoading } = useQuery<AnalysisRow[]>({
    queryKey: ["/api/property-analyses"],
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/property-analyses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-analyses"] });
      toast({ title: "Snapshot removed" });
    },
    onError: (err: any) => {
      toast({ title: "Could not delete", description: err?.message ?? "Try again.", variant: "destructive" });
    },
  });

  const shareMutation = useMutation({
    mutationFn: async ({ id, visibility }: { id: number; visibility: "summary" | "full" }) => {
      const res = await apiRequest("POST", `/api/property-analyses/${id}/share`, { visibility });
      return (await res.json()) as { shareToken: string; visibility: string };
    },
    onSuccess: (data) => {
      setShareToken(data.shareToken);
      queryClient.invalidateQueries({ queryKey: ["/api/property-analyses"] });
    },
    onError: (err: any) => {
      toast({ title: "Could not share", description: err?.message ?? "Try again.", variant: "destructive" });
    },
  });

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Checking access…</div>;
  }
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="text-[10px] uppercase tracking-[0.28em] font-supporting font-semibold text-primary mb-3">Sign in required</div>
          <h1 className="font-serif text-3xl font-semibold mb-3">Your Property Library lives behind a free account.</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign in to see every snapshot you've saved from the Strategy Lab.</p>
          <button
            onClick={() => navigate("/api/login")}
            className="bg-[hsl(var(--copper))] text-white px-5 py-2.5 text-sm font-supporting font-semibold"
            data-testid="btn-signin-library"
          >
            Sign in / Create account
          </button>
        </div>
      </div>
    );
  }

  const rows = data ?? [];
  const shareUrl = shareToken ? `${typeof window !== "undefined" ? window.location.origin : ""}/snapshot/calc/${shareToken}` : "";

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", description: "Select the link and copy manually.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-[hsl(var(--rule))]">
        <div className="max-w-[1180px] mx-auto px-6 lg:px-10 py-12">
          <div className="text-[10px] uppercase tracking-[0.3em] font-supporting font-semibold text-primary mb-3">Strategy Lab · Property Library</div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-normal leading-[1.02]">Your saved snapshots.</h1>
          <p className="font-serif text-lg text-muted-foreground mt-3 max-w-2xl">Every property you've run through the Pegasus lens. Open it back up, refresh the math, share it with a partner, or submit it for human review.</p>
          <div className="mt-6">
            <Link href="/strategy-lab" className="inline-flex items-center gap-2 bg-[hsl(var(--copper))] text-white px-5 py-2.5 text-sm font-supporting font-semibold" data-testid="link-new-analysis">
              Run a new analysis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-[1180px] mx-auto px-6 lg:px-10 py-10">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading your library…</div>
        ) : rows.length === 0 ? (
          <div className="border border-dashed border-[hsl(var(--rule))] p-10 text-center">
            <LibraryIcon className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <div className="font-serif text-2xl font-semibold mb-1">No saved snapshots yet.</div>
            <p className="text-sm text-muted-foreground mb-4">Run a property through the Strategy Lab and click <span className="font-semibold">Save Snapshot</span> to add it here.</p>
            <Link href="/strategy-lab" className="bg-[hsl(var(--copper))] text-white px-4 py-2 text-sm font-supporting font-semibold">Open Strategy Lab</Link>
          </div>
        ) : (
          <ul className="space-y-3" data-testid="list-saved-analyses">
            {rows.map((row) => {
              const addr = row.address || "Untitled property";
              const sub = [row.city, row.state].filter(Boolean).join(", ");
              const lane = row.topLane ? LANE_LABELS[row.topLane] ?? row.topLane : "Pending";
              return (
                <li key={row.id} className="border border-[hsl(var(--rule))] p-4 sm:p-5 grid sm:grid-cols-[1fr_auto] gap-4 items-start" data-testid={`row-analysis-${row.id}`}>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary mb-1">{lane}{row.topLaneVerdict ? ` · ${row.topLaneVerdict}` : ""}</div>
                    <div className="font-serif text-xl font-semibold truncate">{addr}</div>
                    {sub && <div className="text-sm text-muted-foreground">{sub}</div>}
                    <div className="text-xs text-muted-foreground mt-1">
                      Saved {new Date(row.updatedAt).toLocaleDateString()} · {row.isShared ? `Shared (${row.visibility})` : "Private"}{row.submittedToPegasus ? " · Submitted" : ""}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/strategy-lab?analysisId=${row.id}`}
                      className="text-xs bg-[hsl(var(--copper))] text-white px-3 py-2 font-supporting font-semibold inline-flex items-center gap-1.5"
                      data-testid={`btn-open-lab-${row.id}`}
                    >
                      <ArrowRight className="w-3.5 h-3.5" /> Open in Lab
                    </Link>
                    {row.isShared && row.shareToken && (
                      <a href={`/snapshot/calc/${row.shareToken}`} target="_blank" rel="noopener noreferrer"
                         className="text-xs border border-[hsl(var(--rule))] px-3 py-2 font-supporting font-semibold inline-flex items-center gap-1.5"
                         data-testid={`btn-open-share-${row.id}`}>
                        Open share
                      </a>
                    )}
                    <button
                      onClick={() => { setShareTarget(row); setShareToken(row.shareToken ?? null); }}
                      className="text-xs border border-[hsl(var(--rule))] px-3 py-2 font-supporting font-semibold inline-flex items-center gap-1.5"
                      data-testid={`btn-share-${row.id}`}
                    >
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </button>
                    <a href={`/api/pdf/strategy-snapshot/by-id/${row.id}`} target="_blank" rel="noopener noreferrer"
                       className="text-xs bg-[hsl(var(--ink))] text-[hsl(var(--paper))] px-3 py-2 font-supporting font-semibold inline-flex items-center gap-1.5"
                       data-testid={`btn-pdf-${row.id}`}>
                      <Download className="w-3.5 h-3.5" /> PDF
                    </a>
                    <button
                      onClick={() => {
                        if (confirm("Remove this snapshot from your library?")) deleteMutation.mutate(row.id);
                      }}
                      className="text-xs border border-[hsl(var(--rule))] px-3 py-2 font-supporting font-semibold inline-flex items-center gap-1.5 text-red-700"
                      data-testid={`btn-delete-${row.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* Share dialog */}
      <Dialog open={!!shareTarget} onOpenChange={(o) => { if (!o) { setShareTarget(null); setShareToken(null); setPendingFullShareConfirm(false); } }}>
        <DialogContent className="sm:max-w-lg" data-testid="dialog-share-library">
          <DialogHeader>
            <div className="text-[10px] uppercase tracking-[0.28em] font-supporting font-semibold text-primary mb-2">Share Snapshot</div>
            <DialogTitle className="font-serif text-2xl">{shareToken ? "Your share link" : "Choose what your viewer sees."}</DialogTitle>
            <DialogDescription className="font-serif text-base text-muted-foreground leading-relaxed">
              Summary tier shows the recommended path and memo only. Full tier shows numbers, risk, capital stack, and sensitivity.
            </DialogDescription>
          </DialogHeader>
          {!shareToken && shareTarget && !pendingFullShareConfirm ? (
            <div className="grid sm:grid-cols-2 gap-3 py-2">
              <button
                type="button"
                onClick={() => shareMutation.mutate({ id: shareTarget.id, visibility: "summary" })}
                disabled={shareMutation.isPending}
                className="border border-[hsl(var(--rule))] p-4 text-left hover:bg-[hsl(var(--ink)/0.04)] disabled:opacity-60"
                data-testid="btn-lib-share-summary"
              >
                <div className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary mb-1">Summary</div>
                <div className="font-serif text-lg font-semibold">Recommended path only</div>
              </button>
              <button
                type="button"
                onClick={() => setPendingFullShareConfirm(true)}
                disabled={shareMutation.isPending}
                className="border border-[hsl(var(--copper))] p-4 text-left hover:bg-[hsl(var(--copper)/0.05)] disabled:opacity-60"
                data-testid="btn-lib-share-full"
              >
                <div className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary mb-1">Full</div>
                <div className="font-serif text-lg font-semibold">Everything in the snapshot</div>
              </button>
            </div>
          ) : !shareToken && shareTarget && pendingFullShareConfirm ? (
            <div className="space-y-4 py-2" data-testid="confirm-lib-share-full">
              <div className="border-l-2 border-[hsl(var(--copper))] pl-4 py-2 bg-[hsl(var(--copper)/0.05)]">
                <div className="text-[10px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary mb-1">Confirm full share</div>
                <div className="font-serif text-base text-foreground leading-relaxed">
                  This link will expose the full underwriting math — pricing, rehab,
                  capital stack, and sensitivity. Anyone with the URL can see every
                  number. Only share with a trusted partner.
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPendingFullShareConfirm(false)}
                  className="border border-[hsl(var(--rule))] px-4 py-2 text-sm font-supporting font-semibold"
                  data-testid="btn-lib-share-full-cancel"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => { setPendingFullShareConfirm(false); shareMutation.mutate({ id: shareTarget.id, visibility: "full" }); }}
                  disabled={shareMutation.isPending}
                  className="bg-[hsl(var(--copper))] text-white px-4 py-2 text-sm font-supporting font-semibold disabled:opacity-60"
                  data-testid="btn-lib-share-full-confirm"
                >
                  Yes, share full math
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 border border-[hsl(var(--rule))] p-2">
              <input type="text" readOnly value={shareUrl} className="flex-1 bg-transparent text-xs font-mono outline-none" data-testid="input-lib-share-url" />
              <button
                type="button"
                onClick={copyShareUrl}
                className="bg-[hsl(var(--ink))] text-[hsl(var(--paper))] px-3 py-1.5 text-xs font-supporting font-semibold flex items-center gap-1.5"
                data-testid="btn-lib-copy-share"
              >
                {shareCopied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
          )}
          <DialogFooter>
            <button
              type="button"
              className="border border-[hsl(var(--rule))] px-4 py-2 text-sm font-supporting font-semibold"
              onClick={() => { setShareTarget(null); setShareToken(null); setPendingFullShareConfirm(false); }}
              data-testid="btn-lib-share-close"
            >
              Done
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
