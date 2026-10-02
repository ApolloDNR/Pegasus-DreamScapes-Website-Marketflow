import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import express, { type Express, type RequestHandler } from "express";
import fs from "node:fs";
import path from "node:path";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

type ProvisioningDependencies = {
  isAuthenticated: RequestHandler;
  createUserProfile: ReturnType<typeof vi.fn>;
  createUserReputation: ReturnType<typeof vi.fn>;
  getUserRoles: ReturnType<typeof vi.fn>;
  addUserRole: ReturnType<typeof vi.fn>;
};

type RegisterUserProvisioningRoute = (
  app: Express,
  dependencies: ProvisioningDependencies,
) => void;

const modulePath = path.join(process.cwd(), "server/user-provisioning-routes.ts");
const moduleSpecifier = "../user-provisioning-routes";
const provisioningModule = fs.existsSync(modulePath)
  ? await import(/* @vite-ignore */ moduleSpecifier)
  : {};
const registerUserProvisioningRoute = (
  provisioningModule as { registerUserProvisioningRoute?: unknown }
).registerUserProvisioningRoute;

let server: Server | undefined;
let baseUrl = "";
let dependencies: ProvisioningDependencies;

function requireRouteRegistrar(): RegisterUserProvisioningRoute {
  expect(
    registerUserProvisioningRoute,
    "the production self-provisioning route registrar must exist",
  ).toBeTypeOf("function");
  if (typeof registerUserProvisioningRoute !== "function") {
    throw new Error("registerUserProvisioningRoute is not implemented");
  }
  return registerUserProvisioningRoute as RegisterUserProvisioningRoute;
}

async function postProvisioning(
  body: Record<string, unknown>,
  authenticatedUserId?: string,
  verifiedSupabaseUserId?: string,
) {
  return fetch(`${baseUrl}/api/supabase/provision-user`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(authenticatedUserId
        ? { "x-test-authenticated-user": authenticatedUserId }
        : {}),
      ...(verifiedSupabaseUserId
        ? { "x-test-supabase-user": verifiedSupabaseUserId }
        : {}),
    },
    body: JSON.stringify(body),
  });
}

beforeAll(async () => {
  if (typeof registerUserProvisioningRoute !== "function") return;

  const app = express();
  app.use(express.json());
  dependencies = {
    // The production registrar receives isHybridAuthenticated. This narrow
    // harness supplies the same req.user.claims.sub contract while allowing
    // the handler's own unauthenticated defense to be exercised.
    isAuthenticated: ((req: any, _res, next) => {
      const userId = req.get("x-test-authenticated-user");
      if (userId) req.user = { claims: { sub: userId } };
      const supabaseUserId = req.get("x-test-supabase-user");
      if (supabaseUserId) {
        req.supabaseUser = {
          id: supabaseUserId,
          claims: { sub: supabaseUserId },
        };
      }
      next();
    }) as RequestHandler,
    createUserProfile: vi.fn(),
    createUserReputation: vi.fn(),
    getUserRoles: vi.fn(),
    addUserRole: vi.fn(),
  };
  requireRouteRegistrar()(app, dependencies);
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
  if (!dependencies) return;
  dependencies.createUserProfile.mockReset().mockResolvedValue(undefined);
  dependencies.createUserReputation.mockReset().mockResolvedValue(undefined);
  dependencies.getUserRoles.mockReset().mockResolvedValue([]);
  dependencies.addUserRole.mockReset().mockResolvedValue(undefined);
});

