# Website + MarketFlow Blueprint v1.3.1

> **Status:** Controlling document for the Pegasus DreamScapes **public website + MarketFlow** scope.
> Supersedes `website-experience-blueprint-v1.md` for anything related to the public site, the Strategy Review funnel, the free Property Strategy Snapshot, the paid Pegasus Deal Blueprint, MarketFlow positioning, Peggy, the Strategy Library, and the Vendor Network.
> v1.0 remains in the repo as historical reference; do not delete.

## 1. Purpose

This blueprint locks the website + MarketFlow experience for the v1.3.1 build. It exists so every later phase has one source of truth, every visual and copy decision can cite a section number, and downstream tasks can be merged in any order without re-litigating identity, structure, or compliance.

## 2. Identity

- **Company:** Pegasus DreamScapes Corp.
- **Pillars:** Development · Investments · Systems.
- **Identity badge:** The Deal Architect.
- **Headline promise:** Complex property. Structured opportunity.
- **Doctrine line:** Every property gets a serious review. Not every property gets an offer.
- **Belief line:** Built on strategy. Governed by virtue. Executed with discipline.
- **Tagline:** Dream it. Build it. Live it.
- **Founder, public:** Paolo "Apollo" Duran. Direct line `925-744-8525`. Direct email `apollo@pegasusdreamscapes.com`.

The site reads as a strategy-first real estate operating company. It does not read as a wholesaler, a generic investor splash page, a cash-buyer site, or a SaaS dashboard.

## 3. Source Of Truth Order

1. This v1.3.1 blueprint (website + MarketFlow scope).
2. v1.0 blueprint (`website-experience-blueprint-v1.md`) for sections this doc does not restate.
3. Visual baseline rules from PR #6.
4. Website ↔ HQ Integration Contract from PR #7.
5. Existing production code only where it does not conflict with the documents above.

Any future visual, copy, routing, or page-structure change must cite the section it implements.

## 4. Public Sitemap

### Existing routes (kept)
- `/` — homepage.
- `/sell` — Strategy Review intake (public label = Strategy Review).
- `/invest` — Capital & Partnerships inquiry (public label = Capital & Partnerships).
- `/projects` — case studies index.
- `/projects/:slug` — project narrative.
- `/services` — pillar deep-dive.
- `/about` — founder-led story.
- `/contact` — routed inquiries.
- `/partner` — partnership inquiry.
- `/submit-deal` — wholesaler / operator deal submission.
- `/buyers`, `/buy`, `/wholesale` — buyer surfaces.
- `/calculators`, `/resources`, `/resources/:slug` — public tools and articles.
- `/dreamspace` — brand surface.
- `/privacy`, `/terms` — disclosures.

### New routes (this build)
- `/education` (canonical) and `/strategy-library` (alias → `/education`) — Strategy Library.
- `/vendor-network` — Vendor Network intake.
- `/deal-blueprint` — paid Pegasus Deal Blueprint education page.
- `/snapshot/:token` — narrow submitter view of a Strategy Snapshot's status. UI-only in this build; HQ-backed later.

### MarketFlow routes (unchanged)
`/marketflow` and all descendants are product / portal routes. Public pages may link to and preview MarketFlow but must not duplicate portal workflows or expose internal lane scoring, RACI, or buy-box internals.

## 5. Homepage Section Order (7-section lean)

1. **Hero.**
2. **What brings you here?** — 6-card role router.
3. **Free Property Strategy Snapshot.**
4. **The Pegasus Standard.**
5. **Featured Project.**
6. **MarketFlow Beta preview.**
7. **Final CTA.**

Optional 8th: **Development Pathway preview** — only if visual balance allows. The full Pathway lives on a deeper page.

Sections retired from the homepage in this build (kept in the file, unmounted): StrategyStructureStacks, OutcomeLanes, OperatingPrinciples (replaced by Pegasus Standard), ServicesSection (Three Pillars), EveryPropertyGetsAPath. They remain available for inner pages that want them.

### Hero copy (locked)

- Overline: `Pegasus DreamScapes Corp. · Development · Investments · Systems`
- H1: `Complex property.` `Structured opportunity.`
- Identity badge: `The Deal Architect`
- Body: `Pegasus DreamScapes Corp. is a strategy-first real estate operating company. We review property, development, capital, and partnership opportunities, then design the right path forward.`
- Belief line: `Built on strategy. Governed by virtue. Executed with discipline.`
- Tagline: `Dream it. Build it. Live it.`
- Primary CTA: `Start a Strategy Review` → `/sell`
- Secondary CTA: `View Featured Project` → anchor to Featured Project section.

