import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// In-memory mock storage with just the surface area hq-client touches.
const outboxRows = new Map<number, any>();
let nextId = 1;
const leadUpdates: any[] = [];
const peggyUpdates: any[] = [];

vi.mock("../storage", () => ({
  storage: {
    createHqOutbox: vi.fn(async (row: any) => {
      const created = {
        id: nextId++,
        attempts: 0,
        lastAttemptAt: null,
        lastError: null,
        hqSubmissionId: null,
        forwardedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...row,
      };
      outboxRows.set(created.id, created);
      return created;
    }),
    updateHqOutbox: vi.fn(async (id: number, patch: any) => {
      const existing = outboxRows.get(id);
      if (!existing) return undefined;
      const updated = { ...existing, ...patch, updatedAt: new Date() };
      outboxRows.set(id, updated);
      return updated;
    }),
    getHqOutbox: vi.fn(async (id: number) => outboxRows.get(id)),
    updateLead: vi.fn(async (id: number, patch: any) => {
      leadUpdates.push({ id, ...patch });
      return { id, ...patch };
    }),
    updatePeggyConversation: vi.fn(async (id: number, patch: any) => {
      peggyUpdates.push({ id, ...patch });
      return { id, ...patch };
    }),
    getHqOutboxList: vi.fn(async () => Array.from(outboxRows.values())),
  },
}));

import {
  forward,
  outreachReasonForLeadType,
  retryOutboxRow,
  drainPending,
  _resetHealthCacheForTests,
} from "../integrations/hq-client";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  outboxRows.clear();
  leadUpdates.length = 0;
  peggyUpdates.length = 0;
  nextId = 1;
  _resetHealthCacheForTests();
  process.env.PEGASUS_HQ_PUBLIC_INTAKE_URL = "https://hq.test/api/public/intake";
});

afterEach(() => {
  vi.restoreAllMocks();
  process.env = { ...ORIGINAL_ENV };
});

describe("outreachReasonForLeadType — replit.md leadType→reason map", () => {
  it("maps the locked vocabulary", () => {
    expect(outreachReasonForLeadType("submit")).toBe("property_review");
    expect(outreachReasonForLeadType("vendor")).toBe("vendor_application");
    expect(outreachReasonForLeadType("buybox_interest")).toBe("buybox_interest");
    expect(outreachReasonForLeadType("blueprint_request")).toBe("paid_blueprint_request");
    expect(outreachReasonForLeadType("peggy_note")).toBe("peggy_inbound");
    expect(outreachReasonForLeadType("peggy_notify")).toBe("peggy_inbound");
  });
  it("falls back to general_inquiry for unknowns", () => {
    expect(outreachReasonForLeadType("anything_else")).toBe("general_inquiry");
  });
});

describe("forward() — outbox-first guarantee", () => {
  it("queues a row before any network attempt and returns an idempotency key", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      // First call is /api/health, return 200
      return new Response("{}", { status: 200 });
    });

    const result = await forward({
      surface: "lead",
      sourceId: 42,
      payload: {
        contactName: "Test User",
        outreachReason: "property_review",
        sourceChannel: "website:submit",
        consentContact: true,
        consentCcpaAcknowledged: true,
      },
    });

    expect(result.outboxId).toBeGreaterThan(0);
    expect(result.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
    expect(result.queued).toBe(true);
    expect(outboxRows.size).toBe(1);
    const row = outboxRows.get(result.outboxId)!;
    expect(row.surface).toBe("lead");
    expect(row.sourceId).toBe(42);
    expect(row.payload.idempotencyKey).toBe(result.idempotencyKey);
    fetchSpy.mockRestore();
  });

  it("reuses caller-supplied idempotency key (HQ contract §5)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 503 }));
    const key = "00000000-0000-4000-8000-000000000001";
    const result = await forward({
      surface: "lead",
      payload: {
        contactName: "X",
        outreachReason: "property_review",
        sourceChannel: "website:submit",
        consentContact: true,
        consentCcpaAcknowledged: true,
        idempotencyKey: key,
      },
    });
    expect(result.idempotencyKey).toBe(key);
  });
});

describe("forward() — HQ down path (no-op fallback, replit.md)", () => {
  it("leaves the row pending when /api/health is not 200", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      if (String(url).includes("/api/health")) {
        return new Response("", { status: 503 });
      }
      return new Response("{}", { status: 200 });
    });

    const result = await forward({
      surface: "lead",
      payload: {
        contactName: "Test",
        outreachReason: "property_review",
        sourceChannel: "website:submit",
        consentContact: true,
        consentCcpaAcknowledged: true,
      },
    });

    await result._inFlight;
    const row = outboxRows.get(result.outboxId)!;
    expect(row.status).toBe("pending");
    expect(row.lastError).toContain("HQ /api/health");
  });
});

