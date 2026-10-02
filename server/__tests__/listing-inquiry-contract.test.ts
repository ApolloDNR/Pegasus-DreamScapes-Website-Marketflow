import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import express, {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from "express";
import fs from "node:fs";
import path from "node:path";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { listingInquiryRequestSchema } from "@shared/listing-inquiry-contract";

type HandlerFactory = (dependencies: {
  getAuthUserId(req: Request): string | null;
  hasReviewedInventoryAccess(res: Response): boolean;
  getListing(id: number): Promise<Record<string, unknown> | undefined>;
  canInitiateInquiry(
    req: Request,
    res: Response,
    userId: string,
    listingId: number,
  ): Promise<boolean>;
  createListingInquiry(
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
}) => {
  validateInquiry: RequestHandler;
  getContext: RequestHandler;
  postInquiry: RequestHandler;
};

const modulePath = path.join(
  process.cwd(),
  "server/listing-inquiry-routes.ts",
);
const routeModule = fs.existsSync(modulePath)
  ? await import(/* @vite-ignore */ "../listing-inquiry-routes")
  : {};
const createHandlers = (
  routeModule as { createListingInquiryRouteHandlers?: unknown }
).createListingInquiryRouteHandlers;

function requireFactory(): HandlerFactory {
  expect(
    createHandlers,
    "listing inquiries need dependency-injected production route handlers",
  ).toBeTypeOf("function");
  if (typeof createHandlers !== "function") {
    throw new Error("Listing inquiry handlers are not implemented");
  }
  return createHandlers as HandlerFactory;
}

const ACTIVE = {
  id: 42,
  submittedBy: "seller-1",
  propertyAddress: "42 Canonical Way",
  city: "Oakland",
  state: "CA",
  zipCode: "94610",
  county: "Alameda",
  propertyType: "single_family",
  bedrooms: 3,
  bathrooms: "2",
  sqft: 1450,
  yearBuilt: 1958,
  images: ["front.webp"],
  listingType: "on_market",
  listPrice: 825000,
  pricePerSqft: 569,
  condition: "move_in_ready",
  hoa: 0,
  amenities: ["Garage"],
  status: "active",
  showingInstructions: "Call tenant before entry",
  lockboxCode: "9911",
  occupancyStatus: "tenant_occupied",
  availableDate: new Date("2026-08-20T17:00:00.000Z"),
  agentName: "Private Agent",
  agentPhone: "510-555-0199",
  agentEmail: "private-agent@example.com",
  inquiryCount: 7,
  viewCount: 99,
  listedAt: new Date("2026-08-01T00:00:00.000Z"),
  createdAt: new Date("2026-07-01T00:00:00.000Z"),
  updatedAt: new Date("2026-08-13T00:00:00.000Z"),
};
const PRIVATE = { ...ACTIVE, id: 43, status: "off_market" };
const COMING_SOON = { ...ACTIVE, id: 44, status: "coming_soon" };

const getListing = vi.fn();
const canInitiateInquiry = vi.fn();
const createListingInquiry = vi.fn();
const loadReviewedAccess = vi.fn();
let listings = new Map<number, Record<string, unknown>>();
let server: Server | undefined;
let baseUrl = "";

const authenticate: RequestHandler = (req: any, res, next) => {
  const userId = req.get("x-test-user");
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  req.user = { claims: { sub: userId } };
  next();
};

beforeAll(async () => {
  if (typeof createHandlers !== "function") return;

  const handlers = requireFactory()({
    getAuthUserId: (req: any) => req.user?.claims?.sub ?? null,
    hasReviewedInventoryAccess: (res) =>
      res.locals.canAccessReviewedMarketflowInventory === true,
    getListing,
    canInitiateInquiry,
    createListingInquiry,
  });
  const app = express();
  app.use(express.json());
  app.get(
    "/api/deals/LISTING/:id/context",
    authenticate,
    loadReviewedAccess,
    handlers.getContext,
  );
  app.post(
    "/api/listing-inquiries",
    authenticate,
    handlers.validateInquiry,
    loadReviewedAccess,
    handlers.postInquiry,
  );

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  if (!server) return;
  await new Promise<void>((resolve, reject) => {
    server!.close((error) => (error ? reject(error) : resolve()));
  });
});

beforeEach(() => {
  listings = new Map([
    [42, ACTIVE],
    [43, PRIVATE],
    [44, COMING_SOON],
  ]);
  getListing.mockReset().mockImplementation(async (id: number) =>
    listings.get(id),
  );
  canInitiateInquiry.mockReset().mockImplementation(
    async (_req: Request, res: Response, userId: string, listingId: number) =>
      res.locals.canAccessReviewedMarketflowInventory === true &&
      listingId === 42 &&
      userId !== ACTIVE.submittedBy,
  );
  createListingInquiry.mockReset().mockImplementation(async (input) => ({
    id: 901,
    status: "pending",
    ...input,
  }));
  loadReviewedAccess.mockReset().mockImplementation(
    (req: Request, res: Response, next: NextFunction) => {
      res.locals.canAccessReviewedMarketflowInventory =
        req.get("x-test-reviewed") === "true";
      next();
    },
  );
});

function headers(reviewed = true) {
  return {
    "content-type": "application/json",
    "x-test-user": "buyer-1",
    "x-test-reviewed": String(reviewed),
  };
}

async function post(body: unknown, reviewed = true) {
  requireFactory();
  return fetch(`${baseUrl}/api/listing-inquiries`, {
    method: "POST",
    headers: headers(reviewed),
    body: JSON.stringify(body),
  });
}

async function getContext(id: number | string, reviewed = true) {
  requireFactory();
  return fetch(`${baseUrl}/api/deals/LISTING/${id}/context`, {
    headers: headers(reviewed),
  });
}

const validInfo = {
  listingId: 42,
  inquiryType: "info",
  fullName: "Taylor Buyer",
  email: "taylor@example.com",
  message: "Preferred contact: Email",
};

describe("listing inquiry shared request contract", () => {
  it("trims canonical fields and preserves false", () => {
    expect(listingInquiryRequestSchema.parse({
      listingId: 42,
      inquiryType: "tour",
      fullName: "  Taylor Buyer  ",
      email: "  taylor@example.com  ",
      preferredShowingDates: ["  2026-08-20 09:00  "],
      preApproved: false,
    })).toEqual({
      listingId: 42,
      inquiryType: "tour",
      fullName: "Taylor Buyer",
      email: "taylor@example.com",
      preferredShowingDates: ["2026-08-20 09:00"],
      preApproved: false,
    });
  });

  it("accepts a syntactically valid email at the 255-character boundary", () => {
    const email = `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(62)}`;
    expect(email).toHaveLength(255);
    expect(listingInquiryRequestSchema.safeParse({
      listingId: 42,
      inquiryType: "info",
      fullName: "Taylor Buyer",
      email,
    }).success).toBe(true);
  });
});

describe("POST /api/listing-inquiries", () => {
  it.each([
    {
      label: "name-only and phone-only legacy request",
      body: {
        listingId: 42,
        inquiryType: "tour",
        name: "Taylor Buyer",
        phone: "510-555-0142",
        preferredDates: ["2026-08-20"],
        preferredTimes: ["morning"],
        isPreApproved: true,
      },
    },
    {
      label: "otherwise valid request with an obsolete alias",
      body: { ...validInfo, preferredDate: "2026-08-20" },
    },
    {
      label: "unsafe listing id",
      body: { ...validInfo, listingId: Number.MAX_SAFE_INTEGER + 1 },
    },
    {
      label: "email wider than varchar(255)",
      body: {
        ...validInfo,
        email: `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(63)}`,
      },
    },
  ])("rejects $label before reviewed access or storage", async ({ body }) => {
    const response = await post(body);

    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(loadReviewedAccess).not.toHaveBeenCalled();
    expect(canInitiateInquiry).not.toHaveBeenCalled();
    expect(getListing).not.toHaveBeenCalled();
    expect(createListingInquiry).not.toHaveBeenCalled();
  });

  it("persists only parsed canonical tour fields", async () => {
    const response = await post({
      listingId: 42,
      inquiryType: "tour",
      fullName: "  Taylor Buyer  ",
      email: "  taylor@example.com  ",
      phone: "  510-555-0142  ",
      message: "  Please confirm by email.  ",
      preferredShowingDates: [
        "  2026-08-20 09:00  ",
        "2026-08-21",
        "2026-08-22 17:30",
      ],
      preApproved: false,
    });

    expect(response.status).toBe(201);
    expect(loadReviewedAccess).toHaveBeenCalledTimes(1);
    expect(canInitiateInquiry).toHaveBeenCalledTimes(1);
    expect(createListingInquiry).toHaveBeenCalledWith({
      listingId: 42,
      userId: "buyer-1",
      fullName: "Taylor Buyer",
      email: "taylor@example.com",
      phone: "510-555-0142",
      interestType: "tour",
      message: "Please confirm by email.",
      preferredShowingDates: [
        "2026-08-20 09:00",
        "2026-08-21",
        "2026-08-22 17:30",
      ],
      preApproved: false,
    });
  });

  it("allows reviewed first contact and persists canonical info", async () => {
    const response = await post({
      ...validInfo,
      fullName: "  Taylor Buyer  ",
      email: "  taylor@example.com  ",
      message: "  Preferred contact: Email  ",
    });

    expect(response.status).toBe(201);
    expect(loadReviewedAccess).toHaveBeenCalledTimes(1);
    expect(canInitiateInquiry).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      "buyer-1",
      42,
    );
    expect(createListingInquiry).toHaveBeenCalledWith({
      listingId: 42,
      userId: "buyer-1",
      fullName: "Taylor Buyer",
      email: "taylor@example.com",
      interestType: "info",
      message: "Preferred contact: Email",
    });
  });

  it("uses one no-store 404 for an inaccessible listing", async () => {
    const response = await post({ ...validInfo, listingId: 43 });

    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ message: "Listing not found" });
    expect(createListingInquiry).not.toHaveBeenCalled();
  });
});

