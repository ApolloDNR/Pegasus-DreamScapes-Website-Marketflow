import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

import express, { type Express, type RequestHandler } from "express";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

type PrivacyDependencies = Record<string, unknown>;
type RegisterPrivacyRoutes = (
  app: Express,
  dependencies: PrivacyDependencies,
) => void;
type EligibleRecipientFactory = (dependencies: {
  getUserProfile: (userId: string) => Promise<Record<string, unknown> | null>;
  getUserRoles: (userId: string) => Promise<Array<{ role?: unknown }>>;
  getUser: (userId: string) => Promise<Record<string, unknown> | null>;
  hasStaffRole: (userId: string) => Promise<boolean>;
  adminEmails: readonly string[];
}) => (userId: string) => Promise<boolean>;

const modulePath = resolve(
  import.meta.dirname,
  "../api-privacy-routes.ts",
);
const privacyModule = existsSync(modulePath)
  ? await import(/* @vite-ignore */ "../api-privacy-routes")
  : {};
const registerApiPrivacyRoutes = (
  privacyModule as { registerApiPrivacyRoutes?: unknown }
).registerApiPrivacyRoutes;
const createIsEligibleMarketflowMessageRecipient = (
  privacyModule as {
    createIsEligibleMarketflowMessageRecipient?: unknown;
  }
).createIsEligibleMarketflowMessageRecipient;

function requireRegistrar(): RegisterPrivacyRoutes {
  expect(
    registerApiPrivacyRoutes,
    "privacy-sensitive APIs need a behavior-tested registrar",
  ).toBeTypeOf("function");
  if (typeof registerApiPrivacyRoutes !== "function") {
    throw new Error("API privacy route registrar is not implemented");
  }
  return registerApiPrivacyRoutes as RegisterPrivacyRoutes;
}

const memberProfile = {
  id: "member-1",
  email: "private@example.com",
  firstName: "Market",
  lastName: "Member",
  profileImageUrl: null,
  createdAt: new Date("2026-08-01T00:00:00Z"),
};

const directMessage = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  senderId: "member-1",
  receiverId: "staff-1",
  subject: null,
  content: "Private note",
  parentId: null,
  isRead: false,
  createdAt: new Date("2026-08-30T12:00:00Z"),
  ...overrides,
});

let server: Server | undefined;
let baseUrl = "";
let dependencies: Record<string, ReturnType<typeof vi.fn> | RequestHandler>;
let staffUsers: Set<string>;
let eligibleRecipients: Set<string>;
let dealPacketRequests = 0;
let messageWriteRequests = 0;

const requestHeaders = (input: {
  userId?: string;
  approved?: boolean;
} = {}) => ({
  ...(input.userId ? { "x-test-user": input.userId } : {}),
  ...(input.approved ? { "x-test-approved": "true" } : {}),
  "content-type": "application/json",
});

async function get(
  path: string,
  input: { userId?: string; approved?: boolean } = {},
) {
  return fetch(`${baseUrl}${path}`, {
    headers: requestHeaders(input),
  });
}

async function post(
  path: string,
  body: unknown,
  input: { userId?: string; approved?: boolean } = {},
) {
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: requestHeaders(input),
    body: JSON.stringify(body),
  });
}

async function patch(
  path: string,
  body: unknown,
  input: { userId?: string; approved?: boolean } = {},
) {
  return fetch(`${baseUrl}${path}`, {
    method: "PATCH",
    headers: requestHeaders(input),
    body: JSON.stringify(body),
  });
}

