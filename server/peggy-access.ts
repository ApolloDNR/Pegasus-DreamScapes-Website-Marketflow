import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { PEGGY_CONVERSATION_ACCESS_HEADER } from "@shared/peggy-access";

export { PEGGY_CONVERSATION_ACCESS_HEADER };

export interface PeggyConversationAccessRecord {
  id: number;
  sessionId: string;
  userId?: string | null;
}

interface PeggyConversationAccessGuardOptions<
  T extends PeggyConversationAccessRecord,
> {
  getConversation: (id: number) => Promise<T | undefined>;
  getSecret?: () => string | null | undefined;
}

const TOKEN_VERSION = "v1";
const NOT_FOUND_RESPONSE = { message: "Conversation not found" };

function tokenPayload(conversation: PeggyConversationAccessRecord): string {
  return JSON.stringify([
    "pegasus:peggy-conversation-access",
    TOKEN_VERSION,
    conversation.id,
    conversation.sessionId,
    conversation.userId ?? null,
  ]);
}

export function getPeggyConversationAccessSecret(): string | null {
  return (
    process.env.PEGGY_CONVERSATION_ACCESS_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim() ||
    null
  );
}

export function createPeggyConversationAccessToken(
  conversation: PeggyConversationAccessRecord,
  secret: string,
): string {
  const normalizedSecret = secret.trim();
  if (!normalizedSecret) {
    throw new Error("Peggy conversation access secret is not configured");
  }

  const signature = createHmac("sha256", normalizedSecret)
    .update(tokenPayload(conversation))
    .digest("base64url");
  return `${TOKEN_VERSION}.${signature}`;
}

export function verifyPeggyConversationAccessToken(
  conversation: PeggyConversationAccessRecord,
  token: string,
  secret: string,
): boolean {
  const expected = createPeggyConversationAccessToken(conversation, secret);
  const actualBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function authenticatedUserId(req: Request): string | undefined {
  const authRequest = req as Request & {
    user?: { claims?: { sub?: string } };
    supabaseUser?: { id?: string; claims?: { sub?: string } };
  };

  return (
    authRequest.user?.claims?.sub ||
    authRequest.supabaseUser?.claims?.sub ||
    authRequest.supabaseUser?.id
  );
}

function requestedConversationId(req: Request): number | null {
  const rawId = req.body?.conversationId ?? req.params.id;
  const id = typeof rawId === "number" ? rawId : Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function createPeggyConversationAccessGuard<
  T extends PeggyConversationAccessRecord,
>({
  getConversation,
  getSecret = getPeggyConversationAccessSecret,
}: PeggyConversationAccessGuardOptions<T>): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const conversationId = requestedConversationId(req);
    if (conversationId === null) {
      return res.status(400).json({ message: "Invalid conversation id" });
    }

    try {
      const conversation = await getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json(NOT_FOUND_RESPONSE);
      }

      const userId = authenticatedUserId(req);
      const isAuthenticatedOwner =
        Boolean(userId) &&
        Boolean(conversation.userId) &&
        userId === conversation.userId;

      const accessToken =
        req.get(PEGGY_CONVERSATION_ACCESS_HEADER)?.trim() || "";
      const secret = getSecret()?.trim() || "";
      const hasScopedAccess =
        Boolean(accessToken) &&
        Boolean(secret) &&
        verifyPeggyConversationAccessToken(
          conversation,
          accessToken,
          secret,
        );

      if (!isAuthenticatedOwner && !hasScopedAccess) {
        return res.status(404).json(NOT_FOUND_RESPONSE);
      }

      res.locals.peggyConversation = conversation;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
