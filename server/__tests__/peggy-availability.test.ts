import { randomUUID } from "node:crypto";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import express from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parsePeggyCalculatorRequest } from "../../shared/peggy-calculator";

// Storage is the only replaced service: use the real Peggy module and SDK,
// but never contact a database or provider during these regressions.
const stored = vi.hoisted(() => ({
  conversations: [] as unknown[],
  messages: [] as unknown[],
  updates: [] as unknown[],
}));
vi.mock("../storage", () => ({
  storage: {
    getPeggyMessages: async () => [],
    createPeggyConversation: async (input: unknown) => {
      stored.conversations.push(input);
      return { id: 41, ...(input as object) };
    },
    createPeggyMessage: async (input: unknown) => {
      stored.messages.push(input);
      return { id: stored.messages.length, ...(input as object) };
    },
    updatePeggyConversation: async (_id: number, input: unknown) => {
      stored.updates.push(input);
      return { id: 41 };
    },
  },
}));

const UNAVAILABLE = {
  code: "peggy_unavailable",
  message: "Peggy is unavailable right now. Please try again later.",
};
let server: Server | undefined;
let providerCalls: Request[] = [];

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("AI_INTEGRATIONS_OPENAI_API_KEY", undefined);
  vi.stubEnv("OPENAI_API_KEY", undefined);
  stored.conversations.length = 0;
  stored.messages.length = 0;
  stored.updates.length = 0;
  providerCalls = [];
});

afterEach(async () => {
  if (server) {
    await new Promise<void>((resolve, reject) => server!.close((error) => error ? reject(error) : resolve()));
    server = undefined;
  }
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function fakeProvider() {
  vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
    providerCalls.push(new Request(input, init));
    return new Response(JSON.stringify({
      id: "synthetic-completion",
      choices: [{ message: { role: "assistant", content: "Synthetic educational explanation." } }],
    }), { headers: { "content-type": "application/json" } });
  });
}

function expectNoWrites() {
  expect(stored).toEqual({ conversations: [], messages: [], updates: [] });
  expect(providerCalls).toEqual([]);
}

async function serveIdentityRoutes() {
  const peggy = await import("../peggy");
  const { registerPeggyIdentityRoutes } = await import("../peggy-route-auth");
  const app = express();
  app.use(express.json());
  registerPeggyIdentityRoutes(app, {
    noStore: (_req, res, next) => { res.set("Cache-Control", "no-store"); next(); },
    publicCreateRateLimit: (_req, _res, next) => next(),
    calculatorRateLimit: (_req, _res, next) => next(),
    isHybridAuthenticated: (req, res, next) => {
      if (req.get("x-test-user")) next();
      else res.status(401).json({ message: "Unauthorized" });
    },
    getVerifiedPeggyUserId: (req) => req.get("x-test-user") ?? null,
    randomUUID,
    getAccessSecret: () => "isolated-test-access-secret",
    createAccessToken: () => { throw new Error("Unavailable Peggy must not mint a token"); },
    startWebConversation: peggy.startWebConversation,
    parseCalculatorRequest: parsePeggyCalculatorRequest,
    analyzeCalculator: peggy.analyzeCalculatorResults,
  });
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server!.once("listening", resolve));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

describe("optional Peggy provider availability", () => {
  it("imports its production service without optional AI credentials", async () => {
    await expect(import("../peggy")).resolves.toHaveProperty("chat");
    expectNoWrites();
  });

  it.each(["start", "chat", "calculator"])("fails closed before %s can persist visitor data without a key", async (operation) => {
    fakeProvider();
    const peggy = await import("../peggy");
    const result = operation === "start"
      ? peggy.startWebConversation({ correlationId: randomUUID(), context: {} })
      : operation === "chat"
        ? peggy.chat("Explain this page", 41)
        : peggy.analyzeCalculatorResults({ userId: "verified-user", correlationId: randomUUID(), calculatorType: "roi", inputs: {}, results: {} });
    await expect(result).rejects.toMatchObject({ name: "PeggyUnavailableError", message: UNAVAILABLE.message });
    expectNoWrites();
  });

  it("treats blank credentials as unavailable without fabricating an answer", async () => {
    vi.stubEnv("AI_INTEGRATIONS_OPENAI_API_KEY", "   ");
    vi.stubEnv("OPENAI_API_KEY", "");
    fakeProvider();
    const peggy = await import("../peggy");
    await expect(peggy.chat("Explain this page", 41)).rejects.toMatchObject({ name: "PeggyUnavailableError" });
    expectNoWrites();
  });

  it("skips optional intake extraction when unavailable without logging visitor data", async () => {
    fakeProvider();
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const peggy = await import("../peggy");
    await expect(peggy.extractIntake([
      { role: "user", content: "Private visitor question" },
      { role: "assistant", content: "Prior saved answer" },
    ])).resolves.toBeNull();
    expect(log).not.toHaveBeenCalled();
    expectNoWrites();
  });

  it.each(["/api/peggy/conversations", "/api/peggy/conversations/new"])("returns an explicit no-store 503 from %s without minting a token", async (path) => {
    const baseUrl = await serveIdentityRoutes();
    const response = await fetch(baseUrl + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ context: { page: "home" } }) });
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual(UNAVAILABLE);
    expectNoWrites();
  });

  it("retains calculator authentication before returning its unavailable result", async () => {
    const baseUrl = await serveIdentityRoutes();
    for (const authenticated of [false, true]) {
      const headers: Record<string, string> = { "content-type": "application/json" };
      if (authenticated) headers["x-test-user"] = "verified-user";
      const response = await fetch(baseUrl + "/api/peggy/analyze-calculator", {
        method: "POST", headers, body: JSON.stringify({ calculatorType: "roi", inputs: {}, results: {} }),
      });
      expect(response.status).toBe(authenticated ? 503 : 401);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(await response.json()).toEqual(authenticated ? UNAVAILABLE : { message: "Unauthorized" });
    }
    expectNoWrites();
  });

  it.each(["integration", "standard"])("initializes lazily with the %s key path and the locked model/provider", async (keyPath) => {
    fakeProvider();
    // Configuration may be absent at import, and is read at first AI use.
    const peggy = await import("../peggy");
    vi.stubEnv("OPENAI_API_KEY", "synthetic-standard-key");
    vi.stubEnv("AI_INTEGRATIONS_OPENAI_BASE_URL", "http://127.0.0.1:1/configured-provider");
    if (keyPath === "integration") vi.stubEnv("AI_INTEGRATIONS_OPENAI_API_KEY", "synthetic-integration-key");
    const result = await peggy.chat("Explain this page", 41);
    expect(result.response).toBe("Synthetic educational explanation.");
    expect(providerCalls).toHaveLength(1);
    const request = providerCalls[0];
    expect(request.url).toBe("http://127.0.0.1:1/configured-provider/chat/completions");
    expect(request.headers.get("authorization")).toBe(`Bearer synthetic-${keyPath}-key`);
    expect(await request.json()).toMatchObject({ model: "gpt-5", max_tokens: 1024 });
    expect(stored.messages).toHaveLength(2);
  });
});
