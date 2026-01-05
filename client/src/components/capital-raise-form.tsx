import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Building2,
  DollarSign, 
  FileText, 
  ArrowRight,
  ArrowLeft,
  Loader2,
  TrendingUp,
  CheckCircle2,
  Percent,
  Calendar,
  MapPin,
  X,
  Plus
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

const optionalNumber = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
  z.number().min(0).optional()
);

const requiredNumber = (message: string) => z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
  z.number().min(1, message)
);

const baseCapitalRaiseSchema = z.object({
  title: z.string().min(5, "Project title is required"),
  description: z.string().min(20, "Please provide a detailed description"),
  location: z.string().min(3, "Location is required"),
  strategy: z.string().min(1, "Investment strategy is required"),
  structure: z.string().min(1, "Investment structure is required"),
  fundingGoal: requiredNumber("Funding goal is required"),
  minInvestment: optionalNumber,
  projectedReturn: z.string().optional(),
  askingInterestRate: z.string().optional(),
  askingLoanDuration: z.string().optional(),
  askingProfitSplit: z.string().optional(),
  holdPeriod: z.string().optional(),
  exitStrategy: z.string().optional(),
  propertyType: z.string().optional(),
  purchasePrice: optionalNumber,
  rehabBudget: optionalNumber,
  arv: optionalNumber,
});

const capitalRaiseFormSchema = baseCapitalRaiseSchema.superRefine((data, ctx) => {
  if (data.structure === "DEBT") {
    if (!data.askingInterestRate || data.askingInterestRate.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Interest rate is required for debt structures",
        path: ["askingInterestRate"],
      });
    }
    if (!data.askingLoanDuration || data.askingLoanDuration.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Loan duration is required for debt structures",
        path: ["askingLoanDuration"],
      });
    }
  }
  if (data.structure === "EQUITY" || data.structure === "HYBRID") {
    if (!data.askingProfitSplit || data.askingProfitSplit.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Profit split is required for equity/hybrid structures",
        path: ["askingProfitSplit"],
      });
    }
  }
});

type CapitalRaiseFormData = z.infer<typeof capitalRaiseFormSchema>;

const INVESTMENT_STRATEGIES = [
  { value: "fix-flip", label: "Fix & Flip" },
  { value: "buy-hold", label: "Buy & Hold (Rental)" },
  { value: "value-add", label: "Value-Add" },
  { value: "development", label: "Ground-Up Development" },
  { value: "new-construction", label: "New Construction" },
  { value: "commercial", label: "Commercial" },
];

const INVESTMENT_STRUCTURES = [
  { value: "EQUITY", label: "Equity" },
  { value: "DEBT", label: "Debt" },
  { value: "HYBRID", label: "Hybrid" },
];

const PROPERTY_TYPES = [
  { value: "single_family", label: "Single Family" },
  { value: "multi_family", label: "Multi-Family" },
  { value: "commercial", label: "Commercial" },
  { value: "mixed_use", label: "Mixed Use" },
  { value: "land", label: "Land" },
];

const EXIT_STRATEGIES = [
  { value: "sale", label: "Property Sale" },
  { value: "refinance", label: "Refinance" },
  { value: "hold", label: "Long-term Hold" },
  { value: "1031", label: "1031 Exchange" },
];

interface CapitalRaiseFormProps {
  onSuccess?: () => void;
}

