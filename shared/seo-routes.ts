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
  noIndex?: boolean;
}

export const BRAND = "Pegasus Dreamscapes";
const tag = (page: string) => `${page} · ${BRAND}`;

export const SITE_URL = "https://pegasusdreamscapes.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.png`;

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

/** Account, operator, token, and administrative surfaces are never canonical. */
export function isPrivateNoindexSpaPath(path: string): boolean {
  const raw = (path || "/").split(/[?#]/, 1)[0] || "/";
  const withLeadingSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const pathname = withLeadingSlash === "/" ? "/" : withLeadingSlash.replace(/\/+$/, "");

  if (PRIVATE_NOINDEX_EXACT_PATHS.has(pathname)) return true;
  if (PRIVATE_NOINDEX_PREFIXES.some((pattern) => pattern.test(pathname))) return true;
  if (pathname.startsWith("/marketflow/")) {
    return !PUBLIC_MARKETFLOW_PATHS.has(pathname);
  }
  return false;
}

export const SEO_ROUTES: Record<string, SeoRoute> = {
  // Master Blueprint v5.1 — homepage promise + copy-deck meta (supersedes
  // issue #22 §12).
  "/": {
    title: "Pegasus Dreamscapes — Complex Real Estate, Made Executable",
    description:
      "An East Bay real estate operating company. Share a property, deal, or project for possible review; no response, route, or transaction is promised.",
    image: `${SITE_URL}/og/home.png`,
  },

  // ---- v5.1 public spine (canonical URLs; old paths 301 forward) ----
  "/property-owners": {
    title: tag("Property Owners"),
    description:
      "Private intake for owners with a complex property situation. Submission may be considered, but no written review, response, route, or offer is promised.",
    image: `${SITE_URL}/og/sellers.png`,
  },
  "/buyers": {
    title: tag("Buyers"),
    description:
      "Request buyer-list consideration for future, project-specific review. No current public inventory, allocation, or investment opportunity is offered.",
    image: `${SITE_URL}/og/buyers.png`,
  },
  "/deal-partners": {
    title: tag("Deal Partners"),
    description:
      "Share a deal or proposed structure for possible private review. No response, buyer, written terms, distribution, funding, or closing is promised.",
    image: `${SITE_URL}/og/dealfinders.png`,
  },
  "/operators": {
    title: tag("Operators & Vendors"),
    description:
      "GCs, subcontractors, agents, and title professionals can apply for project-by-project consideration. No volume or assignment is promised.",
    image: `${SITE_URL}/og/operators.png`,
  },
  "/referral": {
    title: tag("Referral Partners"),
    description:
      "Introduce a contact with permission for possible review. No follow-up, referral relationship, fee, representation, or transaction is promised.",
    image: `${SITE_URL}/og/referral.png`,
  },

  // ---- Capital partners ----
  "/capital": {
    title: tag("Capital Relationship Review"),
    description:
      "Private relationship intake only. No current project, security, allocation, return, or right to receive future opportunities is offered here.",
    image: `${SITE_URL}/og/capital.png`,
  },
  // ---- What We Do ----
  "/how-we-operate": {
    title: tag("How We Operate"),
    description:
      "A public framework for considering property facts, economics, and possible paths. It does not promise review, advice, a route, or execution.",
    image: `${SITE_URL}/og/deal-strategy.png`,
  },
  "/our-work": {
    title: tag("Our Work — Nelson Drive"),
    description:
      "Nelson Drive public record: acquired about $600K, renovated for $105K, sold for $840K. Limited figures only; not net profit or return.",
    image: `${SITE_URL}/og/case-study.png`,
  },
  "/investments": {
    title: tag("Capital Relationship Review"),
    description:
      "This retired route does not describe a current investment opportunity. Use the private relationship intake for a general introduction.",
    image: `${SITE_URL}/og/investments.png`,
    noIndex: true,
  },
  "/development": {
    title: tag("Development"),
    description:
      "A public overview of development questions Pegasus may consider. No scope, budget, schedule, licensed team, permit, or project delivery is promised.",
    image: `${SITE_URL}/og/development.png`,
  },
  "/strategy-lab": {
    title: tag("Strategy Lab"),
    description:
      "Use entered assumptions to model strategy-tier ranges, likely lanes, and risks. Results are directional only, not a CMA, appraisal, or advice.",
    image: `${SITE_URL}/og/strategy-lab.png`,
  },
  "/marketflow": {
    title: tag("MarketFlow"),
    description:
      "MarketFlow is a controlled pilot for private routing. No public inventory, matching, approved membership, access, or investment offering is published.",
    image: `${SITE_URL}/og/marketflow.png`,
  },
  "/marketflow/access": {
    title: tag("Request MarketFlow Access"),
    description:
      "Register interest in the controlled MarketFlow pilot. Approval, access, inventory, matching, and invitations are not promised.",
    image: `${SITE_URL}/og/marketflow.png`,
  },
  "/marketflow/buyboxes": {
    title: tag("Pegasus Buyboxes"),
    description:
      "No public Buybox profiles, live inventory, automated matching, or deal-notification subscription are active today.",
    image: `${SITE_URL}/og/marketflow.png`,
    noIndex: true,
  },
  "/ecosystem": {
    title: tag("The Pegasus Ecosystem"),
    description:
      "An honest status map of Pegasus tools and concepts: public, private pilot, internal, or in development. Availability varies by surface.",
    image: `${SITE_URL}/og/ecosystem.png`,
  },

  // ---- Company / proof / contact ----
  "/work-with-apollo": {
    title: tag("Represent With Apollo"),
    description:
      "Ask about possible representation with Apollo Duran. Verify the site-listed Keller Williams East Bay affiliation and DRE #02333658 before engagement.",
    image: `${SITE_URL}/og/work-with-apollo.png`,
  },
  "/peggy": {
    title: tag("Peggy"),
    description:
      "Describe a situation in plain language. Peggy can help structure an intake, but does not promise review, routing, offers, valuation, or advice.",
    image: `${SITE_URL}/og/peggy.png`,
  },
  "/saved": {
    title: tag("Saved"),
    description:
      "Saved transcript copies stored only in this browser. They are not synced to an account or another device and cannot resume a server conversation.",
    image: DEFAULT_OG_IMAGE,
    noIndex: true,
  },
  "/about": {
    title: tag("About"),
    description:
      "Background on Apollo Duran and the operating principles presented by Pegasus. This page does not promise review, services, execution, or results.",
    image: `${SITE_URL}/og/about.png`,
  },
  "/projects": {
    title: tag("Projects"),
    description:
      "Nelson Drive is the currently published project case study. Its record states the available figures and the limits of the public evidence.",
    image: `${SITE_URL}/og/projects.png`,
  },
  "/projects/nelson-dr": {
    title: tag("Nelson Dr Case Study"),
    description:
      "Nelson Drive public record: acquired about $600K, renovated for $105K, sold for $840K. Limited cost-and-sale figures, not net profit or return.",
    image: `${SITE_URL}/og/nelson-dr.png`,
    type: "article",
  },
  "/connect": {
    title: tag("Connect"),
    description:
      "Choose the relevant public intake for a property, project, representation, capital, vendor, or general question. No response or route is promised.",
    image: `${SITE_URL}/og/connect.png`,
  },
  "/contact": {
    title: tag("Contact"),
    description:
      "Use Contact for a general question or help finding the right public route. Receipt does not promise review, follow-up, a response, or another outcome.",
    image: `${SITE_URL}/og/contact.png`,
  },
  // ---- Public Website v1 (issue #22) pages ----
  "/bring-an-opportunity": {
    title: tag("Bring an Opportunity"),
    description:
      "Submit a property, contract, project, or plan for possible private review. Receipt does not promise review, response, an offer, or a particular route.",
    image: `${SITE_URL}/og/submit.png`,
  },
  "/departments": {
    title: tag("Departments"),
    description:
      "Four operating functions used to organize a possible property review. They are accountability lanes, not a claim of four separately staffed service teams.",
    image: DEFAULT_OG_IMAGE,
  },
  "/case-study": {
    title: tag("Case Study"),
    description:
      "Documented East Bay case study: acquired $600K, renovation $105K, acquisition-plus-renovation subtotal $705K, sold $840K. Not net profit or return.",
    image: `${SITE_URL}/og/nelson-dr.png`,
    type: "article",
  },
  "/pegasus-standard": {
    title: tag("The Pegasus Standard"),
    description:
      "The long-term Pegasus vision: a future living standard shaped by beauty, durability, calm, nature, and human flourishing. Clearly labeled future direction.",
    image: DEFAULT_OG_IMAGE,
  },
  "/deal-blueprint": {
    title: tag("Deal Blueprint"),
    description:
      "Request review for a possible, separately scoped property memo. No purchase, acceptance, fee, turnaround, or delivery is promised by the public intake.",
    image: DEFAULT_OG_IMAGE,
  },

  // ---- Network / legal ----
  "/vendor-network": {
    title: tag("Vendor Network"),
    description:
      "Apply for project-by-project consideration as a contractor, agent, lender, or operator. Acceptance and work volume are not promised.",
    image: `${SITE_URL}/og/vendor-network.png`,
  },
  "/disclosures": {
    title: tag("Disclosures"),
    description:
      "Operating-company and brokerage-role disclosures, including site-listed Keller Williams East Bay and DRE details that visitors should verify.",
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
      "Straight answers on property intake, Apollo's brokerage role, browser-only saves, and the public boundaries for MarketFlow and buy boxes.",
    image: DEFAULT_OG_IMAGE,
  },
};

export function seoFor(pathname: string): SeoRoute {
  const exact = SEO_ROUTES[pathname];
  if (exact) return exact;
  if (pathname.startsWith("/projects/")) return SEO_ROUTES["/projects"];
  if (pathname.startsWith("/marketflow/")) return SEO_ROUTES["/marketflow"];
  return SEO_ROUTES["/"];
}

// Returns the bare page name (brand suffix stripped) for the given path, for
// the client useSEO hook which re-applies the brand itself. Returns undefined
// for the home route so useSEO falls back to the locked home title (the
// homepage title carries the PRD §12 pipe format, not the ` · BRAND` suffix).
export function seoNameFor(pathname: string): string | undefined {
  const { title } = seoFor(pathname);
  if (title === SEO_ROUTES["/"].title) return undefined;
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
  /^\/forgot-password(\/|$)/,
  /^\/reset-password(\/|$)/,
  /^\/offer-studio(\/|$)/,
  /^\/profile\//,
  /^\/snapshot(\/|$)/,
  /^\/saved$/,
  /^\/investments$/,
  /^\/submit$/,
  /^\/marketflow\/(admin|dashboard|messages|submit|negotiate)(\/|$)/,
  // Buyboxes are soft-launched (config publicReady: false). The page stays
  // reachable and indexable (it is not noindex) and carries its own unique
  // crawler-visible metadata for direct visits / social shares — we simply
  // don't advertise it in the sitemap until the buyboxes are public-ready.
  /^\/marketflow\/buyboxes$/,
  /^\/library(?:\/|$)/,
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
  "/forgot-password",
  "/reset-password",
  "/offer-studio",
  "/profile/",
  "/snapshot/",
  "/saved",
  "/investments",
  "/library",
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
  "/bring-an-opportunity": { priority: "0.9", changefreq: "monthly" },
  "/our-work": { priority: "0.9", changefreq: "monthly" },
  "/how-we-operate": { priority: "0.8", changefreq: "monthly" },
  "/property-owners": { priority: "0.8", changefreq: "monthly" },
  "/deal-partners": { priority: "0.8", changefreq: "monthly" },
  "/projects": { priority: "0.9", changefreq: "weekly" },
  "/development": { priority: "0.8", changefreq: "monthly" },
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
