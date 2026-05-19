import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
  vi,
} from "vitest";
import express from "express";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

// =================================================================
// Stateful in-memory storage that mimics production semantics for
// the saved-analysis share fields. Used to exercise the real Express
// route handlers end-to-end via HTTP.
// =================================================================
type Row = {
  id: number;
  userId: string;
  isShared: boolean;
  shareToken: string | null;
  sharedAt: Date | null;
  viewCount: number;
  name?: string;
  notes?: string | null;
  tags?: string[] | null;
  [k: string]: any;
};

const memRows = new Map<number, Row>();
let nextId = 1;
const updateCalls: any[] = [];

function reset() {
  memRows.clear();
  nextId = 1;
  updateCalls.length = 0;
}

function seedRow(partial: Partial<Row>): Row {
  const row: Row = {
    id: partial.id ?? nextId++,
    userId: partial.userId ?? "owner-1",
    isShared: partial.isShared ?? false,
    shareToken: partial.shareToken ?? null,
    sharedAt: partial.sharedAt ?? null,
    viewCount: partial.viewCount ?? 0,
    name: partial.name,
    notes: partial.notes,
    tags: partial.tags,
  };
  memRows.set(row.id, row);
  return row;
}

// Mock storage so the share-routes module under test gets our fake.
vi.mock("../storage", () => {
  return {
    storage: {
      async getSavedAnalysis(id: number) {
        return memRows.get(id);
      },
      async updateSavedAnalysis(id: number, data: any) {
        updateCalls.push({ id, data: { ...data } });
        const row = memRows.get(id);
        if (!row) return undefined;
        const patch: Partial<Row> = {};
        if (typeof data.name === "string") patch.name = data.name;
        if (data.notes === null || typeof data.notes === "string")
          patch.notes = data.notes;
        if (typeof data.isShared === "boolean") patch.isShared = data.isShared;
        if (data.tags === null || Array.isArray(data.tags))
          patch.tags = data.tags;
        // Mirror the production token-mint rule.
        if (data.isShared === true && !row.shareToken) {
          patch.shareToken =
            "tok_" + Math.random().toString(36).slice(2, 18).padEnd(16, "x");
          patch.sharedAt = new Date();
        }
        Object.assign(row, patch);
        memRows.set(id, row);
        return row;
      },
      async getSavedAnalysisByShareToken(
        token: string,
        opts: { incrementViewCount?: boolean } = {},
      ) {
        const incrementViewCount = opts.incrementViewCount ?? true;
        for (const row of memRows.values()) {
          if (row.shareToken === token && row.isShared === true) {
            if (incrementViewCount) row.viewCount += 1;
            return row;
          }
        }
        return undefined;
      },
    },
  };
});

const { registerSavedAnalysesShareRoutes } = await import(
  "../savedAnalysesShareRoutes"
);

let server: Server;
let baseUrl = "";
let currentUserId: string | null = "owner-1";

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  // Stub auth middleware mimics replitAuth's isAuthenticated contract.
  const isAuthenticated: express.RequestHandler = (req: any, res, next) => {
    if (!currentUserId) return res.status(401).json({ message: "Unauthorized" });
    req.user = { claims: { sub: currentUserId } };
    next();
  };
  registerSavedAnalysesShareRoutes(app, { isAuthenticated });
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const addr = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

afterAll(
  () =>
    new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    ),
);

beforeEach(() => {
  reset();
  currentUserId = "owner-1";
});

