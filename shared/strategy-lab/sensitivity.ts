/**
 * Strategy Lab — sensitivity grids and breakeven solvers.
 *
 * Per-lane 2-axis grids:
 *   - rental_hold / brrrr: Rent (rows) × Price (cols) → monthly cash flow
 *   - flip / wholetail:    ARV (rows) × Rehab (cols) → net profit
 *   - wholesale:           MAO (rows) × Assignment fee (cols) → net spread
 *
 * Breakevens use bisection where closed form is awkward.
 */

import {
  breakevenPriceAtCap,
  breakevenRate,
  breakevenRent as breakevenRentMonthly,
  monthlyPayment,
} from "../lib/calculator-math";
import type {
  BreakevenSet,
  PropertyInput,
  ScenarioRun,
  SensitivityGrid,
  StrategyLane,
} from "./types";

interface BuildArgs {
  lane: StrategyLane;
  property: PropertyInput;
  rent: number;
  rehab: number;
  arv: number;
  loanAmount: number;
  ratePct: number;
  termYears: number;
  monthlyOpex: number;
  base: ScenarioRun;
}

function range(center: number, step: number, count = 5): number[] {
  const half = Math.floor(count / 2);
  const out: number[] = [];
  for (let i = -half; i <= half; i++) out.push(Math.max(0, center + i * step));
  return out;
}

function brrrrRefiRentGrid(args: BuildArgs): SensitivityGrid {
  // BRRRR cash-left-in: lower is better, negative = pulled all capital out.
  // X axis = post-rehab Refi Value (i.e. ARV the appraiser blesses).
  // Y axis = monthly rent achieved post-rehab (DSCR gating + cash flow).
  // Cell  = cash left in deal = (asking + rehab) − refiCashOut, where
  //         refiCashOut = min(75% LTV on refi value, DSCR-supported balance).
  const refiLtv = 0.75;
  const targetDscr = 1.20;
  const refis = range(args.arv, Math.max(5000, Math.round(args.arv * 0.025)), 5);
  const rents = range(args.rent, Math.max(50, Math.round(args.rent * 0.05)), 5);
  const cells: number[] = [];
  let baseFails = false;
  const allIn = args.property.askingPrice + args.rehab;
  for (const r of rents) {
    for (const refi of refis) {
      // DSCR-supported max annual debt service at target rent and lane opex.
      const annualNoi = (r - args.monthlyOpex) * 12;
      const maxAnnualDebt = annualNoi > 0 ? annualNoi / targetDscr : 0;
      // Approximate max balance from monthlyPayment: invert via brute search
      // capped at the LTV ceiling.
      const ltvBalance = refi * refiLtv;
      // Solve loan amount L such that monthlyPayment(L,rate,term)*12 = maxAnnualDebt.
      // Closed-form: L = monthlyPayment_inverse — we have no closed-form helper,
      // so derive from amortization formula directly.
      const i = args.ratePct / 100 / 12;
      const n = args.termYears * 12;
      const dscrBalance = i > 0 && maxAnnualDebt > 0
        ? (maxAnnualDebt / 12) * (1 - Math.pow(1 + i, -n)) / i
        : maxAnnualDebt * args.termYears;
      const refiCashOut = Math.min(ltvBalance, Math.max(0, dscrBalance));
      const cashLeftIn = Math.round(allIn - refiCashOut);
      cells.push(cashLeftIn);
      if (Math.abs(refi - args.arv) < 1 && Math.abs(r - args.rent) < 1 && cashLeftIn > 0) {
        baseFails = true;
      }
    }
  }
  return {
    lane: args.lane,
    xAxis: { label: "Refi appraised value", unit: "currency", values: refis },
    yAxis: { label: "Monthly rent", unit: "currency", values: rents },
    cells,
    metric: "cash_left_in",
    baseFails,
  };
}

