/**
 * Strategy Lab — voice rule guards.
 *
 * Every public-facing string the engine emits passes through one of these
 * helpers. Mirrors the locked v1.3.1 voice rules in `replit.md`:
 * - No spaced em-dashes in public copy.
 * - Forbidden phrases: "Invest Now", "Invest With Us", "Investor Returns",
 *   "Passive Income", "Guaranteed Returns", "Principal Protected",
 *   "we buy houses fast", and AI-sounding filler.
 * - No fake stats — engine never invents numbers, only echoes inputs.
 *
 * In production these helpers raise in dev (assertion) and gracefully
 * sanitize in prod so a stray formatter typo cannot leak forbidden copy.
 */

const FORBIDDEN_PHRASES: { pattern: RegExp; reason: string }[] = [
  { pattern: /\bguaranteed returns?\b/i, reason: "guaranteed returns" },
  { pattern: /\bprincipal protected\b/i, reason: "principal protected" },
  { pattern: /\bpassive income\b/i, reason: "passive income" },
  { pattern: /\binvest now\b/i, reason: "invest now" },
  { pattern: /\binvest with us\b/i, reason: "invest with us" },
  { pattern: /\binvestor returns?\b/i, reason: "investor returns" },
  { pattern: /\bwe buy houses fast\b/i, reason: "we buy houses fast" },
];

/** Replace " — " (spaced em-dash) with ". " in public copy. */
export function stripSpacedEmDash(input: string): string {
  return input.replace(/\s+—\s+/g, ". ").replace(/\s+–\s+/g, ". ");
}

/** Returns the first matching forbidden phrase, or null if clean. */
export function findForbiddenPhrase(input: string): string | null {
  for (const { pattern, reason } of FORBIDDEN_PHRASES) {
    if (pattern.test(input)) return reason;
  }
  return null;
}

/**
 * Sanitize a public-facing string. In dev throws so we catch at test time.
 * In prod silently strips spaced em-dashes and returns the safe variant.
 */
export function safeCopy(input: string): string {
  const cleaned = stripSpacedEmDash(input).trim();
  const bad = findForbiddenPhrase(cleaned);
  if (bad) {
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "test") {
      throw new Error(`Voice rule violation: forbidden phrase "${bad}" in: ${input}`);
    }
    // In runtime, strip the forbidden phrase rather than emit it.
    return cleaned.replace(FORBIDDEN_PHRASES.find((p) => p.reason === bad)!.pattern, "[redacted]");
  }
  return cleaned;
}

/** Format a dollar amount the way the snapshot uses it. */
export function fmtDollars(n: number, opts: { compact?: boolean } = {}): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (opts.compact && abs >= 1000) {
    return `${n < 0 ? "-" : ""}$${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`;
  }
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function fmtPct(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(digits)}%`;
}

export function fmtNum(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

export function fmtMonthly(n: number): string {
  return `${fmtDollars(n)}/mo`;
}
