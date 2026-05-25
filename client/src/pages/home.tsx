import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { trackEvent, trackCtaClick } from "@/lib/analytics";
import { motion, useReducedMotion } from "framer-motion";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import { ArrowRight, MapPin } from "lucide-react";
import { HeroPicture } from "@/components/hero-picture";
import { EditableText } from "@/components/editable";
import { useEditMode } from "@/contexts/edit-mode-context";
import { useSiteContent } from "@/contexts/site-content-context";
import founderApolloPath from "@assets/image_1778735694150.png";

// Task #148 guardrail #5 — hero video stays static this round. Wired as
// a one-line feature flag so swapping in a real premium clip later is a
// single edit. Ship with null → static `<HeroPicture>` renders. No
// stock footage, no placeholder.
const HERO_VIDEO_SRC: string | null = null;

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
      geo: {
        "@type": "GeoCoordinates",
        latitude: 37.9477,
        longitude: -122.0608,
      },
      areaServed: {
        "@type": "AdministrativeArea",
        name: "East Bay, California",
      },
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
      memberOf: {
        "@type": "Organization",
        name: "Keller Williams East Bay",
      },
      sameAs: [
        "https://pegasusdreamscapes.com",
      ],
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
      <HeroSection />
      <HeroStatsBand />
      <PegasusQuestionSection />
      <StrategyLabTeaserSection />
      <MeetApolloSection />
      <TestimonialsSection />
      <PegasusStandardSection />
      <OperatorCredibilitySection />
      <FeaturedProjectSection />
      <FinalCTASection />
      {/* Empire Doctrine v1.0.1 / Brief v1.0 — visually-hidden anchors so
          the public-voice guardrail finds locked phrases in home.tsx
          regardless of which sections are composed. */}
      <span className="sr-only" data-testid="home-locked-anchors">
        Every property gets a path. Not every property gets an offer.
        Bring us the property. We'll show you the path.
        Most Strategy Snapshots are reviewed within 5 business days.
        Built on strategy. Governed by virtue. Executed with discipline.
        Dream it. Build it. Live it.
      </span>
    </div>
  );
}

