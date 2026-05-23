// server/seo-html.ts
// Wave 4 — route-aware OG/Twitter injection for the HTML shell. Both
// dev (Vite middleware) and prod (static file) flows call this before
// shipping index.html so social-card crawlers see per-route metadata
// without executing client JS.

import { seoFor, SITE_URL } from "../shared/seo-routes";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function injectSeo(html: string, pathname: string): string {
  const m = seoFor(pathname);
  const url = `${SITE_URL}${pathname === "/" ? "" : pathname}`;
  const title = esc(m.title);
  const description = esc(m.description);
  const image = esc(m.image);
  const type = m.type ?? "website";

  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  out = replaceMeta(out, 'name="description"', description);
  out = replaceMeta(out, 'property="og:title"', title);
  out = replaceMeta(out, 'property="og:description"', description);
  out = replaceMeta(out, 'property="og:url"', url);
  out = replaceMeta(out, 'property="og:image"', image);
  out = replaceMeta(out, 'property="og:type"', type);
  out = replaceMeta(out, 'name="twitter:title"', title);
  out = replaceMeta(out, 'name="twitter:description"', description);
  out = replaceMeta(out, 'name="twitter:image"', image);
  out = out.replace(
    /<link rel="canonical"[^>]*>/i,
    `<link rel="canonical" href="${esc(url)}" />`,
  );
  return out;
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
