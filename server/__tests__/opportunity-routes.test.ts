import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

const testState = vi.hoisted(() => ({
  inserted: [] as Array<Record<string, unknown>>,
  hqForward: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("../db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn((values: Record<string, unknown>) => ({
        returning: vi.fn(async () => {
          const row = {
            id: `opportunity-${testState.inserted.length + 1}`,
            createdAt: new Date("2026-07-22T12:00:00.000Z"),
            updatedAt: new Date("2026-07-22T12:00:00.000Z"),
            ...values,
          };
          testState.inserted.push(row);
          return [row];
        }),
      })),
    })),
  },
}));

vi.mock("../email", () => ({
  sendEmail: testState.sendEmail,
}));

vi.mock("../integrations/hq-client", () => ({
  forward: testState.hqForward,
  outreachReasonForLeadType: (leadType: string) => {
    const reasons: Record<string, string> = {
      submit: "property_review",
      seller: "property_review",
      vendor: "vendor_application",
      investor: "capital_inquiry",
      buyer: "buyer_inquiry",
      contact: "general_inquiry",
    };
    return reasons[leadType] ?? "general_inquiry";
  },
}));

const { registerOpportunityRoutes } = await import("../opportunityRoutes");

let server: Server;
let baseUrl = "";
const originalStaffEmail = process.env.STAFF_NOTIFICATION_EMAIL;
const originalInternalEmail = process.env.INTERNAL_NOTIFY_EMAIL;

function validSubmission(overrides: Record<string, unknown> = {}) {
  return {
    visitorType: "owner",
    contactName: "Taylor Owner",
    email: "taylor@example.com",
    phone: "510-555-0101",
    propertyAddress: "123 Bay View Ave",
    city: "Oakland",
    state: "CA",
    zipCode: "94610",
    propertyType: "Single-family",
    condition: "Needs repairs",
    estimatedValue: 875_000,
    sourcePage: "bring-an-opportunity",
    leadSource: "website",
    utmCampaign: "east-bay-owner-intake",
    consentAccepted: true,
    hp_company: "",
    ts_elapsed_ms: 4_000,
    ...overrides,
  };
}

async function postOpportunity(overrides: Record<string, unknown> = {}) {
  return fetch(`${baseUrl}/api/opportunities`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(validSubmission(overrides)),
  });
}

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  const pass: express.RequestHandler = (_req, _res, next) => next();
  registerOpportunityRoutes(app, {
    isAuthenticated: pass,
    requireStaffRole: pass,
  });
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  if (originalStaffEmail === undefined) delete process.env.STAFF_NOTIFICATION_EMAIL;
  else process.env.STAFF_NOTIFICATION_EMAIL = originalStaffEmail;
  if (originalInternalEmail === undefined) delete process.env.INTERNAL_NOTIFY_EMAIL;
  else process.env.INTERNAL_NOTIFY_EMAIL = originalInternalEmail;
});

beforeEach(() => {
  testState.inserted.length = 0;
  testState.hqForward.mockReset().mockResolvedValue({
    outboxId: 41,
    idempotencyKey: "00000000-0000-4000-8000-000000000041",
    queued: true,
  });
  testState.sendEmail.mockReset().mockResolvedValue(undefined);
  delete process.env.STAFF_NOTIFICATION_EMAIL;
  delete process.env.INTERNAL_NOTIFY_EMAIL;
});

describe("POST /api/opportunities — durable HQ intake", () => {
  it("queues a canonical HQ payload while preserving the existing 201 response", async () => {
    const response = await postOpportunity();

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      id: "opportunity-1",
      status: "New",
      recommendedLane: "Acquisitions → (Development) → Dispositions",
      assignedDepartment: "Acquisitions",
    });
    expect(testState.hqForward).toHaveBeenCalledTimes(1);
    expect(testState.hqForward).toHaveBeenCalledWith({
      surface: "lead",
      payload: {
        propertyAddress: "123 Bay View Ave, Oakland, CA 94610",
        contactName: "Taylor Owner",
        contactEmail: "taylor@example.com",
        contactPhone: "510-555-0101",
        outreachReason: "property_review",
        sourceChannel: "website:bring-an-opportunity",
        consentContact: true,
        consentCcpaAcknowledged: true,
        extra: expect.objectContaining({
          opportunityId: "opportunity-1",
          visitorType: "owner",
          recommendedLane: "Acquisitions → (Development) → Dispositions",
          assignedDepartment: "Acquisitions",
          propertyType: "Single-family",
          condition: "Needs repairs",
          estimatedValue: 875_000,
          utmCampaign: "east-bay-owner-intake",
        }),
      },
    });
  });

  it("attempts the durable queue but keeps HQ failure non-blocking", async () => {
    testState.hqForward.mockRejectedValueOnce(new Error("outbox unavailable"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await postOpportunity();

    expect(testState.hqForward).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(expect.objectContaining({
      id: "opportunity-1",
      status: "New",
    }));
    expect(errorSpy).toHaveBeenCalledWith(
      "[hq-forward] opportunity queue error (non-blocking):",
      expect.any(Error),
    );
    errorSpy.mockRestore();
  });
});

describe("POST /api/opportunities — staff notification address", () => {
  it("prefers the documented STAFF_NOTIFICATION_EMAIL setting", async () => {
    process.env.STAFF_NOTIFICATION_EMAIL = "intake@pegasus.test";
    process.env.INTERNAL_NOTIFY_EMAIL = "legacy@pegasus.test";

    const response = await postOpportunity();

    expect(response.status).toBe(201);
    expect(testState.sendEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ to: "intake@pegasus.test" }),
    );
  });

  it("retains INTERNAL_NOTIFY_EMAIL as a legacy fallback", async () => {
    process.env.INTERNAL_NOTIFY_EMAIL = "legacy@pegasus.test";

    const response = await postOpportunity();

    expect(response.status).toBe(201);
    expect(testState.sendEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ to: "legacy@pegasus.test" }),
    );
  });
});
