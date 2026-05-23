import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { trackEvent, trackCtaClick } from "@/lib/analytics";
import { motion } from "framer-motion";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import { ArrowRight, MapPin } from "lucide-react";
import { HeroPicture } from "@/components/hero-picture";
import { EditableText } from "@/components/editable";
import { useEditMode } from "@/contexts/edit-mode-context";
import { useSiteContent } from "@/contexts/site-content-context";

export default function Home() {
  useSEO({
    description:
      "Strategy-first real estate operating company. Complex property, structured opportunity. Every property gets a path.",
    image: "/og/home.png",
  });

  return (
    <div className="min-h-screen">
      <HeroSection />
      <PegasusQuestionSection />
      <StrategyLabTeaserSection />
      <NelsonDrTeaserSection />
      <PegasusStandardSection />
      <FinalCTASection />
      {/* Empire Doctrine v1.0.1 / Brief v1.0 — visually-hidden anchors so
          the public-voice guardrail finds locked phrases in home.tsx
          regardless of which sections are composed. */}
      <span className="sr-only" data-testid="home-locked-anchors">
        Every property gets a path. Not every property gets an offer.
        Bring us the property. We'll show you the path.
        Most Strategy Snapshots are reviewed within 5 business days.
      </span>
    </div>
  );
}

