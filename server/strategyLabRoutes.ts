/**
 * Strategy Lab — Submit / Blueprint / Touchpoint routes (Task #85).
 *
 * Endpoints:
 *  POST  /api/strategy-lab/touchpoint           anon ok — funnel telemetry
 *  GET   /api/strategy-lab/blueprint-tiers      public — by-review status only
 *  POST  /api/strategy-lab/submit               escalated submit-to-Pegasus
 *  POST  /api/strategy-lab/blueprint-order      disabled public checkout path
 *  GET   /api/admin/strategy-lab                admin only — funnel + submissions + orders
 *  PATCH /api/admin/strategy-lab/submissions/:id/status   admin only
 */
import type { Express, Request, Response, RequestHandler } from "express";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { storage } from "./storage";
import { sendPegasusSubmissionNotification } from "./email";
import { generateStrategySnapshotPDF } from "./pdf";

interface AuthCtx {
  isAuthenticated: RequestHandler;
  adminEmails: string[];
}

type AuthedRequest = Request & {
  user?: { claims?: { sub?: string; email?: string } };
};

function authUserId(req: Request): string | null {
  const u = (req as AuthedRequest).user;
  return u?.claims?.sub ?? req.supabaseUser?.id ?? null;
}

function authUserEmail(req: Request): string | null {
  const u = (req as AuthedRequest).user;
  return (u?.claims?.email ?? req.supabaseUser?.email ?? null)?.toLowerCase() ?? null;
}

