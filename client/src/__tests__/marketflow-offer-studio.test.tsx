import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { Router, Route } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getQueryFn } from "@/lib/queryClient";

// ---------------------------------------------------------------------------
// Auth mock — matches the pattern in marketflow-pages-gating.test.tsx so we
// can flip between authorized and disallowed roles per test.
// ---------------------------------------------------------------------------

type AuthRole = "loggedOut" | "wholesaler" | "dreamscaper" | "buyer" | "vendor";

interface AuthState {
  user: { id: string; email: string } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuestMode: boolean;
  guestRole: string | null;
  userRole: string | null;
  isAdmin: boolean;
  isWholesaler: boolean;
  isDreamscaper: boolean;
  isInvestor: boolean;
  isBuyer: boolean;
  isPegasus: boolean;
  profile: Record<string, unknown> | null;
}

const baseAuth: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isGuestMode: false,
  guestRole: null,
  userRole: null,
  isAdmin: false,
  isWholesaler: false,
  isDreamscaper: false,
  isInvestor: false,
  isBuyer: false,
  isPegasus: false,
  profile: null,
};

let authState: AuthState = { ...baseAuth };

const boundary = vi.hoisted(() => ({
  toast: vi.fn(),
}));

function authFor(role: AuthRole): AuthState {
  switch (role) {
    case "loggedOut":
      return { ...baseAuth };
    case "wholesaler":
      return {
        ...baseAuth,
        user: { id: "u-wholesaler", email: "w@example.com" },
        profile: { primary_role: "wholesaler" },
        isAuthenticated: true,
        userRole: "wholesaler",
        isWholesaler: true,
      };
    case "dreamscaper":
      return {
        ...baseAuth,
        user: { id: "u-dreamscaper", email: "d@example.com" },
        profile: { primary_role: "dreamscaper" },
        isAuthenticated: true,
        userRole: "dreamscaper",
        isDreamscaper: true,
      };
    case "buyer":
      return {
        ...baseAuth,
        user: { id: "u-buyer", email: "b@example.com" },
        profile: { primary_role: "buyer_investment" },
        isAuthenticated: true,
        userRole: "buyer_investment",
        isBuyer: true,
      };
    case "vendor":
      // Authenticated but not in operator/wholesaler/buyer/investor/admin set.
      return {
        ...baseAuth,
        user: { id: "u-vendor", email: "v@example.com" },
        profile: { primary_role: "vendor" },
        isAuthenticated: true,
        userRole: "vendor",
      };
  }
}

function setAuthState(role: AuthRole) {
  authState = authFor(role);
}

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    ...authState,
    hasPermission: () => false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    refreshProfile: vi.fn(),
    enterGuestMode: vi.fn(),
    exitGuestMode: vi.fn(),
  }),
  SupabaseAuthProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  getRoleDashboardPath: () => "/marketflow",
  canAccessRoute: () => true,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: boundary.toast }),
  toast: boundary.toast,
}));

// ---------------------------------------------------------------------------
// Fetch mock — drives the deal, negotiation, and offer responses for the
// Offer Studio. We keep mutable state so a POST /api/marketflow/offers
// causes the next negotiation refetch to surface the new offer on the ladder.
// ---------------------------------------------------------------------------

const DEAL_ID = "9001";
const COUNTERPARTY_ID = "u-counterparty";

interface ServerOffer {
  id: number;
  status: string;
  createdBy: string;
  createdAt: string;
  payload: Record<string, unknown>;
}

interface ServerNegotiation {
  id: number;
  posterId: string;
  counterpartyId: string;
}

interface FetchState {
  deal: Record<string, unknown>;
  negotiation: ServerNegotiation | null;
  offers: ServerOffer[];
  messages: unknown[];
  postedOffers: Array<{ url: string; body: Record<string, unknown> }>;
  postedResponses: Array<{ url: string; body: Record<string, unknown> }>;
}

let fetchState: FetchState;

