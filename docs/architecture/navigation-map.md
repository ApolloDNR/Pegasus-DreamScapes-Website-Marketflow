# Navigation Map (v1.3.1, post Task #109)

Single source of truth for which public routes are reachable from which
nav surface. The canonical link lists live in
`client/src/config/navigation.ts` and are consumed by:

- `client/src/components/navigation.tsx` (desktop header + mobile sheet)
- `client/src/components/footer.tsx`

Parity across header dropdown, mobile sheet, and footer is enforced by
`client/src/__tests__/nav-parity.test.tsx`.

## Header primary (`NAV_PRIMARY`)

| Label      | Route          | Notes                          |
|------------|----------------|--------------------------------|
| Approach   | `/sell`        | Strategy Review intake         |
| Projects   | `/projects`    | Built work + project detail    |
| Capital    | `/invest`      | Capital partnerships           |
| MarketFlow | `/marketflow`  | Private beta portal (badge)    |
| About      | `/about`       | Founder + company              |

## Header "More" dropdown (`NAV_MORE`)

Mirrored verbatim in the mobile sheet "More" group and the footer "More"
column.

| Label            | Route             |
|------------------|-------------------|
| Strategy Library | `/resources`      |
| Strategy Lab     | `/strategy-lab`   |
| Calculators      | `/calculators`    |
| Deal Blueprint   | `/deal-blueprint` |
| Vendor Network   | `/vendor-network` |
| Contact          | `/contact`        |
| Disclosures      | `/disclosures`    |

Unauthenticated users additionally see "Sign In" → `/login` in the header
dropdown and the mobile sheet.

## Footer-only extras (`FOOTER_MORE_EXTRA`)

Currently empty. Reserved for footer-only legal or housekeeping links so
they can be added without bloating the header dropdown.

The footer also surfaces:

- `Submit a Property` → `/sell` (Engage column)
- `Privacy` / `Terms` / `Disclosures` (legal row)
- `Sign In` → `/login` and `MarketFlow` → `/marketflow` (utility row)

## Deliberate deep-link / flow-result routes

These render real pages but are not in the top nav. They are reached
from contextual links inside the experience:

| Route                                    | Reached from                                         |
|------------------------------------------|------------------------------------------------------|
| `/` (Home)                               | Logo wordmark                                        |
| `/development`                           | Home "Development" router tile, internal CTAs (the spine pillar page) |
| `/education`                             | Home "Learning" router tile (Guided Learning Path), article-detail breadcrumbs |
| `/resources`                             | "More ▾" Strategy Library link (Field Notes & Tools) |
| `/sell?intent=deal-jv`                   | Home "Deal Sources" router tile, `/submit-deal` redirect (preselects wholesaler + Deal/JV intent) |
| `/strategy-lab/library`                  | Strategy Lab subnav                                  |
| `/strategy-lab/classic`                  | Strategy Lab subnav (legacy 8-tile suite)            |
| `/strategy-lab/submitted`                | Form-result page                                     |
| `/strategy-lab/blueprint-confirmed`      | Stripe/invoice return page                           |
| `/resources/:slug`                       | Strategy Library article cards                       |
| `/projects/:slug`                        | Projects grid                                        |
| `/snapshot/:token`                       | Snapshot share URL                                   |
| `/snapshot/calc/:token`                  | Snapshot share URL (canonical)                       |
| `/snapshot/property/:token`              | Snapshot share URL (alias)                           |
| `/privacy`, `/terms`                     | Footer legal row                                     |
| `/login`, `/signup`                      | Auth entry points (footer + nav dropdown)            |
| `/admin/strategy-lab`                    | Staff-only; reached from admin tooling               |
| `/profile/:userId`                       | MarketFlow community contexts                        |
| `/offer-studio/:dealType/:dealId`        | Deal action flow inside MarketFlow                   |
| `/dealflow/project/:id`                  | Deal context links                                   |
| MarketFlow `/marketflow/*` routes        | Role-gated inside the portal                         |

## Legacy redirects (in `App.tsx` `legacyRedirects`)

Listed in code; they cover retired funnel routes (`/wholesale`,
`/submit-deal` → `/sell?intent=deal-jv`, `/services` → `/development`,
`/buyers`, `/buy`, `/dreamspace`, `/partner`, `/capital-raising`, all
`/marketplace/*`, `/dealflow/*`, `/portal/*`, `/community`, `/hq`).

Two non-funnel redirects worth calling out:

- `/strategy-library` → `/resources` (matches the visible "Strategy
  Library" nav label; previously pointed at `/education`, which caused
  the label/route collision flagged by Task #109).
- `/dashboard` → `/marketflow/dashboard` (the auth-aware role router
  lives at the MarketFlow path; the standalone `/dashboard` page was
  retired).

## Adding or renaming nav entries

1. Edit `client/src/config/navigation.ts` (one file).
2. If the new entry belongs in the header "More" dropdown, add a
   `MORE_META` entry in `client/src/components/navigation.tsx` so it
   gets an icon + tagline.
3. Re-run `npx vitest run client/src/__tests__/nav-parity.test.tsx` to
   confirm header / mobile sheet / footer stay in sync.
4. Update this document.
