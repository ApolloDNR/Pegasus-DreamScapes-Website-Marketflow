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
  useToast: () => ({ toast: vi.fn() }),
  toast: vi.fn(),
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

    // Default: 404 so unexpected calls fail loudly.
    return new Response("not found", { status: 404 });
  },
);

vi.stubGlobal("fetch", fetchMock);

// ---------------------------------------------------------------------------
// Render helper — mounts the lazy-loaded page under a wouter Route so the
// component's useParams("/marketflow/offer-studio/:dealId") resolves.
// ---------------------------------------------------------------------------

async function renderOfferStudio(path = `/marketflow/offer-studio/${DEAL_ID}`) {
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
        <Router hook={hook}>
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
});

function seedExistingNegotiation(posterId: string) {
  fetchState.negotiation = {
    id: 4242,
    posterId,
    counterpartyId: COUNTERPARTY_ID,
  };
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
  ])("lets a %s open the studio, see the ladder, and send a new offer that appears in the history", async (role, userId) => {
    setAuthState(role);
    // Seed an existing negotiation thread so the offer ladder mounts on the
    // same page-load and the post-send refetch surfaces the new offer.
    seedExistingNegotiation(userId);
    await renderOfferStudio();

    // Studio frame renders with the deal title once the deal query resolves.
    expect(
      await screen.findByTestId("page-offer-studio"),
    ).toBeInTheDocument();
    expect(await screen.findByTestId("text-deal-address")).toHaveTextContent(
      "123 Test St",
    );

    // The Offer Ladder card mounts with a 0-offer badge before any offers exist.
    expect(await screen.findByTestId("badge-offer-count")).toHaveTextContent(
      "0 offers",
    );
    expect(screen.queryByTestId("list-offer-history")).toBeNull();

    // Compose and send a new offer through the composer.
    const priceInput = screen.getByTestId("input-offer-price") as HTMLInputElement;
    fireEvent.change(priceInput, { target: { value: "175000" } });
    fireEvent.click(screen.getByTestId("button-send-offer"));

    // The POST hits the offers endpoint with the composer payload.
    await waitFor(() => {
      expect(fetchState.postedOffers.length).toBe(1);
    });
    const posted = fetchState.postedOffers[0];
    expect(posted.body).toMatchObject({
      lane: "WHOLESALE",
      dealId: 9001,
      offerKind: "WHOLESALE_ASSIGNMENT",
    });
    expect((posted.body.payload as Record<string, unknown>).offerPrice).toBe(
      175000,
    );

    // After the mutation succeeds the ladder refetches and the new offer
    // shows up on the history list.
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
    expect(offerRows.length).toBe(1);
    expect(offerRows[0]).toHaveTextContent("You");
    expect(offerRows[0]).toHaveTextContent("$175,000");
    expect(
      await screen.findByTestId("badge-offer-count"),
    ).toHaveTextContent("1 offer");
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
