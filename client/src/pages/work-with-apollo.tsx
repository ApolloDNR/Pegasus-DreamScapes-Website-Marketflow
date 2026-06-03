import { Link } from "wouter";
import { ArrowRight, Building2, Home, KeyRound, LineChart, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { ComplianceNote, ProcessRail, SectionIntro, SplitHero } from "@/components/site-visuals";

const services = [
  {
    id: "list",
    title: "List With Apollo",
    body: "Pricing, preparation, timing, repair decisions, and market positioning through a value-add lens before the property goes public.",
    icon: Home,
  },
  {
    id: "buy",
    title: "Buy With Apollo",
    body: "Buyer representation for people who want more than a showing schedule: lane fit, risk, upside, and execution reality.",
    icon: KeyRound,
  },
  {
    id: "investor-buyer",
    title: "Investor Buyer Representation",
    body: "A disciplined screen for rental, flip, value-add, and small development opportunities where the plan must survive pressure.",
    icon: LineChart,
  },
  {
    id: "listing-review",
    title: "Home Value / Listing Strategy Review",
    body: "A strategic read on value, market position, preparation, and whether listing is the right lane for the situation.",
    icon: Building2,
  },
];

const laneRules = [
  {
    label: "Pegasus",
    title: "Strategy and operating-company lens.",
    body: "Pegasus Dreamscapes can review property situations, development paths, private relationship routing, and internal operating lanes.",
    icon: Building2,
  },
  {
    label: "Keller Williams",
    title: "Licensed representation lane.",
    body: "Licensed real estate services are provided by Paolo \"Apollo\" Duran through Keller Williams Realty East Bay.",
    icon: Scale,
  },
  {
    label: "Boundary",
    title: "The lane is chosen before the work starts.",
    body: "When representation is the right answer, the relationship is handled through the licensed KW lane with documented terms.",
    icon: ShieldCheck,
  },
];

export default function WorkWithApolloPage() {
  useSEO({
    title: "Work With Apollo",
    description:
      "Licensed real estate representation with Paolo Apollo Duran through Keller Williams Realty East Bay, separate from Pegasus Dreamscapes Corp.",
    image: "/og/default.png",
  });

  return (
    <div className="min-h-screen bg-background">
      <SplitHero
        eyebrow="Real Estate Representation With Apollo"
        title={
          <>
            Strategy-first representation.
            <span className="block pt-2 italic text-[#D4B483]">Clean lane. Clear boundary.</span>
          </>
        }
        subtitle="Apollo brings the Pegasus deal-architecture lens into licensed real estate services when representation is the right answer."
        body="This page is intentionally separate from Pegasus acquisition, development, capital, and MarketFlow language. Representation has its own legal lane."
        primaryCta={{ label: "Contact Apollo", href: "/contact" }}
        secondaryCta={{ label: "Start a Review", href: "/submit?intent=listing" }}
        visual="apollo"
        visualTitle="Pegasus / KW lane board"
        visualCaption="The separation is legible at a glance: Pegasus strategy on one side, licensed representation through Keller Williams on the other."
        labels={[
          { label: "DRE", value: "#02333658" },
          { label: "Brokerage", value: "KW East Bay" },
          { label: "Role", value: "Separate" },
        ]}
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionIntro
            eyebrow="Licensed services"
            title="Representation is one lane. It should be chosen on purpose."
            body="For sellers, buyers, and investors, Apollo can bring a sharper operating lens to the ordinary representation process without blurring the Pegasus and KW boundary."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article key={service.id} id={service.id} className="scroll-mt-32 rounded-md border border-border bg-card p-6">
                  <Icon className="mb-5 h-5 w-5 text-primary" aria-hidden="true" />
                  <h2 className="font-serif text-2xl font-semibold leading-tight">{service.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{service.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-card py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-4">
            <SectionIntro
              eyebrow="Compliance boundary"
              title="The page must be clear before it is persuasive."
              body="A professional reviewer should immediately understand what Apollo can do as a licensed agent and what Pegasus Dreamscapes does separately."
            />
          </div>
          <div className="lg:col-span-8">
            <ProcessRail items={laneRules} />
            <div className="mt-6">
              <ComplianceNote>
                Paolo "Apollo" Duran, Realtor. DRE #02333658. Keller Williams Realty East Bay. Licensed real estate services are provided by Paolo "Apollo" Duran through Keller Williams Realty East Bay. Pegasus Dreamscapes Corp is a separate development, investment, and property strategy company. Nothing on this page guarantees a listing result, purchase result, investment result, valuation, or offer.
              </ComplianceNote>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-12">
          <p className="text-xs font-semibold uppercase text-primary">Next move</p>
          <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Need representation, strategy, or both?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Start with the situation. Apollo will help determine whether licensed representation, Pegasus review, or another path is the correct next step.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/contact">
              <Button className="h-12 rounded-sm bg-primary px-8 text-xs font-semibold uppercase text-white hover:bg-primary/90">
                Contact Apollo
                <ArrowRight className="ml-3 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/submit?intent=listing">
              <Button variant="outline" className="h-12 rounded-sm px-8 text-xs font-semibold uppercase">
                Start a Review
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
