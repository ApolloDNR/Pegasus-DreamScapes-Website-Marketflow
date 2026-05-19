import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/use-seo";
import { ScrollReveal, StaggerChildren, StaggerItem } from "@/components/animations";
import {
  Home as HomeIcon,
  MapPin,
  Calendar,
  TrendingUp,
  ArrowRight,
  Building,
} from "lucide-react";
import type { Project } from "@shared/schema";
import { HeroPicture } from "@/components/hero-picture";

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

export default function Projects() {
  useSEO({
    title: "Projects",
    description: "Documented real estate case studies from Pegasus DreamScapes Corp. Strategy, structure, and execution recorded for every project.",
    image: "https://pegasusdreamscapes.com/og/projects.svg",
  });

  return (
    <div className="min-h-screen">
      <h1 className="sr-only">Projects and Case Studies — Pegasus DreamScapes</h1>
      <HeroSection />
      <ProjectsGrid />
      <CTASection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[60vh] flex items-center overflow-hidden pt-20">
      <motion.div
        className="absolute inset-0 scale-105"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
      >
        <HeroPicture
          alt="Projects portfolio from Pegasus DreamScapes Corp."
          className="absolute inset-0 w-full h-full object-cover"
          priority
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/65 to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

      <div className="relative z-10 w-full py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            className="flex items-center gap-4 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="h-px w-10 bg-copper" />
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-copper font-semibold font-supporting">Case Studies · Documented Work</p>
          </motion.div>

          <motion.h1
            className="font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[0.95] tracking-[-0.02em] mb-8 max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            data-testid="text-projects-hero"
          >
            Every project<br />
            <span className="bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent">documented.</span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg text-white/75 max-w-2xl leading-relaxed font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
          >
            A growing record of the real estate situations we've taken on, from forced-value rehabs to small-scale development. Strategy, structure, and execution recorded for every property.
          </motion.p>
        </div>
      </div>
      <div className="brand-stripe absolute bottom-0 left-0 right-0" aria-hidden="true" />
    </section>
  );
}

