/**
 * Strategy Lab — Property Analysis routes (Task #84).
 *
 * Endpoints:
 *  - POST   /api/property-analyses              create (anon ok with sessionId)
 *  - PATCH  /api/property-analyses/:id          update (owner or matching sessionId)
 *  - GET    /api/property-analyses              list (auth)
 *  - GET    /api/property-analyses/:id          read (owner or sessionId)
 *  - DELETE /api/property-analyses/:id          delete (owner)
 *  - GET    /api/property-analyses/by-token/:t  public read (summary-aware)
 *  - POST   /api/property-analyses/:id/share    mint share token + visibility
 *  - POST   /api/property-analyses/:id/submit   mark submitted-to-Pegasus
 *  - POST   /api/property-analyses/claim        anon → user (body { sessionId })
 *  - GET    /api/pdf/strategy-snapshot/by-id/:id        owner-only PDF
 *  - GET    /api/pdf/strategy-snapshot/by-token/:token  public PDF
 *  - GET    /og/snapshot/:token                         OG image SVG (1200x630)
 */
import type { Express, Request, Response, NextFunction, RequestHandler } from "express";
import { storage } from "./storage";
import { insertPropertyAnalysisSchema, type PropertyAnalysis } from "@shared/schema";
import type { StrategySnapshot, LaneFitResult, PropertyInput } from "@shared/strategy-lab/types";
import { fromError } from "zod-validation-error";
import { extractSupabaseUser } from "./supabaseAuth";
import { generateStrategySnapshotPDF } from "./pdf";
import { frameDecisionMemo, type LabDealStatus, type LabSubmitterRole } from "@shared/strategy-lab";

// 4-tone Reading Lens (Task #90). The Strategy Lab UI lets the user pick
// one of four lenses above the Decision Memo. The PDF export honors that
// choice via a `?tone=` query so the downloaded snapshot reads the same
// way the user saw on-screen.
type ToneLensParam = "owner" | "wholesaler" | "capital" | "admin";

const LENS_TO_ROLE: Record<ToneLensParam, LabSubmitterRole> = {
  owner: "owner_seller",
  wholesaler: "wholesaler",
  capital: "capital_partner",
  admin: "unknown",
};

function isToneLens(v: unknown): v is ToneLensParam {
  return v === "owner" || v === "wholesaler" || v === "capital" || v === "admin";
}

const VALID_DEAL_STATUSES: ReadonlySet<LabDealStatus> = new Set<LabDealStatus>([
  "listed",
  "off_market",
  "pending",
  "wholesale",
  "pocket",
  "owner_submitted",
  "unknown",
]);

function readDealStatus(input: PropertyInput | undefined): LabDealStatus {
  const ds = input?.dealStatus;
  return ds && VALID_DEAL_STATUSES.has(ds) ? ds : "unknown";
}

/** Returns a shallow-cloned analysis whose snapshot.memo has been re-framed
 *  for the requested tone lens + persisted dealStatus, leaving every other
 *  field intact. Returns the analysis unchanged when no tone is requested
 *  or when the engine memo is missing. */
export function applyToneToAnalysis(
  analysis: PropertyAnalysis,
  tone: ToneLensParam | undefined,
): PropertyAnalysis {
  if (!tone) return analysis;
  const snapshot = analysis.snapshot as StrategySnapshot | null | undefined;
  const memo = snapshot?.memo;
  if (!snapshot || !memo?.paragraph) return analysis;
  const dealStatus = readDealStatus(analysis.propertyInput as PropertyInput | undefined);
  const framed = frameDecisionMemo(
    { paragraph: memo.paragraph, nextStep: memo.nextStep },
    LENS_TO_ROLE[tone],
    dealStatus,
  );
  const nextSnapshot: StrategySnapshot = {
    ...snapshot,
    memo: { ...memo, paragraph: framed.paragraph, nextStep: framed.nextStep },
  };
  return { ...analysis, snapshot: nextSnapshot };
}

interface AuthCtx {
  isAuthenticated: RequestHandler;
}

type AuthedRequest = Request & {
  user?: { claims?: { sub?: string } };
};

function authUserId(req: Request): string | null {
  const u = (req as AuthedRequest).user;
  return u?.claims?.sub ?? req.supabaseUser?.id ?? null;
}

/**
 * Anonymous sessionIds are weak (localStorage-bound). We require a minimum
 * length and a constant-time compare to make casual enumeration noisy.
 */
