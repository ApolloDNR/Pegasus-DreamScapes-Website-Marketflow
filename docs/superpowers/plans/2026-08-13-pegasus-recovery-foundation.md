# Pegasus Recovery Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace stale recovery pointers and isolate the public audience-category page behind its own route-level lazy module so the first `/buyers` render no longer races Vitest's one-second default wait.

**Architecture:** `Landing.tsx` remains the public shell. It will dynamically import `category-page.tsx` directly for `/buyers`, `/operators`, and `/referral`. The broad `pages.tsx` module re-exports `CategoryPage` only for existing direct-import tests and callers; the focused module never imports `pages.tsx`. Public copy and component behavior remain byte-for-byte equivalent. Recovery documents identify the current source, branch, evidence boundary, and approval gates without treating PR #25 evidence as current.

**Tech Stack:** React 18, TypeScript, Vite/Rollup manifest, Wouter, Vitest, Testing Library, Node 22.23.2.

## Global Constraints

- Parent program: `docs/superpowers/plans/2026-08-13-pegasus-security-launch-recovery.md`, Task 1.
- Use Node `22.23.2`; do not change dependencies or the lockfile.
- Record Task 1 orchestration evidence only in `.superpowers/sdd/2026-08-13-pegasus-recovery-foundation/progress.md` until the controller writes the tracked acceptance checkpoint.
- Public brand casing is exactly **Pegasus Dreamscapes**.
- Preserve locked public copy, routes, category data, styles, and component behavior.
- Do not edit test timeouts; fix the production lazy boundary.
- Do not publish a preview, create a PR, access staging, or mutate production, DNS, live data, Render production, or payment systems.
- Do not stage generated `dist/`, `.recovery/`, or ignored `.superpowers/sdd/` files in the implementation commit.

---

## File Map

Implementation paths:

- `README.md`
- `docs/AUTOMATION_GOAL.md`
- `docs/qa/launch-completion-status.md`
- `docs/qa/security-launch-recovery-ledger.md`
- `docs/superpowers/plans/2026-08-13-pegasus-security-launch-recovery.md`
- `client/src/pegasus/category-page.tsx`
- `client/src/pegasus/Landing.tsx`
- `client/src/pegasus/pages.tsx`
- `client/src/__tests__/pegasus-no-blank-shell.test.tsx`

Verification-only paths:

- `client/src/__tests__/lane-pages-prd-v1.test.tsx`
- `client/src/__tests__/cta-labels.test.tsx`
- `client/src/__tests__/cta-routing.test.tsx`

`category-page.tsx` owns the audience-category presentation and its category-only process block. `Landing.tsx` owns the route-level lazy boundary. `pages.tsx` preserves its public re-export for existing callers. `pegasus-no-blank-shell.test.tsx` owns the static boundary regression. The five documentation paths own current recovery truth and replace stale resume evidence.

The observed pre-implementation focused baseline on 2026-08-13 is intentionally recorded as intermittent, not deterministic: two fresh `lane-pages-prd-v1` processes produced one `/buyers` failure at 1,045ms and one pass at 930ms against Vitest's 1,000ms default; all seven later cases passed in the failing process.

---

### Task 1: Lock recovery state and isolate public lane loading

**Files:**

- Create: `client/src/pegasus/category-page.tsx`
- Modify: `client/src/pegasus/Landing.tsx`
- Modify: `client/src/pegasus/pages.tsx`
- Modify: `client/src/__tests__/pegasus-no-blank-shell.test.tsx`
- Modify: `README.md`
- Modify: `docs/AUTOMATION_GOAL.md`
- Modify: `docs/qa/launch-completion-status.md`
- Modify: `docs/qa/security-launch-recovery-ledger.md`
- Modify: `docs/superpowers/plans/2026-08-13-pegasus-security-launch-recovery.md`
- Test: `client/src/__tests__/lane-pages-prd-v1.test.tsx`
- Test: `client/src/__tests__/cta-labels.test.tsx`
- Test: `client/src/__tests__/cta-routing.test.tsx`

