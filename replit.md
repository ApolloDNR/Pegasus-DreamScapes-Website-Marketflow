# Pegasus DreamScapes Corp — Operational README

## Controlling doctrine

The **controlling design doctrine** for the public website is the saved React design prototype:

- `client/src/pegasus/` — the self-contained prototype (Landing.tsx, nav.tsx, peggy.tsx, forms.tsx, Saved.tsx, pages.tsx, data.tsx, theme.ts, routes.ts) plus its scoped design system `client/src/pegasus/_group.css` (loaded in `main.tsx`). This prototype **replaces the retired Empire Doctrine** as the source of truth for layout, typography, palette, copy, and motion.

The **visual baseline** comes from `_group.css`:

- **Palette (light)**: Warm Sand bg `#f6f2ec` · Ink text `#1b1712` · Terracotta accent `#b16631` (bright `#d4925b`) · Navy `#1f3757` · Cream `#efe7da`. Dark mode overrides defined in the same file under `.pg-root.dark`.
- **Typography**: Cormorant Garamond (display/serif) · Space Grotesk (sans/body). Loaded via `client/index.html` Google Fonts.
- The design system is scoped under `.pg-root` so it coexists with the existing shadcn token layer used by the functional surfaces.

The Empire Doctrine `.md` files in `attached_assets/` and the old `docs/architecture/*` blueprints are **retired historical reference only** — they no longer govern. If anything below diverges from the prototype, the prototype wins. This file is operational README only.

## Website Director Standard

The bar for every public page: it should read like a senior studio built it for Pegasus specifically — not like a template with the words swapped. Before shipping any change to a public surface, run it against this standard. A loadable copy lives at `.local/skills/website-director/SKILL.md`; this section is the source of truth.

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
| `/deal-architecture` | Considering working with us | Understand the method | "Start a review" |
| `/development` | Owner/partner on a build | See the build standard | "Explore Development" |
| `/strategy-lab` | DIY underwriter | Run the numbers | "Open the Lab" → `/strategy-lab/classic` |
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

The three Empire-Doctrine tripwires (`doctrine-anti-drift.test.ts`, `public-voice.test.tsx`, `nav-parity.test.tsx`) have been **retired** along with the doctrine they enforced. The prototype under `client/src/pegasus/` is now the visual/voice source of truth; there is no automated brand lock against it.

## Brand essentials

- **Casing**: Pegasus DreamScapes (capital P, capital D, capital S). Legal entity: Pegasus DreamScapes Corp.
- **Tagline**: The Deal Architect.
- **Founder**: Paolo "Apollo" Duran. DRE #02333658. Keller Williams Realty East Bay (each office independently owned and operated). NAR NRDS #159537628. CAR via CCAR #36424.
- **Contact**: `apollo@pegasusdreamscapes.com` · 925-744-8525.
- **Voice/copy**: governed by the prototype's own copy in `client/src/pegasus/`. The legacy forbidden-credential-logo list (NAHB, BNI, BiggerPockets, ULI, NMHC, NAIOP, IRR, Inman) remains a sensible guard — do not display credentials not actually held.

## User preferences

- Preferred communication style: simple, everyday language.
- **Working Rule M.1**: every completion message must include two explicit lists — (1) what was done and how it improved the project, (2) what is unfinished, lazy, or stubbed.

## Public routes (locked v1 FINAL)

**Primary nav** (5 + More): `/deal-architecture` · `/development` · `/strategy-lab` · `/work-with-apollo` · `/marketflow`. CTA: **Submit a Property** → `/submit`.

**More dropdown** (NAV_MORE, grouped): Learn (`/library`, `/faq`) · Network (`/vendor-network`, `/capital`) · Company (`/about`, `/projects`, `/connect`, `/contact`, `/peggy`) · Ecosystem (`/ecosystem`, footer-only) · Legal (`/disclosures`).