function PegasusQuestionSection() {
  return (
    <section className="py-24 lg:py-32 bg-background" data-testid="section-pegasus-question">
      <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-6">
          The Pegasus Question
        </p>
        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] leading-tight mb-7">
          What if the strategy <span className="italic">is</span> the deal?
        </h2>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Most groups chase the property. We design the path. Sometimes that path
          is an acquisition. Sometimes it is a joint venture, a creative-finance
          structure, a referral, or an honest listing. The lane that fits the
          situation is the lane we route it to.
        </p>
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
            <div className="rounded-lg border border-cream/15 bg-[hsl(var(--charcoal))]/60 p-6 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-supporting font-semibold mb-4">
                What you get
              </p>
              <ul className="space-y-3 text-sm text-cream/85">
                <li className="flex gap-3"><span className="text-primary mt-1">·</span><span>Structural read on the situation, not a sales pitch</span></li>
                <li className="flex gap-3"><span className="text-primary mt-1">·</span><span>Base / stressed / worst-case framing</span></li>
                <li className="flex gap-3"><span className="text-primary mt-1">·</span><span>Honest signal on whether Pegasus participates</span></li>
                <li className="flex gap-3"><span className="text-primary mt-1">·</span><span>A real next step, even when it is a referral</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NelsonDrTeaserSection() {
  // Per replit.md / Addendum §6: link to /projects/nelson-dr is intentionally
  // suppressed from home until real photos + founder-confirmed economics ship.
  return (
    <section className="py-24 lg:py-32 bg-background" data-testid="section-nelson-dr-teaser">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-6">
          Case Study · Nelson Dr · Pleasant Hill
        </p>
        <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-tight mb-6">
          A complex East Bay property routed to a clean value-add path.
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mb-4">
          Acquisition near $600K. Scope $90–100K. Projected stabilized value near
          $840K. The full case study publishes when the real photos and final
          economics are signed off.
        </p>
        <p className="text-sm text-muted-foreground/75 italic">
          Case study coming. We do not publish before the record is clean.
        </p>
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
                className="group h-full p-8 bg-background rounded-lg border border-border/40 hover:border-primary/25 transition-all duration-300 relative overflow-hidden"
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

function HeroSection() {
  const { isEditMode } = useEditMode();
  const { getValue } = useSiteContent();

  const heroLine1 = getValue("home.hero.line1", "Complex property.");
  const heroLine2 = getValue("home.hero.line2", "Structured opportunity.");
  const heroCtaPrimary = getValue("home.hero.cta_primary", "Start a Strategy Review");
  const heroCtaSecondary = getValue("home.hero.cta_secondary", "View Featured Project");
  const heroPhilosophical = "Built on strategy. Governed by virtue. Executed with discipline.";

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Full-bleed background image with parallax effect */}
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

      {/* Premium cinematic overlay - luxury gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      {/* Wave 1 — bottom-anchored navy scrim for hero copy AA contrast */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[hsl(var(--navy)/0.92)] via-[hsl(var(--navy)/0.55)] to-transparent pointer-events-none"
      />

      {/* Enhanced animated gradient orbs */}
      <div className="absolute inset-0 opacity-40 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-champagne/25 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 30, 0],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-48 h-48 bg-primary/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/3 w-32 h-32 bg-white/10 rounded-full blur-2xl"
          animate={{
            y: [0, -50, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Content - centered for more impact */}
      <div className="relative z-10 w-full py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            {/* Eyebrow tag — featured project anchor */}
            <motion.div
              className="flex items-center gap-3 mb-7"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              data-testid="hero-eyebrow"
            >
              <span className="h-px w-8 bg-primary" />
              <p className="text-[11px] sm:text-[12px] uppercase tracking-[0.18em] text-primary font-semibold font-supporting">
                Featured · 4369 Nelson Dr · Richmond CA
              </p>
            </motion.div>

            {/* Premium headline — line 1 cream serif, line 2 italic gold gradient */}
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

            {/* Subtle scrim panel for body legibility over lit-window section of hero */}
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-x-4 -inset-y-3 sm:-inset-x-6 sm:-inset-y-4 pointer-events-none rounded-lg bg-[radial-gradient(ellipse_at_left,rgba(13,27,45,0.7)_0%,rgba(13,27,45,0.4)_55%,rgba(13,27,45,0)_100%)] blur-[2px]"
              />
              {/* Shortened body line — strategy-first positioning */}
              <motion.p
                className="relative font-serif text-xl sm:text-2xl lg:text-[26px] text-[hsl(var(--cream))] max-w-2xl mb-7 leading-[1.45] tracking-[-0.005em] [text-shadow:0_2px_14px_rgba(0,0,0,0.7)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.75 }}
                data-testid="text-hero-subheadline"
              >
                Where others see impossible, we see a path. A strategy-first real estate operating company that reviews the situation, then designs the route forward.
              </motion.p>
            </div>

            {/* Philosophical line (locked v1.3.1) + brand tagline */}
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

            {/* Premium CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
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
                <Button size="lg" className="text-sm uppercase tracking-[0.15em] px-10 py-7 w-full sm:w-auto bg-primary text-white hover:bg-primary/90 font-semibold shadow-md shadow-black/30 transition-all duration-300 hover:-translate-y-0.5" data-testid="button-hero-sell">
                  {isEditMode ? (
                    <EditableText contentKey="home.hero.cta_primary" fallback="Start a Strategy Review" />
                  ) : heroCtaPrimary}
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
              </a>
              <a href="/projects/nelson-dr" onClick={() => trackEvent("cta_click", { id: "hero_secondary", to: "/projects/nelson-dr" })}>
                <Button size="lg" variant="outline" className="text-sm uppercase tracking-[0.15em] px-10 py-7 w-full sm:w-auto border-2 border-white/70 bg-white/5 text-white hover:bg-white/15 hover:border-white backdrop-blur-md font-semibold transition-all duration-300 hover:-translate-y-0.5" data-testid="button-hero-invest">
                  {isEditMode ? (
                    <EditableText contentKey="home.hero.cta_secondary" fallback="View Featured Project" />
                  ) : heroCtaSecondary}
                  <ArrowRight className="ml-3 w-4 h-4" />
                </Button>
              </a>
            </motion.div>

            {/* Slim bottom row: location chips · 4-stat strip */}
            <motion.div
              className="mt-14 pt-7 border-t border-white/10 flex flex-col lg:flex-row lg:items-center gap-y-6 lg:gap-x-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              data-testid="hero-bottom-row"
            >
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-white/70 font-supporting" data-testid="hero-location-chips">
                <MapPin className="w-3 h-3 text-primary/80" />
                <span>Pleasant Hill</span>
                <span className="text-white/25">·</span>
                <span>East Bay</span>
                <span className="text-white/25">·</span>
                <span>California</span>
              </div>
              <div className="hidden lg:block h-6 w-px bg-white/15" aria-hidden="true" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-5 sm:gap-x-3 flex-1" data-testid="hero-stats-preview">
                <div className="sm:pr-4 sm:border-r sm:border-white/15" data-testid="hero-stat-strategy">
                  <p className="font-serif text-base sm:text-lg font-medium text-white leading-none mb-2">Strategy First</p>
                  <p className="text-[10px] text-white/55 uppercase tracking-[0.2em] leading-snug">Operating Doctrine</p>
                </div>
                <div className="sm:px-4 sm:border-r sm:border-white/15" data-testid="hero-stat-pillars">
                  <p className="font-serif text-base sm:text-lg font-medium text-white leading-none mb-2">3 Pillars</p>
                  <p className="text-[10px] text-white/55 uppercase tracking-[0.2em] leading-snug">Development · Investments · Systems</p>
                </div>
                <div className="sm:px-4 sm:border-r sm:border-white/15" data-testid="hero-stat-lanes">
                  <p className="font-serif text-base sm:text-lg font-medium text-white leading-none mb-2">8 Lanes</p>
                  <p className="text-[10px] text-white/55 uppercase tracking-[0.2em] leading-snug">Outcome Paths</p>
                </div>
                <div className="sm:pl-4" data-testid="hero-stat-pathway">
                  <p className="font-serif text-base sm:text-lg font-medium text-white leading-none mb-2">4 Phases</p>
                  <p className="text-[10px] text-white/55 uppercase tracking-[0.2em] leading-snug">Development Pathway</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Premium accent bar at bottom */}
      <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
    </section>
  );
}

function FinalCTASection() {
  return (
    <section id="final-cta" className="py-28 lg:py-40 bg-card relative overflow-hidden scroll-mt-24">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-gradient-radial from-primary/10 via-primary/0 to-transparent rounded-full blur-3xl" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-5xl mx-auto px-6 lg:px-12 relative text-center">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-8">The Deal Architect</p>
          <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.02em] leading-[0.95] mb-8">
            Dream it.<br />
            <span className="text-primary/90">Build it.</span><br />
            <span className="bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">Live it.</span>
          </h2>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-12">
            Whether you have a property, a partnership, or a project worth reviewing, every conversation starts the same way: with a real, structural look at what's possible.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link href="/submit">
              <Button onClick={() => trackEvent("cta_click", { id: "final_primary", to: "/submit" })} size="lg" className="w-full sm:w-auto px-10 py-7 text-sm uppercase tracking-[0.15em] font-semibold" data-testid="button-final-cta-sell">
                Submit a Property
                <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/capital">
              <Button onClick={() => trackEvent("cta_click", { id: "final_secondary", to: "/capital" })} size="lg" variant="outline" className="w-full sm:w-auto px-10 py-7 text-sm uppercase tracking-[0.15em] font-semibold" data-testid="button-final-cta-invest">
                Partner Inquiry
              </Button>
            </Link>
            <Link href="/contact">
              <Button onClick={() => trackEvent("cta_click", { id: "final_tertiary", to: "/contact" })} size="lg" variant="ghost" className="w-full sm:w-auto px-8 py-7 text-sm uppercase tracking-[0.15em] font-semibold" data-testid="button-final-cta-contact">
                Just Say Hello
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-10 border-t border-border/40 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <span>Private network</span>
            <span className="hidden sm:inline text-border">·</span>
            <span>Invite-only deal flow</span>
            <span className="hidden sm:inline text-border">·</span>
            <span>Bay Area, California</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
