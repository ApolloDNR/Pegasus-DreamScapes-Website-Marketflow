# Pegasus Security Launch Recovery Ledger

Plan: `docs/superpowers/plans/2026-08-13-pegasus-security-launch-recovery.md`

Branch: `codex/launch-recovery-v2`

Approved source: `4487bec1378c701cc77a6cef421b9921ddf522d4`

This tracked ledger is the durable recovery record. The ignored plan-scoped SDD workspace holds short-lived briefs and detailed reviewer packages; accepted implementation/fix commits, verification commands, reviewer verdicts, and rulings are summarized here before each task is checked complete.

## Recovery baseline — 2026-08-13

- Node `22.23.2` TypeScript: PASS.
- Production build and bundle budget: PASS.
- Full Vitest baseline: 110 files; 1,250 passed and one failed. Two fresh focused lane-page processes then produced one `/buyers` timeout at 1,045ms and one pass at 930ms against the 1,000ms default; the failing process passed all seven later cases.
- PR #25 inventory: 46 actionable findings reviewed, 5 fixed at the approved base, 41 still applicable, and 8 unresolved inline threads.
- External gates: no production, DNS, live/staging mutation, migration application, test lead, or public preview publication without its named approval.

## Accepted task checkpoints

| Task | Status | Implementation commits | Verification and reviews |
| --- | --- | --- | --- |
| 1 | Complete | `962551ca5c5d2371b876c819babd0328b60997e1`; follow-up `7a9fe88fd4f7f05f10632fc7b93abea90d1cb7c7` | Both slices `SPEC APPROVED`; `QUALITY APPROVED`; fresh Node 22.23.2 RED/GREEN, cold-route, full-suite, and production-boundary evidence below. |
| 2 | Complete | `81f2b7cbe9026b5946303dd97deb5b1afab8dc6e` | `SPEC APPROVED`; `QUALITY APPROVED`; focused 5 files / 37 tests and repaired exact-head full 113 files / 1,277 tests passed. |
| 3 | Complete | Primary `9240e365a108aba28f9a41e88ee43ef78d780bdf`; review fix `ab289e6900524361467a1132c7eb16cecf6af61f` | `SPEC APPROVED`; `QUALITY APPROVED`; focused 3 files / 73 tests, full 114 files / 1,338 tests, TypeScript, production build/budget, and exact-scope gates passed. |

### Task 1 — recovery foundation

- RED: two fresh `lane-pages-prd-v1` processes failed only the first `/buyers` case at 1,483ms and 1,043ms while all seven later cases passed. The new static boundary assertion then failed against `loadPages()`.
- GREEN: `npx vitest run client/src/__tests__/pegasus-no-blank-shell.test.tsx client/src/__tests__/lane-pages-prd-v1.test.tsx client/src/__tests__/cta-labels.test.tsx client/src/__tests__/cta-routing.test.tsx` passed 4 files / 77 tests; `npm run check` passed.
- Build ruling: the exact `npm run build` wrapper failed before repository build code because the managed sandbox denied the `tsx` CLI Unix IPC listener (`EPERM /tmp/tsx-0/20.pipe`). The source-equivalent `node --import tsx script/build.ts && npm run check:bundle` executed the same build entrypoint and bundle gate successfully: Vite 3,822 modules, server `dist/index.cjs`, entry 167,823 B raw / 52,773 B gzip, initial 429,697 B raw / 126,458 B gzip.
- Production topology: manifest proof passed with distinct `category-page-C0xHT97R.js` and `pages-d_BOT6rg.js` dynamic entries; the category entry does not import the broad pages entry.
- Scope and hygiene: exact nine planned implementation paths, unchanged lockfile, `git diff --check` PASS.
- Reviews: specification `SPEC APPROVED` with no findings; code quality `QUALITY APPROVED` with no Critical or Important findings.

#### Task 1 accepted follow-up — Capital lane boundary

- Controller diagnosis: the first Task 2 full-suite acceptance run passed 112 files / 1,274 tests and failed only `/capital`, with the correct SEO present but Suspense still showing `Reading the situation…` beyond Testing Library's one-second default. Three of nine fresh cold Capital processes reproduced at 1,140–1,672ms. Task 1 had moved `/buyers` off `pages.tsx`, making `/capital` the first cold consumer of that broad graph; Task 2 changed none of the route, copy, lazy-loading, or test/config paths.
- RED/GREEN: the deterministic source regression failed on the Capital `loadPages()` declaration, then passed after direct `./capital-page` loading and a reverse-`./pages` guard. The Capital section moved byte-for-byte and the compatibility re-export remains one-way.
- Cold-route proof: nine implementation runs passed at 192–274ms and nine independent specification-review runs passed at 180–303ms under the unchanged lane-test timeout.
- Verification: focused 4 files / 78 tests; full 113 files / 1,277 tests; TypeScript; listener-free production build with 3,825 modules; bundle budget; exact four-path scope; protected-file and diff hygiene; and distinct `capital-page` versus `pages` dynamic entries all passed.
- Reviews: specification `SPEC APPROVED` and code quality `QUALITY APPROVED`, each with no Critical, Important, or Minor findings. Quality analysis measured a 64,576 B raw / 15,294 B gzip focused dependency closure versus 555,214 B / 144,189 B for the broad pages closure and found no cycle or broad-pages reachability.

