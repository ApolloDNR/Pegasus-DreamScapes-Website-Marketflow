/**
 * Calculator math primitives.
 * Pure functions, no React. All inputs are numbers, all outputs are numbers
 * or simple records. Used by every calculator and unit-tested in
 * client/src/__tests__/calculator-math.test.ts.
 */

// ──────────────────────────────────────────────────────────────────────────
// Mortgage / amortization
// ──────────────────────────────────────────────────────────────────────────

/**
 * Standard fixed-rate monthly mortgage payment.
 * @param principal Loan amount in dollars
 * @param annualRatePct Annual interest rate as a percent (e.g. 7.5)
 * @param termYears Loan term in years
 */
export function monthlyPayment(
  principal: number,
  annualRatePct: number,
  termYears: number,
): number {
  if (principal <= 0 || termYears <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

/**
 * Interest-only monthly payment (used for hard money / bridge).
 */
export function interestOnlyMonthly(principal: number, annualRatePct: number): number {
  if (principal <= 0 || annualRatePct <= 0) return 0;
  return (principal * (annualRatePct / 100)) / 12;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
}

/**
 * Build a full amortization schedule. Returns one row per month.
 */
export function amortizationSchedule(
  principal: number,
  annualRatePct: number,
  termYears: number,
): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  if (principal <= 0 || termYears <= 0) return rows;
  const r = annualRatePct / 100 / 12;
  const n = termYears * 12;
  const payment = monthlyPayment(principal, annualRatePct, termYears);
  let balance = principal;
  let cumP = 0;
  let cumI = 0;
  for (let m = 1; m <= n; m++) {
    const interest = balance * r;
    const principalPaid = Math.min(payment - interest, balance);
    balance = Math.max(0, balance - principalPaid);
    cumP += principalPaid;
    cumI += interest;
    rows.push({
      month: m,
      payment,
      principal: principalPaid,
      interest,
      balance,
      cumulativePrincipal: cumP,
      cumulativeInterest: cumI,
    });
  }
  return rows;
}

// ──────────────────────────────────────────────────────────────────────────
// Cash flow / return helpers
// ──────────────────────────────────────────────────────────────────────────

export function noiAnnual(grossRentMonthly: number, monthlyExpenses: number): number {
  return Math.max(0, (grossRentMonthly - monthlyExpenses) * 12);
}

export function capRate(annualNOI: number, propertyValue: number): number {
  if (propertyValue <= 0) return 0;
  return (annualNOI / propertyValue) * 100;
}

export function cashOnCash(annualCashFlow: number, totalCashInvested: number): number {
  if (totalCashInvested <= 0) return 0;
  return (annualCashFlow / totalCashInvested) * 100;
}

export function dscr(annualNOI: number, annualDebtService: number): number {
  if (annualDebtService <= 0) return 0;
  return annualNOI / annualDebtService;
}

// ──────────────────────────────────────────────────────────────────────────
// Sensitivity matrix (rent × rate)
// ──────────────────────────────────────────────────────────────────────────

export interface SensitivityCell {
  rent: number;
  rate: number;
  monthlyCashFlow: number;
}

/**
 * Build a 5x5 sensitivity matrix varying rent (rows) and interest rate (columns)
 * around their base values. Step is the +/- absolute delta per axis index.
 */
export function buildSensitivityMatrix(args: {
  baseRent: number;
  baseRate: number;
  loanAmount: number;
  termYears: number;
  monthlyOpex: number;
  rentStep?: number; // dollars
  rateStep?: number; // percentage points
  size?: number;     // odd number, default 5
}): SensitivityCell[][] {
  const size = args.size ?? 5;
  const half = Math.floor(size / 2);
  const rentStep = args.rentStep ?? 100;
  const rateStep = args.rateStep ?? 0.5;
  const matrix: SensitivityCell[][] = [];
  for (let i = -half; i <= half; i++) {
    const row: SensitivityCell[] = [];
    const rent = Math.max(0, args.baseRent + i * rentStep);
    for (let j = -half; j <= half; j++) {
      const rate = Math.max(0.01, args.baseRate + j * rateStep);
      const pmt = monthlyPayment(args.loanAmount, rate, args.termYears);
      const cf = rent - args.monthlyOpex - pmt;
      row.push({ rent, rate, monthlyCashFlow: cf });
    }
    matrix.push(row);
  }
  return matrix;
}

// ──────────────────────────────────────────────────────────────────────────
// Breakeven solvers
// ──────────────────────────────────────────────────────────────────────────

/**
 * Minimum monthly rent required for $0 cash flow given debt service + opex.
 */
export function breakevenRent(monthlyDebtService: number, monthlyOpex: number): number {
  return Math.max(0, monthlyDebtService + monthlyOpex);
}

/**
 * Highest interest rate the deal can absorb at the given rent and term while
 * still producing non-negative cash flow. Returns 0 if infeasible.
 * Uses bisection to ~0.01% precision.
 */
export function breakevenRate(args: {
  rent: number;
  monthlyOpex: number;
  loanAmount: number;
  termYears: number;
}): number {
  const { rent, monthlyOpex, loanAmount, termYears } = args;
  const target = rent - monthlyOpex; // max payment we can afford
  if (target <= 0 || loanAmount <= 0) return 0;
  let lo = 0.01;
  let hi = 25;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const pmt = monthlyPayment(loanAmount, mid, termYears);
    if (pmt > target) hi = mid;
    else lo = mid;
  }
  return lo;
}