describe("retryOutboxRow() — success path back-references the source row", () => {
  it("writes hq_submission_id back onto the originating lead", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      if (String(url).includes("/api/health")) {
        return new Response("", { status: 200 });
      }
      return new Response(JSON.stringify({ hq_submission_id: "HQ-ABC-123", received_at: "now" }), { status: 200 });
    });

    const result = await forward({
      surface: "lead",
      sourceId: 99,
      payload: {
        contactName: "Test",
        outreachReason: "property_review",
        sourceChannel: "website:submit",
        consentContact: true,
        consentCcpaAcknowledged: true,
      },
    });

    // Manually run the retry (test path — fire-and-forget timing is non-deterministic)
    const response = await retryOutboxRow(result.outboxId);
    expect(response?.hq_submission_id).toBe("HQ-ABC-123");
    const row = outboxRows.get(result.outboxId)!;
    expect(row.status).toBe("forwarded");
    expect(row.hqSubmissionId).toBe("HQ-ABC-123");
    expect(leadUpdates.some((u) => u.id === 99 && u.hqSubmissionId === "HQ-ABC-123")).toBe(true);
    fetchMock.mockRestore();
  });
});

describe("retryOutboxRow() — 4xx never retries (validation error)", () => {
  it("marks the row failed after a single 4xx and surfaces the error body", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      if (String(url).includes("/api/health")) {
        return new Response("", { status: 200 });
      }
      return new Response("missing field: contactName", { status: 400 });
    });

    const result = await forward({
      surface: "lead",
      payload: {
        contactName: "Test",
        outreachReason: "property_review",
        sourceChannel: "website:submit",
        consentContact: true,
        consentCcpaAcknowledged: true,
      },
    });

    await retryOutboxRow(result.outboxId);
    const row = outboxRows.get(result.outboxId)!;
    expect(row.status).toBe("failed");
    expect(row.attempts).toBe(1);
    expect(row.lastError).toContain("HQ 400");
    expect(row.lastError).toContain("missing field");
  });
});

describe("drainPending() — sweeps pending outbox rows", () => {
  it("uses getHqOutboxList (not getHqOutbox) and forwards pending rows", async () => {
    vi.spyOn(globalThis, "setTimeout").mockImplementation(((fn: any) => {
      fn();
      return 0 as any;
    }) as any);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ hq_submission_id: "HQ-DRAIN-1" }), { status: 200 }),
    );

    const { storage } = await import("../storage");
    await storage.createHqOutbox({
      idempotencyKey: "drain-key-1",
      surface: "lead",
      sourceId: undefined as any,
      payload: {
        contactName: "A",
        outreachReason: "property_review",
        sourceChannel: "website:submit",
        consentContact: true,
        consentCcpaAcknowledged: true,
        idempotencyKey: "drain-key-1",
      } as any,
      status: "pending",
    });

    const result = await drainPending(10);
    expect(result.tried).toBe(1);
    expect(result.ok).toBe(1);
    expect(result.stillPending).toBe(0);
  });
});

describe("retryOutboxRow() — 5xx retries then leaves pending for next drain", () => {
  it("attempts 3 times on 500 then marks pending (not failed)", async () => {
    // Collapse backoff first so retries don't actually wait 1s/4s/16s.
    vi.spyOn(globalThis, "setTimeout").mockImplementation(((fn: any) => {
      fn();
      return 0 as any;
    }) as any);

    let calls = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      calls++;
      return new Response("internal", { status: 500 });
    });

    // Directly seed the outbox so we exercise drainOutboxRow once
    // without the fire-and-forget attempt from forward().
    const { storage } = await import("../storage");
    const row = await storage.createHqOutbox({
      idempotencyKey: "test-5xx-key",
      surface: "lead",
      sourceId: undefined as any,
      payload: {
        contactName: "Test",
        outreachReason: "property_review",
        sourceChannel: "website:submit",
        consentContact: true,
        consentCcpaAcknowledged: true,
        idempotencyKey: "test-5xx-key",
      } as any,
      status: "pending",
    });

    await retryOutboxRow(row.id);
    const final = outboxRows.get(row.id)!;
    expect(calls).toBe(3);
    expect(final.attempts).toBe(3);
    expect(final.status).toBe("pending");
    expect(final.lastError).toContain("HQ 500");
  }, 15_000);
});
