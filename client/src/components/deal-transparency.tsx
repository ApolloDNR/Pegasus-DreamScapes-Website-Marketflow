import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Building2,
  Hammer,
  FileText,
  Shield,
  Target,
  Calculator,
  PieChart,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  Percent,
  ArrowRight,
  Landmark,
  Home
} from "lucide-react";

interface CapitalProject {
  id: number;
  title: string;
  fundingGoal: number;
  amountRaised: number;
  minInvestment: number;
  structure?: string;
  askingInterestRate?: string;
  askingLoanDuration?: string;
  askingEquityPercent?: string;
  askingProfitSplit?: string;
  projectedReturn?: string;
  holdPeriod?: string;
  investorCount?: number;
  purchasePrice?: number;
  rehabBudget?: number;
  softCosts?: number;
  operatorEquity?: number;
  contingency?: number;
  projectedARV?: number;
  projectedProfit?: number;
  acquisitionDate?: string;
  constructionStart?: string;
  constructionEnd?: string;
  stabilizationDate?: string;
  exitDate?: string;
  startDate?: string;
  estimatedCompletion?: string;
}

interface Commitment {
  id: number;
  committedAmount: number;
  status: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

const parseRate = (rateStr?: string): number => {
  if (!rateStr) return 0;
  const match = rateStr.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
};

const parseMonths = (durationStr?: string): number => {
  if (!durationStr) return 12;
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 12;
};

export function CapitalStackBreakdown({ project }: { project: CapitalProject }) {
  const capitalStack = useMemo(() => {
    const purchasePrice = project.purchasePrice || 0;
    const rehabBudget = project.rehabBudget || 0;
    const softCosts = project.softCosts || 0;
    const contingency = project.contingency || 0;
    const operatorEquity = project.operatorEquity || 0;
    
    const totalProjectCost = purchasePrice + rehabBudget + softCosts + contingency;
    const debtRaised = project.fundingGoal;
    const totalCapitalization = operatorEquity + debtRaised;

    return {
      purchasePrice,
      rehabBudget,
      softCosts,
      contingency,
      operatorEquity,
      debtRaised,
      totalProjectCost,
      totalCapitalization,
      operatorEquityPercent: totalCapitalization > 0 ? (operatorEquity / totalCapitalization) * 100 : 0,
      debtPercent: totalCapitalization > 0 ? (debtRaised / totalCapitalization) * 100 : 0,
    };
  }, [project]);

  if (!project.purchasePrice && !project.rehabBudget) {
    return null;
  }

  const stackItems = [
    { label: "Purchase Price", value: capitalStack.purchasePrice, icon: Home, color: "bg-blue-500" },
    { label: "Rehab / Construction", value: capitalStack.rehabBudget, icon: Hammer, color: "bg-amber-500" },
    { label: "Soft Costs & Fees", value: capitalStack.softCosts, icon: FileText, color: "bg-purple-500" },
    { label: "Contingency", value: capitalStack.contingency, icon: Shield, color: "bg-gray-500" },
  ].filter(item => item.value > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary" />
          Capital Stack Breakdown
        </CardTitle>
        <CardDescription>How the total project cost is allocated</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {stackItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm">{item.label}</span>
              </div>
              <span className="font-medium">{formatCurrency(item.value)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex items-center justify-between font-semibold">
            <span>Total Project Cost</span>
            <span>{formatCurrency(capitalStack.totalProjectCost)}</span>
          </div>
        </div>

        <div className="pt-4 border-t space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Funding Sources</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">Operator Equity</span>
            </div>
            <div className="text-right">
              <span className="font-medium">{formatCurrency(capitalStack.operatorEquity)}</span>
              <span className="text-xs text-muted-foreground ml-2">
                ({capitalStack.operatorEquityPercent.toFixed(0)}%)
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm">Investor Capital (Raising)</span>
            </div>
            <div className="text-right">
              <span className="font-medium">{formatCurrency(capitalStack.debtRaised)}</span>
              <span className="text-xs text-muted-foreground ml-2">
                ({capitalStack.debtPercent.toFixed(0)}%)
              </span>
            </div>
          </div>
          
          <div className="h-4 rounded-full overflow-hidden flex bg-muted">
            <div 
              className="bg-green-500 transition-all" 
              style={{ width: `${capitalStack.operatorEquityPercent}%` }}
            />
            <div 
              className="bg-primary transition-all" 
              style={{ width: `${capitalStack.debtPercent}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DealLevelTransparency({ project, commitments = [] }: { project: CapitalProject; commitments?: Commitment[] }) {
  const annualRate = parseRate(project.askingInterestRate);
  const termMonths = parseMonths(project.askingLoanDuration);
  
  const calculations = useMemo(() => {
    const fundingGoal = project.fundingGoal;
    const amountRaised = project.amountRaised || 0;
    const remaining = Math.max(0, fundingGoal - amountRaised);
    const progress = fundingGoal > 0 ? (amountRaised / fundingGoal) * 100 : 0;
    
    const totalInterestOperatorPays = (fundingGoal * (annualRate / 100) * (termMonths / 12));
    const totalRepayment = fundingGoal + totalInterestOperatorPays;
    
    return {
      fundingGoal,
      amountRaised,
      remaining,
      progress,
      totalInterestOperatorPays,
      totalRepayment,
      investorCount: project.investorCount || commitments.length || 0,
    };
  }, [project, commitments, annualRate, termMonths]);

  const isDebtDeal = project.structure?.toLowerCase() === "debt";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Deal Transparency
        </CardTitle>
        <CardDescription>Complete financial overview of this opportunity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-primary/5 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Total Raise</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(calculations.fundingGoal)}</p>
          </div>
          <div className="p-3 bg-green-500/5 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Amount Raised</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(calculations.amountRaised)}</p>
          </div>
          <div className="p-3 bg-amber-500/5 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="text-lg font-bold text-amber-600">{formatCurrency(calculations.remaining)}</p>
          </div>
          <div className="p-3 bg-blue-500/5 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Investors</p>
            <p className="text-lg font-bold text-blue-600">{calculations.investorCount}</p>
          </div>
        </div>

        {isDebtDeal && annualRate > 0 && (
          <div className="pt-4 border-t space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <Landmark className="w-4 h-4" />
              Operator's Total Obligation
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Total Interest to Pay</p>
                <p className="font-bold text-red-600">{formatCurrency(calculations.totalInterestOperatorPays)}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Total Repayment</p>
                <p className="font-bold">{formatCurrency(calculations.totalRepayment)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {annualRate}% annual rate over {termMonths} months
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function InvestorReturnCalculator({ project }: { project: CapitalProject }) {
  const [investAmount, setInvestAmount] = useState<string>("");
  
  const annualRate = parseRate(project.askingInterestRate);
  const termMonths = parseMonths(project.askingLoanDuration);
  const equityPercent = parseFloat(project.askingEquityPercent || "0");
  
  const isDebtDeal = project.structure?.toLowerCase() === "debt";
  const isEquityDeal = project.structure?.toLowerCase() === "equity";
  
  const calculations = useMemo(() => {
    const principal = parseFloat(investAmount) || 0;
    
    if (isDebtDeal) {
      const totalInterest = principal * (annualRate / 100) * (termMonths / 12);
      const monthlyInterest = termMonths > 0 ? totalInterest / termMonths : 0;
      const totalPayout = principal + totalInterest;
      const effectiveAnnualReturn = termMonths > 0 ? (totalInterest / principal) * (12 / termMonths) * 100 : 0;
      
      return {
        principal,
        totalInterest,
        monthlyInterest,
        totalPayout,
        effectiveAnnualReturn: isNaN(effectiveAnnualReturn) ? 0 : effectiveAnnualReturn,
      };
    }
    
    return { principal, totalInterest: 0, monthlyInterest: 0, totalPayout: principal, effectiveAnnualReturn: 0 };
  }, [investAmount, annualRate, termMonths, isDebtDeal]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="w-5 h-5 text-green-600" />
          Your Return Calculator
        </CardTitle>
        <CardDescription>
          Enter your investment amount to see projected returns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="calc-amount">Investment Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="calc-amount"
              type="number"
              placeholder={`Min ${formatCurrency(project.minInvestment)}`}
              value={investAmount}
              onChange={(e) => setInvestAmount(e.target.value)}
              className="pl-10 text-lg font-semibold"
              data-testid="input-calculator-amount"
            />
          </div>
          {parseFloat(investAmount) > 0 && parseFloat(investAmount) < project.minInvestment && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Below minimum investment of {formatCurrency(project.minInvestment)}
            </p>
          )}
        </div>

        {calculations.principal > 0 && isDebtDeal && (
          <div className="space-y-4 pt-4 border-t animate-in fade-in-50 duration-300">
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-md border border-green-500/20">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Your Projected Earnings</p>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Principal</p>
                  <p className="text-lg font-bold">{formatCurrency(calculations.principal)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Interest</p>
                  <p className="text-lg font-bold text-green-600">+{formatCurrency(calculations.totalInterest)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Payout</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(calculations.totalPayout)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Monthly Interest</p>
                <p className="font-bold text-green-600">{formatCurrency(calculations.monthlyInterest)}/mo</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Effective Annual</p>
                <p className="font-bold">{calculations.effectiveAnnualReturn.toFixed(1)}%</p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
              <strong>Calculation:</strong> {formatCurrency(calculations.principal)} × {annualRate}% × ({termMonths} ÷ 12) = {formatCurrency(calculations.totalInterest)} interest
            </div>
          </div>
        )}

        {calculations.principal === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calculator className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>Enter an amount above to see your projected returns</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ScenarioCalculator({ project }: { project: CapitalProject }) {
  const [investAmount, setInvestAmount] = useState<string>("");
  
  const principal = parseFloat(investAmount) || 0;
  const projectedProfit = project.projectedProfit || 0;
  const fundingGoal = project.fundingGoal || 1;
  const askingEquityPercent = parseFloat(project.askingEquityPercent || "20");
  
  const profitSplit = project.askingProfitSplit || "70/30";
  const investorSplitPercent = parseInt(profitSplit.split("/")[0]) || 70;
  
  const scenarios = useMemo(() => {
    if (principal <= 0 || fundingGoal <= 0) return null;
    
    const investorShareOfRaise = principal / fundingGoal;
    
    const baseProfit = projectedProfit * (investorSplitPercent / 100) * investorShareOfRaise;
    const lowProfit = baseProfit * 0.6;
    const highProfit = baseProfit * 1.4;
    
    return {
      low: {
        profit: lowProfit,
        total: principal + lowProfit,
        roi: ((lowProfit / principal) * 100),
      },
      base: {
        profit: baseProfit,
        total: principal + baseProfit,
        roi: ((baseProfit / principal) * 100),
      },
      high: {
        profit: highProfit,
        total: principal + highProfit,
        roi: ((highProfit / principal) * 100),
      },
    };
  }, [principal, projectedProfit, fundingGoal, investorSplitPercent]);

  if (project.structure?.toLowerCase() !== "equity") {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Equity Scenario Calculator
        </CardTitle>
        <CardDescription>
          See potential returns across different market conditions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="scenario-amount">Investment Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="scenario-amount"
              type="number"
              placeholder={`Min ${formatCurrency(project.minInvestment)}`}
              value={investAmount}
              onChange={(e) => setInvestAmount(e.target.value)}
              className="pl-10"
              data-testid="input-scenario-amount"
            />
          </div>
        </div>

        {scenarios && (
          <div className="space-y-3 pt-4 border-t animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <TrendingDown className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700">Conservative</span>
                </div>
                <p className="text-xs text-muted-foreground">Profit</p>
                <p className="font-bold text-amber-600">{formatCurrency(scenarios.low.profit)}</p>
                <p className="text-xs text-muted-foreground mt-2">ROI</p>
                <p className="text-sm font-medium">{scenarios.low.roi.toFixed(1)}%</p>
              </div>
              
              <div className="p-4 bg-green-500/10 rounded-lg border-2 border-green-500/30 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Base Case</span>
                </div>
                <p className="text-xs text-muted-foreground">Profit</p>
                <p className="font-bold text-green-600">{formatCurrency(scenarios.base.profit)}</p>
                <p className="text-xs text-muted-foreground mt-2">ROI</p>
                <p className="text-sm font-medium">{scenarios.base.roi.toFixed(1)}%</p>
              </div>
              
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">Optimistic</span>
                </div>
                <p className="text-xs text-muted-foreground">Profit</p>
                <p className="font-bold text-blue-600">{formatCurrency(scenarios.high.profit)}</p>
                <p className="text-xs text-muted-foreground mt-2">ROI</p>
                <p className="text-sm font-medium">{scenarios.high.roi.toFixed(1)}%</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Based on {profitSplit} profit split and projected project profit of {formatCurrency(projectedProfit)}
            </p>
          </div>
        )}

        {!scenarios && (
          <div className="text-center py-6 text-muted-foreground">
            <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Enter an amount to see scenario projections</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function InvestorBreakdownTable({ project, commitments = [] }: { project: CapitalProject; commitments?: Commitment[] }) {
  const annualRate = parseRate(project.askingInterestRate);
  const termMonths = parseMonths(project.askingLoanDuration);
  const isDebtDeal = project.structure?.toLowerCase() === "debt";

  const investorData = useMemo(() => {
    return commitments
      .filter(c => c.status === "accepted" || c.status === "funded")
      .map((commitment, index) => {
        const principal = commitment.committedAmount;
        const interest = isDebtDeal ? principal * (annualRate / 100) * (termMonths / 12) : 0;
        const totalPayout = principal + interest;
        
        return {
          id: commitment.id,
          label: `Investor ${index + 1}`,
          principal,
          interest,
          totalPayout,
          returnPercent: principal > 0 ? ((interest / principal) * 100) : 0,
        };
      });
  }, [commitments, annualRate, termMonths, isDebtDeal]);

  if (investorData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Investor Return Breakdown
        </CardTitle>
        <CardDescription>
          Individual investor contributions and projected returns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground font-medium pb-2 border-b">
            <span>Investor</span>
            <span className="text-right">Principal</span>
            <span className="text-right">{isDebtDeal ? "Interest" : "Return"}</span>
            <span className="text-right">Total Payout</span>
          </div>
          
          {investorData.map((investor) => (
            <div key={investor.id} className="grid grid-cols-4 gap-2 text-sm py-2 border-b border-muted/50 last:border-0">
              <span className="font-medium">{investor.label}</span>
              <span className="text-right">{formatCurrency(investor.principal)}</span>
              <span className="text-right text-green-600">+{formatCurrency(investor.interest)}</span>
              <span className="text-right font-semibold">{formatCurrency(investor.totalPayout)}</span>
            </div>
          ))}
          
          <div className="grid grid-cols-4 gap-2 text-sm py-3 bg-muted/30 rounded-lg px-2 font-semibold">
            <span>Total</span>
            <span className="text-right">
              {formatCurrency(investorData.reduce((sum, i) => sum + i.principal, 0))}
            </span>
            <span className="text-right text-green-600">
              +{formatCurrency(investorData.reduce((sum, i) => sum + i.interest, 0))}
            </span>
            <span className="text-right">
              {formatCurrency(investorData.reduce((sum, i) => sum + i.totalPayout, 0))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TimelinePhase {
  label: string;
  date?: string;
  icon: React.ReactNode;
  status: "completed" | "current" | "upcoming";
  description?: string;
}

export function RepaymentTimeline({ project }: { project: CapitalProject }) {
  const phases = useMemo((): TimelinePhase[] => {
    const now = new Date();
    
    const getStatus = (dateStr?: string): "completed" | "current" | "upcoming" => {
      if (!dateStr) return "upcoming";
      const date = new Date(dateStr);
      if (date < now) return "completed";
      const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      if (date < threeMonthsFromNow) return "current";
      return "upcoming";
    };

    const formatDate = (dateStr?: string) => {
      if (!dateStr) return "TBD";
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    };

    return [
      {
        label: "Investment Period",
        date: formatDate(project.startDate),
        icon: <Wallet className="w-4 h-4" />,
        status: getStatus(project.startDate),
        description: "Capital raise and acquisition phase",
      },
      {
        label: "Construction",
        date: formatDate(project.constructionStart),
        icon: <Hammer className="w-4 h-4" />,
        status: getStatus(project.constructionStart),
        description: "Renovation and improvement work",
      },
      {
        label: "Stabilization",
        date: formatDate(project.constructionEnd),
        icon: <Building2 className="w-4 h-4" />,
        status: getStatus(project.constructionEnd),
        description: "Property completion and listing",
      },
      {
        label: "Exit / Repayment",
        date: formatDate(project.exitDate || project.estimatedCompletion),
        icon: <DollarSign className="w-4 h-4" />,
        status: getStatus(project.exitDate || project.estimatedCompletion),
        description: "Sale or refinance with investor payout",
      },
    ];
  }, [project]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          Investment Timeline
        </CardTitle>
        <CardDescription>Project phases from investment to exit</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
          
          <div className="space-y-6">
            {phases.map((phase, index) => (
              <div key={index} className="relative pl-10">
                <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  phase.status === "completed" 
                    ? "bg-green-500 border-green-500 text-white" 
                    : phase.status === "current"
                    ? "bg-amber-500 border-amber-500 text-white animate-pulse"
                    : "bg-background border-muted text-muted-foreground"
                }`}>
                  {phase.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    phase.icon
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{phase.label}</span>
                    <Badge variant={phase.status === "completed" ? "default" : phase.status === "current" ? "secondary" : "outline"} className="text-xs">
                      {phase.date}
                    </Badge>
                  </div>
                  {phase.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">{phase.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-3 bg-muted/30 rounded-lg flex items-center gap-3">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Expected Hold Period</p>
            <p className="text-xs text-muted-foreground">{project.holdPeriod || "12-18 months"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DynamicROIPreview({ 
  investAmount, 
  structure, 
  project 
}: { 
  investAmount: string;
  structure: string;
  project: CapitalProject;
}) {
  const principal = parseFloat(investAmount) || 0;
  const annualRate = parseRate(project.askingInterestRate);
  const termMonths = parseMonths(project.askingLoanDuration);
  
  const calculations = useMemo(() => {
    if (principal <= 0) return null;
    
    if (structure === "debt") {
      const totalInterest = principal * (annualRate / 100) * (termMonths / 12);
      const monthlyInterest = termMonths > 0 ? totalInterest / termMonths : 0;
      const totalPayout = principal + totalInterest;
      
      return {
        totalInterest,
        monthlyInterest,
        totalPayout,
        roi: principal > 0 ? (totalInterest / principal) * 100 : 0,
      };
    }
    
    const projectedProfit = project.projectedProfit || 0;
    const profitSplit = project.askingProfitSplit || "70/30";
    const investorSplitPercent = parseInt(profitSplit.split("/")[0]) || 70;
    const investorShareOfRaise = principal / (project.fundingGoal || 1);
    const estimatedProfit = projectedProfit * (investorSplitPercent / 100) * investorShareOfRaise;
    
    return {
      totalInterest: estimatedProfit,
      monthlyInterest: 0,
      totalPayout: principal + estimatedProfit,
      roi: principal > 0 ? (estimatedProfit / principal) * 100 : 0,
    };
  }, [principal, structure, annualRate, termMonths, project]);

  if (!calculations) return null;

  return (
    <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-md border border-green-500/20 animate-in fade-in-50 duration-200">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-green-600" />
        <span className="font-medium text-green-700 dark:text-green-400">Projected Returns</span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-muted-foreground">Principal</p>
          <p className="font-bold">{formatCurrency(principal)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{structure === "debt" ? "Interest" : "Profit Share"}</p>
          <p className="font-bold text-green-600">+{formatCurrency(calculations.totalInterest)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total Payout</p>
          <p className="font-bold text-primary">{formatCurrency(calculations.totalPayout)}</p>
        </div>
      </div>
      {structure === "debt" && calculations.monthlyInterest > 0 && (
        <p className="text-xs text-center text-muted-foreground mt-2">
          ≈ {formatCurrency(calculations.monthlyInterest)}/month over {termMonths} months ({calculations.roi.toFixed(1)}% ROI)
        </p>
      )}
    </div>
  );
}
