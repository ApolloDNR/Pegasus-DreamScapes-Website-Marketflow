import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(import.meta.dirname, "../..");

function readJson(path: string): Record<string, any> {
  return JSON.parse(readFileSync(resolve(repoRoot, path), "utf8"));
}

describe("protected Vercel Express preview configuration", () => {
  it("uses the Express adapter and includes the built client", () => {
    const config = readJson("vercel.json");

    expect(config.$schema).toBe("https://openapi.vercel.sh/vercel.json");
    expect(config.framework).toBe("express");
    expect(config.buildCommand).toBe("npm run build");
    expect(config.functions).toEqual({
      "server.mjs": { includeFiles: "dist/public/**" },
    });
    expect(config.env).toEqual({
      APP_ENV: "preview",
      SITE_INDEXABLE: "false",
    });
  });

  it("sets an unconditional preview noindex header without production targeting", () => {
    const config = readJson("vercel.json");

    expect(config.headers).toEqual([
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet",
          },
        ],
      },
    ]);
    expect(config).not.toHaveProperty("alias");
    expect(config).not.toHaveProperty("aliases");
    expect(config).not.toHaveProperty("domains");
    expect(config).not.toHaveProperty("target");
  });

  it("exports the built serverless app and pins Node 22", () => {
    const rootAdapter = readFileSync(resolve(repoRoot, "server.mjs"), "utf8");
    const buildScript = readFileSync(resolve(repoRoot, "script/build.ts"), "utf8");
    const packageJson = readJson("package.json");

    expect(rootAdapter.trim()).toBe(
      'export { default } from "./dist/vercel-server.mjs";',
    );
    expect(buildScript).toContain('entryPoints: ["server/vercel-entry.ts"]');
    expect(buildScript).toContain('outfile: "dist/vercel-server.mjs"');
    expect(buildScript).toContain("__pegasusCreateRequire(import.meta.url)");
    expect(packageJson.engines).toEqual({ node: "22.x" });
  });
});
