import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const experience = readFileSync(
  resolve(process.cwd(), "client/src/pegasus/strategy-lab-experience.tsx"),
  "utf8",
);
const memo = readFileSync(
  resolve(process.cwd(), "shared/strategy-lab/decision-memo.ts"),
  "utf8",
);
const handoff = readFileSync(
  resolve(process.cwd(), "client/src/pegasus/strategy-lab-handoff.ts"),
  "utf8",
);
const forms = readFileSync(
  resolve(process.cwd(), "client/src/pegasus/forms.tsx"),
  "utf8",
);
const engineCopy = ["risks.ts", "lanes.ts", "ui-adapter.ts"]
  .map((file) =>
    readFileSync(resolve(process.cwd(), "shared/strategy-lab", file), "utf8"),
  )
  .join("\n");

describe("public Strategy Lab truth boundary", () => {
  it("describes an automated visitor-controlled model without inventing a Pegasus review service", () => {
    expect(experience).toMatch(/automated model/i);
    expect(experience).toMatch(/visitor-entered/i);
    expect(experience).toMatch(/does not guarantee review, response, routing, an offer, or a timeline/i);

    for (const unsupported of [
      "Pegasus underwriting engine",
      "written Property Read",
      "what Pegasus would need to verify",
      "Pegasus diligence still applies",
      "Pegasus review before execution",
      "Pegasus still verifies",
      "subject to a written Pegasus read",
    ]) {
      expect(experience).not.toContain(unsupported);
    }

    expect(memo).not.toMatch(/Submit to Pegasus for a structured review|worth Pegasus time/i);
    expect(handoff).toMatch(/automated and unverified/i);
    expect(handoff).not.toMatch(/requires Pegasus review/i);
    expect(forms).not.toMatch(
      /Start a.*Property Review|Request My Review|We underwrite before we build|short written read|Every real read is handled by Pegasus/i,
    );
    expect(engineCopy).not.toMatch(
      /refinance cash-out will not clear|loans will not clear; expect hard money|refi will not clear principal|Pegasus is a real estate development company|human reviewer will route|we can step in with a backup offer|we'll co-sign|network buyer|buyer-side BPO|we can structure debt or JV equity/i,
    );
  });
});
