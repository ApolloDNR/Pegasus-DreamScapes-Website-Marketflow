/**
 * Strategy Lab — calculator adapters.
 *
 * Pure functions that produce the exact result objects the existing
 * `/calculators` UI consumes, computed via the shared engine primitives
 * (`shared/lib/calculator-math` and the strategy-lab math units). The
 * legacy calculators are now thin renderers — they pull state from
 * controlled inputs, hand it to one of these adapters, and render the
 * returned object. Numbers on screen must not change vs the prior
 * inline math; the parity test suite locks this contract.
 */

import {
  monthlyPayment,
} from "../lib/calculator-math";

// ── ARV Calculator ────────────────────────────────────────────────────

export interface ArvCalcInputs {
  purchase: number;
  rehab: number;
  arv: number;
  holding: number;
  closingPercent: number; // % of ARV
}
export interface ArvCalcResult {
  totalInvestment: number;
  potentialProfit: number;
  netProfit: number;
  roi: number;
  seventyPercentRule: number;
  meetsRule: boolean;
}
export function computeArv(i: ArvCalcInputs): ArvCalcResult {
  const closingAmount = i.arv * (i.closingPercent / 100);
  const totalInvestment = i.purchase + i.rehab + i.holding;
  const potentialProfit = i.arv - totalInvestment;
  const netProfit = potentialProfit - closingAmount;
  const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
  const seventyPercentRule = i.arv * 0.7 - i.rehab;
  const meetsRule = i.purchase <= seventyPercentRule;
  return { totalInvestment, potentialProfit, netProfit, roi, seventyPercentRule, meetsRule };
}

// ── ROI Calculator ────────────────────────────────────────────────────

export interface RoiCalcInputs {
  purchase: number;
  downPaymentPct: number;
  rehab: number;
  monthlyRent: number;
  monthlyExpenses: number;
  ratePct: number;
  termYears: number;
}
export interface RoiCalcResult {
  downPaymentAmount: number;
  loanAmount: number;
  monthlyMortgage: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  totalCashInvested: number;
  cashOnCashReturn: number;
  capRate: number;
}
export function computeRoi(i: RoiCalcInputs): RoiCalcResult {
  const downPaymentAmount = i.purchase * (i.downPaymentPct / 100);
  const loanAmount = i.purchase - downPaymentAmount;
  const monthlyMortgage = loanAmount > 0
    ? monthlyPayment(loanAmount, i.ratePct, i.termYears)
    : 0;
  const monthlyCashFlow = i.monthlyRent - i.monthlyExpenses - monthlyMortgage;
  const annualCashFlow = monthlyCashFlow * 12;
  const totalCashInvested = downPaymentAmount + i.rehab;
  const cashOnCashReturn = totalCashInvested > 0
    ? (annualCashFlow / totalCashInvested) * 100
    : 0;
  const annualNoi = (i.monthlyRent - i.monthlyExpenses) * 12;
  const capRate = i.purchase > 0 ? (annualNoi / i.purchase) * 100 : 0;
  return {
    downPaymentAmount,
    loanAmount,
    monthlyMortgage,
    monthlyCashFlow,
    annualCashFlow,
    totalCashInvested,
    cashOnCashReturn,
    capRate,
  };
}

// ── BRRRR Calculator ──────────────────────────────────────────────────

export interface BrrrrCalcInputs {
  purchase: number;
  rehab: number;
  arv: number;
  monthlyRent: number;
  monthlyExpenses: number;
  refinanceLtvPct: number;
  refinanceRatePct: number;
}
export interface BrrrrCalcResult {
  totalCashIn: number;
  refinanceValue: number;
  cashBack: number;
  cashLeftInDeal: number;
  monthlyMortgage: number;
  monthlyCashFlow: number;
  cashOnCash: number;
  infiniteReturn: boolean;
}
export function computeBrrrr(i: BrrrrCalcInputs): BrrrrCalcResult {
  const totalCashIn = i.purchase + i.rehab;
  const refinanceValue = i.arv * (i.refinanceLtvPct / 100);
  const cashBack = refinanceValue;
  const cashLeftInDeal = Math.max(0, totalCashIn - cashBack);
  const monthlyMortgage = refinanceValue > 0
    ? monthlyPayment(refinanceValue, i.refinanceRatePct, 30)
    : 0;
  const monthlyCashFlow = i.monthlyRent - i.monthlyExpenses - monthlyMortgage;
  const annualCashFlow = monthlyCashFlow * 12;
  const cashOnCash = cashLeftInDeal > 0
    ? (annualCashFlow / cashLeftInDeal) * 100
    : 0;
  const infiniteReturn = cashLeftInDeal <= 0 && monthlyCashFlow > 0;
  return {
    totalCashIn,
    refinanceValue,
    cashBack,
    cashLeftInDeal,
    monthlyMortgage,
    monthlyCashFlow,
    cashOnCash,
    infiniteReturn,
  };
}

