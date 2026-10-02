import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, authenticatedRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, XCircle, Clock } from "lucide-react";
import { PrivateDataError } from "@/components/private-data-state";

type HqOutboxRow = {
  id: number;
  idempotencyKey: string;
  surface: string;
  sourceId: number | null;
  payload: any;
  status: "pending" | "forwarding" | "forwarded" | "failed";
  attempts: number;
  lastAttemptAt: string | null;
  lastError: string | null;
  hqSubmissionId: string | null;
  forwardedAt: string | null;
  createdAt: string;
};

type HqOutboxPayload = { rows: HqOutboxRow[]; hqHealthy: boolean };

function isHqOutboxPayload(value: unknown): value is HqOutboxPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Partial<HqOutboxPayload>;
  return Array.isArray(candidate.rows) && typeof candidate.hqHealthy === "boolean";
}

const statusIcon = (s: string) => {
  if (s === "forwarded") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (s === "failed") return <XCircle className="h-4 w-4 text-red-600" />;
  if (s === "forwarding") return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
  return <Clock className="h-4 w-4 text-amber-600" />;
};

export default function AdminHqOutbox() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery<HqOutboxPayload>({
    queryKey: ["/api/admin/hq-outbox", statusFilter],
    queryFn: async () => {
      const qs = statusFilter ? `?status=${statusFilter}` : "";
      const res = await authenticatedRequest(`/api/admin/hq-outbox${qs}`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const retry = useMutation({
    mutationFn: async (id: number) => apiRequest("POST", `/api/admin/hq-outbox/${id}/retry`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/hq-outbox"] }),
  });

  const drain = useMutation({
    mutationFn: async () => apiRequest("POST", `/api/admin/hq-outbox/drain`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/hq-outbox"] }),
  });
  const hasVerifiedData = isHqOutboxPayload(data);
  const dataUnavailable = isError || (!isLoading && !hasVerifiedData);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 rounded-md border-l-4 border-copper bg-cream p-4 text-sm text-navy" data-testid="banner-hq-system-of-record">
        This page reports website-to-HQ forwarding attempts. Confirm the corresponding record in Pegasus HQ before treating a capture as received there.
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display text-navy">Pegasus HQ Outbox</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>HQ endpoint health:</span>
            <Badge
              variant={
                isLoading || dataUnavailable
                  ? "outline"
                  : hasVerifiedData && data.hqHealthy
                    ? "default"
                    : "destructive"
              }
              data-testid="badge-hq-health"
            >
              {isLoading
                ? "Checking…"
                : dataUnavailable
                  ? "Unavailable"
                    : hasVerifiedData && data.hqHealthy
                    ? "Live"
                    : "Reported down — captures remain queued"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
            data-testid="select-status-filter"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="forwarding">Forwarding</option>
            <option value="forwarded">Forwarded</option>
            <option value="failed">Failed</option>
          </select>
          <Button
            onClick={() => drain.mutate()}
            disabled={drain.isPending || isLoading || dataUnavailable}
            data-testid="button-drain-pending"
          >
            {drain.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Drain pending
          </Button>
        </div>
      </div>

      {isLoading && <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>}

      {dataUnavailable && (
        <PrivateDataError
          title="HQ outbox unavailable"
          description="The outbox request failed, so queue contents and endpoint health cannot be verified. No empty-queue or outage claim is shown from this failed response."
          onRetry={() => void refetch()}
          isRetrying={isFetching}
          testId="state-hq-outbox-error"
        />
      )}

      {(retry.isError || drain.isError) && (
        <div
          className="mb-4 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm"
          role="alert"
          data-testid="state-hq-outbox-action-error"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <span>The requested outbox action did not complete. Refresh the verified queue state before trying again.</span>
        </div>
      )}

      {!isLoading && hasVerifiedData && data.rows.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No outbox rows.</CardContent></Card>
      )}

      <div className="space-y-3">
        {hasVerifiedData && data.rows.map((row) => (
          <Card key={row.id} data-testid={`row-outbox-${row.id}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  {statusIcon(row.status)}
                  <span className="font-mono text-sm">#{row.id}</span>
                  <Badge variant="outline">{row.surface}</Badge>
                  <Badge>{row.status}</Badge>
                  {row.hqSubmissionId && (
                    <span className="text-xs text-muted-foreground" data-testid={`text-hq-id-${row.id}`}>
                      HQ: {row.hqSubmissionId}
                    </span>
                  )}
                </div>
                {(row.status === "failed" || row.status === "pending") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => retry.mutate(row.id)}
                    disabled={retry.isPending}
                    data-testid={`button-retry-${row.id}`}
                  >
                    Retry
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <div><strong>Contact:</strong> {row.payload?.contactName} ({row.payload?.outreachReason})</div>
              {row.payload?.propertyAddress && <div><strong>Property:</strong> {row.payload.propertyAddress}</div>}
              <div className="text-xs text-muted-foreground">
                Attempts: {row.attempts} · Created: {new Date(row.createdAt).toLocaleString()}
                {row.lastAttemptAt && ` · Last: ${new Date(row.lastAttemptAt).toLocaleString()}`}
              </div>
              {row.lastError && (
                <div className="text-xs text-red-600 mt-1 flex items-start gap-1">
                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{row.lastError}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
