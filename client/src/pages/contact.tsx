import { useState } from "react";
import { useSEO } from "@/hooks/use-seo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { insertContactSchema, type InsertContact, type InsertLead } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { Mail, MapPin, Clock, CheckCircle2, Loader2 } from "lucide-react";
import {
  Section,
  Kicker,
  DisplayHeading,
  Reveal,
  CTAButton,
} from "@/components/brand/atoms";
import { PegasusWatermark } from "@/components/brand/pegasus-mark";

const contactFormSchema = insertContactSchema.extend({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Please add a subject"),
  message: z.string().min(10, "Please add a bit more detail"),
});

const SUBJECT_PRESETS: Record<string, { label: string; preset: string }> = {
  partnership: { label: "Strategic Partnership", preset: "Partnership inquiry" },
  partner: { label: "Strategic Partnership", preset: "Partnership inquiry" },
  buyer: { label: "Buy a Pegasus Home", preset: "Interested in a renovated home" },
  contractor: { label: "Contractor & Trades", preset: "Contractor / trade introduction" },
  development: { label: "Development Project", preset: "Development project inquiry" },
  investments: { label: "Investments / Capital", preset: "Investment partnership inquiry" },
  systems: { label: "Pegasus Systems", preset: "Pegasus Systems inquiry" },
  "marketflow-access": {
    label: "MarketFlow Beta Access",
    preset: "Request MarketFlow beta access",
  },
};

function useSubjectPreset(): { label?: string; preset?: string } {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const subject = params.get("subject");
  if (!subject) return {};
  return SUBJECT_PRESETS[subject] ?? {};
}

export default function Contact() {
  useSEO({
    title: "Contact",
    description:
      "Submit a property, send a deal, request MarketFlow access, or open a partnership conversation with Pegasus Dreamscapes. Real messages get real responses.",
  });

  return (
    <div className="bg-background">
      <Hero />
      <ContactSection />
    </div>
  );
}

