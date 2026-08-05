# Pegasus Launch Completion Status

Plan: `docs/superpowers/plans/2026-08-05-pegasus-launch-completion.md`

Local candidate branch: `agent/launch-ci-final`

Publication target: `agent/launch-hardening-review`

Pull request: PR #25

## Recovery Rule

A status-only update does not complete work. Reconcile the plan checklists, the Task Completion Record below, and the plan-specific SDD ledger before resuming at the first task still unchecked. A durable `complete` record prevents rerunning a finished task; the plan-specific SDD ledger remains part of every recovery check. Stop only for the conditions listed in the plan's Master Execution Contract.

## Task Completion Record

| Task | Status | Durable evidence |
| --- | --- | --- |
| Task 1 — Durable Recovery And Launch Ledger | Complete | `371916744bfab9c08f04f4acb6eb5dd82f0ce1a6` (`docs: lock Pegasus launch completion plan`); all Task 1 checklist steps are checked in the canonical plan. |
| Task 2 — Exact-Commit Rendered Product Audit | Reverification pending | The prior 17-route/51-capture audit drove the accepted fixes. The final candidate adds `/marketflow/deals` and later privacy, authorization, and browser-gate changes, so fresh cloud-browser evidence is required after the immutable preview is published. |
| Task 3 — P0 And P1 Product Remediation | Complete | Confirmed accessibility, route ownership, mobile Peggy, privacy truth, browser-egress, CTA, shell, and MarketFlow authorization defects are regression-covered. Independent exact-tree review on `aa756cb` found no remaining code/security blocker; focused review verification passed TypeScript, diff hygiene, and 98 tests. |
| Task 4 — Complete Local Release Gate | Complete | The corrected Node 22.23.2 runtime candidate passed a clean install, production audit, environment contract, TypeScript, 110 test files / 1,249 tests, production build, and bundle budget. GitHub's rendered rerun remains part of Task 5. |
| Task 5 — Publish And Prove PR #25 | In progress | PR #25 was safely fast-forwarded to `19bf3f8`. Launch Verification #205 rejected that head at the rendered gate. The corrected fast-forward successor must pass the complete local gate and a fresh exact-head GitHub run. |
| Task 6 — Non-Production Staging And Live-Service Proof | Partially blocked | A static, noindex, non-production preview and cloud-browser QA remain executable. Backend staging proof is blocked by denied Supabase project access and the absence of a connected Render staging control surface. |

## Source Commit And PR Evidence

| Evidence | Result |
| --- | --- |
| Local source commit at plan start | `c81a129` |
| Independently approved runtime candidate | `aa756cbc19fe0efda7101a5dfab74813daed5fe6`; Git tree `955b885834ca11100c08147423d8eee41f1c8c92`. The following documentation-only evidence commit does not change this runtime tree. |
| Remote PR head before final publication | `4121336babe004703351f813f9950f3bd537395c`; the local candidate is a true fast-forward descendant. |
| Required GitHub checks on pre-publication head | The earlier Launch Verification run succeeded. It is baseline evidence only; the final candidate requires a new exact-head run after Task 5 publication. |
| Local release-gate timestamp | `2026-08-05T20:37:41Z` on the documentation-only candidate headed by `d7bdfe0`; runtime tree remains `955b885834ca11100c08147423d8eee41f1c8c92`. |
| First final-candidate publication | PR head `19bf3f82e8513dc3076dc5c757b5eff623cdd7e0`; Git tree `274c9625fb1e41b889f27f69733703489b14cade`; byte-for-byte matched the local candidate. |
| Launch Verification #205 | FAILED only at `check:a11y`: 102/108 route checks and 11/12 journeys passed; all six route failures were `/marketflow/deals`, and the test suite was skipped by the sequential workflow. |
| Corrective commits | `5b43576` waits for Peggy's opacity transition before geometry; `d01760e` names the beta dismiss button and raises the two light-theme MarketFlow colors to 6.40:1. Focused Node 22 RED/GREEN verification passed; exact-head CI is pending. |
| Corrected local runtime candidate | `d01760ec520c578ec5a8b83e942921f7afb4ef49`; Git tree `248780b76905cc34a6649a7581acdfecd36751fb`. The following launch-ledger commits are documentation-only. |
| Corrected release-gate timestamp | `2026-08-05T21:01:45Z`; 110 test files / 1,249 tests, production build, and bundle budget passed on the corrected runtime tree. |

