import { useState, useEffect, useRef } from "react";
import { useSearch } from "wouter";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSEO } from "@/hooks/use-seo";
import { apiRequest } from "@/lib/queryClient";
import { trackEvent } from "@/lib/analytics";
import { AlertCircle, ArrowRight, FileCheck2, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { SuccessView } from "@/components/success-view";

function WhatYouGet() {
  const perks = [
    { title: "Private record", desc: "The site records the identity, role interest, introduction context, and note you provide." },
    { title: "Possible consideration", desc: "Pegasus may consider the record if pilot capacity and a responsible fit exist." },
    { title: "Possible follow-up", desc: "Pegasus may contact you for clarification, but no human review or response is promised." },
    { title: "Separate invitation", desc: "Only a separate, direct approval can create pilot access; this request creates none." },
  ];
  return (
    <section className="mf-access-perks" data-testid="marketflow-what-you-get">
      <p>What this request does</p>
      <ul>
        {perks.map((perk) => (
          <li key={perk.title}>
            <strong>{perk.title}</strong>
            <small>{perk.desc}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}

const accessSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120, "Keep your name under 120 characters"),
  email: z.string().trim().email("Enter a valid email address").max(254, "Keep your email under 254 characters"),
  role: z.enum(["operator", "wholesaler", "buyer", "capital", "broker", "other"]),
  introducedBy: z.string().trim().min(2, "Tell us who introduced you").max(200, "Keep this introduction under 200 characters"),
  notes: z.string().trim().max(2000, "Keep your note under 2,000 characters").optional().default(""),
  hp_company: z.string().max(0, "Leave this field blank").default(""),
  consentContact: z.boolean().refine((value) => value, {
    message: "Required to request access",
  }),
});

type AccessValues = z.infer<typeof accessSchema>;

const ACCESS_ROLE_BY_QUERY: Record<string, AccessValues["role"]> = {
  source: "wholesaler",
  wholesaler: "wholesaler",
  buyer: "buyer",
  capital: "capital",
  operator: "operator",
  broker: "broker",
  other: "other",
};

const ACCESS_ROLE_LABEL: Record<AccessValues["role"], string> = {
  operator: "Operator / builder",
  wholesaler: "Deal source",
  buyer: "Cash buyer",
  capital: "Capital partner",
  broker: "Broker / agent",
  other: "Other relationship",
};

export function marketflowAccessRole(search: string): AccessValues["role"] {
  const requested = new URLSearchParams(search).get("role")?.trim().toLowerCase();
  return (requested && ACCESS_ROLE_BY_QUERY[requested]) || "operator";
}

export default function MarketflowAccessPage() {
  const requestedRole = marketflowAccessRole(useSearch());

  useSEO({
    title: "Request MarketFlow Access",
    description:
      "Record interest in the invitation-led MarketFlow controlled pilot. Review, response, approval, inventory, and access are not promised.",
    image: "/og/marketflow.png",
  });

  // Brief Section11 analytics - page-view event for the access funnel.
  useEffect(() => {
    trackEvent("marketflow_access_opened");
  }, []);

  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Server-side anti-spam parity with /submit: include honeypot + time-on-form.
  const formMountedAt = useRef<number>(Date.now());
  const focusNameAfterReset = useRef(false);
  useEffect(() => {
    formMountedAt.current = Date.now();
  }, []);

  const form = useForm<AccessValues>({
    resolver: zodResolver(accessSchema),
    defaultValues: {
      name: "",
      email: "",
      role: requestedRole,
      introducedBy: "",
      notes: "",
      hp_company: "",
      consentContact: false,
    },
  });
  const selectedRole = form.watch("role");

  useEffect(() => {
    if (!submitted && focusNameAfterReset.current) {
      focusNameAfterReset.current = false;
      form.setFocus("name");
    }
  }, [form, submitted]);

  const mutation = useMutation({
    mutationFn: async (data: AccessValues) => {
      const elapsedMs = Date.now() - formMountedAt.current;
      if (elapsedMs < 3000) {
        throw new Error("Form submitted too fast. Please try again.");
      }
      const [first, ...rest] = data.name.trim().split(/\s+/);
      return apiRequest("POST", "/api/leads", {
        leadType: "marketflow_access",
        source: "marketflow_access_page",
        firstName: first || "",
        lastName: rest.join(" "),
        email: data.email,
        consentContact: data.consentContact,
        consentVersion: "marketflow-access-contact-v1",
        leadData: {
          role: data.role,
          introducedBy: data.introducedBy,
          notes: data.notes,
          consentContact: data.consentContact,
          hp_company: data.hp_company || "",
          ts_mounted_at: formMountedAt.current,
          ts_elapsed_ms: elapsedMs,
        },
      });
    },
    onSuccess: () => {
      trackEvent("marketflow_access_requested");
      setSubmitError(null);
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      setSubmitted(true);
    },
    onError: (error: Error) => {
      setSubmitError(
        error.message.startsWith("Form submitted too fast")
          ? "Please spend a little more time with the form, then send your request again."
          : "We could not send your request. Your entries are still here; check your connection and try again.",
      );
    },
  });

  const submitRequest = (data: AccessValues) => {
    setSubmitError(null);
    mutation.mutate(data);
  };

  if (submitted) {
    return (
      <div className="mf-access-success min-h-screen bg-background pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <SuccessView
            formType="marketflow_access"
            headingLevel={1}
            onAddAnother={() => {
              form.reset({
                name: "",
                email: "",
                role: requestedRole,
                introducedBy: "",
                notes: "",
                hp_company: "",
                consentContact: false,
              });
              mutation.reset();
              setSubmitError(null);
              formMountedAt.current = Date.now();
              focusNameAfterReset.current = true;
              setSubmitted(false);
              const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
              window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mf-access-page">
      <section className="mf-access-intro">
        <div className="mf-access-intro-inner">
          <div>
            <p className="mf-access-kicker">MarketFlow · Controlled pilot</p>
            <h1>Record your interest in the controlled pilot.</h1>
            <p>MarketFlow is private and invitation-led. This form records the context for possible consideration; it is not an open signup, application decision, or public marketplace.</p>
          </div>
          <aside className="mf-access-protocol" aria-label="Current access protocol">
            <h2>Request boundary</h2>
            <dl>
              <div><dt>Relationship</dt><dd>{ACCESS_ROLE_LABEL[selectedRole]}</dd></div>
              <div><dt>Human review</dt><dd>Not promised</dd></div>
              <div><dt>Access created</dt><dd>None</dd></div>
            </dl>
            <p><LockKeyhole aria-hidden="true" /> This request does not guarantee human review, a response, approval, an invitation, inventory, or access.</p>
          </aside>
        </div>
        <p className="mf-access-public-boundary">MarketFlow is not a public marketplace. It is not a securities or investment platform, and no securities are offered through this request.</p>
      </section>

      <section className="mf-access-body">
        <aside className="mf-access-review">
          <p className="mf-access-kicker">Before you request access</p>
          <h2>One concise record for possible consideration.</h2>
          <p>Tell Pegasus who you are, how the relationship began, and the role that interests you. The site records the request; Pegasus may or may not review or answer it.</p>
          <WhatYouGet />
          <div className="mf-access-boundary" data-testid="marketflow-private-access-note">
            <ShieldCheck aria-hidden="true" />
            <p>MarketFlow is private and invitation-led. It is not a securities or investment platform, and participation never guarantees a deal, purchase, placement, or compensation.</p>
          </div>
        </aside>

        <div className="mf-access-form-card">
          <div className="mf-access-form-head" role="status" aria-live="polite" aria-atomic="true">
            <span>Selected relationship</span>
            <strong>{ACCESS_ROLE_LABEL[selectedRole]}</strong>
          </div>
          <h2>Provide enough context to identify the request.</h2>
          <p className="mf-access-form-lede">Fields are recorded privately and may be handled by service providers that operate this intake.</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitRequest)} className="mf-access-form">
              <div className="mf-access-honeypot" aria-hidden="true">
                <label htmlFor="marketflow-hp-company">Company website</label>
                <input
                  id="marketflow-hp-company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  {...form.register("hp_company")}
                />
              </div>
              <div className="mf-access-form-grid">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-access-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} data-testid="input-access-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-access-role">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="operator">Operator / builder</SelectItem>
                      <SelectItem value="wholesaler">Deal finder / wholesaler</SelectItem>
                      <SelectItem value="buyer">Cash buyer</SelectItem>
                      <SelectItem value="capital">Capital partner</SelectItem>
                      <SelectItem value="broker">Broker / agent</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="introducedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who introduced you?</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Name or how we connected" data-testid="input-access-introduced-by" />
                  </FormControl>
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
                  <FormLabel>Anything else? (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} data-testid="textarea-access-notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="consentContact"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked === true)}
                        data-testid="checkbox-access-consent"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal leading-relaxed cursor-pointer">
                        I agree Pegasus Dreamscapes may email me about this MarketFlow interest
                        record. Pegasus may use the information for possible consideration and may
                        share it with service providers that operate this intake. See
                        the <a className="underline underline-offset-2" href="/privacy">Privacy Policy</a>{' '}
                        for retention, rights, and deletion requests. Requesting access does not
                        guarantee human review, a response, approval, an invitation, inventory,
                        access, or placement.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {submitError ? (
              <div className="mf-access-error" role="alert" aria-live="assertive" aria-atomic="true">
                <AlertCircle aria-hidden="true" />
                <div>
                  <p>{submitError}</p>
                  <button type="button" onClick={form.handleSubmit(submitRequest)}>Try sending again</button>
                </div>
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={mutation.isPending}
              aria-busy={mutation.isPending}
              className="mf-access-submit"
              data-testid="button-access-submit"
            >
              {mutation.isPending ? <Loader2 aria-hidden="true" className="w-4 h-4 mr-2 animate-spin" /> : null}
              {mutation.isPending ? "Recording request…" : "Record access interest"}
              {!mutation.isPending ? <ArrowRight aria-hidden="true" /> : null}
            </Button>
            <p className="mf-access-form-foot"><FileCheck2 aria-hidden="true" /> Receipt confirms only that the site recorded the request. Review, response, invitation, and access remain discretionary and are not promised.</p>
            </form>
          </Form>
        </div>
      </section>
    </div>
  );
}