**Interfaces:**

- Consumes: `Category`, `Nav`, existing block/form primitives, the current category data contract, and the parent recovery baseline.
- Produces: `CategoryPage({ cat, go, openPeggy })`, a direct dynamic `./category-page` entry from `Landing.tsx`, a source-compatible re-export from `pages.tsx`, and current recovery documentation.

- [x] **Step 1: Reconfirm the timing baseline**

Run each command as its own fresh process:

```bash
npx vitest run client/src/__tests__/lane-pages-prd-v1.test.tsx
npx vitest run client/src/__tests__/lane-pages-prd-v1.test.tsx
```

Record both outcomes in `.superpowers/sdd/2026-08-13-pegasus-recovery-foundation/progress.md`. A pass does not invalidate the defect: the regression below tests the module boundary deterministically.

- [x] **Step 2: Write the static source regression**

Add these imports after the React import:

```ts
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
```

Add this source fixture immediately after the existing application imports:

```ts
const landingSource = readFileSync(
  resolve(import.meta.dirname, "../pegasus/Landing.tsx"),
  "utf8",
);
```

Add this case as the first test inside the existing `describe` block:

```ts
  it("loads category pages from a focused lazy module", () => {
    const categoryStart = landingSource.indexOf("const CategoryPage =");
    const nextLazyStart = landingSource.indexOf(
      "const InvestmentsPage =",
      categoryStart,
    );

    expect(categoryStart).toBeGreaterThan(-1);
    expect(nextLazyStart).toBeGreaterThan(categoryStart);

    const categoryBoundary = landingSource.slice(categoryStart, nextLazyStart);
    expect(categoryBoundary).toContain("import('./category-page')");
    expect(categoryBoundary).not.toContain("loadPages()");
  });
```

- [x] **Step 3: Run the static regression and verify RED**

```bash
npx vitest run client/src/__tests__/pegasus-no-blank-shell.test.tsx -t "loads category pages from a focused lazy module"
```

Expected: one failure because the current `CategoryPage` initializer contains `loadPages()` and does not contain `import('./category-page')`. If it passes before production code changes, stop and reconcile the source; do not weaken the assertion.

- [x] **Step 4: Create the focused category module**

Create `client/src/pegasus/category-page.tsx` with the exact code below. The JSX and all public strings are the current `WhatYouGet`, `CategoryPage`, and category-only build-process implementation moved without behavior changes.

