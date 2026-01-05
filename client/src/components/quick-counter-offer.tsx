import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRightLeft,
  DollarSign,
  Calendar,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Send,
  X,
} from "lucide-react";

export interface QuickCounterData {
  offerPrice: number;
  earnestMoney: number;
  closeDate: string;
  inspectionPeriod: number;
  notes?: string;
}

interface QuickCounterOfferProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previousOffer: QuickCounterData;
  dealInfo: {
    propertyAddress: string;
    askingPrice: number;
  };
  onSubmit: (data: QuickCounterData) => void;
}

export function QuickCounterOffer({
  open,
  onOpenChange,
  previousOffer,
  dealInfo,
  onSubmit,
}: QuickCounterOfferProps) {
  const [offerPrice, setOfferPrice] = useState(previousOffer.offerPrice);
  const [earnestMoney, setEarnestMoney] = useState(previousOffer.earnestMoney);
  const [closeDate, setCloseDate] = useState(previousOffer.closeDate);
  const [inspectionPeriod, setInspectionPeriod] = useState(previousOffer.inspectionPeriod);
  const [notes, setNotes] = useState("");
  const [peggyTip, setPeggyTip] = useState<string | null>(null);

  const priceDiff = offerPrice - previousOffer.offerPrice;
  const priceDiffPercent = ((priceDiff / previousOffer.offerPrice) * 100).toFixed(1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const quickAdjust = (field: "price" | "earnest" | "days", delta: number) => {
    if (field === "price") {
      const newPrice = offerPrice + delta;
      setOfferPrice(newPrice);
      if (delta > 0) {
        setPeggyTip("Increasing your offer shows flexibility. Consider asking for better terms in exchange.");
      } else {
        setPeggyTip("A lower counter keeps negotiation room. Be ready to justify your valuation.");
      }
    } else if (field === "earnest") {
      setEarnestMoney(Math.max(0, earnestMoney + delta));
      if (delta > 0) {
        setPeggyTip("Higher earnest money signals serious commitment.");
      }
    } else if (field === "days") {
      setInspectionPeriod(Math.max(0, inspectionPeriod + delta));
    }
    setTimeout(() => setPeggyTip(null), 4000);
  };

  const handleSubmit = () => {
    onSubmit({
      offerPrice,
      earnestMoney,
      closeDate,
      inspectionPeriod,
      notes: notes || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-3 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base">Quick Counter</DialogTitle>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {dealInfo.propertyAddress}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Fast Mode
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Their Offer</span>
              <span className="font-medium">{formatCurrency(previousOffer.offerPrice)}</span>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" />
                Your Counter Price
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickAdjust("price", -5000)}
                  data-testid="button-price-decrease"
                >
                  -$5K
                </Button>
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(Number(e.target.value))}
                    className="pl-8 text-center font-semibold"
                    data-testid="input-counter-price"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => quickAdjust("price", 5000)}
                  data-testid="button-price-increase"
                >
                  +$5K
                </Button>
              </div>
              <div className="flex justify-center">
                {priceDiff !== 0 && (
                  <Badge 
                    variant={priceDiff > 0 ? "default" : "secondary"} 
                    className={`text-xs ${priceDiff > 0 ? "bg-green-500/10 text-green-600 border-green-500/30" : "bg-red-500/10 text-red-600 border-red-500/30"}`}
                  >
                    {priceDiff > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {priceDiff > 0 ? "+" : ""}{formatCurrency(priceDiff)} ({priceDiffPercent}%)
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Earnest
              </Label>
              <div className="flex flex-col gap-1">
                <Input
                  type="number"
                  value={earnestMoney}
                  onChange={(e) => setEarnestMoney(Number(e.target.value))}
                  className="text-sm h-8"
                  data-testid="input-earnest-money"
                />
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs flex-1"
                    onClick={() => quickAdjust("earnest", -1000)}
                  >
                    -1K
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs flex-1"
                    onClick={() => quickAdjust("earnest", 1000)}
                  >
                    +1K
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Close Date
              </Label>
              <Input
                type="date"
                value={closeDate}
                onChange={(e) => setCloseDate(e.target.value)}
                className="text-sm h-8"
                data-testid="input-close-date"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Inspection
              </Label>
              <div className="flex flex-col gap-1">
                <div className="relative">
                  <Input
                    type="number"
                    value={inspectionPeriod}
                    onChange={(e) => setInspectionPeriod(Number(e.target.value))}
                    className="text-sm h-8 pr-10"
                    data-testid="input-inspection-days"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    days
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs flex-1"
                    onClick={() => quickAdjust("days", -3)}
                  >
                    -3d
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs flex-1"
                    onClick={() => quickAdjust("days", 3)}
                  >
                    +3d
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Quick Note (optional)</Label>
            <Textarea
              placeholder="Add a brief message..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[60px] text-sm resize-none"
              data-testid="input-counter-notes"
            />
          </div>

          <AnimatePresence>
            {peggyTip && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20"
              >
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">{peggyTip}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 ml-auto"
                  onClick={() => setPeggyTip(null)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 pt-0 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-counter"
          >
            Cancel
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleSubmit}
            data-testid="button-submit-counter"
          >
            <Send className="w-4 h-4" />
            Send Counter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