// 48 business hours from `from` (skipping Sat/Sun, no holiday calendar).
function addBusinessHours(from: Date, hours: number): Date {
  const d = new Date(from.getTime());
  let remaining = hours;
  while (remaining > 0) {
    d.setHours(d.getHours() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return d;
}

export function registerStrategyLabRoutes(app: Express, ctx: AuthCtx) {
  const { isAuthenticated, adminEmails } = ctx;
  const adminAllow = adminEmails.map((e) => e.toLowerCase());

  const requireAdmin: RequestHandler = (req, res, next) => {
    const email = authUserEmail(req);
    if (!email || !adminAllow.includes(email)) {
      return res.status(403).json({ error: "admin only" });
    }
    next();
  };

  // ── Touchpoint telemetry (anonymous OK) ────────────────────────────────
  const touchpointSchema = z.object({
    sessionId: z.string().min(8).max(64).optional(),
    propertyAnalysisId: z.number().int().positive().optional(),
    action: z.string().min(1).max(32),
    laneVerdict: z.string().max(24).optional(),
    topLane: z.string().max(32).optional(),
    payload: z.record(z.any()).optional(),
  });

  app.post("/api/strategy-lab/touchpoint", async (req, res) => {
    try {
      const parsed = touchpointSchema.parse(req.body ?? {});
      const userId = authUserId(req);
      const row = await storage.createStrategyLabTouchpoint({
        userId: userId ?? null,
        sessionId: parsed.sessionId ?? null,
        propertyAnalysisId: parsed.propertyAnalysisId ?? null,
        action: parsed.action,
        laneVerdict: parsed.laneVerdict ?? null,
        topLane: parsed.topLane ?? null,
        payload: parsed.payload ?? null,
      });
      res.json({ id: row.id });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: fromError(err).toString() });
      }
      console.error("touchpoint error:", err);
      res.status(500).json({ error: "Could not record touchpoint" });
    }
  });

  // ── Deal Blueprint public mode (by review, no public fixed pricing) ────
  app.get("/api/strategy-lab/blueprint-tiers", async (_req, res) => {
    res.json({
      tiers: [],
      stripeEnabled: false,
      mode: "by_review",
      requestPath: "/submit?intent=blueprint",
      message:
        "Deal Blueprints are scoped and quoted per property after Pegasus reviews the situation.",
    });
  });

  // ── Submit-to-Pegasus (rich submission row + email + PDF attached) ─────
  const submitSchema = z.object({
    propertyAnalysisId: z.number().int().positive(),
    sessionId: z.string().min(8).max(64).optional(),
    submitterName: z.string().max(200).optional(),
    submitterEmail: z.string().email().max(255).optional(),
    submitterPhone: z.string().max(40).optional(),
    submitterRole: z.string().max(32).optional(),
    notes: z.string().max(4000).optional(),
  });

  app.post("/api/strategy-lab/submit", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = submitSchema.parse(req.body ?? {});
      const userId = authUserId(req);
      const userEmail = authUserEmail(req);
      const analysis = await storage.getPropertyAnalysis(parsed.propertyAnalysisId);
      if (!analysis) return res.status(404).json({ error: "Analysis not found" });
      // Strict ownership: if the analysis is owned, requester must be the
      // owner; if it is anonymous (sessionId-based), the submitted sessionId
      // must match. Prevents an authenticated user from submitting an
      // analysis they do not own by guessing IDs.
      if (analysis.userId) {
        if (!userId || analysis.userId !== userId) {
          return res.status(403).json({ error: "Not your analysis" });
        }
      } else if (analysis.sessionId) {
        if (!parsed.sessionId || parsed.sessionId !== analysis.sessionId) {
          return res.status(403).json({ error: "Not your analysis" });
        }
      }

      const slaDueAt = addBusinessHours(new Date(), 48);

      const submission = await storage.createPegasusSubmission({
        propertyAnalysisId: parsed.propertyAnalysisId,
        userId: userId ?? null,
        sessionId: parsed.sessionId ?? null,
        submitterName: parsed.submitterName ?? null,
        submitterEmail: parsed.submitterEmail ?? userEmail ?? null,
        submitterPhone: parsed.submitterPhone ?? null,
        submitterRole: parsed.submitterRole ?? null,
        notes: parsed.notes ?? null,
        topLane: analysis.topLane ?? null,
        topLaneVerdict: analysis.topLaneVerdict ?? null,
        status: "received",
        slaDueAt,
      });

      // Mark the analysis as submitted (legacy boolean) so the library page
      // can still surface it.
      await storage.updatePropertyAnalysis(parsed.propertyAnalysisId, { submittedToPegasus: true });

      // Touchpoint.
      await storage.createStrategyLabTouchpoint({
        userId: userId ?? null,
        sessionId: parsed.sessionId ?? null,
        propertyAnalysisId: parsed.propertyAnalysisId,
        action: "submit",
        laneVerdict: analysis.topLaneVerdict ?? null,
        topLane: analysis.topLane ?? null,
        payload: { submissionId: submission.id },
      });

      // Build PDF + send email (best-effort, non-blocking on failure).
      try {
        const pdfBuf = await generateStrategySnapshotPDF(analysis);
        await sendPegasusSubmissionNotification({
          submissionId: submission.id,
          propertyAnalysisId: analysis.id,
          address: [analysis.address, analysis.city, analysis.state].filter(Boolean).join(", ") || "(no address)",
          topLane: analysis.topLane ?? null,
          topLaneVerdict: analysis.topLaneVerdict ?? null,
          submitterName: parsed.submitterName ?? null,
          submitterEmail: parsed.submitterEmail ?? userEmail ?? null,
          submitterPhone: parsed.submitterPhone ?? null,
          submitterRole: parsed.submitterRole ?? null,
          notes: parsed.notes ?? null,
          slaDueAt,
          pdfBuffer: pdfBuf,
        });
      } catch (emailErr) {
        console.error("submission email failed (non-fatal):", emailErr);
      }

      res.json({
        submissionId: submission.id,
        slaDueAt: slaDueAt.toISOString(),
        slaLabel: "48 business hours",
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: fromError(err).toString() });
      }
      console.error("submit-to-pegasus error:", err);
      res.status(500).json({ error: "Could not submit" });
    }
  });

  // ── Public Blueprint checkout/order path intentionally disabled ────────
  app.post("/api/strategy-lab/blueprint-order", isAuthenticated, async (_req, res) => {
    res.status(410).json({
      error: "Deal Blueprint checkout is not available publicly.",
      mode: "by_review",
      requestPath: "/submit?intent=blueprint",
      message:
        "Deal Blueprints are scoped and quoted per property after Pegasus reviews the situation.",
    });
  });

  // ── Owner / admin GET single submission (for /strategy-lab/submitted) ─
  app.get("/api/strategy-lab/submission/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (!Number.isFinite(id)) return res.status(400).json({ error: "bad id" });
      const row = await storage.getPegasusSubmission(id);
      if (!row) return res.status(404).json({ error: "not found" });
      const userId = authUserId(req);
      const email = authUserEmail(req);
      const isOwner = userId && row.userId && userId === row.userId;
      const isAdmin = email && adminAllow.includes(email);
      if (!isOwner && !isAdmin) return res.status(403).json({ error: "forbidden" });
      res.json(row);
    } catch (err) {
      console.error("submission get error:", err);
      res.status(500).json({ error: "Could not load submission" });
    }
  });

  // ── Admin funnel view ──────────────────────────────────────────────────
  app.get("/api/admin/strategy-lab", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const sinceDays = Math.min(parseInt(String(req.query.sinceDays ?? "30"), 10) || 30, 365);
      const [touchpoints, submissions, orders] = await Promise.all([
        storage.listStrategyLabTouchpoints({ sinceDays, limit: 1000 }),
        storage.listPegasusSubmissions({ limit: 200 }),
        storage.listBlueprintOrders({ limit: 200 }),
      ]);

      // Aggregate funnel.
      const counts: Record<string, number> = {};
      for (const t of touchpoints) counts[t.action] = (counts[t.action] ?? 0) + 1;

      // Submissions past their SLA window without review.
      const now = Date.now();
      const escalated = submissions.filter((s) =>
        !s.reviewedAt && s.slaDueAt && new Date(s.slaDueAt).getTime() < now,
      ).length;

      res.json({
        sinceDays,
        funnel: counts,
        submissions,
        orders,
        escalatedCount: escalated,
        recentTouchpoints: touchpoints.slice(0, 200),
      });
    } catch (err) {
      console.error("admin strategy-lab error:", err);
      res.status(500).json({ error: "Could not load admin view" });
    }
  });

  app.patch("/api/admin/strategy-lab/submissions/:id/status", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const status = String(req.body?.status ?? "");
      const reviewNotes = req.body?.reviewNotes ? String(req.body.reviewNotes) : undefined;
      if (!["received", "in_review", "reviewed", "routed", "escalated"].includes(status)) {
        return res.status(400).json({ error: "invalid status" });
      }
      const reviewedAt = ["reviewed", "routed"].includes(status) ? new Date() : undefined;
      const updated = await storage.updatePegasusSubmission(id, {
        status,
        reviewedAt,
        reviewedBy: authUserEmail(req) ?? undefined,
        reviewNotes,
      });
      if (!updated) return res.status(404).json({ error: "not found" });
      res.json(updated);
    } catch (err) {
      console.error("submission status error:", err);
      res.status(500).json({ error: "Could not update status" });
    }
  });
}
