import type { RequestHandler } from "express";

const CONTENT_SECURITY_POLICY = [
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
].join("; ");

/**
 * A deliberately narrow baseline policy that is safe for the current app.
 *
 * The site still embeds third-party maps, analytics, Supabase, and inline
 * JSON-LD, so resource-loading directives need a staged report-only rollout.
 * These directives protect the document boundary without breaking those
 * integrations.
 */
export const securityHeaders: RequestHandler = (req, res, next) => {
  res.setHeader("Content-Security-Policy", CONTENT_SECURITY_POLICY);
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");

  if (req.path.startsWith("/api/")) {
    res.setHeader("Cache-Control", "no-store");
  }

  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  next();
};
