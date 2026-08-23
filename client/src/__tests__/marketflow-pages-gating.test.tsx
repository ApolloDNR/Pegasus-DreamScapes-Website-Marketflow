import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen, cleanup, fireEvent } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

// ---------------------------------------------------------------------------
// Auth mock — each test sets the role state via setAuthState() before render.
// ---------------------------------------------------------------------------

type AuthRole =
  | "loggedOut"
  | "guest"
  | "investor"
  | "wholesaler"
  | "dreamscaper"
  | "badgedInvestor"
  | "pegasusWholesaler"
  | "staff"
  | "admin";

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

const queryBoundary = vi.hoisted(() => ({
  states: {} as Record<string, Record<string, unknown>>,
}));
const marketplaceBoundary = vi.hoisted(() => ({
  toggleSaveItem: vi.fn(),
}));

function authFor(role: AuthRole): AuthState {
  switch (role) {
    case "loggedOut":
      return { ...baseAuth };
    case "guest":
      return {
        ...baseAuth,
        isGuestMode: true,
        guestRole: "investor",
        userRole: "investor",
        isInvestor: true,
      };
    case "investor":
      return {
        ...baseAuth,
        user: { id: "u-inv", email: "inv@example.com" },
        profile: { primary_role: "investor" },
        isAuthenticated: true,
        userRole: "investor",
        isInvestor: true,
      };
    case "wholesaler":
      return {
        ...baseAuth,
        user: { id: "u-w", email: "w@example.com" },
        profile: { primary_role: "wholesaler" },
        isAuthenticated: true,
        userRole: "wholesaler",
        isWholesaler: true,
      };
    case "dreamscaper":
      return {
        ...baseAuth,
        user: { id: "u-d", email: "d@example.com" },
        profile: { primary_role: "dreamscaper" },
        isAuthenticated: true,
        userRole: "dreamscaper",
        isDreamscaper: true,
      };
    case "badgedInvestor":
      return {
        ...baseAuth,
        user: { id: "u-badged", email: "badged@example.com" },
        profile: {
          primary_role: "investor",
          is_pegasus_badged: true,
        },
        isAuthenticated: true,
        userRole: "investor",
        isInvestor: true,
        isPegasus: true,
      };
    case "pegasusWholesaler":
      return {
        ...baseAuth,
        user: { id: "u-pw", email: "operator@example.com" },
        profile: {
          primary_role: "pegasus_wholesaler",
          is_pegasus_badged: true,
        },
        isAuthenticated: true,
        userRole: "pegasus_wholesaler",
        isWholesaler: true,
        isPegasus: true,
      };
    case "staff":
      return {
        ...baseAuth,
        user: { id: "u-staff", email: "staff@example.com" },
        profile: {
          primary_role: "project_manager",
          is_pegasus_badged: false,
        },
        isAuthenticated: true,
        userRole: "project_manager",
      };
    case "admin":
      return {
        ...baseAuth,
        user: { id: "u-a", email: "admin@pegasusdreamscapes.com" },
        profile: { primary_role: "admin" },
        isAuthenticated: true,
        userRole: "admin",
        isAdmin: true,
        isPegasus: true,
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

vi.mock("@/contexts/demo-mode-context", () => ({
  useDemoMode: () => ({
    isDemoMode: false,
    enableDemoMode: vi.fn(),
    disableDemoMode: vi.fn(),
    showDemoPrompt: false,
    setShowDemoPrompt: vi.fn(),
  }),
  DemoModeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/contexts/deal-action-context", () => ({
  useDealAction: () => ({
    openDealAction: vi.fn(),
    isOpen: false,
  }),
  DealActionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/hooks/use-supabase-marketplace", () => ({
  useSupabaseMarketplace: () => ({
    isItemSaved: () => false,
    toggleSaveItem: marketplaceBoundary.toggleSaveItem,
    isSaving: false,
    savedItems: [],
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
  toast: vi.fn(),
}));

// Heavy / unrelated components stubbed to keep the gating tests focused.
vi.mock("@/components/marketplace-layout", () => ({
  MarketplaceLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="marketplace-layout-stub">{children}</div>
  ),
}));

vi.mock("@/components/under-construction", () => ({
  UnderConstructionBadge: () => null,
  UnderConstructionBanner: () => null,
}));

vi.mock("@/components/deal-progress-tracker", () => ({
  DealProgressTracker: () => null,
  ActivityTimeline: () => null,
}));

vi.mock("@/components/deal-notes", () => ({
  DealNotes: () => null,
  NotesIndicator: () => null,
}));

vi.mock("@/components/deal-comparison", () => ({
  useCompareDeals: () => ({
    selectedDeals: [],
    toggleDeal: vi.fn(),
    isSelected: () => false,
    clearSelection: vi.fn(),
    canAddMore: () => true,
    showComparison: false,
    setShowComparison: vi.fn(),
  }),
  DealComparisonButton: () => null,
  CompareCheckbox: () => null,
  ComparisonModal: () => null,
}));

vi.mock("@/components/bulk-actions", () => ({
  BulkActionsBar: () => null,
  useBulkSelection: () => ({
    selectedIds: [],
    toggleItem: vi.fn(),
    selectAll: vi.fn(),
    clearSelection: vi.fn(),
    isSelected: () => false,
    selectedCount: 0,
  }),
  BulkSelectCheckbox: () => null,
}));

vi.mock("@/components/deal-export", () => ({
  ExportDialog: () => null,
  QuickExportButton: () => null,
}));

vi.mock("@/components/deal-map-view", () => ({
  DealMapView: () => null,
}));

vi.mock("@/components/keyboard-shortcuts-dialog", () => ({
  KeyboardShortcutsDialog: () => null,
  KeyboardShortcutHint: () => null,
}));

vi.mock("@/components/saved-searches", () => ({
  useSavedSearches: () => ({
    searches: [],
    saveSearch: vi.fn(),
    deleteSearch: vi.fn(),
  }),
  SaveSearchDialog: () => null,
  SavedSearchesList: () => null,
}));

vi.mock("@/components/watchlist-folders", () => ({
  useWatchlistFolders: () => ({
    folders: [],
    createFolder: vi.fn(),
    deleteFolder: vi.fn(),
    addToFolder: vi.fn(),
    removeFromFolder: vi.fn(),
  }),
  AddToFolderDialog: () => null,
  FolderSidebar: () => null,
}));

vi.mock("@/components/due-diligence-checklist", () => ({
  DueDiligenceProgress: () => null,
}));

vi.mock("@/components/deal-timeline", () => ({
  TimelineProgress: () => null,
}));

vi.mock("@/components/communication-log", () => ({
  CommunicationSummary: () => null,
}));

vi.mock("@/components/document-attachments", () => ({
  DocumentCount: () => null,
}));

vi.mock("@/components/quick-calculator", () => ({
  QuickCalcButton: () => null,
  InlineROIBadge: () => null,
}));

vi.mock("@/components/activity-feed", () => ({
  ActivityFeedWidget: () => null,
  useActivityFeed: () => ({ activities: [] }),
}));

vi.mock("@/components/search-autocomplete", () => ({
  SearchAutocomplete: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <input
      data-testid="search-autocomplete-stub"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock("@/components/animations", () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  StaggerChildren: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  StaggerItem: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  HoverLift: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/wholesale-deal-form", () => ({
  WholesaleDealForm: () => <div data-testid="wholesale-deal-form-stub" />,
}));

vi.mock("@/components/capital-raise-form", () => ({
  CapitalRaiseForm: () => <div data-testid="capital-raise-form-stub" />,
}));

vi.mock("@/components/listing-form", () => ({
  ListingForm: () => <div data-testid="listing-form-stub" />,
}));

// Feed reviewed deal data only through the API mock. Disabled queries return
// no data so logged-out and guest states cannot fall back to sample inventory.
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>(
    "@tanstack/react-query",
  );
  const reviewedWholesaleDeals = [
    {
      id: "reviewed-9001",
      propertyAddress: "123 Test St",
      city: "Phoenix",
      state: "AZ",
      zipCode: "85035",
      propertyType: "Single Family",
      arv: 300000,
      askingPrice: 200000,
      repairEstimate: 50000,
      assignmentFee: 10000,
      canRequestJv: true,
      negotiationAllowed: true,
      status: "Under Review",
      photos: [],
    },
  ];
  return {
    ...actual,
    useQuery: (options: { queryKey?: unknown[]; enabled?: boolean }) => {
      const queryKey = Array.isArray(options?.queryKey)
        ? options.queryKey[0]
        : options?.queryKey;
      const defaultData =
        options?.enabled === false
          ? undefined
          : queryKey === "/api/wholesale-deals"
            ? reviewedWholesaleDeals
            : [];
      const override = queryBoundary.states[String(queryKey)] ?? {};
      const data = Object.prototype.hasOwnProperty.call(override, "data")
        ? override.data
        : defaultData;

      return {
        data,
        isLoading: override.isLoading ?? false,
        isError: override.isError ?? false,
        isSuccess: options?.enabled !== false,
        isPending: false,
        error: override.error ?? null,
        refetch: override.refetch ?? vi.fn(),
      };
    },
  };
});

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>(
    "framer-motion",
  );
  const passthrough =
    (Tag: keyof JSX.IntrinsicElements) =>
    ({ children, ...props }: Record<string, unknown> & { children?: React.ReactNode }) => {
      const {
        animate: _animate,
        drag: _drag,
        dragConstraints: _dragConstraints,
        dragElastic: _dragElastic,
        exit: _exit,
        initial: _initial,
        onDrag: _onDrag,
        onDragEnd: _onDragEnd,
        onDragStart: _onDragStart,
        transition: _transition,
        ...domProps
      } = props;
      const Component = Tag as unknown as React.ElementType;
      return <Component {...domProps}>{children}</Component>;
    };
  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_target, prop: string) => passthrough(prop as keyof JSX.IntrinsicElements),
      },
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useMotionValue: () => ({ get: () => 0, set: () => {}, on: () => () => {} }),
    useTransform: () => 0,
    useSpring: () => ({ get: () => 0, set: () => {}, on: () => () => {} }),
  };
});

