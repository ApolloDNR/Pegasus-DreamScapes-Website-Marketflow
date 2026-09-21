import { z } from "zod";

export const MARKETFLOW_WHOLESALE_PRIVATE_NOTES_MAX_LENGTH = 10_000;
export const MARKETFLOW_WHOLESALE_CONSENT_VERSION =
  "marketflow-wholesale-private-review-v1";

const optionalText = (max = 20_000) => z.string().trim().max(max).optional();
const optionalMoney = z.number().finite().min(0).max(1_000_000_000).optional();
const optionalCount = z.number().finite().min(0).max(100_000_000).optional();

export const marketflowWholesaleSubmissionSchema = z
  .object({
    propertyAddress: z.string().trim().min(5).max(500),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(50),
    zipCode: z.string().trim().min(3).max(20),
    county: optionalText(100),
    propertyType: z.string().trim().min(1).max(100),
    bedrooms: optionalCount,
    bathrooms: optionalText(20),
    sqft: optionalCount,
    yearBuilt: optionalCount,
    lotSize: optionalText(100),
    sellerName: optionalText(255),
    sellerPhone: optionalText(50),
    sellerEmail: z.string().trim().email().max(255).optional().or(z.literal("")),
    sellerMotivation: optionalText(100),
    motivationLevel: optionalCount,
    sellerSituation: optionalText(),
    askingPrice: optionalMoney,
    contractPrice: z.number().finite().positive().max(1_000_000_000),
    assignmentFee: z.number().finite().positive().max(1_000_000_000),
    maxAssignmentFee: optionalMoney,
    arv: optionalMoney,
    estimatedRepairs: optionalMoney,
    repairDetails: optionalText(),
    holdingCosts: optionalMoney,
    closingCosts: optionalMoney,
    emdAmount: optionalMoney,
    emdDueDate: optionalText(50),
    emdHeldBy: optionalText(255),
    contractDate: optionalText(50),
    inspectionDeadline: optionalText(50),
    dueDiligenceDeadline: optionalText(50),
    closingDate: optionalText(50),
    contractExpiration: optionalText(50),
    occupancyStatus: optionalText(100),
    accessInstructions: optionalText(),
    lockboxCode: optionalText(100),
    showingAvailability: optionalText(),
    tenantInfo: optionalText(),
    titleCompany: optionalText(255),
    titleContact: optionalText(255),
    titlePhone: optionalText(50),
    titleIssues: optionalText(),
    strategy: z.string().trim().min(1).max(100),
    exitStrategy: optionalText(100),
    description: optionalText(),
    idealBuyerType: optionalText(100),
    buyerExperienceRequired: optionalText(255),
    proofOfFundsRequired: z.boolean().optional(),
    assignmentNotes: optionalText(),
    pipelineStage: optionalText(100),
    dispositionPath: optionalText(100),
    negotiationAllowed: z.boolean().optional(),
    jvAllowed: z.boolean().optional(),
    highlights: z.array(z.string().trim().min(1).max(500)).max(8),
    images: z.array(z.string().url().max(2_048)).max(10),
    consentAcknowledged: z.boolean(),
    consentVersion: z.literal(MARKETFLOW_WHOLESALE_CONSENT_VERSION),
  })
  .strict();

export type MarketflowWholesaleSubmission = z.infer<
  typeof marketflowWholesaleSubmissionSchema
>;

type MarketplaceIdentity = {
  userId: string;
  kind: "supabase" | "external";
};

export type MarketflowWholesaleStorageRow = {
  wholesaler_id: string | null;
  external_wholesaler_id: string | null;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: string;
  arv: number;
  asking_price: number;
  repair_estimate: number;
  assignment_fee: number;
  photos: string[];
  occupancy?: string;
  close_timeline?: string;
  notes: string;
  status: "Under Review";
  is_public: false;
  raising_capital: false;
};

export function buildMarketflowWholesaleSubmissionPayload(
  data: Record<string, unknown>,
  highlights: string[],
  images: string[],
): Record<string, unknown> {
  return {
    ...data,
    highlights,
    images,
    consentVersion: MARKETFLOW_WHOLESALE_CONSENT_VERSION,
  };
}

export function normalizeMarketflowWholesaleSubmission(
  value: unknown,
  identity: MarketplaceIdentity,
):
  | { ok: true; data: MarketflowWholesaleStorageRow }
  | { ok: false; message: string } {
  const candidate =
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  if (candidate.consentAcknowledged !== true) {
    return {
      ok: false,
      message: "Consent to store and review the deal information is required.",
    };
  }

  const parsed = marketflowWholesaleSubmissionSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, message: "Invalid deal details." };
  }

  const privateEnvelope = JSON.stringify({
    schema: "marketflow-wholesale-private-v1",
    consent: {
      accepted: true,
      version: parsed.data.consentVersion,
    },
    submission: parsed.data,
  });
  if (privateEnvelope.length > MARKETFLOW_WHOLESALE_PRIVATE_NOTES_MAX_LENGTH) {
    return {
      ok: false,
      message: "Private deal details are too long. Shorten the notes and try again.",
    };
  }

  return {
    ok: true,
    data: {
      wholesaler_id: identity.kind === "supabase" ? identity.userId : null,
      external_wholesaler_id:
        identity.kind === "external" ? identity.userId : null,
      address: parsed.data.propertyAddress,
      city: parsed.data.city,
      state: parsed.data.state,
      zip_code: parsed.data.zipCode,
      property_type: parsed.data.propertyType,
      arv: parsed.data.arv ?? 0,
      asking_price: parsed.data.contractPrice + parsed.data.assignmentFee,
      repair_estimate: parsed.data.estimatedRepairs ?? 0,
      assignment_fee: parsed.data.assignmentFee,
      photos: parsed.data.images,
      occupancy: parsed.data.occupancyStatus || undefined,
      close_timeline: parsed.data.closingDate || undefined,
      notes: privateEnvelope,
      status: "Under Review",
      is_public: false,
      raising_capital: false,
    },
  };
}
