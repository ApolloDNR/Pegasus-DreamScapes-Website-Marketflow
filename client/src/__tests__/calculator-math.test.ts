import { describe, it, expect } from "vitest";
import {
  monthlyPayment,
  amortizationSchedule,
  buildSensitivityMatrix,
  breakevenRent,
  breakevenRate,
  breakevenVacancy,
  projectExit,
  ownVsRent,
  SCENARIO_DELTAS,
  housingAffordability28_36,
  holdingCostStack,
} from "@/lib/calculator-math";
import {
  computeArv,
  computeRoi,
  computeBrrrr,
  computeWholesale,
} from "@shared/strategy-lab/calculator-adapters";

describe("monthlyPayment", () => {
  it("matches a known amortization figure: 200k @ 7% / 30yr ≈ $1,330.60", () => {
    const p = monthlyPayment(200_000, 7, 30);
    expect(p).toBeGreaterThan(1330);
    expect(p).toBeLessThan(1331);
  });

  it("returns principal/term for a zero-rate loan", () => {
    const p = monthlyPayment(120_000, 0, 30);
    expect(p).toBeCloseTo(120_000 / 360, 2);
  });

  it("returns 0 when principal is 0", () => {
    expect(monthlyPayment(0, 7, 30)).toBe(0);
  });
});

describe("amortizationSchedule", () => {
  it("produces a row per month with declining balance", () => {
    const sched = amortizationSchedule(200_000, 7, 30);
    expect(sched).toHaveLength(360);
    expect(sched[0].balance).toBeLessThan(200_000);
    expect(sched[359].balance).toBeLessThan(1); // fully amortized
  });

  it("month 1 interest dominates month 1 principal at 7%", () => {
    const [m1] = amortizationSchedule(200_000, 7, 30);
    expect(m1.interest).toBeGreaterThan(m1.principal);
  });
});

describe("buildSensitivityMatrix", () => {
  it("places base case at the matrix centre and produces 5x5 grid", () => {
    const m = buildSensitivityMatrix({
      baseRent: 2000,
      baseRate: 7,
      loanAmount: 200_000,
      termYears: 30,
      monthlyOpex: 400,
    });
    expect(m).toHaveLength(5);
    expect(m[0]).toHaveLength(5);
    const center = m[2][2];
    expect(center.rent).toBeCloseTo(2000, 0);
    expect(center.rate).toBeCloseTo(7, 2);
  });
});

describe("breakeven solvers", () => {
  it("breakevenRent equals debt service plus opex", () => {
    expect(breakevenRent(1330.6, 400)).toBeCloseTo(1730.6, 1);
  });

  it("breakevenRate finds a rate that zeroes cash flow within tolerance", () => {
    const rate = breakevenRate({
      rent: 2000,
      monthlyOpex: 400,
      loanAmount: 200_000,
      termYears: 30,
    });
    expect(rate).toBeGreaterThan(0);
    const pmt = monthlyPayment(200_000, rate, 30);
    const cf = 2000 - 400 - pmt;
    expect(Math.abs(cf)).toBeLessThan(2); // converged to within $2
  });

  it("breakevenVacancy is bounded 0..100", () => {
    const v = breakevenVacancy({
      grossRent: 2000,
      monthlyOpex: 400,
      monthlyDebtService: 1330.6,
    });
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(100);
  });
});

describe("projectExit", () => {
  it("equity grows monotonically with appreciation + paydown", () => {
    const series = projectExit({
      initialCashIn: 50_000,
      propertyValue: 300_000,
      loanAmount: 240_000,
      annualRatePct: 7,
      termYears: 30,
      monthlyRent: 2400,
      monthlyOpex: 600,
      maxYear: 10,
    });
    expect(series).toHaveLength(10);
    for (let i = 1; i < series.length; i++) {
      expect(series[i].equity).toBeGreaterThan(series[i - 1].equity);
    }
  });
});

