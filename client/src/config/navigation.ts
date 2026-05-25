export type NavPrimaryItem = {
  href: string;
  label: string;
  matchPrefix?: string;
};

// Phase 1 More-menu restructure (Apollo guardrail set, post-Task #148):
// the More menu groups secondary links by visitor intent — Learn /
// Network / Company / Legal. The mobile sheet renders these groups with
// kicker headings. The footer columns continue to map these into the
// canonical four-column IA (Company / Services / Network / Legal).
//
// Guardrail #2: dead links are not allowed. Items only appear here if
// the destination page exists today. "Deal Blueprint" stays out of
// NAV_MORE until a real stub page is shipped in Phase 2; the existing
// /deal-blueprint route redirects to /strategy-lab and is not a real
// destination yet.
export type NavMoreGroup = "learn" | "network" | "company" | "legal";

export type NavMoreItem = {
  href: string;
  label: string;
  group: NavMoreGroup;
};

export const NAV_MORE_GROUP_LABELS: Record<NavMoreGroup, string> = {
  learn: "Learn",
  network: "Network",
  company: "Company",
  legal: "Legal",
};

// Empire Doctrine v1.0.1 primary nav (five items). Task #148 hero/glass
// pass did not change the primary set.
export const NAV_PRIMARY: NavPrimaryItem[] = [
  { href: "/strategy-lab", label: "Strategy Lab", matchPrefix: "/strategy-lab" },
  { href: "/projects", label: "Projects", matchPrefix: "/projects" },
  { href: "/development", label: "Development", matchPrefix: "/development" },
  { href: "/marketflow", label: "MarketFlow", matchPrefix: "/marketflow" },
  { href: "/about", label: "About", matchPrefix: "/about" },
];

export const NAV_MORE: NavMoreItem[] = [
  // Learn — knowledge surfaces
  { href: "/library", label: "Strategy Library", group: "learn" },
  { href: "/faq", label: "FAQ", group: "learn" },

  // Network — the people side of the operating company
  { href: "/vendor-network", label: "Vendor Network", group: "network" },
  { href: "/capital", label: "Capital", group: "network" },

  // Company — who we are + how to reach us. Guardrail #4: Projects
  // appears here as a Company anchor but remains strongly surfaced as
  // proof via NAV_PRIMARY and the footer Services column.
  { href: "/projects", label: "Projects", group: "company" },
  { href: "/connect", label: "Connect", group: "company" },
  { href: "/contact", label: "Contact", group: "company" },

  // Legal
  { href: "/disclosures", label: "Disclosures", group: "legal" },
];

// Helper for components rendering NAV_MORE grouped by intent.
export function getNavMoreByGroup(group: NavMoreGroup): NavMoreItem[] {
  return NAV_MORE.filter((item) => item.group === group);
}

export const NAV_MORE_GROUP_ORDER: NavMoreGroup[] = [
  "learn",
  "network",
  "company",
  "legal",
];

// Footer-only legal links surfaced under the Legal column.
export const FOOTER_MORE_EXTRA: NavMoreItem[] = [];

export const PRIMARY_CTA = { href: "/submit", label: "Submit a Property" };
