import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ShellFrame } from "@/LegacyApp";
import { classifyShellMode } from "@/lib/shell-mode";

afterEach(() => cleanup());

describe("product shell landmark ownership", () => {
  it("leaves a product layout as the sole main landmark", () => {
    const { container } = render(
      <ShellFrame shellMode="product" location="/marketflow/dashboard">
        <main data-testid="product-main">Dashboard</main>
      </ShellFrame>,
    );

    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(container.querySelector("#main-content")).not.toBeNull();
    expect(container.textContent).not.toContain("Pegasus Dreamscapes is a");
  });

  it.each([
    "/profile/member-42",
    "/offer-studio/capital/deal-42",
  ])("keeps the self-owned layout as the only main landmark at %s", (location) => {
    const shellMode = classifyShellMode({
      location,
      isAuthenticated: true,
      isGuestMode: false,
      roles: ["investor"],
    });
    const { container } = render(
      <ShellFrame shellMode={shellMode} location={location}>
        <main data-testid="product-main">Product route</main>
      </ShellFrame>,
    );

    expect(shellMode).toBe("product");
    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(container.textContent).not.toContain("Pegasus Dreamscapes is a");
  });
});
