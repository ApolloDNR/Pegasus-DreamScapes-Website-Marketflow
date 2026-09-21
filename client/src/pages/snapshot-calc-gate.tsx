/**
 * Snapshot share gate (/snapshot/calc/:token).
 *
 * The canonical short URL for any shared snapshot is /snapshot/calc/:token.
 * Two backends mint tokens at this path: the new property-analysis service
 * (Strategy Lab, Task #84) and the legacy saved-analysis calculator share
 * service. We probe the new service first; if it 404s we fall back to the
 * legacy calculator share view, so existing share links never break.
 */
import { lazy, Suspense, useEffect, useState } from "react";
import { useParams } from "wouter";
import { Loader2, RefreshCw } from "lucide-react";

const SnapshotProperty = lazy(() => import("@/pages/snapshot-property"));
const SnapshotCalc = lazy(() => import("@/pages/snapshot-calc"));

export default function SnapshotCalcGate() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [resolved, setResolved] = useState<
    "property" | "calc" | "loading" | "unavailable"
  >("loading");
  const [probeAttempt, setProbeAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setResolved("calc");
      return;
    }
    setResolved("loading");
    fetch(`/api/property-analyses/by-token/${encodeURIComponent(token)}`, {
      headers: { Accept: "application/json" },
    })
      .then((r) => {
        if (cancelled) return;
        if (r.ok) {
          setResolved("property");
          return;
        }
        setResolved(r.status === 404 ? "calc" : "unavailable");
      })
      .catch(() => {
        if (!cancelled) setResolved("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [probeAttempt, token]);

  if (resolved === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (resolved === "unavailable") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-cream px-6 text-navy">
        <div className="w-full max-w-lg text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Shared snapshot
          </p>
          <h1 className="font-serif text-3xl font-semibold sm:text-4xl">
            This snapshot is temporarily unavailable.
          </h1>
          <p className="mt-4 leading-relaxed text-navy/75">
            We could not verify the share link right now. The snapshot has not been
            classified as missing or expired. Try again in a moment.
          </p>
          <button
            type="button"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={() => setProbeAttempt((attempt) => attempt + 1)}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-cream">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      {resolved === "property" ? <SnapshotProperty /> : <SnapshotCalc />}
    </Suspense>
  );
}
