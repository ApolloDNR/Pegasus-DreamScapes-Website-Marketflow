import express from "express";
import deploymentConfig from "./vercel.json" with { type: "json" };

// File-based deployments do not necessarily promote vercel.json's env block
// into function variables. Apply only our non-secret deployment defaults before
// the compiled server initializes, preserving explicit environment overrides.
for (const key of ["APP_ENV", "SITE_INDEXABLE", "PEGASUS_SOURCE_SHA"]) {
  const value = deploymentConfig.env?.[key];
  if (process.env[key] === undefined && typeof value === "string") {
    process.env[key] = value;
  }
}
const { default: serverlessApp } = await import("./dist/vercel-server.mjs");

// Keep a directly detectable Express entry for Vercel's framework scanner.
const app = express();
app.disable("x-powered-by");
app.use(serverlessApp);

export default app;