/**
 * Maximum vacancy rate (as percent) the deal absorbs before negative cash flow.
 */
export function breakevenVacancy(args: {
  grossRent: number;
  monthlyOpex: number;
  monthlyDebtService: number;
}): number {
  const { grossRent, monthlyOpex, monthlyDebtService } = args;
  if (grossRent <= 0) return 0;
  const headroom = grossRent - monthlyOpex - monthlyDebtService;
  if (headroom <= 0) return 0;
  return Math.min(100, (headroom / grossRent) * 100);
}

// ──────────────────────────────────────────────────────────────────────────
// Exit projection (5/10 year hold)
// ──────────────────────────────────────────────────────────────────────────

export interface ExitYear {
  year: number;
  propertyValue: number;
  loanBalance: number;
  equity: number;
  cumulativeCashFlow: number;
  totalReturn: number; // equity + cumulative cash flow - initial cash invested
  annualizedReturn: number; // % per year
}

/**
 * Project equity, cash flow, and total return for years 1..maxYear.
 * Uses constant appreciation, rent growth, and expense growth.
 */
export function projectExit(args: {
  initialCashIn: number;
  propertyValue: number;
  loanAmount: number;
  annualRatePct: number;
  termYears: number;
  monthlyRent: number;
  monthlyOpex: number;
  appreciationPct?: number; // annual %
  rentGrowthPct?: number;   // annual %
  opexGrowthPct?: number;   // annual %
  maxYear?: number;
}): ExitYear[] {
  const appreciation = (args.appreciationPct ?? 3) / 100;
  const rentGrowth = (args.rentGrowthPct ?? 3) / 100;
  const opexGrowth = (args.opexGrowthPct ?? 2.5) / 100;
  const maxYear = args.maxYear ?? 10;
  const sched = amortizationSchedule(args.loanAmount, args.annualRatePct, args.termYears);
  const pmt = monthlyPayment(args.loanAmount, args.annualRatePct, args.termYears);
  const out: ExitYear[] = [];
  let cumCF = 0;
  for (let y = 1; y <= maxYear; y++) {
    const value = args.propertyValue * Math.pow(1 + appreciation, y);
    const balanceRow = sched[Math.min(y * 12 - 1, sched.length - 1)];
    const balance = balanceRow ? balanceRow.balance : 0;
    const equity = value - balance;
    const yearRent = args.monthlyRent * Math.pow(1 + rentGrowth, y - 1);
    const yearOpex = args.monthlyOpex * Math.pow(1 + opexGrowth, y - 1);
    const yearCF = (yearRent - yearOpex - pmt) * 12;
    cumCF += yearCF;
    const totalReturn = equity - (args.propertyValue - args.loanAmount) + cumCF;
    const totalGain = totalReturn + args.initialCashIn;
    const annualizedReturn =
      args.initialCashIn > 0
        ? (Math.pow(Math.max(totalGain / args.initialCashIn, 0.0001), 1 / y) - 1) * 100
        : 0;
    out.push({
      year: y,
      propertyValue: value,
      loanBalance: balance,
      equity,
      cumulativeCashFlow: cumCF,
      totalReturn,
      annualizedReturn,
    });
  }
  return out;
}