function sessionIdMatches(provided: unknown, stored: string | null | undefined): boolean {
  if (!stored || typeof provided !== "string") return false;
  if (provided.length < 16 || stored.length < 16) return false;
  if (provided.length !== stored.length) return false;
  let mismatch = 0;
  for (let i = 0; i < provided.length; i++) mismatch |= provided.charCodeAt(i) ^ stored.charCodeAt(i);
  return mismatch === 0;
}

async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const r = req as AuthedRequest;
  if (!r.user?.claims?.sub) {
    const u = await extractSupabaseUser(req);
    if (u) {
      r.user = { claims: u.claims };
      req.supabaseUser = u;
    }
  }
  next();
}

interface PropertyInputAddress {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}

function applyVisibility(row: PropertyAnalysis | null): PropertyAnalysis | null {
  if (!row) return row;
  if (row.visibility === "full") return row;
  // Summary tier — strip detailed engine output.
  const snap = (row.snapshot ?? {}) as Partial<StrategySnapshot>;
  const lanes: LaneFitResult[] = snap.lanes ?? [];
  const topLane = lanes.find((l) => l.lane === snap.topLane) ?? lanes[0] ?? null;
  const propertyInput = (row.propertyInput ?? {}) as PropertyInputAddress;
  return {
    ...row,
    propertyInput: {
      address: propertyInput.address,
      city: propertyInput.city,
      state: propertyInput.state,
      zip: propertyInput.zip,
    },
    snapshot: {
      engineVersion: snap.engineVersion,
      generatedAt: snap.generatedAt,
      topLane: snap.topLane,
      lanes: topLane ? [topLane] : [],
      memo: snap.memo
        ? { paragraph: snap.memo.paragraph, nextStep: snap.memo.nextStep, hasCompOverrideWarning: false }
        : null,
      risks: [],
      capitalStack: [],
      sensitivities: [],
      reverseSolvers: [],
      totalCashIn: null,
      breakevens: {},
      compsUsed: [],
    },
  } as PropertyAnalysis;
}

