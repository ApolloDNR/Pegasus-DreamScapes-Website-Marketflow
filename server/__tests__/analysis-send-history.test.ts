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

type AnalysisRow = { id: number; userId: string };
type SendRow = {
  id: number;
  savedAnalysisId: number;
  recipientName: string;
  recipientEmail: string;
  senderUserId: string | null;
  sentAt: Date;
};

const analyses = new Map<number, AnalysisRow>();
const sends: SendRow[] = [];
let nextSendId = 1;

function reset() {
  analyses.clear();
  sends.length = 0;
  nextSendId = 1;
}

vi.mock("../storage", () => ({
  storage: {
    async getSavedAnalysis(id: number) {
      return analyses.get(id);
    },
    async createAnalysisSend(data: Omit<SendRow, "id" | "sentAt"> & { sentAt?: Date }) {
      const row: SendRow = {
        id: nextSendId++,
        savedAnalysisId: data.savedAnalysisId,
        recipientName: data.recipientName,
        recipientEmail: data.recipientEmail,
        senderUserId: data.senderUserId ?? null,
        sentAt: data.sentAt ?? new Date(),
      };
      sends.push(row);
      return row;
    },
    async getAnalysisSends(savedAnalysisId: number, limit = 5) {
      return sends
        .filter((s) => s.savedAnalysisId === savedAnalysisId)
        .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
        .slice(0, limit);
    },
  },
}));

const { registerAnalysisSendHistoryRoutes, recordOwnerOriginatedSend } =
  await import("../analysisSendHistoryRoutes");

let server: Server;
let baseUrl = "";
let currentUserId: string | null = "owner-1";

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  const isAuthenticated: express.RequestHandler = (req: any, res, next) => {
    if (!currentUserId) return res.status(401).json({ message: "Unauthorized" });
    req.user = { claims: { sub: currentUserId } };
    next();
  };
  registerAnalysisSendHistoryRoutes(app, { isAuthenticated });
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

describe("GET /api/saved-analyses/:id/sends (owner-only history read)", () => {
  it("returns 401 when no user is authenticated", async () => {
    analyses.set(1, { id: 1, userId: "owner-1" });
    currentUserId = null;
    const res = await fetch(`${baseUrl}/api/saved-analyses/1/sends`);
    expect(res.status).toBe(401);
  });

  it("returns 400 for an invalid id", async () => {
    const res = await fetch(`${baseUrl}/api/saved-analyses/not-a-number/sends`);
    expect(res.status).toBe(400);
  });

  it("returns 404 when the analysis does not exist", async () => {
    const res = await fetch(`${baseUrl}/api/saved-analyses/999/sends`);
    expect(res.status).toBe(404);
  });

  it("returns 403 when the requester is not the owner", async () => {
    analyses.set(1, { id: 1, userId: "owner-1" });
    currentUserId = "someone-else";
    const res = await fetch(`${baseUrl}/api/saved-analyses/1/sends`);
    expect(res.status).toBe(403);
  });

  it("returns the owner's history sorted by sentAt desc and capped at 5", async () => {
    analyses.set(1, { id: 1, userId: "owner-1" });
    // Seed 7 send rows with increasing timestamps; expect newest 5 back.
    for (let i = 0; i < 7; i++) {
      sends.push({
        id: i + 100,
        savedAnalysisId: 1,
        recipientName: `R${i}`,
        recipientEmail: `r${i}@x.com`,
        senderUserId: "owner-1",
        sentAt: new Date(2026, 0, i + 1),
      });
    }
    nextSendId = 200;
    const res = await fetch(`${baseUrl}/api/saved-analyses/1/sends`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as SendRow[];
    expect(body).toHaveLength(5);
    expect(body[0].recipientName).toBe("R6");
    expect(body[4].recipientName).toBe("R2");
  });

  it("end-to-end: createAnalysisSend then GET surfaces the row to the owner", async () => {
    analyses.set(42, { id: 42, userId: "owner-1" });
    const { storage: s } = await import("../storage");
    await s.createAnalysisSend({
      savedAnalysisId: 42,
      recipientName: "Jane Lender",
      recipientEmail: "jane@lender.com",
      senderUserId: "owner-1",
    });
    const res = await fetch(`${baseUrl}/api/saved-analyses/42/sends`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as SendRow[];
    expect(body).toHaveLength(1);
    expect(body[0].recipientEmail).toBe("jane@lender.com");
  });

  it("recordOwnerOriginatedSend skips persistence when sender is not owner (share-token path)", async () => {
    const before = sends.length;
    const result = await recordOwnerOriginatedSend({
      analysisId: 70,
      analysisOwnerId: "owner-1",
      senderUserId: null, // anonymous public-share-token send
      recipientName: "Anon",
      recipientEmail: "anon@x.com",
    });
    expect(result).toEqual({ recorded: false, ownerOriginated: false });
    expect(sends.length).toBe(before);

    const result2 = await recordOwnerOriginatedSend({
      analysisId: 70,
      analysisOwnerId: "owner-1",
      senderUserId: "stranger",
      recipientName: "Stranger",
      recipientEmail: "stranger@x.com",
    });
    expect(result2).toEqual({ recorded: false, ownerOriginated: false });
    expect(sends.length).toBe(before);
  });

  it("recordOwnerOriginatedSend records when owner sends and surfaces partial-failure when storage throws", async () => {
    // Happy path
    const ok = await recordOwnerOriginatedSend({
      analysisId: 71,
      analysisOwnerId: "owner-1",
      senderUserId: "owner-1",
      recipientName: "OK",
      recipientEmail: "ok@x.com",
    });
    expect(ok).toEqual({ recorded: true, ownerOriginated: true });

    // Force storage to throw and verify the helper does NOT re-throw — the
    // caller must be free to return 2xx (email already delivered) instead
    // of erroring back to the client (which would prompt a duplicate retry).
    const { storage: s } = await import("../storage");
    const orig = s.createAnalysisSend;
    (s as any).createAnalysisSend = async () => {
      throw new Error("DB exploded");
    };
    try {
      const fail = await recordOwnerOriginatedSend({
        analysisId: 71,
        analysisOwnerId: "owner-1",
        senderUserId: "owner-1",
        recipientName: "Failed",
        recipientEmail: "failed@x.com",
      });
      expect(fail).toEqual({ recorded: false, ownerOriginated: true });
    } finally {
      (s as any).createAnalysisSend = orig;
    }
  });

  it("filters out sends not attributed to the owner (defense in depth)", async () => {
    analyses.set(50, { id: 50, userId: "owner-1" });
    const { storage: s } = await import("../storage");
    await s.createAnalysisSend({
      savedAnalysisId: 50,
      recipientName: "Owner-sent",
      recipientEmail: "owner-sent@x.com",
      senderUserId: "owner-1",
    });
    // Simulate an anomalous/legacy non-owner row (shouldn't normally exist
    // because the email handler gates on ownership, but the read path must
    // still defend against it).
    await s.createAnalysisSend({
      savedAnalysisId: 50,
      recipientName: "Anon",
      recipientEmail: "anon@x.com",
      senderUserId: null,
    });
    await s.createAnalysisSend({
      savedAnalysisId: 50,
      recipientName: "Stranger",
      recipientEmail: "stranger@x.com",
      senderUserId: "stranger",
    });
    const res = await fetch(`${baseUrl}/api/saved-analyses/50/sends`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as SendRow[];
    expect(body).toHaveLength(1);
    expect(body[0].recipientEmail).toBe("owner-sent@x.com");
  });
});
