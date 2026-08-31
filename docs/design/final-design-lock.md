# Pegasus Dreamscapes Final Design Lock

Last updated: 2026-08-06

This document exists to stop the loop. The website is no longer in open-ended planning. The next phase is controlled visual refinement, route-by-route QA, and launch readiness.

## Operating Rule

The site structure, business story, public copy direction, routes, and compliance posture are frozen unless Apollo explicitly reopens them.

Future agents, Replit, Figma, Claude Design, or any other design tool may improve visual hierarchy, spacing, responsive behavior, interaction detail, and consistency. They may not invent a new business model, add new sections to look impressive, replace Pegasus positioning, create public investment language, or turn the site into a generic SaaS dashboard.

## Brand Direction

Pegasus Dreamscapes should feel like a premium East Bay real estate operating company: editorial, architectural, founder-led, disciplined, and safe to work with.

The visual world is classical architecture, deal-blueprint linework, East Bay property evidence, dark navy, copper, cream, and restrained editorial type. It should not look like an AI-generated SaaS template, a cash-buyer funnel, a luxury real estate brochure with no operating substance, or a generic investor marketplace.

## Audience

The site must quickly make these visitors feel oriented:

- Motivated or distressed sellers with complex property situations.
- Ready sellers who may need licensed listing representation through Apollo at KW East Bay.
- Investor buyers who want a more strategic representative.
- Deal finders and wholesalers who need a serious buyer or JV/disposition lane.
- Capital, vendor, and development partners checking credibility.
- Industry professionals deciding whether Pegasus is serious enough to respect.

## Primary Job

The site should do three things before launch:

1. Establish credibility and taste.
2. Route visitors into the right lane.
3. Capture property and relationship intake without overpromising.

The highest-priority conversion paths are:

- Submit a Property.
- Strategy Lab.
- Talk to Peggy.
- Connect.
- MarketFlow access request.
- Work With Apollo / representation path.

## Narrative Spine

The public story is:

1. Bring the property or situation.
2. Pegasus reads the property, pressure, and numbers.
3. Pegasus identifies the right lane: represent, acquire, structure, route, or pass.
4. If the path is real, Pegasus moves forward with written terms, proper role separation, and reviewed execution.

Keep the deep internal operating details inside Pegasus HQ. The public site should show enough logic to earn trust, not expose every workflow.

## Visual System Lock

Typography:

- Display: Playfair Display for marketing headlines.
- Body/UI: Inter for readable body and functional surfaces.
- Accent labels: Cinzel only as a classical, carved-label accent.
- No negative letter spacing. Large display type should feel editorial, not distorted.

Color:

- Midnight / deep navy are the primary digital base.
- Copper is rare and intentional.
- Cream is used for warmth and editorial contrast.
- Light mode should be meaningfully lighter, not a weak copy of dark mode.
- Avoid purple/blue SaaS gradients, decorative blobs, and one-note palettes.

Layout:

- First impression should be editorial and image-led.
- Operating diagrams belong after the promise, not inside every hero.
- Use asymmetry and clear hierarchy.
- Cards are for repeated items, framed tools, or modals. Do not put cards inside cards.
- Radius stays restrained: 8px or less unless the existing component requires otherwise.

Illustration and imagery:

- Use one crafted visual language: architectural linework, property evidence, blueprint marks, and graded photography.
- No raw AI-looking images, generic 3D renders, random icons, or mismatched illustration sets.
- Every visual must explain a business idea: routing, underwriting, development, buy box, lane choice, or credibility.

Motion:

- One signature interaction per page at most.
- Micro-interactions should be quiet and consistent.
- Respect reduced motion.
- Do not animate every block on scroll just because the framework makes it easy.

### Homepage arrival lock (supersedes July 28–29 hero guidance)

The approved homepage is the composition shown in the owner's reference frame
from the Pegasus design conversation. It is not open to reinterpretation.

- Canonical image: `client/public/images/hero/pegasus-v6-arrival.webp`
- Canonical dimensions: `1672 × 941`
- Canonical SHA-256: `a1de24393eda3bf7ca0ece805a96b71554b7006aee0fcede5d7c41554d8409a3`
- Git provenance: `cbdcb041feead3d4ba37b1cb107c548e12f21678`

Composition:

