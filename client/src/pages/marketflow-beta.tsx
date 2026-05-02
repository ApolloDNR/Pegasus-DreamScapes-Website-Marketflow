import {
  Sparkles,
  Inbox,
  Gauge,
  MessageSquare,
  ShieldCheck,
  Workflow,
  ArrowUpRight,
} from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import {
  Section,
  Kicker,
  CopperRule,
  DisplayHeading,
  CTAButton,
  Reveal,
} from "@/components/brand/atoms";
import { PegasusWatermark } from "@/components/brand/pegasus-mark";

const capabilities = [
  {
    icon: <Inbox className="h-5 w-5" />,
    title: "Structured Deal Intake",
    body: "Wholesale, capital, and listing lanes — every opportunity captured the same way, with the data we actually need to underwrite.",
  },
  {
    icon: <Gauge className="h-5 w-5" />,
    title: "Underwriting & Scoring",
    body: "Run numbers, attach documents, and apply Pegasus underwriting templates so deals can be compared on consistent terms.",
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: "Negotiation Rooms",
    body: "Counter-offer ladders, offer history, and inline messaging — keeping the back-and-forth on the deal, not in scattered threads.",
  },
  {
    icon: <Workflow className="h-5 w-5" />,
    title: "Role-Aware Portals",
    body: "Investors, wholesalers, buyers, and admins each get a portal scoped to what they actually need to do.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Documentation & Audit",
    body: "Decisions, scope, and changes are logged automatically — so the project history is real, not reconstructed later.",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Peggy Assist",
    body: "Pegasus's internal AI assistant, embedded where it's useful — for context, summaries, and faster decisions.",
  },
];

const lanes = [
  {
    name: "Wholesale Lane",
    body: "For wholesalers and deal sources to submit and track real opportunities — with the structure and seriousness those deals deserve.",
  },
  {
    name: "Capital Lane",
    body: "For capital partners and operators to surface, evaluate, and structure capital opportunities on Pegasus-led or partner-led deals.",
  },
  {
    name: "Listing Lane",
    body: "For renovated and stabilized properties moving from project to market — buyers, agents, and sellers in one shared workspace.",
  },
];

export default function MarketFlowBeta() {
  useSEO({
    title: "MarketFlow Beta",
    description:
      "MarketFlow is the deal-flow command center inside Pegasus Systems. Currently in invitation-only private beta with a small group of selected operators and partners.",
  });

  return (
    <div className="bg-background">
      {/* Hero */}
      <Section variant="hero" className="overflow-hidden">
        <div className="absolute inset-0 bg-architect opacity-[0.16]" aria-hidden />
        <PegasusWatermark className="pointer-events-none absolute -right-24 top-12 h-[440px] w-[720px] opacity-25" />
        <div className="container-premium relative pt-36 pb-20 md:pt-44 md:pb-28">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-sm border border-copper/40 bg-copper/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-copper">
              <Sparkles className="h-3 w-3" />
              Private Beta · By invitation
            </div>
          </Reveal>
          <Reveal delay={80}>
            <DisplayHeading
              as="h1"
              className="mt-6 max-w-4xl text-[44px] sm:text-[58px] md:text-[72px]"
            >
              MarketFlow.
              <br />
              <span className="text-copper">Disciplined deal flow.</span>
            </DisplayHeading>
          </Reveal>
          <Reveal delay={140}>
            <p className="lead mt-8 max-w-2xl">
              MarketFlow is the deal-flow command center inside Pegasus
              Systems. It exists to give operators, investors, and partners a
              clear, accountable view of real estate opportunities — from
              intake to decision to execution.
            </p>
            <p className="lead mt-4 max-w-2xl">
              MarketFlow is currently in invitation-only private beta. We're
              working closely with a small group of selected operators and
              partners before opening access more broadly.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-10 flex flex-wrap gap-4">
              <CTAButton href="/contact?subject=marketflow-access" testId="cta-mf-request">
                Request Access
              </CTAButton>
              <CTAButton href="/marketflow" variant="ghost" testId="cta-mf-portal">
                Enter MarketFlow Portal
              </CTAButton>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Capabilities */}
      <Section variant="canvas">
        <div className="container-premium section-y">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Kicker>What MarketFlow Does</Kicker>
            <DisplayHeading className="mt-4 text-4xl md:text-5xl">
              Built for the way real estate actually moves.
            </DisplayHeading>
            <CopperRule className="mt-10" />
          </Reveal>

          <div className="mt-14 grid gap-px overflow-hidden rounded-sm border border-copper/15 bg-copper/15 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c, i) => (
              <Reveal key={c.title} delay={i * 60}>
                <div className="h-full bg-card p-8">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-copper/35 text-copper">
                    {c.icon}
                  </span>
                  <h4 className="font-display mt-5 text-2xl text-foreground">{c.title}</h4>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
                    {c.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Lanes */}
      <Section variant="ink">
        <div className="container-premium section-y">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <Kicker>Three Deal Lanes</Kicker>
              <DisplayHeading className="mt-4 text-4xl md:text-5xl">
                One platform. Three serious lanes.
              </DisplayHeading>
              <p className="lead mt-6">
                MarketFlow is structured around the actual shapes real estate
                deals take, not around a generic CRM. Each lane has its own
                intake, underwriting, and decision surface.
              </p>
            </Reveal>
            <div className="lg:col-span-7">
              <div className="space-y-px overflow-hidden rounded-sm border border-copper/15 bg-copper/15">
                {lanes.map((l, i) => (
                  <Reveal key={l.name} delay={i * 80}>
                    <div className="bg-card p-7">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="font-display text-2xl text-foreground">{l.name}</h4>
                        <ArrowUpRight className="h-4 w-4 text-copper/70" />
                      </div>
                      <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
                        {l.body}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Beta status */}
      <Section variant="canvas">
        <div className="container-premium section-y">
          <Reveal className="mx-auto max-w-4xl">
            <div className="rounded-sm border border-copper/30 bg-card p-10 md:p-14">
              <Kicker>Beta Status</Kicker>
              <DisplayHeading className="mt-4 text-3xl md:text-4xl">
                Why MarketFlow is private — for now.
              </DisplayHeading>
              <div className="mt-8 space-y-5 text-[15.5px] leading-relaxed text-foreground/85">
                <p>
                  MarketFlow is being built from the real operating workflow
                  Pegasus needs to manage deal intake, review, and execution.
                  Because that workflow touches real conversations and real
                  partners, we don't open access publicly until a feature is
                  genuinely ready.
                </p>
                <p>
                  During beta, we're working with a small group of selected
                  operators and partners. If MarketFlow could fit how you
                  work, request access and we'll follow up with a real
                  conversation.
                </p>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <CTAButton href="/contact?subject=marketflow-access">
                  Request Beta Access
                </CTAButton>
                <CTAButton href="/systems" variant="ghost">
                  See All Pegasus Systems
                </CTAButton>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </div>
  );
}
