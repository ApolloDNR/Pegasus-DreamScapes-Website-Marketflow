import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { injectSeo } from "./seo-html";
import { isKnownSpaPath, normalizeSpaPath } from "../shared/spa-routes";

export interface StaticServingOptions {
  assetMode?: "express" | "function";
  distPath?: string;
}

function resolveAssetPath(distPath: string, requestPath: string): string | null {
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(requestPath);
  } catch {
    return null;
  }
  if (!decodedPath.startsWith("/") || decodedPath.includes("\0")) return null;

  const candidate = path.resolve(distPath, `.${decodedPath}`);
  const relative = path.relative(distPath, candidate);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }
  return candidate;
}

export function serveStatic(
  app: Express,
  options: StaticServingOptions = {},
) {
  const distPath = options.distPath ?? path.resolve(__dirname, "public");
  const assetMode = options.assetMode ?? "express";
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
  if (assetMode === "function") {
    // Vercel's Express preset intentionally ignores express.static(). The
    // preview adapter includes dist/public in the function bundle, so serve
    // concrete asset files through an ordinary route before the SPA fallback.
    app.get("*", (req, res, next) => {
      const assetPath = resolveAssetPath(distPath, req.path);
      if (!assetPath) return next();
      try {
        if (!fs.statSync(assetPath).isFile()) return next();
      } catch {
        return next();
      }
      return res.sendFile(assetPath);
    });
  } else {
    app.use(express.static(distPath, { index: false }));
  }

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
