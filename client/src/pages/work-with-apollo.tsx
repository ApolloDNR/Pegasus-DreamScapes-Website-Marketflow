import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal } from "@/components/animations";
import {
  ArrowRight,
  Home as HomeIcon,
  Key,
  Briefcase,
  ClipboardCheck,
  Shield,
  Compass,
  CheckCircle2,
  XCircle,
  Send,
  Search,
  FileText,
  Handshake,
} from "lucide-react";

// Website Structure v1 FINAL §4 — Work With Apollo is the licensed-
// representation surface. Methodical rebuild (visual-richness pass 3):
// - Hero now leads with Apollo's portrait and credentials, not a
//   floating sentence on a navy gradient.
// - "Meet Apollo" bio section anchored to the page (was only on home).
// - "How it works" 4-step process band makes the engagement legible.
// - Four lanes enhanced with structured "what you get" deliverables.
// - "What working with Apollo looks like" contrast panel reframes the
//   doctrine against the typical-agent default.
// - Locked DRE/KW disclosure preserved verbatim (asserted by
//   public-voice.test.tsx).

const LANES = [
  {
    icon: HomeIcon,
    title: "List With Apollo",
    kind: "Seller representation",
    desc: "Full-service representation through Keller Williams East Bay. Pricing, prep, marketing, negotiation, and close, driven by the same strategy-first lens applied to every Pegasus property.",
    deliverables: ["Pre-listing strategy read", "Pricing + prep plan", "Marketing + showings", "Negotiation + close"],
    cta: "Start a Listing Conversation",
    href: "/submit?intent=sell",
    testId: "wwa-card-list",
  },
  {
    icon: ClipboardCheck,
    title: "Home Value / Listing Strategy Review",
    kind: "Seller representation",
    desc: "A pre-listing strategy session: pricing read, prep priorities, comp picture, and the right path forward. Honest read, no pressure, no obligation to list.",
    deliverables: ["Pricing range read", "Prep priority list", "Comp picture", "Recommended path forward"],
    cta: "Request a Strategy Review",
    href: "/submit?intent=sell",
    testId: "wwa-card-listing-strategy",
  },
  {
    icon: Key,
    title: "Buy With Apollo",
    kind: "Buyer representation",
    desc: "Buyer representation for owner-occupants. Search, tour, write, negotiate, and close with an agent who underwrites every property structurally before submitting an offer.",
    deliverables: ["Search + tour plan", "Structural read per home", "Offer + negotiation", "Inspection + close"],
    cta: "Start a Buyer Conversation",
    href: "/submit?intent=explore",
    testId: "wwa-card-buy",
  },
  {
    icon: Briefcase,
    title: "Investor Buyer Representation",
    kind: "Buyer representation",
    desc: "Operator and investor-side buyer rep for value-add, BRRRR, ADU upside, and small-multifamily acquisitions. Every offer is run through the Pegasus underwriting lens first.",
    deliverables: ["Buybox-aligned sourcing", "Pegasus underwriting lens", "Comp + scope review", "Offer + close coordination"],
    cta: "Request Investor Rep",
    href: "/submit?intent=explore",
    testId: "wwa-card-buyer-rep",
  },
];

// Quick-routing selector shown above the lanes. Each option deep-links to
// the canonical /submit intake with a valid ?intent= prefill.
const SELECTOR = [
  { label: "I want to sell", href: "/submit?intent=sell", testId: "wwa-selector-sell" },
  { label: "I want to buy", href: "/submit?intent=explore", testId: "wwa-selector-buy" },
  { label: "I have a complex situation", href: "/submit?intent=property", testId: "wwa-selector-situation" },
  { label: "I have a deal to submit", href: "/submit?intent=deal-jv", testId: "wwa-selector-deal" },
];

