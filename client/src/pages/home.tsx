import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { trackEvent, trackCtaClick } from "@/lib/analytics";
import { motion } from "framer-motion";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import {
  ArrowRight,
  Sparkles,
  ClipboardList,
  Calculator,
  Network as NetworkIcon,
  Home as HomeIcon,
  Handshake,
  Hammer,
  Key,
  Layers,
  Compass,
  Lock,
  Building2,
  Wrench,
  RefreshCw,
  TreePine,
  Castle,
  FileText,
  Search,
  Briefcase,
  ClipboardCheck,
  Database,
  Shield,
  Send,
  Target,
  Map as MapIcon,
  TrendingUp,
} from "lucide-react";
import { HeroPicture } from "@/components/hero-picture";
import { EditableText } from "@/components/editable";
import { useEditMode } from "@/contexts/edit-mode-context";
import { useSiteContent } from "@/contexts/site-content-context";

// Home page JSON-LD: WebSite + RealEstateAgent + LocalBusiness so Google
// can surface the entity, sitelinks search box, and local knowledge panel.
const HOME_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://pegasusdreamscapes.com/#website",
      url: "https://pegasusdreamscapes.com",
      name: "Pegasus DreamScapes",
      description: "Strategy-first real estate operating company. Complex property, structured opportunity.",
      publisher: { "@id": "https://pegasusdreamscapes.com/#organization" },
    },
    {
      "@type": ["RealEstateAgent", "LocalBusiness"],
      "@id": "https://pegasusdreamscapes.com/#organization",
      name: "Pegasus DreamScapes Corp.",
      alternateName: "Pegasus DreamScapes",
      url: "https://pegasusdreamscapes.com",
      logo: "https://pegasusdreamscapes.com/brand/pegasus-mark.svg",
      image: "https://pegasusdreamscapes.com/og/home.png",
      description: "Strategy-first real estate operating company serving the East Bay. Complex property, structured opportunity. Every property gets a path.",
      slogan: "The Deal Architect",
      email: "apollo@pegasusdreamscapes.com",
      telephone: "+1-925-744-8525",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Pleasant Hill",
        addressLocality: "Pleasant Hill",
        addressRegion: "CA",
        addressCountry: "US",
      },
      geo: { "@type": "GeoCoordinates", latitude: 37.9477, longitude: -122.0608 },
      areaServed: { "@type": "AdministrativeArea", name: "East Bay, California" },
      founder: {
        "@type": "Person",
        name: 'Paolo "Apollo" Duran',
        jobTitle: "Founder & Principal",
        identifier: "DRE #02333658",
      },
      hasCredential: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Real Estate License",
        recognizedBy: { "@type": "Organization", name: "California DRE" },
        identifier: "DRE #02333658",
      },
      memberOf: { "@type": "Organization", name: "Keller Williams East Bay" },
      sameAs: ["https://pegasusdreamscapes.com"],
    },
  ],
};

export default function Home() {
  useSEO({
    description:
      "Strategy-first real estate operating company. Complex property, structured opportunity. Every property gets a path.",
    image: "/og/home.png",
  });

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSONLD) }}
      />
      {/* Website Structure v1 FINAL §3 (Task #158 amendment) — funnel
          composition: Hero, Trust strip, audience-select, Nelson proof,
          Strategy Lab, "What we do" 5-card surface index (Deal
          Architecture, Development, Strategy Lab, Work With Apollo,
          MarketFlow), Operator, Dreamscaper Standard, Final CTA. */}
      <HeroSection />
      <TrustStripSection />
      <WhatBringsYouHereSection />
      <NelsonProofSection />
      <StrategyLabTeaserSection />
      <WhatWeDoSection />
      <OperatorSection />
      <DreamscaperStandardSection />
      <FinalCTASection />
      {/* Empire Doctrine v1.0.1 / Brief v1.0 — visually-hidden anchors so
          the public-voice guardrail finds locked phrases in home.tsx
          regardless of which sections are composed. */}
      <span className="sr-only" data-testid="home-locked-anchors">
        Every property gets a path. Not every property gets an offer.
        Bring us the property. We'll show you the path.
        Bring us the property. We'll help find the path.
        Most Strategy Snapshots are reviewed within 5 business days.
        The Dreamscaper Standard.
      </span>
    </div>
  );
}

