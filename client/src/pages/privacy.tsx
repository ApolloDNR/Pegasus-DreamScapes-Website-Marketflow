import { useSEO } from "@/hooks/use-seo";
import { ContourLines } from "@/pegasus/primitives";
import { Mail, Shield, Database, Cookie, UserCheck, Scale, FileText } from "lucide-react";

const SECTIONS = [
  { id: "scope", label: "Scope", icon: Shield, title: "What this policy covers.", kicker: "Scope" },
  { id: "what-we-collect", label: "What we collect", icon: Database, title: "Only what we need to do the work.", kicker: "What we collect" },
  { id: "how-we-use-it", label: "How we use it", icon: FileText, title: "Review your situation. Reply to you. Improve the site.", kicker: "How we use it" },
  { id: "sharing", label: "Sharing", icon: UserCheck, title: "We do not sell your information.", kicker: "Sharing" },
  { id: "cookies", label: "Cookies", icon: Cookie, title: "Consent-gated analytics. No advertising trackers.", kicker: "Cookies and analytics" },
  { id: "your-rights", label: "Your rights", icon: Scale, title: "Access, correction, deletion, opt-out.", kicker: "Your rights" },
  { id: "security", label: "Security", icon: Shield, title: "Reasonable safeguards. No system is perfect.", kicker: "Security and retention" },
  { id: "call-recording", label: "Phone plans", icon: Shield, title: "Phone and voice are in development.", kicker: "Planned Peggy phone controls" },
  { id: "contact", label: "Contact", icon: Mail, title: "Reach the operator directly.", kicker: "Contact" },
];

