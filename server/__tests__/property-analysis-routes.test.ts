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
      updatePropertyAnalysis: async (id: number, patch: Row) =>
        (created[id - 1] = { ...created[id - 1], ...patch }),
      listPropertyAnalysesByUser: async () => [],
      deletePropertyAnalysis: async () => {},
      getPropertyAnalysisByShareToken: async () => null,
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

async function startServer() {
  const app = express();
  app.use(express.json());
  registerPropertyAnalysisRoutes(app, {
    isAuthenticated: (_req, res, _next) => res.status(401).json({ message: "Unauthorized" }),
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
      // Wholesaler-on-listed framing sentence is prepended verbatim by
      // frameDecisionMemo. If the route fell back to dealStatus=unknown
      // we would see the generic wholesale framing instead.
      expect(memo.paragraph).toContain("It's listed");
      expect(memo.paragraph).toContain(rawParagraph);
      expect(memo.nextStep).not.toBe(rawNextStep);
      expect(memo.nextStep).toContain("Assignment math is tighter");

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
