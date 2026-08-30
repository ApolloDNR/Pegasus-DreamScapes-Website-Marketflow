import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import ConnectPage from "@/pages/connect";
import SubmitPropertyPage from "@/pages/submit-property";
import { CategoryPage } from "@/pegasus/category-page";
import { CATEGORIES } from "@/pegasus/data";
import { ContactPage } from "@/pegasus/pages";
import { FAQ_SECTIONS } from "@shared/faq-data";

vi.mock("@/lib/queryClient", () => ({ apiRequest: vi.fn() }));
vi.mock("@/lib/analytics", () => ({
  trackCtaClick: vi.fn(),
  trackEvent: vi.fn(),
}));
vi.mock("@/hooks/use-seo", () => ({ useSEO: vi.fn() }));

function renderPublic(node: React.ReactNode, path = "/") {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  const { hook } = memoryLocation({ path, static: true });

  return render(
    <QueryClientProvider client={client}>
      <Router hook={hook}>{node}</Router>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  window.history.pushState({}, "", "/");
});

afterEach(() => {
  cleanup();
  window.history.pushState({}, "", "/");
});

describe("public business-lane boundaries", () => {
  it("mounts /contact as a general chooser with non-property destinations", () => {
    const { container } = renderPublic(<ContactPage />, "/contact");

    expect(
      screen.getByRole("heading", { name: /the right door, before the wrong conversation/i }),
    ).toBeInTheDocument();
    expect(container.querySelector('a[href="/bring-an-opportunity?intent=property"]')).not.toBeNull();
    expect(container.querySelector('a[href="/work-with-apollo"]')).not.toBeNull();
    expect(container.querySelector('a[href="/buyers"]')).not.toBeNull();
    expect(container.querySelector('a[href="/deal-partners"]')).not.toBeNull();
    expect(container.querySelector('a[href="/vendor-network"]')).not.toBeNull();
    expect(container.querySelector('a[href="mailto:apollo@pegasusdreamscapes.com"]')).not.toBeNull();
    expect(screen.queryByText(/share a property situation/i)).not.toBeInTheDocument();
  });

  it("makes the Capital entry relationship-only and removes informal source-protection assurances", () => {
    renderPublic(<ConnectPage />, "/connect");

    const capitalLane = screen.getByTestId("link-connect-capital");
    expect(capitalLane).toHaveAttribute("href", "/capital");
    expect(capitalLane).toHaveTextContent(/existing relationship or personal introduction/i);
    expect(capitalLane).toHaveTextContent(/not a general application/i);

    const dealLane = screen.getByTestId("link-connect-deal-finder");
    fireEvent.focus(dealLane);
    const activeLane = screen.getByTestId("connect-active-lane");
    expect(activeLane).toHaveTextContent(/separate signed terms/i);
    expect(activeLane).toHaveTextContent(/does not create.*non-circumvention/i);
    expect(activeLane).not.toHaveTextContent(/protect the source|taking someone'?s lead around/i);
  });

  it("routes the three Buyers lanes to representation, investor intake, and pilot access", () => {
    const { container } = renderPublic(
      <CategoryPage cat={CATEGORIES.buyers} go={vi.fn()} openPeggy={vi.fn()} />,
      "/buyers",
    );

    expect(screen.getAllByText("Possible buyer representation").length).toBeGreaterThan(0);
    expect(screen.getByText("Investor buyer request")).toBeInTheDocument();
    expect(screen.getByText("MarketFlow controlled pilot")).toBeInTheDocument();
    expect(container.querySelector('a[href="/work-with-apollo"]')).not.toBeNull();
    expect(
      container.querySelector('a[href="/bring-an-opportunity?intent=buyer"]'),
    ).not.toBeNull();
    expect(container.querySelector('a[href="/marketflow/access"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: /submit investor interest/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /get on the buyer list/i })).not.toBeInTheDocument();
  });

  it.each([
    [
      "partnership",
      /an existing capital relationship or personal introduction/i,
      /use this only if Apollo already knows you or someone personally introduced you/i,
    ],
    [
      "buyer",
      /an investor-interest request/i,
      /not a request for licensed representation or MarketFlow access/i,
    ],
  ])("preselects the bounded %s intake", (intent, label, description) => {
    window.history.pushState({}, "", `/bring-an-opportunity?intent=${intent}`);
    renderPublic(<SubmitPropertyPage />, `/bring-an-opportunity?intent=${intent}`);

    fireEvent.click(screen.getByRole("button", { name: "Return to Bringing" }));
    const choice = screen.getByRole("button", { name: new RegExp(`${label.source}.*${description.source}`, "i") });
    expect(choice).toHaveAttribute("aria-pressed", "true");
  });

  it("describes Buyboxes as controlled-pilot interest, not public profiles or signup", () => {
    const section = FAQ_SECTIONS.find(({ eyebrow }) => eyebrow === "Buyboxes");
    expect(section).toBeDefined();

    const copy = section!.items.map(({ q, a }) => `${q} ${a}`).join(" ");
    expect(copy).toMatch(/controlled-pilot interest only/i);
    expect(copy).toMatch(/does not publish public buyer profiles/i);
    expect(copy).toMatch(/does not.*public signup/i);
    expect(copy).toMatch(/no reviewed live inventory is published/i);
    expect(copy).not.toMatch(/if i sign up/i);
  });
});