export function CapitalRaiseForm({ onSuccess }: CapitalRaiseFormProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [profitSplit, setProfitSplit] = useState([70]);

  const totalSteps = 3;

  const form = useForm<CapitalRaiseFormData>({
    resolver: zodResolver(capitalRaiseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      strategy: "",
      structure: "EQUITY",
      fundingGoal: 0,
      minInvestment: undefined,
      projectedReturn: "",
      askingInterestRate: "",
      askingLoanDuration: "",
      askingProfitSplit: "70/30",
      holdPeriod: "",
      exitStrategy: "",
      propertyType: "",
      purchasePrice: undefined,
      rehabBudget: undefined,
      arv: undefined,
    },
  });

  const watchedStructure = form.watch("structure");

  const createMutation = useMutation({
    mutationFn: async (data: CapitalRaiseFormData) => {
      const payload = {
        ...data,
        images: imageUrls,
        askingProfitSplit: `${profitSplit[0]}/${100 - profitSplit[0]}`,
      };
      const response = await apiRequest("POST", "/api/capital-projects", payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Capital raise submitted!",
        description: "Your project is now under review. We'll notify you once approved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/capital-projects"] });
      form.reset();
      setStep(1);
      setImageUrls([]);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CapitalRaiseFormData) => {
    createMutation.mutate(data);
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(step);
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid && step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const getFieldsForStep = (stepNum: number): (keyof CapitalRaiseFormData)[] => {
    switch (stepNum) {
      case 1:
        return ["title", "description", "location", "strategy", "propertyType"];
      case 2:
        return ["structure", "fundingGoal"];
      case 3:
        return [];
      default:
        return [];
    }
  };

  const addImageUrl = () => {
    if (imageUrlInput.trim() && imageUrls.length < 10) {
      setImageUrls([...imageUrls, imageUrlInput.trim()]);
      setImageUrlInput("");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Create Capital Raise
          </CardTitle>
          <Badge variant="outline">
            Step {step} of {totalSteps}
          </Badge>
        </div>
        <div className="flex gap-1 mt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Project Details</h3>
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 12-Unit Apartment Rehab - Downtown Austin" {...field} data-testid="input-capital-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-9" placeholder="City, State" {...field} data-testid="input-capital-location" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-capital-property-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROPERTY_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="strategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Strategy</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-capital-strategy">
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INVESTMENT_STRATEGIES.map((strategy) => (
                            <SelectItem key={strategy.value} value={strategy.value}>
                              {strategy.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the investment opportunity, property condition, neighborhood, and why this is a compelling deal..."
                          className="min-h-[120px]"
                          {...field}
                          data-testid="textarea-capital-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button type="button" onClick={nextStep} data-testid="button-capital-next-1">
                    Next: Funding Terms
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Funding Terms</h3>
                </div>

                <FormField
                  control={form.control}
                  name="structure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Structure</FormLabel>
                      <div className="grid grid-cols-3 gap-3">
                        {INVESTMENT_STRUCTURES.map((structure) => (
                          <Button
                            key={structure.value}
                            type="button"
                            variant={field.value === structure.value ? "default" : "outline"}
                            className="h-auto py-4 flex flex-col gap-1"
                            onClick={() => field.onChange(structure.value)}
                            data-testid={`button-structure-${structure.value.toLowerCase()}`}
                          >
                            <span className="font-medium">{structure.label}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {structure.value === "EQUITY" && "Ownership stake"}
                              {structure.value === "DEBT" && "Fixed interest loan"}
                              {structure.value === "HYBRID" && "Debt + Equity"}
                            </span>
                          </Button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fundingGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funding Goal</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="number"
                              className="pl-9"
                              placeholder="500000"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              data-testid="input-capital-funding-goal"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minInvestment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Investment</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="number"
                              className="pl-9"
                              placeholder="25000"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              data-testid="input-capital-min-investment"
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {watchedStructure === "DEBT" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <FormField
                      control={form.control}
                      name="askingInterestRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interest Rate</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input className="pl-9" placeholder="12%" {...field} data-testid="input-capital-interest-rate" />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="askingLoanDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Duration</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input className="pl-9" placeholder="12 months" {...field} data-testid="input-capital-loan-duration" />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {(watchedStructure === "EQUITY" || watchedStructure === "HYBRID") && (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <FormLabel>Profit Split (Investor/Operator)</FormLabel>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-sm font-medium text-green-600">{profitSplit[0]}%</span>
                        <Slider
                          value={profitSplit}
                          onValueChange={setProfitSplit}
                          max={90}
                          min={50}
                          step={5}
                          className="flex-1"
                          data-testid="slider-profit-split"
                        />
                        <span className="text-sm font-medium text-blue-600">{100 - profitSplit[0]}%</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Investor</span>
                        <span>Operator</span>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="projectedReturn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Projected Return</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 18-22% annualized" {...field} data-testid="input-capital-projected-return" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="holdPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Hold Period</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 6-12 months" {...field} data-testid="input-capital-hold-period" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep} data-testid="button-capital-next-2">
                    Next: Financials
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Property Financials & Media</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="purchasePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Price</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="number"
                              className="pl-9"
                              placeholder="350000"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              data-testid="input-capital-purchase-price"
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rehabBudget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rehab Budget</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="number"
                              className="pl-9"
                              placeholder="75000"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              data-testid="input-capital-rehab-budget"
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="arv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ARV</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="number"
                              className="pl-9"
                              placeholder="525000"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              data-testid="input-capital-arv"
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="exitStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exit Strategy</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-capital-exit-strategy">
                            <SelectValue placeholder="How will you exit?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EXIT_STRATEGIES.map((strategy) => (
                            <SelectItem key={strategy.value} value={strategy.value}>
                              {strategy.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Project Images (URLs)</FormLabel>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Paste image URL"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
                    />
                    <Button type="button" variant="outline" onClick={addImageUrl}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {imageUrls.map((url, i) => (
                        <div key={i} className="relative aspect-video bg-secondary rounded overflow-hidden group">
                          <img src={url} alt={`Project ${i + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 bg-destructive text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Funding Goal</p>
                      <p className="font-semibold">{formatCurrency(form.watch("fundingGoal") || 0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Structure</p>
                      <p className="font-semibold">{form.watch("structure") || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Strategy</p>
                      <p className="font-semibold">{form.watch("strategy") || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Min Investment</p>
                      <p className="font-semibold">{form.watch("minInvestment") ? formatCurrency(form.watch("minInvestment")!) : "—"}</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between pt-6 border-t">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-capital-raise">
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Submit Capital Raise
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