## Route And Viewport Matrix

The historical visual baseline passed before the final authorization/privacy changes. Every `PENDING` cell below must be replaced by `PASS`, `P0`, `P1`, or `P2` from the immutable final preview; no blank or historical result is accepted as exact-candidate evidence.

| Route | 1440px | 768px | 390px | Interaction | Console |
| --- | --- | --- | --- | --- | --- |
| `/` | PENDING | PENDING | PENDING | PENDING | PENDING |
| `/property-owners` | PENDING | PENDING | PENDING | PENDING | PENDING |
| `/deal-partners` | PENDING | PENDING | PENDING | PENDING | PENDING |
| `/how-we-operate` | PENDING | PENDING | PENDING | PENDING | PENDING |
| `/development` | PENDING | PENDING | PENDING | PENDING | PENDING |
| `/investments` | PENDING | PENDING | PENDING | PENDING | PENDING |
| `/strategy-lab` | PENDING | PENDING | PENDING | PENDING | PENDING |
| `/work-with-apollo` | PENDING | PENDING | PENDING | PENDING | PENDING |
| `/marketflow` | PENDING | PENDING | PENDING | PENDING | PENDING |
| `/marketflow/deals` | PENDING | PENDING | PENDING | PENDING | PENDING |
| `/bring-an-opportunity` | PENDING | PENDING | PENDING | PENDING | PENDING |
| `/connect` | PENDING | PENDING | PENDING | PENDING | PENDING |
| `/peggy` | PENDING | PENDING | PENDING | PENDING | PENDING |
| `/contact` | PENDING | PENDING | PENDING | PENDING | PENDING |
| `/privacy` | PENDING | PENDING | PENDING | PENDING | PENDING |
| `/terms` | PENDING | PENDING | PENDING | PENDING | PENDING |
| `/disclosures` | PENDING | PENDING | PENDING | PENDING | PENDING |
| `/__launch-404-check` | PENDING | PENDING | PENDING | PENDING | PENDING |

## Interaction Results

| Journey | Result | Evidence |
| --- | --- | --- |
| Desktop primary navigation and More menu | PENDING | Final immutable-preview run required. |
| Mobile navigation | PENDING | Final immutable-preview run required. |
| Theme toggle | PENDING | Final immutable-preview run required. |
| Homepage hero CTA | PENDING | Gate targets the unique visible `Bring an Opportunity` link inside `[data-hv="arrival"]`; final immutable-preview run required. |
| Opportunity intake validation | PENDING | Final immutable-preview run required. |
| Strategy Lab primary interaction | PENDING | Final immutable-preview run required. |
| MarketFlow access request path | PENDING | Final immutable-preview run must cover anonymous hold, canonical intake, and reviewed-access boundaries. |
| Peggy open, close, and approved handoff | PENDING | Final immutable-preview run must include the 390px cookie/Peggy geometry. |
| Contact form validation | PENDING | Final immutable-preview run required. |
| Cookie consent | PENDING | Final immutable-preview run required. |
| Keyboard focus order | PENDING | Final immutable-preview run required. |
| Branded 404 recovery | PENDING | Final immutable-preview run required. |

## Confirmed Findings

