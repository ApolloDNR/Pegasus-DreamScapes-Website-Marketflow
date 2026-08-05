import type { RequestHandler } from "express";
import { canAccessReviewedMarketflowInventory } from "@shared/marketflow-inventory-access";

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
  const supabaseId = req.supabaseUser?.id;
  const claimId = req.user?.claims?.sub;
  const candidate =
    typeof supabaseId === "string" && supabaseId.trim()
      ? supabaseId
      : claimId;
  if (typeof candidate !== "string" || !candidate.trim()) {
    return null;
  }

  const emailCandidate =
    req.supabaseUser?.email ?? req.user?.claims?.email;
  return {
    userId: candidate.trim(),
    email:
      typeof emailCandidate === "string" && emailCandidate.trim()
        ? emailCandidate.trim().toLowerCase()
        : null,
  };
}

export function createResolveMarketflowInventoryAccess(
  dependencies: MarketflowInventoryAccessDependencies,
): (req: MarketflowInventoryRequest) => Promise<boolean> {
  const adminEmails = new Set(
    dependencies.adminEmails.map((email) => email.trim().toLowerCase()),
  );

  return async (req) => {
    const identity = authenticatedIdentity(req);
    if (!identity) {
      return false;
    }

    if (
      canAccessReviewedMarketflowInventory({
        isAuthenticated: true,
        isStaff: identity.email !== null && adminEmails.has(identity.email),
      })
    ) {
      return true;
    }

    const [profile, assignedRoles] = await Promise.all([
      dependencies.getUserProfile(identity.userId),
      dependencies.getUserRoles(identity.userId),
    ]);
    return canAccessReviewedMarketflowInventory({
      isAuthenticated: true,
      isPegasusBadged: profile?.is_pegasus_badged,
      roles: [
        profile?.primary_role,
        ...assignedRoles.map((entry) => entry.role),
      ],
    });
  };
}

export function createRequireMarketflowInventoryAccess(
  dependencies: MarketflowInventoryAccessDependencies,
): RequestHandler {
  const resolveAccess = createResolveMarketflowInventoryAccess(dependencies);

  return async (req, res, next) => {
    const identity = authenticatedIdentity(req);
    if (!identity) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const isApproved = await resolveAccess(req);

      if (!isApproved) {
        return res.status(403).json({
          message: "Forbidden: reviewed MarketFlow access required",
        });
      }

      return next();
    } catch (error) {
      console.error("Unable to verify MarketFlow inventory access:", error);
      return res.status(503).json({
        message: "Unable to verify MarketFlow access",
      });
    }
  };
}
