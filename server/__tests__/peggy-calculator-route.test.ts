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
} from "vitest";
import { registerPeggyIdentityRoutes } from "../peggy-route-auth";

const EXPECTED_TYPES = [
  "arv",
  "roi",
  "brrrr",
  "cashflow",
  "wholesale",
  "piti",
  "ownvsrent",
  "hardmoney",
] as const;
type CalculatorType = (typeof EXPECTED_TYPES)[number];
type CalculatorRequest = {
  calculatorType: CalculatorType;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
};
type ParseResult =
  | { ok: true; value: CalculatorRequest }
  | { ok: false };
type Parser = (body: unknown) => ParseResult;

const EXPECTED_LABELS: Record<CalculatorType, string> = {
  arv: "ARV",
  roi: "ROI",
  brrrr: "BRRRR",
  cashflow: "Cash Flow",
  wholesale: "Wholesale MAO",
  piti: "PITI",
  ownvsrent: "Own vs Rent",
  hardmoney: "Hard Money",
};

const modulePath = resolve(process.cwd(), "shared/peggy-calculator.ts");
const calculatorModule: Record<string, unknown> = existsSync(modulePath)
  ? await import(/* @vite-ignore */ modulePath)
  : {};
const parserExport = calculatorModule.parsePeggyCalculatorRequest;
const typesExport = calculatorModule.PEGGY_CALCULATOR_TYPES;
const labelsExport = calculatorModule.PEGGY_CALCULATOR_LABELS;

function isTransitionalObject(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.getPrototypeOf(value) === Object.prototype,
  );
}

function transitionalFallback(body: unknown): ParseResult {
  try {
    if (!isTransitionalObject(body)) return { ok: false };
    const { calculatorType, inputs, results } = body;
    if (
      typeof calculatorType !== "string" ||
      calculatorType.trim().length === 0 ||
      !isTransitionalObject(inputs) ||
      !isTransitionalObject(results)
    ) {
      return { ok: false };
    }
    return {
      ok: true,
      value: {
        calculatorType: calculatorType as CalculatorType,
        inputs,
        results,
      },
    };
  } catch {
    return { ok: false };
  }
}

const parsePeggyCalculatorRequest: Parser =
  typeof parserExport === "function"
    ? parserExport as Parser
    : transitionalFallback;

function validBody(
  calculatorType: CalculatorType = "roi",
  inputs: Record<string, unknown> = { purchasePrice: 300_000 },
  results: Record<string, unknown> = { roi: 12.5 },
): CalculatorRequest {
  return { calculatorType, inputs, results };
}

function parsedValue(body: unknown): CalculatorRequest {
  const parsed = parsePeggyCalculatorRequest(body);
  expect(parsed).toMatchObject({ ok: true });
  if (!parsed.ok) throw new Error("expected a valid calculator request");
  return parsed.value;
}

function keys(total: number): Record<string, number> {
  return Object.fromEntries(
    Array.from({ length: total }, (_, index) => [`k${index}`, index]),
  );
}

function treeAtBytes(target: number): Record<string, unknown> {
  const value = {
    chunks: Array(16).fill("x".repeat(1_000)),
    tail: "",
  };
  const base = new TextEncoder().encode(JSON.stringify(value)).byteLength;
  value.tail = "x".repeat(target - base);
  expect(value.tail.length).toBeLessThanOrEqual(1_000);
  expect(new TextEncoder().encode(JSON.stringify(value)).byteLength).toBe(
    target,
  );
  return value;
}

describe("Peggy calculator shared export surface", () => {
  it("exports the exact canonical types, labels, and parser", () => {
    expect(typesExport).toEqual(EXPECTED_TYPES);
    expect(labelsExport).toEqual(EXPECTED_LABELS);
    expect(parserExport).toBeTypeOf("function");
  });
});

