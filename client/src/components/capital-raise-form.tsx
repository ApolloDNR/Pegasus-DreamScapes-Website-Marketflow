import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
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
  Plus,
  Target,
  AlertTriangle,
  ClipboardCheck,
  Milestone as MilestoneIcon
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { StepProgress, FormSection, FieldGroup } from "@/components/step-progress";
import { PhotoUploadSection } from "@/components/photo-upload-section";

const optionalNumber = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
  z.number().min(0).optional()
);

const requiredNumber = (message: string) => z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
  z.number().min(1, message)
);

const milestoneSchema = z.object({
  title: z.string().min(1, "Milestone title required"),
  targetDate: z.string().optional(),
  description: z.string().optional(),
});

const baseCapitalRaiseSchema = z.object({
  title: z.string().min(5, "Project title is required"),
  description: z.string().min(20, "Please provide a detailed description"),
  location: z.string().min(3, "Location is required"),
  strategy: z.string().min(1, "Investment strategy is required"),
  structure: z.string().min(1, "Investment structure is required"),
  fundingGoal: requiredNumber("Funding goal is required"),
  minInvestment: optionalNumber,
  maxInvestors: optionalNumber,
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
  riskFactors: z.string().optional(),
  dueDiligenceNotes: z.string().optional(),
  accreditedOnly: z.boolean().optional(),
  investorBenefits: z.string().optional(),
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

interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  description: string;
}

const INVESTMENT_STRATEGIES = [
  { value: "fix-flip", label: "Fix & Flip", description: "Quick turnaround renovation projects" },
  { value: "buy-hold", label: "Buy & Hold (Rental)", description: "Long-term rental income" },
  { value: "value-add", label: "Value-Add", description: "Improve existing properties" },
  { value: "development", label: "Ground-Up Development", description: "New construction projects" },
  { value: "new-construction", label: "New Construction", description: "Building from the ground up" },
  { value: "commercial", label: "Commercial", description: "Office, retail, or industrial" },
];

const INVESTMENT_STRUCTURES = [
  { value: "EQUITY", label: "Equity", description: "Ownership stake in the project" },
  { value: "DEBT", label: "Debt", description: "Fixed interest loan" },
  { value: "HYBRID", label: "Hybrid", description: "Combination of debt and equity" },
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

const STEPS = [
  { id: 1, label: "Project Details", description: "Basic information" },
  { id: 2, label: "Funding Terms", description: "Investment structure" },
  { id: 3, label: "Milestones", description: "Timeline & risks" },
  { id: 4, label: "Financials & Media", description: "Numbers & photos" },
];

interface CapitalRaiseFormProps {
  onSuccess?: () => void;
}

export function CapitalRaiseForm({ onSuccess }: CapitalRaiseFormProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [profitSplit, setProfitSplit] = useState([70]);
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: "1", title: "Property Acquisition", targetDate: "", description: "" },
    { id: "2", title: "Renovation Complete", targetDate: "", description: "" },
  ]);

  const totalSteps = 4;

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
      maxInvestors: undefined,
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
      riskFactors: "",
      dueDiligenceNotes: "",
      accreditedOnly: false,
      investorBenefits: "",
    },
  });

  const watchedStructure = form.watch("structure");

  const createMutation = useMutation({
    mutationFn: async (data: CapitalRaiseFormData) => {
      const payload = {
        ...data,
        images: imageUrls,
        askingProfitSplit: `${profitSplit[0]}/${100 - profitSplit[0]}`,
        milestones: milestones.filter(m => m.title.trim()),
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
      setMilestones([
        { id: "1", title: "Property Acquisition", targetDate: "", description: "" },
        { id: "2", title: "Renovation Complete", targetDate: "", description: "" },
      ]);
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
      case 4:
        return [];
      default:
        return [];
    }
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { id: Date.now().toString(), title: "", targetDate: "", description: "" },
    ]);
  };

  const removeMilestone = (id: string) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((m) => m.id !== id));
    }
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: string) => {
    setMilestones(
      milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
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
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Create Capital Raise
          </CardTitle>
          <Badge variant="outline">
            Step {step} of {totalSteps}
          </Badge>
        </div>
        <StepProgress steps={STEPS} currentStep={step} className="mt-6" />
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <FormSection
                  icon={<Building2 className="w-5 h-5" />}
                  title="Project Details"
                  description="Tell investors about your project opportunity"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 12-Unit Apartment Rehab - Downtown Austin" 
                            {...field} 
                            data-testid="input-capital-title" 
                          />
                        </FormControl>
                        <FormDescription>
                          A compelling title that describes your project
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FieldGroup>
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input 
                                className="pl-9" 
                                placeholder="City, State" 
                                {...field} 
                                data-testid="input-capital-location" 
                              />
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
                  </FieldGroup>

                  <FormField
                    control={form.control}
                    name="strategy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Investment Strategy</FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                          {INVESTMENT_STRATEGIES.map((strategy) => (
                            <Button
                              key={strategy.value}
                              type="button"
                              variant={field.value === strategy.value ? "default" : "outline"}
                              className="h-auto py-3 flex flex-col gap-1 text-left"
                              onClick={() => field.onChange(strategy.value)}
                              data-testid={`button-strategy-${strategy.value}`}
                            >
                              <span className="font-medium text-sm">{strategy.label}</span>
                              <span className="text-[10px] text-muted-foreground line-clamp-1">
                                {strategy.description}
                              </span>
                            </Button>
                          ))}
                        </div>
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
                            placeholder="Describe the investment opportunity in detail. Include information about the property condition, neighborhood, renovation plans, and why this is a compelling deal for investors..."
                            className="min-h-[150px]"
                            {...field}
                            data-testid="textarea-capital-description"
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum 20 characters. Be specific about the opportunity.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormSection>

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
                <FormSection
                  icon={<DollarSign className="w-5 h-5" />}
                  title="Funding Terms"
                  description="Define your investment structure and terms"
                >
                  <FormField
                    control={form.control}
                    name="structure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Investment Structure</FormLabel>
                        <div className="grid grid-cols-3 gap-3 mt-2">
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
                                {structure.description}
                              </span>
                            </Button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FieldGroup columns={3}>
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
                    <FormField
                      control={form.control}
                      name="maxInvestors"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Investors</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="10"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              data-testid="input-capital-max-investors"
                            />
                          </FormControl>
                          <FormDescription>Leave blank for unlimited</FormDescription>
                        </FormItem>
                      )}
                    />
                  </FieldGroup>

                  {watchedStructure === "DEBT" && (
                    <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Percent className="w-4 h-4" />
                        Debt Terms
                      </h4>
                      <FieldGroup>
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
                              <FormMessage />
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </FieldGroup>
                    </div>
                  )}

                  {(watchedStructure === "EQUITY" || watchedStructure === "HYBRID") && (
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Equity Terms
                      </h4>
                      <div>
                        <FormLabel>Profit Split (Investor/Operator)</FormLabel>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-sm font-medium text-green-600 w-12">{profitSplit[0]}%</span>
                          <Slider
                            value={profitSplit}
                            onValueChange={setProfitSplit}
                            max={90}
                            min={50}
                            step={5}
                            className="flex-1"
                            data-testid="slider-profit-split"
                          />
                          <span className="text-sm font-medium text-blue-600 w-12">{100 - profitSplit[0]}%</span>
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

                  <FieldGroup>
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
                  </FieldGroup>

                  <FormField
                    control={form.control}
                    name="accreditedOnly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-accredited-only"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Accredited Investors Only</FormLabel>
                          <FormDescription>
                            Limit this raise to accredited investors only (typically $200K+ income or $1M+ net worth)
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </FormSection>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep} data-testid="button-capital-next-2">
                    Next: Milestones
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <FormSection
                  icon={<MilestoneIcon className="w-5 h-5" />}
                  title="Project Milestones"
                  description="Define key milestones and timeline for your project"
                >
                  <div className="space-y-4">
                    {milestones.map((milestone, index) => (
                      <Card key={milestone.id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <Input
                                placeholder="Milestone title"
                                value={milestone.title}
                                onChange={(e) => updateMilestone(milestone.id, "title", e.target.value)}
                                data-testid={`input-milestone-title-${index}`}
                              />
                              <Input
                                type="date"
                                placeholder="Target date"
                                value={milestone.targetDate}
                                onChange={(e) => updateMilestone(milestone.id, "targetDate", e.target.value)}
                                data-testid={`input-milestone-date-${index}`}
                              />
                              <Input
                                placeholder="Description (optional)"
                                value={milestone.description}
                                onChange={(e) => updateMilestone(milestone.id, "description", e.target.value)}
                                data-testid={`input-milestone-desc-${index}`}
                              />
                            </div>
                          </div>
                          {milestones.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMilestone(milestone.id)}
                              data-testid={`button-remove-milestone-${index}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addMilestone}
                      className="w-full"
                      data-testid="button-add-milestone"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Milestone
                    </Button>
                  </div>
                </FormSection>

                <FormSection
                  icon={<AlertTriangle className="w-5 h-5" />}
                  title="Risk Disclosure"
                  description="Be transparent about potential risks"
                >
                  <FormField
                    control={form.control}
                    name="riskFactors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk Factors</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe potential risks investors should be aware of (e.g., market conditions, construction delays, regulatory issues)..."
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-risk-factors"
                          />
                        </FormControl>
                        <FormDescription>
                          Transparency builds trust with investors
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </FormSection>

                <FormSection
                  icon={<ClipboardCheck className="w-5 h-5" />}
                  title="Due Diligence"
                  description="What due diligence materials are available?"
                >
                  <FormField
                    control={form.control}
                    name="dueDiligenceNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Diligence Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List available documents and inspections (e.g., property inspection, title search, appraisal, contractor estimates)..."
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-due-diligence"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="investorBenefits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Investor Benefits</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What additional benefits do investors receive? (e.g., quarterly updates, voting rights, priority access to future deals)..."
                            className="min-h-[80px]"
                            {...field}
                            data-testid="textarea-investor-benefits"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </FormSection>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep} data-testid="button-capital-next-3">
                    Next: Financials & Media
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <FormSection
                  icon={<FileText className="w-5 h-5" />}
                  title="Property Financials"
                  description="Provide detailed financial information"
                >
                  <FieldGroup columns={3}>
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
                          <FormLabel>After Repair Value (ARV)</FormLabel>
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
                  </FieldGroup>
                </FormSection>

                <PhotoUploadSection
                  images={imageUrls}
                  onImagesChange={setImageUrls}
                  maxImages={10}
                  label="Project Photos"
                  description="Add photos of the property to attract investors"
                />

                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Investment Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
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
                      <p className="font-semibold">{
                        INVESTMENT_STRATEGIES.find(s => s.value === form.watch("strategy"))?.label || "—"
                      }</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Min Investment</p>
                      <p className="font-semibold">{form.watch("minInvestment") ? formatCurrency(form.watch("minInvestment")!) : "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Hold Period</p>
                      <p className="font-semibold">{form.watch("holdPeriod") || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Exit Strategy</p>
                      <p className="font-semibold">{
                        EXIT_STRATEGIES.find(s => s.value === form.watch("exitStrategy"))?.label || "—"
                      }</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Milestones</p>
                      <p className="font-semibold">{milestones.filter(m => m.title.trim()).length} defined</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Photos</p>
                      <p className="font-semibold">{imageUrls.length} uploaded</p>
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