// Website Structure v1 FINAL §4 — locked DRE/KW disclosure, verbatim.
// Asserted by public-voice.test.tsx. Do not edit copy without a doctrine
// amendment.
const DRE_KW_DISCLOSURE =
  "Licensed real estate services are provided by Paolo \"Apollo\" Duran through Keller Williams Realty East Bay. Pegasus DreamScapes is a separate development, investment, and property strategy company.";

const PROCESS_STEPS = [
  { icon: Send, label: "Submit", desc: "Tell Apollo the property, the timeline, and what you're solving for." },
  { icon: Search, label: "Structural read", desc: "Comps, condition, capital picture, and the Pegasus strategy lens." },
  { icon: FileText, label: "The plan", desc: "A written read on pricing, prep, and the right representation lane." },
  { icon: Handshake, label: "Represent", desc: "List, buy, or advise. Same agent, same standard, end to end." },
];

const CONTRAST = [
  {
    title: "The typical agent default",
    items: [
      "List it, push the price, hope for offers.",
      "One playbook for every property.",
      "Conversation starts at the listing agreement.",
      "Strategy means a CMA print-out.",
    ],
    tone: "muted",
  },
  {
    title: "Working with Apollo",
    items: [
      "Read the property first. Recommend the right path, even if it isn't a listing.",
      "Four lanes; the situation picks the lane.",
      "Conversation starts at the structural review.",
      "Strategy means underwriting, comps, prep priorities, and a written plan.",
    ],
    tone: "primary",
  },
];

