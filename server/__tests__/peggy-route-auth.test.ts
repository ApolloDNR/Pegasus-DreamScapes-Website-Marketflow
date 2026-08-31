import { existsSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { resolve } from "node:path";
import express, {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from "express";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  createPeggyConversationAccessGuard,
  createPeggyConversationAccessToken,
  PEGGY_CONVERSATION_ACCESS_HEADER,
} from "../peggy-access";

const peggyStorage = vi.hoisted(() => ({
  createPeggyConversation: vi.fn(),
  getPeggyConversations: vi.fn(),
}));

vi.mock("../storage", () => ({ storage: peggyStorage }));

const peggyModule = await import("../peggy");

type ParseResult<T> = { ok: true; value: T } | { ok: false };
type CalculatorRequest = {
  calculatorType: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
};
type Conversation = {
  id: number;
  sessionId: string;
  userId: string | null;
  title: string;
  contactEmail: string;
};
type StartInput = {
  userId?: string;
  correlationId: string;
  context: Record<string, unknown>;
};
type AnalyzeInput = CalculatorRequest & {
  userId: string;
  correlationId: string;
};
type Registrar = (
  app: Pick<express.Express, "post">,
  dependencies: {
    noStore: RequestHandler;
    publicCreateRateLimit: RequestHandler;
    calculatorRateLimit: RequestHandler;
    isHybridAuthenticated: RequestHandler;
    getVerifiedPeggyUserId(req: Request): string | null;
    randomUUID(): string;
    getAccessSecret(): string | null;
    createAccessToken(conversation: Conversation, secret: string): string;
    startWebConversation(input: StartInput): Promise<Conversation>;
    parseCalculatorRequest(body: unknown): ParseResult<CalculatorRequest>;
    analyzeCalculator(input: AnalyzeInput): Promise<{
      response: string;
      conversationId: number;
    }>;
  },
) => void;
type CreateParser = (
  body: unknown,
) => ParseResult<Record<string, unknown>>;

const registrarPath = resolve(process.cwd(), "server/peggy-route-auth.ts");
const routeModule = existsSync(registrarPath)
  ? await import(/* @vite-ignore */ "../peggy-route-auth")
  : {};
const registerPeggyIdentityRoutes = (
  routeModule as { registerPeggyIdentityRoutes?: unknown }
).registerPeggyIdentityRoutes;
const parsePeggyCreateContext = (
  routeModule as { parsePeggyCreateContext?: unknown }
).parsePeggyCreateContext;

function requireRegistrar(): Registrar {
  expect(
    registerPeggyIdentityRoutes,
    "Task 4A needs a focused production Peggy identity registrar",
  ).toBeTypeOf("function");
  if (typeof registerPeggyIdentityRoutes !== "function") {
    throw new Error("Peggy identity registrar is missing");
  }
  return registerPeggyIdentityRoutes as Registrar;
}

function requireCreateParser(): CreateParser {
  expect(
    parsePeggyCreateContext,
    "Task 4A needs the bounded create-context parser",
  ).toBeTypeOf("function");
  if (typeof parsePeggyCreateContext !== "function") {
    throw new Error("Peggy create-context parser is missing");
  }
  return parsePeggyCreateContext as CreateParser;
}

const TEST_SECRET = "test-only-peggy-access-secret".repeat(2);
const conversations = new Map<number, Conversation>();
const calls: string[] = [];
const startCalls: StartInput[] = [];
const analyzeCalls: AnalyzeInput[] = [];
let nextConversationId = 100;
let nextUuid = 1;
let accessSecret: string | null = TEST_SECRET;
let rejectStart = false;
let rejectToken = false;
let rejectUuid = false;
let rejectCalculatorParser = false;
let createLimited = false;
let calculatorLimited = false;
let server: Server | undefined;
let baseUrl = "";

function generatedUuid(): string {
  const tail = String(nextUuid++).padStart(12, "0");
  return `00000000-0000-4000-8000-${tail}`;
}

const noStore: RequestHandler = (_req, res, next) => {
  calls.push("no-store");
  res.set("Cache-Control", "no-store");
  next();
};

const publicCreateRateLimit: RequestHandler = (_req, res, next) => {
  calls.push("create-limit");
  if (createLimited) {
    res.status(429).json({ message: "Too many requests" });
    return;
  }
  next();
};

const calculatorRateLimit: RequestHandler = (_req, res, next) => {
  calls.push("calculator-limit");
  if (calculatorLimited) {
    res.status(429).json({ message: "Too many requests" });
    return;
  }
  next();
};

const isHybridAuthenticated: RequestHandler = (req: any, res, next) => {
  calls.push("auth");
  if (req.get("x-test-auth-pass") === "1") {
    next();
    return;
  }
  if (req.user?.claims?.sub) {
    next();
    return;
  }
  res.status(401).json({ message: "Unauthorized" });
};

function getVerifiedPeggyUserId(req: any): string | null {
  calls.push("verified-user");
  for (const candidate of [
    req.user?.claims?.sub,
    req.supabaseUser?.id,
  ]) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return null;
}

function parseCalculatorRequest(body: unknown): ParseResult<CalculatorRequest> {
  calls.push("calculator-parser");
  if (rejectCalculatorParser) {
    throw new Error("injected calculator parser failure with body detail");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false };
  }
  const value = body as Record<string, unknown>;
  const plain = (candidate: unknown): candidate is Record<string, unknown> => {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      return false;
    }
    const prototype = Object.getPrototypeOf(candidate);
    return prototype === Object.prototype || prototype === null;
  };
  if (
    typeof value.calculatorType !== "string" ||
    !value.calculatorType.trim() ||
    !plain(value.inputs) ||
    !plain(value.results)
  ) {
    return { ok: false };
  }
  return {
    ok: true,
    value: {
      calculatorType: value.calculatorType,
      inputs: value.inputs,
      results: value.results,
    },
  };
}

