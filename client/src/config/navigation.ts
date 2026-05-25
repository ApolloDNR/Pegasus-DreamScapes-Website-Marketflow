export type NavMoreItem = {
  href: string;
  label: string;
};

export type NavPrimaryItem = {
  href: string;
  label: string;
  matchPrefix?: string;
  children?: NavMoreItem[];
};

// Task #148 — platform aesthetic pass. Primary nav is 4 items in the
// order Apollo approved: Development (with a dropdown containing
// Projects + Development Path), Strategy Lab, MarketFlow, About.
// Pegasus DreamScapes is a real estate operating company first;
// PropTech (Strategy Lab, MarketFlow) exists to aid that practice.
// The header surfaces Development first as the practice itself, then
// the tooling that powers it.
export const NAV_PRIMARY: NavPrimaryItem[] = [
  {
    href: "/development",
    label: "Development",
    matchPrefix: "/development",
    children: [
      { href: "/projects", label: "Projects" },
      { href: "/development", label: "Development Path" },
    ],
  },
  { href: "/strategy-lab", label: "Strategy Lab", matchPrefix: "/strategy-lab" },
  { href: "/marketflow", label: "MarketFlow", matchPrefix: "/marketflow" },
  { href: "/about", label: "About", matchPrefix: "/about" },
];

// Mobile sheet "More" + footer secondary links. Mirrors the desktop
// More dropdown.
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
