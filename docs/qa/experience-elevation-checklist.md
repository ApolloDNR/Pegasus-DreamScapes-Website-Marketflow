# Experience elevation: implementation checklist

Owner: Apollo Duran. Approved September 27, 2026. Starting source: `fc37a613ee6439f4090149ccd407551a33c4e037`, existing branch `codex/launch-recovery-v2`, draft PR #26.

This is the active continuation checklist for the approved **Pegasus Experience Elevation Plan**. Keep stable IDs and record evidence before marking an item complete. Previous design passes remain historical evidence, not proof of this revision.

## Current continuation: Peggy page companion

Owner request: September 28, 2026, Los Angeles. Baseline `74bc58c6f634b7319bf020f088d10aa35116bbe7`. Same branch and draft PR #26. [Design specification and fidelity ledger](../design/peggy-page-guide.md).

| ID | Deliverable | Status / evidence |
| --- | --- | --- |
| G1 | Distinctive Peggy companion interface | Complete. Original Pegasus emblem, navy identity, cream reading surface, live location, section preview and Explain / Tour / Next step actions. |
| G2 | Current public page and section awareness | Complete. Bounded, inspectable snapshots; public-route allowlist; form/private/saved exclusion; no URL query data; explicit context-off control. |
| G3 | Local walkthrough and selected-passage explanations | Complete. Real page stops, previous/next/end, section emphasis, authored six-stop Home guide, reviewed questions and frozen source attachments. Nothing sends automatically. |
| G4 | Context-aware service and reliable existing chat | Complete in source. Bounded untrusted user-channel context, per-turn sources, no page facts in intake extraction. Existing access, stop/reset/save and prepared-property contracts retained. Live conversational acceptance remains E5b. |
| G5 | Verification, source publication and current report | Local verification complete. TypeScript, production build, bundle/runtime checks, 226 files / 2,571 tests, final focus checks, 64 guide states and 46 chat states. Exact publication and CI receipts are recorded on the existing PR and owner report. |

Browser review uses the production build in isolated Chromium because Cloud Browser returned `net::ERR_BLOCKED_BY_CLIENT` for the owned local preview. The 64-state guide matrix adds desktop/tablet/mobile light/dark context, tour, selection, source, Lab and route checks to the existing 46 Peggy states. It caught and repaired a mobile-menu inert-state race; the return-focus check also covers ending a tour before closing chat. No live AI or intake requests were sent. The current screenshots are actual application renders. E8c (protected preview delivery), E5b (real Peggy) and E9 (service, physical-device and participant acceptance) remain open.

Do not redo the completed brand/guide work when resuming delivery. Preserve the current guide controls and source boundaries. The existing protected preview still requires a verified current deployment before its URL can be described as up to date.

## Checklist

| ID | Deliverable | Status | Acceptance / evidence |
| --- | --- | --- | --- |
| E0 | Recover approved source, mounted components and current contracts | Complete | Clean clone of the exact PR head; required source/design/launch documents read |
| E1 | Reviewable owner context, editable working-property summary, intact Lab-to-inquiry continuity | Complete locally | No silent replacement of existing property; deliberate Apply, Edit, Clear and Undo; current-visit recovery distinct from local saving |
| E2 | Visual “What changes if…” preview | Complete locally | Canonical calculation; supported scope/value/rent; visible bounds; Base isolation; explicit scenario Apply and Undo; unavailable and negative results preserved |
| E3a | Coordinated explanatory planning/owner/empty-state illustrations | Complete locally | Preserve original imagery and Home structure; answer/action dominant; no fabricated property evidence |
| E3b | Documented Nelson photo inspection | Complete locally | Actual photograph/caption pairs; distinct viewpoints disclosed; keyboard and touch operable |
| E4 | Consistent motion and control states | Complete locally | Immediate response, focus stability, reduced motion, light/dark, mobile/reflow; no hidden essential content |
| E5a | Contextual Peggy actions and editable outgoing context | Complete locally | Explain result / identify missing information / prepare inquiry; selected scenario; no send on open; no unrelated-property history leak |
| E5b | Real Peggy conversational acceptance | External dependency | Requires the configured, authorized backend; synthetic frontend tests are not live acceptance |
| E6 | Attentive inquiry context and review | Complete locally | Supported facts/unknowns shown; edits propagate; retain form schema, consent, failure and receipt contracts |
| E7 | Consistent branded brief, Copy and Print | Complete locally | Situation, scenario, numbers, unknowns and next check agree; readable without print backgrounds; no automatic sharing |
| E8a | TypeScript, regression tests, build, bundle and rendered journey checks | Complete locally | Record exact commands, counts, failures and final source |
| E8b | Publish source to existing draft PR #26 | Complete (prior elevation phase) | Non-forced update and exact-source hosted CI |
| E8c | Update and inspect existing protected Vercel preview | External dependency | Last attempt: deployment action unavailable; verify actual new deployment/source before claiming delivery |
| E9 | Real service/device/user acceptance and production release | External dependency | Authorized intake/HQ/email receipts, authentication, physical phone keyboard, consenting task participants, owner/broker review; production/DNS remain outside this pass |

