# Task 4 report — Mounted Work With Apollo correction

## Implementation commit

- `4cb6364aa9f67efa55d2ad0a8f83416e2c6a6982` — `feat(apollo): clarify representation handoff`

## Scope rulings applied

- Ruling: preserve the four paths and route contracts on the currently mounted
  `ApolloSelector` instead of reviving the unmounted legacy
  `client/src/pages/work-with-apollo.tsx` architecture. If this is wrong, the
  owner may want a later copy/routing migration, but this slice has not changed
  any lead, intake, server, or security contract.
- Ruling: isolate the portrait-led identity and contour removal to the mounted
  Work With Apollo route through an `ApolloBlock` variant and optional
  `LeadSection` presentation prop. If this is wrong and the same treatment was
  intended globally, other routes retain their existing presentation; no
  unrelated route has been visually changed.

## Protected boundaries

This slice preserves the exact long-form Apollo disclosure, DRE number,
Keller Williams responsible-broker identity, independently-owned-and-operated
language, Pegasus non-brokerage separation, no-agency/no-agreement statements,
Equal Housing statement, two representation roles, four mounted path choices,
and the two canonical `/bring-an-opportunity` routes. It also preserves the
`/api/leads` method, payload shape, `representation` intent, affirmative contact
consent, consent version, honeypot, elapsed-time field, analytics event, and all
server/security behavior.

## RED evidence

Tests were added against the mounted page and real shared form before changing
production code:

```text
npm test -- --run client/src/__tests__/work-with-apollo-v51.test.tsx --reporter=dot
```

Result before implementation: exit 1; 7 tests collected; 6 failed and 1
protected-boundary test passed. The failures were the intended ones:

- selecting Buyer left the real form select on Seller;
- no selected-path live region or reduced-motion-aware focus handoff existed;
- pending copy/`aria-busy`, durable error alert semantics, and focused success
  semantics were absent;
- the Apollo-only shared `ContourLines` SVG still rendered;
- the generic `pegasus-craft-blueprint.webp` hero still duplicated the real
  founder portrait introduction.

The anti-duplication assertion was also run directly and failed on the exact
blueprint image before production code changed.

## Implemented behavior and presentation

- Lifted the mounted selector state to `WorkWithApolloPage` and bound Seller and
  Buyer selections to the actual `LeadForm` role. Buyer, Seller, and Buyer again
  all update the real select, and the submitted `leadData.lane` now matches the
  chosen representation path.
- The form-mode continuation scrolls the real form and focuses its role field.
  It uses smooth movement normally and `auto` when
  `prefers-reduced-motion: reduce` is active.
- Added one polite, atomic selected-path status region while retaining
  `aria-pressed` on all four path controls.
- Added explicit `Sending your request…` copy and `aria-busy`, a persistent
  assertive error alert, and a polite atomic success state that receives focus
  after submission.
- Preserved contact consent, privacy/no-agency copy, honeypot/timing, API
  payload, and analytics behavior exactly.
- Replaced the duplicate blueprint hero plus generic Apollo card/badge rail with
  one restrained `ApolloBlock` work variant led by the real founder portrait,
  verified Pegasus role, and licensed-representation identity.
- Converted seller/buyer surfaces and the four-path selector into open
  editorial columns and rails using the existing Pegasus tokens and typography,
  with explicit 900px, 700px, and 480px responsive contracts.
- Removed the shared handcrafted contour illustration only from this route's
  navy representation form. Other mounted routes keep their current output.

## GREEN evidence

Exact implementation-head mounted suite:

```text
npm test -- --run client/src/__tests__/work-with-apollo-v51.test.tsx --reporter=dot
```

Result: exit 0; 1 file passed; 7 tests passed.

Protected focused form/disclosure/CTA/public-route/keyboard suite:

```text
npm test -- --run \
  client/src/__tests__/work-with-apollo-v51.test.tsx \
  client/src/__tests__/lead-intake-consent.test.tsx \
  client/src/__tests__/cta-routing.test.tsx \
  client/src/__tests__/cta-labels.test.tsx \
  client/src/__tests__/public-route-integrity.test.tsx \
  client/src/__tests__/route-map.test.tsx \
  client/src/__tests__/keyboard-a11y.test.tsx \
  client/src/__tests__/pegasus-landing-a11y-v6.test.tsx \
  client/src/__tests__/lane-pages-prd-v1.test.tsx \
  --reporter=json
```

Result: exit 0; 9 files passed; 168 tests passed; 0 failed or skipped.

```text
npm run check
```

Result: passed (`tsc`, exit 0).

The sandbox blocks the `tsx` CLI's local IPC socket, so the unmodified
`npm run build` wrapper stopped before project build code with
`listen EPERM ... /tmp/tsx-0/19.pipe`. The equivalent no-IPC production path
and unchanged bundle gate were then run without weakening either:

```text
node --import tsx script/build.ts && npm run check:bundle
```

Result: exit 0. Vite transformed 3,826 modules and built the client in 9.88
seconds; esbuild produced `dist/index.cjs`; bundle budgets passed at 159,005 B
raw / 50,304 B gzip for the entry and 421,164 B raw / 123,952 B gzip for
initial JavaScript.

```text
git diff --check
```

Result: passed before the implementation commit.

## Files changed

- `client/src/pegasus/pages.tsx`
- `client/src/pegasus/blocks.tsx`
- `client/src/pegasus/forms.tsx`
- `client/src/pegasus/_group.css`
- `client/src/__tests__/work-with-apollo-v51.test.tsx`

## Concerns and next gate

- Rendered browser QA is deliberately not claimed by this implementer. The
  route still requires exact-head hosted review at 1440/1024/768/390, both
  themes, real navigation/form interaction evidence, and console/network
  health in Task 7.
- Vitest reports the existing `environmentMatchGlobs` deprecation and stale
  Browserslist data; the focused CTA harness reports existing jsdom
  `scrollTo()` notices. The production build reports the existing PostCSS
  `from` warning. No warning or gate was suppressed.
- Exact-head hosted CI, the protected noindex preview, and Apollo's visual
  approval remain required before merge or launch.
