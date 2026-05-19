import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

/**
 * Persist a send-history row only when the email was originated by the
 * analysis owner. Public-share-token sends (anonymous viewers) are
 * intentionally not recorded so the owner's "Sent to" list stays accurate
 * to who *they* personally sent the analysis to.
 *
 * Returns true if the row was persisted, false if the send was not
 * owner-originated OR if persistence threw (the email itself has already
 * been delivered before this is called, so we never re-throw — the caller
 * surfaces the result via `historyPersisted` on the success response).
 */
export async function recordOwnerOriginatedSend(input: {
  analysisId: number;
  analysisOwnerId: string;
  senderUserId: string | null;
  recipientName: string;
  recipientEmail: string;
}): Promise<{ recorded: boolean; ownerOriginated: boolean }> {
  const ownerOriginated =
    input.senderUserId !== null &&
    input.senderUserId === input.analysisOwnerId;
  if (!ownerOriginated) return { recorded: false, ownerOriginated: false };
  try {
    await storage.createAnalysisSend({
      savedAnalysisId: input.analysisId,
      recipientName: input.recipientName,
      recipientEmail: input.recipientEmail,
      senderUserId: input.senderUserId,
    });
    return { recorded: true, ownerOriginated: true };
  } catch (err) {
    console.error("Failed to persist analysis send history:", err);
    return { recorded: false, ownerOriginated: true };
  }
}

/**
 * Owner-only endpoint that returns the most-recent recipients an owner has
 * emailed a saved analysis to. Extracted into its own module so the
 * ownership check + storage wiring can be exercised by integration tests in
 * server/__tests__/analysis-send-history.test.ts without booting the full
 * Express app.
 */
export function registerAnalysisSendHistoryRoutes(
  app: Express,
  deps: { isAuthenticated: RequestHandler },
) {
  app.get(
    "/api/saved-analyses/:id/sends",
    deps.isAuthenticated,
    async (req: any, res) => {
      try {
        const id = Number(req.params.id);
        if (!Number.isFinite(id) || id <= 0) {
          return res.status(400).json({ message: "Invalid id" });
        }
        const analysis = await storage.getSavedAnalysis(id);
        if (!analysis) {
          return res.status(404).json({ message: "Analysis not found" });
        }
        if (analysis.userId !== req.user.claims.sub) {
          return res.status(403).json({ message: "Not authorized" });
        }
        // Defensive filter: only surface sends originated by the owner.
        // Persistence already gates on owner-originated sends, but we filter
        // here too so any historical/anomalous rows can't leak.
        const all = await storage.getAnalysisSends(id, 25);
        const ownerSends = all
          .filter((s) => s.senderUserId === analysis.userId)
          .slice(0, 5);
        res.json(ownerSends);
      } catch (error) {
        console.error("Error fetching analysis sends:", error);
        res.status(500).json({ message: "Failed to fetch send history" });
      }
    },
  );
}