describe("GET /api/deals/LISTING/:id/context", () => {
  it("returns a reviewed first-time buyer only the public projection", async () => {
    const response = await getContext(42, true);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      dealType: "LISTING",
      dealId: 42,
      deal: {
        id: 42,
        propertyAddress: "42 Canonical Way",
        city: "Oakland",
        state: "CA",
        zipCode: "94610",
        propertyType: "single_family",
        bedrooms: 3,
        bathrooms: "2",
        sqft: 1450,
        yearBuilt: 1958,
        images: ["front.webp"],
      },
      listingTerms: {
        listPrice: 825000,
        pricePerSqft: 569,
        listingType: "on_market",
        condition: "move_in_ready",
        hoa: 0,
        amenities: ["Garage"],
      },
      status: "active",
    });
    expect(canInitiateInquiry).not.toHaveBeenCalled();
    expect(createListingInquiry).not.toHaveBeenCalled();
  });

  it("admits a reviewed coming-soon listing to the same projection", async () => {
    const response = await getContext(44, true);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(
      expect.objectContaining({ dealId: 44, status: "coming_soon" }),
    );
  });

  it("makes unreviewed, private, malformed, and missing responses identical", async () => {
    const responses = await Promise.all([
      getContext(42, false),
      getContext(43, true),
      getContext("not-a-number", true),
      getContext(999, true),
    ]);
    const observed = await Promise.all(responses.map(async (response) => ({
      status: response.status,
      cacheControl: response.headers.get("cache-control"),
      body: await response.json(),
    })));
    const hidden = {
      status: 404,
      cacheControl: "no-store",
      body: { message: "Listing not found" },
    };

    expect(observed).toEqual([hidden, hidden, hidden, hidden]);
  });
});
