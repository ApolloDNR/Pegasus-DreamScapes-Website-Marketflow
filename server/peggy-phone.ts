import { storage } from "./storage";
import {
  detectRefusalTrigger,
  applyPostOutputGuard,
  extractIntake,
  PEGGY_SYSTEM_PROMPT,
  FAIR_HOUSING_REFUSAL,
  SECTION_1695_DISCLOSURE,
} from "./peggy";
import { sendPeggyHumanRequired } from "./email";

// =========================================================================
// Task #152 — Peggy ASAP phone line.
//
// This module is the doctrine + safety layer that sits between any voice
// vendor (Vapi, Bland.ai, Retell, SignalWire) and the Peggy intake store.
// Vendor selection is Apollo's call — this layer is vendor-agnostic and
// reuses the chat refusal / guard / intake logic so phone and web stay in
// behavioral lockstep.
//
// Amendment 2 §D.4 launch gates enforced in code:
//   Gate 1 — CA Penal Code §632 (two-party recording consent)
//   Gate 2 — Fair Housing hard refusal
//   Gate 3 — DRE licensing (no price / value / fitness representations)
//   Gate 4 — Civil Code §1695 (foreclosure + owner-occupant disclosure)
//
// Apollo-side work that is NOT covered by code (called out in commit msg):
//   - Vendor signup, API key, webhook URL configuration
//   - Phone number port / forwarding
//   - Voice audition + Apollo approval of TTS voice
//   - Adversarial test calls
// =========================================================================

// Verbatim recording-consent opener for CA §632. Spoken on first turn of
// every call, before any qualifying questions.
export const RECORDING_CONSENT_OPENER =
  "Hi, this is Peggy with Pegasus DreamScapes. This call is recorded for quality and training. Please say 'stop recording' if you'd prefer I don't, and the call continues unrecorded.";

// Pattern fired against caller turns to honor §632 mid-call.
export const STOP_RECORDING_PATTERN =
  /\b(stop\s+recording|don'?t\s+record|no\s+recording|please\s+(?:stop|don'?t)\s+(?:record|recording))\b/i;

export const TRANSFER_REQUEST_PATTERN =
  /\b(transfer\s+(?:me\s+)?to\s+apollo|speak\s+to\s+(?:apollo|a\s+human|someone\s+real)|i\s+want\s+(?:apollo|a\s+human)|get\s+(?:me\s+)?apollo)\b/i;

export const PARTNER_CODE_PATTERN =
  /\bi'?m\s+a\s+pegasus\s+partner\b/i;

// Phone-specific system prompt. Layers voice constraints (shorter turns,
// no markdown, plain spoken English) on top of the canonical chat prompt.
// We splice in the chat prompt so any future doctrine update to the chat
// prompt propagates to phone automatically.
export const PEGGY_PHONE_SYSTEM_PROMPT = `${PEGGY_SYSTEM_PROMPT}

# Voice channel constraints (phone)

You are speaking out loud to a real person on the phone. The chat rules above still apply, with these additions:

- Keep turns SHORT — one or two sentences, then stop and listen.
- No markdown. No bullets. No URLs spoken as "slash submit". When you need to route someone, say "Apollo will follow up by email" or "we can text you the link" — never speak a slash-path aloud.
- No tables, no code, no JSON.
- Caller already heard the recording-consent opener. Do not repeat it unless asked.
- If the caller asks you to repeat, repeat exactly what you said, slower.
- If the caller goes silent for more than ~6 seconds, ask one gentle follow-up. After two silences in a row, offer to take a callback number and end the call politely.
- If the caller asks to speak to a human or asks to transfer to Apollo, confirm once ("Would you like me to transfer you to Apollo's line now?") and then yield to the transfer.

# §1695 phone routing addition

After reading the §1695 disclosure on the phone, do NOT ask additional qualifying questions about the property, the loan, the equity position, or the timeline. Collect ONLY: caller name, callback phone number, best time to reach. Then say: "Apollo will call you back today. Thank you for calling Pegasus." End the call.

# Recording stop

If the caller says any variant of "stop recording" or "don't record" at any point, acknowledge once with: "Of course. I've stopped the recording. We can keep talking." Continue the conversation with the recording stopped. Never argue, negotiate, or explain why recording would be helpful.`;

// =========================================================================
// Vendor-agnostic event types. Modeled on Vapi's webhook payload because
// Vapi is the working recommendation, but any vendor that can POST a turn
// transcript + receive a JSON response can drive this module.
// =========================================================================

