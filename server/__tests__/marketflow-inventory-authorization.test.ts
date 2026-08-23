import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import express, { type Express, type RequestHandler } from "express";
import fs from "node:fs";
import path from "node:path";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import {
  toPublicCapitalProject,
  toPublicListing,
  toPublicWholesaleDeal,
} from "../public-marketplace";

type AccessDependencies = {
  getUserProfile: ReturnType<typeof vi.fn>;
  getUserRoles: ReturnType<typeof vi.fn>;
  adminEmails: readonly string[];
};

type CreateGuard = (dependencies: AccessDependencies) => RequestHandler;

const modulePath = path.join(
  process.cwd(),
  "server/marketflow-inventory-authorization.ts",
);
const authorizationModule = fs.existsSync(modulePath)
  ? await import(/* @vite-ignore */ "../marketflow-inventory-authorization")
  : {};
const createRequireMarketflowInventoryAccess = (
  authorizationModule as { createRequireMarketflowInventoryAccess?: unknown }
).createRequireMarketflowInventoryAccess;
const createResolveMarketflowInventoryAccessContext = (
  authorizationModule as {
    createResolveMarketflowInventoryAccessContext?: unknown;
  }
).createResolveMarketflowInventoryAccessContext;
const isReviewedMarketflowInventoryType = (
  authorizationModule as { isReviewedMarketflowInventoryType?: unknown }
).isReviewedMarketflowInventoryType;

function requireGuardFactory(): CreateGuard {
  expect(
    createRequireMarketflowInventoryAccess,
    "MarketFlow inventory must have a repository-owned reviewed-access guard",
  ).toBeTypeOf("function");
  if (typeof createRequireMarketflowInventoryAccess !== "function") {
    throw new Error("MarketFlow inventory authorization is not implemented");
  }
  return createRequireMarketflowInventoryAccess as CreateGuard;
}

let server: Server | undefined;
let baseUrl = "";
let dependencies: AccessDependencies;
const marketplaceWholesaleRoutes = [
  "/api/marketplace/deals",
  "/api/marketplace/deals/1",
] as const;
const marketplaceCapitalRoutes = [
  "/api/marketplace/projects",
  "/api/marketplace/projects/2",
] as const;
const marketplaceInventoryRoutes = [
  ...marketplaceWholesaleRoutes,
  ...marketplaceCapitalRoutes,
] as const;

async function get(
  route: string,
  identity?: {
    userId: string;
    email?: string;
    supabaseUserId?: string;
    supabaseEmail?: string;
  },
) {
  return fetch(`${baseUrl}${route}`, {
    headers: identity
      ? {
          "x-test-user": identity.userId,
          "x-test-email": identity.email ?? "",
          "x-test-supabase-user": identity.supabaseUserId ?? "",
          "x-test-supabase-email": identity.supabaseEmail ?? "",
        }
      : {},
  });
}

