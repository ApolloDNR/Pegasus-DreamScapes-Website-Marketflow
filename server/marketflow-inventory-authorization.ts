import type { RequestHandler } from "express";
import {
  canAccessReviewedMarketflowInventory,
  canInitiateMarketflowJv,
} from "@shared/marketflow-inventory-access";

type MarketflowProfile = {
  primary_role?: unknown;
  is_pegasus_badged?: unknown;
} | null;

type MarketflowRole = {
  role?: unknown;
};

type MarketflowInventoryAccessDependencies = {
  getUserProfile: (userId: string) => Promise<MarketflowProfile>;
  getUserRoles: (userId: string) => Promise<MarketflowRole[]>;
  adminEmails: readonly string[];
};

type MarketflowInventoryRequest = {
  user?: { claims?: { sub?: unknown; email?: unknown } };
  supabaseUser?: { id?: unknown; email?: unknown };
};

export type MarketflowInventoryAccessContext = {
  userId: string | null;
  canAccessReviewedInventory: boolean;
  canInitiateJv: boolean;
};

const REVIEWED_INVENTORY_TYPES = new Set([
  "wholesale",
  "wholesale_deal",
  "wholesale_assignment",
  "capital",
  "capital_project",
  "capital_raise",
  "listing",
]);

export function isReviewedMarketflowInventoryType(rawType: unknown): boolean {
  return (
    typeof rawType === "string" &&
    REVIEWED_INVENTORY_TYPES.has(
      rawType.trim().toLowerCase().replace(/[\s-]+/g, "_"),
    )
  );
}

function authenticatedIdentity(
  req: MarketflowInventoryRequest,
): { userId: string; email: string | null } | null {
  const normalizeId = (value: unknown): string | null =>
    typeof value === "string" && value.trim() ? value.trim() : null;
  const normalizeEmail = (value: unknown): string | null =>
    typeof value === "string" && value.trim()
      ? value.trim().toLowerCase()
      : null;
  const claimId = normalizeId(req.user?.claims?.sub);
  const supabaseId = normalizeId(req.supabaseUser?.id);

  // Both credentials are independently verified upstream. They must never be
  // combined across principals: the acting ID and role/email context need to
  // describe one identity or the request fails closed.
  if (claimId && supabaseId && claimId !== supabaseId) {
    return null;
  }

  const userId = claimId ?? supabaseId;
  if (!userId) return null;
  const claimEmail = normalizeEmail(req.user?.claims?.email);
  const supabaseEmail = normalizeEmail(req.supabaseUser?.email);

  return {
    userId,
    email: claimId
      ? claimEmail ?? (supabaseId === claimId ? supabaseEmail : null)
      : supabaseEmail,
  };
}

export function createResolveMarketflowInventoryAccessContext(
  dependencies: MarketflowInventoryAccessDependencies,
): (
  req: MarketflowInventoryRequest,
) => Promise<MarketflowInventoryAccessContext> {
  const adminEmails = new Set(
    dependencies.adminEmails.map((email) => email.trim().toLowerCase()),
  );

  return async (req) => {
    const identity = authenticatedIdentity(req);
    if (!identity) {
      return {
        userId: null,
        canAccessReviewedInventory: false,
        canInitiateJv: false,
      };
    }

    const isAdministrativeIdentity =
      identity.email !== null && adminEmails.has(identity.email);
    if (isAdministrativeIdentity) {
      return {
        userId: identity.userId,
        canAccessReviewedInventory: true,
        canInitiateJv: true,
      };
    }

    const [profile, assignedRoles] = await Promise.all([
      dependencies.getUserProfile(identity.userId),
      dependencies.getUserRoles(identity.userId),
    ]);
    const roles = [
      profile?.primary_role,
      ...assignedRoles.map((entry) => entry.role),
    ];
    const canAccessReviewedInventory =
      canAccessReviewedMarketflowInventory({
        isAuthenticated: true,
        isPegasusBadged: profile?.is_pegasus_badged,
        roles,
      });
    return {
      userId: identity.userId,
      canAccessReviewedInventory,
      canInitiateJv: canInitiateMarketflowJv({
        canAccessReviewedInventory,
        roles,
      }),
    };
  };
}

export function createResolveMarketflowInventoryAccess(
  dependencies: MarketflowInventoryAccessDependencies,
): (req: MarketflowInventoryRequest) => Promise<boolean> {
  const resolveContext =
    createResolveMarketflowInventoryAccessContext(dependencies);
  return async (req) =>
    (await resolveContext(req)).canAccessReviewedInventory;
}

export function createRequireMarketflowInventoryAccess(
  dependencies: MarketflowInventoryAccessDependencies,
): RequestHandler {
  const resolveContext =
    createResolveMarketflowInventoryAccessContext(dependencies);

  return async (req, res, next) => {
    try {
      const context = await resolveContext(req);
      if (!context.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!context.canAccessReviewedInventory) {
        return res.status(403).json({
          message: "Forbidden: reviewed MarketFlow access required",
        });
      }

      res.locals.marketflowInventoryAccessContext = context;
      res.locals.canAccessReviewedMarketflowInventory = true;
      return next();
    } catch (error) {
      console.error("Unable to verify MarketFlow inventory access:", error);
      return res.status(503).json({
        message: "Unable to verify MarketFlow access",
      });
    }
  };
}
