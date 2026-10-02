import OpenAI from "openai";

export const PEGGY_UNAVAILABLE_RESPONSE = {
  code: "peggy_unavailable",
  message: "Peggy is unavailable right now. Please try again later.",
} as const;

export class PeggyUnavailableError extends Error {
  constructor() {
    super(PEGGY_UNAVAILABLE_RESPONSE.message);
    this.name = "PeggyUnavailableError";
  }
}

let client: OpenAI | undefined;

// Peggy is optional: importing public/intake routes must not require AI
// credentials. Preserve the integration provider and the SDK's standard key
// fallback, but fail before persisting visitor data when neither is usable.
export function getPeggyAIClient(): OpenAI {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) throw new PeggyUnavailableError();
  client ??= new OpenAI({
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    apiKey,
  });
  return client;
}
