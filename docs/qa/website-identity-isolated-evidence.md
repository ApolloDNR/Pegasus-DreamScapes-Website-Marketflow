# Website shared identity: isolated evidence

Date: October 2, 2026. Scope: implementation-plan task A3 identity resolver and staff guard. Route wiring and the final combined-branch acceptance gate are tracked separately.

## Authorization contract

- Identity originates only from Supabase `auth.getUser(token)` verification; editable `user_metadata` does not enter authorization claims.
- Staff resolution reads the reviewed HQ mapping in `20260408014516_phase1_02_public_identity.sql`: `public.accounts.auth_user_id` → `accounts.id` → `public.memberships.account_id`.
- The membership must match the server's `WEBSITE_ORG_ID`, have `status = 'active'`, and have role `owner` or `admin`. There is no email/name matching, email allowlist, automatic account creation, or membership provisioning.
- Missing verified identity receives 401, insufficient membership receives 403, and unavailable server organization/directory access receives 503. No private record handler runs after denial. Staff responses are marked `Cache-Control: no-store`.
- Optional guest intake remains permitted. `getVerifiedWebsiteAuthSubject` supplies nullable ownership without trusting legacy/session/body identity fields.

## Ruling

Active membership alone must not revive a suspended or deleted account. The reviewed HQ account lifecycle columns `suspended_at` and `deleted_at` must both be null. This tightens the approved shared-identity boundary without adding roles or grants. Two PostgreSQL regression tests first returned an unauthorized active-owner identity, then passed after these predicates were added. If HQ changes its lifecycle model, reconcile the authoritative mapping before changing these checks.

## Required directory read surface

The isolated `website_identity_reader` role succeeds with column-only SELECT on:

- `public.accounts`: `id`, `auth_user_id`, `suspended_at`, `deleted_at`
- `public.memberships`: `account_id`, `org_id`, `status`, `role`

The test fixture has explicit SELECT-only RLS policies for that disposable role. Reads of account email and membership updates are denied. These fixtures demonstrate the required server-side lookup permissions; they do not grant access in a real Supabase project. Any real role, grant, policy, secret, or deployment change remains approval-gated.

## Verification

- Identity and Supabase provider-boundary unit tests: 12 passed
- Real isolated PostgreSQL 17.6 identity tests: 17 passed, including both permitted roles, all lower roles, inactive memberships, suspended/deleted accounts, organization separation, unmapped subjects, no provisioning, and minimal read privileges
- Combined isolated runner: 29 passed across storage-boundary (7), atomic-intake (5), and identity (17) suites; migrations applied repeatedly and all three suites ran serially against the same disposable database
- Existing Peggy access and route-auth tests together with identity/auth unit tests: 214 passed
- Provider token verification is mocked in unit tests. The disposable PostgreSQL service uses local trust authentication; it does not prove real Supabase authentication/credential configuration
- Normal `npm test` skips PostgreSQL integration suites unless the isolated runner explicitly enables them. `npm run test:integration:website` requires the guarded loopback target and applies the website migration before running all integration suites

## Route integration checklist

1. Populate `req.supabaseUser` using the existing verified Supabase middleware.
2. Construct `createWebsiteStaffGuard({ db: websiteDb })` and use it for website record list/detail/update routes in place of legacy staff/email checks.
3. Constrain every private record query/update by `req.websiteStaff.orgId`, including ID lookups. The guard does not make an unscoped query safe.
4. Keep public submission routes unguarded; derive their optional `authSubject` with `getVerifiedWebsiteAuthSubject(req)`.
5. Peggy must use the same verified subject and bind access/ownership to persisted `authSubject`, retaining guest conversation-token checks.
6. After all implementation slices are integrated, rerun typecheck, the full ordinary suite, isolated database suites, build, and the independent review. This note is not evidence of launch, live data migration, or provider delivery.