export default function Privacy() {
  useSEO({
    title: "Privacy Policy Draft",
    description:
      "Operator-prepared privacy notice for Pegasus Dreamscapes Corp., pending qualified legal review.",
    image: "/og/default.png",
    noIndex: true,
    noCanonical: true,
  });

  return (
    <div className="min-h-screen bg-background">
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 bg-[hsl(var(--charcoal))] text-cream overflow-hidden">
        <ContourLines className="absolute inset-x-0 bottom-0 w-full h-[70%] text-primary opacity-[0.12] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#e3a463] font-supporting font-semibold">
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
            Pegasus Dreamscapes Corp. respects your privacy. This page explains what we collect when you use the site, why we collect it, and how to reach us if you want it changed or removed.
          </p>
          <p className="mt-6 inline-flex rounded-full border border-[#e3a463]/50 bg-black/20 px-4 py-2 text-xs font-supporting font-semibold uppercase tracking-[0.16em] text-[#f0c18f]">
            Operator-prepared draft pending qualified legal review
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
                data-testid={`link-privacy-jump-${s.id}`}
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
            <LegalBlock id="scope" idx={0} icon={SECTIONS[0].icon} kicker={SECTIONS[0].kicker} title={SECTIONS[0].title}>
              <p>
                This operator-prepared draft covers pegasusdreamscapes.com, its public forms, account and sign-in screens, private MarketFlow pilot surfaces, Peggy, local Strategy Lab drafts, and share-link pages. It does not cover third-party sites you may reach through outbound links. Qualified privacy counsel has not yet approved this draft for production collection.
              </p>
            </LegalBlock>

            <LegalBlock id="what-we-collect" idx={1} icon={SECTIONS[1].icon} kicker={SECTIONS[1].kicker} title={SECTIONS[1].title}>
              <p>
                When you submit a form, we collect what you give us: name, email, phone, and the property or situation details you describe. When you visit a page, our server logs the request (IP address, user agent, page) for security and reliability.
              </p>
              <p>
                When you chat with Peggy, we collect the conversation content you send and associate it with a server-created conversation record.
              </p>
              <p>
                If you create an account, the authentication provider receives your email and password and Pegasus receives an account identifier, account identity, declared role, and sign-in activity. Pegasus does not receive a readable copy of your password. Private MarketFlow product activity can include access requests, saved records, messages, and actions inside the controlled pilot.
              </p>
              <p>
                A browser-only Strategy Lab draft stays in local browser storage unless you deliberately submit its facts through an intake. If a share control is available and you create a public share link, anyone with that bearer link may see the information rendered on that page until the link is removed or disabled.
              </p>
              <p>
                Public forms are not intended for financial account numbers, social security numbers, government IDs, health information, or other sensitive personal categories. Do not submit those items through the public site.
              </p>
            </LegalBlock>

            <LegalBlock id="how-we-use-it" idx={2} icon={SECTIONS[2].icon} kicker={SECTIONS[2].kicker} title={SECTIONS[2].title}>
              <p>
                We use what you submit to record and route a request and, if Pegasus chooses to respond, to contact you. Account data supports authentication and private product access. Product activity supports the feature you use, security, troubleshooting, and audit history. If you consent to analytics, bounded page and CTA events help us understand site use.
              </p>
              <p>
                We do not use your information for advertising, profile-building, or resale.
              </p>
            </LegalBlock>

            <LegalBlock id="sharing" idx={3} icon={SECTIONS[3].icon} kicker={SECTIONS[3].kicker} title={SECTIONS[3].title}>
              <p>
                We disclose information to service providers that operate the site, including hosting, authentication, email delivery, consented analytics, storage, and AI processing, only as needed for their function. When you use Peggy, its conversation content is sent to the configured AI processing provider to generate a reply.
              </p>
              <p>
                Pegasus will provide separate notice and permission before sharing submitted information with an independent professional, potential counterparty, or referral recipient unless disclosure is legally required. We may preserve or disclose records when reasonably necessary to comply with law, protect the service, or address fraud or security incidents.
              </p>
              <p>
                We will never sell your personal information.
              </p>
            </LegalBlock>

            <LegalBlock id="cookies" idx={4} icon={SECTIONS[4].icon} kicker={SECTIONS[4].kicker} title={SECTIONS[4].title}>
              <p>
                Local browser storage remembers your light/dark theme and consent choices. The current Strategy Lab stores one browser-only property and financial draft under this site's local storage. That draft is not an account library and is not submitted to Pegasus merely because you save it in the browser.
              </p>
              <p>
                If you choose to save a Strategy Lab property and financial draft, its inputs are stored on your device in local browser storage. Your browser may keep that draft until you clear it or the browser removes site data; saving the local draft does not itself submit it to Pegasus.
              </p>
              <p>
                Peggy's active server conversation ID and access credential stay only in page memory, not in local browser storage. Closing and reopening Peggy on the same loaded page may continue that conversation. Reloading or closing the page ends that browser view. If you explicitly choose Save chat, Pegasus writes a separate transcript copy to local browser storage so you can revisit that saved copy.
              </p>
              <p>
                Sign-in services may use essential browser session data to keep you signed in. Analytics (Plausible) and first-party CTA measurement only operate after you accept analytics in the consent banner. CTA measurement omits raw referrers and query strings. We do not intentionally use browser fingerprinting, advertising trackers, cross-site identifiers, or third-party retargeting pixels in the current build.
              </p>
            </LegalBlock>

            <LegalBlock id="your-rights" idx={5} icon={SECTIONS[5].icon} kicker={SECTIONS[5].kicker} title={SECTIONS[5].title}>
              <p>
                You can ask us what we have about you, ask us to correct it, ask us to delete it, or opt out of any future contact. Residents of California, the EU, and other jurisdictions with stronger privacy laws keep every right those laws give you.
              </p>
              <p>
                Email apollo@pegasusdreamscapes.com with the request. Pegasus will verify the request and respond within the period required by applicable law; some records may need to be retained for security, fraud prevention, legal obligations, or an active dispute.
              </p>
            </LegalBlock>

            <LegalBlock id="security" idx={6} icon={SECTIONS[6].icon} kicker={SECTIONS[6].kicker} title={SECTIONS[6].title}>
              <p>
                We use reasonable technical and organizational safeguards to protect what you submit. No internet system is perfectly secure. Account and product records are retained while needed to operate the account or feature; request and communication records are retained while relevant to the request and any legal obligations. Local browser drafts remain until you clear them or the browser removes site data. Backups and security logs may expire on a different schedule. Final production retention periods require qualified legal review.
              </p>
            </LegalBlock>

            <LegalBlock id="call-recording" idx={7} icon={SECTIONS[7].icon} kicker={SECTIONS[7].kicker} title={SECTIONS[7].title}>
              <p>
                Peggy does not currently answer or record calls on Pegasus' main line. The public Peggy experience is limited to website intake while phone and voice are in development.
              </p>
              <p>
                California is a two-party consent state (Penal Code §632). Before any voice launch, Pegasus must implement and verify a clear recording disclosure, an immediate way to decline or stop recording, and a path to continue without recording.
              </p>
              <p>
                If recording is enabled in the future, the final retention, deletion, security, and transcript-use policy will be published here before that service goes live.
              </p>
            </LegalBlock>

            <LegalBlock id="contact" idx={8} icon={SECTIONS[8].icon} kicker={SECTIONS[8].kicker} title={SECTIONS[8].title}>
              <p>
                Privacy questions go to the operator directly. <a href="mailto:apollo@pegasusdreamscapes.com" className="text-[#8a5122] dark:text-primary underline underline-offset-2" data-testid="link-privacy-email">apollo@pegasusdreamscapes.com</a> · <a href="tel:+19257448525" className="text-[#8a5122] dark:text-primary underline underline-offset-2" data-testid="link-privacy-phone">925-744-8525</a>. East Bay, California.
              </p>
            </LegalBlock>
          </div>

          <div className="mt-16 pt-8 border-t border-border text-sm text-muted-foreground">
            <p>Last updated: August 2026.</p>
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
