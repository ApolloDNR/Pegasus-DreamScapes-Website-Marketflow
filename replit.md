# Pegasus Dreamscapes Corp — Strategy-First Real Estate Operating Company

## Overview
Strategy-first real estate operating company. Positioning: **"The Deal Architect"** — "Where others see impossible, we see a path." Three pillars (Development, Investments, Systems) + eight outcome lanes route distressed/complex property to the best structural path. Private beta. No-lead-dies doctrine.

## User Preferences
Preferred communication style: simple, everyday language.

## System Architecture

- **Frontend**: React 18 + TypeScript + Vite, Wouter, TanStack Query, Radix + Tailwind (shadcn), React Hook Form + Zod, Supabase Auth, lazy + route-level code splitting. Unified MarketFlow portal at `/marketflow` with role-based dashboards.
- **Backend**: Express on Node + TypeScript. REST `/api`, Zod validation, Supabase Auth, rate limiting, SendGrid, WebSocket.
- **Data**: Migrating to Supabase (UUID + RLS) as primary. Legacy on PostgreSQL/Drizzle (Neon).

## Brand Identity (canonical)

- **Founder**: Paolo "Apollo" Duran — Founder & Principal.
- **Contact**: `apollo@pegasusdreamscapes.com` / `925-744-8525`. Replaces all legacy `hello@`/`info@`.
- **Palette** (HSL tokens in `client/src/index.css`, synced to Final Brand Asset System):
  - Deep Navy `#0D1B2D` → `--navy: 214 55% 11%`
  - Rich Copper `#C77A3A` → `--copper: 27 56% 50%` (`--primary`, `--accent`, `--ring`)
  - Warm Cream `#F6EFE4` → `--cream: 37 50% 93%` (`--background` light)
  - Charcoal `#1E2328` → `--charcoal: 210 14% 14%`
- **Founder portrait**: `attached_assets/image_1778735694150.png` (1122×1402). Used in FounderSection on `/`, `/about`, `/invest`.
- **Logo**: `client/src/assets/brand/pegasus-mark-full.png` — transparent PNG (navy + copper). Used in nav (`h-14 lg:h-16`), footer (`h-32`), favicon set, `/brand/pegasus-mark.png` for OG cards. Flat SVG rebuild still pending.
- **Type system** (4 tiers, Google Fonts via `index.css`):
  - **Cinzel** → `font-display` (wordmark caps)
  - **Cormorant Garamond** → `font-serif` (editorial display)
  - **Montserrat** → `font-supporting` (letterspaced kickers)
  - **Inter** → `font-sans` (body)
- **Brand utilities**: `.text-headline-gold`, `.brand-divider`, `.brand-stripe` (6px hero footer accent).

## Locked voice rules (v1.3.1)

- Required visible homepage lines (hard-locked by `public-voice.test.tsx`): "Complex property. Structured opportunity." / "Every property gets a serious review. Not every property gets an offer." / "Built on strategy. Governed by virtue. Executed with discipline." / "Dream it. Build it. Live it."
- Canonical hero line: "Complex property. Structured opportunity." (split across `home.hero.line1` / `home.hero.line2` EditableTexts). "Where others see impossible, we see a path." is supporting copy used in the hero subhead, `/sell`, `/about`, peggy-dock, and instrument-workbench — no longer hard-locked by the voice test but preserved across the site. Nav subtitle: "The Deal Architect."
- No spaced em-dashes in public copy. Preserved exclusions: `return "—"` empty-cell formatters, code comments, en-dash number ranges (`7–14 days`), editorial title attributions (`Page Title — Pegasus Dreamscapes`).
- Forbidden public phrases: "Invest Now," "Invest With Us," "Investor Returns," "Passive Income," "Guaranteed Returns," "Principal Protected," "we buy houses fast," AI-sounding phrasing, generic luxury/guru language. Negative disclaimer use ("not an offer of guaranteed returns or principal protection") is preserved on `/invest` and `/terms` because it serves disclosure.
- No fake stats, no fake testimonials, no BBB/DRE claims, no glassmorphism overuse.
- Development Pathway language discipline: Phase 1 = today's actual scope (ADU/flips/BRRRR/small-scale). Phases 2–4 framed as trajectory ("Each phase is earned, not assumed."). Do NOT overclaim large-scale development as current capability.

## Public routes (locked v1.3.1)

`/`, `/sell`, `/invest`, `/projects`, `/projects/:slug`, `/contact`, `/marketflow`, `/deal-blueprint`, `/snapshot/:token`, `/strategy-lab`, `/strategy-lab/classic`, `/strategy-lab/library`, `/resources`, `/education`, `/development`, `/vendor-network`, `/about`, `/disclosures`. `/resources` (Field Notes & Tools) and `/education` (Guided Learning Path) carry distinct kickers but share the Strategy Library brand. `/vendor-network` aliases Contact until dedicated pages ship. `/calculators` redirects to `/strategy-lab`; original 8-tile calculator suite preserved at `/strategy-lab/classic`. `/development` is the Pegasus Development pillar page (spine doctrine + 4-phase pathway + supporting pillars).

