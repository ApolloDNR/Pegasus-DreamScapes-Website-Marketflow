import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

const submitted = source("client/src/pages/strategy-lab-submitted.tsx");
const status = source("client/src/pages/snapshot-status.tsx");
const notFound = source("client/src/pages/not-found.tsx");

describe("public confirmation and status truth", () => {
  it("treats a Strategy Lab receipt as receipt only", () => {
    expect(submitted).toContain("Receipt does not promise a review, response, route, offer, or timeline");
    expect(submitted).toContain("noCanonical: true");
    expect(submitted).not.toMatch(/within 48 hours|first response by|front of the queue|will read every input/i);
  });

  it("does not simulate a live submission tracker before one is connected", () => {
    expect(status).toContain("Live status tracking is not connected at this link");
    expect(status).toContain("does not confirm receipt, review, or a future response");
    expect(status).toContain("noCanonical: true");
    expect(status).not.toMatch(/within 48 hours|reviews every property|we're moving forward together|we'll surface|email the moment/i);
  });

  it("keeps the 404 page helpful without promising a route for every visitor", () => {
    expect(notFound).not.toMatch(/Every property gets a path|Every visitor does too/i);
    expect(notFound).toContain("noCanonical: true");
  });
});
