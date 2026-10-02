import { afterEach, describe, expect, it, vi } from "vitest";

const services = vi.hoisted(() => ({
  sendHumanRequired: vi.fn(),
  completion: vi.fn(),
  updateConversation: vi.fn(),
}));
vi.mock("openai", () => ({ default: class { chat = { completions: { create: services.completion } }; } }));
vi.mock("../email", () => ({ sendPeggyHumanRequired: services.sendHumanRequired }));
vi.mock("../storage", () => ({ storage: {
  getPeggyMessages: async () => [],
  getPeggyConversation: async () => ({ id: 1 }),
  createPeggyMessage: async (input: object) => ({ id: 2, ...input }),
  updatePeggyConversation: services.updateConversation,
} }));

afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

describe("Peggy escalation capture without unapproved delivery", () => {
  it("records a refusal for staff review without bypassing notification activation or recipient controls", async () => {
    vi.stubEnv("AI_INTEGRATIONS_OPENAI_API_KEY", "synthetic-never-transmitted-key");
    vi.stubEnv("PEGASUS_PREVIEW_ENABLE_NOTIFICATIONS", "true");
    const { chat, FAIR_HOUSING_REFUSAL } = await import("../peggy");
    const result = await chat("Can you help me with redlining strategies?", 1);
    await vi.dynamicImportSettled();
    expect(result).toMatchObject({ response: FAIR_HOUSING_REFUSAL, disposition: "human_required", humanRequired: true });
    expect(services.updateConversation).toHaveBeenCalledWith(1, {
      humanRequired: true, humanRequiredReason: "fair_housing", disposition: "human_required",
    });
    expect(services.completion).not.toHaveBeenCalled();
    expect(services.sendHumanRequired).not.toHaveBeenCalled();
  });
});
