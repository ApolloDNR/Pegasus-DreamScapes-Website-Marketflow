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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { trackEvent } from "@/lib/analytics";
import { ArrowRight, FileCheck2, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { SuccessView } from "@/components/success-view";

function WhatYouGet() {
  const perks = [
    { title: "Reviewed fit", desc: "Pegasus reviews each request against the needs of the controlled pilot." },
    { title: "Role-based profile", desc: "Share your market, mandate, and capacity without publishing them publicly." },
    { title: "Controlled introductions", desc: "When a real fit appears, Pegasus may make a direct introduction under written terms." },
    { title: "Pilot updates", desc: "Approved participants receive relevant updates; access never guarantees inventory or placement." },
  ];
  return (
    <section className="mf-access-perks" data-testid="marketflow-what-you-get">
      <p>What a reviewed relationship provides</p>
      <ol>
        {perks.map((perk, index) => (
          <li key={perk.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><strong>{perk.title}</strong><small>{perk.desc}</small></div>
          </li>
        ))}
      </ol>
    </section>
  );
}

const accessSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["operator", "wholesaler", "buyer", "capital", "broker", "other"]),
  introducedBy: z.string().min(2, "Tell us who introduced you"),
  notes: z.string().optional().default(""),
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
      "Request access to MarketFlow, the private routing layer of Pegasus Dreamscapes. Access is by introduction.",
    image: "/og/marketflow.png",
  });

  // Brief Section11 analytics - page-view event for the access funnel.
  useEffect(() => {
    trackEvent("marketflow_access_opened");
  }, []);

  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  // Server-side anti-spam parity with /submit: include honeypot + time-on-form.
  const formMountedAt = useRef<number>(Date.now());
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
      consentContact: false,
    },
  });
  const selectedRole = form.watch("role");

  const mutation = useMutation({
    mutationFn: async (data: AccessValues) => {
      const elapsedMs = Date.now() - formMountedAt.current;
      if (elapsedMs < 3000) {
        throw new Error("Form submitted too fast. Please try again.");
      }
      const [first, ...rest] = data.name.split(" ");
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
          hp_company: "",
          ts_mounted_at: formMountedAt.current,
          ts_elapsed_ms: elapsedMs,
        },
      });
    },
    onSuccess: () => {
      trackEvent("marketflow_access_requested");
      setSubmitted(true);
    },
    onError: (e: Error) =>
      toast({ title: "Could not send request", description: e.message, variant: "destructive" }),
  });

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <SuccessView
            formType="marketflow_access"
            onAddAnother={() => {
              form.reset({
                name: "",
                email: "",
                role: requestedRole,
                introducedBy: "",
                notes: "",
                consentContact: false,
              });
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
    <div className="mf-access-page">
      <section className="mf-access-intro">
        <div className="mf-access-intro-inner">
          <div>
            <p className="mf-access-kicker">MarketFlow · Controlled pilot</p>
            <h1>Request a place in the relationship room.</h1>
            <p>MarketFlow is reviewed access for professionals with a clear role, credible mandate, and enough context for a deliberate introduction. It is not an open signup or public marketplace.</p>
          </div>
          <aside className="mf-access-protocol" aria-label="Current access protocol">
            <div><span>Access record</span><strong>MF · Request</strong></div>
            <dl>
              <div><dt>Relationship</dt><dd>{ACCESS_ROLE_LABEL[selectedRole]}</dd></div>
              <div><dt>Review</dt><dd>Case by case</dd></div>
              <div><dt>Distribution</dt><dd>Permissioned</dd></div>
            </dl>
            <p><LockKeyhole aria-hidden="true" /> No inventory, placement, compensation, or approval is promised by this request.</p>
          </aside>
        </div>
      </section>

      <section className="mf-access-body">
        <aside className="mf-access-review">
          <p className="mf-access-kicker">Before you request access</p>
          <h2>One concise record. A Pegasus fit review.</h2>
          <p>Tell Pegasus who you are, how you entered the relationship, and what role you can responsibly fill.</p>
          <WhatYouGet />
          <div className="mf-access-boundary" data-testid="marketflow-private-access-note">
            <ShieldCheck aria-hidden="true" />
            <p>MarketFlow is private and invitation-led. It is not a securities or investment platform, and participation never guarantees a deal, purchase, placement, or compensation.</p>
          </div>
        </aside>

        <div className="mf-access-form-card">
          <div className="mf-access-form-head">
            <div><span>Private access dossier</span><strong>Applicant record</strong></div>
            <p>{ACCESS_ROLE_LABEL[selectedRole]}</p>
          </div>
          <h2>Provide the facts required for a real review.</h2>
          <p className="mf-access-form-lede">Fields remain private to the access review and the service providers supporting it.</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="mf-access-form">
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
                        I agree Pegasus Dreamscapes may email me about this MarketFlow access
                        request. Pegasus uses the information to review fit for the controlled
                        pilot and may share it with service providers supporting that review. See
                        the <a className="underline underline-offset-2" href="/privacy">Privacy Policy</a>{' '}
                        for retention, rights, and deletion requests. Requesting access does not
                        guarantee approval, inventory, or placement.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={mutation.isPending}
              className="mf-access-submit"
              data-testid="button-access-submit"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Send for review <ArrowRight aria-hidden="true" />
            </Button>
            <p className="mf-access-form-foot"><FileCheck2 aria-hidden="true" /> Pegasus reviews identity, role, mandate, introduction context, and current network fit before responding.</p>
            </form>
          </Form>
        </div>
      </section>
    </div>
  );
}
