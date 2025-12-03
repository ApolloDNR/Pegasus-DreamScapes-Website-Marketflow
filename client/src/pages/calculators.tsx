import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator, 
  TrendingUp, 
  Home, 
  DollarSign,
  Percent,
  ArrowRight,
  RotateCcw,
  BarChart3,
  RefreshCw,
  Building2,
  Wallet,
  PiggyBank,
  CheckCircle2,
  AlertCircle,
  Handshake,
  Target
} from "lucide-react";
import { Link } from "wouter";

export default function Calculators() {
  return (
    <div className="min-h-screen pt-20">
      <HeroSection />
      <CalculatorTabs />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute top-20 right-20 w-96 h-96 bg-tan/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <Badge variant="outline" className="mb-6 border-tan/30 text-tan">
          Professional Investment Tools
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight" data-testid="text-calculators-hero">
          DEAL CALCULATORS
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Run the numbers on your next real estate deal. Our suite of professional calculators helps you analyze property values, investment returns, and cash flow projections.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm">No signup required</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm">Instant results</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm">Pro-level analysis</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CalculatorTabs() {
  return (
    <section className="py-12 lg:py-20 border-t border-border bg-tan/5">
      <div className="max-w-5xl mx-auto px-6">
        <Tabs defaultValue="arv" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-8 h-auto p-1">
            <TabsTrigger value="arv" className="flex items-center gap-2 py-3" data-testid="tab-arv">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">ARV</span> Calculator
            </TabsTrigger>
            <TabsTrigger value="roi" className="flex items-center gap-2 py-3" data-testid="tab-roi">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">ROI</span> Calculator
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
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Put These Numbers to Work?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Our team can provide detailed deal analysis and help you find opportunities that match your investment criteria.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sell">
            <Button size="lg" className="gap-2" data-testid="button-cta-sell">
              <Building2 className="w-5 h-5" />
              Submit a Property
            </Button>
          </Link>
          <Link href="/invest">
            <Button size="lg" variant="outline" className="gap-2" data-testid="button-cta-invest">
              <Wallet className="w-5 h-5" />
              Become an Investor
            </Button>
          </Link>
        </div>
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
      <Card className="border-tan/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Home className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>ARV Calculator</CardTitle>
              <CardDescription>
                For flippers: Estimate your profit and check against the 70% rule
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
                  data-testid="input-arv-closing"
                />
              </div>
              <p className="text-xs text-muted-foreground">Agent commissions + title fees (typically 6-10%)</p>
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
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Deal Analysis Results
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
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="p-6 bg-background rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Return on Investment</p>
                <p className={`text-3xl font-bold ${results.roi >= 15 ? "text-green-500" : results.roi >= 0 ? "text-amber-500" : "text-red-500"}`} data-testid="result-roi">
                  {results.roi.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">Target: 15%+ for fix & flip</p>
              </div>
              <div className="p-6 bg-background rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">70% Rule Max Purchase</p>
                <p className="text-xl font-bold" data-testid="result-70-rule">
                  {formatCurrency(results.seventyPercentRule)}
                </p>
                <Badge className={`mt-2 ${results.meetsRule ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"}`}>
                  {results.meetsRule ? "Meets 70% Rule" : "Above Threshold"}
                </Badge>
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
      <Card className="border-tan/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Investment ROI Calculator</CardTitle>
              <CardDescription>
                Calculate cash-on-cash return and cap rate for rental properties
              </CardDescription>
            </div>
          </div>
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

function BRRRRCalculator() {
  const [purchasePrice, setPurchasePrice] = useState("");
  const [rehabCost, setRehabCost] = useState("");
  const [arv, setArv] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [refinanceLTV, setRefinanceLTV] = useState("75");
  const [refinanceRate, setRefinanceRate] = useState("7.5");
  const [results, setResults] = useState<{
    totalCashIn: number;
    refinanceValue: number;
    cashBack: number;
    cashLeftInDeal: number;
    monthlyMortgage: number;
    monthlyCashFlow: number;
    cashOnCash: number;
    infiniteReturn: boolean;
  } | null>(null);

  const calculate = () => {
    const purchase = parseFloat(purchasePrice) || 0;
    const rehab = parseFloat(rehabCost) || 0;
    const afterRepairValue = parseFloat(arv) || 0;
    const rent = parseFloat(monthlyRent) || 0;
    const expenses = parseFloat(monthlyExpenses) || 0;
    const ltv = parseFloat(refinanceLTV) || 75;
    const rate = parseFloat(refinanceRate) || 7.5;

    const totalCashIn = purchase + rehab;
    const refinanceValue = afterRepairValue * (ltv / 100);
    const cashBack = refinanceValue;
    const cashLeftInDeal = Math.max(0, totalCashIn - cashBack);
    
    const monthlyRate = rate / 100 / 12;
    const numPayments = 30 * 12;
    const monthlyMortgage = refinanceValue > 0
      ? refinanceValue * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
      : 0;

    const monthlyCashFlow = rent - expenses - monthlyMortgage;
    const annualCashFlow = monthlyCashFlow * 12;
    const cashOnCash = cashLeftInDeal > 0 ? (annualCashFlow / cashLeftInDeal) * 100 : 0;
    const infiniteReturn = cashLeftInDeal <= 0 && monthlyCashFlow > 0;

    setResults({
      totalCashIn,
      refinanceValue,
      cashBack,
      cashLeftInDeal,
      monthlyMortgage,
      monthlyCashFlow,
      cashOnCash,
      infiniteReturn,
    });
  };

  const reset = () => {
    setPurchasePrice("");
    setRehabCost("");
    setArv("");
    setMonthlyRent("");
    setMonthlyExpenses("");
    setRefinanceLTV("75");
    setRefinanceRate("7.5");
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
      <Card className="border-tan/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-tan/20 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-tan" />
            </div>
            <div>
              <CardTitle>BRRRR Calculator</CardTitle>
              <CardDescription>
                Buy, Rehab, Rent, Refinance, Repeat - Calculate your cash recycling potential
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-tan/5 rounded-lg border border-tan/20">
            <h4 className="font-medium text-sm mb-2 text-tan">What is BRRRR?</h4>
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
              <Label htmlFor="brrrrLTV">Refinance LTV (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="brrrrLTV"
                  type="number"
                  placeholder="75"
                  value={refinanceLTV}
                  onChange={(e) => setRefinanceLTV(e.target.value)}
                  className="pl-10"
                  data-testid="input-brrrr-ltv"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brrrrRent">Monthly Rent</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="brrrrRent"
                  type="number"
                  placeholder="2200"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  className="pl-10"
                  data-testid="input-brrrr-rent"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brrrrExpenses">Monthly Expenses</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="brrrrExpenses"
                  type="number"
                  placeholder="600"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(e.target.value)}
                  className="pl-10"
                  data-testid="input-brrrr-expenses"
                />
              </div>
              <p className="text-xs text-muted-foreground">Taxes, insurance, maintenance, vacancy</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={calculate} className="flex-1 bg-tan text-tan-foreground hover:bg-tan/90" data-testid="button-calculate-brrrr">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate BRRRR
            </Button>
            <Button variant="outline" onClick={reset} data-testid="button-reset-brrrr">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card className="border-tan/30 bg-gradient-to-br from-card to-tan/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-tan" />
              BRRRR Analysis Results
              {results.infiniteReturn && (
                <Badge className="bg-green-500/10 text-green-500 ml-2">Infinite Return!</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Cash In</p>
                <p className="text-xl font-bold" data-testid="result-brrrr-cashin">
                  {formatCurrency(results.totalCashIn)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Refinance Amount</p>
                <p className="text-xl font-bold text-tan" data-testid="result-brrrr-refi">
                  {formatCurrency(results.refinanceValue)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Cash Back at Refi</p>
                <p className="text-xl font-bold text-green-500" data-testid="result-brrrr-cashback">
                  {formatCurrency(results.cashBack)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Cash Left in Deal</p>
                <p className={`text-xl font-bold ${results.cashLeftInDeal <= 0 ? 'text-green-500' : ''}`} data-testid="result-brrrr-cashleft">
                  {formatCurrency(results.cashLeftInDeal)}
                </p>
              </div>
            </div>

            <div className="p-4 bg-background rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Cash Recycled</span>
                <span className="text-sm font-medium">
                  {Math.min(100, (results.cashBack / results.totalCashIn) * 100).toFixed(0)}%
                </span>
              </div>
              <Progress value={Math.min(100, (results.cashBack / results.totalCashIn) * 100)} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="p-4 bg-background rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">New Mortgage</p>
                <p className="text-lg font-bold" data-testid="result-brrrr-mortgage">
                  {formatCurrency(results.monthlyMortgage)}/mo
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Monthly Cash Flow</p>
                <p className={`text-lg font-bold ${results.monthlyCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`} data-testid="result-brrrr-cashflow">
                  {formatCurrency(results.monthlyCashFlow)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Cash-on-Cash</p>
                <p className={`text-lg font-bold ${results.infiniteReturn ? 'text-green-500' : ''}`} data-testid="result-brrrr-coc">
                  {results.infiniteReturn ? 'Infinite' : `${results.cashOnCash.toFixed(1)}%`}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                Want help finding BRRRR-eligible properties? Our team specializes in identifying high-potential distressed properties.
              </p>
              <Link href="/invest">
                <Button className="bg-tan text-tan-foreground hover:bg-tan/90" data-testid="button-brrrr-cta">
                  Join Investor Network
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

function CashFlowCalculator() {
  const [grossRent, setGrossRent] = useState("");
  const [vacancy, setVacancy] = useState("5");
  const [propertyTax, setPropertyTax] = useState("");
  const [insurance, setInsurance] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [management, setManagement] = useState("10");
  const [utilities, setUtilities] = useState("");
  const [mortgage, setMortgage] = useState("");
  const [otherExpenses, setOtherExpenses] = useState("");
  const [results, setResults] = useState<{
    effectiveGrossIncome: number;
    totalExpenses: number;
    noi: number;
    monthlyCashFlow: number;
    annualCashFlow: number;
    expenseRatio: number;
    cashFlowPerUnit: number;
  } | null>(null);

  const calculate = () => {
    const rent = parseFloat(grossRent) || 0;
    const vacancyPercent = parseFloat(vacancy) || 5;
    const tax = parseFloat(propertyTax) || 0;
    const ins = parseFloat(insurance) || 0;
    const maint = parseFloat(maintenance) || 0;
    const mgmt = parseFloat(management) || 10;
    const util = parseFloat(utilities) || 0;
    const mort = parseFloat(mortgage) || 0;
    const other = parseFloat(otherExpenses) || 0;

    const vacancyLoss = rent * (vacancyPercent / 100);
    const effectiveGrossIncome = rent - vacancyLoss;
    const managementCost = rent * (mgmt / 100);
    const operatingExpenses = tax + ins + maint + managementCost + util + other;
    const noi = effectiveGrossIncome - operatingExpenses;
    const monthlyCashFlow = noi - mort;
    const annualCashFlow = monthlyCashFlow * 12;
    const expenseRatio = rent > 0 ? (operatingExpenses / rent) * 100 : 0;

    setResults({
      effectiveGrossIncome,
      totalExpenses: operatingExpenses + mort,
      noi,
      monthlyCashFlow,
      annualCashFlow,
      expenseRatio,
      cashFlowPerUnit: monthlyCashFlow,
    });
  };

  const reset = () => {
    setGrossRent("");
    setVacancy("5");
    setPropertyTax("");
    setInsurance("");
    setMaintenance("");
    setManagement("10");
    setUtilities("");
    setMortgage("");
    setOtherExpenses("");
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
      <Card className="border-tan/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Cash Flow Analyzer</CardTitle>
              <CardDescription>
                Detailed monthly cash flow breakdown for rental properties
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-tan uppercase tracking-wider">Income</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="grossRent">Gross Monthly Rent</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="grossRent"
                    type="number"
                    placeholder="3000"
                    value={grossRent}
                    onChange={(e) => setGrossRent(e.target.value)}
                    className="pl-10"
                    data-testid="input-cf-rent"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vacancy">Vacancy Rate (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="vacancy"
                    type="number"
                    placeholder="5"
                    value={vacancy}
                    onChange={(e) => setVacancy(e.target.value)}
                    className="pl-10"
                    data-testid="input-cf-vacancy"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-tan uppercase tracking-wider">Operating Expenses</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="propertyTax">Property Tax (Monthly)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="propertyTax"
                    type="number"
                    placeholder="400"
                    value={propertyTax}
                    onChange={(e) => setPropertyTax(e.target.value)}
                    className="pl-10"
                    data-testid="input-cf-tax"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance">Insurance (Monthly)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="insurance"
                    type="number"
                    placeholder="150"
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                    className="pl-10"
                    data-testid="input-cf-insurance"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenance">Repairs/Maintenance</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="maintenance"
                    type="number"
                    placeholder="200"
                    value={maintenance}
                    onChange={(e) => setMaintenance(e.target.value)}
                    className="pl-10"
                    data-testid="input-cf-maintenance"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="management">Property Mgmt (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="management"
                    type="number"
                    placeholder="10"
                    value={management}
                    onChange={(e) => setManagement(e.target.value)}
                    className="pl-10"
                    data-testid="input-cf-management"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="utilities">Utilities (if paid)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="utilities"
                    type="number"
                    placeholder="0"
                    value={utilities}
                    onChange={(e) => setUtilities(e.target.value)}
                    className="pl-10"
                    data-testid="input-cf-utilities"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherExpenses">Other Expenses</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="otherExpenses"
                    type="number"
                    placeholder="0"
                    value={otherExpenses}
                    onChange={(e) => setOtherExpenses(e.target.value)}
                    className="pl-10"
                    data-testid="input-cf-other"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-tan uppercase tracking-wider">Debt Service</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="mortgage">Monthly Mortgage Payment</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="mortgage"
                    type="number"
                    placeholder="1500"
                    value={mortgage}
                    onChange={(e) => setMortgage(e.target.value)}
                    className="pl-10"
                    data-testid="input-cf-mortgage"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={calculate} className="flex-1" data-testid="button-calculate-cashflow">
              <Calculator className="w-4 h-4 mr-2" />
              Analyze Cash Flow
            </Button>
            <Button variant="outline" onClick={reset} data-testid="button-reset-cashflow">
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
              <PiggyBank className="w-5 h-5 text-primary" />
              Cash Flow Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Effective Gross Income</p>
                <p className="text-xl font-bold text-green-500" data-testid="result-cf-egi">
                  {formatCurrency(results.effectiveGrossIncome)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                <p className="text-xl font-bold text-red-400" data-testid="result-cf-expenses">
                  {formatCurrency(results.totalExpenses)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">NOI (Before Debt)</p>
                <p className="text-xl font-bold" data-testid="result-cf-noi">
                  {formatCurrency(results.noi)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="p-6 bg-background rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Monthly Cash Flow</p>
                <p className={`text-3xl font-bold ${results.monthlyCashFlow >= 0 ? "text-green-500" : "text-red-500"}`} data-testid="result-cf-monthly">
                  {formatCurrency(results.monthlyCashFlow)}
                </p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {results.monthlyCashFlow >= 200 ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-500">Strong cash flow</span>
                    </>
                  ) : results.monthlyCashFlow >= 0 ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-xs text-amber-500">Marginal</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-red-500">Negative cash flow</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-6 bg-background rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Annual Cash Flow</p>
                <p className={`text-3xl font-bold ${results.annualCashFlow >= 0 ? "text-green-500" : "text-red-500"}`} data-testid="result-cf-annual">
                  {formatCurrency(results.annualCashFlow)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Expense Ratio: {results.expenseRatio.toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                Looking for properties with strong cash flow potential? We can help identify opportunities in your target market.
              </p>
              <Link href="/invest">
                <Button data-testid="button-cashflow-cta">
                  Explore Opportunities
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

function WholesaleCalculator() {
  const [arv, setArv] = useState("");
  const [rehabCost, setRehabCost] = useState("");
  const [buyerProfit, setBuyerProfit] = useState("25");
  const [closingCosts, setClosingCosts] = useState("6");
  const [holdingCosts, setHoldingCosts] = useState("");
  const [desiredAssignmentFee, setDesiredAssignmentFee] = useState("");
  const [results, setResults] = useState<{
    mao: number;
    buyerExpectedProfit: number;
    maxOfferWithFee: number;
    dealViability: "great" | "good" | "marginal" | "not_viable";
    netSpread: number;
    assignmentFeePercent: number;
  } | null>(null);

  const calculate = () => {
    const afterRepairValue = parseFloat(arv) || 0;
    const rehab = parseFloat(rehabCost) || 0;
    const profitPercent = parseFloat(buyerProfit) || 25;
    const closingPercent = parseFloat(closingCosts) || 6;
    const holding = parseFloat(holdingCosts) || 0;
    const assignmentFee = parseFloat(desiredAssignmentFee) || 0;

    const closingAmount = afterRepairValue * (closingPercent / 100);
    const buyerExpectedProfit = afterRepairValue * (profitPercent / 100);
    const mao = afterRepairValue - rehab - holding - closingAmount - buyerExpectedProfit;
    const maxOfferWithFee = Math.max(0, mao - assignmentFee);
    const netSpread = mao - assignmentFee;
    const assignmentFeePercent = mao > 0 ? (assignmentFee / mao) * 100 : 0;

    let dealViability: "great" | "good" | "marginal" | "not_viable" = "not_viable";
    if (mao > 0) {
      if (assignmentFee === 0 && mao > 0) {
        dealViability = "good";
      } else if (assignmentFee >= 10000 && netSpread >= 0 && assignmentFeePercent <= 40) {
        dealViability = "great";
      } else if (assignmentFee >= 5000 && netSpread >= 0 && assignmentFeePercent <= 60) {
        dealViability = "good";
      } else if (netSpread >= 0 && assignmentFee > 0) {
        dealViability = "marginal";
      }
    }

    setResults({
      mao,
      buyerExpectedProfit,
      maxOfferWithFee,
      dealViability,
      netSpread,
      assignmentFeePercent,
    });
  };

  const reset = () => {
    setArv("");
    setRehabCost("");
    setBuyerProfit("25");
    setClosingCosts("6");
    setHoldingCosts("");
    setDesiredAssignmentFee("");
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
      <Card className="border-tan/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Handshake className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle>Wholesale Deal Analyzer</CardTitle>
              <CardDescription>
                Calculate your Maximum Allowable Offer (MAO) and assignment fee potential
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/20">
            <h4 className="font-medium text-sm mb-2 text-green-700 dark:text-green-400 flex items-center gap-2">
              <Target className="w-4 h-4" />
              How MAO Works
            </h4>
            <p className="text-xs text-muted-foreground">
              MAO = ARV - Rehab - Holding Costs - Closing Costs - Buyer's Expected Profit. 
              Your purchase price should be below MAO minus your desired assignment fee.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="wholesaleArv">After Repair Value (ARV)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="wholesaleArv"
                  type="number"
                  placeholder="300000"
                  value={arv}
                  onChange={(e) => setArv(e.target.value)}
                  className="pl-10"
                  data-testid="input-wholesale-arv"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="wholesaleRehab">Estimated Rehab Cost</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="wholesaleRehab"
                  type="number"
                  placeholder="50000"
                  value={rehabCost}
                  onChange={(e) => setRehabCost(e.target.value)}
                  className="pl-10"
                  data-testid="input-wholesale-rehab"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="buyerProfit">Buyer's Expected Profit (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="buyerProfit"
                  type="number"
                  placeholder="25"
                  value={buyerProfit}
                  onChange={(e) => setBuyerProfit(e.target.value)}
                  className="pl-10"
                  data-testid="input-wholesale-profit"
                />
              </div>
              <p className="text-xs text-muted-foreground">Typically 20-30% of ARV for fix & flip</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="wholesaleClosing">Buyer's Closing Costs (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="wholesaleClosing"
                  type="number"
                  placeholder="6"
                  value={closingCosts}
                  onChange={(e) => setClosingCosts(e.target.value)}
                  className="pl-10"
                  data-testid="input-wholesale-closing"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="wholesaleHolding">Holding Costs</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="wholesaleHolding"
                  type="number"
                  placeholder="15000"
                  value={holdingCosts}
                  onChange={(e) => setHoldingCosts(e.target.value)}
                  className="pl-10"
                  data-testid="input-wholesale-holding"
                />
              </div>
              <p className="text-xs text-muted-foreground">Buyer's expected holding costs during rehab</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignmentFee">Your Desired Assignment Fee</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="assignmentFee"
                  type="number"
                  placeholder="10000"
                  value={desiredAssignmentFee}
                  onChange={(e) => setDesiredAssignmentFee(e.target.value)}
                  className="pl-10"
                  data-testid="input-wholesale-fee"
                />
              </div>
              <p className="text-xs text-muted-foreground">Your profit from assigning the contract</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={calculate} className="flex-1 bg-green-600 text-white hover:bg-green-700" data-testid="button-calculate-wholesale">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate MAO
            </Button>
            <Button variant="outline" onClick={reset} data-testid="button-reset-wholesale">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <Card className="border-green-500/30 bg-gradient-to-br from-card to-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Wholesale Deal Analysis
              <Badge className={`ml-2 ${
                results.dealViability === "great" ? "bg-green-500/10 text-green-600" :
                results.dealViability === "good" ? "bg-blue-500/10 text-blue-600" :
                results.dealViability === "marginal" ? "bg-amber-500/10 text-amber-600" :
                "bg-red-500/10 text-red-600"
              }`}>
                {results.dealViability === "great" ? "Great Deal" :
                 results.dealViability === "good" ? "Good Deal" :
                 results.dealViability === "marginal" ? "Marginal" : "Not Viable"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Maximum Allowable Offer</p>
                <p className={`text-xl font-bold ${results.mao > 0 ? "text-green-600" : "text-red-500"}`} data-testid="result-wholesale-mao">
                  {formatCurrency(results.mao)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Buyer's Expected Profit</p>
                <p className="text-xl font-bold" data-testid="result-wholesale-buyer-profit">
                  {formatCurrency(results.buyerExpectedProfit)}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Your Max Offer to Seller</p>
                <p className={`text-xl font-bold ${results.maxOfferWithFee > 0 ? "text-primary" : "text-red-500"}`} data-testid="result-wholesale-max-offer">
                  {formatCurrency(results.maxOfferWithFee)}
                </p>
              </div>
            </div>

            <div className="p-4 bg-background rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Assignment Fee as % of MAO</span>
                <span className="text-sm font-medium">
                  {results.assignmentFeePercent.toFixed(1)}%
                </span>
              </div>
              <Progress value={Math.min(100, results.assignmentFeePercent)} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                Target: Keep assignment fee under 50% of MAO for buyer appeal
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="p-6 bg-green-500/5 rounded-lg text-center border border-green-500/20">
                <p className="text-sm text-muted-foreground mb-2">Your Assignment Fee</p>
                <p className="text-3xl font-bold text-green-600" data-testid="result-wholesale-assignment-fee">
                  {formatCurrency(parseFloat(desiredAssignmentFee) || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {results.assignmentFeePercent > 0 ? `${results.assignmentFeePercent.toFixed(0)}% of MAO` : "No fee"}
                </p>
              </div>
              <div className="p-6 bg-background rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Total MAO Available</p>
                <p className={`text-3xl font-bold ${results.mao >= 0 ? "" : "text-red-500"}`} data-testid="result-wholesale-spread">
                  {formatCurrency(results.mao)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Maximum available for deal
                </p>
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm mb-3">Quick Reference</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Offer to Seller:</span>
                  <span className="font-medium">{formatCurrency(results.maxOfferWithFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assign to Buyer:</span>
                  <span className="font-medium">{formatCurrency(results.mao)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Profit:</span>
                  <span className="font-medium text-green-600">{formatCurrency(parseFloat(desiredAssignmentFee) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buyer's Profit:</span>
                  <span className="font-medium">{formatCurrency(results.buyerExpectedProfit)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                Looking for wholesale deals or buyers for your contracts? Join our marketplace to connect with active investors.
              </p>
              <Link href="/dealflow/deals">
                <Button className="bg-green-600 text-white hover:bg-green-700" data-testid="button-wholesale-cta">
                  Browse Wholesale Deals
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