function getAccessSecret(): string | null {
  calls.push("secret");
  return accessSecret;
}

function randomUUID(): string {
  calls.push("uuid");
  if (rejectUuid) throw new Error("injected UUID failure with secret detail");
  return generatedUuid();
}

async function startWebConversation(input: StartInput): Promise<Conversation> {
  calls.push("start");
  startCalls.push(input);
  if (rejectStart) throw new Error("injected start failure with secret detail");
  const conversation: Conversation = {
    id: nextConversationId++,
    sessionId: input.correlationId,
    userId: input.userId ?? null,
    title: "New Conversation",
    contactEmail: "must-not-leak@example.test",
  };
  conversations.set(conversation.id, conversation);
  return conversation;
}

function createAccessToken(
  conversation: Conversation,
  secret: string,
): string {
  calls.push("token");
  if (rejectToken) throw new Error("injected token failure with row detail");
  return createPeggyConversationAccessToken(conversation, secret);
}

async function analyzeCalculator(input: AnalyzeInput) {
  calls.push("analyze");
  analyzeCalls.push(input);
  if (input.calculatorType === "throw") {
    throw new Error("injected provider failure with calculator detail");
  }
  return {
    response: `Explained ${input.calculatorType}`,
    conversationId: nextConversationId++,
  };
}

async function post(
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
) {
  requireRegistrar();
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

beforeAll(async () => {
  if (typeof registerPeggyIdentityRoutes !== "function") return;
  const app = express();
  app.use(express.json());
  // Simulates production's global auth normalization before anonymous routes.
  app.use((req: any, _res, next) => {
    req.sessionID = "attacker-controlled-express-session";
    req.session = { user: { id: "forged-session-owner" } };
    const oidcUser = req.get("x-test-oidc-user");
    const supabaseUser = req.get("x-test-supabase-user");
    const invalidUser = req.get("x-test-invalid-user");
    if (oidcUser) req.user = { claims: { sub: oidcUser } };
    if (supabaseUser) {
      req.supabaseUser = {
        id: supabaseUser,
        claims: { sub: supabaseUser },
      };
      req.user = { claims: req.supabaseUser.claims };
    }
    if (invalidUser === "blank") req.user = { claims: { sub: "   " } };
    if (invalidUser === "number") req.user = { claims: { sub: 123 } };
    next();
  });
  requireRegistrar()(app, {
    noStore,
    publicCreateRateLimit,
    calculatorRateLimit,
    isHybridAuthenticated,
    getVerifiedPeggyUserId,
    randomUUID,
    getAccessSecret,
    createAccessToken,
    startWebConversation,
    parseCalculatorRequest,
    analyzeCalculator,
  });
  const guard = createPeggyConversationAccessGuard({
    getConversation: async (id) => conversations.get(id),
    getSecret: () => TEST_SECRET,
  });
  app.get("/api/peggy/conversations/:id", guard, (_req, res) => {
    res.json({ id: res.locals.peggyConversation.id });
  });
  // Intentionally leaks. Correct focused handlers must never reach this.
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    calls.push("downstream-error");
    res.status(500).json({
      message: error instanceof Error ? error.message : String(error),
    });
  });
  server = createServer(app);
  await new Promise<void>((resolve) => server!.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  if (!server) return;
  await new Promise<void>((resolve, reject) =>
    server!.close((error) => (error ? reject(error) : resolve())),
  );
});