### Role router cards (locked)

| # | Card | Route |
|---|---|---|
| 1 | I have a property | `/sell` |
| 2 | I have a deal or JV idea | `/submit-deal` |
| 3 | I want to discuss capital or partnership | `/invest` |
| 4 | I have an ADU or development opportunity | `/development` (placeholder → `/services` until built) |
| 5 | I want to learn strategies | `/education` |
| 6 | I am a vendor or operator | `/vendor-network` |

### Free Snapshot section (locked)

- Title: `Submit a property. Get a free Strategy Snapshot.`
- What's included: possible strategy lanes · preliminary risk flags · rough strategy-tier ranges · buy-box fit · recommended next step.
- What's NOT included: final offer · exact ARV · exact rehab budget · guaranteed profit · legal, tax, appraisal, permit, architectural, engineering, or contractor advice.
- CTA: `Start a Strategy Review` → `/sell`.

### The Pegasus Standard (locked, 6 principles)

1. Clarity over confusion.
2. Discipline over hype.
3. Stewardship over extraction.
4. Honor over pressure.
5. Truth over easy promises.
6. Human review over blind automation.

## 6. Strategy Review Funnel

`/sell` is the public entry point. Public label is **Strategy Review**.

- H1: `Submit a property. Get a free Strategy Snapshot.`
- Page body explains review-not-offer.
- Primary CTA: `Start Strategy Review`.

### Required intake fields
name · email · phone · submitter role · property address · property type · property condition · occupancy · photos (optional, encouraged) · situation · timeline · desired outcome · proposed number or terms (optional) · creative-finance openness · consent to be contacted · consent to receive a Strategy Snapshot · acknowledgment that the Snapshot is preliminary.

### Submit-success copy (locked)
`Submission received.` `Your Strategy Snapshot is being prepared.`

### Forbidden phrases on Strategy Review and elsewhere on the site
- "Your property is worth $X."
- "ARV is $X."
- "Pegasus will offer $X."
- "You can make $X."
- "Guaranteed profit."
- "Guaranteed offer."

## 7. Free Property Strategy Snapshot

The free Snapshot is a preliminary strategy view, not an offer, not an appraisal, not a budget.

It includes only:
- Possible strategy lanes.
- Preliminary risk flags.
- Rough strategy-tier ranges.
- Buy-box fit.
- Recommended next step.

It is delivered after human review. The website never auto-generates it. Peggy may draft it; HQ approves and releases it.

## 8. Post-Snapshot Submitter Status

`/snapshot/:token` is a narrow submitter view. Magic-link compatible (token-based, no full account). UI-only in this build; backed by HQ later.

States: Submitted · In Review · Needs Info · Snapshot Ready · Next Step Selected.

When state = `Snapshot Ready`, four next-step buttons appear:
1. Sell to Pegasus.
2. Build with Pegasus.
3. Get the Deal Blueprint.
4. Save and decide later.

Optional: Ask Peggy.

This view must not expose internal lane score, RACI, buy-box fail reasons, or any HQ internals. It is intentionally not a dashboard.

## 9. Pegasus Deal Blueprint (paid)

A paid strategy and execution roadmap that follows the free Snapshot for owners, deal sources, and partners who want a deeper plan.

Tiers:
- Single-Path Blueprint.
- Comparison Blueprint.
- Complete Blueprint.

Pricing: leave as `Pricing on request` placeholder unless an existing locked-in doctrine doc in `docs/` already specifies prices, in which case use those numbers verbatim with disclaimers. Do not invent pricing.

Includes: strategy recommendation · structure options · market overview · preliminary scenario ranges · scope assumptions · budget framework · risk register · exit paths · execution roadmap.

Disclaimer (locked): `The Pegasus Deal Blueprint is a strategic planning report. It is not legal, tax, appraisal, architectural, engineering, permit, securities, or contractor advice.`

## 10. Capital & Partnerships (`/invest`)

Public label = **Capital & Partnerships**. Route stays `/invest` for technical convenience.

- H1: `Capital meets structure.`
- Body opens with: `The Investments pillar of Pegasus supports deal-specific capital, partnership, and ownership conversations. Public conversations begin as relationship-based inquiries, not public offerings.`
- CTAs: `Start a Capital Conversation`, `Discuss a Partnership`.
- Disclaimer (visible on page, not just footer): `Nothing on this page is an offer to sell securities, a solicitation to invest, or a promise of returns.`

