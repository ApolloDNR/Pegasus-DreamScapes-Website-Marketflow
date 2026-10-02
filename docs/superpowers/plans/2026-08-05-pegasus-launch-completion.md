# Pegasus Launch Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn PR #25 into a visually verified, CI-green, staging-proven Pegasus Dreamscapes launch candidate without touching production or DNS before Apollo approves the controlled launch.

**Architecture:** The existing `agent/launch-hardening-review` branch remains the only implementation surface. The work proceeds through three evidence layers: exact-commit rendered QA, repository release verification, then external staging verification. Git commits, the PR head, this plan, and the plan-specific SDD ledger are the recovery record; chat narration is never treated as task completion.

**Tech Stack:** React 18, TypeScript, Vite, Wouter, Express, Vitest, Supabase Auth, Postgres/Drizzle, SendGrid, Pegasus HQ HTTPS outbox, GitHub Actions, Render.

## Master Execution Contract

On every new or recovered session:

1. Open this plan, `AGENTS.md`, and the plan-specific SDD ledger before dispatching work.
2. Reconcile the local branch with PR #25, the plan checklists, and the plan-specific SDD ledger; resume at the first task still unchecked after that reconciliation. Never restart a task with durable completion evidence just because a temporary checkout disappeared.
3. Continue autonomously through every safe local and review-branch task. A commentary update is not a checkpoint and must not end the run.
4. Record every accepted result in Git, PR evidence, or the SDD ledger before moving on.
5. Stop only for a verified external-access blocker, destructive data risk, legal/compliance decision, production/deployment approval, source-of-truth contradiction, or a repeated verification failure that cannot be resolved safely.
6. When blocked, report one exact action Apollo must take, the evidence that established the blocker, and the first command or check that resumes work afterward.

## Global Constraints

- Public brand casing is exactly `Pegasus Dreamscapes`.
- The public story is: bring the situation, Pegasus reviews it, Pegasus identifies a lane, and a human-reviewed next step is offered only when appropriate.
- MarketFlow is private beta and reviewed access only; it is not a public marketplace or public investment platform.
- Deal Blueprint is by-review only; no public checkout, guaranteed result, valuation, appraisal, or offer.
- Peggy is intake and orientation, never the decision-maker.
- Preserve the locked dark navy, copper, cream, Playfair Display, Inter, and restrained Cinzel design system.
- Do not add fake metrics, testimonials, inventory, case status, trust claims, or persuasive placeholder data.
- No production, `main`, Render production service, live database mutation, test lead, DNS, payment activation, or broad public launch without the applicable launch gate and Apollo's approval.
- No completion claim without fresh evidence from the exact final commit.

## Definition Of Done

The review branch is complete only when all of the following are true:

- The exact PR build is visually inspected at 1440px, 768px, and 390px on every priority route.
- Home, navigation, primary conversion doors, Peggy, forms, theme control, legal links, and branded 404 behavior work without relevant console errors or layout overflow.
- All confirmed P0 and P1 defects are fixed and regression-covered; P2 items are either fixed or explicitly recorded with a launch ruling.
- Node 22, typecheck, all Vitest tests, production build, bundle budget, example launch contract, high-severity runtime audit, route/SEO/accessibility checks, and diff/secret hygiene pass on the exact commit.
- PR #25 points to that exact commit and GitHub Actions is green on it.
- A non-production Render release candidate returns 200 from `/api/ready` and passes canonical opportunity intake, database row, HQ outbox/forwarding, staff/customer notification, and auth checks.
- Live Supabase policies, grants, views, default privileges, and privileged functions are verified with self-access and cross-account negative tests.
- Rollback is documented and verified before production approval is requested.

---

### Task 1: Durable Recovery And Launch Ledger

**Files:**
- Modify: `docs/AUTOMATION_GOAL.md`
- Create: `docs/qa/launch-completion-status.md`
- Existing plan: `docs/superpowers/plans/2026-08-05-pegasus-launch-completion.md`

**Interfaces:**
- Consumes: PR #25, branch `agent/launch-hardening-review`, `AGENTS.md`, and the launch/design documents named there.
- Produces: a canonical resume pointer plus a route, viewport, verification, and blocker ledger used by every later task.

- [x] **Step 1: Add the canonical resume rule to the automation goal**

Add the plan path, branch, PR number, no-status-only-exit rule, and exact stop conditions to `docs/AUTOMATION_GOAL.md`.

- [x] **Step 2: Create the launch status ledger**

Create `docs/qa/launch-completion-status.md` with these sections: source commit, PR/CI evidence, route-by-viewport matrix, interaction results, automated gate results, external staging results, deferred P2 findings with rulings, and current blocker.

