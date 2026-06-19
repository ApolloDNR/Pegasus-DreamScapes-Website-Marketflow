# Pegasus DreamScapes Corp — Operational README

Operational README only. The **controlling design source of truth** is the saved React prototype under `client/src/pegasus/`. If anything here diverges from the prototype, the prototype wins. The Empire Doctrine `.md` files in `attached_assets/` and the old `docs/architecture/*` blueprints are **retired historical reference** — they no longer govern.

## Controlling doctrine

- **Prototype** — `client/src/pegasus/` (Landing.tsx, nav.tsx, peggy.tsx, forms.tsx, Saved.tsx, pages.tsx, blocks.tsx, data.tsx, theme.ts, routes.ts) plus its scoped design system `client/src/pegasus/_group.css` (loaded in `main.tsx`). Source of truth for layout, typography, palette, copy, and motion. Scoped under `.pg-root` so it coexists with the shadcn token layer used by the functional surfaces.
- **Visual baseline** — `_group.css`, re-skinned to the **v4 locked spec** ("Linear meets Palantir", navy).

**Palette (navy system):** Deep Navy bg `--bg #0D1B2A` · Copper primary/CTA `--accent #D4872E` (bright `#E3A463`) · Gold accent / lines / numerals `--gold #C9A84C` · Cream text `--cream` / `--text #F5E6D3` · Teal success `--teal #1A9E75` · Charcoal panels `--charcoal #11243A` / deep `#091421`. Dark-theme overrides live in the same file under `.pg-root[data-theme='dark']` (cinematic navy `--bg #091421`).

**Typography:** Cormorant Garamond (display/serif — `.font-serif-display`, `.section-numeral`) · Space Grotesk (UI/body/labels — default, `.pg-label`, `.nav-dropdown-head`), with Cinzel · Inter · Montserrat · Space Mono supporting. Loaded via `client/index.html` Google Fonts; the prototype reads family names directly in `_group.css`, the functional layer reads them via `--font-*` / `--pd-font-*` tokens in `index.css` — **change all three places together.** *Override note:* the v4 spec called for Fraunces + Hanken Grotesk + JetBrains Mono, but the founder reverted to this editorial pairing ("too bubbly"). Keep Cormorant Garamond + Space Grotesk; do **not** restore Fraunces/Hanken/JetBrains without an explicit instruction.

## Brand essentials

- **Casing:** Pegasus DreamScapes (capital P, D, S). Legal entity: Pegasus DreamScapes Corp.
- **Tagline:** Deal Strategy & Real Estate Execution.
- **Founder:** Paolo "Apollo" Duran. DRE #02333658. Keller Williams Realty East Bay (each office independently owned and operated). NAR NRDS #159537628. CAR via CCAR #36424.
- **Contact:** `apollo@pegasusdreamscapes.com` · 925-744-8525.
- Do not display credentials not actually held. The legacy forbidden-credential list (NAHB, BNI, BiggerPockets, ULI, NMHC, NAIOP, IRR, Inman) remains a sensible guard.

## User preferences

- Preferred communication style: simple, everyday language.
- **Working Rule M.1:** every completion message must include two explicit lists — (1) what was done and how it improved the project, (2) what is unfinished, lazy, or stubbed.

## Public routes (locked v4)

**Nav (grouped dropdowns)** rendered by `nav.tsx` from `data.tsx`:
- **Who We Serve ▾:** Sellers & Owners (`/sellers`) · Investor & Operator Buyers (`/buyers`) · Deal Finders & Wholesalers (`/dealfinders`) · Capital Partners (`/capital`) · Vendors & Trades (`/operators`) · Referral Partners (`/referral`).
- **What We Do ▾:** Deal Strategy (`/deal-strategy`) · Investments (`/investments`) · Development (`/development`) · Strategy Lab (`/strategy-lab`) · MarketFlow (`/marketflow`).
- **About** (`/about`) + primary CTA **Submit a Property → `/submit`**. Floating **Talk to Peggy** concierge (`peggy-fab`) on prototype pages.

