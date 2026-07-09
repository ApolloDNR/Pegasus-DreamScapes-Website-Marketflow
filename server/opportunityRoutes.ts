import type { Express, RequestHandler } from "express";
import { db } from "./db";
import { desc, eq } from "drizzle-orm";
import {
  opportunities,
  insertOpportunitySchema,
  OPPORTUNITY_STATUSES,
  type InsertOpportunity,
} from "@shared/schema";
import { sendEmail } from "./email";

// ============================================================
// PUBLIC WEBSITE v1 — OPPORTUNITY INTAKE + DEAL ROUTING
// PRD: docs/website-v1/PEGASUS_PUBLIC_WEBSITE_PRD_V1.md §11
// Routing logic: ROUTING_FORMS_AND_DATA_SCHEMA.md §3
// Every public form creates one structured opportunity record,
// pre-routed to the department that should read it first.
// ============================================================

type Routed = { recommendedLane: string; assignedDepartment: string };

export function routeOpportunity(o: {
  visitorType: string;
  situation?: string | null;
  goal?: string | null;
}): Routed {
  const situation = (o.situation ?? "").toLowerCase();
  const goal = (o.goal ?? "").toLowerCase();

  // Goal-level overrides that outrank the visitor-type default.
  if (goal.includes("list through") || goal.includes("keller williams")) {
    return {
      recommendedLane: "Strategy Review → Work With Apollo / Keller Williams",
      assignedDepartment: "Work With Apollo / KW",
    };
  }
  if (goal.includes("hold") || goal.includes("rent")) {
    return {
      recommendedLane: "Acquisitions → Development → Asset Management",
      assignedDepartment: "Acquisitions",
    };
  }
  if (goal.includes("find buyer")) {
    return {
      recommendedLane: "Acquisitions → Dispositions / MarketFlow",
      assignedDepartment: "Acquisitions",
    };
  }

  switch (o.visitorType) {
    case "owner":
    case "owner_representative":
      if (situation.includes("just exploring") || goal.includes("not sure")) {
        return {
          recommendedLane: "Strategy Review first, then routed",
          assignedDepartment: "Strategy Review",
        };
      }
      return {
        recommendedLane: "Acquisitions → (Development) → Dispositions",
        assignedDepartment: "Acquisitions",
      };
    case "deal_finder":
      return {
        recommendedLane: "Acquisitions → Dispositions / MarketFlow",
        assignedDepartment: "Acquisitions",
      };
    case "buyer":
      return {
        recommendedLane: "Work With Apollo / MarketFlow buyer network",
        assignedDepartment: "Work With Apollo / KW",
      };
    case "capital_partner":
      return {
        recommendedLane: "Private project-by-project review",
        assignedDepartment: "Private Capital Review",
      };
    case "vendor_operator":
      return {
        recommendedLane: "Development vendor bench",
        assignedDepartment: "Vendor Bench",
      };
    case "referral_partner":
      return {
        recommendedLane: "Referral intake → appropriate lane",
        assignedDepartment: "Acquisitions",
      };
    case "strategy_only":
      return {
        recommendedLane: "Strategy Review first, then routed",
        assignedDepartment: "Strategy Review",
      };
    default:
      return {
        recommendedLane: "Needs manual review",
        assignedDepartment: "Acquisitions",
      };
  }
}

const CONFIRMATION_BODY =
  "Thank you for submitting your property, deal, or request to Pegasus Dreamscapes. " +
  "We received your information and will review it to determine the appropriate lane. " +
  "If there is a fit or if we need more information, we will follow up with the next step.\n\n" +
  "No agency relationship, offer, or agreement is created by submitting this form.";

export function registerOpportunityRoutes(
  app: Express,
  guards: { isAuthenticated: RequestHandler; requireStaffRole: RequestHandler },
) {
  // Public intake. Mirrors the /api/leads server-truth anti-spam doctrine:
  // honeypot must be empty and the form must have been open >= 3s.
  app.post("/api/opportunities", async (req, res) => {
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
      const [row] = await db
        .insert(opportunities)
        .values({ ...(parsed.data as InsertOpportunity), ...routed, status: "New" })
        .returning();

      // Best-effort notifications — a mail failure must never lose the lead.
      const summary =
        `${parsed.data.visitorType} — ` +
        (parsed.data.propertyAddress || parsed.data.contactName);
      Promise.allSettled([
        sendEmail({
          to: process.env.INTERNAL_NOTIFY_EMAIL || "apollo@pegasusdreamscapes.com",
          subject: `New Pegasus Website Submission: ${summary}`,
          text:
            `Visitor type: ${parsed.data.visitorType}\n` +
            `Contact: ${parsed.data.contactName} <${parsed.data.email}> ${parsed.data.phone ?? ""}\n` +
            `Property: ${parsed.data.propertyAddress ?? "—"}, ${parsed.data.city ?? ""} ${parsed.data.state ?? ""}\n` +
            `Situation: ${parsed.data.situation ?? "—"}\nGoal: ${parsed.data.goal ?? "—"}\n` +
            `Routed: ${routed.recommendedLane} (${routed.assignedDepartment})\n` +
            `Notes: ${parsed.data.notes ?? "—"}\n\nOpportunity ID: ${row.id}`,
        }),
        sendEmail({
          to: parsed.data.email,
          subject: "Pegasus Dreamscapes received your submission",
          text: CONFIRMATION_BODY,
        }),
      ]).catch(() => {});

      return res.status(201).json({
        id: row.id,
        status: row.status,
        recommendedLane: row.recommendedLane,
        assignedDepartment: row.assignedDepartment,
      });
    } catch (err) {
      console.error("[opportunities] intake failed", err);
      return res.status(500).json({ message: "Unable to record submission." });
    }
  });

  // Staff-only list + status transitions for the internal review desk.
  app.get(
    "/api/opportunities",
    guards.isAuthenticated,
    guards.requireStaffRole,
    async (_req, res) => {
      try {
        const rows = await db
          .select()
          .from(opportunities)
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
    guards.isAuthenticated,
    guards.requireStaffRole,
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
          .where(eq(opportunities.id, req.params.id))
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
