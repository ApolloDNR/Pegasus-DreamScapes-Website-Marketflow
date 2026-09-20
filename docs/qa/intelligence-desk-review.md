# Pegasus Intelligence Desk review

Reviewed September 20, 2026. Canonical repository: `ApolloDNR/Pegasus-DreamScapes-Website-Marketflow`; branch: `codex/launch-recovery-v2`; existing draft PR: [#26](https://github.com/ApolloDNR/Pegasus-DreamScapes-Website-Marketflow/pull/26). Implementation baseline: `1a34ef52ef03b44894da1ab50ada65a1f617af68`. The controlling scope is the [approved Work handoff](../superpowers/plans/2026-09-19-intelligence-desk.md).

## Delivered behavior

The actual public `/strategy-lab` mount now presents Strategy Lab with the Pegasus Intelligence Desk descriptor and five working views. Overview connects the entered basis, capital, scope and exit assumptions to the canonical funding model and nine ranked paths. Assumptions exposes financing, operating defaults and evidence provenance. Scenarios keeps Base, Conservative and Upside workspaces separate, supports explicit presets and resets, and shows supported sensitivity grids. Risk separates reported facts, unknowns, diligence and a planning-only timeline. Memo carries the current scenario into copy, print, the existing intake adapter and Peggy's editable composer.

The canonical calculation engine and eight calculators remain in place. Invalid inputs cannot produce an analysis. Missing scope, exit or rent suppresses affected economics, narratives and sensitivity outputs; undefined ratios are unavailable. The engine's inability to represent negative operating income is disclosed instead of showing a reassuring zero. Unsupported lane sensitivity and comparable property data remain unavailable. Example inputs are labeled synthetic, and no live market feed is claimed.

Validated migration accepts existing v2/v3 drafts alongside v4. Local saving reports failures honestly; a current-visit session copy preserves unsaved work through the intake round trip. Scenario differences expose every changed numeric input with units and defaults. Peggy receives a bounded current brief as an editable draft and still requires an explicit Send. No live submission, message or email was sent during review.

## Actual rendered evidence

These captures come from the final local production build with the clearly labeled illustrative example and unavailable-backend fixtures. They are screenshots of the implementation, not generated concepts or evidence of a new hosted deployment.

| Surface | Capture |
| --- | --- |
| Light desktop, 1440 px | [Overview](intelligence-desk/overview-desktop.png) |
| Light phone, 390 px | [Overview](intelligence-desk/overview-mobile.png) |
| Dark desktop, 1440 px | [Overview](intelligence-desk/overview-dark.png) |
| Scenario comparison and sensitivity | [Scenarios](intelligence-desk/scenarios-desktop.png) |

## Verification

Final-source verification passed before branch publication. All browser requests were restricted to local controlled fixtures.

| Check | Result |
| --- | --- |
| TypeScript | Pass |
| Unit and integration suite | 221 files and 2,526 tests passed on the final code |
| Client and server production build | Pass |
| Client bundle budgets | Pass; entry 48,152 B gzip, initial JavaScript 119,200 B gzip |
| Deployment-entry and serverless runtime contracts | Pass, including closed unavailable APIs and refusal of an unconfigured production backend |
| Full public rendered gate | 368/368 route/theme/viewport checks and 17/17 controlled interaction journeys passed |
| Desk view, theme and width matrix | 70/70 states passed: all five views, both themes, 320/360/390/430/768/1024/1440 px |
| Automated desk accessibility | No WCAG 2 A/AA or 2.1 AA axe violations in those 70 states |
| Reflow | No page overflow in the 70-state matrix; all five views also passed 200% text-size checks at 390 and 1440 px |
| Print | Actual rendered PDF retains property/scenario identity and removes the unrelated legacy investment-summary title |
| Diff hygiene | Pass |

Verification used Node 22.23.2 and npm 10.9.2. The ordinary `npm run build` wrapper encountered this environment's blocked tsx IPC socket. Running the same build entry with `node --import tsx script/build.ts` succeeded, followed by the unchanged bundle and serverless gates. Only the environment-injected `UNDICI-EHPA` warning was suppressed for the suite; assertions were retained. The managed browser could not reach localhost, so rendered checks used an isolated Chromium binary with the repository's existing local fixture harness. These substitutions do not establish hosted or physical-device verification.

## Fresh review and corrections

One fresh final reviewer inspected the complete implementation diff. All six Important and two Minor findings were fixed; the comparison and provenance findings were treated as material correctness issues. No review minors were deferred.

| Finding | Correction and evidence |
| --- | --- |
| Some public outputs bypassed missing-input and denominator guards | A typed presentation layer guards lane metrics, support narratives, memo and sensitivity without changing the canonical engine snapshot; focused regression tests pass. |
| Negative operating income became a reassuring zero through the engine clamp | Rental outputs are unavailable when expenses exceed collected rent, with an explicit explanation and calculator path; loss-case regression passes. |
| An invalid active scenario hid recovery controls | Scenario switch and reset remain available; rendered component regression passes. |
| The actual public Peggy mount ignored the brief | The bounded current brief reaches the real composer, including an existing conversation; the mounted integration test inspects only a locally intercepted request. |
| Printed identity disappeared and the old investment-summary heading returned | Scoped print rules restore the memo header and remove the legacy title; the actual PDF and rendered print checks pass. |
| Returning from intake discarded unsaved work | Validated session persistence restores the current workspace independently of the last explicit local save; remount regression passes. |
| Scenario comparison hid financing and operating overrides | Every changed numeric field appears with units and its effective default; comparison regression passes. |
| Migrated custom financing terms were labeled as defaults | Legacy non-default values are labeled visitor entered; migration/provenance regression passes. |

## Rulings

- Ruling: Use the fresh cloned canonical checkout as isolation and maintain the ledger directly. Bundled helper scripts lack executable permission; do not change skill files or create a competing feature branch. Cost if wrong: manual ledger maintenance.
- Ruling: Approved textual spec controls the generated concept. Preserve existing global navigation and fonts; correct the concept's invented inspector second path and marketing subtitle. Funding chart and metrics use canonical data only. Cost if wrong: visual differences from the concept, with no invented financial outputs.
- Ruling: Scope remains the first Intelligence Desk delivery. No sitewide visual rollout before owner feedback; the timeline remains planning-only, the comp feed unavailable, and unsupported lane sensitivities explicitly unavailable. Cost if wrong: these advanced capabilities need later implementation.
- Ruling: Live responses and hosted deployment were set aside by the reviewer because services are unavailable. They remain explicit delivery blockers, not passed gates. Production and broader site redesign remain out of scope; physical-device keyboard testing remains unverified despite emulation.

## Delivery limits and next step

Publication to the existing PR and existing protected Vercel preview is already authorized in `WEBSITE_EXECUTION_BRIEF.md`. Ordinary git push cannot authenticate in this workspace, so the connected GitHub API is used for an atomic update of the same branch, with the published tree compared against the verified local tree.

The exposed Vercel deployment action returns `Tool deploy_to_vercel not found`; no authenticated local Vercel CLI is available. A working deployment connection or authenticated CLI is required to publish this revision to the existing `pegasus-dreamscapes-preview` project. The earlier protected deployment does not contain this desk and must not be presented as the new result. GitHub CI and protected hosted inspection must be identified against the published source after delivery.

Live intake receipts, Peggy responses, authentication, HQ forwarding and email delivery remain unverified because the preview backend is unconfigured. Production launch and domain changes are outside this delivery. Obtain owner feedback on the working desk before extending its visual direction across the rest of the site.
