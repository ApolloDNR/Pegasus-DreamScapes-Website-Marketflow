import { describe, it, expect, beforeEach, vi } from "vitest";
import express from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

type Row = Record<string, any>;
const created: Row[] = [];

vi.mock("../storage", () => {
  return {
    storage: {
      createPropertyAnalysis: async (row: Row) => {
        const out = { id: created.length + 1, shareToken: `tok_${created.length + 1}`, ...row };
        created.push(out);
        return out;
      },
      getPropertyAnalysis: async (id: number) => created[id - 1] ?? null,
      updatePropertyAnalysis: async (id: number, patch: Row) => {
        const next = { ...created[id - 1], ...patch };
        if (patch.isShared === false) {
          next.shareToken = null;
          next.sharedAt = null;
        }
        if (patch.isShared === true && !next.shareToken) {
          next.shareToken = `rotated_${id}_${Date.now()}`;
          next.sharedAt = new Date();
        }
        created[id - 1] = next;
        return next;
      },
      listPropertyAnalysesByUser: async () => [],
      deletePropertyAnalysis: async () => {},
      getPropertyAnalysisByShareToken: async (token: string) =>
        created.find((row) => row.isShared === true && row.shareToken === token) ?? null,
      claimPropertyAnalysesForUser: async () => 0,
    },
  };
});

vi.mock("../supabaseAuth", () => ({
  extractSupabaseUser: async () => null,
}));

// PDF generator is replaced with a spy that captures the analysis it was
// handed so the Reading Lens tests can assert the route reframed the memo
// before generation (instead of cracking open a real PDF buffer).
const pdfCalls: Array<Record<string, any>> = [];
vi.mock("../pdf", () => ({
  generateStrategySnapshotPDF: async (analysis: Record<string, any>) => {
    pdfCalls.push(analysis);
    return Buffer.from("pdf");
  },
}));

vi.mock("@shared/schema", async () => {
  const z = await import("zod");
  return {
    insertPropertyAnalysisSchema: z.object({}).passthrough(),
  };
});

const { registerPropertyAnalysisRoutes } = await import("../propertyAnalysisRoutes");

let server: Server;
let baseUrl = "";

async function startServer(authenticatedUserId?: string) {
  const app = express();
  app.use(express.json());
  registerPropertyAnalysisRoutes(app, {
    isAuthenticated: (req: any, res, next) => {
      if (!authenticatedUserId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.user = { claims: { sub: authenticatedUserId } };
      next();
    },
  });
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const port = (server.address() as AddressInfo).port;
  baseUrl = `http://127.0.0.1:${port}`;
}

async function stopServer() {
  await new Promise<void>((resolve) => server.close(() => resolve()));
}

describe("POST /api/property-analyses — anonymous userId spoofing prevention", () => {
  beforeEach(() => {
    created.length = 0;
    pdfCalls.length = 0;
  });

  it("ignores req.body.userId when caller is unauthenticated and stores userId=null", async () => {
    await startServer();
    try {
      const res = await fetch(`${baseUrl}/api/property-analyses`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          userId: "victim-user-id",
          sessionId: "anon-session-id-abcdef0123",
          address: "100 Test St",
        }),
      });
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.userId).toBeNull();
      expect(created[0].userId).toBeNull();
    } finally {
      await stopServer();
    }
  });
});

