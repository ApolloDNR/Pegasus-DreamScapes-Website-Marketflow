import { z } from "zod";

const MAX_OFFER_AMOUNT = 10_000_000_000;
const MAX_TERM_TEXT_LENGTH = 4_000;
const MAX_INSPECTION_DAYS = 365;
const MAX_CLOSE_DATE_YEARS = 5;

const fundingTypeSchema = z.enum([
  "cash",
  "cash_reserves",
  "hard_money",
  "conventional",
  "private_lender",
  "self_directed_ira",
  "other",
]);

function isRealIsoCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function addUtcYears(date: Date, years: number): Date {
  const result = new Date(date.getTime());
  result.setUTCFullYear(result.getUTCFullYear() + years);
  return result;
}

function boundedDateSchema(now: Date) {
  const earliest = now.toISOString().slice(0, 10);
  const latest = addUtcYears(now, MAX_CLOSE_DATE_YEARS)
    .toISOString()
    .slice(0, 10);

  return z
    .string()
    .trim()
    .refine(isRealIsoCalendarDate, "Date must use YYYY-MM-DD")
    .refine(
      (value) => value >= earliest && value <= latest,
      "Date is outside the allowed range",
    );
}

function financialTermsSchema(now: Date) {
  return z
    .object({
      offerPrice: z
        .number()
        .finite()
        .int()
        .min(1_000)
        .max(MAX_OFFER_AMOUNT),
      earnestMoney: z
        .number()
        .finite()
        .int()
        .min(0)
        .max(MAX_OFFER_AMOUNT),
      closeDate: boundedDateSchema(now),
      inspectionPeriod: z
        .number()
        .finite()
        .int()
        .min(0)
        .max(MAX_INSPECTION_DAYS),
      fundingType: fundingTypeSchema,
      notes: z.string().trim().max(MAX_TERM_TEXT_LENGTH),
    })
    .strict()
    .superRefine((terms, context) => {
      if (terms.earnestMoney > terms.offerPrice) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["earnestMoney"],
          message: "Earnest money cannot exceed the offer price",
        });
      }
    });
}

const contributionSchema = z.enum([
  "capital",
  "construction",
  "acquisitions",
  "dispositions",
  "buyer_network",
  "due_diligence",
]);

const wholesaleJvSchema = z
  .object({
    roleSelection: z.enum(["deal_bringer", "buyer_bringer"]),
    proposedSplit: z.number().finite().int().min(1).max(99),
    contributions: z
      .array(contributionSchema)
      .min(1)
      .max(6)
      .refine(
        (items) => new Set(items).size === items.length,
        "Contributions must be unique",
      ),
    message: z.string().trim().min(1).max(MAX_TERM_TEXT_LENGTH),
  })
  .strict();

function showingRequestSchema(now: Date) {
  return z
    .object({
      preferredDates: z
        .array(boundedDateSchema(now))
        .min(1)
        .max(3)
        .refine(
          (items) => new Set(items).size === items.length,
          "Preferred dates must be unique",
        ),
      hasAgent: z.boolean(),
      financingType: fundingTypeSchema,
      message: z.string().trim().min(1).max(MAX_TERM_TEXT_LENGTH),
    })
    .strict();
}

export type MarketflowOfferPayloadParseResult =
  | {
      success: true;
      data: Record<string, unknown>;
    }
  | {
      success: false;
      reason: "unsupported_offer_kind" | "invalid_payload";
    };

export function parseMarketflowOfferPayload(
  offerKind: string,
  payload: unknown,
  now: Date = new Date(),
): MarketflowOfferPayloadParseResult {
  let schema: z.ZodTypeAny;
  switch (offerKind) {
    case "WHOLESALE_ASSIGNMENT":
    case "CAPITAL_INVESTMENT":
    case "LISTING_INQUIRY":
      schema = financialTermsSchema(now);
      break;
    case "WHOLESALE_JV":
      schema = wholesaleJvSchema;
      break;
    case "SHOWING_REQUEST":
      schema = showingRequestSchema(now);
      break;
    default:
      return { success: false, reason: "unsupported_offer_kind" };
  }

  const result = schema.safeParse(payload);
  if (!result.success) {
    return { success: false, reason: "invalid_payload" };
  }
  return {
    success: true,
    data: result.data as Record<string, unknown>,
  };
}
