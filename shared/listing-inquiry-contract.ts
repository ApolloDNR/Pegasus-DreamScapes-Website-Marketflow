import { z } from "zod";

const presentTrimmed = (max: number) =>
  z.string().trim().min(1).max(max);

export const listingInquiryRequestSchema = z
  .object({
    listingId: z.number().int().safe().positive(),
    inquiryType: z.enum(["info", "tour", "offer"]),
    fullName: presentTrimmed(255),
    email: presentTrimmed(255).email(),
    phone: presentTrimmed(50).optional(),
    message: presentTrimmed(4_000).optional(),
    preferredShowingDates: z
      .array(presentTrimmed(100))
      .max(3)
      .optional(),
    preApproved: z.boolean().optional(),
  })
  .strict();

export type ListingInquiryRequest = z.infer<
  typeof listingInquiryRequestSchema
>;
