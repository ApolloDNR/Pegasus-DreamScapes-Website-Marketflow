import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { WorkWithApolloPage } from "@/pegasus/pages";

const { apiRequestMock, trackEventMock } = vi.hoisted(() => ({
  apiRequestMock: vi.fn(),
  trackEventMock: vi.fn(),
}));

vi.mock("@/lib/queryClient", () => ({
  apiRequest: apiRequestMock,
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventMock,
}));

const SELLER_ROLE = "List my property (Seller representation)";
const BUYER_ROLE = "Buy a home (Buyer representation)";

function setReducedMotion(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)" ? matches : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    })),
  });
}

function renderPage() {
  const memory = memoryLocation({ path: "/work-with-apollo", record: true });
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  const result = render(
    <QueryClientProvider client={queryClient}>
      <Router hook={memory.hook}>
        <WorkWithApolloPage go={vi.fn()} />
      </Router>
    </QueryClientProvider>,
  );
  return { ...result, history: memory.history as string[] };
}

function fillRequiredForm() {
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Ada Lovelace" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "ada@example.com" },
  });
  fireEvent.click(screen.getByRole("checkbox"));
}

function submitRepresentationRequest() {
  const submit = screen.getByRole("button", { name: /request representation/i });
  fireEvent.submit(submit.closest("form")!);
}

beforeEach(() => {
  setReducedMotion(false);
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
  apiRequestMock.mockImplementation(() => new Promise(() => undefined));
});

afterEach(() => {
  cleanup();
  apiRequestMock.mockReset();
  trackEventMock.mockReset();
  vi.restoreAllMocks();
});

describe("mounted Work With Apollo representation handoff", () => {
  it("synchronizes Buyer and Seller choices with the real form field and submitted lane", async () => {
    renderPage();

    const role = screen.getByLabelText("I am a…");
    expect(role).toHaveValue(SELLER_ROLE);

    fireEvent.click(screen.getByTestId("apollo-selector-buy"));
    expect(role).toHaveValue(BUYER_ROLE);

    fireEvent.click(screen.getByTestId("apollo-selector-sell"));
    expect(role).toHaveValue(SELLER_ROLE);

    fireEvent.click(screen.getByTestId("apollo-selector-buy"));
    fireEvent.click(screen.getByTestId("button-apollo-selector-cta"));
    expect(role).toHaveFocus();

    fillRequiredForm();
    submitRepresentationRequest();

    await waitFor(() => expect(apiRequestMock).toHaveBeenCalledTimes(1));
    const [, path, payload] = apiRequestMock.mock.calls[0] as [
      string,
      string,
      Record<string, any>,
    ];
    expect(path).toBe("/api/leads");
    expect(payload).toEqual(
      expect.objectContaining({
        leadType: "submit",
        consentContact: true,
        leadData: expect.objectContaining({
          lane: BUYER_ROLE,
          intent: "representation",
        }),
      }),
    );
  });

  it("announces the selected path and honors reduced motion before focusing the form", () => {
    setReducedMotion(true);
    renderPage();

    fireEvent.click(screen.getByTestId("apollo-selector-buy"));
    expect(screen.getByRole("status", { name: "Selected path" })).toHaveAttribute(
      "aria-live",
      "polite",
    );
    expect(screen.getByRole("status", { name: "Selected path" })).toHaveTextContent(
      "I want to buy",
    );

    fireEvent.click(screen.getByTestId("button-apollo-selector-cta"));
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "start",
    });
    expect(screen.getByLabelText("I am a…")).toHaveFocus();
  });

  it("keeps all four routes and the licensed-representation boundaries explicit", () => {
    const { container, history } = renderPage();

    expect(
      screen.getAllByTestId(/^apollo-selector-/).map((button) => button.textContent),
    ).toEqual([
      "I want to sell",
      "I want to buy",
      "I have a complex situation",
      "I have a deal to submit",
    ]);

    fireEvent.click(screen.getByTestId("apollo-selector-situation"));
    fireEvent.click(screen.getByTestId("button-apollo-selector-cta"));
    expect(history.at(-1)).toBe("/bring-an-opportunity?intent=property");

    fireEvent.click(screen.getByTestId("apollo-selector-deal"));
    fireEvent.click(screen.getByTestId("button-apollo-selector-cta"));
    expect(history.at(-1)).toBe("/bring-an-opportunity?intent=deal-jv");

    expect(container).toHaveTextContent("CA DRE #02333658");
    expect(container).toHaveTextContent(
      "Pegasus Dreamscapes Corp. is not a real estate brokerage.",
    );
    expect(container).toHaveTextContent(
      "No agency relationship is created without a written agreement.",
    );
    expect(container).toHaveTextContent(
      "This page is not a listing or buyer-representation agreement.",
    );
  });

  it("exposes explicit pending copy while the request is in flight", async () => {
    renderPage();
    fillRequiredForm();
    submitRepresentationRequest();

    const pending = await screen.findByRole("button", {
      name: /sending your request/i,
    });
    expect(pending).toBeDisabled();
    expect(pending).toHaveAttribute("aria-busy", "true");
  });

  it("keeps a failed submission visible as a durable alert", async () => {
    apiRequestMock.mockRejectedValueOnce(new Error("offline"));
    renderPage();
    fillRequiredForm();
    submitRepresentationRequest();

    const error = await screen.findByRole("alert");
    expect(error).toHaveTextContent("Something went wrong sending your submission");
    expect(error).toBeInTheDocument();
  });

  it("announces and focuses the successful handoff", async () => {
    const json = vi.fn().mockResolvedValue({ id: "lead-1", accepted: true });
    apiRequestMock.mockImplementationOnce(async () => ({ json }));
    renderPage();
    fillRequiredForm();
    submitRepresentationRequest();

    await waitFor(() => expect(apiRequestMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(json).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(trackEventMock).toHaveBeenCalledTimes(1));
    const successHeading = await screen.findByRole("heading", {
      name: "Received. Thank you.",
    });
    const success = successHeading.parentElement!;
    expect(success).toHaveAttribute("role", "status");
    expect(success).toHaveAttribute("aria-live", "polite");
    await waitFor(() => expect(success).toHaveFocus());
    expect(success).toHaveTextContent("Received. Thank you.");
  });

  it("uses one portrait-backed page identity without the duplicate blueprint hero or contour art", () => {
    const { container } = renderPage();

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("img", { name: /Paolo.*Apollo.*Duran/i }),
    ).toHaveAttribute("src", expect.stringContaining("founder/apollo-1200.jpg"));
    expect(
      container.querySelector('img[src*="pegasus-craft-blueprint.webp"]'),
    ).toBeNull();
    expect(container.querySelector('svg[viewBox="0 0 1200 600"]')).toBeNull();
  });
});
