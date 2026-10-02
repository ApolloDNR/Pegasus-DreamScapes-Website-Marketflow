export const PEGGY_CALCULATOR_TYPES = [
  "arv",
  "roi",
  "brrrr",
  "cashflow",
  "wholesale",
  "piti",
  "ownvsrent",
  "hardmoney",
] as const;

export type PeggyCalculatorType =
  (typeof PEGGY_CALCULATOR_TYPES)[number];

export const PEGGY_CALCULATOR_LABELS: Record<PeggyCalculatorType, string> = {
  arv: "ARV",
  roi: "ROI",
  brrrr: "BRRRR",
  cashflow: "Cash Flow",
  wholesale: "Wholesale MAO",
  piti: "PITI",
  ownvsrent: "Own vs Rent",
  hardmoney: "Hard Money",
};

export type PeggyCalculatorRequest = {
  calculatorType: PeggyCalculatorType;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
};

export type PeggyCalculatorParseResult =
  | { ok: true; value: PeggyCalculatorRequest }
  | { ok: false };

const MAX_CONTAINER_DEPTH = 3;
const MAX_OBJECT_KEYS = 64;
const MAX_KEY_LENGTH = 64;
const MAX_STRING_LENGTH = 1_000;
const MAX_ARRAY_LENGTH = 50;
const MAX_TREE_BYTES = 16_384;

const CALCULATOR_TYPE_SET = new Set<string>(PEGGY_CALCULATOR_TYPES);

type CloneResult =
  | { ok: true; value: unknown }
  | { ok: false };

type CloneState = {
  objectKeys: number;
  ancestors: Set<object>;
};

function isOrdinaryObject(
  value: unknown,
): value is Record<string, unknown> {
  return value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype;
}

function ownEnumerableDataEntries(
  value: unknown,
): Array<[string, unknown]> | null {
  if (!isOrdinaryObject(value)) return null;
  const entries: Array<[string, unknown]> = [];
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== "string") return null;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !("value" in descriptor)) return null;
    entries.push([key, descriptor.value]);
  }
  return entries;
}

function cloneTree(
  value: unknown,
  containerDepth: number,
  state: CloneState,
): CloneResult {
  if (value === null || typeof value === "boolean") {
    return { ok: true, value };
  }
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? { ok: true, value }
      : { ok: false };
  }
  if (typeof value === "string") {
    return value.length <= MAX_STRING_LENGTH
      ? { ok: true, value }
      : { ok: false };
  }
  if (typeof value !== "object") return { ok: false };
  if (
    containerDepth > MAX_CONTAINER_DEPTH ||
    state.ancestors.has(value)
  ) {
    return { ok: false };
  }

  state.ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype) {
        return { ok: false };
      }
      const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");
      if (
        !lengthDescriptor ||
        !("value" in lengthDescriptor) ||
        lengthDescriptor.enumerable ||
        lengthDescriptor.configurable ||
        !lengthDescriptor.writable
      ) {
        return { ok: false };
      }
      const length = lengthDescriptor.value;
      if (
        !Number.isInteger(length) ||
        length < 0 ||
        length > MAX_ARRAY_LENGTH
      ) {
        return { ok: false };
      }
      const ownKeys = Reflect.ownKeys(value);
      if (ownKeys.length !== length + 1) return { ok: false };
      const expectedKeys = new Set([
        "length",
        ...Array.from({ length }, (_, index) => String(index)),
      ]);
      if (ownKeys.some(
        (key) => typeof key !== "string" || !expectedKeys.has(key),
      )) {
        return { ok: false };
      }

      const clone: unknown[] = new Array(length);
      for (let index = 0; index < length; index += 1) {
        const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
        if (
          !descriptor?.enumerable ||
          !("value" in descriptor) ||
          !descriptor.configurable ||
          !descriptor.writable
        ) {
          return { ok: false };
        }
        const child = cloneTree(
          descriptor.value,
          containerDepth + 1,
          state,
        );
        if (!child.ok) return child;
        clone[index] = child.value;
      }
      return { ok: true, value: clone };
    }

    const entries = ownEnumerableDataEntries(value);
    if (!entries) return { ok: false };
    state.objectKeys += entries.length;
    if (state.objectKeys > MAX_OBJECT_KEYS) return { ok: false };

    const clone: Record<string, unknown> = {};
    for (const [key, childValue] of entries) {
      if (key.length > MAX_KEY_LENGTH) return { ok: false };
      const child = cloneTree(
        childValue,
        containerDepth + 1,
        state,
      );
      if (!child.ok) return child;
      Object.defineProperty(clone, key, {
        value: child.value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
    return { ok: true, value: clone };
  } finally {
    state.ancestors.delete(value);
  }
}

function cloneBoundedObject(
  value: unknown,
): Record<string, unknown> | null {
  if (!isOrdinaryObject(value)) return null;
  const cloned = cloneTree(value, 0, {
    objectKeys: 0,
    ancestors: new Set(),
  });
  if (!cloned.ok || !isOrdinaryObject(cloned.value)) return null;
  const encoded = JSON.stringify(cloned.value);
  if (
    typeof encoded !== "string" ||
    new TextEncoder().encode(encoded).byteLength > MAX_TREE_BYTES
  ) {
    return null;
  }
  return cloned.value;
}

function isPeggyCalculatorType(
  value: unknown,
): value is PeggyCalculatorType {
  return typeof value === "string" && CALCULATOR_TYPE_SET.has(value);
}

export function parsePeggyCalculatorRequest(
  body: unknown,
): PeggyCalculatorParseResult {
  try {
    const entries = ownEnumerableDataEntries(body);
    if (entries?.length !== 3) return { ok: false };
    const values = new Map(entries);
    if (
      !values.has("calculatorType") ||
      !values.has("inputs") ||
      !values.has("results")
    ) {
      return { ok: false };
    }

    const calculatorType = values.get("calculatorType");
    if (!isPeggyCalculatorType(calculatorType)) return { ok: false };

    const inputs = cloneBoundedObject(values.get("inputs"));
    if (!inputs) return { ok: false };
    const results = cloneBoundedObject(values.get("results"));
    if (!results) return { ok: false };

    return {
      ok: true,
      value: { calculatorType, inputs, results },
    };
  } catch {
    return { ok: false };
  }
}
