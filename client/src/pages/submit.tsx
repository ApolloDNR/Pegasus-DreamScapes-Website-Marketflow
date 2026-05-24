import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSEO } from "@/hooks/use-seo";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { trackEvent } from "@/lib/analytics";
import { SuccessView } from "@/components/success-view";
import { Loader2 } from "lucide-react";

// Empire Doctrine v1.0.1 — canonical submission page.
// Three groups: Property / Situation / Contact.
// Intent prefill via ?intent=deal-jv|property|adu|sell.
// Server-side spam check: honeypot ("hp_company") + time-on-form (>3s).

const submitSchema = z.object({
  // Property
  propertyAddress: z.string().min(5, "Address required"),
  propertyType: z.enum(["sfr", "duplex", "multifamily", "land", "mixed", "other"]),
  condition: z.enum(["turnkey", "light", "moderate", "heavy", "teardown", "unknown"]),
  // Situation
  intent: z.enum(["sell", "property", "adu", "deal-jv", "explore"]),
  timeline: z.enum(["asap", "30-60", "60-90", "exploratory"]),
  situation: z.string().min(20, "Tell us a little more. At least a couple sentences."),
  // Contact
  name: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone required"),
  // Spam controls
  hp_company: z.string().max(0, "spam").optional().or(z.literal("")),
  // Consent (verbatim copy — see render below).
  consent: z.literal(true, {
    errorMap: () => ({ message: "Required to submit" }),
  }),
});

type SubmitFormValues = z.infer<typeof submitSchema>;
type HqIntakeReceipt = {
  hqIntake?: {
    reference?: string;
    statusUrl?: string;
  };
};

const INTENT_LABELS: Record<SubmitFormValues["intent"], string> = {
  sell: "I want to sell a property",
  property: "I have a complex property situation",
  adu: "ADU or value-add scope",
  "deal-jv": "Wholesale deal or JV opportunity",
  explore: "Exploring options",
};

function useInitialIntent(): SubmitFormValues["intent"] {
  if (typeof window === "undefined") return "property";
  const raw = new URLSearchParams(window.location.search).get("intent");
  const allowed: SubmitFormValues["intent"][] = ["sell", "property", "adu", "deal-jv", "explore"];
  return (allowed as string[]).includes(raw || "") ? (raw as SubmitFormValues["intent"]) : "property";
}

