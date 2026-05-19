import { describe, it, expect } from "vitest";
import {
  insertSellerLeadSchema,
  insertInvestorLeadSchema,
  insertBuyerLeadSchema,
  insertContactSchema,
} from "@shared/schema";

describe("Lead submission validation (server Zod schemas)", () => {
  describe("insertSellerLeadSchema", () => {
    const valid = {
      name: "Apollo Tester",
      phone: "925-555-0100",
      email: "test@example.com",
      propertyAddress: "123 Demo St, Concord, CA",
      propertyType: "single_family",
      condition: "needs_work",
      timeline: "30_days",
      notes: "Inherited property, looking for options.",
    };

    it("accepts a fully valid seller payload", () => {
      const result = insertSellerLeadSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("treats notes as optional", () => {
      const { notes: _omit, ...withoutNotes } = valid;
      expect(insertSellerLeadSchema.safeParse(withoutNotes).success).toBe(true);
    });

    it.each([
      "name",
      "phone",
      "email",
      "propertyAddress",
      "propertyType",
      "condition",
      "timeline",
    ] as const)("rejects payload missing required field: %s", (field) => {
      const payload: Record<string, unknown> = { ...valid };
      delete payload[field];
      const result = insertSellerLeadSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("rejects empty-object payload", () => {
      expect(insertSellerLeadSchema.safeParse({}).success).toBe(false);
    });

    it("does not require server-controlled fields (id, status, createdAt)", () => {
      // The insert schema omits id/status/createdAt — a payload that
      // includes them is fine, and a payload that omits them still
      // parses. We assert via behavior (parse success) rather than
      // poking at the schema's internal shape.
      const withServerFields = {
        ...valid,
        id: 999,
        status: "won",
        createdAt: new Date().toISOString(),
      };
      expect(insertSellerLeadSchema.safeParse(withServerFields).success).toBe(
        true,
      );
      expect(insertSellerLeadSchema.safeParse(valid).success).toBe(true);
    });
  });

  describe("insertInvestorLeadSchema", () => {
    const valid = {
      name: "Capital Partner",
      email: "capital@example.com",
      phone: "925-555-0101",
      cityState: "Walnut Creek, CA",
      capitalRange: "100k_250k",
      investmentPreference: "debt",
      experienceLevel: "experienced",
    };

    it("accepts a fully valid investor payload", () => {
      expect(insertInvestorLeadSchema.safeParse(valid).success).toBe(true);
    });

    it.each([
      "name",
      "email",
      "phone",
      "cityState",
      "capitalRange",
      "investmentPreference",
      "experienceLevel",
    ] as const)("rejects payload missing required field: %s", (field) => {
      const payload: Record<string, unknown> = { ...valid };
      delete payload[field];
      expect(insertInvestorLeadSchema.safeParse(payload).success).toBe(false);
    });
  });

  describe("insertBuyerLeadSchema", () => {
    const valid = {
      name: "Retail Buyer",
      email: "buyer@example.com",
      phone: "925-555-0102",
      cityState: "Pleasant Hill, CA",
      buyerType: "owner_occupant",
      propertyTypes: "single_family",
      budgetRange: "500k_750k",
      timeline: "60_days",
      fundingStatus: "pre_approved",
    };

    it("accepts a fully valid buyer payload", () => {
      expect(insertBuyerLeadSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects payload missing budgetRange", () => {
      const { budgetRange: _omit, ...rest } = valid;
      expect(insertBuyerLeadSchema.safeParse(rest).success).toBe(false);
    });
  });

  describe("insertContactSchema", () => {
    const valid = {
      name: "Inquirer",
      email: "hello@example.com",
      subject: "General question",
      message: "Looking for more information about Pegasus.",
    };

    it("accepts a payload without phone (phone is optional)", () => {
      expect(insertContactSchema.safeParse(valid).success).toBe(true);
    });

    it("accepts a payload with phone included", () => {
      expect(
        insertContactSchema.safeParse({ ...valid, phone: "925-555-0103" })
          .success,
      ).toBe(true);
    });

    it.each(["name", "email", "subject", "message"] as const)(
      "rejects payload missing required field: %s",
      (field) => {
        const payload: Record<string, unknown> = { ...valid };
        delete payload[field];
        expect(insertContactSchema.safeParse(payload).success).toBe(false);
      },
    );
  });
});