function Hero() {
  const { label } = useSubjectPreset();
  return (
    <Section variant="hero" className="overflow-hidden">
      <div className="absolute inset-0 bg-architect opacity-[0.16]" aria-hidden />
      <PegasusWatermark className="pointer-events-none absolute -right-24 top-12 h-[420px] w-[700px] opacity-25" />
      <div className="container-premium relative pt-36 pb-16 md:pt-44 md:pb-20">
        <Reveal>
          <Kicker>{label ?? "Contact Pegasus"}</Kicker>
        </Reveal>
        <Reveal delay={80}>
          <DisplayHeading
            as="h1"
            className="mt-6 max-w-3xl text-[44px] sm:text-[58px] md:text-[68px]"
          >
            Real messages get real responses.
          </DisplayHeading>
        </Reveal>
        <Reveal delay={140}>
          <p className="lead mt-8 max-w-2xl">
            Submit a property, send a deal, request MarketFlow access, or open
            a partnership conversation. Every channel is reviewed seriously —
            we'd rather move slowly on the right relationship than quickly on
            the wrong one.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

function ContactSection() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const { preset } = useSubjectPreset();

  const form = useForm<InsertContact>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: preset ?? "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const nameParts = data.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const unifiedLead: Partial<InsertLead> = {
        leadType: "contact",
        source: "contact_page",
        firstName,
        lastName,
        email: data.email,
        phone: data.phone || undefined,
        leadData: { subject: data.subject, message: data.message },
        notes: data.message,
      };
      return apiRequest("POST", "/api/leads", unifiedLead);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Message sent",
        description: "We'll be in touch shortly.",
      });
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "Please try again, or email hello@pegasusdreamscapes.com directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContact) => mutation.mutate(data);

  const inputCls =
    "w-full bg-muted/50 border border-copper/20 rounded-sm px-4 py-3 text-[14.5px] text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-copper focus:ring-1 focus:ring-copper/40";

  return (
    <Section variant="canvas">
      <div className="container-premium pb-24 md:pb-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Side */}
          <Reveal className="lg:col-span-5">
            <Kicker>Direct Channels</Kicker>
            <DisplayHeading className="mt-4 text-3xl md:text-4xl">
              Open a conversation with Pegasus.
            </DisplayHeading>
            <p className="lead mt-6">
              Use the form, or write directly. We read everything.
            </p>

            <ul className="mt-10 space-y-6">
              <li className="flex items-start gap-4 border-l border-copper/30 pl-5">
                <Mail className="mt-1 h-4 w-4 text-copper" />
                <div>
                  <p className="kicker text-copper/80">Email</p>
                  <a
                    href="mailto:hello@pegasusdreamscapes.com"
                    className="mt-1 block text-[15px] text-foreground hover:text-copper"
                  >
                    hello@pegasusdreamscapes.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4 border-l border-copper/30 pl-5">
                <MapPin className="mt-1 h-4 w-4 text-copper" />
                <div>
                  <p className="kicker text-copper/80">Office</p>
                  <p className="mt-1 text-[15px] text-foreground">East Bay, California</p>
                </div>
              </li>
              <li className="flex items-start gap-4 border-l border-copper/30 pl-5">
                <Clock className="mt-1 h-4 w-4 text-copper" />
                <div>
                  <p className="kicker text-copper/80">Response</p>
                  <p className="mt-1 text-[15px] text-foreground">
                    We typically respond within 1–2 business days.
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-12 grid gap-3">
              <CTAButton href="/sell" variant="ghost">Submit a Property</CTAButton>
              <CTAButton href="/submit-deal" variant="ghost">Submit a Deal</CTAButton>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal delay={120} className="lg:col-span-7">
            <div className="rounded-sm border border-copper/25 bg-card p-8 md:p-10">
              {submitted ? (
                <div className="py-8 text-center">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm border border-copper/40 text-copper">
                    <CheckCircle2 className="h-6 w-6" />
                  </span>
                  <h3 className="font-display mt-6 text-3xl text-foreground">
                    Message received.
                  </h3>
                  <p className="lead mt-4">
                    Thanks for reaching out. We'll review and follow up
                    personally within a few business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <Kicker>Send a Message</Kicker>
                  <h3 className="font-display text-2xl text-foreground md:text-3xl">
                    Tell us what you're working on.
                  </h3>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="kicker text-copper/80">Name</label>
                      <input
                        {...form.register("name")}
                        className={`${inputCls} mt-2`}
                        placeholder="Full name"
                        data-testid="input-contact-name"
                      />
                      {form.formState.errors.name && (
                        <p className="mt-1.5 text-[12px] text-destructive">
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="kicker text-copper/80">Email</label>
                      <input
                        type="email"
                        {...form.register("email")}
                        className={`${inputCls} mt-2`}
                        placeholder="you@email.com"
                        data-testid="input-contact-email"
                      />
                      {form.formState.errors.email && (
                        <p className="mt-1.5 text-[12px] text-destructive">
                          {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="kicker text-copper/80">Phone (optional)</label>
                      <input
                        {...form.register("phone")}
                        className={`${inputCls} mt-2`}
                        placeholder="Best phone number"
                        data-testid="input-contact-phone"
                      />
                    </div>
                    <div>
                      <label className="kicker text-copper/80">Subject</label>
                      <input
                        {...form.register("subject")}
                        className={`${inputCls} mt-2`}
                        placeholder="What's this about?"
                        data-testid="input-contact-subject"
                      />
                      {form.formState.errors.subject && (
                        <p className="mt-1.5 text-[12px] text-destructive">
                          {form.formState.errors.subject.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="kicker text-copper/80">Message</label>
                    <textarea
                      rows={6}
                      {...form.register("message")}
                      className={`${inputCls} mt-2 resize-y`}
                      placeholder="Tell us about the property, the deal, the partnership, or the question."
                      data-testid="input-contact-message"
                    />
                    {form.formState.errors.message && (
                      <p className="mt-1.5 text-[12px] text-destructive">
                        {form.formState.errors.message.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
                      Your information is reviewed personally. No spam, ever.
                    </p>
                    <button
                      type="submit"
                      disabled={mutation.isPending}
                      className="btn-copper disabled:cursor-not-allowed disabled:opacity-60"
                      data-testid="button-contact-submit"
                    >
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
