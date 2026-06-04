import { useSEO } from "@/hooks/use-seo";
import { Link } from "wouter";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import { ArrowRight, Building2, Command, Network, FlaskConical, Bot, FileSearch, HardHat, Coins, Wrench } from "lucide-react";

type Status = "LIVE" | "BETA" | "IN BUILD" | "COMING SOON" | "INTAKE ONLY";

type SystemCard = {
  name: string;
  status: Status;
  icon: typeof Building2;
  description: string;
  href?: string;
};

const SYSTEMS: SystemCard[] = [
  {
    name: "Pegasus Dreamscapes",
    status: "LIVE",
    icon: Building2,
    description: "Strategy-first real estate operating company built around Development, Investments, and Systems.",
    href: "/",
  },
  {
    name: "MarketFlow",
    status: "BETA",
    icon: Network,
    description: "Private beta dealflow layer for reviewed opportunities, trusted operators, buyers, and capital relationships. Not raw intake, not a public marketplace, and not an investment solicitation platform.",
    href: "/marketflow",
  },
  {
    name: "Strategy Lab",
    status: "LIVE",
    icon: FlaskConical,
    description: "Public-facing strategy tool. Run a Quick Read or Full Path Builder on a property, compare possible lanes, and decide whether to save a Snapshot or submit to Pegasus for review.",
    href: "/strategy-lab",
  },
  {
    name: "Pegasus HQ",
    status: "IN BUILD",
    icon: Command,
    description: "Internal operating command center for Submissions, Seeds, Strategy Snapshots, Opportunities, War Rooms, tasks, documents, money, approvals, and audit trails.",
  },
  {
    name: "Peggy",
    status: "IN BUILD",
    icon: Bot,
    description: "Pegasus Strategy Assistant. Guides intake, explains high-level strategies, prepares drafts, and helps route users. Does not make offers, guarantee outcomes, approve deals, or give legal/tax/securities advice.",
  },
  {
    name: "Written Review",
    status: "IN BUILD",
    icon: FileSearch,
    description: "Private operator memo path scoped after Pegasus understands the property, the pressure, and the cleanest participation lane.",
    href: "/submit?intent=strategy-review",
  },
  {
    name: "BuildForge",
    status: "COMING SOON",
    icon: HardHat,
    description: "Future execution and vendor-operations layer for scopes, budgets, contractors, schedules, draw requests, change orders, and project accountability.",
  },
  {
    name: "CapStack",
    status: "COMING SOON",
    icon: Coins,
    description: "Future capital-relationship and deal-structure layer for private capital conversations, capital stacks, waterfalls, investor records, and compliant capital coordination.",
  },
  {
    name: "Vendor Network",
    status: "INTAKE ONLY",
    icon: Wrench,
    description: "Intake and qualification path for contractors, vendors, operators, and service providers who may support Pegasus-controlled projects or future BuildForge workflows.",
    href: "/vendor-network",
  },
];

const STATUS_STYLES: Record<Status, string> = {
  "LIVE": "bg-primary/15 text-primary border-primary/30",
  "BETA": "bg-primary/10 text-primary border-primary/25",
  "IN BUILD": "bg-foreground/8 text-foreground/80 border-foreground/20",
  "COMING SOON": "bg-muted text-muted-foreground border-border",
  "INTAKE ONLY": "bg-foreground/8 text-foreground/80 border-foreground/20",
};

export default function SystemsPage() {
  useSEO({
    title: "Pegasus Systems — The operating infrastructure behind the company",
    description: "Pegasus Dreamscapes is building a connected operating ecosystem for strategy-first real estate execution. Some tools are live today. Others are being developed from real operational needs inside the company.",
  });

  return (
    <div className="min-h-screen bg-background pt-24 pb-24" data-testid="page-systems">
      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal>
          <header className="mb-16 text-center max-w-3xl mx-auto">
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
              Pegasus Systems
            </p>
            <h1
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-normal leading-[0.98] mb-6"
              data-testid="text-systems-title"
            >
              The operating infrastructure behind the company.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Pegasus Dreamscapes is building a connected operating ecosystem for strategy-first real estate execution.
              Some tools are live today. Others are being developed from real operational needs inside the company.
            </p>
          </header>
        </ScrollReveal>

        <StaggerChildren>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SYSTEMS.map((sys) => {
              const Icon = sys.icon;
              const Wrapper = ({ children }: { children: React.ReactNode }) =>
                sys.href ? (
                  <Link
                    href={sys.href}
                    className="block group"
                    data-testid={`link-system-${sys.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {children}
                  </Link>
                ) : (
                  <div data-testid={`card-system-${sys.name.toLowerCase().replace(/\s+/g, "-")}`}>
                    {children}
                  </div>
                );

              return (
                <StaggerItem key={sys.name}>
                  <Wrapper>
                    <article className="h-full bg-card border border-border rounded-lg p-7 transition-all hover:border-primary/40 hover:shadow-lg">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span
                          className={`text-[10px] uppercase tracking-[0.18em] font-supporting font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[sys.status]}`}
                          data-testid={`badge-status-${sys.name.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {sys.status}
                        </span>
                      </div>
                      <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight leading-tight mb-3">
                        {sys.name}
                      </h2>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {sys.description}
                      </p>
                      {sys.href && (
                        <div className="mt-5 text-sm font-supporting uppercase tracking-[0.2em] text-primary inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                          Explore
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </article>
                  </Wrapper>
                </StaggerItem>
              );
            })}
          </div>
        </StaggerChildren>

        <ScrollReveal>
          <section className="mt-20 max-w-3xl mx-auto text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
              How it fits together
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-tight mb-6">
              Website captures. HQ owns truth. MarketFlow distributes approved opportunities.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              The public site is the front door. Pegasus HQ is where every submission lives, gets reviewed, and gets routed.
              MarketFlow is the private layer where reviewed opportunities meet trusted operators and capital. BuildForge and CapStack
              are how execution and capital coordination scale next, on the same operating spine.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/submit?intent=property"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-supporting uppercase tracking-[0.18em] text-sm"
                data-testid="link-systems-cta-sell"
              >
                Start a Strategy Review
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/marketflow"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:border-primary/40 transition-colors font-supporting uppercase tracking-[0.18em] text-sm"
                data-testid="link-systems-cta-marketflow"
              >
                See MarketFlow
              </Link>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}