```tsx
import React from 'react';
import { BadgeCheck, ClipboardList, Hammer, Layers } from 'lucide-react';
import type { Category, Nav } from './theme';
import { IMG } from './primitives';
import {
  DealFindersExtras,
  EcosystemBlock,
  EngineBlock,
  FAQBlock,
  MarketFlowBlock,
  NelsonProof,
  NextStep,
  PageHero,
  ProcessSteps,
  ProductLadderBlock,
  ProofStats,
  Qualifier,
  SplitPaths,
} from './blocks';
import { LeadSection } from './forms';

function WhatYouGet({ cat }: { cat: Category }) {
  const label = cat.pointsLabel ?? 'What you get';
  const layout = cat.layout ?? 'timeline';
  const num = (i: number) => String(i + 1).padStart(2, '0');

  if (layout === 'grid') {
    return (
      <section className="py-24 lg:py-28">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mx-auto text-center mb-14 reveal">
            <div className="pg-label text-[var(--accent)] mb-5">{label}</div>
            <p className="font-serif-display italic text-2xl md:text-[1.9rem] text-[var(--text)] leading-snug">{cat.quote}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {cat.points.map((p, i) => (
              <div key={i} className="surface-card reveal flex gap-6 p-8" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="font-serif-display text-4xl text-[var(--accent)] leading-none shrink-0">{num(i)}</div>
                <div>
                  <h3 className="font-serif-display text-2xl text-[var(--text)] mb-2 leading-tight">{p.t}</h3>
                  <p className="text-[var(--muted)] text-[0.95rem] leading-relaxed">{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'ledger') {
    return (
      <section className="py-24 lg:py-28">
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-5 reveal lg:sticky lg:top-28">
            <div className="pg-label text-[var(--accent)]">{label}</div>
            <div className="pg-rule mt-6 mb-7 max-w-[3rem] !bg-[var(--accent)] draw-x" />
            <p className="font-serif-display text-3xl md:text-[2.6rem] text-[var(--text)] leading-[1.15] tracking-normal">{cat.quote}</p>
          </div>
          <div className="lg:col-span-7">
            {cat.points.map((p, i) => (
              <div key={i} className="reveal flex gap-6 sm:gap-8 py-7 border-t border-[var(--line)] first:border-t-0 first:pt-0" style={{ animationDelay: `${i * 90}ms` }}>
                <div className="font-serif-display text-2xl text-[var(--accent)] leading-none shrink-0 pt-1 w-8">{num(i)}</div>
                <div>
                  <h3 className="font-serif-display text-2xl text-[var(--text)] mb-2 leading-tight">{p.t}</h3>
                  <p className="text-[var(--muted)] text-[0.95rem] leading-relaxed">{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 lg:py-28">
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-4 reveal">
            <div className="pg-label text-[var(--accent)]">{label}</div>
            <div className="pg-rule mt-6 mb-6 max-w-[3rem] !bg-[var(--accent)] draw-x" />
            <p className="font-serif-display italic text-2xl text-[var(--muted)] leading-snug">{cat.quote}</p>
          </div>
          <div className="lg:col-span-8 relative">
            <div aria-hidden="true" className="absolute left-[23px] sm:left-[27px] top-3 bottom-3 w-px bg-gradient-to-b from-[var(--accent)]/40 via-[var(--line)] to-transparent" />
            <ol>
              {cat.points.map((p, i) => (
                <li key={i} className="group reveal relative flex gap-5 sm:gap-7 pb-5 last:pb-0" style={{ animationDelay: `${i * 90}ms` }}>
                  <span className="relative z-10 shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-[var(--accent)]/40 bg-[var(--bg)] font-serif-display text-lg sm:text-xl text-[var(--accent)] leading-none transition-all duration-500 group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] group-hover:text-white group-hover:shadow-[0_12px_26px_-12px_rgba(177,102,49,0.5)]">
                    {num(i)}
                  </span>
                  <div className="surface-card flex-1 p-6 sm:p-7">
                    <h3 className="font-serif-display text-2xl text-[var(--text)] mb-2">{p.t}</h3>
                    <p className="text-[var(--muted)] text-[0.95rem] leading-relaxed">{p.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

const BUILD_PROCESS = [
  { n: '01', icon: ClipboardList, t: 'Scope & budget', d: 'Every project opens with a real budget and a draw schedule, agreed before the first hammer swings.' },
  { n: '02', icon: Layers, t: 'The right bench', d: 'Licensed GCs and subcontractors are matched to the job and scaled to the project, never limited to one crew.' },
  { n: '03', icon: Hammer, t: 'Build to standard', d: 'A written finish spec and punch list every job is held to, from a cosmetic refresh to a ground-up build.' },
  { n: '04', icon: BadgeCheck, t: 'Deliver, finished', d: 'Walked and handed over complete, on a real timeline, not left half-open.' },
];

function BuildProcessBlock() {
  return (
    <ProcessSteps eyebrow="How we build" title="Scope to finished product."
      copy="Every job is scoped before it starts, built to a written finish spec, and walked before we hand it over."
      steps={BUILD_PROCESS} />
  );
}

export function CategoryPage({ cat, go, openPeggy }: { cat: Category; go: Nav; openPeggy: () => void }) {
  return (
    <>
      <PageHero eyebrow={cat.eyebrow} title={cat.title} image={IMG(cat.image)} lead={cat.lead} scrimTop={cat.heroScrimTop} />
      <WhatYouGet cat={cat} />
      {cat.splits && <SplitPaths go={go} openPeggy={openPeggy} heading={cat.splits.heading} copy={cat.splits.copy} paths={cat.splits.paths} founderPhoto={cat.splits.founderPhoto} peggyHint={cat.splits.peggyHint} />}
      <Qualifier forYou={cat.forYou} notFit={cat.notFit} />
      {cat.rich.includes('engine') && <EngineBlock go={go} />}
      {cat.rich.includes('ladder') && <ProductLadderBlock go={go} openPeggy={openPeggy} />}
      {cat.rich.includes('buybox') && <DealFindersExtras go={go} />}
      {cat.rich.includes('surfaces') && <EcosystemBlock go={go} openPeggy={openPeggy} />}
      {cat.rich.includes('proof') && <NelsonProof go={go} />}
      {cat.rich.includes('marketflow') && <MarketFlowBlock go={go} />}
      {cat.rich.includes('stats') && <ProofStats />}
      {cat.rich.includes('process') && <BuildProcessBlock />}
      {cat.rich.includes('faq') && cat.faq && <FAQBlock items={cat.faq} eyebrow="Questions" title="What people ask us." allHref={cat.faqAnchor ? `/faq#${cat.faqAnchor}` : '/faq'} />}
      {cat.secondary && <NextStep go={go} label={cat.secondary.label} route={cat.secondary.route} />}
      <LeadSection cfg={cat.form} eyebrow={cat.eyebrow} tone="navy" />
    </>
  );
}
```

- [x] **Step 5: Point the public shell at the focused module**

In `client/src/pegasus/Landing.tsx`, replace only the current `CategoryPage` initializer:

```ts
const CategoryPage = lazy(() => import('./category-page').then((module) => ({ default: module.CategoryPage })));
```

Keep `loadPages` for all broad-page imports that follow.

- [x] **Step 6: Preserve the broad-module export without a reverse dependency**

In `client/src/pegasus/pages.tsx`:

1. Add this export after the imports:

```ts
export { CategoryPage } from './category-page';
```

2. Delete the complete block beginning with the `AUDIENCE CATEGORY PAGE` section comment and ending immediately before the `DEAL STRATEGY` section comment.
3. Delete `BUILD_PROCESS` and `BuildProcessBlock` immediately above `DevelopmentPage`.
4. Make the now-unused imports exactly:

```ts
import { ArrowRight, ConciergeBell, Check, Send, Calculator, Compass, Ruler, Landmark } from 'lucide-react';
import type { Nav, Theme, PeggyHandoff } from './theme';
```

5. Remove `EngineBlock`, `DealFindersExtras`, `SplitPaths`, and `ProcessSteps` from the `./blocks` import. Keep every other block import unchanged because it has consumers outside the extracted category block.

The dependency direction must be `pages.tsx` → `category-page.tsx`; `category-page.tsx` must never import `pages.tsx`.

- [x] **Step 7: Run the focused regression and verify GREEN**

```bash
npx vitest run client/src/__tests__/pegasus-no-blank-shell.test.tsx -t "loads category pages from a focused lazy module"
```

Expected: one passing test.

- [x] **Step 8: Correct `README.md`**

Make these exact changes:

- Change the title to `# Pegasus Dreamscapes Website + MarketFlow`.
- Replace Local setup steps 1–3 with:

