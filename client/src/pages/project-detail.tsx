import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  TrendingUp,
  ArrowLeft,
  ArrowRight,
  Ruler,
  BedDouble,
  Bath,
  Home as HomeIcon,
  CheckCircle2,
  Building,
  Briefcase,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import type { Project } from "@shared/schema";

type StoryBlock = { kicker: string; heading: string; body: string };

const CASE_STUDY_NARRATIVE: Record<string, StoryBlock[]> = {
  "nelson-dr": [
    {
      kicker: "Strategy",
      heading: "Why this property, why this path.",
      body: "A complex East Bay single-family situation with real condition issues, real permit exposure, and real upside. The structural read was clear: take it down, run a disciplined value-add renovation, exit retail. The deal was selected for its forced-appreciation potential, not its convenience.",
    },
    {
      kicker: "Structure",
      heading: "How the deal was put together.",
      body: "Direct acquisition with private capital coordination. Clean title, scoped contingencies, and a defined renovation budget agreed before closing. Every dollar in the project had a documented purpose and a documented source.",
    },
    {
      kicker: "Execution",
      heading: "Permit planning, scope control, communication discipline.",
      body: "The renovation ran through real-world friction: permit coordination with the City of Richmond, scope adjustments mid-project, and the daily communication cadence that keeps a build on track. This project is where Pegasus learned that permit planning is the project, scope creep is the enemy, and disciplined contractor communication is non-negotiable.",
    },
    {
      kicker: "Result",
      heading: "Renovated, sold, documented.",
      body: "The home was fully renovated, brought to retail-ready condition, and sold. Public-safe economics: acquisition near $600k, renovation investment in the $90–100k range, sale near $840k. Project economics: documented internally for partner conversations.",
    },
    {
      kicker: "Lesson",
      heading: "Why Nelson became the foundation.",
      body: "Nelson is the project that inspired Pegasus HQ. Every system we run now (strategy reviews, structured intake, permit-aware underwriting, the no-lead-dies doctrine) traces back to a lesson learned here. It is the reason Pegasus is built the way it is built.",
    },
  ],
};

// Wave 4 — asset discipline: derive an AVIF sibling from a webp/jpg path.
// Falls back gracefully when no transcoded sibling exists (browser
// continues down the <picture> source list to webp/jpg).
function toAvif(src: string | undefined | null): string {
  if (!src) return "";
  return src.replace(/\.(webp|jpe?g|png)$/i, ".avif");
}

const STRATEGY_LABEL: Record<string, string> = {
  "fix-flip": "Fix & Flip",
  "buy-hold": "Buy & Hold",
  "brrrr": "BRRRR",
  "adu": "ADU",
  "development": "Development",
};

const STATUS_LABEL: Record<string, string> = {
  "completed": "Completed",
  "active": "In Progress",
  "planning": "In Planning",
};

const formatCurrency = (value: number | null | undefined) => {
  if (!value) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ["/api/projects", slug],
    enabled: !!slug,
  });

  useSEO({
    title: project ? `${project.name} · Projects` : "Project",
    description: project?.description || "Documented real estate case study from Pegasus Dreamscapes.",
    image: project?.afterImages?.[0] || "/og/projects.png",
  });

  if (isLoading) return <ProjectSkeleton />;
  if (error || !project) return <NotFound />;

  return (
    <div className="min-h-screen">
      <ProjectJsonLd project={project} />
      <h1 className="sr-only">Project Detail — Pegasus Dreamscapes</h1>
      <HeroSection project={project} />
      <BodySection project={project} />
      <RoutingSection />
    </div>
  );
}

