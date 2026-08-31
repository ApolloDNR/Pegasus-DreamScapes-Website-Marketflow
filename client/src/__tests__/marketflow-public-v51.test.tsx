import React from "react";
import { readFileSync } from "node:fs";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { PremiumMarketFlow } from "@/pegasus/marketflow-experience";

function renderMarketFlow() {
  const memory = memoryLocation({ path: "/marketflow", record: true });
  const go = vi.fn();
  render(
    <Router hook={memory.hook}>
      <PremiumMarketFlow go={go} />
    </Router>,
  );

  return { go, history: memory.history as string[] };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("mounted MarketFlow public shell", () => {
  it("keeps the standalone access error readable in dark theme", () => {
    const css = readFileSync("client/src/index.css", "utf8");
    expect(css).toMatch(
      /\.dark \.mf-access-error\s*\{[\s\S]*?color:\s*hsl\(var\(--destructive-foreground\)\)/,
    );
  });

  it("ships a truthful controlled-pilot surface without a fictional sample record", () => {
    renderMarketFlow();

    expect(screen.getByText("Controlled private pilot")).toBeInTheDocument();
    expect(screen.getByText(/No live opportunities or inventory/i)).toBeInTheDocument();
    expect(screen.getByText(/not a securities or investment platform/i)).toBeInTheDocument();
    expect(screen.getByText(/no securities are offered/i)).toBeInTheDocument();

    const anatomy = screen.getByRole("list", {
      name: "Fields in a possible authorized MarketFlow record",
    });
    for (const label of [
      "Property context",
      "Source authority",
      "Review basis",
      "Current permission",
      "Intended recipient",
      "Written terms",
    ]) {
      expect(within(anatomy).getByText(label)).toBeInTheDocument();
    }

    expect(screen.queryByText("Illustrative opportunity record")).not.toBeInTheDocument();
    expect(screen.queryByText("MF · 0007")).not.toBeInTheDocument();
    expect(screen.queryByText("Fictionalized product preview")).not.toBeInTheDocument();
    expect(screen.queryByText("East Bay value-add residence")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("MarketFlow operating principles")).not.toBeInTheDocument();
  });

  it.each([
    ["Deal source", "source", "Bring a real opportunity once."],
    ["Buyer", "buyer", "Define the buyer mandate."],
    ["Capital", "capital", "State a mandate, not a promise."],
    ["Operator", "operator", "State the specialty and capacity."],
  ])("routes the %s relationship to its exact reviewed-access handoff", async (label, role, title) => {
    const user = userEvent.setup({ delay: null });
    const { history } = renderMarketFlow();
    const group = screen.getByRole("group", { name: "MarketFlow relationship roles" });
    const choice = within(group).getByRole("button", { name: label });

    await user.click(choice);
    expect(choice).toHaveAttribute("aria-pressed", "true");
    const panel = document.getElementById("marketflow-role-panel")!;
    expect(panel).toHaveAttribute("aria-live", "polite");
    expect(within(panel).getByRole("heading", { name: title })).toBeInTheDocument();

    await user.click(within(panel).getByRole("button", { name: /request access in this role/i }));
    expect(history.at(-1)).toBe(`/marketflow/access?role=${role}`);
  });

  it("keeps the generic access, public criteria, and Strategy Lab routes exact", async () => {
    const user = userEvent.setup({ delay: null });
    const { history, go } = renderMarketFlow();

    await user.click(screen.getByRole("button", { name: "Request pilot access" }));
    expect(history.at(-1)).toBe("/marketflow/access");

    await user.click(screen.getByRole("button", { name: "Read public criteria" }));
    expect(history.at(-1)).toBe("/marketflow/buyboxes");

    await user.click(screen.getByRole("button", { name: "Start in Strategy Lab" }));
    expect(go).toHaveBeenCalledWith("strategylab");
  });
});