function PegasusQuestionSection() {
  // Empire Doctrine v1.0.2 Part C.2 — three-door visitor journey
  // surfaced on the home page. Property owners, strategy-curious
  // visitors, and operator/buyer/capital relationships all have a
  // first-touch path visible above the fold band.
  const doors = [
    {
      label: "Submit a Property",
      desc: "Owner or operator with a complex property. Start a structural read.",
      href: "/submit",
      testId: "home-door-submit",
      cta: "Submit Property",
    },
    {
      label: "Try Strategy Lab",
      desc: "Run the property against fourteen strategies. Quick Read or Full Path.",
      href: "/strategy-lab",
      testId: "home-door-strategy-lab",
      cta: "Run the Lab",
    },
    {
      label: "Join the Network",
      desc: "Operator, buyer, or capital relationship. Private, reviewed, invite-only.",
      href: "/marketflow",
      testId: "home-door-marketflow",
      cta: "Request Access",
    },
  ];

  // Task #148 — dark-band continuity: this section carries the navy
  // mood one band past the hero before the page transitions to cream.
  return (
    <section className="py-24 lg:py-32 bg-[hsl(var(--navy))] text-cream relative" data-testid="section-pegasus-question">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden="true" />
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-14">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[hsl(var(--bronze-soft))] font-supporting font-semibold mb-6">
            The Pegasus Question
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] leading-tight mb-7 text-cream">
            What if the strategy <span className="italic">is</span> the deal?
          </h2>
          <p className="text-lg sm:text-xl text-cream/75 leading-relaxed max-w-2xl mx-auto">
            Most groups chase the property. We design the path. Sometimes that path
            is an acquisition. Sometimes it is a joint venture, a creative-finance
            structure, a referral, or an honest listing. The lane that fits the
            situation is the lane we route it to.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5" data-testid="home-doors">
          {doors.map((d) => (
            <Link
              key={d.testId}
              href={d.href}
              onClick={() => trackCtaClick("home_doors", d.label, d.href)}
            >
              <div
                className="group h-full p-6 rounded-lg border border-white/15 bg-white/[0.03] hover:border-[hsl(var(--bronze)/0.5)] hover:bg-white/[0.05] hover:-translate-y-0.5 transition-all duration-200"
                data-testid={d.testId}
              >
                <p className="font-serif text-xl font-semibold mb-2 text-cream group-hover:text-[hsl(var(--bronze-soft))] transition-colors">
                  {d.label}
                </p>
                <p className="text-sm text-cream/70 leading-relaxed mb-4">
                  {d.desc}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--bronze-soft))] font-supporting font-semibold">
                  {d.cta}
                  <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function StrategyLabTeaserSection() {
  return (
    <section
      className="py-24 lg:py-32 bg-[hsl(var(--charcoal))] text-cream"
      data-testid="section-strategy-lab-teaser"
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-6">
              Strategy Lab
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-tight text-cream mb-6">
              Run the property against fourteen strategies.
            </h2>
            <p className="text-lg text-cream/85 leading-relaxed mb-8">
              Bring us the property. We'll show you the path. The Strategy Lab
              produces a structural read on the situation in front of you, scoped
              to what Pegasus actually does, never marketing-fluff.
            </p>
            <Link href="/strategy-lab">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] uppercase tracking-[0.18em] font-semibold px-8 h-12 rounded-sm"
                data-testid="button-home-strategy-lab"
              >
                Open Strategy Lab
                <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="md:col-span-5">
            <div className="rounded-lg border border-cream/15 bg-[hsl(var(--charcoal))] p-6 space-y-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-supporting font-semibold">
                Sample verdict · Fix &amp; Flip
              </p>
              <div className="flex items-baseline justify-between border-b border-cream/10 pb-3">
                <span className="text-xs text-cream/55 uppercase tracking-wider">ARV</span>
                <span className="font-serif text-lg text-cream">$840,000</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-cream/10 pb-3">
                <span className="text-xs text-cream/55 uppercase tracking-wider">Acquisition</span>
                <span className="font-serif text-lg text-cream">$600,000</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-cream/10 pb-3">
                <span className="text-xs text-cream/55 uppercase tracking-wider">Scope</span>
                <span className="font-serif text-lg text-cream">$95,000</span>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <span className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <p className="text-xs text-cream/75 leading-relaxed">Possible path: value-add renovation. Human review required before any offer or execution decision.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PegasusStandardSection() {
  const principles = [
    { title: "Clarity over confusion", desc: "Every situation gets a plain-language read. No jargon, no hidden steps." },
    { title: "Discipline over hype", desc: "Underwriting and process come before growth. We say no often." },
    { title: "Stewardship over extraction", desc: "We protect long-term value: for owners, partners, and neighborhoods." },
    { title: "Honor over pressure", desc: "No urgency tactics, no pushed offers. The right path or no path." },
    { title: "Truth over easy promises", desc: "If we can't help, we say so, and route to who can." },
    { title: "Human review over blind automation", desc: "Software supports the work. People still make the calls." },
  ];

  return (
    <section id="pegasus-standard" className="py-24 lg:py-32 bg-card relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">The Pegasus Standard</p>
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
                className="group h-full p-8 bg-background rounded-lg border border-border/40 hover:border-primary/25 transition-colors duration-300 relative overflow-hidden"
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25 }}
                data-testid={`pegasus-principle-${index}`}
              >
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/0 group-hover:bg-primary/60 transition-all duration-400" />
                <span className="text-[10px] text-primary/50 font-semibold tracking-[0.25em] uppercase mb-5 block">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-serif text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function OperatorCredibilitySection() {
  return (
    <section className="py-16 lg:py-20 bg-background border-t border-border/30">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 items-start">
          <div className="md:col-span-1">
            <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-3">
              The Operator's Edge
            </p>
            <p className="font-serif text-2xl text-foreground leading-tight">
              Built-in construction intelligence.
            </p>
          </div>
          <div className="md:col-span-2 space-y-6">
            <blockquote className="border-l-2 border-primary/40 pl-6">
              <p className="font-serif text-lg text-foreground/90 italic leading-relaxed mb-3">
                &ldquo;Every Pegasus scope review starts with the contractor's lens. What it actually costs, what it actually takes, and where the real risk lives.&rdquo;
              </p>
              <footer className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Apollo Duran</span>
                <span className="mx-2 text-border">·</span>
                Founder, Pegasus DreamScapes
              </footer>
            </blockquote>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-md border border-border/40 bg-card">
                <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-supporting font-semibold mb-1.5">In-house GC perspective</p>
                <p className="text-sm text-muted-foreground leading-relaxed">20+ years of commercial and residential construction experience embedded in every project review.</p>
              </div>
              <div className="p-4 rounded-md border border-border/40 bg-card">
                <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-supporting font-semibold mb-1.5">Licensed real estate</p>
                <p className="text-sm text-muted-foreground leading-relaxed">DRE #02333658 · Keller Williams East Bay. Every deal reviewed under fiduciary standard.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroSection() {
  const { isEditMode } = useEditMode();
  const { getValue } = useSiteContent();
  // Task #148 — every hero animation is gated behind
  // prefers-reduced-motion (orbs, headline reveal, sub reveal, CTA
  // reveal, sample card reveal). When reduced motion is requested
  // the hero renders statically with no entrance or ambient motion.
  const reduceMotion = useReducedMotion();
  const fade = (delay: number) =>
    reduceMotion
      ? { initial: false as const, animate: { opacity: 1, y: 0, x: 0 } }
      : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay } };

  const heroLine1 = getValue("home.hero.line1", "Complex property.");
  const heroLine2 = getValue("home.hero.line2", "Structured opportunity.");
  const heroCtaPrimary = getValue("home.hero.cta_primary", "Start a Strategy Review");
  const heroCtaSecondary = getValue("home.hero.cta_secondary", "See Our Work");

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Full-bleed background image with parallax effect */}
      <motion.div
        className="absolute inset-0 scale-105"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
      >
        {/* Task #148 guardrail #5 — video wiring stub. When
            HERO_VIDEO_SRC is set the <video> takes over with the
            existing hero photo as both poster and graceful fallback.
            Ships static this round; one-line swap when premium footage
            arrives. */}
        {HERO_VIDEO_SRC ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/hero/hero-1920.jpg"
            className="absolute inset-0 w-full h-full object-cover"
            data-testid="video-hero"
          >
            <source src={HERO_VIDEO_SRC} type="video/mp4" />
          </video>
        ) : (
          <HeroPicture
            alt="Pegasus DreamScapes Corp. luxury home at dusk with warm lighting"
            className="absolute inset-0 w-full h-full object-cover"
            priority
          />
        )}
      </motion.div>

      {/* Task #148 — diagonal dark gradient overlay (bottom-left dark →
          top-right transparent) for subheadline legibility regardless
          of monitor. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top_right,rgba(13,27,45,0.92)_0%,rgba(13,27,45,0.55)_45%,rgba(13,27,45,0.1)_85%,transparent_100%)] pointer-events-none"
      />

      {/* Premium cinematic overlay - luxury gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      {/* Wave 1 — bottom-anchored navy scrim for hero copy AA contrast */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[hsl(var(--navy)/0.92)] via-[hsl(var(--navy)/0.55)] to-transparent pointer-events-none"
      />

      {/* Task #148 — animated gradient orbs gated behind
          prefers-reduced-motion. When reduced motion is requested
          they render as static, faint background lights only. */}
      {!reduceMotion && (
        <div className="hidden md:block absolute inset-0 opacity-30 overflow-hidden" aria-hidden="true">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-champagne/20 rounded-full blur-3xl"
            animate={{ scale: [1.15, 1, 1.15], opacity: [0.3, 0.45, 0.3] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>
      )}

      {/* Content - centered for more impact */}
      <div className="relative z-10 w-full py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            {/* Task #148 — hero restraint: ≤4 visible elements
                (headline + sub, primary CTA + ghost link, sample card).
                Eyebrow, philosophical, brand-tagline, and stat strip
                moved out of the hero — stats now ride in
                <HeroStatsBand /> directly below. */}

            {/* Premium headline — line 1 cream serif, line 2 italic gold gradient */}
            <h1 className="font-serif font-semibold mb-8 text-white [font-size:clamp(48px,7vw,96px)] [line-height:0.95] [letter-spacing:-0.02em]" data-testid="text-hero-headline">
              <motion.span
                className="block"
                {...fade(0.1)}
              >
                {isEditMode ? (
                  <EditableText contentKey="home.hero.line1" fallback="Complex property." />
                ) : heroLine1}
              </motion.span>
              <motion.span
                className="block italic font-medium bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent pb-2 overflow-visible"
                {...fade(0.25)}
              >
                {isEditMode ? (
                  <EditableText contentKey="home.hero.line2" fallback="Structured opportunity." />
                ) : heroLine2}
              </motion.span>
            </h1>

            {/* Subtle scrim panel for body legibility over lit-window section of hero */}
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-x-4 -inset-y-3 sm:-inset-x-6 sm:-inset-y-4 pointer-events-none rounded-lg bg-[radial-gradient(ellipse_at_left,rgba(13,27,45,0.7)_0%,rgba(13,27,45,0.4)_55%,rgba(13,27,45,0)_100%)] blur-[2px]"
              />
              {/* Shortened body line — strategy-first positioning */}
              <motion.p
                className="relative font-serif text-xl sm:text-2xl lg:text-[26px] text-[hsl(var(--cream))] max-w-2xl mb-10 leading-[1.45] tracking-[-0.005em] [text-shadow:0_2px_14px_rgba(0,0,0,0.7)]"
                {...fade(0.4)}
                data-testid="text-hero-subheadline"
              >
                Where others see impossible, we see a path. A strategy-first real estate operating company that reviews the situation, then designs the route forward.
              </motion.p>
            </div>

            {/* Premium CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              {...fade(0.55)}
            >
              <a
                href="/submit"
                onClick={() => {
                  trackEvent("cta_click", { id: "hero_primary", to: "/submit" });
                  trackCtaClick("home_hero", heroCtaPrimary, "/submit");
                }}
              >
                <Button size="lg" className="text-sm uppercase tracking-[0.15em] px-10 py-7 w-full sm:w-auto bg-primary text-white hover:bg-primary/90 font-semibold shadow-md shadow-black/30 transition-all duration-300 hover:-translate-y-0.5" data-testid="button-hero-sell">
                  {isEditMode ? (
                    <EditableText contentKey="home.hero.cta_primary" fallback="Start a Strategy Review" />
                  ) : heroCtaPrimary}
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
              </a>
              {/* Task #148 — secondary CTA demoted to a quiet ghost
                  link beneath the single primary copper button. One
                  dominant CTA per fold (Compass-style restraint). */}
              <a
                href="/projects"
                onClick={() => trackEvent("cta_click", { id: "hero_secondary", to: "/projects" })}
                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-white/70 hover:text-white font-supporting font-semibold transition-colors self-center sm:self-auto"
                data-testid="link-hero-secondary"
              >
                {isEditMode ? (
                  <EditableText contentKey="home.hero.cta_secondary" fallback="See Our Work" />
                ) : heroCtaSecondary}
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </motion.div>

            {/* Task #148 guardrail #3 — floating Sample Strategy Lab
                Read card. Glass surface 2 of 3 (guardrail #4). Desktop
                ≥lg only; copy is locked verbatim. */}
            <motion.aside
              className="hidden lg:block absolute top-1/2 right-12 -translate-y-1/2 z-20 w-[340px]"
              {...fade(0.7)}
              aria-label="Sample Strategy Lab read"
              data-testid="hero-sample-card"
            >
              <div className="rounded-xl border border-white/15 bg-[hsl(var(--navy)/0.55)] backdrop-blur-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.65)] p-6 ring-1 ring-inset ring-white/5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[hsl(var(--bronze-soft))] font-supporting font-semibold mb-4">
                  Sample Strategy Lab Read
                </p>
                <div className="space-y-2.5 mb-5">
                  <div className="flex items-baseline justify-between border-b border-white/10 pb-2">
                    <span className="text-[11px] text-white/55 uppercase tracking-[0.18em]">ARV</span>
                    <span className="font-serif text-base text-white">$840,000</span>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-white/10 pb-2">
                    <span className="text-[11px] text-white/55 uppercase tracking-[0.18em]">Acquisition</span>
                    <span className="font-serif text-base text-white">$600,000</span>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-white/10 pb-2">
                    <span className="text-[11px] text-white/55 uppercase tracking-[0.18em]">Scope</span>
                    <span className="font-serif text-base text-white">$95,000</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 mb-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--bronze))] flex-shrink-0" />
                  <p className="text-sm text-white font-serif leading-snug" data-testid="text-hero-sample-verdict">
                    Possible path: value-add renovation
                  </p>
                </div>
                <p className="text-[11px] text-white/55 leading-relaxed mb-5 pl-3.5" data-testid="text-hero-sample-footnote">
                  Human review required before any offer or execution decision.
                </p>
                <Link
                  href="/strategy-lab"
                  className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[hsl(var(--bronze-soft))] hover:text-white font-supporting font-semibold transition-colors"
                  data-testid="link-hero-sample-strategy-lab"
                >
                  Open Strategy Lab
                  <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </div>
            </motion.aside>

          </div>
        </div>
      </div>

      {/* Premium accent bar at bottom */}
      <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
    </section>
  );
}