**Retired funnel routes** (redirects in `App.tsx` `legacyRedirects`): `/wholesale` → `/sell`, `/submit-deal` → `/sell?intent=deal-jv` (preselects wholesaler + Deal/JV intent in the Strategy Review form), `/services` → `/development`, `/buyers` + `/buy` → `/marketflow`, `/dreamspace` + `/partner` + `/capital-raising` → `/invest`. Original components deleted.

**`noIndex` utility routes**: `/services`, `/dashboard`.

## Navigation grouping (locked Pass D)

Canonical across desktop header, mobile sheet, and footer. Any addition or rename must touch all three together.

- **Desktop header**: Approach (`/sell`) · Projects (`/projects`) · Capital (`/invest`) · MarketFlow [BETA] (`/marketflow`) · About (`/about`) · **More ▾**.
- **More ▾**: Strategy Library (`/resources`), Strategy Lab (`/strategy-lab`), Vendor Network (`/vendor-network`), Contact (`/contact`), Disclosures (`/disclosures`). Unauthenticated users see "Sign In" → `/api/login`.
- **Active-route highlighting**: copper underline + `font-semibold` + `aria-current="page"` (white underline on dark hero, left copper border on mobile). Bronze is reserved for underline/hover, never for active text (bronze-on-cream fails WCAG AA at 13px). `More ▾` lights up when any child route is active.
- **"Development" intentionally NOT in top nav** — reachable from hero secondary CTA and inline links from `/sell`.
- **Footer Explore** mirrors header with a "More" sub-column carrying secondary links + Deal Blueprint.

## Homepage section order

Hero → EveryPropertyGetsAPath → Services (Three Pillars) → DevelopmentPathway (4 phases) → StrategyStructureStacks → OutcomeLanes (No Lead Dies, 4+4) → FeaturedProject → MarketFlowBeta → OperatingPrinciples → FinalCTA. Sell/Invest/HowItWorks/TrustLogos/FeaturedDeals/FAQ/Newsletter/Contact components still exist but are unmounted from the homepage — they live on `/sell`, `/invest`, `/contact`.

## Canonical typography

One type system across every public page.

- **Hero H1**: `font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.02em] leading-[0.98]`. Optional copper italic phrase on second line via `bg-gradient-to-r from-[#E8DBC5] via-[#D4B483] to-[#C17A4A] bg-clip-text text-transparent`.
- **Section H2**: `font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-tight` (add `lg:text-6xl` for marquee CTA H2 only).
- **Card H3**: `font-serif text-2xl sm:text-3xl font-semibold tracking-tight leading-tight`.
- **Kicker (section)**: `text-[11px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold`.
- **Kicker (inside card)**: `text-[10px] uppercase tracking-[0.3em] text-primary font-supporting font-semibold`. Sub-kickers may use `text-muted-foreground`; never drop `font-supporting`.
- **Kicker (dark glass)**: `text-[10px] uppercase tracking-[0.28em] text-champagne font-supporting font-semibold` — only inside dark glass panels.
- **Body lead**: `text-lg sm:text-xl text-muted-foreground leading-relaxed` (light) / `text-cream/90` (dark).
- **Body**: `text-base text-muted-foreground leading-relaxed`.
- **Stat number**: `font-serif text-3xl sm:text-4xl font-semibold tabular-nums`.
- **Use semantic tokens, not literals**: `text-primary` (not `text-copper`), `text-foreground` (not `text-navy`). `text-copper`/`text-cream`/`text-charcoal` literals reserved for fixed-context badges and the dark `bg-navy` hero.

## Visual baseline

- Light mode = warm cream (`--background: 38 50% 96%`, `--cream: 38 50% 94%`), not white SaaS.
- Primary CTAs copper, secondary outline. Hero subheadline uses Cormorant Garamond (`text-xl sm:text-2xl lg:text-[26px]`, leading-[1.45]).
- Glass panels on `/sell` ("The Doctrine") and `/invest` ("How we work with capital") use `bg-black/55 backdrop-blur-2xl border-champagne/25` with outer dark blur halo + body text `white/85-90`.
- **Theme**: ThemeProvider defaults to `system`. Manual Light/Dark/System toggle persists to `localStorage` under `pegasus-ui-theme`. On the transparent hero nav, toggle is forced white via wrapper class.
- **Contrast (WCAG AA)**: light `--muted-foreground` `213 30% 28%` (~9:1 on cream); dark `--muted-foreground` `38 25% 78%` (~10.5:1 on navy).
- **Console hygiene**: `client/src/lib/supabase.ts` + `supabase-auth-context.tsx` log a single `console.info` per session when `VITE_SUPABASE_URL` is empty.

