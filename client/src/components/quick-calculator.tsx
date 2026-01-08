import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Percent,
  Home,
  Wrench,
  PiggyBank,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DealNumbers {
  askingPrice?: number;
  contractPrice?: number;
  arv?: number;
  repairEstimate?: number;
  estimatedRepairs?: number;
  assignmentFee?: number;
}

interface QuickCalcButtonProps {
  deal: DealNumbers;
  className?: string;
}

export function QuickCalcButton({ deal, className }: QuickCalcButtonProps) {
  const [open, setOpen] = useState(false);

  const calculations = useMemo(() => {
    const purchase = deal.contractPrice || deal.askingPrice || 0;
    const arv = deal.arv || 0;
    const repairs = deal.repairEstimate || deal.estimatedRepairs || 0;
    const assignmentFee = deal.assignmentFee || 0;

    const totalInvestment = purchase + repairs;
    const profit = arv - totalInvestment;
    const roi = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
    const margin = arv > 0 ? (profit / arv) * 100 : 0;
    const rule70 = (arv * 0.7) - repairs;
    const maxOffer = rule70;
    const dealScore = purchase <= maxOffer ? "good" : purchase <= maxOffer * 1.1 ? "fair" : "risky";

    return {
      purchase,
      arv,
      repairs,
      assignmentFee,
      totalInvestment,
      profit,
      roi,
      margin,
      rule70,
      maxOffer,
      dealScore
    };
  }, [deal]);

  const getDealScoreColor = (score: string) => {
    switch (score) {
      case "good": return "text-green-600";
      case "fair": return "text-yellow-600";
      case "risky": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  const getDealScoreIcon = (score: string) => {
    switch (score) {
      case "good": return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "fair": return <Info className="w-4 h-4 text-yellow-600" />;
      case "risky": return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("h-8 w-8", className)}
          data-testid="button-quick-calc"
        >
          <Calculator className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end" data-testid="popover-quick-calc">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              Quick Analysis
            </h4>
            <div className="flex items-center gap-1">
              {getDealScoreIcon(calculations.dealScore)}
              <span className={cn("text-xs font-medium capitalize", getDealScoreColor(calculations.dealScore))}>
                {calculations.dealScore}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-1 border-b">
              <span className="text-muted-foreground">Purchase Price</span>
              <span className="font-medium">${calculations.purchase.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b">
              <span className="text-muted-foreground">Repairs</span>
              <span className="font-medium">${calculations.repairs.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b">
              <span className="text-muted-foreground">Total Investment</span>
              <span className="font-medium">${calculations.totalInvestment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b">
              <span className="text-muted-foreground">ARV</span>
              <span className="font-medium">${calculations.arv.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-accent/50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center gap-1">
                <PiggyBank className="w-3 h-3" />
                Potential Profit
              </span>
              <span className={cn(
                "font-bold",
                calculations.profit >= 0 ? "text-green-600" : "text-red-600"
              )}>
                ${calculations.profit.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center gap-1">
                <Percent className="w-3 h-3" />
                ROI
              </span>
              <span className={cn(
                "font-bold",
                calculations.roi >= 20 ? "text-green-600" : calculations.roi >= 10 ? "text-yellow-600" : "text-red-600"
              )}>
                {calculations.roi.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Profit Margin
              </span>
              <span className="font-medium">{calculations.margin.toFixed(1)}%</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
            <div className="flex items-center justify-between">
              <span>70% Rule Max Offer:</span>
              <span className="font-medium">${calculations.maxOffer.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface AdvancedCalculatorDialogProps {
  open: boolean;
  onClose: () => void;
  initialValues?: DealNumbers;
}

export function AdvancedCalculatorDialog({ 
  open, 
  onClose, 
  initialValues 
}: AdvancedCalculatorDialogProps) {
  const [purchasePrice, setPurchasePrice] = useState(initialValues?.contractPrice || initialValues?.askingPrice || 0);
  const [arv, setArv] = useState(initialValues?.arv || 0);
  const [repairs, setRepairs] = useState(initialValues?.repairEstimate || initialValues?.estimatedRepairs || 0);
  const [holdingCosts, setHoldingCosts] = useState(0);
  const [closingCosts, setClosingCosts] = useState(0);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(7);
  const [holdingMonths, setHoldingMonths] = useState(6);

  const calculations = useMemo(() => {
    const totalInvestment = purchasePrice + repairs + holdingCosts + closingCosts;
    const profit = arv - totalInvestment;
    const roi = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
    const cashOnCash = (downPaymentPercent / 100 * purchasePrice) > 0 
      ? (profit / (downPaymentPercent / 100 * purchasePrice)) * 100 
      : 0;
    const annualizedRoi = holdingMonths > 0 ? (roi / holdingMonths) * 12 : 0;
    const rule70MaxOffer = (arv * 0.7) - repairs;
    const rule75MaxOffer = (arv * 0.75) - repairs;

    return {
      totalInvestment,
      profit,
      roi,
      cashOnCash,
      annualizedRoi,
      rule70MaxOffer,
      rule75MaxOffer,
      downPayment: (downPaymentPercent / 100) * purchasePrice,
      monthlyPayment: ((purchasePrice * (1 - downPaymentPercent / 100)) * (interestRate / 100 / 12)),
    };
  }, [purchasePrice, arv, repairs, holdingCosts, closingCosts, downPaymentPercent, interestRate, holdingMonths]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-advanced-calc">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Investment Calculator
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="flip" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="flip" data-testid="tab-flip-calc">
              <Home className="w-4 h-4 mr-2" />
              Flip Analysis
            </TabsTrigger>
            <TabsTrigger value="rental" data-testid="tab-rental-calc">
              <DollarSign className="w-4 h-4 mr-2" />
              Rental Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flip" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchase">Purchase Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="purchase"
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="pl-9"
                    data-testid="input-purchase-price"
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
                    value={arv}
                    onChange={(e) => setArv(Number(e.target.value))}
                    className="pl-9"
                    data-testid="input-arv"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="repairs">Repair Estimate</Label>
                <div className="relative">
                  <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="repairs"
                    type="number"
                    value={repairs}
                    onChange={(e) => setRepairs(Number(e.target.value))}
                    className="pl-9"
                    data-testid="input-repairs"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="holding">Holding Costs</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="holding"
                    type="number"
                    value={holdingCosts}
                    onChange={(e) => setHoldingCosts(Number(e.target.value))}
                    className="pl-9"
                    data-testid="input-holding"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="closing">Closing Costs</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="closing"
                    type="number"
                    value={closingCosts}
                    onChange={(e) => setClosingCosts(Number(e.target.value))}
                    className="pl-9"
                    data-testid="input-closing"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="months">Holding Period (months)</Label>
                <Input 
                  id="months"
                  type="number"
                  value={holdingMonths}
                  onChange={(e) => setHoldingMonths(Number(e.target.value))}
                  data-testid="input-months"
                />
              </div>
            </div>

            <div className="bg-accent/50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm">Analysis Results</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Investment</span>
                  <span className="font-medium">${calculations.totalInvestment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Potential Profit</span>
                  <span className={cn(
                    "font-bold",
                    calculations.profit >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    ${calculations.profit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ROI</span>
                  <span className="font-medium">{calculations.roi.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annualized ROI</span>
                  <span className="font-medium">{calculations.annualizedRoi.toFixed(1)}%</span>
                </div>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">70% Rule Max Offer</span>
                  <span className="font-medium">${calculations.rule70MaxOffer.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">75% Rule Max Offer</span>
                  <span className="font-medium">${calculations.rule75MaxOffer.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rental" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rental-purchase">Purchase Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="rental-purchase"
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="pl-9"
                    data-testid="input-rental-purchase"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Down Payment: {downPaymentPercent}%</Label>
                <Slider
                  value={[downPaymentPercent]}
                  onValueChange={([v]) => setDownPaymentPercent(v)}
                  min={0}
                  max={100}
                  step={5}
                  data-testid="slider-down-payment"
                />
              </div>
              <div className="space-y-2">
                <Label>Interest Rate: {interestRate}%</Label>
                <Slider
                  value={[interestRate]}
                  onValueChange={([v]) => setInterestRate(v)}
                  min={3}
                  max={15}
                  step={0.25}
                  data-testid="slider-interest-rate"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rental-repairs">Repair Estimate</Label>
                <div className="relative">
                  <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="rental-repairs"
                    type="number"
                    value={repairs}
                    onChange={(e) => setRepairs(Number(e.target.value))}
                    className="pl-9"
                    data-testid="input-rental-repairs"
                  />
                </div>
              </div>
            </div>

            <div className="bg-accent/50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm">Financing Summary</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Down Payment</span>
                  <span className="font-medium">${calculations.downPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Monthly Payment</span>
                  <span className="font-medium">${calculations.monthlyPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cash on Cash ROI</span>
                  <span className="font-medium">{calculations.cashOnCash.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Cash Needed</span>
                  <span className="font-medium">${(calculations.downPayment + repairs).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function InlineROIBadge({ deal }: { deal: DealNumbers }) {
  const purchase = deal.contractPrice || deal.askingPrice || 0;
  const arv = deal.arv || 0;
  const repairs = deal.repairEstimate || deal.estimatedRepairs || 0;
  const totalInvestment = purchase + repairs;
  const profit = arv - totalInvestment;
  const roi = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;

  const getVariant = () => {
    if (roi >= 25) return "default";
    if (roi >= 15) return "secondary";
    return "outline";
  };

  return (
    <Badge 
      variant={getVariant()} 
      className={cn(
        "text-xs",
        roi >= 25 && "bg-green-600 hover:bg-green-700",
        roi >= 15 && roi < 25 && "bg-yellow-600 hover:bg-yellow-700"
      )}
      data-testid="badge-roi"
    >
      {roi.toFixed(0)}% ROI
    </Badge>
  );
}
