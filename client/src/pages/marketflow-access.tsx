import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
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
import { Loader2 } from "lucide-react";
import { SuccessView } from "@/components/success-view";

function WhatYouGet() {
  const perks = [
    { title: "Reviewed deal flow", desc: "Every listing has passed a Pegasus structural read. No noise, no cold listings." },
    { title: "Verified operator network", desc: "Buyers, wholesalers, and capital partners: all introduced, not anonymous." },
    { title: "Private deal room", desc: "Negotiate, structure JVs, and coordinate capital in one place." },
    { title: "Priority review queue", desc: "Submissions from network members jump the general intake queue." },
  ];
  return (
    <div className="mb-8 p-6 rounded-lg border border-border/40 bg-card space-y-4" data-testid="marketflow-what-you-get">
      <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold">What you get</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {perks.map((p) => (
          <div key={p.title} className="flex gap-3">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{p.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const accessSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["operator", "wholesaler", "buyer", "capital", "broker", "other"]),
  introducedBy: z.string().min(2, "Tell us who introduced you"),
  notes: z.string().optional().default(""),
});

type AccessValues = z.infer<typeof accessSchema>;

export default function MarketflowAccessPage() {
  useSEO({
    title: "Request MarketFlow Access",
    description:
      "Request access to MarketFlow, the private dealflow layer of Pegasus DreamScapes. Access is by introduction.",
    image: "/og/marketflow.png",
  });

  // Brief §11 analytics — page-view event for the access funnel.
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
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-xl mx-auto px-6 lg:px-12">
        <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-6">
          MarketFlow · Beta Access
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-foreground mb-4">
          Request beta access.
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed mb-6">
          Access is by introduction. Operators, deal finders and wholesalers, cash buyers, capital
          partners, and brokers all have a lane. Tell us who connected you and what role you would
          fill in the network.
        </p>
        <p
          className="text-xs text-muted-foreground leading-relaxed mb-8 p-4 rounded-md border border-border/50 bg-muted/20"
          data-testid="marketflow-private-access-note"
        >
          MarketFlow is a private, invitation-only network. It is not a public marketplace, not a
          securities or investment platform, and access is not a guarantee that any deal will be
          placed, purchased, or compensated. Membership is reviewed case by case.
        </p>

        <WhatYouGet />

        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
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

            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] uppercase tracking-[0.18em] font-semibold px-8 h-12 rounded-sm"
              data-testid="button-access-submit"
            >
              {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Send Request
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
