# Visual Implementation Handoff

Last updated: 2026-06-22

Use this when handing the site to Replit, Claude Design, Figma, Framer, or another visual implementation tool.

## Instruction To The Visual Contractor

You are implementing the approved Pegasus Dreamscapes website direction. This is not a new design exploration.

Preserve:

- All existing routes.
- All application logic.
- All integrations.
- All form behavior.
- All compliance boundaries.
- The supplied public copy direction.
- The Pegasus Dreamscapes brand position.

Do not:

- Invent new sections.
- Rewrite the business model.
- Add fake metrics, fake proof, fake inventory, or fake testimonials.
- Replace the logo.
- Turn the site into a generic SaaS interface.
- Add public investment, securities, return, or guaranteed-offer language.
- Use "AI" as a public badge except where Peggy must be disclosed as AI.

## Design Objective

Create one cohesive, production-ready, premium website with excellent hierarchy, typography, spacing, responsive behavior, interaction detail, and restraint.

The site should feel:

- Premium.
- Editorial.
- Architectural.
- Founder-led.
- Disciplined.
- Safe for professionals to take seriously.

It should not feel:

- AI-generated.
- Generic SaaS.
- Cash-buyer funnel.
- Over-explained.
- Decorative for decoration's sake.

## Required Visual Direction

Use:

- Dark navy / midnight as the primary digital atmosphere.
- Copper as rare emphasis.
- Cream as warmth and editorial contrast.
- Playfair Display headlines.
- Inter body/UI.
- Cinzel label accents only.
- Architectural linework, blueprint marks, property evidence, and carefully graded real estate photography.
- Restrained controls, hairline borders, disciplined spacing, and clear hierarchy.

Avoid:

- Excessive gradients.
- Glass effects everywhere.
- Bento-card sprawl.
- Decorative blobs, orbs, or glow clouds.
- Random icons.
- Oversized headings without hierarchy.
- Raw AI-looking illustration.
- Excessive animation.

## Page-By-Page Work Order

Work one page at a time. Do not touch unrelated pages in the same pass.

Recommended order:

1. Home.
2. Submit.
3. Strategy Lab.
4. Connect.
5. Work With Apollo.
6. MarketFlow.
7. Development.
8. Capital.
9. Peggy.
10. Legal/disclosures/footer/nav polish.

For each page:

1. Screenshot the current desktop, tablet, and mobile state.
2. Identify hierarchy, spacing, typography, and responsive problems.
3. Apply only the visual changes needed for that page.
4. Preserve existing route and form behavior.
5. Screenshot desktop, tablet, and mobile after changes.
6. Compare against the design lock.
7. Fix overlap, overflow, weak contrast, and inconsistent component states.
8. Run the required checks.

## Required States

Every interactive surface must include:

- Default.
- Hover.
- Focus-visible.
- Active/current.
- Loading where an async action exists.
- Empty state where data can be absent.
- Error state where an action can fail.
- Success/confirmation state where an action completes.

No raw browser defaults on important public controls.

## Visual QA

Run these checks before calling a page finished:

- 1440px desktop screenshot.
- 768px tablet screenshot.
- 390px mobile screenshot.
- No horizontal scroll at 390px.
- No text overlaps.
- No clipped CTA text.
- No contrast failures on body text.
- Navigation usable by keyboard.
- Focus states visible.
- `prefers-reduced-motion` respected.
- Cookie banner does not block the primary mobile CTA.

## Anti-AI Audit

Fail the page if any of these are true:

- The section could belong to any company by swapping the logo.
- The page is mostly repeated card grids.
- The hero is a dashboard when it should be editorial.
- The page uses more decoration than business explanation.
- Type hierarchy disappears when squinting.
- Icons, illustrations, or images feel mismatched.
- Copy sounds like generated SaaS filler.

## Implementation Verification

After each completed page, run:

```powershell
& "C:\Users\Apoll\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" node_modules\typescript\bin\tsc --noEmit
```

Before final handoff, run:

```powershell
& "C:\Users\Apoll\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" node_modules\vite\bin\vite.js build
```

If tests are affected, run the focused Vitest files for the changed route.

## Final Output Required

Return:

- Changed pages.
- Changed files.
- Desktop/tablet/mobile screenshots.
- Checks passed.
- Remaining risks.
- Any intentional deviation from the design lock.