describe("POST /api/supabase/provision-user — authenticated self-provisioning", () => {
  it("rejects an unauthenticated caller before any profile or role write", async () => {
    requireRouteRegistrar();

    const response = await postProvisioning({
      userId: "new-user",
      role: "investor",
      displayName: "New User",
    });

    expect(response.status).toBe(401);
    expect(dependencies.createUserProfile).not.toHaveBeenCalled();
    expect(dependencies.addUserRole).not.toHaveBeenCalled();
  });

  it("rejects an authenticated caller attempting to provision another user", async () => {
    requireRouteRegistrar();

    const response = await postProvisioning(
      {
        userId: "victim-user",
        role: "investor",
        displayName: "Victim",
      },
      "attacker-user",
    );

    expect(response.status).toBe(403);
    expect(dependencies.createUserProfile).not.toHaveBeenCalled();
    expect(dependencies.addUserRole).not.toHaveBeenCalled();
  });

  it("prefers the verified Supabase user over a conflicting generic claim", async () => {
    requireRouteRegistrar();

    const response = await postProvisioning(
      {
        userId: "verified-user",
        role: "investor",
        displayName: "Verified User",
      },
      "metadata-attacker",
      "verified-user",
    );

    expect(response.status).toBe(200);
    expect(dependencies.getUserRoles).toHaveBeenCalledWith("verified-user");
    expect(dependencies.createUserProfile).toHaveBeenCalledWith(
      "verified-user",
      {
        primary_role: "investor",
        display_name: "Verified User",
      },
    );
    expect(dependencies.addUserRole).toHaveBeenCalledWith({
      userId: "verified-user",
      role: "investor",
    });
  });

  it.each(["admin", "pegasus_wholesaler", "pegasus_dreamscaper"])(
    "rejects self-assignment of governed role %s",
    async (role) => {
      requireRouteRegistrar();

      const response = await postProvisioning(
        {
          userId: "new-user",
          role,
          displayName: "New User",
        },
        "new-user",
      );

      expect(response.status).toBe(403);
      expect(dependencies.createUserProfile).not.toHaveBeenCalled();
      expect(dependencies.addUserRole).not.toHaveBeenCalled();
    },
  );

  it.each([
    { isApproved: true },
    { is_approved: true },
    { isPegasusBadged: true },
    { is_pegasus_badged: true },
    { primaryRole: "admin" },
    { primary_role: "admin" },
    { roles: ["admin"] },
    { permissions: ["marketflow:submit"] },
    { marketflowAccess: true },
    { isAdmin: true },
    { isStaff: true },
    { pegasusRoleType: "pegasus_wholesaler" },
    { approvalStatus: "approved" },
  ])(
    "rejects self-managed approval or privilege fields: %j",
    async (attemptedPrivilege) => {
      requireRouteRegistrar();

      const response = await postProvisioning(
        {
          userId: "new-user",
          role: "wholesaler",
          displayName: "New User",
          ...attemptedPrivilege,
        },
        "new-user",
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        message: "Approval and access fields cannot be self-provisioned",
      });
      expect(dependencies.getUserRoles).not.toHaveBeenCalled();
      expect(dependencies.createUserProfile).not.toHaveBeenCalled();
      expect(dependencies.addUserRole).not.toHaveBeenCalled();
    },
  );

  it("rejects changing an already-provisioned account to another self-serve role", async () => {
    requireRouteRegistrar();
    dependencies.getUserRoles.mockResolvedValue([{ role: "investor" }]);

    const response = await postProvisioning(
      {
        userId: "existing-user",
        role: "wholesaler",
        displayName: "Existing User",
      },
      "existing-user",
    );

    expect(response.status).toBe(403);
    expect(dependencies.createUserProfile).not.toHaveBeenCalled();
    expect(dependencies.createUserReputation).not.toHaveBeenCalled();
    expect(dependencies.addUserRole).not.toHaveBeenCalled();
  });

  it("preserves authenticated self-provisioning for an allowed non-admin role", async () => {
    requireRouteRegistrar();

    const response = await postProvisioning(
      {
        userId: "new-user",
        role: "wholesaler",
        displayName: "Taylor Source",
      },
      "new-user",
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(dependencies.createUserProfile).toHaveBeenCalledWith("new-user", {
      primary_role: "wholesaler",
      display_name: "Taylor Source",
    });
    expect(dependencies.createUserReputation).toHaveBeenCalledWith("new-user");
    expect(dependencies.getUserRoles).toHaveBeenCalledWith("new-user");
    expect(dependencies.addUserRole).toHaveBeenCalledWith({
      userId: "new-user",
      role: "wholesaler",
    });
  });
});

describe("production route wiring", () => {
  it("registers self-provisioning with the existing hybrid-auth middleware", () => {
    const routesSource = fs.readFileSync(
      path.join(process.cwd(), "server/routes.ts"),
      "utf8",
    );
    expect(routesSource).toMatch(
      /registerUserProvisioningRoute\(app,\s*\{[\s\S]*?isAuthenticated:\s*isHybridAuthenticated/,
    );
  });
});
