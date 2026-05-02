import { ReactNode, useEffect, useRef } from "react";
import { Link } from "wouter";

interface KickerProps {
  children: ReactNode;
  className?: string;
}

export function Kicker({ children, className = "" }: KickerProps) {
  return <span className={`kicker ${className}`}>{children}</span>;
}

interface CopperRuleProps {
  className?: string;
  align?: "left" | "center";
}

export function CopperRule({ className = "", align = "center" }: CopperRuleProps) {
  if (align === "left") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <span className="block h-px w-16 bg-gradient-to-r from-copper to-transparent" />
        <span className="block h-1 w-1 rotate-45 bg-copper" />
      </div>
    );
  }
  return (
    <div className={`copper-rule ${className}`}>
      <span className="pip" />
    </div>
  );
}

interface DisplayHeadingProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function DisplayHeading({ children, className = "", as: Tag = "h2" }: DisplayHeadingProps) {
  return (
    <Tag
      className={`font-display text-foreground text-balance leading-[1.05] tracking-tight ${className}`}
      style={{ textWrap: "balance" as any }}
    >
      {children}
    </Tag>
  );
}

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  variant?: "canvas" | "ink" | "card" | "hero";
}

export function Section({ id, children, className = "", variant = "canvas" }: SectionProps) {
  const variantClass =
    variant === "hero"
      ? "bg-hero"
      : variant === "ink"
      ? "bg-muted/50"
      : variant === "card"
      ? "bg-card"
      : "bg-canvas";

  return (
    <section id={id} className={`relative ${variantClass} ${className}`}>
      {children}
    </section>
  );
}

interface CTAButtonProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  external?: boolean;
  className?: string;
  testId?: string;
}

export function CTAButton({
  href,
  children,
  variant = "primary",
  external = false,
  className = "",
  testId,
}: CTAButtonProps) {
  const cls = variant === "primary" ? "btn-copper" : "btn-ghost-copper";
  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className={`${cls} ${className}`}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        data-testid={testId}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={`${cls} ${className}`}
      data-testid={testId}
    >
      {children}
    </Link>
  );
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Reveal({ children, className = "", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            window.setTimeout(() => el.classList.add("is-visible"), delay);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

interface PillarCardProps {
  kicker?: string;
  title: string;
  body: string;
  href: string;
  ctaLabel?: string;
  icon?: ReactNode;
  testId?: string;
}

export function PillarCard({
  kicker,
  title,
  body,
  href,
  ctaLabel = "Explore",
  icon,
  testId,
}: PillarCardProps) {
  return (
    <Link
      href={href}
      className="pillar-card group block p-8 md:p-10 h-full"
      data-testid={testId}
    >
      {icon && (
        <div className="mb-6 text-copper opacity-90 transition-transform duration-700 group-hover:scale-105">
          {icon}
        </div>
      )}
      {kicker && (
        <div className="mb-3">
          <Kicker>{kicker}</Kicker>
        </div>
      )}
      <h3 className="font-display text-3xl md:text-[2rem] leading-tight text-foreground mb-4">
        {title}
      </h3>
      <p className="text-muted-foreground text-[15px] leading-relaxed mb-8">{body}</p>
      <span className="inline-flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase text-copper">
        {ctaLabel}
        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}