export interface PeggyPhoneTurnEvent {
  callSid: string;             // vendor call identifier
  callerNumber?: string;       // E.164
  transcript: string;          // what the caller just said
  turnIndex: number;           // 0-based caller turn number
  recordingActive: boolean;    // current vendor-side recording state
}

export interface PeggyPhoneTurnResponse {
  say: string;                 // what Peggy should speak next
  endCall?: boolean;           // hang up after speaking
  transferTo?: string;         // E.164 to bridge to (Apollo's line)
  stopRecording?: boolean;     // vendor must stop recording before next turn
  humanRequired?: boolean;     // flag for vendor observability dashboards
}

export interface PeggyPhoneEndEvent {
  callSid: string;
  durationSec: number;
  fullTranscript: Array<{ role: "user" | "assistant"; content: string }>;
  recordingUrl?: string;
}

const APOLLO_DIRECT_LINE = process.env.APOLLO_DIRECT_PHONE || "+19257448525";

// =========================================================================
// Per-turn handler. Pure-function-ish: queries storage, runs guards, returns
// the next thing Peggy should say. Vendor speaks `say`, performs `transferTo`
// / `stopRecording` / `endCall` actions, then sends the next turn back.
// =========================================================================

export async function handlePhoneTurn(event: PeggyPhoneTurnEvent): Promise<PeggyPhoneTurnResponse> {
  // Find or create the phone conversation row keyed on vendor callSid.
  let conversation = await findPhoneConversationBySid(event.callSid);
  if (!conversation) {
    conversation = await storage.createPeggyConversation({
      sessionId: `phone:${event.callSid}`,
      channel: "phone",
      callSid: event.callSid,
      callerNumber: event.callerNumber,
      recordingConsent: event.recordingActive ? "granted" : "pending",
      contextType: "page",
      contextPage: "/peggy:phone",
    } as any);
  }

  // Gate 1 — §632. If the caller asks to stop recording, honor immediately.
  if (STOP_RECORDING_PATTERN.test(event.transcript)) {
    await storage.updatePeggyConversation(conversation.id, {
      recordingConsent: "revoked",
      recordingStoppedAt: new Date(),
    } as any);
    await storage.createPeggyMessage({
      conversationId: conversation.id,
      role: "user",
      content: event.transcript,
    });
    const say =
      "Of course. I've stopped the recording. We can keep talking. What's the situation you'd like Pegasus to look at?";
    await storage.createPeggyMessage({
      conversationId: conversation.id,
      role: "assistant",
      content: say,
      model: "phone_recording_stop",
    });
    return { say, stopRecording: true };
  }

  // Transfer request — explicit hand-off to Apollo's line.
  if (TRANSFER_REQUEST_PATTERN.test(event.transcript) || PARTNER_CODE_PATTERN.test(event.transcript)) {
    await storage.createPeggyMessage({
      conversationId: conversation.id,
      role: "user",
      content: event.transcript,
    });
    const say =
      "Transferring you to Apollo now. If he's not available, you'll be sent to his direct voicemail and he'll call you back today.";
    await storage.createPeggyMessage({
      conversationId: conversation.id,
      role: "assistant",
      content: say,
      model: "phone_transfer",
    });
    await storage.updatePeggyConversation(conversation.id, {
      disposition: "human_required",
      humanRequired: true,
      humanRequiredReason: PARTNER_CODE_PATTERN.test(event.transcript)
        ? "partner_priority_routing"
        : "transfer_requested",
    } as any);
    return { say, transferTo: APOLLO_DIRECT_LINE, humanRequired: true };
  }

  // Persist caller turn
  await storage.createPeggyMessage({
    conversationId: conversation.id,
    role: "user",
    content: event.transcript,
  });

  // Gates 2 & 4 — Fair Housing / §1695. Pre-LLM, deterministic, never
  // round-tripped to the model. Shared with chat refusal layer.
  const trigger = detectRefusalTrigger(event.transcript);
  if (trigger) {
    const refusalText =
      trigger === "fair_housing" ? FAIR_HOUSING_REFUSAL : SECTION_1695_DISCLOSURE;
    await storage.createPeggyMessage({
      conversationId: conversation.id,
      role: "assistant",
      content: refusalText,
      model: "refusal_guard:phone",
    });
    await storage.updatePeggyConversation(conversation.id, {
      humanRequired: true,
      humanRequiredReason: trigger,
      disposition: "human_required",
    } as any);
    // Immediate Apollo notification (Gate 4 in particular is time-sensitive)
    void notifyHumanRequired(conversation.id, trigger).catch(err =>
      console.error("[peggy-phone] Apollo notification failed:", err),
    );
    // On §1695, after disclosure we collect identity only — keep the call
    // open but flagged. Fair Housing also stays open in case caller pivots
    // (the model still won't engage with the protected-class thread).
    return { say: refusalText, humanRequired: true };
  }

  // Normal LLM turn. We lazy-import the OpenAI client by reusing chat()'s
  // history mechanism via getPeggyMessages + a phone-prompted completion.
  const history = await storage.getPeggyMessages(conversation.id);
  const { generatePhoneResponse } = await import("./peggy-phone-llm");
  const raw = await generatePhoneResponse(history.map(m => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  })));
  const { sanitized, violations } = applyPostOutputGuard(raw);
  if (violations.length > 0) {
    console.warn(`[peggy-phone] voice-guard violations on call ${event.callSid}:`, violations);
  }
  await storage.createPeggyMessage({
    conversationId: conversation.id,
    role: "assistant",
    content: sanitized,
    model: "phone:gpt-5",
  });

  // Every 2 caller turns, fire-and-forget intake extraction.
  const userTurns = history.filter(m => m.role === "user").length + 1;
  if (userTurns >= 2 && userTurns % 2 === 0) {
    void extractIntake(
      history
        .filter(m => m.role !== "system")
        .map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    )
      .then(async result => {
        if (!result) return;
        await storage.updatePeggyConversation(conversation!.id, {
          intake: result.intake as any,
          disposition: result.disposition || undefined,
          summary: result.summary || undefined,
          contactName: result.intake.identity?.name,
          contactEmail: result.intake.identity?.email,
          contactPhone: result.intake.identity?.phone,
        });
      })
      .catch(err => console.error("[peggy-phone] intake update failed:", err));
  }

  return { say: sanitized };
}

