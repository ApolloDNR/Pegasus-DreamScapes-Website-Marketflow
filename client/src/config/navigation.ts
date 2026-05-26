export type NavPrimaryItem = {
  href: string;
  label: string;
  matchPrefix?: string;
};

// Empire Doctrine Amendment 2 §C — More-menu groups visitor intent across
// Learn / Network / Company / Ecosystem / Legal. The mobile sheet renders
// these groups with kicker headings; the footer maps them into the
// canonical four-column IA (Company / Services / Network / Legal). The
// `ecosystem` group is the footer-only Audience-B release valve (/ecosystem).
export type NavMoreGroup = "learn" | "network" | "company" | "ecosystem" | "legal";

export type NavMoreItem = {
  href: string;
  label: string;
  group: NavMoreGroup;
};

export const NAV_MORE_GROUP_LABELS: Record<NavMoreGroup, string> = {
  learn: "Learn",
  network: "Network",
  company: "Company",
  ecosystem: "Ecosystem",
  legal: "Legal",
};

// Empire Doctrine v1.0.1 primary nav (five items). Amendment 2 keeps the
// five-item primary set; /ecosystem and /peggy are footer-only.
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

  // Company — who we are + how to reach us. Apollo guardrail #4:
  // Projects also appears here as a Company anchor.
  { href: "/projects", label: "Projects", group: "company" },
  { href: "/connect", label: "Connect", group: "company" },
  { href: "/contact", label: "Contact", group: "company" },
  // Amendment 2 §D — Peggy public surface (positioning + safety).
  { href: "/peggy", label: "Peggy", group: "company" },

  // Ecosystem — Amendment 2 §C/§G footer-only Audience-B release valve.
  { href: "/ecosystem", label: "The Ecosystem", group: "ecosystem" },

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
  "ecosystem",
  "legal",
];

// Footer-only legal links surfaced under the Legal column.
export const FOOTER_MORE_EXTRA: NavMoreItem[] = [];

export const PRIMARY_CTA = { href: "/submit", label: "Submit a Property" };