beforeAll(async () => {
  if (typeof registerApiPrivacyRoutes !== "function") return;

  const app = express();
  app.use(express.json());

  const isHybridAuthenticated: RequestHandler = (req: any, res, next) => {
    const userId = req.get("x-test-user");
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    req.user = { claims: { sub: userId } };
    return next();
  };
  const requireApprovedMarketflowAccess: RequestHandler = (req, res, next) =>
    req.get("x-test-approved") === "true"
      ? next()
      : res.status(403).json({ message: "Forbidden" });
  const dealPacketRateLimit: RequestHandler = (_req, res, next) => {
    dealPacketRequests += 1;
    return dealPacketRequests > 1
      ? res.status(429).json({ message: "Too many requests" })
      : next();
  };
  const messageWriteRateLimit: RequestHandler = (_req, res, next) => {
    messageWriteRequests += 1;
    return messageWriteRequests > 1
      ? res.status(429).json({ message: "Too many requests" })
      : next();
  };

  dependencies = {
    isHybridAuthenticated,
    requireApprovedMarketflowAccess,
    dealPacketRateLimit,
    messageWriteRateLimit,
    getAuthenticatedUserId: vi.fn((req: any) => req.user?.claims?.sub ?? null),
    hasStaffAccess: vi.fn(async (_req: unknown, userId: string) =>
      staffUsers.has(userId),
    ),
    isEligibleMessageRecipient: vi.fn(async (userId: string) =>
      eligibleRecipients.has(userId),
    ),
    getUser: vi.fn(),
    toPublicUserProfile: vi.fn((user: typeof memberProfile) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
    })),
    getUserStats: vi.fn(),
    getUserReputation: vi.fn(),
    getUserBadges: vi.fn(),
    getSupabaseReputation: vi.fn(),
    getSupabaseBadges: vi.fn(),
    getDirectMessages: vi.fn(),
    getConversation: vi.fn(),
    createDirectMessage: vi.fn(),
    markMessageRead: vi.fn(),
    getAllSiteContent: vi.fn(),
    getSiteContent: vi.fn(),
    generateDealPacketPDF: vi.fn(),
    sendMessageNotification: vi.fn(async () => ({ success: true })),
  };

  requireRegistrar()(app, dependencies as PrivacyDependencies);

  await new Promise<void>((resolveListen) => {
    server = app.listen(0, () => resolveListen());
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  if (!server) return;
  await new Promise<void>((resolveClose, reject) => {
    server!.close((error) => (error ? reject(error) : resolveClose()));
  });
});

beforeEach(() => {
  if (!dependencies) return;
  staffUsers = new Set(["staff-1"]);
  eligibleRecipients = new Set(["member-1", "member-2", "staff-1"]);
  dealPacketRequests = 0;
  messageWriteRequests = 0;

  for (const dependency of Object.values(dependencies)) {
    if ("mockReset" in dependency) {
      (dependency as ReturnType<typeof vi.fn>).mockReset();
    }
  }

  (dependencies.getAuthenticatedUserId as ReturnType<typeof vi.fn>)
    .mockImplementation((req: any) => req.user?.claims?.sub ?? null);
  (dependencies.hasStaffAccess as ReturnType<typeof vi.fn>)
    .mockImplementation(async (_req: unknown, userId: string) =>
      staffUsers.has(userId));
  (dependencies.isEligibleMessageRecipient as ReturnType<typeof vi.fn>)
    .mockImplementation(async (userId: string) =>
      eligibleRecipients.has(userId));
  (dependencies.getUser as ReturnType<typeof vi.fn>)
    .mockResolvedValue(memberProfile);
  (dependencies.toPublicUserProfile as ReturnType<typeof vi.fn>)
    .mockImplementation((user: typeof memberProfile) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      createdAt: user.createdAt,
    }));
  (dependencies.getUserStats as ReturnType<typeof vi.fn>)
    .mockResolvedValue({ userId: "member-1", totalDealsValue: 123_000 });
  (dependencies.getUserReputation as ReturnType<typeof vi.fn>)
    .mockResolvedValue({ userId: "member-1", trustScore: 80 });
  (dependencies.getUserBadges as ReturnType<typeof vi.fn>)
    .mockResolvedValue([{ userId: "member-1", label: "Internal badge" }]);
  (dependencies.getSupabaseReputation as ReturnType<typeof vi.fn>)
    .mockResolvedValue({ user_id: "member-1", trust_score: 80 });
  (dependencies.getSupabaseBadges as ReturnType<typeof vi.fn>)
    .mockResolvedValue([{ user_id: "member-1", label: "Internal badge" }]);
  (dependencies.getDirectMessages as ReturnType<typeof vi.fn>)
    .mockResolvedValue([]);
  (dependencies.getConversation as ReturnType<typeof vi.fn>)
    .mockResolvedValue([]);
  (dependencies.createDirectMessage as ReturnType<typeof vi.fn>)
    .mockImplementation(async (message: Record<string, unknown>) =>
      directMessage(message));
  (dependencies.markMessageRead as ReturnType<typeof vi.fn>)
    .mockImplementation(async (id: number) =>
      directMessage({ id, isRead: true }));
  (dependencies.getAllSiteContent as ReturnType<typeof vi.fn>)
    .mockResolvedValue([]);
  (dependencies.getSiteContent as ReturnType<typeof vi.fn>)
    .mockResolvedValue(undefined);
  (dependencies.generateDealPacketPDF as ReturnType<typeof vi.fn>)
    .mockResolvedValue(Buffer.from("safe-pdf"));
  (dependencies.sendMessageNotification as ReturnType<typeof vi.fn>)
    .mockResolvedValue({ success: true });
});

