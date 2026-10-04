import { readFile, readdir, mkdtemp, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import pg from 'pg';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { assertWebsiteTestTarget } from './website-db-test-target.mjs';

async function main() {
  // Fail closed before constructing a pool, and never load .env files.
  const target = assertWebsiteTestTarget(process.env.WEBSITE_TEST_DATABASE_URL);
  const tests = process.argv.slice(2);
  if (tests.some((path) => !/^server\/website\/__tests__\/[^/]+\.integration\.test\.ts$/.test(path))) {
    throw new Error('Isolated harness accepts only explicit website integration test paths');
  }
  const pool = new pg.Pool({ connectionString: target, ssl: false, connectionTimeoutMillis: 5_000 });
  let baseline;
  try {
    const identity = (await pool.query(`SELECT current_database() AS database, current_user AS username, current_setting('server_version_num')::int AS version`)).rows[0];
    if (identity.database !== 'website_integration_test' || identity.username !== 'website_test_admin' || identity.version < 170000 || identity.version >= 180000) {
      throw new Error('Isolated website harness requires PostgreSQL 17 and its named disposable database/admin');
    }
    console.log(`Isolated PostgreSQL ${identity.version} verified; only synthetic fixtures and loopback connections are used`);
    // Only disposable synthetic fixtures. Production grants are not provisioned.
    await pool.query(`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN; END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
    END $$;`);
    for (const schema of ['public', 'hq', 'marketflow']) {
      await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}; CREATE TABLE IF NOT EXISTS ${schema}.website_baseline(id integer PRIMARY KEY, marker text NOT NULL);`);
      await pool.query(`INSERT INTO ${schema}.website_baseline(id,marker) VALUES (1,$1) ON CONFLICT (id) DO NOTHING`, [`synthetic-${schema}-untouched`]);
    }
    baseline = (await pool.query(`SELECT n.nspname, c.relname, c.relacl::text FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE c.relname='website_baseline' ORDER BY n.nspname`)).rows;
    const migrations = (await readdir(new URL('../migrations/website/', import.meta.url))).filter((name) => name.endsWith('.sql')).sort();
    for (const filename of migrations) {
      const migration = await readFile(new URL(`../migrations/website/${filename}`, import.meta.url), 'utf8');
      await pool.query(migration);
      await pool.query(migration);
    }
  } finally {
    await pool.end();
  }
  // No provider keys, app DATABASE_URL or NODE_OPTIONS propagate into this run.
  const env = Object.fromEntries(['PATH','HOME','TMPDIR','TEMP','LANG','CI','CHROME_PATH','WEBSITE_BROWSER_TESTS'].filter((key) => process.env[key]).map((key) => [key, process.env[key]]));
  const emptyEnvDir = await mkdtemp(join(tmpdir(), 'website-test-env-'));
  Object.assign(env, { WEBSITE_TEST_ENV_DIR: emptyEnvDir, WEBSITE_DB_TESTS: '1', WEBSITE_TEST_DATABASE_URL: target, WEBSITE_TEST_BASELINE_CATALOG: JSON.stringify(baseline) });
  try {
    const result = spawnSync(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', '--config', 'vitest.website.config.ts', ...tests], { stdio: 'inherit', env });
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  } finally {
    await rm(emptyEnvDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  // pg failures must not echo connection strings, passwords or application data.
  console.error(error.message.includes('isolated') || error.message.includes('Isolated') ? error.message : `Isolated website database tests failed (${error.code ?? error.name})`);
  process.exitCode = 1;
});