// ---------------------------------------------------------------------------
// Render helper
// ---------------------------------------------------------------------------

function renderWithProviders(
  ui: React.ReactElement,
  path = "/",
  recordNavigation = false,
) {
  const location = recordNavigation
    ? memoryLocation({ path, record: true })
    : memoryLocation({ path, static: true });
  const { hook } = location;
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const rendered = render(
    <QueryClientProvider client={client}>
      <TooltipProvider>
        <Router hook={hook}>{ui}</Router>
      </TooltipProvider>
    </QueryClientProvider>,
  );
  return {
    ...rendered,
    hook,
    history: "history" in location ? location.history : undefined,
  };
}

function tailwindHexColor(element: HTMLElement, utility: "text" | "bg"): string {
  const match = element.className.match(
    new RegExp(`(?:^|\\s)${utility}-\\[#([0-9a-fA-F]{6})\\](?:\\s|$)`),
  );

  if (!match) {
    throw new Error(
      `${element.tagName.toLowerCase()} does not declare an explicit light-mode ${utility} color`,
    );
  }

  return `#${match[1]}`;
}

function relativeLuminance(hexColor: string): number {
  const channels = hexColor
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(first: string, second: string): number {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function activateControl(testId: string) {
  const control = screen.getByTestId(testId);
  fireEvent.mouseDown(control, { button: 0, ctrlKey: false });
  fireEvent.click(control);
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  setAuthState("loggedOut");
  queryBoundary.states = {};
  marketplaceBoundary.toggleSaveItem.mockReset();
});

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("marketflow-submit page gating", () => {
  it("logged-out users see the sign-in lock screen, not the submit form", async () => {
    setAuthState("loggedOut");
    const { default: MarketflowSubmit } = await import(
      "@/pages/marketflow-submit"
    );

    renderWithProviders(<MarketflowSubmit />);

    expect(screen.getByTestId("button-login-submit")).toBeInTheDocument();
    expect(screen.queryByTestId("text-submit-deal-title")).toBeNull();
    expect(screen.queryByTestId("wholesale-deal-form-stub")).toBeNull();
  });

  it("investors are blocked with the role-locked screen, not given the form", async () => {
    setAuthState("investor");
    const { default: MarketflowSubmit } = await import(
      "@/pages/marketflow-submit"
    );

    renderWithProviders(<MarketflowSubmit />);

    expect(screen.getByTestId("button-apply-wholesaler")).toBeInTheDocument();
    expect(screen.queryByTestId("text-submit-deal-title")).toBeNull();
    expect(screen.queryByTestId("wholesale-deal-form-stub")).toBeNull();
  });

  it("wholesalers see the authenticated submit form", async () => {
    setAuthState("wholesaler");
    const { default: MarketflowSubmit } = await import(
      "@/pages/marketflow-submit"
    );

    renderWithProviders(<MarketflowSubmit />);

    expect(screen.getByTestId("text-submit-deal-title")).toBeInTheDocument();
    expect(screen.getByTestId("tab-submit-wholesale")).toBeInTheDocument();
    expect(screen.getByTestId("wholesale-deal-form-stub")).toBeInTheDocument();
    expect(screen.queryByTestId("button-login-submit")).toBeNull();
    expect(screen.queryByTestId("button-apply-wholesaler")).toBeNull();
  });

  it("dreamscapers see the authenticated submit form", async () => {
    setAuthState("dreamscaper");
    const { default: MarketflowSubmit } = await import(
      "@/pages/marketflow-submit"
    );

    renderWithProviders(<MarketflowSubmit />);

    expect(screen.getByTestId("text-submit-deal-title")).toBeInTheDocument();
    expect(screen.getByTestId("wholesale-deal-form-stub")).toBeInTheDocument();
  });

  it("admins (without wholesaler/dreamscaper role) hit the role-locked screen", async () => {
    // Admin is not a wholesaler or dreamscaper, so canSubmit is false.
    // This locks down the "admin can quietly submit" regression path.
    setAuthState("admin");
    const { default: MarketflowSubmit } = await import(
      "@/pages/marketflow-submit"
    );

    renderWithProviders(<MarketflowSubmit />);

    expect(screen.getByTestId("button-apply-wholesaler")).toBeInTheDocument();
    expect(screen.queryByTestId("text-submit-deal-title")).toBeNull();
  });

  it("guest mode renders the form in preview mode (no real submit lock)", async () => {
    setAuthState("guest");
    const { default: MarketflowSubmit } = await import(
      "@/pages/marketflow-submit"
    );

    renderWithProviders(<MarketflowSubmit />);

    expect(screen.getByTestId("text-submit-deal-title")).toBeInTheDocument();
    expect(screen.getByTestId("button-signup-preview")).toBeInTheDocument();
    expect(screen.queryByTestId("button-login-submit")).toBeNull();
  });
});

describe("marketflow-deals page gating", () => {
  it(
    "names the private-beta dismiss control for anonymous visitors",
    async () => {
      const { default: MarketflowDeals } = await import(
        "@/pages/marketflow-deals"
      );

      renderWithProviders(<MarketflowDeals />);

      expect(
        screen.getByRole("button", {
          name: "Dismiss MarketFlow beta banner",
        }),
      ).toBeInTheDocument();
    },
    15_000,
  );

  it("keeps the anonymous private-beta kicker at AA contrast in light mode", async () => {
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);

    const privateBetaKicker = screen.getByText("MarketFlow private beta");
    expect(
      contrastRatio(tailwindHexColor(privateBetaKicker, "text"), "#ffffff"),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the anonymous Request Access CTA at AA contrast in light mode", async () => {
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);

    const requestAccessButton = screen.getByTestId(
      "button-marketflow-request-access",
    );
    expect(
      contrastRatio(tailwindHexColor(requestAccessButton, "bg"), "#ffffff"),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("logged-out users do not see role-gated JV quick actions or the guest banner", async () => {
    setAuthState("loggedOut");
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);

    expect(
      screen.getByText(/reviewed opportunities are not shown as sample inventory/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId("button-marketflow-request-access")).toBeInTheDocument();
    expect(screen.getByTestId("button-marketflow-submit-deal")).toBeInTheDocument();
    expect(screen.getByTestId("button-marketflow-submit-deal").closest("a")).toHaveAttribute(
      "href",
      "/bring-an-opportunity?intent=deal-jv",
    );
    expect(screen.queryByTestId("text-deals-title")).toBeNull();
    expect(screen.queryByTestId("button-exit-guest")).toBeNull();
    expect(screen.queryByTestId("button-sign-in-guest")).toBeNull();
    expect(screen.queryAllByTestId(/^quick-jv-/).length).toBe(0);
  }, 10000);

  it("guest mode shows the private-beta hold but withholds JV quick actions", async () => {
    setAuthState("guest");
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);

    expect(
      screen.getByText(/reviewed opportunities are not shown as sample inventory/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId("button-exit-guest")).toBeInTheDocument();
    expect(screen.getByTestId("button-marketflow-request-access")).toBeInTheDocument();
    expect(screen.getByTestId("button-marketflow-submit-deal").closest("a")).toHaveAttribute(
      "href",
      "/bring-an-opportunity?intent=deal-jv",
    );
    expect(screen.queryByTestId("text-deals-title")).toBeNull();
    expect(screen.queryByTestId("button-sign-in-guest")).toBeNull();
    expect(screen.queryAllByTestId(/^quick-jv-/).length).toBe(0);
  }, 10000);

  it.each(["investor", "wholesaler", "dreamscaper"] as const)(
    "ordinary self-provisioned %s users cannot render live inventory",
    async (role) => {
      setAuthState(role);
      const { default: MarketflowDeals } = await import(
        "@/pages/marketflow-deals"
      );

      renderWithProviders(<MarketflowDeals />);

      expect(
        screen.getByText(/reviewed opportunities are not shown as sample inventory/i),
      ).toBeInTheDocument();
      expect(screen.queryByTestId("text-deals-title")).toBeNull();
      expect(screen.queryAllByTestId(/^button-accept-terms-/).length).toBe(0);
    },
  );

  it("Pegasus-badged investors see reviewed deals without wholesaler-only JV actions", async () => {
    setAuthState("badgedInvestor");
    queryBoundary.states["/api/wholesale-deals"] = {
      data: [
        {
          id: "reviewed-investor-9001",
          propertyAddress: "123 Test St",
          city: "Phoenix",
          state: "AZ",
          propertyType: "Single Family",
          arv: 300_000,
          askingPrice: 200_000,
          repairEstimate: 50_000,
          assignmentFee: 10_000,
          canRequestJv: false,
          negotiationAllowed: true,
          status: "listed",
          photos: [],
        },
      ],
    };
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);

    expect(screen.getByTestId("text-deals-title")).toBeInTheDocument();
    expect(screen.getByTestId("button-submit-deal").closest("a")).toHaveAttribute(
      "href",
      "/marketflow/submit",
    );
    // Authenticated users can see reviewed API-backed deals.
    expect(
      screen.getAllByTestId(/^button-accept-terms-/).length,
    ).toBeGreaterThan(0);
    // Critical gate: investors are not wholesalers, so quick-jv must be absent.
    expect(screen.queryAllByTestId(/^quick-jv-/).length).toBe(0);
  });

  it("gives every icon-only swipe control an accessible name", async () => {
    setAuthState("badgedInvestor");
    queryBoundary.states["/api/capital-projects"] = {
      data: [
        {
          id: 601,
          title: "Evidence Row Rehabilitation",
          location: "Richmond, CA",
          strategy: "value-add",
          structure: "EQUITY",
          fundingGoal: 1_200_000,
          amountRaised: 480_000,
          minInvestment: 25_000,
          projectedReturn: "18% target IRR",
          askingProfitSplit: "70 / 30",
          status: "OPEN",
          images: [],
        },
      ],
    };
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);
    activateControl("toggle-swipe-view");

    for (const [testId, name] of [
      ["button-undo", "Undo"],
      ["button-pass", "Pass"],
      ["button-save-swipe", "Save"],
      ["button-accept", "Accept terms"],
      ["button-counter", "Counter offer"],
    ]) {
      expect(screen.getByTestId(testId)).toHaveAccessibleName(name);
    }

    activateControl("tab-capital");
    for (const [testId, name] of [
      ["button-capital-undo", "Undo"],
      ["button-capital-pass", "Pass"],
      ["button-capital-save-swipe", "Save"],
      ["button-capital-accept", "Commit capital"],
      ["button-capital-counter", "Negotiate"],
    ]) {
      expect(screen.getByTestId(testId)).toHaveAccessibleName(name);
    }
  });

  it("serializes reduced-motion swipe actions and reaches both terminal states", async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    })) as typeof window.matchMedia;
    vi.useFakeTimers();

    try {
      setAuthState("badgedInvestor");
      queryBoundary.states["/api/wholesale-deals"] = {
        data: [
          {
            id: "reviewed-9001",
            propertyAddress: "123 Test St",
            city: "Phoenix",
            state: "AZ",
            propertyType: "Single Family",
            arv: 300_000,
            askingPrice: 200_000,
            repairEstimate: 50_000,
            assignmentFee: 10_000,
            canRequestJv: true,
            negotiationAllowed: true,
            status: "Under Review",
            photos: [],
          },
          {
            id: "reviewed-9002",
            propertyAddress: "456 Evidence Ave",
            city: "Oakland",
            state: "CA",
            propertyType: "Duplex",
            arv: 480_000,
            askingPrice: 315_000,
            repairEstimate: 65_000,
            assignmentFee: 12_000,
            canRequestJv: true,
            negotiationAllowed: true,
            status: "Under Review",
            photos: [],
          },
        ],
      };
      queryBoundary.states["/api/capital-projects"] = {
        data: [
          {
            id: 601,
            title: "Evidence Row Rehabilitation",
            location: "Richmond, CA",
            strategy: "value-add",
            structure: "EQUITY",
            fundingGoal: 1_200_000,
            amountRaised: 480_000,
            minInvestment: 25_000,
            projectedReturn: "18% target IRR",
            askingProfitSplit: "70 / 30",
            status: "OPEN",
            images: [],
          },
          {
            id: 602,
            title: "Second Evidence Row",
            location: "Sacramento, CA",
            strategy: "development",
            structure: "DEBT",
            fundingGoal: 900_000,
            amountRaised: 225_000,
            minInvestment: 20_000,
            projectedReturn: "12% target return",
            status: "OPEN",
            images: [],
          },
        ],
      };
      const { default: MarketflowDeals } = await import(
        "@/pages/marketflow-deals"
      );

      renderWithProviders(<MarketflowDeals />);
      activateControl("toggle-swipe-view");

      const wholesaleSave = screen.getByTestId("button-save-swipe");
      fireEvent.click(wholesaleSave);
      fireEvent.click(wholesaleSave);
      expect(marketplaceBoundary.toggleSaveItem).toHaveBeenCalledTimes(1);

      act(() => vi.advanceTimersByTime(1));
      const nextWholesaleSave = screen.getByTestId("button-save-swipe");
      expect(nextWholesaleSave).toBeDisabled();
      expect(screen.getByTestId("button-view-deal")).toBeDisabled();
      const wholesaleOfferStudio = screen.getByTestId(
        "button-open-offer-studio-wholesale-reviewed-9002",
      );
      expect(wholesaleOfferStudio).toBeDisabled();
      expect(wholesaleOfferStudio.closest("a")).toBeNull();
      fireEvent.click(nextWholesaleSave);
      expect(marketplaceBoundary.toggleSaveItem).toHaveBeenCalledTimes(1);

      act(() => vi.advanceTimersByTime(250));
      expect(nextWholesaleSave).toBeEnabled();
      fireEvent.click(nextWholesaleSave);
      expect(marketplaceBoundary.toggleSaveItem).toHaveBeenCalledTimes(2);
      act(() => vi.advanceTimersByTime(1));
      expect(screen.getByText(/reviewed every reviewed deal/i)).toBeInTheDocument();

      activateControl("tab-capital");
      const capitalSave = screen.getByTestId("button-capital-save-swipe");
      fireEvent.click(capitalSave);
      fireEvent.click(capitalSave);
      expect(marketplaceBoundary.toggleSaveItem).toHaveBeenCalledTimes(3);

      act(() => vi.advanceTimersByTime(1));
      const nextCapitalSave = screen.getByTestId("button-capital-save-swipe");
      expect(nextCapitalSave).toBeDisabled();
      expect(screen.getByTestId("button-view-capital-swipe")).toBeDisabled();
      const capitalOfferStudio = screen.getByTestId(
        "button-open-offer-studio-capital-602",
      );
      expect(capitalOfferStudio).toBeDisabled();
      expect(capitalOfferStudio.closest("a")).toBeNull();
      fireEvent.click(nextCapitalSave);
      expect(marketplaceBoundary.toggleSaveItem).toHaveBeenCalledTimes(3);

      act(() => vi.advanceTimersByTime(300));
      expect(nextCapitalSave).toBeEnabled();
      fireEvent.click(nextCapitalSave);
      expect(marketplaceBoundary.toggleSaveItem).toHaveBeenCalledTimes(4);
      act(() => vi.advanceTimersByTime(1));
      expect(screen.getByText(/seen all projects/i)).toBeInTheDocument();
    } finally {
      act(() => vi.runOnlyPendingTimers());
      vi.useRealTimers();
      window.matchMedia = originalMatchMedia;
    }
  });

  it("Pegasus-prefixed operators see reviewed deals and their role-gated JV action", async () => {
    setAuthState("pegasusWholesaler");
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);

    expect(screen.getByTestId("text-deals-title")).toBeInTheDocument();
    expect(
      screen.getAllByTestId(/^button-accept-terms-/).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByTestId(/^quick-jv-/).length,
    ).toBeGreaterThan(0);
  });

  it("withholds the JV action when the reviewed DTO marks the operator as owner", async () => {
    setAuthState("pegasusWholesaler");
    queryBoundary.states["/api/wholesale-deals"] = {
      data: [
        {
          id: "owned-9002",
          propertyAddress: "9002 Owner Way",
          city: "Oakland",
          state: "CA",
          propertyType: "Single Family",
          askingPrice: 250_000,
          arv: 350_000,
          repairEstimate: 25_000,
          assignmentFee: 10_000,
          status: "listed",
          jvAllowed: true,
          canRequestJv: false,
          negotiationAllowed: true,
          photos: [],
        },
      ],
    };
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);

    expect(screen.getByTestId("text-deals-title")).toBeInTheDocument();
    expect(screen.queryAllByTestId(/^quick-jv-/)).toHaveLength(0);
  });

  it("staff identities see reviewed deals", async () => {
    setAuthState("staff");
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);

    expect(screen.getByTestId("text-deals-title")).toBeInTheDocument();
    expect(
      screen.getAllByTestId(/^button-accept-terms-/).length,
    ).toBeGreaterThan(0);
  });

  it("admins see the JV quick action (admin satisfies the wholesaler-or-admin gate)", async () => {
    setAuthState("admin");
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);

    expect(screen.getByTestId("text-deals-title")).toBeInTheDocument();
    expect(
      screen.getAllByTestId(/^button-accept-terms-/).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByTestId(/^quick-jv-/).length,
    ).toBeGreaterThan(0);
  });

  it("renders a truthful wholesale failure with an operable retry", async () => {
    setAuthState("badgedInvestor");
    const refetch = vi.fn();
    queryBoundary.states["/api/wholesale-deals"] = {
      data: undefined,
      isError: true,
      error: new Error("inventory unavailable"),
      refetch,
    };
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);

    expect(screen.getByTestId("state-wholesale-grid-error")).toHaveAttribute(
      "role",
      "alert",
    );
    fireEvent.click(screen.getByTestId("button-retry-wholesale-grid"));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    {
      label: "wholesale swipe",
      queryKey: "/api/wholesale-deals",
      activate: "toggle-swipe-view",
      state: "state-wholesale-swipe-error",
      retry: "button-retry-wholesale-swipe",
    },
    {
      label: "capital grid",
      queryKey: "/api/capital-projects",
      activate: "tab-capital",
      state: "state-capital-grid-error",
      retry: "button-retry-capital-grid",
    },
    {
      label: "capital swipe",
      queryKey: "/api/capital-projects",
      activate: ["tab-capital", "toggle-swipe-view"],
      state: "state-capital-swipe-error",
      retry: "button-retry-capital-swipe",
    },
    {
      label: "listing grid",
      queryKey: "/api/listings",
      activate: "tab-listings",
      state: "state-listings-grid-error",
      retry: "button-retry-listings-grid",
    },
  ])("renders a distinct $label error and retries its own query", async (scenario) => {
    setAuthState("badgedInvestor");
    const refetch = vi.fn();
    queryBoundary.states[scenario.queryKey] = {
      data: undefined,
      isError: true,
      error: new Error(`${scenario.label} unavailable`),
      refetch,
    };
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);
    for (const control of Array.isArray(scenario.activate)
      ? scenario.activate
      : [scenario.activate]) {
      activateControl(control);
    }

    expect(screen.getByTestId(scenario.state)).toHaveAttribute("role", "alert");
    fireEvent.click(screen.getByTestId(scenario.retry));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("distinguishes empty states for every reviewed inventory presentation", async () => {
    setAuthState("badgedInvestor");
    queryBoundary.states["/api/wholesale-deals"] = { data: [] };
    queryBoundary.states["/api/capital-projects"] = { data: [] };
    queryBoundary.states["/api/listings"] = { data: [] };
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);
    expect(screen.getByTestId("state-wholesale-grid-empty")).toBeInTheDocument();

    activateControl("toggle-swipe-view");
    expect(screen.getByTestId("state-wholesale-swipe-empty")).toBeInTheDocument();

    activateControl("toggle-grid-view");
    activateControl("tab-capital");
    expect(screen.getByTestId("state-capital-grid-empty")).toBeInTheDocument();

    activateControl("toggle-swipe-view");
    expect(screen.getByTestId("state-capital-swipe-empty")).toBeInTheDocument();

    activateControl("tab-listings");
    expect(screen.getByTestId("state-listings-grid-empty")).toBeInTheDocument();
  });

  it("names loading states for every reviewed inventory presentation", async () => {
    setAuthState("badgedInvestor");
    for (const queryKey of [
      "/api/wholesale-deals",
      "/api/capital-projects",
      "/api/listings",
    ]) {
      queryBoundary.states[queryKey] = { data: undefined, isLoading: true };
    }
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);
    expect(screen.getByTestId("state-wholesale-grid-loading")).toBeInTheDocument();

    activateControl("toggle-swipe-view");
    expect(screen.getByTestId("state-wholesale-swipe-loading")).toBeInTheDocument();

    activateControl("toggle-grid-view");
    activateControl("tab-capital");
    expect(screen.getByTestId("state-capital-grid-loading")).toBeInTheDocument();

    activateControl("toggle-swipe-view");
    expect(screen.getByTestId("state-capital-swipe-loading")).toBeInTheDocument();

    activateControl("tab-listings");
    expect(screen.getByTestId("state-listings-grid-loading")).toBeInTheDocument();
  });

  it("routes a reviewed listing card to the mounted property detail route", async () => {
    setAuthState("badgedInvestor");
    queryBoundary.states["/api/listings"] = {
      data: [
        {
          id: 72,
          propertyAddress: "72 Correct Route Ave",
          city: "Oakland",
          state: "CA",
          propertyType: "Single Family",
          listPrice: 825_000,
          listingType: "on_market",
          status: "active",
          images: [],
        },
      ],
    };
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    const { history } = renderWithProviders(
      <MarketflowDeals />,
      "/marketflow/deals",
      true,
    );
    activateControl("tab-listings");
    fireEvent.click(screen.getByTestId("button-view-listing-72"));

    const recordedHistory = history as string[] | undefined;
    expect(recordedHistory?.[recordedHistory.length - 1]).toBe(
      "/marketflow/listings/72",
    );
  });

  it("keeps the reviewed inventory shell focused on real navigation and actions", async () => {
    setAuthState("badgedInvestor");
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);

    expect(screen.getByTestId("text-deals-title")).toBeInTheDocument();
    expect(screen.getByTestId("button-submit-deal")).toBeInTheDocument();
    for (const inertControl of [
      "button-toggle-map",
      "button-export",
      "button-save-search",
      "button-keyboard-shortcuts",
      "button-toggle-saved-searches",
      "button-toggle-activity",
      "button-toggle-folders",
    ]) {
      expect(screen.queryByTestId(inertControl)).toBeNull();
    }
  });
});

describe("marketflow-dashboard page gating", () => {
  it.each<[AuthRole, string]>([
    ["loggedOut", "logged-out viewer"],
    ["guest", "guest"],
    ["investor", "investor"],
    ["wholesaler", "wholesaler"],
    ["dreamscaper", "dreamscaper"],
    ["admin", "admin"],
  ])("renders the private-beta hold for %s", async (role) => {
    setAuthState(role);
    const { default: MarketflowDashboard } = await import(
      "@/pages/marketflow-dashboard"
    );

    renderWithProviders(<MarketflowDashboard />);

    expect(screen.getByText(/live dealflow only appears after review/i)).toBeInTheDocument();
    expect(screen.getByText(/fake portfolio returns/i)).toBeInTheDocument();
    expect(screen.getByTestId("button-marketflow-dashboard-access")).toBeInTheDocument();
    expect(screen.getByTestId("button-marketflow-dashboard-overview")).toBeInTheDocument();
    expect(screen.queryByTestId("tab-saved")).toBeNull();
    expect(screen.queryByTestId("tab-active")).toBeNull();
    expect(screen.queryByTestId("tab-exited")).toBeNull();
  });
});
