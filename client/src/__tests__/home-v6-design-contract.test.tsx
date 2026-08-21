import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, within } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { HomePageV51 } from "@/pegasus/home-v51";

const noop = () => {};

afterEach(() => cleanup());

function renderHome() {
  const memory = memoryLocation({ path: "/", record: true });
  const go = vi.fn();
  const result = render(
    <Router hook={memory.hook}>
      <HomePageV51 go={go} openPeggy={noop} />
    </Router>,
  );

  return { ...result, go, history: memory.history as string[] };
}

describe("Pegasus mounted v5.1 homepage design contract", () => {
  it("keeps the approved image, identity, headline, and actions in locked first-viewport order", () => {
    const { container } = renderHome();
    const arrival = container.querySelector<HTMLElement>('[data-hv="arrival"]');
    expect(arrival).toBeTruthy();

    const hero = within(arrival!).getByTestId("approved-home-hero-image");
    expect(hero).toHaveAttribute("src", "/images/hero/pegasus-v6-arrival.webp");
    expect(
      within(arrival!).getByRole("heading", { level: 1 }).textContent?.replace(/\s+/g, " ").trim(),
    ).toBe(
      "Complex real estate, made executable.",
    );
    expect(
      Array.from(arrival!.querySelectorAll(".hv-eyebrow-row .hv-eyebrow > span"), (item) =>
        item.textContent?.replace(/\s+/g, " ").trim(),
      ),
    ).toEqual(["Real estate operating company", "Contra Costa & Alameda"]);
    expect(
      Array.from(arrival!.querySelectorAll(".hv-cta-row > a, .hv-cta-row > button"), (item) =>
        item.textContent?.replace(/\s+/g, " ").trim(),
      ),
    ).toEqual(["Bring an Opportunity", "See How We Operate", "Open Strategy Lab"]);
  });

  it("routes each locked first-viewport action through its real public boundary", () => {
    const { container, go, history } = renderHome();
    const arrival = container.querySelector<HTMLElement>('[data-hv="arrival"]');
    expect(arrival).toBeTruthy();

    const intake = within(arrival!).getByRole("link", { name: /Bring an Opportunity/i });
    expect(intake).toHaveAttribute("href", "/bring-an-opportunity");
    fireEvent.click(intake);
    expect(history.at(-1)).toBe("/bring-an-opportunity");

    fireEvent.click(within(arrival!).getByRole("button", { name: /See How We Operate/i }));
    fireEvent.click(within(arrival!).getByRole("button", { name: /Open Strategy Lab/i }));
    expect(go.mock.calls.map(([route]) => route)).toEqual(["dealstrategy", "strategylab"]);
  });

  it("keeps the proof rail in the locked order", () => {
    const { container } = renderHome();
    expect(
      Array.from(
        container.querySelectorAll('[data-hv="arrival"] .hv-hero-facts > li .hv-fact-k'),
        (item) => item.textContent?.replace(/\s+/g, " ").trim(),
      ),
    ).toEqual(["Founder-led", "Nelson Drive", "East Bay", "Strategy first"]);
  });
});
