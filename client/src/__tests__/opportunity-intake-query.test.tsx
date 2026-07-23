import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SubmitPropertyPage from "@/pages/submit-property";

const { apiRequestMock } = vi.hoisted(() => ({ apiRequestMock: vi.fn() }));

vi.mock("@/lib/queryClient", () => ({ apiRequest: apiRequestMock }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-seo", () => ({ useSEO: vi.fn() }));

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <SubmitPropertyPage />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  window.history.pushState(
    {},
    "",
    "/bring-an-opportunity?intent=blueprint&address=19%20Bay%20View%20Ave&ref=apollo-partner",
  );
  apiRequestMock.mockResolvedValue({ json: async () => ({ id: "opportunity-1" }) });
});

afterEach(() => {
  cleanup();
  apiRequestMock.mockReset();
  window.history.pushState({}, "", "/");
});

describe("Bring an Opportunity query contract", () => {
  it("preserves Blueprint triage, address prefill, and referral attribution", async () => {
    renderPage();

    expect(screen.getByLabelText("Property address")).toHaveValue("19 Bay View Ave");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: /Just exploring/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: /^Not sure/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Ada Lovelace" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Submit for Review" }));

    await waitFor(() => expect(apiRequestMock).toHaveBeenCalledTimes(1));
    const [method, path, payload] = apiRequestMock.mock.calls[0] as [
      string,
      string,
      Record<string, unknown>,
    ];

    expect(method).toBe("POST");
    expect(path).toBe("/api/opportunities");
    expect(payload).toEqual(expect.objectContaining({
      visitorType: "strategy_only",
      propertyAddress: "19 Bay View Ave",
      leadSource: "blueprint_request",
      consentAccepted: true,
      notes: expect.stringContaining("Intake intent: blueprint"),
    }));
    expect(String(payload.notes)).toContain("Referral reference: apollo-partner");
  });
});
