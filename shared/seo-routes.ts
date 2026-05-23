// shared/seo-routes.ts
// Wave 4 — canonical per-route SEO metadata. Source of truth for both
// the client (useSEO mirrors these on hydration) and the server
// (server/seo-html.ts injects them into the HTML shell at request time
// so social-card crawlers see the right tags without executing JS).

export interface SeoRoute {
  title: string;
  description: string;
  image: string;
  type?: "website" | "article";
}

const BRAND = "Pegasus DreamScapes";
const tag = (page: string) => `${page} · ${BRAND}`;

export const SITE_URL = "https://pegasusdreamscapes.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.png`;

export const SEO_ROUTES: Record<string, SeoRoute> = {
  "/": {
    title: BRAND,
    description:
      "Strategy-first real estate operating company. Complex property, structured opportunity. Every property gets a path.",
    image: `${SITE_URL}/og/home.png`,
  },
  "/about": {
    title: tag("About"),
    description:
      "Founded by Paolo Apollo Duran. Built on strategy. Governed by virtue. Executed with discipline.",
    image: `${SITE_URL}/og/about.png`,
  },
  "/strategy-lab": {
    title: tag("Strategy Lab"),
    description:
      "Bring us the property. We will show you the path. Quick Read and Full Path strategy reviews.",
    image: `${SITE_URL}/og/strategy-lab.png`,
  },
  "/projects": {
    title: tag("Projects"),
    description:
      "Selected case studies from the Pegasus DreamScapes portfolio. Every property gets a path.",
    image: `${SITE_URL}/og/projects.png`,
  },
  "/projects/nelson-dr": {
    title: tag("Nelson Dr"),
    description:
      "Nelson Dr case study. Situation, strategy, structure, scope, execution, result, lesson.",
    image: `${SITE_URL}/og/nelson-dr.png`,
  },
  "/development": {
    title: tag("Development"),
    description:
      "Development pathway: ADU, value-add, small-scale residential today; trajectory toward larger scale.",
    image: `${SITE_URL}/og/default.png`,
  },
  "/marketflow": {
    title: tag("MarketFlow"),
    description:
      "MarketFlow is the private dealflow layer for Pegasus DreamScapes. Request beta access.",
    image: `${SITE_URL}/og/marketflow.png`,
  },
  "/marketflow/access": {
    title: tag("Request MarketFlow Beta Access"),
    description:
      "Request beta access to MarketFlow, the private dealflow layer for Pegasus DreamScapes.",
    image: `${SITE_URL}/og/marketflow.png`,
  },
  "/submit": {
    title: tag("Submit a Property"),
    description:
      "Submit a property for strategy review. Most Strategy Snapshots are reviewed within 5 business days.",
    image: `${SITE_URL}/og/submit.png`,
  },
  "/capital": {
    title: tag("Capital"),
    description:
      "Capital conversations, not pitches. Written agreement on every deal. Private, individual, and on the record.",
    image: `${SITE_URL}/og/capital.png`,
  },
  "/connect": {
    title: tag("Connect"),
    description:
      "Apollo's direct routing. Property, build, sell, capital, vendor, or a conversation.",
    image: `${SITE_URL}/og/default.png`,
  },
  "/contact": {
    title: tag("Contact"),
    description:
      "apollo@pegasusdreamscapes.com · 925.744.8525 · Pleasant Hill, CA. 48-hour response.",
    image: `${SITE_URL}/og/default.png`,
  },
  "/library": {
    title: tag("Strategy Library"),
    description:
      "Field notes on complex property, structured opportunity, and the strategy-first operating model.",
    image: `${SITE_URL}/og/default.png`,
  },
  "/vendor-network": {
    title: tag("Vendor Network"),
    description:
      "Qualified vendor partners for the Pegasus DreamScapes operating system. Apply to join.",
    image: `${SITE_URL}/og/default.png`,
  },
  "/disclosures": {
    title: tag("Disclosures"),
    description:
      "DRE #02333658. Keller Williams East Bay. Each office is independently owned and operated.",
    image: `${SITE_URL}/og/default.png`,
  },
  "/privacy": {
    title: tag("Privacy"),
    description:
      "Pegasus DreamScapes privacy notice. Draft pending qualified legal review.",
    image: `${SITE_URL}/og/default.png`,
  },
  "/terms": {
    title: tag("Terms"),
    description:
      "Pegasus DreamScapes terms of use. Draft pending qualified legal review.",
    image: `${SITE_URL}/og/default.png`,
  },
};

export function seoFor(pathname: string): SeoRoute {
  const exact = SEO_ROUTES[pathname];
  if (exact) return exact;
  if (pathname.startsWith("/projects/")) return SEO_ROUTES["/projects"];
  if (pathname.startsWith("/library/")) return SEO_ROUTES["/library"];
  if (pathname.startsWith("/marketflow/")) return SEO_ROUTES["/marketflow"];
  return SEO_ROUTES["/"];
}
