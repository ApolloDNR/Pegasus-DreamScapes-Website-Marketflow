// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import postcss, { type AtRule, type Rule } from "postcss";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  resolve(process.cwd(), "client/src/pegasus/_group.css"),
  "utf8",
);
const root = postcss.parse(css);
let mobile: AtRule | undefined;
root.walkAtRules("media", (rule) => {
  if (
    !mobile &&
    rule.params === "(max-width: 640px)" &&
    rule.nodes?.some(
      (node) => node.type === "rule" && node.selector === ".peggy-fab",
    )
  ) {
    mobile = rule;
  }
});

function declarations(selector: string): Record<string, string> {
  const rule = mobile?.nodes?.find(
    (node): node is Rule => node.type === "rule" && node.selector === selector,
  );
  return Object.fromEntries(
    rule?.nodes
      .filter((node) => node.type === "decl")
      .map((node) => [node.prop, node.value]) ?? [],
  );
}

describe("mobile Peggy layout with normal cookie consent", () => {
  it("keeps the FAB hidden while bounding the open panel above the cookie bar", () => {
    expect(declarations(".peggy-fab").display).toBe("none");

    const panel = declarations(".peggy-panel");
    expect(panel.display).toBe("flex");
    expect(panel["flex-direction"]).toBe("column");
    expect(panel["max-height"]).toContain("100dvh");
    expect(panel.bottom).toContain("safe-area-inset-bottom");

    const cookiePanel = declarations(".pg-cookie-visible .peggy-panel");
    expect(cookiePanel.display).not.toBe("none");
    expect(cookiePanel["max-height"]).toContain("100dvh");
    expect(cookiePanel.bottom).toContain("safe-area-inset-bottom");

    const thread = declarations(".peggy-thread");
    expect(thread["min-height"]).toBe("0");
    expect(thread.flex).toBe("1 1 auto");
    expect(thread["max-height"]).toBe("none");
  });
});
