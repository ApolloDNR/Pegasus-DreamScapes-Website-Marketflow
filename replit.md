# Pegasus DreamScapes Corp — Operational README

## Controlling doctrine

The **controlling design doctrine** for the public website is the saved React design prototype:

- `client/src/pegasus/` — the self-contained prototype (Landing.tsx, nav.tsx, peggy.tsx, forms.tsx, Saved.tsx, pages.tsx, data.tsx, theme.ts, routes.ts) plus its scoped design system `client/src/pegasus/_group.css` (loaded in `main.tsx`). This prototype **replaces the retired Empire Doctrine** as the source of truth for layout, typography, palette, copy, and motion.

The **visual baseline** comes from `_group.css` — re-skinned to the **v4 locked spec** ("Linear meets Palantir", navy):

- **Palette (navy system)**: Deep Navy bg `--bg #0D1B2A` · Copper primary/CTA `--accent #D4872E` (bright `#E3A463`) · Gold accent / lines / numerals `--gold #C9A84C` · Cream text `--cream` / `--text #F5E6D3` · Teal success `--teal #1A9E75` · Charcoal panels `--charcoal #11243A` / deep `#091421`. The retired warm-sand light surface is gone. Dark theme overrides live in the same file under `.pg-root[data-theme='dark']` (cinematic navy `--bg #091421`).
- **Typography**: Fraunces (display/serif — `.font-serif-display`, `.section-numeral`) · Hanken Grotesk (UI/body — default) · JetBrains Mono (labels/data — `.pg-label`, `.nav-dropdown-head`). Loaded via `client/index.html` Google Fonts. Replaces the retired Cormorant Garamond + Space Grotesk/Space Mono.
- The design system is scoped under `.pg-root` so it coexists with the existing shadcn token layer used by the functional surfaces.

The Empire Doctrine `.md` files in `attached_assets/` and the old `docs/architecture/*` blueprints are **retired historical reference only** — they no longer govern. If anything below diverges from the prototype, the prototype wins. This file is operational README only.

## Website Director Standard

The bar for every public page: it should read like a senior studio built it for Pegasus specifically — not like a template with the words swapped. Before shipping any change to a public surface, run it against this standard. This `replit.md` section is the authoritative source of truth (there is no separate loadable skill file).

**1. Every page has one job.** Name the single audience and the single next action before touching layout. If a page is trying to serve everyone, it serves no one. Per-page intent map (real wouter routes):

| Route | Who it's for | One job | Primary CTA (label) |
| --- | --- | --- | --- |
| `/` | First-time visitor | Pick their lane | lane card → audience page |
| `/sellers` | Owner with a complex/stuck property | Start a property review | "Start a property review" |
| `/buyers` | Strategic buyer | See how buyers work with us | "See how buyers work with us" |
| `/dealfinders` | Wholesaler / deal finder | Bring a deal, get a straight answer | "Submit a deal" / "Send the deal" |
| `/capital` | Capital partner | Back specific projects (not blind pools) | "Explore capital partnership" |
| `/operators` | GC / sub / agent / title | Join the vetted build bench | "Join the build bench" |
| `/referral` | Referral partner | Send a name, fee in writing | "Refer a contact" |
| `/deal-strategy` | Considering working with us | Understand the method | "Start a review" |
| `/development` | Owner/partner on a build | See the build standard | "Explore Development" |
| `/strategy-lab` | DIY underwriter | Run the numbers | "Open Strategy Lab" → `/strategy-lab/classic` |
| `/marketflow` | Network participant | Request access by role | inline request-access form |
| `/work-with-apollo` | High-intent lead | Direct strategy with the founder | inline lead form / PeggyAI |
| `/peggy` | Anyone with a question | Guided intake with PeggyAI | PeggyAI (early access · in training) |
| `/projects/nelson-dr` | Proof-seeker | See real before/after + numbers | "Start a review" |