function rentPriceGrid(args: BuildArgs): SensitivityGrid {
  const ltvPct = 75;
  const rents = range(args.rent, Math.max(50, Math.round(args.rent * 0.05)), 5);
  const prices = range(args.property.askingPrice, Math.max(5000, Math.round(args.property.askingPrice * 0.025)), 5);
  const cells: number[] = [];
  let baseFails = false;
  for (const r of rents) {
    for (const p of prices) {
      const loan = p * (ltvPct / 100);
      const pmt = monthlyPayment(loan, args.ratePct, args.termYears);
      const cf = r - args.monthlyOpex - pmt;
      cells.push(Math.round(cf));
      if (Math.abs(p - args.property.askingPrice) < 1 && Math.abs(r - args.rent) < 1 && cf < 0) {
        baseFails = true;
      }
    }
  }
  return {
    lane: args.lane,
    xAxis: { label: "Purchase price", unit: "currency", values: prices },
    yAxis: { label: "Monthly rent", unit: "currency", values: rents },
    cells,
    metric: "monthly_cash_flow",
    baseFails,
  };
}

function wholesaleGrid(args: BuildArgs): SensitivityGrid {
  // Wholesale spread: assignment fee = MAO − seller asking price.
  // X axis = MAO offered to seller (the lever wholesalers actually negotiate).
  // Y axis = assignment fee charged to end-buyer.
  // Cell = MAO − askingPrice − assignmentFee (negative = no spread, walk away).
  const buyerProfitPct = 0.15; // typical end-buyer margin held back from MAO calc
  const closingPct = 0.06;
  const baseMao = Math.max(0, args.arv * (1 - buyerProfitPct - closingPct) - args.rehab);
  const baseFee = Math.max(2500, Math.round(baseMao * 0.05));
  const maos = range(baseMao, Math.max(2500, Math.round(baseMao * 0.05)), 5);
  const fees = range(baseFee, Math.max(1000, Math.round(baseFee * 0.25)), 5);
  const cells: number[] = [];
  let baseFails = false;
  for (const fee of fees) {
    for (const mao of maos) {
      const spread = mao - args.property.askingPrice - fee;
      cells.push(Math.round(spread));
      if (Math.abs(mao - baseMao) < 1 && Math.abs(fee - baseFee) < 1 && spread < 0) {
        baseFails = true;
      }
    }
  }
  return {
    lane: args.lane,
    xAxis: { label: "Maximum Allowable Offer", unit: "currency", values: maos },
    yAxis: { label: "Assignment fee", unit: "currency", values: fees },
    cells,
    metric: "net_profit",
    baseFails,
  };
}

function groundUpGrid(args: BuildArgs): SensitivityGrid {
  // Ground-up build economics: net profit at base ARV as a function of
  //   X axis = hard build cost per square foot
  //   Y axis = land cost (acquisition + entitlement)
  // Cell  = ARV − land − (buildPerSqft × sqft) − softCosts − closing
  // Soft costs (design, permits, financing carry) modeled at 12% of hard
  // build, closing at 6% of ARV. Build sqft falls back to a typical
  // 1,800 sqft new-construction footprint when subject sqft is missing.
  const closingPct = 0.06;
  const softCostPct = 0.12;
  const buildSqft = args.property.sqft && args.property.sqft > 0 ? args.property.sqft : 1800;
  const baseBuildPerSqft = args.rehab > 0 && buildSqft > 0
    ? Math.max(50, Math.round(args.rehab / buildSqft))
    : 225;
  const baseLand = Math.max(0, args.property.askingPrice);
  const buildPerSqfts = range(
    baseBuildPerSqft,
    Math.max(15, Math.round(baseBuildPerSqft * 0.1)),
    5,
  );
  const lands = range(
    baseLand,
    Math.max(5000, Math.round(baseLand * 0.05)),
    5,
  );
  const cells: number[] = [];
  let baseFails = false;
  for (const land of lands) {
    for (const perSqft of buildPerSqfts) {
      const hardBuild = perSqft * buildSqft;
      const softCosts = hardBuild * softCostPct;
      const closing = args.arv * closingPct;
      const profit = args.arv - land - hardBuild - softCosts - closing;
      cells.push(Math.round(profit));
      if (
        Math.abs(land - baseLand) < 1 &&
        Math.abs(perSqft - baseBuildPerSqft) < 1 &&
        profit < 0
      ) {
        baseFails = true;
      }
    }
  }
  return {
    lane: args.lane,
    xAxis: { label: "Build cost per sqft", unit: "currency", values: buildPerSqfts },
    yAxis: { label: "Land cost", unit: "currency", values: lands },
    cells,
    metric: "net_profit",
    baseFails,
  };
}

