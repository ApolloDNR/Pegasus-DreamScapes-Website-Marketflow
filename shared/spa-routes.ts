// Exact and patterned browser routes owned by the React SPA. Both the client
// chrome classifier and the production HTML fallback use this registry so an
// invalid nested URL cannot be mistaken for a real page in one layer.

export const SPA_EXACT_PATHS = new Set<string>([
  "/",

  // Pegasus public shell.
  "/property-owners",
  "/buyers",
  "/deal-partners",
  "/capital",
  "/operators",
  "/referral",
  "/how-we-operate",
  "/our-work",
  "/development",
  "/strategy-lab",
  "/marketflow",
  "/work-with-apollo",
  "/ecosystem",
  "/about",
  "/contact",
  "/peggy",
  "/saved",
  "/bring-an-opportunity",
  "/connect",

  // Standalone public, auth, and internal surfaces.
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/pegasus-standard",
  "/departments",
  "/case-study",
  "/projects",
  "/projects/nelson-dr",
  "/strategy-lab/library",
  "/strategy-lab/submitted",
  "/strategy-lab/blueprint-confirmed",
  "/strategy-lab/classic",
  "/admin/strategy-lab",
  "/admin/vendors",
  "/admin/cta-events",
  "/admin/hq-outbox",
  "/admin/peggy/conversations",
  "/library",
  "/strategy-library",
  "/vendor-network",
  "/faq",
  "/privacy",
  "/terms",
  "/disclosures",
  "/deal-blueprint",
  "/dashboard",

  // MarketFlow product routes.
  "/marketflow/access",
  "/marketflow/buyboxes",
  "/marketflow/wholesaler",
  "/marketflow/dreamscaper",
  "/marketflow/investor",
  "/marketflow/buyer",
  "/marketflow/buyer/saved",
  "/marketflow/buyer/offers",
  "/marketflow/admin",
  "/marketflow/discover",
  "/marketflow/calculators",
  "/marketflow/resources",
  "/marketflow/community",
  "/marketflow/messages",
  "/marketflow/deals",
  "/marketflow/capital",
  "/marketflow/properties",
  "/marketflow/submit",
  "/marketflow/dashboard",
  "/marketflow/my-deals",
  "/marketflow/analytics",
  "/marketflow/my-analytics",

  // Browser-side legacy redirects retained by App.tsx.
  "/sell",
  "/investments",
  "/submit-deal",
  "/submit-property",
  "/submit",
  "/services",
  "/resources",
  "/buy",
  "/partner",
  "/invest",
  "/sellers",
  "/dealfinders",
  "/deal-strategy",
  "/calculators",
  "/education",
  "/wholesale",
  "/deal-architecture",
  "/dealflow/hq",
  "/hq",
  "/portal",
  "/portal/investor",
  "/portal/wholesaler",
  "/portal/buyer",
  "/portal/dreamscaper",
  "/community",
  "/dealflow",
  "/dealflow/office",
  "/dealflow/deals",
  "/dealflow/community",
  "/dealflow/messages",
  "/marketplace",
  "/marketplace/wholesaler",
  "/marketplace/dreamscaper",
  "/marketplace/investor",
  "/marketplace/buyer",
  "/marketplace/admin",
  "/marketplace/discover",
  "/marketplace/calculators",
  "/marketplace/resources",
  "/marketplace/community",
  "/marketplace/messages",
  "/marketplace/deals",
  "/marketplace/capital",
  "/marketplace/properties",
]);

export const SPA_PATTERN_PATHS: readonly RegExp[] = [
  /^\/snapshot\/(?:calc|property)\/[^/]+$/,
  /^\/snapshot\/[^/]+$/,
  /^\/dealflow\/project\/[^/]+$/,
  /^\/offer-studio\/[^/]+\/[^/]+$/,
  /^\/profile\/[^/]+$/,
  /^\/marketflow\/admin(?:\/[^/]+)+$/,
  /^\/marketflow\/deals\/[^/]+$/,
  /^\/marketflow\/deals\/[^/]+\/negotiate$/,
  /^\/marketflow\/listings\/[^/]+$/,
  /^\/marketflow\/capital\/[^/]+$/,
  /^\/marketflow\/properties\/[^/]+$/,
  /^\/marketflow\/negotiate\/[^/]+\/[^/]+$/,
  /^\/marketflow\/offer-studio\/[^/]+$/,
  /^\/marketplace\/(?:wholesaler|dreamscaper|investor|buyer|admin|deals|capital|properties)(?:\/[^/]+)+$/,
];

export function normalizeSpaPath(path: string): string {
  const withoutQueryOrHash = (path || "/").split(/[?#]/, 1)[0] || "/";
  const withLeadingSlash = withoutQueryOrHash.startsWith("/")
    ? withoutQueryOrHash
    : `/${withoutQueryOrHash}`;
  if (withLeadingSlash === "/") return "/";
  return withLeadingSlash.replace(/\/+$/, "");
}

export function isKnownSpaPath(path: string): boolean {
  const pathname = normalizeSpaPath(path);
  if (SPA_EXACT_PATHS.has(pathname)) return true;
  return SPA_PATTERN_PATHS.some((pattern) => pattern.test(pathname));
}
