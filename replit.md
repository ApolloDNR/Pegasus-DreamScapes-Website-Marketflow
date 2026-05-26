# Pegasus DreamScapes Corp — Operational README

## Controlling doctrine

The **controlling structural doctrine** for the public website is:

- `docs/architecture/Pegasus_Website_Structure_v1_FINAL.md` — **Website Structure v1 FINAL** (Task #154). Locks the 6-item primary nav (Deal Architecture · Development · Strategy Lab · Work With Apollo · MarketFlow · More), the 9-section homepage, the four named products (Strategy Lab · Strategy Review · Strategy Snapshot · Deal Blueprint), the four Work-With-Apollo lanes, the locked DRE/KW disclosure, the renamed "Dreamscaper Standard", and the four-column footer (Company · Tools · Network · Legal) with the locked legal disclosure block.

The **visual baseline** is unchanged from:

- `attached_assets/Pasted--PEGASUS-DREAMSCAPES-EMPIRE-DOCTRINE-v1-0-2-Status-Lock_1779604340328.txt` — Empire Doctrine v1.0.2 Parts A–G (canonical brand tokens: Deep Navy `#0D1B2D` · Rich Copper `#C77A3A` · Warm Cream `#F6EFE4` · Charcoal `#1E2328`; Cinzel · Cormorant · Montserrat · Inter).
- `attached_assets/Pasted--EMPIRE-DOCTRINE-v1-0-2-AMENDMENT-1-Status-Locked-Scope_1779634104279.txt` — Amendment 1 (Pegasus Buyboxes).
- `attached_assets/Empire-Doctrine-v1.0.2-Amendment-2_1779817906000.md` — Amendment 2 (Peggy positioning · §D.4 phone gates · /ecosystem · status badges · "what we are not" · credentials policy).

If anything below diverges from those files, the doctrine wins. This file is operational README only.

## Anti-drift lock

Three automated tripwires defend the lock:

- `client/src/__tests__/doctrine-anti-drift.test.ts` — fails the build if `--copper`, `--font-display`, `--font-serif`, `--font-supporting`, `--font-sans`, or `<meta name="theme-color">` diverge from v1.0.2 Part A.
- `client/src/__tests__/public-voice.test.tsx` — asserts the locked phrases (hero doctrine lines · footer motto · "Dreamscaper Standard" · "Bring us the property. We'll help find the path." · Work-With-Apollo DRE/KW disclosure · footer legal disclosure block · "What we are not" on /about · Peggy positioning on /peggy). Forbids spaced em-dashes + forbidden marketing phrases (incl. "chatbot"; "20+ years" attributed to Pegasus-the-company).
- `client/src/__tests__/nav-parity.test.tsx` — asserts `NAV_PRIMARY` lineup (Deal Architecture · Development · Strategy Lab · Work With Apollo · MarketFlow) + `/projects` not in primary + footer surfaces every primary + More.

## Brand essentials

- **Casing**: Pegasus DreamScapes (capital P, capital D, capital S). Legal entity: Pegasus DreamScapes Corp.
- **Tagline**: The Deal Architect.
- **Motto**: "Dream it. Build it. Live it." (footer, locked)
- **Belief line**: "Built on strategy. Governed by virtue. Executed with discipline." (about, locked)
- **Founder**: Paolo "Apollo" Duran. DRE #02333658. Keller Williams Realty East Bay (each office independently owned and operated). NAR NRDS #159537628. CAR via CCAR #36424.
- **Contact**: `apollo@pegasusdreamscapes.com` · 925-744-8525.
- **Forbidden credential logos** (Amendment 2 §I): NAHB, BNI, BiggerPockets, ULI, NMHC, NAIOP, IRR, Inman, or any other not actually held.

## User preferences

- Preferred communication style: simple, everyday language.
- **Working Rule M.1**: every completion message must include two explicit lists — (1) what was done and how it improved the project, (2) what is unfinished, lazy, or stubbed.

## Public routes (locked v1 FINAL)

**Primary nav** (5 + More): `/deal-architecture` · `/development` · `/strategy-lab` · `/work-with-apollo` · `/marketflow`. CTA: **Submit a Property** → `/submit`.

**More dropdown** (NAV_MORE, grouped): Learn (`/library`, `/faq`) · Network (`/vendor-network`, `/capital`) · Company (`/about`, `/projects`, `/connect`, `/contact`, `/peggy`) · Ecosystem (`/ecosystem`, footer-only) · Legal (`/disclosures`).

**Other public surfaces**: `/submit` (canonical lead intake; `?intent=` prefill; honeypot `hp_company` + 3s anti-spam; `leadType: "submit"`) · `/projects/nelson-dr` (gated on real photos + founder-confirmed numbers) · `/marketflow/access` (request-access form) · `/marketflow/<role>` (role dashboards) · `/privacy` · `/terms` (both with "Draft · Pending Legal Review" banner).

**Retired routes** (`App.tsx#legacyRedirects`): `/sell`, `/submit-deal`, `/submit-property`, `/wholesale`, `/services`, `/resources`, `/buyers`, `/buy`, `/dreamspace`, `/partner`, `/capital-raising`, `/invest`, `/calculators`, `/education` — all redirect to the canonical surfaces. Calculator suite remains at `/strategy-lab/classic`.

## Locked voice rules

**Required visible homepage phrases**: "Complex property. Structured opportunity." · "Every property gets a path. Not every property gets an offer." · "Built on strategy. Governed by virtue. Executed with discipline." · "Dream it. Build it. Live it." · "Bring us the property. We'll show you the path." · "Bring us the property. We'll help find the path." · "The Dreamscaper Standard." · "Most Strategy Snapshots are reviewed within 5 business days."

**Balanced Outcome Standard** (v1.0.2 Part B, used sparingly on /about): "A good deal makes sense for every serious party involved."

**Forbidden public phrases**: "Invest Now," "Invest With Us," "Investor Returns," "Passive Income," "Guaranteed Returns," "Principal Protected," "we buy houses fast," generic luxury/guru language, **"chatbot"** (Peggy is an AI strategy assistant / concierge / intake analyst), **"20+ years" attributed to Pegasus-the-company** (construction experience belongs to the team — Moises Duran).

**Other rules**: No spaced em-dashes in public copy (preserved exclusions per `public-voice.test.tsx`: `return "—"` formatters, en-dash ranges like `90–100K`, page-title attributions, calculator validator messages). Negative-disclosure use of forbidden phrases is preserved on `/capital` and `/terms`.

## Status badges (Amendment 2 §G)

Every public mention of an ecosystem product (HQ, BuildForge, CapStack, MarketFlow, Peggy, Buyboxes) carries a status badge: **Live** (copper) · **Private beta — invite only** (navy) · **In private training** (warm cream) · **Internal, not a public surface yet** (charcoal) · **In development** (outline). Single highest-leverage anti-overclaim discipline in the doctrine.

## Operational pointers

- **Lead capture (Wave 3 / Task #134)**: unified success surface `client/src/components/success-view.tsx`; first-party CTA attribution via `cta_events` + `trackCtaClick(source, label, href)` in `client/src/lib/analytics.ts`. Admin: `/admin/cta-events`.
- **Phase 2 copy** (`.local/phase-2-copy-proposal.md`, Apollo-approved): Development `RoutingFilterSection`; Strategy Lab `ribbon-how-it-works`; Deal Blueprint at `/deal-blueprint` (intake `/submit?intent=blueprint`, `leadType: "blueprint_request"`); FAQ Quick Read / Full Path / Blueprint Q&As.
- **Pegasus Buyboxes** (Amendment 1 §C.8 — config in `client/src/config/buyboxes.ts`): four IDs (`value-add-sfr`, `adu-east-bay`, `estates-probate`, `small-multifamily` with `publicReady: false`); CTA "Request Notification" posts `leadType: "buybox_interest"`, `source: "buybox:<id>"`. C.8.7 disclosure via `BUYBOX_DISCLOSURE`. Per v1 FINAL §7, Buyboxes live at `/marketflow/buyboxes` (`client/src/pages/marketflow-buyboxes.tsx`); the `/marketflow` landing surfaces a single teaser to that page.
- **HQ integration (Task #153)**: HQ public intake at `https://pegasus-hq-operating-system.vercel.app/api/public/intake`. Env: `PEGASUS_HQ_PUBLIC_INTAKE_URL`. Outbox/no-op fallback; site never blocks on HQ availability. leadType → outreachReason: `submit` → `property_review`, `vendor` → `vendor_application`, `buybox_interest` → `buybox_interest`, `blueprint_request` → `paid_blueprint_request`, `peggy_note` → `peggy_inbound`, `peggy_notify` → `peggy_inbound` (public Peggy widget while Peggy is in private training).
- **Peggy phone (Task #152)**: launching on 925-744-8525. Four non-negotiable launch gates (Amendment 2 §D.4): CA two-party recording consent (Penal §632), Fair Housing refusals, DRE licensing exposure, Civil Code §1695 disclosure for owner-occupant foreclosure/default.

## External dependencies

- **UI**: Radix · Tailwind · CVA · Lucide · Google Fonts (Cinzel · Cormorant · Montserrat · Inter).
- **Data/Forms**: React Hook Form · Zod · TanStack Query · drizzle-zod.
- **DB**: Supabase · Drizzle · Neon serverless PostgreSQL.
- **Auth**: passport · express-session · connect-pg-simple · Supabase Auth.
- **Dev**: TypeScript · Vite · Vitest (`npm test` / `npm run test:watch`).
- **Comms**: SendGrid · OpenAI (Peggy).

## Authoritative blueprints

- `docs/architecture/Pegasus_Website_Structure_v1_FINAL.md` — **controlling** for public website structure (Task #154).
- Empire Doctrine v1.0.2 + Amendment 1 + Amendment 2 (attached_assets) — controlling for brand tokens, voice, status badges, /about, /peggy, Peggy phone gates.
- `docs/architecture/website-experience-blueprint-v1.md` — v1.0 (legacy reference).
- `docs/architecture/website-marketflow-blueprint-v1.3.1.md` — v1.3.1 (legacy, superseded).