describe("ownVsRent", () => {
  it("returns a series and a (possibly null) crossover year", () => {
    const r = ownVsRent({
      homePrice: 500_000,
      downPaymentPct: 20,
      mortgageRatePct: 7,
      termYears: 30,
      monthlyOwnExtra: 800,
      appreciationPct: 3,
      monthlyRent: 2400,
      rentGrowthPct: 3,
      investmentReturnPct: 6,
      years: 15,
    });
    expect(r.series).toHaveLength(15);
    expect(r.crossoverYear === null || r.crossoverYear > 0).toBe(true);
    // Higher rent → renter accumulates less, so own net-worth advantage grows.
    const last = r.series.at(-1)!;
    expect(last.ownNetWorth).toBeGreaterThan(0);
    expect(last.rentNetWorth).toBeGreaterThan(0);
  });
});

describe("SCENARIO_DELTAS", () => {
  it("has Base/Stressed/Worst with monotonically more punishing rate adders", () => {
    expect(SCENARIO_DELTAS.Base.rateAdd).toBe(0);
    expect(SCENARIO_DELTAS.Stressed.rateAdd).toBeGreaterThan(SCENARIO_DELTAS.Base.rateAdd);
    expect(SCENARIO_DELTAS.Worst.rateAdd).toBeGreaterThan(SCENARIO_DELTAS.Stressed.rateAdd);
  });
});

import {
  housingAffordability28_36,
  breakevenPriceAtCap,
  rentForTargetCoC,
  buildPriceRentMatrix,
  projectExitGrid,
  holdingCostStack,
  ownVsRentScenarios,
} from "@/lib/calculator-math";

describe("housingAffordability28_36", () => {
  it("28% ceiling binds when monthly debts are low", () => {
    const r = housingAffordability28_36({
      grossAnnualIncome: 120_000,
      monthlyDebts: 200,
      annualRatePct: 7,
      termYears: 30,
      downPaymentPct: 20,
    });
    // 120k/12 = 10k → 28% = 2800; 36% − 200 = 3400. Binding = 2800.
    expect(r.bindingMaxMonthly).toBeCloseTo(2800, 0);
    expect(r.maxLoanAmount).toBeGreaterThan(300_000);
    expect(r.maxPurchasePrice).toBeGreaterThan(r.maxLoanAmount);
  });
  it("36% ceiling binds when other debts are heavy", () => {
    const r = housingAffordability28_36({
      grossAnnualIncome: 120_000,
      monthlyDebts: 2000,
      annualRatePct: 7,
      termYears: 30,
      downPaymentPct: 20,
    });
    // 36% − 2000 = 1600 < 2800. Binding = 1600.
    expect(r.bindingMaxMonthly).toBeCloseTo(1600, 0);
  });
});

describe("breakevenPriceAtCap & rentForTargetCoC", () => {
  it("price at cap = NOI / cap", () => {
    expect(breakevenPriceAtCap(24_000, 6)).toBeCloseTo(400_000, 0);
  });
  it("rent for 8% CoC includes opex + debt service plus monthly target return", () => {
    const rent = rentForTargetCoC({
      targetCoCPct: 8,
      cashInvested: 60_000,
      monthlyOpex: 400,
      monthlyDebtService: 1200,
    });
    // 8% of 60k = 4800/yr → 400/mo. + 400 opex + 1200 debt = 2000.
    expect(rent).toBeCloseTo(2000, 0);
  });
});

describe("buildPriceRentMatrix", () => {
  it("center cell uses base rent + base price; cells reflect rent − opex − pmt(price*ltv)", () => {
    const m = buildPriceRentMatrix({
      baseRent: 2000,
      basePrice: 300_000,
      ltvPct: 80,
      annualRatePct: 7,
      termYears: 30,
      monthlyOpex: 400,
    });
    expect(m).toHaveLength(5);
    const center = m[2][2];
    expect(center.rent).toBe(2000);
    expect(center.price).toBe(300_000);
    // Higher rent → better cash flow
    expect(m[0][2].monthlyCashFlow).toBeLessThan(m[4][2].monthlyCashFlow);
    // Higher price → worse cash flow at same rent
    expect(m[2][4].monthlyCashFlow).toBeLessThan(m[2][0].monthlyCashFlow);
  });
});

