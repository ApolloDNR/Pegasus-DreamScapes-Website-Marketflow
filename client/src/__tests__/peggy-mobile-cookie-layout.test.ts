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

const guideCss = postcss.parse(readFileSync(resolve(process.cwd(), "client/src/pegasus/peggy-guide.css"), "utf8"));
function guideDeclarations(selector: string): Record<string, string> {
  const values: Record<string, string> = {};
  guideCss.walkRules(selector, (rule) => {
    // This contract describes the phone layout, not the wider compact row.
    if (rule.parent?.type === "atrule" && "params" in rule.parent && String(rule.parent.params).includes("min-width:641px")) return;
    rule.walkDecls(decl => { values[decl.prop] = decl.value; });
  });
  return values;
}

describe("compact page-tour layout", () => {
  it("bounds the phone tour above consent without scrolling Close or navigation out of reach", () => {
    const tour = guideDeclarations('.peggy-tour[data-compact="true"]');
    expect(tour.display).toBe('flex');
    expect(tour['flex-direction']).toBe('column');
    expect(tour.overflow).toBe('hidden');
    expect(tour.top).toContain('--journey-nav-height');
    expect(tour.bottom).toBe('auto');
    expect(tour['max-height']).toContain('100dvh');
    expect(tour['max-height']).toContain('--peggy-tour-bottom');
    const cookie = guideDeclarations('.pg-cookie-visible .peggy-tour[data-compact="true"]');
    expect(cookie['--peggy-tour-bottom']).toContain('safe-area-inset-bottom');
    expect(cookie['--peggy-tour-bottom']).toContain('--peggy-cookie-height');
    const details = guideDeclarations('.peggy-tour[data-compact="true"] .peggy-tour-details');
    expect(details['min-height']).toBe('0');
    expect(details['overflow-y']).toBe('auto');
    const actions = guideDeclarations('.peggy-tour[data-compact="true"] .peggy-tour-actions');
    expect(actions['flex-shrink']).toBe('0');
    expect(guideDeclarations('.peggy-tour[data-compact="true"] > header')['flex-shrink']).toBe('0');
  });
  it("gives returned section focus a visible indicator", () => {
    const focus = guideDeclarations('.peggy-tour-return-focus:focus');
    expect(focus.outline).toContain('2px solid');
    expect(focus['outline-offset']).toBe('6px');
  });
});
