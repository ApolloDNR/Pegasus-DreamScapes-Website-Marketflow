import type { Express, RequestHandler } from "express";
import { db } from "./db";
import { and, desc, eq } from "drizzle-orm";
import {
  opportunities,
  insertOpportunitySchema,
  OPPORTUNITY_STATUSES,
} from "@shared/schema";
import { z } from "zod";
import { routeOpportunity } from "./opportunityRouting";
import { recordWebsiteInquiry } from "./website/intake";
import { parseIdempotencyKey, IntakeConfigurationError, IntakeConflictError } from "./website/intake-policy";
import { getVerifiedWebsiteAuthSubject } from "./website/identity";
import { createWebsiteStaffGuard } from "./website/staff-guard";
export { OPPORTUNITY_CONTACT_CONSENT_VERSION } from "./website/intake-values";

export function registerOpportunityRoutes(
  app: Express,
  guards: {
    isAuthenticated: RequestHandler;
    requireStaffRole: RequestHandler;
    publicIntakeRateLimit: RequestHandler;
  },
) {
  const requireWebsiteStaff = createWebsiteStaffGuard({ db });
  // Public intake. Mirrors the /api/leads server-truth anti-spam doctrine:
  // honeypot must be empty and the form must have been open >= 3s.
  app.post("/api/opportunities", guards.publicIntakeRateLimit, async (req, res) => {
    try {
      const hp = req.body?.hp_company ?? "";
      if (typeof hp === "string" && hp.trim().length > 0) {
        return res.status(400).json({ message: "Submission rejected." });
      }
      const elapsed = Number(req.body?.ts_elapsed_ms ?? 0);
      if (!Number.isFinite(elapsed) || elapsed < 3000) {
        return res
          .status(400)
          .json({ message: "Form submitted too fast. Please try again." });
      }
      const { hp_company: _hp, ts_elapsed_ms: _ts, ...candidate } = req.body ?? {};

      const parsed = insertOpportunitySchema.safeParse(candidate);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid submission.",
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        });
      }

      const routed = routeOpportunity(parsed.data);
      const result = await recordWebsiteInquiry({
        kind: "opportunity",
        payload: { ...parsed.data, ...routed },
        idempotencyKey: parseIdempotencyKey(req.headers["idempotency-key"]),
        authSubject: getVerifiedWebsiteAuthSubject(req),
      }, db);
      return res.status(201).json({
        id: result.record.id,
        status: "New",
        recommendedLane: result.row.recommendedLane,
        assignedDepartment: result.row.assignedDepartment,
      });
    } catch (err) {
      if (err instanceof IntakeConfigurationError) return res.status(503).json({ message: "Submission is temporarily unavailable. Please try again later." });
      if (err instanceof IntakeConflictError) return res.status(409).json({ message: err.message });
      if (err instanceof z.ZodError) return res.status(400).json({ message: "Invalid submission or request key." });
      console.error("[opportunities] unable to record submission");
      return res.status(500).json({ message: "Unable to record submission." });
    }
  });

  // Staff-only list + status transitions for the internal review desk.
  app.get(
    "/api/opportunities",
    requireWebsiteStaff,
    async (req, res) => {
      try {
        const rows = await db
          .select()
          .from(opportunities)
          .where(eq(opportunities.orgId, req.websiteStaff!.orgId))
          .orderBy(desc(opportunities.createdAt))
          .limit(200);
        res.json(rows);
      } catch (err) {
        console.error("[opportunities] list failed", err);
        res.status(500).json({ message: "Unable to load opportunities." });
      }
    },
  );

  app.patch(
    "/api/opportunities/:id/status",
    requireWebsiteStaff,
    async (req, res) => {
      try {
        const status = req.body?.status;
        if (!OPPORTUNITY_STATUSES.includes(status)) {
          return res.status(400).json({
            message: "Unknown status.",
            allowed: OPPORTUNITY_STATUSES,
          });
        }
        const [row] = await db
          .update(opportunities)
          .set({ status, updatedAt: new Date() })
          .where(and(eq(opportunities.id, req.params.id), eq(opportunities.orgId, req.websiteStaff!.orgId)))
          .returning();
        if (!row) return res.status(404).json({ message: "Not found." });
        res.json(row);
      } catch (err) {
        console.error("[opportunities] status update failed", err);
        res.status(500).json({ message: "Unable to update status." });
      }
    },
  );
}