function resetFetchState(opts: { seedNegotiation?: ServerNegotiation } = {}) {
  fetchState = {
    deal: {
      id: 9001,
      propertyAddress: "123 Test St",
      city: "Phoenix",
      state: "AZ",
      askingPrice: 200000,
      arv: 300000,
      assignmentFee: 10000,
      submittedBy: COUNTERPARTY_ID,
    },
    negotiation: opts.seedNegotiation || null,
    offers: [],
    messages: [],
    postedOffers: [],
    postedResponses: [],
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const fetchMock = vi.fn(
  async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : input.toString();
    const method = (init?.method || "GET").toUpperCase();

    // GET the wholesale deal record
    if (method === "GET" && url.startsWith("/api/wholesale-deals/")) {
      return jsonResponse(fetchState.deal);
    }

    if (
      method === "GET" &&
      (url.startsWith("/api/capital-projects/") ||
        url.startsWith("/api/retail-listings/") ||
        url.startsWith("/api/listings/"))
    ) {
      return jsonResponse(fetchState.deal);
    }

    // GET negotiations indexed for the deal+lane
    if (
      method === "GET" &&
      url.startsWith("/api/marketflow/negotiations/deal/")
    ) {
      return jsonResponse(
        fetchState.negotiation ? [fetchState.negotiation] : [],
      );
    }

    // GET a specific negotiation envelope (offers + messages)
    const negMatch = url.match(/^\/api\/marketflow\/negotiations\/(\d+)$/);
    if (method === "GET" && negMatch) {
      return jsonResponse({
        negotiation: fetchState.negotiation,
        offers: fetchState.offers,
        messages: fetchState.messages,
      });
    }

    // POST a new offer to the ladder
    if (method === "POST" && url === "/api/marketflow/offers") {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      fetchState.postedOffers.push({ url, body });
      if (!fetchState.negotiation) {
        fetchState.negotiation = {
          id: 4242,
          posterId: authState.user?.id || "me",
          counterpartyId: COUNTERPARTY_ID,
        };
      }
      const offer: ServerOffer = {
        id: 7001 + fetchState.offers.length,
        status: "pending",
        createdBy: authState.user?.id || "me",
        createdAt: new Date().toISOString(),
        payload: (body.payload as Record<string, unknown>) || {},
      };
      fetchState.offers.push(offer);
      return jsonResponse({ offer, negotiation: fetchState.negotiation });
    }

    const responseMatch = url.match(
      /^\/api\/marketflow\/offers\/(\d+)\/respond$/,
    );
    if (method === "POST" && responseMatch) {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      fetchState.postedResponses.push({ url, body });
      return jsonResponse({
        offer: fetchState.offers.find(
          (offer) => offer.id === Number(responseMatch[1]),
        ),
        negotiation: fetchState.negotiation,
      });
    }

    // Default: 404 so unexpected calls fail loudly.
    return new Response("not found", { status: 404 });
  },
);

vi.stubGlobal("fetch", fetchMock);

// ---------------------------------------------------------------------------
// Render helper — mounts the lazy-loaded page under a wouter Route so the
// component's useParams("/marketflow/offer-studio/:dealId") resolves.
// ---------------------------------------------------------------------------

async function renderOfferStudio(
  path = `/marketflow/offer-studio/${DEAL_ID}`,
  search = "",
) {
  const { default: MarketflowOfferStudio } = await import(
    "@/pages/marketflow/offer-studio"
  );
  const { hook } = memoryLocation({ path, static: true });
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: getQueryFn({ on401: "throw" }),
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <TooltipProvider>
        <Router hook={hook} searchHook={() => search}>
          <Route path="/marketflow/offer-studio/:dealId">
            <MarketflowOfferStudio />
          </Route>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  setAuthState("loggedOut");
  resetFetchState();
  fetchMock.mockClear();
  boundary.toast.mockReset();
});

