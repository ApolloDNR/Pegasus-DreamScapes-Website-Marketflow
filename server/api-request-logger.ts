import type { RequestHandler } from "express";

type LogWriter = (message: string) => void;

export function createApiRequestLogger(write: LogWriter): RequestHandler {
  return (req, res, next) => {
    const startedAt = Date.now();
    const path = req.path;

    res.on("finish", () => {
      if (!path.startsWith("/api")) return;
      const duration = Date.now() - startedAt;
      write(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    });

    next();
  };
}
