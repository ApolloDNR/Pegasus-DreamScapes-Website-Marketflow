# Pegasus DreamScapes Corp — Operational README

## Controlling doctrine

The **controlling design doctrine** for the public website is the saved React design prototype:

- `client/src/pegasus/` — the self-contained prototype (Landing.tsx, nav.tsx, peggy.tsx, forms.tsx, Saved.tsx, pages.tsx, data.tsx, theme.ts, routes.ts) plus its scoped design system `client/src/pegasus/_group.css` (loaded in `main.tsx`). This prototype **replaces the retired Empire Doctrine** as the source of truth for layout, typography, palette, copy, and motion.

The **visual baseline** comes from `_group.css`:

- **Palette (light)**: Warm Sand bg `#f6f2ec` · Ink text `#1b1712` · Terracotta accent `#b16631` (bright `#d4925b`) · Navy `#1f3757` · Cream `#efe7da`. Dark mode overrides defined in the same file under `.pg-root.dark`.
- **Typography**: Cormorant Garamond (display/serif) · Space Grotesk (sans/body). Loaded via `client/index.html` Google Fonts.
- The design system is scoped under `.pg-root` so it coexists with the existing shadcn token layer used by the functional surfaces.

The Empire Doctrine `.md` files in `attached_assets/` and the old `docs/architecture/*` blueprints are **retired historical reference only** — they no longer govern. If anything below diverges from the prototype, the prototype wins. This file is operational README only.

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
