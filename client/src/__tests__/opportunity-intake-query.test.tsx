import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SubmitPropertyPage, {
  normalizeOwnerSituation,
} from "@/pages/submit-property";

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
  it.each([
    ["Significant repairs", "Major repairs"],
    ["Vacant property", "Vacant"],
    ["Inherited property", "Inherited / probate"],
    ["Unfinished construction", "Unfinished project"],
    ["Tenant or occupancy issues", "Tenant issue"],
    ["Code or permit concerns", "Other"],
    ["Time-sensitive sale", "Other"],
    ["ADU or development potential", "Other"],
    ["A listing that is not working", "Other"],
  ])("maps the Property Owners situation %s to %s", (sourceLabel, situation) => {
    expect(normalizeOwnerSituation(sourceLabel)).toEqual({
      sourceLabel,
      situation,
    });
  });

  it("ignores unknown or overlong owner-situation query values", () => {
    expect(normalizeOwnerSituation("Unrecognized situation")).toEqual({
      sourceLabel: "",
      situation: "",
    });
    expect(normalizeOwnerSituation(`Significant repairs${"x".repeat(200)}`)).toEqual({
      sourceLabel: "",
      situation: "",
    });
  });

  it("preserves Blueprint triage, address prefill, and referral attribution", async () => {
    renderPage();

    expect(screen.getByLabelText("Property address")).toHaveValue("19 Bay View Ave");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: /Just exploring/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: /^Not sure/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    fireEvent.change(screen.getByLabelText("Full name (required)"), {
      target: { value: "Ada Lovelace" },
    });
    fireEvent.change(screen.getByLabelText("Email (required)"), {
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

  it("prefills a Property Owners situation and preserves its source label", async () => {
    window.history.pushState(
      {},
      "",
      "/bring-an-opportunity?intent=property&owner_situation=Inherited%20property",
    );
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      screen.getByRole("button", { name: "Inherited / probate" }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: /^Not sure/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    fireEvent.change(screen.getByLabelText("Full name (required)"), {
      target: { value: "Ada Lovelace" },
    });
    fireEvent.change(screen.getByLabelText("Email (required)"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Submit for Review" }));

    await waitFor(() => expect(apiRequestMock).toHaveBeenCalledTimes(1));
    const payload = apiRequestMock.mock.calls[0][2] as Record<string, unknown>;
    expect(payload.situation).toBe("Inherited / probate");
    expect(payload.notes).toContain("Owner situation: Inherited property");
  });

  it("keeps final submission available and explains each missing requirement", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: /Just exploring/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: /^Not sure/ }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      screen.getByText(
        "Full name, email, and contact consent are required. Phone and scheduling details are optional.",
      ),
    ).toBeInTheDocument();
    const submitButton = screen.getByRole("button", { name: "Submit for Review" });
    expect(submitButton).toBeEnabled();

    fireEvent.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please complete the required contact fields and consent before submitting.",
    );
    expect(screen.getByText("Enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(
      screen.getByText("Agree to contact about this submission before sending."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Full name (required)")).toHaveFocus();
    expect(screen.getByLabelText("Full name (required)")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Email (required)")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
    expect(apiRequestMock).not.toHaveBeenCalled();
  });
});