// End-of-call handler. Stores duration, runs a final intake extraction, and
// emails Apollo if the call ended on a human_required disposition.
export async function handlePhoneEnd(event: PeggyPhoneEndEvent): Promise<void> {
  const conversation = await findPhoneConversationBySid(event.callSid);
  if (!conversation) {
    console.warn(`[peggy-phone] End event for unknown callSid ${event.callSid}`);
    return;
  }
  const result = await extractIntake(event.fullTranscript);
  const patch: any = {
    durationSec: event.durationSec,
    endedAt: new Date(),
  };
  if (result) {
    patch.intake = result.intake;
    patch.disposition = result.disposition || conversation.disposition || undefined;
    patch.summary = result.summary || conversation.summary || undefined;
    if (result.intake.identity?.name) patch.contactName = result.intake.identity.name;
    if (result.intake.identity?.email) patch.contactEmail = result.intake.identity.email;
    if (result.intake.identity?.phone) patch.contactPhone = result.intake.identity.phone;
  }
  const updated = await storage.updatePeggyConversation(conversation.id, patch);
  if (updated?.humanRequired && !updated?.reportedAt) {
    const transcript = await storage.getPeggyMessages(conversation.id);
    await sendPeggyHumanRequired({
      conversation: updated,
      transcript,
      reason: updated.humanRequiredReason || "phone_end",
    });
  }
}

async function findPhoneConversationBySid(callSid: string) {
  // Phone sessions are stored with sessionId = `phone:<callSid>`.
  const rows = await storage.getPeggyConversations(undefined, `phone:${callSid}`);
  return rows[0];
}

// Lazy-import-friendly re-export for the §1695/FH email path.
async function notifyHumanRequired(conversationId: number, reason: string): Promise<void> {
  const conversation = await storage.getPeggyConversation(conversationId);
  if (!conversation) return;
  const transcript = await storage.getPeggyMessages(conversationId);
  await sendPeggyHumanRequired({ conversation, transcript, reason });
}

// =========================================================================
// Vendor webhook signature verification.
// Vapi signs webhooks with HMAC-SHA256 in the x-vapi-secret header by
// default — we accept any HMAC-SHA256 over the raw body using
// PEGGY_PHONE_WEBHOOK_SECRET. If the env var is unset we refuse all
// webhooks (fail-closed) so a misconfigured production environment can't
// silently accept anonymous calls into the intake store.
// =========================================================================

export function verifyPhoneWebhookSignature(rawBody: string, signature: string | undefined): boolean {
  const secret = process.env.PEGGY_PHONE_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[peggy-phone] PEGGY_PHONE_WEBHOOK_SECRET unset — refusing webhook");
    return false;
  }
  if (!signature) return false;
  // crypto is a node builtin — eager import to keep this synchronous.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createHmac, timingSafeEqual } = require("crypto");
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = signature.replace(/^sha256=/, "").trim();
  if (expected.length !== provided.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(provided, "hex"));
  } catch {
    return false;
  }
}
