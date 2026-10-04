# Visitor refinement — October 3, 2026

Approved bounded scope: clarify buyer/representation routes, improve buying-criteria effort and error recovery, clarify optional property details, and make phone page tours compact with origin-aware dismissal.

## Preserved contracts

- Six Home sections, approved brand, imagery, public audience doors and existing routes.
- Buyer criteria and opportunity schemas, existing endpoint adapters, idempotent retry behavior and real-receipt requirement.
- Separate representation/criteria/pilot requests, legal identity and service boundaries.
- Optional email preference defaults off. Consent and privacy copy remain intact.
- Touring and preparing a Peggy question do not send messages. Current-page context remains bounded and inspectable.
- No provider activation, deployment, merge, domain or account changes.

## Verification

Use Node 22.23.2. Run the normal typecheck, full unit suite and production build. The container's experimental HTTP-proxy warning may appear on subprocess stderr and cause the existing build-digest CLI stderr assertion to fail. `NODE_NO_WARNINGS=1` suppresses that runtime warning for this environment; do not modify that assertion or confuse this with product failures.

Run `node scripts/check-visitor-refinement.mjs` against a fresh production build with `CHROME_PATH` pointing to the installed supported Chrome for Testing binary and `VISITOR_QA_OUTPUT` set to an evidence directory outside the repository. The harness blocks external requests, serves only the local build, injects synthetic unavailable/success responses for buyer criteria, and records source SHA, viewport/theme coverage, screenshots, accessibility results and retry identity checks.

The targeted harness covers desktop, tablet, phone, narrow phone and landscape in both themes. It supplements, rather than replaces, the existing full rendered accessibility/route/journey gate in `scripts/check-visual-accessibility.mjs`. The existing owner-intake journey now opens the optional amount disclosure before filling it.

## Final acceptance

- Exact final-source typecheck, unit suite, build budget and serverless checks.
- Existing full route/accessibility/journey gate plus targeted visitor-refinement browser gate.
- Independent review of the final code and authentic rendered screenshots.
- Inspect long summaries, validation and recovery, optional-value retention, short viewport/cookie combinations, and page-origin versus chat-origin dismissal.
- Keep delivery claims bounded to local candidate verification. Live intake/email/AI, production publication and legal/broker approval are separate gates.