### Forbidden language anywhere on this page (and elsewhere on the site)
- "Invest Now."
- "Invest With Us."
- "Investor Returns."
- "Passive Income."
- "Guaranteed Returns."
- "Principal Protected."

### Allowed language
- Capital & Partnerships.
- Start a Capital Conversation.
- Discuss a Partnership.
- Deal-specific capital conversations.
- Relationship-based capital.
- Subject to diligence, documentation, legal review, and suitability.

## 11. Strategy Library (`/education`)

Public nav label = **Education**. Route is `/education`; `/strategy-library` redirects to it.

Purpose: teach enough to build trust and route people into Strategy Review. Educational only. No legal/tax/securities advice. No exploitative seller language. No promises.

Categories: Creative Finance · Development Strategy · Capital & Partnerships · Property Strategy · Pegasus Standard · MarketFlow.

Initial article cards:
1. What is creative finance?
2. Seller financing explained.
3. What does subject-to mean?
4. JV structures in real estate.
5. What makes an ADU opportunity valuable?
6. What is a Strategy Snapshot?

Every article ends with: `Have a property that may fit? Start a Strategy Review.` → `/sell`.

## 12. MarketFlow Boundary

MarketFlow is positioned publicly as **the private dealflow layer for reviewed opportunities, trusted operators, buyers, and capital relationships**.

It is **not**:
- raw intake.
- a public marketplace.
- an investment solicitation platform.

The public flow is shown explicitly:

```
Website / Peggy intake
  → Pegasus HQ submission
    → Seed
      → Snapshot
        → Lane choice
          → Opportunity (if approved)
            → MarketFlow Candidate
              → Approved for private distribution
                → MarketFlow Listing
```

Raw `/api/leads` submissions never auto-route to MarketFlow listings.

## 13. Peggy Strategy Assistant

Label everywhere visible: **Peggy · Strategy Assistant**.

Opening message (locked): `Hi, I'm Peggy. I can help route your property, deal, or partnership idea to the right Pegasus review path.`

Default quick prompts (the 6 v1.3.1 router options):
- I have a property.
- I have a deal or JV idea.
- I want to discuss capital.
- I want to explore ADU or development potential.
- I want to learn strategies.
- I am a vendor or operator.

### Peggy CAN
- Guide intake.
- Ask clarifying questions.
- Explain high-level strategies.
- Summarize property situations.
- Recommend a route.
- Prepare a Strategy Snapshot draft.
- Identify missing info.

### Peggy CANNOT
- Make offers.
- Quote property values.
- Guarantee profit.
- Approve deals.
- Release Snapshots.
- Give legal, tax, securities, or permit advice.
- Create War Rooms.
- Move money.

If a user asks Peggy for an offer, value, ARV, or guaranteed return, Peggy responds with a bounded line ("I can't quote values or make offers — that requires a Pegasus Strategy Review") and offers `/sell`.

## 14. Vendor Network

Route: `/vendor-network`. Also reachable via `/contact?subject=vendor`.

Not added to the primary nav in this build. Surface via the homepage role router and the footer.

Fields: name · company · trade · service area · license number (optional) · insurance status · portfolio / photos · references · availability · typical project size · contact info.

Vendor status taxonomy (HQ-side, not exposed on the public site): Submitted · Under Review · Approved · Preferred · Inactive · Do Not Use.

## 15. Website ↔ HQ ↔ MarketFlow Ownership

| Surface | Owns |
|---|---|
| **Public Website** | Brand positioning · public education · seller intake · investor / partner inquiry · project proof · contact routing · MarketFlow preview and entry · public SEO. |
| **Pegasus HQ** | Submission canon · Seeds · Snapshots · lane decisions · approvals · vendor approval workflow · internal admin operations. |
| **MarketFlow** | Authenticated user workflows · role dashboards · approved opportunity browsing · negotiation rooms · offer studio · deal analytics · document workflows · private network activity. |

Public pages may link into HQ / MarketFlow but must not duplicate portal workflows. HQ / MarketFlow may use public brand language but must not redefine website doctrine.

### Transitional data stance (this build)

- `/api/leads` and the `leads` PG table remain as **intake capture only**. They are not the system of record.
- No new canonical PG tables for snapshots, blueprints, vendor approvals, or MarketFlow listings ship in this build.
- New intake surfaces (Strategy Review extended fields, Vendor Network) tuck their structured payloads into the existing `leadData` JSONB column with a new `leadType` value where needed. No schema migration required.
- The `/snapshot/:token` view is UI-mocked from a fixture in this build.

### Future HQ contract (documented, not implemented)

