import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getTableConfig } from 'drizzle-orm/pg-core';
import { opportunities, leads, hqOutbox, peggyConversations, peggyMessages, adminAuditLog, users, insertLeadSchema, insertOpportunitySchema } from '../../../shared/schema';

// These assertions fail if the public intake closure drifts back to public or
// if internal organization/identity fields become visitor-writable.
describe('website persistence boundary', () => {
  it('isolates_website_tables', () => {
    for (const table of [opportunities, leads, hqOutbox, peggyConversations, peggyMessages, adminAuditLog]) {
      expect(getTableConfig(table).schema).toBe('website');
    }
    expect(opportunities.id.getSQLType()).toBe('uuid');
    expect(leads.id.getSQLType()).toBe('serial');
  });

  it('correlates Peggy messages with their organization as well as conversation', () => {
    expect(getTableConfig(peggyMessages).foreignKeys).toHaveLength(2);
  });

  it('preserves_public_schema', () => {
    expect(getTableConfig(users).schema).toBeUndefined();
  });

  it('keeps internal identity and organization out of public insert schemas', () => {
    expect(insertLeadSchema.shape).not.toHaveProperty('orgId');
    expect(insertLeadSchema.shape).not.toHaveProperty('authSubject');
    expect(insertOpportunitySchema.shape).not.toHaveProperty('orgId');
    expect(insertOpportunitySchema.shape).not.toHaveProperty('authSubject');
  });
});


describe('website delivery storage contract', () => {
  it('defines tenant-correlated intake and delivery tables', async () => {
    expect(existsSync('shared/website-schema.ts')).toBe(true);
    const schema = await import('../../../shared/website-schema');
    for (const table of [schema.intakeRequests, schema.websiteDeliveryJobs, schema.notificationOutbox]) {
      const config = getTableConfig(table);
      expect(config.schema).toBe('website');
      expect(config.checks.length).toBeGreaterThan(0);
      expect(config.foreignKeys.length).toBeGreaterThan(0);
    }
    expect(existsSync('migrations/website/0001_website_foundation.sql')).toBe(true);
  });
});
