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
import {
  ArrowRight,
  Building2,
  Compass,
  Handshake,
  KeyRound,
  Loader2,
  PenLine,
  ShieldCheck,
} from "lucide-react";

// Empire Doctrine v1.0.1 — canonical submission page.
// Three groups: Property / Situation / Contact.
// Intent prefill via ?intent=deal-jv|property|adu|sell|blueprint.
// Server-side spam check: honeypot ("hp_company") + time-on-form (>3s).
// Phase 2 Copy Proposal — Surface 3: intent=blueprint switches the
// payload leadType to "blueprint_request" so Apollo's HQ triage queue
// can route paid-tier Deal Blueprint intakes separately from general
// property submissions. Free property intakes keep leadType "submit".

const submitSchema = z.object({
  // Property
  propertyAddress: z.string().min(5, "Address required"),
  propertyType: z.enum(["sfr", "duplex", "multifamily", "land", "mixed", "other"]),
  condition: z.enum(["turnkey", "light", "moderate", "heavy", "teardown", "unknown"]),
  // Situation
  intent: z.enum(["sell", "property", "adu", "deal-jv", "explore", "blueprint"]),
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

const INTENT_LABELS: Record<SubmitFormValues["intent"], string> = {
  sell: "I want to sell a property",
  property: "I have a complex property situation",
  adu: "ADU or value-add scope",
  "deal-jv": "Wholesale deal or JV opportunity",
  explore: "Exploring options",
  blueprint: "Request a Deal Blueprint",
};

const TIMELINE_LABELS: Record<SubmitFormValues["timeline"], string> = {
  asap: "As soon as possible",
  "30-60": "Next 30 to 60 days",
  "60-90": "Next 60 to 90 days",
  exploratory: "Exploring options",
};

const PROPERTY_TYPE_LABELS: Record<SubmitFormValues["propertyType"], string> = {
  sfr: "Single-family",
  duplex: "Duplex / triplex",
  multifamily: "Multifamily",
  land: "Land / lot",
  mixed: "Mixed-use",
  other: "Other",
};

const CONDITION_LABELS: Record<SubmitFormValues["condition"], string> = {
  turnkey: "Turnkey",
  light: "Light cosmetic",
  moderate: "Moderate rehab",
  heavy: "Heavy rehab",
  teardown: "Teardown",
  unknown: "Not sure",
};

const TRUST_MARKERS = [
  "Listing or acquisition lane",
  "JV and wholesale welcome",
  "No blind offers",
  "DRE #02333658",
  "Equal Housing",
];

const INTAKE_POINTS = [
  "The property facts: address, condition, ownership context, and anything unusual.",
  "The pressure point: repairs, debt, vacancy, inheritance, partner friction, timing, or a clean listing question.",
  "The path you want considered: representation, direct sale, JV, buyer match, development scope, MarketFlow, or Blueprint.",
];

const PARTICIPATION_LANES = [
  { icon: KeyRound, label: "Sell", copy: "Direct acquisition or a clean sale path." },
  { icon: PenLine, label: "List", copy: "Traditional representation when the property belongs on market." },
  { icon: Handshake, label: "JV", copy: "Wholesale, deal finder, or partner-led opportunity." },
  { icon: Building2, label: "Build", copy: "Value-add, ADU, development, or repositioning scope." },
];

const DOCKET_STEPS = [
  { index: "01", label: "Facts", copy: "Address, type, condition, and timing." },
  { index: "02", label: "Pressure", copy: "What needs to be solved and why now." },
  { index: "03", label: "Path", copy: "Represent, sell, JV, build, route, or pass." },
];

function useInitialIntent(): SubmitFormValues["intent"] {
  if (typeof window === "undefined") return "property";
  const raw = new URLSearchParams(window.location.search).get("intent");
  const allowed: SubmitFormValues["intent"][] = ["sell", "property", "adu", "deal-jv", "explore", "blueprint"];
  return (allowed as string[]).includes(raw || "") ? (raw as SubmitFormValues["intent"]) : "property";
}

function useInitialRef(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("ref") || "";
}

function useInitialAddress(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("address") || "";
}

export default function SubmitPage() {
  useSEO({
    title: "Submit a Property",
    description:
      "Submit a property to Pegasus Dreamscapes for acquisition, listing, JV, development, routing, or strategy intake. No blind offers and no pressure.",
    image: "/og/submit.png",
  });

  // Brief §11 analytics — fire `submit_opened` once on mount (consent-gated).
  useEffect(() => {
    trackEvent("submit_opened", { intent: useInitialIntent() });
  }, []);

  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const formMountedAt = useRef<number>(Date.now());
  const initialIntent = useMemo(() => useInitialIntent(), []);
  const initialRef = useMemo(() => useInitialRef(), []);
  const initialAddress = useMemo(() => useInitialAddress(), []);

  const form = useForm<SubmitFormValues>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      propertyAddress: initialAddress,
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
      // Phase 2 Surface 3: route Deal Blueprint intakes through a
      // dedicated leadType so HQ triage can prioritize paid-tier
      // requests separately from free property submissions.
      const resolvedLeadType =
        data.intent === "blueprint" ? "blueprint_request" : "submit";
      const resolvedSource =
        data.intent === "blueprint" ? "blueprint_page" : "submit_page";
      const payload = {
        leadType: resolvedLeadType,
        source: resolvedSource,
        firstName: first || "",
        lastName: rest.join(" "),
        email: data.email,
        phone: data.phone,
        address: data.propertyAddress,
        consentContact: data.consent,
        consentVersion: "submit-property-contact-v1",
        leadData: {
          intent: data.intent,
          propertyType: data.propertyType,
          condition: data.condition,
          timeline: data.timeline,
          situation: data.situation,
          consent: true,
          ref: initialRef || undefined,
          hp_company: data.hp_company || "",
          ts_mounted_at: formMountedAt.current,
          ts_elapsed_ms: elapsedMs,
        },
      };
      return apiRequest("POST", "/api/leads", payload);
    },
    onSuccess: () => {
      // Brief §11 analytics — submit lifecycle complete.
      trackEvent("submit_completed", { intent: form.getValues("intent") });
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

  const propertyAddress = form.watch("propertyAddress");
  const propertyType = form.watch("propertyType");
  const condition = form.watch("condition");
  const intent = form.watch("intent");
  const timeline = form.watch("timeline");
  const situation = form.watch("situation");
  const contactName = form.watch("name");
  const contactEmail = form.watch("email");
  const contactPhone = form.watch("phone");
  const situationLength = situation?.length ?? 0;
  const progressSteps = [
    { label: "Property", complete: (propertyAddress || "").trim().length >= 5 },
    { label: "Situation", complete: situationLength >= 20 },
    {
      label: "Contact",
      complete:
        (contactName || "").trim().length >= 2 &&
        (contactEmail || "").includes("@") &&
        (contactPhone || "").trim().length >= 7,
    },
  ];
  const docketCompleteness = [
    progressSteps[0].complete,
    progressSteps[1].complete,
    (contactName || "").trim().length >= 2,
    (contactEmail || "").includes("@"),
    (contactPhone || "").trim().length >= 7,
  ].filter(Boolean).length;

  if (submitted) {
    return (
      <div className="submit-premium min-h-screen pt-28 pb-20">
        <div className="submit-shell">
          <div className="submit-success-shell">
            <SuccessView
              formType="submit"
              referenceTag={form.getValues("intent")}
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
                formMountedAt.current = Date.now();
                setSubmitted(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-premium min-h-screen pt-24">
      <section className="submit-hero" data-testid="section-submit-hero">
        <div className="submit-shell submit-hero-grid">
          <div className="submit-hero-copy">
            <p className="submit-eyebrow">Pegasus Property Intake</p>
            <h1>
              Send the facts.
              <span> Get the right path.</span>
            </h1>
            <p className="submit-lead">
              Address, condition, pressure, and goal. Pegasus uses the first read to decide whether the right next conversation is representation, acquisition, JV, development, routing, Blueprint, or a clear pass. Intake only. No blind offer.
            </p>
            <div className="submit-hero-actions">
              <a href="#submit-intake" className="submit-primary-link">
                Submit for a Property Read
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="/strategy-lab" className="submit-secondary-link">
                Open Strategy Lab
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            <div className="submit-trust-row" data-testid="submit-trust-row">
              {TRUST_MARKERS.map((marker) => (
                <span key={marker}>{marker}</span>
              ))}
            </div>
          </div>

          <div className="submit-review-desk" aria-label="Pegasus property path note">
            <div className="submit-desk-topline">
              <span>Pegasus intake docket</span>
              <strong>Confidential first read</strong>
            </div>
            <div className="submit-desk-visual" aria-hidden="true">
              <div className="submit-property-frame">
                <span className="submit-roofline" />
                <span className="submit-column submit-column-one" />
                <span className="submit-column submit-column-two" />
                <span className="submit-column submit-column-three" />
                <span className="submit-foundation" />
              </div>
              <div className="submit-lane-strip">
                {PARTICIPATION_LANES.map(({ icon: Icon, label }) => (
                  <span key={label}>
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="submit-desk-sequence" aria-label="Pegasus intake read sequence">
              {DOCKET_STEPS.map((step) => (
                <div key={step.index}>
                  <span>{step.index}</span>
                  <strong>{step.label}</strong>
                  <small>{step.copy}</small>
                </div>
              ))}
            </div>
            <div className="submit-docket-grid">
              <div>
                <span>Address</span>
                <strong>{propertyAddress || "Address pending"}</strong>
              </div>
              <div>
                <span>Starting lane</span>
                <strong>{INTENT_LABELS[intent]}</strong>
              </div>
              <div>
                <span>Property</span>
                <strong>{PROPERTY_TYPE_LABELS[propertyType]} / {CONDITION_LABELS[condition]}</strong>
              </div>
              <div>
                <span>Timeline</span>
                <strong>{TIMELINE_LABELS[timeline]}</strong>
              </div>
            </div>
            <div className="submit-desk-footer">
              <div>
                <span>Docket ready</span>
                <strong>{docketCompleteness} / 5</strong>
              </div>
              <p>Intake only. Any offer, listing, JV, or Blueprint requires a separate written agreement.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="submit-intake" className="submit-form-section" data-testid="section-submit-form">
        <div className="submit-shell submit-form-layout">
          <aside className="submit-intake-brief">
            <p className="submit-eyebrow">What to include</p>
            <h2>Start with the truth of the situation.</h2>
            <p>
              Short is fine. Specific is better. Pegasus needs enough context to decide which path deserves attention and which path should be left alone.
            </p>
            <ul>
              {INTAKE_POINTS.map((point) => (
                <li key={point}>
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </aside>

          <div className="submit-form-card">
            <div className="submit-form-heading">
              <span>
                <Compass className="h-5 w-5" aria-hidden="true" />
                Intake docket
              </span>
              <p>Property, situation, contact. Three minutes if the facts are ready.</p>
            </div>
            <div className="submit-progress" aria-label="Submit property progress">
              <ol>
                {progressSteps.map((step, index) => {
                  const isLast = index === progressSteps.length - 1;
                  return (
                    <li key={step.label} className={isLast ? "is-last" : undefined}>
                      <div className="submit-progress-node">
                        <span className={step.complete ? "is-complete" : undefined}>{index + 1}</span>
                        <strong className={step.complete ? "is-complete" : undefined}>{step.label}</strong>
                      </div>
                      {!isLast && (
                        <i
                          className={`submit-progress-line${step.complete ? " is-complete" : ""}`}
                          aria-hidden="true"
                        />
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="submit-form">
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

            <FormGroup step="01" title="Property" subtitle="Where is the property?">
              <FormField
                control={form.control}
                name="propertyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="submit-input"
                        placeholder="123 Example Dr, Richmond, CA"
                        data-testid="input-submit-address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="submit-field-grid">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="submit-select" data-testid="select-submit-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="submit-select-content">
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
                          <SelectTrigger className="submit-select" data-testid="select-submit-condition">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="submit-select-content">
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

            <FormGroup step="02" title="Situation" subtitle="What needs to be solved?">
              <div className="submit-field-grid">
                <FormField
                  control={form.control}
                  name="intent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What brought you here?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="submit-select" data-testid="select-submit-intent">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="submit-select-content">
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
                          <SelectTrigger className="submit-select" data-testid="select-submit-timeline">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="submit-select-content">
                          <SelectItem value="asap">As soon as possible</SelectItem>
                          <SelectItem value="30-60">Next 30 to 60 days</SelectItem>
                          <SelectItem value="60-90">Next 60 to 90 days</SelectItem>
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
                        className="submit-textarea"
                        rows={6}
                        placeholder="Owner-occupant, distressed sale, deferred maintenance, partnership issue, capital constraint, listing question, wholesale lead, or value-add scope. Plain facts are best."
                        data-testid="textarea-submit-situation"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormGroup>

            <FormGroup step="03" title="Contact" subtitle="Who should Pegasus follow up with?">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input {...field} className="submit-input" data-testid="input-submit-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="submit-field-grid">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} className="submit-input" data-testid="input-submit-email" />
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
                        <Input type="tel" {...field} className="submit-input" data-testid="input-submit-phone" />
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
                  <FormItem className="submit-consent">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={(v) => field.onChange(v === true ? true : false)}
                        data-testid="checkbox-submit-consent"
                      />
                    </FormControl>
                    <div className="submit-consent-copy">
                      <FormLabel>
                        I agree Pegasus Dreamscapes may contact me by email or phone call about the
                        property. Pegasus uses the information to evaluate and route the request
                        and may share it with service providers that operate the site. Pegasus will
                        provide separate notice and ask permission before sharing it with an
                        independent professional unless disclosure is legally required. The <a href="/privacy">Privacy Policy</a> explains retention,
                        rights, and deletion requests. This intake is not an offer, valuation,
                        appraisal, CMA, or commitment to transact.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </FormGroup>

            <div className="submit-actions-row">
              <Button
                type="submit"
                size="lg"
                disabled={mutation.isPending}
                className="submit-submit-button"
                data-testid="button-submit-submit"
              >
                {mutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Submitting</>
                ) : (
                  <>
                    Submit for a Property Read
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </Button>
              <p className="submit-submit-note">
                Pegasus uses this to determine the right next conversation. This is not an offer, valuation, appraisal, or commitment to transact.
              </p>
            </div>
          </form>
            </Form>
          </div>
        </div>
      </section>

      <HowItWorksSection />
    </div>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      index: "01",
      label: "Pegasus reads the facts",
      desc: "Address, condition, timeline, ownership context, and the pressure that needs a real path.",
    },
    {
      index: "02",
      label: "The path gets named",
      desc: "Representation, acquisition, JV, buyer match, development scope, referral, MarketFlow, Blueprint, or pass.",
    },
    {
      index: "03",
      label: "The next step is specific",
      desc: "If the property fits, the follow-up is about the actual path, not a generic sales call.",
    },
    {
      index: "04",
      label: "No forced fit",
      desc: "If the structure does not work, Pegasus says that plainly. No blind offer and no pressure game.",
    },
  ];

  return (
    <section className="submit-review-band" data-testid="section-how-it-works">
      <div className="submit-shell">
        <div className="submit-review-heading">
          <p className="submit-eyebrow">What happens next</p>
          <h2>The intake should reduce confusion, not create pressure.</h2>
        </div>
        <div className="submit-review-grid">
          {steps.map((step, i) => (
            <div
              key={step.index}
              className="submit-review-step"
              data-testid={`how-step-${i}`}
            >
              <span>{step.index}</span>
              <p>{step.label}</p>
              <small>{step.desc}</small>
              {i < steps.length - 1 && <i aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FormGroup({
  step,
  title,
  subtitle,
  children,
}: {
  step: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="submit-fieldset">
      <legend className="submit-legend">
        <span>{step}</span>
        <p>
          <small>{title}</small>
          <strong>{subtitle}</strong>
        </p>
      </legend>
      {children}
    </fieldset>
  );
}
