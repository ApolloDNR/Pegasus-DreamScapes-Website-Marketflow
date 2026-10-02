import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import express, { type Express, type RequestHandler } from "express";
import fs from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { normalizeMarketflowWholesaleSubmission } from "@shared/marketflow-wholesale-submission";

type WholesaleRecord = {
  id: string;
  wholesaler_id: string | null;
  external_wholesaler_id: string | null;
  address: string;
  status: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
};

type CapitalRecord = {
  id: string;
  owner_id: string | null;
  external_owner_id: string | null;
  title: string;
  status: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
};

type HandlerFactory = (dependencies: {
  resolveIdentity(request: unknown): {
    userId: string;
    kind: "supabase" | "external";
  } | null;
  normalizeSubmission: typeof normalizeMarketflowWholesaleSubmission;
  createWholesaleDeal(
    input: Omit<WholesaleRecord, "id" | "created_at" | "updated_at">,
  ): Promise<WholesaleRecord | null>;
  getPendingWholesaleDeals(): Promise<WholesaleRecord[]>;
  createCapitalProject(
    input: Omit<CapitalRecord, "id" | "created_at" | "updated_at">,
  ): Promise<CapitalRecord | null>;
  getPendingCapitalProjects(): Promise<CapitalRecord[]>;
  getCapitalProject(id: string): Promise<CapitalRecord | null>;
  updateCapitalProject(
    id: string,
    updates: Partial<CapitalRecord>,
  ): Promise<CapitalRecord | null>;
  getWholesaleDeal(id: string): Promise<WholesaleRecord | null>;
  updateWholesaleDeal(
    id: string,
    updates: Partial<WholesaleRecord>,
  ): Promise<WholesaleRecord | null>;
  serializeWholesaleDeal(record: WholesaleRecord): Record<string, unknown>;
  serializeCapitalProject(record: CapitalRecord): Record<string, unknown>;
  auditStatusChange(
    request: unknown,
    before: WholesaleRecord,
    after: WholesaleRecord,
  ): Promise<void>;
  auditCapitalStatusChange(
    request: unknown,
    before: CapitalRecord,
    after: CapitalRecord,
  ): Promise<void>;
  logError(message: string, error: unknown): void;
}) => {
  submit: RequestHandler;
  pending: RequestHandler;
  updateStatus: RequestHandler;
};

type RouteDependencies = Parameters<HandlerFactory>[0];
type RouteRegistrar = (
  app: Express,
  dependencies: RouteDependencies,
  middleware: {
    authenticate: RequestHandler;
    authenticateStaff: RequestHandler;
    requireInventoryAccess: RequestHandler;
    requireStaff: RequestHandler;
  },
) => void;

const modulePath = path.join(
  process.cwd(),
  "server/wholesale-review-routes.ts",
);
const routeModule = fs.existsSync(modulePath)
  ? await import(/* @vite-ignore */ "../wholesale-review-routes")
  : {};
const createHandlers = (
  routeModule as { createWholesaleReviewRouteHandlers?: unknown }
).createWholesaleReviewRouteHandlers;
const registerRoutes = (
  routeModule as { registerWholesaleReviewRoutes?: unknown }
).registerWholesaleReviewRoutes;

function requireFactory(): HandlerFactory {
  expect(
    createHandlers,
    "the canonical wholesale submission and staff queue need one shared route pipeline",
  ).toBeTypeOf("function");
  if (typeof createHandlers !== "function") {
    throw new Error("Wholesale review route handlers are not implemented");
  }
  return createHandlers as HandlerFactory;
}

function requireRegistrar(): RouteRegistrar {
  expect(
    registerRoutes,
    "the production wholesale review registrar must mount the tested pipeline",
  ).toBeTypeOf("function");
  if (typeof registerRoutes !== "function") {
    throw new Error("Wholesale review route registrar is not implemented");
  }
  return registerRoutes as RouteRegistrar;
}

const records = new Map<string, WholesaleRecord>();
const capitalRecords = new Map<string, CapitalRecord>();
let nextId = 1;
let nextCapitalId = 1;
let failPendingRead = false;
let server: Server | undefined;
let baseUrl = "";

