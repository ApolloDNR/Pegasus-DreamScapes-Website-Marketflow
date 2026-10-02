import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createSendGridNotificationSender,
  dispatchNotification,
  isNotificationRecipientAllowed,
  shouldStartNotificationWorker,
  startNotificationWorker,
  type NotificationJob,
} from '../notifications';

const job: NotificationJob = {
  id: 'c2000000-0000-4000-8000-000000000001',
  orgId: 'c2000000-0000-4000-8000-000000000002',
  idempotencyKey: 'c2000000-0000-4000-8000-000000000003',
  websiteRecord: { type: 'opportunity', id: 'c2000000-0000-4000-8000-000000000004' },
  purpose: 'receipt',
  payload: { to: 'synthetic@example.test', subject: 'Recorded inquiry', text: '<img src=x onerror="alert(1)"> & original text' },
};
const configured = { SENDGRID_API_KEY: 'synthetic-test-key', DEFAULT_FROM_EMAIL: 'sender@example.test' };
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe('notification sender outcomes', () => {
  it('provider_acceptance_is_not_delivery', async () => {
    const transport = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => new Response(null, { status: 202, headers: { 'x-message-id': 'synthetic-message-1' } }));
    const sender = createSendGridNotificationSender(configured, transport);
    expect(await sender(job, { signal: new AbortController().signal })).toEqual({ outcome: 'accepted', providerMessageId: 'synthetic-message-1' });
    expect(await dispatchNotification(job, sender)).toBe('accepted');
    const body = JSON.parse(String(transport.mock.calls[0][1]?.body));
    expect(body.custom_args).toEqual({ notification_job_id: job.id, notification_purpose: 'receipt' });
    expect(transport.mock.calls[0][1]?.redirect).toBe('error');
    expect(body).not.toHaveProperty('delivered');
  });

  it('email_html_escaped_by_plain_text_transport_preserving_original_content', async () => {
    const transport = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => new Response(null, { status: 202, headers: { 'x-message-id': 'synthetic-id' } }));
    await createSendGridNotificationSender(configured, transport)(job, { signal: new AbortController().signal });
    const body = JSON.parse(String(transport.mock.calls[0][1]?.body));
    expect(body.content).toEqual([{ type: 'text/plain', value: job.payload.text }]);
    expect(body.content.some((entry: {type:string}) => entry.type === 'text/html')).toBe(false);
  });

  it.each([202, 200, 408, 500, 502, 503])('unconfirmed HTTP %s is ambiguous and never a safe retry', async (status) => {
    const sender = createSendGridNotificationSender(configured, async () => new Response(null, { status }));
    expect(await dispatchNotification(job, sender)).toBe('needs_reconciliation');
  });

  it('transport failure is ambiguous without logging private errors', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const sender = createSendGridNotificationSender(configured, async () => { throw new Error('synthetic@example.test PRIVATE CONTENT'); });
    expect(await sender(job, { signal: new AbortController().signal })).toEqual({ outcome: 'ambiguous', reason: 'provider_transport_uncertain' });
    expect(log).not.toHaveBeenCalled();
  });

  it.each([400, 401, 403, 404, 405, 413, 422, 429])('HTTP %s is a definite rejection', async (status) => {
    const sender = createSendGridNotificationSender(configured, async () => new Response(null, { status }));
    expect(await sender(job, { signal: new AbortController().signal })).toEqual({ outcome: 'definitely_not_sent', reason: `provider_http_${status}`, retryable: status === 429 });
    expect(await dispatchNotification(job, sender)).toBe('deferred');
  });

  it('missing provider configuration never attempts the network', async () => {
    const transport = vi.fn();
    expect(await dispatchNotification(job, createSendGridNotificationSender({}, transport))).toBe('deferred');
    expect(transport).not.toHaveBeenCalled();
  });

  it('15 second timeout aborts the attempt and requires reconciliation', async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const pending = dispatchNotification(job, async (_job, options) => { signal = options.signal; return new Promise(() => {}); });
    await vi.advanceTimersByTimeAsync(15_000);
    expect(await pending).toBe('needs_reconciliation');
    expect(signal?.aborted).toBe(true);
  });

  it('invalid or thrown sender outcomes cannot authorize retry', async () => {
    expect(await dispatchNotification(job, async () => { throw new Error('private'); })).toBe('needs_reconciliation');
    expect(await dispatchNotification(job, async () => ({ outcome: 'accepted', providerMessageId: '' }))).toBe('needs_reconciliation');
  });
});

