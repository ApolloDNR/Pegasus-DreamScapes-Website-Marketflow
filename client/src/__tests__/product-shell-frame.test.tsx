import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ShellFrame } from "@/LegacyApp";

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
});
