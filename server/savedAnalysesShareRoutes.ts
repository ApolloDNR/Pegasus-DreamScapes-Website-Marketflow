import type { Express, Response, NextFunction, RequestHandler } from "express";
import { storage } from "./storage";

export interface ShareRoutesDeps {
  isAuthenticated: RequestHandler;
}

export function registerSavedAnalysesShareRoutes(
  app: Express,
  { isAuthenticated }: ShareRoutesDeps,
): void {
  app.get("/api/shared-analyses/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const analysis = await storage.getSavedAnalysisByShareToken(token);
      if (!analysis) {
        return res.status(404).json({ message: "Shared analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching shared analysis:", error);
      res.status(500).json({ message: "Failed to fetch shared analysis" });
    }
  });

  app.patch(
    "/api/saved-analyses/:id",
    isAuthenticated,
    async (req: any, res: Response, _next: NextFunction) => {
      try {
        const id = Number(req.params.id);
        const userId = req.user.claims.sub;

        const existing = await storage.getSavedAnalysis(id);
        if (!existing) {
          return res.status(404).json({ message: "Analysis not found" });
        }
        if (existing.userId !== userId) {
          return res.status(403).json({ message: "Not authorized" });
        }

        const body = (req.body ?? {}) as {
          name?: string;
          notes?: string | null;
          isShared?: boolean;
          tags?: string[] | null;
        };
        const patch: {
          name?: string;
          notes?: string | null;
          isShared?: boolean;
          tags?: string[] | null;
        } = {};
        if (typeof body.name === "string") patch.name = body.name;
        if (body.notes === null || typeof body.notes === "string")
          patch.notes = body.notes;
        if (typeof body.isShared === "boolean") patch.isShared = body.isShared;
        if (body.tags === null || Array.isArray(body.tags))
          patch.tags = body.tags;

        const analysis = await storage.updateSavedAnalysis(id, patch);
        res.json(analysis);
      } catch (error) {
        console.error("Error updating analysis:", error);
        res.status(500).json({ message: "Failed to update analysis" });
      }
    },
  );
}
