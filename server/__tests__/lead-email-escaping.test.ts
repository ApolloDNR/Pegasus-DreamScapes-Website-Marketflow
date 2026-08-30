import { afterEach, describe, expect, it, vi } from "vitest";

const originalSendGridKey = process.env.SENDGRID_API_KEY;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  if (originalSendGridKey === undefined) delete process.env.SENDGRID_API_KEY;
  else process.env.SENDGRID_API_KEY = originalSendGridKey;
});

describe("lead notification email safety", () => {
  it("HTML-escapes every public text field before composing staff mail", async () => {
    process.env.SENDGRID_API_KEY = "test-key";
    vi.resetModules();

    const deliveries: Array<Record<string, any>> = [];
    vi.stubGlobal("fetch", vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      deliveries.push(JSON.parse(String(init?.body)));
      return new Response(null, {
        status: 202,
        headers: { "x-message-id": "test-message" },
      });
    }));

    const email = await import("../email");
    const attack = '<img src=x onerror="alert(1)">&';

    await email.sendSellerLeadNotification({
      name: attack,
      email: attack,
      phone: attack,
      address: attack,
      propertyType: attack,
      condition: attack,
      timeline: attack,
      notes: attack,
    });
    await email.sendDealSubmissionNotification({
      propertyAddress: attack,
      city: attack,
      state: attack,
      contractPrice: 1,
      assignmentFee: 1,
      submittedBy: attack,
    });
    await email.sendInvestorLeadNotification({
      name: attack,
      email: attack,
      phone: attack,
      investmentRange: attack,
      strategy: attack,
      notes: attack,
    });
    await email.sendBuyerLeadNotification({
      name: attack,
      email: attack,
      phone: attack,
      buyerType: attack,
      priceRange: attack,
      locations: [attack],
      notes: attack,
    });
    await email.sendVendorLeadNotification({
      name: attack,
      email: attack,
      phone: attack,
      company: attack,
      trade: attack,
      license: attack,
      serviceArea: attack,
      notes: attack,
    });

    expect(deliveries).toHaveLength(5);
    for (const delivery of deliveries) {
      const html = delivery.content?.[0]?.value;
      expect(html).toBeTypeOf("string");
      expect(html).not.toContain("<img");
      expect(html).not.toContain("onerror=\"alert(1)\"");
      expect(html).toContain("&lt;img");
      expect(html).toContain("&quot;alert(1)&quot;");
    }
  });
});
