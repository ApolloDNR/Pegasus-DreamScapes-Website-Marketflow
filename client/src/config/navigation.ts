export type NavPrimaryItem = {
  href: string;
  label: string;
  matchPrefix?: string;
};

// Website Structure v1 FINAL §1 — More-menu groups visitor intent across
// Learn / Network / Company / Ecosystem / Legal. The mobile sheet renders
// these groups with kicker headings; the footer maps them into the
// canonical four-column IA (Company / Tools / Network / Legal). The
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

// Website Structure v1 FINAL §1 — five primary nav nouns plus the More
// dropdown. Order is locked: Deal Strategy · Development · Strategy
// Lab · Work With Apollo · MarketFlow. /projects is no longer in primary
// nav; it is reachable from /development and from the More dropdown.
export const NAV_PRIMARY: NavPrimaryItem[] = [
  { href: "/deal-strategy", label: "Deal Strategy", matchPrefix: "/deal-strategy" },
  { href: "/development", label: "Development", matchPrefix: "/development" },
  { href: "/strategy-lab", label: "Strategy Lab", matchPrefix: "/strategy-lab" },
  { href: "/work-with-apollo", label: "Represent With Apollo", matchPrefix: "/work-with-apollo" },
  { href: "/marketflow", label: "MarketFlow", matchPrefix: "/marketflow" },
];

export const NAV_MORE: NavMoreItem[] = [
  // Learn — knowledge surfaces
  { href: "/library", label: "Strategy Library", group: "learn" },
  { href: "/faq", label: "FAQ", group: "learn" },

  // Network — the people side of the operating company
  { href: "/vendor-network", label: "Vendor Network", group: "network" },
  { href: "/capital", label: "Capital", group: "network" },

  // Company — who we are + how to reach us. About moves here under the
  // v1 FINAL nav restructure (it is no longer in primary). Projects also
  // surfaces here as a Company anchor; the index page stays alive as a
  // deep link though the primary entry point is /development.
  { href: "/about", label: "About", group: "company" },
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
