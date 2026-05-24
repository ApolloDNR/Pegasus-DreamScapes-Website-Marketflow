export type Buybox = {
  id: string;
  title: string;
  geography: string;
  profile: string;
  ticketSize: string;
  notes: string;
};

export const BUYBOXES: Buybox[] = [
  {
    id: "adu-east-bay",
    title: "ADU-Friendly East Bay",
    geography: "Pleasant Hill · Walnut Creek · Concord · Martinez",
    profile:
      "Single-family lots with conforming-ADU or JADU potential. Owner-occupied or tenanted, condition flexible.",
    ticketSize: "Placeholder · founder-confirmed ranges publish later.",
    notes:
      "Reviewed for zoning fit and lot geometry before any buyer in this profile is notified.",
  },
  {
    id: "value-add-sfr",
    title: "Value-Add SFR · East Bay",
    geography: "Contra Costa · Alameda counties",
    profile:
      "Tired single-family with structural bones intact. Cosmetic-plus scope, not full reframe.",
    ticketSize: "Placeholder · founder-confirmed ranges publish later.",
    notes:
      "Scope envelope and exit lane are read before the property is matched to anyone on this list.",
  },
  {
    id: "estates-probate",
    title: "Estates · Probate · Off-Market",
    geography: "East Bay primary, Bay Area selectively",
    profile:
      "Complex chain-of-title, deferred maintenance, family-decision properties. Time-flexible, certainty-of-close favored.",
    ticketSize: "Placeholder · founder-confirmed ranges publish later.",
    notes:
      "We work the situation first. Subscribers see the property only after the path is clean.",
  },
  {
    id: "small-multifamily",
    title: "Small Multifamily · 2–4 Units",
    geography: "East Bay infill",
    profile:
      "Two-to-four-unit residential. Rent-roll opportunity or unit-mix repositioning.",
    ticketSize: "Placeholder · founder-confirmed ranges publish later.",
    notes:
      "Underwriting and tenant-status review precede any notification.",
  },
];

// Empire Doctrine v1.0.2 Amendment 1 Section C.8.7 — verbatim
// disclosure. Flagged for Phil Deutscher legal review. Surfaced
// directly under every Buyboxes subscription form.
export const BUYBOX_DISCLOSURE =
  "Subscribing means Pegasus will contact you via the contact method on your account when we have a deal matching this buybox profile. All opportunities are reviewed by Pegasus before being shared. There is no obligation to buy. You can unsubscribe at any time from your account dashboard.";
