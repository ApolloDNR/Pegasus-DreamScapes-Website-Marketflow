import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/use-seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MousePointerClick } from "lucide-react";
import type { CtaEvent } from "@shared/schema";

// Empire Doctrine v1.0.1 Wave 3 — Admin CTA attribution surface.
//
// Reads /api/hq/cta-events (admin-only) and presents a grouped + raw
// view of the last 30 days of primary-surface CTA clicks. The intent is
// triage at a glance: which surfaces are doing the heavy lifting, and
// which labels are being skipped over.

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

interface GroupRow {
  source: string;
  label: string;
  count: number;
  lastSeen: Date | null;
}

export default function AdminCtaEventsPage() {
  useSEO({
    title: "CTA Events — HQ",
    description: "Internal CTA attribution and conversion read.",
    noIndex: true,
  });

  const { data: events, isLoading, error } = useQuery<CtaEvent[]>({
    queryKey: ["/api/hq/cta-events"],
  });

  const grouped = useMemo<GroupRow[]>(() => {
    if (!events) return [];
    const map = new Map<string, GroupRow>();
    for (const e of events) {
      const key = `${e.source}::${e.label}`;
      const cur = map.get(key);
      const ts = e.createdAt ? new Date(e.createdAt) : null;
      if (cur) {
        cur.count += 1;
        if (ts && (!cur.lastSeen || ts > cur.lastSeen)) cur.lastSeen = ts;
      } else {
        map.set(key, { source: e.source, label: e.label, count: 1, lastSeen: ts });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [events]);

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-3">
            HQ · Attribution
          </p>
          <h1
            className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight"
            data-testid="text-cta-events-title"
          >
            CTA Events
          </h1>
          <p className="text-base text-muted-foreground mt-3 max-w-2xl">
            Last 30 days of primary-surface CTA clicks. First-party
            attribution, no cookies, no PII. Use this to read which surfaces
            are working and which are dead air.
          </p>
        </header>

        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground" data-testid="status-cta-loading">
              Loading events...
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-[hsl(var(--form-error))]/40">
            <CardContent
              className="py-8 text-center text-[hsl(var(--form-error))]"
              data-testid="status-cta-error"
            >
              Failed to load CTA events. {(error as Error)?.message}
            </CardContent>
          </Card>
        )}

        {events && events.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center" data-testid="status-cta-empty">
              <MousePointerClick className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No CTA events recorded yet.</p>
            </CardContent>
          </Card>
        )}

        {events && events.length > 0 && (
          <div className="space-y-10">
            <section>
              <h2 className="font-serif text-2xl font-semibold tracking-tight mb-4">
                By source + label
              </h2>
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm" data-testid="table-cta-grouped">
                    <thead className="border-b border-[hsl(var(--rule))]">
                      <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        <th className="px-5 py-3 font-supporting font-semibold">Source</th>
                        <th className="px-5 py-3 font-supporting font-semibold">Label</th>
                        <th className="px-5 py-3 font-supporting font-semibold text-right">Clicks</th>
                        <th className="px-5 py-3 font-supporting font-semibold">Last seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped.map((row, idx) => (
                        <tr
                          key={`${row.source}-${row.label}`}
                          className="border-b border-[hsl(var(--rule))]/60 last:border-b-0"
                          data-testid={`row-cta-group-${idx}`}
                        >
                          <td className="px-5 py-3">
                            <Badge variant="outline" className="font-supporting uppercase tracking-wider text-[10px]">
                              {row.source}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-foreground">{row.label}</td>
                          <td
                            className="px-5 py-3 text-right font-serif text-lg text-primary"
                            data-testid={`text-cta-count-${idx}`}
                          >
                            {row.count}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">
                            {row.lastSeen ? formatDate(row.lastSeen) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold tracking-tight mb-4">
                Recent events
              </h2>
              <div className="text-sm text-muted-foreground mb-3" data-testid="text-cta-count">
                {events.length} event{events.length === 1 ? "" : "s"} in the last 30 days
              </div>
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm" data-testid="table-cta-recent">
                    <thead className="border-b border-[hsl(var(--rule))]">
                      <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        <th className="px-5 py-3 font-supporting font-semibold">When</th>
                        <th className="px-5 py-3 font-supporting font-semibold">Source</th>
                        <th className="px-5 py-3 font-supporting font-semibold">Label</th>
                        <th className="px-5 py-3 font-supporting font-semibold">Path</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.slice(0, 100).map((e) => (
                        <tr
                          key={e.id}
                          className="border-b border-[hsl(var(--rule))]/60 last:border-b-0"
                          data-testid={`row-cta-event-${e.id}`}
                        >
                          <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                            {formatDate(e.createdAt)}
                          </td>
                          <td className="px-5 py-3">
                            <Badge variant="outline" className="font-supporting uppercase tracking-wider text-[10px]">
                              {e.source}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-foreground">{e.label}</td>
                          <td className="px-5 py-3 text-muted-foreground font-mono text-xs">
                            {e.path || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
