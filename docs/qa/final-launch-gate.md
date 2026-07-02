# Final Launch Gate

Last updated: 2026-06-22

This is the launch gate for Pegasus Dreamscapes public website work. It is stricter than "the page looks better." The site is ready only when the priority journeys work, the visual system is consistent, and the public claims are safe.

## Launch Philosophy

Soft launch first. Do not broad-launch from a fresh AI design pass.

The first launch should go to a small trusted group with specific tasks:

- Submit a property.
- Use Strategy Lab.
- Find how to work with Apollo for listing/buyer representation.
- Find how a deal finder or wholesaler should bring a lead.
- Request MarketFlow access.
- Find contact and disclosure information.

Watch where they hesitate. Fix repeated problems before expanding.

## P0 Blockers

These block launch:

- Submit path does not create the expected intake record or notification.
- Contact/Connect CTAs are broken.
- Strategy Lab crashes or produces misleading valuation/offer language.
- Peggy appears as a decision-maker instead of intake/orientation.
- Public pages contain guaranteed offer, guaranteed return, securities offering, or unreviewed investment language.
- KW/DRE separation is missing where representation is discussed.
- Mobile layout has horizontal overflow on key routes.
- Any major route is blank, 404, or linked from navigation while unfinished.
- Secrets are committed to Git.
- Production environment variables are missing.
- No rollback path exists.

## P1 Trust And Conversion Risks

These should be fixed before public distribution of cards/QR:

- Homepage first fold feels like a dashboard instead of an editorial brand statement.
- Submit form feels generic or confusing.
- Strategy Lab feels like two disconnected tools instead of one cockpit.
- Light mode and dark mode are visually indistinct.
- Peggy is labeled "Peggy AI" in public navigation, buttons, or CTAs.
- Logo is not the approved Pegasus-over-house mark.
- Repetitive copy makes Pegasus sound unsure of what it does.
- Important compliance copy is too hidden or low contrast.
- Navigation is unclear on mobile.
- Cookie banner blocks important mobile CTAs.
- Pages use raw AI-looking visuals or mismatched illustration styles.

## P2 Polish Risks

These are visible quality issues:

- Inconsistent spacing rhythm between sections.
- Buttons with different heights, radii, or label treatments.
- Repeated card styles where a sequence or editorial block would be clearer.
- Overuse of copper accents.
- Hover states that only change color.
- Weak focus states.
- Default loading spinners or unstyled empty/error states.
- Body copy line lengths too wide or too narrow.

## Visual QA Checklist

For every public launch route:

- 1440px desktop screenshot reviewed.
- 768px tablet screenshot reviewed.
- 390px mobile screenshot reviewed.
- No horizontal overflow.
- No text overlap.
- Primary CTA visible and clear.
- Keyboard focus visible.
- Body text contrast passes.
- The page passes the squint test.
- The page passes the swap test.
- Visuals have a business purpose.

## Technical QA Checklist

Run before launch:

```powershell
& "C:\Users\Apoll\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" node_modules\typescript\bin\tsc --noEmit
& "C:\Users\Apoll\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" node_modules\vite\bin\vite.js build
npm run smoke:launch -- --example
npm run smoke:launch -- --base-url https://YOUR_DEPLOYED_SITE --post-test-lead
```

Also verify:

- Relevant Vitest files pass.
- No browser-console errors on major routes.
- No server errors during key journeys.
- 404 page is intentional and branded.
- Sitemap, robots, title tags, meta descriptions, favicon, and social preview image are present.
- Public route links work.
- Forms validate required fields.
- Form failure states are readable.
- Staff notification path is tested.
- Production `/api/leads` smoke creates the local lead row, queues/forwards the HQ outbox payload, and sends the staff email notification.
- Production logging is available.

## Security And Privacy Gate

Before launch:

- No secrets in repo.
- Production secrets live only in host environment.
- Public forms have validation.
- Admin routes are not publicly accessible.
- MarketFlow/private surfaces do not leak private records.
- Privacy, terms, disclosures, and call recording language are reachable.
- OWASP Top 10 style review has been performed for public forms and auth surfaces.

## Compliance Gate

Before public distribution:

- No public securities offering language.
- No guaranteed return language.
- No guaranteed offer language.
- Equal Housing posture present.
- DRE/KW separation present where representation is discussed.
- Peggy disclaimers present where Peggy is introduced as AI.
- Strategy Lab states outputs are directional, not valuation/appraisal/advice/offer.
- Capital page is private/by-review and does not solicit a public investment.
- MarketFlow is private/reviewed access, not an open public marketplace.

## Soft Launch Procedure

1. Deploy to staging.
2. Run route-by-route QA.
3. Run one real Submit smoke test with a test lead.
4. Verify record creation and staff notification.
5. Invite five trusted testers.
6. Give them tasks, not instructions.
7. Fix repeated confusion.
8. Deploy production.
9. Monitor errors and form completion for several days.
10. Only then print or broadly distribute QR/card traffic.