describe("parsePeggyCalculatorRequest", () => {
  it.each(EXPECTED_TYPES)("accepts and clones canonical type %s", (type) => {
    const body = validBody(
      type,
      { nested: { value: 1 }, values: [true, null] },
      { result: 2 },
    );
    const value = parsedValue(body);
    expect(value).toEqual(body);
    expect(value).not.toBe(body);
    expect(value.inputs).not.toBe(body.inputs);
    expect(value.results).not.toBe(body.results);
    expect(value.inputs.nested).not.toBe(body.inputs.nested);
    expect(value.inputs.values).not.toBe(body.inputs.values);
  });

  it.each([
    "mao",
    "toString",
    "constructor",
    "__proto__",
    "ROI",
    " roi",
    "roi ",
    "",
    "unknown",
  ])("rejects noncanonical calculator type %j", (calculatorType) => {
    expect(parsePeggyCalculatorRequest({
      calculatorType,
      inputs: {},
      results: {},
    })).toEqual({ ok: false });
  });

  it("rejects non-string calculator types without coercion", () => {
    let toStringCalls = 0;
    let valueOfCalls = 0;
    const coercible = {
      toString: () => {
        toStringCalls += 1;
        return "roi";
      },
      valueOf: () => {
        valueOfCalls += 1;
        return "roi";
      },
    };
    for (const calculatorType of [
      null,
      true,
      1,
      new String("roi"),
      ["roi"],
      coercible,
    ]) {
      const parsed = parsePeggyCalculatorRequest({
        calculatorType,
        inputs: {},
        results: {},
      });
      expect(parsed.ok).toBe(false);
    }
    expect(toStringCalls).toBe(0);
    expect(valueOfCalls).toBe(0);
  });

  it.each([
    ["null root", null],
    ["array root", []],
    ["string root", "roi"],
    ["null-prototype root", Object.assign(Object.create(null), validBody())],
    ["custom-prototype root", Object.assign(Object.create({ inherited: true }), validBody())],
    ["missing type", { inputs: {}, results: {} }],
    ["missing inputs", { calculatorType: "roi", results: {} }],
    ["missing results", { calculatorType: "roi", inputs: {} }],
    ["extra root key", { ...validBody(), userId: "body-owner" }],
    ["null inputs", { ...validBody(), inputs: null }],
    ["array inputs", { ...validBody(), inputs: [] }],
    ["null results", { ...validBody(), results: null }],
    ["array results", { ...validBody(), results: [] }],
  ])("rejects invalid request-root contract: %s", (_label, body) => {
    expect(parsePeggyCalculatorRequest(body)).toEqual({ ok: false });
  });

  it("rejects hidden, symbol, and accessor request-root keys without invoking getters", () => {
    let getterCalls = 0;
    const accessor = validBody() as unknown as Record<PropertyKey, unknown>;
    Object.defineProperty(accessor, "calculatorType", {
      enumerable: true,
      get: () => {
        getterCalls += 1;
        return "roi";
      },
    });
    const hidden = validBody() as unknown as Record<PropertyKey, unknown>;
    Object.defineProperty(hidden, "hidden", {
      value: true,
      enumerable: false,
    });
    const symbolic = validBody() as unknown as Record<PropertyKey, unknown>;
    symbolic[Symbol("authority")] = true;
    for (const body of [accessor, hidden, symbolic]) {
      expect(parsePeggyCalculatorRequest(body)).toEqual({ ok: false });
    }
    expect(getterCalls).toBe(0);
  });

  it("accepts container depth three and rejects depth four", () => {
    const objectAtThree = { a: { b: [{ c: true }] } };
    const objectAtFour = { a: { b: [{ c: { d: true } }] } };
    const arraysAtThree = { a: [[[null]]] };
    const arraysAtFour = { a: [[[[null]]]] };
    expect(parsePeggyCalculatorRequest(
      validBody("roi", objectAtThree, arraysAtThree),
    ).ok).toBe(true);
    expect(parsePeggyCalculatorRequest(
      validBody("roi", objectAtFour, {}),
    )).toEqual({ ok: false });
    expect(parsePeggyCalculatorRequest(
      validBody("roi", {}, arraysAtFour),
    )).toEqual({ ok: false });
  });

  it("resets the 64-key budget independently for inputs and results", () => {
    const body = validBody("roi", keys(64), keys(64));
    expect(parsePeggyCalculatorRequest(body).ok).toBe(true);
    expect(parsePeggyCalculatorRequest(validBody("roi", keys(65), {}))).toEqual({
      ok: false,
    });
    expect(parsePeggyCalculatorRequest(validBody("roi", {}, keys(65)))).toEqual({
      ok: false,
    });
  });

  it("counts nested object keys but never array indices", () => {
    const nestedAt64 = {
      ...keys(62),
      nested: { final: true },
    };
    const nestedAt65 = {
      ...nestedAt64,
      overflow: true,
    };
    const arrayAt64 = {
      ...keys(63),
      values: Array(50).fill(null),
    };
    const arrayAt65 = {
      ...keys(64),
      values: [],
    };
    expect(parsePeggyCalculatorRequest(
      validBody("roi", nestedAt64, {}),
    ).ok).toBe(true);
    expect(parsePeggyCalculatorRequest(
      validBody("roi", arrayAt64, {}),
    ).ok).toBe(true);
    expect(parsePeggyCalculatorRequest(
      validBody("roi", nestedAt65, {}),
    )).toEqual({ ok: false });
    expect(parsePeggyCalculatorRequest(
      validBody("roi", arrayAt65, {}),
    )).toEqual({ ok: false });
  });

  it("uses inclusive UTF-16 limits for keys and strings", () => {
    const astral = "😀";
    const key64 = astral.repeat(32);
    const string1000 = astral.repeat(500);
    expect(key64.length).toBe(64);
    expect(string1000.length).toBe(1_000);
    expect(parsePeggyCalculatorRequest(validBody("roi", {
      [key64]: string1000,
    }, {})).ok).toBe(true);
    expect(parsePeggyCalculatorRequest(validBody("roi", {
      [`${key64}x`]: true,
    }, {}))).toEqual({ ok: false });
    expect(parsePeggyCalculatorRequest(validBody("roi", {
      value: `${string1000}x`,
    }, {}))).toEqual({ ok: false });
  });

  it("accepts every permitted scalar including -0", () => {
    const value = parsedValue(validBody("roi", {
      values: [null, true, false, 0, -0, -1.5, "text"],
    }, {}));
    expect(Object.is((value.inputs.values as unknown[])[4], -0)).toBe(true);
  });

  it.each([
    ["NaN", Number.NaN],
    ["positive infinity", Number.POSITIVE_INFINITY],
    ["negative infinity", Number.NEGATIVE_INFINITY],
    ["undefined", undefined],
    ["bigint", 1n],
    ["symbol", Symbol("value")],
    ["function", () => undefined],
    ["date", new Date()],
    ["map", new Map([["value", 1]])],
    ["set", new Set([1])],
    ["typed array", new Uint8Array([1])],
  ])("rejects disallowed nested %s", (_label, value) => {
    expect(parsePeggyCalculatorRequest(validBody("roi", { value }, {}))).toEqual({
      ok: false,
    });
  });

  it("rejects class, null-prototype, custom-prototype, hidden, symbol, and accessor objects", () => {
    class CustomContainer { value = 1; }
    let getterCalls = 0;
    const accessor: Record<string, unknown> = {};
    Object.defineProperty(accessor, "value", {
      enumerable: true,
      get: () => {
        getterCalls += 1;
        return 1;
      },
    });
    const hidden: Record<string, unknown> = { visible: true };
    Object.defineProperty(hidden, "hidden", {
      value: true,
      enumerable: false,
    });
    const symbolic = { visible: true } as Record<PropertyKey, unknown>;
    symbolic[Symbol("hidden")] = true;
    for (const value of [
      new CustomContainer(),
      Object.create(null),
      Object.create({ inherited: true }),
      accessor,
      hidden,
      symbolic,
    ]) {
      expect(parsePeggyCalculatorRequest(
        validBody("roi", { value }, {}),
      )).toEqual({ ok: false });
    }
    expect(getterCalls).toBe(0);
  });

  it("accepts a dense array of 50 and rejects 51", () => {
    expect(parsePeggyCalculatorRequest(validBody("roi", {
      values: Array(50).fill(null),
    }, {})).ok).toBe(true);
    expect(parsePeggyCalculatorRequest(validBody("roi", {
      values: Array(51).fill(null),
    }, {}))).toEqual({ ok: false });
  });

  it("rejects malformed arrays without reading an accessor", () => {
    let getterCalls = 0;
    const sparse = Array(2);
    const named = [1];
    Object.defineProperty(named, "named", { value: true, enumerable: true });
    const negative = [1];
    Object.defineProperty(negative, "-1", { value: true, enumerable: true });
    const leadingZero = [1];
    Object.defineProperty(leadingZero, "00", { value: true, enumerable: true });
    const hidden = [1];
    Object.defineProperty(hidden, "hidden", { value: true, enumerable: false });
    const symbolic = [1] as unknown[] & Record<PropertyKey, unknown>;
    symbolic[Symbol("hidden")] = true;
    const customPrototype = [1];
    Object.setPrototypeOf(customPrototype, { custom: true });
    const fixedLength = [1];
    Object.defineProperty(fixedLength, "length", { writable: false });
    const fixedIndex = [1];
    Object.defineProperty(fixedIndex, "0", { writable: false });
    const accessor = [null];
    Object.defineProperty(accessor, "0", {
      enumerable: true,
      get: () => {
        getterCalls += 1;
        return 1;
      },
    });
    for (const values of [
      sparse,
      named,
      negative,
      leadingZero,
      hidden,
      symbolic,
      customPrototype,
      fixedLength,
      fixedIndex,
      accessor,
    ]) {
      expect(parsePeggyCalculatorRequest(
        validBody("roi", { values }, {}),
      )).toEqual({ ok: false });
    }
    expect(getterCalls).toBe(0);
  });

  it("rejects direct and indirect cycles but accepts repeated acyclic aliases", () => {
    const direct: Record<string, unknown> = {};
    direct.self = direct;
    const left: Record<string, unknown> = {};
    const right: Record<string, unknown> = { left };
    left.right = right;
    expect(parsePeggyCalculatorRequest(validBody("roi", direct, {}))).toEqual({
      ok: false,
    });
    expect(parsePeggyCalculatorRequest(validBody("roi", left, {}))).toEqual({
      ok: false,
    });

    const shared = { value: 7 };
    const parsed = parsedValue(validBody("roi", { first: shared, second: shared }, {}));
    expect(parsed.inputs).toEqual({ first: { value: 7 }, second: { value: 7 } });
    expect(parsed.inputs.first).not.toBe(parsed.inputs.second);
  });

  it("keeps an own __proto__ key as inert data", () => {
    const inputs: Record<string, unknown> = {};
    Object.defineProperty(inputs, "__proto__", {
      value: { safe: true },
      enumerable: true,
      configurable: true,
      writable: true,
    });
    const value = parsedValue(validBody("roi", inputs, {}));
    expect(Object.getPrototypeOf(value.inputs)).toBe(Object.prototype);
    expect(Object.prototype.hasOwnProperty.call(value.inputs, "__proto__")).toBe(true);
    expect(value.inputs.__proto__).toEqual({ safe: true });
    expect(({} as Record<string, unknown>).safe).toBeUndefined();
  });

  it("isolates caller and parsed mutations in both directions", () => {
    const body = validBody("roi", { nested: { values: [1, 2] } }, {});
    const value = parsedValue(body);
    const originalNested = body.inputs.nested as { values: number[] };
    const clonedNested = value.inputs.nested as { values: number[] };
    originalNested.values[0] = 99;
    originalNested.values.push(3);
    expect(clonedNested.values).toEqual([1, 2]);
    clonedNested.values[1] = 88;
    expect(originalNested.values).toEqual([99, 2, 3]);
  });

  it("fails closed when object reflection traps throw", () => {
    const proxies = [
      new Proxy({ value: 1 }, {
        ownKeys: () => { throw new Error("ownKeys sentinel"); },
      }),
      new Proxy({ value: 1 }, {
        getOwnPropertyDescriptor: () => {
          throw new Error("descriptor sentinel");
        },
      }),
      new Proxy({ value: 1 }, {
        getPrototypeOf: () => { throw new Error("prototype sentinel"); },
      }),
    ];
    const revoked = Proxy.revocable({ value: 1 }, {});
    revoked.revoke();
    proxies.push(revoked.proxy);
    for (const value of proxies) {
      let parsed: ParseResult | undefined;
      expect(() => {
        parsed = parsePeggyCalculatorRequest(
          validBody("roi", { value }, {}),
        );
      }).not.toThrow();
      expect(parsed?.ok).toBe(false);
    }
  });

  it("resets exact UTF-8 byte budgets for both trees", () => {
    const exactInputs = treeAtBytes(16_384);
    const exactResults = treeAtBytes(16_384);
    expect(parsePeggyCalculatorRequest(
      validBody("roi", exactInputs, exactResults),
    ).ok).toBe(true);
    expect(parsePeggyCalculatorRequest(
      validBody("roi", treeAtBytes(16_385), {}),
    )).toEqual({ ok: false });
    expect(parsePeggyCalculatorRequest(
      validBody("roi", {}, treeAtBytes(16_385)),
    )).toEqual({ ok: false });

    const multibyte = treeAtBytes(16_384) as { chunks: string[]; tail: string };
    multibyte.tail = `${multibyte.tail.slice(0, -1)}é`;
    expect(multibyte.tail.length).toBe(
      (exactInputs as { tail: string }).tail.length,
    );
    expect(new TextEncoder().encode(JSON.stringify(multibyte)).byteLength).toBe(
      16_385,
    );
    expect(parsePeggyCalculatorRequest(
      validBody("roi", multibyte, {}),
    )).toEqual({ ok: false });
  });
});

