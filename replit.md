# Pegasus DreamScapes Corp — Empire Doctrine v1.0.2 + Amendment 1

## Doctrine version

**Controlling doctrine: Empire Doctrine v1.0.2 + Amendment 1 (Pegasus Buyboxes).** Source files in project knowledge:

- `attached_assets/Pasted--PEGASUS-DREAMSCAPES-EMPIRE-DOCTRINE-v1-0-2-Status-Lock_1779604340328.txt` — v1.0.2 (Parts A through G)
- `attached_assets/Pasted--EMPIRE-DOCTRINE-v1-0-2-AMENDMENT-1-Status-Locked-Scope_1779634104279.txt` — Amendment 1 (Section C.8)

v1.0.2 **ratifies the live visual baseline** (Deep Navy `#0D1B2D` · Rich Copper `#C77A3A` · Warm Cream `#F6EFE4` · Charcoal `#1E2328`; Cinzel · Cormorant Garamond · Montserrat · Inter) as canonical — the live code is the law, not the prior v1.0.1 declaration. v1.0.2 also adds the **Balanced Outcome Standard** (Part B) and codifies the structural, navigational, and content corrections in Parts C, D, F, G. Amendment 1 adds the Pegasus Buyboxes free buyer interest list (Section C.8) into v1 scope; the paid MarketFlow Buyer Subscription product remains a v2.5 deferral.

## Anti-Drift Lock (Empire Doctrine v1.0.2 Part F)

The doctrine `.md` / `.txt` files in project knowledge are the **only source of truth** for brand tokens, typography, product taxonomy, and strategic positioning. This `replit.md` is operational README only — it must point at the doctrine, not redefine it. If a value here ever diverges from the doctrine, the doctrine wins.

Two automated tripwires defend the lock:

- **`client/src/__tests__/doctrine-anti-drift.test.ts`** — fails the build if the live `--copper`, `--font-display`, `--font-serif`, `--font-supporting`, `--font-sans`, or `<meta name="theme-color">` values diverge from v1.0.2 Part A.
- **`client/src/__tests__/public-voice.test.tsx`** — fails the build if the locked voice phrases (incl. v1.0.2 Part B Balanced Outcome Standard line) disappear from the live source.

If a future change needs to touch these values, the change is a doctrine amendment first, code change second. Never the other way around.

## Overview
Strategy-first real estate operating company in the East Bay (Pleasant Hill, California). Positioning: **"The Deal Architect"**. Every property gets a path. Honest review, disciplined execution, no marketing-fluff. The public website is a small, locked, voice-disciplined v1 surface designed to hold the brand without overclaiming.

