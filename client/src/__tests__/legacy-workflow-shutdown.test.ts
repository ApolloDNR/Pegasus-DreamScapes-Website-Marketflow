import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readClientSource = (relativePath: string) =>
  readFileSync(resolve(import.meta.dirname, "..", relativePath), "utf8");

const legacySources = {
  chat: readClientSource("components/deal-chat.tsx"),
  history: readClientSource("components/negotiation-history.tsx"),
  room: readClientSource("components/negotiation-room.tsx"),
};

const allLegacySources = Object.values(legacySources).join("\n");

describe("legacy workflow launch shutdown", () => {
  it("does not invoke non-persistent legacy write endpoints", () => {
    expect(allLegacySources).not.toContain("/api/deal-messages");
    expect(allLegacySources).not.toContain("/api/negotiations/accept");
    expect(allLegacySources).not.toContain("/api/negotiations/counter");
    expect(allLegacySources).not.toContain("apiRequest");
  });

  it("replaces each legacy action surface with the shared launch notice", () => {
    for (const source of Object.values(legacySources)) {
      expect(source).toContain("LegacyWorkflowNotice");
    }
  });

  it("directs deal-aware surfaces into canonical Offer Studio lanes", () => {
    expect(legacySources.chat).toContain('capital_project: "CAPITAL"');
    expect(legacySources.chat).toContain('wholesale_deal: "WHOLESALE"');
    expect(legacySources.room).toContain('"WHOLESALE" : "CAPITAL"');
    expect(legacySources.history).toContain("offerStudioLane");
  });

  it("states that the retired panel cannot record an action", () => {
    const noticeSource = readClientSource(
      "components/legacy-workflow-notice.tsx",
    );
    expect(noticeSource).toContain("read-only for launch");
    expect(noticeSource).toMatch(
      /does not send,\s+accept,\s+decline,\s+counter,\s+or record messages/,
    );
    expect(noticeSource).toContain("Continue in Offer Studio");
  });
});
