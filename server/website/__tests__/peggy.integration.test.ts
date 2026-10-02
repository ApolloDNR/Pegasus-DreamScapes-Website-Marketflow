import { randomUUID } from "node:crypto";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import express from "express";
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { WebsiteDb } from "../db";
import { getVerifiedWebsiteAuthSubject } from "../identity";
import { assertWebsiteTestTarget } from "../../../scripts/website-db-test-target.mjs";
import { createPeggyConversationAccessGuard, createPeggyConversationAccessToken, PEGGY_CONVERSATION_ACCESS_HEADER } from "../../peggy-access";
import { registerPeggyIdentityRoutes } from "../../peggy-route-auth";
import { parsePeggyCalculatorRequest } from "../../../shared/peggy-calculator";

// Provider replacement is the only service mock. Persistence, auth extraction,
// token signatures, route handlers and SQL run against isolated PostgreSQL 17.
const provider = vi.hoisted(() => ({ completion: vi.fn() }));
vi.mock("openai", () => ({ default: class { chat = { completions: { create: provider.completion } }; } }));
const org = "75000000-0000-4000-8000-000000000001";
const otherOrg = "75000000-0000-4000-8000-000000000002";
const subject = "76000000-0000-4000-8000-000000000001";
const otherSubject = "76000000-0000-4000-8000-000000000002";
const secret = "synthetic-peggy-integration-signing-secret";

