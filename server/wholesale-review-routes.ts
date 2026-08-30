import type { Express, Request, RequestHandler } from "express";
import type {
  MarketflowWholesaleStorageRow,
  normalizeMarketflowWholesaleSubmission,
} from "@shared/marketflow-wholesale-submission";
import type { SupabaseMarketplaceIdentity } from "./supabase-marketplace-privacy";
import type {
  SupabaseCapitalProject,
  SupabaseWholesaleDeal,
} from "./supabase-storage";
import { sendCapitalRelationshipOnly } from "./capital-relationship-only";

type CapitalProjectCreateInput = Omit<
  SupabaseCapitalProject,
  "id" | "created_at" | "updated_at" | "amount_raised"
>;

type WholesaleReviewRouteDependencies = {
  resolveIdentity(request: Request): SupabaseMarketplaceIdentity | null;
  normalizeSubmission: typeof normalizeMarketflowWholesaleSubmission;
  createWholesaleDeal(
    input: MarketflowWholesaleStorageRow,
  ): Promise<SupabaseWholesaleDeal | null>;
  getPendingWholesaleDeals(): Promise<SupabaseWholesaleDeal[]>;
  createCapitalProject(
    input: CapitalProjectCreateInput,
  ): Promise<SupabaseCapitalProject | null>;
  getPendingCapitalProjects(): Promise<SupabaseCapitalProject[]>;
  getCapitalProject(id: string): Promise<SupabaseCapitalProject | null>;
  updateCapitalProject(
    id: string,
    updates: Partial<SupabaseCapitalProject>,
  ): Promise<SupabaseCapitalProject | null>;
  getWholesaleDeal(id: string): Promise<SupabaseWholesaleDeal | null>;
  updateWholesaleDeal(
    id: string,
    updates: Partial<SupabaseWholesaleDeal>,
  ): Promise<SupabaseWholesaleDeal | null>;
  serializeWholesaleDeal(
    record: SupabaseWholesaleDeal,
  ): Record<string, unknown>;
  serializeCapitalProject(
    record: SupabaseCapitalProject,
  ): Record<string, unknown>;
  auditStatusChange(
    request: Request,
    before: SupabaseWholesaleDeal,
    after: SupabaseWholesaleDeal,
  ): Promise<void>;
  auditCapitalStatusChange(
    request: Request,
    before: SupabaseCapitalProject,
    after: SupabaseCapitalProject,
  ): Promise<void>;
  notifyStatusChange?(
    before: SupabaseWholesaleDeal,
    after: SupabaseWholesaleDeal,
    rejectionReason?: string,
  ): Promise<void>;
  notifyCapitalStatusChange?(
    before: SupabaseCapitalProject,
    after: SupabaseCapitalProject,
    rejectionReason?: string,
  ): Promise<void>;
  logError(message: string, error: unknown): void;
};

const REVIEWABLE_WHOLESALE_STATUSES = new Set([
  "under review",
  "under_review",
  "pending_review",
  "submitted",
]);

const REVIEWABLE_CAPITAL_STATUSES = new Set([
  "under review",
  "under_review",
  "pending_approval",
  "submitted",
]);

const WHOLESALE_REVIEW_STATUSES = new Set([
  "approved",
  "listed",
  "rejected",
  "under_review",
]);

const normalizeStatus = (value: unknown): string =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const setPrivateResponse = (response: Parameters<RequestHandler>[1]) => {
  response.setHeader("Cache-Control", "no-store");
};

function cleanRejectionReason(value: unknown): string | undefined | null {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  if (!cleaned || cleaned.length > 2_000) return null;
  return cleaned;
}

function normalizeCapitalProjectSubmission(
  value: unknown,
  identity: SupabaseMarketplaceIdentity,
):
  | { ok: true; data: CapitalProjectCreateInput }
  | { ok: false; message: string } {
  const body =
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const title =
    typeof body.title === "string" ? body.title.trim().slice(0, 255) : "";
  const structure =
    typeof body.structure === "string"
      ? body.structure.trim().toUpperCase()
      : "";
  const fundingGoal = Number(body.fundingGoal);
  const minInvestment =
    body.minInvestment === undefined || body.minInvestment === null
      ? undefined
      : Number(body.minInvestment);

  if (
    !title ||
    !["EQUITY", "DEBT", "HYBRID"].includes(structure) ||
    !Number.isFinite(fundingGoal) ||
    fundingGoal <= 0 ||
    (minInvestment !== undefined &&
      (!Number.isFinite(minInvestment) || minInvestment < 0))
  ) {
    return { ok: false, message: "Invalid project details" };
  }

  const cleanText = (candidate: unknown, maxLength: number) =>
    typeof candidate === "string" && candidate.trim()
      ? candidate.trim().slice(0, maxLength)
      : undefined;
  const photos = Array.isArray(body.photos)
    ? body.photos
        .filter((photo): photo is string => typeof photo === "string")
        .map((photo) => photo.trim())
        .filter(Boolean)
        .slice(0, 30)
    : undefined;

  return {
    ok: true,
    data: {
      owner_id: identity.kind === "supabase" ? identity.userId : null,
      external_owner_id:
        identity.kind === "external" ? identity.userId : null,
      title,
      description: cleanText(body.description, 10_000),
      location: cleanText(body.location, 255),
      property_type: cleanText(body.propertyType, 100),
      structure: structure as "EQUITY" | "DEBT" | "HYBRID",
      funding_goal: fundingGoal,
      min_investment: minInvestment,
      projected_return: cleanText(body.projectedReturn, 100),
      hold_period: cleanText(body.holdPeriod, 100),
      photos,
      status: "Under Review",
      is_public: false,
    },
  };
}

