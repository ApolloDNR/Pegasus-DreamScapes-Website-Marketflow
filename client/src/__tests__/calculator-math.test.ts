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
} from "@/lib/calculator-math";

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