beforeEach(() => {
  conversations.clear();
  conversations.set(41, {
    id: 41,
    sessionId: "captured-victim-browser-id",
    userId: null,
    title: "Victim",
    contactEmail: "victim@example.test",
  });
  calls.length = 0;
  startCalls.length = 0;
  analyzeCalls.length = 0;
  nextConversationId = 100;
  nextUuid = 1;
  accessSecret = TEST_SECRET;
  rejectStart = false;
  rejectToken = false;
  rejectUuid = false;
  rejectCalculatorParser = false;
  createLimited = false;
  calculatorLimited = false;
  peggyStorage.createPeggyConversation.mockReset();
  peggyStorage.getPeggyConversations.mockReset();
});
describe("Peggy route ordering and terminal responses", () => {
  it("stops anonymous calculator work after no-store, limiter, and auth", async () => {
    const response = await post("/api/peggy/analyze-calculator", {
      calculatorType: "roi",
      inputs: {},
      results: {},
    });
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ message: "Unauthorized" });
    expect(calls).toEqual(["no-store", "calculator-limit", "auth"]);
    expect(startCalls).toHaveLength(0);
    expect(analyzeCalls).toHaveLength(0);
  });

  it.each([
    ["create", "/api/peggy/conversations"],
    ["new", "/api/peggy/conversations/new"],
  ])("keeps terminal %s limiter no-store and inert", async (_label, path) => {
    createLimited = true;
    const response = await post(path, { context: { page: "home" } });
    expect(response.status).toBe(429);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(calls).toEqual(["no-store", "create-limit"]);
    expect(startCalls).toHaveLength(0);
  });

  it("keeps terminal calculator limiter no-store and inert", async () => {
    calculatorLimited = true;
    const response = await post("/api/peggy/analyze-calculator", {
      calculatorType: "roi",
      inputs: {},
      results: {},
    });
    expect(response.status).toBe(429);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(calls).toEqual(["no-store", "calculator-limit"]);
  });

  it.each([null, "   "])(
    "checks missing/blank secret before UUID/storage/token (%s)",
    async (configuredSecret) => {
      accessSecret = configuredSecret;
      const response = await post("/api/peggy/conversations", {
        context: { page: "home" },
      });
      expect(response.status).toBe(503);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(await response.json()).toEqual({
        message: "Peggy conversation access is unavailable",
      });
      expect(calls).toEqual(["no-store", "create-limit", "secret"]);
      expect(startCalls).toHaveLength(0);
    },
  );

  it("catches start failure locally with generic no-store 500", async () => {
    rejectStart = true;
    const response = await post("/api/peggy/conversations", {
      context: { page: "home" },
    });
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ message: "Internal server error" });
    expect(JSON.stringify(body)).not.toMatch(/injected|home|secret|token/i);
    expect(calls).toEqual([
      "no-store", "create-limit", "secret", "verified-user", "uuid", "start",
    ]);
  });

  it("catches token failure locally without leaking inserted row/capability", async () => {
    rejectToken = true;
    const response = await post("/api/peggy/conversations", {
      context: { page: "home" },
    });
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ message: "Internal server error" });
    expect(JSON.stringify(body)).not.toMatch(/injected|accessToken|\"id\"|secret/i);
    expect(calls).toEqual([
      "no-store", "create-limit", "secret", "verified-user", "uuid", "start", "token",
    ]);
    expect(startCalls).toHaveLength(1);
  });

  it("catches create UUID failure locally before storage/token", async () => {
    rejectUuid = true;
    const response = await post("/api/peggy/conversations", {
      context: { page: "home" },
    });
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ message: "Internal server error" });
    expect(JSON.stringify(body)).not.toMatch(/injected|uuid|secret|home/i);
    expect(calls).toEqual([
      "no-store", "create-limit", "secret", "verified-user", "uuid",
    ]);
    expect(startCalls).toHaveLength(0);
  });

  it("catches injected calculator-parser failure locally", async () => {
    rejectCalculatorParser = true;
    const response = await post(
      "/api/peggy/analyze-calculator",
      { calculatorType: "roi", inputs: {}, results: {} },
      { "x-test-oidc-user": "oidc-owner" },
    );
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ message: "Internal server error" });
    expect(JSON.stringify(body)).not.toMatch(/injected|parser|body|roi/i);
    expect(calls).toEqual([
      "no-store", "calculator-limit", "auth", "calculator-parser",
    ]);
    expect(analyzeCalls).toHaveLength(0);
  });

  it("catches calculator UUID failure locally before analyzer", async () => {
    rejectUuid = true;
    const response = await post(
      "/api/peggy/analyze-calculator",
      { calculatorType: "roi", inputs: {}, results: {} },
      { "x-test-oidc-user": "oidc-owner" },
    );
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ message: "Internal server error" });
    expect(JSON.stringify(body)).not.toMatch(/injected|uuid|secret|roi/i);
    expect(calls).toEqual([
      "no-store", "calculator-limit", "auth", "calculator-parser",
      "verified-user", "uuid",
    ]);
    expect(analyzeCalls).toHaveLength(0);
  });

  it("catches analyzer failure locally with generic no-store 500", async () => {
    const response = await post(
      "/api/peggy/analyze-calculator",
      { calculatorType: "throw", inputs: {}, results: {} },
      { "x-test-oidc-user": "oidc-owner" },
    );
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ message: "Internal server error" });
    expect(JSON.stringify(body)).not.toMatch(/injected|throw|secret|token/i);
    expect(calls).toEqual([
      "no-store", "calculator-limit", "auth", "calculator-parser",
      "verified-user", "uuid", "analyze",
    ]);
  });
});

