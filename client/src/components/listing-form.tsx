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
  Image,
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
  condition: z.string().optional(),
  renovationYear: optionalNumber,
  amenities: z.array(z.string()).optional(),
  hoa: optionalNumber,
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  showingInstructions: z.string().optional(),
  lockboxCode: z.string().optional(),
  occupancyStatus: z.string().optional(),
  availableDate: z.string().optional(),
  agentName: z.string().optional(),
  agentPhone: z.string().optional(),
  agentEmail: z.string().email().optional().or(z.literal("")),
  virtualTourUrl: z.string().optional(),
});

type ListingFormData = z.infer<typeof listingFormSchema>;

const PROPERTY_TYPES = [
  { value: "single_family", label: "Single Family" },
  { value: "multi_family", label: "Multi-Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
];

const LISTING_TYPES = [
  { value: "on_market", label: "On Market" },
  { value: "off_market", label: "Off Market" },
];

const CONDITIONS = [
  { value: "move_in_ready", label: "Move-In Ready" },
  { value: "needs_minor_updates", label: "Needs Minor Updates" },
  { value: "needs_renovation", label: "Needs Renovation" },
];

const OCCUPANCY_STATUS = [
  { value: "vacant", label: "Vacant" },
  { value: "owner_occupied", label: "Owner Occupied" },
  { value: "tenant_occupied", label: "Tenant Occupied" },
];

const AMENITIES_OPTIONS = [
  "Pool", "Garage", "Fireplace", "Central AC", "Hardwood Floors",
  "Updated Kitchen", "Updated Bathrooms", "Basement", "Attic", "Fenced Yard"
];

interface ListingFormProps {
  onSuccess?: () => void;
  editMode?: boolean;
  initialData?: Partial<ListingFormData> & { id?: number };
}

export function ListingForm({ onSuccess, editMode = false, initialData }: ListingFormProps) {
  const [step, setStep] = useState(1);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialData?.amenities || []);
  const [highlights, setHighlights] = useState<string[]>(initialData?.highlights || []);
  const [newHighlight, setNewHighlight] = useState("");
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
      condition: initialData?.condition || "",
      renovationYear: initialData?.renovationYear,
      amenities: initialData?.amenities || [],
      hoa: initialData?.hoa,
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
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      const payload = { ...data, amenities: selectedAmenities, highlights };
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
    if (newHighlight.trim() && highlights.length < 5) {
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

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            {editMode ? "Edit Listing" : "Create New Listing"}
          </CardTitle>
          <Badge variant="outline">Step {step} of {totalSteps}</Badge>
        </div>
        <div className="flex gap-1 mt-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${
                i + 1 <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Property Location
                </h3>
                
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
                          placeholder="Enter property address"
                          data-testid="input-property-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Home className="w-4 h-4 text-primary" />
                  Property Details
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-property-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROPERTY_TYPES.map(type => (
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
                    name="listingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Listing Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-listing-type">
                              <SelectValue placeholder="Select type" />
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
                </div>

                <div className="grid grid-cols-3 gap-4">
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
                            onChange={e => field.onChange(e.target.value)}
                            placeholder="Beds"
                            data-testid="input-bedrooms"
                          />
                        </FormControl>
                        <FormMessage />
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
                          <Input {...field} placeholder="Baths" data-testid="input-bathrooms" />
                        </FormControl>
                        <FormMessage />
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
                            onChange={e => field.onChange(e.target.value)}
                            placeholder="Sqft"
                            data-testid="input-sqft"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                            onChange={e => field.onChange(e.target.value)}
                            placeholder="Year"
                            data-testid="input-year-built"
                          />
                        </FormControl>
                        <FormMessage />
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Pricing & Features
                </h3>

                <div className="grid grid-cols-2 gap-4">
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
                              onChange={e => field.onChange(e.target.value)}
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
                        <FormLabel>Monthly HOA (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value ?? ""} 
                              onChange={e => field.onChange(e.target.value)}
                              className="pl-9"
                              placeholder="0"
                              data-testid="input-hoa"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                  <FormLabel>Property Highlights (up to 5)</FormLabel>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newHighlight}
                      onChange={e => setNewHighlight(e.target.value)}
                      placeholder="Add a highlight"
                      onKeyPress={e => e.key === "Enter" && (e.preventDefault(), addHighlight())}
                      data-testid="input-highlight"
                    />
                    <Button type="button" size="icon" onClick={addHighlight} disabled={highlights.length >= 5}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {highlights.map((h, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {h}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeHighlight(i)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe the property..."
                          className="min-h-[100px]"
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Showing & Contact
                </h3>

                <FormField
                  control={form.control}
                  name="occupancyStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupancy Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-occupancy">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {OCCUPANCY_STATUS.map(s => (
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

                <FormField
                  control={form.control}
                  name="showingInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Showing Instructions</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Instructions for scheduling and conducting showings..."
                          data-testid="input-showing-instructions"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="lockboxCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lockbox Code (Private)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Code" type="password" data-testid="input-lockbox" />
                        </FormControl>
                        <FormDescription>Only visible to authorized agents</FormDescription>
                        <FormMessage />
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
                          <Input type="date" {...field} data-testid="input-available-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <h4 className="font-medium pt-4">Contact Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="agentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Name" data-testid="input-agent-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="agentPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent Phone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Phone" data-testid="input-agent-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="agentEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent Email</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Email" type="email" data-testid="input-agent-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="virtualTourUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Virtual Tour URL (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." data-testid="input-virtual-tour" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
                data-testid="button-prev"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {step < totalSteps ? (
                <Button type="button" onClick={nextStep} data-testid="button-next">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  data-testid="button-submit"
                >
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
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
