# Public visual hierarchy — 4 October 2026

## Bounded design

The owner asked for another focused elevation that makes information and context distinguishable from actions and routes at a glance. This pass preserves the existing cream/navy/copper system, editorial typography, cinematic assets, approved copy, routes and product behavior. Base: `5af14f8484dd4698ae0d0a154adcd5bbc4431d43`.

Fresh desktop and phone captures in both themes identified four high-impact ambiguities:

1. Some secondary navigation and local actions only acquired an underline on hover, despite sharing the same copper text as informational labels.
2. Tool, process and photograph selectors resembled editorial headings or route links. Their selected state was visually quieter than their function warranted.
3. Inert planning readouts used the same outlined box and selected edge as actual question controls.
4. The homepage's first route looked selected before the visitor interacted with it.

## Implemented grammar

- Filled primary actions retain their established treatment. Quiet text actions and navigation have persistent underlines. Navigation keeps directional arrows; local Peggy actions use a compass or conversation icon with native button semantics.
- Local selectors use functional sans-serif labels and disclosure/check indicators, preserving `aria-pressed`, `aria-controls`, live regions, targets and existing handlers. Selection remains visible through a check, border and surface treatment rather than color alone.
- The Opportunity Plan diagram preserves its labels and relationship connector while presenting the results as unboxed readouts. Actual question controls remain outlined.
- Homepage routes only highlight on actual hover or keyboard focus. The illustration's existing preview response remains; no route is silently chosen.

No public text or accessible label changed. No server/API, financial model, form, consent, saved-work format, database, dependency, payment, legal or brokerage boundary changed. Original media bytes are untouched. Buyer criteria remains SHA-256 `910b4791ba3af7cd13068959617740abe53d94678927da4a0556c2dfbfa75722`; the approved homepage image remains `a1de24393eda3bf7ca0ece805a96b71554b7006aee0fcede5d7c41554d8409a3`.

## Verification

`node scripts/check-visual-clarity.mjs` adds a rendered acceptance gate for the changed grammar at 320, 390, 768 and 1440 pixels in light/dark themes. It records source HEAD, compiled-build digest, 64 screenshots, 82 focused checks, axe checks, overflow checks, native selector behavior and route focus. The before-state run failed the 20 expected affordance checks at desktop widths; the implementation then passed the full matrix. The workflow now runs this gate on the exact PR client build alongside the existing checks.

The harness uses a loopback preview server with no database, blocks all non-GET requests and all remote origins, and only loads the synthetic illustrative example. Browser operations and cleanup have deadlines; failures preserve partial evidence without keeping CI open indefinitely. Existing route, page-guide and journey harnesses were not weakened.

Required release verification remains:

- `npm run check`
- `npm test -- --maxWorkers=2`
- `node --import tsx script/build.ts`, `npm run check:bundle`, `npm run check:serverless`
- `node scripts/check-visual-clarity.mjs`
- `A11Y_PUBLIC_ROUTE_COVERAGE=full node scripts/check-visual-accessibility.mjs`
- Existing brand, Peggy, guide and journey acceptance
- Isolated PostgreSQL integration checks and exact-head remote CI

The local environment injects an experimental HTTP-proxy warning into Node stderr. The initial full unit run exposed that warning in the existing CLI test that expects empty stderr; the unchanged suite passes with `NODE_NO_WARNINGS=1`. This is an environment flag, not a weakened assertion or product fix.

Independent review inspected all changed implementation files and 24 actual before/after screenshots. It found no blocking visual or behavioral regression. Separate harness review identified and verified fixes for deadline/cleanup robustness and a generated-evidence dirtiness label.

The release handoff records immutable source/tree, patch checksum, exact commands/results, logs and rendered evidence. This pass does not establish live form/HQ/email receipt delivery, hosted authentication or AI-service acceptance, physical-device/Safari acceptance, legal review, or final owner aesthetic acceptance. No merge or live activation is authorized here.