describe("fresh creation and scoped access", () => {
  it.each([
    "/api/peggy/conversations",
    "/api/peggy/conversations/new",
  ])("accepts an absent body as empty context at %s", async (path) => {
    const beforeIssue = Date.now();
    const response = await post(path, undefined);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    const afterIssue = Date.now();
    expect(body).toEqual({
      id: 100,
      accessToken: expect.stringMatching(
        /^v2\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
      ),
    });
    const [, payloadSegment] = body.accessToken.split(".");
    const payload = JSON.parse(
      Buffer.from(payloadSegment, "base64url").toString("utf8"),
    );
    expect(Object.keys(payload)).toEqual([
      "namespace",
      "version",
      "conversationId",
      "sessionId",
      "userId",
      "issuedAt",
      "expiresAt",
    ]);
    expect(payload).toMatchObject({
      namespace: "pegasus:peggy-conversation-access",
      version: "v2",
      conversationId: 100,
      sessionId: "00000000-0000-4000-8000-000000000001",
      userId: null,
    });
    expect(payload.issuedAt).toBeGreaterThanOrEqual(beforeIssue);
    expect(payload.issuedAt).toBeLessThanOrEqual(afterIssue);
    expect(payload.expiresAt - payload.issuedAt).toBe(86_400_000);
    expect(startCalls).toEqual([expect.objectContaining({ context: {} })]);
  });

  it.each([
    "/api/peggy/conversations",
    "/api/peggy/conversations/new",
  ])("always starts fresh at %s and ignores only bounded legacy ID", async (path) => {
    const body = {
      sessionId: "captured-victim-browser-id",
      context: { page: "home", surface: "legacy-dock" },
    };
    const first = await post(path, body);
    const second = await post(path, body);
    const firstBody = await first.json();
    const secondBody = await second.json();
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(first.headers.get("cache-control")).toBe("no-store");
    expect(Object.keys(firstBody).sort()).toEqual(["accessToken", "id"]);
    expect(Object.keys(secondBody).sort()).toEqual(["accessToken", "id"]);
    expect(firstBody.id).not.toBe(secondBody.id);
    expect(firstBody.accessToken).not.toBe(secondBody.accessToken);
    expect(startCalls).toEqual([
      {
        userId: undefined,
        correlationId: "00000000-0000-4000-8000-000000000001",
        context: { page: "home", surface: "legacy-dock" },
      },
      {
        userId: undefined,
        correlationId: "00000000-0000-4000-8000-000000000002",
        context: { page: "home", surface: "legacy-dock" },
      },
    ]);
    expect(JSON.stringify(startCalls)).not.toMatch(
      /captured-victim-browser-id|attacker-controlled-express-session|forged-session-owner/,
    );
    expect(startCalls.every((call) => call.userId === undefined)).toBe(true);
  });

  it("cannot mint access to a victim row from a captured browser ID", async () => {
    const created = await post("/api/peggy/conversations", {
      sessionId: "captured-victim-browser-id",
      context: { page: "home" },
    });
    const capability = await created.json();
    const victimReplay = await fetch(`${baseUrl}/api/peggy/conversations/41`, {
      headers: { [PEGGY_CONVERSATION_ACCESS_HEADER]: capability.accessToken },
    });
    const ownRow = await fetch(
      `${baseUrl}/api/peggy/conversations/${capability.id}`,
      { headers: { [PEGGY_CONVERSATION_ACCESS_HEADER]: capability.accessToken } },
    );
    expect(victimReplay.status).toBe(404);
    expect(await victimReplay.json()).toEqual({ message: "Conversation not found" });
    expect(ownRow.status).toBe(200);
    expect(await ownRow.json()).toEqual({ id: capability.id });
  });

  it.each([
    ["OIDC create", "/api/peggy/conversations", { "x-test-oidc-user": "oidc-owner" }, "oidc-owner"],
    ["OIDC new", "/api/peggy/conversations/new", { "x-test-oidc-user": "oidc-owner" }, "oidc-owner"],
    ["Supabase create", "/api/peggy/conversations", { "x-test-supabase-user": "supabase-owner" }, "supabase-owner"],
    ["Supabase new", "/api/peggy/conversations/new", { "x-test-supabase-user": "supabase-owner" }, "supabase-owner"],
  ])("binds verified %s principal only", async (_label, path, headers, owner) => {
    const response = await post(
      path,
      {
        sessionId: "captured-victim-browser-id",
        context: { page: "home", userRole: "admin" },
      },
      headers,
    );
    expect(response.status).toBe(200);
    expect(startCalls).toEqual([
      expect.objectContaining({
        userId: owner,
        context: { page: "home", userRole: "admin" },
      }),
    ]);
  });

  it("rejects conflicting outer userId even for a verified principal", async () => {
    const response = await post(
      "/api/peggy/conversations/new",
      { userId: "body-owner", context: { page: "home" } },
      { "x-test-oidc-user": "verified-owner" },
    );
    expect(response.status).toBe(400);
    expect(calls).toEqual(["no-store", "create-limit"]);
    expect(startCalls).toHaveLength(0);
  });

  it.each(["blank", "number"])(
    "does not bind an invalid normalized %s owner",
    async (invalidUser) => {
      const response = await post(
        "/api/peggy/conversations",
        { context: { page: "home" } },
        { "x-test-invalid-user": invalidUser },
      );
      expect(response.status).toBe(200);
      expect(startCalls).toEqual([
        expect.objectContaining({ userId: undefined }),
      ]);
    },
  );

  it("falls through invalid OIDC shape to a valid normalized Supabase owner", async () => {
    const response = await post(
      "/api/peggy/conversations",
      { context: { page: "home" } },
      {
        "x-test-supabase-user": "supabase-fallback-owner",
        "x-test-invalid-user": "blank",
      },
    );
    expect(response.status).toBe(200);
    expect(startCalls).toEqual([
      expect.objectContaining({ userId: "supabase-fallback-owner" }),
    ]);
  });

  it.each([
    ["outer userId", { userId: "body-owner", context: {} }],
    ["outer conversationId", { conversationId: 41, context: {} }],
    ["outer token", { accessToken: "v1.poison", context: {} }],
    ["outer ownerId", { ownerId: "body-owner", context: {} }],
    ["outer token alias", { token: "v1.poison", context: {} }],
    ["outer authorization", { authorization: "Bearer poison", context: {} }],
    ["outer session", { session: "poison", context: {} }],
    ["outer extra", { extra: true, context: {} }],
    ["legacy session null", { sessionId: null, context: {} }],
    ["legacy session number", { sessionId: 1, context: {} }],
    ["legacy session boolean", { sessionId: true, context: {} }],
    ["legacy session array", { sessionId: [], context: {} }],
    ["legacy session object", { sessionId: { id: 41 }, context: {} }],
    ["legacy session too long", { sessionId: "x".repeat(256), context: {} }],
    ["context userId", { context: { userId: "body-owner" } }],
    ["context ownerId", { context: { ownerId: "body-owner" } }],
    ["context sessionId", { context: { sessionId: "victim" } }],
    ["context token", { context: { token: "v1.poison" } }],
    ["context accessToken", { context: { accessToken: "v1.poison" } }],
    ["context conversationId", { context: { conversationId: 41 } }],
  ])("rejects %s before secret or work", async (_label, body) => {
    const response = await post("/api/peggy/conversations", body);
    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      message: "Invalid Peggy conversation context",
    });
    expect(calls).toEqual(["no-store", "create-limit"]);
    expect(startCalls).toHaveLength(0);
  });
});

