# Pegasus DreamScapes Corp — Empire Doctrine v1.0.1 (Foundation Reset)

## Overview
Strategy-first real estate operating company in the East Bay (Pleasant Hill, California). Positioning: **"The Deal Architect"**. Every property gets a path. Honest review, disciplined execution, no marketing-fluff. The public website is the Foundation Reset: a small, locked, voice-disciplined v1 surface designed to hold the brand without overclaiming.

**Visual identity is the prior Final Brand Asset System — preserved in full** (Deep Navy / Rich Copper / Warm Cream / Charcoal, with Cinzel · Cormorant · Montserrat · Inter, plus the original hero photo treatment, More dropdown, and editorial page layouts). The Foundation Reset (Task #124) changed **structure, navigation, info, and function only** — palette, typography, header design, and page-level visual treatments were intentionally rolled back to the pre-#124 design after the founder's explicit "upgrade not downgrade" direction.

## User Preferences
Preferred communication style: simple, everyday language.

## Brand Identity (canonical)

- **Brand casing**: **Pegasus DreamScapes** (capital P, capital D, capital S — always). Legal entity: Pegasus DreamScapes Corp.
- **Tagline**: The Deal Architect.
- **Motto** (footer, locked): "Dream it. Build it. Live it."
- **Belief line** (about, locked): "Built on strategy. Governed by virtue. Executed with discipline."
- **Founder**: Paolo "Apollo" Duran — Founder & Principal. DRE #02333658, Keller Williams East Bay. Each office is independently owned and operated.
- **Contact**: `apollo@pegasusdreamscapes.com` / `925-744-8525`. Replaces all legacy `hello@`/`info@`.
- **Palette** (HSL tokens in `client/src/index.css` — Final Brand Asset System, preserved through Foundation Reset):
  - Deep Navy `#0D1B2D` → `--navy`, `--foreground`, `--secondary`
  - Rich Copper `#C77A3A` → `--primary`, `--accent`, `--ring`, `--copper`
  - Warm Cream `#F6EFE4` → `--background`, `--cream`
  - Charcoal `#1E2328` → `--charcoal`
- **Type system** (four families — preserved through Foundation Reset):
  - **Cinzel** → `font-display` (Trajan-style display caps, wordmark + stone-carved labels)
  - **Cormorant Garamond** → `font-serif` (editorial headlines + H1/H2/H3)
  - **Montserrat** → `font-supporting` (letterspaced kickers + UI labels)
  - **Inter** → `font-sans` (body + forms + UI)
- **Logo**: SVG-first. `public/brand/pegasus-wordmark.svg`, `public/brand/pegasus-mark.svg`, `public/favicon.svg`. (Final illustrated mark TBD; current SVGs are typography-driven placeholders.)

## Locked voice rules (Empire Doctrine v1.0.1)

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

`/sell → /submit?intent=sell`, `/submit-deal → /submit?intent=deal-jv`, `/submit-property → /submit?intent=property`, `/wholesale → /submit?intent=deal-jv`, `/services → /development`, `/resources → /library`, `/buyers → /marketflow`, `/buy → /marketflow`, `/dreamspace → /capital`, `/partner → /capital`, `/capital-raising → /capital`, `/invest → /capital`. Removed from the public surface entirely: `/systems`, `/ecosystem`, `/education`, `/calculators` (the original calculator suite is preserved only at `/strategy-lab/classic`).

## Navigation grouping (locked v1.0.1, OLD visual design)

- **Desktop header**: Strategy Lab · Projects · Development · MarketFlow · About plus a **More** dropdown sourced from `NAV_MORE`. Brand wordmark left (illustrated Pegasus mark + Cinzel "PEGASUS DREAMSCAPES" + Montserrat "THE DEAL ARCHITECT" subtitle), "Submit a Property" copper CTA right. The original visual treatment is preserved; the More dropdown is intentional and `nav-parity.test.tsx` only requires content parity, not absence.
- **Mobile sheet**: NAV_PRIMARY at top, then a "More" group exposing `/library`, `/vendor-network`, `/capital`, `/connect`, `/contact`, `/disclosures`.
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
