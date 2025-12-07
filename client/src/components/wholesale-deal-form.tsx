import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Home, 
  DollarSign, 
  FileText, 
  ArrowRight,
  ArrowLeft,
  Loader2,
  User,
  Calendar,
  Key,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Users,
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
import { AddressAutocomplete, parseAddressComponents } from "@/components/address-autocomplete";

const optionalNumber = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
  z.number().min(0).optional()
);

const requiredNumber = (message: string) => z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
  z.number().min(1, message)
);

const wholesaleDealFormSchema = z.object({
  propertyAddress: z.string().min(5, "Property address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Zip code is required"),
  county: z.string().optional(),
  propertyType: z.string().min(1, "Property type is required"),
  bedrooms: optionalNumber,
  bathrooms: z.string().optional(),
  sqft: optionalNumber,
  yearBuilt: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().min(1800).max(2030).optional()
  ),
  lotSize: z.string().optional(),
  sellerName: z.string().optional(),
  sellerPhone: z.string().optional(),
  sellerEmail: z.string().email().optional().or(z.literal("")),
  sellerMotivation: z.string().optional(),
  motivationLevel: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? 5 : Number(val)),
    z.number().min(1).max(10).optional()
  ),
  sellerSituation: z.string().optional(),
  askingPrice: optionalNumber,
  contractPrice: requiredNumber("Contract price is required"),
  assignmentFee: requiredNumber("Assignment fee is required"),
  maxAssignmentFee: optionalNumber,
  arv: optionalNumber,
  estimatedRepairs: optionalNumber,
  repairDetails: z.string().optional(),
  holdingCosts: optionalNumber,
  closingCosts: optionalNumber,
  emdAmount: optionalNumber,
  emdDueDate: z.string().optional(),
  emdHeldBy: z.string().optional(),
  contractDate: z.string().optional(),
  inspectionDeadline: z.string().optional(),
  dueDiligenceDeadline: z.string().optional(),
  closingDate: z.string().optional(),
  contractExpiration: z.string().optional(),
  occupancyStatus: z.string().optional(),
  accessInstructions: z.string().optional(),
  lockboxCode: z.string().optional(),
  showingAvailability: z.string().optional(),
  tenantInfo: z.string().optional(),
  titleCompany: z.string().optional(),
  titleContact: z.string().optional(),
  titlePhone: z.string().optional(),
  titleIssues: z.string().optional(),
  strategy: z.string().min(1, "Investment strategy is required"),
  exitStrategy: z.string().optional(),
  description: z.string().optional(),
  idealBuyerType: z.string().optional(),
  buyerExperienceRequired: z.string().optional(),
  proofOfFundsRequired: z.boolean().optional(),
  assignmentNotes: z.string().optional(),
  pipelineStage: z.string().optional(),
  dispositionPath: z.string().optional(),
});

type WholesaleDealFormData = z.infer<typeof wholesaleDealFormSchema>;

const PROPERTY_TYPES = [
  { value: "single_family", label: "Single Family" },
  { value: "multi_family", label: "Multi-Family (5+)" },
  { value: "duplex", label: "Duplex" },
  { value: "triplex", label: "Triplex" },
  { value: "fourplex", label: "Fourplex" },
  { value: "condo", label: "Condo/Townhouse" },
  { value: "mobile", label: "Mobile Home" },
  { value: "land", label: "Vacant Land" },
  { value: "commercial", label: "Commercial" },
];

const SELLER_MOTIVATIONS = [
  { value: "foreclosure", label: "Pre-Foreclosure" },
  { value: "divorce", label: "Divorce" },
  { value: "inherited", label: "Inherited Property" },
  { value: "relocation", label: "Job Relocation" },
  { value: "tired_landlord", label: "Tired Landlord" },
  { value: "probate", label: "Probate" },
  { value: "code_violations", label: "Code Violations" },
  { value: "tax_lien", label: "Tax Lien" },
  { value: "downsizing", label: "Downsizing" },
  { value: "health_issues", label: "Health Issues" },
  { value: "financial_hardship", label: "Financial Hardship" },
  { value: "other", label: "Other" },
];

