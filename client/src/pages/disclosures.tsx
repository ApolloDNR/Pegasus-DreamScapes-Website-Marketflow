import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal } from "@/components/animations";
import { Shield, AlertCircle, BookOpen, MessageSquare, Home as HomeIcon, Mail } from "lucide-react";

export default function Disclosures() {
  useSEO({
    title: "Disclosures",
    description:
      "Disclosures for Pegasus DreamScapes Corp. Not an offer to buy or sell securities. No guarantee of returns or principal protection. Educational content only.",
    image: "/og/default.png",
  });

  return (
    <div className="min-h-screen bg-background">
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 bg-navy text-cream overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-champagne/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
              Compliance · Plain language
            </p>
          </div>
          <h1
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] mb-6"
            data-testid="text-disclosures-title"
          >
            Disclosures.<br />
            <span className="italic font-medium bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
              What this site is, and what it is not.
            </span>
          </h1>
          <p className="text-lg text-cream/85 leading-relaxed max-w-2xl">
            Pegasus DreamScapes Corp. is a strategy-first real estate operating company. This page explains how we present our work, our limitations, and the rules of engagement for anything you read, calculate, or submit through this site.
          </p>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <ScrollReveal>
            <DisclosureBlock
              icon={AlertCircle}
              kicker="Not an offer of securities"
              title="This site is not an investment solicitation."
              testId="disclosure-securities"
            >
              <p>
                Nothing on this website constitutes an offer to buy or sell any security, an offer of guaranteed returns, or a promise of principal protection. Capital relationships, joint ventures, and project participations are conducted privately, on a relationship basis, with parties who qualify under applicable federal and state law.
              </p>
              <p>
                Any reference to a project, structure, or return profile on the public site is descriptive, not promotional. We do not publicly market specific deals, securities, or investment vehicles.
              </p>
            </DisclosureBlock>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <DisclosureBlock
              icon={HomeIcon}
              kicker="Real estate transactions"
              title="We do not promise an offer on any property."
              testId="disclosure-realestate"
            >
              <p>
                Submitting a property through the Strategy Review intake or through Peggy is a request for a structural read of the situation. Every submission gets a serious review. Not every submission gets an offer. When the right path is a referral, listing, or partner introduction, we will say so plainly.
              </p>
              <p>
                Pegasus DreamScapes operates across acquisition, joint venture, creative-finance, listing, and referral lanes. The lane that fits the property is the lane we route it to. We do not guarantee timing, price, or outcome on any submission.
              </p>
            </DisclosureBlock>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <DisclosureBlock
              icon={BookOpen}
              kicker="Strategy Library and Calculators"
              title="Educational content. Not advice."
              testId="disclosure-education"
            >
              <p>
                The Strategy Library, calculators, articles, and worked examples on this site are educational. They are not legal, tax, accounting, or investment advice for your specific situation. Numbers entered into the calculators are illustrative and depend entirely on the inputs you provide.
              </p>
              <p>
                Before acting on anything you read, model, or calculate here, consult licensed professionals (real estate attorney, CPA, lender, broker) who know your specific facts and jurisdiction.
              </p>
            </DisclosureBlock>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <DisclosureBlock
              icon={MessageSquare}
              kicker="Peggy Strategy Assistant"
              title="A guide. Not the decision-maker."
              testId="disclosure-peggy"
            >
              <p>
                Peggy is an AI-powered strategy assistant trained on the Pegasus operating philosophy. Peggy can route you to the right lane, summarize structural options, and help you start a Strategy Review. Peggy cannot give legal, tax, or investment advice; cannot quote a specific offer; and cannot guarantee an outcome.
              </p>
              <p>
                Decisions on offers, structures, and capital relationships are always made by Pegasus operators, not by the AI. Peggy responses are conversational guidance, not contractual representations of the company.
              </p>
            </DisclosureBlock>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <DisclosureBlock
              icon={Shield}
              kicker="MarketFlow access"
              title="Private dealflow. Invite-only."
              testId="disclosure-marketflow"
            >
              <p>
                MarketFlow is a private dealflow layer for reviewed opportunities, vetted operators, buyers, and capital relationships. Visibility is role-gated. Listings inside MarketFlow are not public offers. Access does not constitute, and is not a substitute for, the due diligence required of any real estate or capital transaction.
              </p>
            </DisclosureBlock>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <DisclosureBlock
              icon={Shield}
              kicker="Equal housing & fair dealing"
              title="We comply with federal and state fair-housing law."
              testId="disclosure-fairhousing"
            >
              <p>
                Pegasus DreamScapes Corp. operates in compliance with the federal Fair Housing Act and applicable state fair-housing statutes. We do not discriminate on the basis of race, color, religion, sex, national origin, familial status, disability, or any other protected class.
              </p>
            </DisclosureBlock>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="mt-16 pt-10 border-t border-border">
              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-2">
                    Questions about this page
                  </p>
                  <p className="text-base text-foreground/90 leading-relaxed">
                    Reach the operator directly. <a href="mailto:apollo@pegasusdreamscapes.com" className="text-primary hover:underline">apollo@pegasusdreamscapes.com</a> · <a href="tel:+19257448525" className="text-primary hover:underline">925-744-8525</a>.
                  </p>
                  <p className="text-sm text-muted-foreground mt-3 italic">
                    Last updated: May 2026
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}

function DisclosureBlock({
  icon: Icon,
  kicker,
  title,
  children,
  testId,
}: {
  icon: React.ComponentType<{ className?: string }>;
  kicker: string;
  title: string;
  children: React.ReactNode;
  testId: string;
}) {
  return (
    <div className="mb-14 last:mb-0" data-testid={testId}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
          {kicker}
        </p>
      </div>
      <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight mb-5 leading-tight">
        {title}
      </h2>
      <div className="space-y-4 text-base text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-6">
        {children}
      </div>
    </div>
  );
}
