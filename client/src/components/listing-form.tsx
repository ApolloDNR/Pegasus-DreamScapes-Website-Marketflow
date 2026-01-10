import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  CheckCircle2,
  MapPin,
  Calendar,
  X,
  Plus,
  User,
  Phone,
  Mail,
  Video,
  Sparkles,
  Key
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AddressAutocomplete, parseAddressComponents } from "@/components/address-autocomplete";
import { StepProgress, FormSection, FieldGroup } from "@/components/step-progress";
import { PhotoUploadSection } from "@/components/photo-upload-section";

type PlaceResult = google.maps.places.PlaceResult;

const optionalNumber = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
  z.number().min(0).optional()
);

const requiredNumber = (message: string) => z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
  z.number().min(1, message)
);

const listingFormSchema = z.object({
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
  listingType: z.string().min(1, "Listing type is required"),
  listPrice: requiredNumber("List price is required"),
  pricePerSqft: optionalNumber,
  condition: z.string().optional(),
  renovationYear: optionalNumber,
  amenities: z.array(z.string()).optional(),
  hoa: optionalNumber,
  propertyTax: optionalNumber,
  description: z.string().min(20, "Please provide a detailed description").optional(),
  highlights: z.array(z.string()).optional(),
  showingInstructions: z.string().optional(),
  lockboxCode: z.string().optional(),
  occupancyStatus: z.string().optional(),
  availableDate: z.string().optional(),
  agentName: z.string().optional(),
  agentPhone: z.string().optional(),
  agentEmail: z.string().email().optional().or(z.literal("")),
  virtualTourUrl: z.string().optional(),
  openHouseDate: z.string().optional(),
  openHouseTime: z.string().optional(),
  parkingSpaces: optionalNumber,
  stories: optionalNumber,
  basement: z.boolean().optional(),
  garage: z.boolean().optional(),
  pool: z.boolean().optional(),
  waterfront: z.boolean().optional(),
});

type ListingFormData = z.infer<typeof listingFormSchema>;

const PROPERTY_TYPES = [
  { value: "single_family", label: "Single Family", description: "Detached home" },
  { value: "multi_family", label: "Multi-Family", description: "2-4 units" },
  { value: "condo", label: "Condo", description: "Condominium unit" },
  { value: "townhouse", label: "Townhouse", description: "Attached home" },
  { value: "commercial", label: "Commercial", description: "Business property" },
  { value: "land", label: "Land", description: "Vacant land" },
];

const LISTING_TYPES = [
  { value: "on_market", label: "On Market" },
  { value: "off_market", label: "Off Market" },
  { value: "coming_soon", label: "Coming Soon" },
  { value: "pocket_listing", label: "Pocket Listing" },
];

const CONDITIONS = [
  { value: "excellent", label: "Excellent" },
  { value: "move_in_ready", label: "Move-In Ready" },
  { value: "needs_minor_updates", label: "Needs Minor Updates" },
  { value: "needs_renovation", label: "Needs Renovation" },
  { value: "distressed", label: "Distressed/Fixer" },
];

const OCCUPANCY_STATUS = [
  { value: "vacant", label: "Vacant" },
  { value: "owner_occupied", label: "Owner Occupied" },
  { value: "tenant_occupied", label: "Tenant Occupied" },
  { value: "month_to_month", label: "Month-to-Month Tenant" },
];

const AMENITIES_OPTIONS = [
  "Pool", "Garage", "Fireplace", "Central AC", "Hardwood Floors",
  "Updated Kitchen", "Updated Bathrooms", "Basement", "Attic", "Fenced Yard",
  "Solar Panels", "Smart Home", "Wine Cellar", "Home Office", "Guest House"
];

const STEPS = [
  { id: 1, label: "Location", description: "Property address" },
  { id: 2, label: "Details", description: "Property specs" },
  { id: 3, label: "Pricing", description: "Price & features" },
  { id: 4, label: "Media & Contact", description: "Photos & agent" },
];

interface ListingFormProps {
  onSuccess?: () => void;
  editMode?: boolean;
  initialData?: Partial<ListingFormData> & { id?: number; images?: string[] };
}

