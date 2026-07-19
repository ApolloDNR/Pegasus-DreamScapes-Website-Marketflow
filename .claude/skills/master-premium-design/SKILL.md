---
name: master-premium-design
description: Master operating system for award-caliber web design work — researched Awwwards-jury standards fused with a verified build-and-audit loop and this owner's brand system (Pegasus Dreamscapes). Use whenever polishing, elevating, redesigning, or auditing a website or app surface for premium, luxury, editorial, cinematic, or award-winning quality; whenever the owner says "enhance", "polish", "keep enchanting", "make it premium/award-winning"; or before shipping any visual change to a brand surface. Extends premium-web-design (read that too when doing a ground-up redesign); this skill adds the jury-grade scoring gate, the verification harness, and the project-specific system.
---

# Master Premium Design

Operating system for producing work that would survive a design jury, not
just a glance. Built from researched award criteria (see
`references/award-standard.md`), the house build workflow of the
`premium-web-design` skill (read it for ground-up redesigns), and the
owner's own governance (Pegasus Blueprint v5.1 §32.17). One rule governs
everything, from the blueprint itself:

> A visual effect that reduces clarity, usability, performance, or trust
> is not premium.

## The loop

Every polish or design pass runs this exact loop. No step is optional;
the discipline IS the quality.

1. **Audit before touching.** Screenshot the current state (use
   `scripts/verify.js` — retina, light+dark, desktop+mobile). Score it
   against the fused rubric below. Write down the 2-3 lowest-scoring
   items. Those, and only those, are this pass's scope.
2. **Design against the standard.** For each item, decide the move using
   `references/award-standard.md` (what juries reward) filtered through
   the brand system (`references/pegasus-system.md` for Pegasus work).
   Prefer the move that adds craft to what exists over the move that
   adds a new element. One signature moment per page, total.
3. **Build with locked constraints.** Copy is locked (banned-phrase test,
   compliance strings). Structure is locked (governance tests). Motion
   is transform/opacity only, tokenized easing, reduced-motion guarded.
   Real content only, never placeholder.
4. **Verify like a jury.** tsc → full test suite → production build →
   `scripts/verify.js` captures → look at every image yourself at
   retina scale → `scripts/axe-sweep.js` (zero violations) →
   `scripts/perf-probe.js` (budgets below). Fix and re-verify until
   clean. Only then push and show the owner.
5. **Deliver proof, not claims.** Send the owner the retina captures of
   what changed. One line on what moved and why it scores higher.

## The fused rubric

Score every major surface 1-10 on each. Anything under 8 is this pass's
work queue. Jury weights in parentheses (Awwwards: design 40, usability
30, creativity 20, content 10; honorable mention needs ≥6.5 overall,
site-of-the-day is reserved for the top slots).

- **Design / Craft (40%)** — deliberate typography (scale contrast,
  optical details, tabular figures on data), intentional color with one
  confident accent, micro-details (hover, focus, borders, 1px work),
  consistent system across every page. Squint test: hierarchy survives
  a blur. Swap test: the design could belong to no other brand.
- **Usability (30%)** — navigation obvious, mobile designed not adapted,
  keyboard focus visible, WCAG AA contrast everywhere, error and empty
  states written with care. Nothing requires explanation.
- **Creativity / Originality (20%)** — one signature moment per page
  that expresses THIS brand specifically (Pegasus: the painted-light
  colonnade, the Opportunity ring). Custom-built, never template-shaped.
  Motion as choreography with emotional pacing, not decoration.
- **Content / Trust (10% jury, 100% business)** — real photography, real
  numbers, honest framing, compliance strings intact. For Pegasus this
  dimension is non-negotiable regardless of jury weight: §11-safe
  numbers, licensed-representation wording, no AI imagery as proof.
- **Performance (a usability multiplier)** — budgets: LCP < 1.5s,
  CLS < 0.05, INP < 100ms, animations 60fps (transform/opacity only),
  fonts self-hosted and subset, hero paints fast. Jank reads as cheap
  instantly; performance is a design material.
- **Clarity (the veto)** — from the blueprint: can a first-time visitor
  say what the page is for in five seconds? Any effect that costs
  clarity is cut, no matter how beautiful.

## What juries actually reward (distilled)

Dark surfaces win as "luminous, not just dark": rich near-black fields,
warm luminous accents, light modeled as if from a source — gradients
behaving as light and atmosphere, never as flat decoration. Heritage
subjects win when reimagined through a contemporary lens (classical
architecture drawn in code beats stock photography of it). Texture —
grain, imperfection, editorial asymmetry — signals human craft against
AI gloss. Scroll is narrative: content revealed with intent and pacing.
Typography performs: enormous, confident display type; kinetic only
where meaning is added. And every winner has exactly ONE moment you
remember. Full catalog with execution notes:
`references/award-standard.md`.

## Motion doctrine (choreography, not decoration)

- Tokens: `--ease-smooth: cubic-bezier(.16,1,.3,1)`; durations 180ms
  (micro) / 360ms (element) / 640-1100ms (orchestrated sequence).
- ONE orchestrated sequence per page (usually the hero entrance:
  eyebrow → headline → lead → CTA → art, staggered 60-160ms apart).
  Everything else is micro-interaction on the shared tokens.
- Existing reveal system (IntersectionObserver `.reveal`) handles
  scroll entrances — do not add a second system.
- Every animation: transform/opacity only, `prefers-reduced-motion`
  collapses it to instant-visible, and it must never delay content
  legibility beyond ~1s.

## Verification harness (in `scripts/`)

- `verify.js <build-dir> [routes...]` — in-process static server + retina
  Playwright captures: 1440@2x light+dark, 390@2x dark, per-route.
- `axe-sweep.js <build-dir> [routes...]` — WCAG 2.2 AA sweep, exits
  non-zero on violations.
- `perf-probe.js <build-dir> [route]` — measures LCP and CLS on the
  production build via PerformanceObserver; compare to budgets.

Chromium: `/opt/pw-browsers/chromium`, playwright-core at
`/root/node_modules/playwright-core`, args `--no-sandbox
--disable-dev-shm-usage`. Server and capture stay in ONE process.

## Non-negotiables carried from the project

Owner decisions that outrank any aesthetic instinct: numbers framing
(never "profit"; the locked stack), address privacy (no house numbers
anywhere, including inside photos), compliance strings verbatim (see
docs/launch/BROKER_REVIEW_PACKET.md), banned-phrase list in the test
suite, license on the founder Person only in JSON-LD, Peggy always
disclosed as AI. The full brand system, tokens, and technique recipes:
`references/pegasus-system.md`.
