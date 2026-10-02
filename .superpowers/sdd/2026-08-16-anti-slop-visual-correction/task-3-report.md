# Task 3 report — Mounted Strategy Lab editorial correction

## Implementation commit

- `7b49f476d3bb26ceb4ea0404ff825fadecf9dc24` — `feat(strategy-lab): simplify decision workspace`

## Scope ruling applied

This slice changes only the mounted public Strategy Lab in
`client/src/pegasus/strategy-lab-experience.tsx`, its active `.px-lab*`
presentation in `client/src/index.css`, and the corresponding mounted
integration contract. It does not restart the legacy Strategy Lab architecture
or alter calculator formulas, the underwriting engine, sanitization and numeric
validation, the valid-read gate, draft persistence, Peggy context, intake
handoff, authentication, exports, server code, or the exact compliance
boundary.

## RED evidence

The mounted integration contract was changed before the production component
and stylesheet:

```text
npx vitest run client/src/__tests__/pegasus-landing-a11y-v6.test.tsx --reporter=verbose
```

The intended RED run exited 1. Its failures proved that the old mounted page
still exposed the simulated operating record, repeated `02 · Basis ledger`
inside the workspace, lacked a direct `Open calculators` action, and routed a
calculator deep link through the redundant outer instrument selector instead
of the real calculator tab model.

## Implemented behavior

- Reduced the masthead to one concise editorial introduction, one explicit
  `Directional, not an offer` orientation, and one `Open calculators` action.
- Removed the simulated operating-record panel, principle-chip row, and
  duplicate step ordinals while retaining the existing four-step progress
  model and every working input.
- Removed the outer eight-card calculator selector and the selected-worksheet
  launch interstitial. The one real `CalculatorToolsPanel` now opens directly.
- Preserved all eight calculator keys. A valid `?tool=calculators&tab=...` deep
  link opens the requested real tab, tab changes keep the URL current, and
  closing the calculator surface removes its query state.
- Focuses the calculator region after opening. An ordinary action uses smooth
  movement; direct deep links and `prefers-reduced-motion: reduce` use
  non-animated movement.
- Normalized only the calculator panel mounted inside
  `.px-lab-instrument-detail`: legacy gradients, oversized radii, shadows,
  translucent status-card fills, and decorative metric-card surfaces are
  suppressed while the real fields, tabs, result states, charts, saved-analysis
  controls, exports, and formulas remain intact.
- Removed compressed negative headline tracking and raised the smallest active
  Strategy Lab labels to more legible sizes and spacing.
- Added an explicit `761px`–`900px` layout contract. At exactly `768px`, the
  workspace is one column, the basis ledger is two columns, the operating
  boundary is one column, and the calculator surface keeps safe inline padding;
  the real calculator selector remains horizontally scrollable below its
  existing large-screen grid threshold.
- Preserved the exact full directional/compliance disclosure and the complete
  valid-basis journey through live path scoring, decision brief, and bounded
  intake handoff.

## GREEN evidence

Direct mounted Strategy Lab rerun:

```text
npx vitest run client/src/__tests__/pegasus-landing-a11y-v6.test.tsx --reporter=verbose
```

Result: exit 0; 1 file passed; 18 tests passed. This includes the normal-motion
smooth assertion, reduced-motion `auto` assertion, direct-deep-link `auto`
assertion, single real tablist, focus transfer, exact disclosure, invalid-basis
gate, valid path/brief journey, Peggy-compatible mounted provider, and intake
handoff.

Protected focused suite:

```text
npx vitest run \
  client/src/__tests__/pegasus-landing-a11y-v6.test.tsx \
  client/src/__tests__/public-route-integrity.test.tsx \
  client/src/__tests__/strategy-lab/engine.test.ts \
  client/src/__tests__/strategy-lab/compliance-copy.test.tsx \
  client/src/__tests__/calculator-math.test.ts \
  client/src/__tests__/calculator-parity.test.ts \
  client/src/__tests__/strategy-lab-handoff.test.ts \
  client/src/__tests__/opportunity-intake-query.test.tsx \
  client/src/__tests__/cta-routing.test.tsx \
  client/src/__tests__/keyboard-a11y.test.tsx \
  --reporter=verbose
```

Result: exit 0; 10 files passed; 229 tests passed. The engine math and adapter
parity, compliance lock, draft/handoff validation, public route, CTA, intake,
and keyboard-accessibility boundaries all remained green.

```text
npm run check
```

Result: passed (`tsc`, exit 0).

The sandbox blocks the `tsx` CLI's local IPC socket, so the unmodified
`npm run build` wrapper stopped before executing project build code with
`listen EPERM ... /tmp/tsx-0/19.pipe`. The equivalent no-IPC production path
and the committed bundle gate were then run without weakening either:

```text
node --import tsx script/build.ts && npm run check:bundle
```

Result: exit 0. Vite transformed 3,826 modules and built the client in 9.79
seconds; esbuild produced `dist/index.cjs`; the bundle budget passed at 159,005
B raw / 50,300 B gzip for the entry and 421,164 B raw / 123,948 B gzip for
initial JavaScript.

```text
git diff --check
```

Result: passed before the implementation commit.

## Files changed

- `client/src/pegasus/strategy-lab-experience.tsx`
- `client/src/index.css`
- `client/src/__tests__/pegasus-landing-a11y-v6.test.tsx`

## Concerns and next gate

- Rendered browser QA is deliberately not claimed by this implementer. The
  explicit 768px contract and calculator presentation still require the later
  exact-head hosted 1440/1024/768/390 visual and interaction evidence.
- Vitest reports the existing `environmentMatchGlobs` deprecation,
  Browserslist age, and existing jsdom `scrollTo()` notices in intake tests.
  The build reports the existing PostCSS `from` warning. No warning or release
  gate was suppressed.
- Exact-head hosted CI, the protected noindex preview, and Apollo's visual
  approval remain required before merge or launch.