## Required report whenever work stops

1. What changed, with completed checklist IDs.
2. What was verified, on which source, and any unresolved failed checks.
3. What remains unfinished versus externally blocked.
4. Where the current source and checklist can be reviewed.
5. The exact first continuation task. Do not restart completed work or describe a source change as a deployed change.

## Working boundaries

Keep the six Home sections, approved headline, cream/navy/copper palette, Playfair/Inter, original logo/arrival/founder/Nelson photographs, nine Lab paths, eight calculators and current calculation engine. Preserve intake consent/receipt semantics, brokerage separation and private access. Current authorization covers this existing branch/PR and protected preview. No production, merge, DNS, indexability, real submissions or messages in this continuation.

## Checkpoint

Implemented E1, E2, E3a, E3b, E4, E5a, E6 and E7. TypeScript and all 223 files / 2,548 regression tests pass. The new owner-to-inquiry journey passes 48 screenshot/accessibility/reflow states at 320, 390, 768 and 1440px in both themes. It verifies Base isolation, deliberate Conservative application, matching brief/Peggy/intake numbers, no POST on review, Back/Forward recovery and documented photo inspection. `scripts/check-experience-elevation.mjs` preserves this synthetic walkthrough.

The broader gates also pass: all 17 rendered launch journeys and all 46 light-mobile public route checks. The final print-only refinement is verified: a three-page A4 synthetic brief has one complete summary page including its disclosure, followed by the full appendix. Actual Copy/PDF amounts agree and printing restores the prior appendix state. Source publication and exact-source hosted CI are recorded on PR #26 and in the owner report. The approved owner plan remains the user-facing checklist and stopping report. A source completion is not a deployment claim.

## Implementation and fidelity record

- **E1:** Property Owners keeps direct intake and adds Explore the numbers first. Lab reviews the selected situation before Use this situation, with Keep current workspace and Undo. Its working-property summary exposes Edit and Clear. Owner situation, city and a deliberately edited planning objective can carry with the selected scenario; no occupancy or condition is inferred from the situation.
- **E2:** Scope, exit value and rent previews use `analyzeDraft`, the same engine as the brief. Number and range controls expose units/bounds/reset. Base and preview bars share a zero origin and retain negative values; missing results are unavailable. Apply names the replaced alternative and preserves Undo. The existing funding bar now highlights the inspected cost while always retaining its carrying/exit-cost boundary.
- **E3a:** One native SVG schematic varies scope, access or site emphasis across Opportunity Plan, owner context and empty Lab. It is an illustrative diagram, not a property photo or quantitative chart. The planning answer and action remain dominant; the mobile question flow stays compact.
- **E3b:** Original Nelson kitchen, bath and living photographs gain optional numbered detail inspection with actual visible finish captions. Different viewpoints are disclosed. The original full-image viewer, arrow keys, focus return and source image bytes remain.
- **E4:** Controls share restrained 160ms response, keyboard focus and reduced-motion overrides. No calculation waits for animation. Both themes and all tested widths retain readable content without horizontal overflow. Physical keyboards and field performance remain E9.
- **E5a:** Three optional intents use the selected brief: explain, identify missing information and prepare an inquiry. An editable multiline message opens with no request. A fresh supplied context clears prior messages/credentials and ignores late responses. Service failure retains the outgoing draft. Live conversation quality and any future AI-proposed model edit remain E5b; current AI text does not apply model changes.
- **E6:** Intake shows the carried situation and model summary before sending, allows removal without clearing entered fields, and respects current form facts over the prior snapshot. Changing property facts removes stale result claims. Handoff state survives Back/Forward and is cleared after an actual accepted receipt. Existing contact consent, validation, retry and receipt requirements remain.
- **E7:** Screen and Copy include situation, objective, selected scenario, exact numbers, unknowns, next check and full appendix. Actual PDF generation is checked without backgrounds, including appendix restoration after print.

