import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal } from "@/components/animations";
import { apiRequest } from "@/lib/queryClient";
import { type InsertLead } from "@shared/schema";
import { HeroPicture } from "@/components/hero-picture";
import {
  Hammer,
  HardHat,
  Wrench,
  Building2,
  Briefcase,
  Scale,
  ClipboardCheck,
  ShieldCheck,
  Handshake,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const vendorFormSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  company: z.string().min(2, "Please enter your company name"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(7, "Please enter a contact number"),
  trade: z.string().min(2, "Please specify your trade"),
  serviceArea: z.string().min(2, "Please describe your service area"),
  licenseNumber: z.string().optional(),
  insurance: z.string().min(2, "Please describe your insurance status"),
  typicalProjectSize: z.string().min(2, "Please describe typical project size"),
  availability: z.string().min(2, "Please describe current availability"),
  references: z.string().optional(),
  portfolio: z.string().optional(),
  notes: z.string().optional(),
});

type VendorFormValues = z.infer<typeof vendorFormSchema>;

export default function VendorNetwork() {
  useSEO({
    title: "Vendor Network",
    description:
      "Apply to the Pegasus DreamScapes Corp. private vendor network. Vetted contractors, lenders, agents, and operators routed to active deal flow.",
    image: "https://pegasusdreamscapes.com/og/vendor-network.svg",
  });

  return (
    <div className="min-h-screen">
      <h1 className="sr-only">Pegasus Vendor Network</h1>
      <HeroSection />
      <CategoriesSection />
      <HowToJoinSection />
      <VendorFormSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[55vh] flex items-center overflow-hidden pt-20">
      <motion.div
        className="absolute inset-0 scale-105"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
      >
        <HeroPicture
          alt="Pegasus DreamScapes Vendor Network"
          className="absolute inset-0 w-full h-full object-cover"
          priority
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/85" />

      <div className="relative z-10 w-full py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="h-px w-10 bg-primary" />
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-primary font-semibold font-supporting">
              Private Vendor Network
            </p>
            <div className="h-px w-10 bg-primary" />
          </motion.div>

          <motion.h1
            className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[0.95] tracking-[-0.02em] mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            data-testid="text-vendor-hero"
          >
            Operators we trust.<br />
            <span className="bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
              Routed to real work.
            </span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
          >
            The Pegasus Vendor Network is how we line up the contractors, lenders, agents, and specialists behind every project. Vetted intake, real references, and a private list. Not a public marketplace.
          </motion.p>
        </div>
      </div>
      <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
    </section>
  );
}

const VENDOR_CATEGORIES = [
  {
    icon: HardHat,
    title: "General Contractors",
    desc: "Full-scope GCs for ADUs, flips, and ground-up. License + insurance required.",
  },
  {
    icon: Wrench,
    title: "Trades & Specialists",
    desc: "Electrical, plumbing, HVAC, foundation, roofing, framing, finish carpentry.",
  },
  {
    icon: Hammer,
    title: "Design & Architecture",
    desc: "Designers, drafters, and architects who can move on creative-finance timelines.",
  },
  {
    icon: Building2,
    title: "Lenders & Capital",
    desc: "Hard money, bridge, DSCR, and private lenders with documented terms and history.",
  },
  {
    icon: Briefcase,
    title: "Agents & Brokers",
    desc: "Listing agents and broker partners who understand off-market and complex situations.",
  },
  {
    icon: Scale,
    title: "Title, Legal, & Tax",
    desc: "Title officers, real estate attorneys, 1031 intermediaries, and tax strategists.",
  },
];

