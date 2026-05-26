// Empire Doctrine Amendment 2 §G — status badges are a required design
// element. Every public mention of an ecosystem product (HQ, BuildForge,
// CapStack, MarketFlow, Peggy, Buyboxes) must carry a badge from this
// locked vocabulary. No exceptions.

export type StatusBadgeKind =
  | "live"
  | "private-beta"
  | "private-training"
  | "internal"
  | "in-development";

const STYLES: Record<StatusBadgeKind, { label: string; className: string }> = {
  live: {
    label: "Live",
    className: "bg-[hsl(var(--copper))] text-white",
  },
  "private-beta": {
    label: "Private beta — invite only",
    className: "bg-[hsl(var(--navy))] text-cream",
  },
  "private-training": {
    label: "In private training",
    className: "bg-[hsl(var(--cream))] text-[hsl(var(--navy))]",
  },
  internal: {
    label: "Internal, not a public surface yet",
    className: "bg-[hsl(var(--charcoal))] text-cream",
  },
  "in-development": {
    label: "In development",
    className: "border border-[hsl(var(--ink)/0.4)] text-[hsl(var(--ink))]",
  },
};

export function StatusBadge({
  kind,
  className = "",
}: {
  kind: StatusBadgeKind;
  className?: string;
}) {
  const s = STYLES[kind];
  return (
    <span
      className={`inline-flex items-center text-[10px] uppercase tracking-[0.18em] font-supporting font-semibold px-2.5 py-1 rounded-sm ${s.className} ${className}`}
      data-testid={`status-badge-${kind}`}
    >
      {s.label}
    </span>
  );
}
