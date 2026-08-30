// server/seo-html.ts
// Wave 4 — route-aware OG/Twitter injection for the HTML shell. Both
// dev (Vite middleware) and prod (static file) flows call this before
// shipping index.html so social-card crawlers see per-route metadata
// without executing client JS.

import { DEFAULT_OG_IMAGE, seoFor, SITE_URL } from "../shared/seo-routes";
import { normalizeSpaPath } from "../shared/spa-routes";
import { jsonLdScript } from "../shared/structured-data";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const HOMEPAGE_HERO_PRELOAD =
  /\s*<link\b(?=[^>]*\brel=["']preload["'])(?=[^>]*\bas=["']image["'])(?=[^>]*\bhref=["']\/images\/hero\/pegasus-v6-arrival\.webp["'])[^>]*>\s*/i;
const HOMEPAGE_HERO_PRELOAD_MARKER = "<!-- pegasus-homepage-lcp-preload -->";
const HOMEPAGE_HERO_PRELOAD_TAG =
  '<link rel="preload" as="image" href="/images/hero/pegasus-v6-arrival.webp" fetchpriority="high" />';

interface InjectSeoOptions {
  notFound?: boolean;
}

const NOT_FOUND_SEO = {
  title: "Page Not Found · Pegasus Dreamscapes",
  description:
    "The path you're looking for doesn't exist on the Pegasus Dreamscapes site. Return home or bring an opportunity for review.",
  image: DEFAULT_OG_IMAGE,
  type: "website" as const,
  noIndex: true,
};

const PRIVATE_NOINDEX_EXACT_PATHS = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/saved",
  "/strategy-lab/library",
  "/strategy-lab/submitted",
  "/strategy-lab/blueprint-confirmed",
  "/dashboard",
  "/hq",
  "/dealflow/hq",
]);

const PRIVATE_NOINDEX_PREFIXES: readonly RegExp[] = [
  /^\/admin(?:\/|$)/,
  /^\/snapshot(?:\/|$)/,
  /^\/profile(?:\/|$)/,
  /^\/offer-studio(?:\/|$)/,
  /^\/dealflow\/project(?:\/|$)/,
];

const PUBLIC_MARKETFLOW_PATHS = new Set([
  "/marketflow",
  "/marketflow/access",
  "/marketflow/buyboxes",
]);

/**
 * Raw HTML for account, operator, token, and administrative surfaces must not
 * inherit the public-home canonical or structured data before React hydrates.
 */
export function isPrivateNoindexSpaPath(path: string): boolean {
  const pathname = normalizeSpaPath(path);

  if (PRIVATE_NOINDEX_EXACT_PATHS.has(pathname)) return true;
  if (PRIVATE_NOINDEX_PREFIXES.some((pattern) => pattern.test(pathname))) {
    return true;
  }
  if (pathname.startsWith("/marketflow/")) {
    return !PUBLIC_MARKETFLOW_PATHS.has(pathname);
  }
  return false;
}

export function injectSeo(
  html: string,
  pathname: string,
  { notFound = false }: InjectSeoOptions = {},
): string {
  const normalizedPathname = normalizeSpaPath(pathname);
  const m = notFound ? NOT_FOUND_SEO : seoFor(normalizedPathname);
  const suppressIndexing =
    notFound || m.noIndex === true || isPrivateNoindexSpaPath(normalizedPathname);
  const url = `${SITE_URL}${normalizedPathname === "/" ? "" : normalizedPathname}`;
  const title = esc(m.title);
  const description = esc(m.description);
  const image = esc(m.image);
  const type = m.type ?? "website";

  let out = html;
  // Keep the static shell route-neutral. The real server can identify the
  // document route, so only its homepage response receives the early LCP hint.
  if (normalizedPathname === "/") {
    out = out.replace(
      HOMEPAGE_HERO_PRELOAD_MARKER,
      `${HOMEPAGE_HERO_PRELOAD_MARKER}\n    ${HOMEPAGE_HERO_PRELOAD_TAG}`,
    );
  } else {
    out = out.replace(HOMEPAGE_HERO_PRELOAD, "\n");
  }
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  out = replaceMeta(out, 'name="description"', description);
  if (suppressIndexing) {
    out = replaceMeta(out, 'name="robots"', "noindex, nofollow");
  }
  out = replaceMeta(out, 'property="og:title"', title);
  out = replaceMeta(out, 'property="og:description"', description);
  out = replaceMeta(out, 'property="og:url"', esc(url));
  out = replaceMeta(out, 'property="og:image"', image);
  out = replaceMeta(out, 'property="og:type"', type);
  out = replaceMeta(out, 'name="twitter:title"', title);
  out = replaceMeta(out, 'name="twitter:description"', description);
  out = replaceMeta(out, 'name="twitter:image"', image);
  if (suppressIndexing) {
    out = removeCanonical(out);
  } else {
    out = out.replace(
      /<link rel="canonical"[^>]*>/i,
      `<link rel="canonical" href="${esc(url)}" />`,
    );
  }
  out = suppressIndexing
    ? removeJsonLd(out)
    : injectJsonLd(out, normalizedPathname);
  return out;
}

function removeCanonical(html: string): string {
  return html.replace(/\s*<link\b[^>]*\brel=["']canonical["'][^>]*>/gi, "");
}

function removeJsonLd(html: string): string {
  return html.replace(
    /\s*<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi,
    "\n",
  );
}

function injectJsonLd(html: string, pathname: string): string {
  const script = jsonLdScript(pathname);
  // Replace the baseline JSON-LD block from index.html with the route-aware
  // graph. The `s` flag makes `.` span the multi-line script body.
  const re = /<script type="application\/ld\+json">[\s\S]*?<\/script>/i;
  if (re.test(html)) {
    return html.replace(re, script);
  }
  return html.replace(/<\/head>/i, `  ${script}\n  </head>`);
}

function replaceMeta(html: string, attr: string, value: string): string {
  // attr is a trusted constant like `name="description"` or `property="og:title"`.
  // Escape characters that are regex-significant before building the matcher.
  const safeAttr = attr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`<meta\\s+${safeAttr}\\s+content="[^"]*"\\s*\\/?\\s*>`, "i");
  if (re.test(html)) {
    return html.replace(re, `<meta ${attr} content="${value}" />`);
  }
  return html.replace(/<\/head>/i, `  <meta ${attr} content="${value}" />\n  </head>`);
}
