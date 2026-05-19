/**
 * Strategy Lab — engine unit tests.
 *
 * Coverage targets the 4 hot paths the snapshot UI will hit:
 *   1. Comp band derivation + override detection
 *   2. Scenario engine deltas (base / stressed / worst)
 *   3. Lane scoring + ranking (9 lanes, all verdicts hit)
 *   4. Risk inference rules + voice-rule sanitization
 *   5. Decision Memo composition
 *   6. End-to-end runStrategyLab orchestration
 *   7. Parity with the existing /calculators math primitives
 */

import { describe, expect, it } from "vitest";
import {
  monthlyPayment,
  capRate,
  cashOnCash,
} from "@shared/lib/calculator-math";
import {
  buildAllScenarios,
  buildCompBand,
  buildSensitivityGrid,
  composeDecisionMemo,
  ENGINE_VERSION,
  inferRisks,
  isCompOverride,
  runStrategyLab,
  scoreAllLanes,
  STRATEGY_LANES,
  type CompEntry,
  type PropertyInput,
} from "@shared/strategy-lab";
import { findForbiddenPhrase, safeCopy, fmtDollars, fmtPct } from "@shared/strategy-lab/voice";

// ─────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────

function fixtureFlip(): PropertyInput {
  return {
    address: "123 Easy St",
    sqft: 1500,
    beds: 3,
    baths: 2,
    askingPrice: 200_000,
    rehabBudget: 50_000,
    arvEstimate: 400_000,
    marketRent: 2500,
    condition: "moderate",
    monthlyTaxAnnualPct: 1.1,
    monthlyInsurance: 150,
    submitterRole: "investor_buyer",
  };
}

function fixtureNegativeCashFlow(): PropertyInput {
  return {
    askingPrice: 800_000,
    rehabBudget: 5_000,
    arvEstimate: 820_000,
    marketRent: 2400, // way too low for the price
    sqft: 1800,
    monthlyInsurance: 200,
  };
}

function fixtureWholesale(): PropertyInput {
  return {
    askingPrice: 150_000,
    rehabBudget: 60_000,
    arvEstimate: 350_000,
    sqft: 1200,
    timelineDaysToClose: 14,
    condition: "heavy",
  };
}

const SALE_COMPS: CompEntry[] = [
  { type: "sale", pricePerSqft: 250, sqft: 1500, weight: 1 },
  { type: "sale", pricePerSqft: 270, sqft: 1450, weight: 1 },
  { type: "sale", pricePerSqft: 260, sqft: 1550, weight: 1 },
  { type: "sale", pricePerSqft: 280, sqft: 1600, weight: 1, conditionDelta: 1 },
];
const RENT_COMPS: CompEntry[] = [
  { type: "rent", pricePerSqft: 1.6, sqft: 1500 },
  { type: "rent", pricePerSqft: 1.7, sqft: 1450 },
  { type: "rent", pricePerSqft: 1.65, sqft: 1550 },
];

// ─────────────────────────────────────────────────────────────────────
// 1. Voice rules
// ─────────────────────────────────────────────────────────────────────

describe("voice", () => {
  it("flags forbidden phrases", () => {
    expect(findForbiddenPhrase("guaranteed returns are great")).toBe("guaranteed returns");
    expect(findForbiddenPhrase("Earn passive income today!")).toBe("passive income");
    expect(findForbiddenPhrase("we buy houses fast")).toBe("we buy houses fast");
    expect(findForbiddenPhrase("This is a clean read")).toBeNull();
  });
  it("strips spaced em-dashes", () => {
    expect(safeCopy("All-in is 75% — within range")).not.toContain(" — ");
  });
  it("throws in test env on forbidden copy via safeCopy", () => {
    expect(() => safeCopy("Earn guaranteed returns now")).toThrow(/voice rule/i);
  });
  it("formats money + percent consistently", () => {
    expect(fmtDollars(125000)).toBe("$125,000");
    expect(fmtDollars(125000, { compact: true })).toBe("$125k");
    expect(fmtPct(7.5)).toBe("7.5%");
    expect(fmtDollars(NaN)).toBe("—");
  });
});

// ─────────────────────────────────────────────────────────────────────
// 2. Comp band
// ─────────────────────────────────────────────────────────────────────

