import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Calculator,
  DollarSign,
  FileSpreadsheet,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type NumericAssumption = number | "";
type ScenarioStrategy = "" | "flip" | "rental";
type FinancingMode = "" | "cash" | "financed";

interface ScenarioInput {
  id: string;
  name: string;
  strategy: ScenarioStrategy;
  financingMode: FinancingMode;
  purchasePrice: NumericAssumption;
  repairCosts: NumericAssumption;
  holdingPeriod: NumericAssumption;
  exitValue: NumericAssumption;
  downPayment: NumericAssumption;
  interestRate: NumericAssumption;
  sellingCostRate: NumericAssumption;
  monthlyRent: NumericAssumption;
  monthlyOperatingCosts: NumericAssumption;
}

interface ScenarioResult {
  scenarioId: string;
  scenarioName: string;
  strategy: Exclude<ScenarioStrategy, "">;
  loanAmount: number;
  cashRequired: number;
  interestCost: number;
  sellingCosts: number;
  modeledOutcome: number;
  simpleCashReturn: number;
  estimatedEquity: number;
  monthlyNetCashFlow: number | null;
}

function blankScenario(id: string, name: string): ScenarioInput {
  return {
    id,
    name,
    strategy: "",
    financingMode: "",
    purchasePrice: "",
    repairCosts: "",
    holdingPeriod: "",
    exitValue: "",
    downPayment: "",
    interestRate: "",
    sellingCostRate: "",
    monthlyRent: "",
    monthlyOperatingCosts: "",
  };
}

function isEntered(value: NumericAssumption): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonNegative(value: NumericAssumption): value is number {
  return isEntered(value) && value >= 0;
}

function parseNumericInput(value: string): NumericAssumption {
  if (value.trim() === "") return "";
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : "";
}

function scenarioIssues(scenario: ScenarioInput): string[] {
  const issues: string[] = [];
  if (!scenario.strategy) issues.push("select a strategy");
  if (!scenario.financingMode) issues.push("select a financing mode");
  if (!isEntered(scenario.purchasePrice) || scenario.purchasePrice <= 0) issues.push("enter a purchase price above $0");
  if (!isNonNegative(scenario.repairCosts)) issues.push("enter repair costs, including $0 when none");
  if (!isEntered(scenario.holdingPeriod) || scenario.holdingPeriod <= 0) issues.push("enter a holding period above 0 months");
  if (!isEntered(scenario.exitValue) || scenario.exitValue <= 0) issues.push("enter an exit or modeled property value above $0");

  if (scenario.financingMode === "financed") {
    if (!isEntered(scenario.downPayment) || scenario.downPayment < 0 || scenario.downPayment > 100) {
      issues.push("enter a down payment from 0% to 100%");
    }
    if (!isNonNegative(scenario.interestRate) || scenario.interestRate > 100) {
      issues.push("enter an annual interest rate from 0% to 100%");
    }
  }

  if (scenario.strategy === "flip") {
    if (!isNonNegative(scenario.sellingCostRate) || scenario.sellingCostRate > 100) {
      issues.push("enter selling costs from 0% to 100%");
    }
  }

  if (scenario.strategy === "rental") {
    if (!isNonNegative(scenario.monthlyRent)) issues.push("enter monthly rent, including $0 when vacant");
    if (!isNonNegative(scenario.monthlyOperatingCosts)) {
      issues.push("enter monthly operating costs, including $0 when none");
    }
  }

  return issues;
}