Before/after screenshots were inspected against exact parent `fc37a613ee6439f4090149ccd407551a33c4e037`. The original owner panel gains a secondary modeling route and a restrained property sketch below its primary action. Scenarios gains a labeled cause-and-effect preview above the unchanged comparison table. No new art direction, raster assets, framework or dependency is introduced. The six Home sections, approved headline, original logo/arrival/founder/Nelson assets, nine paths and eight calculators remain.

Observed QA defects were corrected: Peggy inherited low-contrast page ink on its navy panel; photo inspection needed explicit accessible labels; inquiry review edit buttons needed valid definition-list nesting; old Peggy tests assumed a single-line input. New assertions retain request, receipt and draft-recovery checks rather than weakening them. The print review also caught an orphaned disclosure page, addressed with print-only spacing.

## Continuation boundaries

The protected preview is still an external delivery dependency until an actual new deployment is observed and inspected. The prior readable READY deployment is `dpl_5TggSbkzuppQiNBfRHpUqsAVCGYn`, which does not represent this revision. Do not repeatedly retry a missing deployment action, bypass authentication or create another project.

After source verification, use the existing draft PR #26 and one authorized preview delivery attempt. Record exact commit/CI and deployment results on PR #26 and in the owner-facing report. Then complete configured Peggy/intake/HQ/email/authentication acceptance, physical-phone review and consenting owner/buyer/partner task observation. Production, merging, DNS and indexability require their own release decision.

## Final local verification

- TypeScript: pass. Regression suite: **223 files / 2,548 tests pass**.
- Production client/server build: pass via the documented Node 22 `--import tsx script/build.ts` equivalent. Client budgets: **399,615 bytes raw / 119,707 bytes gzip** initial JavaScript, within 475,000 / 145,000 limits. Compared with the exact parent, initial gzip grows by 236 bytes. All four deployment-entry runtime cases pass.
- New end-to-end journey: **48 states**, eight width/theme combinations, zero detected WCAG A/AA violations, horizontal overflow or JavaScript page errors; no POST requests. The final subsequent CSS change affects print only.
- Existing rendered launch gate: **17 journeys pass**, including navigation, theme, intake validation/failure/receipt fixtures, Lab, private-access boundaries, Peggy, consent, keyboard focus and 404 recovery. All **46 light-mobile public routes pass**.
- Final-build extras: matching copied brief and actual PDF without backgrounds; one-page summary plus two appendix pages; appendix state restored. At a synthetic 390 × 420px viewport, Peggy's editor and Send remain reachable and Escape works. At 390px with all computed text sizes doubled, What-if still updates correctly with no horizontal overflow. This is emulation, not physical-device acceptance.
- Source whitespace check: pass. No dependency, formula, image file, production or DNS change.

Local browser checks use the actual production build with explicit unavailable-backend or controlled test fixtures. They do not establish live Peggy/intake/HQ/email delivery, physical keyboard behavior, field INP or user comprehension.

### Bounded timing observations

