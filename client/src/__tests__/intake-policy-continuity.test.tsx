import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SubmitPropertyPage from "@/pages/submit-property";

const { apiRequestMock } = vi.hoisted(() => ({ apiRequestMock: vi.fn() }));

vi.mock("@/lib/queryClient", () => ({ apiRequest: apiRequestMock }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-seo", () => ({ useSEO: vi.fn() }));

beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState(null, "", "/bring-an-opportunity?intent=property");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  apiRequestMock.mockReset();
  vi.restoreAllMocks();
  window.history.replaceState(null, "", "/");
});

describe("intake privacy policy reading", () => {
  it("announces a separate policy tab and keeps the current unsent draft intact when activated", () => {
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
        <SubmitPropertyPage />
      </QueryClientProvider>,
    );
    fireEvent.change(screen.getByLabelText("Property address"), { target: { value: "123 Example Lane" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Just exploring" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Not sure" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.change(screen.getByLabelText("Full name (required)"), { target: { value: "Draft Visitor" } });
    fireEvent.change(screen.getByLabelText("Email (required)"), { target: { value: "draft@example.invalid" } });
    fireEvent.change(screen.getByLabelText("Anything else we should know?"), { target: { value: "Keep this question while I read the policy." } });
    fireEvent.click(screen.getByRole("checkbox"));

    const form = screen.getByTestId("opportunity-intake-form");
    const policy = screen.getByRole("link", { name: /Privacy Policy/ });
    expect(policy).toHaveAttribute("href", "/privacy");
    expect(policy).toHaveAttribute("target", "_blank");
    expect((policy.getAttribute("rel") ?? "").split(/\s+/)).toContain("noopener");
    expect(policy).toHaveAccessibleName("Privacy Policy (opens in a new tab)");
    expect(policy).toHaveTextContent("Privacy Policy (opens in a new tab)");

    fireEvent.click(policy);

    expect(screen.getByTestId("opportunity-intake-form")).toBe(form);
    expect(screen.getByLabelText("Full name (required)")).toHaveValue("Draft Visitor");
    expect(screen.getByLabelText("Email (required)")).toHaveValue("draft@example.invalid");
    expect(screen.getByLabelText("Anything else we should know?")).toHaveValue("Keep this question while I read the policy.");
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(apiRequestMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Return to Property" }));
    expect(screen.getByLabelText("Property address")).toHaveValue("123 Example Lane");
    expect(apiRequestMock).not.toHaveBeenCalled();
  });
});
