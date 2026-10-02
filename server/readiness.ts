import type { Express } from "express";
import { sql } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { z } from "zod";
import * as website from "../shared/website-schema";
import { getConfiguredWebsiteHqEndpoint } from "./integrations/hq-config";
import { getWebsiteOrgId } from "./website/intake-policy";
import type { WebsiteDb } from "./website/db";

type Environment = Record<string, string | undefined>;

interface TablePermissions {
  schemaUsage: boolean;
  select: boolean;
  insert: boolean;
  update: boolean;
  sequenceUsage: boolean;
}

export interface ReadinessProbeResult {
  tables: Record<string, string[]>;
  permissions: Record<string, TablePermissions>;
}

export interface ReadinessDependencies {
  probe?: () => Promise<ReadinessProbeResult>;
  hasRequiredHqEndpoint?: () => boolean;
  hasRequiredEmail?: () => boolean;
}

// The required shape comes from reviewed source definitions, never from whatever
// happens to exist in the connected database. Include the entire migrated closure.
export const REQUIRED_WEBSITE_COLUMNS: Readonly<Record<string, readonly string[]>> = Object.fromEntries([
  website.opportunities,
  website.leads,
  website.hqOutbox,
  website.adminAuditLog,
  website.peggyConversations,
  website.peggyMessages,
  website.intakeRequests,
  website.websiteDeliveryJobs,
  website.notificationOutbox,
].map(table => {
  const config = getTableConfig(table);
  return [config.name, config.columns.map(column => column.name)];
}));

// Historical migration-artifact tests still import these legacy column lists.
// They are not the readiness contract for the dedicated website schema.
export const REQUIRED_OPPORTUNITY_COLUMNS = [
  "id",
  "created_at",
  "updated_at",
  "source_page",
  "lead_source",
  "visitor_type",
  "contact_name",
  "email",
  "phone",
  "preferred_contact_method",
  "best_time_to_contact",
  "property_address",
  "city",
  "state",
  "zip_code",
  "property_type",
  "occupancy_status",
  "condition",
  "situation",
  "goal",
  "urgency",
  "estimated_value",
  "estimated_debt",
  "notes",
  "recommended_lane",
  "assigned_department",
  "status",
  "consent_accepted",
  "consent_copy_version",
  "consent_captured_at",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "referrer",
] as const;

export const REQUIRED_HQ_OUTBOX_COLUMNS = [
  "id",
  "idempotency_key",
  "surface",
  "source_id",
  "payload",
  "status",
  "attempts",
  "last_attempt_at",
  "last_error",
  "hq_submission_id",
  "forwarded_at",
  "created_at",
  "updated_at",
] as const;

export const REQUIRED_ADMIN_AUDIT_LOG_COLUMNS = [
  "id",
  "admin_user_id",
  "admin_email",
  "admin_name",
  "action_type",
  "resource_type",
  "resource_id",
  "description",
  "previous_value",
  "new_value",
  "ip_address",
  "user_agent",
  "created_at",
] as const;

function isProductionEnvironment(environment: Environment = process.env): boolean {
  // Match the workers' fail-closed preview classification, including hosts whose
  // NODE_ENV (or inherited APP_ENV) is production for a preview build.
  if ([environment.APP_ENV, environment.VERCEL_ENV].some(value => value?.trim().toLowerCase() === "preview")) return false;
  if (environment.APP_ENV) return environment.APP_ENV === "production";
  return environment.NODE_ENV === "production";
}

export function hasRequiredWebsiteHqConfiguration(environment: Environment = process.env): boolean {
  if (!isProductionEnvironment(environment)) return true;
  const token = environment.PEGASUS_WEBSITE_INQUIRY_TOKEN?.trim();
  return getConfiguredWebsiteHqEndpoint(environment) !== null && Boolean(token) && !/[\r\n]/.test(token ?? "");
}

export function hasRequiredEmailConfiguration(environment: Environment = process.env): boolean {
  if (!isProductionEnvironment(environment)) return true;
  const email = z.string().email().max(255);
  return Boolean(environment.SENDGRID_API_KEY?.trim())
    && !/[\r\n]/.test(environment.SENDGRID_API_KEY ?? "")
    && email.safeParse(environment.DEFAULT_FROM_EMAIL).success
    && email.safeParse(environment.STAFF_NOTIFICATION_EMAIL).success;
}

/**
 * Catalog-only SELECT: no user rows, grant changes, writes, test submissions or provider
 * calls. pg_catalog remains visible to a least-privilege server role; unlike
 * information_schema.columns it does not hide columns based on data grants.
 * Inspect current-role privileges without exercising them. This cannot establish
 * RLS-policy sufficiency, constraints, successful intake or provider delivery.
 */
