import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
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
  Percent,
  Calendar,
  TrendingUp,
  Users,
  FileText,
  Check,
  ArrowRight,
  Loader2,
  Building2,
  PiggyBank,
  Handshake,
  AlertTriangle,
} from "lucide-react";
import type { CapitalProject } from "@shared/schema";

const capitalOfferSchema = z.object({
  investmentAmount: z.number().min(1000, "Investment amount must be at least $1,000"),
  counterInterestRate: z.string().optional(),
  counterLoanDuration: z.string().optional(),
  counterProfitSplit: z.string().optional(),
  counterHoldPeriod: z.string().optional(),
  notes: z.string().optional(),
});

export type CapitalOfferData = z.infer<typeof capitalOfferSchema>;

interface CapitalRaiseOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: CapitalProject;
  mode: "accept" | "counter";
  onSubmit: (data: CapitalOfferData) => void;
}

export function CapitalRaiseOfferDialog({
  open,
  onOpenChange,
  project,
  mode,
  onSubmit,
}: CapitalRaiseOfferDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profitSplit, setProfitSplit] = useState([
    parseInt(project.askingProfitSplit?.split("/")[0] || "70")
  ]);

  const form = useForm<CapitalOfferData>({
    resolver: zodResolver(capitalOfferSchema),
    defaultValues: {
      investmentAmount: project.minInvestment || 25000,
      counterInterestRate: project.askingInterestRate || "",
      counterLoanDuration: project.askingLoanDuration || "",
      counterProfitSplit: project.askingProfitSplit || "70/30",
      counterHoldPeriod: project.holdPeriod || "",
      notes: "",
    },
  });

  const watchedAmount = form.watch("investmentAmount");
  const fundingGoal = project.fundingGoal || 0;
  const amountRaised = project.amountRaised || 0;
  const remainingToFund = fundingGoal - amountRaised;
  const myContributionPercent = fundingGoal > 0 ? (watchedAmount / fundingGoal) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (data: CapitalOfferData) => {
    setIsSubmitting(true);
    try {
      data.counterProfitSplit = `${profitSplit[0]}/${100 - profitSplit[0]}`;
      await onSubmit(data);
      toast({
        title: mode === "accept" ? "Investment submitted!" : "Counter-offer sent!",
        description: mode === "accept" 
          ? "Your investment commitment has been submitted to the operator." 
          : "Your counter-terms have been sent to the operator for review.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDebt = project.structure === "DEBT";
  const isEquity = project.structure === "EQUITY";
  const isHybrid = project.structure === "HYBRID";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "accept" ? (
              <>
                <Handshake className="w-5 h-5 text-green-600" />
                Accept Operator Terms
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Counter Operator Terms
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === "accept"
              ? "Commit to investing at the operator's asking terms"
              : "Propose your own investment terms for this capital raise"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">{project.location}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{project.structure}</Badge>
                    <Badge variant="secondary">{project.strategy?.replace(/-/g, " ")}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Funding Progress</span>
                  <span className="font-medium">
                    {formatCurrency(amountRaised)} / {formatCurrency(fundingGoal)}
                  </span>
                </div>
                <Progress value={(amountRaised / fundingGoal) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(remainingToFund)} remaining to fund
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-primary" />
                Operator's Asking Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              {isDebt ? (
                <>
                  <div>
                    <Label className="text-muted-foreground">Interest Rate</Label>
                    <p className="font-semibold">{project.askingInterestRate || "TBD"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Loan Duration</Label>
                    <p className="font-semibold">{project.askingLoanDuration || "TBD"}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-muted-foreground">Projected Return</Label>
                    <p className="font-semibold">{project.projectedReturn || "TBD"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Profit Split</Label>
                    <p className="font-semibold">{project.askingProfitSplit || "TBD"}</p>
                  </div>
                </>
              )}
              <div>
                <Label className="text-muted-foreground">Minimum Investment</Label>
                <p className="font-semibold">{project.minInvestment ? formatCurrency(project.minInvestment) : "TBD"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Hold Period</Label>
                <p className="font-semibold">{project.holdPeriod || "TBD"}</p>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="investmentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      Your Investment Amount
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          className="pl-9"
                          placeholder="50000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          data-testid="input-investment-amount"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      This represents {myContributionPercent.toFixed(1)}% of the total raise
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {mode === "counter" && (
                <>
                  <Card className="border-dashed border-amber-500/50 bg-amber-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="w-4 h-4" />
                        Your Counter Terms
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isDebt && (
                        <div className="grid grid-cols-2 gap-4">
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
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input className="pl-9" placeholder="9 months" {...field} data-testid="input-counter-duration" />
                                  </div>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {(isEquity || isHybrid) && (
                        <div>
                          <FormLabel className="mb-3 block">Counter Profit Split (Investor/Operator)</FormLabel>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-green-600 min-w-[40px]">{profitSplit[0]}%</span>
                            <Slider
                              value={profitSplit}
                              onValueChange={setProfitSplit}
                              max={90}
                              min={50}
                              step={5}
                              className="flex-1"
                              data-testid="slider-counter-profit-split"
                            />
                            <span className="text-sm font-medium text-blue-600 min-w-[40px]">{100 - profitSplit[0]}%</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Investor</span>
                            <span>Operator</span>
                          </div>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="counterHoldPeriod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Counter Hold Period</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 6 months" {...field} data-testid="input-counter-hold-period" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </>
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={mode === "accept" 
                          ? "Any notes for the operator about your investment..." 
                          : "Explain why you're proposing these counter terms..."}
                        className="min-h-[80px]"
                        {...field}
                        data-testid="textarea-investment-notes"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} data-testid="button-submit-investment">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : mode === "accept" ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Accept & Commit
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Submit Counter-Offer
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