function seedExistingNegotiation(posterId: string) {
  fetchState.negotiation = {
    id: 4242,
    posterId,
    counterpartyId: COUNTERPARTY_ID,
  };
}

function dateFromToday(days: number) {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function change(testId: string, value: string) {
  fireEvent.change(screen.getByTestId(testId), { target: { value } });
}

function postCalls() {
  return fetchMock.mock.calls.filter(([, init]) =>
    ((init as RequestInit | undefined)?.method || "GET").toUpperCase() ===
    "POST",
  );
}

function seedIncomingOffer(userId: string) {
  seedExistingNegotiation(userId);
  fetchState.offers.push({
    id: 7100,
    status: "pending",
    createdBy: COUNTERPARTY_ID,
    createdAt: new Date().toISOString(),
    payload: {
      offerPrice: 165_432,
      earnestMoney: 4_321,
      closeDate: dateFromToday(30),
      inspectionPeriod: 9,
      fundingType: "cash",
      notes: "Incoming terms",
    },
  });
}

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("MarketFlow Offer Studio", () => {
  it.each<[AuthRole, string]>([
    ["wholesaler", "u-wholesaler"],
    ["dreamscaper", "u-dreamscaper"],
    ["buyer", "u-buyer"],
  ])(
    "lets a %s send the displayed wholesale total in one exact create body",
    async (role, userId) => {
      setAuthState(role);
      seedExistingNegotiation(userId);
      await renderOfferStudio();

      expect(
        await screen.findByTestId("page-offer-studio"),
      ).toBeInTheDocument();
      expect(await screen.findByTestId("text-deal-address")).toHaveTextContent(
        "123 Test St",
      );
      expect(await screen.findByTestId("badge-offer-count")).toHaveTextContent(
        "0 offers",
      );
      expect(screen.queryByTestId("list-offer-history")).toBeNull();

      const closeDate = dateFromToday(45);
      const totalInput = screen.getByLabelText(
        "Total assignment price",
      ) as HTMLInputElement;
      fireEvent.change(totalInput, { target: { value: "176543" } });
      change("input-earnest-money", "7654");
      change("input-close-date", closeDate);
      change("input-inspection-period", "13");
      change("select-funding-type", "hard_money");
      change("input-notes", "Distinctive studio terms");
      expect(totalInput).toHaveValue(176543);

      fireEvent.click(screen.getByTestId("button-send-offer"));

      await waitFor(() => expect(fetchState.postedOffers).toHaveLength(1));
      expect(fetchState.postedOffers[0]).toEqual({
        url: "/api/marketflow/offers",
        body: {
          lane: "WHOLESALE",
          dealId: 9001,
          offerKind: "WHOLESALE_ASSIGNMENT",
          payload: {
            offerPrice: 176_543,
            earnestMoney: 7_654,
            closeDate,
            inspectionPeriod: 13,
            fundingType: "hard_money",
            notes: "Distinctive studio terms",
          },
        },
      });
      expect(fetchState.postedResponses).toEqual([]);

      const ladder = await screen.findByTestId(
        "list-offer-history",
        {},
        { timeout: 5000 },
      );
      expect(ladder).toBeInTheDocument();
      const offerRows = await screen.findAllByTestId(
        /^offer-row-/,
        {},
        { timeout: 5000 },
      );
      expect(offerRows).toHaveLength(1);
      expect(offerRows[0]).toHaveTextContent("You");
      expect(offerRows[0]).toHaveTextContent("$176,543");
      expect(await screen.findByTestId("badge-offer-count")).toHaveTextContent(
        "1 offer",
      );
    },
    15_000,
  );

  it.each(["CAPITAL", "LISTING"])(
    "keeps the %s composer labeled Offer Price",
    async (lane) => {
      setAuthState("buyer");
      await renderOfferStudio(
        `/marketflow/offer-studio/${DEAL_ID}`,
        `?lane=${lane}`,
      );

      expect(await screen.findByLabelText("Offer Price")).toBeInTheDocument();
      expect(screen.queryByLabelText("Total assignment price")).toBeNull();
    },
  );

  it("loads the private listing DTO, displays listPrice, and submits one exact LISTING offer", async () => {
    setAuthState("buyer");
    fetchState.deal = {
      id: 9001,
      propertyAddress: "900 Reviewed Listing Way",
      city: "Oakland",
      state: "CA",
      listPrice: 735_000,
      status: "active",
    };

    await renderOfferStudio(
      `/marketflow/offer-studio/${DEAL_ID}`,
      "?lane=LISTING",
    );

    expect(
      await screen.findByTestId("text-deal-address"),
    ).toHaveTextContent("900 Reviewed Listing Way");
    expect(screen.getByTestId("text-asking-price")).toHaveTextContent(
      "$735,000",
    );
    expect(screen.getByLabelText("Offer Price")).toHaveValue(676_200);

    const getUrls = fetchMock.mock.calls
      .filter(
        ([, init]) =>
          ((init as RequestInit | undefined)?.method || "GET") === "GET",
      )
      .map(([url]) =>
        typeof url === "string" ? url : (url as URL).toString(),
      );
    expect(getUrls).toContain("/api/listings/9001");
    expect(getUrls).not.toContain("/api/retail-listings/9001");

    const closeDate = dateFromToday(45);
    change("input-offer-price", "700000");
    change("input-earnest-money", "10000");
    change("input-close-date", closeDate);
    change("input-inspection-period", "12");
    change("select-funding-type", "conventional");
    change("input-notes", "Exact listing terms");
    fireEvent.click(screen.getByTestId("button-send-offer"));

    await waitFor(() => expect(fetchState.postedOffers).toHaveLength(1));
    expect(fetchState.postedOffers[0]).toEqual({
      url: "/api/marketflow/offers",
      body: {
        lane: "LISTING",
        dealId: "9001",
        offerKind: "LISTING_INQUIRY",
        payload: {
          offerPrice: 700_000,
          earnestMoney: 10_000,
          closeDate,
          inspectionPeriod: 12,
          fundingType: "conventional",
          notes: "Exact listing terms",
        },
      },
    });
  });

  it("blocks, explains, and focuses an empty wholesale closing date without POSTing", async () => {
    setAuthState("buyer");
    seedExistingNegotiation("u-buyer");
    await renderOfferStudio();
    await screen.findByTestId("page-offer-studio");

    change("input-offer-price", "176543");
    const date = screen.getByLabelText("Close Date") as HTMLInputElement;
    expect(date).toBeRequired();
    const submit = screen.getByTestId("button-send-offer");
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    const error = await screen.findByTestId("error-offer-close-date");
    expect(error).toHaveAttribute("role", "alert");
    expect(error).toHaveTextContent("Closing date is required.");
    expect(date).toHaveAttribute("aria-invalid", "true");
    expect(date).toHaveAttribute("aria-describedby", error.id);
    await waitFor(() => expect(date).toHaveFocus());
    expect(postCalls()).toHaveLength(0);
    expect(fetchState.postedOffers).toEqual([]);
    expect(fetchState.postedResponses).toEqual([]);

    change("input-close-date", dateFromToday(45));
    await waitFor(() => {
      expect(screen.queryByTestId("error-offer-close-date")).toBeNull();
    });
    expect(date).not.toHaveAttribute("aria-invalid");
    expect(date).not.toHaveAttribute("aria-describedby");
    expect(postCalls()).toHaveLength(0);
  });

  it.each([
    ["blank", ""],
    ["fractional", "176543.5"],
    ["below the server minimum", "999"],
    ["above the server maximum", "10000000001"],
  ])("blocks a wholesale total %s before any POST", async (_label, value) => {
    setAuthState("buyer");
    seedExistingNegotiation("u-buyer");
    await renderOfferStudio();
    await screen.findByTestId("page-offer-studio");

    change("input-offer-price", value);
    change("input-close-date", dateFromToday(45));
    fireEvent.click(screen.getByTestId("button-send-offer"));

    const error = await screen.findByTestId(
      "error-offer-total-assignment-price",
    );
    expect(error).toHaveAttribute("role", "alert");
    expect(error).toHaveTextContent("Total assignment price is invalid.");
    expect(postCalls()).toHaveLength(0);
  });

  it.each([
    ["blank earnest money", "input-earnest-money", ""],
    ["negative earnest money", "input-earnest-money", "-1"],
    ["fractional earnest money", "input-earnest-money", "1.5"],
    ["earnest money above the total", "input-earnest-money", "176544"],
    ["blank inspection", "input-inspection-period", ""],
    ["negative inspection", "input-inspection-period", "-1"],
    ["fractional inspection", "input-inspection-period", "1.5"],
    ["inspection above 365 days", "input-inspection-period", "366"],
  ])("blocks invalid %s with every other term valid", async (_label, testId, value) => {
    setAuthState("buyer");
    seedExistingNegotiation("u-buyer");
    await renderOfferStudio();
    await screen.findByTestId("page-offer-studio");

    change("input-offer-price", "176543");
    change("input-close-date", dateFromToday(45));
    change(testId, value);
    const submit = screen.getByTestId("button-send-offer");
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() => {
      expect(boundary.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: testId.includes("earnest")
            ? "Valid earnest money required"
            : "Valid inspection period required",
          variant: "destructive",
        }),
      );
    });
    expect(postCalls()).toHaveLength(0);
    expect(fetchState.postedOffers).toEqual([]);
    expect(fetchState.postedResponses).toEqual([]);
  });

  it("sends the displayed wholesale total in one exact respond body", async () => {
    setAuthState("buyer");
    seedIncomingOffer("u-buyer");
    await renderOfferStudio();
    await screen.findByTestId("page-offer-studio");

    const closeDate = dateFromToday(60);
    const totalInput = screen.getByLabelText(
      "Total assignment price",
    ) as HTMLInputElement;
    await waitFor(() => expect(totalInput).toHaveValue(165432));
    fireEvent.change(totalInput, { target: { value: "181234" } });
    change("input-earnest-money", "0");
    change("input-close-date", closeDate);
    change("input-inspection-period", "0");
    change("select-funding-type", "private_lender");
    change("input-notes", "Distinctive response terms");
    expect(totalInput).toHaveValue(181234);

    fireEvent.click(screen.getByTestId("button-send-offer"));

    await waitFor(() => expect(fetchState.postedResponses).toHaveLength(1));
    expect(fetchState.postedResponses[0]).toEqual({
      url: "/api/marketflow/offers/7100/respond",
      body: {
        action: "counter",
        counterPayload: {
          offerPrice: 181_234,
          earnestMoney: 0,
          closeDate,
          inspectionPeriod: 0,
          fundingType: "private_lender",
          notes: "Distinctive response terms",
        },
      },
    });
    expect(fetchState.postedOffers).toEqual([]);
  });

  it("blocks an authenticated user with a disallowed role with the Offer Studio Restricted guard", async () => {
    setAuthState("vendor");
    await renderOfferStudio();

    // The page-level restricted guard renders, not the studio chrome.
    expect(
      await screen.findByTestId("text-access-denied-title"),
    ).toHaveTextContent(/offer studio restricted/i);
    expect(screen.queryByTestId("page-offer-studio")).toBeNull();
    expect(screen.queryByTestId("input-offer-price")).toBeNull();

    // The disallowed user must NOT have triggered the negotiation queries —
    // those are gated on roleAllowed and would leak negotiation data
    // otherwise. (The deal lookup itself is allowed to fire because it
    // only depends on authentication.)
    const negotiationCalls = fetchMock.mock.calls.filter(([url]) => {
      const u = typeof url === "string" ? url : (url as URL).toString();
      return u.startsWith("/api/marketflow/");
    });
    expect(negotiationCalls.length).toBe(0);
  });
});
