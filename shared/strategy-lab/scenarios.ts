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

  // Effective gross income after vacancy.
  const egiMonthly = rent * (1 - d.vacancyPct / 100);

  // Variable opex pieces (% of collected rent).
  const repairs = egiMonthly * (d.repairsPct / 100);
  const capex = egiMonthly * (d.capexPct / 100);
  const mgmt = egiMonthly * mgmtPct;

  // Fixed monthly costs.
  const taxAnnualPct = (inp.property.monthlyTaxAnnualPct ?? 1.1) / 100;
  const monthlyTax = (inp.property.askingPrice * taxAnnualPct * d.taxInsMult) / 12;
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
    effectiveVacancyPct: d.vacancyPct,
    effectiveRepairsPct: d.repairsPct,
    effectiveCapexPct: d.capexPct,
    effectiveTaxInsMult: d.taxInsMult,
    effectiveHoaMult: d.hoaMult,
    effectiveGrossIncome: egiMonthly * 12,
    operatingExpenses: opexMonthly * 12,
    noiAnnual: noi,
    capRatePct: capRate(noi, inp.property.askingPrice),
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
