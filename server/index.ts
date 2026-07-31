import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { seedProjects, seedArticles, seedCommunityCategories, seedDealflowData, seedLibraryBeginnerPath, seedLibraryGlossary } from "./seed";
import { startPeggyCron } from "./peggy-cron";
import { securityHeaders } from "./http-hardening";
import { createApiRequestLogger } from "./api-request-logger";
import {
  startHqPendingRecoveryWorker,
  stopHqPendingRecoveryWorker,
} from "./integrations/hq-client";

const app = express();
const httpServer = createServer(app);

app.use(securityHeaders);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use(createApiRequestLogger((message) => log(message)));

(async () => {
  await seedProjects();
  await seedArticles();
  await seedLibraryBeginnerPath();
  await seedLibraryGlossary();
  await seedCommunityCategories();
  if (process.env.NODE_ENV !== "production") {
    await seedDealflowData();
  }
  await registerRoutes(httpServer, app);
  startHqPendingRecoveryWorker();
  httpServer.once("close", stopHqPendingRecoveryWorker);
  startPeggyCron();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Error:", err.stack || err.message || err);
    
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
