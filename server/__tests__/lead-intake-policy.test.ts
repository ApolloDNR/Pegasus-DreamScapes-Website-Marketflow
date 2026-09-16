import { describe, expect, it } from "vitest";
import { normalizePegasusLeadSubmission } from "@shared/lead-routing";
import {
  buildGenericLeadNotificationData,
  consentVersionForLead,
  mergeLeadConsentAudit,
  normalizeLeadConsent,
  requiresExplicitContactConsent,
  resolveStaffNotificationRecipient,
  validateLeadConsentRequirement,
} from "../lead-intake-policy";

describe("normalizeLeadConsent", () => {
  it("defaults both facts to false when consent is absent", () => {
    expect(normalizeLeadConsent({ email: "person@example.com" })).toEqual({
      consentContact: false,
      consentCcpaAcknowledged: false,
    });
  });

  it("accepts the new top-level boolean without inventing CCPA acknowledgement", () => {
    expect(normalizeLeadConsent({ consentContact: true })).toEqual({
      consentContact: true,
      consentCcpaAcknowledged: false,
    });
  });

  it("preserves the existing /submit and /sell checked-checkbox contracts", () => {
    expect(normalizeLeadConsent({ leadData: { consent: true } }).consentContact).toBe(true);
    expect(
      normalizeLeadConsent({
        leadData: { consents: { consentContact: true } },
      }).consentContact,
    ).toBe(true);
  });

  it("recognizes CCPA acknowledgement only as a separate explicit boolean", () => {
    expect(
      normalizeLeadConsent({
        consentContact: true,
        leadData: { consents: { consentCcpaAcknowledged: true } },
      }),
    ).toEqual({
      consentContact: true,
      consentCcpaAcknowledged: true,
    });
  });

  it("does not coerce string values into consent", () => {
    expect(
      normalizeLeadConsent({
        consentContact: "true",
        consentCcpaAcknowledged: "true",
        leadData: { consent: "true", consents: { consentContact: "true" } },
      }),
    ).toEqual({
      consentContact: false,
      consentCcpaAcknowledged: false,
    });
  });
});

describe("required lead consent policy", () => {
  it.each(["submit", "blueprint_request", "seller", "marketflow_access", "vendor", "newsletter"])(
    "requires explicit contact consent for %s",
    (leadType) => {
      expect(requiresExplicitContactConsent(leadType)).toBe(true);
      expect(
        validateLeadConsentRequirement(leadType, {
          consentContact: false,
          consentCcpaAcknowledged: false,
        }),
      ).toEqual({ ok: false, message: "Consent to follow up is required." });
    },
  );

  it("keeps un-migrated legacy types accepted while recording false", () => {
    expect(requiresExplicitContactConsent("investor")).toBe(false);
    expect(
      validateLeadConsentRequirement("investor", {
        consentContact: false,
        consentCcpaAcknowledged: false,
      }),
    ).toEqual({ ok: true });
  });

  it("accepts a required type when contact consent is explicit", () => {
    expect(
      validateLeadConsentRequirement("marketflow_access", {
        consentContact: true,
        consentCcpaAcknowledged: false,
      }),
    ).toEqual({ ok: true });
  });
});

describe("consent audit", () => {
  it("uses server-known versions for each migrated surface", () => {
    expect(consentVersionForLead("marketflow_access", "other")).toBe(
      "marketflow-access-contact-v1",
    );
    expect(consentVersionForLead("submit", "submit_page")).toBe(
      "submit-property-contact-v1",
    );
    expect(consentVersionForLead("submit", "strategy-lab")).toBe(
      "pegasus-followup-contact-v1",
    );
    expect(consentVersionForLead("submit", "launch_smoke")).toBe(
      "launch-smoke-contact-v1",
    );
    expect(consentVersionForLead("vendor", "vendor_network_page")).toBe(
      "vendor-network-contact-v1",
    );
    expect(consentVersionForLead("newsletter", "footer_newsletter")).toBe(
      "newsletter-email-v1",
    );
  });

  it("merges an immutable audit record without mutating or dropping leadData", () => {
    const original = {
      role: "operator",
      consents: { consentContact: true },
      marketflow_access_request: { introducedBy: "A. Partner" },
    };
    const capturedAt = new Date("2026-07-22T18:30:00.000Z");

    const merged = mergeLeadConsentAudit(
      original,
      { consentContact: true, consentCcpaAcknowledged: false },
      {
        leadType: "marketflow_access",
        source: "marketflow_access_page",
        capturedAt,
      },
    );

    expect(merged).toEqual({
      ...original,
      consentAudit: {
        consentContact: true,
        consentCcpaAcknowledged: false,
        source: "marketflow_access_page",
        version: "marketflow-access-contact-v1",
        capturedAt: "2026-07-22T18:30:00.000Z",
      },
    });
    expect(original).not.toHaveProperty("consentAudit");
  });

  it("safely handles a non-object leadData value", () => {
    expect(
      mergeLeadConsentAudit(
        ["not", "lead-data"],
        { consentContact: false, consentCcpaAcknowledged: false },
        {
          leadType: "contact",
          source: "contact_page",
          capturedAt: new Date("2026-07-22T18:30:00.000Z"),
        },
      ),
    ).toEqual({
      consentAudit: {
        consentContact: false,
        consentCcpaAcknowledged: false,
        source: "contact_page",
        version: "lead-contact-v1",
        capturedAt: "2026-07-22T18:30:00.000Z",
      },
    });
  });
});

