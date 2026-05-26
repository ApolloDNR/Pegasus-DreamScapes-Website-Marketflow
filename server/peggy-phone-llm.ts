import OpenAI from "openai";
import { PEGGY_PHONE_SYSTEM_PROMPT } from "./peggy-phone";

// Task #152 — phone-channel LLM call. Split into its own module so
// peggy-phone.ts can lazy-import it and stay easy to unit-test without
// hitting OpenAI.
//
// Model lock: GPT-5 per repo policy (do not downgrade). Voice latency is
// vendor-side (Vapi handles streaming TTS on its end); we return the full
// text and let the vendor stream it.

const DEFAULT_MODEL = "gpt-5";

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

export async function generatePhoneResponse(
  history: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    max_tokens: 240,
    temperature: 0.5,
    messages: [
      { role: "system", content: PEGGY_PHONE_SYSTEM_PROMPT },
      ...history.map(m => ({ role: m.role, content: m.content })),
    ],
  });
  return (
    completion.choices[0]?.message?.content ||
    "I'm sorry, I lost you for a moment. Could you say that again?"
  );
}
