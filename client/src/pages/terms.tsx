import { useSEO } from "@/hooks/use-seo";
import { ContourLines } from "@/pegasus/primitives";
import { Mail, Scale, FileText, Shield, AlertCircle, Users, Briefcase, MessageSquare } from "lucide-react";

const SECTIONS = [
  { id: "agreement", label: "Status", icon: FileText, title: "Operator-prepared draft pending qualified legal review.", kicker: "Document status" },
  { id: "what-we-do", label: "What we do", icon: Briefcase, title: "Strategy-first real estate. Not a public investment platform.", kicker: "What we do" },
  { id: "submissions", label: "Submissions", icon: Users, title: "A submission records a request. It does not promise an outcome.", kicker: "Property submissions" },
  { id: "no-offer", label: "No offer", icon: AlertCircle, title: "Nothing here is an offer of guaranteed returns or principal protected investment products.", kicker: "Not a securities offer" },
  { id: "your-conduct", label: "Your conduct", icon: Shield, title: "Submit honest information. Don't try to break the site.", kicker: "Your conduct" },
  { id: "content", label: "Content", icon: MessageSquare, title: "We own ours. You own yours. You give us a limited license to use it.", kicker: "Content and IP" },
  { id: "liability", label: "Liability", icon: Scale, title: "We do our best. We can't promise outcomes.", kicker: "Limits and disclaimers" },
  { id: "law-contact", label: "Law & contact", icon: Mail, title: "California law. Reach the operator directly.", kicker: "Governing law · Contact" },
];