export default function SubmitPage() {
  useSEO({
    title: "Submit a Property",
    description:
      "Submit a property to Pegasus DreamScapes. Every property gets a path. Apollo reviews every serious submission. No pressure.",
    image: "/og/submit.png",
  });

  // Brief §11 analytics — fire `submit_opened` once on mount (consent-gated).
  useEffect(() => {
    trackEvent("submit_opened", { intent: useInitialIntent() });
  }, []);

  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [hqReceipt, setHqReceipt] = useState<HqIntakeReceipt | null>(null);
  const formMountedAt = useRef<number>(Date.now());
  const initialIntent = useMemo(() => useInitialIntent(), []);

  const form = useForm<SubmitFormValues>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      propertyAddress: "",
      propertyType: "sfr",
      condition: "moderate",
      intent: initialIntent,
      timeline: "exploratory",
      situation: "",
      name: "",
      email: "",
      phone: "",
      hp_company: "",
      consent: undefined as unknown as true,
    },
  });

  useEffect(() => {
    formMountedAt.current = Date.now();
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: SubmitFormValues) => {
      const elapsedMs = Date.now() - formMountedAt.current;
      if (elapsedMs < 3000) {
        // Time-on-form check — instant submits are likely bots.
        throw new Error("Form submitted too fast. Please try again.");
      }
      const [first, ...rest] = data.name.split(" ");
      const payload = {
        leadType: "submit",
        source: "submit_page",
        firstName: first || "",
        lastName: rest.join(" "),
        email: data.email,
        phone: data.phone,
        address: data.propertyAddress,
        leadData: {
          intent: data.intent,
          propertyType: data.propertyType,
          condition: data.condition,
          timeline: data.timeline,
          situation: data.situation,
          consent: true,
          hp_company: data.hp_company || "",
          ts_mounted_at: formMountedAt.current,
          ts_elapsed_ms: elapsedMs,
        },
      };
      const response = await apiRequest("POST", "/api/leads", payload);
      return (await response.json()) as HqIntakeReceipt;
    },
    onSuccess: (receipt) => {
      // Brief §11 analytics — submit lifecycle complete.
      trackEvent("submit_completed", { intent: form.getValues("intent") });
      setHqReceipt(receipt);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (err: Error) => {
      toast({
        title: "Submission failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <SuccessView
            formType="submit"
            referenceTag={hqReceipt?.hqIntake?.reference ?? form.getValues("intent")}
            statusUrl={hqReceipt?.hqIntake?.statusUrl}
            onAddAnother={() => {
              form.reset({
                propertyAddress: "",
                propertyType: "sfr",
                condition: "moderate",
                intent: initialIntent,
                timeline: "exploratory",
                situation: "",
                name: "",
                email: "",
                phone: "",
                hp_company: "",
                consent: undefined as unknown as true,
              });
              setHqReceipt(null);
              formMountedAt.current = Date.now();
              setSubmitted(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <section className="bg-[hsl(var(--charcoal))] text-cream">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16">
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-6">
            Submit a Property
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-white leading-tight mb-6">
            Bring us the situation.
          </h1>
          <p className="font-serif text-xl text-white/85 italic leading-snug max-w-2xl">
            Apollo reviews every serious submission himself. You will get a real answer.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 lg:px-12 py-16">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-12">
            {/* Honeypot — hidden field. Real users never see or fill it. */}
            <div className="hidden" aria-hidden="true">
              <label>
                Company (do not fill)
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  {...form.register("hp_company")}
                />
              </label>
            </div>

            <FormGroup title="Property" subtitle="Where is the property?">
              <FormField
                control={form.control}
                name="propertyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123 Example Dr, Pleasant Hill, CA" data-testid="input-submit-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid sm:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-submit-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sfr">Single-family residence</SelectItem>
                          <SelectItem value="duplex">Duplex / triplex</SelectItem>
                          <SelectItem value="multifamily">Multifamily (4+)</SelectItem>
                          <SelectItem value="land">Land / lot</SelectItem>
                          <SelectItem value="mixed">Mixed-use</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-submit-condition">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="turnkey">Turnkey</SelectItem>
                          <SelectItem value="light">Light cosmetic</SelectItem>
                          <SelectItem value="moderate">Moderate rehab</SelectItem>
                          <SelectItem value="heavy">Heavy rehab</SelectItem>
                          <SelectItem value="teardown">Teardown</SelectItem>
                          <SelectItem value="unknown">Not sure</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormGroup>

            <FormGroup title="Situation" subtitle="What is going on?">
              <div className="grid sm:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="intent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What brought you here?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-submit-intent">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(INTENT_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
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
                      <FormLabel>Timeline</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-submit-timeline">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="asap">As soon as possible</SelectItem>
                          <SelectItem value="30-60">Next 30–60 days</SelectItem>
                          <SelectItem value="60-90">Next 60–90 days</SelectItem>
                          <SelectItem value="exploratory">Exploring options</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="situation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tell us about the situation</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={5}
                        placeholder="Owner-occupant, distressed sale, deferred maintenance, partnership dispute, capital constraint. Whatever you know. The more context, the sharper the review."
                        data-testid="textarea-submit-situation"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormGroup>

            <FormGroup title="Contact" subtitle="How do we reach you?">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-submit-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid sm:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} data-testid="input-submit-email" />
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
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} data-testid="input-submit-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="consent"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3 rounded-md border border-border bg-card p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={(v) => field.onChange(v === true ? true : false)}
                        data-testid="checkbox-submit-consent"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-snug">
                      <FormLabel className="text-sm font-normal text-foreground">
                        I understand Pegasus DreamScapes will review this submission and may
                        contact me by phone, text, or email about the property. I understand the
                        review is preliminary, is not an offer, and does not commit Pegasus or me
                        to a transaction. I can withdraw at any time.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </FormGroup>

            <Button
              type="submit"
              size="lg"
              disabled={mutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] uppercase tracking-[0.18em] font-semibold px-8 h-12 rounded-sm w-full sm:w-auto"
              data-testid="button-submit-submit"
            >
              {mutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</>
              ) : (
                "Submit for Review"
              )}
            </Button>
          </form>
        </Form>
      </section>
    </div>
  );
}

function FormGroup({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-5">
      <legend className="mb-2">
        <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-1">
          {title}
        </p>
        <p className="font-serif text-2xl text-foreground">{subtitle}</p>
      </legend>
      {children}
    </fieldset>
  );
}