// ── Cash Flow Calculator ──────────────────────────────────────────────

export interface CashFlowCalcInputs {
  grossRent: number;
  vacancyPercent: number;
  propertyTax: number;
  insurance: number;
  maintenance: number;
  managementPercent: number;
  utilities: number;
  mortgage: number;
  otherExpenses: number;
}
export interface CashFlowCalcResult {
  effectiveGrossIncome: number;
  totalExpenses: number;
  noi: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  expenseRatio: number;
  cashFlowPerUnit: number;
}
export function computeCashFlow(i: CashFlowCalcInputs): CashFlowCalcResult {
  const vacancyLoss = i.grossRent * (i.vacancyPercent / 100);
  const effectiveGrossIncome = i.grossRent - vacancyLoss;
  const managementCost = i.grossRent * (i.managementPercent / 100);
  const operatingExpenses =
    i.propertyTax + i.insurance + i.maintenance + managementCost + i.utilities + i.otherExpenses;
  const noi = effectiveGrossIncome - operatingExpenses;
  const monthlyCashFlow = noi - i.mortgage;
  const annualCashFlow = monthlyCashFlow * 12;
  const expenseRatio = i.grossRent > 0 ? (operatingExpenses / i.grossRent) * 100 : 0;
  return {
    effectiveGrossIncome,
    totalExpenses: operatingExpenses + i.mortgage,
    noi,
    monthlyCashFlow,
    annualCashFlow,
    expenseRatio,
    cashFlowPerUnit: monthlyCashFlow,
  };
}

// ── Wholesale Calculator ──────────────────────────────────────────────

export interface WholesaleCalcInputs {
  arv: number;
  rehab: number;
  buyerProfitPct: number;
  closingCostPct: number;
  holding: number;
  assignmentFee: number;
}
export type WholesaleViability = "great" | "good" | "marginal" | "not_viable";
export interface WholesaleCalcResult {
  mao: number;
  buyerExpectedProfit: number;
  maxOfferWithFee: number;
  dealViability: WholesaleViability;
  netSpread: number;
  assignmentFeePercent: number;
}
export function computeWholesale(i: WholesaleCalcInputs): WholesaleCalcResult {
  const closingAmount = i.arv * (i.closingCostPct / 100);
  const buyerExpectedProfit = i.arv * (i.buyerProfitPct / 100);
  const mao = i.arv - i.rehab - i.holding - closingAmount - buyerExpectedProfit;
  const maxOfferWithFee = Math.max(0, mao - i.assignmentFee);
  const netSpread = mao - i.assignmentFee;
  const assignmentFeePercent = mao > 0 ? (i.assignmentFee / mao) * 100 : 0;
  let dealViability: WholesaleViability = "not_viable";
  if (mao > 0) {
    if (i.assignmentFee === 0 && mao > 0) {
      dealViability = "good";
    } else if (i.assignmentFee >= 10000 && netSpread >= 0 && assignmentFeePercent <= 40) {
      dealViability = "great";
    } else if (i.assignmentFee >= 5000 && netSpread >= 0 && assignmentFeePercent <= 60) {
      dealViability = "good";
    } else if (netSpread >= 0 && i.assignmentFee > 0) {
      dealViability = "marginal";
    }
  }
  return {
    mao,
    buyerExpectedProfit,
    maxOfferWithFee,
    dealViability,
    netSpread,
    assignmentFeePercent,
  };
}