When HQ is ready, the website will:
1. POST through a Supabase Edge Function (validation + CAPTCHA + rate limit).
2. The Edge Function calls HQ `public.create_submission(...)` RPC.
3. HQ returns a submission ID + signed magic-link token for the submitter.
4. The website redirects to `/snapshot/:token`.
5. HQ owns Submission, Seed, Snapshot, lane choice, approval, and MarketFlow listing creation.
6. The website never writes to a canonical lane / opportunity / listing table directly.

Until that wiring lands, the existing `/api/leads` flow continues unchanged. Do not invent intermediate canonical tables.

## 16. Compliance Copy Rules

Compliance language is visible where decisions happen:
- Footer global disclosure.
- `/sell` near submission CTA.
- `/invest` visible on-page disclaimer (not just footer).
- `/submit-deal` near submission.
- `/projects/:slug` where economics are discussed.
- `/marketflow` entry points where private-network access is described.
- `/deal-blueprint` page-bottom disclaimer.

Required themes:
- Information is for general purposes only.
- No guarantee of offer, acceptance, funding, profit, or return.
- Nothing is an offer to buy or sell securities, real property, or investment products.
- Investment discussions are private, relationship-driven, and subject to proper review.
- Real estate outcomes depend on diligence, condition, market, title, financing, legal review, and execution risk.

Compliance language must read clearly. Do not hide it in tiny low-contrast text.

## 17. Voice Rules

Use:
- short sentences.
- active voice.
- specific nouns.
- human tone.
- operator confidence.

Avoid:
- marketese.
- fake luxury.
- guru language.
- "we buy houses fast."
- "guaranteed."
- AI-sounding phrasing.

Em-dashes are removed from public-facing copy and rewritten naturally — not mechanically swapped for hyphens. Preserved exclusions: empty-cell formatters (`—`), code comments, en-dash number ranges (`7–14 days`), and editorial attribution (`— Pegasus Dreamscapes`).

## 18. Visual Rules (PR #6 baseline preserved)

- Warm cream / navy / copper palette. Light mode reads warm cream, **not** white SaaS.
- Cormorant Garamond for editorial display headlines.
- Cinzel for wordmark / carved-label moments.
- Montserrat for restrained kicker labels.
- Inter for body and functional UI.
- Cinematic image-led heroes; hairline dividers; architectural strips; restrained borders.
- Bare icons or quiet icon treatment, not large decorative icon bubbles.
- Cards only where they frame real repeated items or tools.
- No fake stats, no fake trust logos, no fake testimonials, no commodity cash-buyer visuals.
- Glassmorphism only when it improves readability or hierarchy.

## 19. Implementation Sequence

This blueprint maps to seven phased project tasks. Each downstream task cites the section(s) of this blueprint it implements.

| Task | Phase(s) | Implements sections |
|---|---|---|
| Lock Blueprint v1.3.1 (this doc) | 2 | all |
| Restructure homepage (7-section lean) | 3 | §5 |
| Strategy Review + post-snapshot status UX | 4, 5 | §6, §7, §8 |
| Pegasus Deal Blueprint + Capital & Partnerships polish | 6, 7 | §9, §10 |
| Strategy Library + Vendor Network | 8, 11 | §11, §14 |
| MarketFlow positioning + Peggy | 9, 10 | §12, §13 |
| Visual + voice finishing pass | 12, 13 | §17, §18 |

## 20. Prohibitions (verbatim)

- Do not deploy.
- Do not touch production secrets.
- Do not commit operating-manual docx files.
- Do not build HQ internals in this repo.
- Do not make the website the system of record.
- Do not invent a local canonical lead / deal / snapshot / blueprint database.
- Do not redesign from scratch.
- Do not auto-route raw intake into MarketFlow listings.

## 21. QA Checklist

Before merging any v1.3.1 phase task:
- Homepage section order matches §5.
- Hero copy matches §5 verbatim.
- Strategy Review intake includes every field in §6.
- `/snapshot/:token` exposes only the states in §8 and never internal HQ data.
- `/invest` shows the visible disclaimer in §10 and contains zero forbidden phrases.
- `/education` ends every article with the §11 closing CTA.
- MarketFlow public copy matches §12 and never auto-routes raw intake.
- Peggy shows the §13 opener and 6-option router; bounded responses fire on offer/value asks.
- No new canonical tables introduced (§15 transitional stance preserved).
- Compliance language present per §16.
- Voice and visual checks per §17 and §18.
- `npx tsc --noEmit` passes.
- `npm run build` passes.
