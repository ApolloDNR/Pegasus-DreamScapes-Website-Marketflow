# Pegasus website continuation status

## September 15: parchment-first refinement and quieter working pages

Baseline `ec9d57305197fb028d3cd758d8d2add53a0fc570`. Fresh hosted browser captures of the arrival, Property Owners selector, and Strategy Lab entry showed near-white reading surfaces, procedural owner copy, and a prominent summary full of missing values before useful modeling inputs existed.

Apollo requested a cream/parchment initial appearance and a less overwhelming finish. New visitors now start in light mode, while their saved preference still wins. Shared reading and form surfaces use warm paper; the approved navy arrival, footer, real imagery, and six-section homepage remain. Owner guidance separates the useful prompt from the unchanged limitation, selected rows gain a check and side rule, and the short process becomes a compact three-step composition. Strategy Lab presents brief input guidance until a valid basis supports its real summary. Calculation logic, intake context, disclosures, and consent contracts are unchanged.

Theme regression coverage now exercises a dark OS with no stored preference, a saved manual choice after remount/refresh and navigation, and blocked browser storage. The invalid-input tool test checks that conclusions and handoff stay absent until valid inputs exist. Existing rendered route/journey coverage remains required. Current-source CI, protected deployment identity, and visual evidence will be recorded on PR #26 after publication; historical results below do not certify this refinement. Production dependencies and the existing preview-only authorization remain unchanged.

Both-theme route shards now seed an explicit visitor preference and assert the actual rendered theme. OS emulation alone would otherwise exercise the new light default twice. The dedicated theme journey keeps storage empty to test first-visit behavior. The lazy Peggy-page unit test uses the same five-second rendering allowance as other lazily mounted supporting pages; its composer and handoff assertions remain intact.

## September 15: approved homepage direction extended through visitor journeys

Baseline: `73f50c0074eaa6afd5f1c63921317eddd1d250aa`, existing recovery branch and PR #26. Apollo approved the homepage direction and instructed us to develop the remaining site. The six-section homepage and approved imagery stay in place.

Keep: canonical hero and brand assets, real founder and Nelson photographs, eight Opportunity Plan needs, calculation engine, route and intake enums, consent requirements, private-access protections, and legal text.
Change: shared supporting-page composition, direct Contact and representation paths, compact Property Owners arrival with a stable wide-screen grid, real Nelson detail gallery and sourced financial record, About and specialist pages, tool workspace presentation, readable Peggy controls, and a final intake review.
Remove: repeated hero pitches, generic illustrative images on evidence pages, the Contact select-then-Go step, and false receipt handling. Property review remains request-based. No paid catalog is activated.

The Lead, MarketFlow access, vendor, and canonical opportunity forms now require their expected HTTP 201 record before showing receipt. Duplicate submission guards preserve entered values through a failed request. The owner situation is retained in the page URL and mapped through the existing intake adapter. Refreshed forms disclose when leaving or refreshing clears the draft.

Test expectations change only for intentional blueprint headings, direct-link semantics, relocated Nelson proof, readable control typography, and actual server receipt contracts. Existing tests remain; new tests reject arbitrary 200 responses, redirects, malformed receipts, and duplicate requests. Rendered journeys now include Home → owner → selected situation → intake → error/retry, the separately disclosed buyer/seller path, and Tools → modeled assumptions → supported intake handoff.

Current-source preview and rendered verification are required before acceptance. The existing protected-preview authorization persists. Production activation remains gated by the separate website backend, verified integrations, legal/identity/asset approval, and approval of the actual rendered design. The preview cannot certify live receipt or delivery while its backend is unavailable.


Updated 2026-09-14. Scope: `docs/WEBSITE_EXECUTION_BRIEF.md`.

## Launch verification continuation

