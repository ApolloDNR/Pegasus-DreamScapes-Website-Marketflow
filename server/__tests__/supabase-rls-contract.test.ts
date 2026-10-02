import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const schema = readFileSync(resolve(root, "supabase-schema.sql"), "utf8");
const externalIdMigration = readFileSync(
  resolve(root, "supabase-migration-external-id.sql"),
  "utf8",
);
const hardeningMigration = readFileSync(
  resolve(root, "supabase-rls-hardening.sql"),
  "utf8",
);

const policyBlock = (source: string, name: string) => {
  const start = source.indexOf(`CREATE POLICY "${name}"`);
  expect(start, `missing policy ${name}`).toBeGreaterThanOrEqual(0);
  return source.slice(start, source.indexOf(";", start) + 1);
};

describe("Supabase RLS launch contract", () => {
  it.each([
    ["Service role can insert profiles", "INSERT"],
    ["Service role can manage badges", "ALL"],
    ["Service role can manage reputation", "ALL"],
    ["Service role can manage seller leads", "ALL"],
    ["Service role can manage all deals", "ALL"],
    ["Service role can manage listings", "ALL"],
    ["Service role can manage JV requests", "ALL"],
    ["Service role can manage capital commitments", "ALL"],
    ["Service role can manage buyer offers", "ALL"],
    ["Service role can insert notifications", "INSERT"],
  ])("scopes %s to service_role", (name, command) => {
    for (const source of [schema, hardeningMigration]) {
      const block = policyBlock(source, name);
      expect(block).toContain(`FOR ${command}`);
      expect(block).toMatch(/TO service_role/);
    }
  });

  it("never treats a non-null external ID as row ownership", () => {
    expect(externalIdMigration).not.toMatch(
      /external_user_id\s+IS\s+NOT\s+NULL/i,
    );
    expect(hardeningMigration).not.toMatch(
      /external_user_id\s+IS\s+NOT\s+NULL/i,
    );
  });

  it("requires owner updates to preserve ownership", () => {
    const profilePolicy = policyBlock(
      hardeningMigration,
      "Users can update own profile",
    );
    expect(profilePolicy).toContain("TO authenticated");
    expect(profilePolicy).toContain("USING ((SELECT auth.uid()) = user_id)");
    expect(profilePolicy).toContain(
      "WITH CHECK ((SELECT auth.uid()) = user_id)",
    );
  });

  it("keeps unpublished deal and project writes private", () => {
    expect(
      policyBlock(hardeningMigration, "Wholesalers can insert own deals"),
    ).toMatch(/is_public = false[\s\S]*status = 'Under Review'/);
    expect(
      policyBlock(hardeningMigration, "Owners can insert projects"),
    ).toMatch(/is_public = false/);
    expect(
      policyBlock(hardeningMigration, "Public deals are viewable"),
    ).toMatch(/is_public = true[\s\S]*status IN \('Approved', 'Listed'\)/);
    expect(
      policyBlock(hardeningMigration, "Public projects are viewable"),
    ).toMatch(/is_public = true[\s\S]*status = 'ACTIVE'/);
  });

  it("keeps financial workflow mutations behind the application service", () => {
    for (const source of [schema, hardeningMigration]) {
      expect(source).toMatch(
        /REVOKE INSERT, UPDATE, DELETE[\s\S]*jv_requests[\s\S]*capital_commitments[\s\S]*buyer_offers[\s\S]*FROM anon, authenticated;/,
      );
      expect(source).toMatch(
        /REVOKE INSERT, UPDATE, DELETE[\s\S]*wholesale_deals[\s\S]*capital_projects[\s\S]*listings[\s\S]*FROM anon, authenticated;/,
      );
      expect(source).not.toContain('CREATE POLICY "Participants can update JV requests"');
      expect(source).not.toContain('CREATE POLICY "Investors can update own commitments"');
      expect(source).not.toContain('CREATE POLICY "Buyers can update own offers"');
    }
  });

  it("prevents PostgREST clients from bypassing public DTOs", () => {
    for (const source of [schema, hardeningMigration]) {
      expect(source).toMatch(
        /REVOKE SELECT[\s\S]*user_profiles[\s\S]*wholesale_deals[\s\S]*capital_projects[\s\S]*listings[\s\S]*FROM anon, authenticated;/,
      );
    }
  });

  it("contains executable post-migration safety assertions", () => {
    expect(hardeningMigration).toContain(
      "Unsafe PUBLIC service-role policy remains",
    );
    expect(hardeningMigration).toContain(
      "Unsafe external-user profile ownership policy remains",
    );
    expect(hardeningMigration.trimEnd().endsWith("COMMIT;")).toBe(true);
  });
});