describe("privacy-sensitive API route registration", () => {
  it("implements the behavior-tested registrar", () => {
    expect(registerApiPrivacyRoutes).toBeTypeOf("function");
  });

  it("requires governed hybrid auth and limits member data to self or staff", async () => {
    const unauthenticated = await get("/api/users/member-1");
    expect(unauthenticated.status).toBe(401);

    const ungoverned = await get("/api/users/member-1", {
      userId: "member-1",
    });
    expect(ungoverned.status).toBe(403);

    const otherMember = await get("/api/users/member-2", {
      userId: "member-1",
      approved: true,
    });
    expect(otherMember.status).toBe(404);

    const self = await get("/api/users/member-1", {
      userId: "member-1",
      approved: true,
    });
    expect(self.status).toBe(200);
    expect(await self.json()).toEqual({
      id: "member-1",
      firstName: "Market",
      lastName: "Member",
      profileImageUrl: null,
      createdAt: "2026-08-01T00:00:00.000Z",
    });

    const staff = await get("/api/users/member-1", {
      userId: "staff-1",
      approved: true,
    });
    expect(staff.status).toBe(200);
  });

  it.each([
    ["stats", "getUserStats"],
    ["reputation", "getUserReputation"],
    ["badges", "getUserBadges"],
  ])("hides another member's %s before storage", async (suffix, dependencyName) => {
    const dependency = dependencies[dependencyName] as ReturnType<typeof vi.fn>;
    dependency.mockClear();

    const denied = await get(`/api/users/member-2/${suffix}`, {
      userId: "member-1",
      approved: true,
    });

    expect(denied.status).toBe(404);
    expect(dependency).not.toHaveBeenCalled();
  });

  it.each([
    ["/api/supabase/reputation/member-2", "getSupabaseReputation"],
    ["/api/supabase/badges/member-2", "getSupabaseBadges"],
  ])("closes the Supabase alias leak at %s", async (path, dependencyName) => {
    const dependency = dependencies[dependencyName] as ReturnType<typeof vi.fn>;
    dependency.mockClear();

    const denied = await get(path, {
      userId: "member-1",
      approved: true,
    });

    expect(denied.status).toBe(404);
    expect(dependency).not.toHaveBeenCalled();
  });

  it("retires every review operation without consulting legacy rows", async () => {
    const paths: Array<[string, "GET" | "POST"]> = [
      ["/api/users/member-1/reviews", "GET"],
      ["/api/my-reviews", "GET"],
      ["/api/reviews", "POST"],
      ["/api/reviews/1/respond", "POST"],
    ];

    for (const [path, method] of paths) {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: requestHeaders({ userId: "member-1", approved: true }),
        body: method === "POST" ? JSON.stringify({ content: "ignored" }) : undefined,
      });
      expect(response.status).toBe(501);
      await expect(response.json()).resolves.toEqual({
        message:
          "Reviews are unavailable until Pegasus can verify a completed transaction.",
      });
    }
  });

  it("filters legacy direct-message rows to eligible participants", async () => {
    (dependencies.getDirectMessages as ReturnType<typeof vi.fn>)
      .mockResolvedValue([
        directMessage({ id: 1, senderId: "member-1", receiverId: "staff-1" }),
        directMessage({ id: 2, senderId: "member-1", receiverId: "outsider" }),
        directMessage({ id: 3, senderId: "outsider", receiverId: "someone-else" }),
      ]);

    const response = await get("/api/messages", {
      userId: "member-1",
      approved: true,
    });

    expect(response.status).toBe(200);
    const rows = await response.json() as Array<{ id: number }>;
    expect(rows.map((row) => row.id)).toEqual([1]);
  });

  it("rejects an ineligible conversation target before reading rows", async () => {
    eligibleRecipients.delete("outsider");

    const response = await get("/api/messages/conversation/outsider", {
      userId: "member-1",
      approved: true,
    });

    expect(response.status).toBe(404);
    expect(dependencies.getConversation).not.toHaveBeenCalled();
  });

  it("derives the sender, validates the parent thread, and persists a bounded message", async () => {
    (dependencies.getDirectMessages as ReturnType<typeof vi.fn>)
      .mockResolvedValue([
        directMessage({ id: 41, senderId: "member-2", receiverId: "member-1" }),
      ]);

    const response = await post(
      "/api/messages",
      {
        senderId: "attacker-selected",
        receiverId: "member-2",
        content: "  A bounded note  ",
        subject: "  Subject  ",
        parentId: 41,
      },
      { userId: "member-1", approved: true },
    );

    expect(response.status).toBe(400);

    const valid = await post(
      "/api/messages",
      {
        receiverId: "member-2",
        content: "  A bounded note  ",
        subject: "  Subject  ",
        parentId: 41,
      },
      { userId: "member-1", approved: true },
    );

    // The second otherwise-valid write is rejected by the installed limiter,
    // proving that the write route cannot bypass it.
    expect(valid.status).toBe(429);

    messageWriteRequests = 0;
    const accepted = await post(
      "/api/messages",
      {
        receiverId: "member-2",
        content: "  A bounded note  ",
        subject: "  Subject  ",
        parentId: 41,
      },
      { userId: "member-1", approved: true },
    );
    expect(accepted.status).toBe(201);
    expect(dependencies.createDirectMessage).toHaveBeenCalledWith({
      senderId: "member-1",
      receiverId: "member-2",
      content: "A bounded note",
      subject: "Subject",
      parentId: 41,
    });
  });

  it("does not mark a sent message as read by its sender", async () => {
    (dependencies.getDirectMessages as ReturnType<typeof vi.fn>)
      .mockResolvedValue([
        directMessage({ id: 7, senderId: "member-1", receiverId: "member-2" }),
      ]);

    const response = await patch(
      "/api/messages/7/read",
      {},
      { userId: "member-1", approved: true },
    );

    expect(response.status).toBe(404);
    expect(dependencies.markMessageRead).not.toHaveBeenCalled();
  });

  it("counts only unread messages from eligible participants", async () => {
    (dependencies.getDirectMessages as ReturnType<typeof vi.fn>)
      .mockResolvedValue([
        directMessage({ id: 1, senderId: "staff-1", receiverId: "member-1", isRead: false }),
        directMessage({ id: 2, senderId: "outsider", receiverId: "member-1", isRead: false }),
        directMessage({ id: 3, senderId: "staff-1", receiverId: "member-1", isRead: true }),
      ]);

    const response = await get("/api/messages/unread-count", {
      userId: "member-1",
      approved: true,
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ count: 1 });
  });

  it("publishes only the explicit site-content DTO and safe metadata keys", async () => {
    (dependencies.getAllSiteContent as ReturnType<typeof vi.fn>)
      .mockResolvedValue([
        {
          id: 99,
          key: "home.hero.link",
          value: "Bring an Opportunity",
          type: "link",
          metadata: {
            href: "/bring-an-opportunity",
            label: "Bring an Opportunity",
            internalCampaignId: "secret-campaign",
            updatedBy: "private@example.com",
          },
          updatedBy: "private@example.com",
          updatedAt: new Date("2026-08-30T12:00:00Z"),
          internalNotes: "do not publish",
        },
      ]);

    const response = await get("/api/site-content");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      {
        key: "home.hero.link",
        value: "Bring an Opportunity",
        type: "link",
        metadata: {
          href: "/bring-an-opportunity",
          label: "Bring an Opportunity",
        },
      },
    ]);
  });

  it("limits deal-packet generation to staff and labels arbitrary input as unverified", async () => {
    const denied = await post(
      "/api/pdf/deal-packet",
      {
        title: "Opportunity",
        type: "wholesale",
        propertyAddress: "100 Main St",
      },
      { userId: "member-1", approved: true },
    );
    expect(denied.status).toBe(403);
    expect(dependencies.generateDealPacketPDF).not.toHaveBeenCalled();

    dealPacketRequests = 0;
    const accepted = await post(
      "/api/pdf/deal-packet",
      {
        title: "Opportunity",
        type: "wholesale",
        propertyAddress: "100 Main St",
        expectedProfit: 75_000,
        roi: 25,
      },
      { userId: "staff-1", approved: true },
    );

    expect(accepted.status).toBe(200);
    expect(accepted.headers.get("content-type")).toContain("application/pdf");
    expect(accepted.headers.get("cache-control")).toContain("no-store");
    expect(accepted.headers.get("x-pegasus-data-status")).toBe(
      "unverified-user-input",
    );
    expect(dependencies.generateDealPacketPDF).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "DRAFT — Opportunity",
        description: expect.stringContaining(
          "Pegasus Dreamscapes has not independently verified",
        ),
      }),
    );

    const limited = await post(
      "/api/pdf/deal-packet",
      {
        title: "Opportunity",
        type: "wholesale",
        propertyAddress: "100 Main St",
      },
      { userId: "staff-1", approved: true },
    );
    expect(limited.status).toBe(429);
  });

  it("rejects unknown deal-packet fields instead of blessing an arbitrary object", async () => {
    const response = await post(
      "/api/pdf/deal-packet",
      {
        title: "Opportunity",
        type: "wholesale",
        propertyAddress: "100 Main St",
        secretlyApproved: true,
      },
      { userId: "staff-1", approved: true },
    );

    expect(response.status).toBe(400);
    expect(dependencies.generateDealPacketPDF).not.toHaveBeenCalled();
  });
});

