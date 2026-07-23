export type Buybox = {
  id: string;
  title: string;
  geography: string;
  profile: string;
  ticketSize: string;
  notes: string;
  // Buyboxes with publicReady === false are excluded from the public
  // BuyboxesSection render. Default = true.
  publicReady?: boolean;
};

const PRIVATE_CRITERIA_COPY =
  "Criteria shared by request; numeric ranges are private until approved.";

// Apollo-approved working names. Numeric ticket ranges stay private until
// founder approval; public copy should explain criteria without inventing
// acquisition bands, check sizes, or return expectations.
export const BUYBOXES: Buybox[] = [
  {
    id: "value-add-sfr",
    title: "The Foundation Value-Add",
    geography: "Contra Costa / Alameda counties",
    profile:
      "Tired single-family with structural bones intact. Cosmetic-plus scope, not full reframe.",
    ticketSize: PRIVATE_CRITERIA_COPY,
    notes:
      "Scope envelope and exit lane are read before the property is matched to anyone on this list.",
  },
  {
    id: "adu-east-bay",
    title: "The Annex ADU Upside",
    geography: "Pleasant Hill / Walnut Creek / Concord / Martinez",
    profile:
      "Single-family lots with conforming-ADU or JADU potential. Owner-occupied or tenanted, condition flexible.",
    ticketSize: PRIVATE_CRITERIA_COPY,
    notes:
      "Reviewed for zoning fit and lot geometry before any buyer in this profile is notified.",
  },
  {
    id: "estates-probate",
    title: "The Signature Repositioning",
    geography: "East Bay primary, Bay Area selectively",
    profile:
      "Complex chain-of-title, deferred maintenance, family-decision properties. Time-flexible, certainty-of-close favored.",
    ticketSize: PRIVATE_CRITERIA_COPY,
    notes:
      "We work the situation first. Subscribers see the property only after the path is clean.",
  },
  {
    id: "small-multifamily",
    title: "The Structured Opportunity",
    geography: "East Bay infill",
    profile:
      "Two-to-four-unit residential. Rent-roll opportunity or unit-mix repositioning.",
    ticketSize: PRIVATE_CRITERIA_COPY,
    notes:
      "Underwriting and tenant-status review precede any notification.",
    publicReady: false,
  },
];

export const PUBLIC_BUYBOXES = BUYBOXES.filter((buybox) => buybox.publicReady !== false);

// Free buyer interest list framed as "Request Notification." This is not a
// paid subscription product. Copy that implies a paid tier should not be added.
export const BUYBOX_DISCLOSURE =
  "Subscribing means Pegasus will contact you via the contact method on your account when we have a deal matching this buybox profile. All opportunities are reviewed by Pegasus before being shared. There is no obligation to buy. You can unsubscribe at any time from your account dashboard.";
