import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import express, {
  type Express,
  type Request,
  type RequestHandler,
} from "express";
import fs from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { normalizeMarketflowWholesaleSubmission } from "@shared/marketflow-wholesale-submission";

type AuditRow = {
  id: number;
  adminUserId: string;
  adminEmail: string | null;
  adminName: string | null;
  actionType: string;
  resourceType: string | null;
  resourceId: string | null;
  description: string;
  previousValue: string | null;
  newValue: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
};

type ReviewRecord = {
  id: string;
  status: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
};

const auditModulePath = path.join(process.cwd(), "server/admin-audit-routes.ts");
const auditModule = fs.existsSync(auditModulePath)
  ? await import(/* @vite-ignore */ "../admin-audit-routes")
  : {};
const reviewModule = await import("../wholesale-review-routes");

const createWriter = (
  auditModule as { createAdminAuditWriter?: unknown }
).createAdminAuditWriter;
const registerAuditRoutes = (
  auditModule as { registerAdminAuditRoutes?: unknown }
).registerAdminAuditRoutes;
const wholesaleEvent = (
  auditModule as { createWholesaleReviewAuditEvent?: unknown }
).createWholesaleReviewAuditEvent;
const capitalEvent = (
  auditModule as { createCapitalReviewAuditEvent?: unknown }
).createCapitalReviewAuditEvent;

function requireAuditModule() {
  expect(createWriter, "server-owned audit writer must exist").toBeTypeOf(
    "function",
  );
  expect(
    registerAuditRoutes,
    "protected audit read routes must exist",
  ).toBeTypeOf("function");
  expect(wholesaleEvent).toBeTypeOf("function");
  expect(capitalEvent).toBeTypeOf("function");
  if (
    typeof createWriter !== "function" ||
    typeof registerAuditRoutes !== "function" ||
    typeof wholesaleEvent !== "function" ||
    typeof capitalEvent !== "function"
  ) {
    throw new Error("Admin audit integrity module is not implemented");
  }
  return {
    createWriter: createWriter as (...args: any[]) => any,
    registerAuditRoutes: registerAuditRoutes as (...args: any[]) => any,
    wholesaleEvent: wholesaleEvent as (...args: any[]) => any,
    capitalEvent: capitalEvent as (...args: any[]) => any,
  };
}

const auditRows: AuditRow[] = [];
const deals = new Map<string, ReviewRecord>();
const projects = new Map<string, ReviewRecord>();
let server: Server | undefined;
let baseUrl = "";
let failAuditWrites = false;

const getAuthUserId = (request: Request): string | null => {
  const candidate =
    (request as any).user?.claims?.sub ??
    (request as any).supabaseUser?.id;
  return typeof candidate === "string" && candidate.trim()
    ? candidate.trim()
    : null;
};

const authenticate: RequestHandler = (request, response, next) => {
  const mode = request.get("x-test-auth");
  if (!mode) return response.status(401).json({ message: "Unauthorized" });

  const nonstaff = mode === "nonstaff";
  const email = nonstaff ? "member@example.com" : "admin@example.com";
  if (mode === "supabase") {
    (request as any).supabaseUser = {
      id: "supabase-admin",
      email,
      claims: {
        sub: "supabase-admin",
        email,
        first_name: "Supa",
        last_name: "Admin",
      },
    };
    (request as any).user = {
      claims: (request as any).supabaseUser.claims,
    };
  } else if (mode === "conflict") {
    (request as any).user = {
      claims: { sub: "oidc-admin", email, name: "OIDC Admin" },
    };
    (request as any).supabaseUser = {
      id: "different-admin",
      email,
      claims: { sub: "different-admin", email },
    };
  } else {
    (request as any).user = {
      claims: {
        sub: nonstaff ? "ordinary-member" : "oidc-admin",
        email,
        name: nonstaff ? "Ordinary Member" : "OIDC Admin",
      },
    };
  }
  return next();
};

const requireStaff: RequestHandler = (request, response, next) => {
  const email = (request as any).user?.claims?.email;
  return email === "admin@example.com"
    ? next()
    : response.status(403).json({ message: "Forbidden" });
};

