import type { Express, RequestHandler } from "express";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { insertLeadSchema } from "../../shared/schema";
import { normalizePegasusLeadSubmission } from "../../shared/lead-routing";
import { normalizeLeadConsent, validateLeadConsentRequirement, mergeLeadConsentAudit } from "../lead-intake-policy";
import { recordWebsiteInquiry } from "./intake";
import { parseIdempotencyKey, IntakeConflictError, IntakeConfigurationError } from "./intake-policy";
import { getVerifiedWebsiteAuthSubject } from "./identity";
import type { WebsiteDb } from "./db";

export function registerWebsiteLeadRoute(app: Express, options: {db: WebsiteDb; rateLimit: RequestHandler}) {
  app.post("/api/leads", options.rateLimit, async (req: any, res) => {
    try {
      // Empire Doctrine v1.0.1 — server-truth anti-spam for /submit and
      // /marketflow/access submissions. Honeypot hp_company must be empty;
      // ts_elapsed_ms must be at least 3000 (3-second time-on-form).
      // Client-side checks exist for UX, but the server is the
      // authoritative gate so a scripted POST bypassing the React form
      // cannot reach storage.
      const lt = req.body?.leadType;
      if (lt === "submit" || lt === "marketflow_access") {
        const hp = req.body?.leadData?.hp_company ?? req.body?.hp_company ?? "";
        if (typeof hp === "string" && hp.trim().length > 0) {
          return res.status(400).json({ message: "Submission rejected." });
        }
        const elapsed = Number(
          req.body?.leadData?.ts_elapsed_ms ?? req.body?.ts_elapsed_ms ?? 0,
        );
        if (!Number.isFinite(elapsed) || elapsed < 3000) {
          return res.status(400).json({
            message: "Form submitted too fast. Please try again.",
          });
        }
        // Strip honeypot before persisting so it never lands in storage.
        if (req.body?.leadData && typeof req.body.leadData === "object") {
          delete req.body.leadData.hp_company;
        }
      }

      // Consent is a factual, versioned part of the intake record. Only an
      // explicit boolean counts; contact permission never doubles as a privacy
      // acknowledgement. Migrated public surfaces must provide it before the
      // lead is stored or forwarded.
      const normalizedConsent = normalizeLeadConsent(req.body);
      const consentRequirement = validateLeadConsentRequirement(lt, normalizedConsent);
      if (!consentRequirement.ok) {
        return res.status(400).json({ message: consentRequirement.message });
      }
      req.body.leadData = mergeLeadConsentAudit(req.body?.leadData, normalizedConsent, {
        leadType: lt,
        source: req.body?.source,
      });

      // Reusable Pegasus forms enter through the consent-gated `submit`
      // surface, then receive a server-owned operational lane. Never trust a
      // client-provided lane or treat generic context as a property address.
      req.body = normalizePegasusLeadSubmission(req.body);

      // Empire Doctrine v1.0.1 — explicit boundary mapping for MarketFlow
      // access requests. /api/leads is the persistence path of record, but
      // marketflow_access submissions are conceptually a distinct
      // canonical shape — `marketflow_access_requests` — and we project
      // them into that shape server-side so downstream consumers
      // (analytics, future dedicated table) can subscribe to a stable
      // contract independent of the underlying leads table.
      if (lt === "marketflow_access") {
        const ld: any = req.body?.leadData ?? {};
        const marketflow_access_request = {
          shape: "marketflow_access_requests",
          version: 1,
          firstName: req.body?.firstName ?? "",
          lastName: req.body?.lastName ?? "",
          email: req.body?.email ?? "",
          role: ld.role ?? "",
          introducedBy: ld.introducedBy ?? "",
          notes: ld.notes ?? "",
          consentContact: normalizedConsent.consentContact,
          consentCcpaAcknowledged: normalizedConsent.consentCcpaAcknowledged,
          source: req.body?.source ?? "marketflow_access_page",
          submittedAt: new Date().toISOString(),
        };
        console.info("[marketflow_access_requests] accepted");
        // Persist the canonical shape inside leadData under a versioned
        // key so the leads row carries the full access-request envelope.
        if (req.body?.leadData && typeof req.body.leadData === "object") {
          req.body.leadData.marketflow_access_request = marketflow_access_request;
        }
      }

      // Empire Doctrine v1.0.2 Amendment 1 C.8 — Pegasus Buyboxes free
      // interest list. Submissions arrive as email-only signals; insert
      // the canonical placeholder firstName + source so the request
      // satisfies the leads schema without forcing the public form to
      // ask for a name. The buybox identity lives in leadData.buyboxId.
      if (lt === "buybox_interest") {
        if (!req.body.firstName || typeof req.body.firstName !== "string" || !req.body.firstName.trim()) {
          req.body.firstName = "Buybox Subscriber";
        }
        if (!req.body.source || typeof req.body.source !== "string" || !req.body.source.trim()) {
          req.body.source = "buyboxes";
        }
      }

      const parseResult = insertLeadSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid lead data", 
          errors: fromError(parseResult.error).toString() 
        });
      }
      
      const result = await recordWebsiteInquiry({
        kind: "lead", payload: parseResult.data,
        idempotencyKey: parseIdempotencyKey(req.headers["idempotency-key"]),
        authSubject: getVerifiedWebsiteAuthSubject(req),
      }, options.db);
      // Creation receipts never expose mutable staff fields on public replay.
      return res.status(201).json({ id: result.record.id, stage: "new" });
    } catch (error) {
      if (error instanceof IntakeConfigurationError) return res.status(503).json({ message: "Submission is temporarily unavailable. Please try again later." });
      if (error instanceof IntakeConflictError) return res.status(409).json({ message: error.message });
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid submission or request key." });
      console.error("[leads] unable to record submission");
      return res.status(500).json({ message: "Failed to create lead" });
    }
  });
}
