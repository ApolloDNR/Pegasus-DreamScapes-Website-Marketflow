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

export const BRAND = "Pegasus DreamScapes";
const tag = (page: string) => `${page} · ${BRAND}`;

export const SITE_URL = "https://pegasusdreamscapes.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.png`;

export const SEO_ROUTES: Record<string, SeoRoute> = {
  "/": {
    title: BRAND,
    description:
      "Strategy-first real estate in the East Bay. We read the property and the numbers once, then architect the path: sell, reposition, build, or partner.",
    image: `${SITE_URL}/og/home.png`,
  },

  // ---- Who We Serve (audience lanes) ----
  "/sellers": {
    title: tag("Sellers & Owners"),
    description:
      "Have a complex, stuck, inherited, or distressed property? Start a property review and get a clear, written path forward from a real person.",
    image: DEFAULT_OG_IMAGE,
  },
  "/buyers": {
    title: tag("Buyers"),
    description:
      "Buy with a strategy: finished, repositioned homes and off-market opportunities, each underwritten before you commit. See how buyers work with us.",
    image: DEFAULT_OG_IMAGE,
  },
  "/dealfinders": {
    title: tag("Deal Finders & Wholesalers"),
    description:
      "Bring an off-market deal and get a straight answer fast: our basis, where we come in, and terms in writing. Submit a deal to Pegasus.",
    image: DEFAULT_OG_IMAGE,
  },
  "/capital": {
    title: tag("Capital Partners"),
    description:
      "Back specific real estate projects on defined terms, not blind pools. See how capital partners engage with us, with the risk laid out plainly.",
    image: `${SITE_URL}/og/capital.png`,
  },
  "/operators": {
    title: tag("Operators & Vendors"),
    description:
      "GCs, subcontractors, agents, and title: join the vetted Pegasus build bench and work with a team that scopes the job and respects the trade.",
    image: DEFAULT_OG_IMAGE,
  },
  "/referral": {
    title: tag("Referral Partners"),
    description:
      "Send us a name and we handle the relationship, with any referral fee documented in writing. Refer a contact to Pegasus DreamScapes.",
    image: DEFAULT_OG_IMAGE,
  },

  // ---- What We Do ----
  "/deal-architecture": {
    title: tag("Deal Architecture"),
    description:
      "How a property becomes a plan: we read the situation and the numbers once, then design the route that fits the deal. Submit a deal to start.",
    image: DEFAULT_OG_IMAGE,
  },
  "/investments": {
    title: tag("Investments"),
    description:
      "We acquire distressed, dated, and off-market property, reposition it with discipline, and exit on a plan written before we close.",
    image: DEFAULT_OG_IMAGE,
  },
  "/development": {
    title: tag("Development"),
    description:
      "Our development team scopes every renovation and ground-up build to a real budget and draw schedule, and delivers finished, on time.",
    image: DEFAULT_OG_IMAGE,
  },
  "/strategy-lab": {
    title: tag("Strategy Lab"),
    description:
      "A real underwriting tool, free to start. Model a deal, score the fit, see the spread with carry and exit costs, then get a written read.",
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
      "Request access to MarketFlow, the private deal network for Pegasus DreamScapes. Membership is reviewed by a person, not opened to everyone.",
    image: `${SITE_URL}/og/marketflow.png`,
  },
  "/work-with-apollo": {
    title: tag("Work With Apollo"),
    description:
      "Work directly with founder Apollo Duran on selling, buying, or a complex situation. Representation through Keller Williams East Bay, DRE #02333658.",
    image: DEFAULT_OG_IMAGE,
  },
  "/ecosystem": {
    title: tag("The Pegasus Ecosystem"),
    description:
      "The full Pegasus operating system: HQ, PeggyAI, Strategy Lab, MarketFlow, CapStack, and BuildForge, one underwriting standard across every part.",
    image: DEFAULT_OG_IMAGE,
  },
  "/peggy": {
    title: tag("PeggyAI"),
    description:
      "Describe your deal in plain language and PeggyAI helps frame the options and route you to the right lane. Early access, in training.",
    image: DEFAULT_OG_IMAGE,
  },

  // ---- Company / proof / contact ----
  "/about": {
    title: tag("About"),
    description:
      "Who Apollo Duran is and the discipline behind Pegasus: read the situation, underwrite real numbers, write the exit first, deliver a finished product.",
    image: `${SITE_URL}/og/about.png`,
  },
  "/projects": {
    title: tag("Projects"),
    description:
      "Selected case studies from the Pegasus DreamScapes portfolio: real before and after, with the numbers and the process behind each one.",
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
      "Apollo's direct routing: property, build, sell, capital, vendor, or just a conversation. Reach Pegasus DreamScapes in the East Bay.",
    image: DEFAULT_OG_IMAGE,
  },
  "/contact": {
    title: tag("Contact"),
    description:
      "Tell us about the property or the situation and get a clear, written read from a real person. Reach Pegasus DreamScapes in the East Bay.",
    image: DEFAULT_OG_IMAGE,
  },
  "/submit": {
    title: tag("Submit a Property"),
    description:
      "Submit a property or a deal to Pegasus DreamScapes. Every serious submission gets a real read and a clear path forward. No pressure.",
    image: `${SITE_URL}/og/submit.png`,
  },

  // ---- Learn / network / legal ----
  "/library": {
    title: tag("Strategy Library"),
    description:
      "Field notes on complex property, structured opportunity, and the strategy-first operating model. Structured reads, no gurus, no hype.",
    image: DEFAULT_OG_IMAGE,
  },
  "/faq": {
    title: tag("FAQ"),
    description:
      "Answers on submitting a property, working with Pegasus DreamScapes, the Strategy Lab, and the MarketFlow network. The honest version.",
    image: DEFAULT_OG_IMAGE,
  },
  "/vendor-network": {
    title: tag("Vendor Network"),
    description:
      "Apply to the private Pegasus DreamScapes vendor network: vetted contractors, lenders, agents, and operators routed to active deal flow.",
    image: DEFAULT_OG_IMAGE,
  },
  "/disclosures": {
    title: tag("Disclosures"),
    description:
      "Disclosures for Pegasus DreamScapes Corp. DRE #02333658, Keller Williams East Bay. Each office is independently owned and operated.",
    image: DEFAULT_OG_IMAGE,
  },
  "/privacy": {
    title: tag("Privacy"),
    description:
      "Privacy notice for Pegasus DreamScapes Corp: what we collect, how we use it, and how to reach us. Draft pending qualified legal review.",
    image: DEFAULT_OG_IMAGE,
  },
  "/terms": {
    title: tag("Terms"),
    description:
      "Terms of use for the Pegasus DreamScapes website, Strategy Review intake, and MarketFlow access. Draft pending qualified legal review.",
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