| Priority | Surface | Finding | Result and regression evidence |
| --- | --- | --- | --- |
| P1 | `/` | Opportunity Plan primary action disappeared against its light panel. | FIXED in `client/src/pegasus/_group.css`; rendered contrast gate passes. |
| P1 | `/bring-an-opportunity` | Small copper labels failed AA in dark mode. | FIXED in `client/src/pages/submit-property.tsx`; rendered contrast gate passes. |
| P1 | `/connect` | Small copper eyebrow failed AA on the light surface. | FIXED in `client/src/index.css`; rendered contrast gate passes. |
| P1 | Investment and shared callouts | Light-theme copper text failed AA. | FIXED with the theme-aware `--accent-ink` token in `client/src/pegasus/_group.css` and owning components; rendered contrast gate passes. |
| P1 | `/contact` | Standalone contact surface had no attached H1. | FIXED in `client/src/pegasus/forms.tsx`; every matrix route now requires an attached H1. |
| P1 | 404 | Primary recovery action used an insufficient copper/white combination. | FIXED in `client/src/pages/not-found.tsx`; rendered contrast and recovery journey pass. |
| P1 | `/how-we-operate` | Inactive rail opacity reduced names and numbers below AA. | FIXED in `client/src/pegasus/_group.css`; all six viewport/theme combinations pass. |
| P1 | `/peggy` | Peggy labels, START display text, and door kickers failed contrast in one or both themes. | FIXED in `client/src/pegasus/pages.tsx`, `client/src/pegasus/blocks.tsx`, and `client/src/pegasus/_group.css`; all six combinations pass. |
| P1 | `/privacy`, `/terms`, `/disclosures` | Legal labels and inline contact links failed light-theme contrast or relied on color alone. | FIXED in the three legal page files; all eighteen route/viewport/theme combinations pass. |
| P1 | Public Strategy Library | Legacy fixture articles and read APIs contradicted the reviewed Strategy Lab product boundary. | FIXED: public aliases redirect to `/strategy-lab`, public read APIs return 410, and client/SEO/navigation/Peggy ownership is retired. |
| P1 | Mobile Peggy plus cookie consent | The cookie-visible mobile rule hid Peggy instead of keeping both controls usable. | FIXED with bounded `100dvh` layout and focused mobile regression coverage. |
| P1 | `/marketflow/deals` | Anonymous and ordinary self-provisioned users could reach operator chrome or reviewed inventory through parallel read/write aliases. | FIXED with one governed reviewed-access predicate, global alias guards, mixed-surface filtering, participant/owner preservation, and self-offer rejection. |
| P1 | Strategy Lab and Peggy storage disclosures | Runtime used undisclosed browser storage and legacy fingerprint-derived recovery while public privacy copy described cookies inaccurately. | FIXED: random claim ID remains local-only, run count is session-only, legacy fingerprint/cookies are removed, and privacy/consent copy discloses drafts, Peggy continuity, and configured AI processing. |
| P1 | Rendered launch gate | The prior gate missed `/marketflow/deals`, mobile Peggy/cookie geometry, the actual homepage hero CTA, and blocked outbound failures. | FIXED in the checked-in gate contract: 18 routes, exact hero CTA, exact-origin HTTP/WS isolation, structured health evidence, and 12 journeys. Final execution is pending GitHub CI. |
| P1 | `/marketflow/deals` rendered accessibility | Launch Verification #205 found the beta-dismiss icon had no accessible name and two light-theme copper combinations measured 4.38:1. | FIXED in `d01760e`: the control has a specific accessible name and the anonymous hold uses explicit 6.40:1 light colors with existing dark tokens; 24 focused tests pass. |
| P1 | Mobile cookie/Peggy journey | The gate inspected computed opacity before the reduced-motion transition settled, so it failed before proving viewport and consent geometry. | FIXED in `5b43576` with a condition-based opacity wait before geometry; production animation/CSS is unchanged and six focused gate tests pass. |

## Automated Release Gate