function CategoriesSection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Trades We Work With</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            Six lanes. Real standards.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            We keep a short list per trade. Every vendor is referenced, insured where required, and matched to projects we're actively running.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VENDOR_CATEGORIES.map((cat, i) => (
            <motion.div
              key={i}
              className="group h-full p-7 bg-card rounded-lg border border-border/40 hover:border-primary/30 transition-all duration-300"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25 }}
              data-testid={`vendor-category-${i}`}
            >
              <cat.icon className="w-7 h-7 text-primary/70 mb-5 group-hover:text-primary transition-colors" />
              <h3 className="font-serif text-xl font-semibold mb-3 tracking-tight">{cat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{cat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const JOIN_STEPS = [
  {
    icon: ClipboardCheck,
    step: "01",
    title: "Submit your intake",
    desc: "Fill out the application below. We need trade, service area, insurance status, references, and a sense of typical project size.",
  },
  {
    icon: ShieldCheck,
    step: "02",
    title: "Vetting & references",
    desc: "We review credentials, call references, and look at past work. Vendors are flagged Submitted, Under Review, Approved, or Preferred internally.",
  },
  {
    icon: Handshake,
    step: "03",
    title: "Routed to active work",
    desc: "Approved vendors get matched to scopes inside live Pegasus projects. Preferred vendors are first call on the lanes they fit.",
  },
];

function HowToJoinSection() {
  return (
    <section className="py-24 lg:py-32 bg-card border-y border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">How to Join</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            Three steps. No pay-to-play.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            We don't sell directory listings. The list is short on purpose so we can keep the bar high.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {JOIN_STEPS.map((s, i) => (
            <div
              key={i}
              className="relative p-8 bg-background rounded-lg border border-border/40"
              data-testid={`vendor-step-${i}`}
            >
              <p className="font-serif text-6xl text-primary/15 absolute top-4 right-6 leading-none">{s.step}</p>
              <s.icon className="w-7 h-7 text-primary mb-5" />
              <h3 className="font-serif text-xl font-semibold mb-3 tracking-tight">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
          Submitting an application doesn't guarantee approval, placement, or volume. Vendor status is reviewed on an ongoing basis.
        </p>
      </div>
    </section>
  );
}

function VendorFormSection() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      trade: "",
      serviceArea: "",
      licenseNumber: "",
      insurance: "",
      typicalProjectSize: "",
      availability: "",
      references: "",
      portfolio: "",
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: VendorFormValues) => {
      const nameParts = data.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const payload: Partial<InsertLead> = {
        leadType: "vendor",
        source: "vendor_network_page",
        firstName,
        lastName,
        email: data.email,
        phone: data.phone,
        leadData: {
          company: data.company,
          trade: data.trade,
          serviceArea: data.serviceArea,
          licenseNumber: data.licenseNumber,
          insurance: data.insurance,
          typicalProjectSize: data.typicalProjectSize,
          availability: data.availability,
          references: data.references,
          portfolio: data.portfolio,
        },
        notes: data.notes,
      };

      return await apiRequest("POST", "/api/leads", payload);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Application received",
        description: "We'll review and follow up if there's a fit.",
      });
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "Please try again or email apollo@pegasusdreamscapes.com directly.",
        variant: "destructive",
      });
    },
  });

  return (
    <section id="vendor-form" className="py-28 lg:py-36 bg-background scroll-mt-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
            <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">Vendor Intake</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            Apply to be considered.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Real numbers, real references, real availability. The more specific, the faster we can route you.
          </p>
        </ScrollReveal>

        {submitted ? (
          <div className="p-10 lg:p-14 bg-card rounded-2xl border border-border/50 shadow-xl text-center">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-8" />
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">Received</p>
            <h3 className="font-serif text-3xl font-semibold mb-5 tracking-tight" data-testid="text-vendor-success">
              Application in.
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We review every vendor intake by hand. If there's a fit on a current or upcoming scope, we'll reach out directly.
            </p>
            <div className="mt-8">
              <Link href="/projects">
                <Button variant="outline" data-testid="button-vendor-projects">
                  See current projects
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8 lg:p-10 bg-card rounded-2xl border border-border/50 shadow-xl">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="Jane Smith" {...field} data-testid="input-vendor-name" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="company" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl><Input placeholder="Smith Construction Inc." {...field} data-testid="input-vendor-company" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="jane@example.com" {...field} data-testid="input-vendor-email" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl><Input placeholder="Best callback number" {...field} data-testid="input-vendor-phone" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField control={form.control} name="trade" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trade / Specialty</FormLabel>
                      <FormControl><Input placeholder="GC, electrical, lender, agent…" {...field} data-testid="input-vendor-trade" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="serviceArea" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Area</FormLabel>
                      <FormControl><Input placeholder="Counties or cities you cover" {...field} data-testid="input-vendor-area" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField control={form.control} name="licenseNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number (optional)</FormLabel>
                      <FormControl><Input placeholder="CSLB / state license" {...field} value={field.value ?? ""} data-testid="input-vendor-license" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="insurance" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Status</FormLabel>
                      <FormControl><Input placeholder="GL + workers' comp carrier / limits" {...field} data-testid="input-vendor-insurance" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField control={form.control} name="typicalProjectSize" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Typical Project Size</FormLabel>
                      <FormControl><Input placeholder="$ range, sq ft, or scope you handle" {...field} data-testid="input-vendor-project-size" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="availability" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Availability</FormLabel>
                      <FormControl><Input placeholder="Booked through, soonest start, etc." {...field} data-testid="input-vendor-availability" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="references" render={({ field }) => (
                  <FormItem>
                    <FormLabel>References (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="2–3 recent client / GC references with phone or email."
                        className="min-h-24 resize-none"
                        {...field}
                        value={field.value ?? ""}
                        data-testid="textarea-vendor-references"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="portfolio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio / Website (optional)</FormLabel>
                    <FormControl><Input placeholder="Link to past work, photos, or website" {...field} value={field.value ?? ""} data-testid="input-vendor-portfolio" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anything else (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notable strengths, lanes you want to be on, project types you avoid."
                        className="min-h-28 resize-none"
                        {...field}
                        value={field.value ?? ""}
                        data-testid="textarea-vendor-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-sm uppercase tracking-[0.15em] font-semibold py-7"
                  disabled={mutation.isPending}
                  data-testid="button-vendor-submit"
                >
                  {mutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                  ) : (
                    <>Submit Application<ArrowRight className="ml-3 w-4 h-4" /></>
                  )}
                </Button>

                <p className="pt-2 text-[11px] leading-relaxed text-muted-foreground/80 text-center">
                  Vendor Network intake follows the v1.3.1 blueprint, section 14. This is not a hiring guarantee and not an offer of work.
                </p>
              </form>
            </Form>
          </div>
        )}
      </div>
    </section>
  );
}
