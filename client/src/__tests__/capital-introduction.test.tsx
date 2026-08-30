import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CapitalPage } from "@/pegasus/capital-page";

const { apiRequestMock } = vi.hoisted(() => ({
  apiRequestMock: vi.fn(),
}));

vi.mock("@/lib/queryClient", () => ({ apiRequest: apiRequestMock }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-seo", () => ({ useSEO: vi.fn() }));

function renderPage() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <CapitalPage go={vi.fn()} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  apiRequestMock.mockImplementation(() => new Promise(() => undefined));
});

afterEach(() => {
  cleanup();
  apiRequestMock.mockReset();
  vi.restoreAllMocks();
});

describe("capital relationship introduction", () => {
  it("provides a real anchored introduction form without fundraising inputs", () => {
    const { container } = renderPage();
    const section = container.querySelector("#capital-introduction");

    expect(section).not.toBeNull();
    expect(screen.getByLabelText("Who introduced you?")).toBeRequired();
    expect(screen.getByLabelText("Relationship context")).toBeRequired();
    expect(screen.getByRole("button", { name: /send relationship context/i })).toBeInTheDocument();
    expect(section).not.toHaveTextContent(/capital range|allocation|accredited|projected return|invest now/i);

    const scrollIntoView = vi.fn();
    section!.scrollIntoView = scrollIntoView;
    fireEvent.click(screen.getByRole("button", { name: /continue an introduction/i }));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
  });

  it("submits explicit contact consent and relationship context through the gated lead intake", async () => {
    let now = 100_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    renderPage();

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Morgan Partner" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "morgan@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Who introduced you?"), {
      target: { value: "Introduced by Jordan Lee" },
    });
    fireEvent.change(screen.getByLabelText("Relationship context"), {
      target: { value: "Apollo and I met through an East Bay operator." },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    now = 104_500;
    fireEvent.submit(screen.getByRole("button", { name: /send relationship context/i }).closest("form")!);

    await waitFor(() => expect(apiRequestMock).toHaveBeenCalledTimes(1));
    expect(apiRequestMock).toHaveBeenCalledWith(
      "POST",
      "/api/leads",
      expect.objectContaining({
        leadType: "submit",
        consentContact: true,
        leadData: expect.objectContaining({
          lane: "investor",
          intent: "capital-introduction",
          context: "Introduced by Jordan Lee",
          contextKind: "context",
          message: "Apollo and I met through an East Bay operator.",
        }),
      }),
    );
  });
});