- Elevated East Bay/Bay panorama with a calm copy field on the left.
- Slim, close, full-height limestone colonnade held to the right edge.
- Columns, terrace, Bay, horizon, shadows, and perspective read as one photographed environment.
- The viewer feels inside the architecture. Do not introduce center columns, ornate/heavy Corinthian replacements, a detached terrace, a drafting table, blueprints, a different camera, or a generic property image.
- Keep one source image and one focal anchor across desktop, tablet, and mobile. Responsive layouts may crop from that source; they may not substitute a different architectural scene.

Theme behavior:

- Light and dark mode must use the same image bytes, camera, columns, terrace, horizon, crop bounds, and `object-position`.
- Light mode uses the warmer golden-hour grade from the owner's daylight reference.
- Dark mode uses the deeper blue-hour grade and restrained warm architectural light from the owner's night reference.
- Theme switching may change only filters, overlays, illumination, and normal UI color tokens. It must not reflow copy/navigation, jump the crop, or swap architecture.
- The visual regression gate must hold hero and content geometry within 2px at 1440, 1024, and 390 pixels wide.

Homepage content and navigation:

- Headline remains `Complex real estate,` / italic copper `made executable.`
- Eyebrow remains `Real estate operating company` / `Contra Costa & Alameda`.
- Hero actions remain, in order: `Bring an Opportunity`, `See How We Operate`, `Open Strategy Lab`.
- Desktop primary navigation remains, in order: `How We Operate`, `Property Owners`, `Deal Partners`, `Our Work`, `About`; `Bring an Opportunity` is the sole primary header CTA.
- Strategy Lab is a subordinate utility. MarketFlow stays out of the primary header and remains a private-pilot/footer path.
- The proof rail remains a separate four-item DOM section: Founder-led, Nelson Drive, East Bay, Strategy First, in that order.

## One Signature Moment

The site's signature visual system is the Pegasus deal map: an architectural, linework-based operating diagram that shows how a property moves from situation to lane.

It should appear where it explains the workflow. It should not crowd the homepage hero or make the first fold feel like a cockpit.

Strategy Lab is the exception: it should feel like a premium cockpit because the page itself is the tool.

## Banned Patterns

Do not add:

- Generic bento grids.
- Glassmorphism everywhere.
- Decorative gradient blobs or orbs.
- Random badge/card/icon stacks.
- Fake metrics, fake testimonials, fake logos, fake inventory, or fake status tracking.
- Public securities language or return promises.
- "AI-powered" as a public selling point unless an AI disclosure is required.
- "Human review" as front-facing product language. Use written Pegasus read, Property Read, or team review where appropriate.
- Repeated internal workflow sections that make Pegasus sound confused or over-explained.

## Page Jobs

Home:

- Editorial brand statement first.
- Operating map below the first fold.
- Route visitors into the right lane without making the homepage feel like a dashboard.

Strategy Lab:

- One unified deal cockpit.
- Capture property situation, assumptions, lane fit, risk, and next step.
- Directional only, never a valuation or offer.

Submit:

- Money door and intake path.
- Clear role, property, pressure, and goal capture.
- Premium form experience with confirmation, error, and handoff states.

Connect:

- QR/card landing page.
- Fast routing to submit, Peggy, Strategy Lab, Apollo, phone/email.
- DRE/KW trust signal must not be buried.

Work With Apollo:

- Clean KW / DRE separation.
- Seller and buyer representation paths.
- No confusion between Pegasus operating company and licensed brokerage activity.

MarketFlow:

- Private beta, reviewed access, buy boxes, investor/deal finder routing.
- Do not make it look like a public marketplace or public investment platform.

Development:

- Show execution discipline and property transformation.
- Use real property evidence where possible.

Capital:

- Private, by-review relationship path.
- No public offering, no guaranteed returns, no broad solicitation.

Peggy:

- Public name is Peggy.
- Introduce AI only where disclosure is required.
- Peggy is intake and orientation, not a decision-maker.

## Definition Of Done

No page is done until:

- Desktop, tablet, and mobile screenshots are checked.
- The page passes the squint test and swap test.
- Primary CTA is obvious.
- Copy sounds human and specific.
- No layout overlap or horizontal overflow.
- Focus states, hover states, loading, error, and empty states are handled where relevant.
- Compliance boundaries are visible near high-intent actions.
- TypeScript, focused tests, and production build pass.
