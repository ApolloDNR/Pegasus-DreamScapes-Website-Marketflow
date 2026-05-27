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

## 3. Homepage — funnel composition (Task #158 amendment)

Task #158 (Nov 2026 funnel rebuild) supersedes the prior flat nine-section composition. The homepage is now a funnel: hero → trust strip → audience sort → proof → product → surface index → operator → standard → final CTA. Deep dives live on their own pages.

1. **Hero** — "Complex property. / Structured opportunity." · plain-English product line ("We buy, build, list, and structure deals on East Bay residential property.") · CTAs: **Submit a Property · Open Strategy Lab · Work With Apollo**.
2. **Trust strip** (unchanged) — credentials row directly under Hero.
3. **What brings you here?** — four-tile audience-select. The four tiles are the four audiences Apollo named directly:
   - **Sellers** — "I have a property." → `/submit?intent=property`
   - **Buyers** — "I'm a homebuyer." → `/work-with-apollo`
   - **Capital Partners** — "I'm a capital partner." → `/capital`
   - **Vendors** — "I build or supply." → `/vendor-network`
4. **Nelson Dr — the proof** (pulled forward from the buried §10 slot in the old structure). Image-first case-study card with three pills (Acquired / Renovation / Sold) and a link to `/projects/nelson-dr`. Gated on real photos + founder-confirmed numbers per launch gate §J.2.
5. **Strategy Lab** (pulled forward from the buried §7 slot in the old structure). Promise + the four named products (Strategy Lab · Strategy Review · Strategy Snapshot · Deal Blueprint).
6. **What we do** — single compact band, five cards: Deal Architecture · Development · Strategy Lab · Work With Apollo · MarketFlow. Replaces the prior four separate full-height teaser sections. Each card carries the historical `section-home-<slug>` data-testid so the public-voice guardrail still finds the surface references. MarketFlow card includes the `Private beta · invite only` status badge plus two sub-links: **Request beta access** (`/marketflow/access`) and **Pegasus Buyboxes** (`/marketflow/buyboxes`).
7. **Operator** (pulled forward from the buried §11 slot in the old structure). Apollo bio + father-attributed construction lineage (Moises Duran). DRE / KW / NAR / CAR credentials.
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