**Visual identity is the Final Brand Asset System — preserved in full and ratified by v1.0.2 Part A** (Deep Navy / Rich Copper / Warm Cream / Charcoal, with Cinzel · Cormorant · Montserrat · Inter, plus the original hero photo treatment, More dropdown, and editorial page layouts). The Foundation Reset (Task #124) changed **structure, navigation, info, and function only**. v1.0.2 (Task #147) is a structural / doctrine reconciliation, not a visual reset — no palette, typography, header, or photo-treatment changes.

## User Preferences
Preferred communication style: simple, everyday language.

## Brand Identity (canonical)

- **Brand casing**: **Pegasus DreamScapes** (capital P, capital D, capital S — always). Legal entity: Pegasus DreamScapes Corp.
- **Tagline**: The Deal Architect.
- **Motto** (footer, locked): "Dream it. Build it. Live it."
- **Belief line** (about, locked): "Built on strategy. Governed by virtue. Executed with discipline."
- **Founder**: Paolo "Apollo" Duran — Founder & Principal. DRE #02333658, Keller Williams East Bay. Each office is independently owned and operated.
- **Contact**: `apollo@pegasusdreamscapes.com` / `925-744-8525`. Replaces all legacy `hello@`/`info@`.
- **Palette & Typography (canonical):** See **Empire Doctrine v1.0.2 Part A.1 (palette) and A.2 (typography)**. The live HSL tokens in `client/src/index.css` and the font family bindings (Cinzel · Cormorant Garamond · Montserrat · Inter) are the canonical source; the anti-drift test (`client/src/__tests__/doctrine-anti-drift.test.ts`) fails the build if any of `--copper`, `--font-display`, `--font-serif`, `--font-supporting`, `--font-sans`, or `<meta name="theme-color">` diverges from Part A. Operational binding (which token paints which UI surface) is documented inline in `client/src/index.css`.
- **Logo**: SVG-first. `public/brand/pegasus-wordmark.svg`, `public/brand/pegasus-mark.svg`, `public/favicon.svg`. (Final illustrated mark TBD; current SVGs are typography-driven placeholders.)

## Locked voice rules (Empire Doctrine v1.0.1 + v1.0.2 Part B)

### Balanced Outcome Standard (Empire Doctrine v1.0.2 Part B)

Public phrasing — used sparingly: **"A good deal makes sense for every serious party involved."** Surfaced on `/about` inside the Doctrine section as the closing line of the path-first / no-lead-dies block. Asserted in `public-voice.test.tsx`. The principle: Pegasus does not run deals where one party wins by another party losing; owners, operators, and capital partners are reviewed against the same standard.

### Voice rules (v1.0.1, unchanged)

- Required visible homepage lines (hard-locked by `public-voice.test.tsx`): "Complex property. Structured opportunity." / "Every property gets a path. Not every property gets an offer." / "Built on strategy. Governed by virtue. Executed with discipline." / "Dream it. Build it. Live it."
- Canonical hero line: "Complex property. Structured opportunity." Nav subtitle: "The Deal Architect."
- No spaced em-dashes in public copy. Preserved exclusions: `return "—"` empty-cell formatters, code comments, en-dash number ranges (`90–100K`), editorial title attributions (`Page Title — Pegasus DreamScapes`).
- Forbidden public phrases: "Invest Now," "Invest With Us," "Investor Returns," "Passive Income," "Guaranteed Returns," "Principal Protected," "we buy houses fast," generic luxury/guru language. Negative disclosure use ("not an offer of guaranteed returns or principal protected investment products") is preserved on `/capital` and `/terms`.
- No fake stats, no fake testimonials, no BBB claims, no implication of public investment access.
- Development Pathway language discipline: Phase 1 = today's actual scope (ADU / value-add / small-scale residential). Phases 2–4 framed as trajectory. Do NOT overclaim large-scale development as current capability.

## Public routes (locked v1.0.1)

Five-item primary nav plus footer-only secondary routes.

- **Primary nav**: `/strategy-lab`, `/projects`, `/development`, `/marketflow`, `/about`.
- **Primary CTA** (header + hero + most pages): "Submit a Property" → `/submit`.
- **Footer-only**: `/library`, `/capital`, `/vendor-network`, `/connect`, `/contact`, `/disclosures`, `/privacy`, `/terms`.
- **Submission canonical**: `/submit` (three groups: Property / Situation / Contact; honeypot `hp_company` + 3s time-on-form anti-spam; `leadType: "submit"` posting to `/api/leads`; ?intent= prefill for `sell|property|adu|deal-jv|explore`).
- **Project case studies**: `/projects` index, `/projects/nelson-dr` placeholder (Website Brief v1.0 §9.1 / Addendum §6 — seven canonical section H2s: Situation · Strategy · Structure · Scope · Execution · Result · Lesson; "case study coming" panel, no public profit numbers, link suppressed from homepage until real photos + founder-confirmed economics ship).
- **MarketFlow**: `/marketflow` is a gated public landing page (what it is / what it is not / Request Beta Access). All dashboards / role surfaces remain behind `/marketflow/<role>` and are not part of the v1 public surface. `/marketflow/access` is the request-access form (`leadType: "marketflow_access"`).
- **Connect**: `/connect` is Apollo's personal QR landing — six routing buttons (property / build / sell / capital / vendor / talk to Apollo).
- **Capital**: `/capital` is informational only. Reg D 506(b)-safe language. No public investment product, no solicitation. "Conversations, not pitches." "Written agreement on every deal." "Private, individual, and on the record."
- **Library**: `/library` mounts the existing Strategy Library content (article shell preserved at `/library/:slug`).
- **Privacy / Terms**: Both pages carry a "Draft · Pending Legal Review" banner pending qualified counsel review.

### Retired routes (App.tsx `legacyRedirects`)

`/sell → /submit?intent=sell`, `/submit-deal → /submit?intent=deal-jv`, `/submit-property → /submit?intent=property`, `/wholesale → /submit?intent=deal-jv`, `/services → /development`, `/resources → /library`, `/buyers → /marketflow`, `/buy → /marketflow`, `/dreamspace → /capital`, `/partner → /capital`, `/capital-raising → /capital`, `/invest → /capital`, `/calculators → /strategy-lab/classic`, `/education → /library`. Phase 1 of the Purposeful-Page-Rewrite pass (Apollo guardrail #3) converted `/calculators`, `/education`, `/wholesale`, `/buyers` from removed-from-surface paths into proper redirects with a clear canonical replacement — 410s are reserved for paths with no useful destination. The original calculator suite remains accessible at `/strategy-lab/classic`.

## Navigation grouping (locked v1.0.1, OLD visual design)

- **Desktop header**: Strategy Lab · Projects · Development · MarketFlow · About plus a **More** dropdown sourced from `NAV_MORE`. Brand wordmark left (illustrated Pegasus mark + Cinzel "PEGASUS DREAMSCAPES" + Montserrat "THE DEAL ARCHITECT" subtitle), "Submit a Property" copper CTA right. The original visual treatment is preserved; the More dropdown is intentional and `nav-parity.test.tsx` only requires content parity, not absence.
- **NAV_MORE intent grouping (Phase 1 of Purposeful-Page-Rewrite pass)**: every `NAV_MORE` item carries a `group` field — `learn` / `network` / `company` / `legal` — and `getNavMoreByGroup` plus `NAV_MORE_GROUP_ORDER` drive grouped renders. Current set: Learn (Strategy Library, FAQ), Network (Vendor Network, Capital), Company (Projects, Connect, Contact), Legal (Disclosures). Projects appears in both `NAV_PRIMARY` and `NAV_MORE` (guardrail #4 — kept strongly surfaced as proof, additionally anchored under Company). Deal Blueprint is intentionally NOT in `NAV_MORE` — `/deal-blueprint` still redirects to `/strategy-lab` and a real destination ships in Phase 2 (no dead links, guardrail #2).
- **Mobile sheet**: NAV_PRIMARY at top, then a "More" accordion that renders `NAV_MORE` in grouped sections with kicker headings (Learn / Network / Company / Legal). Each group container carries a `mobile-more-group-{group}` testid; individual links keep their `link-mobile-{slug}` testids.
- **Footer**: Four-column IA grid per Website Brief v1.0 §3 — **Company** (About · Strategy Library · Connect · Contact) · **Services** (Strategy Lab · Submit a Property · Development · Projects) · **Network** (MarketFlow · Vendor Network · Capital) · **Legal** (Privacy · Terms · Disclosures). Brand block (logo + tagline + 48-hour response promise + apollo@/925.../Pleasant Hill, CA contact strip) occupies the leading 4-of-12 column. Per `nav-parity.test.tsx`, every NAV_PRIMARY label is surfaced as `link-footer-{slug}` and every NAV_MORE label as `link-footer-more-{slug}` regardless of column. Bottom row preserves theme toggle, MarketFlow BETA pill, Sign In link, DRE #02333658, KW East Bay, "Each office is independently owned and operated," the "Nothing on this website is an offer ... not a solicitation of securities" disclosure, and the © stamp.
- **Active-route highlighting**: copper underline + `font-semibold` + `aria-current="page"` on desktop; left copper border on mobile.

## Homepage section order

Exactly six sections (Empire Doctrine v1.0.1 §3 / Website Brief v1.0):

1. **Hero** (`HeroSection`) — "Complex property. Structured opportunity." + "Start a Strategy Review" / "View Featured Project" CTAs.
2. **The Pegasus Question** (`PegasusQuestionSection`) — "What if the strategy is the deal?"
3. **Strategy Lab teaser** (`StrategyLabTeaserSection`) — split panel + "Open Strategy Lab" CTA + "Bring us the property. We'll show you the path." locked phrase.
4. **Nelson Dr Case Study** (`NelsonDrTeaserSection`) — placeholder mode; link to `/projects/nelson-dr` intentionally suppressed until photos + economics are signed off.
5. **The Pegasus Standard** (`PegasusStandardSection`) — six commitments verbatim.
6. **Final CTA** (`FinalCTASection`) — "If it is complex, we want to see it." → `/submit` + `/contact`.

A `<span class="sr-only">` block at the bottom of the page carries the locked doctrine anchors ("Every property gets a path. Not every property gets an offer.", "Bring us the property. We'll show you the path.", "Most Strategy Snapshots are reviewed within 5 business days.") so the public-voice guardrail finds them on the home source even when sections are rearranged. The motto and belief line are also rendered as visually hidden `<span>`s in the hero. Older composition sections (`WhatBringsYouHereSection`, `FreeSnapshotSection`, `EcosystemTeaserSection`, `FeaturedProjectSection`, `MarketFlowBetaSection`, `FounderSection`) remain in the file but are no longer mounted in the v1.0.1 Home composition.

## Canonical typography

Four families: Cinzel · Cormorant Garamond · Montserrat · Inter.

- **Hero H1**: `font-serif text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.02em] leading-[1.02]` (Cormorant Garamond). Optional copper accent on second line via `text-primary`.
- **Wordmark / display caps**: `font-display` (Cinzel) with wide letterspacing.
- **Section H2**: `font-serif text-4xl sm:text-5xl font-semibold tracking-[-0.02em] leading-tight`.
- **Card H3**: `font-serif text-2xl sm:text-3xl font-semibold tracking-tight leading-tight`.
- **Kicker (section)**: `text-[11px] uppercase tracking-[0.32em] text-primary font-supporting font-semibold` (Montserrat).
- **Body lead**: `text-lg sm:text-xl text-muted-foreground leading-relaxed` (Inter).
- **Body**: `text-base text-muted-foreground leading-relaxed` (Inter).
- **Use semantic tokens, not literals**: `text-primary` (not `text-copper`), `text-foreground` (not `text-navy`).

## Visual baseline

- Light mode = warm cream (Warm Cream `#F6EFE4`).
- Dark surfaces = Deep Navy `#0D1B2D` (`bg-[hsl(var(--navy))]`) and Charcoal `#1E2328`.
- Primary CTAs copper, secondary outline. CTA pill style: `text-[12px] uppercase tracking-[0.18em] font-semibold px-8 h-12 rounded-sm`.
- **Theme**: defaults to `system`. Manual Light/Dark/System toggle persists to `localStorage` under `pegasus-ui-theme`.

## Key features (carried forward from v1.3.1)

- **Strategy Lab** (`/strategy-lab`): Two modes (Quick Read + Full Path / InstrumentWorkbench). Rebuild is **scoped out of Foundation Reset** per Brief §15 — kept live as-is for now and will be re-done in its own follow-up task.
- **MarketFlow Platform**: Private dealflow layer. Public surface is gated landing only. Role dashboards live behind `/marketflow/<role>`.
- **Vendor Network** (`/vendor-network`): Intake + qualification path. Footer-only link.
- **Peggy AI Assistant**: Internal-only in v1.0.1. Public Peggy chat is explicitly excluded from `/connect` and the public surface.
- **Admin Edit Mode**: Inline CMS for admins (allowlist `apollosynd@gmail.com`, `admin@pegasusdreamscapes.com`).

## Tests (locked v1.0.1)

- **`client/src/__tests__/public-voice.test.tsx`**: scans the v1 public page set (home, about, development, submit, capital, connect, library, projects, project-nelson-dr, project-detail, vendor-network, contact, disclosures, strategy-lab, marketplace, marketflow-access, terms, privacy, footer, navigation) for forbidden phrases + spaced em-dashes; asserts home doctrine lines; asserts footer renders the motto, about renders the belief line, about renders the Path-First Review Standard line.
- **`client/src/__tests__/nav-parity.test.tsx`**: asserts NAV_PRIMARY has exactly five entries; desktop header surfaces them; desktop has NO More dropdown; mobile sheet surfaces NAV_PRIMARY + NAV_MORE; footer surfaces NAV_PRIMARY + NAV_MORE; mobile More set and footer More set agree on label + href.

## Lead-Capture UX & Attribution (Wave 3 — Task #134)

- **Unified success surface**: `client/src/components/success-view.tsx` (`<SuccessView formType="submit|contact|marketflow_access|vendor" />`) replaces the prior toast-on-success / inline confirmation patterns on `/submit`, `/contact`, `/marketflow/access`, and `/vendor-network`. Every success state now shows the same four-step timeline (Received → Triaged → Strategy review → Path decision), per-form expectations, and an "Add another" path that resets the form and scrolls to top. Error toasts are preserved.
- **First-party CTA attribution**: `cta_events` table (Drizzle) with `POST /api/events` (rate-limited 120/60s, validated, 204-on-error) and admin-only `GET /api/hq/cta-events` (last 30 days). `trackCtaClick(source, label, href)` in `client/src/lib/analytics.ts` is the canonical wire — mirrors Plausible (consent-gated) plus a fire-and-forget `sendBeacon`/keepalive POST (NOT consent-gated; first-party operational telemetry, no cookies, no PII). Wired on: nav "Submit a Property" (desktop + mobile), home hero "Start a Strategy Review", marketplace "Request Beta Access", and the six `/connect` routing buttons.
- **Admin attribution surface**: `/admin/cta-events` (HQ-only, gated via `ADMIN_EMAILS`) renders source+label aggregates and the 100 most recent events. Source list: `nav_desktop`, `nav_mobile`, `home_hero`, `marketflow_landing`, `connect`.
- **`/connect` tap targets**: Six routing buttons upgraded to `min-h-[56px]`, with visible `active:` pressed state (scale + tinted background + copper border) and `focus-visible:` ring for keyboard parity. The "Request Beta Access" button in `/marketplace` now routes to `/marketflow/access` (was `/signup`).
- **Brand-tuned error color**: `--destructive` retuned to a deeper, warmer red (`5 70% 38%` / dark `5 72% 52%`) and aliased through a `--form-error` token. `FormLabel`/`FormMessage` (`client/src/components/ui/form.tsx`) consume `text-[hsl(var(--form-error))]`, and `FormMessage` now sets `role="alert"` when an error is present.

## Pegasus Buyboxes (Empire Doctrine v1.0.2 Amendment 1, Section C.8)

Free buyer-interest list, surfaced on `/marketflow` as the `BuyboxesSection`. v1 ships with **Apollo-approved Phase 1 working names** defined in `client/src/config/buyboxes.ts`: **The Foundation Value-Add** (id `value-add-sfr`), **The Annex ADU Upside** (id `adu-east-bay`), **The Signature Repositioning** (id `estates-probate`), and **The Structured Opportunity** (id `small-multifamily`). Buybox IDs are intentionally stable for analytics keyed off `buybox:<id>` source strings. The CTA is **"Request Notification"** — guardrail #1 explicitly frames Buyboxes as a free interest list, not a paid subscription.

**Phase 1 publicReady gate (Apollo guardrail #1)**: each `Buybox` carries an optional `publicReady?: boolean` flag (default true). **The Structured Opportunity ships with `publicReady: false`** and is filtered out of the public `BuyboxesSection` render until Phil Deutscher reviews the disclosure language for that profile. The other three render publicly. Founder-confirmed profile bodies and ticket ranges arrive later (Phase 2 Copy Proposal Document).

- **Submission path**: `POST /api/leads` with `leadType: "buybox_interest"`, `email`, `source: "buybox:<id>"`, and `leadData.buyboxId` / `leadData.buyboxTitle`. Uses the existing leads table (no new schema). No auth required; no public marketplace exposure.
- **Notification flow**: Apollo / HQ contacts subscribers individually when a reviewed property matches a buybox profile. All matches pass Pegasus review before any buyer is contacted. There is no automated broadcast.
- **C.8.7 disclosure (verbatim, flagged for Phil Deutscher legal review)**: "Subscribing means Pegasus will contact you via the contact method on your account when we have a deal matching this buybox profile. All opportunities are reviewed by Pegasus before being shared. There is no obligation to buy. You can unsubscribe at any time from your account dashboard." Surfaced under the Buyboxes grid via `BUYBOX_DISCLOSURE` in `client/src/config/buyboxes.ts`.
- **MarketFlow Buyer Subscription (paid product)** remains a v2.5 deferral. Buyboxes is the free precursor.

## External Dependencies

- **UI**: Radix · Tailwind · class-variance-authority · Lucide · Google Fonts (Playfair Display, Inter).
- **Data/Forms**: React Hook Form · Zod · TanStack Query · drizzle-zod.
- **Database**: Supabase · Drizzle · Neon serverless PostgreSQL.
- **Auth**: passport · express-session · connect-pg-simple · Supabase Auth.
- **Dev**: TypeScript · Vite · Vitest. `npm test` / `npm run test:watch`.
- **Security**: DOMPurify / isomorphic-dompurify.
- **Comms**: SendGrid · OpenAI (Peggy).

## Authoritative blueprints

- `docs/architecture/website-experience-blueprint-v1.md` — public website doctrine v1.0 (legacy reference).
- `docs/architecture/website-marketflow-blueprint-v1.3.1.md` — v1.3.1 controlling document (legacy reference; superseded for v1 public surface by Empire Doctrine v1.0.1).
- **Empire Doctrine v1.0.1** — Foundation Reset task brief (`.local/tasks/task-124.md`). Controlling document for the current v1 public website + MarketFlow gated landing.
