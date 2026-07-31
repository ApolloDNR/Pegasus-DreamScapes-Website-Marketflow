import fs from "fs";
import type { Express } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { serveStatic } from "../static";

const HTML_SHELL = `<!doctype html>
<html>
  <head>
    <title>Pegasus Dreamscapes</title>
    <meta name="description" content="Home description" />
    <meta name="robots" content="index, follow" />
    <meta property="og:title" content="Pegasus Dreamscapes" />
    <meta property="og:description" content="Home description" />
    <meta property="og:url" content="https://pegasusdreamscapes.com" />
    <meta property="og:image" content="https://pegasusdreamscapes.com/og/default.png" />
    <meta property="og:type" content="website" />
    <meta name="twitter:title" content="Pegasus Dreamscapes" />
    <meta name="twitter:description" content="Home description" />
    <meta name="twitter:image" content="https://pegasusdreamscapes.com/og/default.png" />
    <link rel="canonical" href="https://pegasusdreamscapes.com" />
    <script type="application/ld+json">{"@context":"https://schema.org"}</script>
  </head>
  <body><div id="root"></div></body>
</html>`;

type FallbackHandler = (
  req: { originalUrl: string; url: string },
  res: {
    status: (status: number) => unknown;
    type: (contentType: string) => unknown;
    send: (body: string) => unknown;
  },
) => void;

function registerFallback(): FallbackHandler {
  vi.spyOn(fs, "existsSync").mockReturnValue(true);
  vi.spyOn(fs, "readFileSync").mockReturnValue(HTML_SHELL);

  const registrations: unknown[][] = [];
  const app = {
    use: (...args: unknown[]) => {
      registrations.push(args);
    },
  } as unknown as Express;

  serveStatic(app);

  const fallback = registrations.find((args) => args[0] === "*")?.[1];
  if (typeof fallback !== "function") {
    throw new Error("SPA fallback handler was not registered");
  }
  return fallback as FallbackHandler;
}

function requestHtml(pathname: string) {
  const fallback = registerFallback();
  let status = 0;
  let contentType = "";
  let body = "";
  const response = {
    status(value: number) {
      status = value;
      return response;
    },
    type(value: string) {
      contentType = value;
      return response;
    },
    send(value: string) {
      body = value;
      return response;
    },
  };

  fallback({ originalUrl: pathname, url: pathname }, response);
  return { status, contentType, body };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("production SPA HTML routing", () => {
  it.each([
    "/about",
    "/projects/nelson-dr",
    "/projects/a-real-project",
    "/marketflow/access",
    "/marketflow/deals/42",
  ])("keeps the real route %s at HTTP 200", (pathname) => {
    const response = requestHtml(pathname);

    expect(response.status).toBe(200);
    expect(response.contentType).toBe("html");
  });

  it.each([
    "/definitely-missing",
    "/privacy/extra",
    "/marketflow/access/extra",
    "/projects/one/two",
  ])("returns dedicated noindex HTTP 404 HTML for %s", (pathname) => {
    const response = requestHtml(pathname);

    expect(response.status).toBe(404);
    expect(response.body).toContain("<title>Page Not Found · Pegasus Dreamscapes</title>");
    expect(response.body).toContain(
      '<meta name="robots" content="noindex, nofollow" />',
    );
    expect(response.body).not.toContain('<link rel="canonical"');
  });
});
