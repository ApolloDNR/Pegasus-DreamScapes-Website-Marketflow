import { Link } from "wouter";
import { ArrowRight, Banknote, Building2, Hammer, Handshake, Network, Route } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { trackCtaClick } from "@/lib/analytics";
import { ComplianceNote, ProcessRail, SectionIntro, SplitHero } from "@/components/site-visuals";

const ROUTES = [
  {
    href: "/submit?intent=property",
    label: "I have a property situation",
    sub: "Ownership pressure, deferred maintenance, messy terms, timing, or an unusual opportunity.",
    icon: Building2,
  },
  {
    href: "/submit?intent=offer",
    label: "I want Pegasus to review a possible offer",
    sub: "As-is sale, direct acquisition, assignment, or another structure where Pegasus may participate after review.",
    icon: Route,
  },
  {
    href: "/work-with-apollo",
    label: "I may want listing representation",
    sub: "Apollo's licensed Keller Williams lane for owners and investors considering a listing strategy.",
    icon: Handshake,
  },
  {
    href: "/development",
    label: "I want to build or renovate",
    sub: "ADU, rehab, value-add, infill, or a project that needs a clearer operating path.",
    icon: Hammer,
  },
  {
    href: "/capital",
    label: "I am a capital relationship",
    sub: "Private, documented conversations only. No public offer and no public investment product.",
    icon: Banknote,
  },
  {
    href: "/vendor-network",
    label: "I am an operator or vendor",
    sub: "Trade, contractor, broker, consultant, buyer, or service partner with real execution capability.",
    icon: Network,
  },
];

const nextSteps = [
  {
    label: "Step 01",
    title: "Pick the lane that matches the reason you scanned.",
    body: "This page is built for real-world conversations: cards, QR scans, referrals, and property moments where speed matters.",
  },
  {
    label: "Step 02",
    title: "Send the minimum useful context.",
    body: "A property address, the pressure, timeline, role, and contact path are enough to start a serious review.",
  },
  {
    label: "Step 03",
    title: "Pegasus routes the next move.",
    body: "The answer may be acquisition, development, representation, referral, MarketFlow, or a clean pass.",
  },
];

export default function ConnectPage() {
  useSEO({
    title: "Connect with Apollo",
    description:
      "The Pegasus Dreamscapes card and QR landing page. Route your property, build, capital, vendor, or direct Apollo conversation.",
    image: "/og/default.png",
  });

  return (
    <div className="min-h-screen bg-background">
      <SplitHero
        eyebrow="Pegasus Dreamscapes / Apollo"
        title={
          <>
            You found the card.
            <span className="block pt-2 italic text-[#D4B483]">Now choose the right lane.</span>
          </>
        }
        subtitle="This page exists to route a real conversation into the correct Pegasus path."
        body="No maze. No public marketplace pitch. Pick the reason you came here and Pegasus will move the situation to the right surface."
        primaryCta={{ label: "Submit a Property", href: "/submit" }}
        secondaryCta={{ label: "Contact Apollo", href: "/contact" }}
        visual="connect"
        visualTitle="Card to route map"
        visualCaption="A QR scan moves a real-world conversation into the correct operating lane without making the visitor decode the whole company."
        labels={[
          { label: "Primary", value: "Submit" },
          { label: "Private", value: "Capital" },
          { label: "Licensed", value: "Apollo" },
        ]}
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionIntro
            eyebrow="Route selection"
            title="The right first click depends on the situation."
            body="The QR target is calm, exact, and useful. Each path below sends the visitor to the surface that can actually handle that kind of conversation."
          />

          <div className="mt-12 grid gap-3 md:grid-cols-2">
            {ROUTES.map((route) => {
              const Icon = route.icon;
              const slug = route.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => trackCtaClick("connect", route.label, route.href)}
                  className="group block rounded-md border border-border bg-card p-5 transition-colors hover:border-primary/55 hover:bg-primary/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  data-testid={`link-connect-${slug}`}
                >
                  <div className="flex items-start gap-5">
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-sm border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <h2 className="font-serif text-2xl font-semibold leading-tight text-foreground group-hover:text-primary">
                          {route.label}
                        </h2>
                        <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{route.sub}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-card py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-4">
            <SectionIntro
              eyebrow="Next move"
              title="The card is not the pitch. It is the router."
              body="A professional contact page should reduce friction and increase clarity. Pegasus earns trust by moving the person to the correct lane first."
            />
          </div>
          <div className="lg:col-span-8">
            <ProcessRail items={nextSteps} />
            <div className="mt-6">
              <ComplianceNote>
                Submitting a route selection or property request does not create an agency relationship, investment relationship, offer, valuation, or commitment. Licensed real estate services, when applicable, are handled through Apollo's Keller Williams lane.
              </ComplianceNote>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
