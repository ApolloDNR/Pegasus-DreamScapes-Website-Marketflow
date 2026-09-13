# Pegasus HQ intake contract readiness

Checked September 13, 2026. This is a source-backed integration finding, not a
successful live delivery test. No HQ configuration, database, or receiver code
was changed, and no intake POST was sent.

## Receiver verified

Vercel deployment `dpl_CgrYhVMyJsXjq9ZhejZTWptSo9x5` identifies source commit
`027095b73fa76867d673b1d2cc5ce3509b073d2b` on
`agent/public-intake-hardening` in `ApolloDNR/Pegasus-HQ-Operating-system`.
This is the source behind the connected
`pegasus-hq-operating-system-3g7b13hab-apollosynd-8973s-projects.vercel.app`
preview. It does not establish which HQ endpoint the owner intends to use in
production.

The earlier read-only GET to that preview's `/api/public/intake` returned 503
`not_configured`, advertising request contract version 2. Immutable source:

- [Request schema](https://github.com/ApolloDNR/Pegasus-HQ-Operating-system/blob/027095b73fa76867d673b1d2cc5ce3509b073d2b/src/lib/public-intake/schema.ts)
- [Receiver and readiness checks](https://github.com/ApolloDNR/Pegasus-HQ-Operating-system/blob/027095b73fa76867d673b1d2cc5ce3509b073d2b/src/app/api/public/intake/route.ts)
- [Accepted receipt](https://github.com/ApolloDNR/Pegasus-HQ-Operating-system/blob/027095b73fa76867d673b1d2cc5ce3509b073d2b/src/lib/public-intake/response.ts)
- [Readiness configuration](https://github.com/ApolloDNR/Pegasus-HQ-Operating-system/blob/027095b73fa76867d673b1d2cc5ce3509b073d2b/src/lib/public-intake/readiness.ts)

Do not replace this evidence with the HQ default branch's older flat request
schema. The deployed public route exclusively parses its strict v2 envelope.
It does not negotiate or fall back to the authenticated operator's wider
attribution schema.

## Website repair completed

The outbox previously marked every HTTP 2xx response `forwarded`, even empty
JSON or an HTML page. It now requires a traceable receipt before writing
`forwardedAt`, updating the originating record, or counting a drain as delivered.

Supported receipts:

- Legacy: a nonempty `hq_submission_id` fitting the existing 64-character
  database field, with no control characters or explicit rejection.
- Documented public intake: `ok: true`, a valid `reference`, a nonempty `message`,
  and an absolute `statusUrl` on the configured receiver's origin under
  `/status/<token>`. URL credentials, query strings, and fragments are rejected.

The documented `reference` is the HQ **Seed reference**, not its private
Submission UUID. The adapter normalizes it into the existing
`hq_submission_id` response and `hqSubmissionId` storage fields as the traceable
receipt identifier. The capability-bearing status URL is neither followed nor
saved nor returned from the website's admin retry endpoint. Receiver message
copy is not used to promise a public review or response.

Malformed successful responses use the existing bounded retries and then remain
pending. All attempts reuse the original outbox payload and idempotency key.
The existing terminal handling for HTTP 4xx responses is unchanged. No
additional per-delivery discovery request was introduced.

## Remaining blockers before enabling forwarding

| Deployed HQ v2 requirement | Website state and unresolved decision |
| --- | --- |
| Strict root fields `contractVersion: 2`, UUID `idempotencyKey`, `submission` | Website still sends its established flat payload. A request adapter has deliberately not been added without resolving the semantic mismatches below. |
| `submission.propertyAddress`: trimmed string, 6 to 240 characters | Website accepts legitimate vendor, buyer, capital, and general inquiries without an address. Define a receiver for these inquiries; do not invent a property address. |
| `submission.consentContact` and `submission.consentCcpaAcknowledged`: both must be true | The current opportunity checkbox authorizes follow-up about the submission. `server/opportunityRoutes.ts` deliberately records CCPA acknowledgement as false because that checkbox does not separately capture it. Resolve the intended consent contract and copy before mapping; do not manufacture acknowledgement. |
| `submission.contactName`: 2 to 160 characters; valid email or phone required | Verify each website capture against the intended receiver, including queued historical records. Do not synthesize missing contact information. |
| `submission.outreachReason`: 10 to 2000 characters | Website sends an inquiry-category code and carries detailed context in `extra`. Define an approved context projection, including the user's situation and purpose. |
| Optional `submission.notes` up to 2000 characters and `submission.referrer` up to 500 | Website metadata includes opportunity correlation, routing context, consent audit, and surface-specific input. Decide what HQ must retain and how, without silently dropping or truncating important context. |
| No `sourceChannel` or `extra` accepted in the strict submission | HQ fixes public attribution to `public_website_form`. The website's internal attribution cannot be injected into the authenticated operator contract. |
| Receiver readiness and matching database contract | The inspected preview was unavailable. HQ code checks configuration, capability secrets, and database contract version 3. A READY hosting deployment and website `/api/ready` are insufficient evidence of remote intake readiness. |

After selecting and configuring the intended production receiver and resolving
these mappings, run the authorized marked intake smoke. Confirm the website
record, outbox state, traceable HQ receipt, preserved context and consent, and
notification delivery in that exact environment. Keep forwarding and public
launch claims unverified until those checks succeed.

## Focused verification

Node 22.23.2, `vitest run server/__tests__/hq-client.test.ts`: 29 tests passed.
The regression tests first failed on the original implementation's false
delivery claims. Coverage includes malformed/empty/rejected receipts, valid
legacy and documented receipts, capability non-retention, unchanged idempotency
keys, source back-references, terminal 4xx, retryable 5xx, and stale outbox
recovery. These are local mock tests, not evidence of live HQ delivery.
