import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { resolve } from "node:path";
import express, {
  type Express,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response as ExpressResponse,
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
import * as peggyAccessModule from "../peggy-access";
import type {
  PeggyConversationAccessRecord,
} from "../peggy-access";

const {
  createPeggyConversationAccessGuard,
  createPeggyConversationAccessToken,
  PEGGY_CONVERSATION_ACCESS_HEADER,
  verifyPeggyConversationAccessToken,
} = peggyAccessModule;

type RefreshRegistrar = (
  app: Pick<Express, "post">,
  options: {
    noStore: RequestHandler;
    rateLimit: RequestHandler;
    [key: string]: unknown;
  },
) => void;

const task4bExports = peggyAccessModule as unknown as Record<string, unknown>;
const tokenLifetimeExport = task4bExports.PEGGY_ACCESS_TOKEN_LIFETIME_MS;
const refreshGraceExport = task4bExports.PEGGY_ACCESS_REFRESH_GRACE_MS;
const refreshRegistrarExport =
  task4bExports.registerPeggyConversationAccessRefreshRoute;
const PEGGY_ACCESS_TOKEN_LIFETIME_MS =
  typeof tokenLifetimeExport === "number" ? tokenLifetimeExport : 86_400_000;
const PEGGY_ACCESS_REFRESH_GRACE_MS =
  typeof refreshGraceExport === "number" ? refreshGraceExport : 604_800_000;
const registerPeggyConversationAccessRefreshRoute: RefreshRegistrar =
  typeof refreshRegistrarExport === "function"
    ? refreshRegistrarExport as RefreshRegistrar
    : (app, { noStore, rateLimit }) => {
        app.post(
          "/api/peggy/conversations/:id/access/refresh",
          noStore,
          rateLimit,
          (_req, res) => res.status(501).json({
            message: "Task 4B refresh registrar is not implemented",
          }),
        );
      };

const accessSource = readFileSync(
  resolve(import.meta.dirname, "../peggy-access.ts"),
  "utf8",
);

const TEST_SECRET = "test-only-peggy-conversation-secret".repeat(2);
const NAMESPACE = "pegasus:peggy-conversation-access";
const ISSUED_AT = 1_800_000_000_000;
const EXPIRES_AT = ISSUED_AT + PEGGY_ACCESS_TOKEN_LIFETIME_MS;
const GRACE_END = EXPIRES_AT + PEGGY_ACCESS_REFRESH_GRACE_MS;

describe("Task 4B server export surface", () => {
  it("locks the exact lifetime, grace, and refresh registrar exports", () => {
    expect(tokenLifetimeExport).toBe(86_400_000);
    expect(refreshGraceExport).toBe(604_800_000);
    expect(refreshRegistrarExport).toBeTypeOf("function");
  });
});

type Conversation = PeggyConversationAccessRecord & { title: string };

const anonymousRow: Conversation = {
  id: 41,
  sessionId: "11111111-1111-4111-8111-111111111111",
  userId: null,
  title: "Anonymous",
};
const secondRow: Conversation = {
  id: 42,
  sessionId: "22222222-2222-4222-8222-222222222222",
  userId: null,
  title: "Second",
};
const ownedRow: Conversation = {
  id: 43,
  sessionId: "33333333-3333-4333-8333-333333333333",
  userId: "owner-43",
  title: "Owned",
};

function payloadFor(
  row: PeggyConversationAccessRecord,
  issuedAt = ISSUED_AT,
) {
  return {
    namespace: NAMESPACE,
    version: "v2",
    conversationId: row.id,
    sessionId: row.sessionId,
    userId: row.userId ?? null,
    issuedAt,
    expiresAt: issuedAt + 86_400_000,
  };
}

function tokenFromPayloadJson(
  payloadJson: string,
  secret = TEST_SECRET,
): string {
  const payloadSegment = Buffer.from(payloadJson, "utf8").toString("base64url");
  const signingInput = `v2.${payloadSegment}`;
  const signature = createHmac("sha256", secret.trim())
    .update(signingInput, "utf8")
    .digest("base64url");
  return `${signingInput}.${signature}`;
}

function tokenFromPayload(
  payload: Record<string, unknown>,
  secret = TEST_SECRET,
): string {
  return tokenFromPayloadJson(JSON.stringify(payload), secret);
}

function tokenFromPayloadBytes(payload: Buffer): string {
  const payloadSegment = payload.toString("base64url");
  const signingInput = `v2.${payloadSegment}`;
  const signature = createHmac("sha256", TEST_SECRET)
    .update(signingInput, "utf8")
    .digest("base64url");
  return `${signingInput}.${signature}`;
}

function tokenWithPaddedPayload(
  row: PeggyConversationAccessRecord,
): string {
  const canonical = Buffer.from(
    JSON.stringify(payloadFor(row)),
    "utf8",
  ).toString("base64url");
  const padded = `${canonical}=`;
  const signingInput = `v2.${padded}`;
  const signature = createHmac("sha256", TEST_SECRET)
    .update(signingInput, "utf8")
    .digest("base64url");
  return `${signingInput}.${signature}`;
}

function issue(
  row: PeggyConversationAccessRecord,
  issuedAt = ISSUED_AT,
): string {
  return createPeggyConversationAccessToken(
    row,
    TEST_SECRET,
    () => issuedAt,
  );
}

describe("Peggy v2 capability wire contract", () => {
  it("encodes the exact canonical object and signs the literal version/payload", () => {
    const now = vi.fn(() => ISSUED_AT);
    const token = createPeggyConversationAccessToken(ownedRow, TEST_SECRET, now);
    expect(now).toHaveBeenCalledOnce();
    const segments = token.split(".");
    expect(segments).toHaveLength(3);
    expect(segments[0]).toBe("v2");
    expect(segments[1]).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(segments[2]).toMatch(/^[A-Za-z0-9_-]+$/);
    const json = Buffer.from(segments[1], "base64url").toString("utf8");
    expect(json).toBe(JSON.stringify(payloadFor(ownedRow)));
    const payload = JSON.parse(json);
    expect(Object.keys(payload)).toEqual([
      "namespace",
      "version",
      "conversationId",
      "sessionId",
      "userId",
      "issuedAt",
      "expiresAt",
    ]);
    expect(payload).toEqual(payloadFor(ownedRow));
    expect(payload.expiresAt - payload.issuedAt).toBe(86_400_000);
    const independentSignature = createHmac("sha256", TEST_SECRET)
      .update(`v2.${segments[1]}`, "utf8")
      .digest("base64url");
    expect(segments[2]).toBe(independentSignature);
  });

  it("is deterministic only for the same row, secret, and millisecond", () => {
    const token = issue(anonymousRow);
    expect(issue(anonymousRow)).toBe(token);
    expect(issue(anonymousRow, ISSUED_AT + 1)).not.toBe(token);
    expect(issue(secondRow)).not.toBe(token);
    expect(issue({ ...anonymousRow, sessionId: "changed" })).not.toBe(token);
    expect(issue({ ...anonymousRow, userId: "new-owner" })).not.toBe(token);
    expect(createPeggyConversationAccessToken(
      anonymousRow,
      `${TEST_SECRET}-different`,
      () => ISSUED_AT,
    )).not.toBe(token);
  });

  it.each([
    ["blank secret", anonymousRow, "   ", ISSUED_AT],
    ["zero id", { ...anonymousRow, id: 0 }, TEST_SECRET, ISSUED_AT],
    ["unsafe id", { ...anonymousRow, id: Number.MAX_SAFE_INTEGER + 1 }, TEST_SECRET, ISSUED_AT],
    ["non-string session", { ...anonymousRow, sessionId: 1 }, TEST_SECRET, ISSUED_AT],
    ["invalid owner", { ...anonymousRow, userId: 1 }, TEST_SECRET, ISSUED_AT],
    ["negative time", anonymousRow, TEST_SECRET, -1],
    ["fractional time", anonymousRow, TEST_SECRET, ISSUED_AT + 0.5],
    ["unsafe time", anonymousRow, TEST_SECRET, Number.MAX_SAFE_INTEGER],
  ])("rejects invalid issuance input: %s", (_label, row, secret, nowMs) => {
    expect(() => createPeggyConversationAccessToken(
      row as PeggyConversationAccessRecord,
      secret as string,
      () => nowMs as number,
    )).toThrow();
  });

  it("uses exact valid/expired boundaries and one verification clock read", () => {
    const token = issue(anonymousRow);
    for (const [nowMs, expected] of [
      [ISSUED_AT - 1, { status: "invalid" }],
      [ISSUED_AT, { status: "valid", expiresAt: EXPIRES_AT }],
      [EXPIRES_AT - 1, { status: "valid", expiresAt: EXPIRES_AT }],
      [EXPIRES_AT, { status: "expired", expiresAt: EXPIRES_AT }],
      [GRACE_END, { status: "expired", expiresAt: EXPIRES_AT }],
      [GRACE_END + 1, { status: "expired", expiresAt: EXPIRES_AT }],
      [GRACE_END + 365 * 24 * 60 * 60 * 1_000, { status: "expired", expiresAt: EXPIRES_AT }],
    ] as const) {
      const now = vi.fn(() => nowMs);
      expect(verifyPeggyConversationAccessToken(
        anonymousRow,
        token,
        TEST_SECRET,
        now,
      )).toEqual(expected);
      expect(now).toHaveBeenCalledOnce();
    }
  });

  it.each([
    ["namespace", { ...payloadFor(anonymousRow), namespace: "other" }],
    ["payload version", { ...payloadFor(anonymousRow), version: "v3" }],
    ["row id", { ...payloadFor(anonymousRow), conversationId: 42 }],
    ["session", { ...payloadFor(anonymousRow), sessionId: "other" }],
    ["owner", { ...payloadFor(anonymousRow), userId: "other" }],
    ["id type", { ...payloadFor(anonymousRow), conversationId: "41" }],
    ["unsafe id", { ...payloadFor(anonymousRow), conversationId: Number.MAX_SAFE_INTEGER + 1 }],
    ["issued type", { ...payloadFor(anonymousRow), issuedAt: "now" }],
    ["negative issue", { ...payloadFor(anonymousRow), issuedAt: -1 }],
    ["fractional issue", { ...payloadFor(anonymousRow), issuedAt: ISSUED_AT + 0.5 }],
    ["unsafe expiry", { ...payloadFor(anonymousRow), expiresAt: Number.MAX_SAFE_INTEGER + 1 }],
    ["short lifetime", { ...payloadFor(anonymousRow), expiresAt: EXPIRES_AT - 1 }],
    ["long lifetime", { ...payloadFor(anonymousRow), expiresAt: EXPIRES_AT + 1 }],
    ["extra key", { ...payloadFor(anonymousRow), extra: true }],
  ])("rejects correctly signed noncanonical claim: %s", (_label, payload) => {
    expect(verifyPeggyConversationAccessToken(
      anonymousRow,
      tokenFromPayload(payload),
      TEST_SECRET,
      () => ISSUED_AT,
    )).toEqual({ status: "invalid" });
  });

  it("rejects reordered and duplicate canonical keys even when signed", () => {
    const value = payloadFor(anonymousRow);
    const reordered = JSON.stringify({
      version: value.version,
      namespace: value.namespace,
      conversationId: value.conversationId,
      sessionId: value.sessionId,
      userId: value.userId,
      issuedAt: value.issuedAt,
      expiresAt: value.expiresAt,
    });
    const duplicate = `{"namespace":"${NAMESPACE}","version":"v2","conversationId":41,"conversationId":41,"sessionId":"${anonymousRow.sessionId}","userId":null,"issuedAt":${ISSUED_AT},"expiresAt":${EXPIRES_AT}}`;
    for (const payloadJson of [reordered, duplicate]) {
      expect(verifyPeggyConversationAccessToken(
        anonymousRow,
        tokenFromPayloadJson(payloadJson),
        TEST_SECRET,
        () => ISSUED_AT,
      )).toEqual({ status: "invalid" });
    }
  });

  it.each([
    ["empty", ""],
    ["legacy v1", `v1.${createHmac("sha256", TEST_SECRET).update("legacy").digest("base64url")}`],
    ["two segments", "v2.payload"],
    ["four segments", "v2.payload.signature.extra"],
    ["empty payload", "v2..signature"],
    ["empty signature", "v2.payload."],
    ["padded signature", `${issue(anonymousRow)}=`],
    ["correctly signed padded payload", tokenWithPaddedPayload(anonymousRow)],
    ["whitespace", ` ${issue(anonymousRow)}`],
    ["oversize", `v2.${"a".repeat(2_100)}.signature`],
    ["invalid JSON", tokenFromPayloadJson("not json")],
    ["null JSON", tokenFromPayloadJson("null")],
    ["array JSON", tokenFromPayloadJson("[]")],
    ["invalid UTF-8", tokenFromPayloadBytes(Buffer.from([0xc3, 0x28]))],
  ])("returns invalid without throwing for malformed %s", (_label, token) => {
    expect(() => verifyPeggyConversationAccessToken(
      anonymousRow,
      token,
      TEST_SECRET,
      () => ISSUED_AT,
    )).not.toThrow();
    expect(verifyPeggyConversationAccessToken(
      anonymousRow,
      token,
      TEST_SECRET,
      () => ISSUED_AT,
    )).toEqual({ status: "invalid" });
  });

  it("enforces the last representable token length below the 2,048 cap", () => {
    const belowCapRow = {
      ...anonymousRow,
      sessionId: "s".repeat(1_336),
    };
    const firstOverCapRow = {
      ...anonymousRow,
      sessionId: "s".repeat(1_337),
    };
    const belowCap = issue(belowCapRow);
    const firstOverCap = issue(firstOverCapRow);

    expect(belowCap).toHaveLength(2_047);
    expect(firstOverCap).toHaveLength(2_049);
    expect(verifyPeggyConversationAccessToken(
      belowCapRow,
      belowCap,
      TEST_SECRET,
      () => ISSUED_AT,
    )).toEqual({ status: "valid", expiresAt: EXPIRES_AT });
    expect(verifyPeggyConversationAccessToken(
      firstOverCapRow,
      firstOverCap,
      TEST_SECRET,
      () => ISSUED_AT,
    )).toEqual({ status: "invalid" });
  });

  it("rejects tampering, wrong signature length, blank secret, and cross-binding", () => {
    const token = issue(anonymousRow);
    const [version = "", payload = "", signature = ""] = token.split(".");
    const last = payload.at(-1) === "A" ? "B" : "A";
    const tamperedPayload = `${payload.slice(0, -1)}${last}`;
    for (const candidate of [
      `${version}.${tamperedPayload}.${signature}`,
      `${version}.${payload}.AA`,
      `${version}.${payload}.${signature.slice(1)}`,
    ]) {
      expect(verifyPeggyConversationAccessToken(
        anonymousRow,
        candidate,
        TEST_SECRET,
        () => ISSUED_AT,
      )).toEqual({ status: "invalid" });
    }
    expect(verifyPeggyConversationAccessToken(
      anonymousRow,
      token,
      "   ",
      () => ISSUED_AT,
    )).toEqual({ status: "invalid" });
    for (const row of [
      secondRow,
      { ...anonymousRow, sessionId: "other-session" },
      { ...anonymousRow, userId: "owner" },
    ]) {
      expect(verifyPeggyConversationAccessToken(
        row,
        token,
        TEST_SECRET,
        () => ISSUED_AT,
      )).toEqual({ status: "invalid" });
    }
  });

  it("checks length then signature before decoding or parsing claims", () => {
    const lengthCheck = accessSource.indexOf(
      "actualSignature.length !== expectedSignature.length",
    );
    const timingCompare = accessSource.indexOf(
      "timingSafeEqual(actualSignature, expectedSignature)",
    );
    const utf8Decode = accessSource.indexOf('new TextDecoder("utf-8"');
    const jsonParse = accessSource.indexOf("JSON.parse(payloadText)");
    expect([lengthCheck, timingCompare, utf8Decode, jsonParse].every(
      (index) => index >= 0,
    )).toBe(true);
    expect(lengthCheck).toBeLessThan(timingCompare);
    expect(timingCompare).toBeLessThan(utf8Decode);
    expect(utf8Decode).toBeLessThan(jsonParse);
  });
});

const conversations = new Map<number, Conversation>();
const calls: string[] = [];
let nowMs = ISSUED_AT;
let configuredSecret: string | null = TEST_SECRET;
let limited = false;
let rejectLookup = false;
let rejectClock = false;
let rejectIdentity = false;
let rejectVerify = false;
let rejectIssue = false;
let guardedHandlerCalls = 0;
let downstreamErrorCalls = 0;
let server: Server | undefined;
let baseUrl = "";

function noStore(_req: Request, res: ExpressResponse, next: NextFunction) {
  calls.push("no-store");
  res.set("Cache-Control", "no-store");
  next();
}

const refreshLimit: RequestHandler = (_req, res, next) => {
  calls.push("limit");
  if (limited) {
    res.status(429).json({ message: "Too many requests" });
    return;
  }
  next();
};

async function getConversation(id: number): Promise<Conversation | undefined> {
  calls.push("lookup");
  if (rejectLookup) throw new Error("lookup sentinel secret");
  return conversations.get(id);
}

function getSecret(): string | null {
  calls.push("secret");
  return configuredSecret;
}

function clock(): number {
  calls.push("clock");
  if (rejectClock) throw new Error("clock sentinel secret");
  return nowMs;
}

function getVerifiedUserId(req: Request): string | null {
  calls.push("identity");
  if (rejectIdentity) throw new Error("identity sentinel secret");
  const authRequest = req as Request & {
    user?: { claims?: { sub?: unknown } };
    supabaseUser?: { id?: unknown };
  };
  for (const candidate of [
    authRequest.user?.claims?.sub,
    authRequest.supabaseUser?.id,
  ]) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return null;
}

const verifyToken = (
  row: PeggyConversationAccessRecord,
  token: string,
  secret: string,
  now: () => number = () => nowMs,
) => {
  calls.push("verify");
  if (rejectVerify) throw new Error("verify sentinel secret");
  return verifyPeggyConversationAccessToken(row, token, secret, now);
};

const createToken = (
  row: PeggyConversationAccessRecord,
  secret: string,
  now: () => number = () => nowMs,
) => {
  calls.push("issue");
  if (rejectIssue) throw new Error("issue sentinel secret");
  return createPeggyConversationAccessToken(row, secret, now);
};

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    req.session = { user: { id: "forged-session-owner" } };
    const oidc = req.get("x-test-oidc-user");
    const supabase = req.get("x-test-supabase-user");
    if (oidc) req.user = { claims: { sub: oidc } };
    if (supabase) req.supabaseUser = { id: supabase };
    next();
  });

  const guard = createPeggyConversationAccessGuard({
    getConversation,
    getSecret,
    getVerifiedUserId,
    now: clock,
    verifyAccessToken: verifyToken,
  });

  app.get("/api/peggy/guard/:id", guard, (_req, res) => {
    guardedHandlerCalls += 1;
    res.json({ id: res.locals.peggyConversation.id });
  });
  app.post(
    "/api/peggy/guard-chat",
    noStore,
    refreshLimit,
    guard,
    (_req, res) => {
      guardedHandlerCalls += 1;
      res.json({ accepted: true });
    },
  );
  registerPeggyConversationAccessRefreshRoute(app, {
    noStore,
    rateLimit: refreshLimit,
    getConversation,
    getSecret,
    getVerifiedUserId,
    now: clock,
    verifyAccessToken: verifyToken,
    createAccessToken: createToken,
  });
  app.use((error: unknown, _req: Request, res: ExpressResponse, _next: NextFunction) => {
    downstreamErrorCalls += 1;
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
    server!.close((error) => error ? reject(error) : resolve()),
  );
});

