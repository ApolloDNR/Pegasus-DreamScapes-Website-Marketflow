import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  REQUIRED_ADMIN_AUDIT_LOG_COLUMNS,
  REQUIRED_HQ_OUTBOX_COLUMNS,
  REQUIRED_OPPORTUNITY_COLUMNS,
} from "../readiness";

const repoRoot = resolve(import.meta.dirname, "../..");

function migration(name: string): string {
  return readFileSync(resolve(repoRoot, "migrations", name), "utf8");
}

describe("launch database migration artifacts", () => {
  it("allows the consent audit migration to precede initial opportunity table creation", () => {
    const sql = migration("0003_opportunity_consent_audit.sql");

    expect(sql).toContain("ALTER TABLE IF EXISTS opportunities");
  });

  it("defines the durable HQ outbox and source back-reference columns", () => {
    const sql = migration("0004_hq_outbox_delivery.sql");

    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "hq_outbox"');
    expect(sql).toContain('"idempotency_key" varchar(64) NOT NULL UNIQUE');
    expect(sql).toContain('"payload" jsonb NOT NULL');
    expect(sql).toContain('ALTER TABLE IF EXISTS "leads"');
    expect(sql).toContain('ALTER TABLE IF EXISTS "peggy_conversations"');
    for (const column of REQUIRED_HQ_OUTBOX_COLUMNS) {
      expect(sql).toContain(`"${column}"`);
    }
  });

  it("defines the complete canonical public opportunity intake table", () => {
    const sql = migration("0005_public_opportunities.sql");

    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "opportunities"');
    expect(sql).toContain('"contact_name" varchar(255) NOT NULL');
    expect(sql).toContain('"consent_accepted" boolean NOT NULL');
    expect(sql).toContain('"consent_copy_version" varchar(80)');
    expect(sql).toContain('"IDX_opportunities_created_at"');
    for (const column of REQUIRED_OPPORTUNITY_COLUMNS) {
      expect(sql).toContain(`"${column}"`);
    }
  });

  it("defines the durable administrative review audit table", () => {
    const sql = migration("0006_admin_audit_log.sql");

    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "admin_audit_log"');
    expect(sql).toContain('"admin_user_id" varchar(255) NOT NULL');
    expect(sql).toContain('"action_type" varchar(100) NOT NULL');
    expect(sql).toContain('"IDX_admin_audit_log_created_at"');
    for (const column of REQUIRED_ADMIN_AUDIT_LOG_COLUMNS) {
      expect(sql).toContain(`"${column}"`);
    }
  });
});
