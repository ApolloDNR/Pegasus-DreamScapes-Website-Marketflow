import { BUYBOX_DISCLOSURE } from "@/config/buyboxes";
import { LockKeyhole } from "lucide-react";

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
            Pegasus Buyboxes · Publication status
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-tight mb-6">
            No public buybox profiles are active today.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Buyer criteria, inventory, matching, and notifications have not been activated on the public website. MarketFlow remains a controlled pilot with discretionary access.
          </p>
        </div>

        <div
          className="max-w-3xl border border-border/60 bg-card/60 p-6 sm:p-8"
          data-testid="buyboxes-unpublished"
        >
          <LockKeyhole className="h-6 w-6 text-primary" aria-hidden="true" />
          <h3 className="mt-4 font-serif text-2xl font-semibold">Nothing to subscribe to yet.</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            This page will publish profiles only after Pegasus has approved the criteria, operating process, and notification terms. Until then, no named profile or match request is offered.
          </p>
        </div>

        <div
          className="mt-10 p-5 rounded-md border border-border/60 bg-card/60 max-w-3xl"
          data-testid="buybox-disclosure"
        >
          <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold mb-2">
            Current boundary
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">{BUYBOX_DISCLOSURE}</p>
        </div>
      </div>
    </section>
  );
}