beforeAll(async () => {
  if (
    typeof createWriter !== "function" ||
    typeof registerAuditRoutes !== "function" ||
    typeof wholesaleEvent !== "function" ||
    typeof capitalEvent !== "function"
  ) {
    return;
  }
  const api = requireAuditModule();
  const app: Express = express();
  app.use(express.json());

  const createAuditLog = async (entry: Omit<AuditRow, "id" | "createdAt">) => {
    if (failAuditWrites) throw new Error("audit database unavailable");
    const row: AuditRow = {
      ...entry,
      id: auditRows.length + 1,
      createdAt: new Date("2026-08-30T15:00:00.000Z"),
    };
    auditRows.push(row);
    return row;
  };
  const writeAudit = api.createWriter({ getAuthUserId, createAuditLog });

  api.registerAuditRoutes(
    app,
    {
      getAuthUserId,
      getAuditLogs: async (options: any) =>
        auditRows
          .filter(
            (row) =>
              (!options.actionType || row.actionType === options.actionType) &&
              (!options.actionTypes ||
                options.actionTypes.includes(row.actionType)) &&
              (!options.adminUserId ||
                row.adminUserId === options.adminUserId),
          )
          .slice(options.offset, options.offset + options.limit),
      getAuditLogCount: async (options: any) =>
        auditRows.filter(
          (row) =>
            (!options.actionType || row.actionType === options.actionType) &&
            (!options.actionTypes ||
              options.actionTypes.includes(row.actionType)) &&
            (!options.adminUserId || row.adminUserId === options.adminUserId),
        ).length,
      getAuditLogById: async (id: number) =>
        auditRows.find((row) => row.id === id),
      logError: () => undefined,
    },
    { authenticate, requireStaff },
  );

  reviewModule.registerWholesaleReviewRoutes(
    app,
    {
      resolveIdentity: () => null,
      normalizeSubmission: normalizeMarketflowWholesaleSubmission,
      createWholesaleDeal: async () => null,
      getPendingWholesaleDeals: async () => [],
      createCapitalProject: async () => null,
      getPendingCapitalProjects: async () => [],
      getWholesaleDeal: async (id: string) => (deals.get(id) as any) ?? null,
      updateWholesaleDeal: async (id: string, updates: object) => {
        const current = deals.get(id);
        if (!current) return null;
        const updated = { ...current, ...updates };
        deals.set(id, updated);
        return updated as any;
      },
      getCapitalProject: async (id: string) =>
        (projects.get(id) as any) ?? null,
      updateCapitalProject: async (id: string, updates: object) => {
        const current = projects.get(id);
        if (!current) return null;
        const updated = { ...current, ...updates };
        projects.set(id, updated);
        return updated as any;
      },
      serializeWholesaleDeal: (record: object) => ({ ...record }),
      serializeCapitalProject: (record: object) => ({ ...record }),
      auditStatusChange: async (
        request: Request,
        before: ReviewRecord,
        after: ReviewRecord,
      ) => writeAudit(request, api.wholesaleEvent(before, after)),
      auditCapitalStatusChange: async (
        request: Request,
        before: ReviewRecord,
        after: ReviewRecord,
      ) => writeAudit(request, api.capitalEvent(before, after)),
      logError: () => undefined,
    } as any,
    {
      authenticate: (_request: Request, _response: any, next: any) => next(),
      authenticateStaff: authenticate,
      requireInventoryAccess: (_request: Request, _response: any, next: any) =>
        next(),
      requireStaff,
    } as any,
  );

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
  auditRows.length = 0;
  failAuditWrites = false;
  deals.clear();
  projects.clear();
  deals.set("deal-1", {
    id: "deal-1",
    wholesaler_id: "seller-1",
    external_wholesaler_id: null,
    address: "Private address must not enter audit snapshots",
    status: "Under Review",
    is_public: false,
    created_at: "2026-08-30T14:00:00.000Z",
    updated_at: "2026-08-30T14:00:00.000Z",
  });
  projects.set("project-1", {
    id: "project-1",
    owner_id: "owner-1",
    external_owner_id: null,
    title: "Private project title",
    status: "Under Review",
    is_public: false,
    created_at: "2026-08-30T14:00:00.000Z",
    updated_at: "2026-08-30T14:00:00.000Z",
  });
});

