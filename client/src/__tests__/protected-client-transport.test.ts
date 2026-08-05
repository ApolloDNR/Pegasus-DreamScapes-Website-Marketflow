import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("protected client transport migration", () => {
  it.each([
    [
      "client/src/pages/admin-hq-outbox.tsx",
      "/api/admin/hq-outbox",
    ],
    [
      "client/src/pages/strategy-lab-submitted.tsx",
      "/api/strategy-lab/submission/",
    ],
    [
      "client/src/components/anonymous-claim-watcher.tsx",
      "/api/property-analyses/claim",
    ],
    [
      "client/src/components/my-analyses-drawer.tsx",
      "/api/pdf/calculator",
    ],
    [
      "client/src/components/send-analysis-pdf-dialog.tsx",
      "/api/pdf/calculator/email",
    ],
    [
      "client/src/components/document-attachments.tsx",
      "/api/uploads/request-url",
    ],
    [
      "client/src/contexts/supabase-auth-context.tsx",
      "/api/supabase/profile/",
    ],
  ])("%s sends %s through authenticatedRequest", (file, endpoint) => {
    const fileSource = source(file);
    expect(fileSource).toContain("authenticatedRequest");
    expect(fileSource).toContain(endpoint);
    expect(fileSource).not.toMatch(
      new RegExp(`fetch\\([^\\n]*${endpoint.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
    );
  });

  it("authenticates upload-ticket requests without wrapping the presigned PUT", () => {
    const uploadSource = source("client/src/hooks/use-upload.ts");
    expect(uploadSource).toContain(
      'authenticatedRequest("/api/uploads/request-url"',
    );
    expect(uploadSource).toContain("fetch(uploadURL");
  });

  it("fetches owner-only Strategy PDFs before exposing blob URLs to the browser", () => {
    const labSource = source("client/src/pages/strategy-lab.tsx");
    const librarySource = source(
      "client/src/pages/strategy-lab-library.tsx",
    );

    expect(labSource).toContain("await authenticatedRequest(url)");
    expect(labSource).toContain("setPdfPreviewUrl(objectUrl)");
    expect(librarySource).toContain(
      "await authenticatedRequest(",
    );
    expect(librarySource).not.toContain(
      'href={`/api/pdf/strategy-snapshot/by-id/',
    );
  });
});
