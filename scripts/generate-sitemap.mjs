#!/usr/bin/env node
// scripts/generate-sitemap.mjs
//
// Wave 4 — build-time sitemap generator. Writes public/sitemap.xml
// from the canonical v1.0.1 public route map. The server also exposes
// /sitemap.xml dynamically (server/routes.ts); this script keeps the
// static file in sync for crawlers that hit the file directly and for
// any static-host deployments.
//
// Usage: `node scripts/generate-sitemap.mjs`
// Intended to be run before `npm run build` (and any time the public
// route map changes).

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SITE = "https://pegasusdreamscapes.com";

// Canonical v1.0.1 public route map. Keep in sync with
// client/src/lib/nav.ts NAV_PRIMARY + NAV_MORE and server/routes.ts.
const ROUTES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/strategy-lab", changefreq: "weekly", priority: "0.9" },
  { path: "/projects", changefreq: "weekly", priority: "0.9" },
  { path: "/projects/nelson-dr", changefreq: "monthly", priority: "0.8" },
  { path: "/development", changefreq: "monthly", priority: "0.8" },
  { path: "/marketflow", changefreq: "weekly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/submit", changefreq: "monthly", priority: "0.9" },
  { path: "/library", changefreq: "weekly", priority: "0.7" },
  { path: "/capital", changefreq: "monthly", priority: "0.6" },
  { path: "/vendor-network", changefreq: "monthly", priority: "0.6" },
  { path: "/connect", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/marketflow/access", changefreq: "monthly", priority: "0.5" },
  { path: "/disclosures", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

const today = new Date().toISOString().slice(0, 10);

const body = ROUTES.map(
  (r) =>
    `  <url><loc>${SITE}${r.path}</loc><lastmod>${today}</lastmod><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`,
).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

const outDirs = [path.join(ROOT, "public"), path.join(ROOT, "client/public")];
for (const dir of outDirs) {
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "sitemap.xml"), xml, "utf8");
  console.log(`wrote ${path.relative(ROOT, path.join(dir, "sitemap.xml"))} (${ROUTES.length} routes)`);
}
