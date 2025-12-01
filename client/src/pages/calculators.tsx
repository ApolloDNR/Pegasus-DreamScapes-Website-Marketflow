import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  TrendingUp, 
  Home, 
  DollarSign,
  Percent,
  ArrowRight,
  RotateCcw
} from "lucide-react";
import { Link } from "wouter";

export default function Calculators() {
  return (
    <div className="min-h-screen pt-20">
      <HeroSection />
      <CalculatorTabs />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="py-20 lg:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
          <Calculator className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" data-testid="text-calculators-hero">
          Deal Calculators
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Run the numbers on your next real estate deal. Use our calculators to estimate property values, repair costs, and investment returns.
        </p>
      </div>
    </section>
  );
}

function CalculatorTabs() {
  return (
    <section className="py-12 lg:py-20 border-t border-border">
      <div className="max-w-4xl mx-auto px-6">
        <Tabs defaultValue="arv" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="arv" className="flex items-center gap-2" data-testid="tab-arv">
              <Home className="w-4 h-4" />
              ARV Calculator
            </TabsTrigger>
            <TabsTrigger value="roi" className="flex items-center gap-2" data-testid="tab-roi">
              <TrendingUp className="w-4 h-4" />
              ROI Calculator
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="arv">
            <ARVCalculator />
          </TabsContent>
          
          <TabsContent value="roi">
            <ROICalculator />
          </TabsContent>
        </Tabs>
      </div>
    </section>
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
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            After Repair Value (ARV) Calculator
          </CardTitle>
          <CardDescription>
            For sellers and flippers: Estimate your potential profit and check if the deal meets the 70% rule.
          </CardDescription>
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
                  placeholder="350000"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="pl-10"
                  data-testid="input-purchase-price"
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
                  placeholder="75000"
                  value={rehabCost}
                  onChange={(e) => setRehabCost(e.target.value)}
                  className="pl-10"
                  data-testid="input-rehab-cost"
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
                  placeholder="550000"
                  value={arv}
                  onChange={(e) => setArv(e.target.value)}
                  className="pl-10"
                  data-testid="input-arv"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="holdingCosts">Holding Costs (optional)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="holdingCosts"
                  type="number"
                  placeholder="15000"
                  value={holdingCosts}
                  onChange={(e) => setHoldingCosts(e.target.value)}
                  className="pl-10"
                  data-testid="input-holding-costs"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="closingCosts">Closing Costs (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="closingCosts"
                  type="number"
                  placeholder="6"
                  value={closingCosts}
                  onChange={(e) => setClosingCosts(e.target.value)}
                  className="pl-10"
                  data-testid="input-closing-costs"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={calculate} className="flex-1" data-testid="button-calculate-arv">
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
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Deal Analysis Results</CardTitle>
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
                <p className="text-sm text-muted-foreground mb-1">Gross Profit</p>
                <p className="text-xl font-bold" data-testid="result-gross-profit">
                  {formatCurrency(results.potentialProfit)}
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
                <p className={`text-xl font-bold ${results.roi >= 0 ? "text-green-500" : "text-red-500"}`} data-testid="result-roi">
                  {results.roi.toFixed(1)}%
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg col-span-2">
                <p className="text-sm text-muted-foreground mb-1">70% Rule Max Purchase</p>
                <p className="text-xl font-bold" data-testid="result-70-rule">
                  {formatCurrency(results.seventyPercentRule)}
                </p>
                <p className={`text-sm mt-1 ${results.meetsRule ? "text-green-500" : "text-amber-500"}`}>
                  {results.meetsRule ? "Deal meets the 70% rule" : "Above 70% rule threshold"}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                Want to discuss this deal with our team? We can provide a more detailed analysis and potentially make you an offer.
              </p>
              <Link href="/sell">
                <Button data-testid="button-arv-cta">
                  Submit Your Property
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
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
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Investment ROI Calculator
          </CardTitle>
          <CardDescription>
            For investors: Calculate your cash-on-cash return and cap rate for rental properties.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="roiPurchasePrice">Purchase Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="roiPurchasePrice"
                  type="number"
                  placeholder="400000"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="pl-10"
                  data-testid="input-roi-purchase"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="downPayment">Down Payment (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="downPayment"
                  type="number"
                  placeholder="25"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                  className="pl-10"
                  data-testid="input-down-payment"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="roiRehabCost">Rehab/Closing Costs</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="roiRehabCost"
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
              <Label htmlFor="loanRate">Interest Rate (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="loanRate"
                  type="number"
                  step="0.1"
                  placeholder="7.5"
                  value={loanRate}
                  onChange={(e) => setLoanRate(e.target.value)}
                  className="pl-10"
                  data-testid="input-loan-rate"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="monthlyRent">Monthly Rent Income</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="monthlyRent"
                  type="number"
                  placeholder="3500"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  className="pl-10"
                  data-testid="input-monthly-rent"
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
                  placeholder="800"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(e.target.value)}
                  className="pl-10"
                  data-testid="input-monthly-expenses"
                />
              </div>
              <p className="text-xs text-muted-foreground">Include taxes, insurance, maintenance, vacancy, management</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={calculate} className="flex-1" data-testid="button-calculate-roi">
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
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Investment Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Down Payment</p>
                <p className="text-xl font-bold" data-testid="result-down-payment">
                  {formatCurrency(results.downPaymentAmount)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Loan Amount</p>
                <p className="text-xl font-bold" data-testid="result-loan-amount">
                  {formatCurrency(results.loanAmount)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Monthly Mortgage</p>
                <p className="text-xl font-bold" data-testid="result-monthly-mortgage">
                  {formatCurrency(results.monthlyMortgage)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Monthly Cash Flow</p>
                <p className={`text-xl font-bold ${results.monthlyCashFlow >= 0 ? "text-green-500" : "text-red-500"}`} data-testid="result-monthly-cashflow">
                  {formatCurrency(results.monthlyCashFlow)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Annual Cash Flow</p>
                <p className={`text-xl font-bold ${results.annualCashFlow >= 0 ? "text-green-500" : "text-red-500"}`} data-testid="result-annual-cashflow">
                  {formatCurrency(results.annualCashFlow)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Cash Invested</p>
                <p className="text-xl font-bold" data-testid="result-cash-invested">
                  {formatCurrency(results.totalCashInvested)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="p-6 bg-background rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Cash-on-Cash Return</p>
                <p className={`text-3xl font-bold ${results.cashOnCashReturn >= 8 ? "text-green-500" : results.cashOnCashReturn >= 0 ? "text-amber-500" : "text-red-500"}`} data-testid="result-coc-return">
                  {results.cashOnCashReturn.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">Target: 8%+ for good deals</p>
              </div>
              <div className="p-6 bg-background rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Cap Rate</p>
                <p className={`text-3xl font-bold ${results.capRate >= 6 ? "text-green-500" : results.capRate >= 0 ? "text-amber-500" : "text-red-500"}`} data-testid="result-cap-rate">
                  {results.capRate.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">Target: 6%+ for rentals</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                Interested in partnering on deals like this? Join our investor network for access to vetted opportunities.
              </p>
              <Link href="/invest">
                <Button data-testid="button-roi-cta">
                  Become an Investor
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
