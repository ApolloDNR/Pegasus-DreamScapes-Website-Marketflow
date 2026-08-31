# Task 2 report — Mounted v5.1 homepage editorial correction

## Implementation commit

- `59a2c985c361b99963a694206deaf70f5275150b` — `feat(home): restore editorial homepage rhythm`

## RED evidence

Tests were changed before the production homepage.

```text
/tmp/pegasus-ci-cache/_npx/5e024738f08fbc63/node_modules/node/bin/node node_modules/vitest/vitest.mjs run client/src/__tests__/home-v6-design-contract.test.tsx client/src/__tests__/homepage-prd-v1.test.tsx
```

Observed result before production edits: exit 1, 2 test files failed, 8 tests failed and 10 passed. The failures exercised the mounted `HomePageV51` and identified the existing long hero pitch, handcrafted proof icons, numbered/action-labeled router, old project label, missing Nelson thesis, non-list/numbered method plus four-department block, numbered three-row partner block, generic founder close, and wrong final subordinate action.

## Implemented behavior

- Preserved the locked hero source, image dimensions, crop anchor, eyebrow, headline, CTA order, proof-rail order, header/navigation contract, and existing route callbacks.
- Removed the long first-viewport pitch so the hero resolves to one promise, one dominant intake action, and two subordinate actions.
- Replaced four handcrafted stat drawings with restrained Lucide icons and removed the unused handcrafted `ColonnadeArt` component.
- Converted the visitor router into an unnumbered open editorial rail while keeping all four canonical visitor paths.
- Kept both real Nelson images; moved their captions out of badge-like overlays; retained the 3/2 to 4/3 transformation, $600K acquisition, $105K renovation, ~$705K all-in cost, $840K sale, ~$95K retail-GC comparison, ~$135K pre-cost comparison, and explicit non-profit caveat.
- Reduced the method to the five approved stages with canonical descriptions and removed the redundant four-department homepage taxonomy.
- Preserved the complete eight-label Opportunity Plan toggle behavior, Peggy action, Strategy Lab action, and directional disclosure.
- Replaced numbered partnership rows with the five approved editorial pairings.
- Tightened founder trust to the real portrait, verified founder identity, specific Nelson operating statement, and explicit Pegasus versus Keller Williams / DRE role separation. The below-fold portrait now lazy-loads.
- Restored the frozen final invitation and `Open Strategy Lab` subordinate action; removed final radial/glow treatment.
- Removed all `hv-grain` use from mounted homepage movements so the shared handcrafted turbulence texture is not rendered on this page. The shared rule remains because other route tasks still consume it.
- Removed dead homepage colonnade/geometric-accent, ordinal, old step, and department CSS while preserving shared rules used by other mounted routes.

## 1024px theme-geometry defect

Hosted run `32449400055`, job `96674867599`, passed its dark/light route matrix and browser-health checks but reported a height shift for the locked hero image during the 1024px theme-toggle interaction. The old gate did not print the measured before/after values.

This slice makes the hero image an absolute, block-level fill of a theme-independent frame and gives the >=761px frame an explicit clamped height. It also updates the executable theme gate to:

- replace the removed `.hv-lead` selector with the remaining locked eyebrow;
- track the hero frame, image, eyebrow, headline, CTA row, stat rail, and navigation;
- wait for fonts and two animation frames after viewport changes before measuring;
- assert that the image fills the frame in both themes; and
- print before, after, and delta values for any future geometry failure.

The rendered interaction must be confirmed by the next exact-head hosted run; no local rendered-browser pass is claimed here.

## GREEN evidence

Focused homepage/navigation/CTA/accessibility suite:

```text
/tmp/pegasus-ci-cache/_npx/5e024738f08fbc63/node_modules/node/bin/node node_modules/vitest/vitest.mjs run client/src/__tests__/home-v6-design-contract.test.tsx client/src/__tests__/homepage-prd-v1.test.tsx client/src/__tests__/pegasus-landing-a11y-v6.test.tsx client/src/__tests__/cta-routing.test.tsx client/src/__tests__/cta-labels.test.tsx
```

Result: exit 0; 5 files passed; 80 tests passed. The existing jsdom `scrollTo()` warning in one StrategyTierStrip test remained non-fatal.

Pinned Node 22 TypeScript:

```text
/tmp/pegasus-ci-cache/_npx/5e024738f08fbc63/node_modules/node/bin/node node_modules/typescript/bin/tsc
```

Result: exit 0.

Production build:

```text
/tmp/pegasus-ci-cache/_npx/5e024738f08fbc63/node_modules/node/bin/node --import tsx script/build.ts
```

Result: exit 0; 3,826 client modules transformed; server bundle completed. Existing Browserslist-age and PostCSS `from` warnings remained; no warning was hidden or gate weakened.

Bundle budget:

```text
/tmp/pegasus-ci-cache/_npx/5e024738f08fbc63/node_modules/node/bin/node scripts/check-client-bundle-budget.mjs
```

Result: PASS. Entry `159,005 B` raw / `50,301 B` gzip; initial JS `421,164 B` raw / `123,947 B` gzip.

Static verification:

```text
/tmp/pegasus-ci-cache/_npx/5e024738f08fbc63/node_modules/node/bin/node --check scripts/check-visual-accessibility.mjs
git diff --check
```

Result: both exit 0.

## Files changed

- `client/src/pegasus/home-v51.tsx`
- `client/src/pegasus/_group.css`
- `client/src/__tests__/home-v6-design-contract.test.tsx`
- `client/src/__tests__/homepage-prd-v1.test.tsx`
- `scripts/check-visual-accessibility.mjs`

## Concerns and next gate

- The source/test/build slice is complete, but rendered browser QA is intentionally not claimed by this implementer.
- Exact-head hosted CI must prove the strengthened 1440/1024/390 theme-geometry interaction and the wider rendered route matrix.
- Final desktop/tablet/mobile visual judgment remains part of Task 7 and Apollo's visual approval remains required before merge or launch.
