import {
  Section,
  Kicker,
  DisplayHeading,
  Reveal,
} from "@/components/brand/atoms";
import { PegasusWatermark } from "@/components/brand/pegasus-mark";
import { useSEO } from "@/hooks/use-seo";

export default function Terms() {
  useSEO({
    title: "Terms of Service",
    description:
      "Terms governing use of the Pegasus Dreamscapes website. Nothing on this site is an offer or solicitation to buy or sell any security.",
  });

  const updated = "January 2026";

  return (
    <div className="bg-[hsl(220_35%_5%)]">
      <Section variant="hero" className="overflow-hidden">
        <div className="absolute inset-0 bg-architect opacity-[0.14]" aria-hidden />
        <PegasusWatermark className="pointer-events-none absolute -right-24 top-12 h-[400px] w-[680px] opacity-20" />
        <div className="container-premium relative pt-36 pb-16 md:pt-44 md:pb-20">
          <Reveal>
            <Kicker>Legal · Terms</Kicker>
          </Reveal>
          <Reveal delay={80}>
            <DisplayHeading
              as="h1"
              className="mt-6 max-w-3xl text-[44px] sm:text-[58px] md:text-[64px]"
            >
              Terms of Service
            </DisplayHeading>
          </Reveal>
          <Reveal delay={140}>
            <p className="lead mt-6 max-w-2xl">
              Last updated · {updated}. By using this website, you agree to the
              terms below. They explain how we operate this site, what we
              don't promise, and how disputes are handled.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section variant="canvas">
        <div className="container-premium pb-24 md:pb-32">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <T title="1. About this website" first>
                <p>
                  This website is operated by Pegasus Dreamscapes ("Pegasus",
                  "we", "us"). It is provided for informational and
                  relationship-building purposes — to describe our company, our
                  divisions, and the kinds of opportunities we're open to.
                </p>
              </T>

              <T title="2. Not an offer of securities">
                <p>
                  Nothing on this website constitutes an offer or solicitation
                  to buy or sell any security, real estate interest, or
                  financial instrument. Any investment relationship with
                  Pegasus is private, deal-specific, and subject to formal
                  documentation, qualified eligibility, and applicable law.
                </p>
              </T>

              <T title="3. Submissions">
                <p>
                  When you submit a property, deal, or message through this
                  site, you confirm that the information is accurate to the
                  best of your knowledge and that you have the right to share
                  it. Pegasus reviews submissions in good faith but does not
                  commit to any specific response, transaction, or outcome.
                </p>
              </T>

              <T title="4. No guarantees of outcomes">
                <p>
                  Real estate involves real risk. Nothing on this website
                  should be interpreted as a guarantee of returns, timelines,
                  or specific results. Any forward-looking statements reflect
                  our current intentions and may change as conditions change.
                </p>
              </T>

              <T title="5. Intellectual property">
                <p>
                  The Pegasus Dreamscapes name, logo, "Dream it. Build it. Live
                  it." tagline, MarketFlow product name, and the design,
                  copy, and structure of this website are owned by Pegasus.
                  You may not copy, reproduce, or distribute them without our
                  permission.
                </p>
              </T>

              <T title="6. Third-party links and tools">
                <p>
                  This site may link to or integrate with third-party services.
                  Their use is governed by their own terms and policies.
                  Pegasus is not responsible for content or behavior of
                  external services.
                </p>
              </T>

              <T title="7. Limitation of liability">
                <p>
                  To the fullest extent permitted by law, Pegasus is not
                  liable for indirect, incidental, consequential, or punitive
                  damages arising from your use of this website or any
                  information on it.
                </p>
              </T>

              <T title="8. Changes to these terms">
                <p>
                  We may update these terms as our products and operations
                  evolve. The "last updated" date above reflects the most
                  recent revision. Continued use of the website after a change
                  is taken as acceptance of the updated terms.
                </p>
              </T>

              <T title="9. Governing law">
                <p>
                  These terms are governed by the laws of the State of
                  California, without regard to conflict-of-laws principles.
                </p>
              </T>

              <T title="10. Contact">
                <p>
                  Questions about these terms should be sent to{" "}
                  <a
                    href="mailto:hello@pegasusdreamscapes.com"
                    className="text-copper hover:text-bronze"
                  >
                    hello@pegasusdreamscapes.com
                  </a>
                  .
                </p>
              </T>
            </Reveal>
          </div>
        </div>
      </Section>
    </div>
  );
}

function T({
  title,
  first,
  children,
}: {
  title: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={first ? "" : "mt-10 border-t border-copper/10 pt-10"}>
      <h2 className="font-display text-2xl text-ivory md:text-3xl">{title}</h2>
      <div className="mt-4 space-y-4 text-[15.5px] leading-relaxed text-muted-ivory">
        {children}
      </div>
    </section>
  );
}