```md
1. Use Node `22.23.2`.
2. Install the locked dependency graph with `npm ci`.
3. Copy required local values into `.env`.
4. Run `npm run dev`.
```

- Replace production deployment checklist steps 1–4 with:

```md
1. Use Node `22.23.2`.
2. `npm ci`
3. `npm run check`
4. `npm test`
5. `npm run build`
6. `npm run start`
```

- Change `dist/index.js` to `dist/index.cjs`.
- Rename `## CMS content override launch checklist` to `## Legacy CMS override audit` and insert this paragraph before the key list:

```md
The locked design and launch sources (`docs/design/final-design-lock.md`, `docs/design/visual-implementation-handoff.md`, and `docs/qa/final-launch-gate.md`) supersede legacy CMS fallback values wherever they conflict. Before launch, remove or reconcile any conflicting `site_content` rows; do not let historical database copy silently override approved public copy.
```

- Replace the complete hard-coded Public route launch QA checklist, from its heading through its per-route bullet list, with:

```md
## Public route launch QA

`docs/qa/final-launch-gate.md` governs route, viewport, accessibility, interaction, console, and evidence requirements. During recovery, derive Pegasus shell routes from `client/src/pegasus/routes.ts` and standalone public routes from `client/src/App.tsx`. Task 11 of the active recovery program will consolidate those sources into `shared/public-launch-routes.json`; older aliases such as `/services`, `/sell`, `/invest`, and `/submit-deal` are not a launch inventory.
```

