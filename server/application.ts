import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { createServer, type Server } from "node:http";
import { createApiRequestLogger } from "./api-request-logger";
import {
  PREVIEW_ROBOTS_BODY,
  PREVIEW_ROBOTS_HEADER,
  isRequestIndexable,
  publicCommitIdentifier,
  resolveDeploymentPolicy,
  type DeploymentEnvironment,
  type DeploymentPolicy,
} from "./deployment-policy";
import { securityHeaders } from "./http-hardening";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export type ApplicationRuntime = "persistent" | "serverless";

export interface ApplicationDependencies {
  registerRoutes: (httpServer: Server, app: Express) => Promise<unknown>;
  seedPersistentData: (
    environment: DeploymentEnvironment,
  ) => Promise<void>;
  startPersistentWorkers: (httpServer: Server) => Promise<void>;
  setupStatic: (app: Express, runtime: ApplicationRuntime) => Promise<void>;
  setupVite: (httpServer: Server, app: Express) => Promise<void>;
}

export interface CreateApplicationOptions {
  runtime?: ApplicationRuntime;
  environment?: DeploymentEnvironment;
  dependencies?: Partial<ApplicationDependencies>;
}

export interface CreatedApplication {
  app: Express;
  httpServer: Server;
  policy: DeploymentPolicy;
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

const defaultDependencies: ApplicationDependencies = {
  async registerRoutes(httpServer, app) {
    const { registerRoutes } = await import("./routes");
    await registerRoutes(httpServer, app);
  },

  async seedPersistentData(environment) {
    const {
      seedArticles,
      seedCommunityCategories,
      seedDealflowData,
      seedLibraryBeginnerPath,
      seedLibraryGlossary,
      seedProjects,
    } = await import("./seed");

    await seedProjects();
    await seedArticles();
    await seedLibraryBeginnerPath();
    await seedLibraryGlossary();
    await seedCommunityCategories();
    if (environment.NODE_ENV !== "production") await seedDealflowData();
  },

  async startPersistentWorkers(httpServer) {
    const [{ startPeggyCron }, hqClient] = await Promise.all([
      import("./peggy-cron"),
      import("./integrations/hq-client"),
    ]);
    hqClient.startHqPendingRecoveryWorker();
    httpServer.once("close", hqClient.stopHqPendingRecoveryWorker);
    startPeggyCron();
  },

  async setupStatic(app, runtime) {
    const { serveStatic } = await import("./static");
    serveStatic(app, {
      assetMode: runtime === "serverless" ? "function" : "express",
    });
  },

  async setupVite(httpServer, app) {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  },
};

function registerDeploymentRoutes(
  app: Express,
  policy: DeploymentPolicy,
): void {
  const commit = publicCommitIdentifier(policy);

  app.use((req, res, next) => {
    res.setHeader("X-Pegasus-Commit", commit);
    if (!isRequestIndexable(req.get("host"), policy)) {
      res.setHeader("X-Robots-Tag", PREVIEW_ROBOTS_HEADER);
    }
    next();
  });

  app.get("/api/version", (req, res) => {
    res.status(200).json({
      commit,
      environment: policy.appEnvironment,
      indexable: isRequestIndexable(req.get("host"), policy),
    });
  });

  // Register this before the legacy robots route. Non-indexable deployments
  // fail closed even when they use a custom hostname that is not recognizable
  // as a conventional preview-domain suffix.
  app.get("/robots.txt", (req, res, next) => {
    if (isRequestIndexable(req.get("host"), policy)) return next();
    return res.status(200).type("text/plain").send(PREVIEW_ROBOTS_BODY);
  });
}

/**
 * Construct the complete application without opening a listening socket.
 * Long-lived process work is explicit so serverless imports remain free of
 * seeds, interval workers, and cron startup.
 */
export async function createApplication(
  options: CreateApplicationOptions = {},
): Promise<CreatedApplication> {
  const runtime = options.runtime ?? "persistent";
  const environment = options.environment ?? process.env;
  const dependencies: ApplicationDependencies = {
    ...defaultDependencies,
    ...options.dependencies,
  };
  const policy = resolveDeploymentPolicy(environment);
  const app = express();
  const httpServer = createServer(app);

  app.disable("x-powered-by");
  app.use(securityHeaders);
  app.use(
    express.json({
      verify: (req, _res, buffer) => {
        req.rawBody = buffer;
      },
    }),
  );
  app.use(express.urlencoded({ extended: false }));
  app.use(createApiRequestLogger((message) => log(message)));
  registerDeploymentRoutes(app, policy);

  if (runtime === "persistent") {
    await dependencies.seedPersistentData(environment);
  }

  await dependencies.registerRoutes(httpServer, app);

  if (runtime === "persistent") {
    await dependencies.startPersistentWorkers(httpServer);
  }

  app.use(
    (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
      const candidate = error as {
        message?: unknown;
        stack?: unknown;
        status?: unknown;
        statusCode?: unknown;
      };
      const statusCandidate = candidate.status ?? candidate.statusCode;
      const status =
        typeof statusCandidate === "number" ? statusCandidate : 500;
      const message =
        typeof candidate.message === "string"
          ? candidate.message
          : "Internal Server Error";

      console.error("Error:", candidate.stack || message);
      if (!res.headersSent) res.status(status).json({ message });
    },
  );

  const useBuiltClient =
    runtime === "serverless" || environment.NODE_ENV === "production";
  if (useBuiltClient) {
    await dependencies.setupStatic(app, runtime);
  } else {
    await dependencies.setupVite(httpServer, app);
  }

  return { app, httpServer, policy };
}
