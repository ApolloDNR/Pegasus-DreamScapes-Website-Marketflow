# Task 5A report — Truthful MarketFlow public and access surfaces

## Implementation commit

- `ae351932025e8037989ee6e1ee2cb99c03ae2167` — `feat(marketflow): make pilot surfaces truthful`
- `8e886cd98b0ee9a68358b3403127f0ad3f027ea0` — `fix(release): close hosted interaction gaps`
- `8a67378783b9f9f4fc25e877f164fdabacba7a10` — `fix(marketflow): preserve dark error contrast`

## Scope rulings applied

- The mounted `/marketflow` v5.1 experience is authoritative. The unmounted
  legacy marketplace page was removed from stale keyboard coverage rather than
  polished as false progress.
- MarketFlow remains a controlled, invitation-led relationship system. Public
  pages describe process and field anatomy only; they do not show fictional
  inventory, investment performance, sample opportunities, or implied access.
- The latest hosted CI run identified two cross-route release regressions while
  Task 5A was open: insufficient light-form contrast on Work With Apollo and a
  public Strategy Lab calculator crash caused by private providers. The smallest
  scoped fixes and regression tests are included here so the next exact-head run
  can exercise the real hosted surfaces.

## Protected boundaries

This slice preserves role switching, exact reviewed-access URLs and query
mapping, the `/api/leads` method and envelope, the existing consent/version
contract, analytics, the three-second anti-automation timing signal, server
authorization, and every private-inventory boundary. It does not add public
inventory, securities language, automated approval, or a new server action.
Strategy Lab calculation formulas, tab keys, deep links, engine gates, saved
analysis behavior outside public mode, and authenticated/Peggy actions outside
the mounted public route remain unchanged.

## RED evidence

The mounted public/access contract was exercised before production changes:

```text
npm test -- --run \
  client/src/__tests__/marketflow-public-v51.test.tsx \
  client/src/__tests__/lead-intake-consent.test.tsx \
  client/src/__tests__/keyboard-a11y.test.tsx \
  --reporter=dot
```

Result before implementation: 19 tests collected; 6 intended failures and 13
passes. The failures proved the real honeypot was unbound, too-fast and API
errors had no durable inline state/retry, pending and success semantics were
incomplete, the success timeline implied unrelated property/comps work, and
the mounted public surface still exposed the fictional `MF · 0007` record.

The hosted exact-head run `32453123822` then supplied rendered RED evidence:

- Work With Apollo light-mode labels and consent copy missed WCAG AA contrast.
- Opening the real public Strategy Lab calculator threw because private
  Supabase/Peggy providers were absent.

## Implemented behavior and presentation

- Removed the fictional identifier, location, dossier metrics, numbered hero
  index, redundant icon tiles, and sample-record framing from the mounted public
  MarketFlow page.
- Replaced the sample with neutral field anatomy and explicit always-visible
  no-live-inventory, not-public-marketplace, and no-securities boundaries.
- Preserved one real role-switching signature interaction and all exact access,
  criteria, and Strategy Lab routes.
- Flattened the active public/access presentation into the existing Pegasus
  editorial system, retaining only repository source photography and Lucide
  icons with explicit 1100/900/600 responsive contracts.
- Bound the hidden controlled `hp_company` field to validation and the existing
  nested payload key. Added durable inline too-fast and API errors, explicit
  retry, pending busy/disabled copy, focused polite success, and full form reset.
- Replaced MarketFlow's unrelated property-analysis success timeline with a
  truthful manual access-review sequence.
- Added a public calculator runtime boundary that suppresses only
  provider-dependent private actions while leaving every worksheet usable.
- Corrected the active light form's label/consent colors using existing semantic
  tokens; no contrast threshold or audit rule was weakened.
- Split scenario-save hooks into an authenticated child so BRRRR and Cash Flow
  scenario analysis also runs on the public route without private providers.
- Corrected standalone access styling to use the global light/dark HSL tokens,
  with AA small-text colors and theme-safe control, focus, and error contrast.
- Trimmed and bounded access fields, normalized multi-part names, moved success
  to a labelled focused region with one short live announcement and an `h1`,
  scrolled success into view, and restored focus to the first field on reset.
- Corrected the hero photograph's alt text after inspecting the source asset,
  and fixed the five-stage sequence divider cascade at tablet/mobile widths.

## GREEN evidence

Focused mounted/route/form suite:

```text
npm test -- --run \
  client/src/__tests__/marketflow-public-v51.test.tsx \
  client/src/__tests__/calculator-public-runtime.test.tsx \
  client/src/__tests__/work-with-apollo-v51.test.tsx \
  client/src/__tests__/keyboard-a11y.test.tsx \
  client/src/__tests__/pegasus-landing-a11y-v6.test.tsx \
  client/src/__tests__/public-route-integrity.test.tsx \
  client/src/__tests__/lead-intake-consent.test.tsx \
  client/src/__tests__/cta-routing.test.tsx \
  --reporter=dot
```

Result: 8 files passed; 152 tests passed.

Full repository suite:

```text
npm test -- --run --reporter=dot
```

Result: 123 files passed; 1,736 tests passed; 0 failed or skipped.

```text
npm run check
node --import tsx script/build.ts && npm run check:bundle
npm audit --audit-level=high --omit=dev
node scripts/check-package-lock-registry.mjs
node --test scripts/check-package-lock-registry.test.mjs
git diff --check
```

Results: TypeScript passed; the production build transformed 3,826 modules;
server build and bundle budgets passed (159,005 B raw / 50,310 B gzip entry,
421,164 B raw / 123,957 B gzip initial JavaScript); production audit found 0
vulnerabilities; registry guard and its executable test passed; diff hygiene
passed.

## Review cycle

A read-only implementation review reproduced the nested BRRRR/Cash Flow public
provider crash, found the standalone token-scope defect, and identified success
focus/heading, whitespace validation, image-alt, responsive-divider, and
light/dark error/control contrast gaps. Each issue received a focused regression
or static guard before the two fix commits above. The final read-only pass of
`8a67378783b9f9f4fc25e877f164fdabacba7a10` found no remaining blocking or
important issues.

## Files changed

- `client/src/pegasus/marketflow-experience.tsx`
- `client/src/pages/marketflow-access.tsx`
- `client/src/components/success-view.tsx`
- `client/src/index.css`
- `client/src/__tests__/marketflow-public-v51.test.tsx`
- `client/src/__tests__/lead-intake-consent.test.tsx`
- `client/src/__tests__/keyboard-a11y.test.tsx`
- `client/src/pegasus/forms.tsx`
- `client/src/pegasus/_group.css`
- `client/src/pegasus/strategy-lab-experience.tsx`
- `client/src/components/strategy-lab/calculator-tools-panel.tsx`
- `client/src/components/calculator-shared.tsx`
- `client/src/components/calculator-advanced.tsx`
- `client/src/__tests__/calculator-public-runtime.test.tsx`

## Remaining gate

Local rendered Playwright could not run because this sandbox has no Chromium
binary; no local rendered-browser claim is made. The unchanged hosted gate must
verify the exact published head across themes and required viewports. Private
MarketFlow lane states, opportunity intake, the 1024 route matrix extension,
protected noindex preview, screenshot evidence, and Apollo visual approval
remain release gates.
