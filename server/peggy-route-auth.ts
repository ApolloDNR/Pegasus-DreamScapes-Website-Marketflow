import type { Express, Request, RequestHandler } from "express";
import type { PeggyConversation } from "@shared/schema";
import type { PeggyContext } from "./peggy";

export type PeggyParseResult<T> =
  | { ok: true; value: T }
  | { ok: false };

export type PeggyCalculatorRequest = {
  calculatorType: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
};

export type PeggyIdentityRouteDependencies = {
  noStore: RequestHandler;
  publicCreateRateLimit: RequestHandler;
  calculatorRateLimit: RequestHandler;
  isHybridAuthenticated: RequestHandler;
  getVerifiedPeggyUserId(req: Request): string | null;
  randomUUID(): string;
  getAccessSecret(): string | null;
  createAccessToken(conversation: PeggyConversation, secret: string): string;
  startWebConversation(input: {
    userId?: string;
    correlationId: string;
    context: PeggyContext;
  }): Promise<PeggyConversation>;
  parseCalculatorRequest(
    body: unknown,
  ): PeggyParseResult<PeggyCalculatorRequest>;
  analyzeCalculator(input: PeggyCalculatorRequest & {
    userId: string;
    correlationId: string;
  }): Promise<{ response: string; conversationId: number }>;
};

const ALLOWED_CONTEXT_KEYS = new Set([
  "page",
  "userRole",
  "dealId",
  "dealType",
  "calculatorType",
  "calculatorInputs",
  "calculatorResults",
  "labMode",
  "labAnalysis",
  "surface",
]);
const ALLOWED_DEAL_TYPES = new Set(["capital", "wholesale", "retail"]);
const ALLOWED_LAB_MODES = new Set(["explain", "stress", "prepare"]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  return Object.getPrototypeOf(value) === Object.prototype;
}

type JsonCloneResult =
  | { ok: true; value: unknown }
  | { ok: false };

function plainDataEntries(value: unknown): Array<[string, unknown]> | null {
  if (!isPlainObject(value)) return null;
  const entries: Array<[string, unknown]> = [];
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== "string") return null;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !("value" in descriptor)) return null;
    entries.push([key, descriptor.value]);
  }
  return entries;
}