Keep the existing generic “For each route verify” bullets beneath that replacement.

- [x] **Step 9: Replace the stale canonical-plan paragraph in `docs/AUTOMATION_GOAL.md`**

Replace only the two paragraphs under `## Canonical Completion Plan` with:

```md
Resume from `docs/superpowers/plans/2026-08-13-pegasus-security-launch-recovery.md` on branch `codex/launch-recovery-v2`. Use that program, its committed executable child plans, tracked `docs/qa/security-launch-recovery-ledger.md`, and their plan-scoped SDD ledgers as the durable sources of progress.

PR #25 is historical review evidence only. A successor pull request has not yet been created; record it in the recovery plan and ledger when Task 15 opens it. A status-only message is never a completed milestone. Continue through the first unchecked safe task, record accepted work in Git and remote evidence, and do not restart completed tasks after temporary workspace cleanup.
```

Keep the existing stop-condition paragraph that follows.

- [x] **Step 10: Replace `docs/qa/launch-completion-status.md`**

Replace the entire file with:

```md
# Pegasus Security Launch Recovery Status

Program: `docs/superpowers/plans/2026-08-13-pegasus-security-launch-recovery.md`

Branch: `codex/launch-recovery-v2`

Approved source: `4487bec1378c701cc77a6cef421b9921ddf522d4`

Successor pull request: Not created; Task 15 owns creation.

Historical review source: PR #25 only.

## Evidence boundary

Every commit, check, screenshot, route matrix, and workflow run recorded in the previous launch-completion status—including Launch Verification run #205—is historical evidence from an older candidate. It explains findings but does not prove the current recovery head. Only evidence rerun on the exact final `codex/launch-recovery-v2` head may support launch completion.

The durable per-task record is `docs/qa/security-launch-recovery-ledger.md`. The ignored plan-scoped SDD ledgers are orchestration aids, not remote recovery evidence.

## Recovery baseline — 2026-08-13

- Durable program checkpoint before Task 1 implementation: `7b98d7d8c7bbeeb9b14217446016062db66472a9`.
- Node `22.23.2` TypeScript: PASS.
- Production build and bundle budget: PASS; Vite built 3,821 modules.
- Full Vitest baseline: 110 files, 1,250 passed, one failed.
- Focused timing evidence: two fresh `lane-pages-prd-v1` processes produced one `/buyers` failure at 1,045ms and one pass at 930ms against the 1,000ms default. The failing process passed all seven later cases. Task 1 fixes the lazy boundary rather than relaxing timeouts.
- Review inventory: 46 actionable PR #25 findings reviewed; 5 already fixed at the approved source, 41 still applicable, including 8 unresolved inline threads.

## Recovery task status

| Task | Status | Durable evidence |
| --- | --- | --- |
| Program checkpoint | Complete | `7b98d7d8c7bbeeb9b14217446016062db66472a9`; program and tracked ledger match the remote successor branch. |
| Task 1 — recovery foundation | In progress | Executable child plan: `docs/superpowers/plans/2026-08-13-pegasus-recovery-foundation.md`. |
| Tasks 2–18 | Pending | Execute only from preflighted, committed child plans in program order. |

## External gates

- No production, DNS, live database, payment, or Render production mutation is approved.
- No staging migration, staging write, marked test lead, or preview publication is approved until its program gate is recorded.
- Supabase and Render staging control access remains unverified.
- Public distribution remains blocked on qualified legal/compliance and Keller Williams/broker review.
- The CodeRabbit CLI is not installed; Task 15 uses the successor GitHub pull request and CodeRabbit app review unless installation is separately approved.

## Resume rule

Reconcile the program plan, this status, the tracked recovery ledger, `git log`, and the successor remote head. Resume at the first task without a remote accepted checkpoint. The first Task 1 implementation command is:

`npx vitest run client/src/__tests__/lane-pages-prd-v1.test.tsx`
```

