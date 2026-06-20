// shared/seo-routes.ts
// Canonical per-route SEO metadata. Single source of truth for both the
// server (server/seo-html.ts injects these into the HTML shell at request
// time so social-card crawlers see the right tags without executing JS) and
// the Pegasus prototype client shell (client/src/pegasus/Landing.tsx feeds
// these to the shared useSEO hook so titles/descriptions update on client
// navigation too). Descriptions are kept <=155 chars and grounded in each
// page's real one-job from the Website Director intent map — no invented
// claims, no banned filler.

export interface SeoRoute {
  title: string;
  description: string;
  image: string;
  type?: "website" | "article";
}

export const BRAND = "Pegasus Dreamscapes";
const tag = (page: string) => `${page} · ${BRAND}`;

export const SITE_URL = "https://pegasusdreamscapes.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.png`;

export const SEO_ROUTES: Record<string, SeoRoute> = {
  "/": {
    title: BRAND,
    description:
      "Strategy-first real estate in the East Bay. We read the property and the numbers once, then map the path: sell, reposition, build, or partner.",
    image: `${SITE_URL}/og/home.png`,
  },

  // ---- Who We Serve ----
  "/sellers": {
    title: tag("Sellers & Owners"),
    description:
      "For owners with a complex or stuck property — inherited, distressed, occupied, or stalled. Get a clear written read and a real route forward.",
    image: `${SITE_URL}/og/sellers.png`,
  },
  "/buyers": {
    title: tag("Buyers"),
    description:
      "Buy a finished home or buy into a deal with an investor's read — underwritten on real numbers before you commit. East Bay and beyond.",
    image: `${SITE_URL}/og/buyers.png`,
  },
  "/dealfinders": {
    title: tag("Deal Finders & Wholesalers"),
    description:
      "Bring a deal to Pegasus once and get a straight answer, written terms, and one buyer who actually closes. No mass blasts, no run-around.",
    image: `${SITE_URL}/og/dealfinders.png`,
  },
  "/operators": {
    title: tag("Operators & Vendors"),
    description:
      "GCs, subcontractors, agents, and title — join the Pegasus build bench and get matched to projects that fit your trade and your capacity.",
    image: `${SITE_URL}/og/operators.png`,
  },
  "/referral": {
    title: tag("Referral Partners"),
    description:
      "Send one name. We handle the relationship and put any referral fee in writing before anything moves. A clean, accountable handoff.",
    image: `${SITE_URL}/og/referral.png`,
  },

  // ---- Capital partners ----
  "/capital": {
    title: tag("Capital Partners"),
    description:
      "Back specific real estate projects on defined terms, not blind pools. See how capital partners engage with us, with the risk laid out plainly.",
    image: `${SITE_URL}/og/capital.png`,
  },
  // ---- What We Do ----
  "/deal-strategy": {
    title: tag("Deal Strategy"),
    description:
      "How a property becomes a plan: we read the situation and the numbers once, then map the route — sell, reposition, build, or partner.",
    image: `${SITE_URL}/og/deal-strategy.png`,
  },
  "/investments": {
    title: tag("Investments"),
    description:
      "We acquire distressed, dated, and overlooked property, reposition it with discipline, and exit on a plan written before we close.",
    image: `${SITE_URL}/og/investments.png`,
  },
  "/development": {
    title: tag("Development"),
    description:
      "Our development team scopes every renovation and ground-up build to a real budget and draw schedule, and delivers finished, on time.",
    image: `${SITE_URL}/og/development.png`,
  },
  "/strategy-lab": {
    title: tag("Strategy Lab"),
    description:
      "Model a deal yourself in minutes. The Strategy Lab returns strategy-tier ranges, likely lanes, and the risks — directional, not a CMA or appraisal.",
    image: `${SITE_URL}/og/strategy-lab.png`,
  },
  "/marketflow": {
    title: tag("MarketFlow"),
    description:
      "The private deal network: three lanes that move deals, match capital to projects, and place finished inventory, each verified end to end.",
    image: `${SITE_URL}/og/marketflow.png`,
  },
  "/marketflow/access": {
    title: tag("Request MarketFlow Access"),
    description:
      "Request access to MarketFlow, the private deal network for Pegasus Dreamscapes. Membership is reviewed by a person, not opened to everyone.",
    image: `${SITE_URL}/og/marketflow.png`,
  },
  "/marketflow/buyboxes": {
    title: tag("Pegasus Buyboxes"),
    description:
      "Four named Pegasus Buyboxes with target geographies, deal types, and underwriting bands. Request a notification when a fit shows up.",
    image: `${SITE_URL}/og/marketflow.png`,
  },
  "/ecosystem": {
    title: tag("The Pegasus Ecosystem"),
    description:
      "The full Pegasus operating system: HQ, PeggyAI, Strategy Lab, MarketFlow, CapStack, and BuildForge, one underwriting standard across every part.",
    image: `${SITE_URL}/og/ecosystem.png`,
  },

  // ---- Company / proof / contact ----
  "/work-with-apollo": {
    title: tag("Represent With Apollo"),
    description:
      "Licensed representation with Apollo Duran through Keller Williams East Bay — list, buy, or work through a complex situation. DRE #02333658.",
    image: `${SITE_URL}/og/work-with-apollo.png`,
  },
  "/peggy": {
    title: tag("Peggy"),
    description:
      "Describe your deal in plain language. Peggy is an intake assistant — she frames your options and routes you to the next step. No offers, no advice.",
    image: `${SITE_URL}/og/peggy.png`,
  },
  "/about": {
    title: tag("About"),
    description:
      "Who Apollo Duran is and the discipline behind Pegasus: read the situation, underwrite real numbers, write the exit first, deliver a finished product.",
    image: `${SITE_URL}/og/about.png`,
  },
  "/projects": {
    title: tag("Projects"),
    description:
      "Selected case studies from the Pegasus Dreamscapes portfolio: real before and after, with the numbers and the process behind each one.",
    image: `${SITE_URL}/og/projects.png`,
  },
  "/projects/nelson-dr": {
    title: tag("Nelson Dr Case Study"),
    description:
      "How Pegasus read a Richmond / El Sobrante property, scoped the renovation to budget, and delivered it move-in ready. Real before and after.",
    image: `${SITE_URL}/og/nelson-dr.png`,
    type: "article",
  },
  "/connect": {
    title: tag("Connect"),
    description:
      "Apollo's direct routing: property, build, sell, capital, vendor, or just a conversation. Reach Pegasus Dreamscapes in the East Bay.",
    image: `${SITE_URL}/og/connect.png`,
  },
  "/contact": {
    title: tag("Contact"),
    description:
      "Tell us about the property or the situation and get a clear, written read from our team. Reach Pegasus Dreamscapes in the East Bay.",
    image: `${SITE_URL}/og/contact.png`,
  },
  "/submit": {
    title: tag("Submit a Property"),
    description:
      "Submit a property or a deal to Pegasus Dreamscapes. Every serious submission gets a real read and a clear path forward. No pressure.",
    image: `${SITE_URL}/og/submit.png`,
  },
  "/deal-blueprint": {
    title: tag("Deal Blueprint"),
    description:
      "Request a Pegasus Deal Blueprint — a deeper, by-review underwrite of one property: the path, the spread, and the risk, written out in full.",
    image: DEFAULT_OG_IMAGE,
  },

  // ---- Learn / network / legal ----
  "/library": {
    title: tag("Strategy Library"),
    description:
      "Field notes on complex property, structured opportunity, and the strategy-first operating model. Structured reads, no gurus, no hype.",
    image: `${SITE_URL}/og/library.png`,
  },
  "/vendor-network": {
    title: tag("Vendor Network"),
    description:
      "Apply to the private Pegasus Dreamscapes vendor network: vetted contractors, lenders, agents, and operators routed to active deal flow.",
    image: `${SITE_URL}/og/vendor-network.png`,
  },
  "/disclosures": {
    title: tag("Disclosures"),
    description:
      "Disclosures for Pegasus Dreamscapes Corp. DRE #02333658, Keller Williams East Bay. Each office is independently owned and operated.",
    image: `${SITE_URL}/og/disclosures.png`,
  },
  "/privacy": {
    title: tag("Privacy"),
    description:
      "Privacy notice for Pegasus Dreamscapes Corp: what we collect, how we use it, and how to reach us. Draft pending qualified legal review.",
    image: `${SITE_URL}/og/privacy.png`,
  },
  "/terms": {
    title: tag("Terms"),
    description:
      "Terms of use for the Pegasus Dreamscapes website, Strategy Review intake, and MarketFlow access. Draft pending qualified legal review.",
    image: `${SITE_URL}/og/terms.png`,
  },

  "/faq": {
    title: tag("FAQ"),
    description:
      "Straight answers on submitting a property, working with Pegasus Dreamscapes, the MarketFlow network, and Buyboxes — fees, timing, and how reviews work.",
    image: DEFAULT_OG_IMAGE,
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

// Returns the bare page name (brand suffix stripped) for the given path, for
// the client useSEO hook which re-applies the brand itself. Returns undefined
// for the home route so useSEO falls back to the bare brand title.
export function seoNameFor(pathname: string): string | undefined {
  const { title } = seoFor(pathname);
  if (title === BRAND) return undefined;
  return title.replace(` · ${BRAND}`, "");
}

// ---- Sitemap support ----
// The public sitemap and robots policy are generated from the keys of
// SEO_ROUTES (the single source of truth for crawlable public routes).
// Anything matching an admin / internal-dashboard / auth / legacy shape is
// filtered out so it can never leak into the sitemap, even if such a path is
// ever added to SEO_ROUTES.
const SITEMAP_EXCLUDE_RE: RegExp[] = [
  /^\/api(\/|$)/,
  /^\/admin(\/|$)/,
  /^\/hq(\/|$)/,
  /^\/dashboard(\/|$)/,
  /^\/login(\/|$)/,
  /^\/signup(\/|$)/,
  /^\/offer-studio(\/|$)/,
  /^\/profile\//,
  /^\/snapshot(\/|$)/,
  /^\/marketflow\/(admin|dashboard|messages|submit|negotiate)(\/|$)/,
  // Buyboxes are soft-launched (config publicReady: false). The page stays
  // reachable and indexable (it is not noindex) and carries its own unique
  // crawler-visible metadata for direct visits / social shares — we simply
  // don't advertise it in the sitemap until the buyboxes are public-ready.
  /^\/marketflow\/buyboxes$/,
  // Website Spec v4: /library remains demoted (302 → home), so it must not be
  // advertised in the sitemap. Its SEO_ROUTES entry is retained only so
  // seoFor()'s prefix fallback keeps serving live subpaths (e.g. /library/:slug).
  // /marketflow was restored to the live public surface in v4 and is crawlable
  // again. Exact-match, bare path only.
  /^\/library$/,
];

// Public directories the robots policy disallows. Crawlers should never index
// the API, admin/internal tooling, auth, or the MarketFlow operator surfaces.
export const ROBOTS_DISALLOW: string[] = [
  "/api/",
  "/hq",
  "/admin",
  "/dashboard",
  "/login",
  "/signup",
  "/offer-studio",
  "/profile/",
  "/snapshot/",
  "/marketflow/admin",
  "/marketflow/dashboard",
  "/marketflow/messages",
  "/marketflow/submit",
  "/marketflow/negotiate",
];

export function isCrawlablePublicPath(pathname: string): boolean {
  return !SITEMAP_EXCLUDE_RE.some((re) => re.test(pathname));
}

// Default per-route crawl hints; routes not listed fall back to SITEMAP_DEFAULT.
const SITEMAP_HINTS: Record<string, { priority: string; changefreq: string }> = {
  "/": { priority: "1.0", changefreq: "weekly" },
  "/submit": { priority: "0.9", changefreq: "monthly" },
  "/projects": { priority: "0.9", changefreq: "weekly" },
  "/development": { priority: "0.8", changefreq: "monthly" },
  "/investments": { priority: "0.8", changefreq: "monthly" },
  "/about": { priority: "0.8", changefreq: "monthly" },
  "/projects/nelson-dr": { priority: "0.7", changefreq: "monthly" },
};
const SITEMAP_DEFAULT = { priority: "0.6", changefreq: "monthly" };

export interface SitemapEntry {
  path: string;
  priority: string;
  changefreq: string;
}

// All static crawlable public routes, derived from SEO_ROUTES. Dynamic
// entries (e.g. project case studies from the database) are appended by the
// server route handler.
export function sitemapEntries(): SitemapEntry[] {
  return Object.keys(SEO_ROUTES)
    .filter(isCrawlablePublicPath)
    .map((path) => ({ path, ...(SITEMAP_HINTS[path] ?? SITEMAP_DEFAULT) }));
}