function arvRehabGrid(args: BuildArgs): SensitivityGrid {
  const buyerProfitPct = 0.12;
  const closingPct = 0.06;
  const arvs = range(args.arv, Math.max(5000, Math.round(args.arv * 0.025)), 5);
  const rehabs = range(args.rehab, Math.max(5000, Math.round(args.rehab * 0.1)), 5);
  const cells: number[] = [];
  let baseFails = false;
  for (const arv of arvs) {
    for (const rehab of rehabs) {
      const closing = arv * closingPct;
      const profit = arv - args.property.askingPrice - rehab - closing - arv * buyerProfitPct;
      cells.push(Math.round(profit));
      if (Math.abs(arv - args.arv) < 1 && Math.abs(rehab - args.rehab) < 1 && profit < 0) {
        baseFails = true;
      }
    }
  }
  return {
    lane: args.lane,
    xAxis: { label: "Rehab budget", unit: "currency", values: rehabs },
    yAxis: { label: "After-Repair Value", unit: "currency", values: arvs },
    cells,
    metric: "net_profit",
    baseFails,
  };
}

export function buildSensitivityGrid(args: BuildArgs): SensitivityGrid {
  switch (args.lane) {
    case "flip":
    case "wholetail":
      return arvRehabGrid(args);
    case "wholesale":
      return wholesaleGrid(args);
    case "brrrr":
      return brrrrRefiRentGrid(args);
    case "ground_up":
      return groundUpGrid(args);
    default:
      return rentPriceGrid(args);
  }
}

export function buildBreakevens(args: BuildArgs): BreakevenSet {
  const out: BreakevenSet = {};
  const debtMonthly = monthlyPayment(args.loanAmount, args.ratePct, args.termYears);
  out.breakevenRentMonthly = Math.round(breakevenRentMonthly(debtMonthly, args.monthlyOpex));
  if (args.base.noiAnnual > 0) {
    out.breakevenPriceForCap5 = Math.round(breakevenPriceAtCap(args.base.noiAnnual, 5));
    out.breakevenPriceForCap6 = Math.round(breakevenPriceAtCap(args.base.noiAnnual, 6));
  }
  if (args.rent > 0 && args.loanAmount > 0) {
    out.breakevenMortgageRatePct = Number(
      breakevenRate({
        rent: args.rent,
        monthlyOpex: args.monthlyOpex,
        loanAmount: args.loanAmount,
        termYears: args.termYears,
      }).toFixed(2),
    );
  }
  if (args.arv > 0) {
    // Highest rehab the deal can absorb at base ARV with 75% all-in target.
    const target = args.arv * 0.75;
    out.breakevenRehabCap = Math.round(Math.max(0, target - args.property.askingPrice));
    // Lowest ARV that still leaves 10% net margin after rehab + 6% closing.
    const minArv = (args.property.askingPrice + args.rehab) / (1 - 0.06 - 0.1);
    out.breakevenArvFloor = Math.round(minArv);
  }
  // Breakeven hold months — how long the deal can absorb monthly carry
  // (debt service + opex − rent) before NOI gains are erased by carry.
  // For a positive-cashflow base case the engine surfaces the maximum
  // hold horizon implied by the base scenario's annual cash flow, capped
  // at 240 months. For a negative base case the hold is 0.
  if (args.base.annualCashFlow > 0 && args.monthlyOpex >= 0) {
    const monthlyCash = args.base.annualCashFlow / 12;
    if (monthlyCash > 0) {
      // Months until cumulative cash flow equals the equity in the deal
      // (asking price + rehab). This is the conservative "hold ceiling".
      const equity = Math.max(0, args.property.askingPrice + args.rehab);
      out.breakevenHoldMonths = Math.min(240, Math.round(equity / monthlyCash));
    }
  } else if (args.base.annualCashFlow < 0) {
    // Negative carry deal — months until accumulated burn equals 10% of
    // asking price (a common stress threshold). Floors at 0.
    const monthlyBurn = -args.base.annualCashFlow / 12;
    if (monthlyBurn > 0) {
      const cushion = args.property.askingPrice * 0.1;
      out.breakevenHoldMonths = Math.max(0, Math.round(cushion / monthlyBurn));
    } else {
      out.breakevenHoldMonths = 0;
    }
  }
  return out;
}
