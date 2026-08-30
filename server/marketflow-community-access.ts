import type { Express, RequestHandler } from "express";

type MarketflowCommunityAccessDependencies = {
  isAuthenticated: RequestHandler;
  requireApprovedAccess: RequestHandler;
};

/**
 * Keeps the complete community namespace behind the same governed-access
 * boundary as private MarketFlow inventory. Register this before every
 * `/api/community` handler so new endpoints inherit the boundary by default.
 */
export function registerMarketflowCommunityGate(
  app: Express,
  dependencies: MarketflowCommunityAccessDependencies,
): void {
  app.use(
    "/api/community",
    dependencies.isAuthenticated,
    dependencies.requireApprovedAccess,
  );
}
