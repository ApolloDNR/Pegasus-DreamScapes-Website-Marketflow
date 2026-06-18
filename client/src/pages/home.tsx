import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { trackEvent, trackCtaClick } from "@/lib/analytics";
import { motion } from "framer-motion";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import {
  ArrowRight,
  Calculator,
  Network as NetworkIcon,
  Home as HomeIcon,
  Handshake,
  Hammer,
  Key,
  Compass,
  Lock,
  FileText,
  ClipboardCheck,
  Map as MapIcon,
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
      slogan: "Deal Strategy & Real Estate Execution",
      email: "apollo@pegasusdreamscapes.com",
      telephone: "+1-925-744-8525",
      address: {
        "@type": "PostalAddress",
        addressLocality: "East Bay",
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
      {/* Website Structure v1 FINAL §3 — funnel composition. Round-3
          visual refresh blends CinematicV2 rhythm (SectionOpener,
          horizontal "what we do" bands, restrained copper) with
          CinematicV3 duotone imagery on the Nelson and Apollo
          photographs. Hero is intentionally untouched per user lock. */}
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
        Most Strategy Snapshots are reviewed within 48 hours.
        The Dreamscaper Standard.
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Shared section opener (CinematicV2 rhythm).
// Numeral + hairline + eyebrow + Cinzel title + Cormorant deck.
// Used across every below-the-fold section for consistent rhythm.
// ─────────────────────────────────────────────────────────────────────
function SectionOpener({
  num,
  eyebrow,
  title,
  deck,
  light = false,
  align = "left",
  className = "",
}: {
  num: string;
  eyebrow: string;
  title: React.ReactNode;
  deck?: React.ReactNode;
  light?: boolean;
  align?: "left" | "center";
  className?: string;
}) {
  const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";
  const eyebrowColor = light ? "text-[hsl(var(--navy))]" : "text-cream";
  const titleColor = light ? "text-[hsl(var(--navy))]" : "text-cream";
  const deckColor = light ? "text-[hsl(var(--navy))]/70" : "text-cream/70";
  return (
    <div className={`flex flex-col gap-6 mb-12 ${alignClass} ${className}`}>
      <div className={`flex items-center gap-4 ${align === "center" ? "justify-center" : ""}`}>
        <span
          className="font-display text-[hsl(var(--copper))] text-base sm:text-lg tabular-nums tracking-tight"
          aria-hidden="true"
        >
          {num}
        </span>
        <span className="h-px w-10 bg-[hsl(var(--copper))]/60" aria-hidden="true" />
        <span className={`text-[11px] uppercase tracking-[0.3em] font-supporting font-semibold ${eyebrowColor}/70`}>
          {eyebrow}
        </span>
      </div>
      <h2
        className={`font-serif font-semibold tracking-[-0.02em] leading-[1.05] text-4xl sm:text-5xl lg:text-[64px] ${titleColor}`}
      >
        {title}
      </h2>
      {deck && (
        <p
          className={`font-serif italic leading-snug text-xl sm:text-2xl lg:text-[28px] max-w-3xl ${deckColor}`}
        >
          {deck}
        </p>
      )}
    </div>
  );
}

// Thin copper hairline used between major sections for cinematic continuity.
function HairlineRule({ light = false }: { light?: boolean }) {
  return (
    <div
      className={`h-px w-full ${light ? "bg-[hsl(var(--navy))]/15" : "bg-[hsl(var(--copper))]/25"}`}
      aria-hidden="true"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// HERO — locked per user. Identical to prior version.
// ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const { isEditMode } = useEditMode();
  const { getValue } = useSiteContent();

  const heroLine1 = getValue("home.hero.line1", "Complex property.");
  const heroLine2 = getValue("home.hero.line2", "Structured opportunity.");
  const heroCtaPrimary = getValue("home.hero.cta_primary", "Submit a Property");
  const heroPhilosophical = "Read honestly. Scoped tightly. Delivered as promised.";

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

// ─────────────────────────────────────────────────────────────────────
// TRUST STRIP — Amendment 2 §E.2.
// Construction experience attributed to the team (Moises Duran),
// never to Pegasus the company. "20+ years" attributed to Pegasus
// is forbidden. Refreshed with copper hairline rules above and below
// to match the new section rhythm.
// ─────────────────────────────────────────────────────────────────────
function TrustStripSection() {
  return (
    <section
      className="py-8 lg:py-10 bg-[hsl(var(--navy))] border-t border-[hsl(var(--copper))]/25 border-b border-[hsl(var(--copper))]/25"
      data-testid="section-trust-strip"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <p
          className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-cream/75 font-supporting font-medium text-center leading-relaxed"
          data-testid="text-trust-strip"
        >
          Decades of East Bay construction in the team
          <span className="mx-3 text-[hsl(var(--copper))]/60">/</span>
          DRE #02333658
          <span className="mx-3 text-[hsl(var(--copper))]/60">/</span>
          KW East Bay
          <span className="mx-3 text-[hsl(var(--copper))]/60">/</span>
          NAR
          <span className="mx-3 text-[hsl(var(--copper))]/60">/</span>
          CAR
          <span className="mx-3 text-[hsl(var(--copper))]/60">/</span>
          East Bay, CA
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// AUDIENCE SORT — Website Structure v1 FINAL §3.2.
// Four front doors: Sellers · Buyers · Capital Partners · Vendors.
// Visual: SectionOpener + 4 equal-height tiles, top-border copper
// accent on hover. CinematicV2 rhythm.
// ─────────────────────────────────────────────────────────────────────
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
    <section className="py-24 lg:py-32 bg-[hsl(var(--navy))]" data-testid="section-what-brings-you-here">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="max-w-4xl">
          <SectionOpener
            num="01"
            eyebrow="Orientation"
            title="What brings you here?"
            deck="Four front doors. All four route through the same disciplined review."
          />
        </ScrollReveal>

        <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" staggerDelay={0.06}>
          {cards.map((c) => (
            <StaggerItem key={c.testId}>
              <Link href={c.href} onClick={() => trackCtaClick(c.source, c.eyebrow, c.href)}>
                <div
                  className="group relative h-full p-8 bg-[hsl(var(--charcoal))] border-t-2 border-transparent hover:border-[hsl(var(--copper))] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  data-testid={c.testId}
                >
                  <div className="w-12 h-12 flex items-center justify-center mb-8 bg-[hsl(var(--navy))]/40 border border-cream/10 group-hover:border-[hsl(var(--copper))]/50 transition-colors">
                    <c.icon className="w-5 h-5 text-[hsl(var(--copper))]" aria-hidden="true" strokeWidth={1.5} />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[hsl(var(--copper))] font-supporting font-semibold mb-3">
                    {c.eyebrow}
                  </p>
                  <p className="font-serif text-2xl text-cream mb-3 leading-tight">
                    {c.label}
                  </p>
                  <p className="font-serif italic text-base text-cream/65 leading-relaxed mb-8">
                    {c.desc}
                  </p>
                  <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--copper))] font-supporting font-semibold">
                    {c.cta}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
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

// ─────────────────────────────────────────────────────────────────────
// NELSON DR PROOF — Amendment 2 §E.5.
// Real Nelson Dr exterior photo (full color) with a navy gradient
// at the base for architect's project plate legibility (Year · Type
// · Location). Real numbers preserved (Acquired ~$600K · Reno
// $100K · Sold ~$840K). Location: Richmond / El Sobrante Area, CA.
// The full /projects/nelson-dr case study body is still gated on
// founder-confirmed copy (§J.2).
// ─────────────────────────────────────────────────────────────────────
function NelsonProofSection() {
  return (
    <section className="py-24 lg:py-32 bg-[hsl(var(--navy))] border-t border-[hsl(var(--copper))]/20" data-testid="section-nelson-proof">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="max-w-4xl">
          <SectionOpener
            num="02"
            eyebrow="Case study"
            title="The work speaks louder than the deck."
            deck="Nelson Dr. A flagship testament to the structural approach."
          />
        </ScrollReveal>

        <div className="grid md:grid-cols-12 gap-10 lg:gap-14 items-start mt-8">
          {/* Duotone image with architect's plate overlay (v3 treatment) */}
          <div className="md:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden border border-cream/10 bg-[hsl(var(--charcoal))]">
              <picture>
                <source
                  type="image/avif"
                  srcSet="/images/nelson/nelson-exterior-768.avif 768w, /images/nelson/nelson-exterior-1280.avif 1280w"
                  sizes="(min-width: 768px) 58vw, 100vw"
                />
                <source
                  type="image/webp"
                  srcSet="/images/nelson/nelson-exterior-768.webp 768w, /images/nelson/nelson-exterior-1280.webp 1280w"
                  sizes="(min-width: 768px) 58vw, 100vw"
                />
                <img
                  src="/images/nelson/nelson-exterior-1280.jpg"
                  srcSet="/images/nelson/nelson-exterior-768.jpg 768w, /images/nelson/nelson-exterior-1280.jpg 1280w"
                  sizes="(min-width: 768px) 58vw, 100vw"
                  alt="Nelson Dr · Richmond / El Sobrante Area · Pegasus DreamScapes case study"
                  width={1280}
                  height={960}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--navy))]/85 via-[hsl(var(--navy))]/10 to-transparent" aria-hidden="true" />

              {/* Architect's project plate */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="inline-block bg-[hsl(var(--navy))] border border-[hsl(var(--copper))]/30 p-5">
                  <div className="flex flex-wrap gap-x-8 gap-y-3 text-[10px] uppercase tracking-[0.28em] font-supporting font-semibold text-cream">
                    <div>
                      <div className="text-cream/40 mb-1">Year</div>
                      <div>2024</div>
                    </div>
                    <div>
                      <div className="text-cream/40 mb-1">Type</div>
                      <div>Value-Add</div>
                    </div>
                    <div>
                      <div className="text-cream/40 mb-1">Location</div>
                      <div>Richmond / El Sobrante</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 space-y-7">
            <p className="font-serif italic text-xl text-cream/85 leading-relaxed">
              A 3BR/2BA Richmond / El Sobrante single-family acquired off-market. Heavy cosmetic and structural scope. Strategy reviewed at intake, pivoted mid-project as the comp picture shifted, exited cleanly through a disciplined value-add path.
            </p>

            <div className="grid grid-cols-3 gap-3" data-testid="nelson-pills">
              {[
                { kicker: "Acquired", value: "~$600K" },
                { kicker: "Renovation", value: "$100K" },
                { kicker: "Sold", value: "~$840K" },
              ].map((pill) => (
                <div
                  key={pill.kicker}
                  className="border border-cream/10 bg-[hsl(var(--charcoal))] px-3 py-4 text-center"
                  data-testid={`nelson-pill-${pill.kicker.toLowerCase()}`}
                >
                  <p className="text-[9px] uppercase tracking-[0.24em] text-cream/50 font-supporting font-semibold mb-1.5">
                    {pill.kicker}
                  </p>
                  <p className="font-display text-xl tabular-nums text-[hsl(var(--copper))]">{pill.value}</p>
                </div>
              ))}
            </div>

            <Link
              href="/projects/nelson-dr"
              onClick={() => trackCtaClick("home_nelson", "Read the case study", "/projects/nelson-dr")}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] font-supporting font-semibold text-[hsl(var(--copper))] hover:text-cream transition-colors"
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

// ─────────────────────────────────────────────────────────────────────
// STRATEGY LAB TEASER — Website Structure v1 FINAL §3.5.
// Four named products (Strategy Lab · Strategy Review · Strategy Snapshot
// · Deal Blueprint). Cream-panel inversion for breathing rhythm.
// Required phrase: "Most Strategy Snapshots are reviewed within 5
// business days." preserved verbatim.
// ─────────────────────────────────────────────────────────────────────
function StrategyLabTeaserSection() {
  const products = [
    { icon: Calculator, name: "Strategy Lab", tier: "Self-serve", desc: "Public calculator surface. Your preliminary read in minutes." },
    { icon: Compass, name: "Strategy Review", tier: "Conversation", desc: "Human-reviewed conversation off the Submit form." },
    { icon: FileText, name: "Strategy Snapshot", tier: "Written", desc: "Preliminary written read. Most Strategy Snapshots are reviewed within 48 hours." },
    { icon: ClipboardCheck, name: "Deal Blueprint", tier: "By Review", desc: "By-review, full underwriting and path document." },
  ];
  return (
    <section
      className="relative py-24 lg:py-32 bg-[hsl(var(--cream))] text-[hsl(var(--navy))] border-t border-[hsl(var(--copper))]/25"
      data-testid="section-home-strategy-lab"
    >
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="max-w-4xl">
          <SectionOpener
            num="03"
            eyebrow="Underwriting"
            title="Run the situation through the Pegasus lens."
            deck="Four named products. One taxonomy. The output is your preliminary read, never a 5th product name."
            light
          />
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12" data-testid="home-strategy-lab-products">
          {products.map((p, i) => (
            <div
              key={p.name}
              className="group relative p-7 bg-white border-t-2 border-transparent hover:border-[hsl(var(--copper))] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <span
                className="font-display absolute top-3 right-4 text-5xl text-[hsl(var(--navy))]/[0.05] leading-none tracking-tight pointer-events-none select-none group-hover:text-[hsl(var(--copper))]/20 transition-colors duration-300"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="w-10 h-10 flex items-center justify-center mb-6 bg-[hsl(var(--navy))]/5 border border-[hsl(var(--navy))]/10 group-hover:border-[hsl(var(--copper))]/40 transition-colors">
                <p.icon className="w-4 h-4 text-[hsl(var(--navy))] group-hover:text-[hsl(var(--copper))] transition-colors" aria-hidden="true" strokeWidth={1.5} />
              </div>
              <p className="text-[9px] uppercase tracking-[0.24em] text-[hsl(var(--navy))]/55 font-supporting font-semibold mb-2">
                {p.tier}
              </p>
              <p className="font-serif text-lg text-[hsl(var(--navy))] mb-2 leading-tight">{p.name}</p>
              <p className="font-serif italic text-base text-[hsl(var(--navy))]/65 leading-snug">{p.desc}</p>
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
              className="text-sm uppercase tracking-[0.18em] px-8 py-6 bg-[hsl(var(--copper))] text-white hover:bg-[hsl(var(--copper))]/90 font-semibold rounded-none"
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
              className="text-sm uppercase tracking-[0.18em] px-8 py-6 font-semibold border-[hsl(var(--navy))]/30 text-[hsl(var(--navy))] hover:bg-[hsl(var(--navy))]/5 rounded-none"
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

// ─────────────────────────────────────────────────────────────────────
// WHAT WE DO — Website Structure v1 FINAL §3 / Task #158.
// CinematicV2 horizontal-band layout. Single compact band of five
// surfaces (Deal Architecture · Development · Strategy Lab · Work
// With Apollo · MarketFlow). Each row keeps the historical
// section-home-<slug> testid and MarketFlow keeps its "Private beta ·
// invite only" status badge + sub-links (Request beta access · Pegasus
// Buyboxes).
// ─────────────────────────────────────────────────────────────────────
function WhatWeDoSection() {
  const cards = [
    {
      eyebrow: "Deal Strategy",
      title: "Ten lanes, one disciplined read.",
      desc: "Every property routes through the same review. The lane that fits the situation wins.",
      href: "/deal-architecture",
      cta: "See the map",
      icon: MapIcon,
      testId: "section-home-deal-architecture",
      source: "home-what-we-do",
      num: "04",
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
      num: "05",
    },
    {
      eyebrow: "Strategy Lab",
      title: "Tools, conversations, written reads.",
      desc: "Self-serve calculators, Strategy Review, Strategy Snapshot, and the by-review Deal Blueprint. The product ladder.",
      href: "/strategy-lab",
      cta: "Open Strategy Lab",
      icon: ClipboardCheck,
      testId: "section-home-strategy-lab",
      source: "home-what-we-do",
      num: "06",
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
      num: "07",
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
      num: "08",
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
    num: string;
    badge?: string;
    subLinks?: { href: string; label: string }[];
  }>;

  return (
    <section
      className="relative py-24 lg:py-32 bg-[hsl(var(--navy))] border-t border-[hsl(var(--copper))]/25 overflow-hidden"
      data-testid="section-what-we-do"
    >
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 mb-12">
        <ScrollReveal className="max-w-4xl">
          <SectionOpener
            num="04"
            eyebrow="Capabilities"
            title="Five surfaces. One operating company."
            deck="Each surface has its own deep page. This band is the index."
          />
        </ScrollReveal>
      </div>

      <div className="relative w-full border-t border-cream/10">
        {cards.map((c) => (
          <div
            key={c.testId}
            className="group relative border-b border-cream/10 hover:bg-[hsl(var(--charcoal))]/40 transition-colors duration-300"
            data-testid={c.testId}
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 lg:py-12 flex flex-col lg:flex-row lg:items-baseline gap-6 lg:gap-10">
              <span
                className="font-display text-[hsl(var(--copper))] text-base tabular-nums tracking-tight lg:w-12 shrink-0"
                aria-hidden="true"
              >
                {c.num}
              </span>
              <div className="lg:w-1/3 shrink-0">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[hsl(var(--copper))] font-supporting font-semibold mb-2">
                  {c.eyebrow}
                </p>
                <Link
                  href={c.href}
                  onClick={() => trackCtaClick(c.source, c.eyebrow, c.href)}
                  className="font-serif text-2xl lg:text-[28px] text-cream leading-tight group-hover:text-[hsl(var(--copper))] transition-colors before:absolute before:inset-0 before:content-['']"
                >
                  {c.title}
                </Link>
              </div>
              <p className="font-serif italic text-lg text-cream/65 leading-snug flex-1">
                {c.desc}
              </p>
              <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
                {c.badge && (
                  <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.22em] font-supporting font-semibold bg-[hsl(var(--charcoal))] text-cream/80 px-3 py-1.5 border border-[hsl(var(--copper))]/30">
                    <Lock className="w-2.5 h-2.5" aria-hidden="true" />
                    {c.badge}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--copper))] font-supporting font-semibold">
                  {c.cta}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </span>
                {c.subLinks && c.subLinks.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-2 relative z-10">
                    {c.subLinks.map((sl) => (
                      <Link
                        key={sl.href}
                        href={sl.href}
                        onClick={(e) => {
                          e.stopPropagation();
                          trackCtaClick(c.source, sl.label, sl.href);
                        }}
                        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-cream/55 hover:text-[hsl(var(--copper))] font-supporting font-medium transition-colors"
                        data-testid={`sublink-${c.testId}-${sl.href.split('/').pop()}`}
                      >
                        + {sl.label}
                        <ArrowRight className="w-2.5 h-2.5" aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// OPERATOR — Amendment 2 §E.6.
// CinematicV3 duotone treatment on Apollo's portrait. Bio language
// kept verbatim: Moises Duran disclosure (decades of construction
// attributed to the team, never to Pegasus the company). Pull-quote
// preserved.
// ─────────────────────────────────────────────────────────────────────
function OperatorSection() {
  return (
    <section className="py-24 lg:py-32 bg-[hsl(var(--charcoal))] text-cream border-t border-[hsl(var(--copper))]/20" data-testid="section-operator">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="max-w-4xl">
          <SectionOpener
            num="05"
            eyebrow="The Operator"
            title="Meet Apollo."
            deck="Read honestly. Scoped tightly. Delivered as promised."
          />
        </ScrollReveal>

        <div className="grid md:grid-cols-12 gap-10 lg:gap-16 items-start mt-8">
          <div className="md:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden border border-cream/10">
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
                  className="w-full h-full object-cover object-top"
                  style={{ filter: "grayscale(1) sepia(0.08)" }}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <div className="absolute inset-0 bg-[hsl(var(--navy))] mix-blend-multiply opacity-25 pointer-events-none" aria-hidden="true" />
              {/* Architect's offset frame */}
              <div className="absolute inset-0 border border-[hsl(var(--copper))]/40 translate-x-3 translate-y-3 pointer-events-none -z-10" aria-hidden="true" />
            </div>
          </div>

          <div className="md:col-span-7">
            <p className="font-serif italic text-xl text-cream/85 leading-relaxed mb-5">
              Paolo "Apollo" Duran founded Pegasus DreamScapes to do real estate the way it should be done: a long-arc operating company instead of a quarterly transaction shop. Every property is treated as a structural problem first and a profit number second.
            </p>
            <p className="text-base text-cream/65 leading-relaxed mb-8">
              The build discipline runs in the family. Apollo's father, Moises Duran, is a licensed General Contractor with decades of commercial and residential construction experience; that operator's lens sits inside every Pegasus project review. DRE-licensed through Keller Williams East Bay. Member NAR · CAR.
            </p>

            <blockquote className="border-l-2 border-[hsl(var(--copper))] pl-6 mb-8">
              <p className="font-serif text-xl sm:text-2xl text-cream italic leading-snug">
                &ldquo;Where others see impossible, we see a path. The deal is the architecture of the situation, not the situation itself.&rdquo;
              </p>
            </blockquote>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-cream/65 border-t border-cream/10 pt-6">
              <span className="text-[10px] uppercase tracking-[0.28em] font-supporting font-semibold text-[hsl(var(--copper))]">Paolo "Apollo" Duran</span>
              <span className="text-[10px] uppercase tracking-[0.24em] font-supporting text-cream/50">DRE #02333658</span>
              <span className="text-[10px] uppercase tracking-[0.24em] font-supporting text-cream/50">Keller Williams East Bay</span>
              <span className="text-[10px] uppercase tracking-[0.24em] font-supporting text-cream/50">NAR · CAR</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// THE DREAMSCAPER STANDARD — Website Structure v1 FINAL §3.8.
// Six commitments. Large copper Cinzel 01–06 per Doctrine v1.0.2 Part A.
// Required phrase: "The Dreamscaper Standard." preserved verbatim.
// ─────────────────────────────────────────────────────────────────────
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
    <section id="dreamscaper-standard" className="py-24 lg:py-32 bg-[hsl(var(--cream))] text-[hsl(var(--navy))] border-t border-[hsl(var(--copper))]/25 relative overflow-hidden" data-testid="section-dreamscaper-standard">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <ScrollReveal className="max-w-4xl">
          <SectionOpener
            num="06"
            eyebrow="Doctrine"
            title="The Dreamscaper Standard."
            deck="Six commitments. Every conversation. The non-negotiables behind every review, every offer, and every routed outcome."
            light
          />
        </ScrollReveal>

        <StaggerChildren className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8" staggerDelay={0.07}>
          {principles.map((p, index) => (
            <StaggerItem key={index}>
              <motion.div
                className="group h-full p-8 bg-white border-t-2 border-transparent hover:border-[hsl(var(--copper))] transition-all duration-300 relative overflow-hidden"
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25 }}
                data-testid={`pegasus-principle-${index}`}
              >
                <span
                  className="font-display block text-5xl sm:text-6xl text-[hsl(var(--copper))] leading-none tabular-nums mb-6 tracking-tight"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-serif text-xl text-[hsl(var(--navy))] mb-3 group-hover:text-[hsl(var(--copper))] transition-colors duration-300">
                  {p.title}
                </h3>
                <p className="font-serif italic text-base text-[hsl(var(--navy))]/70 leading-relaxed">{p.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// FINAL CTA — Amendment 2 §E.8.
// Three doors (Submit · Strategy Lab · Work With Apollo). The
// credential strip below carries the locked DRE / KW / NAR / CAR /
// East Bay business-location disclosure per launch gate §J.6.
// Required phrase: "Bring us the property. We'll help find the path."
// preserved verbatim.
// ─────────────────────────────────────────────────────────────────────
function FinalCTASection() {
  return (
    <section id="final-cta" className="py-24 lg:py-32 bg-[hsl(var(--navy))] relative overflow-hidden scroll-mt-24 border-t border-[hsl(var(--copper))]/25">
      <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
        <ScrollReveal>
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="font-display text-[hsl(var(--copper))] text-base tabular-nums tracking-tight" aria-hidden="true">07</span>
            <span className="h-px w-10 bg-[hsl(var(--copper))]/60" aria-hidden="true" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-cream/70 font-supporting font-semibold">
              Every property gets a path.
            </p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] leading-[1.05] mb-7 text-cream" data-testid="text-final-cta-headline">
            Bring us the property.<br />
            <span className="italic bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
              We'll help find the path.
            </span>
          </h2>
          <p className="font-serif italic text-lg sm:text-xl text-cream/65 leading-relaxed max-w-2xl mx-auto mb-12">
            Three ways to start. Submit a property, run the numbers yourself in Strategy Lab, or work with Apollo directly through KW East Bay.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mb-12">
            <Link href="/submit">
              <Button
                onClick={() => trackEvent("cta_click", { id: "final_primary", to: "/submit" })}
                size="lg"
                className="w-full sm:w-auto px-8 py-6 text-sm uppercase tracking-[0.18em] font-semibold bg-[hsl(var(--copper))] hover:bg-[hsl(27_56%_44%)] text-white border-0 rounded-none"
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
                className="w-full sm:w-auto px-8 py-6 text-sm uppercase tracking-[0.18em] font-semibold border-cream/25 text-cream hover:bg-cream/10 hover:border-cream/40 rounded-none"
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
                className="w-full sm:w-auto px-8 py-6 text-sm uppercase tracking-[0.18em] font-semibold border-cream/25 text-cream hover:bg-cream/10 hover:border-cream/40 rounded-none"
                data-testid="button-final-cta-work-with-apollo"
              >
                Work With Apollo
              </Button>
            </Link>
          </div>
          {/* Launch gate §J.6 — legal credential / disclosure strip */}
          <div className="border-t border-cream/10 pt-8 max-w-3xl mx-auto">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.28em] text-cream/55 font-supporting font-medium leading-relaxed">
              Paolo "Apollo" Duran
              <span className="mx-2 text-[hsl(var(--copper))]/60">/</span>
              DRE #02333658
              <span className="mx-2 text-[hsl(var(--copper))]/60">/</span>
              Keller Williams Realty East Bay
              <span className="mx-2 text-[hsl(var(--copper))]/60">/</span>
              NAR
              <span className="mx-2 text-[hsl(var(--copper))]/60">/</span>
              CAR
              <span className="mx-2 text-[hsl(var(--copper))]/60">/</span>
              East Bay, CA
            </p>
            <p className="text-[10px] uppercase tracking-[0.24em] text-cream/40 font-supporting mt-3">
              Each Keller Williams office is independently owned and operated.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