- [x] **Step 3: Verify the recovery contract is complete**

Run:

```bash
rg -n "2026-08-05-pegasus-launch-completion|agent/launch-hardening-review|PR #25|status-only|Stop only" docs/AUTOMATION_GOAL.md docs/qa/launch-completion-status.md
```

Expected: every recovery identifier and stop rule appears in the durable docs.

- [x] **Step 4: Commit the durable checkpoint**

```bash
git add docs/AUTOMATION_GOAL.md docs/qa/launch-completion-status.md docs/superpowers/plans/2026-08-05-pegasus-launch-completion.md
git commit -m "docs: lock Pegasus launch completion plan"
```

### Task 2: Exact-Commit Rendered Product Audit

**Files:**
- Modify: `docs/qa/launch-completion-status.md`
- Inspect: `client/src/pegasus/`, `client/src/components/`, `client/src/pages/`, `client/src/index.css`
- Test: current production bundle served by `dist/index.cjs`

**Interfaces:**
- Consumes: the clean Task 1 commit and the locked design/launch rules.
- Produces: current-run screenshots outside the repository and a concrete P0/P1/P2 finding list in the launch ledger.

- [x] **Step 1: Prove the artifact can be built and served**

Run:

```bash
NPM_CONFIG_CACHE=/tmp/pegasus-node22-cache npx --yes -p node@22.23.2 -c 'node --version && npm run check && npm run build'
NPM_CONFIG_CACHE=/tmp/pegasus-node22-cache npx --yes -p node@22.23.2 -c 'npm exec -- vite preview --host 0.0.0.0 --port 5000'
```

Expected: Node reports `v22.23.2`, typecheck and build exit 0, Vite serves the built `dist/public` artifact on port 5000 without requiring production database secrets, and `/` returns the Pegasus application. API-dependent success submissions remain reserved for Task 6 staging.

- [x] **Step 2: Capture the priority route matrix**

Using the cloud browser, capture fresh 1440px, 768px, and 390px evidence for:

```text
/
/property-owners
/deal-partners
/how-we-operate
/development
/strategy-lab
/work-with-apollo
/marketflow
/bring-an-opportunity
/connect
/peggy
/contact
/privacy
/terms
/disclosures
/__launch-404-check
```

For every capture, verify page identity, meaningful content, no framework overlay, no horizontal overflow, clear primary CTA, and no relevant console error.

- [x] **Step 3: Exercise the conversion and navigation interactions**

Exercise desktop navigation and More menu, mobile menu, theme toggle, homepage primary CTA, intake first-step validation, Strategy Lab primary interaction, MarketFlow access request path, Peggy open/close plus one approved handoff, contact form validation, cookie choice, keyboard focus order, and the 404 recovery action.

- [x] **Step 4: Grade every finding**

Record each observed issue in `docs/qa/launch-completion-status.md` as P0, P1, or P2 using `docs/qa/final-launch-gate.md`. Include route, viewport, reproduction, visible evidence, likely owning file, and required outcome. If no issue exists at a step, record `PASS`; do not leave blank cells.

- [x] **Step 5: Commit the evidence ledger**

```bash
git add docs/qa/launch-completion-status.md
git commit -m "docs: record exact-commit launch QA"
```

- [ ] **Step 6: Refresh visual evidence on the immutable final preview**

The earlier 17-route audit remains the defect-discovery baseline, but later privacy, MarketFlow, mobile, and browser-gate changes invalidate it as final-commit evidence. After Task 5 publishes the exact candidate and a non-production preview exists, run the current 18-route matrix at 1440px, 768px, and 390px in the cloud browser, rerun the 12 high-value journeys, and replace every `PENDING` ledger cell with a current result.

### Task 3: P0 And P1 Product Remediation

**Files:**
- Modify: only files named by confirmed P0/P1 entries in `docs/qa/launch-completion-status.md`
- Test: nearest existing `client/src/__tests__/*.test.tsx`, `server/__tests__/*.test.ts`, or a new focused regression beside the owning surface
- Modify: `docs/qa/launch-completion-status.md`

**Interfaces:**
- Consumes: the concrete Task 2 finding list.
- Produces: regression-covered fixes and a ledger with no unresolved P0/P1 entry.

- [x] **Step 1: Create one failing regression per confirmed defect**

Use the nearest existing test pattern. For responsive-only defects, add a deterministic DOM/class/route assertion when possible and retain rendered before/after evidence as the visual proof.

- [x] **Step 2: Prove each regression detects the defect**

Run the focused test before the fix and record the failing assertion in the task report. For visual-only issues without a meaningful unit assertion, reproduce the issue again at its exact viewport and record the screenshot evidence.

