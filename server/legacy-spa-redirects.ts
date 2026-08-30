import type { Express, RequestHandler } from "express";

import {
  appendRedirectSearch,
  LEGACY_SPA_EXACT_REDIRECTS,
  LEGACY_SPA_PREFIX_REDIRECTS,
  QUERY_PRESERVING_INTAKE_PATHS,
} from "../shared/redirects";

function redirectHandler(from: string, to: string): RequestHandler {
  return (req, res) => {
    const queryStart = req.originalUrl.indexOf("?");
    const incomingSearch =
      QUERY_PRESERVING_INTAKE_PATHS.has(from) && queryStart >= 0
        ? req.originalUrl.slice(queryStart + 1)
        : "";
    res.redirect(301, appendRedirectSearch(to, incomingSearch));
  };
}

/** Register real HTTP redirects that mirror the browser's legacy aliases. */
export function registerLegacySpaRedirects(app: Express): void {
  for (const [from, to] of LEGACY_SPA_EXACT_REDIRECTS) {
    app.get(from, redirectHandler(from, to));
  }
  for (const [prefix, to] of LEGACY_SPA_PREFIX_REDIRECTS) {
    app.get(`${prefix}/*`, redirectHandler(prefix, to));
  }
}
