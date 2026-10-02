import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { sql } from "drizzle-orm";
import { createWebsiteDb, type WebsiteDb } from "../db";
import { resolveWebsiteStaff } from "../identity";
// The runner and every suite independently reject any non-disposable target.
import { assertWebsiteTestTarget } from "../../../scripts/website-db-test-target.mjs";

const subject = "11000000-0000-4000-8000-000000000001";
const otherSubject = "11000000-0000-4000-8000-000000000002";
const unmappedSubject = "11000000-0000-4000-8000-000000000003";
const account = "22000000-0000-4000-8000-000000000001";
const otherAccount = "22000000-0000-4000-8000-000000000002";
const org = "33000000-0000-4000-8000-000000000001";
const otherOrg = "33000000-0000-4000-8000-000000000002";

describe.skipIf(process.env.WEBSITE_DB_TESTS !== "1")("website shared identity PostgreSQL proof", () => {
  let db: WebsiteDb;
  let close: () => Promise<void>;

  beforeAll(async () => {
    const target = process.env.WEBSITE_TEST_DATABASE_URL;
    assertWebsiteTestTarget(target);
    ({ db, close } = createWebsiteDb(target!));
    // Schema-only fixtures mirror the reviewed HQ identity mapping. No real
    // accounts, tokens, email recipients or production roles are used.
    await db.execute(sql`
      create table if not exists public.accounts (
        id uuid primary key,
        auth_user_id uuid not null unique,
        email text not null unique,
        full_name text not null,
        suspended_at timestamptz,
        deleted_at timestamptz
      );
      create table if not exists public.memberships (
        id uuid primary key,
        account_id uuid not null references public.accounts(id),
        org_id uuid not null,
        role text not null,
        status text not null,
        unique (account_id, org_id)
      );
      do $$ begin
        if not exists (select 1 from pg_roles where rolname = 'website_identity_reader') then
          create role website_identity_reader nologin;
        end if;
      end $$;
      grant usage on schema public to website_identity_reader;
      grant select (id, auth_user_id, suspended_at, deleted_at) on public.accounts to website_identity_reader;
      grant select (account_id, org_id, status, role) on public.memberships to website_identity_reader;
      alter table public.accounts enable row level security;
      alter table public.memberships enable row level security;
      drop policy if exists website_identity_test_read on public.accounts;
      create policy website_identity_test_read on public.accounts for select to website_identity_reader using (true);
      drop policy if exists website_identity_test_read on public.memberships;
      create policy website_identity_test_read on public.memberships for select to website_identity_reader using (true);
    `);
    await db.execute(sql`
      insert into public.accounts (id, auth_user_id, email, full_name) values
        (${account}, ${subject}, 'identity-a@example.test', 'Same Display Name'),
        (${otherAccount}, ${otherSubject}, 'identity-b@example.test', 'Same Display Name')
      on conflict (id) do nothing
    `);
    await db.execute(sql`
      insert into public.memberships (id, account_id, org_id, role, status) values
        ('44000000-0000-4000-8000-000000000001', ${account}, ${org}, 'owner', 'active'),
        ('44000000-0000-4000-8000-000000000002', ${otherAccount}, ${otherOrg}, 'owner', 'active')
      on conflict (id) do nothing
    `);
  });

  beforeEach(async () => {
    await db.execute(sql`update public.memberships set role = 'owner', status = 'active' where account_id = ${account}`);
    await db.execute(sql`update public.accounts set suspended_at = null, deleted_at = null where id = ${account}`);
  });

  afterAll(async () => {
    if (!db) return;
    try {
      await db.execute(sql`delete from public.memberships where account_id in (${account}, ${otherAccount})`);
      await db.execute(sql`delete from public.accounts where id in (${account}, ${otherAccount})`);
      await db.execute(sql`
        drop policy if exists website_identity_test_read on public.accounts;
        drop policy if exists website_identity_test_read on public.memberships;
        revoke select (id, auth_user_id, suspended_at, deleted_at) on public.accounts from website_identity_reader;
        revoke select (account_id, org_id, status, role) on public.memberships from website_identity_reader;
        revoke usage on schema public from website_identity_reader;
        drop role website_identity_reader;
      `);
    } finally {
      await close();
    }
  });

  async function restrictedLookup(authSubject: string, orgId: string) {
    return db.transaction(async (transaction) => {
      await transaction.execute(sql`set local role website_identity_reader`);
      return resolveWebsiteStaff(authSubject, orgId, transaction as unknown as WebsiteDb);
    });
  }

  it.each(["owner", "admin"])("resolves active %s through shared account and minimally granted reader", async (role) => {
    await db.execute(sql`update public.memberships set role = ${role} where account_id = ${account}`);
    expect(await restrictedLookup(subject, org)).toEqual({ accountId: account, orgId: org, role });
  });

  it("denies_other_org_same_email even though the shared account keeps the same name and email across organizations", async () => {
    expect(await restrictedLookup(subject, otherOrg)).toBeNull();
    expect(await restrictedLookup(otherSubject, org)).toBeNull();
    expect(await restrictedLookup(otherSubject, otherOrg)).toEqual({ accountId: otherAccount, orgId: otherOrg, role: "owner" });
  });

  it.each(["pending", "suspended", "removed"])("denies_inactive_membership: %s", async (status) => {
    await db.execute(sql`update public.memberships set status = ${status} where account_id = ${account}`);
    expect(await restrictedLookup(subject, org)).toBeNull();
  });

  it("denies suspended accounts even with an active owner membership", async () => {
    await db.execute(sql`update public.accounts set suspended_at = now() where id = ${account}`);
    expect(await restrictedLookup(subject, org)).toBeNull();
  });

  it("denies deleted accounts even with an active owner membership", async () => {
    await db.execute(sql`update public.accounts set deleted_at = now() where id = ${account}`);
    expect(await restrictedLookup(subject, org)).toBeNull();
  });

  it.each(["manager", "operator", "viewer", "investor", "contractor", "external_guest"])("does not grant implicit staff reads to %s", async (role) => {
    await db.execute(sql`update public.memberships set role = ${role} where account_id = ${account}`);
    expect(await restrictedLookup(subject, org)).toBeNull();
  });

  it("denies_unmapped_subject without provisioning any identity or membership", async () => {
    const before = await db.execute(sql`select (select count(*) from public.accounts) as accounts, (select count(*) from public.memberships) as memberships`);
    expect(await restrictedLookup(unmappedSubject, org)).toBeNull();
    const after = await db.execute(sql`select (select count(*) from public.accounts) as accounts, (select count(*) from public.memberships) as memberships`);
    expect(after.rows).toEqual(before.rows);
  });

  it("cannot resolve identities without the required directory SELECT grants", async () => {
    await db.execute(sql`revoke select (id, auth_user_id) on public.accounts from website_identity_reader`);
    try {
      await expect(restrictedLookup(subject, org)).rejects.toThrow();
    } finally {
      await db.execute(sql`grant select (id, auth_user_id) on public.accounts to website_identity_reader`);
    }
  });

  it("does not need contact-detail reads or membership mutation permissions", async () => {
    await expect(db.transaction(async (transaction) => {
      await transaction.execute(sql`set local role website_identity_reader`);
      await transaction.execute(sql`select email from public.accounts`);
    })).rejects.toThrow();
    await expect(db.transaction(async (transaction) => {
      await transaction.execute(sql`set local role website_identity_reader`);
      await transaction.execute(sql`update public.memberships set role = 'admin' where account_id = ${account}`);
    })).rejects.toThrow();
  });
});
