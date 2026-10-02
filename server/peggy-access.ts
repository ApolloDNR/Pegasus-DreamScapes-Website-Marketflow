import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  Express,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import {
  PEGGY_ACCESS_EXPIRED_CODE,
  PEGGY_CONVERSATION_ACCESS_HEADER,
  type PeggyConversationAccessExpiredResponse,
  type PeggyConversationAccessResponse,
} from "@shared/peggy-access";

export {
  PEGGY_ACCESS_EXPIRED_CODE,
  PEGGY_CONVERSATION_ACCESS_HEADER,
};

export const PEGGY_ACCESS_TOKEN_LIFETIME_MS = 86_400_000;
export const PEGGY_ACCESS_REFRESH_GRACE_MS = 604_800_000;

const TOKEN_VERSION = "v2";
const TOKEN_NAMESPACE = "pegasus:peggy-conversation-access";
const MAX_TOKEN_LENGTH = 2_048;
const NOT_FOUND_RESPONSE = { message: "Conversation not found" } as const;
const INTERNAL_ERROR_RESPONSE = { message: "Internal server error" } as const;
const UNAVAILABLE_RESPONSE = {
  message: "Peggy conversation access is unavailable",
} as const;
const INVALID_ID_RESPONSE = { message: "Invalid conversation id" } as const;
const EXPIRED_RESPONSE: PeggyConversationAccessExpiredResponse = {
  message: "Conversation access expired",
  code: PEGGY_ACCESS_EXPIRED_CODE,
};
const PAYLOAD_KEYS = [
  "namespace",
  "version",
  "conversationId",
  "sessionId",
  "userId",
  "issuedAt",
  "expiresAt",
] as const;
const BASE64URL_SEGMENT = /^[A-Za-z0-9_-]+$/;

export interface PeggyConversationAccessRecord {
  id: number;
  sessionId: string;
  userId?: string | null;
}

interface PeggyConversationAccessPayload {
  namespace: typeof TOKEN_NAMESPACE;
  version: typeof TOKEN_VERSION;
  conversationId: number;
  sessionId: string;
  userId: string | null;
  issuedAt: number;
  expiresAt: number;
}

export type PeggyConversationAccessVerification =
  | { status: "valid"; expiresAt: number }
  | { status: "expired"; expiresAt: number }
  | { status: "invalid" };

type VerifyAccessToken = (
  conversation: PeggyConversationAccessRecord,
  token: string,
  secret: string,
  now?: () => number,
) => PeggyConversationAccessVerification;

type CreateAccessToken = (
  conversation: PeggyConversationAccessRecord,
  secret: string,
  now?: () => number,
) => string;

interface PeggyConversationAccessGuardOptions<
  T extends PeggyConversationAccessRecord,
> {
  getConversation: (id: number) => Promise<T | undefined>;
  getSecret?: () => string | null | undefined;
  getVerifiedUserId?: (req: Request) => string | null;
  now?: () => number;
  verifyAccessToken?: VerifyAccessToken;
}

interface PeggyConversationAccessRefreshRouteOptions<
  T extends PeggyConversationAccessRecord,
> {
  noStore: RequestHandler;
  rateLimit: RequestHandler;
  getConversation: (id: number) => Promise<T | undefined>;
  getSecret?: () => string | null | undefined;
  getVerifiedUserId?: (req: Request) => string | null;
  now?: () => number;
  verifyAccessToken?: VerifyAccessToken;
  createAccessToken?: CreateAccessToken;
}

function normalizedUserId(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function authenticatedUserId(req: Request): string | null {
  const authRequest = req as Request & {
    user?: { claims?: { sub?: unknown } };
    supabaseUser?: { id?: unknown };
  };
  return (
    normalizedUserId(authRequest.user?.claims?.sub) ??
    normalizedUserId(authRequest.supabaseUser?.id)
  );
}

function normalizeConversation(
  conversation: PeggyConversationAccessRecord,
): Omit<PeggyConversationAccessPayload, "issuedAt" | "expiresAt"> {
  if (
    !Number.isSafeInteger(conversation.id) ||
    conversation.id <= 0 ||
    typeof conversation.sessionId !== "string" ||
    !conversation.sessionId ||
    !(
      conversation.userId == null ||
      (typeof conversation.userId === "string" && conversation.userId.length > 0)
    )
  ) {
    throw new Error("Invalid Peggy conversation access record");
  }
  return {
    namespace: TOKEN_NAMESPACE,
    version: TOKEN_VERSION,
    conversationId: conversation.id,
    sessionId: conversation.sessionId,
    userId: conversation.userId ?? null,
  };
}

function readClock(now: () => number): number {
  const value = now();
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error("Invalid Peggy conversation access clock");
  }
  return value;
}