export default function WorkWithApollo() {
  useSEO({
    title: "Work With Apollo",
    description:
      "Licensed real estate representation with Paolo \"Apollo\" Duran through Keller Williams East Bay. List, buy, investor buyer rep, and listing strategy reviews. Every property reviewed structurally first.",
    image: "/og/default.png",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* HERO — split: copy left, founder portrait right */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 bg-navy text-cream overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute top-1/4 left-1/4 w-[34rem] h-[34rem] bg-primary/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-[hsl(var(--copper)/0.15)] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <ScrollReveal className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className="h-px w-10 bg-primary" />
                <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
                  Licensed Representation · DRE #02333658
                </p>
              </div>
              <h1
                className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.02em] leading-[0.98] mb-8"
                data-testid="text-wwa-headline"
              >
                Real estate representation{" "}
                <span className="italic bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
                  with Apollo.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-cream/85 leading-relaxed max-w-2xl mb-4">
                When the right path is a clean listing, a represented purchase, or a strategy review before going to market, Apollo handles it personally as a licensed agent through Keller Williams Realty East Bay.
              </p>
              <p className="text-base text-cream/70 leading-relaxed max-w-2xl mb-8">
                The Pegasus structural lens stays on. Every property is read first, then matched to the right representation lane.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/submit?intent=sell">
                  <Button
                    size="lg"
                    className="px-8 py-6 text-sm uppercase tracking-[0.15em] font-semibold bg-[hsl(var(--copper))] hover:bg-[hsl(27_56%_44%)] text-white"
                    data-testid="button-wwa-hero-primary"
                  >
                    Start a Conversation <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
                  </Button>
                </Link>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-sm uppercase tracking-[0.15em] font-semibold border-cream/30 text-cream hover:bg-cream/10 hover:text-cream"
                  data-testid="button-wwa-hero-secondary"
                >
                  <a href="#meet-apollo">Meet Apollo</a>
                </Button>
              </div>
            </ScrollReveal>

            <ScrollReveal className="lg:col-span-5">
              <div className="relative max-w-md mx-auto lg:mx-0 lg:ml-auto">
                {/* Copper frame accent */}
                <div className="absolute -top-3 -left-3 right-6 bottom-6 border border-[hsl(var(--copper)/0.5)] rounded-lg pointer-events-none" aria-hidden="true" />
                <picture>
                  <source
                    type="image/avif"
                    srcSet="/images/founder/apollo-480.avif 480w, /images/founder/apollo-768.avif 768w"
                    sizes="(max-width: 1024px) 90vw, 420px"
                  />
                  <source
                    type="image/webp"
                    srcSet="/images/founder/apollo-480.webp 480w, /images/founder/apollo-768.webp 768w"
                    sizes="(max-width: 1024px) 90vw, 420px"
                  />
                  <img
                    src="/images/founder/apollo-768.jpg"
                    srcSet="/images/founder/apollo-480.jpg 480w, /images/founder/apollo-768.jpg 768w"
                    sizes="(max-width: 1024px) 90vw, 420px"
                    alt="Paolo &quot;Apollo&quot; Duran, licensed agent through Keller Williams East Bay"
                    width={768}
                    height={960}
                    className="relative w-full aspect-[4/5] object-cover object-top rounded-lg border border-cream/20 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)]"
                    decoding="async"
                  />
                </picture>
                <div className="absolute -bottom-4 left-4 right-12 bg-[hsl(var(--charcoal))] border border-cream/15 rounded-md px-4 py-3 backdrop-blur-sm">
                  <p className="font-serif text-base font-semibold text-cream leading-tight">
                    Paolo "Apollo" Duran
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--copper))] font-supporting font-semibold mt-1">
                    Founder · Licensed Agent
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
        <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
      </section>

      {/* QUICK SELECTOR — route to the right intake intent */}
      <section
        className="py-10 lg:py-12 bg-card border-b border-border/40"
        data-testid="section-wwa-selector"
      >
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <p className="text-[11px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold mb-4 text-center">
            What brings you here?
          </p>
          <div className="flex flex-wrap justify-center gap-3" data-testid="wwa-selector">
            {SELECTOR.map((s) => (
              <Link key={s.testId} href={s.href}>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-6 py-5 text-sm font-medium border-border/70 hover:border-[hsl(var(--copper)/0.5)] hover:text-[hsl(var(--copper))]"
                  data-testid={s.testId}
                >
                  {s.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MEET APOLLO — anchored bio with quote and credentials */}
      <section
        id="meet-apollo"
        className="scroll-mt-24 py-24 lg:py-32 bg-[hsl(var(--charcoal))] text-cream"
        data-testid="section-wwa-meet-apollo"
      >
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div>
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="font-display text-[36px] leading-none text-[hsl(var(--copper))] tabular-nums tracking-tight">01</span>
                <span className="h-px w-10 bg-[hsl(var(--copper))]" />
                <p className="text-[11px] uppercase tracking-[0.32em] text-[hsl(var(--copper))] font-supporting font-semibold">
                  The Operator
                </p>
              </div>
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

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: "DRE License", value: "#02333658" },
                  { label: "Brokerage", value: "Keller Williams East Bay" },
                  { label: "Memberships", value: "NAR · CAR · CCAR" },
                  { label: "NRDS", value: "#159537628" },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="flex items-start gap-3 p-3 rounded-md border border-cream/10 bg-cream/[0.03]"
                  >
                    <Shield className="w-4 h-4 text-[hsl(var(--copper))] mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-cream/55 font-supporting font-semibold mb-0.5">
                        {c.label}
                      </p>
                      <p className="font-serif text-sm font-semibold text-cream leading-tight">
                        {c.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — 4-step process band */}
      <section
        className="relative py-24 lg:py-32 bg-background border-t border-border/30 overflow-hidden"
        data-testid="section-wwa-process"
      >
        <div className="pointer-events-none absolute -top-32 -right-32 w-[36rem] h-[36rem] rounded-full bg-primary/[0.06] blur-3xl" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <ScrollReveal className="max-w-3xl mb-14">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-display text-[36px] leading-none text-[hsl(var(--copper))] tabular-nums tracking-tight">02</span>
              <span className="h-px w-10 bg-[hsl(var(--copper))]" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
                How working with Apollo works
              </p>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-tight mb-5">
              Four steps, from first read to close.
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              No urgency tactics, no pushed offers. The path is the path.
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="wwa-process-steps">
            {PROCESS_STEPS.map((s, i) => (
              <div
                key={s.label}
                className="relative p-6 rounded-lg border border-border/50 bg-card hover:border-[hsl(var(--copper)/0.4)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <s.icon className="w-4 h-4 text-primary" aria-hidden="true" />
                  </div>
                  <span className="font-display text-3xl text-[hsl(var(--copper)/0.4)] tabular-nums tracking-tight" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="font-serif text-lg font-semibold tracking-tight mb-1.5 leading-tight">
                  {s.label}
                </p>
                <p className="text-sm text-muted-foreground leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUR LANES — enhanced with deliverables list */}
      <section
        className="relative py-24 lg:py-32 bg-muted/15 border-t border-border/30 overflow-hidden"
        data-testid="section-wwa-lanes"
      >
        <div className="pointer-events-none absolute -top-32 -left-32 w-[36rem] h-[36rem] rounded-full bg-[hsl(var(--copper)/0.06)] blur-3xl" aria-hidden="true" />

        <div className="relative max-w-6xl mx-auto px-6 lg:px-12">
          <ScrollReveal className="max-w-3xl mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-display text-[36px] leading-none text-[hsl(var(--copper))] tabular-nums tracking-tight">03</span>
              <span className="h-px w-10 bg-[hsl(var(--copper))]" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
                Four lanes
              </p>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-5 leading-tight">
              Pick the lane that fits the moment.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              All four start the same way: a real conversation, a structural read, and the right path forward.
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 gap-6">
            {LANES.map((lane) => (
              <div
                key={lane.testId}
                className="group flex flex-col p-7 rounded-lg border border-border/60 bg-card hover:border-[hsl(var(--copper)/0.45)] hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-18px_rgba(13,27,45,0.3)] transition-all duration-200"
                data-testid={lane.testId}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-[hsl(var(--copper)/0.15)] group-hover:border-[hsl(var(--copper)/0.35)] transition-colors">
                    <lane.icon className="w-5 h-5 text-primary group-hover:text-[hsl(var(--copper))] transition-colors" aria-hidden="true" />
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-[0.18em] font-supporting font-semibold px-2.5 py-1 rounded-full border ${
                      lane.kind === "Buyer representation"
                        ? "text-navy border-navy/25 bg-navy/5"
                        : "text-[hsl(var(--copper))] border-[hsl(var(--copper)/0.3)] bg-[hsl(var(--copper)/0.06)]"
                    }`}
                    data-testid={`badge-${lane.testId}-kind`}
                  >
                    {lane.kind}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-semibold tracking-tight mb-3 leading-tight">
                  {lane.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  {lane.desc}
                </p>

                {/* Deliverables */}
                <div className="mb-6 pt-5 border-t border-border/50">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-supporting font-semibold mb-3">
                    What you get
                  </p>
                  <ul className="space-y-2">
                    {lane.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--copper))] mt-1 flex-shrink-0" aria-hidden="true" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto">
                  <Link href={lane.href}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[11px] uppercase tracking-[0.18em] font-supporting font-semibold"
                      data-testid={`button-${lane.testId}-cta`}
                    >
                      {lane.cta}
                      <ArrowRight className="ml-2 w-3.5 h-3.5" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* CREDENTIALS + EQUAL HOUSING — visible near the representation lanes */}
          <div
            className="mt-10 p-6 rounded-lg border border-border/60 bg-card"
            data-testid="wwa-lanes-credentials"
          >
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span className="inline-flex items-center gap-2 text-foreground/80">
                <Shield className="w-4 h-4 text-[hsl(var(--copper))]" aria-hidden="true" />
                Licensed representation
              </span>
              <span className="hidden sm:inline text-border">·</span>
              <span>Paolo "Apollo" Duran · DRE #02333658</span>
              <span className="hidden sm:inline text-border">·</span>
              <span>Keller Williams Realty East Bay</span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Equal Housing Opportunity. All representation services are offered without regard to
              race, color, religion, sex, disability, familial status, or national origin. Each
              Keller Williams office is independently owned and operated.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT IT LOOKS LIKE — contrast panel */}
      <section
        className="relative py-24 lg:py-32 bg-background border-t border-border/30"
        data-testid="section-wwa-contrast"
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <ScrollReveal className="max-w-3xl mb-14">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-display text-[36px] leading-none text-[hsl(var(--copper))] tabular-nums tracking-tight">04</span>
              <span className="h-px w-10 bg-[hsl(var(--copper))]" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
                What it looks like
              </p>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-5 leading-tight">
              The Pegasus lens, in plain language.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Two columns. The first is the industry default. The second is what working with Apollo actually looks like.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-5">
            {CONTRAST.map((col) => {
              const isPrimary = col.tone === "primary";
              return (
                <div
                  key={col.title}
                  className={`p-7 rounded-lg border ${
                    isPrimary
                      ? "border-[hsl(var(--copper)/0.4)] bg-card shadow-[0_14px_36px_-18px_rgba(13,27,45,0.3)]"
                      : "border-border/50 bg-muted/15"
                  }`}
                  data-testid={`wwa-contrast-${isPrimary ? "primary" : "default"}`}
                >
                  <div className="flex items-center gap-3 mb-5">
                    {isPrimary ? (
                      <Compass className="w-5 h-5 text-[hsl(var(--copper))]" aria-hidden="true" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                    )}
                    <p className={`font-serif text-lg font-semibold tracking-tight ${isPrimary ? "text-[hsl(var(--copper))]" : "text-muted-foreground"}`}>
                      {col.title}
                    </p>
                  </div>
                  <ul className="space-y-3">
                    {col.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed">
                        {isPrimary ? (
                          <CheckCircle2 className="w-4 h-4 text-[hsl(var(--copper))] mt-0.5 flex-shrink-0" aria-hidden="true" />
                        ) : (
                          <span className="w-4 h-4 mt-0.5 flex-shrink-0 flex items-center justify-center" aria-hidden="true">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                          </span>
                        )}
                        <span className={isPrimary ? "text-foreground" : "text-muted-foreground"}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LICENSING DISCLOSURE — locked verbatim */}
      <section
        className="py-16 lg:py-20 bg-[hsl(var(--charcoal))] text-cream border-t border-cream/10"
        data-testid="section-wwa-disclosure"
      >
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-5">
            Licensing disclosure
          </p>
          <p
            className="font-serif text-xl sm:text-2xl text-cream/95 leading-snug mb-6"
            data-testid="text-wwa-dre-kw-disclosure"
          >
            {DRE_KW_DISCLOSURE}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-5 border-t border-cream/10 text-xs uppercase tracking-[0.22em] text-cream/55">
            <span>Paolo "Apollo" Duran</span>
            <span className="hidden sm:inline text-cream/15">·</span>
            <span>DRE #02333658</span>
            <span className="hidden sm:inline text-cream/15">·</span>
            <span>Keller Williams Realty East Bay</span>
            <span className="hidden sm:inline text-cream/15">·</span>
            <span>Each office independently owned and operated</span>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 lg:py-28 bg-background border-t border-border/30">
        <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-[-0.02em] mb-5 leading-tight">
              Start the conversation.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
              Submit the property or situation. Apollo reviews every serious inbound within 48 hours, Monday through Friday.
            </p>
            <Link href="/submit">
              <Button
                size="lg"
                className="px-10 py-7 text-sm uppercase tracking-[0.15em] font-semibold bg-[hsl(var(--copper))] hover:bg-[hsl(27_56%_44%)] text-white"
                data-testid="button-wwa-final-cta"
              >
                Submit a Property
                <ArrowRight className="ml-3 w-4 h-4" aria-hidden="true" />
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
