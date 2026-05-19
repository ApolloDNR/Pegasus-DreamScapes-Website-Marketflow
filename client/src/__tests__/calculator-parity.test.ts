/**
 * Calculator parity test — locks numerical equivalence between the engine
 * adapters (the new "thin wrapper" path) and the historical inline math
 * each calculator on /calculators used to perform. Any drift in the
 * adapter layer must be intentional and accompanied by an updated
 * fixture here.
 */

import { describe, it, expect } from "vitest";
import {
  computeArv,
  computeRoi,
  computeBrrrr,
  computeCashFlow,
  computeWholesale,
} from "@shared/strategy-lab/calculator-adapters";
import {
  monthlyPayment,
  housingAffordability28_36,
  holdingCostStack,
  ownVsRentScenarios,
} from "@shared/lib/calculator-math";

describe("Calculator parity (thin-wrapper guarantee)", () => {
  it("ARV adapter == historical inline math (snapshot fixture)", () => {
    const r = computeArv({
      purchase: 200_000,
      rehab: 50_000,
      arv: 400_000,
      holding: 5_000,
      closingPercent: 6,
    });
    // Exact values that the prior inline calc emitted.
    expect(r.totalInvestment).toBe(255_000);
    expect(Math.round(r.netProfit)).toBe(121_000); // 400k − 255k − 24k
    expect(Math.round(r.roi * 100) / 100).toBeCloseTo(47.45, 1);
    expect(r.seventyPercentRule).toBe(230_000);
    expect(r.meetsRule).toBe(true);
  });

  it("ROI adapter == historical inline math (mortgage via shared monthlyPayment)", () => {
    const r = computeRoi({
      purchase: 300_000,
      downPaymentPct: 25,
      rehab: 20_000,
      monthlyRent: 2_500,
      monthlyExpenses: 600,
      ratePct: 7.5,
      termYears: 30,
    });
    expect(r.downPaymentAmount).toBe(75_000);
    expect(r.loanAmount).toBe(225_000);
    // Same closed-form amortization as before refactor.
    expect(r.monthlyMortgage).toBeCloseTo(monthlyPayment(225_000, 7.5, 30), 4);
    expect(r.monthlyCashFlow).toBeCloseTo(2500 - 600 - r.monthlyMortgage, 4);
    expect(r.annualCashFlow).toBeCloseTo(r.monthlyCashFlow * 12, 4);
    expect(r.totalCashInvested).toBe(95_000);
    expect(r.capRate).toBeCloseTo(((2500 - 600) * 12 / 300_000) * 100, 4);
  });

  it("BRRRR adapter == historical inline math, infinite-return path holds", () => {
    const r = computeBrrrr({
      purchase: 150_000,
      rehab: 50_000,
      arv: 300_000,
      monthlyRent: 2_400,
      monthlyExpenses: 500,
      refinanceLtvPct: 75,
      refinanceRatePct: 7.0,
    });
    expect(r.totalCashIn).toBe(200_000);
    expect(r.refinanceValue).toBe(225_000);
    expect(r.cashLeftInDeal).toBe(0); // got 225k back on 200k in
    expect(r.monthlyMortgage).toBeCloseTo(monthlyPayment(225_000, 7.0, 30), 4);
    expect(r.infiniteReturn).toBe(r.monthlyCashFlow > 0);
  });

  it("CashFlow adapter == historical inline math", () => {
    const r = computeCashFlow({
      grossRent: 3_000,
      vacancyPercent: 5,
      propertyTax: 350,
      insurance: 120,
      maintenance: 100,
      managementPercent: 10,
      utilities: 0,
      mortgage: 1_400,
      otherExpenses: 0,
    });
    // EGI = 3000 * 0.95 = 2850; mgmt = 300; opex = 350+120+100+300+0+0 = 870
    expect(r.effectiveGrossIncome).toBeCloseTo(2850, 4);
    expect(r.noi).toBeCloseTo(2850 - 870, 4); // 1980
    expect(r.monthlyCashFlow).toBeCloseTo(1980 - 1400, 4); // 580
    expect(r.annualCashFlow).toBeCloseTo(580 * 12, 4);
    expect(r.totalExpenses).toBeCloseTo(870 + 1400, 4);
    expect(r.expenseRatio).toBeCloseTo((870 / 3000) * 100, 4);
  });

  it("Wholesale adapter == historical inline math, viability bands match", () => {
    const r = computeWholesale({
      arv: 400_000,
      rehab: 50_000,
      buyerProfitPct: 25,
      closingCostPct: 6,
      holding: 5_000,
      assignmentFee: 12_000,
    });
    // closing = 24k; buyerProfit = 100k; mao = 400 − 50 − 5 − 24 − 100 = 221k
    expect(r.mao).toBe(221_000);
    expect(r.buyerExpectedProfit).toBe(100_000);
    expect(r.maxOfferWithFee).toBe(209_000);
    expect(r.netSpread).toBe(209_000);
    expect(r.assignmentFeePercent).toBeCloseTo((12000 / 221000) * 100, 4);
    expect(r.dealViability).toBe("great"); // fee ≥ 10k, spread ≥ 0, fee% ≤ 40
  });

  it("PITI calculator path uses shared housingAffordability28_36 (smoke)", () => {
    // The PITI calculator delegates 100% to the shared primitive — this
    // smoke check confirms the function returns the expected shape.
    const a = housingAffordability28_36({
      grossAnnualIncome: 120_000,
      monthlyDebts: 400,
      annualRatePct: 7,
      termYears: 30,
      downPaymentPct: 20,
      monthlyTaxIns: 300,
    });
    expect(a.maxPurchasePrice).toBeGreaterThan(0);
    expect(a.maxLoanAmount).toBeGreaterThan(0);
    expect(a.bindingMaxMonthly).toBeGreaterThan(0);
  });

  it("Hard money calculator path uses shared holdingCostStack (smoke)", () => {
    const s = holdingCostStack({
      purchase: 200_000,
      rehab: 50_000,
      ltcPct: 85,
      pointsPct: 2,
      ratePct: 12,
      monthsHeld: 6,
      originationFee: 0,
      annualTaxPct: 1.2,
      monthlyInsurance: 125,
      monthlyUtilities: 150,
      sellingCostPct: 7,
    });
    expect(s.totalHoldingCost).toBeGreaterThan(0);
    expect(s.breakevenSalePrice).toBeGreaterThan(200_000);
    expect(s.totalCashIntoDeal).toBeGreaterThan(0);
  });

  it("Own vs Rent calculator path uses shared ownVsRentScenarios (smoke)", () => {
    const out = ownVsRentScenarios({
      homePrice: 500_000,
      downPaymentPct: 20,
      mortgageRatePct: 7,
      termYears: 30,
      monthlyRent: 2_400,
      monthlyOwnExtra: 850,
      rentGrowthPct: 3,
      investmentReturnPct: 6,
      years: 15,
    });
    // Three appreciation paths → three scenario rows.
    expect(out.length).toBe(3);
    for (const s of out) {
      expect(s.appreciationPct).toBeGreaterThan(0);
      expect(Array.isArray(s.series)).toBe(true);
      expect(s.series.length).toBeGreaterThan(0);
    }
  });
});
