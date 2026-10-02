import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { checkReadiness, probeWebsiteSchema } from '../../readiness';
import { assertWebsiteTestTarget } from '../../../scripts/website-db-test-target.mjs';

const tables = ['opportunities', 'leads', 'hq_outbox', 'admin_audit_log', 'peggy_conversations',
  'peggy_messages', 'intake_requests', 'delivery_jobs', 'notification_outbox'];

describe.skipIf(process.env.WEBSITE_DB_TESTS !== '1')('website readiness on isolated PostgreSQL', () => {
  let pool: pg.Pool;
  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: assertWebsiteTestTarget(process.env.WEBSITE_TEST_DATABASE_URL), ssl: false });
    // Disposable test role has only the default catalog reads, no website data
    // grants, ownership, superuser status or BYPASSRLS. The app fixture grants
    // only catalog-checkable prerequisites; RLS-policy sufficiency remains a
    // separate activation check, not something readiness can prove without writes.
    await pool.query('CREATE ROLE website_readiness_catalog_reader NOLOGIN');
    await pool.query(`CREATE ROLE website_readiness_app NOLOGIN;
      GRANT USAGE ON SCHEMA website TO website_readiness_app;
      GRANT SELECT, INSERT ON website.opportunities, website.leads, website.admin_audit_log,
        website.intake_requests, website.delivery_jobs, website.notification_outbox,
        website.peggy_conversations, website.peggy_messages TO website_readiness_app;
      GRANT UPDATE ON website.peggy_conversations, website.peggy_messages TO website_readiness_app;
      GRANT USAGE ON SEQUENCE website.leads_id_seq, website.admin_audit_log_id_seq,
        website.peggy_conversations_id_seq, website.peggy_messages_id_seq TO website_readiness_app;`);
    vi.stubEnv('APP_ENV', 'preview');
    vi.stubEnv('WEBSITE_ORG_ID', '10000000-0000-4000-8000-000000000001');
  });
  afterAll(async () => {
    vi.unstubAllEnvs();
    if (!pool) return;
    try { await pool.query('DROP OWNED BY website_readiness_app; DROP ROLE website_readiness_app; DROP ROLE website_readiness_catalog_reader'); }
    finally { await pool.end(); }
  });

  async function readiness(setup?: (client: pg.PoolClient) => Promise<void>, catalogOnly = false) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      if (setup) await setup(client);
      else await client.query('SET TRANSACTION READ ONLY');
      await client.query(catalogOnly ? 'SET LOCAL ROLE website_readiness_catalog_reader' : 'SET LOCAL ROLE website_readiness_app');
      const result = await probeWebsiteSchema(drizzle(client));
      return await checkReadiness({ probe: async () => result });
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  }

  it('checks migrated storage and runtime grants inside a read-only transaction', async () => {
    expect(await readiness()).toBe(true);
  });

  it('rejects a catalog-only role without runtime grants', async () => {
    expect(await readiness(undefined, true)).toBe(false);
    const privileges = await pool.query(`SELECT has_table_privilege('website_readiness_catalog_reader', 'website.opportunities', 'SELECT') AS can_read,
      has_table_privilege('website_readiness_catalog_reader', 'website.opportunities', 'INSERT') AS can_write`);
    expect(privileges.rows).toEqual([{ can_read: false, can_write: false }]);
  });

  it('rejects missing schema USAGE', async () => {
    expect(await readiness(async client => {
      await client.query('REVOKE USAGE ON SCHEMA website FROM website_readiness_app');
    })).toBe(false);
  });

  it.each(tables.filter(table => table !== 'hq_outbox'))('rejects missing INSERT on website.%s', async table => {
    expect(await readiness(async client => {
      await client.query(`REVOKE INSERT ON website.${table} FROM website_readiness_app`);
    })).toBe(false);
  });

  it.each(tables.filter(table => table !== 'hq_outbox'))('rejects missing SELECT on website.%s', async table => {
    expect(await readiness(async client => {
      await client.query(`REVOKE SELECT ON website.${table} FROM website_readiness_app`);
    })).toBe(false);
  });

  it.each(['peggy_conversations', 'peggy_messages'])('rejects missing UPDATE on website.%s', async table => {
    expect(await readiness(async client => {
      await client.query(`REVOKE UPDATE ON website.${table} FROM website_readiness_app`);
    })).toBe(false);
  });

  it.each(['leads', 'admin_audit_log', 'peggy_conversations', 'peggy_messages'])('rejects missing serial sequence access for %s', async table => {
    expect(await readiness(async client => {
      await client.query(`REVOKE USAGE ON SEQUENCE website.${table}_id_seq FROM website_readiness_app`);
    })).toBe(false);
  });

  it.each([
    ['delivery_jobs', 'PEGASUS_ENABLE_HQ_DELIVERY_WORKER'],
    ['notification_outbox', 'PEGASUS_ENABLE_NOTIFICATION_WORKER'],
  ])('requires queue UPDATE for %s only when the worker is enabled', async (table, flag) => {
    vi.stubEnv(flag, 'true');
    try {
      expect(await readiness()).toBe(false);
      expect(await readiness(async client => {
        await client.query(`GRANT UPDATE ON website.${table} TO website_readiness_app`);
      })).toBe(true);
    } finally { vi.stubEnv(flag, undefined); }
  });

  it.each(tables)('rejects missing website.%s', async table => {
    expect(await readiness(async client => {
      await client.query(`ALTER TABLE website.${table} RENAME TO missing_readiness_table`);
    })).toBe(false);
  });

  it.each(tables)('rejects missing organization column in website.%s', async table => {
    expect(await readiness(async client => {
      await client.query(`ALTER TABLE website.${table} RENAME COLUMN org_id TO missing_org_id`);
    })).toBe(false);
  });

  it('does not accept public lookalikes in place of the website schema', async () => {
    expect(await readiness(async client => {
      for (const table of tables) await client.query(`CREATE TABLE public.${table} (LIKE website.${table})`);
      await client.query('ALTER SCHEMA website RENAME TO hidden_website');
    })).toBe(false);
  });

  it('does not mistake a same-name view for a migrated table', async () => {
    expect(await readiness(async client => {
      await client.query('ALTER TABLE website.peggy_messages RENAME TO hidden_peggy_messages');
      await client.query('CREATE VIEW website.peggy_messages AS SELECT * FROM website.hidden_peggy_messages');
    })).toBe(false);
  });
});
