# Pegasus DreamScapes Anti-Slop Visual Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the public website back into exact alignment with the approved Final Design Lock while preserving all proven backend, compliance, and routing behavior.

**Architecture:** Treat `docs/design/final-design-lock.md` as visual authority and `docs/superpowers/specs/2026-08-16-anti-slop-visual-correction-design.md` as the correction spec. Work on `codex/launch-recovery-v2` only. Make route-by-route visual corrections with focused regression tests after each slice, then run the complete launch verification and produce a fresh protected preview for owner review.

**Tech Stack:** React, TypeScript, Wouter, Tailwind, Framer Motion, Vite, Vitest, Playwright/rendered launch checks, Vercel protected preview.

## Global Constraints

- Do not change business model, backend contracts, compliance boundaries, production, DNS, live data, or public securities posture.
- Final Design Lock supersedes older visual guidance where they conflict.
- Preserve the canonical homepage arrival image and locked copy/navigation exactly.
- No decorative gradient blobs/orbs, generic SaaS patterns, fake metrics, fake testimonials, fake inventory, glassmorphism, or card-inside-card layouts.
- Playfair Display for marketing display type, Inter for body/UI, Cinzel only as a rare architectural accent.
- Copper is punctuation, not a fill color everywhere.
- One signature interaction per page maximum.
- Every task must preserve keyboard accessibility, reduced-motion behavior, and existing route contracts.
- Every completed visual slice requires focused tests plus build/typecheck evidence before the next slice.

---

### Task 1: Restore Homepage Arrival and Public Header

**Files:**
- Modify: `client/src/pages/home.tsx`
- Modify: `client/src/components/hero-picture.tsx`
- Modify: `client/src/components/navigation.tsx`
- Modify: `client/src/config/navigation.ts`
- Test: existing navigation, CTA, public-route, accessibility, and homepage tests

**Interfaces:**
- Consumes: Final Design Lock homepage arrival, CTA, and navigation requirements.
- Produces: canonical hero/header surface used by all later visual QA.

- [ ] Add/update tests asserting the locked primary nav order, sole header CTA, MarketFlow absence from primary nav, locked homepage eyebrow/headline/action labels, and canonical arrival asset.
- [ ] Run the focused tests and confirm they fail against the current drifted implementation.
- [ ] Replace generic luxury-home hero usage with `/images/hero/pegasus-v6-arrival.webp`, preserving one source image across breakpoints/themes.
- [ ] Restore locked eyebrow, `Complex real estate,` / `made executable.` headline, and CTA order: `Bring an Opportunity`, `See How We Operate`, `Open Strategy Lab`.
- [ ] Remove decorative animated blur orbs, gratuitous hero glow layers, duplicate philosophical/product lines, and competing hero actions.
- [ ] Restore primary nav: `How We Operate`, `Property Owners`, `Deal Partners`, `Our Work`, `About`; make `Bring an Opportunity` the sole primary header CTA; keep Strategy Lab subordinate and MarketFlow out of first-level navigation.
- [ ] Preserve mobile menu parity, focus states, active states, and route behavior.
- [ ] Run focused tests, typecheck, and production build.
- [ ] Commit the slice.

### Task 2: Remove Homepage Template Fatigue

**Files:**
- Modify: `client/src/pages/home.tsx`
- Modify only shared style primitives needed by homepage rhythm
- Test: homepage render/CTA/a11y tests

**Interfaces:**
- Consumes: Task 1 arrival/header.
- Produces: editorial homepage composition with reduced synthetic repetition.

- [ ] Add regression assertions for proof-rail order, key CTA routing, Nelson evidence, and banned decorative patterns.
- [ ] Replace repeated numbered `SectionOpener` treatment where it creates template repetition; retain only sparse architectural labels.
- [ ] Convert visitor routing from four equal SaaS-style feature cards into a more open editorial rail/split while preserving all four paths.
- [ ] Keep Nelson Drive as the principal real-property evidence moment; simplify its facts and remove unnecessary pill-like treatment.
- [ ] Keep one operating-method signature visual rather than stacking multiple diagrams and product-taxonomy blocks.
- [ ] Simplify capabilities to an editorial index/list with fewer icons, borders, badges, and uppercase labels.
- [ ] Tighten founder section to verified biography, portrait, license/KW signals, and one strong quotation or operating statement.
- [ ] Make final invitation minimal with one dominant CTA and clear subordinate paths.
- [ ] Cut marketing-page all-caps microcopy and decorative icon containers materially without removing meaning.
- [ ] Run focused tests, typecheck, production build, and rendered homepage checks.
- [ ] Commit the slice.

### Task 3: De-Clutter Strategy Lab Without Changing Engine Behavior

**Files:**
- Modify: `client/src/pages/strategy-lab.tsx`
- Modify strategy-lab presentation components only where necessary
- Test: Strategy Lab engine, account wall, CTA routing, keyboard accessibility, rendered checks

**Interfaces:**
- Consumes: existing Strategy Lab engine and three-zone cockpit.
- Produces: a professional underwriting workstation with less explanatory/demo chrome.

