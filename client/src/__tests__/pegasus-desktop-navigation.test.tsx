import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { PREMIUM_NAVIGATION } from "@/pegasus/data";
import { NavBar } from "@/pegasus/nav";
import { urlFor } from "@/pegasus/routes";

afterEach(cleanup);

function renderNav() {
  const memory = memoryLocation({ path: "/" });
  render(
    <Router hook={memory.hook}>
      <NavBar
        go={() => undefined}
        route="home"
        theme="dark"
        toggleTheme={() => undefined}
        scrolled
        openPeggy={() => undefined}
      />
    </Router>,
  );
}

describe("Pegasus desktop navigation directory", () => {
  it("exposes every non-primary public destination through one accessible More disclosure", () => {
    renderNav();

    const trigger = screen.getByRole("button", { name: "More" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const directory = document.getElementById("desktop-more-navigation");
    expect(directory).not.toBeNull();
    for (const group of PREMIUM_NAVIGATION.more) {
      expect(within(directory!).getByRole("heading", { name: group.label })).toBeInTheDocument();
      for (const item of group.items) {
        expect(within(directory!).getByRole("link", { name: new RegExp(`^${item.label}`) })).toHaveAttribute(
          "href",
          item.url ?? (item.route ? urlFor(item.route) : ""),
        );
      }
    }
  });

  it("does not present duplicate destinations or the retired Investments label", () => {
    const items = PREMIUM_NAVIGATION.more.flatMap((group) => group.items);
    const hrefs = items.map((item) => item.url ?? (item.route ? urlFor(item.route) : ""));

    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(items.map((item) => item.label)).not.toContain("Investments");
    expect(hrefs).not.toContain("/investments");
  });
});