- [x] **Step 3: Apply the smallest compliant fix**

Preserve routes, forms, integrations, copy boundaries, brand assets, and design tokens. Do not redesign neighboring surfaces or add new sections.

- [x] **Step 4: Re-run focused tests and rendered reproduction**

Expected: the focused regression passes, the exact viewport no longer shows the defect, related interaction still works, and the browser console remains healthy.

- [x] **Step 5: Close or rule every launch finding**

Update each P0/P1 row to `FIXED` with commit/test evidence and the exact task-owned source and focused-test paths used by its coherent fix slice. Fix P2 findings that materially affect trust or conversion; record a concise launch-safe ruling for any intentionally deferred P2.

- [x] **Step 6: Commit each coherent fix slice**

1. Confirm each finding in the slice names its exact task-owned source path and, if created or changed, its exact focused-test path.
2. Stage each of those named paths one-by-one with a separate `git add --` command. Do this before staging the ledger; no other path is authorized for this slice.
3. After the named source and test paths are staged, run the following sequence to validate the worktree, stage the ledger, review the complete cached path list, and commit:

```bash
git status --short
git diff --check
git add -- docs/qa/launch-completion-status.md
git diff --cached --name-only
git commit -m "fix: close confirmed launch defects"
```

Compare `git diff --cached --name-only` with the exact paths recorded in the findings plus the ledger before committing. Do not use broad update-only, dot-path, or all-path staging in this concurrent worktree.

### Task 4: Complete Local Release Gate

**Files:**
- Modify: `docs/qa/launch-completion-status.md`
- Inspect: `.env.example`, `render.yaml`, `.github/workflows/`, `docs/deploy/`, tracked migrations, and the final Git diff

**Interfaces:**
- Consumes: the final local product tree with no unresolved P0/P1 finding.
- Produces: fresh exact-commit release evidence suitable for PR publication.

- [x] **Step 1: Reinstall from the lockfile under Node 22**

```bash
NPM_CONFIG_CACHE=/tmp/pegasus-launch-npm-cache npx --yes -p node@22.23.2 -c 'node --version && npm ci --cache /tmp/pegasus-launch-npm-cache'
```

Expected: Node reports `v22.23.2`, installation exits 0, and the lockfile remains unchanged.

- [x] **Step 2: Run the repository release commands**

```bash
NPM_CONFIG_CACHE=/tmp/pegasus-launch-npm-cache npx --yes -p node@22.23.2 -c 'npm audit --omit=dev --audit-level=high'
NPM_CONFIG_CACHE=/tmp/pegasus-launch-npm-cache npx --yes -p node@22.23.2 -c 'npm run smoke:launch -- --example'
NPM_CONFIG_CACHE=/tmp/pegasus-launch-npm-cache npx --yes -p node@22.23.2 -c 'npm run check'
NPM_CONFIG_CACHE=/tmp/pegasus-launch-npm-cache npx --yes -p node@22.23.2 -c 'npm test'
NPM_CONFIG_CACHE=/tmp/pegasus-launch-npm-cache npx --yes -p node@22.23.2 -c 'npm run build'
```

Expected: zero high/critical production advisories, environment example contract passes, TypeScript exits 0, all tests pass with zero failures, and production build plus bundle budget exits 0.

- [ ] **Step 3: Re-run the high-value rendered smoke**

Re-check `/`, `/bring-an-opportunity`, `/strategy-lab`, `/marketflow`, `/work-with-apollo`, mobile navigation, Peggy, and 404 on the freshly installed exact build.

- [x] **Step 4: Run diff, secret, and launch-doctrine hygiene**

```bash
git diff --check
git status --short
git diff --name-only origin/main...HEAD
git grep -nE "(SUPABASE_SERVICE_ROLE_KEY|SENDGRID_API_KEY|DATABASE_URL)=.+" -- ':!package-lock.json'
```

Expected: no whitespace errors, no unintended uncommitted files, only intended branch files, and no committed secret assignment.

- [ ] **Step 5: Record exact results**

Write command, timestamp, commit, pass count, build result, audit result, rendered smoke result, and any bounded warning into `docs/qa/launch-completion-status.md`, then commit the ledger.

Local runtime evidence is recorded before publication; the rendered result and final commit identifier remain pending until GitHub CI and cloud-browser QA complete.

### Task 5: Publish And Prove PR #25

**Files:**
- Modify: PR #25 description/checklist only after the local exact-commit gate passes

**Interfaces:**
- Consumes: the exact verified Task 4 commit.
- Produces: a remote review branch whose Git tree matches locally and whose GitHub Actions checks are green.

- [ ] **Step 1: Confirm remote concurrency safety**

