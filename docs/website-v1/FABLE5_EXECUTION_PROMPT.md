# Fable 5 / Developer Execution Prompt

Paste this prompt into Fable 5, Claude, Codex, Replit, or another developer agent. Treat it as the controlling execution brief.

---

You are building the Pegasus Dreamscapes Corp. public website v1.0.

This is a serious real estate investment, development, strategy, and execution company website. It must be premium, elegant, functional, honest, and launchable.

The website’s primary purpose is to generate and route real estate opportunities. Pegasus Dreamscapes receives property submissions, distressed owner inquiries, off-market leads, deal finder submissions, buyer interest, capital partner inquiries, vendor/operator interest, referral partner inquiries, and strategy review requests. The website must route visitors into the correct lane.

## Core homepage headline

**Complex property. Structured opportunity.**

## Primary CTA

**Submit a Property**

## Secondary CTA

**Request a Strategy Review**

## Company

Pegasus Dreamscapes Corp.

## Tagline

Dream it. Build it. Live it.

## Corporate division line

Development • Investments • Systems

## Public operating departments

1. Acquisitions
2. Development
3. Dispositions
4. Asset Management

## Support tools

- Strategy Lab
- MarketFlow
- PeggyAI
- Pegasus HQ

Important distinction: the public operating model is Acquisitions, Development, Dispositions, and Asset Management. Strategy Lab, MarketFlow, PeggyAI, and Pegasus HQ are support tools, not the main public identity.

## Homepage must include

1. Hero — “Complex property. Structured opportunity.”
2. Situation Router — I own a property / I found a deal / I want to buy / I want to partner / I need a strategy.
3. Pegasus Deal Engine — Submit → Review → Structure → Route → Execute → Exit / Hold.
4. Four Departments — Acquisitions, Development, Dispositions, Asset Management.
5. Strategy Lab preview.
6. MarketFlow preview.
7. Work With Apollo section.
8. Founder-led Nelson/Richmond case study.
9. The Pegasus Standard future vision section.
10. Final CTA.

## Required routes

- `/`
- `/submit-property`
- `/departments`
- `/sellers`
- `/deal-finders`
- `/buyers`
- `/capital-partners`
- `/operators-vendors`
- `/referral-partners`
- `/strategy-lab`
- `/marketflow`
- `/work-with-apollo`
- `/case-study`
- `/pegasus-standard`
- `/contact`
- `/disclosures`
- `/privacy`
- `/terms`

## Experience definition

The site must feel like a premium real estate strategy office, not a generic realtor site, not a wholesaler site, not a fantasy architecture site, and not a SaaS dashboard.

Visitors must immediately understand where they fit and what to do next.

Primary flow:

Visitor → Situation → Property/Deal Review → Department Route → Internal Opportunity Record → Follow-up.

## Visual direction

Use:

- Dark navy / near-black base.
- Warm cream / limestone sections.
- Copper / bronze accents.
- Elegant serif headlines.
- Clean sans-serif body.
- Premium editorial real estate layout.
- Subtle blueprint and architectural geometry.
- Cinematic but realistic imagery.
- No cheap stock imagery.

Long-term visual north star:

Hellenic Modern / Classical Mediterranean. Pale limestone, ivory plaster, travertine, simplified Greek columns, flat rooflines, colonnades, courtyards, pergolas, olive trees, cypress trees, fountains, water channels, fire bowls, warm lighting, cool stone, open-air living, calm luxury, and human-centered architecture.

Use Hellenic Modern imagery as the Pegasus Standard / future vision, but do not misrepresent current active developments. Full aspirational community imagery belongs mainly in the Pegasus Standard / Vision sections. Current operations pages should use grounded real estate execution imagery: property review, underwriting, renovation, disposition, asset management, and founder-led strategy.

Homepage hero imagery:

Use a cropped Hellenic Modern architectural image with pale limestone, columns, olive branches, warm interior glow, and dark navy overlay space. It should create brand atmosphere, not imply current inventory.

