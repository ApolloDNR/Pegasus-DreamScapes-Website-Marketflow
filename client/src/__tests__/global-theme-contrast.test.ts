import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type Rgb = [number, number, number];

const indexCss = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");
const pegasusCss = readFileSync(
  resolve(process.cwd(), "client/src/pegasus/_group.css"),
  "utf8",
);
const source = (path: string) =>
  readFileSync(resolve(process.cwd(), `client/src/${path}`), "utf8");

function rgbFromHex(hex: string): Rgb {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16)) as Rgb;
}

function rgbFromHsl(hue: number, saturation: number, lightness: number): Rgb {
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const match = l - chroma / 2;
  let channels: Rgb;

  if (hue < 60) channels = [chroma, x, 0];
  else if (hue < 120) channels = [x, chroma, 0];
  else if (hue < 180) channels = [0, chroma, x];
  else if (hue < 240) channels = [0, x, chroma];
  else if (hue < 300) channels = [x, 0, chroma];
  else channels = [chroma, 0, x];

  return channels.map((channel) => Math.round((channel + match) * 255)) as Rgb;
}

function luminance([red, green, blue]: Rgb): number {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(first: Rgb, second: Rgb): number {
  const bright = Math.max(luminance(first), luminance(second));
  const dark = Math.min(luminance(first), luminance(second));
  return (bright + 0.05) / (dark + 0.05);
}

function mix(foreground: Rgb, background: Rgb, opacity: number): Rgb {
  return foreground.map((value, index) =>
    Math.round(value * opacity + background[index] * (1 - opacity)),
  ) as Rgb;
}

describe("global light-theme contrast tokens", () => {
  it("keeps the shared HSL copper AA-safe on public light surfaces and fills", () => {
    const root = indexCss.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
    const token = root.match(/--primary:\s*(\d+)\s+(\d+)%\s+(\d+)%/) ?? [];
    const copper = rgbFromHsl(Number(token[1]), Number(token[2]), Number(token[3]));
    const white = rgbFromHex("#ffffff");
    const warmPage = rgbFromHex("#f5efe4");
    const warmAlt = rgbFromHex("#f7f3ee");

    expect(contrast(copper, white)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(copper, warmPage)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(copper, mix(copper, warmAlt, 0.1))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(white, copper)).toBeGreaterThanOrEqual(4.5);
  });

  it("maps light Pegasus arbitrary accent text to the AA ink token", () => {
    const lightTheme = pegasusCss.match(/\.pg-root\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
    const inkHex = lightTheme.match(/--accent-ink:\s*(#[0-9a-f]{6})/i)?.[1] ?? "";
    const ink = rgbFromHex(inkHex);

    expect(pegasusCss).toMatch(
      /\.pg-root:not\(\[data-theme='dark'\]\) \.text-\\\[var\\\(--accent\\\)\\\]\s*\{\s*color:\s*var\(--accent-ink\)/,
    );
    expect(contrast(ink, rgbFromHex("#f5efe4"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(ink, rgbFromHex("#ebe2d2"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(ink, rgbFromHex("#fcf9f1"))).toBeGreaterThanOrEqual(4.5);
  });

  it("uses the bright semantic copper only when copy sits on a dark section", () => {
    const root = indexCss.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
    const token = root.match(/--warm-glow:\s*(\d+)\s+(\d+)%\s+(\d+)%/) ?? [];
    const glow = rgbFromHsl(Number(token[1]), Number(token[2]), Number(token[3]));

    expect(contrast(glow, rgbFromHex("#1f2429"))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(glow, rgbFromHex("#282d32"))).toBeGreaterThanOrEqual(4.5);
    expect(source("pages/faq.tsx")).toContain("text-[hsl(var(--warm-glow))]");
    expect(source("pages/strategy-lab-blueprint-confirmed.tsx")).not.toMatch(
      /tracking-(?:wider|\[0\.3em\])[^\n]*text-primary/,
    );
  });

  it("keeps Nelson small muted copy opaque enough for warm surfaces", () => {
    const root = indexCss.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
    const token = root.match(/--muted-foreground:\s*(\d+)\s+(\d+)%\s+(\d+)%/) ?? [];
    const muted = rgbFromHsl(Number(token[1]), Number(token[2]), Number(token[3]));
    const warmPage = rgbFromHex("#f7f3ee");

    expect(contrast(mix(muted, warmPage, 0.8), warmPage)).toBeGreaterThanOrEqual(4.5);
    expect(source("pages/project-nelson-dr.tsx")).not.toMatch(
      /text-muted-foreground\/(?:60|70)/,
    );
  });

  it("keeps local product accents paired with their semantic foreground", () => {
    expect(source("pages/marketflow-buyboxes.tsx")).toContain(
      "text-[hsl(var(--copper-foreground))]",
    );
    expect(indexCss).toMatch(
      /\.px-lab-instruments > header \.px-kicker\s*\{\s*color:\s*var\(--accent-ink\)/,
    );
  });
});