// ──────────────────────────────────────────────────────────────────────────
// Scenario comparison helper
// ──────────────────────────────────────────────────────────────────────────

export type ScenarioLabel = "Base" | "Stressed" | "Worst";

export const SCENARIO_DELTAS: Record<
  ScenarioLabel,
  { rentMult: number; opexMult: number; rateAdd: number; vacancyAdd: number }
> = {
  Base: { rentMult: 1.0, opexMult: 1.0, rateAdd: 0, vacancyAdd: 0 },
  Stressed: { rentMult: 0.95, opexMult: 1.1, rateAdd: 1.0, vacancyAdd: 3 },
  Worst: { rentMult: 0.9, opexMult: 1.2, rateAdd: 2.0, vacancyAdd: 7 },
};

// ──────────────────────────────────────────────────────────────────────────
// Own vs Rent wealth crossover
// ──────────────────────────────────────────────────────────────────────────

export interface OwnVsRentYear {
  year: number;
  ownNetWorth: number;
  rentNetWorth: number;
}

/**
 * Project net worth under two paths: owning a home vs renting and investing
 * the difference. Crossover year is where ownNetWorth >= rentNetWorth.
 */
export function ownVsRent(args: {
  homePrice: number;
  downPaymentPct: number;
  mortgageRatePct: number;
  termYears: number;
  monthlyRent: number;
  monthlyOwnExtra: number; // taxes + insurance + maint above rent baseline
  appreciationPct: number;
  rentGrowthPct: number;
  investmentReturnPct: number;
  years: number;
}): { series: OwnVsRentYear[]; crossoverYear: number | null } {
  const dp = args.homePrice * (args.downPaymentPct / 100);
  const loan = args.homePrice - dp;
  const pmt = monthlyPayment(loan, args.mortgageRatePct, args.termYears);
  const sched = amortizationSchedule(loan, args.mortgageRatePct, args.termYears);
  const series: OwnVsRentYear[] = [];
  let crossoverYear: number | null = null;
  let rentInvested = dp; // renter starts with same down payment invested
  for (let y = 1; y <= args.years; y++) {
    // Owner: equity = appreciated value − loan balance.
    const value = args.homePrice * Math.pow(1 + args.appreciationPct / 100, y);
    const bal = sched[Math.min(y * 12 - 1, sched.length - 1)]?.balance ?? 0;
    const ownNetWorth = value - bal;
    // Renter: invests dp at investmentReturnPct, plus monthly difference between
    // owner's PITI-extra and rent.
    const yearRent = args.monthlyRent * Math.pow(1 + args.rentGrowthPct / 100, y - 1);
    const ownerMonthly = pmt + args.monthlyOwnExtra;
    const monthlyDiff = ownerMonthly - yearRent; // positive => renter saves
    rentInvested =
      rentInvested * (1 + args.investmentReturnPct / 100) +
      Math.max(0, monthlyDiff) * 12;
    const rentNetWorth = rentInvested;
    series.push({ year: y, ownNetWorth, rentNetWorth });
    if (crossoverYear === null && ownNetWorth >= rentNetWorth) {
      crossoverYear = y;
    }
  }
  return { series, crossoverYear };
}

