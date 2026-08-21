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

function renderWithQueryClient(
  ui: React.ReactElement,
  { path = "/", search = "" }: { path?: string; search?: string } = {},
) {
  const { hook } = memoryLocation({ path, static: true });
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <Router hook={hook} searchHook={() => search}>
        {ui}
      </Router>
    </QueryClientProvider>,
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

function consentAndSubmitMarketflowAccess() {
  fireEvent.click(screen.getByTestId("checkbox-access-consent"));
  fireEvent.click(screen.getByTestId("button-access-submit"));
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
  it.each([
    ["?role=source", "Deal finder / wholesaler"],
    ["?role=buyer", "Cash buyer"],
    ["?role=capital", "Capital partner"],
    ["?role=operator", "Operator / builder"],
  ])("prefills the public relationship handoff for %s", (search, label) => {
    renderWithQueryClient(<MarketflowAccessPage />, {
      path: "/marketflow/access",
      search,
    });

    expect(screen.getByTestId("select-access-role")).toHaveTextContent(label);
  });

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

  it("binds a hidden honeypot and rejects a filled bot field", async () => {
    let now = 80_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    const { container } = renderWithQueryClient(<MarketflowAccessPage />);
    const honeypot = container.querySelector<HTMLInputElement>(
      'input[name="hp_company"]',
    );

    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot?.closest("[aria-hidden='true']")).not.toBeNull();

    fireEvent.change(honeypot!, { target: { value: "spam incorporated" } });
    fillMarketflowAccessForm();
    now = 85_000;
    consentAndSubmitMarketflowAccess();

    await waitFor(() => expect(apiRequestMock).not.toHaveBeenCalled());
  });

  it("rejects a submit before three seconds with a durable inline alert", async () => {
    let now = 90_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    renderWithQueryClient(<MarketflowAccessPage />);
    fillMarketflowAccessForm();
    now = 92_500;
    consentAndSubmitMarketflowAccess();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Please spend a little more time");
    expect(apiRequestMock).not.toHaveBeenCalled();
  });

  it("announces a pending manual review and prevents duplicate submission", async () => {
    let now = 100_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    renderWithQueryClient(<MarketflowAccessPage />);
    fillMarketflowAccessForm();
    now = 105_000;
    consentAndSubmitMarketflowAccess();

    const pending = await screen.findByRole("button", {
      name: /sending for manual review/i,
    });
    expect(pending).toBeDisabled();
    expect(pending).toHaveAttribute("aria-busy", "true");
    fireEvent.click(pending);
    expect(apiRequestMock).toHaveBeenCalledTimes(1);
  });

  it("renders an inline API failure and succeeds on explicit retry", async () => {
    let now = 110_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    apiRequestMock
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ ok: true });
    renderWithQueryClient(<MarketflowAccessPage />);
    fillMarketflowAccessForm();
    now = 115_000;
    consentAndSubmitMarketflowAccess();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("We could not send your request");
    const retry = screen.getByRole("button", { name: /try sending again/i });
    fireEvent.click(retry);

    expect(await screen.findByTestId("success-view-marketflow_access")).toBeInTheDocument();
    expect(apiRequestMock).toHaveBeenCalledTimes(2);
  });

  it("renders the MarketFlow-specific manual-review success and fully resets", async () => {
    let now = 120_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    apiRequestMock.mockResolvedValueOnce({ ok: true });
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      value: vi.fn(),
    });
    const { container } = renderWithQueryClient(<MarketflowAccessPage />);
    fillMarketflowAccessForm();
    now = 125_000;
    consentAndSubmitMarketflowAccess();

    const success = await screen.findByTestId("success-view-marketflow_access");
    expect(success).toHaveAttribute("role", "status");
    expect(success).toHaveAttribute("aria-live", "polite");
    expect(success).toHaveFocus();
    expect(success).toHaveTextContent("Request logged");
    expect(success).toHaveTextContent("Introduction reviewed");
    expect(success).toHaveTextContent("Role and network fit reviewed");
    expect(success).toHaveTextContent("Direct response");
    expect(success).not.toHaveTextContent(/Acquisitions|comps|48 hours|invite link|onboarding call/i);

    fireEvent.click(screen.getByTestId("button-success-add-another-marketflow_access"));
    expect(await screen.findByTestId("input-access-name")).toHaveValue("");
    expect(screen.getByTestId("checkbox-access-consent")).toHaveAttribute(
      "data-state",
      "unchecked",
    );
    expect(
      container.querySelector<HTMLInputElement>('input[name="hp_company"]'),
    ).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