export function registerPropertyAnalysisRoutes(app: Express, ctx: AuthCtx) {
  const { isAuthenticated } = ctx;

  // ── Create (anon ok) ─────────────────────────────────────────────────
  app.post("/api/property-analyses", optionalAuth, async (req: any, res) => {
    try {
      const userId = authUserId(req);
      // Security: NEVER trust req.body.userId. Anonymous callers always create
      // userId=null rows; only an authenticated session can attach userId.
      const { userId: _ignored, ...rest } = req.body ?? {};
      const body = { ...rest, userId: userId ?? null };
      const parsed = insertPropertyAnalysisSchema.safeParse(body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid analysis", errors: fromError(parsed.error).toString() });
      }
      const created = await storage.createPropertyAnalysis(parsed.data);
      return res.status(201).json(created);
    } catch (err) {
      console.error("Error creating property analysis:", err);
      return res.status(500).json({ message: "Failed to create analysis" });
    }
  });

  // ── Update (owner or matching sessionId) ─────────────────────────────
  app.patch("/api/property-analyses/:id", optionalAuth, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
      const existing = await storage.getPropertyAnalysis(id);
      if (!existing) return res.status(404).json({ message: "Not found" });
      const userId = authUserId(req);
      const sessionId = req.body.sessionId as string | undefined;
      const ownsByUser = !!(existing.userId && userId && existing.userId === userId);
      const ownsBySession = !existing.userId && sessionIdMatches(sessionId, existing.sessionId);
      if (!ownsByUser && !ownsBySession) return res.status(403).json({ message: "Not authorized" });
      const allowed: Record<string, unknown> = {};
      const fields = [
        "address", "city", "state", "zip",
        "askingPrice", "arvEstimate", "rehabBudget", "monthlyRent",
        "engineVersion", "topLane", "topLaneVerdict", "topLaneScore",
        "propertyInput", "snapshot", "notes",
      ];
      for (const f of fields) if (f in req.body) allowed[f] = req.body[f];
      if (typeof req.body.runCount === "number") allowed.runCount = req.body.runCount;
      const updated = await storage.updatePropertyAnalysis(id, allowed as Parameters<typeof storage.updatePropertyAnalysis>[1]);
      return res.json(updated);
    } catch (err) {
      console.error("Error updating property analysis:", err);
      return res.status(500).json({ message: "Failed to update analysis" });
    }
  });

  // ── List (auth) ──────────────────────────────────────────────────────
  app.get("/api/property-analyses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = authUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const rows = await storage.listPropertyAnalysesByUser(userId);
      return res.json(rows);
    } catch (err) {
      console.error("Error listing property analyses:", err);
      return res.status(500).json({ message: "Failed to list" });
    }
  });

  // ── Read by id (owner or matching sessionId) ─────────────────────────
  app.get("/api/property-analyses/:id", optionalAuth, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) return res.status(400).json({ message: "Invalid id" });
      const row = await storage.getPropertyAnalysis(id);
      if (!row) return res.status(404).json({ message: "Not found" });
      const userId = authUserId(req);
      const sessionId = (req.query.sessionId as string | undefined) ?? undefined;
      const ownsByUser = !!(row.userId && userId && row.userId === userId);
      const ownsBySession = !row.userId && sessionIdMatches(sessionId, row.sessionId);
      if (!ownsByUser && !ownsBySession) return res.status(403).json({ message: "Not authorized" });
      return res.json(row);
    } catch (err) {
      console.error("Error reading property analysis:", err);
      return res.status(500).json({ message: "Failed to read analysis" });
    }
  });

  // ── Delete (auth + owner) ────────────────────────────────────────────
  app.delete("/api/property-analyses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const row = await storage.getPropertyAnalysis(id);
      if (!row) return res.status(404).json({ message: "Not found" });
      if (row.userId !== authUserId(req)) return res.status(403).json({ message: "Not authorized" });
      await storage.deletePropertyAnalysis(id);
      return res.json({ ok: true });
    } catch (err) {
      console.error("Error deleting property analysis:", err);
      return res.status(500).json({ message: "Failed to delete" });
    }
  });

  // ── Share (auth + owner) — mints token + visibility tier ─────────────
  app.post("/api/property-analyses/:id/share", isAuthenticated, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const row = await storage.getPropertyAnalysis(id);
      if (!row) return res.status(404).json({ message: "Not found" });
      if (row.userId !== authUserId(req)) return res.status(403).json({ message: "Not authorized" });
      const visibility = req.body.visibility === "full" ? "full" : "summary";
      const updated = await storage.updatePropertyAnalysis(id, {
        isShared: true,
        visibility,
      } as Parameters<typeof storage.updatePropertyAnalysis>[1]);
      return res.json({
        shareToken: updated?.shareToken,
        visibility: updated?.visibility,
        sharedAt: updated?.sharedAt,
      });
    } catch (err) {
      console.error("Error sharing property analysis:", err);
      return res.status(500).json({ message: "Failed to share" });
    }
  });

  // ── Submit to Pegasus (auth + owner) ─────────────────────────────────
  app.post("/api/property-analyses/:id/submit", isAuthenticated, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const row = await storage.getPropertyAnalysis(id);
      if (!row) return res.status(404).json({ message: "Not found" });
      if (row.userId !== authUserId(req)) return res.status(403).json({ message: "Not authorized" });
      const updated = await storage.updatePropertyAnalysis(id, {
        submittedToPegasus: true,
      } as Parameters<typeof storage.updatePropertyAnalysis>[1]);
      return res.json({ submittedAt: updated?.submittedAt, submittedToPegasus: true });
    } catch (err) {
      console.error("Error submitting analysis:", err);
      return res.status(500).json({ message: "Failed to submit" });
    }
  });

  // ── Claim anonymous analyses (auth) ──────────────────────────────────
  app.post("/api/property-analyses/claim", isAuthenticated, async (req: any, res) => {
    try {
      const userId = authUserId(req);
      const sessionId = String(req.body.sessionId || "").trim();
      if (!userId || !sessionId) return res.status(400).json({ message: "Missing sessionId" });
      const claimed = await storage.claimPropertyAnalysesForUser(sessionId, userId);
      // Return the latest claimed analysis id so the client can rehydrate
      // the Strategy Lab to the user's in-progress draft after auth.
      const latestAnalysisId = claimed > 0
        ? await storage.latestPropertyAnalysisForSession(sessionId, userId)
        : null;
      return res.json({ claimed, latestAnalysisId });
    } catch (err) {
      console.error("Error claiming property analyses:", err);
      return res.status(500).json({ message: "Failed to claim" });
    }
  });

  // ── Public read by token (summary-aware) ─────────────────────────────
  app.get("/api/property-analyses/by-token/:token", async (req, res) => {
    try {
      const row = await storage.getPropertyAnalysisByShareToken(req.params.token, {
        incrementViewCount: true,
      });
      if (!row) return res.status(404).json({ message: "Not found" });
      return res.json(applyVisibility(row));
    } catch (err) {
      console.error("Error reading shared analysis:", err);
      return res.status(500).json({ message: "Failed to read shared" });
    }
  });

  // ── PDF — by id (owner) ──────────────────────────────────────────────
  app.get("/api/pdf/strategy-snapshot/by-id/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      const row = await storage.getPropertyAnalysis(id);
      if (!row) return res.status(404).json({ message: "Not found" });
      if (row.userId !== authUserId(req)) return res.status(403).json({ message: "Not authorized" });
      const toneParam = typeof req.query.tone === "string" ? req.query.tone : undefined;
      const tone = isToneLens(toneParam) ? toneParam : undefined;
      const framed = applyToneToAnalysis({ ...row, visibility: "full" } as PropertyAnalysis, tone);
      const buf = await generateStrategySnapshotPDF(framed);
      const safe = String(row.address || "snapshot").replace(/[^a-z0-9\-]+/gi, "-").slice(0, 60);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="pegasus-snapshot-${safe}.pdf"`);
      return res.send(buf);
    } catch (err) {
      console.error("Error generating snapshot PDF (by id):", err);
      return res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // ── PDF — by token (public, visibility-aware) ────────────────────────
  app.get("/api/pdf/strategy-snapshot/by-token/:token", async (req, res) => {
    try {
      const row = await storage.getPropertyAnalysisByShareToken(req.params.token, {
        incrementViewCount: false,
      });
      if (!row) return res.status(404).json({ message: "Not found" });
      const buf = await generateStrategySnapshotPDF(row);
      const safe = String(row.address || "snapshot").replace(/[^a-z0-9\-]+/gi, "-").slice(0, 60);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="pegasus-snapshot-${safe}.pdf"`);
      return res.send(buf);
    } catch (err) {
      console.error("Error generating snapshot PDF (by token):", err);
      return res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // ── OG image (SVG, 1200x630) ─────────────────────────────────────────
  app.get("/og/snapshot/:token", async (req, res) => {
    try {
      const row = await storage.getPropertyAnalysisByShareToken(req.params.token, {
        incrementViewCount: false,
      });
      const propertyInput = (row?.propertyInput ?? {}) as PropertyInputAddress;
      const addr =
        row?.address ||
        propertyInput.address ||
        "Property Strategy Snapshot";
      const sub = [row?.city, row?.state, row?.zip].filter(Boolean).join(", ");
      const snap = (row?.snapshot ?? {}) as Partial<StrategySnapshot>;
      const lanes: LaneFitResult[] = snap.lanes ?? [];
      const topLane = lanes.find((l) => l.lane === snap.topLane) ?? lanes[0];
      const lane = topLane?.laneLabel ?? "Strategy under review";
      const verdict = (topLane?.verdictLabel ?? "").toUpperCase();
      const esc = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0D1B2D"/>
  <rect width="1200" height="6" fill="#C77A3A"/>
  <text x="60" y="80" font-family="Helvetica, Arial, sans-serif" font-size="18" font-weight="700" fill="#C77A3A" letter-spacing="3">PEGASUS DREAMSCAPES CORP</text>
  <text x="60" y="106" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#F6EFE4" letter-spacing="2.5">THE DEAL ARCHITECT</text>
  <line x1="60" y1="170" x2="200" y2="170" stroke="#C77A3A" stroke-width="2"/>
  <text x="60" y="200" font-family="Helvetica, Arial, sans-serif" font-size="16" font-weight="700" fill="#C77A3A" letter-spacing="3">PROPERTY STRATEGY SNAPSHOT</text>
  <text x="60" y="290" font-family="Georgia, 'Times New Roman', serif" font-size="60" font-weight="700" fill="#F6EFE4">${esc(addr).slice(0, 42)}</text>
  ${sub ? `<text x="60" y="335" font-family="Georgia, 'Times New Roman', serif" font-size="26" font-style="italic" fill="#F6EFE4" opacity="0.85">${esc(sub).slice(0, 60)}</text>` : ""}
  <line x1="0" y1="430" x2="1200" y2="430" stroke="#C77A3A" stroke-width="1" opacity="0.6"/>
  <text x="60" y="475" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="700" fill="#C77A3A" letter-spacing="3">RECOMMENDED PATH</text>
  <text x="60" y="535" font-family="Georgia, 'Times New Roman', serif" font-size="48" font-weight="700" fill="#F6EFE4">${esc(lane).slice(0, 36)}</text>
  ${verdict ? `<text x="60" y="575" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="700" fill="#C77A3A" letter-spacing="2">VERDICT · ${esc(verdict).slice(0, 40)}</text>` : ""}
  <text x="1140" y="600" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#F6EFE4" opacity="0.7">apollo@pegasusdreamscapes.com</text>
</svg>`;
      res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=300");
      return res.send(svg);
    } catch (err) {
      console.error("Error generating OG snapshot SVG:", err);
      return res.status(500).end();
    }
  });
}
