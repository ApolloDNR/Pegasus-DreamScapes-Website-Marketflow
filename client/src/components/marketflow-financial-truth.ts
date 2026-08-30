export type MarketflowMoney = number | null | undefined;

export interface MarketflowFinancialRecord {
  askingPrice?: MarketflowMoney;
  contractPrice?: MarketflowMoney;
  arv?: MarketflowMoney;
  repairEstimate?: MarketflowMoney;
  estimatedRepairs?: MarketflowMoney;
  repairCost?: MarketflowMoney;
  repairCosts?: MarketflowMoney;
}

export function normalizeMarketflowMoney(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

export function firstMarketflowMoney(...values: unknown[]): number | null {
  for (const value of values) {
    const normalized = normalizeMarketflowMoney(value);
    if (normalized !== null) return normalized;
  }
  return null;
}

export function isPositiveMarketflowMoney(
  value: MarketflowMoney,
): value is number {
  const normalized = normalizeMarketflowMoney(value);
  return normalized !== null && normalized > 0;
}

export function formatMarketflowMoney(
  value: MarketflowMoney,
  options: { compact?: boolean } = {},
): string {
  const normalized =
    typeof value === "number" && Number.isFinite(value) ? value : null;
  if (normalized === null) return "Not provided";

  if (options.compact && Math.abs(normalized) >= 1_000) {
    const compactValue = normalized / 1_000;
    const digits = Number.isInteger(compactValue) ? 0 : 1;
    return `$${compactValue.toLocaleString("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })}K`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(normalized);
}

export function readWholesaleFinancials(record: MarketflowFinancialRecord) {
  const price = firstMarketflowMoney(record.askingPrice, record.contractPrice);
  const arv = normalizeMarketflowMoney(record.arv);
  const repairs = firstMarketflowMoney(
    record.repairEstimate,
    record.estimatedRepairs,
    record.repairCost,
    record.repairCosts,
  );
  const hasRequiredInputs =
    isPositiveMarketflowMoney(price) &&
    isPositiveMarketflowMoney(arv) &&
    repairs !== null;
  let profit: number | null = null;
  let roi: number | null = null;
  if (hasRequiredInputs) {
    profit = arv - price - repairs;
    roi = (profit / price) * 100;
  }

  return {
    price,
    arv,
    repairs,
    profit,
    roi,
    hasRequiredInputs,
  };
}
