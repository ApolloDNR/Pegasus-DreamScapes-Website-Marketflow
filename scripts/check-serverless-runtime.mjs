import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { request } from "node:http";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";

// Exercise the real deployment entry in an isolated process. Dummy local
// configuration prevents the check from contacting a database or live service.
async function checkRuntime() {
  registerHooks({
    resolve(specifier, context, nextResolve) {
      if (/^(?:vite|rollup|esbuild)(?:\/|$)|^@(?:vitejs|rollup)\/|^@replit\/vite-/.test(specifier)) {
        throw new Error("Production startup loaded a build dependency: " + specifier);
      }
      return nextResolve(specifier, context);
    },
  });

  const { default: app } = await import("../server.mjs");
  assert.equal(typeof app, "function", "Deployment entry must export an Express app");
  assert.equal(typeof app.handle, "function");
  assert.equal(app.enabled("x-powered-by"), false);
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  const port = server.address().port;
  const get = (path) => new Promise((resolve, reject) => {
    const req = request({ hostname: "127.0.0.1", port, path }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.end();
  });

  try {
    const version = await get("/api/version");
    assert.equal(version.status, 200);
    assert.equal(JSON.parse(version.body).environment, "preview");
    assert.equal(JSON.parse(version.body).indexable, false);
    for (const path of ["/", "/property-owners", "/strategy-lab", "/bring-an-opportunity"]) {
      const page = await get(path);
      assert.equal(page.status, 200, path);
      assert.match(page.body, /id="root"/, path);
      assert.match(page.headers["x-robots-tag"], /noindex/, path);
    }
    const robots = await get("/robots.txt");
    assert.equal(robots.status, 200);
    assert.match(robots.body, /Disallow: \//);
    console.log("[serverless-runtime] PASS: real deployment entry serves preview routes without build tools");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

if (process.argv.includes("--runtime-child")) {
  await checkRuntime();
} else {
  const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), "--runtime-child"], {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    env: {
      PATH: process.env.PATH,
      NODE_ENV: "production",
      APP_ENV: "preview",
      SITE_INDEXABLE: "false",
      SESSION_SECRET: "isolated-runtime-smoke-session-secret",
      DATABASE_URL: "postgresql://runtime:runtime@127.0.0.1:1/runtime",
      AI_INTEGRATIONS_OPENAI_API_KEY: "runtime-smoke-only",
    },
    encoding: "utf8",
    timeout: 30000,
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) console.error(result.error.message);
  process.exit(result.status ?? 1);
}
