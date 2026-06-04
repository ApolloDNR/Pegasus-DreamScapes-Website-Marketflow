/**
 * Strategy Lab — Submit / Blueprint / Touchpoint routes (Task #85).
 *
 * Endpoints:
 *  POST  /api/strategy-lab/touchpoint           anon ok — funnel telemetry
 *  GET   /api/strategy-lab/blueprint-tiers      admin only — legacy Blueprint tier catalog
 *  POST  /api/strategy-lab/submit               escalated submit-to-Pegasus
 *  POST  /api/strategy-lab/blueprint-order      paid Blueprint order (Stripe or invoice)
 *  GET   /api/admin/strategy-lab                admin only — funnel + submissions + orders
 *  PATCH /api/admin/strategy-lab/submissions/:id/status   admin only
 */
import type { Express, Request, Response, RequestHandler } from "express";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { storage } from "./storage";
import {
  sendPegasusSubmissionNotification,
  sendBlueprintOrderNotification,
} from "./email";
import { extractSupabaseUser } from "./supabaseAuth";
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

// ───────────────────────────────────────────────────────────────────────────
// Blueprint tier defaults — CMS-overridable via siteContent keys.
// ───────────────────────────────────────────────────────────────────────────
const TIER_KEYS = ["singlepath", "comparison", "complete"] as const;
type TierKey = (typeof TIER_KEYS)[number];

const TIER_DEFAULTS: Record<TierKey, { title: string; priceCents: number; description: string; turnaroundDays: string }> = {
  singlepath: {
    title: "Single-Path Blueprint",
    priceCents: 49700,
    description:
      "One recommended lane underwritten end-to-end. Numbers, capital stack, risk register, and a 30-day execution memo.",
    turnaroundDays: "5–7 business days",
  },
  comparison: {
    title: "Comparison Blueprint",
    priceCents: 89700,
    description:
      "Two viable lanes underwritten side-by-side so you can choose with the math in front of you. Includes sensitivity heatmap and exit framing.",
    turnaroundDays: "7–10 business days",
  },
  complete: {
    title: "Complete Strategy Stack",
    priceCents: 149700,
    description:
      "Every lane that survives the screen, with creative-finance and JV variants. Includes capital partner intro framing and a written 90-day plan.",
    turnaroundDays: "10–14 business days",
  },
};

