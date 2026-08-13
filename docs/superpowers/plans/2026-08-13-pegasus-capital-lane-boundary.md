# Pegasus Capital Lane Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/capital` resolve from its own focused lazy module so a cold render no longer waits on the broad `pages.tsx` graph, without changing approved copy, rendered UI, or the existing one-second lane-test timeout.

**Architecture:** Preserve the complete Capital page section byte-for-byte in a new `capital-page.tsx` module. `Landing.tsx` lazy-loads that focused module directly, while `pages.tsx` keeps a named re-export for source compatibility. A deterministic source-boundary regression goes RED against the current `loadPages()` declaration; the unchanged live lane test then proves the real cold route resolves under its existing timing contract.

**Tech Stack:** React 18, TypeScript 5.6, Wouter, Vite/Rollup manifest, Vitest, Testing Library, Node 22.23.2.

## Global Constraints

- Work only on successor branch `codex/launch-recovery-v2`. Planning source `94630b4` (`fix: align listing inquiry contracts`) must be the implementation ancestor. Task 2 has passed specification and code-quality review; its controller acceptance record is intentionally pending because the controller's full-suite gate exposed this pre-existing Task 1 boundary defect. Do not create a false Task 2 acceptance checkpoint before this repair.
- Before dispatch, an independent plan reviewer must compare this complete draft with the then-current tree and parent Task 1 follow-up, validate every import/snippet, deterministic RED/GREEN behavior, byte-preservation proof, built-manifest proof, exact four-path manifest, and SDD/commit boundaries, and report zero blocker or major findings.
- After that review, the controller must promote this draft byte-for-byte to `docs/superpowers/plans/2026-08-13-pegasus-capital-lane-boundary.md` and create exactly one docs-only plan checkpoint, `docs: add capital lane boundary plan`. Dispatch only from that committed plan checkpoint; never dispatch the untracked draft.
- Use `superpowers:subagent-driven-development` with a fresh implementer, then a fresh specification reviewer and fresh code-quality reviewer. The controller alone records the later acceptance checkpoint.
- Record execution evidence in `.superpowers/sdd/2026-08-13-pegasus-capital-lane-boundary/progress.md`; it is an orchestration ledger and must not enter either tracked commit.
- Use Node `22.23.2`. Every Node/npm/npx command below supplies the absolute runtime prefix itself because separate agent tool calls may use fresh shells.
- Do not change dependencies, `package.json`, the lockfile, test timeouts, `PageLoader`, public copy, DOM structure, classes, test IDs, URLs, or navigation behavior.
- Preserve the complete Capital section—from its `CAPITAL (compliance-careful stub)` banner through the closing brace of `CapitalPage`—byte-for-byte. Only its new module imports may be added around that section.
- Dependency direction is `Landing.tsx` → `capital-page.tsx`; `pages.tsx` may re-export `capital-page.tsx`; `capital-page.tsx` must never import `pages.tsx`.
- Do not modify `client/src/__tests__/lane-pages-prd-v1.test.tsx`; its default one-second `waitFor` timeout is the live behavior contract. Do not turn the previously intermittent timing observation into the RED gate; the source-boundary assertion is deterministic.
- Implement the follow-up in exactly one commit, `fix: isolate capital lane lazy loading`, containing exactly the four implementation paths listed below. Do not amend Task 1 or Task 2 commits.
- Never stage `.recovery/`, generated `dist/`, the already committed child plan, acceptance ledgers, or unrelated user changes. Do not mutate production, Render, databases, DNS, payments, or external services.
- Use `apply_patch` for all tracked source/test edits.

---

## Controller-only pre-dispatch plan checkpoint

After the independent reviewer reports zero blocker and zero major findings, the controller performs this boundary before assigning implementation:

- [ ] Promote `.recovery/capital-lane-boundary-draft.md` byte-for-byte, using `apply_patch`, to `docs/superpowers/plans/2026-08-13-pegasus-capital-lane-boundary.md`.
- [ ] Verify and commit exactly the plan path:

```bash
cmp -s .recovery/capital-lane-boundary-draft.md docs/superpowers/plans/2026-08-13-pegasus-capital-lane-boundary.md
sha256sum .recovery/capital-lane-boundary-draft.md docs/superpowers/plans/2026-08-13-pegasus-capital-lane-boundary.md
git diff --check -- docs/superpowers/plans/2026-08-13-pegasus-capital-lane-boundary.md
git add -- docs/superpowers/plans/2026-08-13-pegasus-capital-lane-boundary.md
git diff --cached --name-only
test "$(git diff --cached --name-only | wc -l | tr -d ' ')" = "1"
git commit -m "docs: add capital lane boundary plan"
git show --format= --name-only HEAD | sed '/^$/d'
```