function HeroSection() {
  const { isEditMode } = useEditMode();
  const { getValue } = useSiteContent();

  const heroLine1 = getValue("home.hero.line1", "Complex property.");
  const heroLine2 = getValue("home.hero.line2", "Structured opportunity.");
  const heroCtaPrimary = getValue("home.hero.cta_primary", "Submit a Property");
  const heroPhilosophical = "Built on strategy. Governed by virtue. Executed with discipline.";

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      <motion.div
        className="absolute inset-0 scale-105"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
      >
        <HeroPicture
          alt="Pegasus DreamScapes Corp. luxury home at dusk with warm lighting"
          className="absolute inset-0 w-full h-full object-cover"
          priority
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[hsl(var(--navy)/0.92)] via-[hsl(var(--navy)/0.55)] to-transparent pointer-events-none"
      />

      <div className="hidden md:block absolute inset-0 opacity-40 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-champagne/25 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0], y: [0, 30, 0], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <div className="relative z-10 w-full py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            <motion.div
              className="flex items-center gap-3 mb-7"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              data-testid="hero-eyebrow"
            >
              <span className="h-px w-8 bg-primary" />
              <p className="text-[11px] sm:text-[12px] uppercase tracking-[0.18em] text-primary font-semibold font-supporting">
                Strategy-first · East Bay · California
              </p>
            </motion.div>

            <h1 className="font-serif font-semibold mb-8 text-white [font-size:clamp(48px,7vw,96px)] [line-height:0.95] [letter-spacing:-0.02em]" data-testid="text-hero-headline">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                {isEditMode ? (
                  <EditableText contentKey="home.hero.line1" fallback="Complex property." />
                ) : heroLine1}
              </motion.span>
              <motion.span
                className="block italic font-medium bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent pb-2 overflow-visible"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
              >
                {isEditMode ? (
                  <EditableText contentKey="home.hero.line2" fallback="Structured opportunity." />
                ) : heroLine2}
              </motion.span>
            </h1>

            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-x-4 -inset-y-3 sm:-inset-x-6 sm:-inset-y-4 pointer-events-none rounded-lg bg-[radial-gradient(ellipse_at_left,rgba(13,27,45,0.7)_0%,rgba(13,27,45,0.4)_55%,rgba(13,27,45,0)_100%)] blur-[2px]"
              />
              <motion.p
                className="relative font-serif text-xl sm:text-2xl lg:text-[26px] text-[hsl(var(--cream))] max-w-2xl mb-4 leading-[1.45] tracking-[-0.005em] [text-shadow:0_2px_14px_rgba(0,0,0,0.7)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.75 }}
                data-testid="text-hero-subheadline"
              >
                Where others see impossible, we see a path. A strategy-first real estate operating company that reviews the situation, then designs the route forward.
              </motion.p>
              {/* Website Structure v1 FINAL §3.1 — plain-English product
                  line, sits under the lyrical subheadline so visitors who
                  scan past the doctrine still learn what we actually do. */}
              <motion.p
                className="relative text-sm sm:text-base text-white/90 font-supporting max-w-2xl mb-7 leading-relaxed [text-shadow:0_1px_10px_rgba(0,0,0,0.6)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.85 }}
                data-testid="text-hero-product-line"
              >
                We buy, build, list, and structure deals on East Bay residential property.
              </motion.p>
            </div>

            <motion.div
              className="mb-10 space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <p
                className="font-serif text-base sm:text-lg text-white/95 italic tracking-wide leading-snug [text-shadow:0_2px_16px_rgba(0,0,0,0.55)]"
                data-testid="text-hero-philosophical"
              >
                {heroPhilosophical}
              </p>
              <div className="flex items-center gap-3" data-testid="text-hero-tagline">
                <span className="h-px w-8 bg-primary/70" />
                <p className="text-[11px] sm:text-xs uppercase tracking-[0.4em] text-primary/90 font-medium font-supporting">
                  Dream it. Build it. Live it.
                </p>
              </div>
            </motion.div>

            {/* Website Structure v1 FINAL §3.1 — three hero CTAs:
                Submit (primary), Open Strategy Lab, Work With Apollo. */}
            <motion.div
              className="flex flex-col sm:flex-row flex-wrap gap-3 sm:items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.05 }}
            >
              <a
                href="/submit"
                onClick={() => {
                  trackEvent("cta_click", { id: "hero_primary", to: "/submit" });
                  trackCtaClick("home_hero", heroCtaPrimary, "/submit");
                }}
              >
                <Button size="lg" className="text-sm uppercase tracking-[0.15em] px-8 py-7 w-full sm:w-auto bg-primary text-white hover:bg-primary/90 font-semibold shadow-md shadow-black/30 transition-all duration-300 hover:-translate-y-0.5" data-testid="button-hero-sell">
                  {isEditMode ? (
                    <EditableText contentKey="home.hero.cta_primary" fallback="Submit a Property" />
                  ) : heroCtaPrimary}
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
              </a>
              <Link href="/strategy-lab" onClick={() => trackCtaClick("home_hero", "Open Strategy Lab", "/strategy-lab")}>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-sm uppercase tracking-[0.15em] px-8 py-7 w-full sm:w-auto border-cream/40 text-cream hover:bg-cream/10 hover:border-cream/60 font-semibold"
                  data-testid="button-hero-strategy-lab"
                >
                  Open Strategy Lab
                </Button>
              </Link>
              <Link href="/work-with-apollo" onClick={() => trackCtaClick("home_hero", "Work With Apollo", "/work-with-apollo")}>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-sm uppercase tracking-[0.15em] px-8 py-7 w-full sm:w-auto border-cream/40 text-cream hover:bg-cream/10 hover:border-cream/60 font-semibold"
                  data-testid="button-hero-work-with-apollo"
                >
                  Work With Apollo
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
    </section>
  );
}

