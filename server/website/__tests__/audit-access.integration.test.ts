import express from "express";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { WebsiteDb } from "../db";
import { assertWebsiteTestTarget } from "../../../scripts/website-db-test-target.mjs";
import { createAdminAuditWriter, createWholesaleReviewAuditEvent } from "../../admin-audit-routes";

// Only the external legacy session boundary is replaced. Real registerRoutes,
// audit handlers, website membership guard and storage queries run below.
vi.mock("../../replitAuth", () => ({
  setupAuth: async () => undefined,
  isAuthenticated: (_req: unknown, res: any) => res.status(401).json({ message: "Unauthorized" }),
}));

const org = "a7000000-0000-4000-8000-000000000001";
const otherOrg = "a7000000-0000-4000-8000-000000000002";
const subject = "a7100000-0000-4000-8000-000000000001";
const otherSubject = "a7100000-0000-4000-8000-000000000002";
const unmappedSubject = "a7100000-0000-4000-8000-000000000003";
const account = "a7200000-0000-4000-8000-000000000001";
const otherAccount = "a7200000-0000-4000-8000-000000000002";

// Removing any organization predicate or restoring legacy email/role grants
// must expose synthetic rows and fail these HTTP and PostgreSQL assertions.
describe.skipIf(process.env.WEBSITE_DB_TESTS !== "1")("website audit access through actual route wiring", () => {
  let db: WebsiteDb;
  let close: () => Promise<void>;
  let storage: typeof import("../../storage")["storage"];
  let server: Server;
  let baseUrl: string;
  let ownId: number;
  let otherId: number;
  let ownReviewId: number;

  beforeAll(async () => {
    vi.stubEnv("DATABASE_URL", assertWebsiteTestTarget(process.env.WEBSITE_TEST_DATABASE_URL));
    vi.stubEnv("WEBSITE_ORG_ID", org);
    ({ db, closeDatabase: close } = await import("../../db"));
    ({ storage } = await import("../../storage"));
    await db.execute(sql`
      create table if not exists public.accounts (
        id uuid primary key, auth_user_id uuid not null unique,
        email text not null unique, full_name text not null,
        suspended_at timestamptz, deleted_at timestamptz
      );
      create table if not exists public.memberships (
        id uuid primary key, account_id uuid not null references public.accounts(id),
        org_id uuid not null, role text not null, status text not null,
        unique (account_id, org_id)
      )
    `);
    await db.execute(sql`
      insert into public.accounts (id, auth_user_id, email, full_name) values
        (${account}, ${subject}, 'audit-member@example.test', 'Synthetic member'),
        (${otherAccount}, ${otherSubject}, 'audit-other@example.test', 'Synthetic other member');
    `);
    await db.execute(sql`
      insert into public.memberships (id, account_id, org_id, role, status) values
        ('a7300000-0000-4000-8000-000000000001', ${account}, ${org}, 'owner', 'active'),
        ('a7300000-0000-4000-8000-000000000002', ${otherAccount}, ${otherOrg}, 'owner', 'active')
    `);
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
      // Synthetic auth.getUser output; email is deliberately the old allowlist
      // value so a legacy authorization fallback becomes an observable leak.
      const verified = req.get("x-test-verified-subject");
      const legacy = req.get("x-test-legacy-subject");
      const email = req.get("x-test-email") ?? "admin@pegasusdreamscapes.com";
      if (verified) req.supabaseUser = { id: verified, email, claims: { sub: verified, email } };
      if (legacy || verified) (req as any).user = { claims: { sub: legacy ?? verified, email, role: "admin" } };
      next();
    });
    server = createServer(app);
    const { registerRoutes } = await import("../../routes");
    await registerRoutes(server, app);
    server.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  beforeEach(async () => {
    vi.stubEnv("WEBSITE_ORG_ID", org);
    await db.execute(sql`delete from website.admin_audit_log where description like 'audit-access-proof:%'`);
    await db.execute(sql`update public.accounts set suspended_at = null, deleted_at = null where id = ${account}`);
    await db.execute(sql`update public.memberships set role = 'owner', status = 'active' where account_id = ${account}`);
    const rows = await db.execute<{ id: number }>(sql`
      insert into website.admin_audit_log (org_id, auth_subject, admin_user_id, action_type, description, new_value) values
        (${org}::uuid, ${subject}::uuid, null, 'website_inquiry_recorded', 'audit-access-proof:own-consent', '{"contact":true}'),
        (${otherOrg}::uuid, ${otherSubject}::uuid, null, 'website_inquiry_recorded', 'audit-access-proof:other-consent', '{"contact":false}'),
        (${org}::uuid, null, 'legacy-reviewer', 'deal_approved', 'audit-access-proof:own-review', null),
        (${otherOrg}::uuid, null, 'legacy-reviewer', 'deal_approved', 'audit-access-proof:other-review', null),
        (null, null, 'legacy-reviewer', 'deal_approved', 'audit-access-proof:unscoped-review', null)
      returning id
    `);
    [ownId, otherId, ownReviewId] = rows.rows.map((row) => row.id);
  });

  afterAll(async () => {
    if (server?.listening) await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    if (db) {
      await db.execute(sql`delete from website.admin_audit_log where description like 'audit-access-proof:%'`);
      await db.execute(sql`delete from public.memberships where account_id in (${account}, ${otherAccount})`);
      await db.execute(sql`delete from public.accounts where id in (${account}, ${otherAccount})`);
      await close();
    }
    vi.unstubAllEnvs();
  });

  const read = (path: string, headers: Record<string, string> = { "x-test-verified-subject": subject }) => fetch(baseUrl + path, { headers });

  it("scopes ID, list and count storage reads to the configured organization", async () => {
    expect(await storage.getAuditLogById(otherId)).toBeUndefined();
    expect(await storage.getAuditLogById(ownId)).toMatchObject({ orgId: org, authSubject: subject });
    expect((await storage.getAuditLogs()).map((row) => row.id).sort()).toEqual([ownId, ownReviewId].sort());
    expect(await storage.getAuditLogCount()).toBe(2);
    expect((await storage.getAuditLogs({ actionTypes: ["deal_approved"], adminUserId: "legacy-reviewer" })).map((row) => row.id)).toEqual([ownReviewId]);
    expect(await storage.getAuditLogCount({ actionType: "deal_approved", adminUserId: "legacy-reviewer" })).toBe(1);
  });

  it("does not let an explicit caller organization override server configuration", async () => {
    await expect((storage.getAuditLogById as any)(otherId, otherOrg)).rejects.toThrow();
    await expect(storage.getAuditLogs({ orgId: otherOrg } as any)).rejects.toThrow();
    await expect(storage.getAuditLogCount({ orgId: otherOrg } as any)).rejects.toThrow();
  });

  it.each([undefined, "not-an-org"])("fails closed on missing or invalid organization: %s", async (value) => {
    vi.stubEnv("WEBSITE_ORG_ID", value);
    await expect(storage.getAuditLogById(ownId)).rejects.toThrow();
    await expect(storage.getAuditLogs()).rejects.toThrow();
    await expect(storage.getAuditLogCount()).rejects.toThrow();
    expect((await read(`/api/audit-logs/${ownId}`)).status).toBe(503);
  });

  it("denies other-organization and unmapped allowlisted identities through actual HTTP routes", async () => {
    for (const rejectedSubject of [otherSubject, unmappedSubject]) {
      for (const path of ["/api/audit-logs", `/api/audit-logs/${ownId}`, `/api/audit-logs/${otherId}`]) {
        const result = await read(path, { "x-test-verified-subject": rejectedSubject });
        expect(result.status).toBe(403);
        expect(JSON.stringify(await result.json())).not.toContain("audit-access-proof");
      }
    }
  });

  it("denies legacy-only identity and ignores a stale legacy principal when verifying current membership", async () => {
    expect((await read(`/api/audit-logs/${ownId}`, { "x-test-legacy-subject": subject })).status).toBe(401);
    expect((await read(`/api/audit-logs/${ownId}`, { "x-test-verified-subject": otherSubject, "x-test-legacy-subject": subject })).status).toBe(403);
    expect((await read(`/api/audit-logs/${ownId}`, { "x-test-verified-subject": subject, "x-test-legacy-subject": otherSubject })).status).toBe(200);
    expect((await read(`/api/audit-logs/${ownId}`, {})).status).toBe(401);
  });

  it.each(["owner", "admin"])("permits active %s without a legacy allowlist and keeps cross-org rows hidden", async (role) => {
    await db.execute(sql`update public.memberships set role = ${role} where account_id = ${account}`);
    const headers = { "x-test-verified-subject": subject, "x-test-email": "ordinary@example.test" };
    const detail = await read(`/api/audit-logs/${ownId}`, headers);
    expect(detail.status).toBe(200);
    expect(await detail.json()).toMatchObject({ id: ownId, orgId: org });
    expect(detail.headers.get("cache-control")).toBe("no-store");
    const list = await read(`/api/audit-logs?orgId=${otherOrg}`, headers);
    expect(list.status).toBe(200);
    expect(await list.json()).toMatchObject({ total: 1, logs: [{ id: ownReviewId, orgId: org }] });
    expect((await read(`/api/audit-logs/${otherId}?orgId=${otherOrg}`, headers)).status).toBe(404);
  });

  it.each(["viewer", "suspended", "removed", "account-suspended", "account-deleted"])("rejects %s despite legacy allowlisted email", async (state) => {
    if (state === "viewer") await db.execute(sql`update public.memberships set role = 'viewer' where account_id = ${account}`);
    else if (state === "account-suspended") await db.execute(sql`update public.accounts set suspended_at = now() where id = ${account}`);
    else if (state === "account-deleted") await db.execute(sql`update public.accounts set deleted_at = now() where id = ${account}`);
    else await db.execute(sql`update public.memberships set status = ${state} where account_id = ${account}`);
    expect((await read(`/api/audit-logs/${ownId}`)).status).toBe(403);
    expect((await read("/api/audit-logs")).status).toBe(403);
  });

  it("preserves verified legacy review writer integrity while stamping the server organization", async () => {
    const writer = createAdminAuditWriter({
      getAuthUserId: (req) => (req as any).user?.claims?.sub ?? null,
      createAuditLog: (entry) => storage.createAuditLog(entry),
    });
    const request = { user: { claims: { sub: "legacy-reviewer", email: "reviewer@example.test" } }, headers: {}, ip: "127.0.0.1" } as any;
    const event = createWholesaleReviewAuditEvent({ id: "synthetic-deal", status: "under_review" }, { id: "synthetic-deal", status: "listed" });
    event.description = "audit-access-proof:legacy-written-review";
    const row = await writer(request, event);
    expect(row).toMatchObject({ orgId: org, authSubject: null, adminUserId: "legacy-reviewer", previousValue: '{"status":"under_review"}', newValue: '{"status":"listed"}' });
    expect(await storage.getAuditLogById(row.id)).toMatchObject({ id: row.id, orgId: org });
    await expect(writer({ ...request, supabaseUser: { id: otherSubject } }, event)).rejects.toThrow("Verified administrative audit actor");
  });
});
