import React from "react";
import { webcrypto } from "node:crypto";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import MarketflowAccessPage, { marketflowAccessRole } from "@/pages/marketflow-access";

const { apiRequestMock } = vi.hoisted(() => ({ apiRequestMock: vi.fn() }));
vi.mock("@/lib/queryClient", () => ({ apiRequest: apiRequestMock }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-seo", () => ({ useSEO: vi.fn() }));

let now = 10_000;
const scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView");

function renderAccess(search = "") {
  const memory = memoryLocation({ path: "/marketflow/access", static: true });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <Router hook={memory.hook} searchHook={() => search}>
        <MarketflowAccessPage />
      </Router>
    </QueryClientProvider>,
  );
}

function expectRelationship(label: string) {
  expect(screen.getByRole("combobox", { name: "Role" })).toHaveTextContent(label);
  expect(within(screen.getByLabelText("Current access protocol")).getByText(label)).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent(label);
}

async function chooseRelationship(label: string) {
  fireEvent.keyDown(screen.getByRole("combobox", { name: "Role" }), { key: "Enter" });
  fireEvent.click(await screen.findByRole("option", { name: label }));
}

function fillRequest() {
  fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Taylor Example" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "taylor@example.test" } });
  fireEvent.change(screen.getByLabelText("Who introduced you?"), { target: { value: "Example introducer" } });
  fireEvent.click(screen.getByTestId("checkbox-access-consent"));
  now += 5_000;
}

beforeEach(() => {
  now = 10_000;
  vi.spyOn(Date, "now").mockImplementation(() => now);
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.stubGlobal("crypto", webcrypto);
  vi.stubGlobal("ResizeObserver", class { observe() {} unobserve() {} disconnect() {} });
  Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  apiRequestMock.mockImplementation(async () => new Response(JSON.stringify({ id: 101, stage: "new" }), { status: 201 }));
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (scrollIntoViewDescriptor) Object.defineProperty(Element.prototype, "scrollIntoView", scrollIntoViewDescriptor);
  else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
  apiRequestMock.mockReset();
});

describe("MarketFlow access relationship context", () => {
  it.each(["", "?ref=footer", "?role=", "?role=%20%20", "?role=unknown", "?role=constructor", "?role=__proto__"])(
    "keeps a generic or unsupported arrival unselected: %s",
    (search) => {
      expect(marketflowAccessRole(search)).toBe("");
      renderAccess(search);
      expectRelationship("Choose a relationship");
      expect(screen.queryByRole("option", { name: "Operator / builder" })).not.toBeInTheDocument();
    },
  );

  it.each([
    ["source", "wholesaler", "Deal finder / wholesaler"],
    ["wholesaler", "wholesaler", "Deal finder / wholesaler"],
    ["buyer", "buyer", "Cash buyer"],
    ["capital", "capital", "Capital partner"],
    ["operator", "operator", "Operator / builder"],
    ["broker", "broker", "Broker / agent"],
    ["other", "other", "Other relationship"],
    ["%20BUYER%20", "buyer", "Cash buyer"],
  ])("carries explicit %s context into the control and both summaries", (query, value, label) => {
    expect(marketflowAccessRole(`?role=${query}`)).toBe(value);
    renderAccess(`?role=${query}`);
    expectRelationship(label);
  });

  it("keeps both summaries aligned with every visitor-selected relationship", async () => {
    renderAccess();
    for (const label of ["Deal finder / wholesaler", "Cash buyer", "Capital partner", "Operator / builder", "Broker / agent", "Other relationship"]) {
      await chooseRelationship(label);
      expectRelationship(label);
    }
  });

  it("requires a relationship before sending an otherwise complete request", async () => {
    renderAccess();
    fillRequest();
    fireEvent.click(screen.getByTestId("button-access-submit"));
    expect(await screen.findByText("Choose your relationship")).toBeInTheDocument();
    expect(apiRequestMock).not.toHaveBeenCalled();
    await chooseRelationship("Deal finder / wholesaler");
    fireEvent.click(screen.getByTestId("button-access-submit"));
    await screen.findByTestId("success-view-marketflow_access");
    expect(apiRequestMock).toHaveBeenCalledTimes(1);
    expect(apiRequestMock.mock.calls[0][2].leadData.role).toBe("wholesaler");
  });

  it.each([
    ["", "Choose a relationship"],
    ["?role=source", "Deal finder / wholesaler"],
    ["?role=capital", "Capital partner"],
  ])("restores the arrival context, empty fields and consent for another request: %s", async (search, label) => {
    renderAccess(search);
    await chooseRelationship("Cash buyer");
    fillRequest();
    fireEvent.click(screen.getByTestId("button-access-submit"));
    await screen.findByTestId("success-view-marketflow_access");
    fireEvent.click(screen.getByTestId("button-success-add-another-marketflow_access"));
    await waitFor(() => expectRelationship(label));
    expect(screen.getByLabelText("Full name")).toHaveValue("");
    expect(screen.getByLabelText("Full name")).toHaveFocus();
    expect(screen.getByTestId("checkbox-access-consent")).toHaveAttribute("data-state", "unchecked");
    expect(apiRequestMock.mock.calls[0][2].leadData.role).toBe("buyer");
  });
});