- [x] **Step 11: Correct the tracked ledger and parent-program baseline**

In `docs/qa/security-launch-recovery-ledger.md`, replace the Vitest baseline bullet with:

```md
- Full Vitest baseline: 110 files; 1,250 passed and one failed. Two fresh focused lane-page processes then produced one `/buyers` timeout at 1,045ms and one pass at 930ms against the 1,000ms default; the failing process passed all seven later cases.
```

Replace the Task 1 pending evidence cell with:

```md
Focused RED: one `/buyers` timeout and one pass across two fresh processes; static boundary regression requires direct `./category-page` loading.
```

In `docs/superpowers/plans/2026-08-13-pegasus-security-launch-recovery.md`, replace the known-baseline Vitest bullet with:

```md
- Baseline Vitest: 110 files, 1,250 passed and one failed. Two fresh focused lane-page processes produced one first-`/buyers` timeout at 1,045ms and one pass at 930ms against the 1,000ms default; all seven later cases passed in the failing process. Task 1 stabilizes the lazy boundary without relaxing timeouts.
```

Also replace Task 1 Step 1 with:

```md
- [x] **Step 1: Preserve the RED baseline.** Run `npx vitest run client/src/__tests__/lane-pages-prd-v1.test.tsx` twice in fresh processes and record both outcomes. Add a static regression in `pegasus-no-blank-shell.test.tsx` requiring `CategoryPage` to lazy-import `./category-page`, not derive from `loadPages()`, and run it to RED.
```

Do not mark Task 1 accepted in either plan or ledger. The controller does that only after both reviewers approve.

- [x] **Step 12: Run the focused regression set**

```bash
npx vitest run client/src/__tests__/pegasus-no-blank-shell.test.tsx client/src/__tests__/lane-pages-prd-v1.test.tsx client/src/__tests__/cta-labels.test.tsx client/src/__tests__/cta-routing.test.tsx
```

Expected: all four files pass with no timeout change.

- [x] **Step 13: Run static and production gates**

```bash
npm run check
npm run build
git diff --check
```

Expected: all exit 0. Do not stage generated `dist/` output.

- [x] **Step 14: Prove the built category entry does not import the broad pages entry**

Run:

```bash
node --input-type=module <<'NODE'
import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(
  await readFile('dist/public/.vite/manifest.json', 'utf8'),
);
const entries = Object.entries(manifest);
const category = entries.find(([, value]) => value.name === 'category-page');
const pages = entries.find(([, value]) => value.name === 'pages');

if (!category?.[1].isDynamicEntry) {
  throw new Error('category-page is not a dynamic entry');
}
if (!pages?.[1].isDynamicEntry) {
  throw new Error('pages is not a dynamic entry');
}
if (category[0] === pages[0] || category[1].file === pages[1].file) {
  throw new Error('category-page was folded into the broad pages entry');
}
if (category[1].imports?.includes(pages[0])) {
  throw new Error('category-page still imports the broad pages entry');
}

console.log(`category boundary PASS: ${category[1].file}`);
console.log(`broad pages entry: ${pages[1].file}`);
NODE
```