describe("projectExitGrid", () => {
  it("returns 12 cells (4 years × 3 appreciation rates); higher appreciation → higher value", () => {
    const cells = projectExitGrid({
      initialCashIn: 50_000,
      propertyValue: 300_000,
      loanAmount: 240_000,
      annualRatePct: 7,
      termYears: 30,
      monthlyRent: 2400,
      monthlyOpex: 600,
    });
    expect(cells).toHaveLength(12);
    const high = cells.find((c) => c.year === 10 && c.appreciationPct === 6)!;
    const low = cells.find((c) => c.year === 10 && c.appreciationPct === 2)!;
    expect(high.propertyValue).toBeGreaterThan(low.propertyValue);
    expect(high.netProceeds).toBeGreaterThan(low.netProceeds);
    // Center cell: year 5, 4% appreciation → 300k * 1.04^5.
    const mid = cells.find((c) => c.year === 5 && c.appreciationPct === 4)!;
    expect(mid.propertyValue).toBeCloseTo(300_000 * Math.pow(1.04, 5), 0);
  });
});

describe("holdingCostStack", () => {
  it("breakeven sale covers loan + holding + cash with selling costs grossed up", () => {
    const s = holdingCostStack({
      purchase: 200_000,
      rehab: 50_000,
      ltcPct: 80,
      pointsPct: 2,
      ratePct: 12,
      monthsHeld: 6,
      annualTaxPct: 1.2,
      monthlyInsurance: 100,
      monthlyUtilities: 100,
      sellingCostPct: 7,
    });
    // After paying 7% selling costs, remainder must cover loan + holding + cash.
    const proceeds = s.breakevenSalePrice * (1 - 0.07);
    expect(proceeds).toBeCloseTo(s.loanAmount + s.totalHoldingCost + s.cashRequired, 0);
    expect(s.totalCashIntoDeal).toBeCloseTo(s.cashRequired + s.totalHoldingCost, 0);
  });
});

describe("ownVsRentScenarios", () => {
  it("returns three appreciation scenarios with monotonic owner net worth", () => {
    const r = ownVsRentScenarios({
      homePrice: 500_000,
      downPaymentPct: 20,
      mortgageRatePct: 7,
      termYears: 30,
      monthlyRent: 2400,
      monthlyOwnExtra: 800,
      rentGrowthPct: 3,
      investmentReturnPct: 6,
      years: 15,
    });
    expect(r.map((s) => s.appreciationPct)).toEqual([2, 4, 6]);
    const yr15 = r.map((s) => s.series.at(-1)!.ownNetWorth);
    expect(yr15[1]).toBeGreaterThan(yr15[0]);
    expect(yr15[2]).toBeGreaterThan(yr15[1]);
  });
});

describe("housingAffordability28_36 — edge cases", () => {
  it("returns zero max-loan and max-price when down payment is 100%", () => {
    const r = housingAffordability28_36({
      grossAnnualIncome: 180_000,
      monthlyDebts: 500,
      downPaymentPct: 100,
      annualRatePct: 7,
      termYears: 30,
      monthlyTaxIns: 600,
    });
    expect(r.maxLoanAmount).toBe(0);
    expect(r.maxPurchasePrice).toBe(0);
    expect(r.bindingMaxMonthly).toBeGreaterThan(0);
  });

  it("produces a sane price for a normal 20% down profile", () => {
    const r = housingAffordability28_36({
      grossAnnualIncome: 120_000,
      monthlyDebts: 400,
      downPaymentPct: 20,
      annualRatePct: 7,
      termYears: 30,
      monthlyTaxIns: 600,
    });
    expect(r.maxPurchasePrice).toBeGreaterThan(200_000);
    expect(r.maxPurchasePrice).toBeLessThan(800_000);
    expect(r.maxLoanAmount).toBeCloseTo(r.maxPurchasePrice * 0.8, 0);
  });
});

