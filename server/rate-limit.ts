import type { NextFunction, Request, RequestHandler, Response } from "express";

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  message?: string;
  now?: () => number;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const MAX_TRACKED_KEYS = 10_000;

export function createRateLimit({
  maxRequests,
  windowMs,
  message = "Too many requests. Please try again later.",
  now = Date.now,
}: RateLimitOptions): RequestHandler {
  const store = new Map<string, RateLimitRecord>();

  return (
    req: Request & { user?: { claims?: { sub?: string } } },
    res: Response,
    next: NextFunction,
  ) => {
    const timestamp = now();
    const identity = req.user?.claims?.sub || req.ip || "unknown";
    const routePath =
      typeof req.route?.path === "string"
        ? `${req.baseUrl}${req.route.path}`
        : req.path;
    const key = `${routePath}:${identity}`;
    const record = store.get(key);

    if (!record || timestamp >= record.resetTime) {
      store.set(key, { count: 1, resetTime: timestamp + windowMs });

      // Bound memory even if an attacker rotates identifiers. Expired entries
      // are removed first; if the map remains full, evict the oldest key.
      if (store.size > MAX_TRACKED_KEYS) {
        store.forEach((value, candidate) => {
          if (timestamp >= value.resetTime) store.delete(candidate);
        });
        if (store.size > MAX_TRACKED_KEYS) {
          const oldest = store.keys().next().value;
          if (oldest) store.delete(oldest);
        }
      }

      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((record.resetTime - timestamp) / 1000),
      );
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({ message });
    }

    record.count += 1;
    return next();
  };
}

export const rateLimit = (maxRequests: number, windowMs: number) =>
  createRateLimit({ maxRequests, windowMs });

export const publicIntakeRateLimit = createRateLimit({
  maxRequests: 6,
  windowMs: 15 * 60_000,
});