Expected: two distinct asset paths and a `category boundary PASS` line.

- [x] **Step 15: Inspect and stage the exact implementation scope**

```bash
git status --short
git diff -- README.md docs/AUTOMATION_GOAL.md docs/qa/launch-completion-status.md docs/qa/security-launch-recovery-ledger.md docs/superpowers/plans/2026-08-13-pegasus-security-launch-recovery.md client/src/pegasus/category-page.tsx client/src/pegasus/Landing.tsx client/src/pegasus/pages.tsx client/src/__tests__/pegasus-no-blank-shell.test.tsx
git diff --check
git add -- README.md docs/AUTOMATION_GOAL.md docs/qa/launch-completion-status.md docs/qa/security-launch-recovery-ledger.md docs/superpowers/plans/2026-08-13-pegasus-security-launch-recovery.md client/src/pegasus/category-page.tsx client/src/pegasus/Landing.tsx client/src/pegasus/pages.tsx client/src/__tests__/pegasus-no-blank-shell.test.tsx
git diff --cached --name-only
```

The cached name list must contain exactly those nine paths. `.recovery/`, `dist/`, this child plan, and verification-only tests must not be staged.

- [x] **Step 16: Commit the reviewed implementation candidate**

Commit:

```bash
git commit -m "fix: lock recovery and isolate public lane loading"
```

Record the implementation SHA and all RED/GREEN outputs in `.superpowers/sdd/2026-08-13-pegasus-recovery-foundation/progress.md`. Do not push or mark acceptance; return the commit to the controller for specification review.

---

## Controller-only acceptance checkpoint

After a fresh specification reviewer and then a fresh code-quality reviewer approve the implementation (including any focused fix commits), the controller must:

- [x] Update this child plan's completion checkbox, the parent Task 1 checkbox, `docs/qa/launch-completion-status.md`, and the tracked recovery ledger with exact commits, commands, reviewer verdicts, and rulings.
- [x] Run `git diff --check`.
- [x] Stage only the child plan, parent plan, launch-completion status, and tracked ledger with `git add -- docs/superpowers/plans/2026-08-13-pegasus-recovery-foundation.md docs/superpowers/plans/2026-08-13-pegasus-security-launch-recovery.md docs/qa/launch-completion-status.md docs/qa/security-launch-recovery-ledger.md`.
- [x] Commit `docs: record Task 1 acceptance`.
- [x] Fast-forward `codex/launch-recovery-v2` without force and verify the remote exact head.

- [x] Task 1 accepted by specification review, code-quality review, and remote checkpoint.

## Acceptance evidence

- Implementation: `962551ca5c5d2371b876c819babd0328b60997e1` (`fix: lock recovery and isolate public lane loading`).
- RED: two fresh `/buyers` timing failures at 1,483ms and 1,043ms while all seven later cases passed; the static boundary assertion also failed against `loadPages()`.
- GREEN: Node `22.23.2`; 4 focused files / 77 tests; TypeScript; diff hygiene; production client/server build; bundle budget; and manifest topology all passed.
- Managed-sandbox build ruling: `npm run build` reached the `tsx` CLI but failed before repository code at its Unix IPC listener (`EPERM /tmp/tsx-0/20.pipe`). `node --import tsx script/build.ts && npm run check:bundle` executed the same build entrypoint and bundle gate successfully (3,822 Vite modules and `dist/index.cjs`). No package script or dependency changed.
- Specification review: `SPEC APPROVED`; no findings.
- Code-quality review: `QUALITY APPROVED`; no Critical or Important findings.
- Accepted Minor ruling: the static test does not itself reject a future reverse `category-page.tsx` import of `./pages`; current source and the production manifest prove no such dependency. Add a source or automated-manifest assertion when the boundary/bundle checker is next maintained.