describe("computeBrrrr — cash back nets existing loan payoff", () => {
  it("all-cash BRRRR: full refi proceeds flow back to investor", () => {
    const r = computeBrrrr({
      purchase: 200_000,
      rehab: 50_000,
      arv: 400_000,
      monthlyRent: 2800,
      monthlyExpenses: 600,
      refinanceLtvPct: 75,
      refinanceRatePct: 7.5,
    });
    expect(r.existingLoanPayoff).toBe(0);
    expect(r.refinanceValue).toBeCloseTo(300_000, 0);
    expect(r.cashBack).toBeCloseTo(300_000, 0);
    expect(r.cashLeftInDeal).toBe(0);
    expect(r.infiniteReturn).toBe(true);
  });

  it("BRRRR with $150k existing acquisition loan: cash back is refi minus payoff", () => {
    const r = computeBrrrr({
      purchase: 200_000,
      rehab: 50_000,
      arv: 400_000,
      monthlyRent: 2800,
      monthlyExpenses: 600,
      refinanceLtvPct: 75,
      refinanceRatePct: 7.5,
      existingLoanBalance: 150_000,
    });
    expect(r.existingLoanPayoff).toBe(150_000);
    expect(r.refinanceValue).toBeCloseTo(300_000, 0);
    expect(r.cashBack).toBeCloseTo(150_000, 0);
  });

  it("BRRRR where refi cannot cover the existing loan: cash back floors at zero", () => {
    const r = computeBrrrr({
      purchase: 200_000,
      rehab: 50_000,
      arv: 260_000,
      monthlyRent: 2800,
      monthlyExpenses: 600,
      refinanceLtvPct: 75,
      refinanceRatePct: 7.5,
      existingLoanBalance: 220_000,
    });
    expect(r.cashBack).toBe(0);
    expect(r.cashLeftInDeal).toBeGreaterThan(0);
  });
});

describe("holdingCostStack — hard money edge cases", () => {
  it("one-month clamp (the floor the UI enforces) produces a finite stack and APR", () => {
    const s = holdingCostStack({
      purchase: 300_000,
      rehab: 50_000,
      ltcPct: 90,
      pointsPct: 2,
      ratePct: 12,
      monthsHeld: 1,
      originationFee: 1500,
      annualTaxPct: 1.2,
      monthlyInsurance: 150,
      monthlyUtilities: 100,
      sellingCostPct: 7,
    });
    expect(Number.isFinite(s.totalHoldingCost)).toBe(true);
    expect(s.totalHoldingCost).toBeGreaterThan(0);
    expect(Number.isFinite(s.effectiveAPRpct)).toBe(true);
  });
});

describe("computeArv — guard divisions and 70% rule", () => {
  it("zero rehab and zero holding still produces a finite 70% rule and ROI", () => {
    const r = computeArv({ purchase: 200_000, rehab: 0, arv: 300_000, holding: 0, closingPercent: 6 });
    expect(Number.isFinite(r.seventyPercentRule)).toBe(true);
    expect(r.seventyPercentRule).toBeCloseTo(300_000 * 0.7, 0);
    expect(Number.isFinite(r.roi)).toBe(true);
  });

  it("zero total investment does not produce NaN ROI", () => {
    const r = computeArv({ purchase: 0, rehab: 0, arv: 250_000, holding: 0, closingPercent: 6 });
    expect(Number.isFinite(r.roi)).toBe(true);
    expect(r.roi).toBe(0);
  });
});