// CMS overrides accept both the canonical key family
//   `home.blueprint.tier.{key}.{field}` (per replit.md spec)
// and a shorter alias `blueprint.{key}.{field}` for operator convenience.
// The canonical form wins if both rows exist for the same field.
async function loadBlueprintTiers() {
  const tiers = await Promise.all(TIER_KEYS.map(async (key) => {
    const def = TIER_DEFAULTS[key];
    const [
      titleRow, priceRow, descRow, turnRow, scopeRow,
      titleAlt, priceAlt, descAlt, turnAlt, scopeAlt,
      priceDollarsAlt,
    ] = await Promise.all([
      storage.getSiteContent(`home.blueprint.tier.${key}.title`),
      storage.getSiteContent(`home.blueprint.tier.${key}.priceCents`),
      storage.getSiteContent(`home.blueprint.tier.${key}.description`),
      storage.getSiteContent(`home.blueprint.tier.${key}.turnaroundDays`),
      storage.getSiteContent(`home.blueprint.tier.${key}.scope`),
      storage.getSiteContent(`blueprint.${key}.title`),
      storage.getSiteContent(`blueprint.${key}.priceCents`),
      storage.getSiteContent(`blueprint.${key}.description`),
      storage.getSiteContent(`blueprint.${key}.turnaroundDays`),
      storage.getSiteContent(`blueprint.${key}.scope`),
      storage.getSiteContent(`blueprint.${key}.price`),
    ]);
    const rawPriceCents = priceRow?.value ?? priceAlt?.value;
    let priceCents = rawPriceCents ? parseInt(rawPriceCents, 10) : def.priceCents;
    if (!Number.isFinite(priceCents) || priceCents <= 0) {
      const dollars = priceDollarsAlt?.value ? parseFloat(priceDollarsAlt.value) : NaN;
      priceCents = Number.isFinite(dollars) && dollars > 0 ? Math.round(dollars * 100) : def.priceCents;
    }
    return {
      key,
      title: titleRow?.value || titleAlt?.value || def.title,
      priceCents,
      description: descRow?.value || descAlt?.value || def.description,
      turnaroundDays: turnRow?.value || turnAlt?.value || def.turnaroundDays,
      scope: scopeRow?.value || scopeAlt?.value || def.description,
    };
  }));
  return tiers;
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

  // Legacy Blueprint tier catalog. Kept for admin/back-office continuity,
  // but not exposed on the public launch surface.
  app.get("/api/strategy-lab/blueprint-tiers", isAuthenticated, requireAdmin, async (_req, res) => {
    try {
      const tiers = await loadBlueprintTiers();
      res.json({ tiers, stripeEnabled: !!process.env.STRIPE_SECRET_KEY });
    } catch (err) {
      console.error("blueprint-tiers error:", err);
      res.json({ tiers: TIER_KEYS.map((k) => ({ key: k, ...TIER_DEFAULTS[k] })), stripeEnabled: false });
    }
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

  // ── Blueprint order (Stripe checkout if configured, else invoice) ──────
  const orderSchema = z.object({
    propertyAnalysisId: z.number().int().positive().optional(),
    sessionId: z.string().min(8).max(64).optional(),
    tier: z.enum(TIER_KEYS),
    contactName: z.string().max(200).optional(),
    contactEmail: z.string().email().max(255).optional(),
    contactPhone: z.string().max(40).optional(),
    notes: z.string().max(2000).optional(),
  });

  app.post("/api/strategy-lab/blueprint-order", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = orderSchema.parse(req.body ?? {});
      const userId = authUserId(req);
      const userEmail = authUserEmail(req);
      const tiers = await loadBlueprintTiers();
      const tier = tiers.find((t) => t.key === parsed.tier);
      if (!tier) return res.status(400).json({ error: "Unknown tier" });

      // If a propertyAnalysisId is referenced, enforce strict ownership so a
      // signed-in user cannot pin an order to an analysis they do not own.
      if (parsed.propertyAnalysisId) {
        const refAnalysis = await storage.getPropertyAnalysis(parsed.propertyAnalysisId);
        if (!refAnalysis) return res.status(404).json({ error: "Analysis not found" });
        if (refAnalysis.userId) {
          if (!userId || refAnalysis.userId !== userId) {
            return res.status(403).json({ error: "Not your analysis" });
          }
        } else if (refAnalysis.sessionId) {
          if (!parsed.sessionId || parsed.sessionId !== refAnalysis.sessionId) {
            return res.status(403).json({ error: "Not your analysis" });
          }
        }
      }

      const stripeEnabled = !!process.env.STRIPE_SECRET_KEY;
      let paymentMethod: "stripe" | "invoice" = stripeEnabled ? "stripe" : "invoice";
      let paymentStatus: string = stripeEnabled ? "pending" : "invoiced";

      const order = await storage.createBlueprintOrder({
        propertyAnalysisId: parsed.propertyAnalysisId ?? null,
        userId: userId ?? null,
        sessionId: parsed.sessionId ?? null,
        tier: parsed.tier,
        priceCents: tier.priceCents,
        contactName: parsed.contactName ?? null,
        contactEmail: parsed.contactEmail ?? userEmail ?? null,
        contactPhone: parsed.contactPhone ?? null,
        notes: parsed.notes ?? null,
        paymentMethod,
        paymentStatus,
      });

      await storage.createStrategyLabTouchpoint({
        userId: userId ?? null,
        sessionId: parsed.sessionId ?? null,
        propertyAnalysisId: parsed.propertyAnalysisId ?? null,
        action: "blueprint_order",
        payload: { orderId: order.id, tier: parsed.tier, priceCents: tier.priceCents, paymentMethod },
      });

      // Stripe checkout. When STRIPE_SECRET_KEY is set we create a real
      // Checkout Session via Stripe's REST API (no SDK dependency required)
      // and persist the session id for later reconciliation. When the key is
      // absent we fall back to the invoice flow so the user is never blocked.
      let checkoutUrl: string | null = null;
      let stripeSessionId: string | null = null;
      if (stripeEnabled) {
        try {
          const origin = `${req.protocol}://${req.get("host")}`;
          const params = new URLSearchParams();
          params.append("mode", "payment");
          params.append("success_url", `${origin}/strategy-lab/blueprint-confirmed?orderId=${order.id}`);
          params.append("cancel_url", `${origin}/strategy-lab?blueprint=cancelled&order=${order.id}`);
          params.append("client_reference_id", String(order.id));
          if (parsed.contactEmail ?? userEmail) {
            params.append("customer_email", String(parsed.contactEmail ?? userEmail));
          }
          params.append("line_items[0][price_data][currency]", "usd");
          params.append("line_items[0][price_data][product_data][name]", `Pegasus Deal Blueprint — ${tier.title}`);
          params.append("line_items[0][price_data][unit_amount]", String(tier.priceCents));
          params.append("line_items[0][quantity]", "1");
          params.append("metadata[orderId]", String(order.id));
          params.append("metadata[tier]", parsed.tier);

          const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
          });
          if (!stripeRes.ok) {
            const errText = await stripeRes.text();
            throw new Error(`Stripe ${stripeRes.status}: ${errText}`);
          }
          const session = (await stripeRes.json()) as { id: string; url: string };
          stripeSessionId = session.id;
          checkoutUrl = session.url;
          await storage.updateBlueprintOrder(order.id, { stripeSessionId });
        } catch (stripeErr) {
          console.error("stripe checkout failed (falling back to invoice):", stripeErr);
          await storage.updateBlueprintOrder(order.id, {
            paymentMethod: "invoice",
            paymentStatus: "invoiced",
          });
          paymentMethod = "invoice";
          paymentStatus = "invoiced";
        }
      }

      try {
        // Generate the Strategy Snapshot PDF for the linked analysis (if any)
        // and attach it to Apollo's order email so the team has the full
        // underwriting context to start work without round-tripping the user.
        let pdfBuffer: Buffer | null = null;
        if (parsed.propertyAnalysisId) {
          try {
            const linked = await storage.getPropertyAnalysis(parsed.propertyAnalysisId);
            if (linked) pdfBuffer = await generateStrategySnapshotPDF(linked);
          } catch (pdfErr) {
            console.error("blueprint snapshot pdf failed (non-fatal):", pdfErr);
          }
        }
        await sendBlueprintOrderNotification({
          orderId: order.id,
          tier: parsed.tier,
          tierTitle: tier.title,
          priceCents: tier.priceCents,
          paymentMethod,
          contactName: parsed.contactName ?? null,
          contactEmail: parsed.contactEmail ?? userEmail ?? null,
          contactPhone: parsed.contactPhone ?? null,
          propertyAnalysisId: parsed.propertyAnalysisId ?? null,
          notes: parsed.notes ?? null,
          pdfBuffer,
        });
      } catch (emailErr) {
        console.error("blueprint email failed (non-fatal):", emailErr);
      }

      res.json({
        orderId: order.id,
        tier: parsed.tier,
        priceCents: tier.priceCents,
        paymentMethod,
        paymentStatus,
        checkoutUrl,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: fromError(err).toString() });
      }
      console.error("blueprint-order error:", err);
      res.status(500).json({ error: "Could not create order" });
    }
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
