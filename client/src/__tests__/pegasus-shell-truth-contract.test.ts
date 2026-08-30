import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const SHELL_FILES = [
  "client/src/pegasus/data.tsx",
  "client/src/pegasus/pages.tsx",
  "client/src/pegasus/blocks.tsx",
  "client/src/pegasus/home-v51.tsx",
  "client/src/pegasus/about-v6.tsx",
  "client/src/pegasus/footer.tsx",
  "client/src/pegasus/peggy.tsx",
  "client/src/pegasus/how-we-operate.tsx",
] as const;

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const shellSource = SHELL_FILES.map(read).join("\n");

describe("mounted Pegasus public truth contract", () => {
  it("keeps the active shell sources in this focused audit", () => {
    const landing = read("client/src/pegasus/Landing.tsx");

    expect(landing).toContain("import { HomePageV51 } from './home-v51'");
    expect(landing).toContain("import('./about-v6')");
    expect(landing).toContain("module.WorkWithApolloPage");
    expect(landing).toContain("<Footer go={go}");
    expect(landing).toContain("import('./how-we-operate')");
    expect(SHELL_FILES).toHaveLength(8);
  });

  it("does not restore retired staffing, workflow, timing, or transaction promises", () => {
    const retiredClaims = [
      /A team, not one hire/i,
      /a deep bench/i,
      /Every project starts/i,
      /Every deal runs/i,
      /one buyer who actually closes/i,
      /reads returned on time/i,
      /routed to real work/i,
      /we respond within 48 hours/i,
      /someone writes back within 48 hours/i,
      /direct response within 1[–-]2 business days/i,
      /sourced, built, and sold in-house/i,
      /we supply what is missing/i,
      /Pegasus pipeline/i,
      /Apollo represents sellers and buyers/i,
      /Licensed REALTOR/i,
      /NAR\s*[·|/]\s*CAR/i,
      /Start my Review/i,
      /Start a Review/i,
      /Bring the capital and the crew/i,
      /one accountable operator carries the deal/i,
      /We buy it ourselves and carry the outcome/i,
      /we run the execution/i,
      /we route it and say so/i,
      /We will show you the sequence/i,
    ];

    for (const claim of retiredClaims) expect(shellSource).not.toMatch(claim);
  });

  it("qualifies the public-facing name and the separate license record", () => {
    expect(shellSource).toContain("public-facing name");
    expect(shellSource).toContain("Duran Ramirez, Paolo Ariel");
    expect(shellSource).toContain("CA DRE #02333658");
    expect(shellSource).toContain("BMP Realty Inc DBA Keller Williams Realty-East Bay");
    expect(shellSource).toMatch(/separate written brokerage agreement/i);
  });

  it("does not imply that the Nelson record proves brokerage or project roles", () => {
    const home = read("client/src/pegasus/home-v51.tsx");
    const aboutAndPages = [
      read("client/src/pegasus/about-v6.tsx"),
      read("client/src/pegasus/pages.tsx"),
    ].join("\n");

    expect(home).toContain("NELSON_COST_DISCLOSURE");
    expect(home).toContain("NELSON_EXECUTION_DISCLOSURE");
    expect(home).toMatch(/does not identify who provided brokerage representation/i);
    expect(aboutAndPages).not.toMatch(/On Nelson Drive, Apollo (?:sourced|represented|listed)/i);
  });
});