describe("GET /api/pdf/strategy-snapshot/by-id/:id?tone= — Reading Lens (Task #90)", () => {
  beforeEach(() => {
    created.length = 0;
    pdfCalls.length = 0;
  });

  it("re-frames snapshot.memo using the requested tone + persisted dealStatus before generating the PDF", async () => {
    // Seed a row owned by user 'u1' with a listed property and the raw
    // engine memo paragraph. The wholesaler-on-listed branch of
    // frameDecisionMemo prepends a specific framing sentence we can assert.
    const rawParagraph = "Engine paragraph about the deal.";
    const rawNextStep = "Engine next step.";
    created.push({
      id: 1,
      userId: "u1",
      address: "200 Lens Way",
      propertyInput: { askingPrice: 250000, dealStatus: "listed" },
      snapshot: {
        memo: { paragraph: rawParagraph, nextStep: rawNextStep },
        lanes: [],
      },
      visibility: "summary",
    });

    // Build an isolated server that treats the request as user 'u1' so the
    // owner check passes.
    const app = express();
    app.use(express.json());
    registerPropertyAnalysisRoutes(app, {
      isAuthenticated: (req: any, _res, next) => {
        req.user = { claims: { sub: "u1" } };
        next();
      },
    });
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    try {
      const res = await fetch(`${baseUrl}/api/pdf/strategy-snapshot/by-id/1?tone=wholesaler`);
      expect(res.status).toBe(200);
      expect(pdfCalls).toHaveLength(1);

      const handed = pdfCalls[0];
      const memo = handed.snapshot?.memo;
      // The listed-property branch is prepended by frameDecisionMemo. If the
      // route fell back to dealStatus=unknown, this disclosure would be absent.
      expect(memo.paragraph).toContain("visitor marked the property listed");
      expect(memo.paragraph).toContain("representation, disclosure, and contract restrictions");
      expect(memo.paragraph).toContain(rawParagraph);
      expect(memo.nextStep).not.toBe(rawNextStep);
      expect(memo.nextStep).toContain("qualified legal and licensed advice");
      expect(memo.nextStep).toContain("assignment assumptions");

      // Visibility is still forced to 'full' for owner-only export.
      expect(handed.visibility).toBe("full");
    } finally {
      await stopServer();
    }
  });

  it("leaves the engine memo untouched when no tone query is supplied", async () => {
    const rawParagraph = "Engine paragraph about the deal.";
    const rawNextStep = "Engine next step.";
    created.push({
      id: 1,
      userId: "u1",
      address: "200 Lens Way",
      propertyInput: { askingPrice: 250000, dealStatus: "listed" },
      snapshot: {
        memo: { paragraph: rawParagraph, nextStep: rawNextStep },
        lanes: [],
      },
      visibility: "summary",
    });

    const app = express();
    app.use(express.json());
    registerPropertyAnalysisRoutes(app, {
      isAuthenticated: (req: any, _res, next) => {
        req.user = { claims: { sub: "u1" } };
        next();
      },
    });
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

    try {
      const res = await fetch(`${baseUrl}/api/pdf/strategy-snapshot/by-id/1`);
      expect(res.status).toBe(200);
      expect(pdfCalls).toHaveLength(1);
      const memo = pdfCalls[0].snapshot?.memo;
      expect(memo.paragraph).toBe(rawParagraph);
      expect(memo.nextStep).toBe(rawNextStep);
    } finally {
      await stopServer();
    }
  });
});

