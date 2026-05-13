# Lighthouse Pass — May 13, 2026 (Task #33)

Five public routes audited against the dev preview (`http://localhost:5000`) using
Lighthouse 12.8.2 + headless Chromium 125, categories: Performance, Accessibility,
Best Practices, SEO.

Targets (from task #29): Perf ≥85, A11y ≥95, Best Practices ≥95, SEO 100.

## Scores (before → after low-risk fixes)

| Route         | Performance | Accessibility | Best Practices | SEO |
|---------------|-------------|---------------|----------------|-----|
| `/`           | 25 → 26     | 83 → **96**   | 96             | 100 |
| `/sell`       | 36 → 27 \*  | 86 → **96**   | 96             | 100 |
| `/invest`     | 12 → 13     | 86 → **96**   | 96             | 100 |
| `/projects`   | 13 → 13     | 85 → **96**   | 96             | 100 |
| `/marketflow` | 33 → 15 \*  | 84 → **96**   | 96             | 100 |

\* Performance varies run-to-run on the dev server (HMR overhead, no production
build, no CDN, image work-in-progress). Treat the dev-preview Performance
numbers as directional only — re-measure against `npm run build` + `npm run start`
after the queued image-optimization tasks land.

## Targets met

- **SEO 100** — hit on every page. The sitemap + JSON-LD + meta layer from
  task #29 is doing its job.
- **A11y ≥95** — now hit on every page (was 83-86 before this pass).
- **Best Practices ≥95** — hit on every page.
- **Perf ≥85** — **not met**. Already covered by the open follow-ups
  "Shrink the home page Featured Project and service photos too" and
  "Auto-optimize uploaded project after-photos when they're saved", plus
  the new follow-up "Re-measure site speed once the image fixes ship".

## Low-risk fixes applied in this task

1. **`meta-viewport`** (all 5 routes) — removed `maximum-scale=1` from
   `client/index.html`. The viewport tag was blocking pinch-zoom for
   low-vision users. Now `width=device-width, initial-scale=1.0`.
2. **`button-name`** (all 5 routes) — added
   `aria-label="Open Peggy strategy assistant"` to the floating Peggy chat
   dock button (`client/src/components/peggy-dock.tsx`). It was an
   icon-only button with no accessible name.
3. **`heading-order`** (`/` only) — the MarketFlow Beta sample-deal cards on
   the homepage used `<h4>` directly under an `<h2>` section, skipping
   `<h3>`. Bumped the card title to `<h3>`
   (`client/src/pages/home.tsx`).

## Remaining a11y audit on every page

- **`color-contrast`** — flags low-contrast text against the warm cream /
  dark navy editorial palette (e.g. `text-cream/55`, `text-white/60`,
  `text-muted-foreground` on small text). Out of scope for this pass per
  the task's "no architectural rework" guardrail; tracked as a follow-up
  ("Make small text legible on cream and navy backgrounds").

## Best-Practices residual

- `errors-in-console` (all routes) and `valid-source-maps` (home only) keep
  Best Practices at 96. Both are dev-server artifacts (HMR client warnings
  and source-map URLs missing on some Vite-served chunks). They will not
  appear in a production build.

## Reports

Raw JSON + HTML reports were saved locally during the audit (not committed —
gitignored under `.local/`):

- Before: `.local/lighthouse/<route>.report.{json,html}`
- After:  `.local/lighthouse/after/<route>.report.{json,html}`
