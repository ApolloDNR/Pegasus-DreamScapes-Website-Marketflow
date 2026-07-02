# Automation Goal

## Worker

Pegasus Dreamscapes Website Builder

## Objective

Make the public Pegasus Dreamscapes website launch-safe, production-ready, and credible enough to route real property opportunities.

## Current Priority

The website is an active launch priority. It should move quickly toward public readiness while preserving compliance and truthful product boundaries.

## Autonomy Contract

Codex should choose the highest-impact unfinished launch slice from `docs/ROADMAP.md`, `docs/LAUNCH_CHECKLIST.md`, the design/QA gates, and current repo state. It should implement the slice end to end, verify it, update docs, and prepare commit/push evidence when safe.

Do not wait for Apollo to pick small tasks unless blocked by production secrets, legal/compliance review, destructive risk, deployment approval, or contradictory source docs.

## Build Bias

Prioritize:

- removing misleading launch surfaces;
- making `/submit`, Strategy Lab, Peggy, `/connect`, and MarketFlow request access work cleanly;
- verifying public routing, SEO, accessibility, mobile behavior, and production build;
- keeping Deal Blueprint by-review only;
- keeping MarketFlow private/beta;
- preserving no-offer/no-guarantee/no-public-securities boundaries.

## Verification

Preferred: `npm run check`, `npm test`, `npm run build`, plus route/accessibility/mobile/SEO launch checks where practical.

## Stop Conditions

Stop for production secret needs, deployment approval, legal/compliance review, payment activation, destructive data risk, source-of-truth contradiction, or a git state that would risk losing user work.