function ProjectsGrid() {
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [strategyFilter, setStrategyFilter] = useState<string>("all");

  const statuses = useMemo(() => {
    if (!projects) return [];
    return Array.from(new Set(projects.map((p) => p.status)));
  }, [projects]);

  const strategies = useMemo(() => {
    if (!projects) return [];
    return Array.from(new Set(projects.map((p) => p.strategy)));
  }, [projects]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) =>
      (statusFilter === "all" || p.status === statusFilter) &&
      (strategyFilter === "all" || p.strategy === strategyFilter)
    );
  }, [projects, statusFilter, strategyFilter]);

  if (isLoading) {
    return (
      <section className="py-24 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="mb-14 pb-6 border-b border-border/40">
            <div className="h-3 w-20 bg-muted rounded mb-3 animate-skeleton" />
            <div className="h-7 w-64 bg-muted rounded animate-skeleton" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border/40 overflow-hidden">
                <div className="aspect-[16/10] bg-muted animate-skeleton" />
                <div className="p-7 space-y-4">
                  <div className="h-4 w-full bg-muted rounded animate-skeleton" />
                  <div className="h-4 w-5/6 bg-muted rounded animate-skeleton" />
                  <div className="grid grid-cols-2 gap-5 pt-6 border-t border-border/40">
                    <div className="space-y-2">
                      <div className="h-2.5 w-16 bg-muted rounded animate-skeleton" />
                      <div className="h-5 w-24 bg-muted rounded animate-skeleton" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2.5 w-16 bg-muted rounded animate-skeleton" />
                      <div className="h-5 w-24 bg-muted rounded animate-skeleton" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !projects) {
    return (
      <section className="py-24 lg:py-32 bg-background">
        <div className="max-w-xl mx-auto text-center px-6">
          <div className="inline-flex w-14 h-14 rounded-full border border-primary/30 items-center justify-center mb-7">
            <Building className="w-6 h-6 text-primary/70" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
            The Record · Loading
          </p>
          <h3 className="font-serif text-3xl sm:text-4xl font-semibold mb-5 leading-tight tracking-tight">
            We can't reach the project record right now.
          </h3>
          <p className="text-base text-muted-foreground leading-relaxed mb-8">
            Refresh in a moment. If it persists, the team has been notified.
          </p>
          <Link href="/sell">
            <Button
              size="lg"
              className="min-h-[44px] px-8 text-sm uppercase tracking-[0.15em] font-semibold"
              data-testid="button-projects-error-cta"
            >
              Start a Strategy Review
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 lg:py-32 bg-background relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Filter bar */}
        <ScrollReveal className="mb-14">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-border/40">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-primary font-semibold mb-2">The Record</p>
              <h2 className="font-serif text-3xl font-semibold tracking-tight">
                {filtered.length} {filtered.length === 1 ? "project" : "projects"} on file
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FilterGroup
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[{ value: "all", label: "All" }, ...statuses.map((s) => ({ value: s, label: STATUS_LABEL[s] || s }))]}
                testIdPrefix="filter-status"
              />
              <FilterGroup
                label="Strategy"
                value={strategyFilter}
                onChange={setStrategyFilter}
                options={[{ value: "all", label: "All" }, ...strategies.map((s) => ({ value: s, label: STRATEGY_LABEL[s] || s }))]}
                testIdPrefix="filter-strategy"
              />
            </div>
          </div>
        </ScrollReveal>

        {filtered.length === 0 ? (
          <div className="py-20 lg:py-28 text-center max-w-xl mx-auto">
            <div className="inline-flex w-14 h-14 rounded-full border border-primary/30 items-center justify-center mb-7">
              <Building className="w-6 h-6 text-primary/70" />
            </div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold mb-4">
              {statusFilter === "all" && strategyFilter === "all"
                ? "Case studies · In progress"
                : "No matches in this slice"}
            </p>
            <h3 className="font-serif text-3xl sm:text-4xl font-semibold mb-5 leading-tight tracking-tight">
              {statusFilter === "all" && strategyFilter === "all"
                ? "First case study coming soon."
                : "Nothing in this slice yet."}
            </h3>
            <p className="text-base text-muted-foreground mb-8 leading-relaxed">
              {statusFilter === "all" && strategyFilter === "all"
                ? "Pegasus is in build mode. The first case studies are being documented now. In the meantime, the door is open for a Strategy Review on your situation."
                : "Clear the filters to see the full set, or start a Strategy Review and we will route your situation to the right lane."}
            </p>
            <div className="flex justify-center">
              {statusFilter === "all" && strategyFilter === "all" ? (
                <a
                  href="/sell"
                  className="inline-flex items-center justify-center min-h-[44px] px-8 text-sm uppercase tracking-[0.15em] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-md shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                  data-testid="link-projects-strategy-review"
                >
                  Start a Strategy Review
                </a>
              ) : (
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setStrategyFilter("all");
                  }}
                  className="inline-flex items-center justify-center min-h-[44px] px-8 text-sm uppercase tracking-[0.15em] font-semibold border border-primary/40 text-primary hover:bg-primary/10 rounded-md transition-colors"
                  data-testid="button-projects-clear-filters"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-7" staggerDelay={0.1}>
            {filtered.map((project, index) => (
              <StaggerItem key={project.id}>
                <ProjectCard project={project} index={index} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        )}
      </div>
    </section>
  );
}

function FilterGroup({
  label,
  value,
  onChange,
  options,
  testIdPrefix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  testIdPrefix: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold mr-1">{label}</span>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] rounded-md border transition-all ${
            value === opt.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
          }`}
          data-testid={`${testIdPrefix}-${opt.value}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <Link href={`/projects/${project.slug}`}>
      <motion.div
        className="group block h-full bg-card rounded-xl border border-border/40 hover:border-primary/30 overflow-hidden cursor-pointer transition-all duration-300 shadow-sm hover:shadow-2xl"
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3 }}
        data-testid={`card-project-${index}`}
      >
        <div className="aspect-[16/10] relative overflow-hidden bg-muted">
          {project.afterImages && project.afterImages.length > 0 ? (
            <motion.img
              src={project.afterImages[0]}
              alt={project.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-card">
              <HomeIcon className="w-10 h-10 text-primary/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

          <div className="absolute top-5 left-5 flex flex-wrap gap-2">
            <span className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold bg-white/90 backdrop-blur-sm text-foreground rounded-md shadow-sm">
              {STATUS_LABEL[project.status] || project.status}
            </span>
            <span className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold bg-black/60 backdrop-blur-sm text-white rounded-md shadow-sm border border-white/15">
              {STRATEGY_LABEL[project.strategy] || project.strategy}
            </span>
          </div>

          <div className="absolute bottom-5 left-5 right-5 text-white">
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight mb-1.5">
              {project.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <MapPin className="w-3.5 h-3.5" />
              <span>{project.city}, {project.state}</span>
            </div>
          </div>
        </div>

        <div className="p-7 lg:p-8">
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-3">
            {project.description}
          </p>

          {project.highlights && project.highlights.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-7">
              {project.highlights.slice(0, 3).map((h, i) => (
                <span key={i} className="px-2.5 py-1 bg-muted text-muted-foreground rounded text-xs font-medium">
                  {h}
                </span>
              ))}
              {project.highlights.length > 3 && (
                <span className="px-2.5 py-1 text-muted-foreground text-xs font-medium">
                  +{project.highlights.length - 3} more
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 divide-x divide-border/40 pt-6 border-t border-border/40">
            <div className="pr-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5 font-semibold">Strategy</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-primary/70" />
                <p className="font-serif text-base font-medium">{STRATEGY_LABEL[project.strategy] || project.strategy}</p>
              </div>
            </div>
            <div className="pl-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5 font-semibold">Timeline</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-primary/70" />
                <p className="font-serif text-base font-medium">{project.holdTime || "—"}</p>
              </div>
            </div>
          </div>

          <div className="mt-7 pt-6 border-t border-border/40 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">View Project</span>
            <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function CTASection() {
  return (
    <section className="py-28 lg:py-36 bg-card relative overflow-hidden border-t border-border/40">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-gradient-radial from-primary/8 via-primary/0 to-transparent rounded-full blur-3xl" />
      <div className="max-w-4xl mx-auto px-6 lg:px-12 relative text-center">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-6">The Next Project</p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] mb-6" data-testid="text-projects-cta">
            Have one to add to the record?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Whether you have a property to submit, capital to deploy, or a partnership to discuss, every conversation starts the same way: with a real, structural review.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sell">
              <Button size="lg" className="w-full sm:w-auto px-10 py-7 text-sm uppercase tracking-[0.15em] font-semibold" data-testid="button-projects-sell">
                Submit a Property
                <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/invest">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-10 py-7 text-sm uppercase tracking-[0.15em] font-semibold" data-testid="button-projects-invest">
                Partner Inquiry
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
