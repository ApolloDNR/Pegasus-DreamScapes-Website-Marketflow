import { afterEach, describe, expect, it, vi } from "vitest";

const originalSendGridKey = process.env.SENDGRID_API_KEY;

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
  if (originalSendGridKey === undefined) delete process.env.SENDGRID_API_KEY;
  else process.env.SENDGRID_API_KEY = originalSendGridKey;
});

describe("email delivery fallback", () => {
  it("fails visibly without placing recipient or message PII in logs", async () => {
    delete process.env.SENDGRID_API_KEY;
    vi.resetModules();

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { sendEmail } = await import("../email");

    const result = await sendEmail({
      to: "sensitive.person@example.test",
      subject: "123 Private Address",
      text: "Call 510-555-0199. Notes: confidential situation.",
    });

    expect(result).toEqual({
      success: false,
      fallback: true,
      error: "Email delivery is not configured",
    });

    const logged = JSON.stringify([
      ...logSpy.mock.calls,
      ...warnSpy.mock.calls,
    ]);
    expect(logged).not.toContain("sensitive.person@example.test");
    expect(logged).not.toContain("123 Private Address");
    expect(logged).not.toContain("510-555-0199");
    expect(logged).not.toContain("confidential situation");
    expect(logged).toContain("SendGrid is not configured");
  });
});
