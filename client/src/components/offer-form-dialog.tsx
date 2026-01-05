import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  Calendar,
  Clock,
  Send,
  Building2,
  Sparkles,
  ArrowRightLeft,
  RefreshCw,
} from "lucide-react";

const offerFormSchema = z.object({
  offerPrice: z.number().min(1000, "Offer price must be at least $1,000"),
  earnestMoney: z.number().min(100, "Earnest money must be at least $100"),
  closeDate: z.string().min(1, "Close date is required"),
  inspectionPeriod: z.number().min(0, "Inspection period must be 0 or more days"),
  fundingType: z.enum(["cash", "hard_money", "conventional", "private", "other"]),
  notes: z.string().optional(),
  contingencies: z.string().optional(),
});

export type OfferFormData = z.infer<typeof offerFormSchema>;

export interface OfferFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "new" | "counter";
  dealInfo: {
    id: string | number;
    propertyAddress: string;
    askingPrice: number;
    arv?: number;
  };
  previousOffer?: {
    offerPrice: number;
    earnestMoney: number;
    closeDate: string;
    inspectionPeriod: number;
    fundingType: string;
    notes?: string;
  };
  onSubmit: (data: OfferFormData) => void;
}

export function OfferFormDialog({
  open,
  onOpenChange,
  mode,
  dealInfo,
  previousOffer,
  onSubmit,
}: OfferFormDialogProps) {
  const { toast } = useToast();

  const getDefaultCloseDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split("T")[0];
  };

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      offerPrice: previousOffer?.offerPrice || Math.round(dealInfo.askingPrice * 0.9),
      earnestMoney: previousOffer?.earnestMoney || 5000,
      closeDate: previousOffer?.closeDate || getDefaultCloseDate(),
      inspectionPeriod: previousOffer?.inspectionPeriod ?? 10,
      fundingType: (previousOffer?.fundingType as OfferFormData["fundingType"]) || "cash",
      notes: previousOffer?.notes || "",
      contingencies: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        offerPrice: previousOffer?.offerPrice || Math.round(dealInfo.askingPrice * 0.9),
        earnestMoney: previousOffer?.earnestMoney || 5000,
        closeDate: previousOffer?.closeDate || getDefaultCloseDate(),
        inspectionPeriod: previousOffer?.inspectionPeriod ?? 10,
        fundingType: (previousOffer?.fundingType as OfferFormData["fundingType"]) || "cash",
        notes: previousOffer?.notes || "",
        contingencies: "",
      });
    }
  }, [open, previousOffer, dealInfo.askingPrice]);

  const handleSubmit = (data: OfferFormData) => {
    onSubmit(data);
    toast({
      title: mode === "counter" ? "Counter Offer Submitted" : "Offer Submitted",
      description: `Your ${mode === "counter" ? "counter " : ""}offer of ${formatCurrency(data.offerPrice)} has been sent.`,
    });
    onOpenChange(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const watchedOfferPrice = form.watch("offerPrice");
  const discountFromAsking = dealInfo.askingPrice > 0 
    ? ((dealInfo.askingPrice - watchedOfferPrice) / dealInfo.askingPrice * 100).toFixed(1)
    : "0";
  const potentialEquity = dealInfo.arv 
    ? dealInfo.arv - watchedOfferPrice 
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "counter" ? (
              <>
                <ArrowRightLeft className="w-5 h-5" />
                Counter Offer
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Offer
              </>
            )}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            {dealInfo.propertyAddress}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 py-2">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Asking Price</p>
            <p className="font-semibold">{formatCurrency(dealInfo.askingPrice)}</p>
          </div>
          {dealInfo.arv && (
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">ARV</p>
              <p className="font-semibold">{formatCurrency(dealInfo.arv)}</p>
            </div>
          )}
          <div className="p-3 rounded-lg bg-primary/10 text-center">
            <p className="text-xs text-muted-foreground mb-1">Your Offer</p>
            <p className="font-bold text-primary">{formatCurrency(watchedOfferPrice)}</p>
          </div>
        </div>

        {Number(discountFromAsking) > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3" />
              {discountFromAsking}% below asking
            </Badge>
            {potentialEquity && potentialEquity > 0 && (
              <Badge variant="outline" className="gap-1 text-green-600 border-green-500/30">
                {formatCurrency(potentialEquity)} potential equity
              </Badge>
            )}
          </div>
        )}

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="offerPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Offer Price
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="Enter offer amount"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        data-testid="input-offer-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="earnestMoney"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Earnest Money Deposit
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="5000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        data-testid="input-earnest-money"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="closeDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Target Close Date
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                        data-testid="input-close-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inspectionPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Inspection Period (days)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        data-testid="input-inspection-period"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fundingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Funding Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-funding-type">
                        <SelectValue placeholder="Select funding type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="hard_money">Hard Money</SelectItem>
                      <SelectItem value="conventional">Conventional Loan</SelectItem>
                      <SelectItem value="private">Private Lending</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contingencies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contingencies (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Subject to inspection, financing approval..."
                      className="resize-none"
                      rows={2}
                      {...field}
                      data-testid="input-contingencies"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message to Seller (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional notes or explain your offer..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="input-offer-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-offer"
              >
                Cancel
              </Button>
              <Button type="submit" data-testid="button-submit-offer">
                {mode === "counter" ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Send Counter Offer
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Offer
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
