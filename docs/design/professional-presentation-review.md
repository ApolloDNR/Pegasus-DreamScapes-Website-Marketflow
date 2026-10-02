# Professional presentation and visitor structure

Continuation dated 2026-09-13, starting from `a431cb91ae863fb3c328f53e076e6feca040f747`. The owner asked for a professional finish across the website, a clear overall direction, and careful attention to details beyond the Property Owners repair.

## Business and visitor priorities

Pegasus is a founder-led real estate operating company. The public website should help a visitor understand the company, examine documented work, and choose the appropriate conversation. Educational tools and controlled-pilot software support that purpose. Their existence is not evidence of available inventory, services, staffing, or transactions.

The three central journeys are:

1. An owner understands the possible property paths, chooses a relevant situation, and reaches intake with that context intact.
2. A potential partner understands the operating process, examines the Nelson Drive record, and shares a specific opportunity through the canonical intake.
3. A buyer, vendor, or referral partner identifies the correct request and its boundaries before entering its dedicated destination.

## Page responsibilities

| Surface | Visitor question | Evidence or useful interaction | Next step |
| --- | --- | --- | --- |
| Home | What is Pegasus, and where do I fit? | Company introduction, operating map, documented work | Bring an Opportunity; audience routes |
| How We Operate | How is a project considered and structured? | Five selectable operating stages and role boundaries | Explore the process; see the work |
| Property Owners | What could apply to my situation? | Nine owner situations, explained recommendations, real project photograph | Property intake with selected situation |
| Deal Partners | What is missing from this opportunity? | Selectable project needs and participation context | Submit the deal with useful information |
| Our Work | What has actually been done? | Nelson Drive photography, sourced project record, lessons | Relevant project conversation |
| About | Who is responsible for the company? | Founder identity and story before operating principles | Understand the work and contact paths |
| Buyers | Which kind of buyer request do I need? | Three distinct paths, their terms, and a link to documented work | Representation, investor-interest intake, or pilot-access request |
| Development | How should a project be defined? | Actual Nelson photograph and project-control framework | Explore the framework, then relevant intake |
| Capital | What kind of introduction is appropriate? | Relationship guidelines and unchanged eligibility boundaries | Read guidelines before the existing introduction path |
| Operators | How do I submit my qualifications? | Scope, credentials, and vendor boundaries | Formal Vendor Network application |
| Referral | How do I introduce someone responsibly? | Permission and written-term context | Referral intake |
| Contact and FAQ | How do I reach the right place or resolve uncertainty? | Direct contact details, audience routing, searchable questions | Appropriate destination without a dead end |

The five primary navigation destinations remain stable. Secondary audience pages remain discoverable through More and the audience paths. The main public call to action remains Bring an Opportunity.

## Current-site audit and implemented corrections

Fresh screenshots of the actual protected preview at 1363 by 936 covered Deal Partners, How We Operate, About, Buyers, Capital, Operators, and Referral. The source preview was `pegasus-dreamscapes-preview-c1ww70q2u-apollosynd-8973s-projects.vercel.app`. These were rendered observations, not source-only design conclusions.

| Observation | Effect on the visitor | Correction |
| --- | --- | --- |
| Supporting hero headlines dominated the opening while actions were often about 10px | Decoration had more weight than the next useful action | A restrained headline scale, readable body measures, and 14px marketing actions with 48px minimum targets |
| Buyers, Capital, Operators, Referral, and Development lacked an opening action | Visitors had to search a long page for the next step | Specific opening actions, including anchored guidelines and framework sections |
| How We Operate introduced the process without a direct first-screen route into it | The most useful interaction was below an oversized opening | Compact arrival with Explore the process and See the work |
| Buyers placed explanation before its three choices and repeated a large MarketFlow module | Separate request types were hard to compare; the page felt like a product catalogue | Bring the three paths immediately after the opening, use open columns, and remove the repeated MarketFlow module |
| Buyers linked its work prompt to MarketFlow | The promise of project evidence led to the wrong type of content | Link directly to the actual Nelson Drive record on Our Work |
| About placed abstract convictions before the founder | Visitors encountered doctrine before the person responsible | Founder story immediately after the introduction, followed by principles and credential boundaries |
| Secondary actions used programmatic buttons and very small, widely spaced labels | Links were less readable and lacked normal link behavior | Semantic destination links and the shared readable action scale |
| Hosted follow-up exposed a floating buyer credential note and an older blue About background winning the lazy stylesheet cascade | The comparison felt disconnected and the approved material palette was inconsistent | Align the credential note with the options, make buyer help readable, and keep the approved dark About palette after route loading |
| The Operators action reached the Vendor Network URL, but route initialization reset its application anchor to the top | The visitor still had to find the form after asking to open it | Restore the form anchor after the page mounts, move keyboard focus into that section, and verify the actual cross-page arrival in rendered checks |
| Phone screenshots showed bright photograph details behind pale navigation controls on supporting pages | Menu and theme controls were less distinct | Add a localized dark fade behind the header on shared photographic arrivals, preserving the locked Home image |

Strengths retained: the approved navy bookcloth and copper finish, ivory typography, actual Nelson project evidence, differentiated owner and partner selectors, searchable navigation, and the stable primary navigation structure. No invented portfolio, credentials, testimonials, market coverage, or performance claims were added.

For structure only, the current [Sobrato portfolio](https://www.sobrato.com/real-estate-development/portfolios/) and [Related California company site](https://www.relatedcalifornia.com/our-company) provide useful comparisons: company identity, work, and responsible people are easy to find. The design inference is to make Pegasus's own evidence and contact paths clear. Their business scale and claims are not transferable to Pegasus.

## Finish standards

- Preserve the approved Home hero composition, image, headline, and action order.
- Use the existing copper, navy, ivory, and woven material. Do not add ornamental effects to imply quality.
- Give supporting pages an opening with a specific job, a readable explanation, and a useful action.
- Keep supporting headlines around 40–66px according to viewport and level; use readable body measures rather than stretching text across a screen.
- Use 14px marketing action labels, visible keyboard focus, and at least 48px action height. The compact header action uses 13px and 46px.
- Use section rhythm and fine rules to organize comparison content; avoid repeating large nested cards.
- Preserve document and consent boundaries while making their position understandable in each journey.

## Acceptance and launch status

The rendered route gate now checks the six new opening actions at every existing width and theme: real destinations, minimum target size, readable text, clipping, and anchored sections clear of the sticky header. Buyer paths must remain distinct and the evidence link must resolve to Our Work. Existing navigation, forms, owner situation, partner selector, gallery, FAQ, and wide-desktop owner checks remain in place.

Review the actual hosted result for opening proportions, image framing, typography, page order, action hierarchy, and light/dark contrast. Record the published source, current CI, hosted observations, and preview URL on PR #26. A passing code build alone is insufficient visual acceptance.

The browsing preview is separate from production activation. The website still needs its actual Render/Neon environment, proven intake storage and delivery, authentication and Peggy configuration, and consent-compatible HQ receipts before a public launch can be certified. Keep preview indexing disabled and retain the concrete dependencies in `docs/qa/launch-completion-status.md` and `docs/qa/hq-contract-readiness.md`.