function ProjectJsonLd({ project }: { project: Project }) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: project.name,
    description: project.description || `${project.name} case study from Pegasus Dreamscapes Corp.`,
    url: `https://pegasusdreamscapes.com/projects/${project.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: project.address,
      addressLocality: project.city,
      addressRegion: project.state,
      addressCountry: "US",
    },
    image: project.afterImages?.[0],
    provider: {
      "@type": "Organization",
      name: "Pegasus Dreamscapes Corp.",
      url: "https://pegasusdreamscapes.com",
    },
  };
  if (project.bedrooms) data.numberOfBedrooms = project.bedrooms;
  if (project.bathrooms) data.numberOfBathroomsTotal = project.bathrooms;
  if (project.sqft) {
    data.floorSize = { "@type": "QuantitativeValue", value: project.sqft, unitCode: "FTK" };
  }
  if (project.yearBuilt) data.yearBuilt = project.yearBuilt;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function HeroSection({ project }: { project: Project }) {
  const heroImg = project.afterImages?.[0];

  return (
    <section className="relative min-h-[80vh] flex items-end overflow-hidden pt-20">
      {heroImg ? (
        <motion.div
          className="absolute inset-0 scale-105"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAACwAQCdASoQAAkAPm0ulEclI6IhMAgAsBOJaQAAk2zSAAD+8w0AAAAA)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(12px)",
              transform: "scale(1.05)",
            }}
          />
          <picture>
            <source
              type="image/avif"
              srcSet={`${toAvif(heroImg)} 1920w`}
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet={`${heroImg} 1920w`}
              sizes="100vw"
            />
            <img
              src={heroImg}
              srcSet={`${heroImg} 1920w`}
              sizes="100vw"
              alt={`${project.name} after photo`}
              width={1920}
              height={1080}
              loading="eager"
              decoding="sync"
              {...({ fetchpriority: "high" } as Record<string, string>)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </picture>
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-navy to-charcoal" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/55 to-black/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />

      <div className="relative z-10 w-full pb-20 pt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/80 hover:text-white transition-colors mb-10 group cursor-pointer"
            data-testid="button-back-projects"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to The Record
          </Link>

          <motion.div
            className="flex items-center gap-3 mb-5 flex-wrap"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-semibold bg-white/95 text-charcoal rounded-md">
              {STATUS_LABEL[project.status] || project.status}
            </span>
            <span className="px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-semibold bg-white/10 text-white rounded-md border border-white/20 backdrop-blur-sm">
              {STRATEGY_LABEL[project.strategy] || project.strategy}
            </span>
            <span className="text-[11px] uppercase tracking-[0.25em] text-white/85 ml-1 font-supporting">
              Case Study · {project.city}
            </span>
          </motion.div>

          <motion.h1
            className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[0.95] tracking-normal mb-6 max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            data-testid="text-project-name"
          >
            {project.name}
          </motion.h1>

          <motion.div
            className="flex items-center gap-2 text-base text-white/75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <MapPin className="w-4 h-4 text-primary" />
            <span>{project.address}, {project.city}, {project.state}</span>
          </motion.div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 brand-stripe" />
    </section>
  );
}

function BodySection({ project }: { project: Project }) {
  const propertyDetails = [
    { icon: BedDouble, label: "Bedrooms", value: project.bedrooms },
    { icon: Bath, label: "Bathrooms", value: project.bathrooms },
    { icon: Ruler, label: "Square Feet", value: project.sqft?.toLocaleString() },
    { icon: HomeIcon, label: "Year Built", value: project.yearBuilt },
    { icon: Calendar, label: "Timeline", value: project.holdTime },
  ].filter((d) => d.value);

  const investmentMetrics = [
    { label: "Acquisition", value: formatCurrency(project.purchasePrice) },
    { label: "Renovation Investment", value: formatCurrency(project.rehabCost) },
    { label: "ARV", value: formatCurrency(project.arv) },
    { label: "Sale Price", value: formatCurrency(project.salePrice), accent: true },
    { label: "Profit", value: formatCurrency(project.profit), accent: true },
    { label: "ROI", value: project.roi, accent: true },
  ].filter((m) => m.value);

  const narrative = CASE_STUDY_NARRATIVE[project.slug];

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left column — narrative + galleries */}
          <div className="lg:col-span-7 space-y-16">
            <ScrollReveal>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                <p className="text-xs uppercase tracking-[0.28em] text-primary font-semibold font-supporting">The Situation</p>
              </div>
              <p className="font-serif text-2xl sm:text-3xl text-foreground/90 leading-snug tracking-tight">
                {project.description}
              </p>
            </ScrollReveal>

            {narrative && narrative.map((block, i) => (
              <ScrollReveal key={`story-${i}`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                  <p className="text-xs uppercase tracking-[0.28em] text-primary font-semibold font-supporting" data-testid={`story-kicker-${block.kicker.toLowerCase()}`}>{block.kicker}</p>
                </div>
                <div className="relative rounded-lg border border-border/40 bg-gradient-to-br from-navy to-charcoal p-8 lg:p-10 text-cream overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cream/40 to-primary opacity-80" />
                  <h3 className="font-serif text-2xl sm:text-3xl font-semibold mb-4 tracking-tight">{block.heading}</h3>
                  <p className="text-base sm:text-lg text-cream/90 leading-relaxed">{block.body}</p>
                </div>
              </ScrollReveal>
            ))}

            {project.afterImages && project.afterImages.length > 0 && (
              <ScrollReveal>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                  <p className="text-xs uppercase tracking-[0.28em] text-primary font-semibold font-supporting">After</p>
                </div>
                <h2 className="font-serif text-3xl font-semibold mb-7 tracking-tight">The result.</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.afterImages.map((image, i) => (
                    <motion.div
                      key={i}
                      className="aspect-[4/3] rounded-lg overflow-hidden bg-muted"
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.3 }}
                    >
                      <picture>
                        <source
                          type="image/avif"
                          srcSet={`${toAvif(image)} 1280w`}
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                        <source
                          type="image/webp"
                          srcSet={`${image} 1280w`}
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                        <img
                          src={image}
                          srcSet={`${image} 1280w`}
                          sizes="(max-width: 640px) 100vw, 50vw"
                          alt={`${project.name} after ${i + 1}`}
                          width={1280}
                          height={853}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                          loading="lazy"
                          decoding="async"
                          data-testid={`img-after-${i}`}
                        />
                      </picture>
                    </motion.div>
                  ))}
                </div>
              </ScrollReveal>
            )}

            {project.beforeImages && project.beforeImages.length > 0 && (
              <ScrollReveal>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px w-12 bg-gradient-to-r from-foreground/40 to-transparent" />
                  <p className="text-xs uppercase tracking-[0.28em] text-foreground/55 font-semibold font-supporting">Before</p>
                </div>
                <h2 className="font-serif text-3xl font-semibold mb-7 tracking-tight">What we started with.</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.beforeImages.map((image, i) => (
                    <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                      <picture>
                        <source
                          type="image/avif"
                          srcSet={`${toAvif(image)} 1280w`}
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                        <source
                          type="image/webp"
                          srcSet={`${image} 1280w`}
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                        <img
                          src={image}
                          srcSet={`${image} 1280w`}
                          sizes="(max-width: 640px) 100vw, 50vw"
                          alt={`${project.name} before ${i + 1}`}
                          width={1280}
                          height={853}
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                          loading="lazy"
                          decoding="async"
                          data-testid={`img-before-${i}`}
                        />
                      </picture>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            )}

            {project.highlights && project.highlights.length > 0 && (
              <ScrollReveal>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                  <p className="text-xs uppercase tracking-[0.28em] text-primary font-semibold font-supporting">Scope of Work</p>
                </div>
                <h2 className="font-serif text-3xl font-semibold mb-7 tracking-tight">What we did.</h2>
                <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 gap-3" staggerDelay={0.05}>
                  {project.highlights.map((highlight, i) => (
                    <StaggerItem key={i}>
                      <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border/40 hover:border-primary/30 transition-colors" data-testid={`highlight-${i}`}>
                        <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <span className="text-sm text-foreground/85 leading-relaxed">{highlight}</span>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              </ScrollReveal>
            )}
          </div>

          {/* Right column — sticky stats */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-28 space-y-6">
              {propertyDetails.length > 0 && (
                <ScrollReveal>
                  <div className="bg-card rounded-lg border border-border/50 overflow-hidden shadow-lg">
                    <div className="px-7 py-6 border-b border-border/40">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold mb-1">The Asset</p>
                      <h3 className="font-serif text-2xl font-semibold tracking-tight">Property</h3>
                    </div>
                    <div className="divide-y divide-border/40">
                      {propertyDetails.map((d, i) => (
                        <div key={i} className="px-7 py-4 flex items-center justify-between" data-testid={`detail-${d.label.toLowerCase().replace(/\s+/g, '-')}`}>
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <d.icon className="w-4 h-4 text-primary/60" />
                            <span className="text-sm">{d.label}</span>
                          </div>
                          <span className="font-serif text-lg font-medium tabular-nums">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {investmentMetrics.length > 0 && (
                <ScrollReveal delay={0.1}>
                  <div className="bg-card rounded-lg border border-border/50 overflow-hidden shadow-lg">
                    <div className="px-7 py-6 border-b border-border/40">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold mb-1">The Numbers</p>
                      <h3 className="font-serif text-2xl font-semibold tracking-tight">Project Economics</h3>
                    </div>
                    <div className="divide-y divide-border/40">
                      {investmentMetrics.map((m, i) => (
                        <div key={i} className={`px-7 py-4 flex items-center justify-between ${m.accent ? 'bg-primary/[0.03]' : ''}`} data-testid={`metric-${m.label.toLowerCase().replace(/\s+/g, '-')}`}>
                          <span className="text-sm text-muted-foreground">{m.label}</span>
                          <span className={`font-serif text-lg font-semibold tabular-nums ${m.accent ? 'text-primary' : ''}`}>
                            {m.value}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="px-7 py-4 bg-muted/40 border-t border-border/40">
                      <p className="text-[10px] text-muted-foreground italic leading-relaxed" data-testid="text-economics-note">
                        Project economics: documented internally. Public figures are shown as approximate ranges; full capital stack, contingency budgets, and exit assumptions are reserved for partner conversations.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              )}

              <ScrollReveal delay={0.2}>
                <div className="relative p-8 rounded-lg bg-gradient-to-br from-navy to-charcoal text-cream overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-cream to-primary opacity-80" />
                  <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold mb-3">Next Project</p>
                  <h4 className="font-serif text-2xl font-semibold mb-3 tracking-tight">Have one to add to the record?</h4>
                  <p className="text-sm text-cream/90 leading-relaxed mb-6">
                    Submit a property, or open a private partner conversation about the next project.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Link href="/submit?intent=property">
                      <Button className="w-full bg-cream text-charcoal hover:bg-cream/95 text-xs uppercase tracking-[0.18em] font-semibold py-6" data-testid="button-project-sell">
                        Submit a Property
                        <ArrowRight className="ml-2 w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Link href="/capital">
                      <Button variant="outline" className="w-full bg-transparent border-cream/30 text-cream hover:bg-cream/10 text-xs uppercase tracking-[0.18em] font-semibold py-6" data-testid="button-project-invest">
                        Partner Inquiry
                      </Button>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function RoutingSection() {
  const lanes = [
    { icon: Building, kicker: "More Projects", title: "See the full record", desc: "Browse other documented case studies.", href: "/projects", cta: "Open The Record" },
    { icon: Briefcase, kicker: "MarketFlow", title: "Live deal flow", desc: "Vetted, off-market opportunities for our private network.", href: "/marketflow", cta: "Enter MarketFlow" },
  ];

  return (
    <section className="py-24 lg:py-32 bg-card border-t border-border/40">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <ScrollReveal className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold font-supporting mb-4">Where to next</p>
          <h2 className="font-serif text-4xl font-semibold tracking-normal">Continue the conversation.</h2>
        </ScrollReveal>
        <div className="grid sm:grid-cols-2 gap-5">
          {lanes.map((lane, i) => (
            <Link key={i} href={lane.href}>
              <motion.div
                className="group h-full p-8 bg-background rounded-lg border border-border/40 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                data-testid={`route-${i}`}
              >
                <div className="flex items-baseline justify-between mb-6">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-primary font-supporting font-semibold">{lane.kicker}</p>
                  <lane.icon className="w-5 h-5 text-primary/55 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-serif text-2xl font-semibold mb-3 tracking-tight">{lane.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">{lane.desc}</p>
                <span className="text-xs uppercase tracking-[0.18em] text-primary font-semibold inline-flex items-center gap-2">
                  {lane.cta}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectSkeleton() {
  return (
    <div className="min-h-screen pt-20">
      <section className="relative min-h-[60vh] bg-gradient-to-br from-navy to-charcoal animate-skeleton">
        <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
      </section>
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-6">
          <div className="h-8 w-2/3 bg-muted rounded animate-skeleton" />
          <div className="h-4 w-full bg-muted rounded animate-skeleton" />
          <div className="h-4 w-5/6 bg-muted rounded animate-skeleton" />
        </div>
        <div className="lg:col-span-5">
          <div className="h-96 bg-muted rounded-lg animate-skeleton" />
        </div>
      </section>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen pt-32 pb-24 flex items-center">
      <div className="max-w-md mx-auto px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold font-supporting mb-4">404</p>
        <h2 className="font-serif text-4xl font-semibold mb-5 tracking-tight">Project not found.</h2>
        <p className="text-muted-foreground leading-relaxed mb-8">
          The case study you're looking for may have moved or been removed.
        </p>
        <Link href="/projects">
          <Button className="text-sm uppercase tracking-[0.15em] font-semibold px-8 py-6">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to The Record
          </Button>
        </Link>
      </div>
    </div>
  );
}