beforeAll(async () => {
  if (typeof createRequireMarketflowInventoryAccess !== "function") return;

  const app: Express = express();
  dependencies = {
    getUserProfile: vi.fn(),
    getUserRoles: vi.fn(),
    adminEmails: ["admin@pegasusdreamscapes.com"],
  };
  const authenticate = ((req: any, res, next) => {
    const userId = req.get("x-test-user");
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    req.user = {
      claims: { sub: userId, email: req.get("x-test-email") || undefined },
    };
    const supabaseUserId = req.get("x-test-supabase-user");
    if (supabaseUserId) {
      req.supabaseUser = {
        id: supabaseUserId,
        email: req.get("x-test-supabase-email") || undefined,
      };
    }
    next();
  }) as RequestHandler;
  const requireReviewedAccess = requireGuardFactory()(dependencies);

  const wholesaleHandler: RequestHandler = (_req, res) =>
    res.json([
      toPublicWholesaleDeal({
        id: 1,
        status: "listed",
        propertyAddress: "100 Main St",
        sellerEmail: "private@example.com",
      }),
    ]);
  const capitalHandler: RequestHandler = (_req, res) =>
    res.json([
      toPublicCapitalProject({
        id: 2,
        status: "OPEN_FOR_INVESTMENT",
        documents: ["private-model.xlsx"],
      }),
    ]);
  for (const route of ["/api/wholesale-deals", ...marketplaceWholesaleRoutes]) {
    app.get(route, authenticate, requireReviewedAccess, wholesaleHandler);
  }
  for (const route of ["/api/capital-projects", ...marketplaceCapitalRoutes]) {
    app.get(route, authenticate, requireReviewedAccess, capitalHandler);
  }
  app.get(
    "/api/listings",
    authenticate,
    requireReviewedAccess,
    (_req, res) =>
      res.json([
        toPublicListing({
          id: 3,
          status: "active",
          propertyAddress: "200 Market St",
          lockboxCode: "9999",
        }),
      ]),
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
  if (!dependencies) return;
  dependencies.getUserProfile.mockReset().mockResolvedValue({
    primary_role: "investor",
    is_pegasus_badged: false,
  });
  dependencies.getUserRoles.mockReset().mockResolvedValue([
    { role: "investor" },
  ]);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("reviewed MarketFlow inventory authorization", () => {
  it.each(["/api/wholesale-deals", "/api/marketplace/deals/1"])(
    "fails closed for conflicting verified principals on %s",
    async (route) => {
      const response = await get(route, {
        userId: "oidc-actor",
        email: "actor@example.com",
        supabaseUserId: "supabase-admin",
        supabaseEmail: "admin@pegasusdreamscapes.com",
      });

      expect(response.status).toBe(401);
      expect(dependencies.getUserProfile).not.toHaveBeenCalled();
      expect(dependencies.getUserRoles).not.toHaveBeenCalled();
    },
  );

  it("derives JV capability from governed role context", async () => {
    expect(createResolveMarketflowInventoryAccessContext).toBeTypeOf(
      "function",
    );
    if (typeof createResolveMarketflowInventoryAccessContext !== "function") {
      return;
    }
    const resolveContext = createResolveMarketflowInventoryAccessContext(
      dependencies,
    ) as (request: unknown) => Promise<{
      canAccessReviewedInventory: boolean;
      canInitiateJv: boolean;
    }>;

    dependencies.getUserProfile.mockResolvedValue({
      primary_role: "investor",
      is_pegasus_badged: true,
    });
    dependencies.getUserRoles.mockResolvedValue([{ role: "investor" }]);
    await expect(
      resolveContext({ user: { claims: { sub: "badged-investor" } } }),
    ).resolves.toMatchObject({
      canAccessReviewedInventory: true,
      canInitiateJv: false,
    });

    dependencies.getUserProfile.mockResolvedValue({
      primary_role: "pegasus_wholesaler",
      is_pegasus_badged: true,
    });
    dependencies.getUserRoles.mockResolvedValue([
      { role: "pegasus_wholesaler" },
    ]);
    await expect(
      resolveContext({ user: { claims: { sub: "jv-operator" } } }),
    ).resolves.toMatchObject({
      canAccessReviewedInventory: true,
      canInitiateJv: true,
    });
  });

  it.each([
    "wholesale",
    "wholesale_deal",
    "WHOLESALE_ASSIGNMENT",
    "capital",
    "capital_project",
    "capital-raise",
    "listing",
  ])("classifies %s as reviewed inventory", (type) => {
    expect(isReviewedMarketflowInventoryType).toBeTypeOf("function");
    expect(
      (isReviewedMarketflowInventoryType as (value: unknown) => boolean)(type),
    ).toBe(true);
  });

  it.each(["retail", "retail_listing"])(
    "keeps public %s outside reviewed inventory",
    (type) => {
      expect(isReviewedMarketflowInventoryType).toBeTypeOf("function");
      expect(
        (isReviewedMarketflowInventoryType as (value: unknown) => boolean)(type),
      ).toBe(false);
    },
  );

  it("returns 401 before inventory lookup for anonymous callers", async () => {
    requireGuardFactory();
    const response = await get("/api/wholesale-deals");
    expect(response.status).toBe(401);
    expect(dependencies.getUserProfile).not.toHaveBeenCalled();
  });

  it.each(marketplaceInventoryRoutes)(
    "returns 401 for anonymous callers to %s",
    async (route) => {
      requireGuardFactory();
      const response = await get(route);
      expect(response.status).toBe(401);
    },
  );

  it.each(marketplaceInventoryRoutes)(
    "returns 403 for an ordinary authenticated caller to %s",
    async (route) => {
      requireGuardFactory();
      const response = await get(route, { userId: "ordinary-investor" });
      expect(response.status).toBe(403);
    },
  );

  it.each([
    "investor",
    "wholesaler",
    "dreamscaper",
    "buyer_retail",
    "buyer_investment",
  ])("returns 403 for self-provisionable role %s", async (role) => {
    requireGuardFactory();
    dependencies.getUserProfile.mockResolvedValue({
      primary_role: role,
      is_pegasus_badged: false,
    });
    dependencies.getUserRoles.mockResolvedValue([{ role }]);

    const response = await get("/api/wholesale-deals", {
      userId: `ordinary-${role}`,
    });
    expect(response.status).toBe(403);
  });

  it.each([
    {
      label: "Pegasus-badged profile",
      profile: { primary_role: "investor", is_pegasus_badged: true },
      roles: [{ role: "investor" }],
      email: undefined,
    },
    {
      label: "Pegasus-prefixed role",
      profile: {
        primary_role: "pegasus_wholesaler",
        is_pegasus_badged: false,
      },
      roles: [{ role: "pegasus_wholesaler" }],
      email: undefined,
    },
    {
      label: "staff role",
      profile: { primary_role: "project_manager", is_pegasus_badged: false },
      roles: [{ role: "project_manager" }],
      email: undefined,
    },
    {
      label: "administrative allowlist identity",
      profile: { primary_role: "investor", is_pegasus_badged: false },
      roles: [{ role: "investor" }],
      email: "admin@pegasusdreamscapes.com",
    },
  ])("returns safe DTOs for an approved $label", async ({ profile, roles, email }) => {
    requireGuardFactory();
    dependencies.getUserProfile.mockResolvedValue(profile);
    dependencies.getUserRoles.mockResolvedValue(roles);

    const identity = { userId: "approved-user", email };
    const [wholesale, capital, listings] = await Promise.all([
      get("/api/wholesale-deals", identity),
      get("/api/capital-projects", identity),
      get("/api/listings", identity),
    ]);

    expect([wholesale.status, capital.status, listings.status]).toEqual([
      200,
      200,
      200,
    ]);
    expect((await wholesale.json())[0]).not.toHaveProperty("sellerEmail");
    expect((await capital.json())[0]).not.toHaveProperty("documents");
    expect((await listings.json())[0]).not.toHaveProperty("lockboxCode");
  });

  it("preserves administrative allowlist access when profile stores are unavailable", async () => {
    requireGuardFactory();
    dependencies.getUserProfile.mockRejectedValue(new Error("profile offline"));
    dependencies.getUserRoles.mockRejectedValue(new Error("roles offline"));

    const response = await get("/api/wholesale-deals", {
      userId: "allowlisted-admin",
      email: "ADMIN@PEGASUSDREAMSCAPES.COM",
    });

    expect(response.status).toBe(200);
    expect(dependencies.getUserProfile).not.toHaveBeenCalled();
    expect(dependencies.getUserRoles).not.toHaveBeenCalled();
  });

  it.each([
    ["/api/marketplace/deals", "sellerEmail"],
    ["/api/marketplace/deals/1", "sellerEmail"],
    ["/api/marketplace/projects", "documents"],
    ["/api/marketplace/projects/2", "documents"],
  ])("returns a safe DTO for approved access to %s", async (route, privateKey) => {
    requireGuardFactory();
    dependencies.getUserProfile.mockResolvedValue({
      primary_role: "investor",
      is_pegasus_badged: true,
    });

    const response = await get(route, { userId: "approved-user" });
    expect(response.status).toBe(200);
    expect((await response.json())[0]).not.toHaveProperty(privateKey);
  });

  it("fails closed when approval records cannot be resolved", async () => {
    requireGuardFactory();
    dependencies.getUserProfile.mockRejectedValue(new Error("profile offline"));
    dependencies.getUserRoles.mockRejectedValue(new Error("roles offline"));

    const response = await get("/api/wholesale-deals", {
      userId: "unresolved-user",
    });
    expect(response.status).toBe(503);
  });
});
