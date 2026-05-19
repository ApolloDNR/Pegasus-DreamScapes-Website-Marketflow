/**
 * Strategy Lab — Base / Stressed / Worst scenario engine.
 *
 * Methodology mirrors the real-estate-analyzer skill:
 *   Rent       100% / 95%  / 85%
 *   Vacancy    8%   / 10%   / 12%
 *   Repairs    8%   / 10%   / 12%
 *   CapEx      5%   / 5%    / 6%
 *   Tax+Ins    +0%  / +10%  / +20%
 *   HOA        +0%  / +8%   / +15%
 *
 * Output per scenario: NOI, cap rate, cash flow, CoC, DSCR.
 */

import { capRate, cashOnCash, dscr, monthlyPayment, noiAnnual } from "../lib/calculator-math";
import type { PropertyInput, ScenarioLabel, ScenarioRun } from "./types";

interface ScenarioInputs {
  property: PropertyInput;
  monthlyRent: number;
  totalCashIn: number;
  loanAmount: number;
  ratePct: number;
  termYears: number;
  /** Optional management overhead, default 8% of collected rent. */
  managementPct?: number;
  /**
   * Override the Base-scenario vacancy %. Stressed/Worst stay at their
   * deltas relative to whatever the user picked (≤ +2pp / +4pp).
   */
  vacancyPctBase?: number;
}

const DELTAS: Record<
  ScenarioLabel,
  {
    rentMult: number;
    vacancyPct: number;
    repairsPct: number;
    capexPct: number;
    taxInsMult: number;
    hoaMult: number;
  }
> = {
  base:     { rentMult: 1.0,  vacancyPct: 8,  repairsPct: 8,  capexPct: 5, taxInsMult: 1.0,  hoaMult: 1.0 },
  stressed: { rentMult: 0.95, vacancyPct: 10, repairsPct: 10, capexPct: 5, taxInsMult: 1.1,  hoaMult: 1.08 },
  worst:    { rentMult: 0.85, vacancyPct: 12, repairsPct: 12, capexPct: 6, taxInsMult: 1.2,  hoaMult: 1.15 },
};

export function buildScenario(label: ScenarioLabel, inp: ScenarioInputs): ScenarioRun {
  const d = DELTAS[label];
  const rent = inp.monthlyRent * d.rentMult;
  const mgmtPct = (inp.managementPct ?? 8) / 100;

  // Apply user-supplied Base vacancy override. Stressed/Worst keep their
  // historical +2pp / +4pp deltas so the stress curve stays monotonic.
  let vacancyPct = d.vacancyPct;
  if (inp.vacancyPctBase != null && Number.isFinite(inp.vacancyPctBase)) {
    const base = Math.max(0, Math.min(50, inp.vacancyPctBase));
    if (label === "base") vacancyPct = base;
    else if (label === "stressed") vacancyPct = Math.min(50, base + 2);
    else vacancyPct = Math.min(50, base + 4);
  }

  // Effective gross income after vacancy.
  const egiMonthly = rent * (1 - vacancyPct / 100);

  // Variable opex pieces (% of collected rent).
  const repairs = egiMonthly * (d.repairsPct / 100);
  const capex = egiMonthly * (d.capexPct / 100);
  const mgmt = egiMonthly * mgmtPct;

  // Fixed monthly costs.
  const taxAnnualPct = (inp.property.monthlyTaxAnnualPct ?? 1.1) / 100;
  const effectivePrice = inp.property.purchasePrice ?? inp.property.askingPrice;
  const monthlyTax = (effectivePrice * taxAnnualPct * d.taxInsMult) / 12;
  const monthlyIns = (inp.property.monthlyInsurance ?? 150) * d.taxInsMult;
  const monthlyHoa = (inp.property.monthlyHoa ?? 0) * d.hoaMult;

  const opexMonthly = repairs + capex + mgmt + monthlyTax + monthlyIns + monthlyHoa;
  const noi = noiAnnual(egiMonthly, opexMonthly);

  const debtServiceMonthly = monthlyPayment(inp.loanAmount, inp.ratePct, inp.termYears);
  const annualDebt = debtServiceMonthly * 12;
  const cashFlow = noi - annualDebt;

  return {
    label,
    effectiveRent: rent,
    effectiveVacancyPct: vacancyPct,
    effectiveRepairsPct: d.repairsPct,
    effectiveCapexPct: d.capexPct,
    effectiveTaxInsMult: d.taxInsMult,
    effectiveHoaMult: d.hoaMult,
    effectiveGrossIncome: egiMonthly * 12,
    operatingExpenses: opexMonthly * 12,
    noiAnnual: noi,
    capRatePct: capRate(noi, effectivePrice),
    annualDebtService: annualDebt,
    annualCashFlow: cashFlow,
    cashOnCashPct: cashOnCash(cashFlow, inp.totalCashIn),
    dscr: dscr(noi, annualDebt),
  };
}

export function buildAllScenarios(inp: ScenarioInputs): Record<ScenarioLabel, ScenarioRun> {
  return {
    base: buildScenario("base", inp),
    stressed: buildScenario("stressed", inp),
    worst: buildScenario("worst", inp),
  };
}
