import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type PendingItem = {
  id: number;
  type: "wholesale_deal" | "capital_project";
  title: string;
  description: string;
  submittedBy: string;
  createdAt: string;
};

const testState = vi.hoisted(() => ({
  pendingItems: [] as PendingItem[],
  auditData: { logs: [], total: 0, limit: 50, offset: 0 } as unknown,
  auditIsLoading: false,
  auditIsError: false,
  auditIsFetching: false,
  auditRefetch: vi.fn(),
  apiRequest: vi.fn(),
  invalidateQueries: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: ({ queryKey }: { queryKey: unknown[] }) => {
    const key = queryKey.map(String).join("/");
    if (key.startsWith("/api/audit-logs")) {
      return {
        data: testState.auditData,
        isLoading: testState.auditIsLoading,
        isError: testState.auditIsError,
        isFetching: testState.auditIsFetching,
        refetch: testState.auditRefetch,
      };
    }

    const data =
      key === "/api/marketplace/admin/stats"
        ? {
            totalSellerLeads: 0,
            pendingSellerLeads: 0,
            totalInvestorLeads: 0,
            activeWholesaleDeals: 0,
            activeCapitalProjects: 0,
          }
        : key === "/api/marketplace/admin/pending"
          ? testState.pendingItems
          : [];

    return {
      data,
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    };
  },
  useMutation: (options: {
    mutationFn: (variables: unknown) => Promise<unknown>;
    onSuccess?: (result: unknown, variables: unknown) => void;
    onError?: (error: unknown, variables: unknown) => void;
  }) => ({
    mutate: async (variables: unknown) => {
      try {
        const result = await options.mutationFn(variables);
        options.onSuccess?.(result, variables);
      } catch (error) {
        options.onError?.(error, variables);
      }
    },
    isPending: false,
  }),
}));

vi.mock("@/lib/queryClient", () => ({
  apiRequest: testState.apiRequest,
  queryClient: { invalidateQueries: testState.invalidateQueries },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: testState.toast }),
}));

vi.mock("@/components/auth-guard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/components/marketplace-layout", () => ({
  MarketplaceLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock("@/components/ObjectUploader", () => ({
  ObjectUploader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/hooks/use-upload", () => ({
  useUpload: () => ({ getUploadParameters: vi.fn() }),
}));

import MarketplaceAdminPage from "@/pages/marketplace-admin";

beforeEach(() => {
  testState.pendingItems = [];
  testState.auditData = { logs: [], total: 0, limit: 50, offset: 0 };
  testState.auditIsLoading = false;
  testState.auditIsError = false;
  testState.auditIsFetching = false;
  testState.auditRefetch.mockReset().mockResolvedValue(undefined);
  testState.apiRequest.mockReset().mockResolvedValue(new Response("{}", { status: 200 }));
  testState.invalidateQueries.mockReset();
  testState.toast.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("MarketFlow admin approval API contract", () => {
  it.each([
    {
      itemType: "wholesale_deal" as const,
      itemId: 41,
      expectedPath: "/api/marketplace/admin/deals/41/status",
      expectedStatus: "listed",
    },
    {
      itemType: "capital_project" as const,
      itemId: 73,
      expectedPath: "/api/marketplace/admin/projects/73/status",
      expectedStatus: "approved",
    },
  ])(
    "sends the server-supported $expectedStatus status for $itemType approval",
    async ({ itemType, itemId, expectedPath, expectedStatus }) => {
      testState.pendingItems = [
        {
          id: itemId,
          type: itemType,
          title: "Pending submission",
          description: "Awaiting staff review",
          submittedBy: "member-1",
          createdAt: "2026-08-30T00:00:00.000Z",
        },
      ];

      const user = userEvent.setup();
      render(<MarketplaceAdminPage />);

      await user.click(screen.getByTestId(`button-review-${itemId}`));
      await user.click(await screen.findByTestId("button-approve"));

      await waitFor(() => {
        expect(testState.apiRequest).toHaveBeenCalledWith("PATCH", expectedPath, {
          status: expectedStatus,
          rejectionReason: undefined,
        });
      });
    },
  );

  it("warns when a status changes without a confirmed audit record", async () => {
    testState.pendingItems = [
      {
        id: 41,
        type: "wholesale_deal",
        title: "Pending submission",
        description: "Awaiting staff review",
        submittedBy: "member-1",
        createdAt: "2026-08-30T00:00:00.000Z",
      },
    ];
    testState.apiRequest.mockResolvedValue(
      new Response(JSON.stringify({ auditRecorded: false }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const user = userEvent.setup();
    render(<MarketplaceAdminPage />);

    await user.click(screen.getByTestId("button-review-41"));
    await user.click(await screen.findByTestId("button-approve"));

    await waitFor(() => {
      expect(testState.toast).toHaveBeenCalledWith({
        title: "Status changed; audit event not recorded",
        description:
          "The review decision was saved, but the server did not confirm its audit event. Treat the audit history as incomplete until verified.",
        variant: "destructive",
      });
    });
  });
});

describe("MarketFlow review audit runtime truth", () => {
  async function openAuditTab() {
    const user = userEvent.setup();
    render(<MarketplaceAdminPage />);
    await user.click(screen.getByTestId("tab-audit-log"));
    return user;
  }

  it("labels the surface as server-recorded review history and shows verified empty", async () => {
    await openAuditTab();

    expect(
      screen.getByText(
        "Server-recorded wholesale and capital review events only.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("No recorded review events")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The server returned a verified empty review history for this filter.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Track all administrative actions on the platform"),
    ).not.toBeInTheDocument();
  });

  it("renders an explicit loading state without inferring an empty history", async () => {
    testState.auditData = undefined;
    testState.auditIsLoading = true;

    await openAuditTab();

    expect(
      screen.getByText("Loading server-recorded review events…"),
    ).toBeInTheDocument();
    expect(screen.queryByText("No recorded review events")).not.toBeInTheDocument();
  });

  it.each([
    ["undefined", undefined],
    ["malformed", { logs: [], limit: 50, offset: 0 }],
  ])(
    "treats a %s response as unavailable and provides retry",
    async (_label, auditData) => {
      testState.auditData = auditData;

      const user = await openAuditTab();

      expect(screen.getByText("Admin data unavailable")).toBeInTheDocument();
      expect(screen.queryByText("No recorded review events")).not.toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Retry audit log" }));
      expect(testState.auditRefetch).toHaveBeenCalledTimes(1);
    },
  );

  it("renders request errors as unavailable with retry", async () => {
    testState.auditIsError = true;

    const user = await openAuditTab();

    expect(screen.getByText("Admin data unavailable")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry audit log" }));
    expect(testState.auditRefetch).toHaveBeenCalledTimes(1);
  });
});