The “Sell on your terms, not the market’s” prototype direction should become the Sellers & Owners page. Preserve its premium, calm, serious feeling.

## Submit Property form

The Submit Property form must be multi-step:

1. What brings you here?
2. Property information.
3. Situation.
4. Goal.
5. Contact.
6. Confirmation.

Every form submission must create a structured opportunity record with lead source, contact, visitor type, property info, situation, goal, urgency, recommended lane, assigned department, status, notes, consent, and tracking data.

Required statuses:

- New
- Needs Review
- Need More Info
- Strategy Review
- Routed
- Active Opportunity
- Under Contract
- In Development
- Disposition
- Asset Management
- Closed
- Passed / Archived

## Strategy Lab

Strategy Lab must be a lightweight directional property strategy preview, not a fake full platform. It should accept property assumptions and return possible strategy lanes, missing information, risk flags, and recommended next step.

Disclaimer:

This is a directional preview only. It is not an offer, appraisal, legal advice, tax advice, financial advice, lending commitment, or investment recommendation.

## MarketFlow

MarketFlow must be a private network intake page, not a fake public marketplace. Users can request access as buyer, investor, capital partner, deal finder, agent, vendor, contractor, or referral partner.

Do not show fake active deals unless clearly labeled as sample/mock data.

## Work With Apollo

Work With Apollo must clearly separate:

- Pegasus Dreamscapes Corp. — investment, development, strategy, partnerships, property review.
- Keller Williams East Bay — licensed real estate representation when applicable.

Use:

Paolo “Apollo” Duran  
Founder, Pegasus Dreamscapes Corp.  
Licensed Real Estate Professional, Keller Williams East Bay  
CA DRE #02333658

Required disclosure:

Pegasus Dreamscapes Corp. is a real estate investment, development, and strategy company. Pegasus Dreamscapes Corp. is not a real estate brokerage. Licensed real estate representation, when applicable, is provided by Paolo “Apollo” Duran through Keller Williams East Bay. CA DRE #02333658. No agency relationship is created without a written agreement. Strategy reviews are preliminary and are not legal, tax, lending, appraisal, financial, or investment advice.

## Case study

Use the Nelson/Richmond founder-led value-add repositioning as honest proof.

- Acquired: $600,000
- Renovation: approximately $105,000
- Sold: $840,000

Frame as founder-led execution and lessons, not huge profit or institutional scale. Do not fake before/after images.

## The Pegasus Standard page

This is the long-term vision page. It should describe the future of Pegasus Dreamscapes: beautiful, durable, calm, human-centered homes, neighborhoods, and communities inspired by Hellenic Modern / Classical Mediterranean design.

Use the concept of Eudaimonia — human flourishing — lightly as a philosophical anchor.

Clearly label this as future vision.

## Do not

- Do not make Pegasus look like a fake giant developer.
- Do not make future community imagery look like current active inventory.
- Do not lead with PeggyAI.
- Do not make the homepage a software dashboard.
- Do not bury the Submit Property CTA.
- Do not remove the four departments.
- Do not confuse Pegasus Corp. with Keller Williams representation.
- Do not use guaranteed return language.
- Do not use fake active inventory.
- Do not use fake before/after case study images.
- Do not use generic stock photos.
- Do not use Tuscan, Spanish Revival, American neoclassical, or fantasy palace visuals.
- Do not make the site feel cheap.

## Success criteria

- The homepage explains Pegasus in under 10 seconds.
- The visitor can immediately choose the right lane.
- The four departments are clear.
- The forms work.
- The visual identity feels premium and intentional.
- The future architecture vision is present but controlled.
- The current business feels real, grounded, and credible.
- The website is launchable.

## Recommended working branch

Create implementation branch:

`feature/public-website-v1-deal-routing`

Read all docs inside `docs/website-v1/` before implementation.
