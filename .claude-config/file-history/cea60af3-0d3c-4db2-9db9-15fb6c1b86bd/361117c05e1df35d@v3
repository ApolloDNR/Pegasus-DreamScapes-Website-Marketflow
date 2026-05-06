import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import {
  Sparkles,
  Inbox,
  Gauge,
  MessageSquare,
  ShieldCheck,
  Workflow,
  ArrowRight,
  Lock,
} from "lucide-react";

const capabilities = [
  {
    icon: Inbox,
    title: "Structured Deal Intake",
    body: "Wholesale, capital, and listing lanes — every opportunity captured the same way, with the data we actually need to underwrite.",
  },
  {
    icon: Gauge,
    title: "Underwriting & Scoring",
    body: "Run numbers, attach documents, and apply Pegasus underwriting templates so deals can be compared on consistent terms.",
  },
  {
    icon: MessageSquare,
    title: "Negotiation Rooms",
    body: "Counter-offer ladders, offer history, and inline messaging — keeping the back-and-forth on the deal, not in scattered threads.",
  },
  {
    icon: Workflow,
    title: "Role-Aware Portals",
    body: "Investors, wholesalers, buyers, and admins each get a portal scoped to what they actually need to do.",
  },
  {
    icon: ShieldCheck,
    title: "Documentation & Audit",
    body: "Decisions, scope, and changes are logged automatically — so the project history is real, not reconstructed later.",
  },
  {
    icon: Sparkles,
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
    title: "MarketFlow Beta | Pegasus Dreamscapes",
    description:
      "MarketFlow is the deal-flow platform inside Pegasus Systems. Currently in invitation-only private beta with a small group of selected operators and partners.",
  });

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-secondary/5 via-background to-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="default" className="gap-1.5 px-3 py-1">
                <Lock className="h-3 w-3" />
                Private Beta · By Invitation
              </Badge>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">
                Pegasus Systems · MarketFlow
              </p>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-3xl">
              MarketFlow.{" "}
              <span className="text-primary">Disciplined deal flow.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-4 leading-relaxed">
              MarketFlow is the dealflow layer of Pegasus Systems — a platform for
              operators, investors, and partners to manage real estate opportunities
              with clarity and accountability.
            </p>
            <p className="text-base text-muted-foreground max-w-2xl mb-8 leading-relaxed">
              MarketFlow is currently in invitation-only private beta. Access and
              features may be limited while the platform is being developed. We're
              working with a small group of selected operators and partners before
              opening access more broadly.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact?subject=marketflow-access">
                <Button size="lg" data-testid="cta-mf-request">
                  Request Beta Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/marketflow">
                <Button variant="outline" size="lg" data-testid="cta-mf-portal">
                  Enter MarketFlow Portal
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 lg:py-28 bg-card">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <ScrollReveal className="text-center mb-14">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
              <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">
                What MarketFlow Does
              </p>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              Built for the way real estate actually moves.
            </h2>
          </ScrollReveal>

          <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
            {capabilities.map((c) => (
              <StaggerItem key={c.title}>
                <Card className="h-full">
                  <CardContent className="p-7">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                      <c.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{c.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Lanes */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            <ScrollReveal className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                <p className="text-sm uppercase tracking-[0.25em] text-primary font-semibold">
                  Three Deal Lanes
                </p>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                One platform. Three serious lanes.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                MarketFlow is structured around the actual shapes real estate deals
                take, not around a generic CRM. Each lane has its own intake,
                underwriting, and decision surface.
              </p>
            </ScrollReveal>

            <div className="lg:col-span-3">
              <StaggerChildren className="space-y-4" staggerDelay={0.1}>
                {lanes.map((l) => (
                  <StaggerItem key={l.name}>
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-2">{l.name}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{l.body}</p>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </StaggerChildren>
            </div>
          </div>
        </div>
      </section>

      {/* Beta status */}
      <section className="py-20 lg:py-28 bg-card">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <ScrollReveal>
            <Card>
              <CardContent className="p-10 md:p-14">
                <Badge className="mb-6 gap-1.5">
                  <Lock className="h-3 w-3" />
                  Beta Status
                </Badge>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                  Why MarketFlow is private — for now.
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed mb-10">
                  <p>
                    MarketFlow is being built from the real operating workflow Pegasus
                    needs to manage deal intake, review, and execution. Because that
                    workflow touches real conversations and real partners, we don't open
                    access publicly until a feature is genuinely ready.
                  </p>
                  <p>
                    During beta, we're working with a small group of selected operators
                    and partners. If MarketFlow could fit how you work, request access
                    and we'll follow up with a real conversation.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/contact?subject=marketflow-access">
                    <Button size="lg">
                      Request Beta Access
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/systems">
                    <Button variant="outline" size="lg">
                      See All Pegasus Systems
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