**Live public routes:** `/` · `/sellers` · `/buyers` · `/dealfinders` · `/capital` · `/operators` · `/referral` · `/deal-strategy` · `/investments` · `/development` · `/strategy-lab` · `/marketflow` · `/work-with-apollo` · `/ecosystem` · `/about` · `/contact` · `/peggy` · `/submit` · `/connect`. Functional public routes: `/projects`, `/projects/nelson-dr`, `/library/:slug`, `/deal-blueprint`, `/vendor-network`, `/marketflow/access`, `/marketflow/<role>`, `/marketflow/buyboxes`, `/faq`, `/privacy`, `/terms`.

**Strategy Lab is unified (Task #257):** `/strategy-lab` is the single canonical workshop (Quick Read + Full Path + in-page calculator tools via `?tool=calculators`, deep-linkable `?tab=`). The old split is retired — `/calculators` **and** `/strategy-lab/classic` now **301 → `/strategy-lab?tool=calculators`** (query preserved). There is no separate "classic" surface.

**Legacy redirects** (`App.tsx#legacyRedirects` + `server/routes.ts`): `/deal-architecture` → `/deal-strategy`; `/calculators` & `/strategy-lab/classic` → `/strategy-lab?tool=calculators`; `/sell`,`/submit-property`,`/submit-deal`,`/wholesale` → `/submit?intent=…`; `/buy`,`/portal`,`/dealflow`,`/marketplace` → `/marketflow` (or a sub-role); `/resources`,`/education`,`/strategy-library` → `/library`. Verify the live map in `App.tsx` + `shared/seo-routes.ts` before asserting.

**Submit intake** `/submit`: `?intent=` prefill; honeypot `hp_company` + 3s anti-spam; `leadType: "submit"`. `/terms` + `/privacy` are plain-language legal pages.

## Funnel & footer disclosure (v4 locked)

**Funnel:** Submit a property → free **Property Read** (a short, candid written read by Acquisitions, **within 48 hours**) → submitter picks a lane (Sell to Pegasus · Build with Pegasus · the **Deal Blueprint**, *by request — not sold yet*). The product **ladder is three rungs**: Strategy Lab (free, self-serve, strategy-tier ranges) → Property Read (free, written) → Deal Blueprint (by request). Read timing is always **"within 48 hours"** — never "2-day" / "1–2 business days" / "24/48 business hours". Sources: `data.tsx` PRODUCTS, `forms.tsx` (StrategyTierStrip / STRATEGYLAB_FORM), `pages.tsx` (LAB_STEPS), plus the standalone post-submit surfaces (`success-view.tsx`, `snapshot-status.tsx`, `strategy-lab-submitted.tsx`, `contact.tsx`) and `server/peggy.ts`.

- *Naming nuance:* the user-facing human read is **"Property Read"**. The Strategy Lab's auto-generated export PDF keeps its own distinct name **"Strategy Snapshot PDF"** (server route `/api/pdf/strategy-snapshot/by-id/:id`, locked by `peggy-tool-surface.test.ts`) — a different artifact, intentionally NOT renamed. The lead form's internal `intent: 'strategy-snapshot'` payload key is also kept (HQ / analytics continuity).

**Verbatim footer disclosure (every public page)** — rendered by the Pegasus Footer (`client/src/pegasus/pages.tsx`):
> Paolo "Apollo" Duran · California DRE #02333658. Pegasus DreamScapes Corp. is a real estate investment company, not a real estate brokerage. Licensed real estate services are provided separately by Apollo Duran through Keller Williams Realty East Bay — each office independently owned and operated. Nothing on this site is an offer of securities or a solicitation to invest, nor a valuation, appraisal, CMA, or BPO of any specific property.

The functional-surfaces footer (`client/src/components/footer.tsx`) keeps its own longer, legally-worded disclosure (refers to the Lab "Strategy Snapshots" as preliminary/informational) for admin / functional / standalone pages.

## Voice / copy & compliance

Public copy is governed by the prototype's own text in `client/src/pegasus/` — no externally-locked required phrases.

- **Company/department voice** on public copy — the founder's name + DRE# appear only in the footer disclosure.
- **Compliance guards** (real-estate/securities exposure — keep avoiding): "Invest Now", "Invest With Us", "Investor Returns", "Passive Income", "Guaranteed Returns", "Principal Protected", "we buy houses fast", and generic guru language. Negative-disclosure use stays acceptable on `/capital` and `/terms`. Peggy is an AI strategy assistant / concierge / intake analyst — **never "chatbot"**.
- **Banned in body copy** (see Anti-drift lock): "a real person" / "real person", "Apollo personally", "talk to Apollo", "off-market", "below comparable value", "architect" / "architecture", "$180m" / "180m+", "2-day".
- **Forbidden filler** (says nothing): "In today's market", "We pride ourselves on", "second to none", "world-class", "one-stop shop", "take it to the next level", "unlock your potential", "seamless", "cutting-edge", "trusted partner" (self-claim), "one standard, every time", "the same disciplined read", "under one roof", "Decades of combined experience", "Governed by virtue", "we're not just a … we're a …", and stacked double-qualifiers. Never invent numbers, timelines, or credentials.
- **Status discipline:** don't overclaim status of products that aren't live. PeggyAI is surfaced as **"Early access · in training"** wherever it appears. (The old hard status-badge rule is retired — follow the prototype's presentation.)

## Anti-drift lock

The Empire-Doctrine tripwires (`doctrine-anti-drift.test.ts`, `public-voice.test.tsx`, `nav-parity.test.tsx`) are **retired**. There is no automated *positive* brand lock. The one automated **negative** guard is `client/src/__tests__/public-copy-banned-phrases.test.ts`, which scans the prototype copy sources (`client/src/pegasus/*.tsx`, `*.ts`, comments stripped) and fails if any banned filler / AI-tell / compliance-risk phrase appears (reporting phrase + file:line). The list lives in one place — `client/src/__tests__/banned-phrases.ts` — and should be extended whenever AI-sounding filler slips in.

## Website Director Standard

The permanent quality bar: every public page should read like a senior studio built it for Pegasus specifically — not a template with the words swapped. This section is authoritative (no separate loadable skill file). Run any public-surface change against it before shipping.

**Principles**
1. **One job per page.** Name the single audience + single next action before touching layout.
2. **CTAs are specific, never generic.** Verb + outcome the page earns ("Start a property review", "Run a preview", "Refer a contact"). Banned: "Learn more", "Click here", "Get started", bare "Submit". Every CTA routes to a real surface — no dead ends.
3. **Voice: concrete and true.** Replace filler with specifics (see Voice / copy & compliance).
4. **Imagery is owned, not stock-feeling.** Each page/section earns a distinct hero; no building image on more than ~2 pages. Real photography only on **proof** surfaces (case studies, Apollo, Nelson Dr) — never AI/stand-in images where a real outcome is implied. Before/after sliders only with real, same-space photos (Nelson Dr is the bar). The founder portrait (`founder/apollo-1200.jpg`, via `ApolloBlock`'s `portrait` prop) appears only on `/work-with-apollo` and `/about`; the `splits.founderPhoto` flag on `/sellers` & `/buyers` renders a representation + DRE# text disclosure, **not** the portrait.
5. **Kill the template feel.** The six "Who We Serve" pages must vary section order, emphasis, and visuals per audience via the `cat` config. Repeated blocks (ecosystem grid, FAQ) appear only where they earn their place.
6. **Mobile-first (375px).** Design/verify the 375px view first. Primary CTA + phone (925-744-8525) reachable without hunting; menu opens/closes with an obvious affordance; nothing high-intent buried two taps deep; tap targets ≥ 44px.
7. **Hero contrast.** Hero text must stay legible over the **brightest** region of its image — bottom-anchored scrim (`.hero-scrim-bottom`) deep enough to cover where the headline sits, plus `.text-on-photo` shadow; eyebrow opacity over photos ≥ 85%. Raise scrim coverage rather than trusting text-shadow alone.
8. **Accessibility floor (non-negotiable).** Full keyboard operability; visible bronze focus ring on every interactive element (inherit the global outline — never add `outline-none`/`focus-visible:outline-none` without a replacement ring); correct `aria-*` on menus/dropdowns; `inert` on hidden panels. `client/src/__tests__/keyboard-a11y.test.tsx` must stay green.
9. **SEO.** Every public route ships a unique, crawler-visible `<title>`, `<meta name="description">` (≤155 chars), and OG tags — never a blank SPA shell. Single source of truth: `shared/seo-routes.ts` (`SEO_ROUTES` + `seoFor()`), consumed by both the server injector (`server/seo-html.ts`) and the prototype shell (`Landing.tsx` via `useSEO` + `seoNameFor()`). Title format `Page Name · Pegasus DreamScapes` (home is bare brand). OG minimum: `og:title`, `og:description`, `og:type`, `og:url`, `og:image` (route-specific in `/og/`, else `/og/default.png`). When you add a route, add its entry to `shared/seo-routes.ts` — never hardcode metadata twice.

**Per-page intent map** (CTA column is the **label**, not always the destination — verify the real handler in `data.tsx`/the page):

| Route | Who it's for | One job | Primary CTA (label) |
| --- | --- | --- | --- |
| `/` | First-time visitor | Orient + pick their lane | lane card → audience page |
| `/sellers` | Owner with a complex/stuck property | Start a property review | "Start a property review" |
| `/buyers` | Strategic buyer | See how buyers work with us | "See how buyers work with us" |
| `/dealfinders` | Wholesaler / deal finder | Bring a deal, get a straight answer | "Submit a deal" / "Send the deal" |
| `/capital` | Capital partner | Back specific projects (not blind pools) | "Explore capital partnership" |
| `/operators` | GC / sub / agent / title | Join the vetted build bench | "Join the build bench" |
| `/referral` | Referral partner | Send a name, fee in writing | "Refer a contact" |
| `/deal-strategy` | Considering working with us | Prove the method | "Submit a Deal" |
| `/development` | Owner/partner on a build | See the build standard | "Start a build conversation" |
| `/strategy-lab` | DIY underwriter | Demonstrate a real tool | "Open Strategy Lab" → on-page console |
| `/marketflow` | Network participant | Gate the platform | "Request MarketFlow Access" |
| `/work-with-apollo` | High-intent lead | Representation lanes | inline lead form / PeggyAI |
| `/peggy` | Anyone with a question | The front door / intake | "Open PeggyAI" (early access · in training) |
| `/about` | Trust-seeker | Trust + standard | "Start with one honest read" → `/contact` |
| `/projects/nelson-dr` | Proof-seeker | Real before/after + numbers | "Request a Property Review" → `/submit` |
| `/submit` | High-intent | Canonical intake — convert | keep frictionless |

**Interior CTA routing table** (page bodies speak to their own job; the global nav button stays "Submit a Property" → `/submit`):

| Context | Primary CTA label | Routes to |
| --- | --- | --- |
| Global nav | Submit a Property | `/submit` |
| Deal Strategy | Submit a Deal | `/submit` (deal intent) |
| Strategy Lab | Open Strategy Lab | the on-page console |
| Development | Start a build conversation | dev intake / contact |
| Work with Apollo | Continue below / Request a Property Review / Submit a Deal | form anchor or `/submit?intent=` |
| MarketFlow | Request MarketFlow Access | `/marketflow/access` |
| Peggy | Open PeggyAI | Peggy widget |
| Nelson Dr | Read the full breakdown / Request a Property Review | case study / `/submit` |
| About / generic close | Start with one honest read | `/contact` |

**Launch QA checklist** (run before declaring any public-site change done):
1. `npx tsc --noEmit` clean.
2. a11y suite green: `timeout 110 npx vitest run client/src/__tests__/keyboard-a11y.test.tsx --reporter=basic` (73/73).
3. Desktop + 375px review of every changed surface; hero text legible over the brightest part of the image.
4. Mobile menu opens/closes; primary CTA + phone reachable.
5. Every interior CTA matches the routing table (no stray generic "Submit a Property" in page bodies); no dead `#` anchors.
6. No forbidden filler or compliance-risk phrases introduced; PeggyAI shown as "Early access · in training".
7. Proof imagery is real and disclosed; no section reuses another's hero; founder portrait only on `/work-with-apollo` + `/about`.
8. SEO: new/changed route has a unique entry in `shared/seo-routes.ts`; `curl` it and confirm a unique `<title>`, `<meta name="description">` (≤155 chars), and `og:*` (not the home fallback).

## Operational pointers

- **Lead capture (Wave 3 / Task #134):** unified success surface `client/src/components/success-view.tsx`; first-party CTA attribution via `cta_events` + `trackCtaClick(source, label, href)` in `client/src/lib/analytics.ts`. Admin: `/admin/cta-events`.
- **Phase 2 copy** (`.local/phase-2-copy-proposal.md`, Apollo-approved): Development `RoutingFilterSection`; Strategy Lab `ribbon-how-it-works`; Deal Blueprint at `/deal-blueprint` (intake `/submit?intent=blueprint`, `leadType: "blueprint_request"`); FAQ Quick Read / Full Path / Blueprint Q&As.
- **Pegasus Buyboxes** (config in `client/src/config/buyboxes.ts`): four IDs (`value-add-sfr`, `adu-east-bay`, `estates-probate`, `small-multifamily`, `publicReady: false`); CTA "Request Notification" posts `leadType: "buybox_interest"`, `source: "buybox:<id>"`. Disclosure via `BUYBOX_DISCLOSURE`. Buyboxes live at `/marketflow/buyboxes` (`client/src/pages/marketflow-buyboxes.tsx`); the `/marketflow` landing surfaces a single teaser.
- **HQ integration (Task #153):** HQ public intake at `https://pegasus-hq-operating-system.vercel.app/api/public/intake`. Env: `PEGASUS_HQ_PUBLIC_INTAKE_URL`. Outbox/no-op fallback; the site never blocks on HQ availability. leadType → outreachReason: `submit` → `property_review`, `vendor` → `vendor_application`, `buybox_interest` → `buybox_interest`, `blueprint_request` → `paid_blueprint_request`, `peggy_note`/`peggy_notify` → `peggy_inbound`. *Not yet wired:* the snapshot-status read contract (`getSnapshotStatusByToken`, `recordSnapshotNextStep`) — `client/src/pages/snapshot-status.tsx` is UI-only fixture data and honest about it.
- **Peggy phone (Task #152):** launching on 925-744-8525. Four launch gates: CA two-party recording consent (Penal §632), Fair Housing refusals, DRE licensing exposure, Civil Code §1695 disclosure for owner-occupant foreclosure/default.

## External dependencies

- **UI:** Radix · Tailwind · CVA · Lucide · `react-icons/si` (logos) · Google Fonts (Cormorant Garamond · Space Grotesk + supporting faces).
- **Data/Forms:** React Hook Form · Zod · TanStack Query · drizzle-zod.
- **DB:** Supabase · Drizzle · Neon serverless PostgreSQL.
- **Auth:** passport · express-session · connect-pg-simple · Supabase Auth.
- **Dev:** TypeScript · Vite · Vitest (`npm test` / `npm run test:watch`).
- **Comms:** SendGrid · OpenAI (Peggy).

## Authoritative blueprints

- `client/src/pegasus/` — **controlling** design prototype (layout, typography, palette, copy, motion).
- Retired references (historical only, superseded by the prototype): `docs/architecture/Pegasus_Website_Structure_v1_FINAL.md`; Empire Doctrine v1.0.2 + Amendment 1 + Amendment 2 (`attached_assets/`); `docs/architecture/website-experience-blueprint-v1.md` / `website-marketflow-blueprint-v1.3.1.md`.
