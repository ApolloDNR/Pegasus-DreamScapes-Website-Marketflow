import { createWebsiteDb } from "./website/db";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// SQL table objects carry their explicit schema. Legacy table imports remain
// compatible while the migrated public website closure targets website.*.
const connection = createWebsiteDb(process.env.DATABASE_URL);
export const db = connection.db;
export const closeDatabase = connection.close;
