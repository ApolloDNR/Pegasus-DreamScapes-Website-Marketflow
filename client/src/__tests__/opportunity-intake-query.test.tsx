import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SubmitPropertyPage, {
  normalizeOwnerSituation,
} from "@/pages/submit-property";
import {
  STRATEGY_LAB_HANDOFF_SESSION_KEY,
  clearStrategyLabHandoff,
  writeStrategyLabHandoff,
} from "@/pegasus/strategy-lab-handoff";

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
  clearStrategyLabHandoff();
  window.history.pushState(
    {},
    "",
    "/bring-an-opportunity?intent=blueprint&address=19%20Bay%20View%20Ave&ref=apollo-partner",
  );
  apiRequestMock.mockResolvedValue({ json: async () => ({ id: "opportunity-1" }) });
});

afterEach(() => {
  cleanup();
  clearStrategyLabHandoff();
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
    expect(payload).not.toHaveProperty("utmSource");
    expect(payload).not.toHaveProperty("utmMedium");
    expect(payload).not.toHaveProperty("utmCampaign");
    expect(payload).not.toHaveProperty("referrer");
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

  it("prefills known property facts and submits a directional Strategy Lab brief", async () => {
    writeStrategyLabHandoff({
      address: "19 Lab Lane",
      propertyType: "Single-family residence",
      occupancy: "Vacant",
      condition: "Moderate renovation",
      situation: "Inherited or estate property",
      askingPrice: 600_000,
      rehabBudget: 105_000,
      arvEstimate: 840_000,
      topLaneLabel: "Value-add execution",
      topLaneVerdict: "Needs disciplined terms",
      primaryMetric: "$44,475 modeled spread",
      memoNextStep: "Verify title and market support.",
      engineVersion: "premium-desk-v1",
    });
    window.history.pushState(
      {},
      "",
      "/bring-an-opportunity?intent=property&ref=strategy-lab",
    );

    renderPage();

    expect(screen.getByLabelText("Property address")).toHaveValue("19 Lab Lane");
    expect(screen.getByLabelText("Property type")).toHaveValue("Single-family");
    expect(screen.getByLabelText("Occupancy")).toHaveValue("Vacant");
    expect(screen.getByLabelText("Condition")).toHaveValue("Moderate repairs");
    expect(screen.getByLabelText("Estimated value (if known)")).toHaveValue("840000");
    fireEvent.change(screen.getByLabelText("Estimated value (if known)"), {
      target: { value: "900000" },
    });
    await waitFor(() => {
      expect(
        window.sessionStorage.getItem(STRATEGY_LAB_HANDOFF_SESSION_KEY),
      ).toBeNull();
    });

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
    expect(payload).toEqual(expect.objectContaining({
      leadSource: "strategy_lab_handoff",
      propertyAddress: "19 Lab Lane",
      propertyType: "Single-family",
      occupancyStatus: "Vacant",
      condition: "Moderate repairs",
      situation: "Inherited / probate",
      estimatedValue: 900_000,
      consentAccepted: true,
    }));
    expect(String(payload.notes)).toContain(
      "Directional Strategy Lab brief (visitor-entered; automated and unverified):",
    );
    expect(String(payload.notes)).toContain("Asking price / basis: $600,000");
    expect(String(payload.notes)).toContain("Projected exit value: $900,000");
    expect(String(payload.notes)).not.toContain("Projected exit value: $840,000");
    expect(String(payload.notes)).not.toContain("Modeled path:");
    expect(String(payload.notes)).not.toContain("$44,475 modeled spread");
    expect(String(payload.notes)).toContain(
      "Intake facts changed after the Strategy Lab read; rerun the automated path comparison with the updated inputs before relying on it.",
    );
  });

  it("keeps URL and Blueprint routing ahead of a stored Strategy Lab brief", async () => {
    writeStrategyLabHandoff({
      address: "Stored Lab Address",
      situation: "Inherited or estate property",
      arvEstimate: 840_000,
      topLaneLabel: "Value-add execution",
    });
    window.history.pushState(
      {},
      "",
      "/bring-an-opportunity?intent=blueprint&address=URL%20Address&owner_situation=Vacant%20property&ref=strategy-lab",
    );

    renderPage();

    expect(screen.getByLabelText("Property address")).toHaveValue("URL Address");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("button", { name: "Vacant" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
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
    expect(payload.leadSource).toBe("blueprint_request");
    expect(payload.propertyAddress).toBe("URL Address");
    expect(payload.situation).toBe("Vacant");
    expect(payload.consentAccepted).toBe(true);
    expect(String(payload.notes)).toContain("Address: URL Address");
    expect(String(payload.notes)).not.toContain("Stored Lab Address");
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