### Task 2 — listing inquiry contract

- RED/GREEN: strict-schema, real-modal, live-Express handler, registrar-composition, and UUID property-action slices each failed for their intended missing contract before implementation and passed afterward. Detailed causal outputs remain in the plan-scoped orchestration ledger.
- Contract: both reachable numeric listing modals now send strict canonical bodies with required valid email; tour dates retain same-index real times and explicit `false`; server validation runs before reviewed access/storage; first-contact context uses a minimal public projection and indistinguishable no-store 404s; the UUID-backed property page uses truthful direct contact without numeric coercion, analytics, modal, or Peggy context.
- Verification: focused 5 files / 37 tests, TypeScript, exact ten-path scope, and diff hygiene passed. The implementation worker and specification reviewer each passed the then-current full 113 files / 1,275 tests. After the accepted Capital-boundary follow-up, the controller passed the exact-head full 113 files / 1,277 tests plus production build and bundle budget.
- Reviews: specification `SPEC APPROVED` with no findings; code quality `QUALITY APPROVED` with no Critical or Important findings. Canonical successor commit `81f2b7cbe9026b5946303dd97deb5b1afab8dc6e` has reviewed tree `18bf6b48e5dcd85a737e612a768387aeb39d0d03`.

### Task 3 — complete wholesale offer terms

- RED/GREEN: the exact three-file client/server slice produced 48 causal client failures while the unchanged strict server parser's 13 characterizations remained GREEN. The implemented primary tree then passed Offer Studio 20/20, reachable Accept/Counter modals 39/39, and the combined 72/72 gate. The added quality regression independently failed 39/40 when a refreshed total inherited consent to the old amount, then passed 40/40 after consent was bound to the exact total.
- Contract: Offer Studio and both reachable wholesale modals retain raw numeric input until safe-integer validation, require and focus an accessible closing date, derive one displayed/submitted six-field financial payload, reject invalid components before summing, preserve legitimate zero values, and omit authority/status/expiry/alias fields. Accept now invalidates acknowledgement whenever refreshed query data changes the exact total, preserves the user's edited date, and requires fresh consent before submitting the refreshed amount.
- Verification: final focused 3 files / 73 tests; full 114 files / 1,338 tests; TypeScript; listener-free same-entrypoint production build with 3,825 Vite modules; bundle budget; exact five-path primary plus two-path fix scope; protected-path and diff hygiene all passed under Node 22.23.2. The ordinary build wrapper reached only the sandbox-denied `tsx` IPC listener (`EPERM /tmp/tsx-0/19.pipe`); the plan-authorized `node --import tsx script/build.ts` entrypoint and the unchanged bundle gate passed.
- Reviews: fresh full specification review returned `SPEC APPROVED`, 0 Blocker / 0 Major / 0 Minor. Initial quality review returned 0 Critical / 1 Important / 0 Minor; the Important refreshed-total acknowledgement defect was fixed in a separate commit. Scoped specification and quality re-reviews returned `SPEC APPROVED` and `QUALITY APPROVED`, each with no remaining finding. No Minor finding was deferred.
- Security review: a complete five-surface diff scan produced one plausible business-integrity candidate, then validation and attack-path analysis rejected it because creation stores a proposal and only the distinct current recipient can promote the reviewed payload to final terms. Final result: zero reportable findings, zero deferred items, complete coverage.
- Canonical publication: primary `9240e365a108aba28f9a41e88ee43ef78d780bdf` has reviewed tree `d17eedba11c273a4bf85c61862b8821e60f7de56`; fix `ab289e6900524361467a1132c7eb16cecf6af61f` has reviewed final tree `cb11a796a47e3ee8a3c3dc1e699851398caa61aa`. Both were fast-forwarded without force.

## Deferred findings and rulings

| ID | Severity | Ruling | Follow-up |
| --- | --- | --- | --- |
| T1-M01 | Minor | Accepted. The static `Landing.tsx` assertion does not itself reject a future reverse `category-page.tsx` import of `./pages`; current source and the production manifest prove the dependency is absent. | Add a source or automated-manifest non-dependency assertion when the boundary test or bundle checker is next maintained; do not reopen Task 1. |
| T2-M01 | Minor | Accepted. The two listing inquiry modals retain existing label/toggle accessibility debt; the Task 2 request/API/storage contract is correct and no accessibility regression was introduced. | Associate visible labels with their controls and add group/pressed semantics in the scheduled workflow/mobile accessibility slice; do not reopen Task 2. |
| T2-M02 | Minor | Accepted. Live HTTP tests prove private/nonexistent parity and one inaccessible POST path, but do not enumerate every inaccessible listing state. | Broaden the POST anti-enumeration matrix when the listing authorization adapter or route harness is next maintained. |
| T2-M03 | Minor | Accepted. Current behavior and source checks reject the known UUID `Number`/`parseInt` paths, but the narrow regex is not a semantic proof against every future alias or formatting variant. | Replace the source regex with a semantic/source-boundary assertion when UUID property actions or analytics gain a typed string-ID contract. |
