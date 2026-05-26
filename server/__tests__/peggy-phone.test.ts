import { describe, it, expect } from "vitest";
import {
  RECORDING_CONSENT_OPENER,
  STOP_RECORDING_PATTERN,
  TRANSFER_REQUEST_PATTERN,
  PARTNER_CODE_PATTERN,
  PEGGY_PHONE_SYSTEM_PROMPT,
  verifyPhoneWebhookSignature,
} from "../peggy-phone";
import { createHmac } from "crypto";

// Task #152 — Phone safety + voice-prompt guardrail tests. Deterministic
// unit tests only; the LLM-driven path is covered by peggy-refusals.test.ts
// (shared refusal layer) and integration testing happens on Apollo's
// adversarial call plan.

describe("Peggy phone recording consent (§632)", () => {
  it("opens every call with the verbatim two-party consent line", () => {
    expect(RECORDING_CONSENT_OPENER).toContain("Pegasus DreamScapes");
    expect(RECORDING_CONSENT_OPENER).toContain("recorded for quality and training");
    expect(RECORDING_CONSENT_OPENER).toContain("stop recording");
    expect(RECORDING_CONSENT_OPENER).toContain("unrecorded");
  });

  it.each([
    "Stop recording",
    "please stop recording",
    "don't record this",
    "no recording",
    "please don't record",
  ])("detects stop-recording variant: %s", (msg) => {
    expect(STOP_RECORDING_PATTERN.test(msg)).toBe(true);
  });

  it("does NOT trip on benign mentions of recording", () => {
    expect(STOP_RECORDING_PATTERN.test("I have my own recording of the inspection")).toBe(false);
    expect(STOP_RECORDING_PATTERN.test("The property records say it's 1,800 square feet")).toBe(false);
  });
});

describe("Peggy phone transfer + partner routing", () => {
  it.each([
    "transfer me to apollo",
    "I want to speak to a human",
    "get me apollo",
    "I want apollo",
    "speak to someone real",
  ])("detects transfer request: %s", (msg) => {
    expect(TRANSFER_REQUEST_PATTERN.test(msg)).toBe(true);
  });

  it("detects Pegasus partner priority code phrase", () => {
    expect(PARTNER_CODE_PATTERN.test("Hi, I'm a Pegasus partner calling about a JV.")).toBe(true);
    expect(PARTNER_CODE_PATTERN.test("I might want to partner with Pegasus.")).toBe(false);
  });
});

describe("Peggy phone system prompt locks", () => {
  it("inherits the chat doctrine (FH + §1695 + voice rules)", () => {
    expect(PEGGY_PHONE_SYSTEM_PROMPT).toContain("Fair Housing");
    expect(PEGGY_PHONE_SYSTEM_PROMPT).toContain("Civil Code §1695");
    expect(PEGGY_PHONE_SYSTEM_PROMPT).toContain("Pegasus' AI strategy assistant");
  });

  it("adds the voice-channel constraints", () => {
    expect(PEGGY_PHONE_SYSTEM_PROMPT).toMatch(/SHORT/);
    expect(PEGGY_PHONE_SYSTEM_PROMPT).toMatch(/No markdown/i);
    expect(PEGGY_PHONE_SYSTEM_PROMPT).toContain("recording-consent opener");
  });

  it("locks the §1695 phone routing addition (identity-only collection)", () => {
    expect(PEGGY_PHONE_SYSTEM_PROMPT).toMatch(/§1695 phone routing/i);
    expect(PEGGY_PHONE_SYSTEM_PROMPT).toContain("caller name, callback phone number");
  });
});

describe("Peggy phone webhook signature verification", () => {
  const body = JSON.stringify({ event: "turn", callSid: "test-call-1" });
  const secret = "test-secret-please-rotate";

  it("fails closed when secret is unset", () => {
    delete process.env.PEGGY_PHONE_WEBHOOK_SECRET;
    expect(verifyPhoneWebhookSignature(body, "anything")).toBe(false);
  });

  it("rejects missing signatures", () => {
    process.env.PEGGY_PHONE_WEBHOOK_SECRET = secret;
    expect(verifyPhoneWebhookSignature(body, undefined)).toBe(false);
  });

  it("rejects forged signatures", () => {
    process.env.PEGGY_PHONE_WEBHOOK_SECRET = secret;
    expect(verifyPhoneWebhookSignature(body, "deadbeef")).toBe(false);
  });

  it("accepts a correct HMAC-SHA256 signature (raw and sha256= prefix)", () => {
    process.env.PEGGY_PHONE_WEBHOOK_SECRET = secret;
    const sig = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyPhoneWebhookSignature(body, sig)).toBe(true);
    expect(verifyPhoneWebhookSignature(body, `sha256=${sig}`)).toBe(true);
  });
});
