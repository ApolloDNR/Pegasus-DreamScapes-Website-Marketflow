import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CardSurface } from "@/components/ui/card-primitives";
import { CheckCircle2, Inbox, Search, Compass, FlagTriangleRight, ArrowRight } from "lucide-react";

// Empire Doctrine v1.0.1 Wave 3 — Reusable post-submission surface.
//
// Replaces the toast-on-success pattern across the four public intake
// forms (/submit, /contact, /marketflow/access, /vendor-network) with a
// disciplined, branded confirmation that:
//   1. Tells the visitor exactly what happened.
//   2. Sets the four-step review expectation.
//   3. Offers a single "Add another" path back to the form.
//
// formType drives copy. The 4-step timeline is invariant — every Pegasus
// intake follows the same Receive → Triage → Strategy review → Path
// decision arc. Per-form copy lives in the FORM_COPY map below.

export type SuccessFormType =
  | "submit"
  | "contact"
  | "marketflow_access"
  | "vendor";

interface SuccessViewProps {
  formType: SuccessFormType;
  onAddAnother: () => void;
  referenceTag?: string;
  statusUrl?: string;
}

const TIMELINE = [
  {
    icon: Inbox,
    title: "Received",
    sub: "Logged the moment you hit send.",
  },
  {
    icon: Search,
    title: "Triaged",
    sub: "Apollo reads every submission himself within 1–2 business days.",
  },
  {
    icon: Compass,
    title: "Strategy review",
    sub: "We pull comps, run the structural read, decide if the path fits.",
  },
  {
    icon: FlagTriangleRight,
    title: "Path decision",
    sub: "You get a real answer — even if the answer is a referral elsewhere.",
  },
];

const FORM_COPY: Record<
  SuccessFormType,
  {
    kicker: string;
    headline: string;
    lead: string;
    expectations: string[];
    addAnotherLabel: string;
  }
> = {
  submit: {
    kicker: "Submission received",
    headline: "The property is in review.",
    lead: "Apollo reads every serious submission personally. You will hear back with the structural read on your property and the next step, even if the answer is that Pegasus is not the right fit.",
    expectations: [
      "Most Strategy Snapshots are reviewed within 5 business days.",
      "If we need more on the situation, we will reach out directly — no auto-emails.",
      "Every property gets a path. Not every property gets an offer.",
    ],
    addAnotherLabel: "Submit another property",
  },
  contact: {
    kicker: "Message received",
    headline: "The note is in.",
    lead: "A real person reads every message that lands here. We will reply within 1–2 business days with a direct answer.",
    expectations: [
      "Replies come from Apollo or the team lead closest to your topic.",
      "If your note belongs in a structured path (sell, build, capital), we will redirect you to the right intake.",
      "Press and partnership requests are routed the same day.",
    ],
    addAnotherLabel: "Send another message",
  },
  marketflow_access: {
    kicker: "Request received",
    headline: "Your access request is logged.",
    lead: "MarketFlow is invite-only. We will confirm the introduction and reach out within 48 business hours with next steps.",
    expectations: [
      "We verify every introduction by hand before sending an invite.",
      "If there is a fit, you will get a personal invite link and onboarding call.",
      "If MarketFlow is not the right room for you yet, we will say so plainly.",
    ],
    addAnotherLabel: "Submit a different request",
  },
  vendor: {
    kicker: "Application received",
    headline: "Your application is in front of the team.",
    lead: "We review every vendor intake by hand. If there is a fit on a current or upcoming scope, we will reach out directly.",
    expectations: [
      "Vendor reviews include reference checks and license verification.",
      "Approval is rolling — we add new operators as scopes open up.",
      "We do not sell directory listings. The list stays short on purpose.",
    ],
    addAnotherLabel: "Submit another application",
  },
};

export function SuccessView({ formType, onAddAnother, referenceTag, statusUrl }: SuccessViewProps) {
  const copy = FORM_COPY[formType];

  return (
    <div className="w-full" data-testid={`success-view-${formType}`}>
      <CardSurface className="p-8 sm:p-10 lg:p-14">
        <div className="text-center max-w-2xl mx-auto">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-6" aria-hidden="true" />
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-4">
            {copy.kicker}
          </p>
          <h2
            className="font-serif text-3xl sm:text-4xl font-semibold tracking-normal text-foreground mb-5"
            data-testid={`text-success-headline-${formType}`}
          >
            {copy.headline}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {copy.lead}
          </p>
          {referenceTag ? (
            <p className="mt-4 text-sm text-muted-foreground/85">
              Reference:{" "}
              <span className="font-supporting uppercase tracking-wider text-primary">
                {referenceTag}
              </span>
            </p>
          ) : null}
          {statusUrl ? (
            <a
              href={statusUrl}
              className="mt-4 inline-flex text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              View status
            </a>
          ) : null}
        </div>

        <div className="mt-10 pt-8 border-t border-[hsl(var(--rule))]">
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold text-center mb-8">
            What happens next
          </p>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TIMELINE.map((step, i) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  className="relative rounded-md border border-[hsl(var(--rule))] bg-background p-5"
                  data-testid={`success-step-${i}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-sm bg-primary/10 text-primary">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <span className="font-serif text-2xl text-primary/25 leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="font-serif text-lg font-semibold tracking-tight text-foreground mb-1">
                    {step.title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.sub}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-10 pt-8 border-t border-[hsl(var(--rule))]">
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-4">
            What to expect
          </p>
          <ul className="space-y-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
            {copy.expectations.map((line) => (
              <li key={line} className="flex gap-3">
                <span className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 pt-8 border-t border-[hsl(var(--rule))] flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <Button
            onClick={onAddAnother}
            variant="outline"
            className="text-[12px] uppercase tracking-[0.18em] font-semibold h-11 px-6 rounded-sm"
            data-testid={`button-success-add-another-${formType}`}
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" aria-hidden="true" />
            {copy.addAnotherLabel}
          </Button>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
            data-testid={`link-success-home-${formType}`}
          >
            Back to home →
          </Link>
        </div>
      </CardSurface>
    </div>
  );
}
