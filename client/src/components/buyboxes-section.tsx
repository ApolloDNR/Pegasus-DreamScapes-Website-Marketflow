import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { trackCtaClick } from "@/lib/analytics";
import { BUYBOXES, BUYBOX_DISCLOSURE, type Buybox } from "@/config/buyboxes";
import { CheckCircle2, MapPin, Target } from "lucide-react";

function BuyboxCard({ buybox }: { buybox: Buybox }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/leads", {
        leadType: "buybox_interest",
        email,
        source: `buybox:${buybox.id}`,
        leadData: { buyboxId: buybox.id, buyboxTitle: buybox.title },
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      setEmail("");
    },
    onError: (err: any) => {
      toast({
        title: "Could not submit",
        description: err?.message ?? "Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div
      className="flex flex-col h-full p-6 rounded-lg border border-border/60 bg-background"
      data-testid={`buybox-card-${buybox.id}`}
    >
      <div className="flex items-start justify-between mb-3 gap-3">
        <h3 className="font-serif text-xl font-semibold leading-tight" data-testid={`buybox-title-${buybox.id}`}>
          {buybox.title}
        </h3>
        <Target className="w-5 h-5 text-primary/70 shrink-0 mt-1" aria-hidden="true" />
      </div>

      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-supporting mb-4">
        <MapPin className="w-3 h-3" aria-hidden="true" />
        <span>{buybox.geography}</span>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{buybox.profile}</p>
      <p className="text-xs text-muted-foreground/80 italic mb-2">{buybox.notes}</p>
      <p className="text-xs text-muted-foreground/70 mb-5">{buybox.ticketSize}</p>

      <div className="mt-auto">
        {submitted ? (
          <div
            className="flex items-start gap-2 p-3 rounded-md bg-primary/5 border border-primary/20"
            data-testid={`buybox-success-${buybox.id}`}
          >
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-foreground leading-relaxed">
              Added to <span className="font-semibold">{buybox.title}</span>. We will reach out only when a reviewed match comes through.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim()) return;
              trackCtaClick("buyboxes", `Request Notification · ${buybox.title}`, "/marketflow#buyboxes");
              mutation.mutate();
            }}
            className="space-y-2"
          >
            <Input
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10"
              data-testid={`buybox-email-${buybox.id}`}
              aria-label={`Email for ${buybox.title} notifications`}
            />
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white text-[11px] uppercase tracking-[0.18em] font-semibold h-10 rounded-sm"
              data-testid={`buybox-submit-${buybox.id}`}
            >
              {mutation.isPending ? "Submitting…" : "Request Notification"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export function BuyboxesSection() {
  return (
    <section
      id="buyboxes"
      className="py-20 lg:py-28 bg-background scroll-mt-24"
      data-testid="section-buyboxes"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mb-12">
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-4">
            Pegasus Buyboxes · Free Interest List
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-tight mb-6">
            Tell us the kind of deal you want to see.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Subscribe to a buybox profile and we will contact you when a reviewed property matches. No fee. No obligation. No public marketplace.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-5" data-testid="buyboxes-grid">
          {BUYBOXES.filter((b) => b.publicReady !== false).map((b) => (
            <BuyboxCard key={b.id} buybox={b} />
          ))}
        </div>

        <div
          className="mt-10 p-5 rounded-md border border-border/60 bg-card/60 max-w-3xl"
          data-testid="buybox-disclosure"
        >
          <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold mb-2">
            How Buyboxes work
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">{BUYBOX_DISCLOSURE}</p>
        </div>
      </div>
    </section>
  );
}
