import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import { PgDialect } from "drizzle-orm/pg-core";

const auth = vi.hoisted(() => ({ getUser: vi.fn() }));
vi.mock("../../lib/supabase", () => ({
  supabase: { auth },
  supabaseAdmin: { auth },
  isSupabaseConfigured: true,
  isSupabaseAdminConfigured: true,
}));

import { extractSupabaseUser, supabaseAuthMiddleware } from "../../supabaseAuth";
import { getVerifiedWebsiteAuthSubject, resolveWebsiteStaff } from "../identity";
import { createWebsiteStaffGuard } from "../staff-guard";
import type { WebsiteDb } from "../db";

const subject = "10000000-0000-4000-8000-000000000001";
const account = "20000000-0000-4000-8000-000000000001";
const org = "30000000-0000-4000-8000-000000000001";

function request(overrides: Record<string, unknown> = {}): Request {
  return { headers: {}, ...overrides } as unknown as Request;
}

function response() {
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    status(status: number) { this.statusCode = status; return this; },
    json(body: unknown) { this.body = body; return this; },
    set(name: string, value: string) { this.headers[name] = value; return this; },
  };
  return res;
}

function database(rows: unknown[] = []) {
  const execute = vi.fn().mockResolvedValue({ rows });
  return { db: { execute } as unknown as WebsiteDb, execute };
}

describe("verified website identity", () => {
  beforeEach(() => auth.getUser.mockReset());

  it("rejects_editable_metadata_role and metadata organization claims", async () => {
    auth.getUser.mockResolvedValue({ data: { user: {
      id: subject,
      email: "same-name@example.test",
      user_metadata: { sub: "forged", role: "owner", primary_role: "admin", org_id: org, is_admin: true },
    } }, error: null });
    const verified = await extractSupabaseUser(request({ headers: { authorization: "Bearer synthetic-token" } }));
    expect(verified).toEqual({
      id: subject,
      email: "same-name@example.test",
      claims: { sub: subject, email: "same-name@example.test" },
    });
    const { db } = database();
    const req = request({ supabaseUser: verified });
    const res = response();
    let privateRecordRead = false;
    await createWebsiteStaffGuard({ db, getOrgId: () => org })(req, res as unknown as Response, () => { privateRecordRead = true; });
    expect(res.statusCode).toBe(403);
    expect(privateRecordRead).toBe(false);
    expect(req.websiteStaff).toBeUndefined();
  });

  it("does not authenticate rejected provider tokens", async () => {
    auth.getUser.mockResolvedValue({ data: { user: { id: subject } }, error: { message: "expired" } });
    expect(await extractSupabaseUser(request({ headers: { authorization: "Bearer rejected-token" } }))).toBeNull();
  });

  it("guest_intake_still_works without a provider request", async () => {
    const req = request();
    const res = response();
    let guestIntakeReached = false;
    await supabaseAuthMiddleware(req, res as unknown as Response, () => { guestIntakeReached = true; });
    expect(guestIntakeReached).toBe(true);
    expect(req.supabaseUser).toBeUndefined();
    expect(getVerifiedWebsiteAuthSubject(req)).toBeNull();
    expect(auth.getUser).not.toHaveBeenCalled();
  });

  it("uses only verified Supabase ownership despite conflicting legacy claims", () => {
    expect(getVerifiedWebsiteAuthSubject(request({ user: { claims: { sub: "legacy" } } }))).toBeNull();
    expect(getVerifiedWebsiteAuthSubject(request({
      user: { claims: { sub: "legacy" } },
      supabaseUser: { id: subject },
    }))).toBe(subject);
  });
});

describe("website staff boundary", () => {
  it("returns 401 before any query for an unverified legacy or metadata identity", async () => {
    const { db, execute } = database();
    const req = request({ user: { claims: { sub: subject, role: "admin" } } });
    const res = response();
    const next = vi.fn();
    await createWebsiteStaffGuard({ db, getOrgId: () => org })(req, res as unknown as Response, next);
    expect(res.statusCode).toBe(401);
    expect(execute).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("resolves an active staff identity with parameterized subject and server organization", async () => {
    const { db, execute } = database([{ accountId: account, orgId: org, role: "owner" }]);
    const req = request({ supabaseUser: { id: subject }, body: { orgId: "attacker" }, query: { orgId: "attacker" } });
    const res = response();
    const next = vi.fn();
    await createWebsiteStaffGuard({ db, getOrgId: () => org })(req, res as unknown as Response, next);
    expect(req.websiteStaff).toEqual({ accountId: account, orgId: org, role: "owner" });
    expect(next).toHaveBeenCalledOnce();
    expect(res.headers["Cache-Control"]).toBe("no-store");
    const compiled = new PgDialect().sqlToQuery(execute.mock.calls[0][0]);
    expect(compiled.params).toEqual([subject, org]);
    expect(compiled.sql).toContain("public.accounts");
    expect(compiled.sql).toContain("public.memberships");
    expect(compiled.sql).not.toContain(subject);
    expect(compiled.sql).not.toContain("attacker");
  });

  it.each([undefined, "", "not-a-uuid"])("fails closed when server organization is %s", async (configuredOrg) => {
    const { db, execute } = database();
    const req = request({ supabaseUser: { id: subject } });
    const res = response();
    const next = vi.fn();
    await createWebsiteStaffGuard({ db, getOrgId: () => configuredOrg })(req, res as unknown as Response, next);
    expect(res.statusCode).toBe(503);
    expect(execute).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("denies ambiguous mappings rather than choosing an account", async () => {
    const { db } = database([
      { accountId: account, orgId: org, role: "owner" },
      { accountId: "20000000-0000-4000-8000-000000000002", orgId: org, role: "admin" },
    ]);
    expect(await resolveWebsiteStaff(subject, org, db)).toBeNull();
  });

  it("does not leak database errors or continue to private reads on lookup failure", async () => {
    const { db, execute } = database();
    execute.mockRejectedValue(new Error("private database details"));
    const req = request({ supabaseUser: { id: subject } });
    const res = response();
    const next = vi.fn();
    await createWebsiteStaffGuard({ db, getOrgId: () => org })(req, res as unknown as Response, next);
    expect(res.statusCode).toBe(503);
    expect(JSON.stringify(res.body)).not.toContain("private database details");
    expect(next).not.toHaveBeenCalled();
  });
});
