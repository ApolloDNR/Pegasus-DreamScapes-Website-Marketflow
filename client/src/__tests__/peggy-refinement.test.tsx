import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Peggy } from '@/pegasus/peggy';
import { listChats } from '@/pegasus/savedStore';
import { PEGGY_CONVERSATION_ACCESS_HEADER } from '@shared/peggy-access';

const callbacks = { setOpen: vi.fn(), toStrategyLab: vi.fn(), onHandoffToReview: vi.fn(), go: vi.fn(), toSubmit: vi.fn() };
const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
const compose = (message: string) => {
  fireEvent.change(screen.getByRole('textbox', { name: 'Talk to Peggy' }), { target: { value: message } });
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
};
function mockConversation() {
  let conversations = 0;
  let replies = 0;
  const fetcher = vi.fn((url: RequestInfo | URL, _init?: RequestInit) => Promise.resolve(
    String(url) === '/api/peggy/conversations'
      ? json({ id: ++conversations, accessToken: `test-token-${conversations}` })
      : json({ response: `Synthetic reply ${++replies}` }),
  ));
  vi.stubGlobal('fetch', fetcher);
  return fetcher;
}
beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('Peggy guided conversation refinement', () => {
  it('prepares selected questions for editing, changes roles, and sends only the reviewed draft', async () => {
    const fetcher = mockConversation();
    render(<Peggy open {...callbacks} />);
    fireEvent.click(screen.getByRole('button', { name: 'I want to sell a property' }));
    fireEvent.click(screen.getByRole('button', { name: 'I inherited a house and I am not sure what to do with it' }));
    const input = screen.getByRole('textbox', { name: 'Talk to Peggy' });
    expect(input).toHaveValue('I inherited a house and I am not sure what to do with it');
    expect(fetcher).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Change starting point' }));
    expect(screen.getByRole('button', { name: 'I want to buy with a strategy' })).toBeVisible();
    expect(input).toHaveValue('I inherited a house and I am not sure what to do with it');
    compose('My reviewed property question');
    await screen.findByText('Synthetic reply 1');
    const chat = fetcher.mock.calls.find(([url]) => url === '/api/peggy/chat');
    expect(JSON.parse(String(chat?.[1]?.body)).message).toBe('My reviewed property question');
  });

  it('updates one explicit device copy when later replies arrive', async () => {
    mockConversation();
    render(<Peggy open {...callbacks} />);
    compose('First question');
    await screen.findByText('Synthetic reply 1');
    fireEvent.click(screen.getByRole('button', { name: 'Save this conversation' }));
    const savedId = listChats()[0].id;
    expect(screen.getByRole('button', { name: 'Save this conversation' })).toBeDisabled();
    compose('Second question');
    await screen.findByText('Synthetic reply 2');
    expect(listChats()[0].transcript.some((turn) => turn.content === 'Second question')).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Save this conversation' }));
    expect(listChats()).toHaveLength(1);
    expect(listChats()[0].id).toBe(savedId);
    expect(listChats()[0].transcript.at(-1)?.content).toBe('Synthetic reply 2');
    expect(localStorage.getItem('pg:saved:chats')).not.toMatch(/test-token|accessToken|conversationId/);
  });

  it('keeps the current chat until a fresh start is confirmed, then uses fresh credentials', async () => {
    const fetcher = mockConversation();
    render(<Peggy open {...callbacks} />);
    compose('First context');
    await screen.findByText('Synthetic reply 1');
    fireEvent.click(screen.getByRole('button', { name: 'New chat' }));
    fireEvent.click(screen.getByRole('button', { name: 'Keep this chat' }));
    expect(screen.getByText('First context')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'New chat' }));
    fireEvent.click(screen.getByRole('button', { name: 'Start fresh' }));
    expect(screen.queryByText('First context')).not.toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(2);
    compose('Separate context');
    await screen.findByText('Synthetic reply 2');
    const latest = fetcher.mock.calls.filter(([url]) => url === '/api/peggy/chat').at(-1)?.[1];
    expect(JSON.parse(String(latest?.body)).conversationId).toBe(2);
    expect(new Headers(latest?.headers).get(PEGGY_CONVERSATION_ACCESS_HEADER)).toBe('test-token-2');
  });

  it.each(['stop', 'reset'])('ignores a late reply after %s and never reuses its access', async (action) => {
    let resolveReply!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => { resolveReply = resolve; });
    let conversations = 0;
    let replies = 0;
    const fetcher = vi.fn((url: RequestInfo | URL, _init?: RequestInit) => {
      if (url === '/api/peggy/conversations') return Promise.resolve(json({ id: ++conversations, accessToken: `token-${conversations}` }));
      return ++replies === 1 ? pending : Promise.resolve(json({ response: 'Fresh reply' }));
    });
    vi.stubGlobal('fetch', fetcher);
    render(<Peggy open {...callbacks} />);
    compose('Interrupted question');
    await waitFor(() => expect(fetcher.mock.calls.filter(([url]) => url === '/api/peggy/chat')).toHaveLength(1));
    const signal = fetcher.mock.calls.at(-1)?.[1]?.signal;
    expect(screen.getByRole('button', { name: 'Save this conversation' })).toBeDisabled();
    if (action === 'stop') {
      fireEvent.click(screen.getByRole('button', { name: 'Stop waiting' }));
      expect(screen.getByRole('textbox', { name: 'Talk to Peggy' })).toHaveValue('Interrupted question');
      expect(screen.getByText(/may already have been processed/)).toBeVisible();
    } else {
      fireEvent.click(screen.getByRole('button', { name: 'New chat' }));
      fireEvent.click(screen.getByRole('button', { name: 'Start fresh' }));
    }
    expect(signal?.aborted).toBe(true);
    compose('Current question');
    await screen.findByText('Fresh reply');
    await act(async () => { resolveReply(json({ response: 'Stale reply' })); await pending; });
    expect(screen.queryByText('Stale reply')).not.toBeInTheDocument();
    expect(conversations).toBe(2);
    const latest = fetcher.mock.calls.at(-1)?.[1];
    expect(new Headers(latest?.headers).get(PEGGY_CONVERSATION_ACCESS_HEADER)).toBe('token-2');
  });

  it('treats an empty AI response as a recoverable failure and preserves the draft', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => Promise.resolve(json(url === '/api/peggy/conversations' ? { id: 10, accessToken: 'test' } : { response: ' ' }))));
    render(<Peggy open {...callbacks} />);
    compose('Keep my question');
    await screen.findByText(/I can’t reach the chat service/);
    expect(screen.getByRole('textbox', { name: 'Talk to Peggy' })).toHaveValue('Keep my question');
    expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Share for Consideration' })).toBeVisible();
  });

  it('supports deliberate keyboard send but leaves ordinary Enter available for multiline context', async () => {
    const fetcher = mockConversation();
    render(<Peggy open {...callbacks} initialPrompt="Prepared question" />);
    const input = screen.getByRole('textbox', { name: 'Talk to Peggy' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(fetcher).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });
    await screen.findByText('Synthetic reply 1');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