Expected: the two SHA-256 values match; the cached and committed manifest contains only `docs/superpowers/plans/2026-08-13-pegasus-capital-lane-boundary.md`; exactly one docs-only plan commit exists. Never stage `.recovery/`. The implementation worker begins only after this checkpoint and never amends it.

## File Map

- Modify `client/src/__tests__/pegasus-no-blank-shell.test.tsx`: pin the Capital lazy declaration to `./capital-page` and reject `loadPages()` deterministically.
- Create `client/src/pegasus/capital-page.tsx`: focused imports plus the existing Capital section copied byte-for-byte.
- Modify `client/src/pegasus/Landing.tsx`: lazy-import `CapitalPage` from the focused module.
- Modify `client/src/pegasus/pages.tsx`: remove the in-file Capital section and retain the named export via `./capital-page`.
- Verify unchanged `client/src/__tests__/lane-pages-prd-v1.test.tsx`: exercise the real `/capital` route under its existing default timeout.

### Task 1 Follow-up: Isolate the Capital lazy-loading lane

**Files:**
- Modify: `client/src/__tests__/pegasus-no-blank-shell.test.tsx`
- Create: `client/src/pegasus/capital-page.tsx`
- Modify: `client/src/pegasus/Landing.tsx`
- Modify: `client/src/pegasus/pages.tsx`
- Verify unchanged: `client/src/__tests__/lane-pages-prd-v1.test.tsx`

**Interfaces:**
- Consumes: `Nav`, `IMG`, `PageHero`, `ArrowRight`, the `route === 'capital'` branch, and the accepted Capital page JSX/copy already present in `pages.tsx`.
- Produces: named `CapitalPage` from `client/src/pegasus/capital-page.tsx`; direct focused dynamic import in `Landing.tsx`; compatible named re-export from `pages.tsx`.
- Boundary rule: the `CapitalPage` lazy declaration contains `import('./capital-page')` and contains no `loadPages()` call.
- Preservation rule: the moved Capital section is byte-identical to the section in the implementation base; the live route still renders `Capital should`, the private project-by-project disclosure, the securities note, the same button/test IDs, and the same mailto link.
- Timing rule: nine fresh focused Vitest processes must pass the existing `/capital` lane contract without editing its timeout.

- [ ] **Step 1: Confirm the independently preflighted plan checkpoint and accepted base.**

Run:

```bash
git status --short --untracked-files=no
git status --short
git branch --show-current
git log -6 --oneline
git merge-base --is-ancestor 94630b4 HEAD
git ls-files --error-unmatch docs/superpowers/plans/2026-08-13-pegasus-capital-lane-boundary.md
git diff --exit-code HEAD -- docs/superpowers/plans/2026-08-13-pegasus-capital-lane-boundary.md
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" node --version
```

Expected: clean tracked worktree; full status may show only `?? .recovery/`; branch `codex/launch-recovery-v2`; the one docs-only Capital child-plan checkpoint is at `HEAD`, Task 2 implementation `94630b4` is its immediate parent, and the tracked plan is unchanged; Node prints `v22.23.2`. Confirm the ignored Task 2 ledger records both independent approvals plus the diagnosed controller-gate failure. Record the exact plan and implementation-base SHAs in `.superpowers/sdd/2026-08-13-pegasus-capital-lane-boundary/progress.md`. Stop on any mismatch rather than mixing unrelated work into this follow-up.

- [ ] **Step 2: Add the deterministic focused-boundary and reverse-dependency RED.**

In `client/src/__tests__/pegasus-no-blank-shell.test.tsx`, change the filesystem import from:

```tsx
import { readFileSync } from "node:fs";
```

to:

```tsx
import { existsSync, readFileSync } from "node:fs";
```

Then insert this exact test immediately after `loads category pages from a focused lazy module`:

```tsx
  it("loads the capital page from a focused lazy module", () => {
    const capitalStart = landingSource.indexOf("const CapitalPage =");
    const nextLazyStart = landingSource.indexOf(
      "const OurWorkPage =",
      capitalStart,
    );

    expect(capitalStart).toBeGreaterThan(-1);
    expect(nextLazyStart).toBeGreaterThan(capitalStart);

    const capitalBoundary = landingSource.slice(capitalStart, nextLazyStart);
    expect(capitalBoundary).toContain("import('./capital-page')");
    expect(capitalBoundary).not.toContain("loadPages()");

    const capitalModulePath = resolve(
      import.meta.dirname,
      "../pegasus/capital-page.tsx",
    );
    expect(existsSync(capitalModulePath)).toBe(true);
    const capitalModuleSource = readFileSync(capitalModulePath, "utf8");
    expect(capitalModuleSource).not.toMatch(
      /(?:from\s+|import\(\s*)["']\.\/pages["']/,
    );
  });
```

