/**
 * Re-export shim — the canonical implementation now lives in
 * `shared/lib/calculator-math.ts` so both the Strategy Lab engine
 * (`shared/strategy-lab/*`) and the existing `/calculators` page can
 * share a single source of truth. Existing imports continue to work
 * unchanged.
 */
export * from "@shared/lib/calculator-math";
