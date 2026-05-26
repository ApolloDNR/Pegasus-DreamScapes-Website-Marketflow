# Pegasus DreamScapes Corp — Empire Doctrine v1.0.2 + Amendment 1 + Amendment 2

## Doctrine version

**Controlling doctrine: Empire Doctrine v1.0.2 + Amendment 1 + Amendment 2.** Canonical source files in project knowledge:

- `attached_assets/Pasted--PEGASUS-DREAMSCAPES-EMPIRE-DOCTRINE-v1-0-2-Status-Lock_1779604340328.txt` — v1.0.2 (Parts A through G)
- `attached_assets/Pasted--EMPIRE-DOCTRINE-v1-0-2-AMENDMENT-1-Status-Locked-Scope_1779634104279.txt` — Amendment 1 (Section C.8 — Pegasus Buyboxes)
- `attached_assets/Empire-Doctrine-v1.0.2-Amendment-2_1779817906000.md` — Amendment 2 (two-audience discipline, four doors, Peggy positioning, /ecosystem, status badges, "what we are not", credentials policy, Peggy phone §D.4 safety gates)

v1.0.2 **ratifies the live visual baseline** (Deep Navy `#0D1B2D` · Rich Copper `#C77A3A` · Warm Cream `#F6EFE4` · Charcoal `#1E2328`; Cinzel · Cormorant Garamond · Montserrat · Inter) as canonical. Amendment 1 adds the **Pegasus Buyboxes** free buyer interest list. **Amendment 2 (ratified by Task #149)** is additive — it does not change the visual baseline, palette, typography, or v1.0.2 voice rules. It adds: the two-audience discipline, the four-doors funnel (Peggy first), the eight-section homepage composition, the `/ecosystem` footer-only release valve, status badges as a required design element, the "what we are not" anti-claims block, the credentials policy (no fake badges), and the Peggy phone §D.4 launch gates. **Code execution of Amendment 2 ships in Task #150** — Amendment 2 itself is doctrine ratification only.

## Anti-Drift Lock (Empire Doctrine v1.0.2 Part F)

The doctrine `.md` / `.txt` files in project knowledge are the **only source of truth** for brand tokens, typography, product taxonomy, and strategic positioning. This `replit.md` is operational README only — it must point at the doctrine, not redefine it. If a value here ever diverges from the doctrine, the doctrine wins.

Two automated tripwires defend the lock today:

- **`client/src/__tests__/doctrine-anti-drift.test.ts`** — fails the build if the live `--copper`, `--font-display`, `--font-serif`, `--font-supporting`, `--font-sans`, or `<meta name="theme-color">` values diverge from v1.0.2 Part A.
- **`client/src/__tests__/public-voice.test.tsx`** — fails the build if locked voice phrases (incl. v1.0.2 Part B Balanced Outcome Standard line) disappear from the live source.

**Amendment 2 will extend the tripwires in Task #150**: `public-voice.test.tsx` gains assertions for the "What we are not" block (/about), the Peggy positioning line ("One intelligence, multiple surfaces") on /peggy, forbidden-phrase checks for "chatbot" and "20+ years" attributed to Pegasus-the-company; `nav-parity.test.tsx` gains `/ecosystem` under a footer-only `ecosystem` group in NAV_MORE. If a future change needs to touch any of these values, the change is a doctrine amendment first, code change second. Never the other way around.

## Overview
Strategy-first real estate operating company in the East Bay (Pleasant Hill, California). Positioning: **"The Deal Architect"**. Every property gets a path. Honest review, disciplined execution, no marketing-fluff. The public website is a small, locked, voice-disciplined v1 surface designed to hold the brand without overclaiming.

**Two audiences (Amendment 2 §B):** property holders (Audience A — want a path on a specific property) and ecosystem participants (Audience B — want to understand what Pegasus is building). Every public surface must serve **one** audience clearly. Audience A = home, /strategy-lab, /submit, /projects, /about, /development. Audience B = `/ecosystem` (footer-only). Mixed-but-Audience-B-leaning = /marketflow, /capital, /vendor-network.

**Visual identity is the Final Brand Asset System — preserved in full and ratified by v1.0.2 Part A** (Deep Navy / Rich Copper / Warm Cream / Charcoal, with Cinzel · Cormorant · Montserrat · Inter). Amendment 2 does **not** change the visual baseline.

## User Preferences

Preferred communication style: simple, everyday language.

**Working Rule M.1 (binding, Amendment 2):** every completion message must include two explicit lists — (1) what was done and how it improved the project, (2) what is unfinished, lazy, or stubbed. No silent gaps. No "shipped" without a corresponding "here's what I didn't do."

## Brand Identity (canonical)

- **Brand casing**: **Pegasus DreamScapes** (capital P, capital D, capital S — always). Legal entity: Pegasus DreamScapes Corp.
- **Tagline**: The Deal Architect.
- **Motto** (footer, locked): "Dream it. Build it. Live it."
- **Belief line** (about, locked): "Built on strategy. Governed by virtue. Executed with discipline."
- **Founder**: Paolo "Apollo" Duran — Founder & Principal.
- **Locked credentials (Amendment 2 §I — verified before any go-live):**
  - **DRE #02333658** (Apollo Duran)
  - **Keller Williams East Bay** — "Each office is independently owned and operated" disclosure required
  - **NAR** — National Association of Realtors, NRDS member **#159537628**
  - **CAR** — California Association of Realtors via **Contra Costa Association of Realtors (CCAR) #36424**
- **Forbidden credential logos** (Amendment 2 §I — no fake credentialing): NAHB, BNI, BiggerPockets, ULI, NMHC, NAIOP, IRR, Inman, or any certification/membership not actually held. Listing one of these is a **launch-blocking violation**.
- **Real founder headshot**: `attached_assets/image_1779813562612.png` — pending srcset transcode to `/images/founder/apollo-{w}.{avif|webp|jpg}` in Task #150.
- **Contact**: `apollo@pegasusdreamscapes.com` / `925-744-8525`. Replaces all legacy `hello@`/`info@`.
- **Palette & Typography (canonical):** See **Empire Doctrine v1.0.2 Part A**. Live HSL tokens in `client/src/index.css` and the four font families (Cinzel · Cormorant Garamond · Montserrat · Inter) are the canonical source; the anti-drift test fails the build if `--copper`, `--font-display`, `--font-serif`, `--font-supporting`, `--font-sans`, or `<meta name="theme-color">` diverges from Part A.
- **Logo**: SVG-first. `public/brand/pegasus-wordmark.svg`, `public/brand/pegasus-mark.svg`, `public/favicon.svg`. (Final illustrated mark TBD.)

## Locked voice rules (v1.0.1 + v1.0.2 Part B + Amendment 2)

### Required visible homepage phrases (hard-locked by `public-voice.test.tsx`)
"Complex property. Structured opportunity." / "Every property gets a path. Not every property gets an offer." / "Built on strategy. Governed by virtue. Executed with discipline." / "Dream it. Build it. Live it."

### Balanced Outcome Standard (v1.0.2 Part B)
Public phrasing — used sparingly: **"A good deal makes sense for every serious party involved."** Surfaced on `/about` inside the Doctrine section.

### Forbidden public phrases
"Invest Now," "Invest With Us," "Investor Returns," "Passive Income," "Guaranteed Returns," "Principal Protected," "we buy houses fast," generic luxury/guru language. **Added by Amendment 2:** "chatbot" (Peggy is an assistant/concierge/associate/intake analyst, never a chatbot); "20+ years" or any decade-claim **attributed to Pegasus the company** (the construction experience belongs to the team — Moises Duran — not to the corporation). Negative disclosure use ("not an offer of guaranteed returns or principal protected investment products") is preserved on `/capital` and `/terms`.

### Other rules
No spaced em-dashes in public copy (preserved exclusions: `return "—"` empty-cell formatters, code comments, en-dash number ranges like `90–100K`, editorial title attributions). No fake stats, no fake testimonials, no BBB claims, no implication of public investment access. Development Pathway language discipline: Phase 1 = today's actual scope (ADU / value-add / small-scale residential).

## "What we are not" (Amendment 2 §H — locked /about block)

Mandatory on /about, above the Doctrine block, verbatim:

> **What we are not.** We are not just a cash buyer. We are not a brokerage. We are not a construction company. We are not a proptech app. We are not a marketplace. Pegasus is a strategy-first real estate operating company. We review complex property situations and design the right path forward.

Asserted by `public-voice.test.tsx` after Task #150 ships the block.

## The Four Doors (Amendment 2 §C — friction ladder)

Replaces the prior three-door framing. Each door catches a different visitor mindset:

| Door | Friction | For | Surface |
|---|---|---|---|
| 1. Talk to Peggy | Lowest — just chat | "I'm not sure what I have yet" | Floating widget + `/peggy` |
| 2. Submit a Property | Medium — form | "I know what I have, review it" | `/submit` (primary CTA) |
| 3. Try Strategy Lab | Medium — tool | "I want to run the numbers myself" | `/strategy-lab` |
| 4. Join the Network | High — vetted | Operators · capital · vendors | `/marketflow` + `/capital` + `/vendor-network` |

**Locked**: door order on the homepage is **Peggy first, Submit second**. Submit remains the primary header + final CTA.

## Peggy — locked positioning (Amendment 2 §D)

Verbatim public positioning line (will be asserted on `/peggy` after #150):

> Peggy — Pegasus' AI strategy assistant. One intelligence, multiple surfaces. Plugs into website, phone, HQ, and the ecosystem apps.

**What Peggy does (public):** listens to a property situation, asks one qualifying question at a time, routes to the right path, captures structured intake, hands every conversation to Apollo as a daily inbound report.

**What Peggy does NOT do (publish on `/peggy`):** never quotes a price or makes an offer · never makes a binding commitment · never gives legal/tax/investment advice · never shares other clients' data · never claims outcomes · never bypasses human review for actual offers.

**Voice:** warm, calm, precise. Never bubbly. Never robotic. First turn always discloses she is an AI assistant.

### Peggy phone (§D.4) — four non-negotiable launch gates
Apollo has chosen to ship Peggy on the existing **925-744-8525** line ASAP. Doctrine ratifies the scope but **locks four hard launch gates** before voice cutover (Task #152):

1. **CA two-party recording consent (Penal Code §632)** — opening turn: "This call is recorded for quality and training. Please say 'stop recording' if you'd prefer I don't." If caller declines, recording stops and conversation continues unrecorded.
2. **Fair Housing refusals** — hard-refuse any conversation touching familial status, race, national origin, religion, disability, or protected-class steering. Refusal: "I can't help with that — Pegasus reviews every property on the property's merits, not the parties involved. Let me get you to Apollo directly."
3. **DRE licensing exposure** — Peggy never represents on price, terms, value, fitness, or investment quality. She qualifies and routes; she does not advise.
4. **Civil Code §1695 (home equity sales contract law)** — if a caller indicates the property is in foreclosure/default AND they are an owner-occupant, Peggy reads the §1695 disclosure and routes immediately to Apollo. No qualifying questions beyond identity + callback method.

Phil Deutscher review recommended but not hard-blocking per Apollo's ASAP override.

## Status badges (Amendment 2 §G — required design element)

Every public mention of an ecosystem product (HQ, BuildForge, CapStack, MarketFlow, Peggy, Buyboxes) must carry a status badge from the locked vocabulary:

- **Live** — copper pill — fully shipped, public, supported.
- **Private beta — invite only** — navy pill — exists, gated, request-access only.
- **In private training** — warm cream pill, navy text — being built, placeholder UI.
- **Internal, not a public surface yet** — charcoal pill, cream text — exists internally, no public destination.
- **In development** — outline pill — planned, not yet built.

No exceptions. This is the single highest-leverage anti-overclaim discipline in the doctrine.

## Public routes (locked v1.0.1 + Amendment 1 + Amendment 2)

Five-item primary nav plus footer-only secondary routes.

- **Primary nav (unchanged by Amendment 2)**: `/strategy-lab`, `/projects`, `/development`, `/marketflow`, `/about`.
- **Primary CTA**: "Submit a Property" → `/submit`.
- **Footer-only**: `/library`, `/capital`, `/vendor-network`, `/connect`, `/contact`, `/disclosures`, `/privacy`, `/terms`. **Amendment 2 adds:** `/ecosystem` (footer-only, Audience B release valve — single page with four product cards (Pegasus HQ · MarketFlow · BuildForge · CapStack) each carrying a status badge from §G; header: "The Pegasus Ecosystem — what we're building, honestly"; no CTA except "Request to learn more" → `/connect`).
- **Amendment 2 also adds:** `/peggy` — public Peggy surface (positioning line + "what she does / what she does not do" published as a premium signal).
- **Submission canonical**: `/submit` (Property / Situation / Contact; honeypot `hp_company` + 3s anti-spam; `leadType: "submit"` posting to `/api/leads`; `?intent=` prefill).
- **Project case studies**: `/projects` index, `/projects/nelson-dr` placeholder. Suppressed from homepage proof slot until ≥3 real photos + founder-confirmed economics ship (Amendment 2 §J gate).
- **MarketFlow**: `/marketflow` is a gated public landing; role dashboards live behind `/marketflow/<role>`. `/marketflow/access` = request-access form.
- **Connect**: `/connect` is Apollo's QR landing — six routing buttons.
- **Capital**: `/capital` informational only. Reg D 506(b)-safe language. "Conversations, not pitches." "Written agreement on every deal."
- **Library**: `/library` mounts the existing Strategy Library content (article shell at `/library/:slug`).
- **Privacy / Terms**: "Draft · Pending Legal Review" banner pending qualified counsel review.

### Retired routes (App.tsx `legacyRedirects`)
`/sell → /submit?intent=sell`, `/submit-deal → /submit?intent=deal-jv`, `/submit-property → /submit?intent=property`, `/wholesale → /submit?intent=deal-jv`, `/services → /development`, `/resources → /library`, `/buyers → /marketflow`, `/buy → /marketflow`, `/dreamspace → /capital`, `/partner → /capital`, `/capital-raising → /capital`, `/invest → /capital`, `/calculators → /strategy-lab/classic`, `/education → /library`. Calculator suite remains at `/strategy-lab/classic`.

## Navigation grouping (locked v1.0.1, OLD visual design)

- **Desktop header**: NAV_PRIMARY + **More** dropdown sourced from `NAV_MORE`. Brand wordmark left, copper "Submit a Property" CTA right.
- **NAV_MORE intent grouping**: every item carries a `group` field — `learn` / `network` / `company` / `legal`. `/ecosystem` joins under a new `ecosystem` group in Task #150 (footer-only assertion in `nav-parity.test.tsx`).
- **Mobile sheet**: NAV_PRIMARY at top, then a "More" accordion rendering `NAV_MORE` in grouped sections with kicker headings.
- **Footer**: Four-column IA grid — **Company** (About · Strategy Library · Connect · Contact) · **Services** (Strategy Lab · Submit a Property · Development · Projects) · **Network** (MarketFlow · Vendor Network · Capital) · **Legal** (Privacy · Terms · Disclosures). Brand block (logo + tagline + 48-hour response + contact strip) occupies leading 4-of-12. Bottom row: theme toggle, MarketFlow BETA pill, Sign In, DRE #02333658, KW East Bay disclosure, securities disclosure, © stamp.
- **Active-route highlighting**: copper underline + `font-semibold` + `aria-current="page"` desktop; left copper border mobile.

## Homepage section order (Amendment 2 §E — eight sections, ships in Task #150)

Replaces the v1.0.1 six-section composition. Locked order:

1. **Hero** — "Complex property. Structured opportunity." + one-sentence subhead. Primary CTA Submit a Property; secondary text link "or talk to Peggy." No four-stat bar.
2. **Trust strip** — single horizontal line: *"Decades of East Bay construction in the team · DRE #02333658 · KW East Bay · NAR · CAR · Pleasant Hill, CA"*. **Attribution lock**: "20+ years" is forbidden as a Pegasus-the-company stat — attribute construction experience to the team (Moises Duran).
3. **The Pegasus Question** — manifesto moment. "What should you do with this property?" + 3–4 editorial sentences. **No product-pill grid** (resolved in v1.0.1; do not re-introduce).
4. **The Four Doors** — Peggy · Submit · Strategy Lab · Join the Network. Peggy slightly more prominent (subtle copper border or "available now" dot).
5. **Nelson Dr — the proof** — image-first, full-width. Real photos (launch gate). Property line + paragraph + three data pills (Acquired ~$600K · Renovation ~$90–100K · Sold ~$840K) + CTA to full case study.
6. **The Operator** — single Apollo section (merge of prior "Operator Behind the Lens" + "Operator's Edge"). Real photo, two paragraphs, DRE/KW credentials, one pull quote.
7. **The Pegasus Standard** — six commitments verbatim. Visual upgrade: Cinzel numerals 01–06 large + copper.
8. **Final CTA** — "Bring us the property. We'll show you the path." Submit a Property + Talk to Peggy.

`<span class="sr-only">` doctrine anchors stay at the bottom of the page for the public-voice guardrail.

## Launch-readiness gates (Amendment 2 §J — additive to v1.0.2 Part G)

No public deploy until each is true:

1. No "in progress" / "coming soon" / "sample" copy on any public page.
2. `/projects/nelson-dr` has ≥3 real photos + founder-confirmed numbers (or the page is delisted from primary nav).
3. All nav links resolve to real pages. No orphan footer links.
4. Peggy floating widget either responds OR is hidden — no broken state.
5. All forms submit + trigger confirmation email in Pegasus voice.
6. DRE / KW / NAR / CAR disclosure block visible in footer.
7. Privacy, Terms, Disclosures have real content (even short).
8. Favicon, OG image, page titles, meta descriptions present on every page.
9. Mobile pass on hero, four doors, Nelson, Apollo, Standard, footer.
10. Hero loads < 1.5s on mobile.

## Explicit doctrine rejections (Amendment 2 §K — do NOT integrate)

- "Quick Read" as a fifth public product term (locked taxonomy: Strategy Lab, Strategy Review, Strategy Snapshot, Deal Blueprint).
- "20+ years construction" attributed to Pegasus-the-company.
- Cal.com / Savvycal / any scheduling embed (undoes Strategy-Review-as-friction-wall).
- Eight-product-pill grid mixing property strategies with Pegasus participation lanes.
- Fake credential logos (NAHB, BNI, BiggerPockets, ULI, NMHC, NAIOP, IRR, Inman unless real membership held).

## Pegasus Buyboxes (Amendment 1, Section C.8) — unchanged by Amendment 2

Free buyer-interest list, surfaced on `/marketflow` as `BuyboxesSection`. Phase 1 working names in `client/src/config/buyboxes.ts`: **The Foundation Value-Add** (`value-add-sfr`), **The Annex ADU Upside** (`adu-east-bay`), **The Signature Repositioning** (`estates-probate`), **The Structured Opportunity** (`small-multifamily`, `publicReady: false` until Phil Deutscher reviews disclosure language). CTA: **"Request Notification"**. Submission: `POST /api/leads` with `leadType: "buybox_interest"`, `source: "buybox:<id>"`. C.8.7 disclosure surfaced via `BUYBOX_DISCLOSURE`. MarketFlow Buyer Subscription (paid) remains a v2.5 deferral.

## Tests (locked)

- **`client/src/__tests__/public-voice.test.tsx`**: scans the v1 public page set for forbidden phrases + spaced em-dashes; asserts home doctrine lines + footer motto + about belief line + Path-First Review Standard. **Task #150 extends** with "What we are not" assertion on /about, Peggy positioning assertion on /peggy, "chatbot" + "20+ years (Pegasus-attributed)" forbidden checks.
- **`client/src/__tests__/nav-parity.test.tsx`**: NAV_PRIMARY = exactly five entries; desktop header surfaces them + has a More dropdown; mobile sheet surfaces NAV_PRIMARY + NAV_MORE; footer surfaces both. **Task #150 extends** with `/ecosystem` as a footer-only route under a new `ecosystem` group in NAV_MORE.
- **`client/src/__tests__/doctrine-anti-drift.test.ts`**: visual-token tripwires per v1.0.2 Part A. No changes from Amendment 2.

## Operational notes (Phase 2 + Wave 3 — kept as pointers, not redefined)

- **Lead-capture UX (Wave 3 / Task #134)**: unified success surface `client/src/components/success-view.tsx` on /submit, /contact, /marketflow/access, /vendor-network. First-party CTA attribution via `cta_events` table + `trackCtaClick(source, label, href)` in `client/src/lib/analytics.ts`. Admin surface: `/admin/cta-events`. Brand-tuned `--destructive` + `--form-error` token.
- **Phase 2 Copy Proposal** (`.local/phase-2-copy-proposal.md`, Apollo-approved): Development page `RoutingFilterSection`; Strategy Lab 5-line guided promise + `ribbon-how-it-works`; **Deal Blueprint** mounted at `/deal-blueprint` (intake via `/submit?intent=blueprint`, `leadType: "blueprint_request"`); FAQ Quick Read vs Full Path vs Blueprint Q&A + Buyboxes Q&As.
- **/connect premium polish**: BrandStrip · GreetingHero (founder portrait + contact pills + `trackCtaClick("connect", ...)`) · RouteGrid · PeggyPresenceCard ("Private beta" pill — public Peggy chat remains excluded from /connect per v1.0.1 doctrine) · Footnote.

## Website → Pegasus HQ integration (Task #153, sequenced after #150)

HQ endpoint live in code at `https://pegasus-hq-operating-system.vercel.app/api/public/intake`. `/api/health` currently returns 503 (missing Supabase envs on Vercel — Apollo/Codex action). Payload contract locked with HQ agent: `propertyAddress`, `contactName`, `outreachReason`, `sourceChannel`, `consentContact`, `consentCcpaAcknowledged`, `idempotencyKey`. Env var: `PEGASUS_HQ_PUBLIC_INTAKE_URL`. No HMAC in v1. **Outbox/no-op fallback** by default — site never blocks on HQ availability; auto-flips to live forwarding once `/api/health` returns 200, no redeploy. leadType → outreachReason mapping: `submit` → `property_review`, `vendor` → `vendor_application`, `buybox_interest` → `buybox_interest`, `blueprint_request` → `paid_blueprint_request`, `peggy_note` → `peggy_inbound`; Peggy phone uses `sourceChannel: website:peggy:phone`.

## External Dependencies

- **UI**: Radix · Tailwind · class-variance-authority · Lucide · Google Fonts (Cinzel · Cormorant Garamond · Montserrat · Inter).
- **Data/Forms**: React Hook Form · Zod · TanStack Query · drizzle-zod.
- **Database**: Supabase · Drizzle · Neon serverless PostgreSQL.
- **Auth**: passport · express-session · connect-pg-simple · Supabase Auth.
- **Dev**: TypeScript · Vite · Vitest. `npm test` / `npm run test:watch`.
- **Security**: DOMPurify / isomorphic-dompurify.
- **Comms**: SendGrid · OpenAI (Peggy).

## Authoritative blueprints

- `docs/architecture/website-experience-blueprint-v1.md` — v1.0 (legacy reference).
- `docs/architecture/website-marketflow-blueprint-v1.3.1.md` — v1.3.1 (legacy, superseded for v1 public surface by Empire Doctrine).
- **Empire Doctrine v1.0.2 + Amendment 1 + Amendment 2** — controlling. Sources listed at top of this file.