One unthrottled headless session per revision, local HTTP and blocked external traffic, is useful only as a coarse lab observation. Five programmatic React edits were timed through two animation frames. Parent median: 19.6ms; current median: 24.1ms (current range 12.0–38.6ms). Cold DOM/FCP: parent 250.6/644ms, current 244.6/636ms. Cached repeat DOM/FCP: parent 466.5/1428ms, current 234.9/760ms. This small, noisy sample supports no speed-improvement claim and is not field INP. Production field measurement and physical-device task review remain E9.

## September 29: Peggy brand and interaction refinement

Requested after owner visual review: keep the accepted direction, clean up the experience, strengthen Pegasus recognition, and modernize Peggy. Baseline: `a5ab85d25fc54249b4cbd1bc0c28ee9a03f3cf8c`. Existing approval still covers this branch and draft PR #26.

| ID | Deliverable | Status | Acceptance |
| --- | --- | --- | --- |
| P1 | Recognizable Peggy by Pegasus | Complete | Official mark, named launcher, paper/navy/copper, clear AI identity, no simulated live status |
| P2 | Cleaner, guided conversation | Complete | Progressive starting points, editable prompt selection, prepared-context review, full-width composer |
| P3 | Reliable controls and recovery | Complete | Save latest into same device copy, explicit fresh chat, stop waiting, no late-reply crossover, editable failed drafts |
| P4 | Current-source verification and publication | Verified locally; exact-source CI tracked on PR | TypeScript, regression/build/bundle gates, desktop/mobile/two-theme rendered checks, same PR |
| P5 | Updated visual evidence and owner report | Captured locally; owner report updated after publication | Current screenshots, exact source, completed/pending checklist; no deployment or live-AI claim without proof |

E5b, E8c and E9 remain the separate live-service, protected-hosting and real-device/user acceptance dependencies. This pass does not reset completed E items.

### Peggy refinement evidence

- The full suite passes 224 files / 2,555 tests. Seven new behavioral tests cover reviewed prompt selection, same-copy Save latest, confirmed fresh chat, aborted requests and late responses, empty-response recovery, and deliberate keyboard send. Focused tests were rerun after the final interaction fix.
- TypeScript, production build, initial bundle budget and fail-closed serverless runtime checks pass. Initial JavaScript is 404,399 bytes raw / 120,972 bytes gzip (budget 475,000 / 145,000). No dependency or brand asset changed.
- `scripts/check-peggy-experience.mjs` captures 46 states at 320, 390, 768 and 1440px in both themes, with short-screen and cookie-notice checks. Requests use isolated synthetic fixtures; there is no live AI or intake submission. Every state checks overflow, visible close/composer/privacy text, and WCAG A/AA rules through axe. This regression now runs in the existing PR build job and uploads source-labelled screenshots.
- The existing owner → Lab → Peggy → inquiry → photo journey passes 48 states. Its draft assertion now waits for React to present the prepared context rather than reading the input before the update.
- Rendered checks caught a real Stop waiting button-reuse bug: the stop click could inherit the replacement button’s submit behavior. Distinct button keys and preventing its default action ensure stopping never submits the restored draft. The browser regression asserts that request count stays unchanged.
- Small-screen refinement keeps the send disclosure fully inside the panel above an open cookie notice. At constrained heights, the decorative opening and secondary status strip yield space to the editor. Long-form capability details remain available under About Peggy.

### Fidelity ledger

1. Preserved the official emblem, Playfair/Inter and approved paper/navy/copper palette; replaced the former tiny hover-only launcher with a named Peggy by Pegasus control.
2. Replaced the dense navy paragraph with a navy brand header and a calm paper conversation body. Dark appearance uses the existing theme tokens.
3. Starting choices use the site’s ruled editorial rows; secondary paths and explanatory details expand on request. All original route handlers remain.
4. Prepared property context remains editable and unsent until Send. Selected question suggestions now follow that same review-first behavior.
5. Conversation rows distinguish visitor messages, actual pending requests, replies and connection notices. Error notices are excluded from saved/handoff transcripts.
6. Retained explicit AI identity, visible send/storage disclosure, early-access status, page-memory credentials and human-review limitations. No new live-service or voice capability is claimed.
7. Current screenshots are from the built application. The approved older screenshot was used as the baseline; no image-generation redesign was needed for this focused refinement.