describe("MarketFlow message-recipient eligibility", () => {
  it("requires an existing governed or staff identity", async () => {
    expect(createIsEligibleMarketflowMessageRecipient).toBeTypeOf("function");
    if (typeof createIsEligibleMarketflowMessageRecipient !== "function") {
      return;
    }

    const profiles = new Map<string, Record<string, unknown>>([
      ["badged", { primary_role: "investor", is_pegasus_badged: true }],
      ["generic", { primary_role: "investor", is_pegasus_badged: false }],
    ]);
    const roles = new Map<string, Array<{ role: string }>>([
      ["pegasus-role", [{ role: "pegasus_wholesaler" }]],
      ["staff-role", [{ role: "admin" }]],
      ["generic", [{ role: "investor" }]],
    ]);
    const users = new Map<string, Record<string, unknown>>([
      ["admin-email", { id: "admin-email", email: "ADMIN@PEGASUSDREAMSCAPES.COM" }],
      ["generic", { id: "generic", email: "generic@example.com" }],
    ]);
    const factory = createIsEligibleMarketflowMessageRecipient as EligibleRecipientFactory;
    const isEligible = factory({
      getUserProfile: async (userId) => profiles.get(userId) ?? null,
      getUserRoles: async (userId) => roles.get(userId) ?? [],
      getUser: async (userId) => users.get(userId) ?? null,
      hasStaffRole: async (userId) => userId === "staff-role",
      adminEmails: ["admin@pegasusdreamscapes.com"],
    });

    await expect(isEligible("missing")).resolves.toBe(false);
    await expect(isEligible("generic")).resolves.toBe(false);
    await expect(isEligible("badged")).resolves.toBe(true);
    await expect(isEligible("pegasus-role")).resolves.toBe(true);
    await expect(isEligible("staff-role")).resolves.toBe(true);
    await expect(isEligible("admin-email")).resolves.toBe(true);
  });
});
