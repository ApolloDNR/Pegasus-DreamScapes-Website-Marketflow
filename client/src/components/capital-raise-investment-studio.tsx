import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  Calendar,
  Clock,
  Send,
  Building2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  TrendingUp,
  Percent,
  MessageSquare,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Zap,
  PieChart,
  Banknote,
  Users,
  FileText,
  Bot,
  Loader2,
  Target,
  Shield,
  Calculator,
  BarChart3,
  Layers,
  Timer,
  Award,
  TrendingDown,
  HandCoins,
  ArrowUpRight,
  Gauge,
} from "lucide-react";
import type { CapitalProject } from "@shared/schema";

const investmentSchema = z.object({
  investmentAmount: z.number().min(1000, "Investment must be at least $1,000"),
  acceptOperatorTerms: z.boolean(),
  counterInterestRate: z.string().optional(),
  counterLoanDuration: z.string().optional(),
  counterProfitSplit: z.number().min(50).max(90).optional(),
  counterPreferredReturn: z.number().min(0).max(20).optional(),
  counterHoldPeriod: z.string().optional(),
  investmentTranche: z.enum(["single", "milestone", "staged"]),
  milestoneConditions: z.string().optional(),
  fundingTimeline: z.string(),
  proofOfFunds: z.boolean(),
  accreditedInvestor: z.boolean(),
  notes: z.string().optional(),
});

export type InvestmentStudioData = z.infer<typeof investmentSchema>;

interface ChatMessage {
  id: string;
  sender: "user" | "operator" | "peggy";
  senderName: string;
  message: string;
  timestamp: Date;
  isAI?: boolean;
}

interface CapitalRaiseInvestmentStudioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "accept" | "counter";
  project: CapitalProject;
  onSubmit: (data: InvestmentStudioData) => void;
}

