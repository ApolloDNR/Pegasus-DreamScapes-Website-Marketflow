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
import SubmitPropertyPage from "@/pages/submit-property";

const { apiRequestMock } = vi.hoisted(() => ({ apiRequestMock: vi.fn() }));

vi.mock("@/lib/queryClient", () => ({ apiRequest: apiRequestMock }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-seo", () => ({ useSEO: vi.fn() }));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <SubmitPropertyPage />
    </QueryClientProvider>,
  );
}

function advanceToContact() {
  fireEvent.click(screen.getByRole("button", { name: /^A property I own/ }));
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  fireEvent.click(screen.getByRole("button", { name: "Just exploring" }));
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  fireEvent.click(screen.getByRole("button", { name: "Not sure" }));
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
}

function fillRequiredContact() {
  fireEvent.change(screen.getByLabelText("Full name (required)"), {
    target: { value: "Ada Lovelace" },
  });
  fireEvent.change(screen.getByLabelText("Email (required)"), {
    target: { value: "ada@example.com" },
  });
  fireEvent.click(screen.getByRole("checkbox"));
}

beforeEach(() => {
  window.history.pushState({}, "", "/bring-an-opportunity");
  Object.defineProperty(window, "scrollTo", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  apiRequestMock.mockReset();
  vi.restoreAllMocks();
  window.history.pushState({}, "", "/");
});

describe("Bring an Opportunity interaction states", () => {
  it("announces every step and deliberately focuses its prompt", async () => {
    renderPage();

    const liveRegion = screen.getByTestId("intake-live-status");
    const bringingPrompt = screen.getByTestId("intake-step-heading");
    await waitFor(() => expect(bringingPrompt).toHaveFocus());
    expect(liveRegion).toHaveTextContent("Step 1 of 5: Bringing");

    fireEvent.click(screen.getByRole("button", { name: /^A property I own/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    const propertyPrompt = screen.getByTestId("intake-step-heading");
    await waitFor(() => expect(propertyPrompt).toHaveFocus());
    expect(propertyPrompt).toHaveTextContent("The property.");
    expect(liveRegion).toHaveTextContent("Step 2 of 5: Property");
    expect(screen.getByTestId("intake-live-status")).toBe(liveRegion);

    fireEvent.click(screen.getByRole("button", { name: "Return to Bringing" }));
    await waitFor(() => {
      expect(screen.getByTestId("intake-step-heading")).toHaveFocus();
    });
    expect(liveRegion).toHaveTextContent("Step 1 of 5: Bringing");
  });

  it("names the pending state and locks every step-navigation control", async () => {
    const request = deferred<{ json: () => Promise<{ id: string }> }>();
    apiRequestMock.mockReturnValueOnce(request.promise);
    renderPage();
    advanceToContact();
    fillRequiredContact();

    const liveRegion = screen.getByTestId("intake-live-status");
    fireEvent.click(screen.getByRole("button", { name: "Submit for Review" }));

    const pending = await screen.findByRole("button", {
      name: "Sending for Review…",
    });
    expect(pending).toBeDisabled();
    expect(pending).toHaveAttribute("aria-busy", "true");
    expect(screen.getByTestId("opportunity-intake-form")).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Return to Goal" })).toBeDisabled();
    expect(screen.getByLabelText("Full name (required)")).toBeDisabled();
    expect(screen.getByLabelText("Phone (optional)")).toBeDisabled();
    expect(screen.getByLabelText("Email (required)")).toBeDisabled();
    expect(screen.getByLabelText("Preferred contact method")).toBeDisabled();
    expect(screen.getByLabelText("Best time to contact")).toBeDisabled();
    expect(screen.getByLabelText("Anything else we should know?")).toBeDisabled();
    expect(screen.getByRole("checkbox")).toBeDisabled();
    expect(liveRegion).toHaveTextContent("Sending your opportunity for review");

    request.resolve({ json: async () => ({ id: "opportunity-42" }) });

    const success = await screen.findByRole("heading", { name: "Received." });
    await waitFor(() => expect(success).toHaveFocus());
    expect(screen.getByText("Reference: opportunity-42")).toBeInTheDocument();
    expect(liveRegion).toHaveTextContent("Submission received");
    expect(screen.getByTestId("intake-live-status")).toBe(liveRegion);
  });

  it("shows the API failure, keeps Retry focus stable, and finishes on success", async () => {
    const retryRequest = deferred<{ json: () => Promise<{ id: string }> }>();
    apiRequestMock
      .mockRejectedValueOnce(new Error("upstream unavailable"))
      .mockReturnValueOnce(retryRequest.promise);
    renderPage();
    advanceToContact();
    fillRequiredContact();

    const liveRegion = screen.getByTestId("intake-live-status");
    fireEvent.click(screen.getByRole("button", { name: "Submit for Review" }));

    const failure = await screen.findByRole("alert");
    expect(failure).toHaveTextContent("We could not record your submission");
    await waitFor(() => expect(failure).toHaveFocus());
    expect(liveRegion).toHaveTextContent("Submission could not be recorded");

    const retry = screen.getByRole("button", { name: "Retry submission" });
    retry.focus();
    fireEvent.click(retry);

    const retrying = await screen.findByRole("button", { name: "Retrying…" });
    expect(retrying).toBe(retry);
    expect(retrying).toHaveFocus();
    expect(retrying).not.toBeDisabled();
    expect(retrying).toHaveAttribute("aria-disabled", "true");
    expect(retrying).toHaveAttribute("aria-busy", "true");
    expect(liveRegion).toHaveTextContent("Retrying your submission");
    expect(apiRequestMock).toHaveBeenCalledTimes(2);
    fireEvent.click(retrying);
    expect(apiRequestMock).toHaveBeenCalledTimes(2);
    for (const call of apiRequestMock.mock.calls) {
      expect(call[0]).toBe("POST");
      expect(call[1]).toBe("/api/opportunities");
      expect(call[2]).toEqual(
        expect.objectContaining({
          hp_company: "",
          sourcePage: "/bring-an-opportunity",
          contactName: "Ada Lovelace",
          email: "ada@example.com",
          consentAccepted: true,
        }),
      );
    }

    retryRequest.resolve({ json: async () => ({ id: "opportunity-retry" }) });

    const success = await screen.findByRole("heading", { name: "Received." });
    await waitFor(() => expect(success).toHaveFocus());
    expect(liveRegion).toHaveTextContent("Submission received");
    expect(screen.getByTestId("intake-live-status")).toBe(liveRegion);
  });
});
