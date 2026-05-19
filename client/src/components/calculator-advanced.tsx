/**
 * Advanced analysis cards used by the rental-side calculators (BRRRR,
 * Cash Flow). Each card is self-contained and computes from primitives in
 * `lib/calculator-math`. All cards use editorial typography (copper kicker,
 * Cormorant H2) and brand colors.
 */
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import {
  buildPriceRentMatrix,
  breakevenRent,
  breakevenRate,
  breakevenVacancy,
  breakevenPriceAtCap,
  rentForTargetCoC,
  projectExitGrid,
  monthlyPayment,
} from "@shared/lib/calculator-math";
import { ScenarioBarChart, formatUSD } from "@/components/calculator-charts";
import { Activity, TrendingUp, Target, BarChart3, Save, Loader2 } from "lucide-react";

const KICKER = "text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold";

// ──────────────────────────────────────────────────────────────────────────
// Sensitivity matrix card — rent × PRICE (per spec)
// ──────────────────────────────────────────────────────────────────────────

export interface SensitivityMatrixCardProps {
  baseRent: number;
  basePrice: number;
  ltvPct: number;
  annualRatePct: number;
  termYears: number;
  monthlyOpex: number;
  rentStep?: number;
  priceStep?: number;
}

export function SensitivityMatrixCard(props: SensitivityMatrixCardProps) {
  const matrix = buildPriceRentMatrix(props);
  const half = Math.floor(matrix.length / 2);
  const prices = matrix[0]?.map((c) => c.price) ?? [];

  function cellClass(cf: number) {
    if (cf >= 300) return "bg-green-500/15 text-green-700 dark:text-green-300";
    if (cf >= 0) return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
    return "bg-red-500/15 text-red-700 dark:text-red-300";
  }

  return (
    <Card className="border-primary/15" data-testid="card-sensitivity">
      <CardHeader className="pb-3">
        <p className={KICKER}>Sensitivity</p>
        <CardTitle className="font-serif text-2xl flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          What if rent or price moves?
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Monthly cash flow at each rent and purchase price intersection. Asking price column is highlighted.
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-xs border-collapse min-w-[480px]">
            <thead>
              <tr>
                <th className="text-left py-2 pr-3 text-muted-foreground font-supporting tracking-wider uppercase text-[10px]">
                  Rent ↓ / Price →
                </th>
                {prices.map((p, j) => (
                  <th
                    key={j}
                    className={`px-2 py-2 text-right text-muted-foreground font-supporting tracking-wider uppercase text-[10px] ${
                      j === half ? "font-bold text-primary" : ""
                    }`}
                  >
                    {formatUSD(p)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i}>
                  <td
                    className={`py-1.5 pr-3 text-right tabular-nums ${
                      i === half ? "font-bold text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {formatUSD(row[0]?.rent ?? 0)}
                  </td>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`px-2 py-1.5 text-right tabular-nums rounded-sm ${cellClass(cell.monthlyCashFlow)} ${
                        i === half && j === half ? "ring-2 ring-primary/60" : ""
                      } ${j === half ? "border-x border-primary/30" : ""}`}
                      data-testid={`sensitivity-cell-${i}-${j}`}
                    >
                      {formatUSD(cell.monthlyCashFlow)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 mt-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-green-500/30" /> Strong (≥ $300)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500/30" /> Marginal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-500/30" /> Negative
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Breakeven card — adds rent for 8% CoC + breakeven price at 4%/5% cap
// ──────────────────────────────────────────────────────────────────────────

export interface BreakevenCardProps {
  rent: number;
  monthlyOpex: number;
  monthlyDebtService: number;
  loanAmount: number;
  termYears: number;
  rateUsed: number;
  cashInvested: number;
  annualNOI: number;
}

export function BreakevenCard(props: BreakevenCardProps) {
  const beRent = breakevenRent(props.monthlyDebtService, props.monthlyOpex);
  const beRate = breakevenRate({
    rent: props.rent,
    monthlyOpex: props.monthlyOpex,
    loanAmount: props.loanAmount,
    termYears: props.termYears,
  });
  const beVac = breakevenVacancy({
    grossRent: props.rent,
    monthlyOpex: props.monthlyOpex,
    monthlyDebtService: props.monthlyDebtService,
  });
  const rentBufferPct =
    props.rent > 0 ? Math.max(0, ((props.rent - beRent) / props.rent) * 100) : 0;
  const rentForCoC8 = rentForTargetCoC({
    targetCoCPct: 8,
    cashInvested: props.cashInvested,
    monthlyOpex: props.monthlyOpex,
    monthlyDebtService: props.monthlyDebtService,
  });
  const priceAt4Cap = breakevenPriceAtCap(props.annualNOI, 4);
  const priceAt5Cap = breakevenPriceAtCap(props.annualNOI, 5);

  const tile = (label: string, value: string, sub: string, testId: string) => (
    <div className="rounded-lg border border-border bg-background p-4" data-testid={testId}>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="font-serif text-xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );

  return (
    <Card className="border-primary/15" data-testid="card-breakeven">
      <CardHeader className="pb-3">
        <p className={KICKER}>Breakeven</p>
        <CardTitle className="font-serif text-2xl flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Where the deal breaks
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          The rents, rates, and prices that move this deal across zero.
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {tile("Min rent", formatUSD(beRent), `${rentBufferPct.toFixed(0)}% above breakeven`, "be-min-rent")}
        {tile("Rent for 8% CoC", formatUSD(rentForCoC8), "Target cash-on-cash return", "be-rent-coc8")}
        {tile("Max rate", beRate > 0 ? `${beRate.toFixed(2)}%` : "—", `You're at ${props.rateUsed.toFixed(2)}%`, "be-max-rate")}
        {tile("Max vacancy", `${beVac.toFixed(1)}%`, "Before negative cash flow", "be-max-vac")}
        {tile("Price at 4% cap", formatUSD(priceAt4Cap), "Implied by current NOI", "be-price-4cap")}
        {tile("Price at 5% cap", formatUSD(priceAt5Cap), "Implied by current NOI", "be-price-5cap")}
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Exit scenarios card — 3/5/7/10 years × 2/4/6% annual appreciation grid
// ──────────────────────────────────────────────────────────────────────────

export interface ExitScenariosCardProps {
  initialCashIn: number;
  propertyValue: number;
  loanAmount: number;
  annualRatePct: number;
  termYears: number;
  monthlyRent: number;
  monthlyOpex: number;
}

export function ExitScenariosCard(props: ExitScenariosCardProps) {
  const cells = projectExitGrid(props);
  const years = [3, 5, 7, 10];
  const rates = [2, 4, 6];

  // Find earliest year where the 4% appreciation case turns positive net.
  const breakevenHold =
    cells
      .filter((c) => c.appreciationPct === 4 && c.netProceeds + c.cumulativeCashFlow >= props.initialCashIn)
      .sort((a, b) => a.year - b.year)[0]?.year ?? null;

  function cellOf(year: number, rate: number) {
    return cells.find((c) => c.year === year && c.appreciationPct === rate);
  }

  function tone(net: number) {
    if (net >= props.initialCashIn * 1.5) return "text-green-700 dark:text-green-300";
    if (net >= props.initialCashIn) return "text-amber-700 dark:text-amber-300";
    return "text-red-700 dark:text-red-300";
  }

  return (
    <Card className="border-primary/15" data-testid="card-exit-scenarios">
      <CardHeader className="pb-3">
        <p className={KICKER}>Exit Scenarios</p>
        <CardTitle className="font-serif text-2xl flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          What 3, 5, 7, and 10 years could look like
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Exit value = entry value compounded by annual appreciation. Net proceeds + cumulative cash flow shown.
          7% selling costs assumed. Illustrative, not a forecast.
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-xs border-collapse min-w-[460px]">
            <thead>
              <tr>
                <th className="text-left py-2 pr-3 text-muted-foreground font-supporting tracking-wider uppercase text-[10px]">
                  Hold ↓ / Appreciation →
                </th>
                {rates.map((r) => (
                  <th key={r} className="px-2 py-2 text-right text-muted-foreground font-supporting tracking-wider uppercase text-[10px]">
                    {r}%/yr
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {years.map((y) => (
                <tr key={y}>
                  <td className="py-1.5 pr-3 text-muted-foreground">Year {y}</td>
                  {rates.map((rate) => {
                    const c = cellOf(y, rate);
                    if (!c) return <td key={rate}>—</td>;
                    const total = c.netProceeds + c.cumulativeCashFlow;
                    return (
                      <td
                        key={rate}
                        className={`px-2 py-1.5 text-right tabular-nums ${tone(total)}`}
                        data-testid={`exit-y${y}-a${rate}`}
                      >
                        <div>{formatUSD(total)}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {c.annualizedReturn.toFixed(1)}%/yr
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {breakevenHold !== null && (
          <p className="mt-3 text-xs text-muted-foreground">
            <span className="font-semibold text-primary">Breakeven hold (4% appreciation):</span>{" "}
            year {breakevenHold}: when net proceeds + cash flow first cover your cash in.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Scenario compare card — Base / Stressed / Worst with editable columns
// ──────────────────────────────────────────────────────────────────────────

export interface ScenarioCompareCardProps {
  baseRent: number;
  baseOpex: number;
  baseRate: number;
  loanAmount: number;
  termYears: number;
  /** When provided, enables "Save All Scenarios" — persists Base/Stressed/Worst
   *  as three savedAnalyses sharing one scenarioGroupId for grouped recall. */
  saveContext?: {
    calculatorType: string;
    inputs: Record<string, number | string>;
    namePrefix?: string;
  };
}

interface ScenarioInputs {
  rent: number;
  opex: number;
  rate: number;
}

const SCENARIO_DEFAULTS: Record<"Base" | "Stressed" | "Worst", (b: ScenarioInputs) => ScenarioInputs> = {
  Base: (b) => ({ ...b }),
  Stressed: (b) => ({ rent: b.rent * 0.95, opex: b.opex * 1.1, rate: b.rate + 1.0 }),
  Worst: (b) => ({ rent: b.rent * 0.9, opex: b.opex * 1.2, rate: b.rate + 2.0 }),
};

export function ScenarioCompareCard(props: ScenarioCompareCardProps) {
  const baseDefaults: ScenarioInputs = {
    rent: props.baseRent,
    opex: props.baseOpex,
    rate: props.baseRate,
  };
  const [scenarios, setScenarios] = useState({
    Base: SCENARIO_DEFAULTS.Base(baseDefaults),
    Stressed: SCENARIO_DEFAULTS.Stressed(baseDefaults),
    Worst: SCENARIO_DEFAULTS.Worst(baseDefaults),
  });

  const computed = useMemo(() => {
    return (Object.keys(scenarios) as Array<keyof typeof scenarios>).map((label) => {
      const s = scenarios[label];
      const pmt = monthlyPayment(props.loanAmount, s.rate, props.termYears);
      const monthlyCashFlow = s.rent - s.opex - pmt;
      return { scenario: label, ...s, monthlyCashFlow };
    });
  }, [scenarios, props.loanAmount, props.termYears]);

  function update(label: keyof typeof scenarios, field: keyof ScenarioInputs, value: string) {
    const num = parseFloat(value);
    setScenarios((prev) => ({
      ...prev,
      [label]: { ...prev[label], [field]: Number.isFinite(num) ? num : 0 },
    }));
  }

  function reset(label: keyof typeof scenarios) {
    setScenarios((prev) => ({ ...prev, [label]: SCENARIO_DEFAULTS[label](baseDefaults) }));
  }

  const { toast } = useToast();
  const { isAuthenticated } = useSupabaseAuth();
  const saveScenariosMutation = useMutation({
    mutationFn: async () => {
      if (!props.saveContext) throw new Error("No save context");
      const groupId = Math.floor(Math.random() * 2_000_000_000);
      const namePrefix = props.saveContext.namePrefix ?? "Scenario set";
      const labels: Array<keyof typeof scenarios> = ["Base", "Stressed", "Worst"];
      const results = await Promise.all(
        labels.map(async (label) => {
          const s = scenarios[label];
          const pmt = monthlyPayment(props.loanAmount, s.rate, props.termYears);
          const monthlyCashFlow = s.rent - s.opex - pmt;
          const res = await apiRequest("POST", "/api/saved-analyses", {
            name: `${namePrefix}: ${label}`,
            calculatorType: props.saveContext!.calculatorType,
            inputs: {
              ...props.saveContext!.inputs,
              scenarioRent: s.rent,
              scenarioOpex: s.opex,
              scenarioRate: s.rate,
            },
            results: { monthlyCashFlow, rent: s.rent, opex: s.opex, rate: s.rate },
            primaryMetric: "Monthly cash flow",
            primaryValue: formatUSD(monthlyCashFlow),
            scenarioGroupId: groupId,
            scenarioLabel: label,
          });
          return res.json();
        }),
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-analyses"] });
      toast({
        title: "Scenarios saved",
        description: "Base, Stressed, and Worst stored as a linked set.",
      });
    },
    onError: () =>
      toast({ title: "Could not save scenarios", variant: "destructive" }),
  });

  return (
    <Card className="border-primary/15" data-testid="card-scenario-compare">
      <CardHeader className="pb-3">
        <p className={KICKER}>Scenario Compare</p>
        <CardTitle className="font-serif text-2xl flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Base, stressed, worst case
        </CardTitle>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-sm text-muted-foreground flex-1 min-w-0">
            Each column is independently editable. Defaults: stressed = rent −5%, opex +10%, rate +1.0%.
            Worst = rent −10%, opex +20%, rate +2.0%.
          </p>
          {props.saveContext && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={!isAuthenticated || saveScenariosMutation.isPending}
              onClick={() => saveScenariosMutation.mutate()}
              data-testid="button-save-scenarios"
              title={isAuthenticated ? "Save Base/Stressed/Worst as a linked set" : "Sign in to save scenarios"}
            >
              {saveScenariosMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1.5" />
              )}
              Save scenarios
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScenarioBarChart
          data={computed.map((c) => ({ scenario: c.scenario, monthlyCashFlow: c.monthlyCashFlow }))}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {computed.map((c) => {
            const baseCF = computed[0].monthlyCashFlow;
            const delta = c.monthlyCashFlow - baseCF;
            return (
              <div
                key={c.scenario}
                className="rounded-lg border border-border bg-background p-3 space-y-2"
                data-testid={`scenario-${c.scenario.toLowerCase()}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {c.scenario}
                  </p>
                  <button
                    type="button"
                    onClick={() => reset(c.scenario as keyof typeof scenarios)}
                    className="text-[10px] text-muted-foreground hover:text-primary underline-offset-2 hover:underline"
                    data-testid={`button-reset-${c.scenario.toLowerCase()}`}
                  >
                    reset
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Rent</Label>
                    <Input
                      type="number"
                      value={Math.round(c.rent)}
                      onChange={(e) => update(c.scenario as keyof typeof scenarios, "rent", e.target.value)}
                      className="h-8 text-xs"
                      data-testid={`input-${c.scenario.toLowerCase()}-rent`}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Opex</Label>
                    <Input
                      type="number"
                      value={Math.round(c.opex)}
                      onChange={(e) => update(c.scenario as keyof typeof scenarios, "opex", e.target.value)}
                      className="h-8 text-xs"
                      data-testid={`input-${c.scenario.toLowerCase()}-opex`}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Rate %</Label>
                    <Input
                      type="number"
                      step="0.125"
                      value={c.rate.toFixed(3)}
                      onChange={(e) => update(c.scenario as keyof typeof scenarios, "rate", e.target.value)}
                      className="h-8 text-xs"
                      data-testid={`input-${c.scenario.toLowerCase()}-rate`}
                    />
                  </div>
                </div>
                <div className="border-t border-border pt-2">
                  <p
                    className={`font-serif text-lg font-semibold tabular-nums ${
                      c.monthlyCashFlow >= 0 ? "" : "text-destructive"
                    }`}
                  >
                    {formatUSD(c.monthlyCashFlow)}
                    <span className="text-[10px] font-normal text-muted-foreground ml-1">/mo</span>
                  </p>
                  {c.scenario !== "Base" && (
                    <p
                      className={`text-[11px] tabular-nums ${
                        delta >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"
                      }`}
                    >
                      {delta >= 0 ? "+" : ""}
                      {formatUSD(delta)} vs Base
                    </p>
                  )}
                  {c.monthlyCashFlow < 0 && (
                    <Badge variant="outline" className="mt-1 text-[10px] border-destructive/50 text-destructive">
                      Negative
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