*Routing reality:* the column above is the CTA **label**, not always the destination. Destinations are a deliberate mix — the global header CTA "Submit a Property" → `/submit`, but many audience-page CTAs route to `/contact` or an embedded lead form (`LeadSection`/`forms.tsx`), and MarketFlow uses an inline request-access form. Verify the actual `route`/handler in `data.tsx`/the page before asserting where a CTA goes.

**2. CTAs are specific, never generic.** Use the verb + outcome the page earns ("Start a property review", "Run a preview", "Refer a contact"). Banned: "Learn more", "Click here", "Get started", "Submit". Global primary CTA is **Submit a Property → `/submit`**; secondary is **Talk to PeggyAI**. Every CTA must route to a real surface (`/submit`, `/contact`, an inline lead form, or a real page) — no dead ends.

**3. Voice: concrete and true.** Replace filler with specifics. Banned filler (audit list): "One standard, every time", "the same disciplined read", "under one roof", "Decades of combined experience", "Governed by virtue", "world-class", "seamless", "cutting-edge". Never invent numbers, timelines, or credentials. Compliance guards stay (see Voice/copy below): avoid "Invest Now", "Guaranteed Returns", "Passive Income", overclaiming product status. Peggy is an AI strategy assistant / concierge — never "chatbot".

**4. Imagery is owned, not stock-feeling.** The founder portrait (`founder/apollo-1200.jpg`) is rendered by `ApolloBlock` (its `portrait` prop) and currently appears on `/work-with-apollo` and `/about` only — keep it to surfaces where a human relationship is the point; do not spray it across category pages. (The `splits.founderPhoto` flag on `/sellers` and `/buyers` renders a short text disclosure about representation + DRE #, **not** the portrait.) Each page gets its own hero image; no building image on more than ~2 pages. Before/after sliders only with real, same-space photos (Nelson Dr is the bar).

**5. Kill the template feel.** The six "Who We Serve" pages must not read as one layout with swapped words — vary section order, emphasis, and visuals per audience via the `cat` config. Repeated blocks (ecosystem grid, FAQ) appear only where they earn their place, not as padding on every page.

**6. Accessibility floor (non-negotiable).** Full keyboard operability; visible bronze focus ring on every interactive element (inherit the global outline — never add `outline-none`/`focus-visible:outline-none` without a replacement ring); correct `aria-*` on menus/dropdowns; `inert` on hidden panels. The suite `client/src/__tests__/keyboard-a11y.test.tsx` must stay green.

**7. Launch checklist (run before calling a page done).**
- [ ] Page states its one audience + one action; primary CTA is specific and routes to a real surface.
- [ ] No banned filler phrases; no invented facts; compliance guards respected.
- [ ] Hero image is unique to the page; founder portrait only on `/work-with-apollo` and `/about`.
- [ ] Not a clone of a sibling page (section order/emphasis differs).
- [ ] `npx tsc --noEmit` clean; a11y suite passes; keyboard + focus-ring spot check.
- [ ] PeggyAI shown with honest status ("Early access · in training") wherever surfaced.

## Anti-drift lock

The three Empire-Doctrine tripwires (`doctrine-anti-drift.test.ts`, `public-voice.test.tsx`, `nav-parity.test.tsx`) have been **retired** along with the doctrine they enforced. The prototype under `client/src/pegasus/` is now the visual/voice source of truth; there is no automated *positive* brand lock against it (no required-wording check).

There **is** a single automated **negative** copy guard: `client/src/__tests__/public-copy-banned-phrases.test.ts` scans the Pegasus prototype copy sources (`client/src/pegasus/*.tsx`, `*.ts`, comments stripped) and fails if any banned filler / AI-tell / compliance-risk phrase appears, reporting the exact phrase + file:line. The banned-phrase list lives in one place — `client/src/__tests__/banned-phrases.ts` — and is meant to be extended whenever AI-sounding filler slips in (see the header in that file for how). This is NOT a return to the retired positive brand-lock; it only asserts certain phrases must NOT appear. Seed lists came from the "Forbidden filler phrases" + "Voice / copy" compliance sections below.

## Brand essentials

- **Casing**: Pegasus DreamScapes (capital P, capital D, capital S). Legal entity: Pegasus DreamScapes Corp.
- **Tagline**: Deal Strategy & Real Estate Execution.
- **Founder**: Paolo "Apollo" Duran. DRE #02333658. Keller Williams Realty East Bay (each office independently owned and operated). NAR NRDS #159537628. CAR via CCAR #36424.
- **Contact**: `apollo@pegasusdreamscapes.com` · 925-744-8525.
- **Voice/copy**: governed by the prototype's own copy in `client/src/pegasus/`. The legacy forbidden-credential-logo list (NAHB, BNI, BiggerPockets, ULI, NMHC, NAIOP, IRR, Inman) remains a sensible guard — do not display credentials not actually held.

## User preferences

- Preferred communication style: simple, everyday language.
- **Working Rule M.1**: every completion message must include two explicit lists — (1) what was done and how it improved the project, (2) what is unfinished, lazy, or stubbed.

## Public routes (locked v4)

**Nav (§6 — grouped dropdowns)** rendered by `nav.tsx` from `data.tsx`:
- **Who We Serve ▾**: Sellers & Owners (`/sellers`) · Investor & Operator Buyers (`/buyers`) · Deal Finders & Wholesalers (`/dealfinders`) · Capital Partners (`/capital`) · Vendors & Trades (`/operators`) · Referral Partners (`/referral`).
- **What We Do ▾**: Deal Strategy (`/deal-strategy`) · Investments (`/investments`) · Development (`/development`) · Strategy Lab (`/strategy-lab`) · MarketFlow (`/marketflow`).
- **About** (`/about`) + primary CTA **Submit a Property → `/submit`**. Floating **Talk to Peggy** concierge (`peggy-fab`) on prototype pages.

**Live public routes** (un-redirected in the v4 re-skin — reverses the #250 "Lean Launch Cut"): `/` · `/sellers` · `/buyers` · `/dealfinders` · `/capital` · `/operators` · `/referral` · `/deal-strategy` · `/investments` · `/development` · `/strategy-lab` · `/marketflow` · `/work-with-apollo` · `/ecosystem` · `/about` · `/contact` · `/peggy` · `/submit` · `/connect`. Functional public routes: `/projects`, `/projects/nelson-dr`, `/library/:slug`, `/deal-blueprint`, `/vendor-network`, `/marketflow/access`, `/marketflow/<role>`, `/marketflow/buyboxes`, `/privacy`, `/terms`. Calculator suite at `/strategy-lab/classic`.

**Legacy redirects** (`App.tsx#legacyRedirects`): `/deal-architecture` → `/deal-strategy`; `/calculators` → `/strategy-lab/classic`; `/sell`,`/submit-property`,`/submit-deal`,`/wholesale` → `/submit?intent=…`; `/buy`,`/portal`,`/dealflow`,`/marketplace` → `/marketflow` (or a sub-role); `/resources`,`/education`,`/strategy-library` → `/library`. Verify the live map in `App.tsx` + `shared/seo-routes.ts` before asserting.

**Submit intake** `/submit`: `?intent=` prefill; honeypot `hp_company` + 3s anti-spam; `leadType: "submit"`. `/terms` + `/privacy` are plain-language legal pages (interim "Draft · Pending Legal Review" banner removed for launch, Task #230).

## Voice / copy

Public copy is now governed by the prototype's own text in `client/src/pegasus/` — there are no externally-locked required phrases anymore.

**Still-prudent compliance guards** (real-estate/securities exposure — keep avoiding even though no test enforces them): "Invest Now," "Invest With Us," "Investor Returns," "Passive Income," "Guaranteed Returns," "Principal Protected," "we buy houses fast," and generic guru language. Peggy is an AI strategy assistant / concierge / intake analyst (avoid "chatbot"). Negative-disclosure use of these phrases stays acceptable on `/capital` and `/terms`.

## Funnel & footer disclosure (v4 locked)

**Funnel**: Submit a property → free **Property Read** (a short, candid written read by Acquisitions, **within 48 hours**) → the submitter picks a lane (Sell to Pegasus · Build with Pegasus · the **Deal Blueprint**, *by request — not sold yet*). The product **ladder is three rungs**: Strategy Lab (free, self-serve, strategy-tier ranges) → Property Read (free, written) → Deal Blueprint (by request). Read timing is always **"within 48 hours"** — never "2-day" / "1–2 business days". Sources: `data.tsx` PRODUCTS, `forms.tsx` (StrategyTierStrip / STRATEGYLAB_FORM), `pages.tsx` (LAB_STEPS), plus the standalone post-submit surfaces (`success-view.tsx`, `snapshot-status.tsx`, `strategy-lab-submitted.tsx`, `contact.tsx`).

- *Naming nuance*: the user-facing human read is **"Property Read"**. The Strategy Lab's auto-generated export PDF keeps its own distinct name **"Strategy Snapshot PDF"** (server route `/api/pdf/strategy-snapshot/by-id/:id`, locked by `peggy-tool-surface.test.ts`) — it is a different artifact and is intentionally NOT renamed. The lead form's internal `intent: 'strategy-snapshot'` payload key is also kept (HQ / analytics continuity).

**Verbatim footer disclosure (every public page)** — rendered by the Pegasus Footer (`client/src/pegasus/pages.tsx`):
> Paolo "Apollo" Duran · California DRE #02333658. Pegasus DreamScapes Corp. is a real estate investment company, not a real estate brokerage. Licensed real estate services are provided separately by Apollo Duran through Keller Williams Realty East Bay — each office independently owned and operated. Nothing on this site is an offer of securities or a solicitation to invest, nor a valuation, appraisal, CMA, or BPO of any specific property.

The functional-surfaces footer (`client/src/components/footer.tsx`) keeps its own longer, legally-worded disclosure (it refers to the Lab "Strategy Snapshots" as preliminary/informational) for admin / functional / standalone pages.

**Voice**: company / department voice on public copy — the founder's name + DRE# appear only in the footer disclosure. Banned in body copy (enforced by `banned-phrases.ts` over the pegasus prototype; the standalone funnel pages were scrubbed by hand): "a real person" / "real person", "Apollo personally", "talk to Apollo", "off-market", "below comparable value", "architect" / "architecture", "$180m" / "180m+", "2-day".

## Status badges (retired guidance)

The old Amendment 2 §G status-badge requirement (Live · Private beta · In private training · etc. on every ecosystem-product mention) is **no longer a hard rule** — the prototype governs how products are presented. Keep the underlying discipline in mind (don't overclaim status of products that aren't live), but follow the prototype's presentation.

## Operational pointers

- **Lead capture (Wave 3 / Task #134)**: unified success surface `client/src/components/success-view.tsx`; first-party CTA attribution via `cta_events` + `trackCtaClick(source, label, href)` in `client/src/lib/analytics.ts`. Admin: `/admin/cta-events`.
- **Phase 2 copy** (`.local/phase-2-copy-proposal.md`, Apollo-approved): Development `RoutingFilterSection`; Strategy Lab `ribbon-how-it-works`; Deal Blueprint at `/deal-blueprint` (intake `/submit?intent=blueprint`, `leadType: "blueprint_request"`); FAQ Quick Read / Full Path / Blueprint Q&As.
- **Pegasus Buyboxes** (Amendment 1 §C.8 — config in `client/src/config/buyboxes.ts`): four IDs (`value-add-sfr`, `adu-east-bay`, `estates-probate`, `small-multifamily` with `publicReady: false`); CTA "Request Notification" posts `leadType: "buybox_interest"`, `source: "buybox:<id>"`. C.8.7 disclosure via `BUYBOX_DISCLOSURE`. Per v1 FINAL §7, Buyboxes live at `/marketflow/buyboxes` (`client/src/pages/marketflow-buyboxes.tsx`); the `/marketflow` landing surfaces a single teaser to that page.
- **HQ integration (Task #153)**: HQ public intake at `https://pegasus-hq-operating-system.vercel.app/api/public/intake`. Env: `PEGASUS_HQ_PUBLIC_INTAKE_URL`. Outbox/no-op fallback; site never blocks on HQ availability. leadType → outreachReason: `submit` → `property_review`, `vendor` → `vendor_application`, `buybox_interest` → `buybox_interest`, `blueprint_request` → `paid_blueprint_request`, `peggy_note` → `peggy_inbound`, `peggy_notify` → `peggy_inbound` (public Peggy widget while Peggy is in private training).
- **Peggy phone (Task #152)**: launching on 925-744-8525. Four non-negotiable launch gates (Amendment 2 §D.4): CA two-party recording consent (Penal §632), Fair Housing refusals, DRE licensing exposure, Civil Code §1695 disclosure for owner-occupant foreclosure/default.

## External dependencies

- **UI**: Radix · Tailwind · CVA · Lucide · Google Fonts (Fraunces · Hanken Grotesk · JetBrains Mono for the public prototype; the functional shadcn surfaces still use their existing font stack).
- **Data/Forms**: React Hook Form · Zod · TanStack Query · drizzle-zod.
- **DB**: Supabase · Drizzle · Neon serverless PostgreSQL.
- **Auth**: passport · express-session · connect-pg-simple · Supabase Auth.
- **Dev**: TypeScript · Vite · Vitest (`npm test` / `npm run test:watch`).
- **Comms**: SendGrid · OpenAI (Peggy).

## Authoritative blueprints

- `client/src/pegasus/` — **controlling** design prototype for the public website (layout, typography, palette, copy, motion).
- `docs/architecture/Pegasus_Website_Structure_v1_FINAL.md` — retired structural reference (superseded by the prototype).
- Empire Doctrine v1.0.2 + Amendment 1 + Amendment 2 (attached_assets) — retired brand reference (superseded by the prototype).
- `docs/architecture/website-experience-blueprint-v1.md` / `website-marketflow-blueprint-v1.3.1.md` — legacy references.

## Website Director Standard

The permanent quality bar for the public website. The prototype (`client/src/pegasus/`) is the source of truth for *look*; this standard is the source of truth for *whether a page is doing its job*. This `replit.md` section is authoritative — there is no separate loadable skill file.

### Per-page intent map

Every public page has ONE primary job. If a page does not move the visitor toward its job, it is drifting.

| Surface | Primary job | Visitor leaves knowing / doing |
| --- | --- | --- |
| Home (`/`) | Orient + route | What Pegasus is (a deal strategy + real estate execution firm) and which lane fits them |
| Deal Strategy (`/deal-strategy`) | Prove the method | How a deal gets read/underwritten → **Submit a Deal** |
| Development (`/development`) | Prove the build arm | That Pegasus executes scope → start a build conversation |
| Strategy Lab (`/strategy-lab`) | Demonstrate a real tool | They can model a deal themselves → **Open Strategy Lab** |
| Work with Apollo (`/work-with-apollo`) | Representation lanes | Sell/buy/complex-situation/deal → pick a lane |
| MarketFlow (`/marketflow`) | Gate the platform | What it is → **Request MarketFlow Access** |
| Capital (`/capital`) | Frame partnership (compliance-careful) | How capital partners engage → start a conversation |
| Peggy (`/peggy`) | The front door / intake | They can describe a deal now → **Open PeggyAI** (honest early-access) |
| About (`/about`) | Trust + standard | Who Apollo is and the firm's discipline |
| Nelson Dr (`/projects/nelson-dr`) | Proof of work | Real before→after, numbers up front, process arc |
| Submit (`/submit`) | Canonical intake | Convert — keep it frictionless |

### Mobile-first rule

Design and verify the **375px** view first, then scale up. On mobile: the primary CTA and the phone number (925-744-8525) must be reachable without hunting; the menu must open and close cleanly with an obvious affordance; nothing high-intent buried two taps deep. Tap targets ≥ 44px.

### Hero contrast rule

Hero text (eyebrow + headline + lead) must stay legible over the **brightest** region of its background image — not just the average. Required: a bottom-anchored scrim (`.hero-scrim-bottom`) deep enough to cover where the headline actually sits, plus `.text-on-photo` shadow. Eyebrow opacity over photos ≥ 85%. If a headline rides high over bright sky, raise scrim coverage rather than trusting text-shadow alone.

### CTA routing table

Interior-page CTAs are **context-specific**, never a blanket "Submit a Property" on every surface. The global nav button stays "Submit a Property" (broad, correct there); page bodies speak to their own job.

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

### Imagery rule

Real photography only for proof surfaces (case studies, Apollo, Nelson Dr) — **never** AI-generated or stand-in property images where a real outcome is implied. Each section earns a distinct image; do not reuse the same hero across multiple sections. Decorative/atmospheric prototype imagery is fine for marketing heroes, but anything presented as a *result* must be real and disclosed.

### SEO + page metadata rule

Every public route must ship a unique, crawler-visible `<title>`, `<meta name="description">`, and Open Graph tags — never a blank SPA shell. The single source of truth is `shared/seo-routes.ts` (`SEO_ROUTES` + `seoFor()`), consumed by **both** the server-side injector (`server/seo-html.ts`, render-time so crawlers see correct tags without running JS) and the Pegasus prototype client shell (`client/src/pegasus/Landing.tsx` via the shared `useSEO` hook + `seoNameFor()`). Standalone functional pages keep their own `useSEO({...})` call.

- **Title format**: `Page Name · Pegasus DreamScapes` (built by `tag()`; home is the bare brand). Keep page names short so the full title stays under ~60 chars.
- **Description**: concrete and grounded in the page's real one-job from the intent map — **≤155 chars**, no invented numbers/claims, no banned filler or compliance-risk phrases.
- **OG minimum**: `og:title`, `og:description`, `og:type`, `og:url`, plus `og:image` (route-specific where one exists in `/og/`, else `/og/default.png`). Twitter card + canonical are also emitted by both layers.
- When you add a new public route, add its entry to `shared/seo-routes.ts` — do not hardcode metadata in two places.

### Forbidden filler phrases

Cut empty connective tissue that says nothing: "In today's market," "We pride ourselves on," "second to none," "world-class," "one-stop shop," "take it to the next level," "unlock your potential," "seamless solutions," "trusted partner" (as a self-claim), "we're not just a … we're a …", and stacked double-qualifiers ("we may potentially be able to possibly"). Also keep clear of the standing compliance-risk list (see "Voice / copy"): "Invest Now," "Guaranteed Returns," "Passive Income," guru language, etc.

### Launch QA checklist

Before declaring any public-site change done:
1. `npx tsc --noEmit` clean.
2. a11y suite green: `timeout 110 npx vitest run client/src/__tests__/keyboard-a11y.test.tsx --reporter=basic` (73/73).
3. Screenshot **desktop + 375px** of every changed surface; confirm hero text legible over the brightest part of the image.
4. Mobile menu opens/closes; primary CTA + phone reachable.
5. Every interior CTA matches the routing table (no stray generic "Submit a Property" in page bodies).
6. No forbidden filler or compliance-risk phrases introduced.
7. Proof imagery is real and disclosed; no section reuses another's hero.
8. SEO: new/changed public route has a unique entry in `shared/seo-routes.ts`; `curl` the route and confirm a unique `<title>`, `<meta name="description">` (≤155 chars), and `og:*` tags are injected (not the home fallback).
