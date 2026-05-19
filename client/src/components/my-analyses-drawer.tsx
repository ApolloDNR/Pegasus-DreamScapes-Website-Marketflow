/**
 * Right-edge sheet listing all of the current user's saved calculator analyses.
 * Lets the user re-open, share publicly (mints a shareToken), or delete.
 */
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { FolderOpen, Share2, Trash2, Check, Copy, Loader2, Search, Pencil, X, Sparkles, FileDown, Send } from "lucide-react";
import type { SavedAnalysis, AnalysisSend } from "@shared/schema";
import { dispatchCalcLoad } from "@/lib/calc-load-bus";
import { usePeggyContext } from "@/contexts/peggy-context";
import { buildAskPeggyPrompt } from "@/components/calculator-shared";
import { SendAnalysisPdfDialog } from "@/components/send-analysis-pdf-dialog";

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

interface MyAnalysesDrawerProps {
  trigger?: React.ReactNode;
  /** Optional callback when user clicks Open. By default the drawer dispatches
   *  a window event so any mounted calculator can rehydrate its inputs. */
  onLoad?: (a: SavedAnalysis) => void;
  /** Optional callback fired after Open to switch to the right tab. */
  onSelectCalculator?: (calculatorType: string) => void;
}

export function MyAnalysesDrawer({ trigger, onLoad, onSelectCalculator }: MyAnalysesDrawerProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [renameId, setRenameId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  const { setCalculatorData, setPendingPrompt, openChat } = usePeggyContext();

  const { data, isLoading } = useQuery<SavedAnalysis[]>({
    queryKey: ["/api/saved-analyses"],
    enabled: open && !!user,
  });

  const shareMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/saved-analyses/${id}`, {
        isShared: true,
      });
      return res.json();
    },
    onSuccess: (updated: SavedAnalysis) => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-analyses"] });
      if (updated.shareToken) {
        const url = `${window.location.origin}/snapshot/calc/${updated.shareToken}`;
        navigator.clipboard.writeText(url).then(() => {
          setCopiedId(updated.id);
          setTimeout(() => setCopiedId(null), 2200);
          toast({ title: "Public link copied", description: url });
        });
      }
    },
    onError: () =>
      toast({ title: "Could not create share link", variant: "destructive" }),
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const res = await apiRequest("PATCH", `/api/saved-analyses/${id}`, { name });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-analyses"] });
      setRenameId(null);
      setRenameValue("");
      toast({ title: "Renamed" });
    },
    onError: () =>
      toast({ title: "Could not rename", variant: "destructive" }),
  });

  const handleOpen = (a: SavedAnalysis) => {
    if (onLoad) onLoad(a);
    if (onSelectCalculator) onSelectCalculator(a.calculatorType);
    dispatchCalcLoad(a);
    setOpen(false);
    toast({
      title: "Analysis loaded",
      description: `${a.name} restored into ${CALC_LABELS[a.calculatorType] ?? a.calculatorType}.`,
    });
  };

  const [pdfPendingId, setPdfPendingId] = useState<number | null>(null);

  const handleDownloadPdf = async (a: SavedAnalysis) => {
    try {
      setPdfPendingId(a.id);
      const res = await fetch(`/api/pdf/calculator`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: a.id }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safe = a.name.replace(/[^a-zA-Z0-9-_]+/g, "-").slice(0, 60) || "analysis";
      link.download = `pegasus-${safe}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({ title: "PDF downloaded" });
    } catch (err) {
      toast({ title: "Could not generate PDF", variant: "destructive" });
    } finally {
      setPdfPendingId(null);
    }
  };

  const handleAskPeggy = (a: SavedAnalysis) => {
    const toRecord = (v: unknown): Record<string, number | string | boolean> => {
      if (v && typeof v === "object" && !Array.isArray(v)) {
        return v as Record<string, number | string | boolean>;
      }
      return {};
    };
    const inputs = toRecord(a.inputs);
    const results = toRecord(a.results);
    setCalculatorData(a.calculatorType, inputs, results);
    setPendingPrompt(buildAskPeggyPrompt(a.calculatorType, results));
    openChat();
    setOpen(false);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/saved-analyses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-analyses"] });
      toast({ title: "Analysis deleted" });
    },
  });

  const list = (data ?? []).filter((a) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.calculatorType.toLowerCase().includes(q) ||
      (a.propertyAddress?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild data-testid="trigger-my-analyses">
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            My Analyses
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
            Strategy Lab
          </p>
          <SheetTitle className="font-serif text-2xl">My Analyses</SheetTitle>
          <SheetDescription>
            Saved scenarios. Re-open, share publicly, or remove.
          </SheetDescription>
        </SheetHeader>

        {!user && (
          <div className="mt-8 rounded-lg border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground text-center">
            Sign in to save and revisit your analyses.
          </div>
        )}

        {user && (
          <>
            <div className="relative mt-6 mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Filter by name, address, or calculator"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9"
                data-testid="input-analyses-filter"
              />
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}

            {!isLoading && list.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground text-center">
                No saved analyses yet. Run any calculator and click Save.
              </div>
            )}

            <div className="space-y-3">
              {list.map((a) => (
                <div
                  key={a.id}
                  className="rounded-lg border border-border bg-card p-4 hover-elevate"
                  data-testid={`analysis-row-${a.id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      {renameId === a.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && renameValue.trim()) {
                                renameMutation.mutate({ id: a.id, name: renameValue.trim() });
                              } else if (e.key === "Escape") {
                                setRenameId(null);
                              }
                            }}
                            className="h-7 text-sm"
                            data-testid={`input-rename-${a.id}`}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            disabled={!renameValue.trim() || renameMutation.isPending}
                            onClick={() =>
                              renameMutation.mutate({ id: a.id, name: renameValue.trim() })
                            }
                            data-testid={`button-rename-save-${a.id}`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => setRenameId(null)}
                            data-testid={`button-rename-cancel-${a.id}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium truncate">{a.name}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 opacity-60 hover:opacity-100"
                            onClick={() => {
                              setRenameId(a.id);
                              setRenameValue(a.name);
                            }}
                            data-testid={`button-rename-${a.id}`}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {CALC_LABELS[a.calculatorType] ?? a.calculatorType.toUpperCase()} ·{" "}
                        {new Date(a.createdAt as unknown as string).toLocaleDateString()}
                        {a.scenarioLabel && (
                          <>
                            {" · "}
                            <span className="text-primary font-supporting font-semibold uppercase tracking-wider text-[10px]">
                              {a.scenarioLabel}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    {a.dealGrade && (
                      <Badge variant="outline" className="shrink-0">
                        {a.dealGrade}
                      </Badge>
                    )}
                  </div>
                  {a.primaryMetric && (
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {a.primaryMetric}
                      </span>
                      <span className="font-serif text-lg font-semibold tabular-nums">
                        {a.primaryValue}
                      </span>
                    </div>
                  )}
                  <AnalysisSendHistory analysisId={a.id} drawerOpen={open} />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpen(a)}
                      data-testid={`button-load-${a.id}`}
                    >
                      <FolderOpen className="w-3.5 h-3.5 mr-1.5" />
                      Open
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareMutation.mutate(a.id)}
                      disabled={shareMutation.isPending}
                      data-testid={`button-share-${a.id}`}
                    >
                      {copiedId === a.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                          Copied
                        </>
                      ) : a.isShared && a.shareToken ? (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1.5" />
                          Copy link
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 mr-1.5" />
                          Share
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPdf(a)}
                      disabled={pdfPendingId === a.id}
                      data-testid={`button-pdf-${a.id}`}
                    >
                      {pdfPendingId === a.id ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <FileDown className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      PDF
                    </Button>
                    <SendAnalysisPdfDialog
                      analysisId={a.id}
                      analysisName={a.name}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          data-testid={`button-send-pdf-${a.id}`}
                        >
                          <Send className="w-3.5 h-3.5 mr-1.5" />
                          Send PDF
                        </Button>
                      }
                    />
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAskPeggy(a)}
                      className="bg-primary/90 hover:bg-primary"
                      data-testid={`button-ask-peggy-${a.id}`}
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                      Ask Peggy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(a.id)}
                      disabled={deleteMutation.isPending}
                      className="ml-auto text-muted-foreground hover:text-destructive"
                      data-testid={`button-delete-${a.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function AnalysisSendHistory({
  analysisId,
  drawerOpen,
}: {
  analysisId: number;
  drawerOpen: boolean;
}) {
  const { data, isLoading } = useQuery<AnalysisSend[]>({
    queryKey: ["/api/saved-analyses", analysisId, "sends"],
    enabled: drawerOpen,
  });

  if (isLoading || !data || data.length === 0) return null;

  const fmt = (d: AnalysisSend["sentAt"]) => {
    const date = new Date(d as unknown as string);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="mb-3 rounded-md border border-border/60 bg-muted/30 p-2.5"
      data-testid={`sends-history-${analysisId}`}
    >
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-supporting font-semibold mb-1.5">
        Sent to
      </p>
      <ul className="space-y-1">
        {data.map((s) => (
          <li
            key={s.id}
            className="flex items-baseline justify-between gap-2 text-xs"
            data-testid={`send-row-${s.id}`}
          >
            <span className="min-w-0 truncate">
              <span className="font-medium text-foreground">
                {s.recipientName}
              </span>
              <span className="text-muted-foreground"> · {s.recipientEmail}</span>
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {fmt(s.sentAt)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