describe("authenticated calculator and injected parser seam", () => {
  it.each([
    ["OIDC", { "x-test-oidc-user": "oidc-calculator" }, "oidc-calculator"],
    ["Supabase", { "x-test-supabase-user": "supabase-calculator" }, "supabase-calculator"],
  ])("uses verified %s identity and normalized parser output", async (_label, headers, owner) => {
    const response = await post(
      "/api/peggy/analyze-calculator",
      {
        calculatorType: "roi",
        inputs: { purchasePrice: 300_000 },
        results: { roi: 12.5 },
        userId: "body-attacker",
        sessionId: "captured-victim-browser-id",
        poison: "must-not-reach-analyzer",
      },
      headers,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      response: "Explained roi",
      conversationId: 100,
    });
    expect(analyzeCalls).toEqual([{
      userId: owner,
      correlationId: "00000000-0000-4000-8000-000000000001",
      calculatorType: "roi",
      inputs: { purchasePrice: 300_000 },
      results: { roi: 12.5 },
    }]);
    expect(JSON.stringify(analyzeCalls)).not.toMatch(/body-attacker|poison/);
    expect(calls).toEqual([
      "no-store", "calculator-limit", "auth", "calculator-parser",
      "verified-user", "uuid", "analyze",
    ]);
  });

  it("rejects parser failure after auth and before UUID/work", async () => {
    const response = await post(
      "/api/peggy/analyze-calculator",
      { calculatorType: "roi", inputs: [], results: {} },
      { "x-test-oidc-user": "oidc-calculator" },
    );
    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(calls).toEqual([
      "no-store", "calculator-limit", "auth", "calculator-parser",
    ]);
    expect(analyzeCalls).toHaveLength(0);
  });

  it("defensively rejects a missing normalized principal after parsing", async () => {
    const response = await post(
      "/api/peggy/analyze-calculator",
      { calculatorType: "roi", inputs: {}, results: {} },
      { "x-test-auth-pass": "1" },
    );
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ message: "Unauthorized" });
    expect(calls).toEqual([
      "no-store", "calculator-limit", "auth", "calculator-parser",
      "verified-user",
    ]);
    expect(analyzeCalls).toHaveLength(0);
  });

  it.each(["blank", "number"])(
    "defensively rejects invalid normalized %s identity after parsing",
    async (invalidUser) => {
      const response = await post(
        "/api/peggy/analyze-calculator",
        { calculatorType: "roi", inputs: {}, results: {} },
        { "x-test-invalid-user": invalidUser },
      );
      expect(response.status).toBe(401);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(calls).toEqual([
        "no-store", "calculator-limit", "auth", "calculator-parser",
        "verified-user",
      ]);
      expect(analyzeCalls).toHaveLength(0);
    },
  );
});
function projectionContext(years = 50) {
  return {
    calculatorType: "ownvsrent",
    calculatorResults: {
      __projection: {
        series: [{
          label: "Owner equity",
          points: Array.from({ length: years }, (_, year) => ({
            year,
            ownerEquity: year * 10,
            renterEquity: year * 4,
            delta: year * 6,
          })),
        }],
      },
    },
  };
}

function aggregateKeyContext(totalKeys: number) {
  return {
    calculatorResults: Object.fromEntries(
      Array.from({ length: totalKeys - 1 }, (_, index) => [`k${index}`, index]),
    ),
  };
}

function exactByteContext(finalChunk: string) {
  return {
    calculatorResults: {
      chunks: [...Array(16).fill("x".repeat(1000)), finalChunk],
    },
  };
}