Do not edit the existing category-boundary test or any wait timeout.

- [ ] **Step 3: Run the new test and verify the intended RED.**

Run:

```bash
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run client/src/__tests__/pegasus-no-blank-shell.test.tsx -t "loads the capital page from a focused lazy module"
```

Expected: one failed test at the direct-import assertion because the current Capital declaration contains `loadPages()` and does not contain `import('./capital-page')`. The later assertions also pin the focused module's existence and reject a reverse import of `./pages` once the direct boundary is implemented. If collection fails, the test passes, or a different assertion fails first, correct the test before changing production code.

- [ ] **Step 4: Create the focused Capital module with exact production code.**

Create `client/src/pegasus/capital-page.tsx` with exactly:

```tsx
import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Nav } from './theme';
import { IMG } from './primitives';
import { PageHero } from './blocks';

/* ================================================================
   CAPITAL (compliance-careful stub)
   ================================================================ */
export function CapitalPage({ go }: { go: Nav }) {
  return (
    <>
      {/* COPY_DECK §8 locked hero + required no-public-offering note (issue #22) */}
      <PageHero eyebrow="Capital partners"
        title={<>Capital should <span className="italic text-[var(--accent-bright)]">follow discipline.</span></>}
        image={IMG('pegasus-closing.png')}
        lead="Pegasus reviews capital relationships project-by-project. No public offering, no guaranteed returns, no pooled fund. Any capital relationship must be privately reviewed and documented appropriately." />
      <section className="py-24 lg:py-28">
        <div className="max-w-[760px] mx-auto px-6 lg:px-12 text-center">
          <p className="text-[var(--muted)] leading-relaxed text-lg mb-6">
            Capital partnerships are arranged privately, one project at a time, through direct conversation. Never a blind pool. Terms are specific to the project and put in writing before anything moves. If that is how you prefer to work, request a private review.
          </p>
          <p className="text-[var(--text-2)] text-[0.95rem] leading-relaxed mb-9" data-testid="text-capital-securities">
            No securities are offered through this website.
          </p>
          <button type="button" onClick={() => go('connect')} data-testid="button-capital-connect"
            className="btn-primary px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group">
            Request Private Review <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <div className="mt-6">
            <a href="mailto:apollo@pegasusdreamscapes.com" className="link-underline pg-label !text-[10px] !tracking-[0.18em] text-[var(--muted)]">
              apollo@pegasusdreamscapes.com
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
```

The five import lines are the new module shell. Everything from the `CAPITAL (compliance-careful stub)` banner through the final brace is an exact move, not a rewrite.

- [ ] **Step 5: Point Landing at the focused module and retain the compatibility export.**

In `client/src/pegasus/Landing.tsx`, replace exactly:

```tsx
const CapitalPage = lazy(() => loadPages().then((module) => ({ default: module.CapitalPage })));
```

with:

```tsx
const CapitalPage = lazy(() => import('./capital-page').then((module) => ({ default: module.CapitalPage })));
```

In `client/src/pegasus/pages.tsx`, change the export area from:

```tsx
export { CategoryPage } from './category-page';
```

to:

```tsx
export { CategoryPage } from './category-page';
export { CapitalPage } from './capital-page';
```

Then remove exactly this complete in-file section from `pages.tsx`:

```tsx
/* ================================================================
   CAPITAL (compliance-careful stub)
   ================================================================ */
export function CapitalPage({ go }: { go: Nav }) {
  return (
    <>
      {/* COPY_DECK §8 locked hero + required no-public-offering note (issue #22) */}
      <PageHero eyebrow="Capital partners"
        title={<>Capital should <span className="italic text-[var(--accent-bright)]">follow discipline.</span></>}
        image={IMG('pegasus-closing.png')}
        lead="Pegasus reviews capital relationships project-by-project. No public offering, no guaranteed returns, no pooled fund. Any capital relationship must be privately reviewed and documented appropriately." />
      <section className="py-24 lg:py-28">
        <div className="max-w-[760px] mx-auto px-6 lg:px-12 text-center">
          <p className="text-[var(--muted)] leading-relaxed text-lg mb-6">
            Capital partnerships are arranged privately, one project at a time, through direct conversation. Never a blind pool. Terms are specific to the project and put in writing before anything moves. If that is how you prefer to work, request a private review.
          </p>
          <p className="text-[var(--text-2)] text-[0.95rem] leading-relaxed mb-9" data-testid="text-capital-securities">
            No securities are offered through this website.
          </p>
          <button type="button" onClick={() => go('connect')} data-testid="button-capital-connect"
            className="btn-primary px-8 py-4 pg-label !text-[10px] inline-flex items-center gap-3 group">
            Request Private Review <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <div className="mt-6">
            <a href="mailto:apollo@pegasusdreamscapes.com" className="link-underline pg-label !text-[10px] !tracking-[0.18em] text-[var(--muted)]">
              apollo@pegasusdreamscapes.com
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
```

