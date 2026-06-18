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

// Website Spec v4 — one front door, company-voiced. Submit → free Property
// Read is the primary action. No founder portrait and no "talk to Apollo"
// framing here: the page speaks for the firm, and the six lanes route every
// kind of visitor to the right next step. Single URL for QR scans and direct
// navigation; CTA attribution preserved.

const ROUTES = [
  {
    href: "/submit?intent=property",
    label: "I have a property situation",
    sub: "Bring the address and what's going on.",
    icon: Building2,
  },
  {
    href: "/development",
    label: "I want to build, renovate, or develop",
    sub: "Pegasus Development. Phased scope.",
    icon: Hammer,
  },
  {
    href: "/submit?intent=sell",
    label: "I want to sell a property",
    sub: "A strategy-first review across every lane.",
    icon: DollarSign,
  },
  {
    href: "/capital",
    label: "I am exploring capital partnership",
    sub: "Specific projects, private conversations.",
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
    label: "I have a question",
    sub: "Send a note and we'll get back to you.",
    icon: MessageSquare,
  },
];

function GreetingHero() {
  return (
    <section className="relative bg-[hsl(var(--charcoal))] text-cream overflow-hidden">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 left-1/3 w-[60rem] h-[40rem] bg-gradient-radial from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-5xl mx-auto px-6 lg:px-12 pt-28 lg:pt-36 pb-16 lg:pb-20">
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <p className="text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold mb-4">
            One front door · East Bay
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] text-cream leading-[1.04] mb-6">
            Tell us what you're working with.
          </h1>
          <p className="font-serif text-lg sm:text-xl text-cream/85 italic mb-6 leading-snug max-w-xl">
            Pick the lane that fits. We'll point you to the right next step.
          </p>
          <p className="text-base text-cream/75 leading-relaxed max-w-xl mb-8">
            We read the situation, underwrite the numbers, and tell you what the
            deal actually is — property, build, capital, or a straight question.
            Submit a property and we aim to return a first read within 48 hours.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/submit?intent=property"
              onClick={() => trackCtaClick("connect", "Submit a property", "/submit?intent=property")}
              className="
                group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-sm
                bg-primary text-primary-foreground font-medium text-sm
                hover:bg-primary/90 transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--charcoal))]
              "
              data-testid="link-submit-property"
            >
              Submit a property
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
            <a
              href="tel:+19257448525"
              className="inline-flex items-center gap-2.5 px-4 py-3 rounded-sm border border-cream/20 bg-cream/5 hover:bg-cream/10 hover:border-primary/60 transition-colors text-sm text-cream/95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--charcoal))]"
              data-testid="link-connect-phone"
              onClick={() => trackCtaClick("connect", "Phone tap", "tel:+19257448525")}
            >
              <Phone className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span className="font-medium">925-744-8525</span>
            </a>
            <a
              href="mailto:apollo@pegasusdreamscapes.com"
              className="inline-flex items-center gap-2.5 px-4 py-3 rounded-sm border border-cream/20 bg-cream/5 hover:bg-cream/10 hover:border-primary/60 transition-colors text-sm text-cream/95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--charcoal))]"
              data-testid="link-connect-email"
              onClick={() => trackCtaClick("connect", "Email tap", "mailto:apollo@pegasusdreamscapes.com")}
            >
              <Mail className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span className="font-medium">apollo@pegasusdreamscapes.com</span>
            </a>
            <span className="inline-flex items-center gap-2.5 px-4 py-3 rounded-sm border border-cream/15 text-sm text-cream/70">
              <MapPin className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span>East Bay, CA</span>
            </span>
          </div>
        </motion.div>
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
            Pick a lane. We'll meet you there.
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
                  Early access · in training
                </span>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Peggy is our intake concierge. Tell her your situation in the chat
                and she'll route it to the right lane. Peggy is an intake
                assistant; she makes no offers and gives no legal, tax, lending,
                or investment advice.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function ConnectPage() {
  useSEO({
    title: "Connect",
    description:
      "Tell us what you're working with — property, build, capital, or a question. Pick the lane and we'll point you to the right next step.",
    image: "/og/about.png",
  });

  return (
    <div className="min-h-screen bg-background">
      <GreetingHero />
      <RouteGrid />
      <PeggyPresenceCard />
    </div>
  );
}
