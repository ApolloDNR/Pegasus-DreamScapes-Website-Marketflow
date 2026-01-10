import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  BarChart3,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Plus,
  Trash2,
  Copy,
  Download,
  Sparkles
} from "lucide-react";

interface ScenarioInput {
  id: string;
  name: string;
  purchasePrice: number;
  repairCosts: number;
  holdingPeriod: number;
  strategy: "flip" | "rental" | "brrrr" | "wholesale";
  exitPrice: number;
  monthlyRent?: number;
  financingType: "cash" | "conventional" | "hard_money" | "private";
  downPayment: number;
  interestRate: number;
}

interface ScenarioResult {
  totalInvestment: number;
  profit: number;
  roi: number;
  annualizedRoi: number;
  cashOnCash: number;
  equity: number;
  monthlyIncome?: number;
  breakEvenMonths?: number;
  riskScore: number;
  recommendation: string;
}

const defaultScenario: ScenarioInput = {
  id: "1",
  name: "Scenario 1",
  purchasePrice: 150000,
  repairCosts: 30000,
  holdingPeriod: 6,
  strategy: "flip",
  exitPrice: 220000,
  monthlyRent: 1800,
  financingType: "hard_money",
  downPayment: 20,
  interestRate: 12,
};

export function PortfolioScenarioPlanner() {
  const [scenarios, setScenarios] = useState<ScenarioInput[]>([defaultScenario]);
  const [activeScenario, setActiveScenario] = useState("1");

  const addScenario = () => {
    const newId = String(scenarios.length + 1);
    setScenarios([
      ...scenarios,
      {
        ...defaultScenario,
        id: newId,
        name: `Scenario ${newId}`,
      },
    ]);
    setActiveScenario(newId);
  };

  const updateScenario = (id: string, updates: Partial<ScenarioInput>) => {
    setScenarios(scenarios.map((s) => 
      s.id === id ? { ...s, ...updates } : s
    ));
  };

  const removeScenario = (id: string) => {
    if (scenarios.length > 1) {
      const newScenarios = scenarios.filter((s) => s.id !== id);
      setScenarios(newScenarios);
      if (activeScenario === id) {
        setActiveScenario(newScenarios[0].id);
      }
    }
  };

  const calculateScenario = (scenario: ScenarioInput): ScenarioResult => {
    const loanAmount = scenario.purchasePrice * (1 - scenario.downPayment / 100);
    const downPaymentAmount = scenario.purchasePrice * (scenario.downPayment / 100);
    const monthlyInterest = (loanAmount * (scenario.interestRate / 100)) / 12;
    const holdingCosts = monthlyInterest * scenario.holdingPeriod;
    
    const totalInvestment = downPaymentAmount + scenario.repairCosts + holdingCosts;
    
    let profit = 0;
    let monthlyIncome = 0;
    let breakEvenMonths = 0;

    if (scenario.strategy === "flip" || scenario.strategy === "wholesale") {
      profit = scenario.exitPrice - scenario.purchasePrice - scenario.repairCosts - holdingCosts;
    } else if (scenario.strategy === "rental" || scenario.strategy === "brrrr") {
      const grossRent = (scenario.monthlyRent || 0) * 12;
      const netRent = grossRent * 0.7;
      monthlyIncome = netRent / 12;
      profit = netRent * (scenario.holdingPeriod / 12);
      breakEvenMonths = Math.ceil(totalInvestment / monthlyIncome);
    }

    const roi = (profit / totalInvestment) * 100;
    const annualizedRoi = roi * (12 / scenario.holdingPeriod);
    const cashOnCash = scenario.strategy === "rental" 
      ? ((monthlyIncome * 12) / totalInvestment) * 100 
      : roi;
    const equity = scenario.exitPrice - loanAmount;

    const riskScore = calculateRiskScore(scenario);
    const recommendation = generateRecommendation(scenario, roi, riskScore);

    return {
      totalInvestment: Math.round(totalInvestment),
      profit: Math.round(profit),
      roi: Math.round(roi * 10) / 10,
      annualizedRoi: Math.round(annualizedRoi * 10) / 10,
      cashOnCash: Math.round(cashOnCash * 10) / 10,
      equity: Math.round(equity),
      monthlyIncome: Math.round(monthlyIncome),
      breakEvenMonths,
      riskScore,
      recommendation,
    };
  };

  const calculateRiskScore = (scenario: ScenarioInput): number => {
    let risk = 50;

    if (scenario.repairCosts / scenario.purchasePrice > 0.3) risk += 15;
    if (scenario.holdingPeriod > 12) risk += 10;
    if (scenario.financingType === "hard_money") risk += 10;
    if (scenario.downPayment < 15) risk += 15;
    if (scenario.strategy === "brrrr") risk += 10;
    
    const potentialProfit = scenario.exitPrice - scenario.purchasePrice - scenario.repairCosts;
    const margin = potentialProfit / scenario.purchasePrice;
    if (margin > 0.25) risk -= 20;
    else if (margin < 0.1) risk += 20;

    return Math.max(0, Math.min(100, risk));
  };

  const generateRecommendation = (
    scenario: ScenarioInput, 
    roi: number, 
    riskScore: number
  ): string => {
    if (roi > 30 && riskScore < 50) {
      return "Strong opportunity with good risk-adjusted returns";
    } else if (roi > 20 && riskScore < 60) {
      return "Solid deal, consider negotiating better terms";
    } else if (roi > 10) {
      return "Marginal returns, ensure exit strategy is solid";
    } else {
      return "Review deal economics, may need better purchase price";
    }
  };

  const currentScenario = scenarios.find((s) => s.id === activeScenario) || scenarios[0];
  const result = useMemo(() => calculateScenario(currentScenario), [currentScenario]);

  const allResults = useMemo(() => 
    scenarios.map((s) => ({ scenario: s, result: calculateScenario(s) })),
    [scenarios]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Portfolio Scenario Planner
              </CardTitle>
              <CardDescription>
                Model different investment scenarios and compare outcomes
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={addScenario}
                data-testid="button-add-scenario"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Scenario
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeScenario} onValueChange={setActiveScenario}>
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
              <TabsList>
                {scenarios.map((s) => (
                  <TabsTrigger 
                    key={s.id} 
                    value={s.id}
                    className="relative"
                    data-testid={`tab-scenario-${s.id}`}
                  >
                    {s.name}
                    {scenarios.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-destructive/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeScenario(s.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {scenarios.map((scenario) => (
              <TabsContent key={scenario.id} value={scenario.id} className="space-y-6">
                <ScenarioInputForm
                  scenario={scenario}
                  onChange={(updates) => updateScenario(scenario.id, updates)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <ScenarioResults result={result} scenario={currentScenario} />

      {scenarios.length > 1 && (
        <ScenarioComparison results={allResults} />
      )}
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground">Property Details</h4>
        
        <div className="space-y-2">
          <Label>Purchase Price</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              value={scenario.purchasePrice}
              onChange={(e) => onChange({ purchasePrice: Number(e.target.value) })}
              className="pl-9"
              data-testid="input-purchase-price"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Repair Costs</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              value={scenario.repairCosts}
              onChange={(e) => onChange({ repairCosts: Number(e.target.value) })}
              className="pl-9"
              data-testid="input-repair-costs"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Exit / ARV Price</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              value={scenario.exitPrice}
              onChange={(e) => onChange({ exitPrice: Number(e.target.value) })}
              className="pl-9"
              data-testid="input-exit-price"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground">Strategy</h4>

        <div className="space-y-2">
          <Label>Investment Strategy</Label>
          <Select
            value={scenario.strategy}
            onValueChange={(v) => onChange({ strategy: v as ScenarioInput["strategy"] })}
          >
            <SelectTrigger data-testid="select-strategy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flip">Fix & Flip</SelectItem>
              <SelectItem value="rental">Buy & Hold Rental</SelectItem>
              <SelectItem value="brrrr">BRRRR</SelectItem>
              <SelectItem value="wholesale">Wholesale</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Holding Period (months)</Label>
          <div className="pt-2">
            <Slider
              value={[scenario.holdingPeriod]}
              onValueChange={([v]) => onChange({ holdingPeriod: v })}
              min={1}
              max={36}
              step={1}
              data-testid="slider-holding-period"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1 month</span>
              <span className="font-medium">{scenario.holdingPeriod} months</span>
              <span>36 months</span>
            </div>
          </div>
        </div>

        {(scenario.strategy === "rental" || scenario.strategy === "brrrr") && (
          <div className="space-y-2">
            <Label>Monthly Rent</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={scenario.monthlyRent}
                onChange={(e) => onChange({ monthlyRent: Number(e.target.value) })}
                className="pl-9"
                data-testid="input-monthly-rent"
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground">Financing</h4>

        <div className="space-y-2">
          <Label>Financing Type</Label>
          <Select
            value={scenario.financingType}
            onValueChange={(v) => onChange({ financingType: v as ScenarioInput["financingType"] })}
          >
            <SelectTrigger data-testid="select-financing">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">All Cash</SelectItem>
              <SelectItem value="conventional">Conventional Loan</SelectItem>
              <SelectItem value="hard_money">Hard Money</SelectItem>
              <SelectItem value="private">Private Money</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {scenario.financingType !== "cash" && (
          <>
            <div className="space-y-2">
              <Label>Down Payment (%)</Label>
              <div className="pt-2">
                <Slider
                  value={[scenario.downPayment]}
                  onValueChange={([v]) => onChange({ downPayment: v })}
                  min={0}
                  max={100}
                  step={5}
                  data-testid="slider-down-payment"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span>
                  <span className="font-medium">{scenario.downPayment}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Interest Rate (%)</Label>
              <div className="pt-2">
                <Slider
                  value={[scenario.interestRate]}
                  onValueChange={([v]) => onChange({ interestRate: v })}
                  min={0}
                  max={20}
                  step={0.5}
                  data-testid="slider-interest-rate"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span>
                  <span className="font-medium">{scenario.interestRate}%</span>
                  <span>20%</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ScenarioResults({
  result,
  scenario,
}: {
  result: ScenarioResult;
  scenario: ScenarioInput;
}) {
  const riskColor = result.riskScore < 40 ? "text-green-600" :
                    result.riskScore < 70 ? "text-amber-600" : "text-red-600";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm text-muted-foreground">Projected Profit</span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            ${result.profit.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            From ${result.totalInvestment.toLocaleString()} invested
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-muted-foreground">ROI</span>
          </div>
          <p className="text-3xl font-bold">{result.roi}%</p>
          <p className="text-sm text-muted-foreground mt-1">
            {result.annualizedRoi}% annualized
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-muted-foreground">Cash on Cash</span>
          </div>
          <p className="text-3xl font-bold">{result.cashOnCash}%</p>
          {result.monthlyIncome && result.monthlyIncome > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              ${result.monthlyIncome}/mo income
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className={`w-5 h-5 ${riskColor}`} />
            <span className="text-sm text-muted-foreground">Risk Score</span>
          </div>
          <div className="flex items-center gap-3">
            <p className={`text-3xl font-bold ${riskColor}`}>{result.riskScore}</p>
            <Progress 
              value={result.riskScore} 
              className="flex-1 h-2"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {result.riskScore < 40 ? "Low Risk" : 
             result.riskScore < 70 ? "Moderate Risk" : "High Risk"}
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-4">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">AI Analysis</h4>
              <p className="text-muted-foreground">{result.recommendation}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ScenarioComparison({
  results,
}: {
  results: { scenario: ScenarioInput; result: ScenarioResult }[];
}) {
  const bestRoi = Math.max(...results.map((r) => r.result.roi));
  const lowestRisk = Math.min(...results.map((r) => r.result.riskScore));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Scenario Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Scenario</th>
                <th className="text-right py-3 px-4 font-medium">Investment</th>
                <th className="text-right py-3 px-4 font-medium">Profit</th>
                <th className="text-right py-3 px-4 font-medium">ROI</th>
                <th className="text-right py-3 px-4 font-medium">Risk</th>
                <th className="text-center py-3 px-4 font-medium">Best For</th>
              </tr>
            </thead>
            <tbody>
              {results.map(({ scenario, result }) => (
                <tr key={scenario.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{scenario.name}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {scenario.strategy}
                      </Badge>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4">
                    ${result.totalInvestment.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 font-medium text-green-600">
                    ${result.profit.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <span className={result.roi === bestRoi ? "font-bold text-green-600" : ""}>
                        {result.roi}%
                      </span>
                      {result.roi === bestRoi && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Best
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <span className={result.riskScore === lowestRisk ? "font-bold text-green-600" : ""}>
                        {result.riskScore}
                      </span>
                      {result.riskScore === lowestRisk && (
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          Safest
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <Badge variant="secondary" className="text-xs">
                      {result.roi > 25 && result.riskScore < 50 ? "Aggressive Growth" :
                       result.riskScore < 40 ? "Conservative" :
                       result.cashOnCash > 15 ? "Cash Flow" : "Balanced"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
