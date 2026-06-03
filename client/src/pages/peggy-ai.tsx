import { Link } from "wouter";
import { ArrowRight, Bot, FileSearch, MessageSquare, Phone, Route, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { ComplianceNote, FinalBand, ProcessRail, SectionIntro, SplitHero } from "@/components/site-visuals";

const intakeModes = [
  {
    label: "Chat",
    title: "Help the visitor explain the situation.",
    body: "Peggy asks practical questions: address, role, timeline, condition, pressure, desired outcome, and missing documents.",
    icon: MessageSquare,
  },
  {
    label: "Phone",
    title: "Turn a call into clean intake.",
    body: "The phone layer is designed to stay professional and calm, then hand the right context into Pegasus HQ for review.",
    icon: Phone,
  },
  {
    label: "Form",
    title: "Make the submission easier to finish.",
    body: "If a visitor does not know which door to use, Peggy helps route them to Submit, Strategy Lab, Apollo, MarketFlow, or Contact.",
    icon: Route,
  },
];

const boundaries = [
  "Peggy can ask questions.",
  "Peggy can summarize facts.",
  "Peggy can route visitors.",
  "Peggy can prepare cleaner intake.",
  "Peggy cannot make offers.",
  "Peggy cannot guarantee outcomes.",
];

export default function PeggyAIPage() {
  useSEO({
    title: "Peggy AI",
    description:
      "Peggy is Pegasus Dreamscapes' guided intake assistant for property situations, routing, and human review preparation.",
    image: "/og/default.png",
  });

  return (
    <div className="min-h-screen bg-background">
      <SplitHero
        eyebrow="Peggy AI"
        title={
          <>
            Guided intake.
            <span className="block pt-2 italic text-[#D4B483]">Human decisions.</span>
          </>
        }
        subtitle="Peggy helps visitors explain the property situation clearly before Pegasus reviews the path."
        body="The role is conversation, capture, summary, and routing. Peggy improves the front door without replacing Apollo, licensed judgment, underwriting, or human approval."
        primaryCta={{ label: "Submit a Property", href: "/submit" }}
        secondaryCta={{ label: "Choose a Route", href: "/connect" }}
        visual="peggy"
        visualTitle="Conversation-to-intake map"
        visualCaption="Peggy connects chat, phone, and form intake into one cleaner review packet."
        labels={[
          { label: "Mode", value: "Guided" },
          { label: "Decision", value: "Human" },
          { label: "Output", value: "Intake" },
        ]}
      />

      <section className="py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-4">
            <SectionIntro
              eyebrow="Public role"
              title="Peggy makes the first conversation less confusing."
              body="A distressed owner or busy agent does not need to understand Pegasus's internal system. Peggy helps them describe the facts well enough for review."
            />
          </div>
          <div className="lg:col-span-8">
            <ProcessRail items={intakeModes} />
          </div>
        </div>
      </section>

      <section className="bg-card py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <SectionIntro
                eyebrow="Trust boundary"
                title="The assistant can guide. The company decides."
                body="That boundary is what makes the experience credible. Peggy stays helpful, not magical, and never oversteps into offers, valuation, legal advice, or investment promises."
              />
            </div>
            <div className="lg:col-span-7">
              <div className="grid gap-3 sm:grid-cols-2">
                {boundaries.map((item, index) => (
                  <div key={item} className="flex min-h-20 items-center gap-4 border border-border bg-background p-5">
                    {index < 4 ? (
                      <Bot className="h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                    ) : (
                      <ShieldCheck className="h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                    )}
                    <p className="text-sm font-medium leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <ComplianceNote>
                  Peggy is an intake and routing assistant. Peggy does not issue offers, appraisals, ARV opinions, rehab budgets, lending decisions, legal advice, tax advice, investment advice, agency decisions, or guaranteed outcomes.
                </ComplianceNote>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-6 lg:px-12">
          <div className="border border-border bg-card p-7 sm:p-9">
            <div className="flex items-start gap-5">
              <FileSearch className="mt-1 h-6 w-6 flex-shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase text-primary">What Peggy captures</p>
                <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
                  The useful facts, not a generic chatbot transcript.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Address, property type, condition, owner or submitter role, urgency, desired outcome, price expectation, debt or title issues, renovation scope, photos, documents, and whether the visitor wants acquisition review, Apollo representation, development help, MarketFlow routing, or general strategy.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link href="/submit?intent=property">
                    <Button className="h-12 rounded-sm bg-primary px-7 text-xs font-semibold uppercase text-white hover:bg-primary/90">
                      Start Intake
                      <ArrowRight className="ml-3 h-4 w-4" aria-hidden="true" />
                    </Button>
                  </Link>
                  <Link href="/strategy-lab">
                    <Button variant="outline" className="h-12 rounded-sm px-7 text-xs font-semibold uppercase">
                      Open Strategy Lab
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FinalBand
        eyebrow="Peggy connects the front door"
        title="Conversation should create clarity."
        body="The public site guides people instead of screening them with a cold form. Peggy gives the process a human shape while preserving human control."
        cta={{ label: "Choose a Route", href: "/connect" }}
      />
    </div>
  );
}
