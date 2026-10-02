import type { Express, RequestHandler } from "express";
import { canReadUserProfile } from "./user-profile-access";

type UserProfileRouteDependencies = {
  isAuthenticated: RequestHandler;
  getAuthenticatedUserId: (req: unknown) => string | null;
  loadUserProfile: (userId: string) => Promise<unknown | null>;
};

export function registerUserProfileRoute(
  app: Express,
  dependencies: UserProfileRouteDependencies,
): void {
  app.get(
    "/api/supabase/profile/:userId",
    dependencies.isAuthenticated,
    async (req, res) => {
      try {
        const targetUserId = req.params.userId?.trim();
        const requesterUserId = dependencies.getAuthenticatedUserId(req);

        if (!requesterUserId) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        if (
          !targetUserId ||
          !canReadUserProfile({ requesterUserId, targetUserId })
        ) {
          return res.status(404).json({ message: "Profile not found" });
        }

        const profile = await dependencies.loadUserProfile(targetUserId);
        if (!profile) {
          return res.status(404).json({ message: "Profile not found" });
        }

        return res.json(profile);
      } catch (error) {
        console.error("Error fetching profile:", error);
        return res.status(500).json({ message: "Failed to fetch profile" });
      }
    },
  );
}
