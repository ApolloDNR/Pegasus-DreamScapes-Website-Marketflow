# SDD ledger — plan: docs/superpowers/plans/2026-08-16-anti-slop-visual-correction.md

Baseline head: `f7651c988c3494b75cf0a5d87b2b91d2592f33a0` on `codex/launch-recovery-v2`.

## Preflight authority rulings

- Ruling: Execute a prerequisite Task 0 to diagnose and repair the deterministic `npm ci` CI failure before visual Tasks 1–6 — the newer 2026-08-20 Work handoff explicitly orders CI repair first and the owner repeated that directive — if wrong, visual work is delayed by the CI investigation but no product behavior is changed.
- Ruling: Where the 2026-08-16 plan names obsolete/unmounted homepage or navigation files, apply its requirements to the mounted v5.1 shell named by the newer handoff — the Final Design Lock and correction spec govern visible behavior, while editing unmounted files would create false progress — if wrong, the implementation diff may not match the plan's illustrative file list even though the active rendered surface is corrected.
- Ruling: Preserve the four paths and route contracts on the mounted Work With Apollo selector instead of reviving the unmounted legacy page architecture — the newer handoff and mounted-surface audit make the active v5.1 route authoritative — if wrong, a later owner-approved copy/routing migration may be needed, but lead, intake, server, and security contracts remain unchanged.
- Ruling: Isolate the Work With Apollo portrait treatment and decorative-contour removal with scoped optional component variants — if wrong and the visual correction was intended globally, unrelated routes retain their old presentation rather than being unintentionally redesigned.

## Preflight interface scan

| Tasks | Producer / consumer interface | Finding |
|---|---|---|
| 0 → 1–7 | Deterministic install and full CI must be available to verify every later slice. | Newer handoff moves this prerequisite ahead of visual work; covered by ruling above. |
| 1 → 2 | Task 1 produces homepage arrival/global header; Task 2 consumes that shell and edits homepage rhythm. | Sequential and compatible; both may touch the mounted homepage and shared chrome, so review Task 1 before Task 2. |
| 1 → 3–6 | Task 1 global navigation/chrome is shared by all priority routes. | Compatible; later routes must preserve the locked nav and sole header CTA. |
| 2 → 7 | Task 2 produces the final homepage composition consumed by release verification. | Compatible. |
| 3 → 7 | Task 3 preserves Strategy Lab engine behavior while changing presentation. | Compatible; engine/gating tests are the boundary. |
| 4 → 7 | Task 4 preserves KW/DRE role separation and CTA routing. | Compatible; disclosure assertions are the boundary. |
| 5 → 7 | Task 5 preserves MarketFlow auth/data behavior and private-pilot state. | Compatible; authorization and truthful-state tests are the boundary. |
| 6 → 7 | Task 6 preserves intake contracts/security while changing form presentation and feedback. | Compatible; form integration tests are the boundary. |
| 1 (self) | Locked hero/nav tests precede active-shell changes. | Internally consistent, subject to mounted-file ruling above. |
| 2 (self) | Homepage regression assertions precede composition changes. | Internally consistent. |
| 3 (self) | Strategy Lab behavior/gating tests precede presentation changes. | Internally consistent. |
| 4 (self) | Role, disclosure, and routing assertions precede visual changes. | Internally consistent. |
| 5 (self) | Privacy/access-state assertions precede presentation changes. | Internally consistent. |
| 6 (self) | Validation/loading/error/success assertions precede presentation changes. | Internally consistent. |
| 7 (self) | Exact-head verification, evidence, protected noindex preview, and handoff follow Tasks 0–6. | Internally consistent; owner visual approval remains an external merge/launch gate. |

## Task status

- Task 0: initial implementation tree `923e64b` (published as `7d5eac4`) — review found one Important guard-validation gap.
- Task 0: fix round 1/5 tree `e9ae396` (published as `5da1466`) — hardened URL validation and added focused executable coverage; re-review passed with no findings.
- Task 0: complete on the canonical remote branch at `5da1466c2513f387eca29c4246f8ef25fd3ef6ba`.
- Task 0: exact-head GitHub run `32448521221` proved the registry guard, deterministic install, Chromium install, production audit, and environment contract pass; the run then stopped at the pre-existing stale `@/pegasus/home-v6` test import now assigned to Task 1.
- Task 1: implementation tree `2f058fe` published on the canonical branch as `ecf8d67`; 55 focused tests, TypeScript, build, and bundle budget passed locally.
- Task 1: CodeRabbit CLI review could not initialize because it hardcodes read-only `/root/.coderabbit`; the official PR bot fallback also skipped because PR #26 has 227 files versus its 100-file limit. No CodeRabbit issues were produced and no manual result is being represented as CodeRabbit output.
- Task 1: complete subject to exact-head hosted CI and later rendered evidence; the production shell was unchanged because it already matched the locked Task 1 arrival/header contract.
- Task 2: in progress on the mounted v5.1 homepage.
- Task 3: implementation complete at `7b49f476d3bb26ceb4ea0404ff825fadecf9dc24`; 229 protected focused tests, TypeScript, the production build, the bundle budget, and diff hygiene passed locally.
- Task 3: rendered 1440/1024/768/390 evidence and exact-head hosted CI remain Task 7 gates; no local rendered-browser pass is claimed.
- Task 4: implementation complete at `4cb6364aa9f67efa55d2ad0a8f83416e2c6a6982`; 7 mounted behavior tests and a 168-test protected form/disclosure/CTA/route/keyboard suite passed, with TypeScript, production build, bundle budget, and diff hygiene green.
- Task 4: rendered 1440/1024/768/390 evidence and exact-head hosted CI remain Task 7 gates; no local rendered-browser pass is claimed.
- Tasks 5–7: pending implementation.