type AnalyzeInput = {
  userId: string;
  correlationId: string;
  calculatorType: string;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
};

const calls: string[] = [];
const analyzeCalls: AnalyzeInput[] = [];
let limited = false;
let rejectAnalyzer = false;
let uuidCounter = 1;
let server: Server | undefined;
let baseUrl = "";

const noStore: RequestHandler = (_req, res, next) => {
  calls.push("no-store");
  res.set("Cache-Control", "no-store");
  next();
};

const calculatorRateLimit: RequestHandler = (_req, res, next) => {
  calls.push("limit");
  if (limited) {
    res.status(429).json({ message: "Too many requests" });
    return;
  }
  next();
};

const isHybridAuthenticated: RequestHandler = (req: any, res, next) => {
  calls.push("auth");
  const userId = req.get("x-test-user");
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  req.user = { claims: { sub: userId } };
  next();
};

function getVerifiedPeggyUserId(req: any): string | null {
  calls.push("verified-user");
  const value = req.user?.claims?.sub;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function randomUUID(): string {
  calls.push("uuid");
  return `00000000-0000-4000-8000-${String(uuidCounter++).padStart(12, "0")}`;
}

function parseForRoute(body: unknown): ParseResult {
  calls.push("parser");
  return parsePeggyCalculatorRequest(body);
}

async function analyzeCalculator(input: AnalyzeInput) {
  calls.push("analyze");
  analyzeCalls.push(input);
  if (rejectAnalyzer) {
    throw new Error("provider sentinel with private calculator data");
  }
  return {
    response: `Explained ${input.calculatorType}`,
    conversationId: 501,
  };
}

async function post(
  body: unknown,
  headers: Record<string, string> = {},
): Promise<globalThis.Response> {
  return fetch(`${baseUrl}/api/peggy/analyze-calculator`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  registerPeggyIdentityRoutes(app, {
    noStore,
    publicCreateRateLimit: (_req, _res, next) => next(),
    calculatorRateLimit,
    isHybridAuthenticated,
    getVerifiedPeggyUserId,
    randomUUID,
    getAccessSecret: () => "unused-test-secret",
    createAccessToken: () => "unused-token",
    startWebConversation: async () => {
      throw new Error("create path is outside this harness");
    },
    parseCalculatorRequest: parseForRoute,
    analyzeCalculator,
  });
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
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
  calls.length = 0;
  analyzeCalls.length = 0;
  limited = false;
  rejectAnalyzer = false;
  uuidCounter = 1;
});

describe("POST /api/peggy/analyze-calculator", () => {
  it.each(EXPECTED_TYPES)("accepts authenticated canonical %s", async (type) => {
    const body = validBody(type);
    const response = await post(body, { "x-test-user": " verified-owner " });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      response: `Explained ${type}`,
      conversationId: 501,
    });
    expect(calls).toEqual([
      "no-store",
      "limit",
      "auth",
      "parser",
      "verified-user",
      "uuid",
      "analyze",
    ]);
    expect(analyzeCalls).toEqual([{
      userId: "verified-owner",
      correlationId: "00000000-0000-4000-8000-000000000001",
      ...body,
    }]);
  });

  it.each([
    ["missing field", { calculatorType: "roi", inputs: {} }],
    ["extra root key", { ...validBody(), userId: "body-owner" }],
    ["legacy type", { ...validBody(), calculatorType: "mao" }],
    ["null input", { ...validBody(), inputs: null }],
    ["depth four", validBody("roi", { a: { b: [{ c: { d: true } }] } }, {})],
    ["65 keys", validBody("roi", keys(65), {})],
    ["16,385 bytes", validBody("roi", treeAtBytes(16_385), {})],
    ["1,001-unit string", validBody("roi", { value: "x".repeat(1_001) }, {})],
    ["51-element array", validBody("roi", { values: Array(51).fill(null) }, {})],
  ])("returns truthful no-store 400 with zero downstream work for %s", async (
    label,
    fixture,
  ) => {
    const response = await post(fixture, { "x-test-user": "verified-owner" });
    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      message: "Invalid Peggy calculator request",
    });
    expect(calls).toEqual(["no-store", "limit", "auth", "parser"]);
    expect(analyzeCalls).toHaveLength(0);
  });

  it("keeps anonymous malformed input behind authentication", async () => {
    const response = await post({ calculatorType: "mao", inputs: {}, results: {} });
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ message: "Unauthorized" });
    expect(calls).toEqual(["no-store", "limit", "auth"]);
    expect(analyzeCalls).toHaveLength(0);
  });

  it("keeps rate limiting ahead of authentication and parsing", async () => {
    limited = true;
    const response = await post(
      { calculatorType: "mao", inputs: {}, results: {} },
      { "x-test-user": "verified-owner" },
    );
    expect(response.status).toBe(429);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(calls).toEqual(["no-store", "limit"]);
    expect(analyzeCalls).toHaveLength(0);
  });

  it("contains analyzer failure as a generic no-store 500", async () => {
    rejectAnalyzer = true;
    const response = await post(
      validBody("hardmoney", { privateValue: "must not leak" }, {}),
      { "x-test-user": "verified-owner" },
    );
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({ message: "Internal server error" });
    expect(JSON.stringify(body)).not.toMatch(/sentinel|privateValue|hardmoney/i);
    expect(calls).toEqual([
      "no-store",
      "limit",
      "auth",
      "parser",
      "verified-user",
      "uuid",
      "analyze",
    ]);
  });
});
