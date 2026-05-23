import { cn } from "@/lib/utils";

/**
 * Empire Doctrine v1.0.1 — shared skeleton primitives.
 *
 * Three building blocks used across public pages so loading states match the
 * final layout shape instead of a generic spinner. Animation is the standard
 * Tailwind `animate-pulse`; color is a low-contrast `bg-muted` so the
 * placeholder reads as "loading" rather than "broken content".
 */

export function SkeletonLine({
  className,
  width = "100%",
}: {
  className?: string;
  width?: string | number;
}) {
  return (
    <div
      aria-hidden="true"
      style={{ width }}
      className={cn("h-3.5 rounded-sm bg-muted animate-pulse", className)}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className={cn("space-y-2", className)}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          width={i === lines - 1 ? "65%" : "100%"}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({
  className,
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div
      role="status"
      aria-label="Loading card"
      className={cn(
        "rounded-lg border border-border bg-card/60 p-5 space-y-4",
        className,
      )}
    >
      <SkeletonLine width="40%" className="h-3" />
      <SkeletonLine width="80%" className="h-5" />
      <SkeletonText lines={lines} />
    </div>
  );
}

export function SkeletonHero({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading hero"
      className={cn(
        "rounded-lg border border-border bg-card/40 p-8 lg:p-12 space-y-5",
        className,
      )}
    >
      <SkeletonLine width="30%" className="h-3" />
      <SkeletonLine width="85%" className="h-9" />
      <SkeletonLine width="70%" className="h-9" />
      <div className="pt-4 space-y-2">
        <SkeletonLine width="95%" />
        <SkeletonLine width="80%" />
      </div>
      <div className="pt-6 flex gap-3">
        <div aria-hidden="true" className="h-11 w-40 rounded-sm bg-muted animate-pulse" />
        <div aria-hidden="true" className="h-11 w-32 rounded-sm bg-muted animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonGrid({
  count = 3,
  columns = 3,
  className,
}: {
  count?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const cols =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <div className={cn("grid grid-cols-1 gap-5", cols, className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
