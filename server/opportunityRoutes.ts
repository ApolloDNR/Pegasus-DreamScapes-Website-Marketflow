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
import { routeOpportunity } from "./opportunityRouting";
import {
  forward as hqForward,
  outreachReasonForLeadType,
} from "./integrations/hq-client";

// ============================================================
// PUBLIC WEBSITE v1 — OPPORTUNITY INTAKE + DEAL ROUTING
// PRD: docs/website-v1/PEGASUS_PUBLIC_WEBSITE_PRD_V1.md §11
// Routing logic: ROUTING_FORMS_AND_DATA_SCHEMA.md §3
// Every public form creates one structured opportunity record,
// pre-routed to the department that should read it first.
// ============================================================

const CONFIRMATION_BODY =
  "Thank you for submitting your property, deal, or request to Pegasus Dreamscapes. " +
  "We received your information and will review it to determine the appropriate lane. " +
  "If there is a fit or if we need more information, we will follow up with the next step.\n\n" +
  "No agency relationship, offer, or agreement is created by submitting this form.";

export const OPPORTUNITY_CONTACT_CONSENT_VERSION =
  "bring-opportunity-contact-v1";

function hqLeadTypeForVisitor(visitorType: string): string {
  switch (visitorType) {
    case "owner":
    case "owner_representative":
    case "deal_finder":
      return "seller";
    case "buyer":
      return "buyer";
    case "capital_partner":
      return "investor";
    case "vendor_operator":
      return "vendor";
    default:
      return "contact";
  }
}

function fullPropertyAddress(opportunity: InsertOpportunity): string | undefined {
  // The public form defaults state to CA. Do not manufacture an address from
  // that default when the visitor brought a partnership or another non-property
  // opportunity and supplied no location at all.
  if (!opportunity.propertyAddress && !opportunity.city && !opportunity.zipCode) {
    return undefined;
  }
  const stateAndZip = [opportunity.state, opportunity.zipCode].filter(Boolean).join(" ");
  const locality = [opportunity.city, stateAndZip].filter(Boolean).join(", ");
  return [opportunity.propertyAddress, locality].filter(Boolean).join(", ") || undefined;
}

function sourceChannelForOpportunity(opportunity: InsertOpportunity): string {
  const source = (
    opportunity.sourcePage ||
    opportunity.leadSource ||
    "bring-an-opportunity"
  ).replace(/^\/+/, "");
  return `website:${source || "bring-an-opportunity"}`;
}

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
      const consentCapturedAt = new Date();
      const [row] = await db
        .insert(opportunities)
        .values({
          ...(parsed.data as InsertOpportunity),
          ...routed,
          status: "New",
          consentCopyVersion: OPPORTUNITY_CONTACT_CONSENT_VERSION,
          consentCapturedAt,
        })
        .returning();

      // Queue the canonical HQ intake payload before responding. As with
      // /api/leads, hqForward persists to hq_outbox first and performs the
      // network attempt asynchronously, so HQ downtime cannot lose or block
      // a locally recorded opportunity. Opportunity ids are UUIDs, while the
      // outbox sourceId is integer-only, so correlation lives in `extra`.
      try {
        await hqForward({
          surface: "lead",
          payload: {
            propertyAddress: fullPropertyAddress(parsed.data),
            contactName: parsed.data.contactName,
            contactEmail: parsed.data.email,
            contactPhone: parsed.data.phone || undefined,
            outreachReason: outreachReasonForLeadType(
              parsed.data.leadSource === "blueprint_request"
                ? "blueprint_request"
                : hqLeadTypeForVisitor(parsed.data.visitorType),
            ),
            sourceChannel: sourceChannelForOpportunity(parsed.data),
            consentContact: parsed.data.consentAccepted,
            // The public checkbox authorizes follow-up about this submission;
            // it does not separately acknowledge a CCPA/privacy disclosure.
            consentCcpaAcknowledged: false,
            extra: {
              ...parsed.data,
              consentAudit: {
                consentContact: true,
                consentCcpaAcknowledged: false,
                version: OPPORTUNITY_CONTACT_CONSENT_VERSION,
                capturedAt: consentCapturedAt.toISOString(),
              },
              opportunityId: row.id,
              recommendedLane: routed.recommendedLane,
              assignedDepartment: routed.assignedDepartment,
            },
          },
        });
      } catch (err) {
        console.error("[hq-forward] opportunity queue error (non-blocking):", err);
      }

      // Best-effort notifications — a mail failure must never lose the lead.
      const summary =
        `${parsed.data.visitorType} — ` +
        (parsed.data.propertyAddress || parsed.data.contactName);
      Promise.allSettled([
        sendEmail({
          to:
            process.env.STAFF_NOTIFICATION_EMAIL ||
            process.env.INTERNAL_NOTIFY_EMAIL ||
            "apollo@pegasusdreamscapes.com",
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
