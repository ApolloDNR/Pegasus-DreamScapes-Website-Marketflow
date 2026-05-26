import { storage } from "./storage";
import { sendPeggyDailyReport } from "./email";

// Task #151 — Peggy daily inbound report scheduler.
// Sends a digest of every conversation updated in the trailing 24 hours
// that has not yet been reported. Fires at ~06:00 America/Los_Angeles every day.
// We use a self-rescheduling setTimeout instead of node-cron to avoid adding a
// dependency.

const REPORT_HOUR_LOCAL = 6; // 06:00 PT
const REPORT_TZ = "America/Los_Angeles";

function millisUntilNextRun(): number {
  const now = new Date();
  // Compute the offset between local server time and Pacific time by formatting
  // the current instant in Pacific and parsing back.
  const ptParts = new Intl.DateTimeFormat("en-US", {
    timeZone: REPORT_TZ,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).formatToParts(now).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== "literal") acc[p.type] = p.value;
    return acc;
  }, {});
  // Build a Date representing today at REPORT_HOUR_LOCAL in PT, expressed in
  // the server's clock by computing the PT offset for "now".
  const ptNowAsUtc = Date.UTC(
    Number(ptParts.year),
    Number(ptParts.month) - 1,
    Number(ptParts.day),
    Number(ptParts.hour),
    Number(ptParts.minute),
    Number(ptParts.second),
  );
  const ptOffsetMs = ptNowAsUtc - now.getTime();
  // Next 06:00 PT (as a true wall-clock instant)
  const nextPtTargetUtc = Date.UTC(
    Number(ptParts.year),
    Number(ptParts.month) - 1,
    Number(ptParts.day),
    REPORT_HOUR_LOCAL, 0, 0,
  ) - ptOffsetMs;
  let next = nextPtTargetUtc;
  if (next <= now.getTime()) next += 24 * 60 * 60 * 1000;
  return next - now.getTime();
}

async function runDailyReport(): Promise<void> {
  try {
    const sinceMs = Date.now() - 24 * 60 * 60 * 1000;
    const conversations = await storage.getPeggyConversationsForReport(sinceMs);
    if (conversations.length === 0) {
      console.log("[peggy-cron] Daily report: no new conversations.");
      return;
    }
    const result = await sendPeggyDailyReport({ conversations });
    if (result.success) {
      await storage.markPeggyConversationsReported(conversations.map(c => c.id));
      console.log(`[peggy-cron] Daily report sent (${conversations.length} conversations).`);
    } else {
      console.error("[peggy-cron] Daily report send failed:", result.error);
    }
  } catch (err) {
    console.error("[peggy-cron] Daily report crashed:", err);
  }
}

let scheduled = false;

function scheduleNext(): void {
  const ms = millisUntilNextRun();
  setTimeout(async () => {
    await runDailyReport();
    scheduleNext();
  }, ms).unref?.();
  const hours = Math.round((ms / (60 * 60 * 1000)) * 10) / 10;
  console.log(`[peggy-cron] Next Peggy daily report in ~${hours}h.`);
}

export function startPeggyCron(): void {
  if (scheduled) return;
  scheduled = true;
  scheduleNext();
}

// Exposed for the admin "run now" endpoint
export { runDailyReport as runPeggyDailyReportNow };
