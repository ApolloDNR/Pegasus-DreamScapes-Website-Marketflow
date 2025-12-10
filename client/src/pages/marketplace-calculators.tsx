import { useState } from "react";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from "recharts";
import { 
  Calculator, 
  TrendingUp, 
  Home, 
  DollarSign,
  RotateCcw,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Handshake
} from "lucide-react";
import { 
  CalculatorActions, 
  MetricCard, 
  StatusIndicator, 
  DealGradeBadge,
  calculateDealGrade
} from "@/components/calculator-shared";

export default function MarketplaceCalculators() {
  return (
    <MarketplaceLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-serif font-bold" data-testid="text-marketplace-calculators">
              Deal Calculators
            </h1>
          </div>
          <p className="text-muted-foreground">
            Professional investment analysis tools to evaluate your real estate deals
          </p>
        </div>

        <Tabs defaultValue="arv" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-6 h-auto p-1">
            <TabsTrigger value="arv" className="flex items-center gap-2 py-3" data-testid="tab-arv">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">ARV</span>
            </TabsTrigger>
            <TabsTrigger value="roi" className="flex items-center gap-2 py-3" data-testid="tab-roi">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">ROI</span>
            </TabsTrigger>
            <TabsTrigger value="brrrr" className="flex items-center gap-2 py-3" data-testid="tab-brrrr">
              <RefreshCw className="w-4 h-4" />
              BRRRR
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="flex items-center gap-2 py-3" data-testid="tab-cashflow">
              <BarChart3 className="w-4 h-4" />
              Cash Flow
            </TabsTrigger>
            <TabsTrigger value="wholesale" className="flex items-center gap-2 py-3" data-testid="tab-wholesale">
              <Handshake className="w-4 h-4" />
              Wholesale
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="arv">
            <ARVCalculator />
          </TabsContent>
          
          <TabsContent value="roi">
            <ROICalculator />
          </TabsContent>
          
          <TabsContent value="brrrr">
            <BRRRRCalculator />
          </TabsContent>
          
          <TabsContent value="cashflow">
            <CashFlowCalculator />
          </TabsContent>
          
          <TabsContent value="wholesale">
            <WholesaleCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </MarketplaceLayout>
  );
}