// Removing organization predicates, deriving ownership from legacy user_id, or
// saving a made-up provider-error answer must each make these regressions fail.
describe.skipIf(process.env.WEBSITE_DB_TESTS !== "1")("Peggy website persistence and ownership", () => {
  let db: WebsiteDb;
  let close: () => Promise<void>;
  let storage: typeof import("../../storage")["storage"];
  let peggy: typeof import("../../peggy");
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const target = assertWebsiteTestTarget(process.env.WEBSITE_TEST_DATABASE_URL);
    vi.stubEnv("DATABASE_URL", target);
    vi.stubEnv("WEBSITE_ORG_ID", org);
    ({ db, closeDatabase: close } = await import("../../db"));
    ({ storage } = await import("../../storage"));
    peggy = await import("../../peggy");
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
      // Synthetic verified-provider output and hostile legacy claims are kept
      // separate so only the real A3 subject extractor can decide ownership.
      const verified = req.get("x-test-verified-subject");
      if (verified) req.supabaseUser = { id: verified, user_metadata: { role: "admin" } } as any;
      if (req.get("x-test-legacy-subject")) (req as any).user = { claims: { sub: req.get("x-test-legacy-subject"), email: "same@example.test" } };
      next();
    });
    registerPeggyIdentityRoutes(app, {
      noStore: (_req, res, next) => { res.set("Cache-Control", "no-store"); next(); },
      publicCreateRateLimit: (_req, _res, next) => next(),
      calculatorRateLimit: (_req, _res, next) => next(),
      isHybridAuthenticated: (req, res, next) => getVerifiedWebsiteAuthSubject(req) ? next() : res.status(401).json({ message: "Unauthorized" }),
      getVerifiedPeggyUserId: getVerifiedWebsiteAuthSubject,
      randomUUID,
      getAccessSecret: () => secret,
      createAccessToken: createPeggyConversationAccessToken,
      startWebConversation: peggy.startWebConversation,
      parseCalculatorRequest: parsePeggyCalculatorRequest,
      analyzeCalculator: peggy.analyzeCalculatorResults,
    });
    app.get("/api/peggy/conversations/:id", createPeggyConversationAccessGuard({
      getConversation: (id) => storage.getPeggyConversation(id),
      getSecret: () => secret,
      getVerifiedUserId: getVerifiedWebsiteAuthSubject,
    }), async (_req, res) => {
      res.json({ conversation: res.locals.peggyConversation, messages: await storage.getPeggyMessages(res.locals.peggyConversation.id) });
    });
    server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  beforeEach(async () => {
    vi.stubEnv("WEBSITE_ORG_ID", org);
    vi.stubEnv("AI_INTEGRATIONS_OPENAI_API_KEY", "synthetic-never-transmitted-key");
    vi.stubEnv("OPENAI_API_KEY", undefined);
    provider.completion.mockReset().mockImplementation(async (request) => ({
      choices: [{ message: { content: request.response_format ? null : "Synthetic educational explanation." } }],
    }));
    await db.execute(sql`delete from website.peggy_messages where conversation_id in (select id from website.peggy_conversations where session_id like 'peggy-proof-%')`);
    await db.execute(sql`delete from website.peggy_conversations where session_id like 'peggy-proof-%'`);
  });

  afterAll(async () => {
    if (server) await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    if (db) {
      await db.execute(sql`delete from website.peggy_messages where conversation_id in (select id from website.peggy_conversations where org_id in (${org}::uuid, ${otherOrg}::uuid) or session_id like 'peggy-proof-%')`);
      await db.execute(sql`delete from website.peggy_conversations where org_id in (${org}::uuid, ${otherOrg}::uuid) or session_id like 'peggy-proof-%'`);
      await close();
    }
    vi.unstubAllEnvs();
  });

  async function start(userId?: string) {
    return peggy.startWebConversation({ userId, correlationId: `peggy-proof-${randomUUID()}`, context: { page: "home" } });
  }
  async function rawConversation(id: number) {
    return (await db.execute(sql`select * from website.peggy_conversations where id = ${id}`)).rows[0];
  }
  async function counts() {
    return (await db.execute(sql`select (select count(*) from website.peggy_conversations) as conversations, (select count(*) from website.peggy_messages) as messages`)).rows[0];
  }

  it("persists verified ownership as auth_subject while preserving the token userId contract", async () => {
    const conversation = await start(subject);
    expect(await rawConversation(conversation.id)).toMatchObject({ org_id: org, auth_subject: subject, user_id: null });
    expect(conversation.userId).toBe(subject);
    const token = createPeggyConversationAccessToken(conversation, secret);
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    expect(Object.keys(payload)).toEqual(["namespace", "version", "conversationId", "sessionId", "userId", "issuedAt", "expiresAt"]);
    expect(payload.userId).toBe(subject);
    const guest = await start();
    expect(await rawConversation(guest.id)).toMatchObject({ org_id: org, auth_subject: null, user_id: null });
    expect(guest.userId).toBeNull();
  });

  it("missing_key_creates_no_rows for both new-conversation routes and authenticated calculator", async () => {
    vi.stubEnv("AI_INTEGRATIONS_OPENAI_API_KEY", undefined);
    const before = await counts();
    for (const path of ["/api/peggy/conversations", "/api/peggy/conversations/new", "/api/peggy/analyze-calculator"]) {
      const result = await fetch(baseUrl + path, { method: "POST", headers: { "content-type": "application/json", "x-test-verified-subject": subject }, body: JSON.stringify(path.includes("calculator") ? { calculatorType: "roi", inputs: {}, results: {} } : { context: { page: "home" } }) });
      expect(result.status).toBe(503);
      expect(result.headers.get("cache-control")).toBe("no-store");
      expect(await result.json()).toEqual({ code: "peggy_unavailable", message: "Peggy is unavailable right now. Please try again later." });
    }
    await expect(peggy.chat("Do not store this unavailable turn", 999)).rejects.toMatchObject({ name: "PeggyUnavailableError" });
    expect(await counts()).toEqual(before);
    expect(provider.completion).not.toHaveBeenCalled();
  });

  it("verified_subject_ownership_only ignores legacy claims and legacy database ownership", async () => {
    const conversation = await start(subject);
    const get = (headers: Record<string, string>) => fetch(`${baseUrl}/api/peggy/conversations/${conversation.id}`, { headers });
    expect((await get({ "x-test-legacy-subject": subject })).status).toBe(404);
    expect((await get({ "x-test-verified-subject": otherSubject, "x-test-legacy-subject": subject })).status).toBe(404);
    expect((await get({ "x-test-verified-subject": subject })).status).toBe(200);
    await db.execute(sql`update website.peggy_conversations set auth_subject = null, user_id = ${subject} where id = ${conversation.id}`);
    expect((await get({ "x-test-verified-subject": subject })).status).toBe(404);
    expect(await storage.getPeggyConversations(subject)).toEqual([]);
  });

  it("token_cannot_read_other_conversation or another organization's conversation", async () => {
    const first = await start();
    const second = await start();
    const token = createPeggyConversationAccessToken(first, secret);
    const read = (id: number) => fetch(`${baseUrl}/api/peggy/conversations/${id}`, { headers: { [PEGGY_CONVERSATION_ACCESS_HEADER]: token } });
    expect((await read(first.id)).status).toBe(200);
    expect((await read(second.id)).status).toBe(404);
    await db.execute(sql`update website.peggy_conversations set org_id = ${otherOrg} where id = ${first.id}`);
    expect((await read(first.id)).status).toBe(404);
  });

  it("scopes every storage read, feedback, patch and report operation to the server organization", async () => {
    const conversation = await start(subject);
    const message = await storage.createPeggyMessage({ conversationId: conversation.id, orgId: otherOrg, role: "user", content: "Synthetic private org A turn" });
    expect(message.orgId).toBe(org);
    await expect(storage.createPeggyMessage({ conversationId: conversation.id, role: "user", content: null as any })).rejects.toThrow();
    expect((await rawConversation(conversation.id)).message_count).toBe(1);
    expect(await storage.getPeggyConversation(conversation.id)).toMatchObject({ userId: subject, authSubject: subject, orgId: org });
    expect(await storage.getPeggyMessages(conversation.id)).toEqual([message]);
    for (const rows of [
      await storage.getPeggyConversations(subject),
      await storage.getPeggyConversations(undefined, conversation.sessionId),
      await storage.getPeggyConversationsSince(0),
      await storage.getPeggyConversationsForReport(0),
    ]) expect(rows).toEqual([expect.objectContaining({ id: conversation.id, userId: subject, authSubject: subject, orgId: org })]);
    expect(await storage.updatePeggyConversation(conversation.id, { title: "New Conversation" })).toMatchObject({ id: conversation.id, userId: subject });
    expect(await storage.updatePeggyMessageFeedback(message.id, "not_helpful", "Synthetic feedback")).toMatchObject({ feedback: "not_helpful" });
    vi.stubEnv("WEBSITE_ORG_ID", otherOrg);
    expect(await storage.getPeggyConversation(conversation.id)).toBeUndefined();
    expect(await storage.getPeggyMessages(conversation.id)).toEqual([]);
    expect(await storage.getPeggyConversations(subject)).toEqual([]);
    expect(await storage.getPeggyConversations(undefined, conversation.sessionId)).toEqual([]);
    expect(await storage.getPeggyConversationsSince(0)).toEqual([]);
    expect(await storage.getPeggyConversationsForReport(0)).toEqual([]);
    expect(await storage.updatePeggyConversation(conversation.id, { title: "Must not write" })).toBeUndefined();
    expect(await storage.updatePeggyMessageFeedback(message.id, "helpful")).toBeUndefined();
    await storage.markPeggyConversationsReported([conversation.id]);
    await expect(storage.createPeggyMessage({ conversationId: conversation.id, orgId: org, role: "user", content: "Must not write" })).rejects.toThrow();
    expect(await rawConversation(conversation.id)).toMatchObject({ title: "New Conversation", reported_at: null, message_count: 1 });
    vi.stubEnv("WEBSITE_ORG_ID", org);
    expect((await storage.getPeggyMessages(conversation.id))[0].feedback).toBe("not_helpful");
    await storage.markPeggyConversationsReported([conversation.id]);
    expect(await storage.getPeggyConversationsForReport(0)).toEqual([]);
    expect((await storage.getPeggyConversation(conversation.id))?.reportedAt).toBeInstanceOf(Date);
  });

  it("does not let input select organization or transfer ownership during an update", async () => {
    const conversation = await storage.createPeggyConversation({ orgId: otherOrg, userId: subject, sessionId: `peggy-proof-${randomUUID()}` });
    expect(await rawConversation(conversation.id)).toMatchObject({ org_id: org, auth_subject: subject, user_id: null });
    for (const patch of [{ orgId: otherOrg }, { authSubject: otherSubject }, { userId: otherSubject }, { sessionId: "forged" }]) {
      await expect(storage.updatePeggyConversation(conversation.id, patch)).rejects.toThrow();
    }
    expect(await rawConversation(conversation.id)).toMatchObject({ org_id: org, auth_subject: subject, session_id: conversation.sessionId });
  });

  it("missing organization fails before a new conversation is written", async () => {
    vi.stubEnv("WEBSITE_ORG_ID", undefined);
    const before = await counts();
    await expect(start(subject)).rejects.toMatchObject({ name: "PeggyUnavailableError" });
    expect(await counts()).toEqual(before);
  });

  it.each(["exception", "empty"])("provider_failure_preserves the submitted turn without a fabricated assistant answer: %s", async (failure) => {
    const conversation = await start();
    if (failure === "exception") provider.completion.mockRejectedValueOnce(new Error("Synthetic provider unavailable"));
    else provider.completion.mockResolvedValueOnce({ choices: [{ message: { content: " " } }] });
    await expect(peggy.chat("My still-editable question", conversation.id)).rejects.toThrow();
    const messages = await storage.getPeggyMessages(conversation.id);
    expect(messages.map(({ role, content }) => ({ role, content }))).toEqual([{ role: "user", content: "My still-editable question" }]);
    const retry = await peggy.chat("My revised question", conversation.id);
    expect(retry.response).toBe("Synthetic educational explanation.");
    expect((await storage.getPeggyMessages(conversation.id)).filter((message) => message.role === "assistant")).toHaveLength(1);
  });

  it("private_workspace_not_passively_sent and public reading context stays bounded", async () => {
    const conversation = await start();
    await peggy.chat("Explain the text I shared", conversation.id, { currentView: { path: "/saved", page: "Private workspace", section: "Private record", excerpt: "PRIVATE_NOT_AUTHORIZED" } });
    expect(JSON.stringify(provider.completion.mock.calls)).not.toContain("PRIVATE_NOT_AUTHORIZED");
    expect(JSON.stringify(await storage.getPeggyMessages(conversation.id))).not.toContain("PRIVATE_NOT_AUTHORIZED");
    await peggy.chat("Explain this public section", conversation.id, { currentView: { path: "/strategy-lab?private=query", page: "Strategy Lab", section: "Public section", excerpt: "PUBLIC_AUTHORED_TEXT", formValues: { private: "NEVER_READ_THIS" } } as any });
    const requests = JSON.stringify(provider.completion.mock.calls);
    expect(requests).toContain("PUBLIC_AUTHORED_TEXT");
    expect(requests).not.toContain("NEVER_READ_THIS");
    expect(requests).not.toContain("private=query");
  });
});
