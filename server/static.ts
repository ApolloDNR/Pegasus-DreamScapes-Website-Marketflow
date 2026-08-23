import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { injectSeo } from "./seo-html";
import { isKnownSpaPath, normalizeSpaPath } from "../shared/spa-routes";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.get("/index.html", (_req, res) => {
    res.redirect(308, "/");
  });

  // Keep index documents behind the route-aware fallback below. Assets still
  // use express.static, but `/` must receive injected SEO and homepage LCP
  // metadata instead of the neutral build shell.
  app.use(express.static(distPath, { index: false }));

  // SPA fall-through. Wave 4: rewrite <title>/OG/Twitter tags per-route
  // so social-card crawlers (LinkedIn, iMessage, Slack, Twitter/X) see
  // correct metadata without executing client JS.
  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    const html = fs.readFileSync(indexPath, "utf-8");
    const pathname = normalizeSpaPath(req.originalUrl || req.url || "/");
    if (pathname === "/library" || pathname.startsWith("/library/")) {
      res.redirect(302, "/strategy-lab");
      return;
    }
    const notFound = !isKnownSpaPath(pathname);
    res
      .status(notFound ? 404 : 200)
      .type("html")
      .send(injectSeo(html, pathname, { notFound }));
  });
}
