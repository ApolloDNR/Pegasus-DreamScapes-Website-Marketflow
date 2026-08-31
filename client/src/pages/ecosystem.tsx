import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal } from "@/components/animations";
import { Button } from "@/components/ui/button";
import { CardSurface } from "@/components/ui/card-primitives";
import { StatusBadge, type StatusBadgeKind } from "@/components/status-badge";
import { ArrowRight, Building2, Network, Hammer, Briefcase, Sparkles } from "lucide-react";

// /ecosystem is the footer-only Audience-B release valve: a single page with
// four product cards, each carrying an honest status badge. Closes with one
// CTA — "Send a note" → the canonical /contact chooser.
const PRODUCTS: Array<{
  name: string;
  icon: typeof Building2;
  status: StatusBadgeKind;
  oneLiner: string;
  body: string;
}> = [
  {
    name: "Pegasus HQ",
    icon: Building2,
    status: "private-beta",
    oneLiner: "The operating system that runs the company.",
    body: "Lead intake, project pipelines, capital partner records, and a daily inbound report from Peggy. Internal-first, gated to operators and capital partners by invite.",
  },
  {
    name: "MarketFlow",
    icon: Network,
    status: "private-beta",
    oneLiner: "Private dealflow and intake routing for the operator network.",
    body: "Where deals route after a strategy review. Operators, wholesalers, buyers, and capital partners each see the lane that matches them. Public landing at /marketflow; role surfaces require an access request.",
  },
  {
    name: "BuildForge",
    icon: Hammer,
    status: "internal",
    oneLiner: "Project management and scope control for active builds.",
    body: "Schedules, scope, vendors, and budget discipline against the underwrite. Used internally on every Pegasus-operated build. Not a public surface yet.",
  },
  {
    name: "CapStack",
    icon: Briefcase,
    status: "in-development",
    oneLiner: "Capital structures and partner records that fund the build.",
    body: "Direct acquisition, JV/co-GP, and creative-finance structures tracked per project. Conversations, not pitches. Written agreement on every deal.",
  },
];

const PEGGY = {
  name: "Peggy",
  icon: Sparkles,
  status: "private-training" as StatusBadgeKind,
  oneLiner: "Pegasus' AI strategy assistant, available on the website in private training.",
  body: "The current website surface listens, qualifies, routes, and hands conversations to Apollo. Phone and voice remain in development; HQ and ecosystem-app integrations are planned, not live.",
};

export default function Ecosystem() {
  useSEO({
    title: "The Pegasus Ecosystem",
    description:
      "The Pegasus Ecosystem. What we're building, honestly. Pegasus HQ, MarketFlow, BuildForge, CapStack, and Peggy. Each surface carries its real status.",
    image: "/og/default.png",
  });

  return (
    <div className="min-h-screen bg-background">
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 bg-navy text-cream overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="relative max-w-5xl mx-auto px-6 lg:px-12">
          <ScrollReveal>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
                Audience B · Ecosystem participants
              </p>
            </div>
            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] leading-[1.02] mb-7"
              data-testid="text-ecosystem-headline"
            >
              The Pegasus Ecosystem.<br />
              <span className="italic bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
                what we're building, honestly.
              </span>
            </h1>
            <p className="text-lg text-cream/85 leading-relaxed max-w-2xl">
              Pegasus DreamScapes is a strategy-first real estate operating company. The ecosystem below is the operating layer that runs the company. Each surface carries its real status: live, private beta, in training, internal, or in development.
            </p>
          </ScrollReveal>
        </div>
        <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
      </section>

      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="grid sm:grid-cols-2 gap-6">
            {PRODUCTS.map((p) => (
              <CardSurface
                key={p.name}
                className="p-7 border-border/40 flex flex-col gap-5"
                data-testid={`ecosystem-card-${p.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-11 h-11 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <p.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <StatusBadge kind={p.status} />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-semibold tracking-tight mb-2">{p.name}</h2>
                  <p className="text-sm text-foreground/85 font-medium leading-snug mb-3">{p.oneLiner}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                </div>
              </CardSurface>
            ))}
          </div>

          <div className="mt-10">
            <CardSurface
              className="p-7 border-border/40 flex flex-col gap-5"
              data-testid="ecosystem-card-peggy"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-11 h-11 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <PEGGY.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <StatusBadge kind={PEGGY.status} />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-semibold tracking-tight mb-2">{PEGGY.name}</h2>
                <p className="text-sm text-foreground/85 font-medium leading-snug mb-3">{PEGGY.oneLiner}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{PEGGY.body}</p>
              </div>
              <Link
                href="/peggy"
                className="text-[11px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary hover:text-[hsl(var(--copper))] inline-flex items-center gap-1.5"
                data-testid="link-ecosystem-peggy"
              >
                The Peggy surface <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </CardSurface>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-[hsl(var(--charcoal))] text-cream">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <ScrollReveal>
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-5">
              The door for ecosystem participants
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-7 leading-tight">
              Start the conversation.
            </h2>
            <p className="text-base text-cream/80 leading-relaxed max-w-xl mx-auto mb-9">
              The ecosystem is invite-led. If something here speaks to what you're building or how you'd want to participate, send a note and we'll start the conversation.
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                className="px-10 py-7 text-sm uppercase tracking-[0.15em] font-semibold bg-[hsl(var(--copper))] hover:bg-[hsl(27_56%_44%)] text-white"
                data-testid="button-ecosystem-connect"
              >
                Send a note
                <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
