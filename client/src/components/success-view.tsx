import { useEffect, useId, useRef, useState } from "react";
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
// formType drives copy. Most intakes share the same four-stage review arc;
// MarketFlow uses a separate manual-access review sequence so the confirmation
// never implies deal analysis, comps, inventory, or approval.

export type SuccessFormType =
  | "submit"
  | "contact"
  | "marketflow_access"
  | "vendor";

interface SuccessViewProps {
  formType: SuccessFormType;
  onAddAnother: () => void;
  referenceTag?: string;
  headingLevel?: 1 | 2;
}

const DEFAULT_TIMELINE = [
  {
    icon: Inbox,
    title: "Received",
    sub: "The site recorded the information you submitted.",
  },
  {
    icon: Search,
    title: "Possible triage",
    sub: "Pegasus may consider the request for fit, information needs, and current capacity.",
  },
  {
    icon: Compass,
    title: "Possible review",
    sub: "Any property or strategy work occurs only if Pegasus elects to proceed.",
  },
  {
    icon: FlagTriangleRight,
    title: "Possible response",
    sub: "A submission does not guarantee review, an offer, a referral, or a response time.",
  },
];

const MARKETFLOW_TIMELINE = [
  {
    icon: Inbox,
    title: "Request logged",
    sub: "Your private request is recorded for manual review.",
  },
  {
    icon: Search,
    title: "Introduction reviewed",
    sub: "Pegasus checks how the relationship began and whether the context is complete.",
  },
  {
    icon: Compass,
    title: "Role and network fit reviewed",
    sub: "Your mandate, role, and current network fit are considered case by case.",
  },
  {
    icon: FlagTriangleRight,
    title: "Direct response",
    sub: "Pegasus may respond directly if a responsible next step exists.",
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
    headline: "Your property submission was recorded.",
    lead: "This confirms receipt only. Pegasus may review the information for fit and capacity, but no analysis, offer, referral, or response is promised.",
    expectations: [
      "You can save the reference shown here for your records.",
      "Pegasus may request more information if it chooses to consider the opportunity.",
      "Any service, representation, purchase, or partnership requires separate written terms.",
    ],
    addAnotherLabel: "Submit another property",
  },
  contact: {
    kicker: "Message received",
    headline: "The note is in.",
    lead: "This page confirms that the site recorded your note. It does not promise review, routing, or a response time.",
    expectations: [
      "Keep the reference shown here if one was issued.",
      "Pegasus may direct a relevant note to another intake if capacity and context support it.",
      "No relationship or obligation is created by sending a message.",
    ],
    addAnotherLabel: "Send another message",
  },
  marketflow_access: {
    kicker: "Request received",
    headline: "Your access request is logged.",
    lead: "Pegasus reviews each MarketFlow relationship manually and will respond directly if the role, introduction context, and current network fit support a responsible next step.",
    expectations: [
      "Access is discretionary and reviewed case by case.",
      "A request does not guarantee approval, inventory, placement, compensation, or an introduction.",
      "Pegasus may contact you if a responsible next step exists.",
    ],
    addAnotherLabel: "Submit a different request",
  },
  vendor: {
    kicker: "Application received",
    headline: "Your vendor application was recorded.",
    lead: "This is an application receipt, not approval, placement, onboarding, or an offer of work. Pegasus may contact you if a future scope and current capacity support a next step.",
    expectations: [
      "Credentials, licenses, insurance, and references may be requested for a specific future scope.",
      "Status and eligibility are determined case by case; no application outcome is promised.",
      "Submitting does not create employment, agency, exclusivity, compensation, or volume rights.",
    ],
    addAnotherLabel: "Submit another application",
  },
};

export function SuccessView({
  formType,
  onAddAnother,
  referenceTag,
  headingLevel = 2,
}: SuccessViewProps) {
  const copy = FORM_COPY[formType];
  const timeline = formType === "marketflow_access" ? MARKETFLOW_TIMELINE : DEFAULT_TIMELINE;
  const statusRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const [announcement, setAnnouncement] = useState("");
  const Heading = headingLevel === 1 ? "h1" : "h2";

  useEffect(() => {
    statusRef.current?.focus({ preventScroll: true });
    setAnnouncement(copy.headline);
  }, [copy.headline]);

  return (
    <div
      ref={statusRef}
      role="region"
      aria-labelledby={headingId}
      tabIndex={-1}
      className={`success-view success-view--${formType} w-full focus:outline-none`}
      data-testid={`success-view-${formType}`}
    >
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>
      <CardSurface className="p-8 sm:p-10 lg:p-14">
        <div className="text-center max-w-2xl mx-auto">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-6" aria-hidden="true" />
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-4">
            {copy.kicker}
          </p>
          <Heading
            id={headingId}
            className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-foreground mb-5"
            data-testid={`text-success-headline-${formType}`}
          >
            {copy.headline}
          </Heading>
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
        </div>

        <div className="mt-10 pt-8 border-t border-[hsl(var(--rule))]">
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold text-center mb-8">
            What happens next
          </p>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {timeline.map((step, i) => {
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

        {formType === "submit" && (
          <div className="mt-8 pt-8 border-t border-[hsl(var(--rule))]">
            <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-4">
              While you wait
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link href="/strategy-lab">
                <div className="group p-4 rounded-md border border-border/40 bg-background hover:border-primary/30 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors mb-1">Run Strategy Lab</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Explore educational ranges and possible lanes without implying that a submitted property is under review.</p>
                </div>
              </Link>
              <Link href="/projects">
                <div className="group p-4 rounded-md border border-border/40 bg-background hover:border-primary/30 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors mb-1">See Our Work</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">View the one case study currently ready for public review, with its stated limits.</p>
                </div>
              </Link>
            </div>
          </div>
        )}

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
