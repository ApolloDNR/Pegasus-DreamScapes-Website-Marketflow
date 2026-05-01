import { useEffect } from "react";
import {
  Section,
  Kicker,
  DisplayHeading,
  Reveal,
} from "@/components/brand/atoms";
import { PegasusWatermark } from "@/components/brand/pegasus-mark";

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Policy — Pegasus Dreamscapes";
  }, []);

  const updated = "January 2026";

  return (
    <div className="bg-[hsl(220_35%_5%)]">
      <Section variant="hero" className="overflow-hidden">
        <div className="absolute inset-0 bg-architect opacity-[0.14]" aria-hidden />
        <PegasusWatermark className="pointer-events-none absolute -right-24 top-12 h-[400px] w-[680px] opacity-20" />
        <div className="container-premium relative pt-36 pb-16 md:pt-44 md:pb-20">
          <Reveal>
            <Kicker>Legal · Privacy</Kicker>
          </Reveal>
          <Reveal delay={80}>
            <DisplayHeading
              as="h1"
              className="mt-6 max-w-3xl text-[44px] sm:text-[58px] md:text-[64px]"
            >
              Privacy Policy
            </DisplayHeading>
          </Reveal>
          <Reveal delay={140}>
            <p className="lead mt-6 max-w-2xl">
              Last updated · {updated}. This page explains what information
              Pegasus Dreamscapes collects through its website, how we use it,
              and how we protect it.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section variant="canvas">
        <div className="container-premium pb-24 md:pb-32">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <PolicySection title="1. Who we are" first>
                <p>
                  Pegasus Dreamscapes is a real estate development, investment,
                  and systems company based in the East Bay, California. We
                  operate this website to communicate about our company,
                  evaluate opportunities, and support partner relationships.
                </p>
              </PolicySection>

              <PolicySection title="2. What we collect">
                <p>We collect information you provide directly, including:</p>
                <ul>
                  <li>Contact information (name, email, phone)</li>
                  <li>Property and deal details you submit</li>
                  <li>Messages you send via forms or email</li>
                  <li>Account information if you sign in to MarketFlow or related portals</li>
                </ul>
                <p>
                  We also collect limited technical information automatically,
                  such as IP address, browser type, device type, and pages
                  visited. We use cookies and similar technologies to operate
                  the site and understand usage in aggregate.
                </p>
              </PolicySection>

              <PolicySection title="3. How we use information">
                <p>We use the information we collect to:</p>
                <ul>
                  <li>Respond to inquiries and submissions</li>
                  <li>Evaluate properties, deals, and partnership opportunities</li>
                  <li>Operate and improve our website and platforms</li>
                  <li>Communicate about Pegasus Dreamscapes when relevant</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </PolicySection>

              <PolicySection title="4. How we share information">
                <p>
                  Pegasus Dreamscapes does not sell personal information. We
                  share information only with:
                </p>
                <ul>
                  <li>Service providers who help us operate the site and our platforms</li>
                  <li>Partners involved in a specific deal where you've consented to share details</li>
                  <li>Authorities when required by applicable law</li>
                </ul>
              </PolicySection>

              <PolicySection title="5. How we protect information">
                <p>
                  We use reasonable technical and organizational measures to
                  protect your information. No method of transmission or
                  storage is fully secure, but we work to ensure our practices
                  match the seriousness of the work we do.
                </p>
              </PolicySection>

              <PolicySection title="6. Your choices">
                <p>You can:</p>
                <ul>
                  <li>Request access to or deletion of your information</li>
                  <li>Update inaccurate information</li>
                  <li>Unsubscribe from communications at any time</li>
                </ul>
                <p>
                  Email{" "}
                  <a
                    href="mailto:hello@pegasusdreamscapes.com"
                    className="text-copper hover:text-bronze"
                  >
                    hello@pegasusdreamscapes.com
                  </a>{" "}
                  for any of the above.
                </p>
              </PolicySection>

              <PolicySection title="7. Changes to this policy">
                <p>
                  We may update this policy as our products and operations
                  evolve. The "last updated" date above will reflect the most
                  recent revision. Material changes will be communicated where
                  appropriate.
                </p>
              </PolicySection>

              <PolicySection title="8. Contact">
                <p>
                  Questions about this policy should be sent to{" "}
                  <a
                    href="mailto:hello@pegasusdreamscapes.com"
                    className="text-copper hover:text-bronze"
                  >
                    hello@pegasusdreamscapes.com
                  </a>
                  .
                </p>
              </PolicySection>
            </Reveal>
          </div>
        </div>
      </Section>
    </div>
  );
}

function PolicySection({
  title,
  first,
  children,
}: {
  title: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={
        first
          ? ""
          : "mt-10 border-t border-copper/10 pt-10"
      }
    >
      <h2 className="font-display text-2xl text-ivory md:text-3xl">{title}</h2>
      <div className="mt-4 space-y-4 text-[15.5px] leading-relaxed text-muted-ivory [&>ul]:mt-3 [&>ul]:list-none [&>ul]:space-y-2 [&>ul>li]:relative [&>ul>li]:pl-5 [&>ul>li]:before:absolute [&>ul>li]:before:left-0 [&>ul>li]:before:top-[10px] [&>ul>li]:before:h-1 [&>ul>li]:before:w-1 [&>ul>li]:before:rotate-45 [&>ul>li]:before:bg-copper">
        {children}
      </div>
    </section>
  );
}