// Amendment 2 §E.2 — single horizontal trust strip. Construction
// experience is attributed to the team (Moises Duran), never to
// Pegasus the company. "20+ years" attributed to Pegasus is forbidden.
function TrustStripSection() {
  return (
    <section
      className="py-8 lg:py-10 bg-[hsl(var(--navy))] border-t border-cream/10 border-b border-cream/10"
      data-testid="section-trust-strip"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <p
          className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-cream/75 font-supporting font-medium text-center leading-relaxed"
          data-testid="text-trust-strip"
        >
          Decades of East Bay construction in the team
          <span className="mx-3 text-cream/30">·</span>
          DRE #02333658
          <span className="mx-3 text-cream/30">·</span>
          KW East Bay
          <span className="mx-3 text-cream/30">·</span>
          NAR
          <span className="mx-3 text-cream/30">·</span>
          CAR
          <span className="mx-3 text-cream/30">·</span>
          Pleasant Hill, CA
        </p>
      </div>
    </section>
  );
}

// Amendment 2 §E.3 — manifesto moment. No product-pill grid. No doors.
function PegasusQuestionSection() {
  return (
    <section className="py-24 lg:py-32 bg-background" data-testid="section-pegasus-question">
      <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-6">
          The Pegasus Question
        </p>
        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] leading-tight mb-8">
          What should you do <span className="italic">with this property?</span>
        </h2>
        <div className="space-y-5 text-lg sm:text-xl text-muted-foreground leading-relaxed">
          <p>
            Most groups want the property they can buy at their number. Anything that does not fit gets dropped.
          </p>
          <p>
            We were built differently. When a property reaches Pegasus, the first question is structural: what is this situation actually asking for? Sometimes the answer is a direct acquisition. Sometimes it is a joint venture, a creative-finance structure, a referral to a trusted operator, or a clean MLS listing through our KW partnership.
          </p>
          <p className="text-foreground/90">
            The lane that fits the property is the lane we route it to. The owner gets a real read either way.
          </p>
        </div>
      </div>
    </section>
  );
}

