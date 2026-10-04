# Visitor story and route continuity — October 4, 2026

## Bounded direction

Refine the existing visitor journey without rebuilding the site or extending its business claims. Preserve all six Home sections, the cream/navy/copper identity, cinematic assets and film, ordinary direct inquiry paths, qualified role/financial statements, consent, and backend contracts.

The approved story is: recognize a relevant path, inspect the evidence, understand a useful question, then choose a voluntary next step. This is a design hypothesis, not a measurement of visitor emotion or conversion.

## Implemented

- The existing Home photograph preview now has three visitor-controlled chapters: kitchen/layout, living/connection, bath/scope. Original uncropped before/during/after photographs are paired with a visible change and a question to consider. There is no automatic carousel or new generated imagery.
- Chapter choice is a whitelisted query value. Selecting a chapter replaces the local history entry and sets the correct Home proof anchor. Refresh and a return from the case study restore the choice; local exploration does not create extra Back steps.
- Each onward link identifies its room and reaches the matching focusable case-study figure. A Home-story arrival has an explicit return to that chapter; ordinary case-study arrivals retain the existing Our Work return.
- Construction photographs consistently say “During construction” rather than claiming a documented pre-work condition.
- The existing three Home audience descriptions preview what the destination helps visitors understand. Owner/partner endings keep direct inquiry first and offer one relevant explore-first route. Buyer representation keeps its one existing form.
- The canonical intake Privacy Policy link opens in a clearly labeled new tab with `noopener noreferrer`. It preserves the current draft for policy reading only. Leaving or refreshing the form still clears its in-memory entries; storage, consent and submission semantics did not change.
- The stable shared Nelson record has its own cached JavaScript module. Existing entry and aggregate bundle limits remain unchanged.

## Verification

- TypeScript, the complete ordinary suite (3,218 passed / 165 database-dependent skips), production build, bundle budgets and serverless safety checks passed on the final product changes. The ordinary test stage does not replace the separately configured PostgreSQL integration stage.
- Entry: 196,753 raw / 61,397 gzip bytes, against unchanged 200,000 / 65,000 limits. Aggregate initial JavaScript: 447,617 raw / 133,936 gzip bytes, against 475,000 / 145,000 limits.
- Scoped rendered gate: **124/124 named checks**, nine configurations, **150 screenshots with settled full-document axe scans**, zero failures, overflow, writes or unexpected application-console errors. Eight configurations are 320, 390, 768 and 1440 pixels in light/dark with reduced motion; one is 390 light with normal motion. Two additional 1167×749 comparison captures are included in the screenshot count, not counted as additional scenarios.
- The gate covers chapter switching, exact room destinations, reload, stale-hash replacement, native Back/Forward, contextual return, keyboard focus, gallery next/Escape restoration, owner/partner intake continuity, the mounted buyer form, direct/exploration ending links, and policy-tab opener/draft behavior.
- Local client build digest remained `64c2a3b15d284dfb264308f3cc0a336cf8c918ea3d1a2cdd89dc677f0b2ed0ca` before and after the rendered run. CI must establish its own exact-source build digest.
- `scripts/check-visitor-story.mjs` is part of Launch Verification, with exact-head screenshot/results artifacts. It blocks non-GET and external requests and uses only local synthetic form values. Preview-disabled `/api/config/supabase`, `/api/auth/user` and `/api/site-content` 503s are recorded separately; unexpected errors remain failures.
- Normal-motion verification waits for actual finite entrance animations and native scroll settlement. No CSS injection, axe-rule suppression or synthetic focus/scroll replaces product behavior.
- Independent source review found no unresolved product-source defect. A light-theme harness assumption was corrected before final execution.

## Scenario evidence

Exactly **100 hypothetical desk scenarios** were reviewed: 40 owners, 30 buyer/seller visitors, and 30 partners. Readiness, concerns, entry points, accessibility/device context, and interrupted/repeat paths are explicit. The original baseline is immutable; a separate 100-entry candidate review records what is addressed, preserved, intentionally constrained, outside this bounded scope, or still needs real-user validation. These are not 100 participants, browser sessions, passing conversions, or measured emotions.

Seventeen current-preview manual desktop checks and 16 saved baseline screenshots are separate evidence from the 100 desk scenarios and from the new compiled-browser gate. Before/after images use the same 1167×749 viewport.

## Boundaries

No original photograph, project-role evidence, accounting figure, broker relationship, intake schema, backend integration, real AI message or external delivery contract changed. Buyer schema SHA-256 remains `910b4791ba3af7cd13068959617740abe53d94678927da4a0556c2dfbfa75722`.

Draft publication and exact-head CI/hosted verification remain separate release steps. This work does not establish production activation, live authentication or delivery, final owner aesthetic acceptance, legal/broker approval, comprehensive assistive-technology conformance, or real-user comprehension/conversion performance.