function ARVCalculator() {
  const [purchasePrice, setPurchasePrice] = useState("");
  const [rehabCost, setRehabCost] = useState("");
  const [arv, setArv] = useState("");
  const [holdingCosts, setHoldingCosts] = useState("");
  const [closingCosts, setClosingCosts] = useState("6");
  const [results, setResults] = useState<{
    totalInvestment: number;
    potentialProfit: number;
    netProfit: number;
    roi: number;
    seventyPercentRule: number;
    meetsRule: boolean;
  } | null>(null);

  const calculate = () => {
    const purchase = parseFloat(purchasePrice) || 0;
    const rehab = parseFloat(rehabCost) || 0;
    const afterRepairValue = parseFloat(arv) || 0;
    const holding = parseFloat(holdingCosts) || 0;
    const closingPercent = parseFloat(closingCosts) || 6;

    const closingAmount = afterRepairValue * (closingPercent / 100);
    const totalInvestment = purchase + rehab + holding;
    const potentialProfit = afterRepairValue - totalInvestment;
    const netProfit = potentialProfit - closingAmount;
    const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
    
    const seventyPercentRule = afterRepairValue * 0.7 - rehab;
    const meetsRule = purchase <= seventyPercentRule;

    setResults({
      totalInvestment,
      potentialProfit,
      netProfit,
      roi,
      seventyPercentRule,
      meetsRule,
    });
  };

  const reset = () => {
    setPurchasePrice("");
    setRehabCost("");
    setArv("");
    setHoldingCosts("");
    setClosingCosts("6");
    setResults(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Home className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>ARV Calculator</CardTitle>
              <CardDescription>
                Estimate your profit and check against the 70% rule
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="purchasePrice"
                  type="number"
                  placeholder="250000"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="pl-10"
                  data-testid="input-arv-purchase"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rehabCost">Estimated Rehab Cost</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="rehabCost"
                  type="number"
                  placeholder="50000"
                  value={rehabCost}
                  onChange={(e) => setRehabCost(e.target.value)}
                  className="pl-10"
                  data-testid="input-arv-rehab"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="arv">After Repair Value (ARV)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="arv"
                  type="number"
                  placeholder="400000"
                  value={arv}
                  onChange={(e) => setArv(e.target.value)}
                  className="pl-10"
                  data-testid="input-arv-value"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="holdingCosts">Holding Costs</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="holdingCosts"
                  type="number"
                  placeholder="15000"
                  value={holdingCosts}
                  onChange={(e) => setHoldingCosts(e.target.value)}
                  className="pl-10"
                  data-testid="input-arv-holding"
                />
              </div>
              <p className="text-xs text-muted-foreground">Include taxes, insurance, utilities during rehab</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button onClick={calculate} className="flex-1 sm:flex-none" data-testid="button-calculate-arv">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate
            </Button>
            <Button variant="outline" onClick={reset} data-testid="button-reset-arv">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Investment</p>
                <p className="text-xl font-bold" data-testid="result-total-investment">
                  {formatCurrency(results.totalInvestment)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
                <p className={`text-xl font-bold ${results.netProfit >= 0 ? "text-green-500" : "text-red-500"}`} data-testid="result-net-profit">
                  {formatCurrency(results.netProfit)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">ROI</p>
                <p className={`text-xl font-bold ${results.roi >= 20 ? "text-green-500" : results.roi >= 10 ? "text-amber-500" : "text-red-500"}`} data-testid="result-roi">
                  {results.roi.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-4 rounded-lg ${results.meetsRule ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
              {results.meetsRule ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className={`font-medium ${results.meetsRule ? "text-green-500" : "text-red-500"}`}>
                  {results.meetsRule ? "Meets 70% Rule" : "Does Not Meet 70% Rule"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Max purchase: {formatCurrency(results.seventyPercentRule)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ROICalculator() {
  const [purchasePrice, setPurchasePrice] = useState("");
  const [downPayment, setDownPayment] = useState("25");
  const [rehabCost, setRehabCost] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [loanRate, setLoanRate] = useState("7.5");
  const [loanTerm, setLoanTerm] = useState("30");
  const [results, setResults] = useState<{
    downPaymentAmount: number;
    loanAmount: number;
    monthlyMortgage: number;
    monthlyCashFlow: number;
    annualCashFlow: number;
    totalCashInvested: number;
    cashOnCashReturn: number;
    capRate: number;
  } | null>(null);

  const calculate = () => {
    const purchase = parseFloat(purchasePrice) || 0;
    const dpPercent = parseFloat(downPayment) || 25;
    const rehab = parseFloat(rehabCost) || 0;
    const rent = parseFloat(monthlyRent) || 0;
    const expenses = parseFloat(monthlyExpenses) || 0;
    const rate = parseFloat(loanRate) || 7.5;
    const term = parseFloat(loanTerm) || 30;

    const downPaymentAmount = purchase * (dpPercent / 100);
    const loanAmount = purchase - downPaymentAmount;
    
    const monthlyRate = rate / 100 / 12;
    const numPayments = term * 12;
    const monthlyMortgage = loanAmount > 0 
      ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
      : 0;

    const monthlyCashFlow = rent - expenses - monthlyMortgage;
    const annualCashFlow = monthlyCashFlow * 12;
    const totalCashInvested = downPaymentAmount + rehab;
    const cashOnCashReturn = totalCashInvested > 0 ? (annualCashFlow / totalCashInvested) * 100 : 0;
    
    const annualNOI = (rent - expenses) * 12;
    const capRate = purchase > 0 ? (annualNOI / purchase) * 100 : 0;

    setResults({
      downPaymentAmount,
      loanAmount,
      monthlyMortgage,
      monthlyCashFlow,
      annualCashFlow,
      totalCashInvested,
      cashOnCashReturn,
      capRate,
    });
  };

  const reset = () => {
    setPurchasePrice("");
    setDownPayment("25");
    setRehabCost("");
    setMonthlyRent("");
    setMonthlyExpenses("");
    setLoanRate("7.5");
    setLoanTerm("30");
    setResults(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>ROI Calculator</CardTitle>
              <CardDescription>
                Analyze rental property returns and cash flow
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="roiPurchase">Purchase Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="roiPurchase"
                  type="number"
                  placeholder="250000"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="pl-10"
                  data-testid="input-roi-purchase"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="downPayment">Down Payment (%)</Label>
              <Input
                id="downPayment"
                type="number"
                placeholder="25"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                data-testid="input-roi-downpayment"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="roiRehab">Rehab Cost</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="roiRehab"
                  type="number"
                  placeholder="30000"
                  value={rehabCost}
                  onChange={(e) => setRehabCost(e.target.value)}
                  className="pl-10"
                  data-testid="input-roi-rehab"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monthlyRent">Monthly Rent</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="monthlyRent"
                  type="number"
                  placeholder="2000"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  className="pl-10"
                  data-testid="input-roi-rent"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monthlyExpenses">Monthly Expenses</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="monthlyExpenses"
                  type="number"
                  placeholder="500"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(e.target.value)}
                  className="pl-10"
                  data-testid="input-roi-expenses"
                />
              </div>
              <p className="text-xs text-muted-foreground">Include taxes, insurance, maintenance, vacancy</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button onClick={calculate} className="flex-1 sm:flex-none" data-testid="button-calculate-roi">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate
            </Button>
            <Button variant="outline" onClick={reset} data-testid="button-reset-roi">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Investment Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Monthly Cash Flow</p>
                <p className={`text-xl font-bold ${results.monthlyCashFlow >= 0 ? "text-green-500" : "text-red-500"}`} data-testid="result-monthly-cashflow">
                  {formatCurrency(results.monthlyCashFlow)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Cash-on-Cash Return</p>
                <p className={`text-xl font-bold ${results.cashOnCashReturn >= 10 ? "text-green-500" : results.cashOnCashReturn >= 6 ? "text-amber-500" : "text-red-500"}`} data-testid="result-coc">
                  {results.cashOnCashReturn.toFixed(1)}%
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Cap Rate</p>
                <p className="text-xl font-bold" data-testid="result-cap-rate">
                  {results.capRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BRRRRCalculator() {
  const [purchasePrice, setPurchasePrice] = useState("");
  const [rehabCost, setRehabCost] = useState("");
  const [arv, setArv] = useState("");
  const [refinanceLTV, setRefinanceLTV] = useState("75");
  const [results, setResults] = useState<{
    totalCashIn: number;
    refinanceAmount: number;
    cashBack: number;
    moneyLeftInDeal: number;
    infiniteReturn: boolean;
  } | null>(null);

  const calculate = () => {
    const purchase = parseFloat(purchasePrice) || 0;
    const rehab = parseFloat(rehabCost) || 0;
    const afterRepairValue = parseFloat(arv) || 0;
    const ltv = parseFloat(refinanceLTV) || 75;

    const totalCashIn = purchase + rehab;
    const refinanceAmount = afterRepairValue * (ltv / 100);
    const cashBack = refinanceAmount;
    const moneyLeftInDeal = totalCashIn - cashBack;
    const infiniteReturn = moneyLeftInDeal <= 0;

    setResults({
      totalCashIn,
      refinanceAmount,
      cashBack,
      moneyLeftInDeal,
      infiniteReturn,
    });
  };

  const reset = () => {
    setPurchasePrice("");
    setRehabCost("");
    setArv("");
    setRefinanceLTV("75");
    setResults(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>BRRRR Calculator</CardTitle>
              <CardDescription>
                Buy, Rehab, Rent, Refinance, Repeat - Calculate your cash recycling
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/30 rounded-lg border">
            <h4 className="font-medium text-sm mb-2">What is BRRRR?</h4>
            <p className="text-xs text-muted-foreground">
              BRRRR is a strategy where you buy distressed properties, rehab them, rent them out, refinance to pull your cash out, then repeat with the same capital.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="brrrrPurchase">Purchase Price (All Cash)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="brrrrPurchase"
                  type="number"
                  placeholder="150000"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="pl-10"
                  data-testid="input-brrrr-purchase"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brrrrRehab">Rehab Cost</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="brrrrRehab"
                  type="number"
                  placeholder="50000"
                  value={rehabCost}
                  onChange={(e) => setRehabCost(e.target.value)}
                  className="pl-10"
                  data-testid="input-brrrr-rehab"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brrrrARV">After Repair Value (ARV)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="brrrrARV"
                  type="number"
                  placeholder="280000"
                  value={arv}
                  onChange={(e) => setArv(e.target.value)}
                  className="pl-10"
                  data-testid="input-brrrr-arv"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="refinanceLTV">Refinance LTV (%)</Label>
              <Input
                id="refinanceLTV"
                type="number"
                placeholder="75"
                value={refinanceLTV}
                onChange={(e) => setRefinanceLTV(e.target.value)}
                data-testid="input-brrrr-ltv"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button onClick={calculate} className="flex-1 sm:flex-none" data-testid="button-calculate-brrrr">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate
            </Button>
            <Button variant="outline" onClick={reset} data-testid="button-reset-brrrr">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              BRRRR Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Cash In</p>
                <p className="text-xl font-bold" data-testid="result-cash-in">
                  {formatCurrency(results.totalCashIn)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Cash Back from Refi</p>
                <p className="text-xl font-bold text-green-500" data-testid="result-cash-back">
                  {formatCurrency(results.cashBack)}
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-4 rounded-lg ${results.infiniteReturn ? "bg-green-500/10 border border-green-500/20" : "bg-amber-500/10 border border-amber-500/20"}`}>
              {results.infiniteReturn ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <p className={`font-medium ${results.infiniteReturn ? "text-green-500" : "text-amber-500"}`}>
                  {results.infiniteReturn ? "Infinite Return Achieved!" : `${formatCurrency(results.moneyLeftInDeal)} Left in Deal`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {results.infiniteReturn ? "You can recycle 100% of your capital" : "You won't fully recycle your capital"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CashFlowCalculator() {
  const [monthlyRent, setMonthlyRent] = useState("");
  const [mortgage, setMortgage] = useState("");
  const [taxes, setTaxes] = useState("");
  const [insurance, setInsurance] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [vacancyRate, setVacancyRate] = useState("8");
  const [results, setResults] = useState<{
    effectiveRent: number;
    totalExpenses: number;
    monthlyCashFlow: number;
    annualCashFlow: number;
    expenseRatio: number;
  } | null>(null);

  const calculate = () => {
    const rent = parseFloat(monthlyRent) || 0;
    const mortgagePayment = parseFloat(mortgage) || 0;
    const taxesMonthly = parseFloat(taxes) || 0;
    const insuranceMonthly = parseFloat(insurance) || 0;
    const maintenanceMonthly = parseFloat(maintenance) || 0;
    const vacancy = parseFloat(vacancyRate) || 8;

    const effectiveRent = rent * (1 - vacancy / 100);
    const totalExpenses = mortgagePayment + taxesMonthly + insuranceMonthly + maintenanceMonthly;
    const monthlyCashFlow = effectiveRent - totalExpenses;
    const annualCashFlow = monthlyCashFlow * 12;
    const expenseRatio = rent > 0 ? (totalExpenses / rent) * 100 : 0;

    setResults({
      effectiveRent,
      totalExpenses,
      monthlyCashFlow,
      annualCashFlow,
      expenseRatio,
    });
  };

  const reset = () => {
    setMonthlyRent("");
    setMortgage("");
    setTaxes("");
    setInsurance("");
    setMaintenance("");
    setVacancyRate("8");
    setResults(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Cash Flow Calculator</CardTitle>
              <CardDescription>
                Analyze monthly rental income vs expenses
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cfRent">Monthly Rent</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="cfRent"
                  type="number"
                  placeholder="2000"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  className="pl-10"
                  data-testid="input-cf-rent"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cfMortgage">Monthly Mortgage</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="cfMortgage"
                  type="number"
                  placeholder="1200"
                  value={mortgage}
                  onChange={(e) => setMortgage(e.target.value)}
                  className="pl-10"
                  data-testid="input-cf-mortgage"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cfTaxes">Monthly Taxes</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="cfTaxes"
                  type="number"
                  placeholder="200"
                  value={taxes}
                  onChange={(e) => setTaxes(e.target.value)}
                  className="pl-10"
                  data-testid="input-cf-taxes"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cfInsurance">Monthly Insurance</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="cfInsurance"
                  type="number"
                  placeholder="100"
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  className="pl-10"
                  data-testid="input-cf-insurance"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cfMaintenance">Monthly Maintenance</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="cfMaintenance"
                  type="number"
                  placeholder="150"
                  value={maintenance}
                  onChange={(e) => setMaintenance(e.target.value)}
                  className="pl-10"
                  data-testid="input-cf-maintenance"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vacancyRate">Vacancy Rate (%)</Label>
              <Input
                id="vacancyRate"
                type="number"
                placeholder="8"
                value={vacancyRate}
                onChange={(e) => setVacancyRate(e.target.value)}
                data-testid="input-cf-vacancy"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button onClick={calculate} className="flex-1 sm:flex-none" data-testid="button-calculate-cf">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate
            </Button>
            <Button variant="outline" onClick={reset} data-testid="button-reset-cf">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Cash Flow Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Monthly Cash Flow</p>
                <p className={`text-xl font-bold ${results.monthlyCashFlow >= 0 ? "text-green-500" : "text-red-500"}`} data-testid="result-monthly-cf">
                  {formatCurrency(results.monthlyCashFlow)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Annual Cash Flow</p>
                <p className={`text-xl font-bold ${results.annualCashFlow >= 0 ? "text-green-500" : "text-red-500"}`} data-testid="result-annual-cf">
                  {formatCurrency(results.annualCashFlow)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Expense Ratio</p>
                <p className="text-xl font-bold" data-testid="result-expense-ratio">
                  {results.expenseRatio.toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function WholesaleCalculator() {
  const [arv, setArv] = useState("");
  const [rehabCost, setRehabCost] = useState("");
  const [assignmentFee, setAssignmentFee] = useState("10000");
  const [results, setResults] = useState<{
    maxOffer: number;
    maxOfferWithFee: number;
    potentialProfit: number;
  } | null>(null);

  const calculate = () => {
    const afterRepairValue = parseFloat(arv) || 0;
    const rehab = parseFloat(rehabCost) || 0;
    const fee = parseFloat(assignmentFee) || 10000;

    const maxOffer = afterRepairValue * 0.7 - rehab;
    const maxOfferWithFee = maxOffer - fee;
    const potentialProfit = fee;

    setResults({
      maxOffer,
      maxOfferWithFee,
      potentialProfit,
    });
  };

  const reset = () => {
    setArv("");
    setRehabCost("");
    setAssignmentFee("10000");
    setResults(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Handshake className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Wholesale Calculator</CardTitle>
              <CardDescription>
                Calculate your maximum allowable offer for wholesale deals
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="wsArv">After Repair Value (ARV)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="wsArv"
                  type="number"
                  placeholder="300000"
                  value={arv}
                  onChange={(e) => setArv(e.target.value)}
                  className="pl-10"
                  data-testid="input-ws-arv"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="wsRehab">Estimated Rehab Cost</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="wsRehab"
                  type="number"
                  placeholder="40000"
                  value={rehabCost}
                  onChange={(e) => setRehabCost(e.target.value)}
                  className="pl-10"
                  data-testid="input-ws-rehab"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignmentFee">Your Assignment Fee</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="assignmentFee"
                  type="number"
                  placeholder="10000"
                  value={assignmentFee}
                  onChange={(e) => setAssignmentFee(e.target.value)}
                  className="pl-10"
                  data-testid="input-ws-fee"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button onClick={calculate} className="flex-1 sm:flex-none" data-testid="button-calculate-ws">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate
            </Button>
            <Button variant="outline" onClick={reset} data-testid="button-reset-ws">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="w-5 h-5 text-primary" />
              Wholesale Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Max Offer to Seller</p>
                <p className="text-xl font-bold" data-testid="result-max-offer">
                  {formatCurrency(results.maxOfferWithFee)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Contract Price to Investor</p>
                <p className="text-xl font-bold" data-testid="result-investor-price">
                  {formatCurrency(results.maxOffer)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Your Profit</p>
                <p className="text-xl font-bold text-green-500" data-testid="result-profit">
                  {formatCurrency(results.potentialProfit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
