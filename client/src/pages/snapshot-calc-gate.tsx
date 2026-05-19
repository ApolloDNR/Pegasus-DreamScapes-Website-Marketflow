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
import { Loader2 } from "lucide-react";

const SnapshotProperty = lazy(() => import("@/pages/snapshot-property"));
const SnapshotCalc = lazy(() => import("@/pages/snapshot-calc"));

export default function SnapshotCalcGate() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [resolved, setResolved] = useState<"property" | "calc" | "loading">("loading");

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setResolved("calc");
      return;
    }
    fetch(`/api/property-analyses/by-token/${encodeURIComponent(token)}`, {
      headers: { Accept: "application/json" },
    })
      .then((r) => {
        if (cancelled) return;
        setResolved(r.ok ? "property" : "calc");
      })
      .catch(() => {
        if (!cancelled) setResolved("calc");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (resolved === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
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
