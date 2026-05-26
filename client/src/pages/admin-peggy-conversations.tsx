import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/use-seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, AlertTriangle, RefreshCw } from "lucide-react";
import type { PeggyConversation, PeggyMessage } from "@shared/schema";

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

export default function AdminPeggyConversationsPage() {
  useSEO({
    title: "Peggy Conversations — HQ",
    description: "Internal Peggy intake review surface.",
    noIndex: true,
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: conversations, isLoading, error, refetch } = useQuery<PeggyConversation[]>({
    queryKey: ["/api/admin/peggy/conversations"],
  });

  const { data: detail } = useQuery<{ conversation: PeggyConversation; messages: PeggyMessage[] }>({
    queryKey: ["/api/admin/peggy/conversations", selectedId],
    enabled: selectedId !== null,
  });

  const counts = useMemo(() => {
    if (!conversations) return { total: 0, human: 0, dispositions: {} as Record<string, number> };
    const dispositions: Record<string, number> = {};
    let human = 0;
    for (const c of conversations) {
      const key = c.disposition || "unclassified";
      dispositions[key] = (dispositions[key] || 0) + 1;
      if (c.humanRequired) human += 1;
    }
    return { total: conversations.length, human, dispositions };
  }, [conversations]);

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
          <Button variant="outline" size="sm" onClick={() => refetch()} data-testid="button-refresh-peggy">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </header>

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

        {isLoading && (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Loading…</CardContent></Card>
        )}
        {error && (
          <Card><CardContent className="py-8 text-center text-destructive">Could not load conversations.</CardContent></Card>
        )}

        {conversations && conversations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-50" />
              No Peggy conversations in the last 30 days.
            </CardContent>
          </Card>
        )}

        {conversations && conversations.length > 0 && (
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
                  {conversations.map(c => (
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
                            aria-label="Human review required"
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

        {detail && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="font-serif">
                Transcript #{detail.conversation.id}
                {detail.conversation.humanRequiredReason && (
                  <Badge variant="destructive" className="ml-3 align-middle">
                    {detail.conversation.humanRequiredReason}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {detail.messages.map(m => (
                  <div key={m.id} className="border-l-2 pl-4 border-primary/30">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-supporting mb-1">
                      {m.role} · {formatDate(m.createdAt)}
                    </div>
                    <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                  </div>
                ))}
              </div>
              {detail.conversation.intake ? (
                <div className="mt-6 pt-6 border-t">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-supporting mb-2">
                    Structured intake
                  </div>
                  <pre className="text-xs bg-muted/40 p-4 rounded overflow-x-auto">
                    {JSON.stringify(detail.conversation.intake, null, 2)}
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
