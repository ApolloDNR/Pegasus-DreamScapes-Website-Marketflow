import pg, { type PoolConfig } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../../shared/website-schema";

export type WebsiteDb = NodePgDatabase<typeof schema>;

/** Keep URL options from silently replacing node-postgres' verified TLS config. */
export function websitePoolConfig(connectionString: string): PoolConfig {
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("Website database requires a valid PostgreSQL connection URL");
  }
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname || !url.username || url.pathname.length < 2 || url.hash) {
    throw new Error("Website database requires a complete PostgreSQL connection URL");
  }
  for (const key of url.searchParams.keys()) {
    if (key !== "sslmode") {
      throw new Error(key.toLowerCase().startsWith("ssl")
        ? "Website database TLS options must not override certificate verification"
        : "Unsupported website database connection parameter");
    }
  }
  const modes = url.searchParams.getAll("sslmode");
  if (modes.some((mode) => mode !== "require" && mode !== "verify-full")) {
    throw new Error("Website database TLS certificate verification is required");
  }
  url.searchParams.delete("sslmode");
  const disposableLoopback = ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)
    && url.pathname === "/website_integration_test"
    && url.username === "website_test_admin";
  return {
    connectionString: url.toString(),
    // Only the deliberately named local synthetic test service uses cleartext.
    ssl: disposableLoopback && modes.length === 0 ? false : { rejectUnauthorized: true },
    max: 10,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
  };
}

export function createWebsiteDb(connectionString: string): { db: WebsiteDb; close(): Promise<void> } {
  const pool = new pg.Pool(websitePoolConfig(connectionString));
  return { db: drizzle(pool, { schema }), close: () => pool.end() };
}
