import { sql } from "drizzle-orm";
import type { Request } from "express";
import type { WebsiteDb } from "./db";

export type WebsiteStaffIdentity = {
  accountId: string;
  orgId: string;
  role: "owner" | "admin";
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isWebsiteIdentityUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

/** Only Supabase auth.getUser-verified identity may own website records. */
export function getVerifiedWebsiteAuthSubject(req: Request): string | null {
  const subject = req.supabaseUser?.id;
  return typeof subject === "string" && subject.trim() ? subject.trim() : null;
}

/**
 * Read the existing HQ identity directory; never provision users or memberships.
 * Mapping reviewed against HQ 20260408014516_phase1_02_public_identity.sql.
 * Database access errors intentionally propagate so callers fail closed.
 */
export async function resolveWebsiteStaff(
  authSubject: string,
  orgId: string,
  db: WebsiteDb,
): Promise<WebsiteStaffIdentity | null> {
  if (!isWebsiteIdentityUuid(authSubject) || !isWebsiteIdentityUuid(orgId)) return null;

  const { rows } = await db.execute<WebsiteStaffIdentity>(sql`
    select a.id as "accountId", m.org_id as "orgId", m.role
    from public.accounts a
    join public.memberships m on m.account_id = a.id
    where a.auth_user_id = ${authSubject}::uuid
      and m.org_id = ${orgId}::uuid
      and a.suspended_at is null
      and a.deleted_at is null
      and m.status = 'active'
      and m.role in ('owner', 'admin')
    limit 2
  `);

  // Fail closed if the directory ever returns an ambiguous mapping.
  if (rows.length !== 1) return null;
  const row = rows[0];
  if (row.role !== "owner" && row.role !== "admin") return null;
  return { accountId: row.accountId, orgId: row.orgId, role: row.role };
}
