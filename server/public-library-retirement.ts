import type { Express, RequestHandler } from "express";

const retiredLibraryResponse: RequestHandler = (_req, res) => {
  res.status(410).json({ message: "Public Strategy Library is retired" });
};

export function registerPublicLibraryRetirementRoutes(app: Express): void {
  app.get(
    [
      "/library",
      "/library/:slug",
      "/resources",
      "/education",
      "/strategy-library",
    ],
    (_req, res) => {
      res.redirect(302, "/strategy-lab");
    },
  );

  app.get(
    [
      "/api/articles",
      "/api/articles/library",
      "/api/articles/:slug",
      "/api/library/beginner-path",
      "/api/library/glossary",
    ],
    retiredLibraryResponse,
  );
}
