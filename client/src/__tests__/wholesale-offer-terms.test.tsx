import React, { useEffect } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { TooltipProvider } from "@/components/ui/tooltip";

const boundary = vi.hoisted(() => ({
  apiRequest: vi.fn(),
  toast: vi.fn(),
}));

vi.mock("@/contexts/supabase-auth-context", () => ({
  useSupabaseAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { id: "buyer-terms-1", email: "buyer@example.com" },
    profile: { primary_role: "buyer_investment" },
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: boundary.toast }),
  toast: boundary.toast,
}));

vi.mock("@/lib/queryClient", async () => {
  const actual = await vi.importActual<typeof import("@/lib/queryClient")>(
    "@/lib/queryClient",
  );
  return { ...actual, apiRequest: boundary.apiRequest };
});

import {
  DealActionProvider,
  type DealActionType,
  useDealAction,
} from "@/contexts/deal-action-context";

const DEAL_ID = 9001;
const ACCEPT_TOTAL = 329_888;
const COUNTER_TOTAL = 333_468;

function dateFromToday(days: number) {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const INITIAL_CLOSE_DATE = dateFromToday(45);
const ACCEPT_CLOSE_DATE = dateFromToday(60);
const COUNTER_CLOSE_DATE = dateFromToday(75);
const USER_EDITED_CLOSE_DATE = dateFromToday(80);
const REFRESHED_CLOSE_DATE = dateFromToday(90);

const wholesaleDeal = {
  id: String(DEAL_ID),
  propertyAddress: "9001 Contract Ln",
  city: "Oakland",
  state: "CA",
  askingPrice: 999_999,
  contractPrice: 321_123,
  assignmentFee: 8_765,
  arv: 515_151,
  estimatedRepairs: 21_212,
  closingDate: `${INITIAL_CLOSE_DATE}T00:00:00.000Z`,
};

function jsonResponse(body: unknown, status = 201) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function ModalLauncher({ action }: { action: DealActionType }) {
  const { openDealAction } = useDealAction();
  useEffect(() => {
    openDealAction(DEAL_ID, action);
  }, [action, openDealAction]);
  return null;
}

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
}

function renderWholesaleModal(
  action: Extract<
    DealActionType,
    "wholesale_accept" | "wholesale_counter"
  >,
  overrides: Record<string, unknown> = {},
) {
  const client = makeClient();
  client.setQueryData(
    ["/api/wholesale-deals", String(DEAL_ID)],
    { ...wholesaleDeal, ...overrides },
  );
  const { hook } = memoryLocation({ path: "/marketflow", static: true });
  const view = render(
    <QueryClientProvider client={client}>
      <TooltipProvider>
        <Router hook={hook}>
          <DealActionProvider>
            <ModalLauncher action={action} />
          </DealActionProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>,
  );
  return { client, ...view };
}

function setValue(testId: string, value: string) {
  fireEvent.change(screen.getByTestId(testId), { target: { value } });
}

async function initializedDate(
  label: RegExp,
  testId: string,
) {
  const input = (await screen.findByLabelText(label)) as HTMLInputElement;
  expect(screen.getByTestId(testId)).toBe(input);
  await waitFor(() => expect(input).toHaveValue(INITIAL_CLOSE_DATE));
  return input;
}

beforeEach(() => {
  boundary.toast.mockReset();
  boundary.apiRequest.mockReset().mockResolvedValue(
    jsonResponse({ offer: { id: 901 }, negotiation: { id: 902 } }),
  );
});

afterEach(() => cleanup());