export default function Terms() {
  useSEO({
    title: "Terms of Service",
    description:
      "Terms of service for Pegasus Dreamscapes Corp.: the public website, Strategy Review intake, and MarketFlow access.",
    image: "/og/default.png",
  });

  return (
    <div className="min-h-screen bg-background">
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 bg-[hsl(var(--charcoal))] text-cream overflow-hidden">
        <ContourLines className="absolute inset-x-0 bottom-0 w-full h-[70%] text-primary opacity-[0.12] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#e3a463] font-supporting font-semibold">
              Terms · Plain language
            </p>
          </div>
          <h1
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] mb-6"
            data-testid="text-terms-title"
          >
            Terms of Service.<br />
            <span className="italic font-medium bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
              The rules of engagement.
            </span>
          </h1>
          <p className="text-lg text-cream/85 leading-relaxed max-w-2xl">
            These operator-prepared terms describe the intended rules for the public website and its
            intake tools. Draft pending qualified legal review; this page is not legal advice.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-muted/30 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#8a5122] dark:text-primary font-supporting font-semibold mb-4">
            Jump to a section
          </p>
          <nav aria-label="On-page navigation" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                data-testid={`link-terms-jump-${s.id}`}
                className="group flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background hover:border-primary/60 hover:bg-primary/5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
              >
                <s.icon className="w-4 h-4 text-[#8a5122] dark:text-primary flex-shrink-0" aria-hidden="true" />
                <span className="truncate">{s.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-x-12 gap-y-14">
            <LegalBlock id="agreement" idx={0} icon={SECTIONS[0].icon} kicker={SECTIONS[0].kicker} title={SECTIONS[0].title}>
              <p>
                This page is an operator-prepared draft pending qualified legal review. It states the
                intended conditions for accessing pegasusdreamscapes.com or submitting a property,
                request, or message. Questions about enforceability or your rights require qualified counsel.
              </p>
            </LegalBlock>

            <LegalBlock id="what-we-do" idx={1} icon={SECTIONS[1].icon} kicker={SECTIONS[1].kicker} title={SECTIONS[1].title}>
              <p>
                Pegasus Dreamscapes Corp. presents educational tools, a limited project record, and
                private intake forms for possible consideration of property, deal, and relationship
                questions. References to possible acquisition, joint-venture, referral, or listing
                paths are not commitments or claims that each path is available for a submission. We
                do not operate a public investment marketplace or securities platform.
              </p>
              <p>
                The site lists Paolo "Apollo" Duran as a California real estate agent, DRE #02333658,
                affiliated with Keller Williams East Bay. Visitors should independently verify current
                license and affiliation information before relying on it. Each office is independently owned and operated.
              </p>
            </LegalBlock>

            <LegalBlock id="submissions" idx={2} icon={SECTIONS[2].icon} kicker={SECTIONS[2].kicker} title={SECTIONS[2].title}>
              <p>
                A property or deal submission records information for possible consideration. It does
                not guarantee review, analysis, an offer, a referral, a listing, an introduction, a
                response, or a response time. Any later path depends on the facts, capacity, diligence,
                applicable law, and separate signed terms.
              </p>
              <p>
                You are responsible for the accuracy of the information you submit and for having
                authority to share it. Receipt does not create representation, confidentiality beyond
                the posted Privacy notice, exclusivity, compensation, or a transaction relationship.
              </p>
            </LegalBlock>

            <LegalBlock id="no-offer" idx={3} icon={SECTIONS[3].icon} kicker={SECTIONS[3].kicker} title={SECTIONS[3].title}>
              <p>
                Nothing on this website is an offer to buy or sell any security, an offer of guaranteed
                returns, or a promise of principal-protected investment products. Any future capital
                relationship, joint venture, or project participation would require separate
                qualification, diligence, documents, and compliance with applicable law.
              </p>
              <p>
                Any reference to a project, structure, or return profile on the public site is descriptive, not promotional. We do not publicly market specific deals, securities, or investment vehicles. Past performance does not predict future results.
              </p>
            </LegalBlock>

            <LegalBlock id="your-conduct" idx={4} icon={SECTIONS[4].icon} kicker={SECTIONS[4].kicker} title={SECTIONS[4].title}>
              <p>
                You agree to submit honest, accurate information. You agree not to misrepresent property facts, impersonate others, harass anyone, or attempt to disrupt the site through scraping, automated abuse, or unauthorized access.
              </p>
              <p>
                We may decline to work with anyone whose conduct, intent, or property situation falls outside our doctrine. We may also remove or refuse to publish content that violates these terms or applicable law.
              </p>
            </LegalBlock>

            <LegalBlock id="content" idx={5} icon={SECTIONS[5].icon} kicker={SECTIONS[5].kicker} title={SECTIONS[5].title}>
              <p>
                The site, its content, the Pegasus name, brand, and operating frameworks belong to Pegasus Dreamscapes Corp. You may read and share public pages with attribution. You may not copy or republish the site or its frameworks for commercial use without written permission.
              </p>
              <p>
                You keep ownership of property information, photos, and other material you submit. By
                submitting it, you grant Pegasus a non-exclusive license to receive, store, and process
                it in connection with the requested intake and related operating records, subject to
                the posted Privacy notice. That license does not require review, routing, or a response.
              </p>
            </LegalBlock>

            <LegalBlock id="liability" idx={6} icon={SECTIONS[6].icon} kicker={SECTIONS[6].kicker} title={SECTIONS[6].title}>
              <p>
                The site, Strategy Lab tools, educational materials, and any calculator output are provided as-is, for general informational and educational use. They are not legal, tax, accounting, or investment advice for your specific situation. Before acting on anything you read or model here, consult licensed professionals who know your facts and jurisdiction.
              </p>
              <p>
                To the maximum extent permitted by law, Pegasus Dreamscapes Corp. is not liable for indirect, incidental, special, or consequential damages arising from your use of the site. Our total liability to you for any claim related to the site is limited to one hundred dollars (US $100).
              </p>
            </LegalBlock>

            <LegalBlock id="law-contact" idx={7} icon={SECTIONS[7].icon} kicker={SECTIONS[7].kicker} title={SECTIONS[7].title}>
              <p>
                These Terms are governed by the laws of the State of California, without regard to conflict-of-law principles. Any dispute will be resolved in the state or federal courts located in Contra Costa County, California.
              </p>
              <p>
                Questions about these Terms go to the operator directly. <a href="mailto:apollo@pegasusdreamscapes.com" className="text-[#8a5122] dark:text-primary underline underline-offset-2" data-testid="link-terms-email">apollo@pegasusdreamscapes.com</a> · <a href="tel:+19257448525" className="text-[#8a5122] dark:text-primary underline underline-offset-2" data-testid="link-terms-phone">925-744-8525</a>.
              </p>
            </LegalBlock>
          </div>

          <div className="mt-16 pt-8 border-t border-border text-sm text-muted-foreground">
            <p>Site-copy consistency update: August 2026. Draft pending qualified legal review.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function LegalBlock({
  id,
  idx,
  icon: Icon,
  kicker,
  title,
  children,
}: {
  id: string;
  idx: number;
  icon: React.ComponentType<{ className?: string }>;
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  const alternate = idx % 2 === 1;
  return (
    <section
      id={id}
      data-testid={`section-terms-${id}`}
      className={
        alternate
          ? "relative overflow-hidden rounded-lg border border-border bg-card/60 p-6 lg:p-7 scroll-mt-32"
          : "relative overflow-hidden scroll-mt-32"
      }
    >
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute top-0 right-0 font-serif text-6xl sm:text-7xl leading-none text-primary/[0.07]"
      >
        {String(idx + 1).padStart(2, "0")}
      </span>

      <div className="relative flex items-center gap-4 mb-4">
        <span className="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-full border border-primary/40 bg-primary/5 text-[#8a5122] dark:text-primary">
          <Icon className="w-5 h-5" aria-hidden="true" />
        </span>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#8a5122] dark:text-primary font-supporting font-semibold">
          {kicker}
        </p>
      </div>
      <h2 className="relative font-serif text-2xl sm:text-[26px] font-semibold tracking-tight mb-4 leading-tight">
        {title}
      </h2>
      <div
        className={
          alternate
            ? "relative space-y-4 text-base text-muted-foreground leading-relaxed"
            : "relative space-y-4 text-base text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-5"
        }
      >
        {children}
      </div>
    </section>
  );
}