beforeEach(() => {
  conversations.clear();
  for (const row of [anonymousRow, secondRow, ownedRow]) {
    conversations.set(row.id, { ...row });
  }
  calls.length = 0;
  nowMs = ISSUED_AT;
  configuredSecret = TEST_SECRET;
  limited = false;
  rejectLookup = false;
  rejectClock = false;
  rejectIdentity = false;
  rejectVerify = false;
  rejectIssue = false;
  guardedHandlerCalls = 0;
  downstreamErrorCalls = 0;
});

function requestHeaders(
  token?: string,
  extra: Record<string, string> = {},
): Record<string, string> {
  return token === undefined
    ? extra
    : { ...extra, [PEGGY_CONVERSATION_ACCESS_HEADER]: token };
}

async function guarded(
  id: string | number,
  token?: string,
  extra: Record<string, string> = {},
) {
  return fetch(`${baseUrl}/api/peggy/guard/${id}`, {
    headers: requestHeaders(token, extra),
  });
}

async function refresh(
  id: string | number,
  token?: string,
  extra: Record<string, string> = {},
) {
  return fetch(`${baseUrl}/api/peggy/conversations/${id}/access/refresh`, {
    method: "POST",
    headers: requestHeaders(token, extra),
  });
}

async function responseShape(response: globalThis.Response) {
  return {
    status: response.status,
    cache: response.headers.get("cache-control"),
    body: await response.json(),
  };
}

