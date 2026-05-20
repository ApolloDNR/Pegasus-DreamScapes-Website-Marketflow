export type NavPrimaryItem = {
  href: string;
  label: string;
  matchPrefix?: string;
};

export type NavMoreItem = {
  href: string;
  label: string;
};

export const NAV_PRIMARY: NavPrimaryItem[] = [
  { href: "/sell", label: "Approach", matchPrefix: "/sell" },
  { href: "/projects", label: "Projects", matchPrefix: "/projects" },
  { href: "/invest", label: "Capital", matchPrefix: "/invest" },
  { href: "/marketflow", label: "MarketFlow", matchPrefix: "/marketflow" },
  { href: "/about", label: "About", matchPrefix: "/about" },
];

export const NAV_MORE: NavMoreItem[] = [
  { href: "/resources", label: "Strategy Library" },
  { href: "/strategy-lab", label: "Strategy Lab" },
  { href: "/calculators", label: "Calculators" },
  { href: "/deal-blueprint", label: "Deal Blueprint" },
  { href: "/systems", label: "Pegasus Systems" },
  { href: "/vendor-network", label: "Vendor Network" },
  { href: "/contact", label: "Contact" },
  { href: "/disclosures", label: "Disclosures" },
];

// Footer-only "More" extras. Kept as a typed empty list so the footer
// can grow footer-specific links (e.g. legal) without expanding the
// header dropdown. Today the canonical More set lives entirely in NAV_MORE.
export const FOOTER_MORE_EXTRA: NavMoreItem[] = [];

export const PRIMARY_CTA = { href: "/sell", label: "Start a Strategy Review" };