function calculateScenario(scenario: ScenarioInput): ScenarioResult | null {
  if (scenarioIssues(scenario).length > 0 || !scenario.strategy) return null;

  const purchasePrice = Number(scenario.purchasePrice);
  const repairCosts = Number(scenario.repairCosts);
  const holdingPeriod = Number(scenario.holdingPeriod);
  const exitValue = Number(scenario.exitValue);
  const downPaymentRate = scenario.financingMode === "financed" ? Number(scenario.downPayment) / 100 : 1;
  const interestRate = scenario.financingMode === "financed" ? Number(scenario.interestRate) / 100 : 0;
  const loanAmount = scenario.financingMode === "financed" ? purchasePrice * (1 - downPaymentRate) : 0;
  const upfrontCash = purchasePrice - loanAmount + repairCosts;
  const monthlyInterest = (loanAmount * interestRate) / 12;
  const interestCost = monthlyInterest * holdingPeriod;
  const sellingCosts = scenario.strategy === "flip" ? exitValue * (Number(scenario.sellingCostRate) / 100) : 0;

  let modeledOutcome: number;
  let cashRequired: number;
  let monthlyNetCashFlow: number | null = null;

  if (scenario.strategy === "flip") {
    modeledOutcome = exitValue - purchasePrice - repairCosts - interestCost - sellingCosts;
    cashRequired = upfrontCash + interestCost + sellingCosts;
  } else {
    monthlyNetCashFlow = Number(scenario.monthlyRent) - Number(scenario.monthlyOperatingCosts) - monthlyInterest;
    modeledOutcome = monthlyNetCashFlow * holdingPeriod;
    cashRequired = upfrontCash;
  }

  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name.trim() || `Scenario ${scenario.id}`,
    strategy: scenario.strategy,
    loanAmount,
    cashRequired,
    interestCost,
    sellingCosts,
    modeledOutcome,
    simpleCashReturn: cashRequired > 0 ? (modeledOutcome / cashRequired) * 100 : 0,
    estimatedEquity: exitValue - loanAmount,
    monthlyNetCashFlow,
  };
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(Math.round(value));
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function PortfolioScenarioPlanner() {
  const nextId = useRef(2);
  const [scenarios, setScenarios] = useState<ScenarioInput[]>([
    blankScenario("1", "Scenario 1"),
  ]);
  const [activeScenario, setActiveScenario] = useState("1");

  const active = scenarios.find((scenario) => scenario.id === activeScenario) ?? scenarios[0];
  const issues = useMemo(() => scenarioIssues(active), [active]);
  const result = useMemo(() => calculateScenario(active), [active]);
  const completedResults = useMemo(
    () => scenarios.map(calculateScenario).filter((item): item is ScenarioResult => item !== null),
    [scenarios],
  );

  const updateScenario = (id: string, updates: Partial<ScenarioInput>) => {
    setScenarios((current) => current.map((scenario) => (
      scenario.id === id ? { ...scenario, ...updates } : scenario
    )));
  };

  const addScenario = () => {
    const id = String(nextId.current++);
    setScenarios((current) => [...current, blankScenario(id, `Scenario ${id}`)]);
    setActiveScenario(id);
  };

  const removeActiveScenario = () => {
    if (scenarios.length <= 1) return;
    const nextScenarios = scenarios.filter((scenario) => scenario.id !== activeScenario);
    setScenarios(nextScenarios);
    setActiveScenario(nextScenarios[0].id);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" aria-hidden="true" />
                Scenario assumptions
              </CardTitle>
              <CardDescription className="mt-1 max-w-2xl leading-relaxed">
                Start blank, enter your own assumptions, and compare the same published formulas. Pegasus does not choose a strategy or financing structure for you.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {scenarios.length > 1 && (
                <Button type="button" variant="outline" size="sm" onClick={removeActiveScenario}>
                  <Trash2 className="mr-1 h-4 w-4" aria-hidden="true" />
                  Remove current
                </Button>
              )}
              <Button type="button" variant="outline" size="sm" onClick={addScenario} data-testid="button-add-scenario">
                <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
                Add scenario
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeScenario} onValueChange={setActiveScenario}>
            <div className="mb-5 overflow-x-auto pb-2">
              <TabsList>
                {scenarios.map((scenario) => (
                  <TabsTrigger key={scenario.id} value={scenario.id} data-testid={`tab-scenario-${scenario.id}`}>
                    {scenario.name.trim() || `Scenario ${scenario.id}`}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {scenarios.map((scenario) => (
              <TabsContent key={scenario.id} value={scenario.id}>
                <ScenarioInputForm
                  scenario={scenario}
                  onChange={(updates) => updateScenario(scenario.id, updates)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {result ? (
        <ScenarioResults result={result} scenario={active} />
      ) : (
        <Card className="border-dashed" data-testid="state-scenario-incomplete">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:text-left">
            <FileSpreadsheet className="h-7 w-7 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="font-medium">Enter your assumptions to calculate a scenario.</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Still needed: {issues.join("; ")}.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {completedResults.length > 1 && <ScenarioComparison results={completedResults} />}

      <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm leading-relaxed text-muted-foreground">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
        <p>
          These are mechanical planning estimates from the values you enter, not investment, lending, tax, or legal advice. Verify all property facts, financing terms, costs, taxes, insurance, vacancy, and exit assumptions with qualified professionals.
        </p>
      </div>
    </div>
  );
}

function ScenarioInputForm({
  scenario,
  onChange,
}: {
  scenario: ScenarioInput;
  onChange: (updates: Partial<ScenarioInput>) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-muted-foreground">Property assumptions</legend>
        <TextAssumption
          id={`scenario-name-${scenario.id}`}
          label="Scenario name"
          value={scenario.name}
          placeholder={`Scenario ${scenario.id}`}
          onChange={(value) => onChange({ name: value })}
        />
        <MoneyAssumption
          id={`purchase-price-${scenario.id}`}
          label="Purchase price"
          value={scenario.purchasePrice}
          onChange={(value) => onChange({ purchasePrice: value })}
          testId="input-purchase-price"
        />
        <MoneyAssumption
          id={`repair-costs-${scenario.id}`}
          label="Repair costs"
          value={scenario.repairCosts}
          onChange={(value) => onChange({ repairCosts: value })}
          testId="input-repair-costs"
        />
        <MoneyAssumption
          id={`exit-value-${scenario.id}`}
          label="Exit or modeled property value"
          value={scenario.exitValue}
          onChange={(value) => onChange({ exitValue: value })}
          testId="input-exit-price"
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-muted-foreground">Strategy assumptions</legend>
        <div className="space-y-2">
          <Label htmlFor={`strategy-${scenario.id}`}>Strategy</Label>
          <Select
            value={scenario.strategy}
            onValueChange={(value) => onChange({ strategy: value as ScenarioStrategy })}
          >
            <SelectTrigger id={`strategy-${scenario.id}`} data-testid="select-strategy">
              <SelectValue placeholder="Select a strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flip">Purchase, improve, and sell</SelectItem>
              <SelectItem value="rental">Rental holding period</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <NumberAssumption
          id={`holding-period-${scenario.id}`}
          label="Holding period (months)"
          value={scenario.holdingPeriod}
          onChange={(value) => onChange({ holdingPeriod: value })}
          min={1}
          step={1}
          testId="input-holding-period"
        />
        {scenario.strategy === "flip" && (
          <PercentAssumption
            id={`selling-costs-${scenario.id}`}
            label="Selling costs (% of exit value)"
            value={scenario.sellingCostRate}
            onChange={(value) => onChange({ sellingCostRate: value })}
            testId="input-selling-costs"
          />
        )}
        {scenario.strategy === "rental" && (
          <>
            <MoneyAssumption
              id={`monthly-rent-${scenario.id}`}
              label="Monthly rent"
              value={scenario.monthlyRent}
              onChange={(value) => onChange({ monthlyRent: value })}
              testId="input-monthly-rent"
            />
            <MoneyAssumption
              id={`monthly-costs-${scenario.id}`}
              label="Monthly operating costs"
              value={scenario.monthlyOperatingCosts}
              onChange={(value) => onChange({ monthlyOperatingCosts: value })}
              testId="input-monthly-operating-costs"
            />
          </>
        )}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium text-muted-foreground">Financing assumptions</legend>
        <div className="space-y-2">
          <Label htmlFor={`financing-${scenario.id}`}>Financing mode</Label>
          <Select
            value={scenario.financingMode}
            onValueChange={(value) => onChange({ financingMode: value as FinancingMode })}
          >
            <SelectTrigger id={`financing-${scenario.id}`} data-testid="select-financing">
              <SelectValue placeholder="Select financing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="financed">Financed — enter terms</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {scenario.financingMode === "financed" && (
          <>
            <PercentAssumption
              id={`down-payment-${scenario.id}`}
              label="Down payment"
              value={scenario.downPayment}
              onChange={(value) => onChange({ downPayment: value })}
              testId="input-down-payment"
            />
            <PercentAssumption
              id={`interest-rate-${scenario.id}`}
              label="Annual interest rate"
              value={scenario.interestRate}
              onChange={(value) => onChange({ interestRate: value })}
              testId="input-interest-rate"
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              The model uses simple interest-only carry. It does not assume amortization, lender fees, points, or a commitment from any lender.
            </p>
          </>
        )}
      </fieldset>
    </div>
  );
}

function TextAssumption({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function NumberAssumption({
  id,
  label,
  value,
  onChange,
  min = 0,
  max,
  step = "any",
  testId,
  leadingIcon = false,
}: {
  id: string;
  label: string;
  value: NumericAssumption;
  onChange: (value: NumericAssumption) => void;
  min?: number;
  max?: number;
  step?: number | "any";
  testId: string;
  leadingIcon?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {leadingIcon && <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />}
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          placeholder="Enter value"
          onChange={(event) => onChange(parseNumericInput(event.target.value))}
          className={leadingIcon ? "pl-9" : undefined}
          data-testid={testId}
        />
      </div>
    </div>
  );
}

function MoneyAssumption(props: Omit<React.ComponentProps<typeof NumberAssumption>, "leadingIcon">) {
  return <NumberAssumption {...props} leadingIcon />;
}

function PercentAssumption(props: Omit<React.ComponentProps<typeof NumberAssumption>, "min" | "max" | "step">) {
  return <NumberAssumption {...props} min={0} max={100} step={0.1} />;
}

function ScenarioResults({ result, scenario }: { result: ScenarioResult; scenario: ScenarioInput }) {
  const formula = scenario.strategy === "flip"
    ? "Outcome = exit value − purchase price − repairs − entered selling costs − simple interest carry."
    : "Holding-period outcome = (monthly rent − entered monthly operating costs − simple interest carry) × entered months.";

  return (
    <section className="space-y-4" aria-live="polite" data-testid="scenario-results">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Deterministic estimate</p>
          <h3 className="text-xl font-semibold">{result.scenarioName}</h3>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{formula}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ResultCard label="Estimated cash required" value={formatCurrency(result.cashRequired)} />
        <ResultCard label="Simple interest carry" value={formatCurrency(result.interestCost)} />
        <ResultCard
          label={result.strategy === "flip" ? "Estimated sale outcome" : "Holding-period net cash flow"}
          value={formatCurrency(result.modeledOutcome)}
        />
        <ResultCard label="Simple cash return" value={formatPercent(result.simpleCashReturn)} />
      </div>
      <Card>
        <CardContent className="grid gap-4 p-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <EstimateLine label="Entered value" value={formatCurrency(Number(scenario.exitValue))} />
          <EstimateLine label="Modeled loan amount" value={formatCurrency(result.loanAmount)} />
          <EstimateLine label="Estimated equity at entered value" value={formatCurrency(result.estimatedEquity)} />
          <EstimateLine
            label={result.strategy === "flip" ? "Entered selling costs" : "Monthly net cash flow"}
            value={formatCurrency(result.strategy === "flip" ? result.sellingCosts : result.monthlyNetCashFlow ?? 0)}
          />
        </CardContent>
      </Card>
      <p className="text-xs leading-relaxed text-muted-foreground">
        “Simple cash return” is the modeled outcome divided by the displayed cash-required estimate. It is not IRR, an appraisal, an underwriting result, or a prediction.
      </p>
    </section>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function EstimateLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium tabular-nums">{value}</p>
    </div>
  );
}

function ScenarioComparison({ results }: { results: ScenarioResult[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
          Side-by-side estimates
        </CardTitle>
        <CardDescription>
          A neutral comparison of completed inputs. Pegasus does not rank or recommend a scenario.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <caption className="sr-only">Completed scenario estimates</caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="px-3 py-3 text-left font-medium">Scenario</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">Cash required</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">Interest carry</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">Modeled outcome</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">Simple return</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.scenarioId} className="border-b last:border-0">
                  <th scope="row" className="px-3 py-3 text-left font-medium">{result.scenarioName}</th>
                  <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(result.cashRequired)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(result.interestCost)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(result.modeledOutcome)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatPercent(result.simpleCashReturn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
