# Website → Pegasus HQ Integration Contract

Status: Draft for Apollo review  
Phase: 1 only, documentation/specification  
Repos: `Pegasus-DreamScapes-Website-Marketflow` → `Pegasus-HQ-Operating-system`

## 1. Purpose

The Pegasus Dreamscapes website is the public front door. Pegasus HQ is the system of record.

The website captures public submissions, role-mode intent, contact requests, property/deal details, and private-capital inquiries. Pegasus HQ owns canonical Submissions, Opportunities, lane assignment, War Rooms, RACI, money, documents, approvals, and audit history.

The current website-side lead routing/status pipeline is a temporary prototype/outbox. It must not become the final operating cockpit.

Final target flow:

```text
Website captures → local outbox copy → server-to-server POST to HQ → HQ owns canonical state
```

Allowed public success copy:

```text
Submission received. Pegasus will review within 24 business hours.
```

## 2. Submission Payload Schema

All submissions are sent server-to-server. The browser must never call HQ directly.

Top-level fields:

| Field | Type | Required | Source | Notes |
|---|---:|---:|---|---|
| `idempotency_key` | string | yes | website server | Stable across retries. |
| `source_system` | string | yes | website server | `pegasus_public_website`. |
| `source_route` | string | yes | website server | Example: `/sell`. |
| `source_url` | string | optional | website server | Full URL when available. |
| `submitted_at` | ISO datetime | yes | website server | Server timestamp preferred. |
| `role_mode_intent` | enum | yes | router/form | See below. |
| `submission_type` | enum | yes | router/form | See below. |
| `contact` | object | yes | form | Name/email/phone/channel. |
| `property` | object | conditional | form | Required for property/deal submissions. |
| `situation` | object | optional | form | Motivation, timeline, constraints. |
| `deal` | object | optional | form | Deal/JV submission details. |
| `capital_inquiry` | object | optional | form | Private capital/partner inquiry. |
| `consents` | object | yes | form/system | Privacy/contact/AI/recording as applicable. |
| `metadata` | object | optional | website server | UTM, referrer, user agent, IP hash. |

`role_mode_intent` values:

```text
strategy_review
seller_property
deal_source
jv_partnership
private_capital
development_adu
general_contact
just_exploring
```

`submission_type` values:

```text
property_submission
deal_submission
capital_inquiry
jv_inquiry
development_inquiry
contact_message
```

Minimum `contact` object:

```json
{
  "first_name": "Paolo",
  "last_name": "Duran",
  "full_name": "Paolo Duran",
  "email": "apollo@example.com",
  "phone": "925-948-6566",
  "preferred_channel": "email"
}
```

Minimum `property` object:

```json
{
  "address_line_1": "4369 Nelson Dr",
  "city": "Richmond",
  "state": "CA",
  "postal_code": "94803",
  "property_type": "single_family",
  "condition": "needs_rehab",
  "occupancy_status": "vacant",
  "notes": "Needs strategy review."
}
```

Minimum `situation` object:

```json
{
  "motivation": "Inherited property",
  "timeline": "30-60 days",
  "desired_outcome": "Explore sale or JV path",
  "known_constraints": ["repairs", "timeline"],
  "seller_authority": "owner"
}
```

Minimum `consents` object:

```json
{
  "privacy_acknowledged": true,
  "contact_consent": true,
  "ai_intake_disclosure_seen": false,
  "recording_consent": false
}
```

## 3. Authentication Model

Recommended v1: HMAC signed server-to-server request.

The website server signs outbound requests to HQ using a shared secret stored only in server-side environment variables. HQ credentials must never reach the frontend.

Recommended headers:

```http
X-Pegasus-Source: pegasus_public_website
X-Pegasus-Timestamp: <ISO datetime>
X-Pegasus-Idempotency-Key: <idempotency key>
X-Pegasus-Signature: sha256=<hmac>
Content-Type: application/json
```

Future options: mTLS, signed JWT, or OAuth/client credentials.

## 4. HQ Response Shape

Success:

```json
{
  "hq_submission_id": "sub_01HXABCDEFG",
  "received_at": "2026-05-07T04:31:00Z",
  "next_step": "triage_review",
  "message": "Submission received. Pegasus will review within 24 business hours."
}
```

