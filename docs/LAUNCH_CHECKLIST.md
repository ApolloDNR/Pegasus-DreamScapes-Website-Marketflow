# Launch Checklist

## Product Readiness

- Public story is simple: submit situation, Pegasus reviews, Pegasus structures, appropriate lane is proposed.
- `/submit`, Strategy Lab, Peggy, `/connect`, and MarketFlow request access are the main conversion doors.
- Deal Blueprint is by-review only.
- MarketFlow is request-access/private beta only.

## Design Readiness

- Uses Pegasus dark navy/copper/cream direction without generic AI-looking decoration.
- Visuals explain property review, underwriting, participation lanes, development/optimization, or network routing.
- Mobile nav, footer, route CTAs, forms, and Peggy surfaces are usable and not crowded.

## Technical Readiness

- `npm run check` passes.
- `npm test` passes.
- `npm run build` passes.
- `npm run smoke:launch -- --example` passes.
- `npm run smoke:launch -- --base-url https://YOUR_DEPLOYED_SITE --post-test-lead` passes in staging or production.
- Route-by-route launch matrix passes.
- No blank shells, broken nav, or dead primary CTAs.

## Data, Privacy, And Security

- Production env vars verified without exposing values.
- Form payloads are validated and routed.
- `/api/leads` creates a database row, queues HQ forwarding in `hq_outbox`, and sends the staff notification in the deployed environment.
- Peggy boundaries are enforced.
- No fixture content is presented as live inventory or real case status.

## Compliance

- No guaranteed offer, outcome, return, approval, or public securities-offering language.
- DRE/KW separation and Equal Housing language are present where needed.
- Qualified legal/compliance review is complete before public card/QR distribution.

## Deployment

- Production domain, SSL, robots, sitemap, OG image, favicon, and canonical URLs are verified.
- Real production `/submit` smoke verifies database, Pegasus HQ intake/outbox, and staff notification. Use a marked test lead and delete/archive it after proof is captured.
