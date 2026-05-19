import { useState, useMemo, useEffect, useCallback } from "react";
import { useCalcLoad } from "@/lib/calc-load-bus";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from "recharts";
import { motion } from "framer-motion";
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
import { useSEO } from "@/hooks/use-seo";
import { 
  CalculatorActions, 
  AdvancedOptions, 
  MetricCard, 
  StatusIndicator, 
  DealGradeBadge,
  ProgressBar,
  calculateDealGrade,
  formatCurrency as formatCurrencyShared,
  PROJECTION_KEY,
  type ProjectionSpec,
} from "@/components/calculator-shared";
import { MyAnalysesDrawer } from "@/components/my-analyses-drawer";
import {
  SensitivityMatrixCard,
  BreakevenCard,
  ExitScenariosCard,
  ScenarioCompareCard,
} from "@/components/calculator-advanced";
import {
  amortizationSchedule,
  monthlyPayment,
  housingAffordability28_36,
  holdingCostStack,
  ownVsRentScenarios,
} from "@shared/lib/calculator-math";
import {
  computeArv,
  computeRoi,
  computeBrrrr,
  computeCashFlow,
  computeWholesale,
} from "@shared/strategy-lab/calculator-adapters";
import { CrossoverLineChart } from "@/components/calculator-charts";
import { Banknote, KeyRound, Coins } from "lucide-react";

// ──────────────────────────────────────────────────────────────────────────
// Projection helpers — yearly time-series rendered in PDFs and snapshot view.
// Stored on saved analysis results under PROJECTION_KEY so the chart renderer
// can pick it up without depending on calculator-specific output keys.
// ──────────────────────────────────────────────────────────────────────────

const PROJ_HORIZON_YEARS = 10;
const DEFAULT_RENT_GROWTH_PCT = 3;
const DEFAULT_EXPENSE_GROWTH_PCT = 2;
const DEFAULT_APPRECIATION_PCT = 3;

function buildBrrrrProjection(p: {
  monthlyRent: number;
  monthlyExpenses: number;
  monthlyMortgage: number;
  refinanceValue: number;
  refinanceRatePct: number;
  arv: number;
}): ProjectionSpec | null {
  if (p.arv <= 0 && p.monthlyRent <= 0) return null;
  const sched = amortizationSchedule(p.refinanceValue, p.refinanceRatePct, 30);
  const cashflow: { year: number; value: number }[] = [];
  const equity: { year: number; value: number }[] = [];
  let cumCf = 0;
  for (let y = 1; y <= PROJ_HORIZON_YEARS; y++) {
    const rent = p.monthlyRent * Math.pow(1 + DEFAULT_RENT_GROWTH_PCT / 100, y - 1);
    const exp = p.monthlyExpenses * Math.pow(1 + DEFAULT_EXPENSE_GROWTH_PCT / 100, y - 1);
    const monthlyCf = rent - exp - p.monthlyMortgage;
    cumCf += monthlyCf * 12;
    cashflow.push({ year: y, value: Math.round(cumCf) });
    const value = p.arv * Math.pow(1 + DEFAULT_APPRECIATION_PCT / 100, y);
    const bal = sched[Math.min(y * 12 - 1, sched.length - 1)]?.balance ?? 0;
    equity.push({ year: y, value: Math.round(Math.max(0, value - bal)) });
  }
  return {
    title: "BRRRR — 10-year cumulative cash flow & equity build",
    yLabel: "$",
    format: "currency",
    series: [
      { name: "Cumulative cash flow", points: cashflow },
      { name: "Equity (value − loan)", points: equity },
    ],
  };
}

function buildCashflowProjection(p: {
  monthlyCashFlow: number;
  monthlyRent: number;
  monthlyOpex: number;
  monthlyMortgage: number;
}): ProjectionSpec | null {
  if (p.monthlyRent <= 0) return null;
  const annual: { year: number; value: number }[] = [];
  const cum: { year: number; value: number }[] = [];
  let total = 0;
  for (let y = 1; y <= PROJ_HORIZON_YEARS; y++) {
    const rent = p.monthlyRent * Math.pow(1 + DEFAULT_RENT_GROWTH_PCT / 100, y - 1);
    const opex = p.monthlyOpex * Math.pow(1 + DEFAULT_EXPENSE_GROWTH_PCT / 100, y - 1);
    const monthly = rent - opex - p.monthlyMortgage;
    const yearly = Math.round(monthly * 12);
    annual.push({ year: y, value: yearly });
    total += yearly;
    cum.push({ year: y, value: total });
  }
  return {
    title: "Cash flow — 10-year projection (rent +3%/yr, opex +2%/yr)",
    yLabel: "$",
    format: "currency",
    series: [
      { name: "Annual cash flow", points: annual },
      { name: "Cumulative cash flow", points: cum },
    ],
  };
}

function buildArvProjection(p: {
  arv: number;
  totalInvestment: number;
}): ProjectionSpec | null {
  if (p.arv <= 0 || p.totalInvestment <= 0) return null;
  const value: { year: number; value: number }[] = [];
  const cost: { year: number; value: number }[] = [];
  for (let y = 0; y <= 5; y++) {
    value.push({
      year: y,
      value: Math.round(p.arv * Math.pow(1 + DEFAULT_APPRECIATION_PCT / 100, y)),
    });
    cost.push({ year: y, value: Math.round(p.totalInvestment) });
  }
  return {
    title: "ARV ramp — held-as-rental scenario at 3%/yr appreciation",
    yLabel: "$",
    format: "currency",
    series: [
      { name: "Property value", points: value },
      { name: "Total investment", points: cost },
    ],
  };
}

function buildOwnVsRentProjection(
  series: { year: number; ownNetWorth: number; rentNetWorth: number }[],
): ProjectionSpec | null {
  if (!series.length) return null;
  return {
    title: "Own vs Rent — net worth path (4%/yr appreciation)",
    yLabel: "$",
    format: "currency",
    series: [
      {
        name: "Owner net worth",
        points: series.map((s) => ({ year: s.year, value: Math.round(s.ownNetWorth) })),
      },
      {
        name: "Renter net worth",
        points: series.map((s) => ({ year: s.year, value: Math.round(s.rentNetWorth) })),
      },
    ],
  };
}

type CalcTabKey = (typeof CALC_TABS)[number];

const CALC_SEO: Record<CalcTabKey, { title: string; description: string }> = {
  arv: {
    title: "ARV Calculator — After Repair Value & 70% Rule",
    description: "Estimate fix-and-flip profit, ROI, and the 70% rule using purchase price, rehab, ARV, holding and closing costs. Free, no signup.",
  },
  roi: {
    title: "ROI Calculator — Real Estate Return on Investment",
    description: "Compute cash-on-cash return, total ROI, and break-even on a rental or flip. Operator-grade math, free and instant.",
  },
  brrrr: {
    title: "BRRRR Calculator — Buy, Rehab, Rent, Refinance, Repeat",
    description: "Model BRRRR: refinance proceeds, cash left in deal, cash flow, and 10-year equity build. Free, no signup.",
  },
  cashflow: {
    title: "Rental Cash Flow Calculator — Monthly & Annual",
    description: "Project monthly and annual rental cash flow with rent, expenses, and mortgage. 10-year projection included.",
  },
  wholesale: {
    title: "Wholesale MAO Calculator — Maximum Allowable Offer",
    description: "Calculate Maximum Allowable Offer for wholesale deals using ARV, rehab, and assignment fee. Free wholesaler tool.",
  },
  piti: {
    title: "PITI Calculator — Principal, Interest, Taxes, Insurance",
    description: "Full housing payment breakdown with 28/36 affordability check. Free PITI mortgage calculator.",
  },
  ownvsrent: {
    title: "Own vs Rent Calculator — 10-Year Net Worth Compare",
    description: "Compare buying vs renting on a 10-year net worth path with appreciation, rent growth, and opportunity cost.",
  },
  hardmoney: {
    title: "Hard Money Loan Calculator — Points, Interest & Holding",
    description: "Stack hard-money points, monthly interest, and holding costs for a flip or BRRRR. Free, instant.",
  },
};