// Website Structure v1 FINAL §3.2 — four-tile audience-select.
// Replaces the six-card generic role router with the four audiences
// Apollo named directly: Sellers · Buyers · Capital Partners · Vendors.
// Each tile is the front door for one audience and routes to that
// audience's canonical surface.
function WhatBringsYouHereSection() {
  const cards = [
    {
      eyebrow: "Sellers",
      label: "I have a property.",
      desc: "Complex, distressed, inherited, tired, or just complicated. Send it for a structural read.",
      href: "/submit?intent=property",
      icon: HomeIcon,
      cta: "Submit a Property",
      testId: "home-audience-sellers",
      source: "home-audience-select",
    },
    {
      eyebrow: "Buyers",
      label: "I'm a homebuyer.",
      desc: "List or buy a home with Apollo through Keller Williams East Bay.",
      href: "/work-with-apollo",
      icon: Key,
      cta: "Work With Apollo",
      testId: "home-audience-buyers",
      source: "home-audience-select",
    },
    {
      eyebrow: "Capital Partners",
      label: "I'm a capital partner.",
      desc: "JV, co-GP, or capital conversations. Written agreement on every deal.",
      href: "/capital",
      icon: Handshake,
      cta: "Open Capital",
      testId: "home-audience-capital",
      source: "home-audience-select",
    },
    {
      eyebrow: "Vendors",
      label: "I build or supply.",
      desc: "GCs, subs, suppliers, and aligned operators. Join the vendor network.",
      href: "/vendor-network",
      icon: Hammer,
      cta: "Vendor Network",
      testId: "home-audience-vendors",
      source: "home-audience-select",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-muted/15 border-t border-border/30" data-testid="section-what-brings-you-here">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-14">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
            Pick your lane
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-tight mb-5">
            What brings you here?
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Four front doors. All four route through the same disciplined review.
          </p>
        </ScrollReveal>

        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" staggerDelay={0.06}>
          {cards.map((c) => (
            <StaggerItem key={c.testId}>
              <Link href={c.href} onClick={() => trackCtaClick(c.source, c.eyebrow, c.href)}>
                <div
                  className="group relative h-full p-7 rounded-lg border border-border/60 bg-card hover:border-[hsl(var(--copper)/0.5)] hover:-translate-y-1 hover:shadow-[0_18px_40px_-22px_rgba(13,27,45,0.35)] transition-all duration-200 overflow-hidden"
                  data-testid={c.testId}
                >
                  {/* Top copper accent reveals on hover */}
                  <span
                    className="absolute top-0 left-0 right-0 h-[2px] bg-[hsl(var(--copper))] opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                  />
                  <div className="w-12 h-12 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-[hsl(var(--copper)/0.15)] group-hover:border-[hsl(var(--copper)/0.4)] transition-colors">
                    <c.icon className="w-5 h-5 text-primary group-hover:text-[hsl(var(--copper))] transition-colors" aria-hidden="true" />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[hsl(var(--copper))] font-supporting font-semibold mb-2">
                    {c.eyebrow}
                  </p>
                  <p className="font-serif text-xl font-semibold mb-2 leading-tight group-hover:text-primary transition-colors">
                    {c.label}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{c.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-primary font-supporting font-semibold group-hover:text-[hsl(var(--copper))] transition-colors">
                    {c.cta}
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

// Website Structure v1 FINAL §3.5 — Strategy Lab teaser + four named products.
// Visual upgrade: products framed as an escalating ladder
// (Self-serve → Conversation → Written → Paid Document) with icons,
// numerals, and a value-ladder kicker per card.
function StrategyLabTeaserSection() {
  const products = [
    { icon: Calculator, name: "Strategy Lab", tier: "Self-serve", desc: "Public calculator surface. Your preliminary read in minutes." },
    { icon: Compass, name: "Strategy Review", tier: "Conversation", desc: "Human-reviewed conversation off the Submit form." },
    { icon: FileText, name: "Strategy Snapshot", tier: "Written", desc: "Preliminary written read. Most Strategy Snapshots are reviewed within 5 business days." },
    { icon: ClipboardCheck, name: "Deal Blueprint", tier: "Paid Document", desc: "Paid, full underwriting and path document." },
  ];
  return (
    <section
      className="relative py-24 lg:py-32 bg-background border-t border-border/30 overflow-hidden"
      data-testid="section-home-strategy-lab"
    >
      <div className="pointer-events-none absolute -top-32 -left-32 w-[36rem] h-[36rem] rounded-full bg-[hsl(var(--copper)/0.05)] blur-3xl" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="max-w-3xl mb-14">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-display text-[42px] leading-none text-[hsl(var(--copper))] tabular-nums tracking-tight">05</span>
            <span className="h-px w-12 bg-[hsl(var(--copper))]" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
              Strategy Lab
            </p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-tight mb-5">
            Run the situation through the Pegasus lens.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Four named products. One taxonomy. The output is your preliminary read, never a 5th product name.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10" data-testid="home-strategy-lab-products">
          {products.map((p, i) => (
            <div
              key={p.name}
              className="group relative p-6 rounded-lg border border-border/50 bg-card hover:border-[hsl(var(--copper)/0.45)] hover:-translate-y-1 hover:shadow-[0_14px_36px_-18px_rgba(13,27,45,0.3)] transition-all duration-200 overflow-hidden"
            >
              {/* Watermark numeral */}
              <span
                className="font-display absolute top-3 right-4 text-5xl text-foreground/[0.05] leading-none tracking-tight pointer-events-none select-none group-hover:text-[hsl(var(--copper)/0.18)] transition-colors duration-300"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-[hsl(var(--copper)/0.15)] group-hover:border-[hsl(var(--copper)/0.35)] transition-colors">
                <p.icon className="w-4 h-4 text-primary group-hover:text-[hsl(var(--copper))] transition-colors" aria-hidden="true" />
              </div>
              <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-supporting font-semibold mb-1.5">
                {p.tier}
              </p>
              <p className="font-serif text-lg font-semibold text-primary mb-2 leading-tight">{p.name}</p>
              <p className="text-sm text-muted-foreground leading-snug">{p.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/strategy-lab"
            onClick={() => trackCtaClick("home_strategy_lab", "Open Strategy Lab", "/strategy-lab")}
          >
            <Button
              size="lg"
              className="text-sm uppercase tracking-[0.15em] px-7 py-6 bg-primary text-white hover:bg-primary/90 font-semibold"
              data-testid="button-home-strategy-lab"
            >
              Open Strategy Lab <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link
            href="/deal-blueprint"
            onClick={() => trackCtaClick("home_strategy_lab", "Request a Deal Blueprint", "/deal-blueprint")}
          >
            <Button
              size="lg"
              variant="outline"
              className="text-sm uppercase tracking-[0.15em] px-7 py-6 font-semibold"
              data-testid="button-home-deal-blueprint"
            >
              Request a Deal Blueprint
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Website Structure v1 FINAL §3 (Task #158 amendment) — single
  // compact "What we do" band. Replaces the four separate Deal
  // Architecture / Development / Work With Apollo / MarketFlow teasers
  // (Strategy Lab keeps its own pulled-forward section above). Each
  // card carries the historical section-home-<slug> data-testid so the
  // public-voice guardrail still finds the five surface references.
  function WhatWeDoSection() {
    const cards = [
      {
        eyebrow: "Deal Architecture",
        title: "Ten lanes, one disciplined read.",
        desc: "Every property routes through the same review. The lane that fits the situation wins.",
        href: "/deal-architecture",
        cta: "See the map",
        icon: MapIcon,
        testId: "section-home-deal-architecture",
        source: "home-what-we-do",
      },
      {
        eyebrow: "Development",
        title: "Build first. Everything else supports it.",
        desc: "Seven build lanes phased honestly: ADU additions, value-add rehabs, fix-and-flip, BRRRR, small multifamily, ground-up infill.",
        href: "/development",
        cta: "Inside Development",
        icon: Hammer,
        testId: "section-home-development",
        source: "home-what-we-do",
      },
      {
        eyebrow: "Strategy Lab",
        title: "Tools, conversations, written reads.",
        desc: "Self-serve calculators, Strategy Review, Strategy Snapshot, and the paid Deal Blueprint. The product ladder.",
        href: "/strategy-lab",
        cta: "Open Strategy Lab",
        icon: ClipboardCheck,
        testId: "section-home-strategy-lab",
        source: "home-what-we-do",
      },
      {
        eyebrow: "Work With Apollo",
        title: "Licensed representation, through KW East Bay.",
        desc: "Four lanes for owners and buyers who want a real estate agent. Apollo is the agent. Pegasus is the strategy company.",
        href: "/work-with-apollo",
        cta: "Work With Apollo",
        icon: Key,
        testId: "section-home-work-with-apollo",
        source: "home-what-we-do",
      },
      {
        eyebrow: "MarketFlow",
        title: "The private dealflow layer.",
        desc: "Gated network for reviewed opportunities, trusted operators, and aligned capital.",
        href: "/marketflow",
        cta: "See MarketFlow",
        icon: NetworkIcon,
        testId: "section-home-marketflow",
        source: "home-what-we-do",
        badge: "Private beta · invite only",
        subLinks: [
          { href: "/marketflow/access", label: "Request beta access" },
          { href: "/marketflow/buyboxes", label: "Pegasus Buyboxes" },
        ] as { href: string; label: string }[],
      },
    ] as Array<{
      eyebrow: string;
      title: string;
      desc: string;
      href: string;
      cta: string;
      icon: typeof MapIcon;
      testId: string;
      source: string;
      badge?: string;
      subLinks?: { href: string; label: string }[];
    }>;
    return (
      <section
        className="relative py-24 lg:py-32 bg-muted/15 border-t border-border/30 overflow-hidden"
        data-testid="section-what-we-do"
      >
        <div className="pointer-events-none absolute -top-32 -right-32 w-[36rem] h-[36rem] rounded-full bg-primary/[0.06] blur-3xl" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <ScrollReveal className="max-w-3xl mb-14">
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
              What we do
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-tight mb-5">
              Five surfaces. One operating company.
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Each surface has its own deep page. This band is the index.
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {cards.map((c) => (
              <div
                key={c.testId}
                className="group relative h-full p-6 rounded-lg border border-border/60 bg-card hover:border-[hsl(var(--copper)/0.5)] hover:-translate-y-1 hover:shadow-[0_18px_40px_-22px_rgba(13,27,45,0.35)] transition-all duration-200 overflow-hidden flex flex-col"
                data-testid={c.testId}
              >
                <span
                  className="absolute top-0 left-0 right-0 h-[2px] bg-[hsl(var(--copper))] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  aria-hidden="true"
                />
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-[hsl(var(--copper)/0.15)] group-hover:border-[hsl(var(--copper)/0.4)] transition-colors">
                    <c.icon className="w-5 h-5 text-primary group-hover:text-[hsl(var(--copper))] transition-colors" aria-hidden="true" />
                  </div>
                  {c.badge && (
                    <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] font-supporting font-semibold bg-[hsl(var(--navy))] text-cream px-2 py-0.5 rounded-sm">
                      <Lock className="w-2.5 h-2.5" aria-hidden="true" />
                      {c.badge}
                    </span>
                  )}
                </div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[hsl(var(--copper))] font-supporting font-semibold mb-2">
                  {c.eyebrow}
                </p>
                <Link
                  href={c.href}
                  onClick={() => trackCtaClick(c.source, c.eyebrow, c.href)}
                  className="font-serif text-lg font-semibold leading-tight mb-3 group-hover:text-primary transition-colors before:absolute before:inset-0 before:content-['']"
                >
                  {c.title}
                </Link>
                <p className="text-sm text-muted-foreground leading-snug mb-5 flex-1">
                  {c.desc}
                </p>
                <div className="flex items-center justify-between gap-3 mt-auto pt-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-primary font-supporting font-semibold group-hover:text-[hsl(var(--copper))] transition-colors">
                    {c.cta}
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </div>
                {c.subLinks && c.subLinks.length > 0 && (
                  <div className="mt-3 flex flex-col gap-1.5">
                    {c.subLinks.map((sl) => (
                      <Link
                        key={sl.href}
                        href={sl.href}
                        onClick={(e) => {
                          e.stopPropagation();
                          trackCtaClick(c.source, sl.label, sl.href);
                        }}
                        className="relative inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-[hsl(var(--copper))] font-supporting font-medium transition-colors w-fit"
                        data-testid={`sublink-${c.testId}-${sl.href.split('/').pop()}`}
                      >
                        + {sl.label}
                        <ArrowRight className="w-2.5 h-2.5" aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Amendment 2 §E.5 — Nelson Dr proof, image-first. NOTE: real photos
// are an open launch gate (§J.2). Until 3+ photos + founder-confirmed
// numbers ship, this section uses the case-study cover layout and
// routes readers to the full project page.
function NelsonProofSection() {
  return (
    <section className="py-24 lg:py-32 bg-background" data-testid="section-nelson-proof">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="max-w-2xl mb-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
            Nelson Dr · the proof
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-tight">
            The work speaks louder than the deck.
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border/40 bg-muted/30">
              <HeroPicture
                alt="Nelson Dr · Pleasant Hill · Pegasus DreamScapes case study"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-cream">
                <p className="text-[10px] uppercase tracking-[0.28em] font-supporting font-semibold text-primary mb-2">
                  Case Study
                </p>
                <p className="font-serif text-2xl font-semibold tracking-tight">
                  Nelson Dr · Pleasant Hill, CA
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 space-y-7">
            <p className="text-base sm:text-lg text-foreground/85 leading-relaxed">
              A 3BR/2BA Pleasant Hill single-family acquired off-market. Heavy cosmetic and structural scope. Strategy reviewed at intake, pivoted mid-project as the comp picture shifted, exited cleanly through a disciplined value-add path.
            </p>

            <div className="grid grid-cols-3 gap-3" data-testid="nelson-pills">
              {[
                { kicker: "Acquired", value: "~$600K" },
                { kicker: "Renovation", value: "~$90–100K" },
                { kicker: "Sold", value: "~$840K" },
              ].map((pill) => (
                <div
                  key={pill.kicker}
                  className="rounded-sm border border-border/50 bg-card px-3 py-3 text-center"
                  data-testid={`nelson-pill-${pill.kicker.toLowerCase()}`}
                >
                  <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground font-supporting font-semibold mb-1">
                    {pill.kicker}
                  </p>
                  <p className="font-serif text-lg font-semibold tracking-tight">{pill.value}</p>
                </div>
              ))}
            </div>

            <Link
              href="/projects/nelson-dr"
              onClick={() => trackCtaClick("home_nelson", "Read the case study", "/projects/nelson-dr")}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-supporting font-semibold text-primary hover:text-[hsl(var(--copper))] transition-colors"
              data-testid="link-nelson-case-study"
            >
              Read the full case study <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Amendment 2 §E.6 — single Operator section, merging the prior
// "Operator Behind the Lens" + "Operator's Edge". "20+ years" is
// attributed to the team (Moises Duran), not to Pegasus the company.
function OperatorSection() {
  return (
    <section className="py-24 lg:py-32 bg-[hsl(var(--charcoal))] text-cream" data-testid="section-operator">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="md:col-span-5">
            <picture>
              <source
                type="image/avif"
                srcSet="/images/founder/apollo-480.avif 480w, /images/founder/apollo-768.avif 768w, /images/founder/apollo-1200.avif 1200w"
                sizes="(max-width: 1024px) 90vw, 480px"
              />
              <source
                type="image/webp"
                srcSet="/images/founder/apollo-480.webp 480w, /images/founder/apollo-768.webp 768w, /images/founder/apollo-1200.webp 1200w"
                sizes="(max-width: 1024px) 90vw, 480px"
              />
              <img
                src="/images/founder/apollo-768.jpg"
                srcSet="/images/founder/apollo-480.jpg 480w, /images/founder/apollo-768.jpg 768w, /images/founder/apollo-1200.jpg 1200w"
                sizes="(max-width: 1024px) 90vw, 480px"
                alt="Paolo &quot;Apollo&quot; Duran, Founder of Pegasus DreamScapes"
                width={768}
                height={960}
                className="w-full aspect-[4/5] object-cover object-top rounded-lg border border-cream/15"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>

          <div className="md:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-5">
              The Operator
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-tight text-cream mb-7">
              Meet Apollo.
            </h2>
            <p className="text-lg text-cream/85 leading-relaxed mb-5">
              Paolo "Apollo" Duran founded Pegasus DreamScapes to do real estate the way it should be done: a long-arc operating company instead of a quarterly transaction shop. Every property is treated as a structural problem first and a profit number second.
            </p>
            <p className="text-base text-cream/70 leading-relaxed mb-7">
              The build discipline runs in the family. Apollo's father, Moises Duran, is a licensed General Contractor with decades of commercial and residential construction experience; that operator's lens sits inside every Pegasus project review. DRE-licensed through Keller Williams East Bay. Member NAR · CAR.
            </p>

            <blockquote className="border-l-2 border-[hsl(var(--copper))] pl-5 mb-7">
              <p className="font-serif text-lg sm:text-xl text-cream/95 italic leading-snug">
                &ldquo;Where others see impossible, we see a path. The deal is the architecture of the situation, not the situation itself.&rdquo;
              </p>
            </blockquote>

            <div className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-cream/65 border-t border-cream/10 pt-6">
              <span className="text-xs uppercase tracking-[0.22em] font-supporting">DRE #02333658</span>
              <span className="text-xs uppercase tracking-[0.22em] font-supporting">Keller Williams East Bay</span>
              <span className="text-xs uppercase tracking-[0.22em] font-supporting">NAR · CAR</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Website Structure v1 FINAL §3.8 — renamed from "The Pegasus Standard"
// to "The Dreamscaper Standard". Six commitments. Cinzel display
// numerals 01–06, large and copper, per doctrine v1.0.2 Part A.
function DreamscaperStandardSection() {
  const principles = [
    { title: "Clarity over confusion", desc: "Every situation gets a plain-language read. No jargon, no hidden steps." },
    { title: "Discipline over hype", desc: "Underwriting and process come before growth. We say no often." },
    { title: "Stewardship over extraction", desc: "We protect long-term value: for owners, partners, and neighborhoods." },
    { title: "Honor over pressure", desc: "No urgency tactics, no pushed offers. The right path or no path." },
    { title: "Truth over easy promises", desc: "If we can't help, we say so, and route to who can." },
    { title: "Human review over blind automation", desc: "Software supports the work. People still make the calls." },
  ];

  return (
    <section id="dreamscaper-standard" className="py-24 lg:py-32 bg-card relative overflow-hidden" data-testid="section-dreamscaper-standard">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
            The Dreamscaper Standard
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-[-0.02em] mb-6">
            Six commitments. Every conversation.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The non-negotiables behind every review, every offer, and every routed outcome.
          </p>
        </ScrollReveal>

        <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.07}>
          {principles.map((p, index) => (
            <StaggerItem key={index}>
              <motion.div
                className="group h-full p-8 bg-background rounded-lg border border-border/40 hover:border-[hsl(var(--copper)/0.4)] transition-colors duration-300 relative overflow-hidden"
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25 }}
                data-testid={`pegasus-principle-${index}`}
              >
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[hsl(var(--copper))]/0 group-hover:bg-[hsl(var(--copper))]/70 transition-all duration-400" />
                <span
                  className="font-display block text-5xl sm:text-6xl text-[hsl(var(--copper))] leading-none tabular-nums mb-6 tracking-tight"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-serif text-xl font-semibold mb-3 group-hover:text-[hsl(var(--copper))] transition-colors duration-300">
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

// Amendment 2 §E.8 — Final CTA. Submit + Talk to Peggy. The credential
// strip below carries the locked DRE / KW / NAR / CAR / Pleasant Hill
// disclosure block per launch gate §J.6.
function FinalCTASection() {
  return (
    <section id="final-cta" className="py-20 lg:py-28 bg-[hsl(var(--charcoal))] relative overflow-hidden scroll-mt-24">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cream/10 to-transparent" />
      <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <ScrollReveal>
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-6">
            Every property gets a path.
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] leading-[1.0] mb-6 text-cream" data-testid="text-final-cta-headline">
            Bring us the property.<br />
            <span className="italic bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
              We'll help find the path.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-cream/65 leading-relaxed max-w-xl mx-auto mb-10">
            Three ways to start. Submit a property, run the numbers yourself in Strategy Lab, or work with Apollo directly through KW East Bay.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mb-10">
            <Link href="/submit">
              <Button
                onClick={() => trackEvent("cta_click", { id: "final_primary", to: "/submit" })}
                size="lg"
                className="w-full sm:w-auto px-8 py-6 text-sm uppercase tracking-[0.15em] font-semibold bg-[hsl(var(--copper))] hover:bg-[hsl(27_56%_44%)] text-white border-0"
                data-testid="button-final-cta-sell"
              >
                Submit a Property
                <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/strategy-lab">
              <Button
                onClick={() => trackEvent("cta_click", { id: "final_strategy_lab", to: "/strategy-lab" })}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 py-6 text-sm uppercase tracking-[0.15em] font-semibold border-cream/25 text-cream hover:bg-cream/10 hover:border-cream/40"
                data-testid="button-final-cta-strategy-lab"
              >
                Open Strategy Lab
              </Button>
            </Link>
            <Link href="/work-with-apollo">
              <Button
                onClick={() => trackEvent("cta_click", { id: "final_wwa", to: "/work-with-apollo" })}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 py-6 text-sm uppercase tracking-[0.15em] font-semibold border-cream/25 text-cream hover:bg-cream/10 hover:border-cream/40"
                data-testid="button-final-cta-wwa"
              >
                Work With Apollo
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-8 border-t border-cream/10 text-xs uppercase tracking-[0.22em] text-cream/35">
            <span>DRE #02333658</span>
            <span className="hidden sm:inline text-cream/15">·</span>
            <span>Keller Williams East Bay</span>
            <span className="hidden sm:inline text-cream/15">·</span>
            <span>NAR · CAR</span>
            <span className="hidden sm:inline text-cream/15">·</span>
            <span>Pleasant Hill, CA</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