**Other public surfaces**: `/submit` (canonical lead intake; `?intent=` prefill; honeypot `hp_company` + 3s anti-spam; `leadType: "submit"`) · `/projects/nelson-dr` (gated on real photos + founder-confirmed numbers) · `/marketflow/access` (request-access form) · `/marketflow/<role>` (role dashboards) · `/privacy` · `/terms` (both with "Draft · Pending Legal Review" banner).

**Retired routes** (`App.tsx#legacyRedirects`): `/sell`, `/submit-deal`, `/submit-property`, `/wholesale`, `/services`, `/resources`, `/buyers`, `/buy`, `/dreamspace`, `/partner`, `/capital-raising`, `/invest`, `/calculators`, `/education` — all redirect to the canonical surfaces. Calculator suite remains at `/strategy-lab/classic`.

## Voice / copy

Public copy is now governed by the prototype's own text in `client/src/pegasus/` — there are no externally-locked required phrases anymore.

**Still-prudent compliance guards** (real-estate/securities exposure — keep avoiding even though no test enforces them): "Invest Now," "Invest With Us," "Investor Returns," "Passive Income," "Guaranteed Returns," "Principal Protected," "we buy houses fast," and generic guru language. Peggy is an AI strategy assistant / concierge / intake analyst (avoid "chatbot"). Negative-disclosure use of these phrases stays acceptable on `/capital` and `/terms`.

## Status badges (retired guidance)

The old Amendment 2 §G status-badge requirement (Live · Private beta · In private training · etc. on every ecosystem-product mention) is **no longer a hard rule** — the prototype governs how products are presented. Keep the underlying discipline in mind (don't overclaim status of products that aren't live), but follow the prototype's presentation.

## Operational pointers

- **Lead capture (Wave 3 / Task #134)**: unified success surface `client/src/components/success-view.tsx`; first-party CTA attribution via `cta_events` + `trackCtaClick(source, label, href)` in `client/src/lib/analytics.ts`. Admin: `/admin/cta-events`.
- **Phase 2 copy** (`.local/phase-2-copy-proposal.md`, Apollo-approved): Development `RoutingFilterSection`; Strategy Lab `ribbon-how-it-works`; Deal Blueprint at `/deal-blueprint` (intake `/submit?intent=blueprint`, `leadType: "blueprint_request"`); FAQ Quick Read / Full Path / Blueprint Q&As.
- **Pegasus Buyboxes** (Amendment 1 §C.8 — config in `client/src/config/buyboxes.ts`): four IDs (`value-add-sfr`, `adu-east-bay`, `estates-probate`, `small-multifamily` with `publicReady: false`); CTA "Request Notification" posts `leadType: "buybox_interest"`, `source: "buybox:<id>"`. C.8.7 disclosure via `BUYBOX_DISCLOSURE`. Per v1 FINAL §7, Buyboxes live at `/marketflow/buyboxes` (`client/src/pages/marketflow-buyboxes.tsx`); the `/marketflow` landing surfaces a single teaser to that page.
- **HQ integration (Task #153)**: HQ public intake at `https://pegasus-hq-operating-system.vercel.app/api/public/intake`. Env: `PEGASUS_HQ_PUBLIC_INTAKE_URL`. Outbox/no-op fallback; site never blocks on HQ availability. leadType → outreachReason: `submit` → `property_review`, `vendor` → `vendor_application`, `buybox_interest` → `buybox_interest`, `blueprint_request` → `paid_blueprint_request`, `peggy_note` → `peggy_inbound`, `peggy_notify` → `peggy_inbound` (public Peggy widget while Peggy is in private training).
- **Peggy phone (Task #152)**: launching on 925-744-8525. Four non-negotiable launch gates (Amendment 2 §D.4): CA two-party recording consent (Penal §632), Fair Housing refusals, DRE licensing exposure, Civil Code §1695 disclosure for owner-occupant foreclosure/default.

## External dependencies

- **UI**: Radix · Tailwind · CVA · Lucide · Google Fonts (Cormorant Garamond · Space Grotesk for the public prototype; the functional shadcn surfaces still use their existing font stack).
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
