import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { insertSellerLeadSchema, type InsertSellerLead, type InsertLead } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { 
  MessageSquare, 
  Search, 
  CheckCircle,
  Home,
  Calendar,
  FileText,
  Users,
  ArrowRight,
  Loader2
} from "lucide-react";
import { AddressAutocomplete } from "@/components/address-autocomplete";

const sellerFormSchema = insertSellerLeadSchema.extend({
  name: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  propertyAddress: z.string().min(5, "Please enter the property address"),
});

export default function Sell() {
  return (
    <div className="min-h-screen pt-20">
      <HeroSection />
      <HowItWorksSection />
      <WhySellersSection />
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
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" data-testid="text-sell-hero">
          Need to Sell a Property
          <span className="block text-primary">Fast or As-Is?</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
          We buy houses in any condition and provide clear options so you can choose what's best for you.
        </p>
        <Button size="lg" className="text-base px-8 py-6" onClick={() => document.getElementById('seller-form')?.scrollIntoView({ behavior: 'smooth' })} data-testid="button-request-offer">
          Request an Offer
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      icon: MessageSquare,
      step: "01",
      title: "Tell Us About the Property",
      description: "Share the address, condition, and your timeline.",
    },
    {
      icon: Search,
      step: "02",
      title: "We Analyze & Call You",
      description: "We review comps, repairs, and your goals.",
    },
    {
      icon: CheckCircle,
      step: "03",
      title: "Choose Your Option",
      description: "Direct cash offer, creative solution, or listing plan (once licensed).",
    },
  ];

  return (
    <section className="py-20 lg:py-32 border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wide">The Process</span>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-2" data-testid="text-how-it-works">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center" data-testid={`step-sell-${index}`}>
              <div className="text-7xl font-bold text-primary/10 mb-4">{step.step}</div>
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhySellersSection() {
  const benefits = [
    { icon: Home, text: "No repairs needed." },
    { icon: Calendar, text: "Flexible closing dates." },
    { icon: FileText, text: "Transparent explanation of numbers." },
    { icon: Users, text: "Respectful, no-pressure conversations." },
  ];

  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold" data-testid="text-why-sellers">
            Why Sellers Work With Us
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center hover-elevate transition-all duration-300" data-testid={`card-benefit-${index}`}>
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
  
  const form = useForm<InsertSellerLead>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      propertyAddress: "",
      propertyType: "house",
      condition: "needs-tlc",
      timeline: "30-60-days",
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertSellerLead) => {
      const nameParts = data.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const unifiedLead: Partial<InsertLead> = {
        leadType: 'seller',
        source: 'sell_page',
        firstName,
        lastName,
        email: data.email,
        phone: data.phone,
        address: data.propertyAddress,
        leadData: {
          propertyType: data.propertyType,
          condition: data.condition,
          timeline: data.timeline,
        },
        notes: data.notes,
      };
      
      const response = await apiRequest("POST", "/api/leads", unifiedLead);
      return response;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Property Submitted!",
        description: "We'll review your property and get back to you soon.",
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

  const onSubmit = (data: InsertSellerLead) => {
    mutation.mutate(data);
  };

  if (submitted) {
    return (
      <section id="seller-form" className="py-20 lg:py-32 bg-card/50 border-y border-border">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-semibold mb-4" data-testid="text-form-success">Thank You!</h2>
          <p className="text-muted-foreground text-lg">
            We've received your property information. Our team will review it and reach out to you within 24-48 hours to discuss your options.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="seller-form" className="py-20 lg:py-32 bg-card/50 border-y border-border">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wide">Get Started</span>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-2" data-testid="text-form-title">
            Submit Your Property
          </h2>
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
                          <Input placeholder="John Smith" {...field} data-testid="input-seller-name" />
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
                          <Input placeholder="Your best callback number" {...field} data-testid="input-seller-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} data-testid="input-seller-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          placeholder="Start typing an address..."
                          data-testid="input-seller-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="condo">Condo</SelectItem>
                            <SelectItem value="multi">Multi-Family</SelectItem>
                            <SelectItem value="land">Land</SelectItem>
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
                        <FormLabel>Condition</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-condition">
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="needs-tlc">Needs TLC</SelectItem>
                            <SelectItem value="major-repairs">Major Repairs</SelectItem>
                            <SelectItem value="move-in-ready">Move-in Ready</SelectItem>
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
                        <FormLabel>Timeline to Sell</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-timeline">
                              <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="asap">ASAP</SelectItem>
                            <SelectItem value="30-60-days">30-60 Days</SelectItem>
                            <SelectItem value="3-plus-months">3+ Months</SelectItem>
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
                      <FormLabel>Anything We Should Know?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us more about the property, your situation, or any questions you have..."
                          className="min-h-32 resize-none"
                          {...field}
                          value={field.value ?? ""}
                          data-testid="textarea-seller-notes"
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
                  data-testid="button-submit-property"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Property
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
      question: "Will you list or buy my house?",
      answer: "We offer both options. We can provide a direct cash offer for a quick, hassle-free sale, or once fully licensed, we can list your property on the market to potentially get a higher price. We'll discuss both options with you.",
    },
    {
      question: "Do I have to make repairs?",
      answer: "No! We buy properties in any condition. You don't need to worry about repairs, cleaning, or staging. We handle everything.",
    },
    {
      question: "How fast can you close?",
      answer: "We can close in as little as 7-14 days if you need to sell quickly. However, we're flexible and can work with your timeline—whether that's immediate or a few months out.",
    },
    {
      question: "Are there fees or commissions?",
      answer: "When we buy directly, there are no agent commissions or fees for you. The offer we make is what you receive. If you choose to list with us (once licensed), standard listing fees would apply.",
    },
    {
      question: "What types of properties do you buy?",
      answer: "We buy single-family homes, condos, multi-family properties, and land throughout California. Properties in any condition are welcome.",
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
