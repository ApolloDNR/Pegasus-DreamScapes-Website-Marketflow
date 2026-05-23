import * as React from "react";
import { cn } from "@/lib/utils";

// Empire Doctrine v1.0.1 — Wave 2 (Unify the Brand System).
//
// Two shared card primitives for the public surface. Use these instead of
// hand-rolling rounded-2xl / rounded-3xl / shadow-2xl containers so future
// pages don't drift again. See `docs/design/tokens.md` for the radius and
// shadow rules.
//
//   CardSurface  — subtle, 1px border, `rounded-md`, no shadow.
//                  Use for read panels, content blocks, list items, and
//                  anything that sits on the cream surface and just needs
//                  a quiet bounded region.
//
//   CardElevated — `rounded-lg` + soft navy-tinted shadow.
//                  Use sparingly for callouts that need to lift off the
//                  page (featured CTAs, hero modules, signature cards).
//                  Do not stack more than one elevated card per section.

const CardSurface = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-md border border-[hsl(var(--rule))] bg-card text-card-foreground",
      className
    )}
    {...props}
  />
));
CardSurface.displayName = "CardSurface";

const CardElevated = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-[hsl(var(--rule))] bg-card text-card-foreground shadow-[0_4px_24px_-8px_hsl(var(--navy)/0.18)]",
      className
    )}
    {...props}
  />
));
CardElevated.displayName = "CardElevated";

export { CardSurface, CardElevated };