export function createWholesaleReviewRouteHandlers(
  dependencies: WholesaleReviewRouteDependencies,
): {
  submit: RequestHandler;
  submitCapital: RequestHandler;
  pending: RequestHandler;
  updateStatus: RequestHandler;
  updateCapitalStatus: RequestHandler;
} {
  const submit: RequestHandler = async (request, response) => {
    setPrivateResponse(response);
    try {
      const identity = dependencies.resolveIdentity(request);
      if (!identity) {
        return response.status(401).json({ message: "User not authenticated" });
      }

      const normalized = dependencies.normalizeSubmission(
        request.body,
        identity,
      );
      if (!normalized.ok) {
        return response.status(400).json({ message: normalized.message });
      }

      const created = await dependencies.createWholesaleDeal(normalized.data);
      if (!created) {
        return response
          .status(503)
          .json({ message: "Wholesale submission was not persisted" });
      }
      return response
        .status(201)
        .json(dependencies.serializeWholesaleDeal(created));
    } catch (error) {
      dependencies.logError("Error creating wholesale deal:", error);
      return response
        .status(503)
        .json({ message: "Wholesale submission service unavailable" });
    }
  };

  const submitCapital: RequestHandler = async (request, response) => {
    setPrivateResponse(response);
    try {
      const identity = dependencies.resolveIdentity(request);
      if (!identity) {
        return response.status(401).json({ message: "User not authenticated" });
      }
      const normalized = normalizeCapitalProjectSubmission(
        request.body,
        identity,
      );
      if (!normalized.ok) {
        return response.status(400).json({ message: normalized.message });
      }

      const created = await dependencies.createCapitalProject(normalized.data);
      if (!created) {
        return response
          .status(503)
          .json({ message: "Capital project was not persisted" });
      }
      return response
        .status(201)
        .json(dependencies.serializeCapitalProject(created));
    } catch (error) {
      dependencies.logError("Error creating capital project:", error);
      return response
        .status(503)
        .json({ message: "Capital project service unavailable" });
    }
  };

  const pending: RequestHandler = async (_request, response) => {
    setPrivateResponse(response);
    try {
      const [wholesaleDeals, capitalProjects] = await Promise.all([
        dependencies.getPendingWholesaleDeals(),
        dependencies.getPendingCapitalProjects(),
      ]);

      const pendingWholesale = wholesaleDeals
        .filter((deal) =>
          REVIEWABLE_WHOLESALE_STATUSES.has(normalizeStatus(deal.status)),
        )
        .slice(0, 10)
        .map((deal) => ({
          id: deal.id,
          type: "wholesale_deal" as const,
          title: "Wholesale Deal Submission",
          description: deal.address || "New deal submission",
          submittedBy:
            deal.wholesaler_id || deal.external_wholesaler_id || null,
          createdAt: deal.created_at,
        }));

      const pendingCapital = capitalProjects
        .filter((project) =>
          REVIEWABLE_CAPITAL_STATUSES.has(normalizeStatus(project.status)),
        )
        .slice(0, 10)
        .map((project) => ({
          id: project.id,
          type: "capital_project" as const,
          title: "Capital Project Submission",
          description: project.title || "New project submission",
          submittedBy: project.owner_id || project.external_owner_id || null,
          createdAt: project.created_at,
        }));

      return response.json(
        [...pendingWholesale, ...pendingCapital].sort(
          (left, right) =>
            new Date(right.createdAt || 0).getTime() -
            new Date(left.createdAt || 0).getTime(),
        ),
      );
    } catch (error) {
      dependencies.logError("Error fetching pending review items:", error);
      return response
        .status(503)
        .json({ message: "Review queue unavailable" });
    }
  };

  const updateStatus: RequestHandler = async (request, response) => {
    setPrivateResponse(response);
    const dealId = request.params.id?.trim();
    const status = normalizeStatus(request.body?.status);
    const rejectionReason = cleanRejectionReason(
      request.body?.rejectionReason,
    );

    if (!dealId || dealId.length > 255) {
      return response.status(400).json({ message: "Invalid deal ID" });
    }
    if (!WHOLESALE_REVIEW_STATUSES.has(status)) {
      return response.status(400).json({ message: "Invalid status" });
    }
    if (rejectionReason === null) {
      return response
        .status(400)
        .json({ message: "Invalid rejection reason" });
    }

    try {
      const existing = await dependencies.getWholesaleDeal(dealId);
      if (!existing) {
        return response.status(404).json({ message: "Deal not found" });
      }

      const updated = await dependencies.updateWholesaleDeal(dealId, {
        status,
        is_public: status === "approved" || status === "listed",
      });
      if (!updated) {
        return response
          .status(503)
          .json({ message: "Deal status was not persisted" });
      }

      let auditRecorded = true;
      try {
        await dependencies.auditStatusChange(request, existing, updated);
      } catch (error) {
        auditRecorded = false;
        dependencies.logError(
          "Wholesale status changed but its audit event was not persisted:",
          error,
        );
      }

      if (dependencies.notifyStatusChange) {
        try {
          await dependencies.notifyStatusChange(
            existing,
            updated,
            rejectionReason,
          );
        } catch (error) {
          dependencies.logError(
            "Error sending wholesale status notification:",
            error,
          );
        }
      }

      return response.json({
        ...dependencies.serializeWholesaleDeal(updated),
        auditRecorded,
        ...(auditRecorded
          ? {}
          : {
              auditWarning:
                "The status changed, but the review audit event could not be recorded.",
            }),
      });
    } catch (error) {
      dependencies.logError("Error updating wholesale deal status:", error);
      return response
        .status(503)
        .json({ message: "Wholesale review service unavailable" });
    }
  };

  const updateCapitalStatus: RequestHandler = async (request, response) => {
    setPrivateResponse(response);
    const projectId = request.params.id?.trim();
    const status = normalizeStatus(request.body?.status);
    const rejectionReason = cleanRejectionReason(
      request.body?.rejectionReason,
    );

    if (!projectId || projectId.length > 255) {
      return response.status(400).json({ message: "Invalid project ID" });
    }
    if (status === "funding") {
      return sendCapitalRelationshipOnly(response);
    }
    if (!["approved", "rejected", "under_review"].includes(status)) {
      return response.status(400).json({ message: "Invalid status" });
    }
    if (rejectionReason === null) {
      return response
        .status(400)
        .json({ message: "Invalid rejection reason" });
    }

    try {
      const existing = await dependencies.getCapitalProject(projectId);
      if (!existing) {
        return response.status(404).json({ message: "Project not found" });
      }

      const updated = await dependencies.updateCapitalProject(projectId, {
        status,
        // Administrative approval is not an offering or a publication action.
        is_public: false,
      });
      if (!updated) {
        return response
          .status(503)
          .json({ message: "Project status was not persisted" });
      }

      let auditRecorded = true;
      try {
        await dependencies.auditCapitalStatusChange(
          request,
          existing,
          updated,
        );
      } catch (error) {
        auditRecorded = false;
        dependencies.logError(
          "Capital status changed but its audit event was not persisted:",
          error,
        );
      }

      if (dependencies.notifyCapitalStatusChange) {
        try {
          await dependencies.notifyCapitalStatusChange(
            existing,
            updated,
            rejectionReason,
          );
        } catch (error) {
          dependencies.logError(
            "Error sending capital status notification:",
            error,
          );
        }
      }

      return response.json({
        ...dependencies.serializeCapitalProject(updated),
        auditRecorded,
        ...(auditRecorded
          ? {}
          : {
              auditWarning:
                "The status changed, but the review audit event could not be recorded.",
            }),
      });
    } catch (error) {
      dependencies.logError("Error updating capital project status:", error);
      return response
        .status(503)
        .json({ message: "Capital review service unavailable" });
    }
  };

  return {
    submit,
    submitCapital,
    pending,
    updateStatus,
    updateCapitalStatus,
  };
}

export function registerWholesaleReviewRoutes(
  app: Express,
  dependencies: WholesaleReviewRouteDependencies,
  middleware: {
    authenticate: RequestHandler;
    authenticateStaff: RequestHandler;
    requireInventoryAccess: RequestHandler;
    requireStaff: RequestHandler;
  },
): void {
  const handlers = createWholesaleReviewRouteHandlers(dependencies);
  app.post(
    "/api/supabase/wholesale-deals",
    middleware.authenticate,
    middleware.requireInventoryAccess,
    handlers.submit,
  );
  app.post(
    "/api/supabase/capital-projects",
    middleware.authenticate,
    handlers.submitCapital,
  );
  app.get(
    "/api/marketplace/admin/pending",
    middleware.authenticateStaff,
    middleware.requireStaff,
    handlers.pending,
  );
  app.patch(
    "/api/marketplace/admin/deals/:id/status",
    middleware.authenticateStaff,
    middleware.requireStaff,
    handlers.updateStatus,
  );
  app.patch(
    "/api/marketplace/admin/projects/:id/status",
    middleware.authenticateStaff,
    middleware.requireStaff,
    handlers.updateCapitalStatus,
  );
}