export function ListingForm({ onSuccess, editMode = false, initialData }: ListingFormProps) {
  const [step, setStep] = useState(1);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialData?.amenities || []);
  const [highlights, setHighlights] = useState<string[]>(initialData?.highlights || []);
  const [newHighlight, setNewHighlight] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.images || []);
  const { toast } = useToast();
  const totalSteps = 4;

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      propertyAddress: initialData?.propertyAddress || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      zipCode: initialData?.zipCode || "",
      county: initialData?.county || "",
      propertyType: initialData?.propertyType || "",
      bedrooms: initialData?.bedrooms,
      bathrooms: initialData?.bathrooms || "",
      sqft: initialData?.sqft,
      yearBuilt: initialData?.yearBuilt,
      lotSize: initialData?.lotSize || "",
      listingType: initialData?.listingType || "on_market",
      listPrice: initialData?.listPrice || 0,
      pricePerSqft: initialData?.pricePerSqft,
      condition: initialData?.condition || "",
      renovationYear: initialData?.renovationYear,
      amenities: initialData?.amenities || [],
      hoa: initialData?.hoa,
      propertyTax: initialData?.propertyTax,
      description: initialData?.description || "",
      highlights: initialData?.highlights || [],
      showingInstructions: initialData?.showingInstructions || "",
      lockboxCode: initialData?.lockboxCode || "",
      occupancyStatus: initialData?.occupancyStatus || "",
      availableDate: initialData?.availableDate || "",
      agentName: initialData?.agentName || "",
      agentPhone: initialData?.agentPhone || "",
      agentEmail: initialData?.agentEmail || "",
      virtualTourUrl: initialData?.virtualTourUrl || "",
      openHouseDate: initialData?.openHouseDate || "",
      openHouseTime: initialData?.openHouseTime || "",
      parkingSpaces: initialData?.parkingSpaces,
      stories: initialData?.stories,
      basement: initialData?.basement || false,
      garage: initialData?.garage || false,
      pool: initialData?.pool || false,
      waterfront: initialData?.waterfront || false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      const payload = { 
        ...data, 
        amenities: selectedAmenities, 
        highlights,
        images: imageUrls,
      };
      if (editMode && initialData?.id) {
        return apiRequest("PATCH", `/api/listings/${initialData.id}`, payload);
      }
      return apiRequest("POST", "/api/listings", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: editMode ? "Listing Updated" : "Listing Created",
        description: editMode 
          ? "Your listing has been updated successfully."
          : "Your listing has been submitted for review.",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit listing",
        variant: "destructive",
      });
    },
  });

  const handlePlaceSelect = (place: PlaceResult) => {
    const parsed = parseAddressComponents(place);
    form.setValue("propertyAddress", parsed.fullAddress || place.formatted_address || "");
    if (parsed.city) form.setValue("city", parsed.city);
    if (parsed.state) form.setValue("state", parsed.state);
    if (parsed.zip) form.setValue("zipCode", parsed.zip);
    if (parsed.county) form.setValue("county", parsed.county);
  };

  const addHighlight = () => {
    if (newHighlight.trim() && highlights.length < 6) {
      setHighlights([...highlights, newHighlight.trim()]);
      setNewHighlight("");
    }
  };

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const onSubmit = (data: ListingFormData) => {
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

  const getFieldsForStep = (stepNum: number): (keyof ListingFormData)[] => {
    switch (stepNum) {
      case 1:
        return ["propertyAddress", "city", "state", "zipCode"];
      case 2:
        return ["propertyType", "listingType"];
      case 3:
        return ["listPrice"];
      case 4:
        return [];
      default:
        return [];
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
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            {editMode ? "Edit Listing" : "Create New Listing"}
          </CardTitle>
          <Badge variant="outline">Step {step} of {totalSteps}</Badge>
        </div>
        <StepProgress steps={STEPS} currentStep={step} className="mt-6" />
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <FormSection
                  icon={<MapPin className="w-5 h-5" />}
                  title="Property Location"
                  description="Enter the full property address"
                >
                  <FormField
                    control={form.control}
                    name="propertyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Address</FormLabel>
                        <FormControl>
                          <AddressAutocomplete
                            value={field.value}
                            onChange={field.onChange}
                            onPlaceSelect={handlePlaceSelect}
                            placeholder="Start typing an address..."
                            data-testid="input-property-address"
                          />
                        </FormControl>
                        <FormDescription>
                          Address autocomplete will fill in city, state, and zip
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FieldGroup>
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="City" data-testid="input-city" />
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
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="State" data-testid="input-state" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Zip Code" data-testid="input-zipcode" />
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
                          <FormLabel>County (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="County" data-testid="input-county" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </FieldGroup>
                </FormSection>

                <div className="flex justify-end pt-4">
                  <Button type="button" onClick={nextStep} data-testid="button-listing-next-1">
                    Next: Property Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <FormSection
                  icon={<Home className="w-5 h-5" />}
                  title="Property Details"
                  description="Describe the property specifications"
                >
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type</FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                          {PROPERTY_TYPES.map((type) => (
                            <Button
                              key={type.value}
                              type="button"
                              variant={field.value === type.value ? "default" : "outline"}
                              className="h-auto py-3 flex flex-col gap-1"
                              onClick={() => field.onChange(type.value)}
                              data-testid={`button-type-${type.value}`}
                            >
                              <span className="font-medium text-sm">{type.label}</span>
                              <span className="text-[10px] text-muted-foreground">{type.description}</span>
                            </Button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FieldGroup>
                    <FormField
                      control={form.control}
                      name="listingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Listing Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-listing-type">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {LISTING_TYPES.map(type => (
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
                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Condition</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-condition">
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CONDITIONS.map(c => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </FieldGroup>

                  <FieldGroup columns={4}>
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value ?? ""} 
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="Beds"
                              data-testid="input-bedrooms"
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
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., 2.5" data-testid="input-bathrooms" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sqft"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Square Feet</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value ?? ""} 
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="Sqft"
                              data-testid="input-sqft"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stories"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stories</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value ?? ""} 
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="Floors"
                              data-testid="input-stories"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </FieldGroup>

                  <FieldGroup columns={3}>
                    <FormField
                      control={form.control}
                      name="yearBuilt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year Built</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value ?? ""} 
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="Year"
                              data-testid="input-year-built"
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
                            <Input {...field} placeholder="e.g., 0.25 acres" data-testid="input-lot-size" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="parkingSpaces"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parking Spaces</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value ?? ""} 
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              placeholder="Spaces"
                              data-testid="input-parking"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </FieldGroup>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                    <FormField
                      control={form.control}
                      name="garage"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-garage"
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Garage</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="basement"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-basement"
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Basement</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pool"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-pool"
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Pool</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="waterfront"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-waterfront"
                            />
                          </FormControl>
                          <FormLabel className="font-normal">Waterfront</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </FormSection>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep} data-testid="button-listing-next-2">
                    Next: Pricing & Features
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <FormSection
                  icon={<DollarSign className="w-5 h-5" />}
                  title="Pricing & Features"
                  description="Set your listing price and highlight key features"
                >
                  <FieldGroup columns={3}>
                    <FormField
                      control={form.control}
                      name="listPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>List Price</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input 
                                type="number" 
                                {...field} 
                                value={field.value ?? ""} 
                                onChange={e => field.onChange(Number(e.target.value))}
                                className="pl-9"
                                placeholder="0"
                                data-testid="input-list-price"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hoa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly HOA</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input 
                                type="number" 
                                {...field} 
                                value={field.value ?? ""} 
                                onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                className="pl-9"
                                placeholder="0"
                                data-testid="input-hoa"
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="propertyTax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Property Tax</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input 
                                type="number" 
                                {...field} 
                                value={field.value ?? ""} 
                                onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                className="pl-9"
                                placeholder="0"
                                data-testid="input-property-tax"
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <FormField
                      control={form.control}
                      name="occupancyStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupancy Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-occupancy">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {OCCUPANCY_STATUS.map(status => (
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
                      name="availableDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              data-testid="input-available-date"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </FieldGroup>

                  <div>
                    <FormLabel>Amenities</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {AMENITIES_OPTIONS.map(amenity => (
                        <Badge
                          key={amenity}
                          variant={selectedAmenities.includes(amenity) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleAmenity(amenity)}
                          data-testid={`amenity-${amenity.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {selectedAmenities.includes(amenity) && (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          )}
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FormLabel className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Property Highlights (up to 6)
                    </FormLabel>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="e.g., Newly renovated kitchen"
                        value={newHighlight}
                        onChange={(e) => setNewHighlight(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addHighlight())}
                        data-testid="input-highlight"
                      />
                      <Button type="button" variant="outline" size="icon" onClick={addHighlight} disabled={highlights.length >= 6}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {highlights.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {highlights.map((highlight, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {highlight}
                            <button type="button" onClick={() => removeHighlight(index)}>
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the property in detail. Include unique features, recent upgrades, neighborhood highlights, and what makes this property special..."
                            className="min-h-[120px]"
                            {...field}
                            data-testid="textarea-description"
                          />
                        </FormControl>
                        <FormDescription>
                          A compelling description helps attract buyers
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormSection>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep} data-testid="button-listing-next-3">
                    Next: Media & Contact
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <PhotoUploadSection
                  images={imageUrls}
                  onImagesChange={setImageUrls}
                  maxImages={15}
                  label="Property Photos"
                  description="Add up to 15 high-quality photos of the property"
                />

                <FormSection
                  icon={<Video className="w-5 h-5" />}
                  title="Virtual Tour"
                  description="Add a virtual tour or video link"
                >
                  <FormField
                    control={form.control}
                    name="virtualTourUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Virtual Tour URL</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="https://..." 
                            data-testid="input-virtual-tour"
                          />
                        </FormControl>
                        <FormDescription>
                          Link to Matterport, YouTube, or other virtual tour
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </FormSection>

                <FormSection
                  icon={<Key className="w-5 h-5" />}
                  title="Showing Information"
                  description="Instructions for property access"
                >
                  <FieldGroup>
                    <FormField
                      control={form.control}
                      name="showingInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Showing Instructions</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="e.g., Call listing agent 24 hours in advance..."
                              className="min-h-[80px]"
                              data-testid="textarea-showing-instructions"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lockboxCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lockbox Code (Private)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Code"
                              type="password"
                              data-testid="input-lockbox"
                            />
                          </FormControl>
                          <FormDescription>
                            Only visible to verified agents
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <FormField
                      control={form.control}
                      name="openHouseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Open House Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field} 
                              data-testid="input-open-house-date"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="openHouseTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Open House Time</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g., 1:00 PM - 4:00 PM"
                              data-testid="input-open-house-time"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </FieldGroup>
                </FormSection>

                <FormSection
                  icon={<User className="w-5 h-5" />}
                  title="Agent Contact"
                  description="Your contact information for inquiries"
                >
                  <FieldGroup columns={3}>
                    <FormField
                      control={form.control}
                      name="agentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agent Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input 
                                {...field} 
                                className="pl-9"
                                placeholder="Your name"
                                data-testid="input-agent-name"
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="agentPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input 
                                {...field} 
                                className="pl-9"
                                placeholder="(555) 123-4567"
                                data-testid="input-agent-phone"
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="agentEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input 
                                {...field} 
                                className="pl-9"
                                placeholder="agent@example.com"
                                data-testid="input-agent-email"
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </FieldGroup>
                </FormSection>

                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Listing Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">List Price</p>
                      <p className="font-semibold">{formatCurrency(form.watch("listPrice") || 0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Property Type</p>
                      <p className="font-semibold">
                        {PROPERTY_TYPES.find(t => t.value === form.watch("propertyType"))?.label || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Beds/Baths</p>
                      <p className="font-semibold">
                        {form.watch("bedrooms") || "—"} / {form.watch("bathrooms") || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Square Feet</p>
                      <p className="font-semibold">
                        {form.watch("sqft") ? form.watch("sqft")?.toLocaleString() : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amenities</p>
                      <p className="font-semibold">{selectedAmenities.length} selected</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Highlights</p>
                      <p className="font-semibold">{highlights.length} added</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Photos</p>
                      <p className="font-semibold">{imageUrls.length} uploaded</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-semibold">{form.watch("city") || "—"}, {form.watch("state") || "—"}</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between pt-6 border-t">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-listing">
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editMode ? "Updating..." : "Submitting..."}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {editMode ? "Update Listing" : "Submit Listing"}
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