describe("reachable Wholesale Accept terms", () => {
  it("initializes an editable required ISO date and blocks/focuses it when blank", async () => {
    renderWholesaleModal("wholesale_accept");
    await screen.findByTestId("dialog-title-wholesale-accept");

    const date = await initializedDate(
      /closing date/i,
      "input-accept-closing-date",
    );
    expect(date).toBeRequired();
    fireEvent.change(date, { target: { value: "" } });
    fireEvent.click(
      screen.getByRole("checkbox", { name: /total assignment price/i }),
    );
    const submit = screen.getByTestId("button-submit-wholesale-accept");
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    const error = await screen.findByTestId("error-accept-closing-date");
    expect(error).toHaveAttribute("role", "alert");
    expect(error).toHaveTextContent("Closing date is required.");
    expect(date).toHaveAttribute("aria-invalid", "true");
    expect(date).toHaveAttribute("aria-describedby", error.id);
    await waitFor(() => expect(date).toHaveFocus());
    expect(boundary.apiRequest).not.toHaveBeenCalled();

    fireEvent.change(date, { target: { value: ACCEPT_CLOSE_DATE } });
    await waitFor(() => {
      expect(screen.queryByTestId("error-accept-closing-date")).toBeNull();
    });
    expect(date).not.toHaveAttribute("aria-invalid");
    expect(date).not.toHaveAttribute("aria-describedby");
    expect(boundary.apiRequest).not.toHaveBeenCalled();
  });

  it("uses one exact Accept total for display, acknowledgement, and payload", async () => {
    renderWholesaleModal("wholesale_accept");
    await screen.findByTestId("dialog-title-wholesale-accept");

    const date = await initializedDate(
      /closing date/i,
      "input-accept-closing-date",
    );
    const total = screen.getByTestId("text-accept-total-assignment-price");
    expect(total).toHaveTextContent("Total assignment price");
    expect(total).toHaveTextContent("$329,888");
    expect(total).not.toHaveTextContent("$999,999");
    const acknowledgement = screen.getByRole("checkbox", {
      name: /total assignment price of \$329,888/i,
    });

    fireEvent.change(date, { target: { value: ACCEPT_CLOSE_DATE } });
    setValue("input-accept-earnest-money", "0");
    setValue("input-accept-message", "Accept distinctive terms");
    fireEvent.click(acknowledgement);
    fireEvent.click(screen.getByTestId("button-submit-wholesale-accept"));

    await waitFor(() => expect(boundary.apiRequest).toHaveBeenCalledTimes(1));
    expect(boundary.apiRequest.mock.calls[0]).toEqual([
      "POST",
      "/api/marketflow/offers",
      {
        lane: "WHOLESALE",
        dealId: 9001,
        offerKind: "WHOLESALE_ASSIGNMENT",
        payload: {
          offerPrice: ACCEPT_TOTAL,
          earnestMoney: 0,
          closeDate: ACCEPT_CLOSE_DATE,
          inspectionPeriod: 0,
          fundingType: "cash",
          notes: "Accept distinctive terms",
        },
      },
    ]);
  });

  it.each([
    ["missing contract price", { contractPrice: undefined }],
    ["blank assignment fee", { assignmentFee: " " }],
    ["nonnumeric contract price", { contractPrice: "not-a-number" }],
    ["nonfinite contract price", { contractPrice: Number.POSITIVE_INFINITY }],
    ["fractional contract price", { contractPrice: 321_123.5 }],
    ["negative assignment fee offset", { assignmentFee: -1 }],
    ["summed total below the server minimum", { contractPrice: 500, assignmentFee: 499 }],
    ["over-maximum component", { assignmentFee: 10_000_000_001 }],
    [
      "unsafe contract-price component",
      { contractPrice: Number.MAX_SAFE_INTEGER, assignmentFee: 1 },
    ],
  ])("blocks an invalid Accept total: %s", async (_label, overrides) => {
    renderWholesaleModal("wholesale_accept", overrides);
    await screen.findByTestId("dialog-title-wholesale-accept");

    const error = await screen.findByTestId(
      "error-accept-total-assignment-price",
    );
    expect(error).toHaveAttribute("role", "alert");
    expect(error).toHaveTextContent("Total assignment price is invalid.");
    expect(screen.getByTestId("checkbox-acknowledge-terms")).toBeDisabled();
    expect(
      screen.getByTestId("button-submit-wholesale-accept"),
    ).toBeDisabled();
    expect(boundary.apiRequest).not.toHaveBeenCalled();
  });

  it.each([
    ["blank", ""],
    ["negative", "-1"],
    ["fractional", "2345.5"],
    ["above the total", String(ACCEPT_TOTAL + 1)],
  ])("blocks %s Accept earnest money without a request", async (_label, value) => {
    renderWholesaleModal("wholesale_accept");
    await screen.findByTestId("dialog-title-wholesale-accept");
    await initializedDate(/closing date/i, "input-accept-closing-date");

    setValue("input-accept-closing-date", ACCEPT_CLOSE_DATE);
    setValue("input-accept-earnest-money", value);
    fireEvent.click(
      screen.getByRole("checkbox", { name: /total assignment price/i }),
    );
    const submit = screen.getByTestId("button-submit-wholesale-accept");
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    await waitFor(() => {
      expect(boundary.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Valid earnest money required",
          variant: "destructive",
        }),
      );
    });
    expect(boundary.apiRequest).not.toHaveBeenCalled();
  });
});

