import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/use-seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, AlertTriangle, RefreshCw } from "lucide-react";
import type { PeggyConversation, PeggyMessage } from "@shared/schema";

type PeggyConversationDetail = {
  conversation: PeggyConversation;
  messages: PeggyMessage[];
};

// Task #151 — Admin surface for Peggy conversations.
// Reads /api/admin/peggy/conversations (HQ-only, gated by ADMIN_EMAILS) and
// shows last 30 days with disposition / intake summary / human_required flag.
// Click a row to load the full transcript inline.

const formatDate = (iso: string | Date | null) => {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const DISPOSITION_LABELS: Record<string, string> = {
  submit_property: "Submit a Property",
  strategy_lab: "Strategy Lab",
  strategy_review: "Strategy Review",
  capital_intake: "Capital",
  vendor_intake: "Vendor",
  deal_blueprint: "Deal Blueprint",
  human_required: "Human required",
};

function isVerifiedConversationDetail(
  value: unknown,
  selectedId: number | null,
): value is PeggyConversationDetail {
  if (selectedId === null || !value || typeof value !== "object") return false;
  const candidate = value as Partial<PeggyConversationDetail>;
  return (
    Boolean(candidate.conversation) &&
    candidate.conversation?.id === selectedId &&
    Array.isArray(candidate.messages)
  );
}

export default function AdminPeggyConversationsPage() {
  useSEO({
    title: "Peggy Conversations — HQ",
    description: "Internal Peggy intake review surface.",
    noIndex: true,
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const listQuery = useQuery<PeggyConversation[]>({
    queryKey: ["/api/admin/peggy/conversations"],
  });

  const detailQuery = useQuery<PeggyConversationDetail>({
    queryKey: ["/api/admin/peggy/conversations", selectedId],
    enabled: selectedId !== null,
  });

  const conversations = listQuery.data;
  const verifiedConversations =
    listQuery.isSuccess && Array.isArray(conversations) ? conversations : null;
  const hasVerifiedConversations = verifiedConversations !== null;
  const isListLoading = listQuery.isPending && listQuery.isFetching;
  const isListUnavailable = !isListLoading && !hasVerifiedConversations;

  const detail = detailQuery.data;
  const verifiedDetail =
    detailQuery.isSuccess && isVerifiedConversationDetail(detail, selectedId)
      ? detail
      : null;
  const hasVerifiedDetail = verifiedDetail !== null;
  const isDetailLoading =
    selectedId !== null && detailQuery.isPending && detailQuery.isFetching;
  const isDetailUnavailable =
    selectedId !== null && !isDetailLoading && !hasVerifiedDetail;

  const counts = useMemo(() => {
    if (!verifiedConversations) return null;
    const dispositions: Record<string, number> = {};
    let human = 0;
    for (const c of verifiedConversations) {
      const key = c.disposition || "unclassified";
      dispositions[key] = (dispositions[key] || 0) + 1;
      if (c.humanRequired) human += 1;
    }
    return { total: verifiedConversations.length, human, dispositions };
  }, [verifiedConversations]);

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-10 flex items-start justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-3">
              HQ · Peggy
            </p>
            <h1
              className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight"
              data-testid="text-peggy-admin-title"
            >
              Peggy Conversations
            </h1>
            <p className="text-base text-muted-foreground mt-3 max-w-2xl">
              Last 30 days of Peggy intake. Click a row to read the transcript.
              Conversations flagged with the warning icon need human follow-up
              (Fair Housing trigger or Civil Code §1695 routing).
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void listQuery.refetch()}
            disabled={listQuery.isFetching}
            aria-busy={listQuery.isFetching}
            data-testid="button-refresh-peggy"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {listQuery.isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </header>

        {counts && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total (30d)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif" data-testid="text-peggy-total">{counts.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Human required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif text-destructive" data-testid="text-peggy-human">{counts.human}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Top dispositions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  {Object.entries(counts.dispositions)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 4)
                    .map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-muted-foreground">{DISPOSITION_LABELS[k] || k}</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {isListLoading && (
          <Card>
            <CardContent
              className="py-10 text-center text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <div className="flex justify-center mb-3" aria-hidden="true">
                <span className="inline-flex animate-spin">
                  <RefreshCw className="w-5 h-5" />
                </span>
              </div>
              Loading Peggy review queue… Counts are withheld until the response is verified.
            </CardContent>
          </Card>
        )}
        {isListUnavailable && (
          <Card className="border-destructive/40">
            <CardContent
              className="py-10 text-center"
              role="alert"
              aria-live="assertive"
            >
              <AlertTriangle className="w-6 h-6 mx-auto mb-3 text-destructive" aria-hidden="true" />
              <p className="font-semibold text-destructive">Peggy review queue unavailable.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Fair Housing and Civil Code §1695 flags have not been verified. No review counts are shown.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={() => void listQuery.refetch()}
                disabled={listQuery.isFetching}
                aria-busy={listQuery.isFetching}
              >
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                {listQuery.isFetching ? "Retrying…" : "Retry conversations"}
              </Button>
            </CardContent>
          </Card>
        )}

        {verifiedConversations && verifiedConversations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-50" />
              No Peggy conversations in the last 30 days.
            </CardContent>
          </Card>
        )}

        {verifiedConversations && verifiedConversations.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Disposition</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Summary</th>
                    <th className="px-4 py-3 text-center">Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {verifiedConversations.map(c => (
                    <tr
                      key={c.id}
                      className={`border-t hover-elevate cursor-pointer ${selectedId === c.id ? "bg-muted/30" : ""}`}
                      onClick={() => setSelectedId(c.id)}
                      data-testid={`row-peggy-${c.id}`}
                    >
                      <td className="px-4 py-3 font-mono">#{c.id}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(c.updatedAt)}</td>
                      <td className="px-4 py-3">
                        {c.disposition ? (
                          <Badge variant={c.disposition === "human_required" ? "destructive" : "secondary"}>
                            {DISPOSITION_LABELS[c.disposition] || c.disposition}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {c.contactName || c.contactEmail || c.contactPhone ? (
                          <div className="text-xs">
                            {c.contactName && <div className="font-medium">{c.contactName}</div>}
                            {c.contactEmail && <div className="text-muted-foreground">{c.contactEmail}</div>}
                            {c.contactPhone && <div className="text-muted-foreground">{c.contactPhone}</div>}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-md truncate">{c.summary || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        {c.humanRequired && (
                          <AlertTriangle
                            className="w-4 h-4 text-destructive inline"
                            data-testid={`flag-human-${c.id}`}
                            aria-label="Operator attention required"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {hasVerifiedConversations && isDetailLoading && (
          <Card className="mt-6">
            <CardContent
              className="py-10 text-center text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <div className="flex justify-center mb-3" aria-hidden="true">
                <span className="inline-flex animate-spin">
                  <RefreshCw className="w-5 h-5" />
                </span>
              </div>
              Loading transcript #{selectedId}…
            </CardContent>
          </Card>
        )}

        {hasVerifiedConversations && isDetailUnavailable && (
          <Card className="mt-6 border-destructive/40">
            <CardContent
              className="py-10 text-center"
              role="alert"
              aria-live="assertive"
            >
              <AlertTriangle className="w-6 h-6 mx-auto mb-3 text-destructive" aria-hidden="true" />
              <p className="font-semibold text-destructive">
                Transcript #{selectedId} unavailable.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Fair Housing and Civil Code §1695 review status cannot be confirmed from this transcript.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={() => void detailQuery.refetch()}
                disabled={detailQuery.isFetching}
                aria-busy={detailQuery.isFetching}
              >
                <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
                {detailQuery.isFetching ? "Retrying…" : "Retry transcript"}
              </Button>
            </CardContent>
          </Card>
        )}

        {hasVerifiedConversations && verifiedDetail && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="font-serif">
                Transcript #{verifiedDetail.conversation.id}
                {verifiedDetail.conversation.humanRequiredReason && (
                  <Badge variant="destructive" className="ml-3 align-middle">
                    {verifiedDetail.conversation.humanRequiredReason}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {verifiedDetail.messages.map(m => (
                  <div key={m.id} className="border-l-2 pl-4 border-primary/30">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-supporting mb-1">
                      {m.role} · {formatDate(m.createdAt)}
                    </div>
                    <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                  </div>
                ))}
              </div>
              {verifiedDetail.conversation.intake ? (
                <div className="mt-6 pt-6 border-t">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-supporting mb-2">
                    Structured intake
                  </div>
                  <pre className="text-xs bg-muted/40 p-4 rounded overflow-x-auto">
                    {JSON.stringify(verifiedDetail.conversation.intake, null, 2)}
                  </pre>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