The reviewed presentation candidate `c3341d676d57ccaecc51efb8687d74f30a4a5adc`
remains green in [run 34783571379](https://github.com/ApolloDNR/Pegasus-DreamScapes-Website-Marketflow/actions/runs/34783571379),
and its protected deployment remains READY. No visual redesign is part of
this continuation.

Source review found false-positive paths in `scripts/launch-intake-smoke.mjs`:
it checked health without database readiness, continued to a POST after a
requested environment failure, and described arbitrary successful responses
as accepted opportunities, including an `unknown` record ID. It also followed
redirects, had no request deadline, printed untrusted response/error text, and
embedded a real phone number and default notification recipient.

The repaired CLI requires the exact health/readiness JSON responses before
submission, stops on failed prerequisites or invalid arguments, bounds
requests to 15 seconds, rejects redirects, and validates the canonical HTTP
201 UUID/`New` receipt. An authorized test mailbox must be explicit; the
embedded phone/default email are removed. Failures do not print response
bodies or untrusted network details. No ambiguous POST is retried. Acceptance
still requires separate database, correlated HQ receipt, and notification
proof; queued is not delivered.

Twenty-six subprocess regression cases reproduced the old failures before
the repair. They intercept every request, so they create no live records or
notifications. All 26 new cases and the five existing deployment-contract
tests pass locally on Node 22. TypeScript, the full 214-file/2,455-test suite,
production build, bundle budgets, all four deployment-entry checks, and the
production dependency audit also pass locally. Final current-source Node 22
CI verification is recorded on PR #26.
The environment/runbook/checklist commands now match the canonical intake and
explicit test recipient.

The current workspace has none of the ten required website runtime settings.
Render, Neon, and SendGrid configuration are not exposed by the available
connectors; the connected Vercel project remains the browsing preview.
Production readiness therefore remains unverified. The next external step is
to make the existing Render website service and its non-production settings
available for configuration and receipt verification. Do not paste secrets
into chat, replace the database, or treat the connected HQ/auth Supabase
project as the website database. The unresolved receiver/consent mapping in
[HQ contract readiness](hq-contract-readiness.md) still applies.

## Professional structure and finish

The owner requested a site-wide professional finish beyond the Property Owners desktop repair. This continuation starts at `a431cb91ae863fb3c328f53e076e6feca040f747`. Fresh hosted screenshots of seven supporting pages exposed oversized arrivals, very small actions, missing opening destinations, a buried buyer-path comparison, and founder identity placed after abstract principles.

The changes establish a consistent supporting-page type and action scale, add six useful opening actions, bring Buyers' three distinct paths forward, remove its repeated MarketFlow module, point its project-evidence link to Our Work, and bring the founder story earlier on About. The approved material finish and locked Home arrival remain intact. [The presentation review](../design/professional-presentation-review.md) records each page's job, the visitor journeys, observed issues, and acceptance criteria. Existing PR #26 records current-source CI and hosted visual acceptance after publication. The production dependencies below remain open.

## Premium presentation and launch preparation

The owner approved the tactile navy/copper design and asked to improve its remaining rough edges and prepare for launch. This continuation starts from `9a98fa46d892ce8d451ef34c51ad977a56756acf` on the existing PR #26. Fresh protected-preview desktop captures of Home, Our Work, and Bring an Opportunity establish the visual baseline.

The refinement makes the primary navigation more readable, restores the full desktop wordmark at intermediate widths, adds a concise company introduction below the locked homepage headline, and gives Nelson Drive a clearer photographic and editorial hierarchy. The case study separates project narrative from the unchanged sourced financial facts. Intake choices and progress labels use larger, simpler text while retaining all eight backend values, the five-step journey, eligibility boundaries, consent fields, and retry behavior. The approved hero image, headline, action order, woven texture, copper finish, routes, and public contact details remain intact.

HQ acknowledgements now require a valid receipt before an outbox item is marked forwarded. Both the existing receipt and the documented v2 receipt can be recognized; malformed success bodies remain pending for bounded retry. Capability URLs are validated but never persisted, exposed, or followed. This does not claim compatibility with the separate v2 request contract. See [HQ contract readiness](hq-contract-readiness.md) for the consent and non-property inquiry mismatch that still requires an operational decision.

Local verification passes: TypeScript; 213 test files / 2,429 tests; the production client/server build; bundle budgets; all four deployment-entry scenarios; environment-variable-name smoke; production dependency audit with zero vulnerabilities; and diff hygiene. The build uses the documented `node --import tsx` equivalent for this environment's blocked tsx IPC socket. The test environment suppresses only the injected `UNDICI-EHPA` warning. Current-source rendered CI, hosted comparison, and the final preview URL are recorded on PR #26 after publication.

The protected Vercel deployment remains a browsing preview. Production is not certified: the separate Render/Neon website environment, verified email delivery, authentication and Peggy configuration, and a consent-compatible HQ receiver require actual configuration and receipt evidence. The connected Command Center Supabase project is not a substitute for the website database. The launch checklist now explicitly keeps `SITE_INDEXABLE=false` until production SSL, canonical-host behavior, and the required intake smoke are accepted.

## Final detail review

The owner approved the woven navy/copper direction at `f2d3389ae2cf8b4a16405db4afb5f4b4c9024e92` and asked for a critique and correction of the remaining rough edges. That baseline passed all 16 jobs in [run 34710327519](https://github.com/ApolloDNR/Pegasus-DreamScapes-Website-Marketflow/actions/runs/34710327519) and rendered in its protected preview.

Fresh desktop captures from that actual preview covered the homepage, open More directory, About arrival, footer, Contact default and selected buyer lane, and intake first step. They exposed five concrete issues: very small navigation and footer labels; an undefined hover text color on the inner-page header CTA; oversized About headings and older decorative arcs; Contact's QR-specific introduction and orange boxed controls; and intake selection indicators that were invisible until hover or selection.

This candidate raises navigation labels to 10px without changing destinations, uses readable 13px sentence-case footer links with 44px phone targets, fixes header hover and keyboard-focus contrast, quiets About's typography and spacing, and extends the approved woven stock to About and Contact. Contact now introduces the actual contact page while the QR entry retains its card context. Direct contact links and the route panel have fewer nested boxes and softer copper detail. Intake choices show an empty selection circle before selection and a check afterward. The locked homepage composition, project imagery, legal copy, backend contracts, and five-step intake are retained.

Local TypeScript, all 213 test files / 2,413 tests, production build, bundle budgets, deployment-entry checks, and diff hygiene pass. The existing desktop navigation journey now checks real hover and keyboard-focus contrast in both themes using axe. Current-source rendered CI, responsive screenshots, and hosted acceptance must be recorded on PR #26 before this candidate is declared complete. No live backend submission is part of this visual review; the protected-preview authorization and configuration limits below continue to apply.

## Tactile finish refinement

The owner found the first card-inspired finish too subtle and asked for a stronger result. Its baseline, `c6e94474422062d95012c206ad8457fbef097c86`, passed all 16 jobs in [run 34708852988](https://github.com/ApolloDNR/Pegasus-DreamScapes-Website-Marketflow/actions/runs/34708852988), including 360 route/theme/width combinations and 17 journeys. Fresh baseline screenshots were captured from that actual protected preview.

This refinement uses a generated, uniform navy bookcloth image, optimized to a 49,728-byte WebP, as a repeating material behind content. Permanent navy sections and the navigation directory carry the same woven finish in both themes; dark editorial sections use a less blue ink palette. Copper edges and static satin button highlights give the material a clearer hierarchy. The footer now has a framed Pegasus signature, a small diamond divider, and the existing contact details, with a two-column link layout below the identity on smaller screens. The card's old phone number and wording are not imported. No hero photograph, route, public claim, intake payload, or backend behavior changes.

Local TypeScript, all 213 test files / 2,413 tests, production build, bundle budgets, deployment-entry runtime checks, and diff hygiene pass. Exact-source rendered CI and hosted desktop/mobile material review must be recorded on existing PR #26 before this refinement is declared complete. The existing protected-preview authorization and backend limits remain in effect.

## Business-card finish continuation

The preceding design candidate is published at `4eb0dacfbd57c55f1b481e5f4ee88a64837068dc`. [Run 34703097469](https://github.com/ApolloDNR/Pegasus-DreamScapes-Website-Marketflow/actions/runs/34703097469) passed all 16 jobs, including 45 routes at four widths in both themes and 17 interaction journeys. Its protected preview also passed hosted visual and interaction review.

The owner then supplied the navy/copper business card as a material reference and explicitly asked for a restrained finish, without substantial structural change. `material-finish.css` reuses the existing fine-grain artwork on opaque editorial surfaces, adds restrained copper edges and pressed button detail, reduces floating-card shadows, and gives the shared footer a fine perimeter. It carries through both themes, the navigation, Opportunity Plan, and supporting editorial pages. The card is a visual reference only; its contact details and wording do not replace the approved website information. The approved hero, photographs, fonts, routes, content, forms, and integrations are preserved.

Local verification for this finish: TypeScript, all 213 test files / 2,413 tests, production build, client bundle budgets, deployment-entry runtime checks, and diff hygiene pass. Fresh hosted before screenshots were captured for the homepage, navigation, Opportunity Plan, and footer. Current-source rendered CI and the final hosted comparison must be recorded on PR #26 before this candidate is declared complete. The existing protected-preview authorization and backend limitations below continue to apply.

## Latest design continuation

The prior design sweep is published at `ed8516e4ff726110b04299b4517a1017299d9691`. Its protected preview rendered successfully and [run 34620908639](https://github.com/ApolloDNR/Pegasus-DreamScapes-Website-Marketflow/actions/runs/34620908639) passed all 16 jobs. It includes the repaired Opportunity Plan, owner/partner controls, operating stages, photo viewer, FAQ search, and shared page refinements. These results supersede the earlier unverified-browser statements below for that source.

The owner's September 12 continuation asks for a finished, elegant preview. A fresh hosted audit found a placeholder Nelson image on Projects, cramped uppercase More-menu descriptions, buried utility routes, and long supporting pages. The new candidate adds navigation search and utility links; collapsible mobile groups; a full-width, real-photo Nelson feature; chapter links and a quieter Deal Blueprint layout; and a directly reachable, grouped vendor application with larger inputs. The approved homepage hero and five primary navigation destinations remain intact. Intake payloads, consent requirements, and engagement boundaries are unchanged.

Local verification: all 213 test files / 2,413 tests pass. TypeScript, production build, client bundle budgets, deployment-entry runtime checks, and diff hygiene pass. Browser interactions now check navigation search, no-result recovery, menu geometry, mobile group expansion, and vendor-route discovery. Rendered CI and current hosted acceptance must be recorded on PR #26 before claiming completion for this new candidate.

The preview backend is still intentionally unavailable without its actual environment configuration. Public browsing and local tools can be reviewed; live intake, Peggy responses, authentication, HQ, and email delivery are not certified. Do not convert this design review into a production launch or fabricate submission receipts. Managed-browser access to `/api/version` was explicitly blocked; verify deployed-source identity through Vercel build logs rather than retrying that endpoint through another transport.

## Publication continuation

The owner explicitly approved updating existing PR #26 and deploying to the existing protected `pegasus-dreamscapes-preview` project. That approval persists. Do not ask for it again.

The authenticated GitHub app published `b47d96a4cd888d2ccb017c42cc033f1e72bf390f`, whose tree exactly matches the locally verified `f3c24bf` candidate. [Launch Verification run 330](https://github.com/ApolloDNR/Pegasus-DreamScapes-Website-Marketflow/actions/runs/34566488841) passed all 16 jobs, including all desktop/mobile light/dark route shards and interaction groups.

Vercel deployment `dpl_8PHSKYXSdj8rPKHw6wfXhcpMboH6` built and passed the deployment-entry smoke check, but a real browser request exposed missing preview `DATABASE_URL` configuration. The original Rollup startup failure is repaired; database provisioning is a separate remaining operational dependency.

Commit `e5b1e1ce7de471fcc2495c21d10f1fb9b64730a1` lets only an explicitly designated preview with no database render public pages. Its backend APIs return HTTP 503 with an explicit browsing-preview message, no writes, and no successful submission receipts. Production retains its normal backend requirement. All 2,403 tests and the build passed locally. In GitHub run 332, launch verification and the interaction shards passed, but the light 1024px route shard timed out during post-accessibility settlement on About, so that aggregate gate did not pass.

Deployment `dpl_H1MRmUhx4MiUwM1xfFDXYhnAaUS3` exposed a second startup difference: the file-deployment runtime did not apply the non-secret preview environment defaults before importing the server. The root Express entry now reads those defaults from `vercel.json` before initialization and preserves any explicitly supplied environment values. The real-entry smoke adds the exact file-preview case, with no injected `APP_ENV` or `SITE_INDEXABLE`, alongside configured preview, unconfigured preview with blocked intake/auth/readiness, and unconfigured production rejection. All four cases pass locally. Final source, CI, hosted review, and remaining operational acceptance are recorded on PR #26.

The Vercel file-deployment tool stages an immutable public GitHub source archive for the selected commit during installation, validates the archive's commit prefix, then runs the repository's normal install and build. Only the deployment's non-secret `PEGASUS_SOURCE_SHA` setting is added to identify the source at `/api/version`.

Use one share link after deployment reaches READY and reuse its browser session for subsequent route checks. Serial access succeeded; earlier concurrent share/fetch helper requests redirected to SSO. Do not regenerate access links for every route.

The sections below retain the evidence from the earlier unpublished checkpoint. They are historical where superseded by this continuation and the latest PR/deployment evidence.

## Current source and publication

- Repository: `ApolloDNR/Pegasus-DreamScapes-Website-Marketflow`.
- Branch: `codex/launch-recovery-v2`; existing draft PR #26.
- Remote baseline checked for this continuation: `59b71ee7d224a3aec2dfd2f8836934db94ed15bd`.
- The previous temporary checkout and unpublished commit disappeared between sessions. The startup repair was reconstructed in the fresh checkout, together with the copy corrections below. Do not assume the earlier local commit `51a38fbb3dbdeb2006346858e9a493788b492233` is on GitHub or available locally.
- This earlier checkpoint preceded the successful publications described above. The older protected previews are not evidence of a working current candidate.

## Alignment with the recovered owner plan

| Objective | Source finding and work | Remaining acceptance |
| --- | --- | --- |
| Operating-company identity | Restored the locked Home eyebrow and “Complex real estate, made executable.” headline; aligned About and relevant metadata | Hosted visual review |
| Clear owner and partner entry | Rewrote opening copy to explain the situation, proposed role, and next step; existing submission limits remain visible | Hosted owner and deal-partner journeys |
| Explain the operating model | Clarified agreed execution in How We Operate; distinguished property strategy, role, control, funding, and compensation | Final copy/owner review |
| Navigation and conversion | Mounted public routes and Bring an Opportunity actions already exist | Current-candidate desktop/mobile interaction matrix |
| Real project proof | Nelson figures and evidence limitations remain sourced from shared facts | Current-candidate gallery review |
| Strategy Lab | Four-step property/basis/paths/brief experience, calculator controls, and automated-model labels already exist | Verify the desired initial Quick Read and deeper controls in the rendered experience |
| Peggy, Deal Blueprint, MarketFlow | Existing AI-intake, by-review, and controlled-private-pilot boundaries retained | Hosted error states, permissions, and handoffs |
| Real follow-up | Server intake/HQ/email implementation exists | Actual authorized environment receipt proof is still missing |

This is a source comparison and a completed local correction slice. It does not certify every public page, hosted operation, or production readiness.

## Startup repair

The production serverless bundle retained the development Vite import graph and loaded Rollup at startup. A literal production guard lets esbuild remove that graph. The root `server.mjs` now exposes a directly detectable Express app. The build runs a new isolated startup check against that real entry while rejecting imports of Vite, Rollup, esbuild, and Vite plugins. It checks `/api/version`, four SPA routes, and `/robots.txt` with preview noindex enforced.

Restored the narrowly scoped `qs` override to 6.16.0; only its three lockfile fields changed. Production dependency audit reports zero vulnerabilities at this checkpoint.

## Local verification

- Node 22.23.2 clean install: 731 packages.
- TypeScript: passed.
- Production client/server build and bundle budget: passed.
- Actual deployment-entry startup and six HTTP checks: passed using isolated dummy local configuration, with no live-service writes.
- Production dependency audit: passed, zero vulnerabilities.
- `.env.example` launch smoke: passed; lists the ten required variables. This checks names, not deployed secrets.
- Full test suite: passed, 212 files / 2,403 tests, in 43.65 seconds. Earlier runs found outdated editorial assertions and an overlong search description; these were corrected without weakening the public-truth or SEO guards. One run concurrent with the build timed out while finding the Peggy page textbox; the unchanged accessibility file passed all 19 tests independently, and the subsequent full run passed without concurrent build load.
- Final bundle: entry 166,702 bytes raw / 51,985 gzip; initial JavaScript 416,517 raw / 123,393 gzip, within the existing budgets.
- `git diff --check`: passed.

The build was executed through `node --import tsx script/build.ts`, followed by the normal bundle and serverless checks, to avoid the managed environment's previously observed tsx CLI IPC failure. The full suite preserves existing assertions; only the injected `UNDICI-EHPA` warning is disabled in the test process.

Browser-rendered acceptance has not been completed for this candidate. The earlier attempt to open the local app in the managed browser was blocked with `net::ERR_BLOCKED_BY_CLIENT`; no substitute screenshot or hosted validation is claimed.

## Historical evidence

[Launch Verification run 33352346833](https://github.com/ApolloDNR/Pegasus-DreamScapes-Website-Marketflow/actions/runs/33352346833) passed all 16 jobs for the older remote baseline. Its route/interaction results do not certify this unpublished candidate. Older August task queues in the historical recovery ledger must not be mistaken for the current remote progress.

## Historical publication blocker and next step

Automatic approval review rejected the previous GitHub push because it treated the destination/source publication as not explicitly authorized. It also rejected the Vercel deployment because the destination was not explicitly authorized. No alternative publishing mechanism was used to bypass either rejection.

The intended existing preview destination is `pegasus-dreamscapes-preview`, project `prj_xqZDdr0YWRY3dstXga5caY8RmkeC`, team `team_peFANIMRrkMuCUtV1U52oyOb`. The older deployment `dpl_NaYgV1gEuGf9wosbRRPuJ8vruyKw` had a startup crash; a READY provider status did not prove functioning runtime.

Publication was subsequently authorized and completed as described above. Verify the current candidate through its immutable-source deployment build log and inspect the actual protected preview. Do not retry the managed-browser-blocked `/api/version` endpoint through another transport. Repeatedly regenerating share tokens is not a substitute for a working deployment.

Production/DNS changes, live-data mutation, paid activation, and broad public distribution remain outside this continuation's completed work. Finish environment-specific intake/HQ/email proof and the required launch reviews before public launch.
