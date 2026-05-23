import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import { CardSurface } from "@/components/ui/card-primitives";
import founderApolloPath from "@assets/image_1778735694150.png";
import {
  ArrowRight,
  Compass,
  Hammer,
  Layers,
  Network,
  Shield,
  Building,
  Mail,
  Phone,
} from "lucide-react";

// Website Brief v1.0 — Organization + Person JSON-LD for the About page so
// search engines surface Pegasus DreamScapes Corp. and its founder with
// the canonical entity attributes (legal name, founder, contact).
const ABOUT_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://pegasusdreamscapes.com/#organization",
      name: "Pegasus DreamScapes Corp.",
      alternateName: "Pegasus DreamScapes",
      url: "https://pegasusdreamscapes.com",
      logo: "https://pegasusdreamscapes.com/brand/pegasus-mark.svg",
      slogan: "The Deal Architect",
      email: "apollo@pegasusdreamscapes.com",
      telephone: "+1-925-744-8525",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Pleasant Hill",
        addressRegion: "CA",
        addressCountry: "US",
      },
      founder: { "@id": "https://pegasusdreamscapes.com/#founder" },
      areaServed: "East Bay, California",
    },
    {
      "@type": "Person",
      "@id": "https://pegasusdreamscapes.com/#founder",
      name: "Paolo \"Apollo\" Duran",
      jobTitle: "Founder & Principal",
      worksFor: { "@id": "https://pegasusdreamscapes.com/#organization" },
      identifier: "DRE #02333658",
      affiliation: "Keller Williams East Bay",
    },
  ],
};

export default function About() {
  useSEO({
    title: "About",
    description:
      "Pegasus DreamScapes Corp. is a strategy-first real estate operating company founded by Paolo \"Apollo\" Duran. Built on strategy. Governed by virtue. Executed with discipline.",
    image: "https://pegasusdreamscapes.com/og/about.svg",
  });

  useEffect(() => {
    const id = "ld-about";
    let s = document.head.querySelector<HTMLScriptElement>(`#${id}`);
    if (!s) {
      s = document.createElement("script");
      s.id = id;
      s.type = "application/ld+json";
      document.head.appendChild(s);
    }
    s.text = JSON.stringify(ABOUT_JSONLD);
    return () => {
      document.head.querySelector(`#${id}`)?.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AboutHero />
      <DoctrineSection />
      <PillarsSection />
      <FounderSection />
      <PrinciplesSection />
      <CTASection />
    </div>
  );
}

function AboutHero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-navy text-cream overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[28rem] h-[28rem] bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-champagne/10 rounded-full blur-3xl" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          <ScrollReveal className="lg:col-span-7" direction="left">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
                About · The Operating Company
              </p>
            </div>
            <h1
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.02em] mb-8 leading-[0.98]"
              data-testid="text-about-headline"
            >
              A real estate company,<br />
              <span className="italic font-medium bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">
                {" "}built on strategy.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-cream/90 leading-relaxed max-w-2xl mb-6">
              Pegasus DreamScapes is a strategy-first real estate operating company. We work the complex situations, the half-broken pro formas, and the properties other groups walk away from. Every property gets a serious review. Not every property gets an offer.
            </p>
            <p
              className="font-serif text-base sm:text-lg text-cream/85 italic tracking-wide leading-snug"
              data-testid="text-about-philosophical"
            >
              Built on strategy. Governed by virtue. Executed with discipline.
            </p>
          </ScrollReveal>

          <ScrollReveal className="lg:col-span-5" direction="right" delay={0.15}>
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-br from-primary/15 via-transparent to-champagne/10 blur-2xl rounded-lg" />
              <div
                className="relative p-8 lg:p-10 rounded-lg border border-cream/15 shadow-md shadow-black/40 backdrop-blur-sm"
                style={{ backgroundColor: "hsl(var(--charcoal) / 0.85)" }}
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-5">
                  The shape of the company
                </p>
                <dl className="divide-y divide-cream/15">
                  <ShapeRow label="Positioning" value="The Deal Architect" />
                  <ShapeRow label="Founder" value="Paolo &quot;Apollo&quot; Duran" />
                  <ShapeRow label="Entity" value="Pegasus DreamScapes Corp." />
                  <ShapeRow label="HQ" value="Pleasant Hill, California" />
                  <ShapeRow label="Stage" value="Private beta · Invite-only network" />
                </dl>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
      <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
    </section>
  );
}

function ShapeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-3.5">
      <dt className="text-[10px] uppercase tracking-[0.25em] text-cream/55 font-supporting">{label}</dt>
      <dd
        className="font-serif text-sm sm:text-base text-cream font-medium text-right"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}

function DoctrineSection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <ScrollReveal>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
              The Doctrine
            </p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-8 leading-tight">
            No lead dies. Every property gets a path.
          </h2>
          <div className="space-y-5 text-lg text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-7 max-w-3xl">
            <p>
              Most real estate companies want one thing: the property they can buy at their number. Anything else gets dropped.
            </p>
            <p>
              We were built differently. When a property hits Pegasus HQ, the question we ask first is structural: what is this situation actually asking for? Sometimes the answer is a direct acquisition. Sometimes it is a joint venture, a creative-finance structure, a referral to a trusted operator, or a clean MLS listing through our KW partnership.
            </p>
            <p className="text-foreground/90">
              The lane that fits the property is the lane we route it to. The owner gets a real read on their situation either way.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

function PillarsSection() {
  const pillars = [
    {
      icon: Hammer,
      kicker: "Pillar 01",
      title: "Pegasus Development",
      desc: "The spine of the company. ADU, fix-and-flip, BRRRR, and small-scale development today; trajectory toward ground-up infill and master-planned classical neighborhoods over time.",
    },
    {
      icon: Layers,
      kicker: "Pillar 02",
      title: "Pegasus Investments",
      desc: "Capital structures that feed what gets built. Direct acquisition, JV / co-GP, and creative finance, sized to the situation, never the other way around. Private network, no public offering.",
    },
    {
      icon: Network,
      kicker: "Pillar 03",
      title: "Pegasus Systems",
      desc: "The operating layer. MarketFlow private dealflow, Peggy strategy assistant, Strategy Library, and the vendor network that makes execution repeatable.",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-muted/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="max-w-3xl mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
              Three Pillars
            </p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            One operating company. Three pillars.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Development is the spine. Investments and Systems exist to feed and support what gets built.
          </p>
        </ScrollReveal>

        <StaggerChildren className="grid md:grid-cols-3 gap-6 lg:gap-7" staggerDelay={0.1}>
          {pillars.map((p, i) => (
            <StaggerItem key={p.title}>
              <CardSurface
                className="h-full p-7 lg:p-8 border-border/40 hover:border-primary/30 transition-colors duration-300"
                data-testid={`about-pillar-${i}`}
              >
                <div className="flex items-baseline justify-between mb-6">
                  <span className="font-serif text-3xl text-primary/30">0{i + 1}</span>
                  <p.icon className="w-5 h-5 text-primary/55" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-primary font-supporting font-semibold mb-1">
                  {p.kicker}
                </p>
                <h3 className="font-serif text-2xl font-semibold mb-4 tracking-tight">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </CardSurface>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function FounderSection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <ScrollReveal className="lg:col-span-5" direction="left">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/15 via-transparent to-champagne/10 blur-2xl rounded-lg" />
              <div className="relative">
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden">
                  <img
                    src={founderApolloPath}
                    alt="Paolo &quot;Apollo&quot; Duran, Founder & Principal of Pegasus DreamScapes Corp."
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    data-testid="img-founder-apollo"
                  />
                  <div className="absolute inset-0 ring-1 ring-primary/50 rounded-lg pointer-events-none" />
                  <div className="absolute -inset-1 rounded-lg ring-1 ring-primary/15 pointer-events-none" />
                </div>
                <div className="brand-stripe mt-3" />
                <div className="mt-6 px-1">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-2">
                    Founder &amp; Principal
                  </p>
                  <h3 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight mb-1">
                    Paolo &quot;Apollo&quot; Duran
                  </h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    Pegasus DreamScapes Corp.
                  </p>
                  <blockquote className="font-serif text-base italic text-foreground/85 leading-relaxed border-l-2 border-primary pl-5 mb-5">
                    &ldquo;Where others see impossible, we see a path. The deal is the architecture of the situation, not the situation itself.&rdquo;
                  </blockquote>
                  <div className="grid grid-cols-2 divide-x divide-border/60 -mx-2">
                    <div className="px-3">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Direct line</p>
                      <a href="tel:+19257448525" className="text-sm font-medium text-foreground hover:text-primary transition-colors">925-744-8525</a>
                    </div>
                    <div className="px-3">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Email</p>
                      <a href="mailto:apollo@pegasusdreamscapes.com" className="text-sm font-medium text-foreground hover:text-primary transition-colors break-all">apollo@pegasusdreamscapes.com</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal className="lg:col-span-7" direction="right" delay={0.15}>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
                The Operator
              </p>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-7 leading-tight">
              Strategy is the product.<br />
              <span className="italic">Discipline is the moat.</span>
            </h2>
            <div className="space-y-5 text-base text-muted-foreground leading-relaxed">
              <p>
                Apollo founded Pegasus DreamScapes to do real estate the way it should be done: a long-arc operating company instead of a quarterly transaction shop. Every project is treated as a structural problem first and a profit number second.
              </p>
              <p>
                The build discipline runs in the family. Apollo's father, Moises Duran, is a licensed General Contractor with more than 20 years of commercial and residential construction experience; that operator's lens sits inside every Pegasus project review.
              </p>
              <p>
                That means underwriting that survives the worst case, capital partners who get the truth in writing, and execution that never depends on a single point of failure.
              </p>
              <p className="text-foreground/90">
                The work today is small-scale and disciplined. The trajectory is a vertically integrated developer producing ground-up infill and, in time, master-planned classical neighborhoods. Each phase is earned, not assumed.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function PrinciplesSection() {
  const principles = [
    {
      kicker: "Principle 01",
      title: "Strategy first, transaction second.",
      body: "We design the path before we touch the contract. The structural read of the situation is the product; the close is the consequence.",
    },
    {
      kicker: "Principle 02",
      title: "Truth in writing.",
      body: "Capital partners and sellers get the full picture. The numbers we model in private are the numbers we put on paper.",
    },
    {
      kicker: "Principle 03",
      title: "Earned, never assumed.",
      body: "Each phase of the company graduates only when the prior phase is consistently profitable, well-documented, and operationally repeatable.",
    },
    {
      kicker: "Principle 04",
      title: "No lead dies.",
      body: "Every property gets a path. When the path is a referral or a listing instead of an offer, we say so plainly and route accordingly. Pegasus reviews the path first and Pegasus participation second.",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-muted/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="max-w-3xl mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-primary to-transparent" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold">
              Operating Principles
            </p>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] mb-5">
            How we actually work.
          </h2>
        </ScrollReveal>

        <StaggerChildren className="grid sm:grid-cols-2 gap-6 lg:gap-8" staggerDelay={0.08}>
          {principles.map((p, i) => (
            <StaggerItem key={p.kicker}>
              <CardSurface
                className="h-full p-7 lg:p-8 rounded-none border-0 border-l-2 border-primary/40 hover:border-primary transition-colors duration-300"
                data-testid={`about-principle-${i}`}
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-3">
                  {p.kicker}
                </p>
                <h3 className="font-serif text-2xl font-semibold mb-3 tracking-tight leading-tight">
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </CardSurface>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 lg:py-32 bg-navy text-cream relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <ScrollReveal>
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-5">
            Continue the conversation
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] mb-8">
            Dream it. Build it. Live it.
          </h2>
          <p className="text-lg text-cream/85 leading-relaxed max-w-2xl mx-auto mb-10">
            Whether you have a property, capital, or a question that does not fit a box, the door is the same.
          </p>
          <div className="flex justify-center">
            <Link href="/submit">
              <Button
                size="lg"
                className="px-10 py-7 text-sm uppercase tracking-[0.15em] font-semibold bg-primary text-white hover:bg-primary/90 shadow-md shadow-black/30 transition-all duration-300 hover:-translate-y-0.5 min-h-[44px]"
                data-testid="button-about-sell"
              >
                Start a Strategy Review
                <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <p className="text-xs text-cream/55 mt-6 font-supporting">
            Or call Apollo direct: <a href="tel:+19257448525" className="text-primary hover:text-primary/80 transition-colors">925-744-8525</a>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