const validSubmission = {
  propertyAddress: "42 Canonical Way",
  city: "Oakland",
  state: "CA",
  zipCode: "94610",
  propertyType: "single_family",
  contractPrice: 500_000,
  assignmentFee: 25_000,
  strategy: "Wholesale assignment",
  highlights: ["Vacant"],
  images: ["https://example.com/front.webp"],
  consentAcknowledged: true,
  consentVersion: "marketflow-wholesale-private-review-v1",
};

beforeAll(async () => {
  if (
    typeof createHandlers !== "function" ||
    typeof registerRoutes !== "function"
  ) {
    return;
  }

  const dependencies: RouteDependencies = {
    resolveIdentity: (request: any) =>
      request.get("x-test-user")
        ? { userId: request.get("x-test-user"), kind: "external" }
        : null,
    normalizeSubmission: normalizeMarketflowWholesaleSubmission,
    createWholesaleDeal: async (input) => {
      const now = "2026-08-30T12:00:00.000Z";
      const record: WholesaleRecord = {
        ...input,
        id: `deal-${nextId++}`,
        created_at: now,
        updated_at: now,
      };
      records.set(record.id, record);
      return record;
    },
    getPendingWholesaleDeals: async () => {
      if (failPendingRead) throw new Error("Supabase unavailable");
      return [...records.values()].filter((record) =>
        ["under review", "under_review", "pending_review", "submitted"].includes(
          record.status.trim().toLowerCase(),
        ),
      );
    },
    createCapitalProject: async (input) => {
      const now = "2026-08-30T12:01:00.000Z";
      const record: CapitalRecord = {
        ...input,
        id: `project-${nextCapitalId++}`,
        created_at: now,
        updated_at: now,
      };
      capitalRecords.set(record.id, record);
      return record;
    },
    getPendingCapitalProjects: async () =>
      [...capitalRecords.values()].filter((record) =>
        ["under review", "under_review", "pending_approval", "submitted"].includes(
          record.status.trim().toLowerCase(),
        ),
      ),
    getCapitalProject: async (id) => capitalRecords.get(id) ?? null,
    updateCapitalProject: async (id, updates) => {
      const current = capitalRecords.get(id);
      if (!current) return null;
      const updated = {
        ...current,
        ...updates,
        updated_at: "2026-08-30T12:06:00.000Z",
      };
      capitalRecords.set(id, updated);
      return updated;
    },
    getWholesaleDeal: async (id) => records.get(id) ?? null,
    updateWholesaleDeal: async (id, updates) => {
      const current = records.get(id);
      if (!current) return null;
      const updated = {
        ...current,
        ...updates,
        updated_at: "2026-08-30T12:05:00.000Z",
      };
      records.set(id, updated);
      return updated;
    },
    serializeWholesaleDeal: (record) => ({
      ...record,
      wholesalerId: record.wholesaler_id,
      externalWholesalerId: record.external_wholesaler_id,
      isPublic: record.is_public,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    }),
    serializeCapitalProject: (record) => ({
      ...record,
      ownerId: record.owner_id,
      externalOwnerId: record.external_owner_id,
      isPublic: record.is_public,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    }),
    auditStatusChange: async () => undefined,
    auditCapitalStatusChange: async () => undefined,
    logError: () => undefined,
  };

  const app = express();
  app.use(express.json());
  const pass: RequestHandler = (_request, _response, next) => next();
  requireRegistrar()(app, dependencies, {
    authenticate: pass,
    authenticateStaff: pass,
    requireInventoryAccess: pass,
    requireStaff: pass,
  });
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  if (!server) return;
  await new Promise<void>((resolve, reject) => {
    server!.close((error) => (error ? reject(error) : resolve()));
  });
});

beforeEach(() => {
  records.clear();
  capitalRecords.clear();
  nextId = 1;
  nextCapitalId = 1;
  failPendingRead = false;
});