Validation error:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Missing required field: contact.email",
    "fields": ["contact.email"]
  }
}
```

Duplicate idempotency key:

```json
{
  "hq_submission_id": "sub_01HXABCDEFG",
  "duplicate": true,
  "message": "Submission already received. Pegasus will review within 24 business hours."
}
```

## 5. Error Taxonomy and Retry Policy

| Error | Website action | Retry? |
|---|---|---:|
| `validation_error` | Store locally, flag for correction | no |
| `auth_error` | Store locally, alert admin | no |
| `network_error` | Store locally, retry | yes |
| `timeout` | Store locally, retry | yes |
| `rate_limited` | Retry after delay | yes |
| `server_error` | Retry with backoff | yes |
| `unknown_error` | Store, alert, dead-letter after threshold | limited |

Recommended backoff:

```text
immediate → 1 min → 5 min → 15 min → 1 hour → dead-letter + alert
```

## 6. Idempotency Rules

- Website generates one `idempotency_key` per user submission.
- Retries reuse the same key.
- HQ treats the key as unique per source system.
- Repeated keys return the original `hq_submission_id` instead of creating duplicates.
- Suggested format: `web_<yyyymmdd>_<uuid-or-ulid>`.

## 7. Ownership Matrix

| Field / Function | Website May Store | Public Display | HQ Canonical | Deprecate from Website After HQ Live |
|---|---:|---:|---:|---:|
| Contact data | yes | limited confirmation | yes | no |
| Property data | yes | no | yes | no |
| Source/UTM/referrer | yes | no | yes | no |
| Idempotency key | yes | no | yes | no |
| HQ submission ID | yes | admin only | yes | no |
| `outcome_lane` | prototype only | no | yes | yes |
| `status` | prototype only | no | yes | yes |
| `responded_at` | prototype only | no | yes | yes |
| `within_sla` | prototype only | no | yes | yes |
| Lane assignment logic | no final ownership | no | yes | yes |
| Triage decision | no final ownership | no | yes | yes |
| War Room | no | no | yes | n/a |
| RACI | no | no | yes | n/a |
| Money/capital data | no | no | yes | n/a |
| Audit trail | local forwarding log only | no | yes | n/a |

## 8. Website Display Rules vs HQ Truth

Allowed public success copy for all public intake forms:

```text
Submission received. Pegasus will review within 24 business hours.
```

Optional support copy:

```text
If there is a fit, Pegasus will follow up for the next step. If there is not a Pegasus path, we may route the opportunity to its next best lawful path.
```

Do not publicly show internal status, outcome lane, Strategist assignment, RACI owner, War Room link, acquisition likelihood, preliminary price/offer, or capital recommendation.

Future `/marketflow/admin/leads` should become a Forwarding Monitor, not the canonical triage cockpit. It should answer: did this submission reach HQ, when, what `hq_submission_id` came back, did forwarding fail, and is it dead-lettered?

## 9. Open Questions

1. What is the final HQ intake endpoint path? Proposed: `POST /api/intake/submissions`.
2. Who owns the HMAC secret and rotation process?
3. Should HQ expose a v2 read endpoint for public-safe status polling?
4. Who owns the dead-letter queue?
5. What alerting channel handles repeated forwarding failures?
6. Should all public forms forward to one endpoint or separate endpoints?
7. Where should photos/documents be stored?
8. What is the maximum payload size?
9. Should Peggy summaries be included in the first payload or appended later?
10. Should KW Listing Lane referrals be forwarded into HQ, KW-specific records, or both?

## 10. Proposed Phase 2 Environment Variables

Do not set until implementation is approved.

```text
HQ_INTEGRATION_ENABLED=false
HQ_INTAKE_URL=
HQ_HMAC_SECRET=
HQ_REQUEST_TIMEOUT_MS=8000
HQ_MAX_FORWARD_ATTEMPTS=5
```

These are server-only. None should use a `VITE_` prefix.

## 11. Phase 2 Preconditions

Before code is written:

1. Apollo approves this contract.
2. HQ endpoint path is confirmed.
3. HMAC model is accepted or replaced.
4. Additive website outbox schema changes are explicitly approved.
5. Dead-letter owner is named.
6. Production secret strategy is agreed.
7. Website success copy is locked.
8. HQ repo task is created for the receiving endpoint.

## 12. Architecture Lock

```text
Website captures.
Peggy assists.
Pegasus HQ owns truth.
MarketFlow distributes.
Humans approve.
Systems protect execution.
```