describe("computeRoi — guard divisions", () => {
  it("zero purchase price returns zero CoC instead of NaN", () => {
    const r = computeRoi({
      purchase: 0,
      downPaymentPct: 100,
      rehab: 0,
      monthlyRent: 2000,
      monthlyExpenses: 500,
      ratePct: 7,
      termYears: 30,
    });
    expect(Number.isFinite(r.cashOnCashReturn)).toBe(true);
    expect(r.capRate).toBe(0);
  });
});

describe("Strategy Lab — Quick Read reveal parity with lane scoring", () => {
  // The "How we got this number" reveal in Quick Read replays a small
  // arithmetic chain that MUST land on the same number the lane scorer
  // surfaced as economics.primaryValue. These tests pin the formulas the
  // reveal uses (see quickMath in client/src/pages/strategy-lab.tsx) against
  // the live engine output, so a refactor to lanes.ts cannot silently drift
  // the reveal away from the displayed metric.
  //
  // Lane formulas pinned here (must match lanes.ts):
  //   BRRRR        cashLeft = max(0, askingPrice + rehab − ARV × 0.75)
  //   rental_hold  monthlyCashFlow = base.annualCashFlow / 12

  it("BRRRR reveal cash-left math matches scoreBrrrr output", async () => {
    const { runStrategyLab } = await import("@shared/strategy-lab");
    const snap = runStrategyLab(
      {
        askingPrice: 200_000,
        arvEstimate: 300_000,
        rehabBudget: 40_000,
        marketRent: 2_400,
        sqft: 1_400,
        condition: "moderate",
      },
      { comps: [] },
    );
    const brrrr = snap.lanes.find((l) => l.lane === "brrrr");
    expect(brrrr).toBeDefined();
    // Reveal arithmetic (mirrors strategy-lab.tsx quickMath for BRRRR):
    const totalIn = 200_000 + 40_000;
    const refi = 300_000 * 0.75;
    const cashLeftReveal = Math.max(0, totalIn - refi);
    expect(cashLeftReveal).toBe(15_000);
    // Lane scorer used the same formula → primaryValue must display $15,000.
    expect(brrrr!.economics?.primaryValue).toContain("15,000");
  });

  it("Rental-hold reveal monthly cash flow matches base.annualCashFlow / 12", async () => {
    const { runStrategyLab } = await import("@shared/strategy-lab");
    const snap = runStrategyLab(
      {
        askingPrice: 350_000,
        arvEstimate: 380_000,
        rehabBudget: 0,
        marketRent: 3_000,
        sqft: 1_600,
        condition: "turnkey",
      },
      { comps: [] },
    );
    const expectedMonthly = Math.round(snap.scenarios.base.annualCashFlow / 12);
    // Find the lane whose primaryMetric is "Monthly cash flow" (rental_hold).
    const rental = snap.lanes.find((l) => l.economics?.primaryMetric === "Monthly cash flow");
    expect(rental).toBeDefined();
    // fmtMonthly in lanes.ts produces e.g. "$1,234/mo". Parse the dollars
    // out and confirm they match the reveal's annualCashFlow / 12 chain.
    const numeric = Number((rental!.economics!.primaryValue || "").replace(/[^0-9-]/g, ""));
    expect(Math.abs(numeric - expectedMonthly)).toBeLessThanOrEqual(1);
  });
});

describe("computeWholesale — negative MAO scenarios", () => {
  it("MAO can go negative but maxOfferWithFee floors at zero", () => {
    const r = computeWholesale({
      arv: 200_000,
      rehab: 180_000,
      buyerProfitPct: 25,
      closingCostPct: 6,
      holding: 0,
      assignmentFee: 10_000,
    });
    expect(Number.isFinite(r.mao)).toBe(true);
    expect(r.maxOfferWithFee).toBeGreaterThanOrEqual(0);
    expect(r.dealViability).toBe("not_viable");
  });
});
