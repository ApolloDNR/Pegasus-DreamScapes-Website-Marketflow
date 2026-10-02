import { existsSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

describe('PostgreSQL adapter transport policy', () => {
  it('requires certificate verification outside the disposable loopback harness', async () => {
    expect(existsSync('server/website/db.ts')).toBe(true);
    const { websitePoolConfig } = await import('../db');
    const config = websitePoolConfig('postgresql://synthetic:synthetic@db.example.test:5432/example?sslmode=require');
    expect(config.ssl).toEqual({ rejectUnauthorized: true });
    expect(config.connectionString).not.toContain('sslmode');
    expect(websitePoolConfig('postgresql://synthetic:synthetic@localhost:5432/other').ssl).toEqual({ rejectUnauthorized: true });
    expect(() => websitePoolConfig('postgresql://synthetic:synthetic@db.example.test/example?sslmode=disable')).toThrow(/TLS/);
    expect(() => websitePoolConfig('postgresql://synthetic:synthetic@db.example.test/example?ssl=no-verify')).toThrow(/TLS/);
    expect(() => websitePoolConfig('postgresql://synthetic:synthetic@localhost/example?host=remote.example.test')).toThrow(/parameter/);
  });

  it('can create and close an adapter without eagerly connecting', async () => {
    expect(existsSync('server/website/db.ts')).toBe(true);
    const { createWebsiteDb, websitePoolConfig } = await import('../db');
    const target = 'postgresql://website_test_admin:synthetic@127.0.0.1:55432/website_integration_test';
    expect(websitePoolConfig(target).ssl).toBe(false);
    const adapter = createWebsiteDb(target);
    expect(adapter.db.transaction).toBeTypeOf('function');
    await adapter.close();
  });
});

describe('isolated database harness guard', () => {
  it('rejects real targets, alternate hosts and driver query overrides', async () => {
    expect(existsSync('scripts/website-db-test-target.mjs')).toBe(true);
    const { assertWebsiteTestTarget } = await import('../../../scripts/website-db-test-target.mjs');
    const allowed = 'postgresql://website_test_admin:synthetic@127.0.0.1:55432/website_integration_test';
    expect(assertWebsiteTestTarget(allowed)).toBe(allowed);
    for (const target of [undefined, '', allowed.replace('127.0.0.1', 'db.example.test'), allowed.replace('website_integration_test', 'postgres'), allowed.replace('website_test_admin:', 'postgres:'), `${allowed}?host=db.example.test`, `${allowed}?options=-csearch_path=public`, `${allowed}#fragment`]) {
      expect(() => assertWebsiteTestTarget(target)).toThrow(/isolated/);
    }
  });
});


it('directs Vite away from application environment files', async () => {
  vi.stubEnv('WEBSITE_TEST_ENV_DIR', '/tmp/website-empty-env-fixture');
  try {
    const config = (await import('../../../vitest.website.config')).default;
    expect(config.envDir).toBe('/tmp/website-empty-env-fixture');
  } finally {
    vi.unstubAllEnvs();
  }
});
