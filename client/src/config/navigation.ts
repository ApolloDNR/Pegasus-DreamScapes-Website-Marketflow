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
  { href: "/calculators", label: "Calculators" },
  { href: "/vendor-network", label: "Vendor Network" },
  { href: "/contact", label: "Contact" },
  { href: "/disclosures", label: "Disclosures" },
];

export const FOOTER_MORE_EXTRA: NavMoreItem[] = [
  { href: "/deal-blueprint", label: "Deal Blueprint" },
];

export const PRIMARY_CTA = { href: "/sell", label: "Start a Strategy Review" };