describe("PATCH /api/saved-analyses/:id (share flow over HTTP)", () => {
  it("404s for an unknown analysis", async () => {
    const res = await fetch(`${baseUrl}/api/saved-analyses/999`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isShared: true }),
    });
    expect(res.status).toBe(404);
  });

  it("403s when the requester does not own the analysis", async () => {
    seedRow({ id: 1, userId: "owner-1" });
    currentUserId = "someone-else";
    const res = await fetch(`${baseUrl}/api/saved-analyses/1`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isShared: true }),
    });
    expect(res.status).toBe(403);
    expect(updateCalls).toHaveLength(0);
  });

  it("401s when no user is authenticated", async () => {
    seedRow({ id: 1, userId: "owner-1" });
    currentUserId = null;
    const res = await fetch(`${baseUrl}/api/saved-analyses/1`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isShared: true }),
    });
    expect(res.status).toBe(401);
    expect(updateCalls).toHaveLength(0);
  });

  it("strips shareToken / sharedAt / viewCount / userId from the body before calling storage", async () => {
    seedRow({ id: 5, userId: "owner-1", isShared: false, shareToken: null });
    const malicious = {
      name: "renamed",
      notes: "ok",
      tags: ["x"],
      isShared: true,
      shareToken: "ATTACKER_PICKED_TOKEN",
      sharedAt: new Date("2020-01-01").toISOString(),
      viewCount: 99999,
      userId: "attacker-id",
      id: 999,
    };
    const res = await fetch(`${baseUrl}/api/saved-analyses/5`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(malicious),
    });
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(updateCalls).toHaveLength(1);
    const passedToStorage = updateCalls[0].data;
    expect(passedToStorage).toEqual({
      name: "renamed",
      notes: "ok",
      isShared: true,
      tags: ["x"],
    });
    expect(passedToStorage).not.toHaveProperty("shareToken");
    expect(passedToStorage).not.toHaveProperty("sharedAt");
    expect(passedToStorage).not.toHaveProperty("viewCount");
    expect(passedToStorage).not.toHaveProperty("userId");

    expect(body.shareToken).toBeTruthy();
    expect(body.shareToken).not.toBe("ATTACKER_PICKED_TOKEN");
    expect(body.userId).toBe("owner-1");
    expect(body.viewCount).toBe(0);
  });

  it("does not call storage at all when the analysis is missing", async () => {
    await fetch(`${baseUrl}/api/saved-analyses/404`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isShared: true, shareToken: "x" }),
    });
    expect(updateCalls).toHaveLength(0);
  });
});

describe("GET /api/shared-analyses/:token (public read over HTTP)", () => {
  it("returns 404 when the token does not exist", async () => {
    const res = await fetch(`${baseUrl}/api/shared-analyses/missing-token`);
    expect(res.status).toBe(404);
  });

  it("returns 404 for a row whose isShared is false (token alone is not enough)", async () => {
    seedRow({
      id: 11,
      userId: "owner-1",
      isShared: false,
      shareToken: "PRIVATE_TOKEN",
      viewCount: 7,
    });
    const res = await fetch(`${baseUrl}/api/shared-analyses/PRIVATE_TOKEN`);
    expect(res.status).toBe(404);
    expect(memRows.get(11)!.viewCount).toBe(7);
  });

  it("returns the row and increments viewCount when isShared=true", async () => {
    seedRow({
      id: 22,
      userId: "owner-1",
      isShared: true,
      shareToken: "PUBLIC_TOKEN",
      viewCount: 3,
    });
    const res = await fetch(`${baseUrl}/api/shared-analyses/PUBLIC_TOKEN`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(22);
    expect(body.shareToken).toBe("PUBLIC_TOKEN");
    expect(memRows.get(22)!.viewCount).toBe(4);

    await fetch(`${baseUrl}/api/shared-analyses/PUBLIC_TOKEN`);
    expect(memRows.get(22)!.viewCount).toBe(5);
  });

  it("end-to-end: PATCH share → returned token resolves publicly → viewCount increments", async () => {
    seedRow({
      id: 33,
      userId: "owner-1",
      isShared: false,
      shareToken: null,
      viewCount: 0,
    });
    const patch = await fetch(`${baseUrl}/api/saved-analyses/33`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isShared: true }),
    });
    expect(patch.status).toBe(200);
    const patched = await patch.json();
    const mintedToken: string = patched.shareToken;
    expect(mintedToken).toBeTruthy();

    const pub = await fetch(`${baseUrl}/api/shared-analyses/${mintedToken}`);
    expect(pub.status).toBe(200);
    const pubBody = await pub.json();
    expect(pubBody.id).toBe(33);
    expect(memRows.get(33)!.viewCount).toBe(1);
  });
});
