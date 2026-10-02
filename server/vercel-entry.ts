import { createApplication } from "./application";

// An explicitly designated preview can render public pages before its backend
// is provisioned. Do not import database-dependent routes or accept any writes
// in that state. Production still requires its normal configured backend.
const browsingPreview =
  process.env.APP_ENV?.trim().toLowerCase() === "preview" &&
  !process.env.DATABASE_URL?.trim();

const { app } = await createApplication({
  runtime: "serverless",
  dependencies: browsingPreview
    ? {
        async registerRoutes(_httpServer, previewApp) {
          previewApp.use("/api", (_req, res) => {
            res.setHeader("Cache-Control", "no-store");
            res.status(503).json({
              ready: false,
              code: "preview_backend_unavailable",
              message:
                "This preview is for browsing. Submissions, sign-in, and AI responses are not connected yet.",
            });
          });
        },
      }
    : undefined,
});

export default app;
