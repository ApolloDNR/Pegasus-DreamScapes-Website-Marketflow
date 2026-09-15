import { describe, expect, it } from "vitest";
import * as emailModule from "../email";

describe("preview account welcome email", () => {
  it.each(["investor", "wholesaler", "dreamscaper", "buyer_retail"])(
    "treats %s as declared interest, not MarketFlow approval or privileges",
    (role) => {
      expect(emailModule.buildPreviewAccountWelcomeHtml).toBeTypeOf("function");
      if (typeof emailModule.buildPreviewAccountWelcomeHtml !== "function") {
        throw new Error("Preview-account welcome builder is not implemented");
      }

      const html = emailModule.buildPreviewAccountWelcomeHtml({
        name: "Taylor <script>",
        role,
        siteUrl: "https://example.test",
      });

      expect(html).toMatch(/general preview account/i);
      expect(html).toMatch(/declared interest/i);
      expect(html).toMatch(/does not grant MarketFlow access, inventory, approval, verification, or submission privileges/i);
      expect(html).toContain('href="https://example.test/marketflow"');
      expect(html).not.toMatch(/exclusive investment opportunities|priority deal placement|ready to .*marketplace|Go to Your Dashboard/i);
      expect(html).not.toContain("<script>");
      expect(html).toContain("Taylor &lt;script&gt;");
    },
  );
});