const INVESTMENT_TRANCHES = [
  {
    id: "single",
    label: "Single Tranche",
    icon: Banknote,
    description: "Full investment at closing",
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  {
    id: "milestone",
    label: "Milestone Based",
    icon: Target,
    description: "Release funds at project milestones",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    id: "staged",
    label: "Staged Deployment",
    icon: Layers,
    description: "Deploy capital in scheduled phases",
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
];

const FUNDING_TIMELINES = [
  { value: "immediate", label: "Immediate (1-3 days)", speed: "fast" },
  { value: "standard", label: "Standard (1-2 weeks)", speed: "normal" },
  { value: "extended", label: "Extended (2-4 weeks)", speed: "slow" },
];

export function CapitalRaiseInvestmentStudio({
  open,
  onOpenChange,
  mode,
  project,
  onSubmit,
}: CapitalRaiseInvestmentStudioProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isPeggyTyping, setIsPeggyTyping] = useState(false);
  const [peggyInsights, setPeggyInsights] = useState<string[]>([]);
  const [matchScore, setMatchScore] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const steps = [
    { id: "amount", label: "Investment Amount", icon: DollarSign },
    { id: "terms", label: mode === "accept" ? "Accept Terms" : "Counter Terms", icon: mode === "accept" ? Check : TrendingUp },
    { id: "structure", label: "Funding Structure", icon: Layers },
    { id: "review", label: "Review & Submit", icon: CheckCircle2 },
  ];

  const form = useForm<InvestmentStudioData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      investmentAmount: project.minInvestment || 25000,
      acceptOperatorTerms: mode === "accept",
      counterInterestRate: project.askingInterestRate || "",
      counterLoanDuration: project.askingLoanDuration || "",
      counterProfitSplit: parseInt(project.askingProfitSplit?.split("/")[0] || "70"),
      counterPreferredReturn: parseFloat(project.askingPreferredReturn?.replace("%", "") || "8"),
      counterHoldPeriod: project.holdPeriod || "",
      investmentTranche: "single",
      milestoneConditions: "",
      fundingTimeline: "standard",
      proofOfFunds: false,
      accreditedInvestor: false,
      notes: "",
    },
  });

  const watchedValues = form.watch();
  const investmentAmount = watchedValues.investmentAmount;
  const fundingGoal = project.fundingGoal || 0;
  const amountRaised = project.amountRaised || 0;
  const remainingToFund = fundingGoal - amountRaised;
  const myContributionPercent = fundingGoal > 0 ? (investmentAmount / fundingGoal) * 100 : 0;
  const projectedEquity = myContributionPercent;

  const isDebt = project.structure === "DEBT";
  const isEquity = project.structure === "EQUITY";
  const isHybrid = project.structure === "HYBRID";

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      generatePeggyInsights();
      addPeggyWelcome();
      calculateMatchScore();
    }
  }, [open]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    calculateMatchScore();
  }, [watchedValues]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateMatchScore = () => {
    let score = 70;
    if (investmentAmount >= (project.minInvestment || 25000)) score += 10;
    if (watchedValues.accreditedInvestor) score += 8;
    if (watchedValues.proofOfFunds) score += 7;
    if (watchedValues.fundingTimeline === "immediate") score += 5;
    if (watchedValues.acceptOperatorTerms && mode === "accept") score += 10;
    setMatchScore(Math.min(score, 100));
  };

  const addPeggyWelcome = () => {
    const structureLabel = isDebt ? "debt financing" : isEquity ? "equity partnership" : "hybrid investment";
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      sender: "peggy",
      senderName: "Peggy AI",
      message: `Welcome to ${project.title}! This is a ${structureLabel} opportunity seeking ${formatCurrency(fundingGoal)} total capital. The operator is offering ${project.projectedReturn || project.askingInterestRate || "attractive returns"}. I'll help you structure your investment optimally.`,
      timestamp: new Date(),
      isAI: true,
    };
    setChatMessages([welcomeMessage]);
  };

  const generatePeggyInsights = () => {
    const insights: string[] = [];
    
    const progressPercent = (amountRaised / fundingGoal) * 100;
    if (progressPercent > 70) {
      insights.push(`This project is ${progressPercent.toFixed(0)}% funded - limited spots remaining!`);
    } else if (progressPercent > 40) {
      insights.push(`Good traction: ${progressPercent.toFixed(0)}% funded with strong investor interest`);
    }

    if (isDebt && project.askingInterestRate) {
      insights.push(`Debt terms: ${project.askingInterestRate} annual interest over ${project.askingLoanDuration}`);
    }
    
    if ((isEquity || isHybrid) && project.askingProfitSplit) {
      insights.push(`Profit split: ${project.askingProfitSplit} (Investor/Operator)`);
    }

    if (project.projectedReturn) {
      insights.push(`Projected return: ${project.projectedReturn}`);
    }

    if (project.riskLevel === "low") {
      insights.push("Lower risk profile - suitable for conservative investors");
    } else if (project.riskLevel === "high") {
      insights.push("Higher risk/reward profile - for experienced investors");
    }

    insights.push("Accredited investor status may unlock additional opportunities");

    setPeggyInsights(insights);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      senderName: "You",
      message: chatInput,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");

    setIsPeggyTyping(true);
    setTimeout(() => {
      const peggyResponse = generatePeggyResponse(chatInput);
      setChatMessages((prev) => [...prev, peggyResponse]);
      setIsPeggyTyping(false);
    }, 1500);
  };

  const generatePeggyResponse = (userInput: string): ChatMessage => {
    const lowerInput = userInput.toLowerCase();
    let response = "";

    if (lowerInput.includes("return") || lowerInput.includes("profit")) {
      response = `For this ${project.structure} structure, the operator projects ${project.projectedReturn || "strong returns"}. Based on similar deals, investors typically see actual returns within 10-20% of projections. Counter-offering for a higher profit split can improve your upside.`;
    } else if (lowerInput.includes("risk") || lowerInput.includes("safe")) {
      response = `This project is rated as ${project.riskLevel || "medium"} risk. Key factors: operator track record, location strength (${project.location}), and market conditions. I recommend reviewing the operator's previous project performance.`;
    } else if (lowerInput.includes("interest") || lowerInput.includes("rate")) {
      response = `Current market rates for similar ${project.strategy} projects range from 10-14% annually. The operator's asking rate of ${project.askingInterestRate || "standard terms"} is ${parseFloat(project.askingInterestRate || "12") > 12 ? "above" : "within"} market averages.`;
    } else if (lowerInput.includes("invest") || lowerInput.includes("amount")) {
      response = `The minimum investment is ${formatCurrency(project.minInvestment || 25000)}. Investing ${formatCurrency(Math.round(fundingGoal * 0.1))} or more may give you preferred treatment. Larger commitments often unlock better terms.`;
    } else if (lowerInput.includes("counter") || lowerInput.includes("negotiate")) {
      response = `Good strategy! On ${project.structure} deals, you can typically negotiate: ${isDebt ? "interest rate (+1-2%), loan term, and payment schedule" : "profit split (5-10% more), preferred return, and hold period"}. Operators are more flexible when you commit quickly and provide proof of funds.`;
    } else {
      response = `Great question about ${project.title}! This ${project.strategy?.replace(/-/g, " ")} project in ${project.location} has a solid foundation. Would you like me to analyze specific terms, suggest counter-offer strategies, or explain the investment structure?`;
    }

    return {
      id: Date.now().toString(),
      sender: "peggy",
      senderName: "Peggy AI",
      message: response,
      timestamp: new Date(),
      isAI: true,
    };
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "optimize_investment":
        const optimal = Math.min(Math.round(fundingGoal * 0.15), project.maxInvestmentPerInvestor || 200000);
        form.setValue("investmentAmount", optimal);
        toast({ title: "Investment Optimized", description: `Set to optimal amount: ${formatCurrency(optimal)}` });
        break;
      case "aggressive_counter":
        if (isDebt) {
          const rate = parseFloat(project.askingInterestRate || "12");
          form.setValue("counterInterestRate", `${(rate + 2).toFixed(1)}%`);
        } else {
          form.setValue("counterProfitSplit", Math.min(85, (watchedValues.counterProfitSplit || 70) + 10));
        }
        toast({ title: "Aggressive Terms Applied", description: "Counter-offer optimized for maximum returns" });
        break;
      case "fast_track":
        form.setValue("fundingTimeline", "immediate");
        form.setValue("proofOfFunds", true);
        toast({ title: "Fast Track Enabled", description: "Immediate funding timeline selected" });
        break;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (data: InvestmentStudioData) => {
    onSubmit(data);
    toast({
      title: mode === "accept" ? "Investment Committed!" : "Counter-Offer Submitted!",
      description: mode === "accept" 
        ? `Your ${formatCurrency(data.investmentAmount)} investment has been submitted.`
        : "The operator will review your proposed terms.",
    });
    onOpenChange(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const renderAmountStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Investment Amount</h3>
        <p className="text-sm text-muted-foreground">
          Choose how much you want to invest in this {project.structure?.toLowerCase()} opportunity
        </p>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Funding Progress</p>
              <p className="text-2xl font-bold">{formatCurrency(amountRaised)} <span className="text-sm font-normal text-muted-foreground">/ {formatCurrency(fundingGoal)}</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-lg font-semibold text-primary">{formatCurrency(remainingToFund)}</p>
            </div>
          </div>
          <Progress value={(amountRaised / fundingGoal) * 100} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{((amountRaised / fundingGoal) * 100).toFixed(0)}% funded</span>
            <span>{project.investorCount || 0} investors</span>
          </div>
        </CardContent>
      </Card>

      <FormField
        control={form.control}
        name="investmentAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Your Investment
            </FormLabel>
            <FormControl>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="number"
                  className="pl-10 text-xl h-14 font-semibold"
                  placeholder="50000"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  data-testid="input-investment-amount"
                />
              </div>
            </FormControl>
            <FormDescription className="flex items-center justify-between">
              <span>Minimum: {formatCurrency(project.minInvestment || 25000)}</span>
              <span className="font-medium text-primary">{myContributionPercent.toFixed(1)}% of total raise</span>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-3 gap-3">
        {[0.05, 0.10, 0.20].map((percent) => (
          <Button
            key={percent}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => form.setValue("investmentAmount", Math.round(fundingGoal * percent))}
            data-testid={`button-preset-${percent * 100}`}
          >
            {formatCurrency(Math.round(fundingGoal * percent))}
          </Button>
        ))}
      </div>

      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Calculator className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-400">Investment Analysis</h4>
              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Your equity stake:</span>
                  <span className="font-medium">{projectedEquity.toFixed(2)}%</span>
                </div>
                {isDebt && (
                  <div className="flex justify-between">
                    <span>Projected interest income:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(investmentAmount * (parseFloat(project.askingInterestRate || "12") / 100))} /yr
                    </span>
                  </div>
                )}
                {(isEquity || isHybrid) && project.projectedProfit && (
                  <div className="flex justify-between">
                    <span>Projected profit share:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency((project.projectedProfit * projectedEquity) / 100 * (parseInt(project.askingProfitSplit?.split("/")[0] || "70") / 100))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTermsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {mode === "accept" ? "Operator's Terms" : "Propose Your Terms"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {mode === "accept" 
            ? "Review and accept the operator's asking terms" 
            : "Adjust terms to fit your investment criteria"}
        </p>
      </div>

      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <HandCoins className="w-4 h-4 text-primary" />
            Operator's Asking Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          {isDebt ? (
            <>
              <div className="p-3 rounded-lg bg-background">
                <Label className="text-muted-foreground text-xs">Interest Rate</Label>
                <p className="font-bold text-lg">{project.askingInterestRate || "TBD"}</p>
              </div>
              <div className="p-3 rounded-lg bg-background">
                <Label className="text-muted-foreground text-xs">Loan Duration</Label>
                <p className="font-bold text-lg">{project.askingLoanDuration || "TBD"}</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 rounded-lg bg-background">
                <Label className="text-muted-foreground text-xs">Profit Split</Label>
                <p className="font-bold text-lg">{project.askingProfitSplit || "TBD"}</p>
              </div>
              <div className="p-3 rounded-lg bg-background">
                <Label className="text-muted-foreground text-xs">Projected Return</Label>
                <p className="font-bold text-lg">{project.projectedReturn || "TBD"}</p>
              </div>
            </>
          )}
          <div className="p-3 rounded-lg bg-background">
            <Label className="text-muted-foreground text-xs">Hold Period</Label>
            <p className="font-bold text-lg">{project.holdPeriod || "TBD"}</p>
          </div>
          <div className="p-3 rounded-lg bg-background">
            <Label className="text-muted-foreground text-xs">Structure</Label>
            <p className="font-bold text-lg">{project.structure}</p>
          </div>
        </CardContent>
      </Card>

      {mode === "accept" ? (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-6">
            <FormField
              control={form.control}
              name="acceptOperatorTerms"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <div>
                      <FormLabel className="text-base">Accept Operator Terms</FormLabel>
                      <FormDescription>I agree to invest under the terms above</FormDescription>
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-accept-terms"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <TrendingUp className="w-4 h-4" />
              Your Counter Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {isDebt && (
              <>
                <FormField
                  control={form.control}
                  name="counterInterestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Counter Interest Rate</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="14%" {...field} data-testid="input-counter-interest" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="counterLoanDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Counter Loan Duration</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="12 months" {...field} data-testid="input-counter-duration" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}

            {(isEquity || isHybrid) && (
              <>
                <FormField
                  control={form.control}
                  name="counterProfitSplit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Counter Profit Split (Investor %)</FormLabel>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-green-600 w-16">{field.value}%</span>
                        <FormControl>
                          <Slider
                            value={[field.value || 70]}
                            onValueChange={(v) => field.onChange(v[0])}
                            max={90}
                            min={50}
                            step={5}
                            className="flex-1"
                            data-testid="slider-counter-profit-split"
                          />
                        </FormControl>
                        <span className="text-lg font-medium text-blue-600 w-16">{100 - (field.value || 70)}%</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Investor Share</span>
                        <span>Operator Share</span>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="counterPreferredReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Return (%)</FormLabel>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold w-12">{field.value}%</span>
                        <FormControl>
                          <Slider
                            value={[field.value || 8]}
                            onValueChange={(v) => field.onChange(v[0])}
                            max={20}
                            min={0}
                            step={1}
                            className="flex-1"
                            data-testid="slider-preferred-return"
                          />
                        </FormControl>
                      </div>
                      <FormDescription>Minimum return before profit split applies</FormDescription>
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="counterHoldPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Counter Hold Period</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 6-9 months" {...field} data-testid="input-counter-hold" />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStructureStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Funding Structure</h3>
        <p className="text-sm text-muted-foreground">Choose how you want to deploy your capital</p>
      </div>

      <FormField
        control={form.control}
        name="investmentTranche"
        render={({ field }) => (
          <div className="grid gap-4">
            {INVESTMENT_TRANCHES.map((tranche) => {
              const Icon = tranche.icon;
              const isSelected = field.value === tranche.id;
              return (
                <motion.button
                  key={tranche.id}
                  type="button"
                  onClick={() => field.onChange(tranche.id)}
                  className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected 
                      ? `${tranche.borderColor} ${tranche.bgColor}` 
                      : "border-border hover-elevate"
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  data-testid={`button-tranche-${tranche.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${tranche.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${tranche.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{tranche.label}</div>
                      <div className="text-sm text-muted-foreground">{tranche.description}</div>
                    </div>
                    {isSelected && <CheckCircle2 className={`w-5 h-5 ${tranche.color}`} />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      />

      {watchedValues.investmentTranche === "milestone" && (
        <FormField
          control={form.control}
          name="milestoneConditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Milestone Conditions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., 50% at acquisition, 25% at construction start, 25% at completion..."
                  className="min-h-[80px]"
                  {...field}
                  data-testid="textarea-milestone-conditions"
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}

      <Separator />

      <FormField
        control={form.control}
        name="fundingTimeline"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Funding Timeline</FormLabel>
            <div className="grid grid-cols-3 gap-3">
              {FUNDING_TIMELINES.map((timeline) => (
                <Button
                  key={timeline.value}
                  type="button"
                  variant={field.value === timeline.value ? "default" : "outline"}
                  size="sm"
                  className="h-auto py-3 flex-col"
                  onClick={() => field.onChange(timeline.value)}
                  data-testid={`button-timeline-${timeline.value}`}
                >
                  <Zap className={`w-4 h-4 mb-1 ${timeline.speed === "fast" ? "text-yellow-500" : ""}`} />
                  <span className="text-xs">{timeline.label}</span>
                </Button>
              ))}
            </div>
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="proofOfFunds"
          render={({ field }) => (
            <Card className={`cursor-pointer transition-all ${field.value ? "border-green-500/50 bg-green-500/5" : ""}`}>
              <CardContent className="p-4">
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-proof-of-funds" />
                  </FormControl>
                  <div>
                    <FormLabel className="cursor-pointer">Proof of Funds</FormLabel>
                    <FormDescription className="text-xs">Ready to provide documentation</FormDescription>
                  </div>
                </FormItem>
              </CardContent>
            </Card>
          )}
        />
        <FormField
          control={form.control}
          name="accreditedInvestor"
          render={({ field }) => (
            <Card className={`cursor-pointer transition-all ${field.value ? "border-green-500/50 bg-green-500/5" : ""}`}>
              <CardContent className="p-4">
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-accredited" />
                  </FormControl>
                  <div>
                    <FormLabel className="cursor-pointer">Accredited Investor</FormLabel>
                    <FormDescription className="text-xs">SEC accredited status</FormDescription>
                  </div>
                </FormItem>
              </CardContent>
            </Card>
          )}
        />
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review Your Investment</h3>
        <p className="text-sm text-muted-foreground">Confirm all details before submitting</p>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Investment Amount</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(investmentAmount)}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Gauge className={`w-5 h-5 ${getScoreColor(matchScore)}`} />
                <span className={`text-2xl font-bold ${getScoreColor(matchScore)}`}>{matchScore}</span>
              </div>
              <p className="text-xs text-muted-foreground">Match Score</p>
            </div>
          </div>
          <Progress value={matchScore} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Project</span>
            </div>
            <p className="font-semibold">{project.title}</p>
            <p className="text-sm text-muted-foreground">{project.location}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Structure</span>
            </div>
            <p className="font-semibold">{project.structure}</p>
            <p className="text-sm text-muted-foreground">{project.strategy?.replace(/-/g, " ")}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Investment Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mode === "accept" ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-medium">Accepting operator terms</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">Counter-offer terms</span>
              </div>
              <div className="text-sm space-y-1 pl-6">
                {isDebt && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interest Rate:</span>
                      <span className="font-medium">{watchedValues.counterInterestRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{watchedValues.counterLoanDuration}</span>
                    </div>
                  </>
                )}
                {(isEquity || isHybrid) && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profit Split:</span>
                      <span className="font-medium">{watchedValues.counterProfitSplit}/{100 - (watchedValues.counterProfitSplit || 70)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Preferred Return:</span>
                      <span className="font-medium">{watchedValues.counterPreferredReturn}%</span>
                    </div>
                  </>
                )}
                {watchedValues.counterHoldPeriod && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hold Period:</span>
                    <span className="font-medium">{watchedValues.counterHoldPeriod}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Funding Structure:</span>
            <span className="font-medium capitalize">{watchedValues.investmentTranche.replace(/-/g, " ")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Timeline:</span>
            <span className="font-medium">{FUNDING_TIMELINES.find(t => t.value === watchedValues.fundingTimeline)?.label}</span>
          </div>
          <div className="flex gap-2 pt-2">
            {watchedValues.proofOfFunds && <Badge variant="secondary">Proof of Funds</Badge>}
            {watchedValues.accreditedInvestor && <Badge variant="secondary">Accredited</Badge>}
          </div>
        </CardContent>
      </Card>

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Notes (Optional)</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any additional information for the operator..."
                className="min-h-[80px]"
                {...field}
                data-testid="textarea-notes"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderAmountStep();
      case 1:
        return renderTermsStep();
      case 2:
        return renderStructureStep();
      case 3:
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0">
        <div className="flex h-full">
          <div className="flex-1 flex flex-col overflow-hidden">
            <DialogHeader className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center gap-2">
                    {mode === "accept" ? (
                      <>
                        <HandCoins className="w-5 h-5 text-green-600" />
                        Accept Investment Terms
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Counter Investment Terms
                      </>
                    )}
                  </DialogTitle>
                  <DialogDescription>{project.title} - {project.location}</DialogDescription>
                </div>
                <Badge variant="outline" className={project.structure === "DEBT" ? "border-blue-500/50 text-blue-600" : project.structure === "EQUITY" ? "border-purple-500/50 text-purple-600" : "border-amber-500/50 text-amber-600"}>
                  {project.structure}
                </Badge>
              </div>
            </DialogHeader>

            <div className="px-6 py-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === index;
                  const isComplete = currentStep > index;
                  return (
                    <div key={step.id} className="flex items-center">
                      {index > 0 && <div className={`w-8 h-0.5 mx-1 ${isComplete ? "bg-primary" : "bg-border"}`} />}
                      <button
                        type="button"
                        onClick={() => isComplete && setCurrentStep(index)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : isComplete
                            ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden md:inline">{step.label}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <ScrollArea className="flex-1 px-6 py-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {renderStepContent()}
                    </motion.div>
                  </AnimatePresence>
                </form>
              </Form>
            </ScrollArea>

            <div className="px-6 py-4 border-t bg-muted/30 flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex gap-2">
                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={handleNext} data-testid="button-next">
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={form.handleSubmit(handleSubmit)}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-submit"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {mode === "accept" ? "Commit Investment" : "Submit Counter-Offer"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="w-80 border-l flex flex-col bg-muted/20">
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-primary/30">
                  <AvatarImage src="/peggy-avatar.png" />
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="w-5 h-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">Peggy AI</h3>
                  <p className="text-xs text-muted-foreground">Investment Advisor</p>
                </div>
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              </div>
            </div>

            <div className="p-3 border-b bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium">Quick Insights</span>
              </div>
              <div className="space-y-2">
                {peggyInsights.slice(0, 3).map((insight, i) => (
                  <div key={i} className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                    {insight}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 border-b">
              <div className="text-xs font-medium mb-2">Quick Actions</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleQuickAction("optimize_investment")}
                >
                  <Target className="w-3 h-3 mr-1" />
                  Optimize
                </Button>
                {mode === "counter" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => handleQuickAction("aggressive_counter")}
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Aggressive
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleQuickAction("fast_track")}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Fast Track
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      {msg.isAI ? (
                        <AvatarFallback className="bg-primary/20 text-primary text-[10px]">AI</AvatarFallback>
                      ) : (
                        <AvatarFallback className="bg-muted text-[10px]">You</AvatarFallback>
                      )}
                    </Avatar>
                    <div
                      className={`text-xs p-2 rounded-lg max-w-[85%] ${
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
                {isPeggyTyping && (
                  <div className="flex gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-primary/20 text-primary text-[10px]">AI</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted p-2 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="Ask Peggy..."
                  className="text-xs h-8"
                  data-testid="input-chat"
                />
                <Button size="sm" onClick={handleSendChat} className="h-8 w-8 p-0" data-testid="button-send-chat">
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
