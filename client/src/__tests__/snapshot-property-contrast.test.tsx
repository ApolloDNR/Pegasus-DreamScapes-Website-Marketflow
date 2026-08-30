import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import SnapshotPropertyPage from "@/pages/snapshot-property";

vi.mock("@/hooks/use-seo", () => ({ useSEO: vi.fn() }));

const TOKEN = "rendered-qa-property";

const renderedQaSnapshot = {
  id: 84,
  visibility: "full" as const,
  address: "200 Model Avenue",
  city: "Oakland",
  state: "CA",
  zip: "94601",
  propertyInput: {
    address: "200 Model Avenue",
    askingPrice: 500_000,
    arvEstimate: 700_000,
    rehabBudget: 90_000,
    marketRent: 3_200,
    beds: 3,
    baths: 2,
    sqft: 1_400,
  },
  snapshot: {
    engineVersion: "rendered-qa-v1",
    topLane: "flip",
    lanes: [
      {
        lane: "flip",
        laneLabel: "Fix and Flip",
        headline: "The automated model identifies a possible value-add path.",
        verdict: "possible",
        verdictLabel: "Possible fit",
        economics: {
          primaryMetric: "Modeled gross spread",
          primaryValue: "$110K",
        },
      },
    ],
    totalCashIn: 215_000,
    risks: [
      {
        category: "valuation",
        severity: "watch",
        title: "Entered ARV requires independent verification",
        detail: "The entered after-repair value has not been independently verified.",
      },
    ],
    capitalStack: [
      {
        source: "down_payment",
        label: "Modeled cash contribution",
        amount: 125_000,
        note: "Illustrative assumption only",
      },
    ],
    memo: {
      paragraph: "This automated summary reflects the supplied assumptions.",
      nextStep: "Independently verify the property facts and financing assumptions.",
    },
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  outputContext: {
    source: "user_entered_inputs_and_automated_model" as const,
    verifiedByPegasus: false as const,
    label: "Generated from user-entered, unverified inputs.",
    disclaimer: "This shared output does not represent a Pegasus review.",
  },
};

function renderSnapshot() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
    },
  });
  client.setQueryData(
    ["/api/property-analyses/by-token", TOKEN],
    renderedQaSnapshot,
  );
  const memory = memoryLocation({ path: `/snapshot/property/${TOKEN}` });

  return render(
    <QueryClientProvider client={client}>
      <Router hook={memory.hook}>
        <Route path="/snapshot/property/:token">
          <SnapshotPropertyPage />
        </Route>
      </Router>
    </QueryClientProvider>,
  );
}

function expectAdaptiveBodyAccent(element: HTMLElement) {
  const colorOwner = [element, element.parentElement].find(
    (candidate) =>
      candidate?.classList.contains("text-[#965025]") &&
      candidate.classList.contains("dark:text-[#D89A63]"),
  );

  expect(colorOwner).toBeDefined();
}

afterEach(() => cleanup());

describe("property snapshot theme contrast", () => {
  it("keeps light editorial cards on adaptive card foreground and background tokens", () => {
    renderSnapshot();

    for (const testId of ["snapshot-output-context", "section-cta"]) {
      expect(screen.getByTestId(testId)).toHaveClass(
        "bg-card",
        "text-card-foreground",
      );
    }
  });

  it("uses a dark-surface accent in the hero and a theme-adaptive accent in the body", () => {
    renderSnapshot();

    for (const label of [
      /Property Strategy Snapshot/,
      "Modeled path · based on user-entered inputs",
      /Automated model fit/,
      /Model estimate · Modeled gross spread/,
    ]) {
      expect(screen.getByText(label)).toHaveClass("text-[#D89A63]");
    }

    for (const label of [
      "Automated output · not independently verified",
      "Section 01",
      "Section 02",
      "Section 03",
      "Section 04",
      "watch",
      "Model consideration",
      "Add private context",
      "Disclosure",
    ]) {
      expectAdaptiveBodyAccent(screen.getByText(label));
    }
  });

  it("keeps the primary action readable against its accent in either theme", () => {
    renderSnapshot();

    expect(screen.getByTestId("link-submit-property")).toHaveClass(
      "bg-[#965025]",
      "text-white",
      "dark:bg-[#D89A63]",
      "dark:text-[#17233A]",
    );
  });
});
