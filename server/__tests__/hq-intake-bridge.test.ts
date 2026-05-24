import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  HqIntakeBridgeError,
  buildHqPayloadFromSellerLead,
  buildHqPayloadFromUnifiedLead,
  shouldBridgeLeadToHq,
  submitHqPublicIntake,
} from "../hq-intake-bridge";

describe("Pegasus HQ intake bridge", () => {
  const originalUrl = process.env.PEGASUS_HQ_PUBLIC_INTAKE_URL;

  beforeEach(() => {
    process.env.PEGASUS_HQ_PUBLIC_INTAKE_URL = "https://hq.example.test/api/public/intake";
  });

  afterEach(() => {
    process.env.PEGASUS_HQ_PUBLIC_INTAKE_URL = originalUrl;
  });

  it("routes only property-intake lead types into HQ", () => {
    expect(shouldBridgeLeadToHq({ leadType: "seller", address: "123 Demo St" })).toBe(true);
    expect(shouldBridgeLeadToHq({ leadType: "submit", address: "123 Demo St" })).toBe(true);
    expect(shouldBridgeLeadToHq({ leadType: "investor", address: "123 Demo St" })).toBe(false);
    expect(shouldBridgeLeadToHq({ leadType: "seller", address: "" })).toBe(false);
  });

  it("maps /sell unified leads to the HQ public intake contract", () => {
    const payload = buildHqPayloadFromUnifiedLead({
      leadType: "seller",
      source: "sell_page",
      firstName: "Apollo",
      lastName: "Tester",
      email: "APOLLO@EXAMPLE.COM",
      phone: "925-555-0100",
      address: "4369 Nelson Dr, Richmond, CA",
      leadData: {
        submitterRole: "owner",
        propertyType: "house",
        condition: "needs-tlc",
        occupancy: "vacant",
        timeline: "30-60-days",
        situation: "Inherited property with deferred maintenance and unclear next step.",
        desiredOutcome: "Get the best lawful path.",
        consents: {
          consentContact: true,
          consentSnapshot: true,
          ackPreliminary: true,
        },
      },
      notes: "Call after 3pm.",
    });

    expect(payload).toMatchObject({
      propertyAddress: "4369 Nelson Dr, Richmond, CA",
      contactName: "Apollo Tester",
      contactEmail: "apollo@example.com",
      sourceChannel: "public_website_form",
      consentContact: true,
      consentCcpaAcknowledged: true,
    });
    expect(payload.outreachReason).toContain("Website seller intake");
    expect(payload.outreachReason).toContain("Inherited property");
    expect(payload.notes).toContain("Bridged from Pegasus Dreamscapes public website");
    expect(payload.idempotencyKey).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );

    const payloadAgain = buildHqPayloadFromUnifiedLead({
      leadType: "seller",
      source: "sell_page",
      firstName: "Apollo",
      lastName: "Tester",
      email: "apollo@example.com",
      phone: "925-555-0100",
      address: "4369 Nelson Dr, Richmond, CA",
      leadData: {
        situation: "Inherited property with deferred maintenance and unclear next step.",
        consents: {
          consentContact: true,
          consentSnapshot: true,
          ackPreliminary: true,
        },
      },
    });
    expect(payloadAgain.idempotencyKey).toBe(payload.idempotencyKey);
  });

  it("maps legacy seller-leads payloads without writing website-only leads", () => {
    const payload = buildHqPayloadFromSellerLead({
      name: "Seller Lead",
      phone: "925-555-0101",
      email: "seller@example.com",
      propertyAddress: "123 Concord Ave, Concord, CA",
      propertyType: "single_family",
      condition: "needs_work",
      timeline: "30_days",
      notes: "Looking for options.",
    });

    expect(payload.propertyAddress).toBe("123 Concord Ave, Concord, CA");
    expect(payload.contactName).toBe("Seller Lead");
    expect(payload.outreachReason).toContain("Website seller lead");
    expect(payload.notes).toContain("Legacy seller-leads endpoint bridged");
  });

  it("posts the canonical payload to the configured HQ endpoint", async () => {
    const fetchImpl = vi.fn(async (_input: string, _init?: RequestInit) => {
      return new Response(
        JSON.stringify({
          ok: true,
          reference: "SEED-2026-0001",
          statusUrl: "https://pegasus-hq-operating-system.vercel.app/status/demo",
          message: "Intake received.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    const result = await submitHqPublicIntake(
      {
        propertyAddress: "123 Demo St",
        contactName: "Apollo Tester",
        contactPhone: "925-555-0100",
        contactEmail: "apollo@example.com",
        outreachReason: "Testing bridge.",
        sourceChannel: "public_website_form",
        notes: null,
        consentContact: true,
        consentCcpaAcknowledged: true,
        referrer: null,
        idempotencyKey: "11111111-1111-5111-8111-111111111111",
      },
      fetchImpl,
    );

    expect(result.reference).toBe("SEED-2026-0001");
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://hq.example.test/api/public/intake",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });

  it("fails closed when HQ rejects the intake", async () => {
    await expect(
      submitHqPublicIntake(
        {
          propertyAddress: "123 Demo St",
          contactName: "Apollo Tester",
          contactPhone: "925-555-0100",
          contactEmail: "apollo@example.com",
          outreachReason: "Testing bridge.",
          sourceChannel: "public_website_form",
          notes: null,
          consentContact: true,
          consentCcpaAcknowledged: true,
          referrer: null,
          idempotencyKey: "11111111-1111-5111-8111-111111111111",
        },
        async () => new Response(JSON.stringify({ ok: false, message: "Nope." }), { status: 400 }),
      ),
    ).rejects.toBeInstanceOf(HqIntakeBridgeError);
  });
});
