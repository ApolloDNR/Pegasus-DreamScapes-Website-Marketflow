/**
 * Strategy Lab — Comp Pad math.
 *
 * Builds a $/sqft band from sale or rent comps and converts that band
 * into an implied subject value at the subject's sqft. Each comp is
 * adjusted by a condition delta (±10% per step), a bed delta (±5% per
 * unit vs subject), and a bath delta (±3% per unit vs subject). Comp
 * weight in the band is the user weight times a distance taper that
 * decays from 1.0 inside 0.5 mi to 0.25 at or beyond 2.0 mi.
 */

import type { CompBand, CompEntry, PropertyInput } from "./types";

const CONDITION_ADJ = 0.1; // ±10% per condition step
const BED_ADJ_PER_UNIT = 0.05; // ±5% per bed delta vs subject
const BATH_ADJ_PER_UNIT = 0.03; // ±3% per bath delta vs subject

/**
 * Distance weight curve. Comps inside ~0.5 mi keep full weight (1.0).
 * Beyond that the weight tapers linearly to 0.25 at 2 miles, and stays
 * at 0.25 thereafter (so out-of-market comps still count, just less).
 */
function distanceWeight(miles: number | undefined): number {
  if (miles == null || !Number.isFinite(miles) || miles <= 0.5) return 1.0;
  if (miles >= 2.0) return 0.25;
  // Linear taper between 0.5 and 2.0.
  return 1.0 - ((miles - 0.5) / 1.5) * 0.75;
}

function adjusted(comp: CompEntry, subject?: { beds?: number; baths?: number }): number {
  const conditionDelta = comp.conditionDelta ?? 0;
  // `conditionDelta` reads "comp condition vs subject": positive means the
  // comp is in BETTER condition than the subject, so the comp's $/sqft
  // overstates the subject and we adjust DOWN. Negative reverses.
  let adj = comp.pricePerSqft * (1 - conditionDelta * CONDITION_ADJ);

  // Bed/bath deltas — comp with more beds/baths than subject overstates
  // subject value, so we adjust DOWN. Skip when subject counts unknown.
  if (subject && comp.beds != null && subject.beds != null) {
    const bedDelta = comp.beds - subject.beds;
    adj *= 1 - bedDelta * BED_ADJ_PER_UNIT;
  }
  if (subject && comp.baths != null && subject.baths != null) {
    const bathDelta = comp.baths - subject.baths;
    adj *= 1 - bathDelta * BATH_ADJ_PER_UNIT;
  }
  return adj;
}

function weightedQuantile(values: { v: number; w: number }[], q: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a.v - b.v);
  const totalW = sorted.reduce((s, x) => s + x.w, 0);
  if (totalW <= 0) return sorted[Math.floor(sorted.length / 2)].v;
  const target = totalW * q;
  let cum = 0;
  for (const x of sorted) {
    cum += x.w;
    if (cum >= target) return x.v;
  }
  return sorted[sorted.length - 1].v;
}

/**
 * Build a $/sqft band from a comp set. Returns null if no usable comps
 * (positive $/sqft entries) of the requested type.
 */
export function buildCompBand(
  comps: CompEntry[],
  type: "sale" | "rent",
  subjectSqft: number,
  subject?: Pick<PropertyInput, "beds" | "baths">,
): CompBand | null {
  const usable = comps
    .filter((c) => c.type === type && c.pricePerSqft > 0)
    .map((c) => ({
      v: adjusted(c, subject),
      // Combine user weight with distance taper so far-away comps influence
      // the band less than in-market ones.
      w: Math.max(0.1, (c.weight ?? 1) * distanceWeight(c.distanceMiles)),
    }));
  if (usable.length === 0) return null;
  const low = weightedQuantile(usable, 0.25);
  const median = weightedQuantile(usable, 0.5);
  const high = weightedQuantile(usable, 0.75);
  const sqft = subjectSqft > 0 ? subjectSqft : 0;
  return {
    low,
    median,
    high,
    impliedLow: low * sqft,
    impliedMedian: median * sqft,
    impliedHigh: high * sqft,
    count: usable.length,
    thin: usable.length < 3,
  };
}

/**
 * True if `userValue` deviates from `band.impliedMedian` by > 15%.
 * Used to flag overrides in the Decision Memo.
 */
export function isCompOverride(userValue: number, band: CompBand | null | undefined): boolean {
  if (!band || band.impliedMedian <= 0 || userValue <= 0) return false;
  return Math.abs(userValue - band.impliedMedian) / band.impliedMedian > 0.15;
}