function cloneJsonTree(
  value: unknown,
  containerDepth: number,
  state: { keys: number; ancestors: Set<object> },
): JsonCloneResult {
  if (value === null || typeof value === "boolean") {
    return { ok: true, value };
  }
  if (typeof value === "string") {
    return value.length <= 1_000
      ? { ok: true, value }
      : { ok: false };
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? { ok: true, value } : { ok: false };
  }
  if (typeof value !== "object") return { ok: false };
  if (containerDepth > 6 || state.ancestors.has(value)) return { ok: false };

  state.ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype) return { ok: false };
      const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
      if (
        !lengthDescriptor ||
        !("value" in lengthDescriptor) ||
        lengthDescriptor.enumerable ||
        lengthDescriptor.configurable ||
        !lengthDescriptor.writable
      ) return { ok: false };
      const length = lengthDescriptor.value;
      const ownKeys = Reflect.ownKeys(value);
      if (
        !Number.isInteger(length) ||
        length < 0 ||
        length > 50 ||
        ownKeys.length !== length + 1
      ) {
        return { ok: false };
      }
      const expectedKeys = new Set([
        "length",
        ...Array.from({ length }, (_, index) => String(index)),
      ]);
      if (
        ownKeys.some(
          (key) => typeof key !== "string" || !expectedKeys.has(key),
        )
      ) return { ok: false };
      const cloned: unknown[] = new Array(length);
      for (let index = 0; index < length; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
        if (!descriptor?.enumerable || !("value" in descriptor)) return { ok: false };
        const child = cloneJsonTree(descriptor.value, containerDepth + 1, state);
        if (!child.ok) return child;
        cloned[index] = child.value;
      }
      return { ok: true, value: cloned };
    }

    const entries = plainDataEntries(value);
    if (!entries) return { ok: false };
    state.keys += entries.length;
    if (state.keys > 256) return { ok: false };
    const cloned: Record<string, unknown> = {};
    for (const [key, childValue] of entries) {
      if (key.length > 64) return { ok: false };
      const child = cloneJsonTree(childValue, containerDepth + 1, state);
      if (!child.ok) return child;
      Object.defineProperty(cloned, key, {
        value: child.value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
    return { ok: true, value: cloned };
  } finally {
    state.ancestors.delete(value);
  }
}

function optionalBoundedString(value: unknown, maxLength: number): boolean {
  return value === undefined ||
    (typeof value === "string" && value.length <= maxLength);
}

function optionalPlainObject(value: unknown): boolean {
  return value === undefined || isPlainObject(value);
}

export function parsePeggyCreateContext(
  body: unknown,
): PeggyParseResult<PeggyContext> {
  try {
    const root = body === undefined ? {} : body;
    const outerEntries = plainDataEntries(root);
    if (!outerEntries) return { ok: false };
    let contextInput: unknown = {};
    for (const [key, value] of outerEntries) {
      if (key === "context") {
        contextInput = value;
      } else if (key === "sessionId") {
        if (typeof value !== "string" || value.length > 255) {
          return { ok: false };
        }
      } else {
        return { ok: false };
      }
    }

    if (!isPlainObject(contextInput)) return { ok: false };
    const cloned = cloneJsonTree(contextInput, 0, {
      keys: 0,
      ancestors: new Set(),
    });
    if (!cloned.ok || !isPlainObject(cloned.value)) return { ok: false };
    const contextValue = cloned.value;
    if (Object.keys(contextValue).some((key) => !ALLOWED_CONTEXT_KEYS.has(key))) {
      return { ok: false };
    }
    if (
      !optionalBoundedString(contextValue.page, 255) ||
      !optionalBoundedString(contextValue.userRole, 64) ||
      !optionalBoundedString(contextValue.calculatorType, 50) ||
      !optionalBoundedString(contextValue.surface, 64) ||
      !optionalPlainObject(contextValue.calculatorInputs) ||
      !optionalPlainObject(contextValue.calculatorResults) ||
      !optionalPlainObject(contextValue.labAnalysis) ||
      (contextValue.dealType !== undefined &&
        (typeof contextValue.dealType !== "string" ||
          !ALLOWED_DEAL_TYPES.has(contextValue.dealType))) ||
      (contextValue.labMode !== undefined &&
        (typeof contextValue.labMode !== "string" ||
          !ALLOWED_LAB_MODES.has(contextValue.labMode))) ||
      (contextValue.dealId !== undefined &&
        (!Number.isSafeInteger(contextValue.dealId) ||
          (contextValue.dealId as number) <= 0 ||
          (contextValue.dealId as number) > 2_147_483_647))
    ) {
      return { ok: false };
    }

    const encoded = JSON.stringify(contextValue);
    if (Buffer.byteLength(encoded, "utf8") > 16 * 1024) return { ok: false };
    return { ok: true, value: contextValue as PeggyContext };
  } catch {
    return { ok: false };
  }
}

export function registerPeggyIdentityRoutes(
  app: Pick<Express, "post">,
  dependencies: PeggyIdentityRouteDependencies,
): void {
  const createConversation: RequestHandler = async (req, res) => {
    const parsed = parsePeggyCreateContext(req.body);
    if (!parsed.ok) {
      res.status(400).json({ message: "Invalid Peggy conversation context" });
      return;
    }
    try {
      const secret = dependencies.getAccessSecret()?.trim();
      if (!secret) {
        res.status(503).json({
          message: "Peggy conversation access is unavailable",
        });
        return;
      }
      const userId = dependencies.getVerifiedPeggyUserId(req) ?? undefined;
      const correlationId = dependencies.randomUUID();
      const conversation = await dependencies.startWebConversation({
        userId,
        correlationId,
        context: parsed.value,
      });
      const accessToken = dependencies.createAccessToken(conversation, secret);
      res.json({ id: conversation.id, accessToken });
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  };

  app.post(
    "/api/peggy/conversations",
    dependencies.noStore,
    dependencies.publicCreateRateLimit,
    createConversation,
  );
  app.post(
    "/api/peggy/conversations/new",
    dependencies.noStore,
    dependencies.publicCreateRateLimit,
    createConversation,
  );
  app.post(
    "/api/peggy/analyze-calculator",
    dependencies.noStore,
    dependencies.calculatorRateLimit,
    dependencies.isHybridAuthenticated,
    async (req, res) => {
      try {
        const parsed = dependencies.parseCalculatorRequest(req.body);
        if (!parsed.ok) {
          res.status(400).json({
            message: "Invalid Peggy calculator request",
          });
          return;
        }
        const userId = dependencies.getVerifiedPeggyUserId(req);
        if (!userId) {
          res.status(401).json({ message: "Unauthorized" });
          return;
        }
        const response = await dependencies.analyzeCalculator({
          userId,
          correlationId: dependencies.randomUUID(),
          ...parsed.value,
        });
        res.json(response);
      } catch {
        res.status(500).json({ message: "Internal server error" });
      }
    },
  );
}
