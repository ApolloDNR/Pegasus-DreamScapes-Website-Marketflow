import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { injectSeo } from "./seo-html";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // SPA fall-through. Wave 4: rewrite <title>/OG/Twitter tags per-route
  // so social-card crawlers (LinkedIn, iMessage, Slack, Twitter/X) see
  // correct metadata without executing client JS.
  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    const html = fs.readFileSync(indexPath, "utf-8");
    const pathname = (req.originalUrl || req.url || "/").split("?")[0];
    res.status(200).type("html").send(injectSeo(html, pathname));
  });
}