describe("staff notification policy", () => {
  it("prefers the documented address, then the legacy fallback, then Apollo", () => {
    expect(
      resolveStaffNotificationRecipient({
        STAFF_NOTIFICATION_EMAIL: " intake@pegasus.test ",
        INTERNAL_NOTIFY_EMAIL: "legacy@pegasus.test",
      }),
    ).toBe("intake@pegasus.test");
    expect(
      resolveStaffNotificationRecipient({
        STAFF_NOTIFICATION_EMAIL: "",
        INTERNAL_NOTIFY_EMAIL: " legacy@pegasus.test ",
      }),
    ).toBe("legacy@pegasus.test");
    expect(resolveStaffNotificationRecipient({})).toBe(
      "apollo@pegasusdreamscapes.com",
    );
  });

  it("builds the MarketFlow alert from canonical whitelisted fields", () => {
    const notification = buildGenericLeadNotificationData({
      id: 42,
      leadType: "marketflow_access",
      source: "marketflow_access_page",
      firstName: "Taylor",
      lastName: "Operator",
      email: "taylor@example.com",
      leadData: {
        marketflow_access_request: {
          email: "taylor@example.com",
          role: "operator",
          introducedBy: "Jordan Broker",
          notes: "East Bay infill projects",
        },
        consentAudit: {
          consentContact: true,
          consentCcpaAcknowledged: false,
        },
        transcript: "must not be copied into staff email",
        secretArbitraryField: "must not appear",
      },
    });

    expect(notification.subject).toBe(
      "New MarketFlow Access Request: Taylor Operator (operator)",
    );
    expect(notification.text).toContain("Lead ID: 42");
    expect(notification.text).toContain("Role: operator");
    expect(notification.text).toContain("Introduced by: Jordan Broker");
    expect(notification.text).toContain("Notes: East Bay infill projects");
    expect(notification.text).toContain("Consent to contact: Yes");
    expect(notification.text).toContain("Privacy acknowledged: No");
    expect(notification.text).not.toContain("must not be copied");
    expect(notification.text).not.toContain("secretArbitraryField");
  });

  it.each([
    ["deal-finder", "Deal finder / Wholesaler", "wholesaler"],
    ["referral", "Referral partner", "referral"],
    ["contact", "Something else", "contact"],
  ] as const)(
    "keeps reusable %s context and message distinct in the staff alert",
    (intent, role, expectedLane) => {
      const normalized = normalizePegasusLeadSubmission({
        leadType: "submit",
        source: "form",
        firstName: "Taylor",
        lastName: "Partner",
        email: "taylor@example.com",
        leadData: {
          intent,
          role,
          context: "East Bay source context",
          contextKind: "context",
          message: "The full submitted narrative",
        },
      });

      expect(normalized.leadType).toBe(expectedLane);
      const notification = buildGenericLeadNotificationData({
        ...normalized,
        id: 77,
      });

      expect(notification.text).toContain("Context: East Bay source context");
      expect(notification.text).toContain("Message: The full submitted narrative");
    },
  );

  it("keeps the legacy generic-message fallback outside reusable forms", () => {
    const notification = buildGenericLeadNotificationData({
      id: 78,
      leadType: "contact",
      source: "contact_page",
      firstName: "Morgan",
      email: "morgan@example.com",
      leadData: { message: "A legacy contact-page message" },
    });

    expect(notification.text).toContain("Notes: A legacy contact-page message");
  });

  it("strips line breaks from subject fields and bounds the subject", () => {
    const notification = buildGenericLeadNotificationData({
      leadType: "submit",
      firstName: "Taylor\r\nBcc: attacker@example.com",
      lastName: "Owner",
      leadData: {},
    });

    expect(notification.subject).not.toMatch(/[\r\n]/);
    expect(notification.subject.length).toBeLessThanOrEqual(200);
  });
});