describe("reachable Wholesale Counter terms", () => {
  it("blocks and focuses the required initialized date when blank", async () => {
    renderWholesaleModal("wholesale_counter");
    await screen.findByTestId("dialog-title-wholesale-counter");

    const date = await initializedDate(
      /closing date/i,
      "input-counter-closing-date",
    );
    expect(date).toBeRequired();
    fireEvent.change(date, { target: { value: "" } });
    const submit = screen.getByTestId("button-submit-wholesale-counter");
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    const error = await screen.findByTestId("error-counter-closing-date");
    expect(error).toHaveAttribute("role", "alert");
    expect(error).toHaveTextContent("Closing date is required.");
    expect(date).toHaveAttribute("aria-invalid", "true");
    expect(date).toHaveAttribute("aria-describedby", error.id);
    await waitFor(() => expect(date).toHaveFocus());
    expect(boundary.apiRequest).not.toHaveBeenCalled();

    fireEvent.change(date, { target: { value: COUNTER_CLOSE_DATE } });
    await waitFor(() => {
      expect(screen.queryByTestId("error-counter-closing-date")).toBeNull();
    });
    expect(date).not.toHaveAttribute("aria-invalid");
    expect(date).not.toHaveAttribute("aria-describedby");
    expect(boundary.apiRequest).not.toHaveBeenCalled();
  });

  it("uses one exact Counter total for display and payload", async () => {
    renderWholesaleModal("wholesale_counter");
    await screen.findByTestId("dialog-title-wholesale-counter");
    await initializedDate(/closing date/i, "input-counter-closing-date");

    setValue("input-counter-assignment-fee", "12345");
    await waitFor(() => {
      expect(
        screen.getByTestId("text-counter-total-assignment-price"),
      ).toHaveTextContent("$333,468");
    });
    expect(
      screen.getByTestId("text-counter-total-assignment-price"),
    ).toHaveTextContent("Total assignment price");
    setValue("input-counter-earnest-money", "0");
    setValue("input-counter-closing-date", COUNTER_CLOSE_DATE);
    setValue("input-counter-inspection-period", "0");
    setValue("input-counter-message", "Counter distinctive terms");
    fireEvent.click(screen.getByTestId("button-submit-wholesale-counter"));

    await waitFor(() => expect(boundary.apiRequest).toHaveBeenCalledTimes(1));
    expect(boundary.apiRequest.mock.calls[0]).toEqual([
      "POST",
      "/api/marketflow/offers",
      {
        lane: "WHOLESALE",
        dealId: 9001,
        offerKind: "WHOLESALE_ASSIGNMENT",
        payload: {
          offerPrice: COUNTER_TOTAL,
          earnestMoney: 0,
          closeDate: COUNTER_CLOSE_DATE,
          inspectionPeriod: 0,
          fundingType: "cash",
          notes: "Counter distinctive terms",
        },
      },
    ]);
  });

  it.each([
    ["blank fee", {}, ""],
    ["nonnumeric fee", {}, "not-a-number"],
    ["negative fee that would leave a plausible sum", {}, "-1"],
    ["fractional summed total", {}, "12345.5"],
    ["summed total below the server minimum", { contractPrice: 500 }, "499"],
    ["total above the server maximum", {}, "10000000000"],
  ])("blocks an invalid Counter total: %s", async (_label, overrides, fee) => {
    renderWholesaleModal("wholesale_counter", overrides);
    await screen.findByTestId("dialog-title-wholesale-counter");
    await initializedDate(/closing date/i, "input-counter-closing-date");

    setValue("input-counter-assignment-fee", fee);

    const error = await screen.findByTestId(
      "error-counter-total-assignment-price",
    );
    expect(error).toHaveAttribute("role", "alert");
    expect(error).toHaveTextContent("Total assignment price is invalid.");
    expect(
      screen.getByTestId("button-submit-wholesale-counter"),
    ).toBeDisabled();
    expect(boundary.apiRequest).not.toHaveBeenCalled();
  });

  it.each([
    ["blank earnest money", "input-counter-earnest-money", ""],
    ["negative earnest money", "input-counter-earnest-money", "-1"],
    ["fractional earnest money", "input-counter-earnest-money", "1.5"],
    [
      "earnest money above the total",
      "input-counter-earnest-money",
      String(COUNTER_TOTAL + 1),
    ],
    ["blank inspection", "input-counter-inspection-period", ""],
    ["negative inspection", "input-counter-inspection-period", "-1"],
    ["fractional inspection", "input-counter-inspection-period", "1.5"],
    ["inspection above 365 days", "input-counter-inspection-period", "366"],
  ])("blocks invalid Counter %s with all other terms valid", async (_label, testId, value) => {
    renderWholesaleModal("wholesale_counter");
    await screen.findByTestId("dialog-title-wholesale-counter");
    await initializedDate(/closing date/i, "input-counter-closing-date");

    setValue("input-counter-assignment-fee", "12345");
    setValue("input-counter-closing-date", COUNTER_CLOSE_DATE);
    setValue(testId, value);
    await waitFor(() => {
      expect(
        screen.getByTestId("text-counter-total-assignment-price"),
      ).toHaveTextContent("$333,468");
    });
    const submit = screen.getByTestId("button-submit-wholesale-counter");
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
    expect(boundary.apiRequest).not.toHaveBeenCalled();
  });
});

