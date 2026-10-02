import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Route, Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { getQueryFn } from "@/lib/queryClient";
import SnapshotProperty from "@/pages/snapshot-property";
import SnapshotCalc from "@/pages/snapshot-calc";

vi.mock("@/hooks/use-seo", () => ({ useSEO: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ getSupabaseSync: () => null }));

const fetchMock = vi.fn();
const clients: QueryClient[] = [];
const outputContext = {
  source: "user_entered_inputs_and_automated_model",
  verifiedByPegasus: false,
  label: "Generated from user-entered, unverified inputs.",
  disclaimer: "This shared output does not represent a Pegasus review.",
};

const surfaces = [
  {
    name: "property",
    Page: SnapshotProperty,
    unavailableLink: "This share link has expired or was retracted.",
    payload: { visibility: "summary", address: "Property response", outputContext },
    heading: "Property response",
  },
  {
    name: "calc",
    Page: SnapshotCalc,
    unavailableLink: "This share link is no longer active. The owner may have removed it.",
    payload: {
      name: "Calculator response",
      calculatorType: "arv",
      inputs: {},
      results: {},
      outputContext,
    },
    heading: "Calculator response",
  },
];

function renderSnapshot(name: string, Page: React.ComponentType) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { queryFn: getQueryFn({ on401: "throw" }), retry: false },
    },
  });
  clients.push(client);
  const memory = memoryLocation({ path: `/snapshot/${name}/shared-token` });
  render(
    <QueryClientProvider client={client}>
      <Router hook={memory.hook}>
        <Route path={`/snapshot/${name}/:token`}>
          <Page />
        </Route>
      </Router>
    </QueryClientProvider>,
  );
}

beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  cleanup();
  clients.splice(0).forEach((client) => client.clear());
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe.each(surfaces)("$name snapshot response truth", ({ name, Page, unavailableLink, payload, heading }) => {
  it("preserves the inactive-link message for a confirmed HTTP 404", async () => {
    fetchMock.mockResolvedValueOnce(new Response("Not found", { status: 404 }));
    renderSnapshot(name, Page);

    expect(await screen.findByText(unavailableLink)).toBeInTheDocument();
    expect(screen.queryByText("This snapshot is temporarily unavailable.")).not.toBeInTheDocument();
  });

  it.each([400, 401, 403, 500, 503])("does not declare the link inactive for HTTP %s", async (status) => {
    fetchMock.mockResolvedValueOnce(new Response("Unable to verify snapshot", { status }));
    renderSnapshot(name, Page);

    expect(await screen.findByRole("heading", { name: "This snapshot is temporarily unavailable." })).toBeInTheDocument();
    expect(screen.queryByText(unavailableLink)).not.toBeInTheDocument();
    expect(screen.queryByText("Snapshot not found")).not.toBeInTheDocument();
  });

  it("does not declare the link inactive after a network failure", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    renderSnapshot(name, Page);

    expect(await screen.findByRole("heading", { name: "This snapshot is temporarily unavailable." })).toBeInTheDocument();
    expect(screen.queryByText(unavailableLink)).not.toBeInTheDocument();
  });

  it("keeps rendering a successful snapshot response", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    renderSnapshot(name, Page);

    expect(await screen.findByRole("heading", { name: heading })).toBeInTheDocument();
    expect(screen.getByText(outputContext.label)).toBeInTheDocument();
  });
});
