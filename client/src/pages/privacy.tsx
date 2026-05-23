import { useSEO } from "@/hooks/use-seo";
import { Mail, Shield, Database, Cookie, UserCheck, Scale, FileText } from "lucide-react";

const SECTIONS = [
  { id: "scope", label: "Scope", icon: Shield, title: "What this policy covers.", kicker: "Scope" },
  { id: "what-we-collect", label: "What we collect", icon: Database, title: "Only what we need to do the work.", kicker: "What we collect" },
  { id: "how-we-use-it", label: "How we use it", icon: FileText, title: "Review your situation. Reply to you. Improve the site.", kicker: "How we use it" },
  { id: "sharing", label: "Sharing", icon: UserCheck, title: "We do not sell your information.", kicker: "Sharing" },
  { id: "cookies", label: "Cookies", icon: Cookie, title: "Consent-gated analytics. No advertising trackers.", kicker: "Cookies and analytics" },
  { id: "your-rights", label: "Your rights", icon: Scale, title: "Access, correction, deletion, opt-out.", kicker: "Your rights" },
  { id: "security", label: "Security", icon: Shield, title: "Reasonable safeguards. No system is perfect.", kicker: "Security and retention" },
  { id: "contact", label: "Contact", icon: Mail, title: "Reach the operator directly.", kicker: "Contact" },
];

export default function Privacy() {
  useSEO({
    title: "Privacy Policy",
    description:
      "Privacy policy for Pegasus DreamScapes Corp. What we collect, how we use it, and how to reach us. Draft pending legal review.",
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
              Privacy · Plain language
            </p>
          </div>
          <h1
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] mb-6"
            data-testid="text-privacy-title"
          >
            Privacy Policy.<br />
            <span className="italic font-medium bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
              What we collect, what we don't.
            </span>
          </h1>
          <p className="text-lg text-cream/85 leading-relaxed max-w-2xl">
            Pegasus DreamScapes Corp. respects your privacy. This page explains what we collect when you use the site, why we collect it, and how to reach us if you want it changed or removed.
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
                data-testid={`link-privacy-jump-${s.id}`}
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
            <LegalBlock id="scope" idx={0} icon={SECTIONS[0].icon} kicker={SECTIONS[0].kicker} title={SECTIONS[0].title}>
              <p>
                This policy covers pegasusdreamscapes.com and the intake forms reachable from it (Strategy Review, Contact, MarketFlow Access, Vendor Network). It does not cover third-party sites you may reach through outbound links.
              </p>
            </LegalBlock>

            <LegalBlock id="what-we-collect" idx={1} icon={SECTIONS[1].icon} kicker={SECTIONS[1].kicker} title={SECTIONS[1].title}>
              <p>
                When you submit a form, we collect what you give us: name, email, phone, and the property or situation details you describe. When you visit a page, our server logs the request (IP address, user agent, page) for security and reliability.
              </p>
              <p>
                We do not ask for, store, or process financial account numbers, social security numbers, or sensitive personal categories through the public site.
              </p>
            </LegalBlock>

            <LegalBlock id="how-we-use-it" idx={2} icon={SECTIONS[2].icon} kicker={SECTIONS[2].kicker} title={SECTIONS[2].title}>
              <p>
                We use what you submit to read your situation, route it to the right lane, and reply to you. We use aggregate page metrics to understand which content is useful and to keep the site running. That is the entire use.
              </p>
              <p>
                We do not use your information for advertising, profile-building, or resale.
              </p>
            </LegalBlock>

            <LegalBlock id="sharing" idx={3} icon={SECTIONS[3].icon} kicker={SECTIONS[3].kicker} title={SECTIONS[3].title}>
              <p>
                We share information only with the service providers that run the site (hosting, email delivery, analytics) under contract, and only as needed to deliver the service. We share information with law enforcement only when legally required.
              </p>
              <p>
                We will never sell your personal information.
              </p>
            </LegalBlock>

            <LegalBlock id="cookies" idx={4} icon={SECTIONS[4].icon} kicker={SECTIONS[4].kicker} title={SECTIONS[4].title}>
              <p>
                The site uses one session cookie for sign-in and one preference cookie for your light/dark theme. Both are first-party and required.
              </p>
              <p>
                Analytics (Plausible) only loads after you accept the cookie banner. We do not run advertising trackers, cross-site identifiers, or third-party retargeting pixels.
              </p>
            </LegalBlock>

            <LegalBlock id="your-rights" idx={5} icon={SECTIONS[5].icon} kicker={SECTIONS[5].kicker} title={SECTIONS[5].title}>
              <p>
                You can ask us what we have about you, ask us to correct it, ask us to delete it, or opt out of any future contact. Residents of California, the EU, and other jurisdictions with stronger privacy laws keep every right those laws give you.
              </p>
              <p>
                Email apollo@pegasusdreamscapes.com with the request. We will respond within 30 days.
              </p>
            </LegalBlock>

            <LegalBlock id="security" idx={6} icon={SECTIONS[6].icon} kicker={SECTIONS[6].kicker} title={SECTIONS[6].title}>
              <p>
                We use reasonable technical and organizational safeguards to protect what you submit. No internet system is perfectly secure. We retain submissions for as long as they are relevant to the work, then delete or anonymize them.
              </p>
            </LegalBlock>

            <LegalBlock id="contact" idx={7} icon={SECTIONS[7].icon} kicker={SECTIONS[7].kicker} title={SECTIONS[7].title}>
              <p>
                Privacy questions go to the operator directly. <a href="mailto:apollo@pegasusdreamscapes.com" className="text-primary hover:underline" data-testid="link-privacy-email">apollo@pegasusdreamscapes.com</a> · <a href="tel:+19257448525" className="text-primary hover:underline" data-testid="link-privacy-phone">925-744-8525</a>. Pleasant Hill, California.
              </p>
            </LegalBlock>
          </div>

          <div className="mt-16 pt-8 border-t border-border text-sm text-muted-foreground">
            <p>Last updated: May 2026. This policy is a draft pending qualified legal review.</p>
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
  // Alternate two visual patterns: bordered card vs. left-rule, so the
  // page stops feeling like a single repeated block.
  const alternate = idx % 2 === 1;
  return (
    <section
      id={id}
      data-testid={`section-privacy-${id}`}
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
