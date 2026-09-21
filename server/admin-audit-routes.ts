import type {
  Express,
  Request,
  RequestHandler,
} from "express";
import {
  REVIEW_AUDIT_ACTION_TYPES,
  insertAdminAuditLogSchema,
  type AdminAuditLog,
  type AuditActionType,
  type InsertAdminAuditLog,
} from "@shared/schema";

type AuditRequest = Request & {
  user?: {
    claims?: Record<string, unknown>;
  };
  supabaseUser?: {
    id?: unknown;
    email?: unknown;
    claims?: Record<string, unknown>;
  };
};

export type ServerAdminAuditEvent = {
  actionType: AuditActionType;
  resourceType: "wholesale_deal" | "capital_project";
  resourceId: string;
  description: string;
  previousValue: { status: string };
  newValue: { status: string };
};

type AuditActor = {
  userId: string;
  email: string | null;
  name: string | null;
};

type AuditListOptions = {
  limit: number;
  offset: number;
  actionType?: string;
  actionTypes?: readonly string[];
  adminUserId?: string;
};

type AuditFilterOptions = Pick<
  AuditListOptions,
  "actionType" | "actionTypes" | "adminUserId"
>;

type AdminAuditRouteDependencies = {
  getAuthUserId(request: Request): string | null;
  getAuditLogs(options: AuditListOptions): Promise<AdminAuditLog[]>;
  getAuditLogCount(options: AuditFilterOptions): Promise<number>;
  getAuditLogById(id: number): Promise<AdminAuditLog | undefined>;
  logError(message: string, error: unknown): void;
};

type AdminAuditWriterDependencies = {
  getAuthUserId(request: Request): string | null;
  createAuditLog(entry: InsertAdminAuditLog): Promise<AdminAuditLog>;
};

const normalizeString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const normalizeEmail = (value: unknown): string | null => {
  const normalized = normalizeString(value);
  return normalized ? normalized.toLowerCase().slice(0, 255) : null;
};

const normalizedStatus = (value: unknown): string =>
  typeof value === "string"
    ? value.trim().toLowerCase().replace(/[\s-]+/g, "_")
    : "unknown";

const claimName = (claims: Record<string, unknown> | undefined): string | null => {
  if (!claims) return null;
  const direct =
    normalizeString(claims.name) ??
    normalizeString(claims.full_name) ??
    normalizeString(claims.display_name);
  if (direct) return direct.slice(0, 255);
  const joined = [claims.first_name, claims.last_name]
    .map(normalizeString)
    .filter((value): value is string => value !== null)
    .join(" ");
  return joined ? joined.slice(0, 255) : null;
};

export function resolveVerifiedAuditActor(
  request: Request,
  getAuthUserId: (request: Request) => string | null,
): AuditActor | null {
  const auditRequest = request as AuditRequest;
  const claimId = normalizeString(auditRequest.user?.claims?.sub);
  const supabaseId = normalizeString(auditRequest.supabaseUser?.id);
  if (claimId && supabaseId && claimId !== supabaseId) return null;

  const verifiedId = claimId ?? supabaseId;
  const resolvedId = normalizeString(getAuthUserId(request));
  if (!verifiedId || !resolvedId || verifiedId !== resolvedId) return null;

  const claimEmail = normalizeEmail(auditRequest.user?.claims?.email);
  const supabaseEmail = normalizeEmail(auditRequest.supabaseUser?.email);
  const claims = auditRequest.user?.claims;
  const supabaseClaims = auditRequest.supabaseUser?.claims;

  return {
    userId: verifiedId,
    email:
      claimId === verifiedId
        ? claimEmail ?? (supabaseId === verifiedId ? supabaseEmail : null)
        : supabaseEmail,
    name:
      claimName(claims) ??
      (supabaseId === verifiedId ? claimName(supabaseClaims) : null),
  };
}

export function createAdminAuditWriter(
  dependencies: AdminAuditWriterDependencies,
): (
  request: Request,
  event: ServerAdminAuditEvent,
) => Promise<AdminAuditLog> {
  return async (request, event) => {
    const actor = resolveVerifiedAuditActor(
      request,
      dependencies.getAuthUserId,
    );
    if (!actor) {
      throw new Error("Verified administrative audit actor is unavailable");
    }

    const entry = insertAdminAuditLogSchema.parse({
      adminUserId: actor.userId,
      adminEmail: actor.email,
      adminName: actor.name,
      actionType: event.actionType,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      description: event.description,
      previousValue: JSON.stringify(event.previousValue),
      newValue: JSON.stringify(event.newValue),
      ipAddress: normalizeString(request.ip)?.slice(0, 45) ?? null,
      userAgent:
        normalizeString(request.headers["user-agent"])?.slice(0, 1_000) ??
        null,
    });
    return dependencies.createAuditLog(entry);
  };
}