const INVESTMENT_STRATEGIES = [
  { value: "fix_and_flip", label: "Fix & Flip" },
  { value: "buy_and_hold", label: "Buy & Hold (Rental)" },
  { value: "brrrr", label: "BRRRR" },
  { value: "wholetail", label: "Wholetail" },
  { value: "subject_to", label: "Subject-To" },
  { value: "lease_option", label: "Lease Option" },
  { value: "development", label: "Development" },
];

const OCCUPANCY_STATUS = [
  { value: "vacant", label: "Vacant" },
  { value: "owner_occupied", label: "Owner Occupied" },
  { value: "tenant_occupied", label: "Tenant Occupied" },
  { value: "squatter", label: "Squatter/Unauthorized" },
];

const BUYER_TYPES = [
  { value: "cash_buyer", label: "Cash Buyer Only" },
  { value: "hard_money", label: "Hard Money OK" },
  { value: "conventional", label: "Conventional OK" },
  { value: "any", label: "Any Financing" },
];

const DISPOSITION_PATHS = [
  { value: "assignment", label: "Assignment of Contract" },
  { value: "double_close", label: "Double Close" },
  { value: "novation", label: "Novation" },
];

interface WholesaleDealFormProps {
  onSuccess?: () => void;
}

export function WholesaleDealForm({ onSuccess }: WholesaleDealFormProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [highlightInput, setHighlightInput] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");

  const totalSteps = 5;

  const form = useForm<WholesaleDealFormData>({
    resolver: zodResolver(wholesaleDealFormSchema),
    defaultValues: {
      propertyAddress: "",
      city: "",
      state: "",
      zipCode: "",
      county: "",
      propertyType: "",
      bedrooms: undefined,
      bathrooms: "",
      sqft: undefined,
      yearBuilt: undefined,
      lotSize: "",
      sellerName: "",
      sellerPhone: "",
      sellerEmail: "",
      sellerMotivation: "",
      motivationLevel: 5,
      sellerSituation: "",
      askingPrice: undefined,
      contractPrice: 0,
      assignmentFee: 0,
      maxAssignmentFee: undefined,
      arv: undefined,
      estimatedRepairs: undefined,
      repairDetails: "",
      holdingCosts: undefined,
      closingCosts: undefined,
      emdAmount: undefined,
      emdDueDate: "",
      emdHeldBy: "",
      contractDate: "",
      inspectionDeadline: "",
      dueDiligenceDeadline: "",
      closingDate: "",
      contractExpiration: "",
      occupancyStatus: "",
      accessInstructions: "",
      lockboxCode: "",
      showingAvailability: "",
      tenantInfo: "",
      titleCompany: "",
      titleContact: "",
      titlePhone: "",
      titleIssues: "",
      strategy: "",
      exitStrategy: "",
      description: "",
      idealBuyerType: "",
      buyerExperienceRequired: "",
      proofOfFundsRequired: true,
      assignmentNotes: "",
      pipelineStage: "under_contract",
      dispositionPath: "assignment",
    },
  });

  const watchedValues = form.watch();
  const contractPrice = watchedValues.contractPrice || 0;
  const assignmentFee = watchedValues.assignmentFee || 0;
  const arv = watchedValues.arv || 0;
  const estimatedRepairs = watchedValues.estimatedRepairs || 0;
  const holdingCosts = watchedValues.holdingCosts || 0;
  const closingCosts = watchedValues.closingCosts || 0;

  const dealAnalysis = useMemo(() => {
    const totalCost = contractPrice + assignmentFee + estimatedRepairs + holdingCosts + closingCosts;
    const potentialProfit = arv - totalCost;
    const roi = totalCost > 0 ? (potentialProfit / totalCost) * 100 : 0;
    const maxOffer = arv > 0 ? Math.round(arv * 0.7 - estimatedRepairs) : 0;
    const spreadPercent = arv > 0 ? ((arv - contractPrice - assignmentFee) / arv) * 100 : 0;
    const dealGrade = 
      potentialProfit >= 50000 ? "A" :
      potentialProfit >= 30000 ? "B" :
      potentialProfit >= 15000 ? "C" : "D";
    
    return { totalCost, potentialProfit, roi, maxOffer, spreadPercent, dealGrade };
  }, [contractPrice, assignmentFee, arv, estimatedRepairs, holdingCosts, closingCosts]);

  const submitMutation = useMutation({
    mutationFn: async (data: WholesaleDealFormData) => {
      return apiRequest("POST", "/api/supabase/wholesale-deals", {
        ...data,
        highlights,
        images: imageUrls,
      });
    },
    onSuccess: () => {
      toast({
        title: "Deal Submitted Successfully",
        description: "Your wholesale deal has been submitted for review. We'll get back to you within 24-48 hours.",
      });
      form.reset();
      setHighlights([]);
      setImageUrls([]);
      setStep(1);
      queryClient.invalidateQueries({ queryKey: ["/api/supabase/wholesale-deals"] });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit deal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const addHighlight = () => {
    if (highlightInput.trim() && highlights.length < 8) {
      setHighlights([...highlights, highlightInput.trim()]);
      setHighlightInput("");
    }
  };

  const addImageUrl = () => {
    if (imageUrlInput.trim() && imageUrls.length < 10) {
      setImageUrls([...imageUrls, imageUrlInput.trim()]);
      setImageUrlInput("");
    }
  };

  const stepLabels = [
    { num: 1, label: "Property", icon: Home },
    { num: 2, label: "Seller", icon: User },
    { num: 3, label: "Contract", icon: Calendar },
    { num: 4, label: "Financials", icon: DollarSign },
    { num: 5, label: "Marketing", icon: Users },
  ];

  return (
    <div className="max-w-4xl">
      <Card className="sleek-card mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Submit Wholesale Deal
          </CardTitle>
          <CardDescription>
            Complete all sections to submit your deal for review. Accurate, detailed information helps us process faster.
          </CardDescription>
          
          <div className="flex items-center gap-1 mt-6 overflow-x-auto pb-2">
            {stepLabels.map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setStep(s.num)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${
                    step === s.num 
                      ? "bg-primary text-white" 
                      : step > s.num 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {step > s.num ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <s.icon className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.num}</span>
                </button>
                {idx < stepLabels.length - 1 && (
                  <div className="w-4 h-px bg-border mx-1" />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => submitMutation.mutate(data))} className="space-y-6">
              
              {/* Step 1: Property Information */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Home className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Property Information</h3>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="propertyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Address *</FormLabel>
                        <FormControl>
                          <AddressAutocomplete
                            value={field.value}
                            onChange={field.onChange}
                            onPlaceSelect={(place) => {
                              const parsed = parseAddressComponents(place);
                              form.setValue("propertyAddress", `${parsed.streetNumber} ${parsed.streetName}`.trim());
                              form.setValue("city", parsed.city);
                              form.setValue("state", parsed.state);
                              form.setValue("zipCode", parsed.zip);
                              form.setValue("county", parsed.county);
                            }}
                            placeholder="Start typing an address..."
                            data-testid="input-deal-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="Los Angeles" {...field} data-testid="input-deal-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <FormControl>
                            <Input placeholder="CA" {...field} data-testid="input-deal-state" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="90001" {...field} data-testid="input-deal-zip" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="county"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>County</FormLabel>
                          <FormControl>
                            <Input placeholder="Los Angeles" {...field} data-testid="input-deal-county" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-deal-type">
                              <SelectValue placeholder="Select property type" />
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beds</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="3" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              data-testid="input-deal-beds" 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Baths</FormLabel>
                          <FormControl>
                            <Input placeholder="2" {...field} data-testid="input-deal-baths" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sqft"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sq Ft</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1500" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              data-testid="input-deal-sqft" 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="yearBuilt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year Built</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1990" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              data-testid="input-deal-year" 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lotSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lot Size</FormLabel>
                          <FormControl>
                            <Input placeholder="0.25 acres" {...field} data-testid="input-deal-lot" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="occupancyStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupancy Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-occupancy">
                                <SelectValue placeholder="Select occupancy status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {OCCUPANCY_STATUS.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="strategy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Best Exit Strategy *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-strategy">
                                <SelectValue placeholder="Select investment strategy" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INVESTMENT_STRATEGIES.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="button" onClick={() => setStep(2)} data-testid="button-next-step-1">
                      Next: Seller Info
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Seller Information */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <User className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Seller Information</h3>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-200">Seller info is confidential</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          This information is only shared with our acquisitions team and never disclosed to buyers.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="sellerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seller Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} data-testid="input-seller-name" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sellerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seller Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} data-testid="input-seller-phone" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sellerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seller Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="seller@email.com" {...field} data-testid="input-seller-email" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sellerMotivation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seller Motivation</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-motivation">
                                <SelectValue placeholder="Why is seller selling?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SELLER_MOTIVATIONS.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="motivationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motivation Level (1-10)</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input 
                                type="range"
                                min="1"
                                max="10"
                                className="flex-1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                              <Badge variant={field.value && field.value >= 7 ? "default" : "secondary"} className="w-8 justify-center">
                                {field.value || 5}
                              </Badge>
                            </div>
                          </FormControl>
                          <FormDescription>1 = Just testing the market, 10 = Must sell immediately</FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="sellerSituation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seller Situation Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the seller's situation, timeline, and any special circumstances..."
                            className="min-h-[100px]"
                            {...field} 
                            data-testid="textarea-seller-situation" 
                          />
                        </FormControl>
                        <FormDescription>The more context, the better we can evaluate the deal</FormDescription>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} data-testid="button-prev-step-2">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button type="button" onClick={() => setStep(3)} data-testid="button-next-step-2">
                      Next: Contract Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Contract & Access */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Contract & Property Access</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Contract Dates</h4>
                      
                      <FormField
                        control={form.control}
                        name="contractDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contract Signed Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-contract-date" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="inspectionDeadline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inspection Deadline</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-inspection-deadline" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dueDiligenceDeadline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Diligence Deadline</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-dd-deadline" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="closingDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scheduled Closing Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-closing-date" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contractExpiration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contract Expiration</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-expiration" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Earnest Money</h4>
                      
                      <FormField
                        control={form.control}
                        name="emdAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>EMD Amount</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="1000" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                                data-testid="input-emd-amount" 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emdDueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>EMD Due Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-emd-date" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emdHeldBy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>EMD Held By</FormLabel>
                            <FormControl>
                              <Input placeholder="Title company or escrow name" {...field} data-testid="input-emd-holder" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide pt-2">Title Company</h4>
                      
                      <FormField
                        control={form.control}
                        name="titleCompany"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title Company</FormLabel>
                            <FormControl>
                              <Input placeholder="ABC Title" {...field} data-testid="input-title-company" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="titleContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title Contact Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Doe" {...field} data-testid="input-title-contact" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-4">
                    <div className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold">Property Access</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="accessInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Access Instructions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="How to access the property for showings..."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="lockboxCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Lockbox Code</FormLabel>
                              <FormControl>
                                <Input placeholder="1234" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="showingAvailability"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Showing Availability</FormLabel>
                              <FormControl>
                                <Input placeholder="Mon-Fri 9am-5pm" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {watchedValues.occupancyStatus === "tenant_occupied" && (
                      <FormField
                        control={form.control}
                        name="tenantInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tenant Information</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Lease terms, rent amount, move-out date, tenant cooperation..."
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button type="button" onClick={() => setStep(4)}>
                      Next: Financials
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Financial Details */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Financial Details</h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="askingPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Asking Price</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="175000" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormDescription>What seller originally asked</FormDescription>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contractPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contract Price *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="150000" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-contract-price"
                            />
                          </FormControl>
                          <FormDescription>Your purchase price</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="assignmentFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assignment Fee *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="15000" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-assignment-fee"
                            />
                          </FormControl>
                          <FormDescription>Your wholesale profit</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="arv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>After Repair Value (ARV)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="250000" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              data-testid="input-arv"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="estimatedRepairs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Repairs</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50000" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              data-testid="input-repairs"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxAssignmentFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Assignment Fee</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="20000" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormDescription>Negotiation ceiling</FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="holdingCosts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Est. Monthly Holding Costs</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2000" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="closingCosts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Est. Closing Costs</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="5000" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="repairDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repair Breakdown</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Kitchen: $15k, Bathrooms: $10k, Roof: $8k, HVAC: $5k..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Deal Analysis Card */}
                  <Card className="bg-gradient-to-br from-primary/5 to-amber-500/5 border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Deal Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="p-3 rounded-lg bg-background">
                          <p className="text-xs text-muted-foreground">All-In Cost</p>
                          <p className="font-bold">{formatCurrency(dealAnalysis.totalCost)}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-background">
                          <p className="text-xs text-muted-foreground">Buyer Profit</p>
                          <p className={`font-bold ${dealAnalysis.potentialProfit > 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatCurrency(dealAnalysis.potentialProfit)}
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-background">
                          <p className="text-xs text-muted-foreground">ROI</p>
                          <p className={`font-bold ${dealAnalysis.roi > 15 ? "text-green-600" : "text-amber-600"}`}>
                            {dealAnalysis.roi.toFixed(1)}%
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-background">
                          <p className="text-xs text-muted-foreground">Spread</p>
                          <p className="font-bold">{dealAnalysis.spreadPercent.toFixed(1)}%</p>
                        </div>
                        <div className="p-3 rounded-lg bg-background">
                          <p className="text-xs text-muted-foreground">Deal Grade</p>
                          <Badge className={
                            dealAnalysis.dealGrade === "A" ? "bg-green-600" :
                            dealAnalysis.dealGrade === "B" ? "bg-blue-600" :
                            dealAnalysis.dealGrade === "C" ? "bg-amber-600" : "bg-red-600"
                          }>
                            {dealAnalysis.dealGrade}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-4 p-3 rounded-lg bg-background">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground">70% Rule Max Offer</p>
                            <p className="font-bold text-primary">{formatCurrency(dealAnalysis.maxOffer)}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">(ARV × 70%) - Repairs</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep(3)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button type="button" onClick={() => setStep(5)}>
                      Next: Marketing
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 5: Marketing & Submission */}
              {step === 5 && (
                <div className="space-y-6 animate-in fade-in-50 duration-200">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Marketing & Buyer Requirements</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="idealBuyerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ideal Buyer Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="What type of buyer?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {BUYER_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dispositionPath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Disposition Method</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="How will this close?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DISPOSITION_PATHS.map((path) => (
                                <SelectItem key={path.value} value={path.value}>
                                  {path.label}
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
                    name="proofOfFundsRequired"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0 p-4 rounded-lg border">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div>
                          <FormLabel className="font-medium">Require Proof of Funds</FormLabel>
                          <FormDescription>Buyers must show POF before receiving full property details</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the property, neighborhood, and why this is a great deal..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Deal Highlights</FormLabel>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Add highlight (e.g., 'Corner lot', 'New roof')"
                        value={highlightInput}
                        onChange={(e) => setHighlightInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addHighlight())}
                      />
                      <Button type="button" variant="outline" onClick={addHighlight}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {highlights.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {highlights.map((h, i) => (
                          <Badge key={i} variant="secondary" className="flex items-center gap-1 pr-1">
                            {h}
                            <button 
                              type="button" 
                              onClick={() => setHighlights(highlights.filter((_, idx) => idx !== i))}
                              className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <FormLabel>Property Images (URLs)</FormLabel>
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
                            <img src={url} alt={`Property ${i + 1}`} className="w-full h-full object-cover" />
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

                  <FormField
                    control={form.control}
                    name="assignmentNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignment Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any special terms, conditions, or notes for the assignment..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between pt-6 border-t">
                    <Button type="button" variant="outline" onClick={() => setStep(4)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      size="lg"
                      disabled={submitMutation.isPending}
                      className="min-w-[200px]"
                      data-testid="button-submit-deal"
                    >
                      {submitMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Submit Deal for Review
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
    </div>
  );
}
