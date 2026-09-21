import type { Express, RequestHandler } from "express";

const SELF_PROVISIONABLE_ROLES = new Set([
  "wholesaler",
  "dreamscaper",
  "investor",
  "buyer_retail",
  "buyer_investment",
]);

const SELF_PROVISIONING_FIELDS = new Set(["userId", "role", "displayName"]);

function includesUnsupportedProvisioningField(body: unknown): boolean {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;

  return Object.keys(body).some((key) => !SELF_PROVISIONING_FIELDS.has(key));
}

type UserRoleRecord = {
  role: string;
};

type UserProvisioningDependencies = {
  isAuthenticated: RequestHandler;
  createUserProfile: (
    userId: string,
    profile: { primary_role: string; display_name: string },
  ) => Promise<unknown>;
  createUserReputation: (userId: string) => Promise<unknown>;
  getUserRoles: (userId: string) => Promise<UserRoleRecord[]>;
  addUserRole: (entry: { userId: string; role: string }) => Promise<unknown>;
};

function authenticatedUserId(req: {
  user?: { claims?: { sub?: unknown } };
  supabaseUser?: { id?: unknown; claims?: { sub?: unknown } };
}): string | null {
  const candidate =
    req.supabaseUser?.id ??
    req.supabaseUser?.claims?.sub ??
    req.user?.claims?.sub;
  return typeof candidate === "string" && candidate.trim()
    ? candidate.trim()
    : null;
}

export function registerUserProvisioningRoute(
  app: Express,
  dependencies: UserProvisioningDependencies,
): void {
  app.post(
    "/api/supabase/provision-user",
    dependencies.isAuthenticated,
    async (req, res) => {
      const currentUserId = authenticatedUserId(req);
      if (!currentUserId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (includesUnsupportedProvisioningField(req.body)) {
        return res.status(400).json({
          message: "Approval and access fields cannot be self-provisioned",
        });
      }

      const userId =
        typeof req.body?.userId === "string" ? req.body.userId.trim() : "";
      const role =
        typeof req.body?.role === "string" ? req.body.role.trim() : "";
      const displayName =
        typeof req.body?.displayName === "string"
          ? req.body.displayName.trim()
          : "";

      if (!userId || !role || !displayName) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (userId !== currentUserId) {
        return res
          .status(403)
          .json({ message: "Users may only provision their own account" });
      }

      if (!SELF_PROVISIONABLE_ROLES.has(role)) {
        return res
          .status(403)
          .json({ message: "This role requires administrative approval" });
      }

      let existingRoles: UserRoleRecord[];
      try {
        existingRoles = await dependencies.getUserRoles(currentUserId);
      } catch (error) {
        console.error("Unable to verify existing roles during provisioning:", error);
        return res
          .status(503)
          .json({ message: "Unable to verify account provisioning" });
      }

      if (
        existingRoles.length > 0 &&
        !existingRoles.some((entry) => entry.role === role)
      ) {
        return res
          .status(403)
          .json({ message: "Existing account roles cannot be changed here" });
      }

      try {
        await dependencies.createUserProfile(currentUserId, {
          primary_role: role,
          display_name: displayName,
        });
        await dependencies.createUserReputation(currentUserId);
      } catch {
        console.info(
          "Supabase provisioning unavailable; retaining PostgreSQL account fallback",
        );
      }

      if (existingRoles.length === 0) {
        try {
          await dependencies.addUserRole({ userId: currentUserId, role });
        } catch (error) {
          console.info("PostgreSQL role assignment unavailable:", error);
        }
      }

      return res.json({ success: true });
    },
  );
}