function decodeCanonicalBase64url(segment: string): Buffer | null {
  if (!segment || !BASE64URL_SEGMENT.test(segment)) return null;
  try {
    const decoded = Buffer.from(segment, "base64url");
    return decoded.toString("base64url") === segment ? decoded : null;
  } catch {
    return null;
  }
}

function hasExactPayloadShape(
  value: unknown,
): value is PeggyConversationAccessPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  return (
    keys.length === PAYLOAD_KEYS.length &&
    keys.every((key, index) => key === PAYLOAD_KEYS[index]) &&
    record.namespace === TOKEN_NAMESPACE &&
    record.version === TOKEN_VERSION &&
    Number.isSafeInteger(record.conversationId) &&
    (record.conversationId as number) > 0 &&
    typeof record.sessionId === "string" &&
    record.sessionId.length > 0 &&
    (record.userId === null ||
      (typeof record.userId === "string" && record.userId.length > 0)) &&
    Number.isSafeInteger(record.issuedAt) &&
    (record.issuedAt as number) >= 0 &&
    Number.isSafeInteger(record.expiresAt) &&
    (record.expiresAt as number) >= 0 &&
    (record.issuedAt as number) <=
      Number.MAX_SAFE_INTEGER - PEGGY_ACCESS_TOKEN_LIFETIME_MS &&
    record.expiresAt ===
      (record.issuedAt as number) + PEGGY_ACCESS_TOKEN_LIFETIME_MS
  );
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
  now: () => number = Date.now,
): string {
  const normalizedSecret = secret.trim();
  if (!normalizedSecret) {
    throw new Error("Peggy conversation access secret is not configured");
  }
  const issuedAt = readClock(now);
  if (issuedAt > Number.MAX_SAFE_INTEGER - PEGGY_ACCESS_TOKEN_LIFETIME_MS) {
    throw new Error("Invalid Peggy conversation access clock");
  }
  const payload: PeggyConversationAccessPayload = {
    ...normalizeConversation(conversation),
    issuedAt,
    expiresAt: issuedAt + PEGGY_ACCESS_TOKEN_LIFETIME_MS,
  };
  const payloadSegment = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const signed = `${TOKEN_VERSION}.${payloadSegment}`;
  const signature = createHmac("sha256", normalizedSecret)
    .update(signed, "ascii")
    .digest("base64url");
  return `${signed}.${signature}`;
}

export function verifyPeggyConversationAccessToken(
  conversation: PeggyConversationAccessRecord,
  token: string,
  secret: string,
  now: () => number = Date.now,
): PeggyConversationAccessVerification {
  try {
    const normalizedSecret = secret.trim();
    if (
      !normalizedSecret ||
      typeof token !== "string" ||
      token.length > MAX_TOKEN_LENGTH
    ) {
      return { status: "invalid" };
    }
    const segments = token.split(".");
    if (segments.length !== 3 || segments[0] !== TOKEN_VERSION) {
      return { status: "invalid" };
    }
    const payloadBytes = decodeCanonicalBase64url(segments[1]);
    const actualSignature = decodeCanonicalBase64url(segments[2]);
    if (!payloadBytes || !actualSignature || actualSignature.length !== 32) {
      return { status: "invalid" };
    }
    const expectedSignature = createHmac("sha256", normalizedSecret)
      .update(`${TOKEN_VERSION}.${segments[1]}`, "ascii")
      .digest();
    if (
      actualSignature.length !== expectedSignature.length ||
      !timingSafeEqual(actualSignature, expectedSignature)
    ) {
      return { status: "invalid" };
    }
    const payloadText = new TextDecoder("utf-8", { fatal: true }).decode(
      payloadBytes,
    );
    const payload: unknown = JSON.parse(payloadText);
    if (
      !hasExactPayloadShape(payload) ||
      JSON.stringify(payload) !== payloadText
    ) {
      return { status: "invalid" };
    }
    const expectedConversation = normalizeConversation(conversation);
    if (
      payload.conversationId !== expectedConversation.conversationId ||
      payload.sessionId !== expectedConversation.sessionId ||
      payload.userId !== expectedConversation.userId
    ) {
      return { status: "invalid" };
    }
    const nowMs = readClock(now);
    if (payload.issuedAt > nowMs) return { status: "invalid" };
    return nowMs < payload.expiresAt
      ? { status: "valid", expiresAt: payload.expiresAt }
      : { status: "expired", expiresAt: payload.expiresAt };
  } catch {
    return { status: "invalid" };
  }
}

