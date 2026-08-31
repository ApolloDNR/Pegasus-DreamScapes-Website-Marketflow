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
      "Complex real estate, structured clearly.",
    );
    expect(
      Array.from(arrival!.querySelectorAll(".hv-eyebrow-row .hv-eyebrow > span"), (item) =>
        item.textContent?.replace(/\s+/g, " ").trim(),
      ),
    ).toEqual(["Real estate strategy company", "Contra Costa & Alameda"]);
    expect(
      Array.from(arrival!.querySelectorAll(".hv-cta-row > a, .hv-cta-row > button"), (item) =>
        item.textContent?.replace(/\s+/g, " ").trim(),
      ),
    ).toEqual(["Bring an Opportunity", "See How We Operate", "Open Strategy Lab"]);
    expect(arrival!.querySelector(".hv-lead")).toBeNull();
    expect(arrival!.textContent).not.toContain("originates, structures, and operates opportunities");
    expect(container.querySelector("[data-hv].hv-grain")).toBeNull();
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
    const rail = container.querySelector<HTMLElement>(".hv-hero-facts");
    expect(rail).toBeTruthy();
    expect(
      Array.from(
        rail!.querySelectorAll(":scope > li .hv-fact-k"),
        (item) => item.textContent?.replace(/\s+/g, " ").trim(),
      ),
    ).toEqual(["Founder-led", "Nelson Drive", "East Bay", "Strategy first"]);
    expect(Array.from(rail!.querySelectorAll(".hv-fact-ic svg"))).toHaveLength(4);
    for (const icon of Array.from(rail!.querySelectorAll(".hv-fact-ic svg"))) {
      expect(icon.classList.contains("lucide")).toBe(true);
    }
  });

  it("keeps all four visitor paths as an unnumbered editorial rail with real routing", () => {
    const { container, go } = renderHome();
    const router = container.querySelector<HTMLElement>('[data-hv="router"]');
    expect(router).toBeTruthy();
    const routeButtons = within(router!).getAllByRole("button").filter((button) =>
      button.classList.contains("hv-route"),
    );

    expect(routeButtons.map((button) => button.querySelector(".hv-route-title")?.textContent)).toEqual([
      "A property I own",
      "A deal I found",
      "A project I'm operating",
      "A relationship or specialty",
    ]);
    expect(router!.querySelector(".hv-route-num")).toBeNull();
    expect(router!.querySelector(".hv-route-action")).toBeNull();
    expect(routeButtons.some((button) => /^0\d/.test(button.textContent?.trim() ?? ""))).toBe(false);

    for (const button of routeButtons) fireEvent.click(button);
    expect(go.mock.calls.map(([route]) => route)).toEqual([
      "sellers",
      "dealfinders",
      "operators",
      "referral",
    ]);
  });

  it("shows Nelson through two real images and a transparent, caveated fact stack", () => {
    const { container, go } = renderHome();
    const proof = container.querySelector<HTMLElement>('[data-hv="proof"]');
    expect(proof).toBeTruthy();
    expect(within(proof!).getAllByRole("img")).toHaveLength(2);

    const copy = proof!.textContent?.replace(/\s+/g, " ") ?? "";
    for (const fact of [
      "Documented basis. Documented sale.",
      "$600,000",
      "$105,000",
      "$705,000",
      "$840,000",
      "$135K gross spread",
      "not net profit",
      "does not identify every contractor",
    ]) {
      expect(copy).toContain(fact);
    }

    fireEvent.click(within(proof!).getByRole("button", { name: /See the full project/i }));
    expect(go).toHaveBeenCalledWith("ourwork");
  });

  it("presents only the five approved method stages as an open editorial sequence", () => {
    const { container } = renderHome();
    const method = container.querySelector<HTMLElement>('[data-hv="method"]');
    expect(method).toBeTruthy();
    const stages = within(method!).getAllByRole("listitem");

    expect(stages.map((stage) => within(stage).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "Originate",
      "Structure",
      "Operate",
      "Realize",
      "Learn",
    ]);
    expect(method!.querySelector(".hv-step-num")).toBeNull();
    expect(method!.querySelector(".hv-departments")).toBeNull();
    expect(stages.some((stage) => /^0\d/.test(stage.textContent?.trim() ?? ""))).toBe(false);
  });

  it("keeps the Opportunity Plan as the one complete, toggleable homepage tool", () => {
    const { container } = renderHome();
    const plan = container.querySelector<HTMLElement>('[data-hv="plan"]');
    expect(plan).toBeTruthy();
    const labels = [
      "Control",
      "Underwriting",
      "Buyer",
      "Capital",
      "Development",
      "Local context",
      "Disposition",
      "Asset operations",
    ];
    const toggles = labels.map((label) => within(plan!).getByRole("button", { name: label }));
    expect(toggles).toHaveLength(8);
    fireEvent.click(toggles[1]);
    expect(toggles[1]).toHaveAttribute("aria-pressed", "true");
    expect(within(plan!).getByText(/Organize supplied assumptions/i)).toBeInTheDocument();
    expect(plan!.textContent).toContain("A route is not a commitment to participate in any deal.");
  });

  it("closes with verified founder accountability and the frozen Strategy Lab action", () => {
    const { container, go } = renderHome();
    const partner = container.querySelector<HTMLElement>('[data-hv="partner"]');
    const founder = container.querySelector<HTMLElement>('[data-hv="founder"]');
    const final = container.querySelector<HTMLElement>('[data-hv="final"]');
    expect(partner).toBeTruthy();
    expect(founder).toBeTruthy();
    expect(final).toBeTruthy();

    expect(within(partner!).getAllByRole("term").map((term) => term.textContent)).toEqual([
      "Deal finder",
      "Specialty GP",
      "Property owner",
      "Capital relationship",
      "Contractor or specialist",
    ]);
    expect(partner!.querySelector(".hv-relationship-num")).toBeNull();
    expect(
      within(partner!).getAllByRole("term").some((term) => /^0\d/.test(term.textContent?.trim() ?? "")),
    ).toBe(false);

    const founderCopy = founder!.textContent?.replace(/\s+/g, " ") ?? "";
    expect(founderCopy).toContain("Founder, Pegasus DreamScapes");
    expect(founderCopy).toContain("Duran Ramirez, Paolo Ariel");
    expect(founderCopy).toContain("BMP Realty Inc DBA Keller Williams Realty-East Bay");
    expect(founderCopy).toContain("CA DRE #02333658");
    expect(founderCopy).toContain("public Nelson record does not identify who provided brokerage representation");
    expect(founderCopy).not.toContain("sourced the deal");
    expect(within(founder!).getByRole("img")).toHaveAttribute("loading", "lazy");

    expect(within(final!).getByRole("heading", { level: 2 })).toHaveTextContent(
      "Bring the property, the contract, the project, or the plan.",
    );
    fireEvent.click(within(final!).getByRole("button", { name: "Open Strategy Lab" }));
    expect(go).toHaveBeenCalledWith("strategylab");
  });
});
