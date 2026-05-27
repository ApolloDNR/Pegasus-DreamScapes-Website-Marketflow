# Pegasus DreamScapes — Website Structure v1 FINAL

> **Status: locked.** Source: Apollo direction (Nov 2026), `attached_assets/Pasted-Apollo-Got-it-Locking-the-direction-Here-s-the-ultimate_1779830168089.txt`.
> Supersedes Empire Doctrine Amendment 2 §C (Four Doors) and §E (eight-section homepage) for structure. The visual baseline (Empire Doctrine v1.0.2 Part A: Deep Navy / Rich Copper / Warm Cream / Charcoal; Cinzel · Cormorant · Montserrat · Inter) is unchanged.

---

## 1. Primary nav (locked)

```
Deal Architecture · Development · Strategy Lab · Work With Apollo · MarketFlow · More
                                                                           [Submit a Property →]
```

- 5 noun items in `NAV_PRIMARY`, plus the **More** dropdown sourced from `NAV_MORE`.
- Right-side CTA pill: **Submit a Property** (`/submit`).
- `/projects` is removed from primary nav; index page stays alive as a deep link and is surfaced inside `/development` as "Projects & Case Studies".
- More dropdown surfaces: About · Strategy Library · FAQ · Vendor Network · Capital · Connect · Contact · Peggy · The Ecosystem · Disclosures · Projects.

## 2. The four named products (taxonomy locked)

1. **Strategy Lab** — public calculator surface. Output is "your preliminary read" / "your instant analysis", never a 5th product name.
2. **Strategy Review** — human-reviewed conversation off the Submit form.
3. **Strategy Snapshot** — preliminary, informational written read. Reviewed within 5 business days.
4. **Deal Blueprint** — paid full underwriting + path doc.

## 3. Homepage — nine sections (locked order)

1. **Hero** — "Complex property. / Structured opportunity." · sub: strategy-first real estate operating company · CTAs: **Submit a Property · Open Strategy Lab · Work With Apollo**.
2. **What brings you here?** — four-tile audience-select (Task #158 amendment; replaces the prior six-card role router and the Amendment 2 Four Doors). The four tiles are the four audiences Apollo named directly:
   - **Sellers** — "I have a property." → `/submit?intent=property`
   - **Buyers** — "I'm a homebuyer." → `/work-with-apollo`
   - **Capital Partners** — "I'm a capital partner." → `/capital`
   - **Vendors** — "I build or supply." → `/vendor-network`
   Strategy Lab and Development each have their own dedicated locked sections (§3.4 and §3.5) and don't need a redundant front-door tile here.
3. **Deal Architecture** — ten outcome-lane chips (direct acquisition · creative finance · JV / co-GP · wholesale · listing · buyer rep · BRRRR · ADU upside · value-add · routed referral).
4. **Development** — seven lanes (ADU additions · forced-value rehabs · fix-and-flip · BRRRR acquisitions · small multifamily · ground-up infill · master-planned neighborhoods).
5. **Strategy Lab** — promise + the four named products.
6. **Work With Apollo** — DRE/KW representation panel.
7. **MarketFlow** — gated network landing teaser.
8. **The Dreamscaper Standard** — six commitments. (Replaces "Pegasus Standard" copy.)
9. **Final CTA** — "Bring us the property. We'll help find the path." · three buttons mirror Hero.

The locked sr-only doctrine anchors stay at the bottom of `home.tsx` for the public-voice guardrail.

## 4. Work With Apollo (`/work-with-apollo`)

New primary-nav page. Four sub-sections:

- **List With Apollo** — full-service KW listing.
- **Buy With Apollo** — buyer representation.
- **Investor Buyer Representation** — operator/investor-side buyer rep.
- **Home Value / Listing Strategy Review** — pre-listing strategy session.

**Locked disclosure block (verbatim, asserted by `public-voice.test.tsx`):**

> Licensed real estate services are provided by Paolo "Apollo" Duran through Keller Williams Realty East Bay. Pegasus DreamScapes is a separate development, investment, and property strategy company.

CTAs route to `/submit` with `intent` of `list` / `buy` / `buyer-rep` / `listing-strategy`.

## 5. Peggy (`/peggy`)

Six sections: What Peggy is · Where Peggy works · What Peggy does · What Peggy does not do · Sample transcript · CTA. The Amendment 2 §D positioning line and §D.4 phone gates remain locked. Widget shell copy until Task #151 ships: **"Peggy is in private training. Notify me when she's live."** with notify-me form (`leadType: "peggy_notify"`).

## 6. Ecosystem (`/ecosystem`, footer-only)

Audience-B release valve. Header: "The Pegasus Ecosystem — what we're building, honestly." Four product cards (Pegasus HQ · MarketFlow · BuildForge · CapStack) + Peggy, each with a §G status badge.

## 7. MarketFlow + Buyboxes

MarketFlow is a gated public landing (`/marketflow`). The **Buyboxes** surface moves to `/marketflow/buyboxes` (or anchored sub-section) with the four cards: Foundation Value-Add · Annex ADU Upside · Signature Repositioning · Structured Opportunity (`publicReady: false` until Phil reviews).

## 8. Footer (locked four-column IA)

Columns: **Company · Tools · Network · Legal**. Below the columns, the **locked legal disclosure block** appears on every page:

- Pegasus DreamScapes Corp. — California Corporation
- Founder Paolo "Apollo" Duran — DRE #02333658, Keller Williams Realty East Bay (independently owned and operated)
- Pegasus DreamScapes is a separate development, investment, and property strategy company
- Nothing on this site is an offer or solicitation of securities
- Strategy Snapshots are preliminary and informational
- Equal Housing Opportunity

## 9. Tests (guardrails)

- `nav-parity.test.tsx` — `NAV_PRIMARY` lineup is Deal Architecture · Development · Strategy Lab · Work With Apollo · MarketFlow; `/work-with-apollo` is in primary; `/projects` is not.
- `public-voice.test.tsx` — adds: "The Dreamscaper Standard" on home; "Bring us the property. We'll help find the path." on home; Work-With-Apollo DRE/KW disclosure verbatim; footer legal disclosure block.
- `doctrine-anti-drift.test.ts` — untouched. Visual tokens are not changed.

## 10. Out of scope (deferred)

- Real Peggy chat backend → Task #151.
- Peggy phone + §D.4 gates → Task #152.
- HQ `/api/public/intake` (live since Task #153).
- Nelson Dr photo set + founder srcset transcodes.
- Stripe checkout on Deal Blueprint.
- Testimonials / press strip / fake credential logos (explicitly excluded).