function requestedConversationId(req: Request): number | null {
  const rawId = req.body?.conversationId ?? req.params.id;
  const id = typeof rawId === "number" ? rawId : Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function refreshConversationId(req: Request): number | null {
  const rawId = req.params.id;
  if (typeof rawId !== "string" || !/^[1-9]\d*$/.test(rawId)) return null;
  const id = Number(rawId);
  return Number.isSafeInteger(id) ? id : null;
}

function isExactOwner(
  conversation: PeggyConversationAccessRecord,
  userId: string | null,
): boolean {
  return Boolean(userId && conversation.userId && userId === conversation.userId);
}

function sendInternalError(res: Response): Response {
  return res.status(500).json(INTERNAL_ERROR_RESPONSE);
}

export function createPeggyConversationAccessGuard<
  T extends PeggyConversationAccessRecord,
>({
  getConversation,
  getSecret = getPeggyConversationAccessSecret,
  getVerifiedUserId = authenticatedUserId,
  now = Date.now,
  verifyAccessToken = verifyPeggyConversationAccessToken,
}: PeggyConversationAccessGuardOptions<T>): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    res.set("Cache-Control", "no-store");
    const conversationId = requestedConversationId(req);
    if (conversationId === null) {
      return res.status(400).json(INVALID_ID_RESPONSE);
    }
    try {
      const conversation = await getConversation(conversationId);
      if (!conversation) return res.status(404).json(NOT_FOUND_RESPONSE);

      if (isExactOwner(conversation, getVerifiedUserId(req))) {
        res.locals.peggyConversation = conversation;
        return next();
      }

      const accessToken =
        req.get(PEGGY_CONVERSATION_ACCESS_HEADER)?.trim() || "";
      const secret = getSecret()?.trim() || "";
      if (!accessToken || !secret) {
        return res.status(404).json(NOT_FOUND_RESPONSE);
      }
      const nowMs = readClock(now);
      const verification = verifyAccessToken(
        conversation,
        accessToken,
        secret,
        () => nowMs,
      );
      if (verification.status === "valid") {
        res.locals.peggyConversation = conversation;
        return next();
      }
      if (verification.status === "expired") {
        return res.status(401).json(EXPIRED_RESPONSE);
      }
      return res.status(404).json(NOT_FOUND_RESPONSE);
    } catch {
      return sendInternalError(res);
    }
  };
}

export function registerPeggyConversationAccessRefreshRoute<
  T extends PeggyConversationAccessRecord,
>(
  app: Pick<Express, "post">,
  {
    noStore,
    rateLimit,
    getConversation,
    getSecret = getPeggyConversationAccessSecret,
    getVerifiedUserId = authenticatedUserId,
    now = Date.now,
    verifyAccessToken = verifyPeggyConversationAccessToken,
    createAccessToken = createPeggyConversationAccessToken,
  }: PeggyConversationAccessRefreshRouteOptions<T>,
): void {
  app.post(
    "/api/peggy/conversations/:id/access/refresh",
    noStore,
    rateLimit,
    async (req: Request, res: Response) => {
      const conversationId = refreshConversationId(req);
      if (conversationId === null) {
        return res.status(404).json(NOT_FOUND_RESPONSE);
      }
      try {
        const secret = getSecret()?.trim() || "";
        if (!secret) return res.status(503).json(UNAVAILABLE_RESPONSE);
        const nowMs = readClock(now);
        const conversation = await getConversation(conversationId);
        if (!conversation) return res.status(404).json(NOT_FOUND_RESPONSE);

        const suppliedToken = req.get(PEGGY_CONVERSATION_ACCESS_HEADER);
        if (suppliedToken !== undefined) {
          const verification = verifyAccessToken(
            conversation,
            suppliedToken.trim(),
            secret,
            () => nowMs,
          );
          if (
            verification.status !== "expired" ||
            verification.expiresAt >
              Number.MAX_SAFE_INTEGER - PEGGY_ACCESS_REFRESH_GRACE_MS ||
            nowMs > verification.expiresAt + PEGGY_ACCESS_REFRESH_GRACE_MS
          ) {
            return res.status(404).json(NOT_FOUND_RESPONSE);
          }
        } else if (!isExactOwner(conversation, getVerifiedUserId(req))) {
          return res.status(404).json(NOT_FOUND_RESPONSE);
        }

        const body: PeggyConversationAccessResponse = {
          id: conversation.id,
          accessToken: createAccessToken(conversation, secret, () => nowMs),
        };
        return res.status(200).json(body);
      } catch {
        return sendInternalError(res);
      }
    },
  );
}
