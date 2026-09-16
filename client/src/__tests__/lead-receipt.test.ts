// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readLeadReceipt, readOpportunityReceipt } from '@/lib/lead-receipt';

describe('persisted lead receipts', () => {
  it('accepts the create endpoint record and returns only receipt fields', async () => {
    await expect(readLeadReceipt(new Response(JSON.stringify({ id: 42, stage: 'new', email: 'fixture@example.com' }), { status: 201 })))
      .resolves.toEqual({ id: 42, stage: 'new' });
  });
  it.each([
    [200, { id: 42, stage: 'new' }],
    [201, { ok: true }],
    [201, { id: '42', stage: 'new' }],
    [201, { id: 0, stage: 'new' }],
    [201, { id: 42, stage: 'approved' }],
  ])('rejects status %s without the expected created-record contract', async (status, body) => {
    await expect(readLeadReceipt(new Response(JSON.stringify(body), { status }))).rejects.toThrow('usable submission receipt');
  });
  it('rejects a redirect even when its body resembles a record', async () => {
    const response = new Response(JSON.stringify({ id: 42, stage: 'new' }), { status: 201 });
    Object.defineProperty(response, 'redirected', { value: true });
    await expect(readLeadReceipt(response)).rejects.toThrow('usable submission receipt');
  });
  it('does not accept an HTML fallback as success', async () => {
    await expect(readLeadReceipt(new Response('<html>Home</html>', { status: 200 }))).rejects.toThrow();
  });
});

describe('canonical opportunity receipts', () => {
  it('accepts the New record returned by the opportunity endpoint', async () => {
    await expect(readOpportunityReceipt(new Response(JSON.stringify({ id: 'fixture-opportunity', status: 'New' }), { status: 201 }))).resolves.toEqual({ id: 'fixture-opportunity' });
  });
  it.each([[200, { id: 'fixture-opportunity', status: 'New' }], [201, { id: 'fixture-opportunity' }], [201, { id: '', status: 'New' }], [201, { ok: true }]])('rejects an unconfirmed opportunity receipt', async (status, body) => {
    await expect(readOpportunityReceipt(new Response(JSON.stringify(body), { status }))).rejects.toThrow('usable opportunity receipt');
  });
});
