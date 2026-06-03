import { Link } from "wouter";
import { ArrowRight, Bot, Building2, Database, FlaskConical, Network, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { ComplianceNote, ProcessRail, SectionIntro, SplitHero } from "@/components/site-visuals";

const systems = [
  {
    label: "Live",
    title: "Website",
    body: "The public front door for submissions, representation, development, and relationship routing.",
    icon: Building2,
  },
  {
    label: "Live",
    title: "Strategy Lab",
    body: "The analysis surface that turns a property situation into a preliminary lane read.",
    icon: FlaskConical,
  },
  {
    label: "In build",
    title: "Peggy AI",
    body: "A Pegasus intelligence layer for intake guidance, summaries, drafting support, and internal operator assistance.",
    icon: Bot,
  },
  {
    label: "Internal",
    title: "Pegasus HQ",
    body: "The operating system for reviewed submissions, relationships, follow-up, and truth maintenance.",
    icon: Database,
  },
  {
    label: "Private beta",
    title: "MarketFlow",
    body: "A private network layer for reviewed opportunities, buyers, operators, and relationship-based access.",
    icon: Network,
  },
  {
    label: "Planned",
    title: "BuildForge / CapStack",
    body: "Future execution and capital-support layers. No public offer, no public fund, and no overclaiming.",
    icon: Workflow,
  },
];

export default function EcosystemPage() {
  useSEO({
    title: "Pegasus Ecosystem",
    description:
      "How Pegasus Dreamscapes connects the website, Strategy Lab, Peggy AI, HQ, MarketFlow, and planned operating systems.",
    image: "/og/default.png",
  });

  return (
    <div className="min-h-screen bg-background">
      <SplitHero
        eyebrow="Pegasus Ecosystem"
        title={
          <>
            One company.
            <span className="block pt-2 italic text-[#D4B483]">Multiple operating surfaces.</span>
          </>
        }
        subtitle="Pegasus is built as a connected company: public intake, strategy analysis, human review, private routing, and disciplined execution."
        body="The ecosystem page should be clear about maturity. Some layers are live, some are private, some are internal, and some are planned."
        primaryCta={{ label: "Submit a Property", href: "/submit" }}
        secondaryCta={{ label: "Strategy Lab", href: "/strategy-lab" }}
        visual="ecosystem"
        visualTitle="Operating map"
        visualCaption="The public site, Strategy Lab, Peggy, HQ, and MarketFlow connect without overstating what each system does today."
        labels={[
          { label: "Public", value: "Website" },
          { label: "Internal", value: "HQ" },
          { label: "Private", value: "Flow" },
        ]}
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionIntro
            eyebrow="Status map"
            title="Clear status beats fake maturity."
            body="Professional reviewers can tell when a company overclaims. Pegasus should show the system clearly and label each layer honestly."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {systems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-md border border-border bg-card p-6">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    <span className="rounded-sm border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase text-primary">
                      {item.label}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl font-semibold leading-tight">{item.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
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
              eyebrow="Operating path"
              title="The surfaces connect without confusing the user."
              body="A visitor should understand which surface is public, which is private, and which is used behind the scenes."
            />
          </div>
          <div className="lg:col-span-8">
            <ProcessRail
              items={[
                {
                  label: "Public",
                  title: "Website and Strategy Lab.",
                  body: "The user can submit a situation, run preliminary analysis, and understand the Pegasus method.",
                  icon: Building2,
                },
                {
                  label: "Internal",
                  title: "Pegasus HQ and human review.",
                  body: "Reviewed submissions, strategy snapshots, lane decisions, and relationship records live in the operating system.",
                  icon: Database,
                },
                {
                  label: "Private",
                  title: "MarketFlow and future execution layers.",
                  body: "Reviewed opportunities and relationships move through gated surfaces when the facts support it.",
                  icon: Network,
                },
              ]}
            />
            <div className="mt-6">
              <ComplianceNote>
                The ecosystem page is informational. Planned systems, private beta surfaces, and internal tools do not create an offer, agency relationship, investment relationship, or guarantee of availability.
              </ComplianceNote>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-12">
          <h2 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Start with the property. The system routes from there.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            The public surface should get people to the right next step, then let the operating system do the work.
          </p>
          <Link href="/submit">
            <Button className="mt-9 h-12 rounded-sm bg-primary px-8 text-xs font-semibold uppercase text-white hover:bg-primary/90">
              Submit a Property
              <ArrowRight className="ml-3 h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
