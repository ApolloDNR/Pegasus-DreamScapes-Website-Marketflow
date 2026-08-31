export const PEGASUS_LEAD_LANES = [
  "seller",
  "buyer",
  "wholesaler",
  "investor",
  "vendor",
  "referral",
  "contact",
] as const;

export type PegasusLeadLane = (typeof PEGASUS_LEAD_LANES)[number];
export type PegasusLeadContextKind = "context" | "property-address";

type LeadRoutingInput = {
  intent?: unknown;
  role?: unknown;
};

export interface PegasusLeadOperationalDetails {
  role: string;
  intent: string;
  context: string;
  contextKind: PegasusLeadContextKind;
  message: string;
}

const clean = (value: unknown, maxLength = 2_000) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

export function classifyPegasusLead({
  intent,
  role,
}: LeadRoutingInput): PegasusLeadLane {
  const normalizedIntent = clean(intent, 100).toLowerCase();
  const normalizedRole = clean(role, 160).toLowerCase();
  const roleLane: PegasusLeadLane | undefined =
    /capital|investor|funding|lender/.test(normalizedRole)
      ? "investor"
      : /operator|vendor|contractor|builder/.test(normalizedRole)
        ? "vendor"
        : /referral|agent|advisor|broker/.test(normalizedRole)
          ? "referral"
          : /wholesale|deal finder|deal-finder/.test(normalizedRole)
            ? "wholesaler"
            : /buyer|homebuyer|buy a home/.test(normalizedRole)
              ? "buyer"
              : /seller|property owner|have a property/.test(normalizedRole)
                ? "seller"
                : undefined;

  // CONTACT_FORM carries the property-review intent as its default, but its
  // mounted role selector and Peggy handoff can explicitly select another
  // lane. Honor that explicit non-seller choice instead of silently routing a
  // wholesaler, referral, buyer, operator, or capital inquiry as a seller.
  if (normalizedIntent === "property-review" && roleLane && roleLane !== "seller") {
    return roleLane;
  }

  if (["capital-partner", "capital-introduction", "investment", "capital", "funding"].includes(normalizedIntent)) {
    return "investor";
  }
  if (["operator", "vendor"].includes(normalizedIntent)) return "vendor";
  if (normalizedIntent === "referral") return "referral";
  if (["deal-finder", "wholesale", "wholesaler"].includes(normalizedIntent)) {
    return "wholesaler";
  }
  if (normalizedIntent === "buyer") return "buyer";
  if (["property-review", "development", "strategy-snapshot", "seller"].includes(normalizedIntent)) {
    return "seller";
  }
  if (normalizedIntent === "representation") {
    return /\bbuy|buyer/.test(normalizedRole) ? "buyer" : "seller";
  }

  return roleLane ?? "contact";
}

const REUSABLE_LEAD_SOURCES = new Set(["form", "strategy-lab", "peggy"]);

const asRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

/**
 * One bounded operational view of the reusable public form contract. Storage
 * keeps the original leadData object, while staff email and admin consumers
 * use this projection instead of guessing at legacy lane-specific keys.
 */
export function projectPegasusLeadOperationalDetails(
  value: unknown,
): PegasusLeadOperationalDetails {
  const row = asRecord(value);
  const source = clean(row.source, 100);
  if (!REUSABLE_LEAD_SOURCES.has(source)) {
    return {
      role: "",
      intent: "",
      context: "",
      contextKind: "context",
      message: "",
    };
  }

  const leadData = asRecord(row.leadData);
  return {
    role: clean(leadData.role, 160),
    intent: clean(leadData.intent, 160),
    context: clean(leadData.context),
    contextKind:
      leadData.contextKind === "property-address"
        ? "property-address"
        : "context",
    message: clean(leadData.message),
  };
}

/**
 * Server-truth normalization for the reusable Pegasus lead form. The public
 * client deliberately enters through the consent-gated `submit` surface; once
 * consent and anti-spam checks pass, this function assigns the operational
 * lane used by storage, notifications, and HQ routing.
 */
export function normalizePegasusLeadSubmission(
  value: Record<string, unknown>,
): Record<string, any> {
  const source = clean(value.source, 100);
  if (value.leadType !== "submit" || !REUSABLE_LEAD_SOURCES.has(source)) {
    return { ...value };
  }

  const sourceLeadData =
    value.leadData !== null &&
    typeof value.leadData === "object" &&
    !Array.isArray(value.leadData)
      ? (value.leadData as Record<string, unknown>)
      : {};
  const lane = classifyPegasusLead({
    intent: sourceLeadData.intent,
    role: sourceLeadData.role ?? sourceLeadData.lane,
  });
  const context = clean(sourceLeadData.context);
  const contextKind: PegasusLeadContextKind =
    sourceLeadData.contextKind === "property-address"
      ? "property-address"
      : "context";

  const normalized: Record<string, any> = {
    ...value,
    leadType: lane,
    leadData: {
      ...sourceLeadData,
      lane,
      context: context || undefined,
      contextKind,
    },
  };

  if (contextKind === "property-address" && context) {
    normalized.address = context.slice(0, 500);
  } else {
    delete normalized.address;
  }

  return normalized;
}

const SUCCESS_COPY: Record<PegasusLeadLane, { heading: string; body: string }> = {
  seller: {
    heading: "Property details received.",
    body: "Your submission is recorded for possible consideration. Review and follow-up are not promised. If Pegasus elects to continue, a possible next step can be discussed directly.",
  },
  buyer: {
    heading: "Buyer request received.",
    body: "Your goals are recorded for possible consideration. Review and follow-up are not promised. If Pegasus elects to continue, a relevant path can be discussed directly.",
  },
  wholesaler: {
    heading: "Opportunity routing request received.",
    body: "The information is recorded for possible consideration. Review is not promised, and submission does not approve, publish, market, or distribute a deal.",
  },
  investor: {
    heading: "Relationship inquiry received.",
    body: "This records an interest for possible consideration in a private relationship conversation. Review is not promised, and this is not an offer, solicitation, commitment, or promise of returns.",
  },
  vendor: {
    heading: "Vendor inquiry received.",
    body: "The information is recorded for possible consideration. Review is not promised, and submission does not create approval, placement, project volume, or a service agreement.",
  },
  referral: {
    heading: "Referral inquiry received.",
    body: "The introduction context is recorded for possible consideration. Review is not promised, and any role, fee, or referral relationship must be agreed separately in writing.",
  },
  contact: {
    heading: "Message received.",
    body: "Your message is recorded for possible consideration. Review and follow-up are not promised. If Pegasus elects to continue, it may use the contact details you provided.",
  },
};

export function pegasusLeadSuccessCopy(lane: PegasusLeadLane) {
  return SUCCESS_COPY[lane];
}
