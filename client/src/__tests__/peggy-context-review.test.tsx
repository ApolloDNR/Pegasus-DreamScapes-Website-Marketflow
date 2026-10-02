import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Peggy } from '@/pegasus/peggy';
const props = { open: true, setOpen: vi.fn(), toStrategyLab: vi.fn(), onHandoffToReview: vi.fn(), go: vi.fn(), toSubmit: vi.fn() };
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const json = (value: unknown) => new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } });

describe('Peggy property context review', () => {
  it('sends only on request and starts a fresh conversation for a new property brief', async () => {
    let conversations = 0;
    const fetcher = vi.fn(async (url: string) => url.endsWith('/conversations') ? json({ id: ++conversations, accessToken: `test-${conversations}` }) : json({ response: 'Supplied context explained.' }));
    vi.stubGlobal('fetch', fetcher);
    const { rerender } = render(<Peggy {...props} initialPrompt="First property, Base scenario" />);
    expect(screen.getByRole('textbox', { name: 'Talk to Peggy' })).toHaveValue('First property, Base scenario');
    expect(fetcher).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('textbox', { name: 'Talk to Peggy' }), { target: { value: 'Edited first property' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await screen.findByText('Supplied context explained.');
    rerender(<Peggy {...props} initialPrompt="Second property, Conservative scenario" />);
    expect(screen.queryByText('Edited first property')).not.toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(4));
    expect(conversations).toBe(2);
    const call = fetcher.mock.calls[3] as unknown as [string, RequestInit];
    expect(JSON.parse(String(call[1].body))).toMatchObject({ conversationId: 2, message: 'Second property, Conservative scenario' });
  });

  it('ignores an old conversation response after the property context changes', async () => {
    let resolve!: (value: Response) => void;
    const pending = new Promise<Response>(r => { resolve = r; });
    const fetcher = vi.fn(() => pending);
    vi.stubGlobal('fetch', fetcher);
    const { rerender } = render(<Peggy {...props} initialPrompt="First property" />);
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    rerender(<Peggy {...props} initialPrompt="Second property" />);
    await act(async () => { resolve(json({ id: 1, accessToken: 'old-test-access' })); await pending; });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('textbox', { name: 'Talk to Peggy' })).toHaveValue('Second property');
    expect(screen.queryByText('First property')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled();
  });

  it('keeps the outgoing draft editable after the service fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 503 })));
    render(<Peggy {...props} initialPrompt="My property question" />);
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Talk to Peggy' })).toHaveValue('My property question'));
    expect(screen.getByRole('textbox', { name: 'Talk to Peggy' })).toBeEnabled();
    expect(screen.getByText(/I can’t reach the chat service/)).toBeVisible();
  });
});
