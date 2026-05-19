/**
 * Watches the primary auth state (Replit `/api/auth/user`) and claims any
 * anonymous Strategy Lab analyses for the newly-signed-in user (Task #84).
 *
 * The Supabase auth context already runs the same claim on its own
 * onAuthStateChange. This component covers the Replit /api/login flow,
 * which is what the Strategy Lab Account Wall sends users through. After a
 * successful claim we (a) invalidate the user's Library query and (b) fire
 * a one-shot toast so the user sees confirmation that their in-progress
 * analyses survived the auth handoff.
 */
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

const SESSION_KEY = "pegasus.lab.sessionId";
const CLAIMED_FLAG = "pegasus.lab.claimedFor";

export function AnonymousClaimWatcher() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    if (inFlightRef.current) return;

    let sid: string | null = null;
    let alreadyClaimedFor: string | null = null;
    try {
      sid = window.localStorage.getItem(SESSION_KEY);
      alreadyClaimedFor = window.localStorage.getItem(CLAIMED_FLAG);
    } catch {
      return;
    }
    if (!sid) return;
    if (alreadyClaimedFor === String(user.id)) return;

    inFlightRef.current = true;
    fetch("/api/property-analyses/claim", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sid }),
    })
      .then(async (r) => {
        if (!r.ok) return;
        const body = (await r.json().catch(() => ({}))) as { claimed?: number; latestAnalysisId?: number | null };
        try { window.localStorage.setItem(CLAIMED_FLAG, String(user.id)); } catch { /* ignore */ }
        queryClient.invalidateQueries({ queryKey: ["/api/property-analyses"] });
        if ((body.claimed ?? 0) > 0) {
          toast({
            title: "Saved to your library",
            description: `${body.claimed} Strategy Lab ${body.claimed === 1 ? "snapshot" : "snapshots"} moved into your account.`,
          });
          // Rehydrate the Lab if the user landed back on /strategy-lab
          // without an explicit analysisId — load the most recent draft
          // they had in progress before the auth handoff.
          if (body.latestAnalysisId && location === "/strategy-lab") {
            navigate(`/strategy-lab?analysisId=${body.latestAnalysisId}`, { replace: true });
          }
        }
      })
      .catch(() => undefined)
      .finally(() => {
        inFlightRef.current = false;
      });
  }, [isAuthenticated, user?.id, toast, location, navigate]);

  return null;
}
