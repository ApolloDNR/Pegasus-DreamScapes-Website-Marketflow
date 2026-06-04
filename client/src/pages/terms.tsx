import { useSEO } from "@/hooks/use-seo";
import { Mail, Scale, FileText, Shield, AlertCircle, Users, Briefcase, MessageSquare } from "lucide-react";

const SECTIONS = [
  { id: "agreement", label: "Agreement", icon: FileText, title: "By using the site, you agree to these terms.", kicker: "Agreement" },
  { id: "what-we-do", label: "What we do", icon: Briefcase, title: "Strategy-first real estate. Not a public marketplace.", kicker: "What we do" },
  { id: "submissions", label: "Submissions", icon: Users, title: "Every submission gets a serious read. Not every submission gets an offer.", kicker: "Property submissions" },
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
      "Terms of service for Pegasus Dreamscapes Corp.: the public website, Strategy Review intake, and MarketFlow access. Draft pending legal review.",
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
              Terms · Plain language
            </p>
          </div>
          <h1
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-normal mb-6"
            data-testid="text-terms-title"
          >
            Terms of Service.<br />
            <span className="italic font-medium bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
              The rules of engagement.
            </span>
          </h1>
          <p className="text-lg text-cream/85 leading-relaxed max-w-2xl">
            By using the Pegasus Dreamscapes website, you agree to the terms on this page. They cover what the site is, what it isn't, and how we work together.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10">
            <span className="text-[10px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold">Draft · Pending Legal Review</span>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-muted/30 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
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
                <s.icon className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
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
                These Terms of Service form a binding agreement between you and Pegasus Dreamscapes Corp. when you access pegasusdreamscapes.com or submit a property, request, or message through it. If you do not agree, do not use the site.
              </p>
            </LegalBlock>

            <LegalBlock id="what-we-do" idx={1} icon={SECTIONS[1].icon} kicker={SECTIONS[1].kicker} title={SECTIONS[1].title}>
              <p>
                Pegasus Dreamscapes Corp. is a strategy-first real estate operating company in the East Bay. We acquire, joint-venture, refer, and list real property across acquisition, value-add, ADU, and creative-finance lanes. We do not operate a public investment marketplace.
              </p>
              <p>
                Apollo Duran is a licensed California real estate agent (DRE #02333658) with Keller Williams East Bay. Each office is independently owned and operated.
              </p>
            </LegalBlock>

            <LegalBlock id="submissions" idx={2} icon={SECTIONS[2].icon} kicker={SECTIONS[2].kicker} title={SECTIONS[2].title}>
              <p>
                When you submit a property through the Strategy Review intake, you are asking for a structural read of the situation. Every submission gets a serious review. Not every submission gets an offer. When the right path is a referral, listing, or partner introduction, we will say so plainly.
              </p>
              <p>
                You are responsible for the accuracy of the information you submit. We do not guarantee timing, price, or outcome on any submission.
              </p>
            </LegalBlock>

            <LegalBlock id="no-offer" idx={3} icon={SECTIONS[3].icon} kicker={SECTIONS[3].kicker} title={SECTIONS[3].title}>
              <p>
                Nothing on this website is an offer to buy or sell any security, an offer of guaranteed returns, or a promise of principal protected investment products. Capital relationships, joint ventures, and project participations are conducted privately, on a relationship basis, with parties who qualify under applicable federal and state law.
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
                You keep ownership of any property, photo, or information you submit. By submitting it, you grant us a non-exclusive license to use it to do the work you asked us to do (review, route, and respond), and to keep operating records of that work.
              </p>
            </LegalBlock>

            <LegalBlock id="liability" idx={6} icon={SECTIONS[6].icon} kicker={SECTIONS[6].kicker} title={SECTIONS[6].title}>
              <p>
                The site, the Strategy Lab tools, the Strategy Library, and any calculator output are provided as-is, for general informational and educational use. They are not legal, tax, accounting, or investment advice for your specific situation. Before acting on anything you read or model here, consult licensed professionals who know your facts and jurisdiction.
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
                Questions about these Terms go to the operator directly. <a href="mailto:apollo@pegasusdreamscapes.com" className="text-primary hover:underline" data-testid="link-terms-email">apollo@pegasusdreamscapes.com</a> · <a href="tel:+19257448525" className="text-primary hover:underline" data-testid="link-terms-phone">925-744-8525</a>.
              </p>
            </LegalBlock>
          </div>

          <div className="mt-16 pt-8 border-t border-border text-sm text-muted-foreground">
            <p>Last updated: May 2026. These Terms are a draft pending qualified legal review.</p>
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
          ? "rounded-lg border border-border bg-card/60 p-6 lg:p-7 scroll-mt-32"
          : "scroll-mt-32"
      }
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
          {kicker}
        </p>
      </div>
      <h2 className="font-serif text-2xl sm:text-[26px] font-semibold tracking-tight mb-4 leading-tight">
        {title}
      </h2>
      <div
        className={
          alternate
            ? "space-y-4 text-base text-muted-foreground leading-relaxed"
            : "space-y-4 text-base text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-5"
        }
      >
        {children}
      </div>
    </section>
  );
}
