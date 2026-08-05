import type { Express } from "express";
import { hasRequiredHqEndpointConfiguration } from "./integrations/hq-config";

export interface ReadinessProbeResult {
  opportunities: string | null;
  hqOutbox: string | null;
  opportunityColumns: string[];
  hqOutboxColumns: string[];
}

export interface ReadinessDependencies {
  probe?: () => Promise<ReadinessProbeResult>;
  hasRequiredHqEndpoint?: () => boolean;
  hasRequiredEmail?: () => boolean;
}

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

function isProductionEnvironment(
  environment: Record<string, string | undefined> = process.env,
): boolean {
  if (environment.APP_ENV) return environment.APP_ENV === "production";
  return environment.NODE_ENV === "production";
}

export function hasRequiredEmailConfiguration(
  environment: Record<string, string | undefined> = process.env,
): boolean {
  if (!isProductionEnvironment(environment)) return true;
  return [
    environment.SENDGRID_API_KEY,
    environment.DEFAULT_FROM_EMAIL,
    environment.STAFF_NOTIFICATION_EMAIL,
  ].every((value) => Boolean(value?.trim()));
}

async function probeLaunchSchema(): Promise<ReadinessProbeResult> {
  const [{ sql }, { db }] = await Promise.all([
    import("drizzle-orm"),
    import("./db"),
  ]);
  const result = await db.execute(sql`
    SELECT
      to_regclass('public.opportunities')::text AS opportunities,
      to_regclass('public.hq_outbox')::text AS hq_outbox,
      ARRAY(
        SELECT column_name::text
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'opportunities'
        ORDER BY column_name
      ) AS opportunity_columns,
      ARRAY(
        SELECT column_name::text
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'hq_outbox'
        ORDER BY column_name
      ) AS hq_outbox_columns
  `);
  const rows = Array.isArray(result)
    ? result
    : ((result as unknown as { rows?: unknown[] }).rows ?? []);
  const row = rows[0] as
    | {
        opportunities?: string | null;
        hq_outbox?: string | null;
        opportunity_columns?: string[];
        hq_outbox_columns?: string[];
      }
    | undefined;

  return {
    opportunities: row?.opportunities ?? null,
    hqOutbox: row?.hq_outbox ?? null,
    opportunityColumns: Array.isArray(row?.opportunity_columns)
      ? row.opportunity_columns
      : [],
    hqOutboxColumns: Array.isArray(row?.hq_outbox_columns)
      ? row.hq_outbox_columns
      : [],
  };
}

export async function checkReadiness(
  dependencies: ReadinessDependencies = {},
): Promise<boolean> {
  try {
    const hasRequiredHqEndpoint =
      dependencies.hasRequiredHqEndpoint ??
      hasRequiredHqEndpointConfiguration;
    if (!hasRequiredHqEndpoint()) return false;
    const hasRequiredEmail =
      dependencies.hasRequiredEmail ??
      hasRequiredEmailConfiguration;
    if (!hasRequiredEmail()) return false;

    const result = await (dependencies.probe ?? probeLaunchSchema)();
    const opportunityColumns = new Set(result.opportunityColumns);
    const hqOutboxColumns = new Set(result.hqOutboxColumns);
    return Boolean(
      result.opportunities &&
      result.hqOutbox &&
      REQUIRED_OPPORTUNITY_COLUMNS.every((column) =>
        opportunityColumns.has(column)
      ) &&
      REQUIRED_HQ_OUTBOX_COLUMNS.every((column) =>
        hqOutboxColumns.has(column)
      ),
    );
  } catch {
    return false;
  }
}

export function registerReadinessRoute(
  app: Express,
  dependencies: ReadinessDependencies = {},
): void {
  app.get("/api/ready", async (_req, res) => {
    if (await checkReadiness(dependencies)) {
      return res.status(200).json({ status: "ready" });
    }
    return res.status(503).json({ status: "unavailable" });
  });
}