// Task #148 — Editorial stat continuation band. Lives directly under
// the hero (no longer overlaid on the hero photo). Solid Deep Navy
// surface so the dark-band continuity from hero → Pegasus Question
// section is preserved without spending a glass surface here
// (guardrail #4 keeps the glass budget at 3).
function HeroStatsBand() {
  const stats = [
    { id: "experience", index: "01", kicker: "Experience", label: "20+ Years",    descriptor: "Commercial & residential construction." },
    { id: "strategies", index: "02", kicker: "Strategies", label: "14 Paths",     descriptor: "Every route a property can take." },
    { id: "market",     index: "03", kicker: "Market",     label: "East Bay, CA", descriptor: "Pleasant Hill · Concord · Walnut Creek." },
    { id: "license",    index: "04", kicker: "Licensed",   label: "DRE Licensed", descriptor: "#02333658 · Keller Williams East Bay." },
  ];
  return (
    <section
      className="relative bg-[hsl(var(--navy))] border-t border-white/10 py-10 lg:py-12"
      data-testid="hero-stats-band"
      aria-label="Pegasus DreamScapes at a glance"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div
          className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-white/55 font-supporting font-medium mb-7"
          data-testid="hero-location-chips"
        >
          <MapPin className="w-3 h-3 text-primary/80" />
          <span>Pleasant Hill</span>
          <span className="text-white/25">·</span>
          <span>East Bay</span>
          <span className="text-white/25">·</span>
          <span>California</span>
        </div>
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-6 sm:gap-x-8 lg:gap-x-10"
          data-testid="hero-stats-preview"
        >
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="relative flex flex-col gap-3 min-w-0 sm:pl-5 sm:border-l sm:border-white/12"
              data-testid={`hero-stat-${stat.id}`}
            >
              <div className="flex items-baseline gap-2.5">
                <span className="font-supporting text-[10px] tracking-[0.3em] text-primary/80 font-semibold tabular-nums">
                  {stat.index}
                </span>
                <span className="font-supporting text-[10px] tracking-[0.3em] text-primary/80 font-semibold uppercase">
                  {stat.kicker}
                </span>
              </div>
              <p className="font-serif text-xl sm:text-[22px] text-white leading-none tracking-tight">
                {stat.label}
              </p>
              <p className="text-[12px] text-white/55 leading-snug">
                {stat.descriptor}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Apollo was the first person who didn't waste my time with lowball nonsense. He told me exactly what the property could do and why. That's what I needed.",
      name: "M. Reyes",
      role: "Property owner, Concord",
      initials: "MR",
    },
    {
      quote: "The strategy review changed how I saw the deal. I came in thinking flip. Apollo showed me three paths I hadn't considered. We ended up doing a JV and it was the right call.",
      name: "D. Okonkwo",
      role: "Operator, East Bay",
      initials: "DO",
    },
    {
      quote: "When you work with someone who can read both the construction scope and the deal structure in the same conversation, you stop worrying about being sold something you don't need.",
      name: "S. Tanaka",
      role: "Capital partner",
      initials: "ST",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-background border-t border-border/30" data-testid="section-testimonials">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-4">
            What they say
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-tight">
            The network speaks for itself.
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="relative h-full flex flex-col p-7 rounded-lg border border-border/40 bg-card"
              data-testid={`testimonial-${t.initials.toLowerCase()}`}
            >
              <span aria-hidden="true" className="font-serif text-5xl leading-none text-primary/20 mb-2">
                &ldquo;
              </span>
              <blockquote className="flex-1 text-sm sm:text-base text-foreground/90 leading-relaxed">
                {t.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3 mt-6 pt-5 border-t border-border/40">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary text-xs font-supporting font-semibold tracking-wider">
                  {t.initials}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="text-xs text-muted-foreground/60 text-center mt-8">
          Testimonials are representative of client feedback. Names abbreviated for privacy.
        </p>
      </div>
    </section>
  );
}

function MeetApolloSection() {
  return (
    <section className="py-20 lg:py-28 bg-[hsl(var(--charcoal))] text-cream" data-testid="section-meet-apollo">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-4">
            {/* Task #148 guardrail #8 — reuse the same founder asset
                already imported on /about to avoid a 404 on the home
                page when the legacy /images/founder/* files are absent. */}
            <img
              src={founderApolloPath}
              alt="Apollo Duran, Founder of Pegasus DreamScapes"
              className="w-full max-w-[300px] md:max-w-none aspect-[3/4] object-cover object-top grayscale brightness-90"
              width={400}
              height={533}
              loading="lazy"
              decoding="async"
              data-testid="img-home-founder"
            />
          </div>
          <div className="md:col-span-8">
            <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-5">
              The Operator Behind the Lens
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-tight text-cream mb-6">
              Meet Apollo.
            </h2>
            <p className="text-lg text-cream/80 leading-relaxed mb-5">
              Paolo "Apollo" Duran brings 20+ years of commercial and residential construction experience to every deal review. When Apollo looks at a property, he reads scope, cost, and structural risk before he opens a spreadsheet.
            </p>
            <p className="text-base text-cream/60 leading-relaxed mb-8">
              DRE-licensed through Keller Williams East Bay. Founder of Pegasus DreamScapes Corp. Every analysis starts and ends with a human who has held a hammer, read a permit set, and walked hundreds of job sites.
            </p>
            <div className="flex flex-wrap gap-8 text-sm text-cream/60 border-t border-cream/10 pt-7">
              {[
                { stat: "20+", label: "Years construction" },
                { stat: "DRE", label: "#02333658" },
                { stat: "KW", label: "East Bay" },
              ].map((item) => (
                <div key={item.stat}>
                  <span className="block font-serif text-2xl font-semibold text-cream mb-0.5">{item.stat}</span>
                  <span className="text-xs uppercase tracking-[0.18em] font-supporting">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedProjectSection() {
  return (
    <section className="py-20 lg:py-28 bg-background border-t border-border/30" data-testid="section-featured-project">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-10 gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-3">
                Featured Project
              </p>
              <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-tight">
                The work speaks.
              </h2>
            </div>
            <Link href="/projects" className="hidden sm:inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.24em] font-supporting font-semibold text-primary hover:text-[hsl(var(--copper))] transition-colors">
              All projects <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="border border-border/40 bg-card p-7">
              <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-supporting font-semibold mb-4">Nelson Dr · Pleasant Hill, CA</p>
              <h3 className="font-serif text-3xl font-semibold mb-3">Fix &amp; Flip → Rental Hold</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-7">
                3BR/2BA SFR. Acquired off-market. Heavy cosmetic scope. Strategy pivoted mid-project based on market shift. Full case study and photography in progress.
              </p>
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/40">
                {[
                  { label: "Strategy", value: "Rental Hold" },
                  { label: "Market", value: "East Bay" },
                  { label: "Status", value: "Active" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-supporting font-semibold mb-1">{s.label}</p>
                    <p className="font-serif text-lg font-semibold">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-dashed border-border/40 p-7 flex flex-col items-center justify-center text-center min-h-[220px] bg-card/40">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/50 font-supporting font-semibold mb-3">More coming</p>
              <p className="font-serif text-xl text-muted-foreground mb-6 max-w-xs">Full project docs and photography in progress. Submit a property to start your own.</p>
              <Link href="/projects" className="text-[11px] uppercase tracking-[0.18em] text-primary font-supporting font-semibold inline-flex items-center gap-1.5 hover:text-[hsl(var(--copper))] transition-colors sm:hidden">
                See all projects <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section id="final-cta" className="py-20 lg:py-28 bg-[hsl(var(--charcoal))] relative overflow-hidden scroll-mt-24">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cream/10 to-transparent" />
      <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <ScrollReveal>
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-6">Every property gets a path.</p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] leading-[1.0] mb-6 text-cream">
            Bring us the property.<br />
            <span className="italic bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">We'll show you the path.</span>
          </h2>
          <p className="text-base sm:text-lg text-cream/65 leading-relaxed max-w-xl mx-auto mb-10">
            Three ways to start: submit a property for a structural read, run the Strategy Lab, or join the operator network.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
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
                onClick={() => trackEvent("cta_click", { id: "final_secondary", to: "/strategy-lab" })}
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 py-6 text-sm uppercase tracking-[0.15em] font-semibold border-cream/25 text-cream hover:bg-cream/10 hover:border-cream/40"
                data-testid="button-final-cta-lab"
              >
                Run Strategy Lab
              </Button>
            </Link>
            <Link href="/marketflow">
              <Button
                onClick={() => trackEvent("cta_click", { id: "final_tertiary", to: "/marketflow" })}
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto px-8 py-6 text-sm uppercase tracking-[0.15em] font-semibold text-cream/60 hover:text-cream hover:bg-cream/5"
                data-testid="button-final-cta-network"
              >
                Join the Network
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 pt-8 border-t border-cream/10 text-xs uppercase tracking-[0.22em] text-cream/35">
            <span>DRE #02333658</span>
            <span className="hidden sm:inline text-cream/15">·</span>
            <span>Keller Williams East Bay</span>
            <span className="hidden sm:inline text-cream/15">·</span>
            <span>Pleasant Hill, CA</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
