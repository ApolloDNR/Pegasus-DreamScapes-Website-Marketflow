import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Clock3, FileSearch, Loader2, Route, ShieldCheck } from "lucide-react";
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
import { ComplianceNote, ProcessRail, SectionIntro, SplitHero } from "@/components/site-visuals";

const submitSchema = z.object({
  propertyAddress: z.string().min(5, "Address required"),
  propertyType: z.enum(["sfr", "duplex", "multifamily", "land", "mixed", "other"]),
  condition: z.enum(["turnkey", "light", "moderate", "heavy", "teardown", "unknown"]),
  intent: z.enum([
    "property",
    "sell",
    "offer",
    "listing",
    "adu",
    "deal-jv",
    "explore",
    "calculator",
    "calculator-arv",
    "snapshot",
    "snapshot-acquisition",
    "strategy-review",
  ]),
  timeline: z.enum(["asap", "30-60", "60-90", "exploratory"]),
  situation: z.string().min(20, "Tell us a little more. At least a couple sentences."),
  name: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone required"),
  hp_company: z.string().max(0, "spam").optional().or(z.literal("")),
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
  property: "I have a complex property situation",
  sell: "I want to sell and need the best path",
  offer: "I want Pegasus to review a possible acquisition or offer",
  listing: "I may want Apollo to represent the listing",
  adu: "I have an ADU, rehab, or value-add scope",
  "deal-jv": "Wholesale, assignment, JV, or partner opportunity",
  explore: "I am exploring options and need guidance",
  calculator: "I ran numbers and want a human read",
  "calculator-arv": "I ran an ARV read and want Pegasus to review it",
  snapshot: "I am following up from a Strategy Snapshot",
  "snapshot-acquisition": "My Snapshot points toward a possible Pegasus review",
  "strategy-review": "I want a deeper written operator review scoped",
};

const reviewSequence = [
  {
    label: "Intake",
    title: "Capture the property and the pressure.",
    body: "The address matters, but the situation is what sharpens the read: timeline, condition, role, documents, and constraints.",
    icon: FileSearch,
  },
  {
    label: "Review",
    title: "Separate facts from noise.",
    body: "Pegasus reads the as-is state, stabilized path, possible upside, and the risks that could kill the deal.",
    icon: ShieldCheck,
  },
  {
    label: "Route",
    title: "Move to the correct lane.",
    body: "The answer may be acquisition, development, representation, JV, referral, MarketFlow, or a clean pass.",
    icon: Route,
  },
];

function useInitialIntent(): SubmitFormValues["intent"] {
  if (typeof window === "undefined") return "property";
  const raw = new URLSearchParams(window.location.search).get("intent");
  const allowed: SubmitFormValues["intent"][] = [
    "property",
    "sell",
    "offer",
    "listing",
    "adu",
    "deal-jv",
    "explore",
    "calculator",
    "calculator-arv",
    "snapshot",
    "snapshot-acquisition",
    "strategy-review",
  ];
  return (allowed as string[]).includes(raw || "") ? (raw as SubmitFormValues["intent"]) : "property";
}

export default function SubmitPage() {
  useSEO({
    title: "Submit a Property",
    description:
      "Submit a property to Pegasus Dreamscapes for a serious strategy review. Every property gets a path. Not every property gets an offer.",
    image: "/og/submit.png",
  });

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
        <div className="mx-auto max-w-4xl px-6 lg:px-12">
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
    <div className="min-h-screen bg-background">
      <SplitHero
        eyebrow="Submit a Property"
        title={
          <>
            Bring the situation.
            <span className="block pt-2 italic text-[#D4B483]">Pegasus will read the path.</span>
          </>
        }
        subtitle="This is the intake door for property owners, agents, wholesalers, operators, and referral partners."
        body="A serious submission does not need to be polished. It needs enough truth for Pegasus to understand whether the right lane is acquisition, listing representation, development, MarketFlow routing, partnership, or a disciplined pass."
        primaryCta={{ label: "Start the Intake", href: "#property-intake" }}
        secondaryCta={{ label: "Use Strategy Lab", href: "/strategy-lab" }}
        visual="submit"
        visualTitle="Intake packet"
        visualCaption="The form is structured like an operating packet: property facts, situation context, contact path, consent, then human review."
        labels={[
          { label: "Fields", value: "Intent first" },
          { label: "Review", value: "Human" },
          { label: "Output", value: "Route" },
        ]}
      />

      <section id="property-intake" className="py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:px-12">
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionIntro
                eyebrow="Review sequence"
                title="A better answer starts with a better intake."
                body="The professional posture is review first, route second, commitment only after the facts support it."
              />
              <div className="mt-8">
                <ProcessRail items={reviewSequence} />
              </div>
              <div className="mt-6">
                <ComplianceNote>
                  The Strategy Review is preliminary. It is not an offer, appraisal, valuation, financing commitment, legal advice, tax advice, securities advice, or guaranteed result.
                </ComplianceNote>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-7">
            <div className="rounded-md border border-border bg-card p-6 shadow-[0_24px_70px_-48px_hsl(var(--navy)/0.55)] sm:p-8 lg:p-10">
              <div className="mb-10 border-b border-border pb-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-sm border border-primary/25 bg-primary/10 text-primary">
                  <Clock3 className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-xs font-semibold uppercase text-primary">Pegasus HQ Intake</p>
                <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight">Property Strategy Review</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Give the team the useful facts. If something is unknown, say that plainly.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-12">
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
                    <div className="grid gap-5 sm:grid-cols-2">
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
                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="intent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What outcome are you looking for?</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-submit-intent">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(INTENT_LABELS).map(([key, value]) => (
                                  <SelectItem key={key} value={key}>
                                    {value}
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
                                <SelectItem value="30-60">Next 30-60 days</SelectItem>
                                <SelectItem value="60-90">Next 60-90 days</SelectItem>
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
                          placeholder="Tell us the real situation: owner pressure, distress, deferred maintenance, agent involvement, title issues, renovation scope, asking price, offer deadline, or what kind of help you want."
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
                    <div className="grid gap-5 sm:grid-cols-2">
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
                        <FormItem className="flex items-start gap-3 rounded-md border border-border bg-background p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value === true}
                              onCheckedChange={(value) => field.onChange(value === true ? true : false)}
                              data-testid="checkbox-submit-consent"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-snug">
                            <FormLabel className="text-sm font-normal text-foreground">
                              I understand Pegasus Dreamscapes will review this submission and may contact me by phone, text, or email about the property. I understand the review is preliminary, is not an offer, and does not commit Pegasus or me to a transaction. I can withdraw at any time.
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
                    className="h-12 w-full rounded-sm bg-primary px-8 text-xs font-semibold uppercase text-primary-foreground hover:bg-primary/90 sm:w-auto"
                    data-testid="button-submit-submit"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit for Review"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
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
        <p className="mb-1 text-xs font-semibold uppercase text-primary">{title}</p>
        <p className="font-serif text-2xl text-foreground">{subtitle}</p>
      </legend>
      {children}
    </fieldset>
  );
}
