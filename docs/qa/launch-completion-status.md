# Pegasus website continuation status

Updated 2026-09-11. Scope: `docs/WEBSITE_EXECUTION_BRIEF.md`.

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

Publication was subsequently authorized and completed as described above. Continue by verifying `/api/version` identifies the current candidate and noindex remains enforced, then inspecting the actual preview and completing the hosted customer journeys. Repeatedly regenerating share tokens is not a substitute for a working deployment.

Production/DNS changes, live-data mutation, paid activation, and broad public distribution remain outside this continuation's completed work. Finish environment-specific intake/HQ/email proof and the required launch reviews before public launch.
