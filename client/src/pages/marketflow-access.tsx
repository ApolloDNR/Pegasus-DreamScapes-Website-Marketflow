import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Loader2, Lock, Network, UserCheck } from "lucide-react";
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
import { SuccessView } from "@/components/success-view";
import { ComplianceNote, ProcessRail, SectionIntro, SplitHero } from "@/components/site-visuals";

const accessSchema = z.object({
  name: z.string().min(2, "Full name required"),
  email: z.string().email("Valid email required"),
  role: z.enum(["operator", "buyer", "capital", "broker", "other"]),
  introducedBy: z.string().min(2, "Tell us who introduced you"),
  notes: z.string().optional().default(""),
});

type AccessValues = z.infer<typeof accessSchema>;

const accessSequence = [
  {
    label: "Introduction",
    title: "Who connected you matters.",
    body: "MarketFlow access is relationship-based. The introduction helps Pegasus understand context and fit.",
    icon: UserCheck,
  },
  {
    label: "Role",
    title: "The network is role-gated.",
    body: "Operators, buyers, brokers, vendors, and capital relationships need different surfaces and different permissions.",
    icon: Network,
  },
  {
    label: "Review",
    title: "Access is granted deliberately.",
    body: "The goal is a trusted network, not a public list of unreviewed participants.",
    icon: Lock,
  },
];

export default function MarketflowAccessPage() {
  useSEO({
    title: "Request MarketFlow Access",
    description:
      "Request access to MarketFlow, the private dealflow layer of Pegasus Dreamscapes. Access is by introduction and role fit.",
    image: "/og/marketflow.png",
  });

  useEffect(() => {
    trackEvent("marketflow_access_opened");
  }, []);

  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const formMountedAt = useRef<number>(Date.now());

  useEffect(() => {
    formMountedAt.current = Date.now();
  }, []);

  const form = useForm<AccessValues>({
    resolver: zodResolver(accessSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "operator",
      introducedBy: "",
      notes: "",
    },
  });

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
        leadData: {
          role: data.role,
          introducedBy: data.introducedBy,
          notes: data.notes,
          hp_company: "",
          ts_mounted_at: formMountedAt.current,
          ts_elapsed_ms: elapsedMs,
        },
      });
    },
    onSuccess: () => {
      trackEvent("marketflow_access_requested");
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (error: Error) =>
      toast({ title: "Could not send request", description: error.message, variant: "destructive" }),
  });

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-12">
          <SuccessView
            formType="marketflow_access"
            onAddAnother={() => {
              form.reset({
                name: "",
                email: "",
                role: "operator",
                introducedBy: "",
                notes: "",
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
    <div className="min-h-screen bg-background">
      <SplitHero
        eyebrow="MarketFlow Access"
        title={
          <>
            Request reviewed access.
            <span className="block pt-2 italic text-[#D4B483]">Tell us your role.</span>
          </>
        }
        subtitle="MarketFlow is private because the network only works when the participants are known, useful, and properly routed."
        body="Use this page if someone connected you to Pegasus or if your role fits the reviewed network."
        primaryCta={{ label: "Start Request", href: "#access-request" }}
        secondaryCta={{ label: "MarketFlow", href: "/marketflow" }}
        visual="network"
        visualTitle="Access review map"
        visualCaption="MarketFlow access is based on introduction, role fit, and Pegasus review before visibility is granted."
        labels={[
          { label: "Access", value: "Reviewed" },
          { label: "Role", value: "Gated" },
          { label: "Stage", value: "Beta" },
        ]}
      />

      <section id="access-request" className="py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:px-12">
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionIntro
                eyebrow="Access logic"
                title="A smaller trusted network beats an open door."
                body="The request should tell Pegasus who introduced you, what role you fill, and why the connection is useful."
              />
              <div className="mt-8">
                <ProcessRail items={accessSequence} />
              </div>
              <div className="mt-6">
                <ComplianceNote>
                  MarketFlow access does not create an agency relationship, investment relationship, capital commitment, offer, or guarantee of work, deal access, or transaction outcome.
                </ComplianceNote>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-7">
            <div className="rounded-md border border-border bg-card p-6 shadow-[0_24px_70px_-48px_hsl(var(--navy)/0.55)] sm:p-8 lg:p-10">
              <div className="mb-10 border-b border-border pb-6">
                <p className="text-xs font-semibold uppercase text-primary">Private beta access</p>
                <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight">Request Access</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Keep it direct. The strongest request explains who introduced you and what role you can responsibly fill.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
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
                            <SelectItem value="buyer">Cash buyer</SelectItem>
                            <SelectItem value="capital">Capital relationship</SelectItem>
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
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Context</FormLabel>
                        <FormControl>
                          <Textarea rows={5} {...field} placeholder="What role do you fill, and what kind of opportunities or execution capacity are relevant?" data-testid="textarea-access-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="h-12 rounded-sm bg-primary px-8 text-xs font-semibold uppercase text-primary-foreground hover:bg-primary/90"
                    data-testid="button-access-submit"
                  >
                    {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Send Request
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