describe("admin audit integrity", () => {
  it("serves protected reads to both verified staff auth modes and fails closed", async () => {
    requireAuditModule();
    auditRows.push({
      id: 1,
      adminUserId: "seed-admin",
      adminEmail: "admin@example.com",
      adminName: "Seed Admin",
      actionType: "deal_approved",
      resourceType: "wholesale_deal",
      resourceId: "deal-seed",
      description: "Seeded server event",
      previousValue: '{"status":"under_review"}',
      newValue: '{"status":"listed"}',
      ipAddress: null,
      userAgent: null,
      createdAt: new Date("2026-08-30T15:00:00.000Z"),
    });
    auditRows.push({
      id: 2,
      adminUserId: "legacy-admin",
      adminEmail: "admin@example.com",
      adminName: "Legacy Admin",
      actionType: "user_updated",
      resourceType: "user",
      resourceId: "member-1",
      description: "Legacy non-review event",
      previousValue: null,
      newValue: null,
      ipAddress: null,
      userAgent: null,
      createdAt: new Date("2026-08-30T14:00:00.000Z"),
    });

    for (const mode of ["oidc", "supabase"]) {
      const response = await fetch(`${baseUrl}/api/audit-logs`, {
        headers: { "x-test-auth": mode },
      });
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({ total: 1, limit: 50 });
      expect(response.headers.get("cache-control")).toBe("no-store");
    }

    expect((await fetch(`${baseUrl}/api/audit-logs`)).status).toBe(401);
    expect(
      (
        await fetch(`${baseUrl}/api/audit-logs`, {
          headers: { "x-test-auth": "nonstaff" },
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await fetch(`${baseUrl}/api/audit-logs`, {
          headers: { "x-test-auth": "conflict" },
        })
      ).status,
    ).toBe(401);
  });

  it("records one server-owned, privacy-bounded event for each successful decision", async () => {
    requireAuditModule();
    const dealResponse = await fetch(
      `${baseUrl}/api/marketplace/admin/deals/deal-1/status`,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-test-auth": "oidc",
          "user-agent": "audit-integrity-test",
        },
        body: JSON.stringify({
          status: "listed",
          rejectionReason: "must never be copied to the audit row",
        }),
      },
    );
    expect(dealResponse.status).toBe(200);

    const projectResponse = await fetch(
      `${baseUrl}/api/marketplace/admin/projects/project-1/status`,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-test-auth": "supabase",
        },
        body: JSON.stringify({
          status: "rejected",
          rejectionReason: "private reviewer note",
        }),
      },
    );
    expect(projectResponse.status).toBe(200);

    const response = await fetch(`${baseUrl}/api/audit-logs`, {
      headers: { "x-test-auth": "oidc" },
    });
    const body = (await response.json()) as { logs: AuditRow[]; total: number };
    expect(body.total).toBe(2);
    expect(body.logs).toEqual([
      expect.objectContaining({
        adminUserId: "oidc-admin",
        adminEmail: "admin@example.com",
        adminName: "OIDC Admin",
        actionType: "deal_approved",
        resourceType: "wholesale_deal",
        resourceId: "deal-1",
        previousValue: '{"status":"under_review"}',
        newValue: '{"status":"listed"}',
      }),
      expect.objectContaining({
        adminUserId: "supabase-admin",
        adminEmail: "admin@example.com",
        adminName: "Supa Admin",
        actionType: "project_rejected",
        resourceType: "capital_project",
        resourceId: "project-1",
        previousValue: '{"status":"under_review"}',
        newValue: '{"status":"rejected"}',
      }),
    ]);
    expect(JSON.stringify(body.logs)).not.toContain("Private address");
    expect(JSON.stringify(body.logs)).not.toContain("private reviewer note");
    expect(JSON.stringify(body.logs)).not.toContain("must never be copied");
  });

  it("does not accept client-authored logs or audit rejected mutations", async () => {
    requireAuditModule();
    const fabricated = await fetch(`${baseUrl}/api/audit-logs`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-test-auth": "oidc",
      },
      body: JSON.stringify({
        actionType: "deal_approved",
        description: "fabricated",
      }),
    });
    expect(fabricated.status).toBe(404);

    const invalid = await fetch(
      `${baseUrl}/api/marketplace/admin/deals/deal-1/status`,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-test-auth": "oidc",
        },
        body: JSON.stringify({ status: "published_without_review" }),
      },
    );
    expect(invalid.status).toBe(400);
    const missing = await fetch(
      `${baseUrl}/api/marketplace/admin/projects/missing/status`,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-test-auth": "supabase",
        },
        body: JSON.stringify({ status: "approved" }),
      },
    );
    expect(missing.status).toBe(404);
    expect(auditRows).toHaveLength(0);
  });

  it("reports an audit persistence failure without misreporting the persisted mutation", async () => {
    requireAuditModule();
    failAuditWrites = true;

    const response = await fetch(
      `${baseUrl}/api/marketplace/admin/deals/deal-1/status`,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-test-auth": "oidc",
        },
        body: JSON.stringify({ status: "listed" }),
      },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      id: "deal-1",
      status: "listed",
      is_public: true,
      auditRecorded: false,
      auditWarning: expect.stringContaining("could not be recorded"),
    });
    expect(deals.get("deal-1")).toMatchObject({
      status: "listed",
      is_public: true,
    });
    expect(auditRows).toHaveLength(0);
  });
});
