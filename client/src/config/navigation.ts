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

// Task #148 — sectioned More dropdown (desktop + mobile). Items are
// grouped by intent (Strategy · Network · Company · Legal); every
// NAV_MORE entry must appear in exactly one group so the nav-parity
// guarantee holds.
export type NavMoreGroupKey = "strategy" | "network" | "company" | "legal";
export const NAV_MORE_GROUPS: Array<{ key: NavMoreGroupKey; label: string; items: NavMoreItem[] }> = [
  {
    key: "strategy",
    label: "Strategy",
    items: [{ href: "/library", label: "Strategy Library" }],
  },
  {
    key: "network",
    label: "Network",
    items: [
      { href: "/vendor-network", label: "Vendor Network" },
      { href: "/capital", label: "Capital" },
      { href: "/connect", label: "Connect" },
    ],
  },
  {
    key: "company",
    label: "Company",
    items: [{ href: "/contact", label: "Contact" }],
  },
  {
    key: "legal",
    label: "Legal",
    items: [{ href: "/disclosures", label: "Disclosures" }],
  },
];

// Footer-only legal links surfaced under the Legal column.
export const FOOTER_MORE_EXTRA: NavMoreItem[] = [];

export const PRIMARY_CTA = { href: "/submit", label: "Submit a Property" };