| Gate | Exact commit | Result |
| --- | --- | --- |
| Node 22 | Runtime tree `248780b76905cc34a6649a7581acdfecd36751fb` | Node `22.23.2` — PASS. |
| Clean lockfile install | Runtime tree `248780b76905cc34a6649a7581acdfecd36751fb` | `npm ci` installed 725 packages; `package-lock.json` unchanged — PASS. |
| Production dependency audit | Runtime tree `248780b76905cc34a6649a7581acdfecd36751fb` | Exit 0; no high/critical production advisory. Five moderate transitive UUID buffer advisories remain in the Google Cloud Storage chain. |
| Launch environment example contract | Runtime tree `248780b76905cc34a6649a7581acdfecd36751fb` | All 10 required production variables are documented — PASS. |
| TypeScript | Runtime tree `248780b76905cc34a6649a7581acdfecd36751fb` | Exit 0 with no diagnostics — PASS. |
| Vitest | Runtime tree `248780b76905cc34a6649a7581acdfecd36751fb` | 110 files / 1,249 tests, zero failures — PASS. |
| Production build | Runtime tree `248780b76905cc34a6649a7581acdfecd36751fb` | Vite built 3,821 modules and the Express server bundle through the sandbox-safe `node --import tsx script/build.ts` entry — PASS. GitHub CI will run the normal `npm run build` command. |
| Bundle budget | Runtime tree `248780b76905cc34a6649a7581acdfecd36751fb` | Entry 169,298 B raw / 53,037 B gzip; initial 431,172 B raw / 126,722 B gzip — PASS. |
| Rendered accessibility and journeys | PR head `19bf3f8` | Run #205: 102/108 route checks and 11/12 journeys passed. Corrective commits `5b43576` and `d01760e` are locally focused-green; a fresh exact-head run is PENDING. |
| Diff and secret hygiene | Runtime tree `248780b76905cc34a6649a7581acdfecd36751fb` plus its documentation-only ledger successor | `git diff --check` passes; `package-lock.json` is unchanged; the only assignment-shaped secret scan match is the documented placeholder in `SUPABASE_SETUP.md` — PASS. |

## External Staging Gate

| Gate | Result | Evidence or blocker |
| --- | --- | --- |
| Immutable static preview | PENDING | Publish the exact built frontend as a noindex, non-production preview with `/api*` returning explicit 503 JSON and a commit manifest. |
| Cloud-browser visual QA | PENDING | Run the 18-route 1440/768/390 matrix and 12 high-value interactions against the immutable preview. |
| Non-production Render service | BLOCKED | No connected Render service, connector, or credential exists for this repository. |
| Live Supabase authorization inventory | BLOCKED | Connector sees the ApolloDNR organization but zero projects; project `knfmdyufodbnqsgkzhqw` returns permission denied. |
| `/api/ready` | BLOCKED | Requires the isolated Render service and protected environment. |
| Opportunity database row | BLOCKED | Requires staging `DATABASE_URL`. |
| Pegasus HQ outbox and forwarding | BLOCKED | Requires staging database and HQ endpoint secrets. |
| Staff/customer notification | BLOCKED | Requires staging SendGrid configuration and marked test recipients. |
| Deployed auth negative tests | BLOCKED | Requires live Supabase project access and a deployed staging URL. |
| Rollback proof | BLOCKED | Requires the staging service and deployment history. |

## Deferred P2 Findings And Rulings

None recorded.

## Current Blocker

There is no known source/security blocker. The complete local Node 22 gate passes on the two CI corrections; the immediate work is to publish their fast-forward successor to PR #25 and require exact-head GitHub CI. The immutable Vercel preview requires Apollo's explicit authorization because it publishes the built frontend externally; cloud-browser QA follows that approval. Full backend staging proof remains blocked until the Supabase connection can access project `knfmdyufodbnqsgkzhqw` and a non-production Render service is connected or provisioned with protected environment variables. Production, `main`, and DNS remain untouched.
