import express from "express";
import serverlessApp from "./dist/vercel-server.mjs";

// Keep a directly detectable Express entry for Vercel's framework scanner.
const app = express();
app.disable("x-powered-by");
app.use(serverlessApp);

export default app;
