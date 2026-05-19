import { describe, it, expect, beforeEach, vi } from "vitest";

// Chainable + thenable in-memory fake of `./db` so we can exercise the
// real storage class (production code) without hitting Postgres.
const setSpy = vi.fn();
const selectQueue: any[][] = [];
const updateQueue: any[][] = [];
const updateOpCount = { n: 0 };

function makeChain(op: "select" | "update") {
  const chain: any = {
    from: () => chain,
    values: () => chain,
    set: (data: any) => {
      setSpy(data);
      return chain;
    },
    where: () => chain,
    orderBy: () => chain,
    limit: () => chain,
    returning: () =>
      Promise.resolve(
        op === "update"
          ? (updateOpCount.n++, updateQueue.shift() ?? [])
          : selectQueue.shift() ?? [],
      ),
    then: (resolve: any, reject?: any) => {
      try {
        const out =
          op === "update"
            ? (updateOpCount.n++, updateQueue.shift() ?? [])
            : selectQueue.shift() ?? [];
        return Promise.resolve(out).then(resolve, reject);
      } catch (e) {
        return reject ? reject(e) : Promise.reject(e);
      }
    },
  };
  return chain;
}

vi.mock("../db", () => ({
  db: {
    select: () => makeChain("select"),
    update: () => makeChain("update"),
    insert: () => makeChain("update"),
    delete: () => makeChain("update"),
  },
}));

const { storage } = await import("../storage");

beforeEach(() => {
  setSpy.mockReset();
  selectQueue.length = 0;
  updateQueue.length = 0;
  updateOpCount.n = 0;
});

describe("storage.updateSavedAnalysis (production token-mint behavior)", () => {
  it("mints a unique shareToken when isShared flips true and none exists", async () => {
    const row = {
      id: 1,
      userId: "u",
      isShared: false,
      shareToken: null,
      sharedAt: null,
      viewCount: 0,
    };
    selectQueue.push([row]); // getSavedAnalysis(id)
    selectQueue.push([]);    // collision check returns empty
    updateQueue.push([{ ...row, isShared: true }]);

    const updated = await storage.updateSavedAnalysis(1, { isShared: true });
    expect(updated).toBeDefined();
    const setArg = setSpy.mock.calls.at(-1)?.[0];
    expect(typeof setArg.shareToken).toBe("string");
    expect(setArg.shareToken.length).toBeGreaterThanOrEqual(10);
    expect(setArg.sharedAt).toBeInstanceOf(Date);
    expect(setArg.updatedAt).toBeInstanceOf(Date);
  });

  it("does NOT re-mint a shareToken when one already exists", async () => {
    const row = {
      id: 2,
      userId: "u",
      isShared: true,
      shareToken: "EXISTING_TOK",
      sharedAt: new Date(),
      viewCount: 1,
    };
    selectQueue.push([row]); // getSavedAnalysis(id)
    updateQueue.push([row]);

    await storage.updateSavedAnalysis(2, { isShared: true });
    const setArg = setSpy.mock.calls.at(-1)?.[0];
    expect(setArg.shareToken).toBeUndefined();
    expect(setArg.sharedAt).toBeUndefined();
  });

  it("does NOT mint when isShared is not set to true (e.g. rename only)", async () => {
    const row = { id: 3, userId: "u", isShared: false, shareToken: null };
    updateQueue.push([row]);
    await storage.updateSavedAnalysis(3, { name: "rename only" } as any);
    const setArg = setSpy.mock.calls.at(-1)?.[0];
    expect(setArg.shareToken).toBeUndefined();
    expect(setArg.sharedAt).toBeUndefined();
    expect(setArg.name).toBe("rename only");
  });

  it("retries on token collision and ultimately mints a unique token", async () => {
    const row = {
      id: 99,
      userId: "u",
      isShared: false,
      shareToken: null,
      sharedAt: null,
      viewCount: 0,
    };
    selectQueue.push([row]); // getSavedAnalysis(id)
    // First two collision checks return a duplicate (force retry); third is clear.
    selectQueue.push([{ id: 999 }]);
    selectQueue.push([{ id: 998 }]);
    selectQueue.push([]);
    updateQueue.push([{ ...row, isShared: true }]);

    const updated = await storage.updateSavedAnalysis(99, { isShared: true });
    expect(updated).toBeDefined();
    const setArg = setSpy.mock.calls.at(-1)?.[0];
    expect(typeof setArg.shareToken).toBe("string");
    expect(setArg.shareToken.length).toBeGreaterThan(0);
    expect(setArg.sharedAt).toBeInstanceOf(Date);
  });

  it("does NOT mint when isShared is set to false", async () => {
    const row = { id: 4, userId: "u", isShared: true, shareToken: "T" };
    updateQueue.push([row]);
    await storage.updateSavedAnalysis(4, { isShared: false } as any);
    const setArg = setSpy.mock.calls.at(-1)?.[0];
    expect(setArg.shareToken).toBeUndefined();
    expect(setArg.sharedAt).toBeUndefined();
    expect(setArg.isShared).toBe(false);
  });
});

