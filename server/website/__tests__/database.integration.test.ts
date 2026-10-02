import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getTableConfig } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import * as schema from '../../../shared/website-schema';
import { createWebsiteDb } from '../db';
import { assertWebsiteTestTarget } from '../../../scripts/website-db-test-target.mjs';

const tables = ['admin_audit_log', 'delivery_jobs', 'hq_outbox', 'intake_requests', 'leads', 'notification_outbox', 'opportunities', 'peggy_conversations', 'peggy_messages'];
const migration = readFileSync(new URL('../../../migrations/website/0001_website_foundation.sql', import.meta.url), 'utf8');

describe.skipIf(process.env.WEBSITE_DB_TESTS !== '1')('real PostgreSQL website boundary', () => {
  let pool: pg.Pool;
  let adapter: ReturnType<typeof createWebsiteDb>;
  const org = randomUUID();
  const otherOrg = randomUUID();
  const key = randomUUID();
  let opportunityId: string;
  let otherOpportunityId: string;
  let leadId: number;

  beforeAll(async () => {
    const target = assertWebsiteTestTarget(process.env.WEBSITE_TEST_DATABASE_URL);
    pool = new pg.Pool({ connectionString: target, ssl: false });
    adapter = createWebsiteDb(target);
    const first = await pool.query(`INSERT INTO website.opportunities(org_id,visitor_type,contact_name,email) VALUES ($1,'other','Synthetic Test','synthetic@example.test') RETURNING id`, [org]);
    opportunityId = first.rows[0].id;
    otherOpportunityId = (await pool.query(`INSERT INTO website.opportunities(org_id,visitor_type,contact_name,email) VALUES ($1,'other','Synthetic Other','other@example.test') RETURNING id`, [otherOrg])).rows[0].id;
    leadId = (await pool.query(`INSERT INTO website.leads(org_id,lead_type,source,first_name,email) VALUES ($1,'contact','contact_page','Synthetic','synthetic@example.test') RETURNING id`, [org])).rows[0].id;
    await pool.query(`INSERT INTO website.intake_requests(org_id,idempotency_key,kind,payload_hash,opportunity_id) VALUES ($1,$2,'opportunity',$3,$4)`, [org,key,'a'.repeat(64),opportunityId]);
  });

  afterAll(async () => {
    if (pool) {
      await pool.query('DELETE FROM website.notification_outbox WHERE org_id = ANY($1::uuid[])', [[org, otherOrg]]);
      await pool.query('DELETE FROM website.delivery_jobs WHERE org_id = ANY($1::uuid[])', [[org, otherOrg]]);
      await pool.query('DELETE FROM website.intake_requests WHERE org_id = ANY($1::uuid[])', [[org, otherOrg]]);
      await pool.query('DELETE FROM website.opportunities WHERE org_id = ANY($1::uuid[])', [[org, otherOrg]]);
      await pool.query('DELETE FROM website.leads WHERE org_id = ANY($1::uuid[])', [[org, otherOrg]]);
      await pool.end();
    }
    await adapter?.close();
  });

  it('isolates_website_tables', async () => {
    const actual = await pool.query(`SELECT tablename FROM pg_tables WHERE schemaname='website' ORDER BY tablename`);
    expect(actual.rows.map((row) => row.tablename)).toEqual(tables);
    expect((await pool.query(`SELECT to_regclass('website.users') AS users`)).rows[0].users).toBeNull();
    const types = await pool.query(`SELECT table_name, data_type FROM information_schema.columns WHERE table_schema='website' AND column_name='id' AND table_name IN ('opportunities','leads') ORDER BY table_name`);
    expect(types.rows).toEqual([{ table_name: 'leads', data_type: 'integer' }, { table_name: 'opportunities', data_type: 'uuid' }]);
    const result = await adapter.db.select({ id: schema.opportunities.id }).from(schema.opportunities).where(sql`${schema.opportunities.id} = ${opportunityId}`);
    expect(result).toEqual([{ id: opportunityId }]);
  });

  it('preserves_public_schema', async () => {
    for (const namespace of ['public', 'hq', 'marketflow']) {
      const result = await pool.query(`SELECT marker FROM ${namespace}.website_baseline WHERE id=1`);
      expect(result.rows).toEqual([{ marker: `synthetic-${namespace}-untouched` }]);
    }
    const actual = await pool.query(`SELECT n.nspname, c.relname, c.relacl::text FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relname='website_baseline' ORDER BY n.nspname`);
    expect(actual.rows).toEqual(JSON.parse(process.env.WEBSITE_TEST_BASELINE_CATALOG!));
  });

  it('migration_is_repeatable', async () => {
    const before = await pool.query('SELECT * FROM website.opportunities WHERE id=$1', [opportunityId]);
    await pool.query(migration);
    await pool.query(migration);
    expect((await pool.query('SELECT * FROM website.opportunities WHERE id=$1', [opportunityId])).rows).toEqual(before.rows);
    const constraints = await pool.query(`SELECT conrelid::regclass::text, conname, count(*)::int FROM pg_constraint WHERE connamespace='website'::regnamespace GROUP BY 1,2 HAVING count(*) > 1`);
    expect(constraints.rows).toEqual([]);
  });

  it('browser_roles_cannot_read_private_tables', async () => {
    const rls = await pool.query(`SELECT c.relname, c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='website' AND c.relkind='r'`);
    expect(rls.rows).toHaveLength(tables.length);
    expect(rls.rows.every((row) => row.relrowsecurity)).toBe(true);
    for (const role of ['anon', 'authenticated']) {
      for (const table of tables) {
        expect((await pool.query(`SELECT has_table_privilege($1,$2,'SELECT') AS allowed`, [role, `website.${table}`])).rows[0].allowed).toBe(false);
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          await client.query(`SET LOCAL ROLE ${role}`);
          await expect(client.query(`SELECT * FROM website.${table}`)).rejects.toMatchObject({ code: '42501' });
        } finally {
          await client.query('ROLLBACK');
          client.release();
        }
      }
      // Even accidental later SELECT/USAGE grants expose zero rows because
      // browser roles have no RLS policy. These grants roll back immediately.
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(`GRANT USAGE ON SCHEMA website TO ${role}`);
        await client.query(`GRANT SELECT ON website.opportunities TO ${role}`);
        await client.query(`SET LOCAL ROLE ${role}`);
        expect((await client.query('SELECT * FROM website.opportunities')).rows).toEqual([]);
      } finally {
        await client.query('ROLLBACK');
        client.release();
      }
    }
  });

  it('matches every ORM column and confines foreign key closure to website', async () => {
    for (const table of [schema.opportunities, schema.leads, schema.hqOutbox, schema.peggyConversations, schema.peggyMessages, schema.adminAuditLog, schema.intakeRequests, schema.websiteDeliveryJobs, schema.notificationOutbox]) {
      const config = getTableConfig(table);
      const result = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='website' AND table_name=$1 ORDER BY column_name`, [config.name]);
      expect(result.rows.map((row) => row.column_name)).toEqual(config.columns.map((column) => column.name).sort());
    }
    const externalKeys = await pool.query(`SELECT conname FROM pg_constraint WHERE connamespace='website'::regnamespace AND contype='f' AND confrelid NOT IN (SELECT oid FROM pg_class WHERE relnamespace='website'::regnamespace)`);
    expect(externalKeys.rows).toEqual([]);
    const unzoned = await pool.query(`SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='website' AND data_type='timestamp without time zone'`);
    expect(unzoned.rows).toEqual([]);
  });

  it('rejects mismatched receipt types and cross-organization references', async () => {
    await expect(pool.query(`INSERT INTO website.intake_requests(org_id,idempotency_key,kind,payload_hash,lead_id) VALUES ($1,$2,'opportunity',$3,$4)`, [org,randomUUID(),'b'.repeat(64),leadId])).rejects.toMatchObject({ code: '23514' });
    await expect(pool.query(`INSERT INTO website.intake_requests(org_id,idempotency_key,kind,payload_hash,opportunity_id) VALUES ($1,$2,'opportunity',$3,$4)`, [org,randomUUID(),'b'.repeat(64),otherOpportunityId])).rejects.toMatchObject({ code: '23503' });
    // Key reuse across organizations remains valid and independent.
    await pool.query(`INSERT INTO website.intake_requests(org_id,idempotency_key,kind,payload_hash,opportunity_id) VALUES ($1,$2,'opportunity',$3,$4)`, [otherOrg,key,'b'.repeat(64),otherOpportunityId]);
    await expect(pool.query(`INSERT INTO website.delivery_jobs(org_id,idempotency_key,record_type,opportunity_id,payload) VALUES ($1,$2,'opportunity',$3,'{}')`, [org,key,otherOpportunityId])).rejects.toMatchObject({ code: '23503' });
    await expect(pool.query(`INSERT INTO website.notification_outbox(org_id,idempotency_key,record_type,lead_id,purpose,payload) VALUES ($1,$2,'lead',$3,'staff','{}')`, [org,key,leadId])).rejects.toMatchObject({ code: '23503' });
  });

  it('rejects messages attributed to a different conversation organization', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const conversation = (await client.query(`INSERT INTO website.peggy_conversations(org_id,session_id) VALUES ($1,'synthetic-session') RETURNING id`, [org])).rows[0];
      await expect(client.query(`INSERT INTO website.peggy_messages(org_id,conversation_id,role,content) VALUES ($1,$2,'user','synthetic message')`, [otherOrg,conversation.id])).rejects.toMatchObject({ code: '23503' });
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });

  it('allows one notification per record and purpose', async () => {
    const insert = `INSERT INTO website.notification_outbox(org_id,idempotency_key,record_type,opportunity_id,purpose,payload) VALUES ($1,$2,'opportunity',$3,$4,'{}')`;
    await pool.query(insert, [org,key,opportunityId,'staff']);
    await pool.query(insert, [org,key,opportunityId,'receipt']);
    await expect(pool.query(insert, [org,key,opportunityId,'staff'])).rejects.toMatchObject({ code: '23505' });
    await expect(pool.query(insert, [org,key,opportunityId,'marketing'])).rejects.toMatchObject({ code: '23514' });
  });
});
