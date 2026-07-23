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

import MarketflowAccessPage from "@/pages/marketflow-access";
import { CONTACT_FORM, LeadForm } from "@/pegasus/forms";

const { apiRequestMock, toastMock } = vi.hoisted(() => ({
  apiRequestMock: vi.fn(),
  toastMock: vi.fn(),
}));

vi.mock("@/lib/queryClient", () => ({
  apiRequest: apiRequestMock,
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

vi.mock("@/hooks/use-seo", () => ({
  useSEO: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}));

class NoopResizeObserver implements ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = NoopResizeObserver;
}

function renderWithQueryClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

function fillPegasusLeadForm() {
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Ada Lovelace" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "ada@example.com" },
  });
}

function fillMarketflowAccessForm() {
  fireEvent.change(screen.getByTestId("input-access-name"), {
    target: { value: "Grace Hopper" },
  });
  fireEvent.change(screen.getByTestId("input-access-email"), {
    target: { value: "grace@example.com" },
  });
  fireEvent.change(screen.getByTestId("input-access-introduced-by"), {
    target: { value: "Apollo Rivera" },
  });
  fireEvent.change(screen.getByTestId("textarea-access-notes"), {
    target: { value: "East Bay operator" },
  });
}

beforeEach(() => {
  // Keep successful mutations pending: each assertion can inspect the request
  // without transitioning either form into its post-submit success screen.
  apiRequestMock.mockImplementation(() => new Promise(() => undefined));
});

afterEach(() => {
  cleanup();
  apiRequestMock.mockReset();
  toastMock.mockReset();
  vi.restoreAllMocks();
});

describe("Pegasus LeadForm explicit contact consent", () => {
  it("does not create a lead when contact consent is unchecked", () => {
    renderWithQueryClient(<LeadForm cfg={CONTACT_FORM} />);
    fillPegasusLeadForm();

    const consent = screen.getByRole("checkbox");
    expect(consent).toBeRequired();
    expect(consent).not.toBeChecked();

    const submit = screen.getByRole("button", {
      name: /request my review/i,
    });
    fireEvent.submit(submit.closest("form")!);

    expect(apiRequestMock).not.toHaveBeenCalled();
  });

  it("sends affirmative consent, its policy version, and anti-spam fields", async () => {
    let now = 10_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);

    const { container } = renderWithQueryClient(
      <LeadForm cfg={CONTACT_FORM} />,
    );
    fillPegasusLeadForm();
    fireEvent.click(screen.getByRole("checkbox"));
    now = 14_500;

    const submit = screen.getByRole("button", {
      name: /request my review/i,
    });
    fireEvent.submit(submit.closest("form")!);

    await waitFor(() => expect(apiRequestMock).toHaveBeenCalledTimes(1));
    const [method, path, payload] = apiRequestMock.mock.calls[0] as [
      string,
      string,
      Record<string, any>,
    ];

    expect(method).toBe("POST");
    expect(path).toBe("/api/leads");
    expect(payload).toEqual(
      expect.objectContaining({
        leadType: "submit",
        source: "form",
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        consentContact: true,
        consentVersion: "pegasus-followup-contact-v1",
        hp_company: "",
        ts_elapsed_ms: 4_500,
        leadData: expect.objectContaining({
          lane: CONTACT_FORM.role,
          intent: CONTACT_FORM.intent,
          consentContact: true,
          hp_company: "",
          ts_elapsed_ms: 4_500,
        }),
      }),
    );
    expect(
      container.querySelector<HTMLInputElement>('input[name="hp_company"]'),
    ).toHaveValue("");
  });
});

describe("MarketFlow access explicit contact consent", () => {
  it("shows the consent error and does not request access while unchecked", async () => {
    renderWithQueryClient(<MarketflowAccessPage />);
    fillMarketflowAccessForm();

    expect(screen.getByTestId("checkbox-access-consent")).toHaveAttribute(
      "data-state",
      "unchecked",
    );
    fireEvent.click(screen.getByTestId("button-access-submit"));

    expect(
      await screen.findByText("Required to request access"),
    ).toBeInTheDocument();
    expect(apiRequestMock).not.toHaveBeenCalled();
  });

  it("sends the selected role, introducer, consent version, and anti-spam timing", async () => {
    let now = 50_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);

    renderWithQueryClient(<MarketflowAccessPage />);
    fillMarketflowAccessForm();
    expect(screen.getByTestId("select-access-role")).toHaveTextContent(
      "Operator / builder",
    );
    fireEvent.click(screen.getByTestId("checkbox-access-consent"));
    now = 55_000;
    fireEvent.click(screen.getByTestId("button-access-submit"));

    await waitFor(() => expect(apiRequestMock).toHaveBeenCalledTimes(1));
    const [method, path, payload] = apiRequestMock.mock.calls[0] as [
      string,
      string,
      Record<string, any>,
    ];

    expect(method).toBe("POST");
    expect(path).toBe("/api/leads");
    expect(payload).toEqual(
      expect.objectContaining({
        leadType: "marketflow_access",
        source: "marketflow_access_page",
        firstName: "Grace",
        lastName: "Hopper",
        email: "grace@example.com",
        consentContact: true,
        consentVersion: "marketflow-access-contact-v1",
        leadData: expect.objectContaining({
          role: "operator",
          introducedBy: "Apollo Rivera",
          notes: "East Bay operator",
          consentContact: true,
          hp_company: "",
          ts_mounted_at: 50_000,
          ts_elapsed_ms: 5_000,
        }),
      }),
    );
  });
});
