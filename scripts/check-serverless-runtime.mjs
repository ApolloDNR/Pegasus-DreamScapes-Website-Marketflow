import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { request } from "node:http";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";

// Exercise the real entry both before and after preview backend configuration.
// Dummy local configuration prevents contact with a database or live service.
async function checkRuntime() {
  registerHooks({
    resolve(specifier, context, nextResolve) {
      if (/^(?:vite|rollup|esbuild)(?:\/|$)|^@(?:vitejs|rollup)\/|^@replit\/vite-/.test(specifier)) {
        throw new Error("Production startup loaded a build dependency: " + specifier);
      }
      return nextResolve(specifier, context);
    },
  });

  if (process.env.APP_ENV === "production") {
    await assert.rejects(import("../server.mjs"), /DATABASE_URL must be set/);
    console.log("[serverless-runtime] PASS: production refuses an unconfigured backend");
    return;
  }

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
  const sendRequest = (path, method = "GET") => new Promise((resolve, reject) => {
    const req = request({ hostname: "127.0.0.1", port, path, method }, (res) => {
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
    const version = await sendRequest("/api/version");
    assert.equal(version.status, 200);
    assert.equal(JSON.parse(version.body).environment, "preview");
    assert.equal(JSON.parse(version.body).indexable, false);
    for (const path of ["/", "/property-owners", "/strategy-lab", "/bring-an-opportunity"]) {
      const page = await sendRequest(path);
      assert.equal(page.status, 200, path);
      assert.match(page.body, /id="root"/, path);
      assert.match(page.headers["x-robots-tag"], /noindex/, path);
    }
    const robots = await sendRequest("/robots.txt");
    assert.equal(robots.status, 200);
    assert.match(robots.body, /Disallow: \//);
    if (!process.env.DATABASE_URL) {
      for (const [path, method] of [
        ["/api/ready", "GET"],
        ["/api/auth/user", "GET"],
        ["/api/opportunities", "POST"],
        ["/api/leads", "POST"],
      ]) {
        const unavailable = await sendRequest(path, method);
        assert.equal(unavailable.status, 503, path);
        assert.equal(unavailable.headers["cache-control"], "no-store");
        assert.equal(JSON.parse(unavailable.body).ready, false, path);
        assert.equal(JSON.parse(unavailable.body).code, "preview_backend_unavailable", path);
      }
    }
    console.log("[serverless-runtime] PASS: " + (process.env.DATABASE_URL ? "configured" : "unconfigured") + " preview serves pages without build tools; unavailable APIs stay closed");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

if (process.argv.includes("--runtime-child")) {
  await checkRuntime();
} else {
  for (const profile of ["configured-preview", "unconfigured-preview", "file-preview", "unconfigured-production"]) {
    const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), "--runtime-child"], {
      cwd: fileURLToPath(new URL("../", import.meta.url)),
      env: {
        PATH: process.env.PATH,
        NODE_ENV: "production",
        ...(profile === "file-preview" ? {} : {
          APP_ENV: profile === "unconfigured-production" ? "production" : "preview",
          SITE_INDEXABLE: "false",
        }),
        ...(profile === "configured-preview" ? {
          SESSION_SECRET: "isolated-runtime-smoke-session-secret",
          DATABASE_URL: "postgresql://runtime:runtime@127.0.0.1:1/runtime",
          AI_INTEGRATIONS_OPENAI_API_KEY: "runtime-smoke-only",
        } : {}),
      },
      encoding: "utf8",
      timeout: 30000,
    });
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.error) console.error(result.error.message);
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}