describe("wholesale date initialization", () => {
  it.each([
    ["date-only", "wholesale_accept", /closing date/i, "input-accept-closing-date", INITIAL_CLOSE_DATE, INITIAL_CLOSE_DATE],
    ["valid ISO", "wholesale_accept", /closing date/i, "input-accept-closing-date", `${INITIAL_CLOSE_DATE}T12:34:56.789-07:00`, INITIAL_CLOSE_DATE],
    ["corrupt-suffix", "wholesale_accept", /closing date/i, "input-accept-closing-date", `${INITIAL_CLOSE_DATE}Tgarbage`, ""],
    ["date-only", "wholesale_counter", /closing date/i, "input-counter-closing-date", INITIAL_CLOSE_DATE, INITIAL_CLOSE_DATE],
    ["valid ISO", "wholesale_counter", /closing date/i, "input-counter-closing-date", `${INITIAL_CLOSE_DATE}T12:34:56Z`, INITIAL_CLOSE_DATE],
    ["corrupt-suffix", "wholesale_counter", /closing date/i, "input-counter-closing-date", `${INITIAL_CLOSE_DATE}Tgarbage`, ""],
  ] as const)(
    "normalizes a %s closing date for %s without laundering its suffix",
    async (_shape, action, label, testId, source, expected) => {
      renderWholesaleModal(action, { closingDate: source });
      const date = (await screen.findByLabelText(label)) as HTMLInputElement;
      expect(screen.getByTestId(testId)).toBe(date);
      await waitFor(() => expect(date).toHaveValue(expected));
      expect(boundary.apiRequest).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["wholesale_accept", /closing date/i, "input-accept-closing-date"],
    ["wholesale_counter", /closing date/i, "input-counter-closing-date"],
  ] as const)(
    "does not overwrite a user-edited date after a %s query refresh",
    async (action, label, testId) => {
      const { client } = renderWholesaleModal(action);
      const date = await initializedDate(label, testId);
      fireEvent.change(date, { target: { value: USER_EDITED_CLOSE_DATE } });
      expect(date).toHaveValue(USER_EDITED_CLOSE_DATE);

      act(() => {
        client.setQueryData(
          ["/api/wholesale-deals", String(DEAL_ID)],
          {
            ...wholesaleDeal,
            city: "Berkeley",
            closingDate: `${REFRESHED_CLOSE_DATE}T00:00:00.000Z`,
          },
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/Berkeley/)).toBeInTheDocument();
      });
      await waitFor(() => expect(date).toHaveValue(USER_EDITED_CLOSE_DATE));
      expect(date).not.toHaveValue(REFRESHED_CLOSE_DATE);
      expect(boundary.apiRequest).not.toHaveBeenCalled();
    },
  );
});
