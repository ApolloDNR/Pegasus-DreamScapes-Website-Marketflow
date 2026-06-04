import { Link } from "wouter";
import { ArrowRight, FileCheck2, Lock, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { ComplianceNote, ProcessRail, SectionIntro, SplitHero } from "@/components/site-visuals";

const capitalProcess = [
  {
    label: "Relationship",
    title: "A conversation starts by introduction.",
    body: "Pegasus does not advertise capital opportunities to the public. Conversations are private and individual.",
    icon: MessageSquare,
  },
  {
    label: "Review",
    title: "The deal, role, risk, and documents are read first.",
    body: "Any future structure depends on the actual project, the parties, suitability, counsel, and written terms.",
    icon: FileCheck2,
  },
  {
    label: "Documentation",
    title: "Nothing moves on a handshake.",
    body: "If a private relationship advances, the arrangement is documented under appropriate written agreement before capital moves.",
    icon: ShieldCheck,
  },
];

const boundaries = [
  "No public investment product.",
  "No public securities offering.",
  "No guaranteed returns.",
  "No principal protection promise.",
  "No advertised deal access.",
  "No capital conversation without documentation.",
];

export default function CapitalPage() {
  useSEO({
    title: "Capital Partnerships",
    description:
      "Private capital relationships under written agreement. Conversations are individual and by introduction. Not a public solicitation.",
    image: "/og/capital.png",
  });

  return (
    <div className="min-h-screen bg-background">
      <SplitHero
        eyebrow="Capital Partnerships"
        title={
          <>
            Capital is private.
            <span className="block pt-2 italic text-[#D4B483]">Structure comes first.</span>
          </>
        }
        subtitle="Pegasus does not sell securities, run a public fund, or advertise capital opportunities."
        body="Capital conversations are individual, relationship-based, and documented deal by deal when appropriate."
        primaryCta={{ label: "Contact Apollo", href: "/contact" }}
        secondaryCta={{ label: "Read Disclosures", href: "/disclosures" }}
        visual="capital"
        visualTitle="Private capital ledger"
        visualCaption="Capital conversations stay private, reviewed, written, and never publicly marketed."
        labels={[
          { label: "Access", value: "Private" },
          { label: "Terms", value: "Written" },
          { label: "Public", value: "No offer" },
        ]}
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-4">
            <SectionIntro
              eyebrow="Capital posture"
              title="This page should lower risk, not create it."
              body="The professional version is quiet and specific: Pegasus may have private capital relationships, but the website is not where opportunities are offered."
            />
          </div>
          <div className="lg:col-span-8">
            <ProcessRail items={capitalProcess} />
          </div>
        </div>
      </section>

      <section className="bg-card py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionIntro
            eyebrow="Public boundaries"
            title="What this page does not do."
            body="Capital pages can create avoidable risk when they sound promotional. Pegasus keeps the public posture narrow."
          />
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {boundaries.map((item) => (
              <div key={item} className="rounded-md border border-border bg-background p-5">
                <Lock className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
                <p className="font-serif text-xl font-semibold leading-tight">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <ComplianceNote>
              Nothing on this page is an offer to buy or sell any security, an offer of guaranteed returns, a recommendation, or a solicitation. Capital relationships, joint ventures, and project participations are discussed privately with appropriate parties under written documentation and applicable law.
            </ComplianceNote>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-12">
          <p className="text-xs font-semibold uppercase text-primary">Already in conversation</p>
          <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight sm:text-5xl">
            Keep the conversation direct.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            There is no general capital form. That is intentional.
          </p>
          <Link href="/contact">
            <Button className="mt-9 h-12 rounded-sm bg-primary px-8 text-xs font-semibold uppercase text-white hover:bg-primary/90" data-testid="button-capital-contact">
              Contact Apollo
              <ArrowRight className="ml-3 h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
