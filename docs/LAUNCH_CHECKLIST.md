# Launch Checklist

## Product Readiness

- Public story is simple: submit situation, Pegasus reviews, Pegasus structures, appropriate lane is proposed.
- `/bring-an-opportunity`, Strategy Lab, Peggy, `/connect`, and MarketFlow request access are the main conversion doors. `/submit` is a query-preserving legacy redirect.
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
- Reviewed launch migrations have been applied to a backed-up database; `/api/ready` verifies required launch columns plus production email/HQ configuration and returns 200.
- Live Supabase `pg_policies`, table/column grants, views, default privileges,
  and `SECURITY DEFINER` functions have been inventoried across every exposed
  Data API schema. Normal signed-in users cannot call privileged admin
  functions or read another user's raw profile. Any deliberately client-callable
  `SECURITY DEFINER` function has an explicit authorization check and a negative
  test using a normal signed-in token.
- Form payloads are validated and routed.
- `/api/leads` creates a database row, queues HTTPS HQ forwarding in `hq_outbox`, recovers stale forwarding leases after a restart, and sends the staff notification in the deployed environment.
- API and email fallback logs contain no contact, property, message-body, or outbox payload data.
- Public intake quotas, security headers, and unsupported-storage fail-closed behavior are verified.
- Peggy boundaries are enforced.
- No fixture content is presented as live inventory or real case status.

## Compliance

- No guaranteed offer, outcome, return, approval, or public securities-offering language.
- DRE/KW separation and Equal Housing language are present where needed.
- Qualified legal/compliance review is complete before public card/QR distribution.

## Deployment

- Render production deploys only from `main` after the `launch verification` check passes.
- The `onrender.com` release candidate passes the full launch smoke before any DNS change.
- Production domain, SSL, robots, sitemap, OG image, favicon, and canonical URLs are verified.
- Real production `/api/opportunities` smoke verifies the canonical intake, database, Pegasus HQ outbox, and staff/customer notifications. Use a marked test opportunity and delete/archive it after proof is captured.
