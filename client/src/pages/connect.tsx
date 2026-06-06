import { Link } from "wouter";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/use-seo";
import { trackCtaClick } from "@/lib/analytics";
import {
  Building2,
  Hammer,
  DollarSign,
  Banknote,
  Network,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import logoImage from "@/assets/brand/pegasus-mark-full.svg";
import founderApolloPath from "@assets/image_1778735694150.png";

// Empire Doctrine v1.0.1 + Phase 2 polish — Apollo's personal QR landing.
// Goal for the demo: premium, interactive, on-brand. Founder photo in
// the hero, warm direct greeting from Apollo, soft Peggy presence (the
// chat itself stays internal per v1.0.1 doctrine — public Peggy is a
// v1.1 surface), preserved six routing buttons with full CTA
// attribution wiring, and a direct contact strip at the foot of the
// page. Single URL for both QR scans and direct nav.

const FOUNDER_BASE = "/images/founder/apollo";
const FOUNDER_SRCSET = (ext: "avif" | "webp" | "jpg") =>
  [320, 480, 640, 768]
    .map((w) => `${FOUNDER_BASE}-${w}.${ext} ${w}w`)
    .join(", ");
const FOUNDER_SIZES = "(max-width: 768px) 60vw, 360px";

const ROUTES = [
  {
    href: "/submit?intent=property",
    label: "I have a property situation",
    sub: "Bring us the address and the situation.",
    icon: Building2,
  },
  {
    href: "/development",
    label: "I want to build, renovate, or develop",
    sub: "Pegasus Development. Phased trajectory.",
    icon: Hammer,
  },
  {
    href: "/submit?intent=sell",
    label: "I want to sell a property",
    sub: "Strategy-first review across every lane.",
    icon: DollarSign,
  },
  {
    href: "/capital",
    label: "I am interested in capital partnerships",
    sub: "Private, individual conversations only.",
    icon: Banknote,
  },
  {
    href: "/vendor-network",
    label: "I am a vendor or operator",
    sub: "Join the Pegasus Vendor Network.",
    icon: Network,
  },
  {
    href: "/contact",
    label: "I just want to talk to Apollo",
    sub: "Direct line. apollo@pegasusdreamscapes.com.",
    icon: MessageSquare,
  },
];

function BrandStrip() {
  return (
    <div className="border-b border-border/40 bg-card/60 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-5 flex items-center gap-4">
        <img src={logoImage} alt="Pegasus DreamScapes" className="h-12 w-auto" />
        <div className="border-l border-border/50 pl-4">
          <p className="font-display text-sm tracking-[0.2em] text-foreground">Pegasus DreamScapes</p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mt-0.5">
            The Deal Architect
          </p>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground/80 font-supporting font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
          Live · East Bay
        </div>
      </div>
    </div>
  );
}

function GreetingHero() {
  return (
    <section className="relative bg-[hsl(var(--charcoal))] text-cream overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/3 w-[60rem] h-[40rem] bg-gradient-radial from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-5xl mx-auto px-6 lg:px-12 pt-16 lg:pt-20 pb-16 lg:pb-20">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Founder photo */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="relative max-w-[320px] mx-auto lg:mx-0">
              <div className="absolute -inset-3 bg-gradient-to-br from-primary/30 via-transparent to-primary/10 blur-2xl rounded-lg" aria-hidden="true" />
              <div className="relative">
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden ring-1 ring-primary/40">
                  <picture>
                    <source type="image/avif" srcSet={FOUNDER_SRCSET("avif")} sizes={FOUNDER_SIZES} />
                    <source type="image/webp" srcSet={FOUNDER_SRCSET("webp")} sizes={FOUNDER_SIZES} />
                    <img
                      src={`${FOUNDER_BASE}-480.jpg`}
                      srcSet={FOUNDER_SRCSET("jpg")}
                      sizes={FOUNDER_SIZES}
                      width={480}
                      height={600}
                      loading="eager"
                      decoding="async"
                      alt='Paolo "Apollo" Duran, Founder & Principal of Pegasus DreamScapes Corp.'
                      className="absolute inset-0 w-full h-full object-cover object-top"
                      data-testid="img-connect-founder"
                      onError={(e) => {
                        const t = e.currentTarget as HTMLImageElement;
                        if (t.src !== founderApolloPath) t.src = founderApolloPath;
                      }}
                    />
                  </picture>
                  <div className="absolute inset-0 ring-1 ring-cream/15 rounded-lg pointer-events-none" />
                </div>
                <div className="brand-stripe mt-3" />
              </div>
            </div>
          </motion.div>

          {/* Greeting */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-4">
              Paolo "Apollo" Duran · Founder & Principal
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-cream leading-[1.04] mb-6">
              Glad you're here.
            </h1>
            <p className="font-serif text-lg sm:text-xl text-cream/85 italic mb-6 leading-snug max-w-xl">
              Pick the route that fits. We'll get you to the right place.
            </p>
            <p className="text-base text-cream/75 leading-relaxed max-w-xl mb-8">
              Every door below opens to a real person on our team. No funnels, no
              gimmicks. A real read on whatever brought you here: property,
              build, capital, or just a conversation.
            </p>

            {/* Direct contact pills */}
            <div className="flex flex-wrap gap-3">
              <a
                href="tel:+19257448525"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-sm border border-cream/20 bg-cream/5 hover:bg-cream/10 hover:border-primary/60 transition-colors text-sm text-cream/95"
                data-testid="link-connect-phone"
                onClick={() => trackCtaClick("connect", "Phone tap", "tel:+19257448525")}
              >
                <Phone className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span className="font-medium">925-744-8525</span>
              </a>
              <a
                href="mailto:apollo@pegasusdreamscapes.com"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-sm border border-cream/20 bg-cream/5 hover:bg-cream/10 hover:border-primary/60 transition-colors text-sm text-cream/95"
                data-testid="link-connect-email"
                onClick={() => trackCtaClick("connect", "Email tap", "mailto:apollo@pegasusdreamscapes.com")}
              >
                <Mail className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span className="font-medium">apollo@pegasusdreamscapes.com</span>
              </a>
              <span className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-sm border border-cream/15 text-sm text-cream/70">
                <MapPin className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span>East Bay, CA</span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
    </section>
  );
}

function RouteGrid() {
  return (
    <section className="bg-background">
      <div className="max-w-5xl mx-auto px-6 lg:px-12 pt-16 lg:pt-20 pb-8">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-4">
            What brought you here?
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-foreground leading-tight">
            Pick a door. We'll meet you there.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-3">
          {ROUTES.map((r, idx) => {
            const Icon = r.icon;
            const slug = r.label.toLowerCase().split(" ").slice(0, 4).join("-");
            return (
              <motion.div
                key={r.href}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.06 * idx }}
              >
                <Link
                  href={r.href}
                  onClick={() => trackCtaClick("connect", r.label, r.href)}
                  className="
                    group relative block min-h-[88px] rounded-md border border-border bg-card
                    px-5 sm:px-6 py-5
                    transition-all duration-200
                    hover:border-primary hover:bg-primary/[0.04] hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5
                    active:scale-[0.99] active:bg-primary/[0.08] active:border-primary active:translate-y-0
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                  "
                  data-testid={`link-connect-${slug}`}
                >
                  <div className="flex items-start gap-4">
                    <span className="shrink-0 w-11 h-11 rounded-sm bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors leading-tight">
                        {r.label}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1.5 leading-snug">
                        {r.sub}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all mt-1.5 flex-shrink-0" aria-hidden="true" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PeggyPresenceCard() {
  // Empire Doctrine v1.0.1 lock: public Peggy chat is explicitly
  // excluded from /connect. This card surfaces Peggy as a brand signal
  // (she exists, she's in private beta with the Pegasus team) without
  // mounting the chat itself. Lifts the lid on v1.1 without
  // overclaiming today's surface.
  return (
    <section className="bg-background pb-16 lg:pb-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative rounded-md border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 overflow-hidden"
          data-testid="card-peggy-presence"
        >
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl" aria-hidden="true" />
          <div className="relative flex items-start gap-5">
            <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center ring-2 ring-primary/30">
              <Sparkles className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                <p className="font-serif text-xl text-foreground font-semibold">Meet Peggy.</p>
                <span className="text-[10px] uppercase tracking-[0.22em] text-primary font-supporting font-semibold px-2 py-0.5 rounded-sm bg-primary/10">
                  Private beta
                </span>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Peggy is the Pegasus AI assistant, in private beta with our internal team. Once she's trained on the Pegasus voice and the doctrine she'll greet you here directly. Until then, every door above lands you with a real person.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footnote() {
  return (
    <section className="bg-background pb-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <div className="border-t border-border/60 pt-8 text-center">
          <p className="text-xs text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Apollo Duran · DRE #02333658 · Keller Williams East Bay. Each office is independently owned and operated. Nothing on this page is an offer of securities or a solicitation to invest.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function ConnectPage() {
  useSEO({
    title: "Connect with Apollo",
    description:
      "Connect directly with Apollo Duran, Founder of Pegasus DreamScapes. Property situation, build or develop, capital partnership, vendor inquiry, or just a conversation. Pick your lane.",
    image: "/og/about.png",
  });

  return (
    <div className="min-h-screen bg-background">
      <BrandStrip />
      <GreetingHero />
      <RouteGrid />
      <PeggyPresenceCard />
      <Footnote />
    </div>
  );
}