describe("canonical wholesale submission-to-review pipeline", () => {
  it("submits once, exposes that same string id to staff, and lists it through the same store", async () => {
    requireFactory();
    requireRegistrar();
    const submittedResponse = await fetch(
      `${baseUrl}/api/supabase/wholesale-deals`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-test-user": "legacy-wholesaler-1",
        },
        body: JSON.stringify(validSubmission),
      },
    );
    expect(submittedResponse.status).toBe(201);
    const submitted = (await submittedResponse.json()) as Record<
      string,
      unknown
    >;
    expect(submitted).toMatchObject({
      id: "deal-1",
      status: "Under Review",
      isPublic: false,
      externalWholesalerId: "legacy-wholesaler-1",
    });

    const pendingResponse = await fetch(
      `${baseUrl}/api/marketplace/admin/pending`,
    );
    expect(pendingResponse.status).toBe(200);
    const pending = (await pendingResponse.json()) as Array<
      Record<string, unknown>
    >;
    expect(pending).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: submitted.id,
          type: "wholesale_deal",
          description: "42 Canonical Way",
          submittedBy: "legacy-wholesaler-1",
        }),
      ]),
    );

    const approvalResponse = await fetch(
      `${baseUrl}/api/marketplace/admin/deals/${submitted.id}/status`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "listed" }),
      },
    );
    expect(approvalResponse.status).toBe(200);
    expect(await approvalResponse.json()).toMatchObject({
      id: submitted.id,
      status: "listed",
      isPublic: true,
      auditRecorded: true,
    });
    expect(records.get(String(submitted.id))).toMatchObject({
      id: submitted.id,
      status: "listed",
      is_public: true,
    });

    const reviewedQueueResponse = await fetch(
      `${baseUrl}/api/marketplace/admin/pending`,
    );
    expect(reviewedQueueResponse.status).toBe(200);
    const reviewedQueue = (await reviewedQueueResponse.json()) as Array<
      Record<string, unknown>
    >;
    expect(
      reviewedQueue.some(
        (item) =>
          item.type === "wholesale_deal" && item.id === submitted.id,
      ),
    ).toBe(false);
  });

  it("submits a capital project and approves that same string id without publishing it", async () => {
    requireFactory();
    requireRegistrar();
    const submittedResponse = await fetch(
      `${baseUrl}/api/supabase/capital-projects`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-test-user": "legacy-dreamscaper-1",
        },
        body: JSON.stringify({
          title: "Oakland infill concept",
          description: "Private project record for staff review.",
          location: "Oakland, CA",
          propertyType: "infill",
          structure: "equity",
          fundingGoal: 900_000,
          minInvestment: 25_000,
          projectedReturn: "Not independently verified",
          holdPeriod: "24 months",
          photos: ["https://example.com/project.webp"],
        }),
      },
    );
    expect(submittedResponse.status).toBe(201);
    const submitted = (await submittedResponse.json()) as Record<
      string,
      unknown
    >;
    expect(submitted).toMatchObject({
      id: "project-1",
      status: "Under Review",
      isPublic: false,
      externalOwnerId: "legacy-dreamscaper-1",
    });

    const pendingResponse = await fetch(
      `${baseUrl}/api/marketplace/admin/pending`,
    );
    expect(pendingResponse.status).toBe(200);
    expect(await pendingResponse.json()).toEqual([
      expect.objectContaining({
        id: submitted.id,
        type: "capital_project",
        title: "Capital Project Submission",
        description: "Oakland infill concept",
        submittedBy: "legacy-dreamscaper-1",
      }),
    ]);

    const approvalResponse = await fetch(
      `${baseUrl}/api/marketplace/admin/projects/${submitted.id}/status`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      },
    );
    expect(approvalResponse.status).toBe(200);
    expect(await approvalResponse.json()).toMatchObject({
      id: submitted.id,
      status: "approved",
      isPublic: false,
      auditRecorded: true,
    });
    expect(capitalRecords.get(String(submitted.id))).toMatchObject({
      id: submitted.id,
      status: "approved",
      is_public: false,
    });
  });

  it("returns unavailable instead of presenting a failed queue read as empty", async () => {
    requireFactory();
    requireRegistrar();
    failPendingRead = true;

    const response = await fetch(`${baseUrl}/api/marketplace/admin/pending`);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      message: "Review queue unavailable",
    });
  });
});
