#!/usr/bin/env node

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SITE = "https://pegasusdreamscapes.com";

const requiredRoutes = [
  "/",
  "/submit",
  "/deal-architecture",
  "/strategy-lab",
  "/projects",
  "/projects/nelson-dr",
  "/development",
  "/work-with-apollo",
  "/marketflow",
  "/about",
  "/ecosystem",
  "/dreamscaper-standard",
  "/peggy-ai",
  "/library",
  "/capital",
  "/vendor-network",
  "/contact",
  "/connect",
  "/marketflow/access",
  "/disclosures",
  "/privacy",
  "/terms",
];

const retiredRoutes = [
  "/sell",
  "/invest",
  "/services",
  "/resources",
  "/education",
  "/systems",
  "/wholesale",
  "/buyers",
  "/capital-raising",
];

const requiredRobotDisallows = [
  "/api/",
  "/hq",
  "/admin",
  "/dashboard",
  "/login",
  "/signup",
  "/marketflow/admin",
  "/marketflow/dashboard",
  "/offer-studio",
  "/profile/",
];

const requiredEnvKeys = [
  "DATABASE_URL",
  "SITE_URL",
  "STAFF_NOTIFICATION_EMAIL",
  "PEGASUS_HQ_PUBLIC_INTAKE_URL",
  "VITE_CTA_EVENTS_ENABLED",
  "VITE_PORTAL_SERVICES_ENABLED",
];

const requiredRootPublicFiles = [
  "public/apple-touch-icon.png",
  "public/favicon.png",
  "public/favicon.svg",
  "public/icon-192.png",
  "public/icon-512.png",
  "public/robots.txt",
  "public/sitemap.xml",
  "public/brand/pegasus-mark.svg",
  "public/brand/pegasus-wordmark.svg",
  "public/og/default.png",
];

const scanTargets = [
  "README.md",
  "client/index.html",
  "client/src",
  "server",
  "shared",
  "public/brand",
  "script/build.ts",
  "scripts/generate-og.mjs",
  "scripts/generate-sitemap.mjs",
  "scripts/seed-supabase.ts",
];

const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".jsx",
  ".mjs",
  ".svg",
  ".ts",
  ".tsx",
  ".txt",
  ".xml",
]);

let checks = 0;
const failures = [];

function relPath(absPath) {
  return path.relative(ROOT, absPath).replaceAll(path.sep, "/");
}

function requireCheck(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

async function readProjectFile(projectPath) {
  return readFile(path.join(ROOT, projectPath), "utf8");
}

async function exists(projectPath) {
  try {
    await stat(path.join(ROOT, projectPath));
    return true;
  } catch {
    return false;
  }
}

async function collectTextFiles(projectPath) {
  const absolutePath = path.join(ROOT, projectPath);
  const info = await stat(absolutePath);
  if (info.isFile()) {
    return textExtensions.has(path.extname(absolutePath)) ? [absolutePath] : [];
  }

  const entries = await readdir(absolutePath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;
    const childPath = path.join(absolutePath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectTextFiles(relPath(childPath))));
    } else if (textExtensions.has(path.extname(entry.name))) {
      files.push(childPath);
    }
  }
  return files;
}

function extractSitemapRoutes(xml) {
  return new Set(
    [...xml.matchAll(new RegExp(`<loc>${SITE.replaceAll("/", "\\/")}([^<]*)<\\/loc>`, "g"))].map(
      ([, route]) => route || "/",
    ),
  );
}

const sitemap = await readProjectFile("public/sitemap.xml");
const clientSitemap = await readProjectFile("client/public/sitemap.xml");
const robots = await readProjectFile("public/robots.txt");
const envExample = await readProjectFile(".env.example");
const generatedRoutesSource = await readProjectFile("scripts/generate-sitemap.mjs");
const serverRoutesSource = await readProjectFile("server/routes.ts");
const buildScriptSource = await readProjectFile("script/build.ts");

const sitemapRoutes = extractSitemapRoutes(sitemap);
const clientSitemapRoutes = extractSitemapRoutes(clientSitemap);

for (const route of requiredRoutes) {
  requireCheck(sitemapRoutes.has(route), `public/sitemap.xml is missing ${route}`);
  requireCheck(clientSitemapRoutes.has(route), `client/public/sitemap.xml is missing ${route}`);
  requireCheck(generatedRoutesSource.includes(`path: "${route}"`), `generate-sitemap route map is missing ${route}`);
  requireCheck(serverRoutesSource.includes(`path: '${route}'`), `server sitemap route map is missing ${route}`);
}

for (const route of retiredRoutes) {
  requireCheck(!sitemapRoutes.has(route), `public/sitemap.xml still lists retired route ${route}`);
  requireCheck(!clientSitemapRoutes.has(route), `client/public/sitemap.xml still lists retired route ${route}`);
}

requireCheck(!sitemap.includes("<lastmod>2026-05-23</lastmod>"), "public/sitemap.xml has stale 2026-05-23 lastmod values");
requireCheck(!clientSitemap.includes("<lastmod>2026-05-23</lastmod>"), "client/public/sitemap.xml has stale 2026-05-23 lastmod values");

for (const disallow of requiredRobotDisallows) {
  requireCheck(robots.includes(`Disallow: ${disallow}`), `public/robots.txt is missing Disallow: ${disallow}`);
}
requireCheck(robots.includes(`Sitemap: ${SITE}/sitemap.xml`), "public/robots.txt is missing the production sitemap URL");

for (const key of requiredEnvKeys) {
  requireCheck(new RegExp(`^${key}=`, "m").test(envExample), `.env.example is missing ${key}`);
}

for (const file of requiredRootPublicFiles) {
  requireCheck(await exists(file), `${file} is missing from the root public launch assets`);
}
requireCheck(
  buildScriptSource.includes('cp("public", "dist/public"'),
  "script/build.ts does not copy root public launch assets into dist/public",
);

const filesToScan = [];
for (const target of scanTargets) {
  filesToScan.push(...(await collectTextFiles(target)));
}

for (const file of filesToScan) {
  const text = await readFile(file, "utf8");
  const label = relPath(file);
  requireCheck(!text.includes("fonts.googleapis.com"), `${label} references Google Fonts`);
  requireCheck(!text.includes("fonts.gstatic.com"), `${label} references Google font assets`);
  requireCheck(!text.includes("Pegasus DreamScapes"), `${label} uses stale Pegasus DreamScapes casing`);
  requireCheck(!text.includes("DreamScapes"), `${label} uses stale DreamScapes casing`);
  requireCheck(!/pegasus[A-Z][A-Za-z]*scapes\.com/i.test(text.replaceAll("pegasusdreamscapes.com", "")), `${label} uses mixed-case pegasusdreamscapes.com domain casing`);
  requireCheck(!/\bPaolo\b/.test(text), `${label} still references Paolo in public/runtime text`);
}

if (failures.length) {
  console.error("Launch readiness audit failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Launch readiness audit passed (${checks} checks).`);
