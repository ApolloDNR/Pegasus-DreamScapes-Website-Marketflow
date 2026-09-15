import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import VendorNetwork from "@/pages/vendor-network";

const { apiRequestMock } = vi.hoisted(() => ({ apiRequestMock: vi.fn() }));

vi.mock("@/lib/queryClient", () => ({ apiRequest: apiRequestMock }));
vi.mock("@/hooks/use-seo", () => ({ useSEO: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/components/animations", () => ({
  ScrollReveal: ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
    <div className={className}>{children}</div>
  ),
}));

class NoopIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  globalThis.IntersectionObserver = NoopIntersectionObserver as unknown as typeof IntersectionObserver;
  apiRequestMock.mockImplementation(() => new Promise(() => undefined));
});

afterEach(() => {
  cleanup();
  apiRequestMock.mockReset();
});

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <VendorNetwork />
    </QueryClientProvider>,
  );
}

function fillRequiredFields() {
  for (const [label, value] of [
    ["Full Name", "Ada Lovelace"],
    ["Company", "Analytical Engines LLC"],
    ["Email", "ada@example.com"],
    ["Phone", "925-555-0100"],
    ["Trade / Specialty", "General contractor"],
    ["Service Area", "Alameda County"],
    ["Insurance Status", "Current GL; details available"],
    ["Typical Project Size", "$100k-$500k"],
    ["Current Availability", "Next quarter"],
  ] as const) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
}

describe("Vendor Network consent contract", () => {
  it("owns the only formal operator application at the stable vendor-form anchor", () => {
    const { container } = renderPage();
    const formalIntake = container.querySelector<HTMLElement>("#vendor-form");

    expect(formalIntake).not.toBeNull();
    expect(formalIntake).toHaveTextContent(/only formal application of record/i);
    expect(
      within(formalIntake as HTMLElement).getByRole("button", { name: /submit application/i }),
    ).toBeInTheDocument();
  });

  it("requires contact/privacy agreement before creating a vendor lead", async () => {
    renderPage();
    fillRequiredFields();

    fireEvent.click(screen.getByTestId("button-vendor-submit"));

    await waitFor(() => {
      expect(screen.getByText(/agree before submitting/i)).toBeInTheDocument();
    });
    expect(apiRequestMock).not.toHaveBeenCalled();
  });

  it("requires authority before sending third-party reference details", async () => {
    renderPage();
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText("References (optional)"), {
      target: { value: "Client contact: reference@example.com" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /may contact me/i }));
    fireEvent.click(screen.getByTestId("button-vendor-submit"));

    await waitFor(() => {
      expect(screen.getByText(/authorized to share reference information/i)).toBeInTheDocument();
    });
    expect(apiRequestMock).not.toHaveBeenCalled();
  });

  it("persists explicit consent and authority facts in the vendor request", async () => {
    renderPage();
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText("References (optional)"), {
      target: { value: "Reference available with permission" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /may contact me/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /authorized to share/i }));
    fireEvent.click(screen.getByTestId("button-vendor-submit"));

    await waitFor(() => expect(apiRequestMock).toHaveBeenCalledTimes(1));
    expect(apiRequestMock).toHaveBeenCalledWith(
      "POST",
      "/api/leads",
      expect.objectContaining({
        leadType: "vendor",
        consentContact: true,
        consentCcpaAcknowledged: true,
        leadData: expect.objectContaining({ referenceAuthorization: true }),
      }),
    );
  });
});
