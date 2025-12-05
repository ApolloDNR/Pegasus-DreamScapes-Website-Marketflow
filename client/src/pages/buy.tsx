import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { insertBuyerLeadSchema, type InsertBuyerLead, type InsertLead } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { 
  Home,
  Search,
  CheckCircle,
  DollarSign,
  Shield,
  Clock,
  Target,
  ArrowRight,
  Loader2,
  Key,
  Hammer,
  Building2
} from "lucide-react";

export default function Buy() {
  return (
    <div className="min-h-screen pt-20">
      <HeroSection />
      <PropertyTypesSection />
      <WhyBuyersChooseUsSection />
      <LeadFormSection />
      <FAQSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="py-20 lg:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" data-testid="text-buy-hero">
          Find Your Next
          <span className="block text-primary">Investment Property</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
          Whether you're looking for a fixer-upper to flip, a turnkey rental, or a wholesale deal, 
          we'll help you find properties that match your investment criteria.
        </p>
        <Button size="lg" className="text-base px-8 py-6" onClick={() => document.getElementById('buyer-form')?.scrollIntoView({ behavior: 'smooth' })} data-testid="button-join-buyer-list">
          Join Our Buyer List
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </section>
  );
}

function PropertyTypesSection() {
  const propertyTypes = [
    {
      icon: Hammer,
      step: "01",
      title: "Wholesale Deals",
      description: "Off-market properties under contract at deep discounts. Perfect for flippers and investors.",
    },
    {
      icon: Home,
      step: "02",
      title: "Renovated Flips",
      description: "Move-in ready homes with modern finishes. Great for retail buyers or turnkey rentals.",
    },
    {
      icon: Building2,
      step: "03",
      title: "Multi-Family",
      description: "Duplexes to apartment buildings. Build your portfolio with cash-flowing properties.",
    },
  ];

  return (
    <section className="py-20 lg:py-32 border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wide">Property Types</span>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-2" data-testid="text-property-types">
            What We Offer
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {propertyTypes.map((type, index) => (
            <div key={index} className="relative text-center" data-testid={`step-property-type-${index}`}>
              <div className="text-7xl font-bold text-primary/10 mb-4">{type.step}</div>
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <type.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{type.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{type.description}</p>
              {index < propertyTypes.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyBuyersChooseUsSection() {
  const benefits = [
    { icon: Search, text: "Access to off-market deals" },
    { icon: DollarSign, text: "Transparent pricing & numbers" },
    { icon: Shield, text: "Vetted, quality properties" },
    { icon: Clock, text: "First access to new inventory" },
  ];

  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold" data-testid="text-why-buyers">
            Why Buyers Choose Us
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center hover-elevate transition-all duration-300" data-testid={`card-buyer-benefit-${index}`}>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium">{benefit.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function LeadFormSection() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  
  const form = useForm<InsertBuyerLead>({
    resolver: zodResolver(insertBuyerLeadSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      cityState: "",
      buyerType: "investor",
      propertyTypes: "single-family",
      budgetRange: "100-250k",
      timeline: "1-3-months",
      fundingStatus: "pre-approved",
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertBuyerLead) => {
      const nameParts = data.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const cityStateParts = data.cityState.split(',');
      const city = cityStateParts[0]?.trim() || '';
      const state = cityStateParts[1]?.trim() || '';
      
      const unifiedLead: Partial<InsertLead> = {
        leadType: 'buyer',
        source: 'buy_page',
        firstName,
        lastName,
        email: data.email,
        phone: data.phone,
        city,
        state,
        leadData: {
          buyerType: data.buyerType,
          propertyTypes: data.propertyTypes,
          budgetRange: data.budgetRange,
          timeline: data.timeline,
          fundingStatus: data.fundingStatus,
        },
        notes: data.notes,
      };
      
      const response = await apiRequest("POST", "/api/leads", unifiedLead);
      return response;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "You're on the List!",
        description: "We'll notify you when properties matching your criteria become available.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBuyerLead) => {
    mutation.mutate(data);
  };

  if (submitted) {
    return (
      <section id="buyer-form" className="py-20 lg:py-32 bg-card/50 border-y border-border">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-semibold mb-4" data-testid="text-form-success">You're on the List!</h2>
          <p className="text-muted-foreground text-lg">
            We've added you to our buyer list. When properties matching your criteria become available, 
            you'll be among the first to know.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="buyer-form" className="py-20 lg:py-32 bg-card/50 border-y border-border">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wide">Get Started</span>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-2" data-testid="text-form-title">
            Join Our Buyer List
          </h2>
          <p className="text-muted-foreground mt-4">
            Tell us what you're looking for and we'll notify you when matching properties become available.
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} data-testid="input-buyer-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} data-testid="input-buyer-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} data-testid="input-buyer-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cityState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Market / Area</FormLabel>
                        <FormControl>
                          <Input placeholder="Oakland, CA" {...field} data-testid="input-buyer-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="buyerType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>I Am A...</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-buyer-type">
                              <SelectValue placeholder="Select buyer type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="investor">Real Estate Investor</SelectItem>
                            <SelectItem value="flipper">Flipper</SelectItem>
                            <SelectItem value="landlord">Landlord / Buy & Hold</SelectItem>
                            <SelectItem value="first-time">First-Time Buyer</SelectItem>
                            <SelectItem value="homeowner">Homeowner (Primary Residence)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="propertyTypes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-property-types">
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="single-family">Single Family</SelectItem>
                            <SelectItem value="multi-family">Multi-Family (2-4 units)</SelectItem>
                            <SelectItem value="apartment">Apartment (5+ units)</SelectItem>
                            <SelectItem value="condo">Condo / Townhouse</SelectItem>
                            <SelectItem value="land">Land</SelectItem>
                            <SelectItem value="any">Open to All Types</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="budgetRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Range</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-budget">
                              <SelectValue placeholder="Select budget" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="under-100k">Under $100K</SelectItem>
                            <SelectItem value="100-250k">$100K - $250K</SelectItem>
                            <SelectItem value="250-500k">$250K - $500K</SelectItem>
                            <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                            <SelectItem value="1m-plus">$1M+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeline to Buy</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-timeline">
                              <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="asap">ASAP</SelectItem>
                            <SelectItem value="1-3-months">1-3 Months</SelectItem>
                            <SelectItem value="3-6-months">3-6 Months</SelectItem>
                            <SelectItem value="6-plus-months">6+ Months</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fundingStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funding Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-funding">
                              <SelectValue placeholder="Select funding status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash">Cash Buyer</SelectItem>
                            <SelectItem value="pre-approved">Pre-Approved</SelectItem>
                            <SelectItem value="hard-money">Hard Money / Private Lending</SelectItem>
                            <SelectItem value="needs-financing">Needs Financing</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anything Else We Should Know?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us more about what you're looking for, any specific criteria, or questions you have..."
                          className="min-h-32 resize-none"
                          {...field}
                          value={field.value ?? ""}
                          data-testid="textarea-buyer-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full sm:w-auto"
                  disabled={mutation.isPending}
                  data-testid="button-submit-buyer"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Join Buyer List
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: "What types of properties do you have?",
      answer: "We offer a variety of properties including wholesale deals (deeply discounted, off-market), renovated flips (move-in ready), and multi-family investments. Whether you're a flipper, landlord, or retail buyer, we have options for you.",
    },
    {
      question: "How do wholesale deals work?",
      answer: "Wholesale deals are properties we have under contract at below-market prices. As a buyer, you purchase our contract rights (assignment fee) and close directly with the seller. This allows you to acquire properties at deep discounts.",
    },
    {
      question: "Do I need to be pre-approved?",
      answer: "Pre-approval isn't required to join our buyer list, but it helps us prioritize you for deals. Cash buyers and pre-approved buyers typically get first access to new inventory.",
    },
    {
      question: "How quickly do I need to close?",
      answer: "Timelines vary by property. Wholesale deals typically require 14-30 day closings. Renovated properties are more flexible. We'll always discuss closing expectations upfront.",
    },
    {
      question: "What markets do you cover?",
      answer: "We primarily focus on the San Francisco Bay Area, including Oakland, Berkeley, San Jose, and surrounding cities. We're expanding into additional California markets soon.",
    },
  ];

  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wide">FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-2" data-testid="text-faq-title">
            Frequently Asked Questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6" data-testid={`faq-${index}`}>
              <AccordionTrigger className="text-left font-medium py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
