import { describe, expect, it } from "vitest";
import { isPreviewHostname } from "../../shared/preview-hosts";

describe("preview-host indexing boundary", () => {
  it.each([
    "localhost",
    "localhost:5000",
    "127.0.0.1:4173",
    "branch-name.replit.app",
    "pegasus-dreamscapes-preview.onrender.com",
    "pegasus-dreamscapes-preview.vercel.app",
    "preview.netlify.app",
    "preview.pages.dev",
  ])("blocks indexing for %s", (host) => {
    expect(isPreviewHostname(host)).toBe(true);
  });

  it.each([
    "pegasusdreamscapes.com",
    "www.pegasusdreamscapes.com",
    "pegasusdreamscapes.co",
  ])("keeps production crawlable for %s", (host) => {
    expect(isPreviewHostname(host)).toBe(false);
  });
});