// ──────────────────────────────────────────────────────────────────────────
// 28/36 housing affordability (PITI calculator)
// ──────────────────────────────────────────────────────────────────────────

export interface AffordabilityResult {
  maxMonthlyHousing28: number;   // 28% gross income → housing only
  maxMonthlyTotal36: number;     // 36% gross income → all debt
  maxMonthlyHousing36Net: number; // (36% gross) − other monthly debts
  bindingMaxMonthly: number;      // min of the two ceilings
  maxLoanAmount: number;          // PV of bindingMaxMonthly @ rate/term
  maxPurchasePrice: number;       // loan + assumed down payment
}

/**
 * 28/36 affordability rule: housing PITI ≤ 28% of gross monthly income;
 * housing + other recurring debts ≤ 36%. Binding ceiling is the minimum.
 * Solves backwards from monthly ceiling to a max loan and max price.
 */
export function housingAffordability28_36(args: {
  grossAnnualIncome: number;
  monthlyDebts: number;          // car / student / cards
  annualRatePct: number;
  termYears: number;
  downPaymentPct: number;
  monthlyTaxIns?: number;        // taxes + insurance + HOA reserve
}): AffordabilityResult {
  const grossMonthly = args.grossAnnualIncome / 12;
  const ceil28 = grossMonthly * 0.28;
  const ceil36 = grossMonthly * 0.36 - args.monthlyDebts;
  const binding = Math.max(0, Math.min(ceil28, ceil36));
  const piAvailable = Math.max(0, binding - (args.monthlyTaxIns ?? 0));
  // Reverse-PMT: solve principal given monthly payment, rate, term.
  const r = args.annualRatePct / 100 / 12;
  const n = args.termYears * 12;
  let maxLoan = 0;
  if (piAvailable > 0 && r > 0) {
    maxLoan = piAvailable * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
  } else if (piAvailable > 0) {
    maxLoan = piAvailable * n;
  }
  const dp = Math.max(0.01, args.downPaymentPct / 100);
  const maxPrice = maxLoan / (1 - dp);
  return {
    maxMonthlyHousing28: ceil28,
    maxMonthlyTotal36: grossMonthly * 0.36,
    maxMonthlyHousing36Net: Math.max(0, ceil36),
    bindingMaxMonthly: binding,
    maxLoanAmount: maxLoan,
    maxPurchasePrice: maxPrice,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Cap-rate-driven price + cash-on-cash rent solvers
// ──────────────────────────────────────────────────────────────────────────

/**
 * Price implied by NOI ÷ desired cap rate. The price at which this NOI
 * yields the target cap rate.
 */
export function breakevenPriceAtCap(annualNOI: number, capPct: number): number {
  if (capPct <= 0) return 0;
  return (annualNOI / (capPct / 100));
}

/**
 * Monthly rent required so annual cash flow ÷ cash-in = target CoC%.
 * Solves: ((rent − opex − debt) * 12) / cashIn = target/100.
 */
export function rentForTargetCoC(args: {
  targetCoCPct: number;
  cashInvested: number;
  monthlyOpex: number;
  monthlyDebtService: number;
}): number {
  if (args.cashInvested <= 0) return 0;
  const requiredAnnualCF = (args.targetCoCPct / 100) * args.cashInvested;
  const requiredMonthlyCF = requiredAnnualCF / 12;
  return Math.max(0, requiredMonthlyCF + args.monthlyOpex + args.monthlyDebtService);
}

// ──────────────────────────────────────────────────────────────────────────
// Rent × Price sensitivity matrix (for BRRRR + Cash Flow)
// ──────────────────────────────────────────────────────────────────────────

export interface PriceRentCell {
  rent: number;
  price: number;
  monthlyCashFlow: number;
}

/**
 * Build a rent-vs-price grid showing monthly cash flow at each intersection.
 * Loan amount scales with price using the supplied LTV. Other terms are held
 * constant. Center column is the asking price; center row the asking rent.
 */
export function buildPriceRentMatrix(args: {
  baseRent: number;
  basePrice: number;
  ltvPct: number;
  annualRatePct: number;
  termYears: number;
  monthlyOpex: number;
  rentStep?: number;
  priceStep?: number;
  size?: number;
}): PriceRentCell[][] {
  const size = args.size ?? 5;
  const half = Math.floor(size / 2);
  const rentStep = args.rentStep ?? 100;
  const priceStep = args.priceStep ?? Math.max(5000, Math.round(args.basePrice * 0.025));
  const matrix: PriceRentCell[][] = [];
  const ltv = Math.max(0, Math.min(1, args.ltvPct / 100));
  for (let i = -half; i <= half; i++) {
    const row: PriceRentCell[] = [];
    const rent = Math.max(0, args.baseRent + i * rentStep);
    for (let j = -half; j <= half; j++) {
      const price = Math.max(1, args.basePrice + j * priceStep);
      const loan = price * ltv;
      const pmt = monthlyPayment(loan, args.annualRatePct, args.termYears);
      row.push({ rent, price, monthlyCashFlow: rent - args.monthlyOpex - pmt });
    }
    matrix.push(row);
  }
  return matrix;
}

// ──────────────────────────────────────────────────────────────────────────
// Exit grid — years (3/5/7/10) × annual appreciation scenarios (2/4/6%).
// Exit value at year N = entry value compounded by appreciation rate.
// ──────────────────────────────────────────────────────────────────────────

export interface ExitGridCell {
  year: number;
  appreciationPct: number;
  propertyValue: number;        // exit value implied by appreciation
  loanBalance: number;
  netProceeds: number;          // value − selling costs − loan balance
  cumulativeCashFlow: number;
  totalReturn: number;
  annualizedReturn: number;
}

export function projectExitGrid(args: {
  initialCashIn: number;
  propertyValue: number;        // entry value
  loanAmount: number;
  annualRatePct: number;
  termYears: number;
  monthlyRent: number;
  monthlyOpex: number;
  rentGrowthPct?: number;       // default 3%
  opexGrowthPct?: number;       // default 2%
  sellingCostPct?: number;      // default 7% (commissions + closing)
  years?: number[];             // default [3,5,7,10]
  appreciationRates?: number[]; // default [2,4,6]
}): ExitGridCell[] {
  const years = args.years ?? [3, 5, 7, 10];
  const rates = args.appreciationRates ?? [2, 4, 6];
  const sellPct = (args.sellingCostPct ?? 7) / 100;
  const cells: ExitGridCell[] = [];
  // Single amortization schedule (independent of appreciation) for the
  // year-N loan balance and cumulative cash flow.
  const baseSeries = projectExit({
    ...args,
    appreciationPct: 0,
    maxYear: Math.max(...years),
  });
  for (const a of rates) {
    for (const y of years) {
      const row = baseSeries.find((s) => s.year === y);
      if (!row) continue;
      const exitValue = args.propertyValue * Math.pow(1 + a / 100, y);
      const sellingCosts = exitValue * sellPct;
      const netProceeds = Math.max(exitValue - sellingCosts - row.loanBalance, 0);
      // Cash flow uses the recomputed debt service so it's consistent with
      // this calculator's loan inputs.
      const cumulativeCashFlow = row.cumulativeCashFlow;
      const totalReturn = netProceeds - args.initialCashIn + cumulativeCashFlow;
      const totalGain = totalReturn + args.initialCashIn;
      const annualized =
        args.initialCashIn > 0
          ? (Math.pow(Math.max(totalGain / args.initialCashIn, 0.0001), 1 / y) - 1) * 100
          : 0;
      cells.push({
        year: y,
        appreciationPct: a,
        propertyValue: exitValue,
        loanBalance: row.loanBalance,
        netProceeds,
        cumulativeCashFlow,
        totalReturn,
        annualizedReturn: annualized,
      });
    }
  }
  return cells;
}

// ──────────────────────────────────────────────────────────────────────────
// Hard money holding-cost stack + breakeven sale price
// ──────────────────────────────────────────────────────────────────────────

export interface HoldingStack {
  loanAmount: number;
  cashRequired: number;
  pointsCost: number;
  originationFee: number;
  monthlyInterest: number;
  totalInterest: number;
  monthlyTaxIns: number;
  totalTaxIns: number;
  monthlyUtilities: number;
  totalUtilities: number;
  totalHoldingCost: number;
  totalCashIntoDeal: number;
  breakevenSalePrice: number;     // covers all-in cost + sale costs
  effectiveAPRpct: number;
}

export function holdingCostStack(args: {
  purchase: number;
  rehab: number;
  ltcPct: number;
  pointsPct: number;
  ratePct: number;
  monthsHeld: number;
  originationFee?: number;
  annualTaxPct?: number;        // % of purchase per year
  monthlyInsurance?: number;
  monthlyUtilities?: number;
  sellingCostPct?: number;      // default 7%
}): HoldingStack {
  const totalCost = args.purchase + args.rehab;
  const ltc = Math.max(0, Math.min(1, args.ltcPct / 100));
  const loan = totalCost * ltc;
  const cashRequired = totalCost - loan;
  const points = loan * (args.pointsPct / 100);
  const orig = args.originationFee ?? 0;
  const monthlyInterest = (loan * (args.ratePct / 100)) / 12;
  const totalInterest = monthlyInterest * args.monthsHeld;
  const monthlyTax = (args.purchase * ((args.annualTaxPct ?? 1.0) / 100)) / 12;
  const monthlyTaxIns = monthlyTax + (args.monthlyInsurance ?? 0);
  const totalTaxIns = monthlyTaxIns * args.monthsHeld;
  const monthlyUtilities = args.monthlyUtilities ?? 0;
  const totalUtilities = monthlyUtilities * args.monthsHeld;
  const totalHolding = points + orig + totalInterest + totalTaxIns + totalUtilities;
  const totalCashInto = cashRequired + totalHolding;
  const sellPct = (args.sellingCostPct ?? 7) / 100;
  // Solve sale price S such that S − S*sellPct − loan − holding = cashRequired
  // (i.e. you walk out with your cash back). S*(1−sellPct) = loan + holding + cashRequired
  const breakevenSale = (loan + totalHolding + cashRequired) / Math.max(0.01, 1 - sellPct);
  const apr =
    loan > 0
      ? ((points + orig + totalInterest) / loan) * (12 / Math.max(1, args.monthsHeld)) * 100
      : 0;
  return {
    loanAmount: loan,
    cashRequired,
    pointsCost: points,
    originationFee: orig,
    monthlyInterest,
    totalInterest,
    monthlyTaxIns,
    totalTaxIns,
    monthlyUtilities,
    totalUtilities,
    totalHoldingCost: totalHolding,
    totalCashIntoDeal: totalCashInto,
    breakevenSalePrice: breakevenSale,
    effectiveAPRpct: apr,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Own vs Rent — three appreciation scenarios
// ──────────────────────────────────────────────────────────────────────────

export interface OwnVsRentScenario {
  appreciationPct: number;
  series: OwnVsRentYear[];
  crossoverYear: number | null;
}

export function ownVsRentScenarios(args: {
  homePrice: number;
  downPaymentPct: number;
  mortgageRatePct: number;
  termYears: number;
  monthlyRent: number;
  monthlyOwnExtra: number;
  rentGrowthPct: number;
  investmentReturnPct: number;
  years: number;
  appreciationRates?: number[];
}): OwnVsRentScenario[] {
  const rates = args.appreciationRates ?? [2, 4, 6];
  return rates.map((a) => {
    const r = ownVsRent({ ...args, appreciationPct: a });
    return { appreciationPct: a, series: r.series, crossoverYear: r.crossoverYear };
  });
}