describe('notification startup and recipient gates', () => {
  it.each([undefined, 'false', 'TRUE', '1', ' true ', 'True'])('stays disabled without exact opt-in %s', (flag) => {
    expect(shouldStartNotificationWorker('persistent', { WEBSITE_ORG_ID: job.orgId, APP_ENV: 'production', PEGASUS_ENABLE_NOTIFICATION_WORKER: flag })).toBe(false);
  });
  it('requires persistent runtime and a valid explicit organization', () => {
    const env = { WEBSITE_ORG_ID: job.orgId, PEGASUS_ENABLE_NOTIFICATION_WORKER: 'true' };
    expect(shouldStartNotificationWorker('persistent', env)).toBe(true);
    expect(shouldStartNotificationWorker('serverless', env)).toBe(false);
    expect(shouldStartNotificationWorker('persistent', { ...env, WEBSITE_ORG_ID: '' })).toBe(false);
  });
  it('preview requires its separate exact opt-in even if labelled production', () => {
    const env = { WEBSITE_ORG_ID: job.orgId, PEGASUS_ENABLE_NOTIFICATION_WORKER: 'true', APP_ENV: 'production', VERCEL_ENV: 'preview' };
    for (const flag of [undefined, 'false', 'TRUE', '1', ' true ']) {
      expect(shouldStartNotificationWorker('persistent', { ...env, PEGASUS_PREVIEW_ENABLE_NOTIFICATIONS: flag })).toBe(false);
    }
    expect(shouldStartNotificationWorker('persistent', { ...env, PEGASUS_PREVIEW_ENABLE_NOTIFICATIONS: 'true' })).toBe(true);
    expect(shouldStartNotificationWorker('persistent', { ...env, APP_ENV: 'preview', VERCEL_ENV: undefined })).toBe(false);
  });
  it('staging_recipient_not_allowlisted_blocked and production labels cannot override preview', () => {
    for (const APP_ENV of ['preview', 'staging', 'development', undefined]) {
      expect(isNotificationRecipientAllowed(job.payload.to, { APP_ENV })).toBe(false);
      expect(isNotificationRecipientAllowed(job.payload.to, { APP_ENV, PEGASUS_NOTIFICATION_ALLOWED_RECIPIENTS: 'other@example.test, SYNTHETIC@example.test' })).toBe(true);
      expect(isNotificationRecipientAllowed('other+tag@example.test', { APP_ENV, PEGASUS_NOTIFICATION_ALLOWED_RECIPIENTS: 'other@example.test' })).toBe(false);
    }
    expect(isNotificationRecipientAllowed(job.payload.to, { APP_ENV: 'production' })).toBe(true);
    expect(isNotificationRecipientAllowed(job.payload.to, { APP_ENV: 'production', VERCEL_ENV: 'preview' })).toBe(false);
  });
  it('disabled workers never touch the database or sender', async () => {
    const sender = vi.fn();
    const db = { execute: vi.fn() };
    const worker = startNotificationWorker(db as any, { runtime: 'serverless', environment: { WEBSITE_ORG_ID: job.orgId, PEGASUS_PREVIEW_ENABLE_NOTIFICATIONS: 'true' }, sender });
    expect(worker.enabled).toBe(false);
    await worker.stop();
    expect(db.execute).not.toHaveBeenCalled();
    expect(sender).not.toHaveBeenCalled();
  });
});
