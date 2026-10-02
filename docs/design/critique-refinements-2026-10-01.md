# Review refinements, October 1, 2026

Apollo approved applying the six observations in the saved design critique. This is a bounded refinement of the September 30 cinematic revision, based on `c8126a76a7e940f568dba608a82b126bfce83684` on `codex/launch-recovery-v2`.

## Deliberate changes

| Surface | Change and visual comparison |
| --- | --- |
| Primary action | “Start a conversation” replaces “Bring an Opportunity” in the shared navigation, Home and default closing actions. The canonical inquiry URL is unchanged. The original cream navigation, mark, copper button and two-action hero hierarchy remain. |
| Home planning | Three everyday questions open the desktop guide. A disclosure reveals all eight existing choices. A selected extra question stays visible when the list collapses. Mobile keeps its single accessible chooser. “A question to start with” replaces the extra product name. |
| Property Owners | Positive outcome-led framing clarifies purchase, project and representation conversations. The page has one closing, and the extra continuation photograph is removed. The existing project evidence, nine situations, selected-situation handoff and required boundaries remain. |
| Our Work | Three open columns explain the starting condition, visible renovation changes and recorded sale. Approximate acquisition, improvement budget and sale figures use the canonical Nelson facts. The bath record is correctly described as beginning during construction. No unsupported project-role claim is added. Original project photography remains unchanged. |
| Strategy Lab | One public product name and a practical description. The empty state presents starting a property, loading the synthetic example and calculator access. Save, clear and analysis navigation appear in the working model. Calculator close still returns focus to its opener. |
| Inquiry | Four common starting choices are visible first; a keyboard-accessible disclosure contains the other four. A selected secondary choice reopens on returning to the first step. Friendlier heading, progress wording, review and send action, and next-step guidance. Backend values, signed-contract tagging, prefill, consent, validation, idempotency and receipts are unchanged. |
| Phone composition | The original scene is cropped farther toward the colonnade. At 390px the hero ends at 700px instead of filling the 844px screen. Content still determines height at narrower widths. The threshold illustration is smaller so the visitor choices arrive sooner. Native text, palette, serif hierarchy and 44px touch targets remain. |

## Verification

- TypeScript: pass.
- Full suite: 228 files, 2,594 tests passed.
- Production build, bundle budget and serverless runtime gates: pass. This environment requires invoking the same build script with `node --import tsx script/build.ts` because the `tsx` CLI IPC socket is unavailable.
- Existing rendered journeys: 10 core journeys plus 4 inquiry viewport journeys passed. Inquiry pending, failure, focused retry and success use local fixtures, with no real submissions.
- Focused rendered review: Home, Property Owners, Our Work, Strategy Lab and inquiry at 1440px, 768px and 390px in light and dark themes, 30 combinations total. No automated WCAG A/AA violations or horizontal overflow. Planner expansion/collapse, inquiry disclosure retention, Lab progressive navigation and calculator focus return passed.
- Additional 320px Home and inquiry captures: no horizontal overflow or broken images.
- Actual screenshots were inspected against the saved critique, including Home desktop and phone, inquiry desktop and phone, Our Work, Lab desktop and phone, and the narrow Home opening. Intentional differences are recorded above.

The cloud browser rejected localhost. Visual evidence comes from the actual compiled build in local Chromium using Playwright. This review does not certify a production deployment or live backend connectivity.

## Delivery state

Source was committed locally on the existing branch. GitHub's connector returned `Transport closed`, and a noninteractive push dry run confirmed that this checkout has no GitHub push credentials. A Git-format patch preserves the complete refinement for the existing branch. Production was not deployed.

## Recovery continuation, October 2, 2026

Recovered the exact saved patch (SHA-256 `2b19f2a5990ca050952068085d0ab9072cb23de1d6173c8f032fcea82d301d82`) onto the unchanged remote baseline above. The earlier verification section records the original author's evidence, not fresh rendered acceptance in this environment.