describe("parsePeggyCreateContext", () => {
  it("defaults absent body/context and ignores one bounded legacy ID", () => {
    expect(requireCreateParser()(undefined)).toEqual({ ok: true, value: {} });
    expect(requireCreateParser()({})).toEqual({ ok: true, value: {} });
    expect(requireCreateParser()({ sessionId: "x".repeat(255) })).toEqual({
      ok: true,
      value: {},
    });
  });

  it.each([null, 1, true, [], {}, "x".repeat(256)])(
    "rejects non-string/overlong legacy sessionId: %j",
    (sessionId) => {
      expect(requireCreateParser()({ sessionId })).toEqual({ ok: false });
    },
  );

  it.each([null, 1, true, [], "body"])(
    "rejects present non-plain root: %j",
    (body) => expect(requireCreateParser()(body)).toEqual({ ok: false }),
  );

  it("rejects null-prototype roots and contexts", () => {
    expect(requireCreateParser()(Object.create(null))).toEqual({ ok: false });
    expect(
      requireCreateParser()({ context: Object.create(null) }),
    ).toEqual({ ok: false });
  });

  it.each([
    ["public", { page: "home", userRole: "guest", surface: "public-peggy" }],
    ["Strategy Lab", {
      page: "strategy-lab",
      labMode: "stress",
      labAnalysis: {
        topLane: "direct-acquisition",
        inputs: { askingPrice: 400_000, holdingMonths: 9, targetUse: "rental" },
      },
      surface: "strategy-lab",
    }],
    ["BRRRR", {
      calculatorType: "brrrr",
      calculatorInputs: { purchasePrice: 250_000, rehab: 80_000 },
      calculatorResults: { cashLeftInDeal: 32_000 },
    }],
    ["Cashflow", {
      calculatorType: "cashflow",
      calculatorInputs: { rent: 3_200, piti: 2_100 },
      calculatorResults: { monthlyCashFlow: 540 },
    }],
    ["50-year Own vs Rent", projectionContext()],
  ])("accepts deployed %s context", (_label, context) => {
    expect(Buffer.byteLength(JSON.stringify(context), "utf8")).toBeLessThanOrEqual(
      16 * 1024,
    );
    expect(requireCreateParser()({ context })).toEqual({ ok: true, value: context });
  });

  it("accepts depth six and rejects a container at depth seven", () => {
    const depthSix = projectionContext(1);
    const depthSeven = projectionContext(1);
    (depthSeven.calculatorResults.__projection.series[0].points[0] as any).meta = {
      source: "depth-seven",
    };
    expect(requireCreateParser()({ context: depthSix }).ok).toBe(true);
    expect(requireCreateParser()({ context: depthSeven })).toEqual({ ok: false });
  });

  it("accepts 256 aggregate keys and rejects 257", () => {
    expect(requireCreateParser()({ context: aggregateKeyContext(256) }).ok).toBe(true);
    expect(requireCreateParser()({ context: aggregateKeyContext(257) })).toEqual({
      ok: false,
    });
  });

  it("measures exact UTF-8 context bytes at 16 KiB", () => {
    const exact = exactByteContext("x".repeat(299));
    const oneByteOver = exactByteContext("x".repeat(300));
    const multibyteOver = exactByteContext(`${"x".repeat(298)}é`);
    expect(Buffer.byteLength(JSON.stringify(exact), "utf8")).toBe(16_384);
    expect(Buffer.byteLength(JSON.stringify(oneByteOver), "utf8")).toBe(16_385);
    expect(Buffer.byteLength(JSON.stringify(multibyteOver), "utf8")).toBe(16_385);
    expect(requireCreateParser()({ context: exact }).ok).toBe(true);
    expect(requireCreateParser()({ context: oneByteOver })).toEqual({ ok: false });
    expect(requireCreateParser()({ context: multibyteOver })).toEqual({ ok: false });
  });

  it("accepts exact semantic/generic maxima in bounded fixtures", () => {
    const semantic = {
      page: "p".repeat(255),
      userRole: "r".repeat(64),
      dealId: 2_147_483_647,
      dealType: "wholesale",
      calculatorType: "c".repeat(50),
      labMode: "prepare",
      surface: "s".repeat(64),
    };
    const generic = {
      calculatorResults: {
        value: "x".repeat(1000),
        ["k".repeat(64)]: true,
        values: Array(50).fill(null),
      },
    };
    expect(requireCreateParser()({ context: semantic })).toEqual({
      ok: true,
      value: semantic,
    });
    expect(requireCreateParser()({ context: generic })).toEqual({
      ok: true,
      value: generic,
    });
  });

  it("counts string limits in UTF-16 code units while bytes remain UTF-8", () => {
    const astral = "😀";
    expect(astral.length).toBe(2);
    expect(
      requireCreateParser()({
        sessionId: astral.repeat(127) + "x",
        context: { page: astral.repeat(127) + "x" },
      }).ok,
    ).toBe(true);
    expect(
      requireCreateParser()({
        sessionId: astral.repeat(128),
        context: {},
      }),
    ).toEqual({ ok: false });
    expect(
      requireCreateParser()({ context: { page: astral.repeat(128) } }),
    ).toEqual({ ok: false });
    const genericAtMax = astral.repeat(500);
    const keyAtMax = astral.repeat(32);
    expect(genericAtMax.length).toBe(1_000);
    expect(keyAtMax.length).toBe(64);
    expect(requireCreateParser()({
      context: { calculatorResults: { [keyAtMax]: genericAtMax } },
    }).ok).toBe(true);
    expect(requireCreateParser()({
      context: {
        calculatorResults: { value: `${genericAtMax}x` },
      },
    })).toEqual({ ok: false });
    expect(requireCreateParser()({
      context: {
        calculatorResults: { [`${keyAtMax}x`]: true },
      },
    })).toEqual({ ok: false });
  });

  it.each([
    ["page 256", { page: "x".repeat(256) }],
    ["page type", { page: 1 }],
    ["userRole 65", { userRole: "x".repeat(65) }],
    ["userRole type", { userRole: 1 }],
    ["calculatorType 51", { calculatorType: "x".repeat(51) }],
    ["calculatorType type", { calculatorType: 1 }],
    ["surface 65", { surface: "x".repeat(65) }],
    ["surface type", { surface: 1 }],
    ["dealId zero", { dealId: 0 }],
    ["dealId fraction", { dealId: 1.5 }],
    ["dealId type", { dealId: "1" }],
    ["dealId over max", { dealId: 2_147_483_648 }],
    ["dealType enum", { dealType: "public-offering" }],
    ["dealType type", { dealType: 1 }],
    ["labMode enum", { labMode: "decide" }],
    ["labMode type", { labMode: 1 }],
    ["string 1001", { calculatorResults: { value: "x".repeat(1001) } }],
    ["key 65", { calculatorResults: { ["k".repeat(65)]: true } }],
    ["array 51", { calculatorResults: { values: Array(51).fill(null) } }],
    ["unexpected key", { admin: true }],
    ["calculatorInputs array", { calculatorInputs: [] }],
    ["calculatorInputs null", { calculatorInputs: null }],
    ["calculatorInputs Date", { calculatorInputs: new Date() }],
    ["calculatorResults array", { calculatorResults: [] }],
    ["calculatorResults null", { calculatorResults: null }],
    ["calculatorResults Date", { calculatorResults: new Date() }],
    ["labAnalysis array", { labAnalysis: [] }],
    ["labAnalysis null", { labAnalysis: null }],
    ["labAnalysis Date", { labAnalysis: new Date() }],
  ])("rejects %s", (_label, context) => {
    expect(requireCreateParser()({ context })).toEqual({ ok: false });
  });

  it.each([
    ["bigint", 1n],
    ["function", () => undefined],
    ["symbol", Symbol("value")],
    ["undefined", undefined],
    ["date", new Date()],
    ["positive infinity", Infinity],
    ["negative infinity", -Infinity],
    ["NaN", NaN],
  ])("rejects nested non-JSON %s", (_label, value) => {
    expect(
      requireCreateParser()({ context: { calculatorResults: { value } } }),
    ).toEqual({ ok: false });
  });

  it("rejects cycles, sparse arrays, and symbol keys", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    const symbolKeyed = { normal: true } as Record<PropertyKey, unknown>;
    symbolKeyed[Symbol("hidden")] = true;
    expect(
      requireCreateParser()({ context: { calculatorResults: cyclic } }),
    ).toEqual({ ok: false });
    expect(
      requireCreateParser()({ context: { calculatorResults: { values: Array(2) } } }),
    ).toEqual({ ok: false });
    expect(
      requireCreateParser()({ context: { calculatorResults: symbolKeyed } }),
    ).toEqual({ ok: false });
  });

  it("rejects nested custom prototypes and hidden object data", () => {
    class CustomContainer { value = 1; }
    const hidden = { visible: true } as Record<string, unknown>;
    Object.defineProperty(hidden, "hidden", {
      value: "poison",
      enumerable: false,
    });
    for (const value of [
      Object.create(null),
      Object.create({ inherited: true }),
      new CustomContainer(),
      new Map([["value", 1]]),
      new Set([1]),
      new Uint8Array([1]),
      hidden,
    ]) {
      expect(
        requireCreateParser()({ context: { calculatorResults: { value } } }),
      ).toEqual({ ok: false });
    }
  });

  it("accepts only canonical dense arrays with no extra own keys", () => {
    const fixtures: unknown[][] = [];
    const named = [1];
    Object.defineProperty(named, "named", { value: true, enumerable: true });
    fixtures.push(named);
    const negative = [1];
    Object.defineProperty(negative, "-1", { value: true, enumerable: true });
    fixtures.push(negative);
    const leadingZero = [1];
    Object.defineProperty(leadingZero, "00", { value: true, enumerable: true });
    fixtures.push(leadingZero);
    const hidden = [1];
    Object.defineProperty(hidden, "hidden", { value: true, enumerable: false });
    fixtures.push(hidden);
    const symbol = [1] as unknown[] & Record<PropertyKey, unknown>;
    symbol[Symbol("hidden")] = true;
    fixtures.push(symbol);
    const customPrototype = [1];
    Object.setPrototypeOf(customPrototype, { custom: true });
    fixtures.push(customPrototype);
    const frozenLength = [1];
    Object.defineProperty(frozenLength, "length", { writable: false });
    fixtures.push(frozenLength);
    for (const values of fixtures) {
      expect(
        requireCreateParser()({ context: { calculatorResults: { values } } }),
      ).toEqual({ ok: false });
    }
  });

  it.each([
    ["named key", "evil"],
    ["symbol key", Symbol("evil")],
  ])("rejects an array proxy that substitutes a %s for index zero", (_label, substitute) => {
    let getterCalls = 0;
    const target = new Array(1);
    const values = new Proxy(target, {
      ownKeys: () => [substitute, "length"],
      getOwnPropertyDescriptor(current, key) {
        if (key === "0") {
          return {
            value: "virtual zero",
            enumerable: true,
            configurable: true,
            writable: true,
          };
        }
        return Object.getOwnPropertyDescriptor(current, key);
      },
      get() {
        getterCalls += 1;
        throw new Error("array proxy get executed");
      },
    });
    expect(() => requireCreateParser()({
      context: { calculatorResults: { values } },
    })).not.toThrow();
    expect(requireCreateParser()({
      context: { calculatorResults: { values } },
    })).toEqual({ ok: false });
    expect(getterCalls).toBe(0);
  });

  it("clones a safe own __proto__ key without prototype pollution", () => {
    const nested: Record<string, unknown> = {};
    Object.defineProperty(nested, "__proto__", {
      value: { safe: true },
      enumerable: true,
      configurable: true,
      writable: true,
    });
    const parsed = requireCreateParser()({
      context: { calculatorResults: nested },
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) throw new Error("expected safe __proto__ data key");
    expect(Object.getPrototypeOf(parsed.value)).toBe(Object.prototype);
    const results = parsed.value.calculatorResults as Record<string, unknown>;
    expect(Object.getPrototypeOf(results)).toBe(Object.prototype);
    expect(Object.prototype.hasOwnProperty.call(results, "__proto__")).toBe(true);
    expect(results.__proto__).toEqual({ safe: true });
    expect(({} as Record<string, unknown>).safe).toBeUndefined();
  });

  it("returns an isolated safe clone rather than caller-owned context", () => {
    const context = {
      calculatorResults: { nested: { values: [1, 2] } },
    };
    const parsed = requireCreateParser()({ context });
    expect(parsed).toEqual({ ok: true, value: context });
    if (!parsed.ok) throw new Error("expected valid context");
    expect(parsed.value).not.toBe(context);
    expect(parsed.value.calculatorResults).not.toBe(context.calculatorResults);
    expect(Object.getPrototypeOf(parsed.value)).toBe(Object.prototype);
    expect(Object.getPrototypeOf(parsed.value.calculatorResults)).toBe(
      Object.prototype,
    );
    expect(Object.getPrototypeOf(
      (parsed.value.calculatorResults as any).nested.values,
    )).toBe(Array.prototype);
    context.calculatorResults.nested.values[0] = 99;
    context.calculatorResults.nested.values.push(3);
    expect(parsed.value).toEqual({
      calculatorResults: { nested: { values: [1, 2] } },
    });
    (parsed.value.calculatorResults as any).nested.values[1] = 88;
    expect(context.calculatorResults.nested.values).toEqual([99, 2, 3]);
  });

  it("never invokes object, array, or root proxy get accessors", () => {
    let getterCalls = 0;
    const objectGetter = {} as Record<string, unknown>;
    Object.defineProperty(objectGetter, "value", {
      enumerable: true,
      get: () => {
        getterCalls += 1;
        throw new Error("object getter executed");
      },
    });
    const arrayGetter: unknown[] = [null];
    Object.defineProperty(arrayGetter, "0", {
      enumerable: true,
      get: () => {
        getterCalls += 1;
        throw new Error("array getter executed");
      },
    });
    expect(
      requireCreateParser()({ context: { calculatorResults: objectGetter } }),
    ).toEqual({ ok: false });
    expect(
      requireCreateParser()({
        context: { calculatorResults: { values: arrayGetter } },
      }),
    ).toEqual({ ok: false });
    const proxiedContext = new Proxy(
      { page: "home", calculatorResults: { safe: true } },
      {
        get() {
          getterCalls += 1;
          throw new Error("proxy get executed");
        },
      },
    );
    expect(requireCreateParser()({ context: proxiedContext })).toEqual({
      ok: true,
      value: { page: "home", calculatorResults: { safe: true } },
    });
    const nestedTarget = { value: { safe: true } };
    const nestedProxy = new Proxy(nestedTarget, {
      get() {
        getterCalls += 1;
        throw new Error("nested proxy get executed");
      },
    });
    const nestedParsed = requireCreateParser()({
      context: { calculatorResults: { nested: nestedProxy } },
    });
    expect(nestedParsed).toEqual({
      ok: true,
      value: {
        calculatorResults: { nested: { value: { safe: true } } },
      },
    });
    if (!nestedParsed.ok) throw new Error("expected nested proxy clone");
    expect(
      (nestedParsed.value.calculatorResults as any).nested,
    ).not.toBe(nestedTarget);
    const proxiedArray = new Proxy([1, { safe: true }], {
      get() {
        getterCalls += 1;
        throw new Error("array proxy get executed");
      },
    });
    const arrayParsed = requireCreateParser()({
      context: { calculatorResults: { values: proxiedArray } },
    });
    expect(arrayParsed).toEqual({
      ok: true,
      value: { calculatorResults: { values: [1, { safe: true }] } },
    });
    if (!arrayParsed.ok) throw new Error("expected proxied array clone");
    expect(Object.is(
      (arrayParsed.value.calculatorResults as any).values,
      proxiedArray,
    )).toBe(false);
    const rootTarget = { context: { page: "home" } };
    const proxiedRoot = new Proxy(rootTarget, {
      get() {
        getterCalls += 1;
        throw new Error("outer proxy get executed");
      },
    });
    const rootParsed = requireCreateParser()(proxiedRoot);
    expect(rootParsed).toEqual({ ok: true, value: { page: "home" } });
    if (!rootParsed.ok) throw new Error("expected proxied outer clone");
    expect(rootParsed.value).not.toBe(rootTarget.context);
    expect(getterCalls).toBe(0);
  });

  it("fails closed without throwing when proxy reflection traps throw", () => {
    for (const trap of ["ownKeys", "getOwnPropertyDescriptor"] as const) {
      const context = new Proxy(
        { page: "home" },
        { [trap]: () => { throw new Error(`${trap} executed`); } },
      );
      expect(() => requireCreateParser()({ context })).not.toThrow();
      expect(requireCreateParser()({ context })).toEqual({ ok: false });
    }
    const prototypeTrap = new Proxy(
      { page: "home" },
      { getPrototypeOf: () => { throw new Error("prototype trap executed"); } },
    );
    expect(() => requireCreateParser()({ context: prototypeTrap })).not.toThrow();
    expect(requireCreateParser()({ context: prototypeTrap })).toEqual({ ok: false });
    const revoked = Proxy.revocable({ page: "home" }, {});
    revoked.revoke();
    expect(() => requireCreateParser()({ context: revoked.proxy })).not.toThrow();
    expect(requireCreateParser()({ context: revoked.proxy })).toEqual({ ok: false });
  });
});