describe("public property snapshot trust boundary", () => {
  beforeEach(() => {
    created.length = 0;
    pdfCalls.length = 0;
  });

  function seedSharedPropertyAnalysis() {
    created.push({
      id: 1,
      userId: "private-owner-id",
      sessionId: "private-anonymous-session-id",
      isShared: true,
      shareToken: "property_public_token",
      sharedAt: new Date("2026-08-20T12:00:00.000Z"),
      viewCount: 42,
      submittedToPegasus: true,
      submittedAt: new Date("2026-08-21T12:00:00.000Z"),
      notes: "Internal owner notes must never be public.",
      visibility: "full",
      address: "400 Model Way\u0000",
      city: "Oakland",
      state: "CA",
      zip: "94601",
      propertyInput: {
        address: "400 Model Way\u0000",
        city: "Oakland",
        state: "CA",
        zip: "94601",
        askingPrice: 510_000,
        arvEstimate: 760_000,
        rehabBudget: 120_000,
        marketRent: 4_200,
        knownIssues: ["User-entered foundation concern\u202E"],
      },
      snapshot: {
        engineVersion: "1.0.0",
        generatedAt: "2026-08-20T12:00:00.000Z",
        topLane: "flip",
        lanes: [
          {
            lane: "flip",
            laneLabel: "Fix and Flip",
            verdict: "strong",
            verdictLabel: "Strong fit",
            headline: "Pegasus recommends this path.",
            confidence: {
              score: 91,
              supportingFactors: ["ARV spread"],
              sensitiveFactors: ["Rehab scope"],
              missingInputs: [],
            },
            economics: {
              primaryMetric: "Modeled profit",
              primaryValue: "$82K",
              metrics: [{ label: "Modeled ROI", value: "19%" }],
            },
            laneRisks: ["Rehab variance"],
          },
          { lane: "not-a-real-lane", verdictLabel: "Guaranteed" },
        ],
        memo: {
          paragraph: "Pegasus reviewed this property and recommends moving forward.",
          nextStep: "Treat this as the Pegasus recommendation.",
          hasCompOverrideWarning: false,
        },
        risks: [
          {
            id: "rehab",
            category: "construction",
            severity: "watch",
            title: "Budget movement",
            detail: "Pegasus reviewed the budget.",
            affects: ["flip"],
          },
        ],
        capitalStack: [
          { source: "rehab_cash", label: "Rehab cash", amount: 120_000, note: "Illustrative" },
        ],
        sensitivities: [],
        reverseSolvers: [],
        totalCashIn: 210_000,
        breakevens: {},
        compsUsed: [],
        scenarios: {},
      },
    });
  }

  it("projects a sanitized public DTO and explicitly frames every narrative as unverified model output", async () => {
    seedSharedPropertyAnalysis();
    await startServer();
    try {
      const res = await fetch(
        `${baseUrl}/api/property-analyses/by-token/property_public_token`,
      );
      expect(res.status).toBe(200);
      expect(res.headers.get("x-robots-tag")).toContain("noindex");
      expect(res.headers.get("cache-control")).toContain("no-store");

      const body = await res.json();
      expect(body).not.toHaveProperty("userId");
      expect(body).not.toHaveProperty("sessionId");
      expect(body).not.toHaveProperty("notes");
      expect(body).not.toHaveProperty("shareToken");
      expect(body).not.toHaveProperty("submittedToPegasus");
      expect(body).not.toHaveProperty("submittedAt");
      expect(body).not.toHaveProperty("viewCount");
      expect(body.outputContext).toMatchObject({
        source: "user_entered_inputs_and_automated_model",
        verifiedByPegasus: false,
      });
      expect(body.outputContext.label).toMatch(/user-entered, unverified inputs/i);
      expect(body.address).toBe("400 Model Way");
      expect(body.zip).toBe("94601");
      expect(body.propertyInput.address).toBe("400 Model Way");
      expect(body.propertyInput.zip).toBe("94601");
      expect(body.propertyInput.knownIssues[0]).not.toContain("\u202E");
      expect(body.snapshot.lanes).toHaveLength(1);
      expect(body.snapshot.lanes[0].verdictLabel).toMatch(/^Automated model fit:/);
      expect(body.snapshot.lanes[0].headline).toMatch(
        /^Based on user-entered, unverified inputs, the automated model indicates:/,
      );
      expect(body.snapshot.lanes[0].headline).toContain(
        "the automated model indicates this path.",
      );
      expect(body.snapshot.memo.paragraph).toMatch(
        /^Automated model summary based on user-entered, unverified inputs:/,
      );
      expect(body.snapshot.memo.nextStep).toMatch(
        /^Automated model consideration \(not a Pegasus recommendation\):/,
      );
      expect(body.snapshot.risks[0].detail).toMatch(
        /^Automated model flag based on unverified inputs:/,
      );
      expect(JSON.stringify(body.snapshot)).not.toMatch(
        /Pegasus[^.]{0,40}(?:reviewed|recommends)/i,
      );
    } finally {
      await stopServer();
    }
  });

  it("redacts street address and ZIP from every summary-tier public surface", async () => {
    seedSharedPropertyAnalysis();
    created[0].visibility = "summary";
    await startServer();
    try {
      const jsonResponse = await fetch(
        `${baseUrl}/api/property-analyses/by-token/property_public_token`,
      );
      expect(jsonResponse.status).toBe(200);
      const body = await jsonResponse.json();
      expect(body.visibility).toBe("summary");
      expect(body).not.toHaveProperty("address");
      expect(body).not.toHaveProperty("zip");
      expect(body).toMatchObject({ city: "Oakland", state: "CA" });
      expect(body.propertyInput).not.toHaveProperty("address");
      expect(body.propertyInput).not.toHaveProperty("zip");
      expect(body.propertyInput).toEqual({ city: "Oakland", state: "CA" });

      const pdfResponse = await fetch(
        `${baseUrl}/api/pdf/strategy-snapshot/by-token/property_public_token`,
      );
      expect(pdfResponse.status).toBe(200);
      expect(pdfCalls.at(-1)).not.toHaveProperty("address");
      expect(pdfCalls.at(-1)).not.toHaveProperty("zip");
      expect(pdfCalls.at(-1)?.propertyInput).not.toHaveProperty("address");
      expect(pdfCalls.at(-1)?.propertyInput).not.toHaveProperty("zip");

      const ogResponse = await fetch(
        `${baseUrl}/og/snapshot/property_public_token`,
      );
      expect(ogResponse.status).toBe(200);
      const svg = await ogResponse.text();
      expect(svg).not.toContain("400 Model Way");
      expect(svg).not.toContain("94601");
      expect(svg).toContain("Oakland, CA");
    } finally {
      await stopServer();
    }
  });

  it("lets the owner revoke a property share and rotates the token when sharing again", async () => {
    seedSharedPropertyAnalysis();
    await startServer("private-owner-id");
    try {
      const revoke = await fetch(
        `${baseUrl}/api/property-analyses/1/share`,
        { method: "DELETE" },
      );
      expect(revoke.status).toBe(200);
      expect(await revoke.json()).toEqual({
        isShared: false,
        shareToken: null,
        sharedAt: null,
      });

      const oldLink = await fetch(
        `${baseUrl}/api/property-analyses/by-token/property_public_token`,
      );
      expect(oldLink.status).toBe(404);

      const reShare = await fetch(
        `${baseUrl}/api/property-analyses/1/share`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ visibility: "summary" }),
        },
      );
      expect(reShare.status).toBe(200);
      const reSharedBody = await reShare.json();
      expect(reSharedBody.shareToken).toBeTruthy();
      expect(reSharedBody.shareToken).not.toBe("property_public_token");
    } finally {
      await stopServer();
    }
  });

  it("does not let a different user revoke a property share", async () => {
    seedSharedPropertyAnalysis();
    await startServer("different-user-id");
    try {
      const revoke = await fetch(
        `${baseUrl}/api/property-analyses/1/share`,
        { method: "DELETE" },
      );
      expect(revoke.status).toBe(403);
      expect(created[0].shareToken).toBe("property_public_token");
      expect(created[0].isShared).toBe(true);
    } finally {
      await stopServer();
    }
  });

  it("sanitizes the public-token payload before passing it to the PDF generator", async () => {
    seedSharedPropertyAnalysis();
    await startServer();
    try {
      const res = await fetch(
        `${baseUrl}/api/pdf/strategy-snapshot/by-token/property_public_token`,
      );
      expect(res.status).toBe(200);
      expect(res.headers.get("x-robots-tag")).toContain("noindex");
      expect(pdfCalls).toHaveLength(1);
      expect(pdfCalls[0]).not.toHaveProperty("userId");
      expect(pdfCalls[0]).not.toHaveProperty("notes");
      expect(pdfCalls[0].snapshot.memo.paragraph).toMatch(
        /^Automated model summary based on user-entered, unverified inputs:/,
      );
    } finally {
      await stopServer();
    }
  });

  it("404s missing OG tokens and labels existing cards as unverified model output", async () => {
    seedSharedPropertyAnalysis();
    await startServer();
    try {
      const missing = await fetch(`${baseUrl}/og/snapshot/missing-token`);
      expect(missing.status).toBe(404);

      const res = await fetch(`${baseUrl}/og/snapshot/property_public_token`);
      expect(res.status).toBe(200);
      expect(res.headers.get("x-robots-tag")).toContain("noindex");
      expect(res.headers.get("cache-control")).toContain("no-store");
      const svg = await res.text();
      expect(svg).toContain("MODELED PATH · USER INPUTS");
      expect(svg).toContain("MODEL OUTPUT · UNVERIFIED");
      expect(svg).not.toContain("UNVERIFIED · AUTOMATED MODEL FIT:");
      expect(svg).not.toContain("RECOMMENDED PATH");
      expect(svg).not.toContain("VERDICT ·");
    } finally {
      await stopServer();
    }
  });
});