Fetch PR #25 and compare its head with `origin/agent/launch-hardening-review`. If the remote moved, reconcile by tree comparison and fast-forward commits only; never force-push or overwrite concurrent work.

- [ ] **Step 2: Publish the verified branch**

Push `agent/launch-hardening-review`, or use the connected GitHub API if direct credentials are unavailable. Compare the remote tree SHA with the locally verified tree SHA.

- [ ] **Step 3: Update PR evidence**

Record the Node version, test count, build/bundle result, security audit result, rendered viewport matrix, resolved P0/P1 count, remaining P2 rulings, and external staging gates that remain blocked.

- [ ] **Step 4: Wait for GitHub Actions on the exact head**

Do not cite an older run. Inspect failures, fix on the review branch, rerun the complete affected gate, and require all required checks green on the final commit.

### Task 6: Non-Production Staging And Live-Service Proof

**Files:**
- Modify: `docs/qa/launch-completion-status.md`
- Inspect/execute: `docs/deploy/RENDER_DEPLOY.md`, `docs/deploy/SUPABASE_LAUNCH_VERIFICATION.sql`, reviewed migrations, and `scripts/launch-intake-smoke.mjs`

**Interfaces:**
- Consumes: the exact GitHub-green PR commit plus authorized staging credentials and a non-production Render service/database.
- Produces: an evidence-backed ship/no-ship decision without changing production or DNS.

- [ ] **Step 1: Resolve staging control surfaces**

Verify access to a non-production Render service, its Postgres `DATABASE_URL`, the tracked Supabase project, SendGrid test sender/recipient, and Pegasus HQ intake endpoint without printing secret values.

- [ ] **Step 2: Record Apollo's explicit staging-write approval**

Before any staging database mutation, including applying migrations, changing rows, or submitting a marked test lead, obtain and record Apollo's explicit approval. The approval record must name the non-production Render service/database and the exact PR commit being tested. Without that record, Task 6 is limited to read-only access and authorization inventory; mark the staging gate blocked and do not deploy, migrate, or post a test lead. This approval never authorizes production, DNS, or a different external target.

- [ ] **Step 3: Verify Supabase live authorization**

Run `docs/deploy/SUPABASE_LAUNCH_VERIFICATION.sql`, inventory exposed policies/grants/views/default privileges/`SECURITY DEFINER` functions, then prove self-access succeeds and anonymous/cross-account access fails with normal user tokens.

- [ ] **Step 4: Apply reviewed staging migrations and prove readiness**

After the Step 2 approval is recorded, back up staging, apply only reviewed migrations, deploy the approved exact PR commit, and require `/api/ready` to return 200 with the required database columns and integrations present.

- [ ] **Step 5: Run one marked staging opportunity**

```bash
test -n "$PEGASUS_STAGING_BASE_URL"
npm run smoke:launch -- --base-url "$PEGASUS_STAGING_BASE_URL" --post-test-lead
```

After the Step 2 approval is recorded, confirm the marked test creates the opportunity row, creates/forwards the HQ outbox item, sends expected staff/customer notification, produces no sensitive logs, and is archived or deleted afterward.

- [ ] **Step 6: Verify deployed auth and public routes**

Test signup/login/logout redirects, self profile access, cross-account denial, route health, SSL, robots, sitemap, canonical tags, OG image, favicon, and the priority viewport matrix against the actual staging hostname.

- [ ] **Step 7: Verify rollback and record the launch decision**

Document the previous deploy identifier, database backup/restore path, and rollback steps. Mark staging `GO` only if every P0 gate passes; otherwise mark `NO-GO` with one exact blocker and resume point.

### Task 7: Controlled Production Handoff

**Files:**
- Modify: `docs/qa/launch-completion-status.md`

**Interfaces:**
- Consumes: a GitHub-green PR, staging `GO`, rollback proof, and Apollo's explicit production approval.
- Produces: a merge/deploy decision with no ambiguity about what was proven.

- [ ] **Step 1: Present the final evidence packet**

Report the final PR commit, CI run, route matrix, accessibility/console result, staging smoke, live Supabase authorization result, rollback proof, remaining P2 rulings, and qualified legal/compliance gate.

- [ ] **Step 2: Request the production decision**

Ask Apollo once whether to merge PR #25 and start the controlled Render production deployment. Do not merge, deploy, or change DNS before this approval.

- [ ] **Step 3: After approval, merge and monitor**

Merge only the reviewed PR, verify the production deploy matches the merged SHA, rerun `/api/ready`, canonical intake smoke, core route/mobile QA, auth, SSL/SEO assets, and logs, then monitor the initial soft launch before any broad QR/card distribution.