const notFoundShape = {
  status: 404,
  cache: "no-store",
  body: { message: "Conversation not found" },
};

describe("Peggy guarded-operation access", () => {
  it("admits valid v2 proof and exact header-absent OIDC/Supabase owners", async () => {
    const token = issue(anonymousRow);
    nowMs = EXPIRES_AT - 1;
    const capabilityResponse = await guarded(41, token);
    expect(capabilityResponse.status).toBe(200);
    expect(capabilityResponse.headers.get("cache-control")).toBe("no-store");
    expect(guardedHandlerCalls).toBe(1);

    calls.length = 0;
    const oidcOwnerResponse = await guarded(43, undefined, {
      "x-test-oidc-user": " owner-43 ",
    });
    expect(oidcOwnerResponse.status).toBe(200);
    expect(oidcOwnerResponse.headers.get("cache-control")).toBe("no-store");
    expect(calls).toEqual(["lookup", "identity"]);

    calls.length = 0;
    expect((await guarded(43, undefined, {
      "x-test-supabase-user": "owner-43",
    })).status).toBe(200);
    expect(calls).toEqual(["lookup", "identity"]);
  });

  it("returns coded 401 for authentic non-owner expiry at any age", async () => {
    const token = issue(anonymousRow);
    for (const candidateNow of [
      EXPIRES_AT,
      GRACE_END,
      GRACE_END + 1,
      GRACE_END + 365 * 24 * 60 * 60 * 1_000,
    ]) {
      nowMs = candidateNow;
      expect(await responseShape(await guarded(41, token))).toEqual({
        status: 401,
        cache: "no-store",
        body: {
          message: "Conversation access expired",
          code: "PEGGY_ACCESS_EXPIRED",
        },
      });
      expect(guardedHandlerCalls).toBe(0);
    }
  });

  it("makes missing, v1, malformed, tampered, cross-row, future, and deleted proof indistinguishable", async () => {
    const token = issue(anonymousRow);
    const [version = "", payload = "", signature = ""] = token.split(".");
    const invalid = [
      undefined,
      "v1.invalid",
      "v2.invalid",
      `${version}.${payload}.${signature.slice(1)}`,
      issue(secondRow),
      issue(anonymousRow, ISSUED_AT + 1),
    ];
    for (const candidate of invalid) {
      expect(await responseShape(await guarded(41, candidate))).toEqual(notFoundShape);
    }
    conversations.delete(41);
    expect(await responseShape(await guarded(41, token))).toEqual(notFoundShape);
  });

  it("lets exact OIDC/Supabase guarded ownership win for every header state", async () => {
    const token = issue(ownedRow);
    const ownerHeaders: Array<Record<string, string>> = [
      { "x-test-oidc-user": "owner-43" },
      { "x-test-supabase-user": " owner-43 " },
    ];
    for (const ownerHeader of ownerHeaders) {
      for (const [candidateNow, supplied] of [
        [EXPIRES_AT - 1, undefined],
        [EXPIRES_AT - 1, "   "],
        [EXPIRES_AT - 1, "v1.invalid"],
        [EXPIRES_AT - 1, issue(secondRow)],
        [EXPIRES_AT, token],
        [GRACE_END + 1, token],
      ] as const) {
        nowMs = candidateNow;
        expect((await guarded(43, supplied, ownerHeader)).status).toBe(200);
      }
    }
  });

  it("rejects header/session identity spoofing and a different verified owner", async () => {
    const response = await fetch(`${baseUrl}/api/peggy/guard/43`, {
      headers: {
        "content-type": "application/json",
        "x-user-id": "owner-43",
        "x-test-oidc-user": "different-owner",
      },
    });
    expect(await responseShape(response)).toEqual(notFoundShape);
  });

  it("rejects guarded POST body owner/session/token authority", async () => {
    const response = await fetch(`${baseUrl}/api/peggy/guard-chat`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-id": "owner-43",
      },
      body: JSON.stringify({
        conversationId: 43,
        userId: "owner-43",
        sessionId: ownedRow.sessionId,
        accessToken: issue(ownedRow),
      }),
    });

    expect(await responseShape(response)).toEqual(notFoundShape);
    expect(calls).toEqual([
      "no-store", "limit", "lookup", "identity", "secret",
    ]);
    expect(calls).not.toContain("verify");
    expect(guardedHandlerCalls).toBe(0);
  });

  it("keeps invalid guarded IDs as no-store 400 without lookup", async () => {
    expect(await responseShape(await guarded("not-an-id"))).toEqual({
      status: 400,
      cache: "no-store",
      body: { message: "Invalid conversation id" },
    });
    expect(calls).toEqual([]);
  });

  it("keeps a pre-guard limiter terminal and no-store", async () => {
    limited = true;
    const response = await fetch(`${baseUrl}/api/peggy/guard-chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ conversationId: 41 }),
    });
    expect(response.status).toBe(429);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(calls).toEqual(["no-store", "limit"]);
    expect(guardedHandlerCalls).toBe(0);
  });

  it.each([
    ["lookup", () => { rejectLookup = true; }, issue(anonymousRow)],
    ["clock", () => { rejectClock = true; }, issue(anonymousRow)],
    ["verification", () => { rejectVerify = true; }, issue(anonymousRow)],
    ["identity", () => { rejectIdentity = true; }, undefined],
  ])("contains %s failure as generic no-store 500", async (_label, arrange, token) => {
    arrange();
    const response = await guarded(token === undefined ? 43 : 41, token);
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ message: "Internal server error" });
    expect(JSON.stringify(body)).not.toMatch(/sentinel|secret|clock|lookup/i);
    expect(downstreamErrorCalls).toBe(0);
    expect(guardedHandlerCalls).toBe(0);
  });
});

describe("Peggy refresh registrar", () => {
  it("runs no-store then limiter before all refresh work", async () => {
    limited = true;
    const response = await refresh(41, issue(anonymousRow));
    expect(response.status).toBe(429);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(calls).toEqual(["no-store", "limit"]);
  });

  it.each([
    ["exact expiry", EXPIRES_AT],
    ["middle grace", EXPIRES_AT + 3 * 24 * 60 * 60 * 1_000],
    ["inclusive grace end", GRACE_END],
  ])("renews authentic expired proof at %s", async (_label, candidateNow) => {
    nowMs = candidateNow;
    const response = await refresh(41, issue(anonymousRow));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(Object.keys(body)).toEqual(["id", "accessToken"]);
    expect(body.id).toBe(41);
    expect(body.accessToken).toMatch(/^v2\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    expect(verifyPeggyConversationAccessToken(
      anonymousRow,
      body.accessToken,
      TEST_SECRET,
      () => candidateNow,
    )).toEqual({
      status: "valid",
      expiresAt: candidateNow + PEGGY_ACCESS_TOKEN_LIFETIME_MS,
    });
    expect(calls).toEqual([
      "no-store", "limit", "secret", "clock", "lookup", "verify", "issue",
    ]);
  });

  it("returns exact 404 without issuance when refresh grace would overflow", async () => {
    const issuedAt =
      Number.MAX_SAFE_INTEGER - PEGGY_ACCESS_TOKEN_LIFETIME_MS;
    const expiresAt = Number.MAX_SAFE_INTEGER;
    const token = issue(anonymousRow, issuedAt);
    nowMs = expiresAt;

    expect(await responseShape(await refresh(41, token))).toEqual(
      notFoundShape,
    );
    expect(calls).toEqual([
      "no-store", "limit", "secret", "clock", "lookup", "verify",
    ]);
    expect(calls).not.toContain("issue");
  });

  it("renews once at the last safe refresh-grace arithmetic boundary", async () => {
    const expiresAt =
      Number.MAX_SAFE_INTEGER - PEGGY_ACCESS_REFRESH_GRACE_MS;
    const issuedAt = expiresAt - PEGGY_ACCESS_TOKEN_LIFETIME_MS;
    const token = issue(anonymousRow, issuedAt);
    nowMs = expiresAt;

    const response = await refresh(41, token);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(Object.keys(body)).toEqual(["id", "accessToken"]);
    expect(body.id).toBe(41);
    expect(calls).toEqual([
      "no-store", "limit", "secret", "clock", "lookup", "verify", "issue",
    ]);
    expect(calls.filter((call) => call === "issue")).toHaveLength(1);
  });

  it("allows only header-absent exact OIDC/Supabase owners to recover anytime", async () => {
    nowMs = GRACE_END + 365 * 24 * 60 * 60 * 1_000;
    const ownerHeaders: Array<Record<string, string>> = [
      { "x-test-oidc-user": "owner-43" },
      { "x-test-supabase-user": " owner-43 " },
    ];
    for (const headers of ownerHeaders) {
      calls.length = 0;
      const response = await refresh(43, undefined, headers);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        id: 43,
        accessToken: expect.stringMatching(/^v2\./),
      });
      expect(calls).toEqual([
        "no-store", "limit", "secret", "clock", "lookup", "identity", "issue",
      ]);
    }
  });

  it("rejects refresh body owner/session/token authority without issuance", async () => {
    nowMs = EXPIRES_AT;
    const response = await fetch(
      `${baseUrl}/api/peggy/conversations/43/access/refresh`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": "owner-43",
        },
        body: JSON.stringify({
          conversationId: 43,
          userId: "owner-43",
          sessionId: ownedRow.sessionId,
          accessToken: issue(ownedRow),
        }),
      },
    );

    expect(await responseShape(response)).toEqual(notFoundShape);
    expect(calls).toEqual([
      "no-store", "limit", "secret", "clock", "lookup", "identity",
    ]);
    expect(calls).not.toContain("verify");
    expect(calls).not.toContain("issue");
  });

  it("never lets owner identity override a supplied token path", async () => {
    const token = issue(ownedRow);
    for (const [candidateNow, supplied, expectedStatus] of [
      [EXPIRES_AT - 1, token, 404],
      [EXPIRES_AT, token, 200],
      [GRACE_END + 1, token, 404],
      [EXPIRES_AT, "v1.invalid", 404],
      [EXPIRES_AT, "   ", 404],
    ] as const) {
      nowMs = candidateNow;
      const response = await refresh(43, supplied, {
        "x-test-oidc-user": "owner-43",
      });
      expect(response.status).toBe(expectedStatus);
    }
  });

  it("allows a different authenticated caller only with authentic expired capability", async () => {
    nowMs = EXPIRES_AT;
    expect((await refresh(41, issue(anonymousRow), {
      "x-test-oidc-user": "different-user",
    })).status).toBe(200);
    expect(await responseShape(await refresh(41, undefined, {
      "x-test-oidc-user": "different-user",
    }))).toEqual(notFoundShape);
  });

  it("makes valid, v1, malformed, tampered, cross-row, future, beyond-grace, absent, and deleted proof indistinguishable", async () => {
    const token = issue(anonymousRow);
    const [version = "", payload = "", signature = ""] = token.split(".");
    for (const [candidateNow, candidate] of [
      [EXPIRES_AT - 1, token],
      [EXPIRES_AT, "v1.invalid"],
      [EXPIRES_AT, "v2.invalid"],
      [EXPIRES_AT, `${version}.${payload}.${signature.slice(1)}`],
      [EXPIRES_AT, issue(secondRow)],
      [ISSUED_AT, issue(anonymousRow, ISSUED_AT + 1)],
      [GRACE_END + 1, token],
      [EXPIRES_AT, undefined],
    ] as const) {
      nowMs = candidateNow;
      expect(await responseShape(await refresh(41, candidate))).toEqual(notFoundShape);
    }
    conversations.delete(41);
    nowMs = EXPIRES_AT;
    expect(await responseShape(await refresh(41, token))).toEqual(notFoundShape);
  });

  it.each(["not-an-id", "0", "9007199254740992"])(
    "returns no-store 404 for invalid refresh id %s before secret/storage",
    async (id) => {
      expect(await responseShape(await refresh(id, issue(anonymousRow)))).toEqual(notFoundShape);
      expect(calls).toEqual(["no-store", "limit"]);
    },
  );

  it.each([null, "   "])(
    "returns exact 503 for missing/blank secret before clock/storage (%s)",
    async (secret) => {
      configuredSecret = secret;
      const response = await refresh(41, issue(anonymousRow));
      expect(await responseShape(response)).toEqual({
        status: 503,
        cache: "no-store",
        body: { message: "Peggy conversation access is unavailable" },
      });
      expect(calls).toEqual(["no-store", "limit", "secret"]);
    },
  );

  it.each([
    ["lookup", () => { rejectLookup = true; }, issue(anonymousRow), 41],
    ["clock", () => { rejectClock = true; }, issue(anonymousRow), 41],
    ["verification", () => { rejectVerify = true; }, issue(anonymousRow), 41],
    ["issuance", () => { rejectIssue = true; }, issue(anonymousRow), 41],
    ["identity", () => { rejectIdentity = true; }, undefined, 43],
  ])("contains refresh %s failure as generic no-store 500", async (
    _label,
    arrange,
    token,
    id,
  ) => {
    nowMs = EXPIRES_AT;
    arrange();
    const response = await refresh(id, token);
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ message: "Internal server error" });
    expect(JSON.stringify(body)).not.toMatch(/sentinel|secret|clock|lookup/i);
    expect(downstreamErrorCalls).toBe(0);
  });
});