## Key features

- **Peggy AI Assistant** (`server/peggy.ts`, `peggy-dock.tsx`, `peggy-chat.tsx`): OpenAI Strategy Assistant with structural-read prompt — 8 outcome lanes taxonomy, Strategy Snapshot draft template, doctrine + voice rules + forbidden phrases locked into the system prompt, CAN/CANNOT block, bounded response template for value/offer/return asks. Per-page context map, role context, conversation persistence.
- **Strategy Lab** (`/strategy-lab`): Two modes via sticky subnav. **Quick Read** = compact 5-field form, free + anonymous (3 runs before sign-in via `FREE_RUN_LIMIT`). **Full Path** = `InstrumentWorkbench` component — 3-pane chassis (Subject rail / Numbers+Scenario+LaneFitBoard / Verdict aside), tone-lens switcher (owner/wholesaler/capital/admin), scenario tabs (Conservative/Base/Aggressive), reverse solver (Blueprint-locked preview), risk register, capital stack tease, Peggy Lab Mode, Save/Share/PDF/Submit. Deep-linkable via `?mode=full`. All math in `shared/strategy-lab` engine + `frameDecisionMemo` adapter.
- **Strategy Lab API**: `/api/property-analyses` (CRUD + share + submit + claim, summary/full visibility tiers); `/api/strategy-lab/touchpoint`, `/blueprint-tiers` (CMS-overridable, $497/$897/$1,497 defaults), `/submit` (48h SLA, Apollo email), `/blueprint-order` (Stripe or invoice). Admin funnel at `/admin/strategy-lab`.
- **Strategy Snapshot PDF v2** (`server/pdf.ts`): Navy cover, copper kicker, Times serif body. Pages: Cover, Numbers, Risk Register, Capital Stack, Sensitivity, Decision Memo, Disclosure. Routes `/api/pdf/strategy-snapshot/by-id/:id` and `/by-token/:token` (visibility-aware). OG card at `/og/snapshot/:token`.
- **MarketFlow Platform**: Private dealflow layer. `/` and `/marketflow` render the "What MarketFlow is not" panel + 9-step intake-to-listing funnel. Grid/Swipe browsing, match scoring, role-gated submissions.
- **Compatibility scoring**: Weighted-factor matching of deals to investor preferences.
- **Deal Negotiation**: Debt/equity structures, counter-offer with offer history, 3-col layout (chat / offer ladder / AI advisor).
- **Community & Messaging**: Forums + DMs. **Notifications**: real-time, priority levels.
- **Document Management**: Drag-and-drop, categorization, photo galleries.
- **User Profiles & Role System**: Stats, reviews, achievement badges, 8-tier RBAC (`MARKETPLACE_ROLES`). 5-step onboarding.
- **Admin Edit Mode**: Inline CMS for admins (allowlist `apollosynd@gmail.com`, `admin@pegasusdreamscapes.com`; backend `isAdmin` flag authoritative). Persists to `site_content` (keys `home.{section}.{field}` or `home.{section}.{index}.{field}`).
- **Demo Mode, Analytics, SEO** (via `useSEO`), **DOMPurify**, **Feature Flags** (`shared/featureFlags.ts` + `useFeatureFlags`), **Print Layouts**, **Saved Searches** (LocalStorage + DB, email alerts).

## Authoritative blueprints

- `docs/architecture/website-experience-blueprint-v1.md` — public website doctrine v1.0.
- `docs/architecture/website-marketflow-blueprint-v1.3.1.md` — controlling document for v1.3.1 (Strategy Review funnel, Property Strategy Snapshot, Pegasus Deal Blueprint, MarketFlow boundary, Peggy Strategy Assistant, Strategy Library, Vendor Network, transitional data stance). Supersedes v1.0 for public website + MarketFlow scope.

## External Dependencies

- **UI**: Radix · Tailwind · class-variance-authority · Lucide · Google Fonts (Cinzel, Cormorant Garamond, Montserrat, Inter).
- **Data/Forms**: React Hook Form · Zod · TanStack Query · drizzle-zod.
- **Database**: Supabase · Drizzle · Neon serverless PostgreSQL.
- **Auth**: passport · express-session · connect-pg-simple · Supabase Auth.
- **Dev**: TypeScript · Vite · Vitest. `npm test` / `npm run test:watch`. Nav parity guard at `client/src/__tests__/nav-parity.test.tsx`.
- **Security**: DOMPurify / isomorphic-dompurify.
- **Comms**: SendGrid · OpenAI (Peggy).
