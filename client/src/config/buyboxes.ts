export type Buybox = {
  id: string;
  title: string;
  geography: string;
  profile: string;
  ticketSize: string;
  notes: string;
  // Phase 1 gate (Apollo guardrail #1): The Structured Opportunity cannot
  // ship publicly until Phil Deutscher reviews the disclosure language.
  // Buyboxes with publicReady === false are excluded from the public
  // BuyboxesSection render. Default = true.
  publicReady?: boolean;
};

// Apollo-approved working names (Phase 1). Copy bodies (profile, geography,
// ticketSize, notes) are placeholders held over from v1 and are slated for
// rewrite in the Phase 2 Copy Proposal Document. IDs are intentionally
// unchanged to preserve historical lead-analytics keying on
// `buybox:<id>` source strings.
export const BUYBOXES: Buybox[] = [
  {
    id: "value-add-sfr",
    title: "The Foundation Value-Add",
    geography: "Contra Costa · Alameda counties",
    profile:
      "Tired single-family with structural bones intact. Cosmetic-plus scope, not full reframe.",
    ticketSize: "Placeholder · founder-confirmed ranges publish later.",
    notes:
      "Scope envelope and exit lane are read before the property is matched to anyone on this list.",
  },
  {
    id: "adu-east-bay",
    title: "The Annex ADU Upside",
    geography: "Pleasant Hill · Walnut Creek · Concord · Martinez",
    profile:
      "Single-family lots with conforming-ADU or JADU potential. Owner-occupied or tenanted, condition flexible.",
    ticketSize: "Placeholder · founder-confirmed ranges publish later.",
    notes:
      "Reviewed for zoning fit and lot geometry before any buyer in this profile is notified.",
  },
  {
    id: "estates-probate",
    title: "The Signature Repositioning",
    geography: "East Bay primary, Bay Area selectively",
    profile:
      "Complex chain-of-title, deferred maintenance, family-decision properties. Time-flexible, certainty-of-close favored.",
    ticketSize: "Placeholder · founder-confirmed ranges publish later.",
    notes:
      "We work the situation first. Subscribers see the property only after the path is clean.",
  },
  {
    id: "small-multifamily",
    title: "The Structured Opportunity",
    geography: "East Bay infill",
    profile:
      "Two-to-four-unit residential. Rent-roll opportunity or unit-mix repositioning.",
    ticketSize: "Placeholder · founder-confirmed ranges publish later.",
    notes:
      "Underwriting and tenant-status review precede any notification.",
    publicReady: false,
  },
];

// Apollo guardrail #1: free buyer interest list framed as "Request
// Notification." This is not a paid subscription product. Copy that
// implies a paid tier should not be added in Phase 1.
//
// Empire Doctrine v1.0.2 Amendment 1 Section C.8.7 — verbatim
// disclosure. Flagged for Phil Deutscher legal review. Surfaced
// directly under every Buyboxes notification form.
export const BUYBOX_DISCLOSURE =
  "Subscribing means Pegasus will contact you via the contact method on your account when we have a deal matching this buybox profile. All opportunities are reviewed by Pegasus before being shared. There is no obligation to buy. You can unsubscribe at any time from your account dashboard.";
