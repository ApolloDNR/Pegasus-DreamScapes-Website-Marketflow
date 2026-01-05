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
  Lock,
  Unlock,
  TrendingUp,
  Percent,
  MessageSquare,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Zap,
  RefreshCw,
  PieChart,
  Banknote,
  HandCoins,
  Users,
  FileText,
  ChevronRight,
  Bot,
  Loader2,
} from "lucide-react";

const offerSchema = z.object({
  structureType: z.enum(["cash", "debt", "equity", "hybrid"]),
  offerPrice: z.number().min(1000, "Offer price must be at least $1,000"),
  earnestMoney: z.number().min(0, "Earnest money must be 0 or more"),
  closeDate: z.string().min(1, "Close date is required"),
  inspectionPeriod: z.number().min(0, "Inspection period must be 0 or more days"),
  financingDays: z.number().min(0, "Financing days must be 0 or more"),
  equityPercentage: z.number().min(0).max(100).optional(),
  preferredReturn: z.number().min(0).max(50).optional(),
  debtAmount: z.number().min(0).optional(),
  interestRate: z.number().min(0).max(30).optional(),
  loanTerm: z.number().min(1).max(360).optional(),
  fundingSource: z.enum(["cash_reserves", "hard_money", "conventional", "private_lender", "self_directed_ira", "other"]),
  contingencies: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type OfferStudioData = z.infer<typeof offerSchema>;

interface DealInfo {
  id: string | number;
  propertyAddress: string;
  askingPrice: number;
  arv?: number;
  repairCost?: number;
  wholesalerName?: string;
  lockedTerms?: {
    minEarnestMoney?: number;
    maxInspectionDays?: number;
    maxCloseDays?: number;
    acceptedStructures?: string[];
  };
}

interface ChatMessage {
  id: string;
  sender: "user" | "wholesaler" | "peggy";
  senderName: string;
  message: string;
  timestamp: Date;
  isAI?: boolean;
}

interface OfferStudioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "new" | "counter";
  dealInfo: DealInfo;
  previousOffer?: Partial<OfferStudioData>;
  onSubmit: (data: OfferStudioData) => void;
}

const STRUCTURE_OPTIONS = [
  {
    id: "cash",
    label: "Cash Buyer",
    icon: Banknote,
    description: "Full cash purchase, fastest close",
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  {
    id: "debt",
    label: "Debt Financing",
    icon: FileText,
    description: "Loan-based purchase with interest",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    id: "equity",
    label: "Equity Partnership",
    icon: Users,
    description: "Profit sharing with the seller",
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  {
    id: "hybrid",
    label: "Hybrid Structure",
    icon: PieChart,
    description: "Combination of debt and equity",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
];

const CONTINGENCY_OPTIONS = [
  { id: "inspection", label: "Property Inspection", recommended: true },
  { id: "financing", label: "Financing Approval" },
  { id: "appraisal", label: "Appraisal Value" },
  { id: "title", label: "Clear Title", recommended: true },
  { id: "survey", label: "Property Survey" },
  { id: "insurance", label: "Insurance Approval" },
];

const FUNDING_SOURCES = [
  { id: "cash_reserves", label: "Cash Reserves", icon: Banknote },
  { id: "hard_money", label: "Hard Money Lender", icon: Zap },
  { id: "conventional", label: "Conventional Loan", icon: Building2 },
  { id: "private_lender", label: "Private Lender", icon: Users },
  { id: "self_directed_ira", label: "Self-Directed IRA", icon: PieChart },
  { id: "other", label: "Other", icon: FileText },
];

export function OfferStudio({
  open,
  onOpenChange,
  mode,
  dealInfo,
  previousOffer,
  onSubmit,
}: OfferStudioProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isPeggyTyping, setIsPeggyTyping] = useState(false);
  const [peggyInsights, setPeggyInsights] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const steps = [
    { id: "structure", label: "Deal Structure", icon: PieChart },
    { id: "terms", label: "Terms & Price", icon: DollarSign },
    { id: "financing", label: "Financing", icon: Banknote },
    { id: "review", label: "Review & Submit", icon: Check },
  ];

  const getDefaultCloseDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split("T")[0];
  };

  const form = useForm<OfferStudioData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      structureType: previousOffer?.structureType || "cash",
      offerPrice: previousOffer?.offerPrice || Math.round(dealInfo.askingPrice * 0.9),
      earnestMoney: previousOffer?.earnestMoney || 5000,
      closeDate: previousOffer?.closeDate || getDefaultCloseDate(),
      inspectionPeriod: previousOffer?.inspectionPeriod ?? 10,
      financingDays: previousOffer?.financingDays ?? 21,
      equityPercentage: previousOffer?.equityPercentage ?? 20,
      preferredReturn: previousOffer?.preferredReturn ?? 8,
      debtAmount: previousOffer?.debtAmount ?? 0,
      interestRate: previousOffer?.interestRate ?? 10,
      loanTerm: previousOffer?.loanTerm ?? 12,
      fundingSource: previousOffer?.fundingSource || "cash_reserves",
      contingencies: previousOffer?.contingencies || ["inspection", "title"],
      notes: previousOffer?.notes || "",
    },
  });

  const watchedValues = form.watch();
  const structureType = watchedValues.structureType;

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      generatePeggyInsights();
      addPeggyWelcome();
    }
  }, [open]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const addPeggyWelcome = () => {
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      sender: "peggy",
      senderName: "Peggy AI",
      message: `Hi there! I'm here to help you craft the perfect offer for ${dealInfo.propertyAddress}. The asking price is ${formatCurrency(dealInfo.askingPrice)}${dealInfo.arv ? ` with an ARV of ${formatCurrency(dealInfo.arv)}` : ""}. What type of deal structure are you considering?`,
      timestamp: new Date(),
      isAI: true,
    };
    setChatMessages([welcomeMessage]);
  };

  const generatePeggyInsights = () => {
    const insights: string[] = [];
    
    if (dealInfo.arv && dealInfo.askingPrice) {
      const spread = ((dealInfo.arv - dealInfo.askingPrice) / dealInfo.arv) * 100;
      if (spread > 30) {
        insights.push(`Strong spread of ${spread.toFixed(0)}% - this deal has good profit potential`);
      } else if (spread > 20) {
        insights.push(`Moderate spread of ${spread.toFixed(0)}% - consider negotiating for better margins`);
      }
    }

    if (dealInfo.lockedTerms?.minEarnestMoney) {
      insights.push(`Seller requires minimum ${formatCurrency(dealInfo.lockedTerms.minEarnestMoney)} earnest money`);
    }

    if (dealInfo.lockedTerms?.maxCloseDays) {
      insights.push(`Maximum close period is ${dealInfo.lockedTerms.maxCloseDays} days`);
    }

    insights.push("Cash offers typically close 40% faster than financed offers");
    insights.push("Including a property inspection contingency is recommended");

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
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");

    setIsPeggyTyping(true);
    setTimeout(() => {
      const peggyResponse = generatePeggyResponse(chatInput);
      setChatMessages(prev => [...prev, peggyResponse]);
      setIsPeggyTyping(false);
    }, 1500);
  };

  const generatePeggyResponse = (userInput: string): ChatMessage => {
    const lowerInput = userInput.toLowerCase();
    let response = "";

    if (lowerInput.includes("price") || lowerInput.includes("offer")) {
      response = `Based on the ${formatCurrency(dealInfo.askingPrice)} asking price, I'd suggest starting around ${formatCurrency(Math.round(dealInfo.askingPrice * 0.85))} to ${formatCurrency(Math.round(dealInfo.askingPrice * 0.92))}. This gives you negotiation room while showing serious intent.`;
    } else if (lowerInput.includes("equity") || lowerInput.includes("partnership")) {
      response = "An equity partnership can be powerful! Typically, investors offer 15-25% equity with an 8-12% preferred return. This aligns interests and can make the deal more attractive to the seller.";
    } else if (lowerInput.includes("close") || lowerInput.includes("timeline")) {
      response = "For cash offers, 14-21 days is competitive. Financed deals typically need 30-45 days. Faster closes often command better pricing.";
    } else if (lowerInput.includes("earnest")) {
      response = `Earnest money shows commitment. For a deal this size, ${formatCurrency(Math.round(dealInfo.askingPrice * 0.02))} to ${formatCurrency(Math.round(dealInfo.askingPrice * 0.05))} (2-5%) is standard. Higher amounts can make your offer more competitive.`;
    } else {
      response = "That's a great question! I'd recommend focusing on terms that align with your investment strategy. Would you like me to analyze the financials or suggest optimal terms for this deal?";
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateDiscount = () => {
    const discount = ((dealInfo.askingPrice - watchedValues.offerPrice) / dealInfo.askingPrice) * 100;
    return discount.toFixed(1);
  };

  const calculatePotentialProfit = () => {
    if (!dealInfo.arv) return null;
    const repairCost = dealInfo.repairCost || 0;
    const profit = dealInfo.arv - watchedValues.offerPrice - repairCost;
    return profit;
  };

  const isTermLocked = (term: string): boolean => {
    if (!dealInfo.lockedTerms) return false;
    switch (term) {
      case "earnestMoney":
        return !!dealInfo.lockedTerms.minEarnestMoney;
      case "inspectionPeriod":
        return !!dealInfo.lockedTerms.maxInspectionDays;
      case "closeDate":
        return !!dealInfo.lockedTerms.maxCloseDays;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = (data: OfferStudioData) => {
    onSubmit(data);
    toast({
      title: mode === "counter" ? "Counter Offer Sent!" : "Offer Submitted!",
      description: "The seller will be notified and can respond to your offer.",
    });
    onOpenChange(false);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "suggest_price":
        const suggestedPrice = Math.round(dealInfo.askingPrice * 0.88);
        form.setValue("offerPrice", suggestedPrice);
        toast({ title: "Price Updated", description: `Suggested offer price: ${formatCurrency(suggestedPrice)}` });
        break;
      case "optimize_terms":
        form.setValue("earnestMoney", Math.round(dealInfo.askingPrice * 0.03));
        form.setValue("inspectionPeriod", 7);
        form.setValue("financingDays", 14);
        toast({ title: "Terms Optimized", description: "Applied competitive terms for faster closing" });
        break;
      case "add_contingencies":
        form.setValue("contingencies", ["inspection", "title", "appraisal"]);
        toast({ title: "Contingencies Added", description: "Standard protection contingencies applied" });
        break;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderStructureStep();
      case 1:
        return renderTermsStep();
      case 2:
        return renderFinancingStep();
      case 3:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderStructureStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Your Deal Structure</h3>
        <p className="text-sm text-muted-foreground">Select how you want to structure this investment opportunity</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {STRUCTURE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = structureType === option.id;
          const isAccepted = !dealInfo.lockedTerms?.acceptedStructures || 
            dealInfo.lockedTerms.acceptedStructures.includes(option.id);

          return (
            <motion.button
              key={option.id}
              type="button"
              disabled={!isAccepted}
              onClick={() => form.setValue("structureType", option.id as any)}
              className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                isSelected 
                  ? `${option.borderColor} ${option.bgColor}` 
                  : "border-border hover-elevate"
              } ${!isAccepted ? "opacity-50 cursor-not-allowed" : ""}`}
              whileHover={isAccepted ? { scale: 1.02 } : {}}
              whileTap={isAccepted ? { scale: 0.98 } : {}}
              data-testid={`button-structure-${option.id}`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className={`w-5 h-5 ${option.color}`} />
                </div>
              )}
              {!isAccepted && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <Icon className={`w-8 h-8 ${option.color} mb-3`} />
              <p className="font-semibold">{option.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
            </motion.button>
          );
        })}
      </div>

      {structureType === "equity" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30"
        >
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-purple-700">Equity Partnership Details</p>
              <p className="text-sm text-muted-foreground mt-1">
                You'll share profits with the seller. Configure equity split and preferred returns in the next step.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {structureType === "hybrid" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30"
        >
          <div className="flex items-start gap-3">
            <PieChart className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-700">Hybrid Structure Details</p>
              <p className="text-sm text-muted-foreground mt-1">
                Combine debt and equity for flexible deal structuring. Configure both components in the financing step.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderTermsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Set Your Terms</h3>
        <p className="text-sm text-muted-foreground">Configure pricing and timeline for your offer</p>
      </div>

      <FormField
        control={form.control}
        name="offerPrice"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Offer Price
              </FormLabel>
              <Badge variant="outline" className={Number(calculateDiscount()) > 0 ? "text-green-600" : "text-amber-600"}>
                {Number(calculateDiscount()) > 0 ? `-${calculateDiscount()}%` : `+${Math.abs(Number(calculateDiscount()))}%`} from asking
              </Badge>
            </div>
            <FormControl>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  className="pl-9 text-lg font-semibold"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  data-testid="input-offer-price"
                />
              </div>
            </FormControl>
            <FormDescription>
              Asking: {formatCurrency(dealInfo.askingPrice)}
              {dealInfo.arv && ` | ARV: ${formatCurrency(dealInfo.arv)}`}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="earnestMoney"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Earnest Money</FormLabel>
                {isTermLocked("earnestMoney") ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <Lock className="w-3 h-3 text-amber-500" />
                    </TooltipTrigger>
                    <TooltipContent>Min: {formatCurrency(dealInfo.lockedTerms?.minEarnestMoney || 0)}</TooltipContent>
                  </Tooltip>
                ) : (
                  <Unlock className="w-3 h-3 text-green-500" />
                )}
              </div>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    className="pl-9"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    data-testid="input-earnest-money"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="closeDate"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Close Date</FormLabel>
                {isTermLocked("closeDate") ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <Lock className="w-3 h-3 text-amber-500" />
                    </TooltipTrigger>
                    <TooltipContent>Max: {dealInfo.lockedTerms?.maxCloseDays} days</TooltipContent>
                  </Tooltip>
                ) : (
                  <Unlock className="w-3 h-3 text-green-500" />
                )}
              </div>
              <FormControl>
                <Input type="date" {...field} data-testid="input-close-date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="inspectionPeriod"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FormLabel>Inspection Period</FormLabel>
                {isTermLocked("inspectionPeriod") ? (
                  <Lock className="w-3 h-3 text-amber-500" />
                ) : (
                  <Unlock className="w-3 h-3 text-green-500" />
                )}
              </div>
              <span className="text-sm font-medium">{field.value} days</span>
            </div>
            <FormControl>
              <Slider
                value={[field.value]}
                onValueChange={([value]) => field.onChange(value)}
                max={dealInfo.lockedTerms?.maxInspectionDays || 30}
                min={0}
                step={1}
                data-testid="slider-inspection-period"
              />
            </FormControl>
            <FormDescription>Time to complete due diligence</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {(structureType === "equity" || structureType === "hybrid") && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-4 p-4 rounded-lg bg-purple-500/5 border border-purple-500/20"
        >
          <h4 className="font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            Equity Terms
          </h4>
          
          <FormField
            control={form.control}
            name="equityPercentage"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Your Equity Share</FormLabel>
                  <span className="text-sm font-medium">{field.value}%</span>
                </div>
                <FormControl>
                  <Slider
                    value={[field.value || 20]}
                    onValueChange={([value]) => field.onChange(value)}
                    max={100}
                    min={5}
                    step={5}
                  />
                </FormControl>
                <FormDescription>
                  Seller retains {100 - (field.value || 20)}% equity stake
                </FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferredReturn"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Preferred Return</FormLabel>
                  <span className="text-sm font-medium">{field.value}%</span>
                </div>
                <FormControl>
                  <Slider
                    value={[field.value || 8]}
                    onValueChange={([value]) => field.onChange(value)}
                    max={20}
                    min={0}
                    step={1}
                  />
                </FormControl>
                <FormDescription>
                  Annual return before profit split
                </FormDescription>
              </FormItem>
            )}
          />
        </motion.div>
      )}
    </div>
  );

  const renderFinancingStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Financing Details</h3>
        <p className="text-sm text-muted-foreground">How will you fund this investment?</p>
      </div>

      <FormField
        control={form.control}
        name="fundingSource"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Funding Source</FormLabel>
            <FormControl>
              <div className="grid grid-cols-2 gap-3">
                {FUNDING_SOURCES.map((source) => {
                  const Icon = source.icon;
                  const isSelected = field.value === source.id;
                  return (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => field.onChange(source.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover-elevate"
                      }`}
                      data-testid={`button-funding-${source.id}`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${isSelected ? "text-primary" : ""}`}>
                        {source.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </FormControl>
          </FormItem>
        )}
      />

      {(structureType === "debt" || structureType === "hybrid") && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20"
        >
          <h4 className="font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Debt Terms
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="interestRate"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Interest Rate</FormLabel>
                    <span className="text-sm font-medium">{field.value}%</span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[field.value || 10]}
                      onValueChange={([value]) => field.onChange(value)}
                      max={25}
                      min={4}
                      step={0.5}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loanTerm"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Loan Term</FormLabel>
                    <span className="text-sm font-medium">{field.value} months</span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[field.value || 12]}
                      onValueChange={([value]) => field.onChange(value)}
                      max={60}
                      min={3}
                      step={3}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </motion.div>
      )}

      <FormField
        control={form.control}
        name="financingDays"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Financing Contingency Period</FormLabel>
              <span className="text-sm font-medium">{field.value} days</span>
            </div>
            <FormControl>
              <Slider
                value={[field.value]}
                onValueChange={([value]) => field.onChange(value)}
                max={45}
                min={0}
                step={1}
              />
            </FormControl>
            <FormDescription>
              Time needed to secure financing (0 for cash deals)
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="contingencies"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contingencies</FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {CONTINGENCY_OPTIONS.map((option) => {
                  const isSelected = field.value?.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        const newValue = isSelected
                          ? field.value?.filter(v => v !== option.id)
                          : [...(field.value || []), option.id];
                        field.onChange(newValue);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover-elevate"
                      }`}
                      data-testid={`button-contingency-${option.id}`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {option.label}
                      {option.recommended && !isSelected && (
                        <Sparkles className="w-3 h-3 text-amber-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </FormControl>
            <FormDescription>
              Conditions that must be met for the deal to close
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );

  const renderReviewStep = () => {
    const profit = calculatePotentialProfit();
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Review Your Offer</h3>
          <p className="text-sm text-muted-foreground">Confirm all details before submitting</p>
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Property</span>
              <span className="font-medium">{dealInfo.propertyAddress}</span>
            </div>
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Deal Structure</span>
              <Badge className={STRUCTURE_OPTIONS.find(s => s.id === structureType)?.bgColor}>
                {STRUCTURE_OPTIONS.find(s => s.id === structureType)?.label}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Offer Price</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(watchedValues.offerPrice)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Earnest Money</span>
              <span className="font-medium">{formatCurrency(watchedValues.earnestMoney)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Close Date</span>
              <span className="font-medium">{new Date(watchedValues.closeDate).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Inspection Period</span>
              <span className="font-medium">{watchedValues.inspectionPeriod} days</span>
            </div>

            {(structureType === "equity" || structureType === "hybrid") && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Your Equity</span>
                  <span className="font-medium">{watchedValues.equityPercentage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Preferred Return</span>
                  <span className="font-medium">{watchedValues.preferredReturn}%</span>
                </div>
              </>
            )}

            {(structureType === "debt" || structureType === "hybrid") && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Interest Rate</span>
                  <span className="font-medium">{watchedValues.interestRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Loan Term</span>
                  <span className="font-medium">{watchedValues.loanTerm} months</span>
                </div>
              </>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Funding Source</span>
              <span className="font-medium">
                {FUNDING_SOURCES.find(s => s.id === watchedValues.fundingSource)?.label}
              </span>
            </div>

            {watchedValues.contingencies && watchedValues.contingencies.length > 0 && (
              <div>
                <span className="text-muted-foreground block mb-2">Contingencies</span>
                <div className="flex flex-wrap gap-1">
                  {watchedValues.contingencies.map(c => (
                    <Badge key={c} variant="outline" className="text-xs">
                      {CONTINGENCY_OPTIONS.find(o => o.id === c)?.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {profit !== null && (
          <Card className={profit > 0 ? "border-green-500/30 bg-green-500/5" : "border-amber-500/30 bg-amber-500/5"}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-5 h-5 ${profit > 0 ? "text-green-600" : "text-amber-600"}`} />
                  <span className="font-medium">Potential Profit</span>
                </div>
                <span className={`text-xl font-bold ${profit > 0 ? "text-green-600" : "text-amber-600"}`}>
                  {formatCurrency(profit)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on ARV minus offer price and estimated repairs
              </p>
            </CardContent>
          </Card>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any special terms, conditions, or messages for the seller..."
                  className="min-h-[100px]"
                  {...field}
                  data-testid="input-notes"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden" data-testid="dialog-offer-studio">
        <div className="flex h-[85vh]">
          <div className="flex-1 flex flex-col">
            <DialogHeader className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    {mode === "counter" ? "Counter Offer" : "Offer Studio"}
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-2 mt-1">
                    <Building2 className="w-4 h-4" />
                    {dealInfo.propertyAddress}
                  </DialogDescription>
                </div>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {formatCurrency(dealInfo.askingPrice)}
                </Badge>
              </div>
            </DialogHeader>

            <div className="px-6 py-3 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(index)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : isCompleted 
                              ? "bg-green-500/10 text-green-600" 
                              : "text-muted-foreground hover-elevate"
                        }`}
                        data-testid={`button-step-${step.id}`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                      </button>
                      {index < steps.length - 1 && (
                        <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 px-6 py-4">
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
                </ScrollArea>

                <div className="px-6 py-4 border-t bg-background flex items-center justify-between gap-4">
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

                  {currentStep < steps.length - 1 ? (
                    <Button type="button" onClick={handleNext} data-testid="button-next">
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button type="submit" className="gap-2" data-testid="button-submit-offer">
                      <Send className="w-4 h-4" />
                      {mode === "counter" ? "Send Counter Offer" : "Submit Offer"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>

          <div className="w-80 border-l flex flex-col bg-muted/20">
            <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-purple-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Peggy AI</h3>
                  <p className="text-xs text-muted-foreground">Your deal co-pilot</p>
                </div>
                <Badge variant="secondary" className="ml-auto text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>

            {peggyInsights.length > 0 && (
              <div className="p-3 border-b space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Lightbulb className="w-3 h-3" />
                  AI Insights
                </div>
                {peggyInsights.slice(0, 3).map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs p-2 rounded bg-amber-500/10">
                    <AlertTriangle className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 border-b">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                <Zap className="w-3 h-3" />
                Quick Actions
              </div>
              <div className="space-y-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => handleQuickAction("suggest_price")}
                  data-testid="button-suggest-price"
                >
                  <DollarSign className="w-3 h-3 mr-2" />
                  Suggest optimal price
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => handleQuickAction("optimize_terms")}
                  data-testid="button-optimize-terms"
                >
                  <RefreshCw className="w-3 h-3 mr-2" />
                  Optimize for fast close
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => handleQuickAction("add_contingencies")}
                  data-testid="button-add-contingencies"
                >
                  <CheckCircle2 className="w-3 h-3 mr-2" />
                  Add standard protections
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
                    <Avatar className="w-7 h-7 flex-shrink-0">
                      {msg.isAI ? (
                        <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white text-xs">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback className="text-xs">
                          {msg.senderName.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div
                      className={`max-w-[200px] p-2 rounded-lg text-xs ${
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : msg.isAI
                            ? "bg-gradient-to-br from-primary/10 to-purple-500/10 border"
                            : "bg-muted"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
                {isPeggyTyping && (
                  <div className="flex gap-2">
                    <Avatar className="w-7 h-7 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white text-xs">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 border">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask Peggy anything..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  className="text-xs"
                  data-testid="input-peggy-chat"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handleSendChat}
                  disabled={!chatInput.trim()}
                  data-testid="button-send-chat"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
