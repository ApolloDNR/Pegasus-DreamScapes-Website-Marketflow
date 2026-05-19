import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
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
    toggleSaveItem: vi.fn(),
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

vi.mock("@/components/beta-banner", () => ({
  BetaBanner: () => null,
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

// Inject a sample deal with jvAllowed=true so the role-gated JV quick-action
// surface (`quick-jv-*`) actually has a chance to render. Without this, the
// production sample-data has no jvAllowed flag, which would mask the gating
// regression we're trying to catch.
vi.mock("@/lib/sample-data", () => ({
  sampleWholesaleDeals: [
    {
      id: 9001,
      propertyAddress: "123 Test St",
      city: "Phoenix",
      state: "AZ",
      zipCode: "85035",
      propertyType: "Single Family",
      arv: 300000,
      askingPrice: 200000,
      repairEstimate: 50000,
      assignmentFee: 10000,
      jvAllowed: true,
      negotiationAllowed: true,
      status: "Listed",
      photos: [],
    },
    {
      id: 9002,
      propertyAddress: "456 Sample Ave",
      city: "Dallas",
      state: "TX",
      zipCode: "75201",
      propertyType: "Single Family",
      arv: 425000,
      askingPrice: 265000,
      repairEstimate: 60000,
      assignmentFee: 18000,
      jvAllowed: true,
      negotiationAllowed: true,
      status: "Listed",
      photos: [],
    },
  ],
}));

// Force `useQuery` to resolve immediately with no live data so the deals page
// falls into its sample-data path for every role under test.
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>(
    "@tanstack/react-query",
  );
  return {
    ...actual,
    useQuery: () => ({
      data: undefined,
      isLoading: false,
      isError: false,
      isSuccess: false,
      isPending: false,
      error: null,
      refetch: vi.fn(),
    }),
  };
});

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>(
    "framer-motion",
  );
  const passthrough =
    (Tag: keyof JSX.IntrinsicElements) =>
    ({ children, ...props }: Record<string, unknown> & { children?: React.ReactNode }) => {
      const Component = Tag as unknown as React.ElementType;
      return <Component {...props}>{children}</Component>;
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

function renderWithProviders(ui: React.ReactElement, path = "/") {
  const { hook } = memoryLocation({ path, static: true });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={client}>
      <TooltipProvider>
        <Router hook={hook}>{ui}</Router>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  setAuthState("loggedOut");
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
  it("logged-out users do not see role-gated JV quick actions or the guest banner", async () => {
    setAuthState("loggedOut");
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);

    // Sample-data preview still renders the page header.
    expect(screen.getByTestId("text-deals-title")).toBeInTheDocument();
    // Guest banner must not leak to fully logged-out viewers.
    expect(screen.queryByTestId("button-exit-guest")).toBeNull();
    expect(screen.queryByTestId("button-sign-in-guest")).toBeNull();
    // The role-gated JV quick action must NOT render for unauthenticated
    // viewers. (showJVRequest === false → quick-jv-* buttons are withheld.)
    expect(screen.queryAllByTestId(/^quick-jv-/).length).toBe(0);
  });

  it("guest mode shows the guest preview banner but withholds JV quick actions", async () => {
    setAuthState("guest");
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);

    expect(screen.getByTestId("text-deals-title")).toBeInTheDocument();
    expect(screen.getByTestId("button-exit-guest")).toBeInTheDocument();
    expect(screen.getByTestId("button-sign-in-guest")).toBeInTheDocument();
    // Guest investor is NOT a wholesaler/admin → no JV quick action.
    expect(screen.queryAllByTestId(/^quick-jv-/).length).toBe(0);
  });

  it("investors see deals but DO NOT see the wholesaler-only JV quick action", async () => {
    setAuthState("investor");
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);

    expect(screen.getByTestId("text-deals-title")).toBeInTheDocument();
    // Investor sample card renders (deals visible, not hidden).
    expect(
      screen.getAllByTestId(/^button-accept-terms-/).length,
    ).toBeGreaterThan(0);
    // Critical gate: investors are NOT wholesalers → quick-jv must be absent.
    expect(screen.queryAllByTestId(/^quick-jv-/).length).toBe(0);
  });

  it("dreamscapers see deals but DO NOT see the wholesaler-only JV quick action", async () => {
    setAuthState("dreamscaper");
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);

    expect(screen.getByTestId("text-deals-title")).toBeInTheDocument();
    expect(
      screen.getAllByTestId(/^button-accept-terms-/).length,
    ).toBeGreaterThan(0);
    // Dreamscapers are not wholesalers — JV quick action stays hidden.
    expect(screen.queryAllByTestId(/^quick-jv-/).length).toBe(0);
  });

  it("wholesalers see the role-gated JV quick action on JV-allowed deals", async () => {
    setAuthState("wholesaler");
    const { default: MarketflowDeals } = await import(
      "@/pages/marketflow-deals"
    );

    renderWithProviders(<MarketflowDeals />);

    expect(screen.getByTestId("text-deals-title")).toBeInTheDocument();
    expect(
      screen.getAllByTestId(/^button-accept-terms-/).length,
    ).toBeGreaterThan(0);
    // Critical gate: showJVRequest is true for wholesalers, so on the
    // injected JV-allowed sample deals the quick-jv-* surface renders.
    expect(
      screen.getAllByTestId(/^quick-jv-/).length,
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
});

describe("marketflow-dashboard page gating", () => {
  it.each<[AuthRole, string]>([
    ["loggedOut", "logged-out viewer"],
    ["guest", "guest"],
    ["investor", "investor"],
    ["wholesaler", "wholesaler"],
    ["dreamscaper", "dreamscaper"],
    ["admin", "admin"],
  ])("renders the investor dashboard shell for %s", async (role) => {
    setAuthState(role);
    const { default: MarketflowDashboard } = await import(
      "@/pages/marketflow-dashboard"
    );

    renderWithProviders(<MarketflowDashboard />);

    // The dashboard does not currently page-gate. This test locks that
    // contract so a future regression that silently hides the dashboard
    // for valid investors is caught.
    const titles = screen.getAllByTestId("text-dashboard-title");
    expect(titles.length).toBeGreaterThan(0);
    expect(within(titles[0]).getByText(/investor dashboard/i)).toBeInTheDocument();
    // Saved/Active/Exited tabs should always render.
    expect(screen.getByTestId("tab-saved")).toBeInTheDocument();
    expect(screen.getByTestId("tab-active")).toBeInTheDocument();
    expect(screen.getByTestId("tab-exited")).toBeInTheDocument();
  });
});
