export type NavPrimaryItem = {
  href: string;
  label: string;
  matchPrefix?: string;
};

export type NavMoreItem = {
  href: string;
  label: string;
};

// Empire Doctrine v1.0.1 (Foundation Reset): five-item primary nav,
// no header More dropdown. Footer carries the secondary links in its
// four-column grid. Footer's Network column links to Vendor Network,
// /capital, /connect, etc. — those live in NAV_FOOTER_SECONDARY.
export const NAV_PRIMARY: NavPrimaryItem[] = [
  { href: "/strategy-lab", label: "Strategy Lab", matchPrefix: "/strategy-lab" },
  { href: "/projects", label: "Projects", matchPrefix: "/projects" },
  { href: "/development", label: "Development", matchPrefix: "/development" },
  { href: "/marketflow", label: "MarketFlow", matchPrefix: "/marketflow" },
  { href: "/about", label: "About", matchPrefix: "/about" },
];

// Retained for backwards-compat (mobile sheet "More" + nav-parity tests).
// Mirrors the footer's secondary link set so the mobile menu shows the
// full IA even though the desktop header no longer has a dropdown.
export const NAV_MORE: NavMoreItem[] = [
  { href: "/library", label: "Strategy Library" },
  { href: "/vendor-network", label: "Vendor Network" },
  { href: "/capital", label: "Capital" },
  { href: "/connect", label: "Connect" },
  { href: "/contact", label: "Contact" },
  { href: "/disclosures", label: "Disclosures" },
];

// Footer-only legal links surfaced under the Legal column.
export const FOOTER_MORE_EXTRA: NavMoreItem[] = [];

export const PRIMARY_CTA = { href: "/submit", label: "Submit a Property" };