- [ ] Add/adjust tests proving engine inputs, live verdict updates, free-run gate, Save/Share/PDF/Submit gating, and mode switching remain unchanged.
- [ ] Keep concise cockpit hero, one clear disclosure, and one primary entry action.
- [ ] Remove one of the two redundant onboarding/ribbon systems so the user reaches real inputs faster.
- [ ] Preserve exactly one view switcher: Cockpit / Assumption Desk / Calculators.
- [ ] Reduce ornamental etching/status/dashboard simulation where it competes with actual property data.
- [ ] Prioritize property facts, economics, lane fit, risk, memo, and next move.
- [ ] Keep functional UI predominantly Inter; reserve display serif for key verdict/section moments.
- [ ] Verify 1440px and 390px layouts remain usable with no overflow or hidden primary controls.
- [ ] Run focused tests, typecheck, production build, and rendered Strategy Lab journeys.
- [ ] Commit the slice.

### Task 4: Refine Work With Apollo and Role Clarity

**Files:**
- Modify the Work With Apollo page and directly shared presentation components only
- Test: public route, CTA routing, disclosures, accessibility

**Interfaces:**
- Consumes: existing KW/DRE role-separation rules.
- Produces: a credible licensed-representation path distinct from Pegasus operating-company activity.

- [ ] Assert seller/buyer paths, DRE number, Keller Williams separation, and high-intent disclosure placement.
- [ ] Remove generic personal-brand funnel styling and excessive badges/cards.
- [ ] Present Apollo with verified operator/real-estate context, restrained portrait treatment, and straightforward seller/buyer choices.
- [ ] Keep Pegasus company work visually distinct from brokerage representation.
- [ ] Run focused tests, typecheck, build, and rendered checks.
- [ ] Commit the slice.

### Task 5: Reframe MarketFlow as a Controlled Private Pilot

**Files:**
- Modify MarketFlow landing/access/deal-index presentation surfaces only
- Preserve authorization/data behavior
- Test: MarketFlow gating/privacy/access tests plus rendered checks

**Interfaces:**
- Consumes: existing reviewed-access authorization rules.
- Produces: private-pilot operational tool presentation rather than public marketplace/SaaS styling.

- [ ] Add/adjust tests for private-pilot labels, access request path, and no regression in authorization boundaries.
- [ ] Remove public-marketplace visual cues, fake activity/metric chrome, and decorative dashboard filler.
- [ ] Emphasize reviewed access, real deal/buy-box information, and functional status only.
- [ ] Keep Pegasus brand continuity rather than presenting MarketFlow as an unrelated startup product.
- [ ] Verify unauthenticated, unapproved, approved, empty, loading, and error states remain truthful.
- [ ] Run focused tests, typecheck, build, and rendered MarketFlow journeys.
- [ ] Commit the slice.

### Task 6: Polish Submit, Forms, and Feedback States

**Files:**
- Modify property/intake forms and shared form presentation components as needed
- Test: validation, CTA routing, success/error/loading, keyboard accessibility

**Interfaces:**
- Consumes: existing intake contracts and compliance language.
- Produces: premium, clear, trustworthy high-intent forms.

- [ ] Keep forms visually quiet: strong labels, generous spacing, minimal borders, no gratuitous cards.
- [ ] Verify role/property/pressure/goal capture stays complete.
- [ ] Make validation, loading, success, and failure states explicit and human-sounding.
- [ ] Keep compliance near high-intent actions without dominating the page.
- [ ] Run focused tests, typecheck, build, and form interaction journeys.
- [ ] Commit the slice.

### Task 7: Full Visual and Release Verification

**Files:**
- Update: `HANDOFF.md`
- Update: launch/QA status documentation as required
- No production configuration changes

**Interfaces:**
- Consumes: Tasks 1–6 exact branch head.
- Produces: immutable owner-review candidate.

- [ ] Run production dependency audit and resolve only safe non-breaking issues; never weaken the gate.
- [ ] Run complete exact-head launch workflow: environment contract, TypeScript, production build, rendered accessibility, full test suite, bundle limits, security checks.
- [ ] Capture desktop 1440px, tablet 768/1024px, and mobile 390px evidence for Home, Strategy Lab, Work With Apollo, MarketFlow, Submit, and mobile navigation.
- [ ] Check page identity, blank/error overlays, console health, broken images, horizontal overflow, focus states, primary interaction, reduced motion, loading/error/empty states.
- [ ] Apply the squint test and swap test from the correction spec; fix any remaining agency-signoff visual issue before handoff.
- [ ] Produce a fresh protected, noindex, non-production preview from the exact verified commit.
- [ ] Update handoff with exact commit, tests, preview ID, remaining staging/backend gates, and owner-review status.
- [ ] Do not merge to `main`, deploy production, change DNS, or mutate live data without a separate explicit owner approval.

## Self-Review

- Spec coverage: homepage/header, section rhythm, Strategy Lab, Work With Apollo, MarketFlow, forms, responsive QA, and release verification are all represented.
- Placeholder scan: no TBD/TODO/future filler requirements.
- Scope: visual correction only; no backend rewrite or business expansion.
- Acceptance: owner visual approval remains mandatory even after automated gates pass.