Keep every existing `pages.tsx` import unchanged: `React`, `ArrowRight`, `Nav`, `IMG`, and `PageHero` all still have non-Capital consumers elsewhere in that file.

- [ ] **Step 6: Prove the move is byte-identical and the source graph is one-way.**

Run this comparison before committing, while `HEAD` is still the docs-only plan checkpoint:

```bash
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" node --input-type=module <<'NODE'
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const sectionStart = `/* ================================================================
   CAPITAL (compliance-careful stub)
   ================================================================ */
export function CapitalPage`;
const sectionEnd = `
/* ================================================================
   STRATEGY LAB + MARKETFLOW`;
const beforeSource = execFileSync(
  'git',
  ['show', 'HEAD:client/src/pegasus/pages.tsx'],
  { encoding: 'utf8' },
);
const beforeStart = beforeSource.indexOf(sectionStart);
const beforeEnd = beforeSource.indexOf(sectionEnd, beforeStart);
if (beforeStart < 0 || beforeEnd < 0) {
  throw new Error('Capital section markers are missing from the implementation base');
}
const before = beforeSource.slice(beforeStart, beforeEnd).trimEnd();

const capitalSource = readFileSync('client/src/pegasus/capital-page.tsx', 'utf8');
const afterStart = capitalSource.indexOf(sectionStart);
if (afterStart < 0) {
  throw new Error('Capital section is missing from the focused module');
}
const after = capitalSource.slice(afterStart).trimEnd();
if (before !== after) {
  throw new Error('Capital section changed during extraction');
}

const landingSource = readFileSync('client/src/pegasus/Landing.tsx', 'utf8');
const capitalStart = landingSource.indexOf('const CapitalPage =');
const capitalEnd = landingSource.indexOf('const OurWorkPage =', capitalStart);
if (capitalStart < 0 || capitalEnd <= capitalStart) {
  throw new Error('Capital lazy boundary is missing');
}
const boundary = landingSource.slice(capitalStart, capitalEnd);
if (!boundary.includes("import('./capital-page')") || boundary.includes('loadPages()')) {
  throw new Error('Landing still routes Capital through the broad pages loader');
}
if (/(?:from\s+|import\(\s*)['"]\.\/pages['"]/.test(capitalSource)) {
  throw new Error('capital-page imports the broad pages module');
}

const pagesSource = readFileSync('client/src/pegasus/pages.tsx', 'utf8');
if (!pagesSource.includes("export { CapitalPage } from './capital-page';")) {
  throw new Error('pages.tsx compatibility re-export is missing');
}
if (pagesSource.includes('export function CapitalPage')) {
  throw new Error('pages.tsx still defines CapitalPage inline');
}

console.log('Capital byte-preserving source boundary: PASS');
NODE
```

Expected: `Capital byte-preserving source boundary: PASS`.

- [ ] **Step 7: Run the deterministic focused regression and verify GREEN.**

Run:

```bash
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run client/src/__tests__/pegasus-no-blank-shell.test.tsx -t "loads the capital page from a focused lazy module"
```

Expected: one passing test.

- [ ] **Step 8: Prove the real Capital lane in nine fresh processes without changing its timeout.**

Run:

```bash
for capital_run in 1 2 3 4 5 6 7 8 9; do
  echo "capital cold process ${capital_run}/9"
  env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run client/src/__tests__/lane-pages-prd-v1.test.tsx -t "locks the /capital hero" || exit 1
done
git diff --exit-code HEAD -- client/src/__tests__/lane-pages-prd-v1.test.tsx
```

Expected: all nine fresh processes pass the real `/capital` hero/disclosure case; the unchanged-file check exits 0. Do not increase the timeout if any run fails—return to the module boundary and imports.

- [ ] **Step 9: Run the complete focused public-lane regression set.**

Run:

```bash
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npx vitest run client/src/__tests__/pegasus-no-blank-shell.test.tsx client/src/__tests__/lane-pages-prd-v1.test.tsx client/src/__tests__/cta-labels.test.tsx client/src/__tests__/cta-routing.test.tsx
```

Expected: all four files pass with no timeout, copy, or UI changes.

- [ ] **Step 10: Run the full test, type, production-build, bundle, diff, and manifest gates.**

Run:

```bash
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm test
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm run check
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm run build
git diff --check
```

Expected: all exit 0; do not stage generated `dist/`. If and only if the managed sandbox rejects the `tsx` CLI's Unix IPC listener before repository code runs, execute the same build entrypoint and bundle gate without the CLI listener, record that environment ruling, and do not change package scripts:

```bash
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" node --import tsx script/build.ts
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" npm run check:bundle
```

After a successful build, prove the focused entry does not import or fold into the broad entry:

```bash
env PATH="/tmp/pegasus-foundation-npm-cache/_npx/5dad66f2cb301fc2/node_modules/node/bin:$PATH" node --input-type=module <<'NODE'
import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(
  await readFile('dist/public/.vite/manifest.json', 'utf8'),
);
const entries = Object.entries(manifest);
const capital = entries.find(([, value]) => value.name === 'capital-page');
const pages = entries.find(([, value]) => value.name === 'pages');

if (!capital?.[1].isDynamicEntry) {
  throw new Error('capital-page is not a dynamic entry');
}
if (!pages?.[1].isDynamicEntry) {
  throw new Error('pages is not a dynamic entry');
}
if (capital[0] === pages[0] || capital[1].file === pages[1].file) {
  throw new Error('capital-page was folded into the broad pages entry');
}
if (capital[1].imports?.includes(pages[0])) {
  throw new Error('capital-page still imports the broad pages entry');
}
if (capital[1].dynamicImports?.includes(pages[0])) {
  throw new Error('capital-page dynamically imports the broad pages entry');
}

console.log(`capital boundary PASS: ${capital[1].file}`);
console.log(`broad pages entry: ${pages[1].file}`);
NODE
```

Expected: two distinct asset paths and a `capital boundary PASS` line.

- [ ] **Step 11: Inspect the exact diff and stage only the four implementation paths.**

Run:

```bash
git status --short
git diff -- client/src/__tests__/pegasus-no-blank-shell.test.tsx client/src/pegasus/capital-page.tsx client/src/pegasus/Landing.tsx client/src/pegasus/pages.tsx
git diff --check
git diff --exit-code HEAD -- client/src/__tests__/lane-pages-prd-v1.test.tsx package.json package-lock.json
git add -- client/src/__tests__/pegasus-no-blank-shell.test.tsx client/src/pegasus/capital-page.tsx client/src/pegasus/Landing.tsx client/src/pegasus/pages.tsx
git diff --cached --name-only | LC_ALL=C sort
test "$(git diff --cached --name-only | wc -l | tr -d ' ')" = "4"
git diff --cached --check
```

The sorted cached manifest must be exactly:

```text
client/src/__tests__/pegasus-no-blank-shell.test.tsx
client/src/pegasus/Landing.tsx
client/src/pegasus/capital-page.tsx
client/src/pegasus/pages.tsx
```

The full status may additionally show only `?? .recovery/` and ignored/generated build output. Never stage either.

- [ ] **Step 12: Create the one implementation commit and return it for review.**

Commit and verify:

```bash
git commit -m "fix: isolate capital lane lazy loading"
git show --stat --oneline HEAD
git show --format= --name-only HEAD | sed '/^$/d' | LC_ALL=C sort
test "$(git show --format= --name-only HEAD | sed '/^$/d' | wc -l | tr -d ' ')" = "4"
git status --short --untracked-files=no
git status --short
```

Expected: exactly one implementation commit with the four-path manifest above; clean tracked worktree; full status may show only the intentionally untracked `.recovery/`. Return the implementation SHA, the deterministic RED output, all nine cold-process GREEN results, focused/full gate results, byte-preservation output, and manifest output to the controller for fresh specification review and then fresh code-quality review. Do not push, amend accepted commits, or update acceptance records.

---

## Controller-only acceptance checkpoint

After both fresh reviewers approve the exact implementation commit, the controller records this Task 1 follow-up in the parent recovery plan/status/ledger using a separate docs-only acceptance commit, then fast-forwards the successor branch without force. That later bookkeeping is not part of the four-path implementation manifest and must not be folded into either the child-plan checkpoint or implementation commit.
