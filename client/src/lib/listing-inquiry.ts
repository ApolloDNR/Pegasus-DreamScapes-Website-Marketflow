import { ZodError } from "zod";
import {
  listingInquiryRequestSchema,
  type ListingInquiryRequest,
} from "@shared/listing-inquiry-contract";

export type PreferredContact = "email" | "phone" | "either";

export interface ListingInfoDraft {
  listingId: number;
  name: string;
  email: string;
  phone?: string;
  preferredContact: PreferredContact;
  questions: readonly string[];
  customQuestion?: string;
  timeframe?: string;
}

export interface ListingTourDraft {
  listingId: number;
  name: string;
  email: string;
  phone?: string;
  preferredDates: readonly string[];
  preferredTimes: readonly string[];
  preApproved: boolean | null;
  message?: string;
}

export interface MarketplaceListingContact {
  listingId: string;
  propertyAddress: string;
  intent: "info" | "showing";
}

const contactLabels: Record<PreferredContact, string> = {
  email: "Email",
  phone: "Phone",
  either: "Either",
};

const optional = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export function buildListingInfoRequest(
  draft: ListingInfoDraft,
): ListingInquiryRequest {
  const lines = [
    `Preferred contact: ${contactLabels[draft.preferredContact]}`,
  ];
  for (const question of draft.questions) {
    const value = question.trim();
    if (value) lines.push(`Question: ${value}`);
  }
  const customQuestion = optional(draft.customQuestion);
  if (customQuestion) lines.push(`Additional question: ${customQuestion}`);
  const timeframe = optional(draft.timeframe);
  if (timeframe) lines.push(`Timeframe: ${timeframe}`);
  const phone = optional(draft.phone);

  return listingInquiryRequestSchema.parse({
    listingId: draft.listingId,
    inquiryType: "info",
    fullName: draft.name,
    email: draft.email,
    message: lines.join("\n"),
    ...(phone !== undefined ? { phone } : {}),
  });
}

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function zipPreferredShowingDates(
  dates: readonly string[],
  times: readonly string[],
): string[] {
  if (dates.length > 3 || times.length > 3) {
    throw new Error("Choose at most three preferred showing times.");
  }

  return Array.from(
    { length: Math.max(dates.length, times.length) },
    (_, index) => {
      const date = dates[index]?.trim() ?? "";
      const time = times[index]?.trim() ?? "";
      if (time && !date) {
        throw new Error("Choose a date for each preferred time.");
      }
      if (date && !datePattern.test(date)) {
        throw new Error("Choose a valid preferred date.");
      }
      if (time && !timePattern.test(time)) {
        throw new Error("Choose a valid preferred time.");
      }
      return date ? `${date}${time ? ` ${time}` : ""}` : "";
    },
  ).filter(Boolean);
}

export function buildListingTourRequest(
  draft: ListingTourDraft,
): ListingInquiryRequest {
  const preferredShowingDates = zipPreferredShowingDates(
    draft.preferredDates,
    draft.preferredTimes,
  );

  const phone = optional(draft.phone);
  const message = optional(draft.message);

  return listingInquiryRequestSchema.parse({
    listingId: draft.listingId,
    inquiryType: "tour",
    fullName: draft.name,
    email: draft.email,
    preferredShowingDates,
    ...(phone !== undefined ? { phone } : {}),
    ...(message !== undefined ? { message } : {}),
    ...(draft.preApproved !== null
      ? { preApproved: draft.preApproved }
      : {}),
  });
}

export function listingInquiryValidationMessage(error: unknown): string {
  if (error instanceof ZodError) {
    const first = error.issues[0];
    if (first?.path[0] === "email") return "Enter a valid email address.";
    if (first?.path[0] === "fullName") return "Enter your full name.";
    if (first?.path[0] === "phone") return "Phone must be 50 characters or fewer.";
    if (first?.path[0] === "message") return "Inquiry details must be 4,000 characters or fewer.";
    return "Check the inquiry fields and try again.";
  }
  return error instanceof Error
    ? error.message
    : "Check the inquiry fields and try again.";
}

export function buildMarketplaceListingMailto({
  listingId,
  propertyAddress,
  intent,
}: MarketplaceListingContact): string {
  const subject = intent === "showing"
    ? `Showing request — ${propertyAddress}`
    : `Property information request — ${propertyAddress}`;
  const request = intent === "showing"
    ? "I would like to arrange a showing."
    : "I would like more information about this property.";
  const body = [
    request,
    `Property: ${propertyAddress}`,
    `Listing ID: ${listingId}`,
  ].join("\n");

  return `mailto:apollo@pegasusdreamscapes.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
