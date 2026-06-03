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
  { href: "/deal-architecture", label: "Deal Architecture", matchPrefix: "/deal-architecture" },
  { href: "/development", label: "Development", matchPrefix: "/development" },
  { href: "/strategy-lab", label: "Strategy Lab", matchPrefix: "/strategy-lab" },
  { href: "/work-with-apollo", label: "Work With Apollo", matchPrefix: "/work-with-apollo" },
  { href: "/marketflow", label: "MarketFlow", matchPrefix: "/marketflow" },
];

export const NAV_MORE: NavMoreItem[] = [
  { href: "/connect", label: "Connect" },
  { href: "/about", label: "About Pegasus" },
  { href: "/ecosystem", label: "Pegasus Ecosystem" },
  { href: "/dreamscaper-standard", label: "Dreamscaper Standard" },
  { href: "/peggy-ai", label: "Peggy AI" },
  { href: "/vendor-network", label: "Vendor Network" },
  { href: "/contact", label: "Contact" },
  { href: "/disclosures", label: "Disclosures" },
];

export const FOOTER_MORE_EXTRA: NavMoreItem[] = [
  { href: "/projects", label: "Projects" },
  { href: "/capital", label: "Capital & Partnerships" },
  { href: "/library", label: "Strategy Library" },
  { href: "/login", label: "Login" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export const PRIMARY_CTA = { href: "/submit", label: "Submit a Property" };