function readActiveTabFromUrl(): CalcTabKey {
  if (typeof window === "undefined") return "arv";
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace(/^#/, "");
  const requested = (params.get("tab") || hash || "").toLowerCase();
  return (CALC_TABS as readonly string[]).includes(requested)
    ? (requested as CalcTabKey)
    : "arv";
}

export default function Calculators() {
  const [activeTab, setActiveTab] = useState<CalcTabKey>(readActiveTabFromUrl);
  const seo = CALC_SEO[activeTab];
  // Use the per-tab branded share card when a valid tab is requested via
  // ?tab=, otherwise fall back to the generic card for bare /calculators URLs
  // (and for unknown/invalid tab values).
  const rawTabParam =
    typeof window !== "undefined"
      ? (new URLSearchParams(window.location.search).get("tab") || "").toLowerCase()
      : "";
  const hasValidTabParam = (CALC_TABS as readonly string[]).includes(rawTabParam);
  const ogImage = hasValidTabParam
    ? `https://pegasusdreamscapes.com/og/calculators-${activeTab}.svg`
    : "https://pegasusdreamscapes.com/og/calculators.svg";
  useSEO({
    title: seo.title,
    description: seo.description,
    image: ogImage,
  });
  return (
    <div className="min-h-screen pt-20">
      <HeroSection />
      <CalculatorTabs activeTab={activeTab} setActiveTab={setActiveTab} />
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
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
            Strategy Tools · No signup required
          </p>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
        </div>
        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.02em] mb-6 leading-[0.98]" data-testid="text-calculators-hero">
          Run the numbers.<br />
          <span className="italic font-medium bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
            Before you write the offer.
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          A working set of operator-grade calculators for fix-and-flip, BRRRR, ADU, and acquisition math. Educational, illustrative, and free.
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

const CALC_TABS = ["arv", "roi", "brrrr", "cashflow", "wholesale", "piti", "ownvsrent", "hardmoney"] as const;

function CalculatorTabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: CalcTabKey;
  setActiveTab: (tab: CalcTabKey) => void;
}) {
  // Keep the URL ?tab= in sync so deep-links shared from /strategy-lab work.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (activeTab === "arv") url.searchParams.delete("tab");
    else url.searchParams.set("tab", activeTab);
    window.history.replaceState({}, "", url.toString());
  }, [activeTab]);
  return (
    <section className="py-12 lg:py-20 border-t border-border bg-tan/5">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex justify-end mb-4">
          <MyAnalysesDrawer
            onSelectCalculator={(t) => {
              // Saved analyses persist `mao` for the Wholesale calc; the tab key is `wholesale`.
              const key = (t === "mao" ? "wholesale" : t) as string;
              if ((CALC_TABS as readonly string[]).includes(key)) {
                setActiveTab(key as CalcTabKey);
              }
            }}
          />
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CalcTabKey)} className="w-full">
          <div className="overflow-x-auto -mx-2 px-2 mb-8">
            <TabsList className="inline-flex lg:grid lg:grid-cols-8 gap-1 h-auto p-1 min-w-max lg:min-w-0 lg:w-full">
              <TabsTrigger value="arv" className="flex items-center gap-1.5 py-3 px-3" data-testid="tab-arv">
                <Home className="w-4 h-4" />
                ARV
              </TabsTrigger>
              <TabsTrigger value="roi" className="flex items-center gap-1.5 py-3 px-3" data-testid="tab-roi">
                <TrendingUp className="w-4 h-4" />
                ROI
              </TabsTrigger>
              <TabsTrigger value="brrrr" className="flex items-center gap-1.5 py-3 px-3" data-testid="tab-brrrr">
                <RefreshCw className="w-4 h-4" />
                BRRRR
              </TabsTrigger>
              <TabsTrigger value="cashflow" className="flex items-center gap-1.5 py-3 px-3" data-testid="tab-cashflow">
                <BarChart3 className="w-4 h-4" />
                Cash Flow
              </TabsTrigger>
              <TabsTrigger value="wholesale" className="flex items-center gap-1.5 py-3 px-3" data-testid="tab-wholesale">
                <Handshake className="w-4 h-4" />
                Wholesale
              </TabsTrigger>
              <TabsTrigger value="piti" className="flex items-center gap-1.5 py-3 px-3" data-testid="tab-piti">
                <Banknote className="w-4 h-4" />
                PITI
              </TabsTrigger>
              <TabsTrigger value="ownvsrent" className="flex items-center gap-1.5 py-3 px-3" data-testid="tab-ownvsrent">
                <KeyRound className="w-4 h-4" />
                Own vs Rent
              </TabsTrigger>
              <TabsTrigger value="hardmoney" className="flex items-center gap-1.5 py-3 px-3" data-testid="tab-hardmoney">
                <Coins className="w-4 h-4" />
                Hard Money
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="arv" forceMount className="data-[state=inactive]:hidden">
            <ARVCalculator />
          </TabsContent>
          <TabsContent value="roi" forceMount className="data-[state=inactive]:hidden">
            <ROICalculator />
          </TabsContent>
          <TabsContent value="brrrr" forceMount className="data-[state=inactive]:hidden">
            <BRRRRCalculator />
          </TabsContent>
          <TabsContent value="cashflow" forceMount className="data-[state=inactive]:hidden">
            <CashFlowCalculator />
          </TabsContent>
          <TabsContent value="wholesale" forceMount className="data-[state=inactive]:hidden">
            <WholesaleCalculator />
          </TabsContent>
          <TabsContent value="piti" forceMount className="data-[state=inactive]:hidden">
            <PITICalculator />
          </TabsContent>
          <TabsContent value="ownvsrent" forceMount className="data-[state=inactive]:hidden">
            <OwnVsRentCalculator />
          </TabsContent>
          <TabsContent value="hardmoney" forceMount className="data-[state=inactive]:hidden">
            <HardMoneyCalculator />
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
        <div className="inline-flex items-center gap-3 mb-6">
          <span className="h-px w-10 bg-primary/60" />
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
            Next Steps
          </p>
          <span className="h-px w-10 bg-primary/60" />
        </div>
        <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-tight mb-6">
          The math is the start.
          <br />
          <span className="italic font-medium bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
            The structure is the work.
          </span>
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Numbers tell you whether to engage. Strategy tells you how. Bring a real situation and we'll route it to the path that fits.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sell">
            <Button size="lg" className="gap-2 min-h-[48px] px-7 bg-primary hover:bg-primary/90 text-sm uppercase tracking-[0.15em] font-semibold" data-testid="button-cta-sell">
              <Building2 className="w-4 h-4" />
              Submit a property
            </Button>
          </Link>
          <Link href="/invest">
            <Button size="lg" variant="outline" className="gap-2 min-h-[48px] px-7 border-primary/40 hover:border-primary hover:bg-primary/5 text-sm uppercase tracking-[0.15em] font-semibold" data-testid="button-cta-invest">
              <Wallet className="w-4 h-4 text-primary" />
              Explore capital
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
    setResults(
      computeArv({
        purchase: parseFloat(purchasePrice) || 0,
        rehab: parseFloat(rehabCost) || 0,
        arv: parseFloat(arv) || 0,
        holding: parseFloat(holdingCosts) || 0,
        closingPercent: parseFloat(closingCosts) || 6,
      }),
    );
  };

  const reset = () => {
    setPurchasePrice("");
    setRehabCost("");
    setArv("");
    setHoldingCosts("");
    setClosingCosts("6");
    setResults(null);
  };

  // Realtime recompute on every input change.
  useEffect(() => {
    if (purchasePrice || rehabCost || arv || holdingCosts) calculate();
    else setResults(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchasePrice, rehabCost, arv, holdingCosts, closingCosts]);

  // Rehydrate from saved analysis.
  const loadArv = useCallback((i: Record<string, unknown>) => {
    setPurchasePrice(String(i.purchasePrice ?? ""));
    setRehabCost(String(i.rehabCost ?? ""));
    setArv(String(i.arv ?? ""));
    setHoldingCosts(String(i.holdingCosts ?? ""));
    setClosingCosts(String(i.closingCosts ?? "6"));
  }, []);
  useCalcLoad("arv", loadArv);

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
            <Button variant="outline" onClick={reset} data-testid="button-reset-arv" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">Results update as you type.</p>
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

            {/* Investment Breakdown Chart */}
            <motion.div 
              className="pt-4 border-t border-border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm font-medium mb-4">Investment Breakdown</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Purchase Price', value: parseFloat(purchasePrice) || 0, fill: 'hsl(var(--primary))' },
                        { name: 'Rehab Cost', value: parseFloat(rehabCost) || 0, fill: 'hsl(var(--tan, 30 80% 50%))' },
                        { name: 'Holding Costs', value: parseFloat(holdingCosts) || 0, fill: 'hsl(var(--muted-foreground))' },
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {[
                        { name: 'Purchase Price', value: parseFloat(purchasePrice) || 0, fill: 'hsl(var(--primary))' },
                        { name: 'Rehab Cost', value: parseFloat(rehabCost) || 0, fill: 'hsl(30 80% 50%)' },
                        { name: 'Holding Costs', value: parseFloat(holdingCosts) || 0, fill: 'hsl(var(--muted-foreground))' },
                      ].filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend 
                      verticalAlign="middle" 
                      align="right"
                      layout="vertical"
                      formatter={(value) => <span className="text-xs">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <CalculatorActions
              calculatorType="arv"
              inputs={{
                purchasePrice: parseFloat(purchasePrice) || 0,
                rehabCost: parseFloat(rehabCost) || 0,
                arv: parseFloat(arv) || 0,
                holdingCosts: parseFloat(holdingCosts) || 0,
                closingCosts: parseFloat(closingCosts) || 6,
              }}
              outputs={{
                totalInvestment: results.totalInvestment,
                potentialProfit: results.potentialProfit,
                netProfit: results.netProfit,
                roi: results.roi,
                seventyPercentRule: results.seventyPercentRule,
                meetsRule: results.meetsRule,
                [PROJECTION_KEY]: buildArvProjection({
                  arv: parseFloat(arv) || 0,
                  totalInvestment: results.totalInvestment,
                }),
              }}
            />

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Want to discuss this deal with our team?
                </p>
                <DealGradeBadge grade={calculateDealGrade(results.roi, undefined, results.meetsRule)} />
              </div>
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
    setResults(
      computeRoi({
        purchase: parseFloat(purchasePrice) || 0,
        downPaymentPct: parseFloat(downPayment) || 25,
        rehab: parseFloat(rehabCost) || 0,
        monthlyRent: parseFloat(monthlyRent) || 0,
        monthlyExpenses: parseFloat(monthlyExpenses) || 0,
        ratePct: parseFloat(loanRate) || 7.5,
        termYears: parseFloat(loanTerm) || 30,
      }),
    );
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

  useEffect(() => {
    if (purchasePrice || monthlyRent) calculate();
    else setResults(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchasePrice, downPayment, rehabCost, monthlyRent, monthlyExpenses, loanRate, loanTerm]);

  const loadRoi = useCallback((i: Record<string, unknown>) => {
    setPurchasePrice(String(i.purchasePrice ?? ""));
    setDownPayment(String(i.downPayment ?? "25"));
    setRehabCost(String(i.rehabCost ?? ""));
    setMonthlyRent(String(i.monthlyRent ?? ""));
    setMonthlyExpenses(String(i.monthlyExpenses ?? ""));
    setLoanRate(String(i.loanRate ?? "7.5"));
    setLoanTerm(String(i.loanTerm ?? "30"));
  }, []);
  useCalcLoad("roi", loadRoi);

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
            <Button variant="outline" onClick={reset} data-testid="button-reset-roi" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">Results update as you type.</p>
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

            <CalculatorActions
              calculatorType="roi"
              inputs={{
                purchasePrice: parseFloat(purchasePrice) || 0,
                downPayment: parseFloat(downPayment) || 25,
                rehabCost: parseFloat(rehabCost) || 0,
                monthlyRent: parseFloat(monthlyRent) || 0,
                monthlyExpenses: parseFloat(monthlyExpenses) || 0,
                loanRate: parseFloat(loanRate) || 7.5,
                loanTerm: parseFloat(loanTerm) || 30,
              }}
              outputs={{
                ...results,
                [PROJECTION_KEY]: buildCashflowProjection({
                  monthlyCashFlow: results.monthlyCashFlow,
                  monthlyRent: parseFloat(monthlyRent) || 0,
                  monthlyOpex: parseFloat(monthlyExpenses) || 0,
                  monthlyMortgage: results.monthlyMortgage,
                }),
              }}
            />

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Interested in partnering on deals like this?
                </p>
                <DealGradeBadge grade={calculateDealGrade(results.cashOnCashReturn, results.monthlyCashFlow)} />
              </div>
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
    setResults(
      computeBrrrr({
        purchase: parseFloat(purchasePrice) || 0,
        rehab: parseFloat(rehabCost) || 0,
        arv: parseFloat(arv) || 0,
        monthlyRent: parseFloat(monthlyRent) || 0,
        monthlyExpenses: parseFloat(monthlyExpenses) || 0,
        refinanceLtvPct: parseFloat(refinanceLTV) || 75,
        refinanceRatePct: parseFloat(refinanceRate) || 7.5,
      }),
    );
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

  useEffect(() => {
    if (purchasePrice || arv || monthlyRent) calculate();
    else setResults(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchasePrice, rehabCost, arv, monthlyRent, monthlyExpenses, refinanceLTV, refinanceRate]);

  const loadBrrrr = useCallback((i: Record<string, unknown>) => {
    setPurchasePrice(String(i.purchasePrice ?? ""));
    setRehabCost(String(i.rehabCost ?? ""));
    setArv(String(i.arv ?? ""));
    setMonthlyRent(String(i.monthlyRent ?? ""));
    setMonthlyExpenses(String(i.monthlyExpenses ?? ""));
    setRefinanceLTV(String(i.refinanceLTV ?? "75"));
    setRefinanceRate(String(i.refinanceRate ?? "7.5"));
  }, []);
  useCalcLoad("brrrr", loadBrrrr);

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
            <Button variant="outline" onClick={reset} data-testid="button-reset-brrrr" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">Results update as you type.</p>
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

            <CalculatorActions
              calculatorType="brrrr"
              inputs={{
                purchasePrice: parseFloat(purchasePrice) || 0,
                rehabCost: parseFloat(rehabCost) || 0,
                arv: parseFloat(arv) || 0,
                monthlyRent: parseFloat(monthlyRent) || 0,
                monthlyExpenses: parseFloat(monthlyExpenses) || 0,
                refinanceLTV: parseFloat(refinanceLTV) || 75,
                refinanceRate: parseFloat(refinanceRate) || 7.5,
              }}
              outputs={{
                ...results,
                [PROJECTION_KEY]: buildBrrrrProjection({
                  monthlyRent: parseFloat(monthlyRent) || 0,
                  monthlyExpenses: parseFloat(monthlyExpenses) || 0,
                  monthlyMortgage: results.monthlyMortgage,
                  refinanceValue: results.refinanceValue,
                  refinanceRatePct: parseFloat(refinanceRate) || 7.5,
                  arv: parseFloat(arv) || 0,
                }),
              }}
            />

            <div className="grid grid-cols-1 gap-6 pt-2">
              <ScenarioCompareCard
                baseRent={parseFloat(monthlyRent) || 0}
                baseOpex={parseFloat(monthlyExpenses) || 0}
                baseRate={parseFloat(refinanceRate) || 7.5}
                loanAmount={results.refinanceValue}
                termYears={30}
                saveContext={{
                  calculatorType: "brrrr",
                  inputs: {
                    purchasePrice: parseFloat(purchasePrice) || 0,
                    rehabCost: parseFloat(rehabCost) || 0,
                    arv: parseFloat(arv) || 0,
                    monthlyRent: parseFloat(monthlyRent) || 0,
                    monthlyExpenses: parseFloat(monthlyExpenses) || 0,
                    refinanceLTV: parseFloat(refinanceLTV) || 75,
                    refinanceRate: parseFloat(refinanceRate) || 7.5,
                  },
                  namePrefix: "BRRRR scenarios",
                }}
              />
              <SensitivityMatrixCard
                baseRent={parseFloat(monthlyRent) || 0}
                basePrice={parseFloat(arv) || parseFloat(purchasePrice) || 0}
                ltvPct={parseFloat(refinanceLTV) || 75}
                annualRatePct={parseFloat(refinanceRate) || 7.5}
                termYears={30}
                monthlyOpex={parseFloat(monthlyExpenses) || 0}
              />
              <BreakevenCard
                rent={parseFloat(monthlyRent) || 0}
                monthlyOpex={parseFloat(monthlyExpenses) || 0}
                monthlyDebtService={results.monthlyMortgage}
                loanAmount={results.refinanceValue}
                termYears={30}
                rateUsed={parseFloat(refinanceRate) || 7.5}
                cashInvested={Math.max(1, results.cashLeftInDeal)}
                annualNOI={Math.max(0, ((parseFloat(monthlyRent) || 0) - (parseFloat(monthlyExpenses) || 0)) * 12)}
              />
              <ExitScenariosCard
                initialCashIn={Math.max(0, results.cashLeftInDeal)}
                propertyValue={parseFloat(arv) || 0}
                loanAmount={results.refinanceValue}
                annualRatePct={parseFloat(refinanceRate) || 7.5}
                termYears={30}
                monthlyRent={parseFloat(monthlyRent) || 0}
                monthlyOpex={parseFloat(monthlyExpenses) || 0}
              />
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Want help finding BRRRR-eligible properties?
                </p>
                <DealGradeBadge grade={calculateDealGrade(results.cashOnCash, results.monthlyCashFlow)} />
              </div>
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
    setResults(
      computeCashFlow({
        grossRent: parseFloat(grossRent) || 0,
        vacancyPercent: parseFloat(vacancy) || 5,
        propertyTax: parseFloat(propertyTax) || 0,
        insurance: parseFloat(insurance) || 0,
        maintenance: parseFloat(maintenance) || 0,
        managementPercent: parseFloat(management) || 10,
        utilities: parseFloat(utilities) || 0,
        mortgage: parseFloat(mortgage) || 0,
        otherExpenses: parseFloat(otherExpenses) || 0,
      }),
    );
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

  useEffect(() => {
    if (grossRent) calculate();
    else setResults(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grossRent, vacancy, propertyTax, insurance, maintenance, management, utilities, mortgage, otherExpenses]);

  const loadCashflow = useCallback((i: Record<string, unknown>) => {
    setGrossRent(String(i.grossRent ?? ""));
    setVacancy(String(i.vacancy ?? "5"));
    setPropertyTax(String(i.propertyTax ?? ""));
    setInsurance(String(i.insurance ?? ""));
    setMaintenance(String(i.maintenance ?? ""));
    setManagement(String(i.management ?? "10"));
    setUtilities(String(i.utilities ?? ""));
    setMortgage(String(i.mortgage ?? ""));
    setOtherExpenses(String(i.otherExpenses ?? ""));
  }, []);
  useCalcLoad("cashflow", loadCashflow);

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
            <Button variant="outline" onClick={reset} data-testid="button-reset-cashflow" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">Results update as you type.</p>
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

            <CalculatorActions
              calculatorType="cashflow"
              inputs={{
                grossRent: parseFloat(grossRent) || 0,
                vacancy: parseFloat(vacancy) || 5,
                propertyTax: parseFloat(propertyTax) || 0,
                insurance: parseFloat(insurance) || 0,
                otherExpenses: parseFloat(otherExpenses) || 0,
                management: parseFloat(management) || 0,
                utilities: parseFloat(utilities) || 0,
                mortgage: parseFloat(mortgage) || 0,
              }}
              outputs={{
                ...results,
                [PROJECTION_KEY]: buildCashflowProjection({
                  monthlyCashFlow: results.monthlyCashFlow,
                  monthlyRent: parseFloat(grossRent) || 0,
                  monthlyOpex:
                    (results.totalExpenses ?? 0) - (parseFloat(mortgage) || 0),
                  monthlyMortgage: parseFloat(mortgage) || 0,
                }),
              }}
            />

            {(() => {
              // Reverse-PMT: derive an implied loan amount from the monthly mortgage input
              // so Scenario Compare and Breakeven can stress-test the deal. Assumes 7.5%/30yr.
              const mort = parseFloat(mortgage) || 0;
              const r = 0.075 / 12;
              const n = 30 * 12;
              const impliedLoan =
                mort > 0 && r > 0 ? mort * ((1 - Math.pow(1 + r, -n)) / r) : 0;
              const opex = results.totalExpenses - mort;
              // basePrice approximation: implied loan grossed up by 75% LTV.
              const basePrice = impliedLoan > 0 ? impliedLoan / 0.75 : 0;
              return (
                <div className="grid grid-cols-1 gap-6 pt-2">
                  <ScenarioCompareCard
                    baseRent={parseFloat(grossRent) || 0}
                    baseOpex={opex}
                    baseRate={7.5}
                    loanAmount={impliedLoan}
                    termYears={30}
                    saveContext={{
                      calculatorType: "cashflow",
                      inputs: {
                        grossRent: parseFloat(grossRent) || 0,
                        vacancy: parseFloat(vacancy) || 5,
                        propertyTax: parseFloat(propertyTax) || 0,
                        insurance: parseFloat(insurance) || 0,
                        otherExpenses: parseFloat(otherExpenses) || 0,
                        management: parseFloat(management) || 0,
                        utilities: parseFloat(utilities) || 0,
                        mortgage: mort,
                      },
                    }}
                  />
                  <SensitivityMatrixCard
                    baseRent={parseFloat(grossRent) || 0}
                    basePrice={basePrice}
                    ltvPct={75}
                    annualRatePct={7.5}
                    termYears={30}
                    monthlyOpex={opex}
                  />
                  <BreakevenCard
                    rent={parseFloat(grossRent) || 0}
                    monthlyOpex={opex}
                    monthlyDebtService={mort}
                    loanAmount={impliedLoan}
                    termYears={30}
                    rateUsed={7.5}
                    cashInvested={Math.max(1, impliedLoan * 0.25)}
                    annualNOI={Math.max(0, ((parseFloat(grossRent) || 0) - opex) * 12)}
                  />
                  <ExitScenariosCard
                    initialCashIn={Math.max(1, impliedLoan * 0.25)}
                    propertyValue={basePrice}
                    loanAmount={impliedLoan}
                    annualRatePct={7.5}
                    termYears={30}
                    monthlyRent={parseFloat(grossRent) || 0}
                    monthlyOpex={opex}
                  />
                </div>
              );
            })()}

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Looking for properties with strong cash flow?
                </p>
                <DealGradeBadge grade={calculateDealGrade(0, results.monthlyCashFlow)} />
              </div>
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
    setResults(
      computeWholesale({
        arv: parseFloat(arv) || 0,
        rehab: parseFloat(rehabCost) || 0,
        buyerProfitPct: parseFloat(buyerProfit) || 25,
        closingCostPct: parseFloat(closingCosts) || 6,
        holding: parseFloat(holdingCosts) || 0,
        assignmentFee: parseFloat(desiredAssignmentFee) || 0,
      }),
    );
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

  useEffect(() => {
    if (arv || rehabCost) calculate();
    else setResults(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arv, rehabCost, buyerProfit, closingCosts, holdingCosts, desiredAssignmentFee]);

  const loadWholesale = useCallback((i: Record<string, unknown>) => {
    setArv(String(i.arv ?? ""));
    setRehabCost(String(i.rehabCost ?? ""));
    setBuyerProfit(String(i.buyerProfit ?? "25"));
    setClosingCosts(String(i.closingCosts ?? "6"));
    setHoldingCosts(String(i.holdingCosts ?? ""));
    setDesiredAssignmentFee(String(i.desiredAssignmentFee ?? ""));
  }, []);
  useCalcLoad("mao", loadWholesale);

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
            <Button variant="outline" onClick={reset} data-testid="button-reset-wholesale" className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">Results update as you type.</p>
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

            <CalculatorActions
              calculatorType="wholesale"
              inputs={{
                arv: parseFloat(arv) || 0,
                rehabCost: parseFloat(rehabCost) || 0,
                buyerProfit: parseFloat(buyerProfit) || 25,
                closingCosts: parseFloat(closingCosts) || 6,
                holdingCosts: parseFloat(holdingCosts) || 0,
                assignmentFee: parseFloat(desiredAssignmentFee) || 10000,
              }}
              outputs={{
                ...results,
              }}
            />

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Looking for wholesale deals?
                </p>
                <DealGradeBadge grade={calculateDealGrade(results.assignmentFeePercent)} />
              </div>
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

// ──────────────────────────────────────────────────────────────────────────
// Mortgage / PITI Calculator — full monthly payment with tax/insurance/PMI
// ──────────────────────────────────────────────────────────────────────────

function PITICalculator() {
  // 28/36 affordability rule: housing PITI ≤ 28% gross monthly income, total
  // recurring debt ≤ 36%. Solves backwards to a max loan and max price.
  const [grossIncome, setGrossIncome] = useState("120000");
  const [monthlyDebts, setMonthlyDebts] = useState("400");
  const [downPct, setDownPct] = useState("20");
  const [rate, setRate] = useState("7.0");
  const [term, setTerm] = useState("30");
  const [annualTaxPct, setAnnualTaxPct] = useState("1.2");
  const [monthlyIns, setMonthlyIns] = useState("150");

  useCalcLoad("piti", (inputs) => {
    if (inputs.grossAnnualIncome != null) setGrossIncome(String(inputs.grossAnnualIncome));
    if (inputs.monthlyDebts != null) setMonthlyDebts(String(inputs.monthlyDebts));
    if (inputs.downPct != null) setDownPct(String(inputs.downPct));
    if (inputs.rate != null) setRate(String(inputs.rate));
    if (inputs.term != null) setTerm(String(inputs.term));
    if (inputs.annualTaxPct != null) setAnnualTaxPct(String(inputs.annualTaxPct));
    if (inputs.monthlyIns != null) setMonthlyIns(String(inputs.monthlyIns));
  });

  const affordability = useMemo(() => {
    const gross = parseFloat(grossIncome) || 0;
    const debts = parseFloat(monthlyDebts) || 0;
    const r = parseFloat(rate) || 0;
    const t = parseInt(term) || 30;
    // Iterate twice: once to estimate price (ignoring tax/ins), then again
    // using actual tax % of estimated price. Two passes converges quickly.
    const pass1 = housingAffordability28_36({
      grossAnnualIncome: gross,
      monthlyDebts: debts,
      annualRatePct: r,
      termYears: t,
      downPaymentPct: parseFloat(downPct) || 0,
      monthlyTaxIns: parseFloat(monthlyIns) || 0,
    });
    const estTaxMo = (pass1.maxPurchasePrice * ((parseFloat(annualTaxPct) || 0) / 100)) / 12;
    return housingAffordability28_36({
      grossAnnualIncome: gross,
      monthlyDebts: debts,
      annualRatePct: r,
      termYears: t,
      downPaymentPct: parseFloat(downPct) || 0,
      monthlyTaxIns: estTaxMo + (parseFloat(monthlyIns) || 0),
    });
  }, [grossIncome, monthlyDebts, downPct, rate, term, annualTaxPct, monthlyIns]);

  // Derive PITI breakdown of the binding monthly cap.
  const breakdown = useMemo(() => {
    const taxMo =
      (affordability.maxPurchasePrice * ((parseFloat(annualTaxPct) || 0) / 100)) / 12;
    const insMo = parseFloat(monthlyIns) || 0;
    const pi = monthlyPayment(
      affordability.maxLoanAmount,
      parseFloat(rate) || 0,
      parseInt(term) || 30,
    );
    return { taxMo, insMo, pi };
  }, [affordability, annualTaxPct, monthlyIns, rate, term]);

  const reset = () => {
    setGrossIncome("120000");
    setMonthlyDebts("400");
    setDownPct("20");
    setRate("7.0");
    setTerm("30");
    setAnnualTaxPct("1.2");
    setMonthlyIns("150");
  };

  const results = {
    maxPurchasePrice: affordability.maxPurchasePrice,
    maxLoanAmount: affordability.maxLoanAmount,
    bindingMaxMonthly: affordability.bindingMaxMonthly,
    maxMonthlyHousing28: affordability.maxMonthlyHousing28,
    maxMonthlyTotal36: affordability.maxMonthlyTotal36,
  };

  const fmt = (n: number) => formatCurrencyShared(n);
  const amort = amortizationSchedule(
    affordability.maxLoanAmount,
    parseFloat(rate) || 0,
    parseInt(term) || 30,
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl flex items-center gap-2">
            <Banknote className="w-5 h-5 text-primary" />
            How Much Home Can You Afford?
          </CardTitle>
          <CardDescription>
            The 28/36 rule: housing ≤ 28% of gross income, total debt ≤ 36%. Updates as you type.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="piti-income">Gross Annual Income ($)</Label>
              <Input id="piti-income" type="number" value={grossIncome} onChange={(e) => setGrossIncome(e.target.value)} data-testid="input-piti-income" />
            </div>
            <div>
              <Label htmlFor="piti-debts">Other Monthly Debts ($)</Label>
              <Input id="piti-debts" type="number" value={monthlyDebts} onChange={(e) => setMonthlyDebts(e.target.value)} data-testid="input-piti-debts" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="piti-down">Down Payment (%)</Label>
              <Input id="piti-down" type="number" value={downPct} onChange={(e) => setDownPct(e.target.value)} data-testid="input-piti-down" />
            </div>
            <div>
              <Label htmlFor="piti-rate">Rate (%)</Label>
              <Input id="piti-rate" type="number" step="0.125" value={rate} onChange={(e) => setRate(e.target.value)} data-testid="input-piti-rate" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="piti-term">Term (years)</Label>
              <Input id="piti-term" type="number" value={term} onChange={(e) => setTerm(e.target.value)} data-testid="input-piti-term" />
            </div>
            <div>
              <Label htmlFor="piti-tax">Annual Tax (% of price)</Label>
              <Input id="piti-tax" type="number" step="0.1" value={annualTaxPct} onChange={(e) => setAnnualTaxPct(e.target.value)} data-testid="input-piti-tax" />
            </div>
          </div>
          <div>
            <Label htmlFor="piti-ins">Insurance ($/mo)</Label>
            <Input id="piti-ins" type="number" value={monthlyIns} onChange={(e) => setMonthlyIns(e.target.value)} data-testid="input-piti-ins" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={reset} variant="outline" data-testid="button-piti-reset">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Affordability Verdict</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 bg-background rounded-lg text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-2">
                Max Purchase Price
              </p>
              <p className="font-serif text-4xl font-semibold tabular-nums" data-testid="result-piti-maxprice">
                {fmt(results.maxPurchasePrice)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Max loan {fmt(results.maxLoanAmount)} at {rate}% / {term} yr
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-background rounded">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">28% Housing Cap</p>
                <p className="font-medium tabular-nums" data-testid="result-piti-cap28">{fmt(results.maxMonthlyHousing28)}/mo</p>
              </div>
              <div className="p-3 bg-background rounded">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">36% Total Cap</p>
                <p className="font-medium tabular-nums" data-testid="result-piti-cap36">{fmt(results.maxMonthlyTotal36)}/mo</p>
              </div>
              <div className="p-3 bg-background rounded col-span-2 border border-primary/30">
                <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">Binding Monthly Cap (PITI)</p>
                <p className="font-medium tabular-nums text-lg" data-testid="result-piti-binding">{fmt(results.bindingMaxMonthly)}/mo</p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Principal & Interest", val: breakdown.pi, key: "pi" },
                { label: "Property Tax", val: breakdown.taxMo, key: "tax" },
                { label: "Insurance", val: breakdown.insMo, key: "ins" },
              ].map((r) => (
                <div key={r.key} className="flex justify-between p-3 bg-background rounded">
                  <span className="text-sm text-muted-foreground">{r.label}</span>
                  <span className="font-medium tabular-nums" data-testid={`result-piti-${r.key}`}>{fmt(r.val)}</span>
                </div>
              ))}
            </div>

            <CalculatorActions
              calculatorType="piti"
              inputs={{
                grossAnnualIncome: parseFloat(grossIncome) || 0,
                monthlyDebts: parseFloat(monthlyDebts) || 0,
                downPct: parseFloat(downPct) || 0,
                rate: parseFloat(rate) || 0,
                term: parseInt(term) || 30,
                annualTaxPct: parseFloat(annualTaxPct) || 0,
                monthlyIns: parseFloat(monthlyIns) || 0,
              }}
              outputs={{ ...results }}
            />

            {amort.length > 0 && (() => {
              // Roll the monthly schedule up into year buckets for display.
              const yearly: { year: number; principal: number; interest: number; balance: number }[] = [];
              for (let y = 1; y <= Math.min(10, Math.ceil(amort.length / 12)); y++) {
                const slice = amort.slice((y - 1) * 12, y * 12);
                yearly.push({
                  year: y,
                  principal: slice.reduce((s, r) => s + r.principal, 0),
                  interest: slice.reduce((s, r) => s + r.interest, 0),
                  balance: slice.at(-1)?.balance ?? 0,
                });
              }
              return (
                <div className="pt-2">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-3">
                    10-year amortization
                  </p>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/40">
                        <tr>
                          <th className="text-left px-3 py-2 font-supporting tracking-wider uppercase text-[10px] text-muted-foreground">Year</th>
                          <th className="text-right px-3 py-2 font-supporting tracking-wider uppercase text-[10px] text-muted-foreground">Principal</th>
                          <th className="text-right px-3 py-2 font-supporting tracking-wider uppercase text-[10px] text-muted-foreground">Interest</th>
                          <th className="text-right px-3 py-2 font-supporting tracking-wider uppercase text-[10px] text-muted-foreground">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearly.map((row) => (
                          <tr key={row.year} className="border-t border-border">
                            <td className="px-3 py-2">{row.year}</td>
                            <td className="text-right tabular-nums px-3 py-2">{fmt(row.principal)}</td>
                            <td className="text-right tabular-nums px-3 py-2 text-muted-foreground">{fmt(row.interest)}</td>
                            <td className="text-right tabular-nums px-3 py-2">{fmt(row.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Own vs Rent Calculator — three appreciation scenarios
// ──────────────────────────────────────────────────────────────────────────

function OwnVsRentCalculator() {
  const [price, setPrice] = useState("500000");
  const [downPct, setDownPct] = useState("20");
  const [rate, setRate] = useState("7.0");
  const [term, setTerm] = useState("30");
  const [taxRate, setTaxRate] = useState("1.2");
  const [insurance, setInsurance] = useState("150");
  const [hoa, setHoa] = useState("0");
  const [maintPct, setMaintPct] = useState("1.0");
  const [rent, setRent] = useState("2400");
  const [rentGrowth, setRentGrowth] = useState("3.0");
  const [investReturn, setInvestReturn] = useState("6.0");
  const [years, setYears] = useState("15");

  useCalcLoad("ownvsrent", (inputs) => {
    if (inputs.price != null) setPrice(String(inputs.price));
    if (inputs.downPct != null) setDownPct(String(inputs.downPct));
    if (inputs.rate != null) setRate(String(inputs.rate));
    if (inputs.term != null) setTerm(String(inputs.term));
    if (inputs.taxRate != null) setTaxRate(String(inputs.taxRate));
    if (inputs.insurance != null) setInsurance(String(inputs.insurance));
    if (inputs.hoa != null) setHoa(String(inputs.hoa));
    if (inputs.maintPct != null) setMaintPct(String(inputs.maintPct));
    if (inputs.rent != null) setRent(String(inputs.rent));
    if (inputs.rentGrowth != null) setRentGrowth(String(inputs.rentGrowth));
    if (inputs.investReturn != null) setInvestReturn(String(inputs.investReturn));
    if (inputs.years != null) setYears(String(inputs.years));
  });

  // Three appreciation scenarios — 2% (cooling), 4% (long-run avg), 6% (hot).
  const scenarios = useMemo(() => {
    const p = parseFloat(price) || 0;
    if (p <= 0) return [];
    const monthlyOwnExtra =
      (p * ((parseFloat(taxRate) || 0) / 100)) / 12 +
      (parseFloat(insurance) || 0) +
      (parseFloat(hoa) || 0) +
      (p * ((parseFloat(maintPct) || 0) / 100)) / 12;
    return ownVsRentScenarios({
      homePrice: p,
      downPaymentPct: parseFloat(downPct) || 0,
      mortgageRatePct: parseFloat(rate) || 0,
      termYears: parseInt(term) || 30,
      monthlyRent: parseFloat(rent) || 0,
      monthlyOwnExtra,
      rentGrowthPct: parseFloat(rentGrowth) || 0,
      investmentReturnPct: parseFloat(investReturn) || 0,
      years: parseInt(years) || 15,
    });
  }, [price, downPct, rate, term, taxRate, insurance, hoa, maintPct, rent, rentGrowth, investReturn, years]);

  const middleScenario = scenarios.find((s) => s.appreciationPct === 4) ?? scenarios[0] ?? null;

  const reset = () => {
    setPrice("500000");
    setRent("2400");
  };

  const fmt = (n: number) => formatCurrencyShared(n);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Own vs Rent
          </CardTitle>
          <CardDescription>
            Crossover analysis across three appreciation paths. Updates as you type.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ovr-price">Home Price ($)</Label>
            <Input id="ovr-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} data-testid="input-ovr-price" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="ovr-down">Down (%)</Label>
              <Input id="ovr-down" type="number" value={downPct} onChange={(e) => setDownPct(e.target.value)} data-testid="input-ovr-down" />
            </div>
            <div>
              <Label htmlFor="ovr-rate">Rate (%)</Label>
              <Input id="ovr-rate" type="number" step="0.125" value={rate} onChange={(e) => setRate(e.target.value)} data-testid="input-ovr-rate" />
            </div>
            <div>
              <Label htmlFor="ovr-term">Term (yr)</Label>
              <Input id="ovr-term" type="number" value={term} onChange={(e) => setTerm(e.target.value)} data-testid="input-ovr-term" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="ovr-tax">Tax (%/yr)</Label>
              <Input id="ovr-tax" type="number" step="0.1" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ovr-ins">Ins ($/mo)</Label>
              <Input id="ovr-ins" type="number" value={insurance} onChange={(e) => setInsurance(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ovr-hoa">HOA ($/mo)</Label>
              <Input id="ovr-hoa" type="number" value={hoa} onChange={(e) => setHoa(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="ovr-maint">Maintenance (%/yr)</Label>
            <Input id="ovr-maint" type="number" step="0.1" value={maintPct} onChange={(e) => setMaintPct(e.target.value)} />
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold pt-2">
            Rent side
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ovr-rent">Rent ($/mo)</Label>
              <Input id="ovr-rent" type="number" value={rent} onChange={(e) => setRent(e.target.value)} data-testid="input-ovr-rent" />
            </div>
            <div>
              <Label htmlFor="ovr-rentg">Rent growth (%/yr)</Label>
              <Input id="ovr-rentg" type="number" step="0.1" value={rentGrowth} onChange={(e) => setRentGrowth(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ovr-invret">Invest Return (%/yr)</Label>
              <Input id="ovr-invret" type="number" step="0.1" value={investReturn} onChange={(e) => setInvestReturn(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ovr-years">Horizon (years)</Label>
              <Input id="ovr-years" type="number" value={years} onChange={(e) => setYears(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={reset} variant="outline" data-testid="button-ovr-reset">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {middleScenario && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Crossover Across 3 Paths</CardTitle>
            <CardDescription>
              Cooling (2%/yr), long-run avg (4%/yr), hot (6%/yr) home appreciation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {scenarios.map((s) => (
                <div
                  key={s.appreciationPct}
                  className={`p-4 rounded-lg text-center ${
                    s.appreciationPct === 4
                      ? "border-2 border-primary bg-primary/5"
                      : "border border-border bg-background"
                  }`}
                  data-testid={`ovr-scenario-${s.appreciationPct}`}
                >
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {s.appreciationPct}% appreciation
                  </p>
                  <p className="font-serif text-2xl font-semibold tabular-nums mt-1">
                    {s.crossoverYear ? `Yr ${s.crossoverYear}` : "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">crossover</p>
                </div>
              ))}
            </div>
            <CrossoverLineChart
              data={middleScenario.series}
              crossoverYear={middleScenario.crossoverYear}
            />
            <p className="text-xs text-muted-foreground">
              Chart shows the 4%/yr scenario. Crossover year is when owner net worth overtakes the
              rent + invest path. Illustrative, not a forecast.
            </p>
            <CalculatorActions
              calculatorType="ownvsrent"
              inputs={{
                price: parseFloat(price) || 0,
                downPct: parseFloat(downPct) || 0,
                rate: parseFloat(rate) || 0,
                term: parseInt(term) || 30,
                rent: parseFloat(rent) || 0,
                investReturn: parseFloat(investReturn) || 0,
                years: parseInt(years) || 15,
              }}
              outputs={{
                crossoverYearAt2: scenarios.find((s) => s.appreciationPct === 2)?.crossoverYear ?? 0,
                crossoverYearAt4: scenarios.find((s) => s.appreciationPct === 4)?.crossoverYear ?? 0,
                crossoverYearAt6: scenarios.find((s) => s.appreciationPct === 6)?.crossoverYear ?? 0,
                ownNetAtHorizon4Pct: middleScenario.series.at(-1)?.ownNetWorth ?? 0,
                rentNetAtHorizon4Pct: middleScenario.series.at(-1)?.rentNetWorth ?? 0,
                [PROJECTION_KEY]: buildOwnVsRentProjection(middleScenario.series),
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Hard Money Calculator — full holding stack + breakeven sale price
// ──────────────────────────────────────────────────────────────────────────

function HardMoneyCalculator() {
  const [purchase, setPurchase] = useState("200000");
  const [rehab, setRehab] = useState("50000");
  const [ltc, setLtc] = useState("85");
  const [points, setPoints] = useState("2");
  const [rate, setRate] = useState("12");
  const [months, setMonths] = useState("6");
  const [originationFee, setOriginationFee] = useState("0");
  const [annualTaxPct, setAnnualTaxPct] = useState("1.2");
  const [monthlyIns, setMonthlyIns] = useState("125");
  const [monthlyUtilities, setMonthlyUtilities] = useState("150");
  const [sellingCostPct, setSellingCostPct] = useState("7");

  useCalcLoad("hardmoney", (inputs) => {
    if (inputs.purchase != null) setPurchase(String(inputs.purchase));
    if (inputs.rehab != null) setRehab(String(inputs.rehab));
    if (inputs.ltc != null) setLtc(String(inputs.ltc));
    if (inputs.points != null) setPoints(String(inputs.points));
    if (inputs.rate != null) setRate(String(inputs.rate));
    if (inputs.months != null) setMonths(String(inputs.months));
    if (inputs.originationFee != null) setOriginationFee(String(inputs.originationFee));
    if (inputs.annualTaxPct != null) setAnnualTaxPct(String(inputs.annualTaxPct));
    if (inputs.monthlyIns != null) setMonthlyIns(String(inputs.monthlyIns));
    if (inputs.monthlyUtilities != null) setMonthlyUtilities(String(inputs.monthlyUtilities));
    if (inputs.sellingCostPct != null) setSellingCostPct(String(inputs.sellingCostPct));
  });

  const stack = useMemo(
    () =>
      holdingCostStack({
        purchase: parseFloat(purchase) || 0,
        rehab: parseFloat(rehab) || 0,
        ltcPct: parseFloat(ltc) || 0,
        pointsPct: parseFloat(points) || 0,
        ratePct: parseFloat(rate) || 0,
        monthsHeld: parseInt(months) || 6,
        originationFee: parseFloat(originationFee) || 0,
        annualTaxPct: parseFloat(annualTaxPct) || 0,
        monthlyInsurance: parseFloat(monthlyIns) || 0,
        monthlyUtilities: parseFloat(monthlyUtilities) || 0,
        sellingCostPct: parseFloat(sellingCostPct) || 7,
      }),
    [purchase, rehab, ltc, points, rate, months, originationFee, annualTaxPct, monthlyIns, monthlyUtilities, sellingCostPct],
  );

  const reset = () => {
    setPurchase("200000");
    setRehab("50000");
    setMonths("6");
  };

  const fmt = (n: number) => formatCurrencyShared(n);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Hard Money — Full Holding Stack
          </CardTitle>
          <CardDescription>
            Points + interest + taxes + insurance + utilities. And the sale price needed to walk out whole.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="hm-purchase">Purchase ($)</Label>
              <Input id="hm-purchase" type="number" value={purchase} onChange={(e) => setPurchase(e.target.value)} data-testid="input-hm-purchase" />
            </div>
            <div>
              <Label htmlFor="hm-rehab">Rehab ($)</Label>
              <Input id="hm-rehab" type="number" value={rehab} onChange={(e) => setRehab(e.target.value)} data-testid="input-hm-rehab" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="hm-ltc">Loan-to-Cost (%)</Label>
              <Input id="hm-ltc" type="number" value={ltc} onChange={(e) => setLtc(e.target.value)} data-testid="input-hm-ltc" />
            </div>
            <div>
              <Label htmlFor="hm-points">Points (%)</Label>
              <Input id="hm-points" type="number" step="0.5" value={points} onChange={(e) => setPoints(e.target.value)} data-testid="input-hm-points" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="hm-rate">Rate (%)</Label>
              <Input id="hm-rate" type="number" step="0.5" value={rate} onChange={(e) => setRate(e.target.value)} data-testid="input-hm-rate" />
            </div>
            <div>
              <Label htmlFor="hm-months">Months Held</Label>
              <Input id="hm-months" type="number" value={months} onChange={(e) => setMonths(e.target.value)} data-testid="input-hm-months" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="hm-orig">Origination Fee ($)</Label>
              <Input id="hm-orig" type="number" value={originationFee} onChange={(e) => setOriginationFee(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="hm-tax">Tax (%/yr of purchase)</Label>
              <Input id="hm-tax" type="number" step="0.1" value={annualTaxPct} onChange={(e) => setAnnualTaxPct(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="hm-ins">Insurance ($/mo)</Label>
              <Input id="hm-ins" type="number" value={monthlyIns} onChange={(e) => setMonthlyIns(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="hm-util">Utilities ($/mo)</Label>
              <Input id="hm-util" type="number" value={monthlyUtilities} onChange={(e) => setMonthlyUtilities(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="hm-sell">Sell costs (%)</Label>
              <Input id="hm-sell" type="number" step="0.5" value={sellingCostPct} onChange={(e) => setSellingCostPct(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={reset} variant="outline" data-testid="button-hm-reset">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">True Cost of Capital</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 bg-background rounded-lg text-center border-2 border-primary/30">
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-2">
              Breakeven Sale Price
            </p>
            <p className="font-serif text-4xl font-semibold tabular-nums" data-testid="result-hm-breakeven">
              {fmt(stack.breakevenSalePrice)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Sale needed to cover loan + holding + your cash, after {sellingCostPct}% selling costs.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-background rounded">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Holding Cost</p>
              <p className="font-medium tabular-nums" data-testid="result-hm-holding">{fmt(stack.totalHoldingCost)}</p>
            </div>
            <div className="p-3 bg-background rounded">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Effective APR</p>
              <p className="font-medium tabular-nums" data-testid="result-hm-apr">{stack.effectiveAPRpct.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-background rounded">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Loan Amount</p>
              <p className="font-medium tabular-nums" data-testid="result-hm-loan">{fmt(stack.loanAmount)}</p>
            </div>
            <div className="p-3 bg-background rounded">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Cash Required</p>
              <p className="font-medium tabular-nums" data-testid="result-hm-cash">{fmt(stack.cashRequired)}</p>
            </div>
            <div className="p-3 bg-background rounded">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Points + Origination</p>
              <p className="font-medium tabular-nums">{fmt(stack.pointsCost + stack.originationFee)}</p>
            </div>
            <div className="p-3 bg-background rounded">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Interest ({months}mo)</p>
              <p className="font-medium tabular-nums">{fmt(stack.totalInterest)}</p>
            </div>
            <div className="p-3 bg-background rounded">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Tax + Insurance ({months}mo)</p>
              <p className="font-medium tabular-nums">{fmt(stack.totalTaxIns)}</p>
            </div>
            <div className="p-3 bg-background rounded">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Utilities ({months}mo)</p>
              <p className="font-medium tabular-nums">{fmt(stack.totalUtilities)}</p>
            </div>
            <div className="p-3 bg-background rounded col-span-2 border border-primary/30">
              <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">Total Cash Into Deal</p>
              <p className="font-medium tabular-nums text-lg" data-testid="result-hm-cashin">{fmt(stack.totalCashIntoDeal)}</p>
            </div>
          </div>
          <CalculatorActions
            calculatorType="hardmoney"
            inputs={{
              purchase: parseFloat(purchase) || 0,
              rehab: parseFloat(rehab) || 0,
              ltc: parseFloat(ltc) || 0,
              points: parseFloat(points) || 0,
              rate: parseFloat(rate) || 0,
              months: parseInt(months) || 0,
              originationFee: parseFloat(originationFee) || 0,
              annualTaxPct: parseFloat(annualTaxPct) || 0,
              monthlyIns: parseFloat(monthlyIns) || 0,
              monthlyUtilities: parseFloat(monthlyUtilities) || 0,
              sellingCostPct: parseFloat(sellingCostPct) || 7,
            }}
            outputs={{ ...stack }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