export async function probeWebsiteSchema(database?: Pick<WebsiteDb, "execute">): Promise<ReadinessProbeResult> {
  const db = database ?? (await import("./db")).db;
  const result = await db.execute(sql`
    SELECT c.relname::text AS table_name, a.attname::text AS column_name,
      has_schema_privilege(n.oid, 'USAGE') AS schema_usage,
      has_table_privilege(c.oid, 'SELECT') AS can_select,
      has_table_privilege(c.oid, 'INSERT') AS can_insert,
      has_table_privilege(c.oid, 'UPDATE') AS can_update,
      CASE WHEN c.relname IN ('leads', 'admin_audit_log', 'peggy_conversations', 'peggy_messages') THEN EXISTS (
        SELECT 1 FROM pg_catalog.pg_depend d
        JOIN pg_catalog.pg_class sequence ON sequence.oid = d.objid AND sequence.relkind = 'S'
        JOIN pg_catalog.pg_attribute identity_column ON identity_column.attrelid = c.oid
          AND identity_column.attnum = d.refobjsubid AND identity_column.attname = 'id'
        WHERE d.refobjid = c.oid AND d.classid = 'pg_catalog.pg_class'::regclass
          AND d.refclassid = 'pg_catalog.pg_class'::regclass AND d.deptype IN ('a', 'i')
          AND has_sequence_privilege(sequence.oid, 'USAGE, UPDATE')
      ) ELSE true END AS sequence_usage
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid
    WHERE n.nspname = 'website'
      AND c.relkind IN ('r', 'p')
      AND c.relname = ANY(${sql.param(Object.keys(REQUIRED_WEBSITE_COLUMNS))}::text[])
      AND a.attnum > 0 AND NOT a.attisdropped
    ORDER BY c.relname, a.attnum
  `);
  const tables: ReadinessProbeResult["tables"] = {};
  const permissions: ReadinessProbeResult["permissions"] = {};
  for (const row of result.rows as {
    table_name: string; column_name: string; schema_usage: boolean;
    can_select: boolean; can_insert: boolean; can_update: boolean; sequence_usage: boolean;
  }[]) {
    (tables[row.table_name] ??= []).push(row.column_name);
    permissions[row.table_name] = {
      schemaUsage: row.schema_usage, select: row.can_select, insert: row.can_insert,
      update: row.can_update, sequenceUsage: row.sequence_usage,
    };
  }
  return { tables, permissions };
}

/**
 * Production readiness requires the server organization, website storage and
 * configured authenticated HQ/email transports. Preview/development readiness
 * requires the same organization, storage and capture privileges but permits
 * providers to stay off. Queue UPDATE is required when its worker is configured on.
 * A ready result is never an HQ receipt, email acceptance or inbox-delivery proof.
 */
export async function checkReadiness(dependencies: ReadinessDependencies = {}): Promise<boolean> {
  try {
    getWebsiteOrgId();
    if (!(dependencies.hasRequiredHqEndpoint ?? hasRequiredWebsiteHqConfiguration)()) return false;
    if (!(dependencies.hasRequiredEmail ?? hasRequiredEmailConfiguration)()) return false;
    const result = await (dependencies.probe ?? probeWebsiteSchema)();
    return Object.entries(REQUIRED_WEBSITE_COLUMNS).every(([table, required]) => {
      const actual = new Set(result.tables[table] ?? []);
      if (!required.every(column => actual.has(column))) return false;
      // The historical queue stays structurally checked, but new website intake
      // does not write it and must not acquire legacy recovery permissions.
      if (table === "hq_outbox") return true;
      const permissions = result.permissions[table];
      if (!permissions?.schemaUsage || !permissions.select || !permissions.insert || !permissions.sequenceUsage) return false;
      const requiresUpdate = table === "peggy_conversations" || table === "peggy_messages"
        || (table === "delivery_jobs" && process.env.PEGASUS_ENABLE_HQ_DELIVERY_WORKER === "true")
        || (table === "notification_outbox" && process.env.PEGASUS_ENABLE_NOTIFICATION_WORKER === "true");
      return !requiresUpdate || permissions.update;
    });
  } catch {
    return false;
  }
}

export function registerReadinessRoute(app: Express, dependencies: ReadinessDependencies = {}): void {
  app.get("/api/ready", async (_req, res) => {
    if (await checkReadiness(dependencies)) {
      return res.status(200).json({ status: "ready" });
    }
    return res.status(503).json({ status: "unavailable" });
  });
}
