export const STRATEGY_LAB_HANDOFF_SESSION_KEY =
  "pegasus.strategy-lab.handoff.v1";

const SCHEMA_VERSION = 1 as const;
const MAX_AGE_MS = 2 * 60 * 60 * 1_000;
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1_000;
const MAX_MONEY = 10_000_000_000;
const SUMMARY_LABEL =
  "Directional Strategy Lab brief (visitor-entered; automated and unverified):";

export type StrategyLabHandoffInput = {
  address?: string;
  propertyType?: string;
  occupancy?: string;
  condition?: string;
  situation?: string;
  askingPrice?: number;
  rehabBudget?: number;
  arvEstimate?: number;
  marketRent?: number;
  topLaneLabel?: string;
  topLaneVerdict?: string;
  primaryMetric?: string;
  memoNextStep?: string;
  engineVersion?: string;
  generatedAt?: string;
};

export type StrategyLabHandoffBrief = StrategyLabHandoffInput & {
  schemaVersion: typeof SCHEMA_VERSION;
  storedAt: string;
};

const TEXT_LIMITS = {
  address: 500,
  propertyType: 80,
  occupancy: 80,
  condition: 80,
  situation: 160,
  topLaneLabel: 160,
  topLaneVerdict: 200,
  primaryMetric: 200,
  memoNextStep: 300,
  engineVersion: 80,
} as const satisfies Partial<
  Record<keyof StrategyLabHandoffInput, number>
>;

const MONEY_KEYS = [
  "askingPrice",
  "rehabBudget",
  "arvEstimate",
  "marketRent",
] as const;

const MEANINGFUL_KEYS = [
  ...Object.keys(TEXT_LIMITS),
  ...MONEY_KEYS,
] as Array<keyof StrategyLabHandoffInput>;

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedText(value: unknown, limit: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
  return cleaned || undefined;
}

function boundedMoney(value: unknown): number | undefined {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0 ||
    value > MAX_MONEY
  ) {
    return undefined;
  }
  return Math.round(value);
}

function isoDate(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return undefined;
  return new Date(timestamp).toISOString();
}

function sanitizeInput(
  value: unknown,
): StrategyLabHandoffInput {
  if (!isRecord(value)) return {};

  const result: StrategyLabHandoffInput = {};
  for (const [key, limit] of Object.entries(TEXT_LIMITS) as Array<
    [keyof typeof TEXT_LIMITS, number]
  >) {
    const text = boundedText(value[key], limit);
    if (text) result[key] = text;
  }
  for (const key of MONEY_KEYS) {
    const amount = boundedMoney(value[key]);
    if (amount !== undefined) result[key] = amount;
  }

  const generatedAt = isoDate(value.generatedAt);
  if (generatedAt) result.generatedAt = generatedAt;
  return result;
}

function hasMeaningfulValue(value: StrategyLabHandoffInput): boolean {
  return MEANINGFUL_KEYS.some((key) => value[key] !== undefined);
}

export function clearStrategyLabHandoff(): void {
  try {
    window.sessionStorage.removeItem(STRATEGY_LAB_HANDOFF_SESSION_KEY);
  } catch {
    // Storage may be unavailable in a locked-down or server-rendered browser.
  }
}

export function writeStrategyLabHandoff(
  input: StrategyLabHandoffInput,
): boolean {
  const sanitized = sanitizeInput(input);
  if (!hasMeaningfulValue(sanitized)) return false;

  const brief: StrategyLabHandoffBrief = {
    schemaVersion: SCHEMA_VERSION,
    storedAt: new Date().toISOString(),
    ...sanitized,
  };

  try {
    window.sessionStorage.setItem(
      STRATEGY_LAB_HANDOFF_SESSION_KEY,
      JSON.stringify(brief),
    );
    return true;
  } catch {
    return false;
  }
}

export function readStrategyLabHandoff(): StrategyLabHandoffBrief | null {
  let stored: string | null = null;
  try {
    stored = window.sessionStorage.getItem(
      STRATEGY_LAB_HANDOFF_SESSION_KEY,
    );
  } catch {
    return null;
  }
  if (!stored) return null;

  try {
    const parsed: unknown = JSON.parse(stored);
    if (
      !isRecord(parsed) ||
      parsed.schemaVersion !== SCHEMA_VERSION
    ) {
      clearStrategyLabHandoff();
      return null;
    }

    const storedAt = isoDate(parsed.storedAt);
    if (!storedAt) {
      clearStrategyLabHandoff();
      return null;
    }
    const age = Date.now() - Date.parse(storedAt);
    if (age > MAX_AGE_MS || age < -MAX_FUTURE_SKEW_MS) {
      clearStrategyLabHandoff();
      return null;
    }

    const sanitized = sanitizeInput(parsed);
    if (!hasMeaningfulValue(sanitized)) {
      clearStrategyLabHandoff();
      return null;
    }
    return {
      schemaVersion: SCHEMA_VERSION,
      storedAt,
      ...sanitized,
    };
  } catch {
    clearStrategyLabHandoff();
    return null;
  }
}

export function formatStrategyLabHandoffSummary(
  brief: StrategyLabHandoffBrief,
): string {
  const parts: string[] = [];
  if (brief.address) parts.push(`Address: ${brief.address}`);

  const facts = [
    brief.propertyType,
    brief.occupancy,
    brief.condition,
    brief.situation,
  ].filter(Boolean);
  if (facts.length) parts.push(`Property facts: ${facts.join(", ")}`);

  if (brief.askingPrice !== undefined) {
    parts.push(`Asking price / basis: ${USD.format(brief.askingPrice)}`);
  }
  if (brief.rehabBudget !== undefined) {
    parts.push(`Scope: ${USD.format(brief.rehabBudget)}`);
  }
  if (brief.arvEstimate !== undefined) {
    parts.push(`Projected exit value: ${USD.format(brief.arvEstimate)}`);
  }
  if (brief.marketRent !== undefined) {
    parts.push(`Projected monthly rent: ${USD.format(brief.marketRent)}`);
  }

  if (brief.topLaneLabel) {
    parts.push(
      `Modeled path: ${brief.topLaneLabel}${
        brief.topLaneVerdict ? ` — ${brief.topLaneVerdict}` : ""
      }`,
    );
  }
  if (brief.primaryMetric) {
    parts.push(`Primary metric: ${brief.primaryMetric}`);
  }
  if (brief.memoNextStep) {
    parts.push(`Suggested next check: ${brief.memoNextStep}`);
  }
  if (brief.engineVersion) {
    parts.push(`Engine: ${brief.engineVersion}`);
  }

  return `${SUMMARY_LABEL} ${parts.join("; ")}`.slice(0, 1_200);
}
