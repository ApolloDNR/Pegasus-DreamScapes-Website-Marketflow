/**
 * Snapshot Status — UI-only submitter view (v1.3.1).
 *
 * This page shows a property submitter the status of their Strategy Snapshot
 * after they submit through `/sell`. It is intentionally a NARROW submitter
 * view: no internal lane scoring, no RACI, no buy-box fail reasons, no admin
 * data. It does not expose any HQ internals.
 *
 * Current state: UI-only. Renders fixture data based on the `:token` URL param
 * and an optional `?state=...` query param for dev toggling. Accepts any
 * non-empty token in dev.
 *
 * ─── TODO: HQ Contract (future wiring, not in this build) ───────────────────
 *  - GET status:    HQ Edge Function `getSnapshotStatusByToken(token)` →
 *                   { state, submittedAt, propertyAddress, snapshotUrl?,
 *                     nextSteps?: SnapshotNextStep[] }
 *  - Magic link:    HQ issues a signed token at submission time and emails it
 *                   to the submitter (link points to `/snapshot/:token`). The
 *                   token validates server-side; this page never validates
 *                   itself.
 *  - Snapshot release: HQ moves the lead to "Snapshot Ready" and writes the
 *                     PDF/URL to the lead record. Polling or realtime push
 *                     surfaces it here.
 *  - Next-step selection: when the submitter clicks Sell / Build / Blueprint /
 *                        Save, POST `recordSnapshotNextStep(token, choice)` to
 *                        HQ; HQ updates the lead and confirms the route.
 *  - Auth: token-based only. No login required for the submitter.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { useMemo } from "react";
import { useParams, useSearch, Link } from "wouter";
import { motion } from "framer-motion";
import {
  Clock,
  Eye,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  Building,
  Hammer,
  FileText,
  Bookmark,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";

type SnapshotState =
  | "submitted"
  | "in-review"
  | "needs-info"
  | "snapshot-ready"
  | "next-step-selected";

interface SnapshotFixture {
  state: SnapshotState;
  propertyAddress: string;
  submittedAt: string;
  needsInfoMessage?: string;
  snapshotSummary?: string;
  selectedNextStep?: "sell" | "build" | "blueprint" | "save";
}

const FIXTURES: Record<SnapshotState, SnapshotFixture> = {
  submitted: {
    state: "submitted",
    propertyAddress: "1234 Example Ave, Oakland, CA",
    submittedAt: "2 hours ago",
  },
  "in-review": {
    state: "in-review",
    propertyAddress: "1234 Example Ave, Oakland, CA",
    submittedAt: "Yesterday",
  },
  "needs-info": {
    state: "needs-info",
    propertyAddress: "1234 Example Ave, Oakland, CA",
    submittedAt: "2 days ago",
    needsInfoMessage:
      "We'd like a few interior photos and confirmation on whether the back unit is permitted. Reply to the email we sent or call us directly.",
  },
  "snapshot-ready": {
    state: "snapshot-ready",
    propertyAddress: "1234 Example Ave, Oakland, CA",
    submittedAt: "3 days ago",
    snapshotSummary:
      "We reviewed the property against eight outcome lanes. Strongest paths: a structured acquisition or a JV/build given the lot's secondary-unit potential. A traditional listing is viable but leaves value on the table. Pick a path below to continue the conversation, or save and decide later.",
  },
  "next-step-selected": {
    state: "next-step-selected",
    propertyAddress: "1234 Example Ave, Oakland, CA",
    submittedAt: "5 days ago",
    snapshotSummary:
      "We reviewed the property against eight outcome lanes. Strongest paths: a structured acquisition or a JV/build given the lot's secondary-unit potential.",
    selectedNextStep: "blueprint",
  },
};

const STATE_META: Record<
  SnapshotState,
  { kicker: string; title: string; icon: typeof Clock; tone: string }
> = {
  submitted: {
    kicker: "Step 1 of 3",
    title: "Submission received.",
    icon: CheckCircle2,
    tone: "text-primary",
  },
  "in-review": {
    kicker: "Step 2 of 3",
    title: "Your property is in review.",
    icon: Eye,
    tone: "text-primary",
  },
  "needs-info": {
    kicker: "Action requested",
    title: "We need a little more information.",
    icon: HelpCircle,
    tone: "text-amber-500",
  },
  "snapshot-ready": {
    kicker: "Step 3 of 3",
    title: "Your Strategy Snapshot is ready.",
    icon: CheckCircle2,
    tone: "text-primary",
  },
  "next-step-selected": {
    kicker: "Path Selected",
    title: "We're moving forward together.",
    icon: ArrowRight,
    tone: "text-primary",
  },
};

function parseStateParam(raw: string | null): SnapshotState {
  switch ((raw || "").toLowerCase()) {
    case "submitted":
      return "submitted";
    case "review":
    case "in-review":
    case "in_review":
      return "in-review";
    case "needs-info":
    case "needs_info":
    case "info":
      return "needs-info";
    case "ready":
    case "snapshot-ready":
    case "snapshot_ready":
      return "snapshot-ready";
    case "selected":
    case "next-step-selected":
      return "next-step-selected";
    default:
      // Default fixture state — friendly mid-flow view.
      return "in-review";
  }
}

export default function SnapshotStatus() {
  const params = useParams<{ token: string }>();
  const search = useSearch();

  const state = useMemo<SnapshotState>(() => {
    const sp = new URLSearchParams(search);
    return parseStateParam(sp.get("state"));
  }, [search]);

  const fixture = FIXTURES[state];
  const meta = STATE_META[state];
  const Icon = meta.icon;

  useSEO({
    title: "Strategy Snapshot Status",
    description:
      "Track the status of your Strategy Snapshot submission with Pegasus DreamScapes Corp.",
    noIndex: true,
  });

  // TODO(HQ): replace with real loading state from getSnapshotStatusByToken().
  const isLoading = false;
  if (isLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-3xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">
              Strategy Snapshot · {meta.kicker}
            </p>
          </div>
          <div className="flex items-start gap-5">
            <div className={`mt-2 ${meta.tone}`}>
              <Icon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1
                className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-3"
                data-testid="text-snapshot-title"
              >
                {meta.title}
              </h1>
              <p
                className="text-sm text-muted-foreground"
                data-testid="text-snapshot-meta"
              >
                {fixture.propertyAddress} · Submitted {fixture.submittedAt} ·
                Reference{" "}
                <span className="font-mono text-foreground">
                  {params.token?.slice(0, 8) || "—"}
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress rail */}
        <div className="mb-12">
          <ProgressRail state={state} />
        </div>

        {/* State-specific body */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-card border border-border/50 rounded-xl p-8 lg:p-10 shadow-sm mb-10"
          data-testid={`panel-state-${state}`}
        >
          {state === "submitted" && (
            <div className="space-y-4">
              <p className="text-base text-foreground leading-relaxed">
                Your submission is in the queue. A real person, not an
                automation, reviews every property that comes in.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We'll move it into review within one business day and reach out
                with the Strategy Snapshot in 1–2 business days. You'll get an
                email when there's an update.
              </p>
            </div>
          )}

          {state === "in-review" && (
            <div className="space-y-4">
              <p className="text-base text-foreground leading-relaxed">
                We're working through the property right now: type, condition,
                location, scope, and which of the eight outcome lanes fits
                cleanest.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No action needed from you. We'll surface the Snapshot here and
                send an email the moment it's ready.
              </p>
            </div>
          )}

          {state === "needs-info" && (
            <div className="space-y-5">
              <p className="text-base text-foreground leading-relaxed">
                {fixture.needsInfoMessage}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="mailto:apollo@pegasusdreamscapes.com">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto text-xs uppercase tracking-[0.15em] font-semibold"
                    data-testid="button-needs-info-email"
                  >
                    Reply by Email
                  </Button>
                </a>
                <a href="tel:+19257448525">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto text-xs uppercase tracking-[0.15em] font-semibold"
                    data-testid="button-needs-info-call"
                  >
                    Call 925-744-8525
                  </Button>
                </a>
              </div>
            </div>
          )}

          {(state === "snapshot-ready" ||
            state === "next-step-selected") && (
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">
                The Snapshot
              </p>
              <p className="text-base text-foreground leading-relaxed">
                {fixture.snapshotSummary}
              </p>
              <p className="text-xs text-muted-foreground italic pt-2 border-t border-border/40">
                The Strategy Snapshot is preliminary, a directional read of
                paths and structure, not an offer, valuation, or guarantee.
              </p>
            </div>
          )}
        </motion.div>

        {/* Next-step buttons — only on Snapshot Ready */}
        {state === "snapshot-ready" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
              <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">
                Choose Your Path
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <NextStepCard
                href="/sell"
                icon={Building}
                title="Sell to Pegasus"
                desc="Continue the conversation toward a direct acquisition or a wholesale assignment."
                testId="next-step-sell"
              />
              <NextStepCard
                href="/invest"
                icon={Hammer}
                title="Build with Pegasus"
                desc="Explore a JV or partnership build, when the lot or scope warrants it."
                testId="next-step-build"
              />
              <NextStepCard
                href="/deal-blueprint"
                icon={FileText}
                title="Get the Deal Blueprint"
                desc="Commission a paid Pegasus Deal Blueprint, a deeper, structured analysis."
                testId="next-step-blueprint"
              />
              <NextStepCard
                href="#save"
                icon={Bookmark}
                title="Save and decide later"
                desc="Keep the Snapshot on file. We'll check in periodically. No pressure."
                testId="next-step-save"
              />
            </div>

            <div className="text-center pt-6">
              <a
                href="#peggy"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-ask-peggy"
              >
                <MessageCircle className="w-4 h-4" />
                Or ask Peggy a question about your Snapshot
              </a>
            </div>
          </motion.div>
        )}

        {state === "next-step-selected" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-muted/30 border border-border/50 rounded-xl p-6 text-center"
          >
            <p className="text-sm text-muted-foreground mb-2">
              You selected:{" "}
              <span className="font-semibold text-foreground">
                {labelForChoice(fixture.selectedNextStep)}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              We've routed your selection internally and a real person will
              follow up shortly.
            </p>
          </motion.div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border/40 text-center">
          <p className="text-xs text-muted-foreground mb-3">
            Questions? Direct line:{" "}
            <a
              href="tel:+19257448525"
              className="text-foreground hover:text-primary"
            >
              925-744-8525
            </a>{" "}
            ·{" "}
            <a
              href="mailto:apollo@pegasusdreamscapes.com"
              className="text-foreground hover:text-primary"
            >
              apollo@pegasusdreamscapes.com
            </a>
          </p>
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs uppercase tracking-[0.15em]"
              data-testid="button-snapshot-home"
            >
              Back to Pegasus DreamScapes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProgressRail({ state }: { state: SnapshotState }) {
  const steps: { key: SnapshotState; label: string }[] = [
    { key: "submitted", label: "Received" },
    { key: "in-review", label: "In Review" },
    { key: "snapshot-ready", label: "Snapshot Ready" },
  ];

  const activeIdx = (() => {
    if (state === "submitted") return 0;
    if (state === "in-review" || state === "needs-info") return 1;
    return 2;
  })();

  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {steps.map((step, i) => {
        const reached = i <= activeIdx;
        return (
          <li key={step.key} className="flex-1 flex items-center gap-2 sm:gap-3">
            <div
              className={`flex items-center gap-2 sm:gap-3 ${reached ? "" : "opacity-40"}`}
              data-testid={`progress-step-${step.key}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border ${
                  reached
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border"
                }`}
              >
                {i + 1}
              </div>
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px ${
                  i < activeIdx
                    ? "bg-gradient-to-r from-primary to-primary/40"
                    : "bg-border"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function NextStepCard({
  href,
  icon: Icon,
  title,
  desc,
  testId,
}: {
  href: string;
  icon: typeof Building;
  title: string;
  desc: string;
  testId: string;
}) {
  const isInternal = href.startsWith("/");
  const inner = (
    <div
      className="group h-full p-6 bg-card border border-border/50 rounded-lg hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
      data-testid={testId}
    >
      <Icon className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors mb-4" />
      <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      <div className="mt-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        Continue <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  );
  if (isInternal) {
    return <Link href={href}>{inner}</Link>;
  }
  return <a href={href}>{inner}</a>;
}

function labelForChoice(c?: "sell" | "build" | "blueprint" | "save"): string {
  switch (c) {
    case "sell":
      return "Sell to Pegasus";
    case "build":
      return "Build with Pegasus";
    case "blueprint":
      return "Get the Deal Blueprint";
    case "save":
      return "Save and decide later";
    default:
      return "—";
  }
}