describe("server/peggy web conversation adapter", () => {
  async function storedConversation(
    input: Parameters<typeof peggyModule.startWebConversation>[0],
  ) {
    peggyStorage.createPeggyConversation.mockResolvedValue({
      id: 501,
      sessionId: input.correlationId,
      userId: input.userId ?? null,
    });
    return peggyModule.startWebConversation(input);
  }

  it.each([
    ["verified deal", {
      userId: "verified-owner",
      correlationId: "11111111-1111-4111-8111-111111111111",
      context: { page: "wholesale-deal", dealType: "wholesale" as const, dealId: 17 },
    }, {
      userId: "verified-owner",
      sessionId: "11111111-1111-4111-8111-111111111111",
      title: "wholesale Deal #17",
      contextType: "deal",
      contextPage: "wholesale-deal",
      contextDealType: "wholesale",
      contextDealId: 17,
      contextCalculator: undefined,
    }],
    ["anonymous ordinary page", {
      correlationId: "22222222-2222-4222-8222-222222222222",
      context: { page: "home", surface: "public-peggy" },
    }, {
      userId: undefined,
      sessionId: "22222222-2222-4222-8222-222222222222",
      title: "New Conversation",
      contextType: "page",
      contextPage: "home",
      contextDealType: undefined,
      contextDealId: undefined,
      contextCalculator: undefined,
    }],
    ["calculator page", {
      userId: "calculator-owner",
      correlationId: "33333333-3333-4333-8333-333333333333",
      context: {
        page: "calculator-brrrr",
        calculatorType: "brrrr",
        calculatorInputs: { purchasePrice: 250_000 },
        calculatorResults: { cashLeftInDeal: 32_000 },
      },
    }, {
      userId: "calculator-owner",
      sessionId: "33333333-3333-4333-8333-333333333333",
      title: "brrrr Analysis",
      contextType: "calculator",
      contextPage: "calculator-brrrr",
      contextDealType: undefined,
      contextDealId: undefined,
      contextCalculator: "brrrr",
    }],
  ])("maps %s object input to exactly one fresh insert", async (_label, input, expected) => {
    const conversation = await storedConversation(input);
    expect(conversation).toMatchObject({ id: 501 });
    expect(peggyStorage.createPeggyConversation).toHaveBeenCalledOnce();
    expect(peggyStorage.createPeggyConversation).toHaveBeenCalledWith(expected);
    expect(peggyStorage.getPeggyConversations).not.toHaveBeenCalled();
  });

  it("rejects blank correlation without storage/fallback", async () => {
    await expect(
      peggyModule.startWebConversation({ correlationId: "", context: {} }),
    ).rejects.toThrow("Peggy web correlation is required");
    expect(peggyStorage.createPeggyConversation).not.toHaveBeenCalled();
    expect(peggyStorage.getPeggyConversations).not.toHaveBeenCalled();
  });

  it("exports no optional/fallback web entrypoint", () => {
    expect(peggyModule).not.toHaveProperty("startConversation");
    expect(peggyModule).not.toHaveProperty("getOrCreateConversation");
    expect(peggyModule.default).not.toHaveProperty("startConversation");
    expect(peggyModule.default).not.toHaveProperty("getOrCreateConversation");
  });
});
