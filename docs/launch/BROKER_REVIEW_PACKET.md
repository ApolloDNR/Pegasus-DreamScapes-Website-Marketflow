# Broker Review Packet — pegasusdreamscapes.com

Prepared for sign-off by the Keller Williams East Bay broker of record.
Date prepared: 2026-07-18 · Site version: Master Blueprint v5.1 build
(repo `ApolloDNR/Pegasus-DreamScapes-Website-Marketflow`, main branch).

Licensee: Paolo "Apollo" Duran · California real estate salesperson ·
CA DRE #02333658 · Keller Williams Realty East Bay.

**What we are asking you to review:** every public statement on the site
that touches licensed real estate representation, the brokerage
relationship, or agency. Each string below is quoted verbatim from the
live code, with the page(s) where it appears. Nothing else on the site
offers licensed services, quotes prices as an agent, or implies an
agency relationship.

**Structural position taken throughout the site:** Pegasus Dreamscapes
Corp. is an investment/development/strategy company and is NOT a
brokerage; licensed representation, when applicable, is provided by
Paolo "Apollo" Duran personally through Keller Williams East Bay; no
agency relationship is created without a written agreement.

---

## 1. Sitewide footer identity paragraph

Appears at the bottom of every page on the main site.
Source: `client/src/pegasus/pages.tsx` (footer, `text-footer-identity`).

> Pegasus Dreamscapes Corp. is a real estate investment, development,
> and strategy company. Pegasus Dreamscapes Corp. is not a real estate
> brokerage. Licensed real estate representation, when applicable, is
> provided by Paolo "Apollo" Duran through Keller Williams East Bay.
> CA DRE #02333658. No agency relationship is created without a written
> agreement. Strategy reviews are preliminary and are not legal, tax,
> lending, appraisal, financial, or investment advice. Each Keller
> Williams office is independently owned and operated. Equal Housing
> Opportunity.

Footer also carries the line: "NAR · CAR · Equal Housing Opportunity".

## 2. Homepage — founder credential line

Home (`/`), founder section, directly under the founder biography.
Source: `client/src/pegasus/home-v51.tsx`.

> Licensed representation through Keller Williams East Bay · CA DRE
> #02333658. Role, terms, and any conflicts are made clear before
> anything begins.

## 3. About page (`/about`) — founder identity

Source: `client/src/pegasus/data.tsx` (rendered in the founder block on
About and reused on the homepage founder movement).

Credential line:

> Licensed Real Estate Professional, Keller Williams East Bay · CA DRE
> #02333658

Biography paragraph:

> Apollo (Paolo) Duran founded and leads Pegasus. He is a licensed real
> estate salesperson through Keller Williams Realty East Bay (DRE
> #02333658) and the strategist on every deal: he reads the situation,
> underwrites the numbers, and writes the plan. The build work is
> handled by licensed contractors brought on per project, not an
> in-house crew. The same underwriting runs from the first call to the
> final walkthrough.

Also on About ("Founder-led, and honest about it." section), source
`client/src/pegasus/pages.tsx`:

> Pegasus is founder-led. The operating record is real and small:
> sourced, structured, built, and sold in-house, with licensed
> representation through Keller Williams East Bay and specialized work
> performed by appropriately licensed professionals. We would rather
> show one finished project truthfully than imply a staff we do not
> have.

## 4. Our Work (`/our-work`) — Nelson Drive case study, operator section

Source: `client/src/pegasus/our-work.tsx`.

> Paolo "Apollo" Duran sourced and bought the deal, formed the LLC,
> built the budget, ran the schedule and vendors, set the design
> direction, and carried it to the sale. Construction and repairs were
> handled in-house, with no retail GC margin, which is where the cost
> edge comes from. Licensed representation through Keller Williams East
> Bay (CA DRE #02333658).

Numbers presentation on the same page (for the separate legal glance on
figures): Acquired $600,000 · Renovation, in-house $105,000 · All-in
~$705,000 · Sold $840,000 · "~$95K saved against a comparable retail-GC
bid" · "~$135,000 above all-in cost, before financing, holding, and
selling costs." · "Figures from the closing statement and project
records, rounded. Value shown is not net profit." The property is
identified as "Nelson Drive · El Sobrante, CA" with no street number.

## 5. How We Operate (`/how-we-operate`) — role definition

Source: `client/src/pegasus/how-we-operate.tsx`, "The role is chosen,
not assumed." roles list:

> **Licensed representative** — Listing or buyer representation through
> Keller Williams East Bay.

Framing sentence above the list: "Pegasus may participate in one of
several capacities. Which one is decided by the facts of the deal, put
in writing, and never mixed."

## 6. Work With Apollo (`/work-with-apollo`) — dedicated representation page

Source: `client/src/pegasus/pages.tsx`.

Page hero:

> Founder-led strategy. *Licensed representation when the lane fits.*

Lead paragraph:

> Paolo "Apollo" Duran leads Pegasus Dreamscapes as founder/operator.
> When buyer or seller representation is the right path, Apollo
> provides licensed real estate services through Keller Williams East
> Bay (CA DRE #02333658). Pegasus Dreamscapes is not a brokerage.

Full page disclosure (rendered on the page):

> Paolo "Apollo" Duran · Licensed California real estate salesperson ·
> CA DRE #02333658 · Keller Williams Realty East Bay (each office
> independently owned and operated). Pegasus Dreamscapes Corp. is not a
> real estate brokerage. Licensed real estate representation, when
> applicable, is provided by Paolo "Apollo" Duran through Keller
> Williams East Bay. No agency relationship is created without a
> written agreement. This page is not a listing or buyer-representation
> agreement.

Representation-lane block, source `client/src/pegasus/blocks.tsx`:

> When representation is the lane, Apollo is your agent through Keller
> Williams Realty East Bay. DRE #02333658.

And the lane-routing paragraph (same file):

> Sellers and buyers can request licensed representation through Apollo
> at Keller Williams Realty East Bay. Complex owners, deal finders,
> vendors, and partners enter Pegasus operating lanes. The role changes
> by lane; the standard stays disciplined.

## 7. Intake desk (`/bring-an-opportunity`)

Source: `client/src/pages/submit-property.tsx`.

Visitor-type option offered:

> **A licensed representation need** — Buying or selling with
> representation through the Keller Williams lane.

Form-level assurances:

> No agency relationship, offer, or agreement is created by submitting
> this form.

> It goes to the right lane: acquisition, development, disposition,
> asset management, licensed representation, referral, or pass/no-fit.

Below-form disclosure paragraph:

> Pegasus Dreamscapes Corp. is a real estate investment, development,
> and strategy company. Pegasus Dreamscapes Corp. is not a real estate
> brokerage. Licensed real estate representation, when applicable, is
> provided by Paolo "Apollo" Duran through Keller Williams East Bay.
> CA DRE #02333658. No agency relationship is created without a written
> agreement.

## 8. Deal Partners (`/deal-partners`) — wholesaler/deal-source lane

Source: `client/src/pegasus/deal-partners.tsx`, "On the record" panel:

> Source attribution is recorded at submission. Any JV, assignment,
> referral, or compensation structure must be agreed in writing before
> distribution.

## 9. Peggy (AI intake concierge, floating on all pages)

Sources: `client/src/pegasus/data.tsx`, `client/src/pegasus/peggy.tsx`.

Standing disclosure (always visible in the chat panel):

> Peggy is an AI intake assistant. She does not approve deals, make
> offers, or provide legal, tax, lending, or investment advice.

Opening message:

> I'm Peggy, Pegasus's AI concierge. Tell me what you're bringing, a
> property, a deal, a project, or a plan, in your own words. I'll help
> organize it and route it to the appropriate Pegasus review path.

Hard-refusal policy, published on `/disclosures`
(`client/src/pages/disclosures.tsx`):

> Peggy enforces four hard refusal categories, on every channel (chat,
> phone, ecosystem apps): (1) protected-class steering under federal
> and California Fair Housing law; (2) price quotes, valuations,
> fitness claims, or any DRE-licensed representation; (3) legal, tax,
> or investment advice; (4) any commitment that binds Pegasus to an
> offer or transaction. Triggering any of these routes moves the
> conversation to Apollo for a direct written read.

## 10. Terms (`/terms`)

Source: `client/src/pages/terms.tsx`.

> Paolo "Apollo" Duran is a licensed California real estate agent (DRE
> #02333658) with Keller Williams East Bay. Each office is
> independently owned and operated.

## 11. Search-engine metadata and structured data

`shared/seo-routes.ts` — Work With Apollo meta description:

> Licensed representation with Apollo Duran through Keller Williams
> East Bay — list, buy, or work through a complex situation. DRE
> #02333658.

`shared/seo-routes.ts` — Disclosures meta description:

> Disclosures for Pegasus Dreamscapes Corp. DRE #02333658, Keller
> Williams East Bay. Each office is independently owned and operated.

`client/index.html` — JSON-LD structured data: the DRE license
("CA DRE #02333658") and the Keller Williams East Bay affiliation are
attached to the founder **Person** entity only — deliberately NOT to
the Pegasus Dreamscapes **Organization** entity — so search engines
cannot read Pegasus Corp. itself as the licensed party. The affiliation
carries the note: "Licensed real estate representation is provided by
Paolo \"Apollo\" Duran through Keller Williams East Bay. Each office is
independently owned and operated."

`shared/faq-data.ts` — FAQ answer (also rendered on `/faq`):

> Yes. Apollo Duran, California DRE #02333658, provides licensed real
> estate services through Keller Williams Realty East Bay — each office
> independently owned and operated. Licensed work is held to a
> fiduciary standard.

## 12. Secondary/legacy pages still reachable

These pages predate the v5.1 redesign but remain routed; each carries
the same footer identity paragraph and consistent DRE/KW attribution:
`/case-study`, `/projects/nelson-dr`, `/connect`, `/faq`,
`/departments`, `/pegasus-standard`, `/disclosures`. Representative
line from `/projects/nelson-dr`: '…"Apollo" Duran, California real
estate salesperson, DRE #02333658, through…' (full context on page).

---

## Sign-off checklist for the broker

1. Licensee name, license number, and KW East Bay attribution are
   accurate everywhere quoted above.
2. The "Pegasus Dreamscapes Corp. is not a real estate brokerage"
   framing plus "representation provided personally through KW East
   Bay" is acceptable to the office.
3. The "no agency relationship without a written agreement" language is
   acceptable at intake and in the footer.
4. "Each office is independently owned and operated" and Equal Housing
   Opportunity placement are sufficient.
5. The Nelson Drive case-study numbers presentation (section 4 above)
   raises no advertising-rule concerns for the office. (A separate
   legal glance at these figures is also being requested.)
6. Peggy's AI disclosure and hard-refusal categories (section 9) are
   acceptable for an AI assistant operating alongside a licensee.

Requested response: approve as-is, or list exact strings to change.
Every string above lives in version control; changes are a same-day
edit.