Local rendering used the existing Playwright-based project workflow because Cloud Browser returned `net::ERR_BLOCKED_BY_CLIENT` for the local preview. Chromium was installed in an isolated QA workspace; no package/lockfile or application dependency changed. The host-injected Undici warning affected one strict stderr fixture on the first full run; `NODE_NO_WARNINGS=1` removed that host warning and the complete suite passed. No product test was skipped or weakened.

The current source and final CI outcome are recorded in PR #26 and the owner’s persistent checklist. E5b, E8c and E9 remain open.

Published-source CI run 426 passed the product build, full regression suite, new 46-state Peggy gate and the public route checks. One older core journey attempted to click Submit a Property while its new shortcut group was collapsed. The QA-only follow-up explicitly expands “Go straight to a tool or path” before the existing route assertion. It does not force-click, skip the action, relax the assertion or alter application code. The final source and replacement CI run are recorded on PR #26 and in the owner report.

## September 29: coherent guided website journey

Owner direction: extend Peggy's interactive, guided feel throughout the public experience and give her a personal mark. This reopens the design scope while preserving the approved company identity, public facts, six Home sections, original photos, nine Lab paths, eight calculators and transaction boundaries. Baseline `90144c07e2aee7df189558ee9d1104f021e95593`; same draft PR #26.

| ID | Outcome | Source status |
| --- | --- | --- |
| J1 | Winged-P personal mark across Peggy launcher, panel, tour and guidance entries | Complete |
| J2 | Public-page section index, outline and contextual Ask, with keyboard focus and measured header clearance | Complete |
| J3 | Shared tour invitations, contextual explanation, unsent-draft preservation and pending-response isolation | Complete |
| J4 | Route-specific onward links and optional review-before-submit explanation | Complete |
| J5 | Three-task Tools finder with all eight actual calculators and existing saved-work/review paths | Complete |
| J6 | Consistent public actions, typography, responsive rules, reduced motion and authored tour summaries | Complete |
| J7 | Unit/build/browser evidence, exact-source CI, PR publication and owner checklist | Local verification complete; publication outcome is recorded on PR #26 and the persistent owner report |

Local regression suite: 227 files / 2,579 tests. TypeScript, production build, budget and serverless-runtime cases pass. New rendered gate covers 64 normal width/theme states and adds two phone enlarged-text states. Prior guide/chat suites pass 64/46 states with intercepted response fixtures. The final focus and measured-header change additionally passes focused regressions; hosted CI executes the final full source. Initial JS is 427,086 B raw / 127,919 B gzip, within 475,000 / 145,000 limits. The new journey gate is part of the existing rendered-build CI job.

See `journey-refinement-design.md` for concepts, copy inventory, design tokens, fidelity ledger, intentional adaptations and prioritized next ideas. No new live AI or actual inquiry was sent. E5b configured Peggy, E8c exact-source protected hosting and E9 live receipts / physical device / participant acceptance remain open.


## September 29: playful and serious, with purposeful allegory

The owner requested another refinement while retaining the existing feel. A1–A4 are complete: three engraved audience thresholds with local focus/hover paths; Peggy's personal seal and open context note; a real navigable tour trail; shared compass/route continuation. The existing three direct destinations, six Home sections, copy, photographs and all application contracts remain.

A5 local verification passes: 227 files / 2,583 tests, TypeScript, production build, bundle budget, four runtime cases, 90 final journey states, and the existing 64 guide / 46 chat checks. Final narrow-screen type was checked again through the 90-state gate; exact-source CI repeats every suite. Design system, intentional adaptations and comparison ledger: `allegorical-refinement-design.md`. Source publication, CI and the protected-preview result are recorded on PR #26 and the owner report. E5b, E8c and E9 remain separate acceptance work.
