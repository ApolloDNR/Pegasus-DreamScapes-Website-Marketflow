# Pegasus DreamScapes — Design Tokens (Wave 2 / Empire Doctrine v1.0.1)

This document captures the small, opinionated set of layout tokens the
public site is allowed to use. The goal is to keep the surface feeling
designed rather than assembled. Color and typography tokens live in
`client/src/index.css` and `replit.md` — this file is **layout only**.

## Radius

| Token        | Value | Use                                                     |
|--------------|-------|---------------------------------------------------------|
| `rounded-sm` | 2px   | CTAs, pills, kicker badges.                             |
| `rounded-md` | 6px   | Default card / panel radius (`CardSurface`).            |
| `rounded-lg` | 8px   | Elevated card / hero modules (`CardElevated`).          |
| `rounded-full` | 9999px | Avatars, circular indicators only.                    |

**Banned in public-page JSX:** `rounded-xl`, `rounded-2xl`, `rounded-3xl`.
They drift over time and read as cartoonish next to Cormorant Garamond.
Internal admin / dealflow / marketflow-role surfaces are out of scope.

## Shadow

| Token        | Use                                                        |
|--------------|------------------------------------------------------------|
| (none)       | Default. The 1px hairline border carries most of the work. |
| `shadow-sm`  | Sticky headers / floating utility chips.                   |
| `shadow-md`  | Hover lift on interactive cards.                           |
| `CardElevated`'s `shadow-[0_4px_24px_-8px_hsl(var(--navy)/0.18)]` | Signature elevated cards. Use sparingly. |

**Banned in public-page JSX:** `shadow-xl`, `shadow-2xl`. They produce
the "demo template" look the Foundation Reset is trying to leave behind.

## Card primitives

The two and only two card shapes for the public surface live in
`client/src/components/ui/card-primitives.tsx`:

- **`CardSurface`** — 1px hairline border, `rounded-md`, no shadow. Use
  for content blocks, list items, and quiet panels on the cream surface.
- **`CardElevated`** — `rounded-lg`, soft navy-tinted shadow, 1px border.
  Use for callouts that need to lift off the page. Do not stack more than
  one elevated card per section.

Hand-rolling `<div className="rounded-2xl shadow-xl …">` on a public page
is a regression. Use the primitive, extend it via `className`.

## Sweep checklist (Wave 2)

When adding or editing a public-surface page:

1. No `rounded-xl` / `rounded-2xl` / `rounded-3xl` in your JSX.
2. No `shadow-xl` / `shadow-2xl` in your JSX.
3. Card-shaped containers use `CardSurface` or `CardElevated`.
4. Brand name renders as `Pegasus DreamScapes` (capital P, D, S). No CSS
   `text-transform: uppercase` on an element whose source text contains
   the brand in mixed case — uppercase display caps must already be
   uppercase in the source (e.g. the wordmark SVGs).
