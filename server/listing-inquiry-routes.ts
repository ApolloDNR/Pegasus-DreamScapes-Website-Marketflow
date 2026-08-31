import type {
  Request,
  RequestHandler,
  Response,
} from "express";
import type {
  InsertListingInquiry,
  Listing,
  ListingInquiry,
} from "@shared/schema";
import {
  listingInquiryRequestSchema,
  type ListingInquiryRequest,
} from "@shared/listing-inquiry-contract";
import { isPublicListing } from "./public-marketplace";

export interface ListingInquiryRouteDependencies {
  getAuthUserId(req: Request): string | null;
  hasReviewedInventoryAccess(res: Response): boolean;
  getListing(id: number): Promise<Listing | undefined>;
  canInitiateInquiry(
    req: Request,
    res: Response,
    userId: string,
    listingId: number,
  ): Promise<boolean>;
  createListingInquiry(
    input: InsertListingInquiry,
  ): Promise<ListingInquiry>;
}

export interface ListingInquiryRouteHandlers {
  validateInquiry: RequestHandler;
  getContext: RequestHandler;
  postInquiry: RequestHandler;
}

const setNoStore = (res: Response) => {
  res.setHeader("Cache-Control", "no-store");
};

const listingNotFound = (res: Response) => {
  setNoStore(res);
  return res.status(404).json({ message: "Listing not found" });
};

const publicListingContext = (listing: Listing) => ({
  dealType: "LISTING" as const,
  dealId: listing.id,
  deal: {
    id: listing.id,
    propertyAddress: listing.propertyAddress,
    city: listing.city,
    state: listing.state,
    zipCode: listing.zipCode,
    propertyType: listing.propertyType,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    sqft: listing.sqft,
    yearBuilt: listing.yearBuilt,
    images: listing.images,
  },
  listingTerms: {
    listPrice: listing.listPrice,
    pricePerSqft: listing.pricePerSqft,
    listingType: listing.listingType,
    condition: listing.condition,
    hoa: listing.hoa,
    amenities: listing.amenities,
  },
  status: listing.status,
});

export function createListingInquiryRouteHandlers(
  dependencies: ListingInquiryRouteDependencies,
): ListingInquiryRouteHandlers {
  const validateInquiry: RequestHandler = (req, res, next) => {
    setNoStore(res);
    const result = listingInquiryRequestSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid listing inquiry" });
    }
    res.locals.listingInquiryRequest = result.data;
    next();
  };

  const getContext: RequestHandler = async (req, res) => {
    setNoStore(res);
    try {
      const userId = dependencies.getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (!dependencies.hasReviewedInventoryAccess(res)) {
        return listingNotFound(res);
      }

      const listingId = Number(req.params.id);
      if (!Number.isSafeInteger(listingId) || listingId <= 0) {
        return listingNotFound(res);
      }
      const listing = await dependencies.getListing(listingId);
      if (!listing || !isPublicListing(listing)) {
        return listingNotFound(res);
      }

      return res.json(publicListingContext(listing));
    } catch (error) {
      console.error("Error fetching listing inquiry context:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  const postInquiry: RequestHandler = async (req, res) => {
    setNoStore(res);
    try {
      const parsed = res.locals.listingInquiryRequest as
        | ListingInquiryRequest
        | undefined;
      if (!parsed) {
        return res.status(400).json({ message: "Invalid listing inquiry" });
      }
      const userId = dependencies.getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const allowed = await dependencies.canInitiateInquiry(
        req,
        res,
        userId,
        parsed.listingId,
      );
      if (!allowed) return listingNotFound(res);

      const inquiry = await dependencies.createListingInquiry({
        listingId: parsed.listingId,
        userId,
        fullName: parsed.fullName,
        email: parsed.email,
        interestType: parsed.inquiryType,
        ...(parsed.phone !== undefined ? { phone: parsed.phone } : {}),
        ...(parsed.message !== undefined ? { message: parsed.message } : {}),
        ...(parsed.preferredShowingDates !== undefined
          ? { preferredShowingDates: parsed.preferredShowingDates }
          : {}),
        ...(parsed.preApproved !== undefined
          ? { preApproved: parsed.preApproved }
          : {}),
      });
      return res.status(201).json(inquiry);
    } catch (error) {
      console.error("Error creating listing inquiry:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  return { validateInquiry, getContext, postInquiry };
}
