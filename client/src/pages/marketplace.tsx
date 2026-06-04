import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Building2, Lock, Network, ShieldCheck, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useDemoMode } from "@/contexts/demo-mode-context";
import { useSEO } from "@/hooks/use-seo";
import { trackCtaClick } from "@/lib/analytics";
import { ComplianceNote, ProcessRail, SectionIntro, SplitHero } from "@/components/site-visuals";

const flow = [
  {
    label: "Reviewed",
    title: "A property reaches MarketFlow after Pegasus review.",
    body: "MarketFlow is not raw public intake. Opportunities move through Pegasus HQ first so context, lane, and risk are legible.",
    icon: Building2,
  },
  {
    label: "Role-gated",
    title: "Visibility depends on the member's role.",
    body: "Operators, buyers, brokers, vendors, and capital relationships do not all need the same surface or the same access.",
    icon: UserCheck,
  },
  {
    label: "Private",
    title: "Distribution is relationship-based.",
    body: "The network is designed for trusted routing, not public investment solicitation or open marketplace promotion.",
    icon: Lock,
  },
];

const roles = [
  {
    title: "Operators and builders",
    body: "People who can execute scope, field work, and development constraints.",
    icon: Building2,
  },
  {
    title: "Buyers and acquisition partners",
    body: "Relationship buyers who understand reviewed property situations and can act professionally.",
    icon: Network,
  },
  {
    title: "Capital relationships",
    body: "Private conversations only, under proper documentation and without public securities language.",
    icon: ShieldCheck,
  },
];

const buyBoxes = [
  {
    title: "As-is acquisition",
    body: "Distressed or under-managed residential property where speed, certainty, or structure may matter more than retail presentation.",
  },
  {
    title: "Value-add and ADU",
    body: "Properties where value may be created through rehab, ADU, infill, layout correction, entitlement, or better operating control.",
  },
  {
    title: "Investor exit and disposition",
    body: "Renovated or stabilized properties that may need the right buyer lane, listing lane, or private relationship route.",
  },
  {
    title: "Operator and partner fit",
    body: "Projects where execution capacity, vendor depth, capital timing, or an experienced counterparty decides whether the deal can work.",
  },
];

export default function MarketplacePage() {
  const [, setLocation] = useLocation();
  const { isLoading, isAuthenticated, isGuestMode } = useSupabaseAuth();
  const { isDemoMode } = useDemoMode();

  useSEO({
    title: "MarketFlow Beta",
    description:
      "MarketFlow is the private dealflow layer for reviewed opportunities, trusted operators, buyers, and capital relationships. Not a public marketplace.",
    image: "/og/marketflow.png",
  });

  useEffect(() => {
    if (!isLoading && (isAuthenticated || isDemoMode || isGuestMode)) {
      setLocation("/marketflow/deals");
    }
  }, [isLoading, isAuthenticated, isDemoMode, isGuestMode, setLocation]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SplitHero
        eyebrow="MarketFlow / Private Beta"
        title={
          <>
            Reviewed dealflow.
            <span className="block pt-2 italic text-[#D4B483]">Private relationship routing.</span>
          </>
        }
        subtitle="MarketFlow is the private network layer for opportunities that have already passed through the Pegasus review lens."
        body="It is not raw intake, not a public marketplace, and not a public investment solicitation platform."
        primaryCta={{ label: "Request Access", href: "/marketflow/access" }}
        secondaryCta={{ label: "Sign In", href: "/login" }}
        visual="network"
        visualTitle="Role-gated network map"
        visualCaption="MarketFlow is a reviewed network map: property context at the center, role-based access around it."
        labels={[
          { label: "Access", value: "Invite" },
          { label: "Review", value: "HQ first" },
          { label: "Public", value: "No" },
        ]}
      />
      <span className="sr-only" data-testid="text-marketplace-title">
        MarketFlow. The private dealflow layer.
      </span>

      <section className="py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-4">
            <SectionIntro
              eyebrow="How it works"
              title="MarketFlow starts after review, not before."
              body="The professional posture is simple: no one should confuse MarketFlow with a public marketplace or capital raise page."
            />
          </div>
          <div className="lg:col-span-8">
            <ProcessRail items={flow} />
          </div>
        </div>
      </section>

      <section className="bg-card py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionIntro
            eyebrow="Network roles"
            title="Access is based on usefulness, trust, and fit."
            body="MarketFlow is curated. A smaller vetted network is stronger than a public surface pretending every visitor is a qualified participant."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <article key={role.title} className="rounded-md border border-border bg-background p-6">
                  <Icon className="mb-5 h-5 w-5 text-primary" aria-hidden="true" />
                  <h2 className="font-serif text-2xl font-semibold leading-tight">{role.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{role.body}</p>
                </article>
              );
            })}
          </div>
          <BuyBoxSection />
          <div className="mt-8">
            <ComplianceNote>
              MarketFlow is private, role-gated, and beta-stage. Listings, conversations, project references, and capital discussions are not public offers, investment solicitations, or substitutes for independent due diligence.
            </ComplianceNote>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-12">
          <p className="text-xs font-semibold uppercase text-primary">Request access</p>
          <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Introductions matter.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Tell Pegasus who introduced you and what role you can responsibly fill in the network.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/marketflow/access"
              onClick={() => trackCtaClick("marketflow_landing", "Request Beta Access", "/marketflow/access")}
            >
              <Button className="h-12 rounded-sm bg-primary px-8 text-xs font-semibold uppercase text-white hover:bg-primary/90" data-testid="button-join-marketplace">
                Request Beta Access
                <ArrowRight className="ml-3 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="h-12 rounded-sm px-8 text-xs font-semibold uppercase" data-testid="button-sign-in">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function BuyBoxSection() {
  return (
    <div className="mt-14 border border-border bg-background">
      <div className="border-b border-border p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase text-primary">Buy-box routing</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
          MarketFlow is organized around fit, not volume.
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          A buy box is not a promise to buy or distribute. It is a routing filter: what the property is, what problem it carries, and which vetted relationships may be relevant after review.
        </p>
      </div>
      <div className="grid gap-0 md:grid-cols-2">
        {buyBoxes.map((box, index) => (
          <article key={box.title} className="border-b border-border p-6 last:border-b-0 md:border-r md:even:border-r-0">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="font-serif text-2xl font-semibold">{box.title}</h3>
              <span className="font-display text-xs font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{box.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