describe("storage.getSavedAnalysisByShareToken (production read behavior)", () => {
  it("returns the row and increments viewCount on a hit", async () => {
    selectQueue.push([
      { id: 10, isShared: true, shareToken: "T", viewCount: 4 },
    ]);
    const before = updateOpCount.n;
    const result = await storage.getSavedAnalysisByShareToken("T");
    expect(result).toBeDefined();
    expect(result!.id).toBe(10);
    // exactly one update (the viewCount bump) was issued
    expect(updateOpCount.n - before).toBe(1);
    const setArg = setSpy.mock.calls.at(-1)?.[0];
    expect(setArg).toHaveProperty("viewCount");
  });

  it("returns undefined and does NOT increment when no row matches", async () => {
    selectQueue.push([]);
    const before = updateOpCount.n;
    const result = await storage.getSavedAnalysisByShareToken("MISSING");
    expect(result).toBeUndefined();
    expect(updateOpCount.n - before).toBe(0);
  });

  it("does NOT increment when incrementViewCount=false (PDF export path)", async () => {
    selectQueue.push([
      { id: 11, isShared: true, shareToken: "T2", viewCount: 99 },
    ]);
    const before = updateOpCount.n;
    const result = await storage.getSavedAnalysisByShareToken("T2", {
      incrementViewCount: false,
    });
    expect(result!.id).toBe(11);
    expect(updateOpCount.n - before).toBe(0);
  });
});

describe("storage analysis-send history (per-recipient audit log)", () => {
  it("createAnalysisSend persists the recipient + sender attribution", async () => {
    const row = {
      id: 1,
      savedAnalysisId: 42,
      recipientName: "Jane Lender",
      recipientEmail: "jane@lender.com",
      senderUserId: "owner-1",
      sentAt: new Date(),
    };
    updateQueue.push([row]);
    const created = await storage.createAnalysisSend({
      savedAnalysisId: 42,
      recipientName: "Jane Lender",
      recipientEmail: "jane@lender.com",
      senderUserId: "owner-1",
    });
    expect(created).toBeDefined();
    expect(created.id).toBe(1);
    expect(created.recipientEmail).toBe("jane@lender.com");
  });

  it("createAnalysisSend accepts a null senderUserId for public-share-token sends", async () => {
    const row = {
      id: 2,
      savedAnalysisId: 7,
      recipientName: "Anon",
      recipientEmail: "anon@example.com",
      senderUserId: null,
      sentAt: new Date(),
    };
    updateQueue.push([row]);
    const created = await storage.createAnalysisSend({
      savedAnalysisId: 7,
      recipientName: "Anon",
      recipientEmail: "anon@example.com",
      senderUserId: null,
    });
    expect(created.senderUserId).toBeNull();
  });

  it("getAnalysisSends returns the recent rows for a given analysis", async () => {
    const rows = [
      { id: 30, savedAnalysisId: 99, recipientName: "B", recipientEmail: "b@x.com", senderUserId: "u", sentAt: new Date("2026-05-10") },
      { id: 29, savedAnalysisId: 99, recipientName: "A", recipientEmail: "a@x.com", senderUserId: "u", sentAt: new Date("2026-05-09") },
    ];
    selectQueue.push(rows);
    const result = await storage.getAnalysisSends(99);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(30);
  });

  it("getAnalysisSends returns an empty list when none exist", async () => {
    selectQueue.push([]);
    const result = await storage.getAnalysisSends(123456);
    expect(result).toEqual([]);
  });
});
