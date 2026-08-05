import { afterAll, beforeAll, describe, expect, it } from "vitest";
import express from "express";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import {
  createPeggyConversationAccessGuard,
  createPeggyConversationAccessToken,
  PEGGY_CONVERSATION_ACCESS_HEADER,
} from "../peggy-access";

const TEST_SECRET = "test-only-peggy-conversation-secret".repeat(2);
const conversations = new Map([
  [
    41,
    {
      id: 41,
      sessionId: "anonymous-session-one",
      userId: null,
    },
  ],
  [
    42,
    {
      id: 42,
      sessionId: "anonymous-session-two",
      userId: null,
    },
  ],
  [
    43,
    {
      id: 43,
      sessionId: "authenticated-session",
      userId: "user-owner",
    },
  ],
]);

let server: Server;
let baseUrl = "";

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use((req: any, _res, next) => {
    const userId = req.get("x-test-user");
    if (userId) req.user = { claims: { sub: userId } };
    next();
  });

  const guard = createPeggyConversationAccessGuard({
    getConversation: async (id) => conversations.get(id),
    getSecret: () => TEST_SECRET,
  });

  app.get("/api/peggy/conversations/:id", guard, (_req, res) => {
    res.json(res.locals.peggyConversation);
  });
  app.post("/api/peggy/chat", guard, (_req, res) => {
    res.json({ accepted: true });
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
});

describe("Peggy conversation access", () => {
  it("does not disclose a conversation when scoped proof is absent or wrong", async () => {
    const missing = await fetch(`${baseUrl}/api/peggy/conversations/41`);
    const wrong = await fetch(`${baseUrl}/api/peggy/conversations/41`, {
      headers: {
        [PEGGY_CONVERSATION_ACCESS_HEADER]: "v1.invalid",
      },
    });

    expect(missing.status).toBe(404);
    expect(wrong.status).toBe(404);
    expect(await missing.json()).toEqual({ message: "Conversation not found" });
    expect(await wrong.json()).toEqual({ message: "Conversation not found" });
  });

  it("accepts the scoped credential issued for that anonymous conversation", async () => {
    const conversation = conversations.get(41)!;
    const accessToken = createPeggyConversationAccessToken(
      conversation,
      TEST_SECRET,
    );

    const response = await fetch(`${baseUrl}/api/peggy/conversations/41`, {
      headers: {
        [PEGGY_CONVERSATION_ACCESS_HEADER]: accessToken,
      },
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ id: 41 });
  });

  it("does not accept one conversation's credential for another conversation", async () => {
    const accessToken = createPeggyConversationAccessToken(
      conversations.get(41)!,
      TEST_SECRET,
    );

    const response = await fetch(`${baseUrl}/api/peggy/chat`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        [PEGGY_CONVERSATION_ACCESS_HEADER]: accessToken,
      },
      body: JSON.stringify({ conversationId: 42, message: "private prompt" }),
    });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: "Conversation not found" });
  });

  it("allows an authenticated owner and denies a different authenticated user", async () => {
    const owner = await fetch(`${baseUrl}/api/peggy/conversations/43`, {
      headers: { "x-test-user": "user-owner" },
    });
    const otherUser = await fetch(`${baseUrl}/api/peggy/conversations/43`, {
      headers: { "x-test-user": "user-other" },
    });

    expect(owner.status).toBe(200);
    expect(otherUser.status).toBe(404);
  });
});