type ReviewRecord = { id: string; status: string };

export function createWholesaleReviewAuditEvent(
  before: ReviewRecord,
  after: ReviewRecord,
): ServerAdminAuditEvent {
  const previousStatus = normalizedStatus(before.status);
  const nextStatus = normalizedStatus(after.status);
  const actionType: AuditActionType =
    nextStatus === "rejected"
      ? "deal_rejected"
      : nextStatus === "under_review"
        ? "deal_review_started"
        : "deal_approved";
  return {
    actionType,
    resourceType: "wholesale_deal",
    resourceId: String(after.id).slice(0, 255),
    description: `Wholesale deal review status changed from ${previousStatus} to ${nextStatus}.`,
    previousValue: { status: previousStatus },
    newValue: { status: nextStatus },
  };
}

export function createCapitalReviewAuditEvent(
  before: ReviewRecord,
  after: ReviewRecord,
): ServerAdminAuditEvent {
  const previousStatus = normalizedStatus(before.status);
  const nextStatus = normalizedStatus(after.status);
  const actionType: AuditActionType =
    nextStatus === "rejected"
      ? "project_rejected"
      : nextStatus === "under_review"
        ? "project_review_started"
        : "project_approved";
  return {
    actionType,
    resourceType: "capital_project",
    resourceId: String(after.id).slice(0, 255),
    description: `Capital project review status changed from ${previousStatus} to ${nextStatus}.`,
    previousValue: { status: previousStatus },
    newValue: { status: nextStatus },
  };
}

const firstQueryValue = (value: unknown): string | undefined =>
  typeof value === "string" ? value : Array.isArray(value) && typeof value[0] === "string" ? value[0] : undefined;

const boundedInteger = (
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
): number => {
  const candidate = firstQueryValue(value);
  if (!candidate || !/^\d+$/.test(candidate)) return fallback;
  return Math.min(Math.max(Number(candidate), minimum), maximum);
};

export function registerAdminAuditRoutes(
  app: Express,
  dependencies: AdminAuditRouteDependencies,
  middleware: {
    authenticate: RequestHandler;
    requireStaff: RequestHandler;
  },
): void {
  const requireConsistentPrincipal: RequestHandler = (request, response, next) => {
    if (!resolveVerifiedAuditActor(request, dependencies.getAuthUserId)) {
      return response.status(401).json({ message: "Unauthorized" });
    }
    return next();
  };

  const protection = [
    middleware.authenticate,
    requireConsistentPrincipal,
    middleware.requireStaff,
  ];

  app.get("/api/audit-logs", ...protection, async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    try {
      const limit = boundedInteger(request.query.limit, 50, 1, 100);
      const offset = boundedInteger(
        request.query.offset,
        0,
        0,
        Number.MAX_SAFE_INTEGER,
      );
      const actionType = firstQueryValue(request.query.actionType)?.trim();
      const adminUserId = firstQueryValue(request.query.adminUserId)?.trim();
      if (
        actionType &&
        !REVIEW_AUDIT_ACTION_TYPES.includes(
          actionType as (typeof REVIEW_AUDIT_ACTION_TYPES)[number],
        )
      ) {
        return response.status(400).json({ message: "Invalid action type" });
      }
      if (adminUserId && adminUserId.length > 255) {
        return response.status(400).json({ message: "Invalid admin user ID" });
      }
      const filters = {
        ...(actionType
          ? { actionType }
          : { actionTypes: REVIEW_AUDIT_ACTION_TYPES }),
        ...(adminUserId ? { adminUserId } : {}),
      };
      const [logs, total] = await Promise.all([
        dependencies.getAuditLogs({ limit, offset, ...filters }),
        dependencies.getAuditLogCount(filters),
      ]);
      return response.json({ logs, total, limit, offset });
    } catch (error) {
      dependencies.logError("Error fetching audit logs:", error);
      return response
        .status(503)
        .json({ message: "Audit log service unavailable" });
    }
  });

  app.get("/api/audit-logs/:id", ...protection, async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    const id = Number(request.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return response.status(400).json({ message: "Invalid audit log ID" });
    }
    try {
      const log = await dependencies.getAuditLogById(id);
      return log
        ? response.json(log)
        : response.status(404).json({ message: "Audit log not found" });
    } catch (error) {
      dependencies.logError("Error fetching audit log:", error);
      return response
        .status(503)
        .json({ message: "Audit log service unavailable" });
    }
  });
}