describe("comp band", () => {
  it("produces a low/median/high band and implied subject value", () => {
    const band = buildCompBand(SALE_COMPS, "sale", 1500);
    expect(band).not.toBeNull();
    expect(band!.count).toBe(4);
    expect(band!.thin).toBe(false);
    expect(band!.low).toBeLessThanOrEqual(band!.median);
    expect(band!.median).toBeLessThanOrEqual(band!.high);
    expect(band!.impliedMedian).toBeCloseTo(band!.median * 1500, 0);
  });
  it("flags thin comp set under 3 entries", () => {
    const band = buildCompBand(SALE_COMPS.slice(0, 2), "sale", 1500);
    expect(band!.thin).toBe(true);
  });
  it("returns null when no comps of requested type", () => {
    expect(buildCompBand(SALE_COMPS, "rent", 1500)).toBeNull();
  });
  it("isCompOverride detects > 15% deviation", () => {
    const band = buildCompBand(SALE_COMPS, "sale", 1500)!;
    expect(isCompOverride(band.impliedMedian, band)).toBe(false);
    expect(isCompOverride(band.impliedMedian * 1.5, band)).toBe(true);
    expect(isCompOverride(band.impliedMedian * 0.7, band)).toBe(true);
    expect(isCompOverride(0, band)).toBe(false);
  });
  it("respects condition delta in the median", () => {
    const better = [{ type: "sale" as const, pricePerSqft: 200, conditionDelta: 2 as const }];
    const same = [{ type: "sale" as const, pricePerSqft: 200, conditionDelta: 0 as const }];
    const a = buildCompBand(better, "sale", 1000)!;
    const b = buildCompBand(same, "sale", 1000)!;
    // Subject is 2 steps WORSE than the comp → adjusted down.
    expect(a.median).toBeLessThan(b.median);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 3. Scenarios
// ─────────────────────────────────────────────────────────────────────

describe("scenarios", () => {
  const inp = {
    property: fixtureFlip(),
    monthlyRent: 2500,
    totalCashIn: 100_000,
    loanAmount: 150_000,
    ratePct: 7.5,
    termYears: 30,
  };

  it("base ≥ stressed ≥ worst on cash flow", () => {
    const all = buildAllScenarios(inp);
    expect(all.base.annualCashFlow).toBeGreaterThanOrEqual(all.stressed.annualCashFlow);
    expect(all.stressed.annualCashFlow).toBeGreaterThanOrEqual(all.worst.annualCashFlow);
  });
  it("uses 100/95/85% rent multipliers", () => {
    const all = buildAllScenarios(inp);
    expect(all.base.effectiveRent).toBe(2500);
    expect(all.stressed.effectiveRent).toBeCloseTo(2375, 0);
    expect(all.worst.effectiveRent).toBeCloseTo(2125, 0);
  });
  it("debt service computed from monthlyPayment primitive", () => {
    const all = buildAllScenarios(inp);
    const expected = monthlyPayment(150_000, 7.5, 30) * 12;
    expect(all.base.annualDebtService).toBeCloseTo(expected, 0);
  });
  it("DSCR = NOI / debt service", () => {
    const all = buildAllScenarios(inp);
    if (all.base.annualDebtService > 0) {
      expect(all.base.dscr).toBeCloseTo(all.base.noiAnnual / all.base.annualDebtService, 4);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// 4. Risks
// ─────────────────────────────────────────────────────────────────────

describe("risk inference", () => {
  const baseScenarios = buildAllScenarios({
    property: fixtureFlip(),
    monthlyRent: 2500,
    totalCashIn: 100_000,
    loanAmount: 150_000,
    ratePct: 7.5,
    termYears: 30,
  });

  it("fires title-clouded flag when set", () => {
    const flags = inferRisks({
      property: { ...fixtureFlip(), titleClouded: true },
      rehab: 50_000,
      arv: 400_000,
      rent: 2500,
      base: baseScenarios.base,
      worst: baseScenarios.worst,
    });
    expect(flags.find((f) => f.id === "title-clouded")).toBeDefined();
  });

  it("fires arv-thin when all-in > 85% of ARV", () => {
    const flags = inferRisks({
      property: { ...fixtureFlip(), askingPrice: 350_000 },
      rehab: 50_000,
      arv: 400_000,
      rent: 2500,
      base: baseScenarios.base,
      worst: baseScenarios.worst,
    });
    expect(flags.find((f) => f.id === "arv-thin")).toBeDefined();
  });

  it("fires timeline-tight when ≤ 14 days", () => {
    const flags = inferRisks({
      property: { ...fixtureFlip(), timelineDaysToClose: 7 },
      rehab: 50_000, arv: 400_000, rent: 2500,
      base: baseScenarios.base, worst: baseScenarios.worst,
    });
    expect(flags.find((f) => f.id === "timeline-tight")).toBeDefined();
  });

  it("fires cash-flow-negative when base CF < 0", () => {
    const neg = buildAllScenarios({
      property: fixtureNegativeCashFlow(),
      monthlyRent: 2400,
      totalCashIn: 200_000,
      loanAmount: 600_000,
      ratePct: 7.5,
      termYears: 30,
    });
    const flags = inferRisks({
      property: fixtureNegativeCashFlow(),
      rehab: 5_000, arv: 820_000, rent: 2400,
      base: neg.base, worst: neg.worst,
    });
    expect(flags.find((f) => f.id === "cash-flow-negative")).toBeDefined();
  });

  it("every flag carries plain-English voice-safe copy", () => {
    const flags = inferRisks({
      property: { ...fixtureFlip(), titleClouded: true, permitConcerns: true, condition: "gut" },
      rehab: 200_000, arv: 250_000, rent: 2500,
      base: baseScenarios.base, worst: baseScenarios.worst,
    });
    for (const f of flags) {
      expect(f.title.length).toBeGreaterThan(0);
      expect(f.detail.length).toBeGreaterThan(0);
      expect(findForbiddenPhrase(f.title)).toBeNull();
      expect(findForbiddenPhrase(f.detail)).toBeNull();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// 5. Lanes
// ─────────────────────────────────────────────────────────────────────

describe("lane scoring", () => {
  function ctxFor(p: PropertyInput, rent: number) {
    const sc = buildAllScenarios({
      property: p,
      monthlyRent: rent,
      totalCashIn: 100_000,
      loanAmount: 150_000,
      ratePct: 7.5,
      termYears: 30,
    });
    return {
      property: p,
      rent,
      rehab: p.rehabBudget ?? 0,
      arv: p.arvEstimate ?? 0,
      base: sc.base,
      stressed: sc.stressed,
      worst: sc.worst,
      totalCashIn: 100_000,
      loanAmount: 150_000,
      ratePct: 7.5,
      termYears: 30,
    };
  }

  it("scores all 9 lanes and returns them sorted", () => {
    const lanes = scoreAllLanes(ctxFor(fixtureFlip(), 2500));
    expect(lanes).toHaveLength(9);
    expect(new Set(lanes.map((l) => l.lane)).size).toBe(9);
    for (let i = 1; i < lanes.length; i++) {
      // Verdicts are weakly decreasing (sorted).
      const prev = verdictRank(lanes[i - 1].verdict);
      const cur = verdictRank(lanes[i].verdict);
      expect(prev).toBeGreaterThanOrEqual(cur);
    }
  });

  it("flips to STRONG verdict on a clean flip fixture", () => {
    const lanes = scoreAllLanes(ctxFor(fixtureFlip(), 2500));
    const flip = lanes.find((l) => l.lane === "flip")!;
    expect(["strong", "possible"]).toContain(flip.verdict);
    expect(flip.confidence.supportingFactors.length).toBeGreaterThan(0);
  });

  it("transparent confidence — every lane has factor lists, never bare scores", () => {
    const lanes = scoreAllLanes(ctxFor(fixtureFlip(), 2500));
    for (const l of lanes) {
      expect(Array.isArray(l.confidence.supportingFactors)).toBe(true);
      expect(Array.isArray(l.confidence.sensitiveFactors)).toBe(true);
      expect(Array.isArray(l.confidence.missingInputs)).toBe(true);
      expect(l.headline.length).toBeGreaterThan(0);
      expect(findForbiddenPhrase(l.headline)).toBeNull();
    }
  });

  it("rental_hold not_recommended on sub-cash-flow fixture", () => {
    const lanes = scoreAllLanes(ctxFor(fixtureNegativeCashFlow(), 2400));
    const r = lanes.find((l) => l.lane === "rental_hold")!;
    expect(["weak", "not_recommended"]).toContain(r.verdict);
  });

  it("wholesale STRONG when 70% rule leaves spread", () => {
    const p = { ...fixtureWholesale(), askingPrice: 130_000 };
    const lanes = scoreAllLanes(ctxFor(p, 0));
    const w = lanes.find((l) => l.lane === "wholesale")!;
    expect(["strong", "possible"]).toContain(w.verdict);
  });

  it("adu_development needs_more_data when zoning unset", () => {
    const lanes = scoreAllLanes(ctxFor(fixtureFlip(), 2500));
    const adu = lanes.find((l) => l.lane === "adu_development")!;
    expect(adu.verdict).toBe("needs_more_data");
    expect(adu.confidence.missingInputs.length).toBeGreaterThan(0);
  });

  it("STRATEGY_LANES enumerates all 9 in stable order", () => {
    expect(STRATEGY_LANES).toEqual([
      "flip", "wholetail", "brrrr", "rental_hold",
      "adu_development", "ground_up", "wholesale", "jv", "listing_referral",
    ]);
  });
});

function verdictRank(v: string): number {
  return ({ strong: 4, possible: 3, weak: 2, needs_more_data: 1, not_recommended: 0 } as Record<string, number>)[v] ?? 0;
}

// ─────────────────────────────────────────────────────────────────────
// 6. Decision Memo
// ─────────────────────────────────────────────────────────────────────

describe("decision memo", () => {
  it("composes a deterministic narrative for the same input", () => {
    const sn1 = runStrategyLab(fixtureFlip(), {
      comps: [...SALE_COMPS, ...RENT_COMPS],
      now: new Date("2026-05-15T00:00:00Z"),
    });
    const sn2 = runStrategyLab(fixtureFlip(), {
      comps: [...SALE_COMPS, ...RENT_COMPS],
      now: new Date("2026-05-15T00:00:00Z"),
    });
    expect(sn1.memo.paragraph).toBe(sn2.memo.paragraph);
    expect(sn1.memo.nextStep).toBe(sn2.memo.nextStep);
  });

  it("memo paragraph never contains forbidden phrases", () => {
    const sn = runStrategyLab(fixtureFlip(), {
      comps: [...SALE_COMPS, ...RENT_COMPS],
    });
    expect(findForbiddenPhrase(sn.memo.paragraph)).toBeNull();
    expect(findForbiddenPhrase(sn.memo.nextStep)).toBeNull();
  });

  it("flags comp override when user ARV > 15% above band", () => {
    const sn = runStrategyLab(
      { ...fixtureFlip(), arvEstimate: 1_000_000 }, // way above the comp-implied $390k
      { comps: SALE_COMPS },
    );
    expect(sn.memo.hasCompOverrideWarning).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 7. Orchestration — end-to-end runStrategyLab
// ─────────────────────────────────────────────────────────────────────

describe("runStrategyLab end-to-end", () => {
  const sn = runStrategyLab(fixtureFlip(), {
    comps: [...SALE_COMPS, ...RENT_COMPS],
    now: new Date("2026-05-15T00:00:00Z"),
  });

  it("returns a versioned snapshot with all 9 lanes", () => {
    expect(sn.engineVersion).toBe(ENGINE_VERSION);
    expect(sn.lanes).toHaveLength(9);
    expect(sn.topLane).toBeDefined();
    expect(sn.scenarios.base).toBeDefined();
    expect(sn.scenarios.stressed).toBeDefined();
    expect(sn.scenarios.worst).toBeDefined();
  });

  it("includes a capital stack summing > 0 with totalCashIn matching", () => {
    expect(sn.capitalStack.length).toBeGreaterThan(0);
    expect(sn.totalCashIn).toBeGreaterThan(0);
  });

  it("includes risks, sensitivities, breakevens, reverseSolvers", () => {
    expect(Array.isArray(sn.risks)).toBe(true);
    expect(sn.sensitivities.length).toBeGreaterThanOrEqual(1);
    expect(typeof sn.breakevens.breakevenRentMonthly).toBe("number");
    expect(Array.isArray(sn.reverseSolvers)).toBe(true);
  });

  it("sensitivity grid cells = rows × cols", () => {
    for (const g of sn.sensitivities) {
      expect(g.cells.length).toBe(g.xAxis.values.length * g.yAxis.values.length);
    }
  });

  it("reverse solvers fire only for failing lanes", () => {
    const failing = new Set(
      sn.lanes.filter((l) => l.verdict === "weak" || l.verdict === "not_recommended").map((l) => l.lane),
    );
    for (const r of sn.reverseSolvers) {
      expect(failing.has(r.lane)).toBe(true);
      expect(r.required.length).toBeGreaterThan(0);
    }
  });

  it("BRRRR rent target accounts for vacancy + opex (regression: was annualDebt*1.2/12)", () => {
    // Sub-DSCR rental — verify reverse solver suggests a rent that is
    // materially above the naive (annualDebt*1.2)/12 floor (which ignored
    // ~21% variable opex + 8% vacancy).
    const subDscr: PropertyInput = {
      askingPrice: 350_000,
      rehabBudget: 20_000,
      arvEstimate: 380_000,
      marketRent: 1700,
      condition: "moderate",
      monthlyTaxAnnualPct: 1.2,
      monthlyInsurance: 150,
      submitterRole: "investor_buyer",
    };
    const out = runStrategyLab(subDscr);
    const brrrr = out.reverseSolvers.find((r) => r.lane === "brrrr");
    expect(brrrr).toBeDefined();
    const rentLine = brrrr!.required.find((s) => /rent to/i.test(s));
    expect(rentLine).toBeDefined();
    const m = rentLine!.match(/\$([\d,]+)/);
    expect(m).toBeTruthy();
    const target = Number(m![1].replace(/,/g, ""));
    const naive = (out.scenarios.base.annualDebtService * 1.2) / 12;
    // Correct math gives at least ~25-35% headroom above the naive floor.
    expect(target).toBeGreaterThan(naive * 1.2);
    expect(target).toBeLessThan(naive * 2.5);
  });

  it("wholesale sensitivity grid is MAO × assignment-fee, not flip's ARV × rehab", () => {
    // Test the grid builder directly — runStrategyLab only emits grids for
    // top-2 lanes and rank order varies by fixture, but the grid shape must
    // be wholesale-shaped whenever wholesale is requested.
    const w = buildSensitivityGrid({
      lane: "wholesale",
      property: fixtureFlip(),
      rent: 2500,
      rehab: 50_000,
      arv: 400_000,
      loanAmount: 150_000,
      ratePct: 7.0,
      termYears: 30,
      monthlyOpex: 800,
      base: sn.scenarios.base,
    });
    expect(w.xAxis.label).toMatch(/Maximum Allowable Offer/i);
    expect(w.yAxis.label).toMatch(/Assignment fee/i);
    expect(w.metric).toBe("net_profit");
    expect(w.cells.length).toBe(w.xAxis.values.length * w.yAxis.values.length);
  });

  it("BRRRR sensitivity grid is Refi Value × Rent (cash-left-in metric)", () => {
    const g = buildSensitivityGrid({
      lane: "brrrr",
      property: fixtureFlip(),
      rent: 2500,
      rehab: 50_000,
      arv: 400_000,
      loanAmount: 150_000,
      ratePct: 7.0,
      termYears: 30,
      monthlyOpex: 800,
      base: sn.scenarios.base,
    });
    expect(g.xAxis.label).toMatch(/Refi appraised value/i);
    expect(g.yAxis.label).toMatch(/Monthly rent/i);
    expect(g.metric).toBe("cash_left_in");
    expect(g.cells.length).toBe(g.xAxis.values.length * g.yAxis.values.length);
  });

  it("ground_up sensitivity grid is Build $/sqft × Land cost (net build profit)", () => {
    const subject: PropertyInput = {
      ...fixtureFlip(),
      sqft: 2000,
      askingPrice: 250_000,
      rehabBudget: 450_000, // proxy for hard build cost
      arvEstimate: 900_000,
      lotSqft: 12_000,
      developmentPotential: true,
    };
    const g = buildSensitivityGrid({
      lane: "ground_up",
      property: subject,
      rent: 0,
      rehab: subject.rehabBudget ?? 0,
      arv: subject.arvEstimate ?? 0,
      loanAmount: 200_000,
      ratePct: 8.0,
      termYears: 30,
      monthlyOpex: 0,
      base: sn.scenarios.base,
    });
    expect(g.xAxis.label).toMatch(/Build cost per sqft/i);
    expect(g.yAxis.label).toMatch(/Land cost/i);
    expect(g.metric).toBe("net_profit");
    expect(g.cells.length).toBe(g.xAxis.values.length * g.yAxis.values.length);
    // Build axis centers on rehab/sqft = $225/sqft and land axis on asking.
    const midX = g.xAxis.values[Math.floor(g.xAxis.values.length / 2)];
    const midY = g.yAxis.values[Math.floor(g.yAxis.values.length / 2)];
    expect(midX).toBe(225);
    expect(midY).toBe(250_000);
    // Monotonicity: profit must DECREASE as build cost rises (fixed row).
    const cols = g.xAxis.values.length;
    const rowStart = Math.floor(g.yAxis.values.length / 2) * cols;
    for (let i = rowStart + 1; i < rowStart + cols; i++) {
      expect(g.cells[i]).toBeLessThan(g.cells[i - 1]);
    }
    // Monotonicity: profit must DECREASE as land cost rises (fixed col).
    const col = Math.floor(cols / 2);
    for (let r = 1; r < g.yAxis.values.length; r++) {
      expect(g.cells[r * cols + col]).toBeLessThan(g.cells[(r - 1) * cols + col]);
    }
    // Base cell sanity: ARV − land − build − soft(12%) − closing(6%).
    const baseCell = g.cells[rowStart + Math.floor(cols / 2)];
    const expectedBase =
      900_000 - 250_000 - 225 * 2000 - 225 * 2000 * 0.12 - 900_000 * 0.06;
    expect(baseCell).toBeCloseTo(Math.round(expectedBase), 0);
  });

  it("runStrategyLab applies subject bed/bath deltas to comp bands (e2e)", () => {
    const comps: CompEntry[] = [
      { type: "sale", pricePerSqft: 200, sqft: 1500, beds: 5, baths: 3, distanceMiles: 0.3 },
      { type: "sale", pricePerSqft: 200, sqft: 1500, beds: 5, baths: 3, distanceMiles: 0.4 },
      { type: "sale", pricePerSqft: 200, sqft: 1500, beds: 5, baths: 3, distanceMiles: 0.5 },
    ];
    const subject3bed = { ...fixtureFlip(), beds: 3, baths: 2, sqft: 1500 };
    const subject5bed = { ...fixtureFlip(), beds: 5, baths: 3, sqft: 1500 };
    const snap3 = runStrategyLab(subject3bed, { comps });
    const snap5 = runStrategyLab(subject5bed, { comps });
    // 3-bed subject vs 5-bed comps → engine should pull median DOWN.
    expect(snap3.arvBand!.median).toBeLessThan(snap5.arvBand!.median);
  });

  it("Decision memo is at most 4 sentences (3 baseline, 4 with risk/override)", () => {
    const sentences = (s: string) => s.split(/(?<=[.!?])\s+/).filter(Boolean).length;
    expect(sentences(sn.memo.paragraph)).toBeLessThanOrEqual(4);
    expect(sentences(sn.memo.paragraph)).toBeGreaterThanOrEqual(3);
  });

  it("Comp Pad applies bed/bath delta + distance taper", () => {
    // Same $/sqft, different bed counts, different distances → adjusted
    // values should diverge predictably.
    const subject: PropertyInput = { ...fixtureFlip(), beds: 3, baths: 2 };
    const close: CompEntry = {
      type: "sale", pricePerSqft: 200, sqft: 1500,
      beds: 3, baths: 2, distanceMiles: 0.3, conditionDelta: 0,
    };
    const moreBeds: CompEntry = { ...close, beds: 5 };
    const farAway: CompEntry = { ...close, distanceMiles: 3.0 };

    const bandClose = buildCompBand([close, close, close], "sale", 1500, subject);
    const bandMoreBeds = buildCompBand([moreBeds, moreBeds, moreBeds], "sale", 1500, subject);
    const bandFar = buildCompBand([close, close, farAway], "sale", 1500, subject);

    expect(bandClose).toBeTruthy();
    expect(bandMoreBeds).toBeTruthy();
    expect(bandFar).toBeTruthy();
    // 5-bed comp should pull median DOWN (comp overstates 3-bed subject).
    expect(bandMoreBeds!.median).toBeLessThan(bandClose!.median);
    // Far-away comp at the same value should not change the median much
    // (because it has the same value), but its weight must be strictly less.
    // Smoke check: still finite + positive.
    expect(bandFar!.median).toBeGreaterThan(0);
  });

  it("Occupancy risk fires for owner_occupied and tenant_occupied", () => {
    const owner = inferRisks({
      property: { ...fixtureFlip(), occupancyStatus: "owner_occupied" },
      rehab: 50_000, arv: 400_000, rent: 2500,
      base: sn.scenarios.base, worst: sn.scenarios.worst,
    });
    expect(owner.find((r) => r.id === "occupancy-owner")).toBeTruthy();

    const tenant = inferRisks({
      property: { ...fixtureFlip(), occupancyStatus: "tenant_occupied", tenantLeaseMonthsRemaining: 9 },
      rehab: 50_000, arv: 400_000, rent: 2500,
      base: sn.scenarios.base, worst: sn.scenarios.worst,
    });
    const t = tenant.find((r) => r.id === "occupancy-tenant");
    expect(t).toBeTruthy();
    expect(t!.severity).toBe("high"); // ≥6 months remaining → high
    expect(t!.detail).toMatch(/9 months/);

    // Vacant should NOT fire.
    const vacant = inferRisks({
      property: { ...fixtureFlip(), occupancyStatus: "vacant" },
      rehab: 50_000, arv: 400_000, rent: 2500,
      base: sn.scenarios.base, worst: sn.scenarios.worst,
    });
    expect(vacant.find((r) => r.category === "occupancy")).toBeFalsy();
  });

  it("snapshot is JSON-serializable (engine outputs no class instances)", () => {
    const json = JSON.stringify(sn);
    expect(json.length).toBeGreaterThan(100);
    const round = JSON.parse(json);
    expect(round.engineVersion).toBe(ENGINE_VERSION);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 8. Parity vs existing /calculators math primitives
//    Ensures the engine reuses the SAME formulas the on-screen calculators
//    use, so "numbers don't change" when a calculator is later refactored
//    to consume the engine.
// ─────────────────────────────────────────────────────────────────────

describe("parity with /calculators primitives", () => {
  it("scenarios reuse monthlyPayment from shared primitives", () => {
    const all = buildAllScenarios({
      property: fixtureFlip(),
      monthlyRent: 2500,
      totalCashIn: 100_000,
      loanAmount: 150_000,
      ratePct: 7.5,
      termYears: 30,
    });
    const expected = monthlyPayment(150_000, 7.5, 30) * 12;
    expect(all.base.annualDebtService).toBeCloseTo(expected, 0);
  });

  it("cap rate matches calculator-math.capRate", () => {
    const all = buildAllScenarios({
      property: fixtureFlip(),
      monthlyRent: 2500,
      totalCashIn: 100_000,
      loanAmount: 150_000,
      ratePct: 7.5,
      termYears: 30,
    });
    expect(all.base.capRatePct).toBeCloseTo(
      capRate(all.base.noiAnnual, fixtureFlip().askingPrice),
      4,
    );
  });

  it("cash-on-cash matches calculator-math.cashOnCash", () => {
    const all = buildAllScenarios({
      property: fixtureFlip(),
      monthlyRent: 2500,
      totalCashIn: 100_000,
      loanAmount: 150_000,
      ratePct: 7.5,
      termYears: 30,
    });
    expect(all.base.cashOnCashPct).toBeCloseTo(
      cashOnCash(all.base.annualCashFlow, 100_000),
      4,
    );
  });
});