Fresh recovery verification: typecheck and all 228 files / 2,594 tests passed before the accessibility follow-up; the production build, bundle budget, four fail-closed serverless runtime cases, example environment contract and diff hygiene passed. The prescribed Node 22.23.2 rerun exposed only the managed environment's injected `UNDICI-EHPA` stderr warning in `rendered-qa-build-digest.test.ts`; final verification suppresses that warning category without changing the test.

Independent review identified and corrected the empty Strategy Lab calculator action's accessible name so that it includes its visible “Use a calculator” label. A regression test covers the name and closing focus return, while the working-model calculator action retains its existing name.

Fresh local rendered QA is blocked: Chromium cannot create its required Unix socket (`Operation not permitted`), including the approved execution attempt; the cloud browser explicitly rejects the local preview with `ERR_BLOCKED_BY_CLIENT`. Neither failed attempt is a rendered pass. The exact-source GitHub rendered matrix remains required, followed by inspection of its screenshots and the separately authorized protected preview. All test submissions are intercepted synthetic fixtures; no live database, HQ, email or AI receipt is established. No production, DNS, payment, contract or merge action is part of this recovery.

Final local acceptance after the label fix: Node 22.23.2 typecheck; 228 test files / 2,597 tests; production build, bundle and four runtime cases passed. The shared rendered journey now checks that the owner and Our Work pages omit the intentionally removed extra continuation and exercises the retained onward link on How We Operate. Browser execution of that assertion remains an exact-source CI gate.

The production dependency audit exits successfully at the repository's high-severity threshold, but reports one low-severity DOMPurify advisory (`GHSA-p98j-92pf-mc4p`). No `IN_PLACE` or `afterSanitize` hook usage was found in client/server/shared source. Dependency changes are not included in this bounded design recovery; do not describe the audit as zero vulnerabilities.

## Rendered review and guide-boundary correction

Exact-source CI for recovery commit `3fe2b9eabd0a9521f74642519784cfee472dff0b` passed the launch suite, merge compatibility, Peggy chat/guide/shared journeys and all eight public-route shards (46 routes at four widths in both themes). Both intake shards and the MarketFlow interaction shard passed. Core interactions passed nine journeys but failed the theme-refresh request-settlement invariant, so that revision's aggregate gate did **not** pass.

Fresh artifact inspection covered the full Home, Our Work, initial inquiry and empty Lab at desktop and phone; owner openings and Tools at both sizes; guide/chat, selected pathway and dark closing/footer states. The six-section story, original photographs/emblem, cream/navy/copper hierarchy, progressive choices, form controls and truthful project outcome were retained. Screenshot provenance is the exact head and compiled-build digest recorded in each route artifact. CI fixtures are not live receipts.

This inspection exposed the Lab guide reading toolbar and workspace text as its introduction. Actual-component red/green tests reproduced saved synthetic address/city, situation, objective and model output entering passive snapshots or selection context. The follow-up keeps public authored view guidance while marking working records, derived output, notices and calculators with the existing private-context boundary. The explicit Memo → reviewed Peggy draft remains available and is not sent on open. The browser gate now restores a synthetic private record and checks the outgoing page-context payload as well as the visible introductory copy.

The theme journey now uses the existing strict settlement check after reload and before navigating away, with a sequencing regression test. It does not clear requests, relax timeouts, skip failures or weaken geometry checks. The next exact-source CI run must establish whether this resolves the Chromium lifecycle failure; logs alone did not prove its root cause.

Contact and production readiness remain separate: the displayed phone needs owner reactivation/replacement confirmation, the business mailbox and live service chain need actual receipt verification, and this source is not a public production launch.

Final follow-up local verification: Node 22.23.2 typecheck; all 229 test files / 2,607 tests; focused privacy and guide cases; production build/bundle budget; all four fail-closed deployment-entry cases; script syntax and diff hygiene pass. Current rendered/hosted acceptance is recorded after publication on the existing draft PR; no earlier green artifact is substituted for that exact revision.
