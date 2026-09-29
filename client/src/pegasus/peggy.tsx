import React, { useEffect, useRef, useId, useState, useCallback } from 'react';
import { X, Send, ArrowRight, ChevronDown, CornerDownLeft, Loader2, Bookmark, BookmarkCheck, Plus, FileText } from 'lucide-react';
import type { ChatTurn, PeggyHandoff, Nav } from './theme';
import { PEGGY_ROLES, PEGGY_FOLLOWUPS, PEGGY_SLA, PEGGY_COMPLIANCE, PEGGY_STATUS } from './data';
import { BrandMark } from './primitives';
import { addChat, updateChat } from './savedStore';
import {
  type PeggyConversationAccessResponse,
} from '@shared/peggy-access';
import { peggyFetchWithSingleRefresh } from '@/lib/peggy-access';

const GREETING =
  "I’m Peggy, Pegasus’s AI intake assistant. Tell me what you’re considering. I can help you explore the public paths and prepare your next question.";

const FALLBACK =
  "I can’t reach the chat service right now. Your draft is ready to edit and send again. You can also continue in Strategy Lab or share it for consideration.";

type ChatMessage = { role: 'user' | 'assistant'; content: string; notice?: boolean };

type HandoffAction =
  | { action: 'strategylab' }
  | { action: 'review'; role?: string; area?: string; situation?: string };

const HANDOFF_RE = /\[\[HANDOFF\]\]([\s\S]*?)\[\[\/HANDOFF\]\]/;

function SaveChatButton({ turns, pending }: { turns: ChatTurn[]; pending: boolean }) {
  const [saved, setSaved] = useState<{ id: string; fingerprint: string } | null>(null);
  const [failed, setFailed] = useState(false);
  const fingerprint = JSON.stringify(turns);
  const isSaved = saved?.fingerprint === fingerprint;

  const firstUser = turns.find((t) => t.role === 'user')?.content ?? '';
  const title = firstUser ? firstUser.slice(0, 80) : 'Peggy conversation';

  const onClick = () => {
    if (isSaved || pending) return;
    const result = saved ? updateChat(saved.id, title, turns) : addChat(title, turns);
    setFailed(!result.ok);
    if (result.ok) setSaved({ id: result.value.id, fingerprint });
  };

  return (
    <button type="button" onClick={onClick} disabled={isSaved || pending}
      aria-label={failed ? 'Retry saving this conversation' : 'Save this conversation'}
      title="Save a transcript copy on this device"
      className="peggy-text-button">
      {isSaved ? (
        <><BookmarkCheck size={15} aria-hidden="true" /> Saved on this device</>
      ) : failed ? (
        <><Bookmark size={15} aria-hidden="true" /> <span role="status">Save failed. Retry</span></>
      ) : (
        <><Bookmark size={15} aria-hidden="true" /> {saved ? 'Save latest' : 'Save chat'}</>
      )}
    </button>
  );
}

/** Splits a (possibly partial) assistant message into visible prose and a parsed handoff. */
export function splitHandoff(raw: string): { text: string; action: HandoffAction | null } {
  // While streaming, hide everything from the opening marker onward so the raw
  // directive never flashes on screen.
  const openIdx = raw.indexOf('[[HANDOFF]]');
  const match = raw.match(HANDOFF_RE);
  let action: HandoffAction | null = null;
  if (match) {
    try {
      const parsed = JSON.parse(match[1].trim()) as HandoffAction;
      if (parsed && (parsed.action === 'strategylab' || parsed.action === 'review')) action = parsed;
    } catch {
      action = null;
    }
  }
  const text = (openIdx >= 0 ? raw.slice(0, openIdx) : raw).trim();
  return { text, action };
}

export function Peggy({
  open,
  setOpen,
  toStrategyLab,
  onHandoffToReview,
  go,
  toSubmit,
  initialRole = null,
  initialPrompt = null,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  toStrategyLab: () => void;
  onHandoffToReview: (h: PeggyHandoff) => void;
  go: Nav;
  toSubmit: (intent?: string) => void;
  initialRole?: string | null;
  initialPrompt?: string | null;
}) {
  const panelId = useId();
  const composerHintId = useId();
  const fabRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const conversationAccessRef =
    useRef<PeggyConversationAccessResponse | null>(null);

  const requestGeneration = useRef(0);
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: GREETING }]);
  const [draft, setDraft] = useState('');
  const suppliedPromptRef = useRef<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [errored, setErrored] = useState(false);
  const [pickedRole, setPickedRole] = useState<string | null>(null);
  const [prepared, setPrepared] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [conversationKey, setConversationKey] = useState(0);

  // When the panel is opened from a page chip with a role already chosen,
  // skip the "who am I helping?" step and jump straight to that role's prompts.
  useEffect(() => {
    if (open && !messages.some((message) => message.role === 'user')) {
      setPickedRole(typeof initialRole === 'string' && initialRole ? initialRole : null);
    }
  }, [open, initialPrompt, initialRole]);

  useEffect(() => {
    if (!open) { suppliedPromptRef.current = null; return; }
    if (initialPrompt?.trim() && initialPrompt !== suppliedPromptRef.current) {
      suppliedPromptRef.current = initialPrompt;
      requestGeneration.current += 1;
      abortRef.current?.abort();
      abortRef.current = null;
      conversationAccessRef.current = null;
      setMessages([{ role: 'assistant', content: GREETING }]);
      setStreaming(false);
      setErrored(false);
      setPrepared(true);
      setConfirmReset(false);
      setConversationKey((key) => key + 1);
      setDraft(initialPrompt.trim());
    }
  }, [open, initialPrompt]);

  useEffect(() => {
    if (!open) return;
    if (document.activeElement instanceof HTMLElement && !panelRef.current?.contains(document.activeElement)) openerRef.current = document.activeElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); (openerRef.current ?? fabRef.current)?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    const id = requestAnimationFrame(() => (initialPrompt ? inputRef.current : panelRef.current)?.focus({ preventScroll: true }));
    return () => { document.removeEventListener('keydown', onKey); cancelAnimationFrame(id); };
  }, [open, setOpen, initialPrompt]);

  // Match the visible viewport when a mobile soft keyboard reduces usable space.
  useEffect(() => {
    if (!open || !window.visualViewport) return;
    const viewport = window.visualViewport;
    const update = () => {
      panelRef.current?.style.setProperty('--peggy-viewport-height', `${viewport.height}px`);
      panelRef.current?.style.setProperty('--peggy-keyboard-offset', `${Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)}px`);
    };
    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => { viewport.removeEventListener('resize', update); viewport.removeEventListener('scroll', update); };
  }, [open]);

  // Keep the transcript scrolled to the latest turn.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = messages.some((message) => message.role === 'user') ? el.scrollHeight : 0;
  }, [messages, streaming]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const close = () => { setOpen(false); (openerRef.current ?? fabRef.current)?.focus(); };

  const transcriptTurns = useCallback(
    (msgs: ChatMessage[]): ChatTurn[] =>
      msgs
        .filter((m) => !m.notice)
        .map((m) => ({ role: m.role, content: splitHandoff(m.content).text }))
        .filter((m) => m.content.length > 0),
    [],
  );

  const goReview = useCallback(
    (action: Extract<HandoffAction, { action: 'review' }> | null, msgs: ChatMessage[]) => {
      onHandoffToReview({
        role: action?.role,
        third: action?.area,
        message: action?.situation,
        transcript: transcriptTurns(msgs),
      });
      setOpen(false);
    },
    [onHandoffToReview, setOpen, transcriptTurns],
  );

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || content.length > 4000 || streaming || abortRef.current) return;
      const generation = requestGeneration.current;
      const currentRequest = () => requestGeneration.current === generation;

      setErrored(false);
      setDraft('');

      const history = [...messages, { role: 'user' as const, content }];
      // Reserve a reply row while the JSON response is pending.
      setMessages([...history, { role: 'assistant', content: '' }]);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // Ensure a conversation exists for this session before chatting.
        if (conversationAccessRef.current == null) {
          const convRes = await fetch('/api/peggy/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context: { surface: 'public-peggy' } }),
            signal: controller.signal,
          });
          if (!convRes.ok) throw new Error(`Conversation failed: ${convRes.status}`);
          const conv = (await convRes.json()) as
            Partial<PeggyConversationAccessResponse> & {
              conversation?: Partial<PeggyConversationAccessResponse>;
            };
          if (!currentRequest() || controller.signal.aborted) return;
          const id = conv?.id ?? conv?.conversation?.id;
          const rawAccessToken =
            conv?.accessToken ?? conv?.conversation?.accessToken;
          const accessToken =
            typeof rawAccessToken === 'string' ? rawAccessToken.trim() : '';
          if (!Number.isSafeInteger(id) || (id as number) <= 0 || !accessToken) {
            throw new Error('No conversation access');
          }
          conversationAccessRef.current = {
            id: id as number,
            accessToken,
          };
        }

        const credential = conversationAccessRef.current;
        if (!credential) throw new Error('No conversation access');

        const requestCredential = { current: credential };
        const res = await peggyFetchWithSingleRefresh({
          fetcher: fetch,
          credentialRef: requestCredential,
          input: '/api/peggy/chat',
          init: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId: credential.id,
              message: content,
              context: { surface: 'public-peggy' },
            }),
            signal: controller.signal,
          },
        });

        if (!currentRequest() || controller.signal.aborted) return;
        conversationAccessRef.current = requestCredential.current;
        if (!res.ok) throw new Error(`Peggy request failed: ${res.status}`);

        const data = (await res.json()) as { response?: string };
        if (!currentRequest() || controller.signal.aborted) return;
        const reply = typeof data.response === 'string' ? data.response.trim() : '';
        if (!reply || !splitHandoff(reply).text) throw new Error('Peggy returned no readable response');
        setMessages((prev) => {
          const copy = prev.slice();
          copy[copy.length - 1] = { role: 'assistant', content: reply };
          return copy;
        });
      } catch (err) {
        if (!currentRequest() || controller.signal.aborted || (err as Error).name === 'AbortError') return;
        setDraft(content);
        setErrored(true);
        setMessages((prev) => {
          const copy = prev.slice();
          copy[copy.length - 1] = { role: 'assistant', content: FALLBACK, notice: true };
          return copy;
        });
      } finally {
        if (currentRequest()) {
          setStreaming(false);
          abortRef.current = null;
          requestAnimationFrame(() => {
            if (panelRef.current?.getAttribute('aria-hidden') === 'false') inputRef.current?.focus();
          });
        }
      }
    },
    [messages, streaming],
  );

  const conversationStarted = messages.some((m) => m.role === 'user');
  const last = messages[messages.length - 1];
  const lastAction = last?.role === 'assistant' ? splitHandoff(last.content).action : null;

  const role = PEGGY_ROLES.find((item) => item.role === pickedRole);
  const preparePrompt = (prompt: string) => {
    setDraft(prompt);
    inputRef.current?.focus();
  };
  const resetConversation = () => {
    requestGeneration.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    conversationAccessRef.current = null;
    setMessages([{ role: 'assistant', content: GREETING }]);
    setDraft('');
    setStreaming(false);
    setErrored(false);
    setPickedRole(null);
    setPrepared(false);
    setConfirmReset(false);
    setConversationKey((key) => key + 1);
    requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
  };
  const stopWaiting = () => {
    requestGeneration.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    // The server may have processed the sent turn. A retry gets fresh access.
    conversationAccessRef.current = null;
    const lastSent = messages.findLast((message) => message.role === 'user')?.content ?? '';
    setDraft(lastSent);
    setMessages((previous) => [...previous.slice(0, -1), {
      role: 'assistant', notice: true,
      content: 'You stopped waiting. Your message may already have been processed. Your draft is ready if you want to send again.',
    }]);
    setStreaming(false);
    setErrored(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  const roleChoice = (item: (typeof PEGGY_ROLES)[number]) => (
    <button key={item.role} type="button" onClick={() => setPickedRole(item.role)} className="peggy-choice">
      <span>{item.label}</span><ArrowRight size={16} aria-hidden="true" />
    </button>
  );

  return (
    <>
      <button ref={fabRef} type="button" onClick={() => open ? close() : setOpen(true)}
        aria-label={open ? 'Close Peggy' : 'Talk to Peggy, the Pegasus intake concierge'}
        aria-expanded={open} aria-controls={panelId}
        className={`peggy-fab ${open ? 'is-open' : ''}`}>
        {open ? <X size={20} aria-hidden="true" /> : <BrandMark boxClassName="w-8 h-8" onDark />}
        {!open && <span className="peggy-fab-label">Ask Peggy <span>by Pegasus</span></span>}
      </button>

      <div ref={panelRef} id={panelId} className={`peggy-panel ${open ? 'is-open' : ''}`} role="dialog" aria-modal="false" tabIndex={-1}
        aria-label="Peggy, the Pegasus intake concierge" aria-hidden={!open} {...(!open ? { inert: '' } : {})}>
        <header className="peggy-head">
          <div className="peggy-avatar"><BrandMark boxClassName="w-full h-full" onDark /></div>
          <div className="peggy-identity">
            <span className="peggy-brand">Pegasus Dreamscapes</span>
            <div className="peggy-name">Peggy <span>AI intake assistant</span></div>
          </div>
          <button type="button" onClick={close} aria-label="Close" className="peggy-close"><X size={20} aria-hidden="true" /></button>
        </header>
        <div className="peggy-statusbar">
          <span data-testid="peggy-status">{PEGGY_STATUS}</span>
          <span>Clarity starts here</span>
        </div>

        {conversationStarted && <div className="peggy-toolbar">
          <SaveChatButton key={conversationKey} turns={transcriptTurns(messages)} pending={streaming} />
          <button type="button" className="peggy-text-button" onClick={() => setConfirmReset(!confirmReset)} aria-expanded={confirmReset}>
            <Plus size={15} aria-hidden="true" /> New chat
          </button>
        </div>}
        {confirmReset && <div className="peggy-reset" role="group" aria-label="Start a new conversation">
          <p>Start fresh? Save a copy first if you want to keep this chat on your device. This does not delete messages already sent.</p>
          <div><button className="peggy-text-button" type="button" onClick={resetConversation}>Start fresh</button>
            <button className="peggy-text-button" type="button" onClick={() => setConfirmReset(false)}>Keep this chat</button></div>
        </div>}

        <div ref={scrollRef} className="peggy-thread">
          {!conversationStarted && <div className={`peggy-welcome ${prepared ? 'is-prepared' : ''}`}>
            <span className="peggy-eyebrow">{prepared ? 'Your conversation, prepared' : 'A Pegasus perspective'}</span>
            <h2>{prepared ? 'Start with your context.' : <>A clearer<br />next step.</>}</h2>
            <p>{prepared ? 'Your property notes are ready below. Make them your own, then choose Send.' : 'Tell me what you’re considering. I can help you explore the public paths and prepare your next question.'}</p>
          </div>}

          <div className="peggy-messages" role="log" aria-label="Conversation with Peggy" aria-live="polite" aria-relevant="additions text">
            {messages.map((message, index) => {
              // The opening is presented as a welcome, not a simulated AI reply.
              if (index === 0) return null;
              const isAssistant = message.role === 'assistant';
              const { text } = splitHandoff(message.content);
              const isPending = isAssistant && streaming && index === messages.length - 1;
              if (!text && !isPending) return null;
              return <div key={index} className={`peggy-message ${isAssistant ? 'is-peggy' : 'is-user'} ${message.notice ? 'is-notice' : ''}`}>
                <span className="peggy-message-label">{message.notice ? 'Connection update' : isAssistant ? 'Peggy' : 'You'}</span>
                <div className={`peggy-bubble ${isAssistant ? 'is-peggy' : 'is-user'}`}>
                  {isPending ? <span className="peggy-pending"><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Preparing a response…</span> : text}
                </div>
              </div>;
            })}
          </div>

          {lastAction?.action === 'strategylab' && !streaming && <button type="button" className="peggy-action" onClick={() => { toStrategyLab(); setOpen(false); }}>
            Open Strategy Lab <ArrowRight size={16} aria-hidden="true" />
          </button>}
          {lastAction?.action === 'review' && !streaming && <button type="button" className="peggy-action" onClick={() => goReview(lastAction, messages)}>
            Share for Consideration <ArrowRight size={16} aria-hidden="true" />
          </button>}

          {!conversationStarted && !prepared && !pickedRole && <section className="peggy-start" aria-label="Choose a starting point">
            <p className="peggy-section-label">First, who am I helping?</p>
            <div className="peggy-choices">{PEGGY_ROLES.filter((item) => ['seller', 'buyer', 'explore'].includes(item.role)).map(roleChoice)}</div>
            <details className="peggy-details"><summary>More starting points <ChevronDown size={15} aria-hidden="true" /></summary>
              <div className="peggy-choices">{PEGGY_ROLES.filter((item) => !['seller', 'buyer', 'explore'].includes(item.role)).map(roleChoice)}</div>
            </details>
          </section>}

          {!conversationStarted && !prepared && pickedRole && <section className="peggy-start" aria-label="Prepare a question">
            <div className="peggy-selected"><span>{role?.label}</span><button type="button" className="peggy-text-button" onClick={() => setPickedRole(null)} aria-label="Change starting point">Change</button></div>
            <p className="peggy-section-label">Try one of these, or just type</p>
            <div className="peggy-choices">{(role?.chips ?? []).map((prompt) => <button key={prompt} type="button" onClick={() => preparePrompt(prompt)} className="peggy-choice">
              <span>{prompt}</span><CornerDownLeft size={16} aria-hidden="true" />
            </button>)}</div>
            <p className="peggy-small-note">Choose a question to edit before sending.</p>
          </section>}

          {conversationStarted && !streaming && !errored && <details className="peggy-details peggy-followups">
            <summary>Explore a follow-up <ChevronDown size={15} aria-hidden="true" /></summary>
            <div className="peggy-choices">{(role?.followups ?? PEGGY_FOLLOWUPS).map((prompt) => <button key={prompt} type="button" onClick={() => preparePrompt(prompt)} className="peggy-choice">
              <span>{prompt}</span><CornerDownLeft size={16} aria-hidden="true" />
            </button>)}</div>
          </details>}

          {errored && <div className="peggy-recovery">
            <p>Keep moving at your pace.</p>
            <button type="button" className="peggy-action" onClick={() => goReview(null, messages)}>Share for Consideration <ArrowRight size={16} aria-hidden="true" /></button>
            <button type="button" className="peggy-text-button" onClick={() => { toStrategyLab(); setOpen(false); }}>Open Strategy Lab <ArrowRight size={15} aria-hidden="true" /></button>
          </div>}

          {!prepared && !conversationStarted && <details className="peggy-details peggy-shortcuts">
            <summary>Go straight to a tool or path <ChevronDown size={15} aria-hidden="true" /></summary>
            <div className="peggy-choices">
              <button type="button" data-testid="peggy-route-strategylab" className="peggy-choice" onClick={() => { toStrategyLab(); setOpen(false); }}><span>Strategy Lab</span><ArrowRight size={16} aria-hidden="true" /></button>
              <button type="button" data-testid="peggy-route-submit" className="peggy-choice" onClick={() => { toSubmit(); setOpen(false); }}><span>Submit a Property</span><ArrowRight size={16} aria-hidden="true" /></button>
              <button type="button" data-testid="peggy-route-apollo" className="peggy-choice" onClick={() => { go('apollo'); setOpen(false); }}><span>Ask About Representation</span><ArrowRight size={16} aria-hidden="true" /></button>
              <button type="button" data-testid="peggy-route-marketflow" className="peggy-choice" onClick={() => { go('marketflow'); setOpen(false); }}><span>MarketFlow</span><ArrowRight size={16} aria-hidden="true" /></button>
            </div>
          </details>}

          <details className="peggy-details peggy-about">
            <summary>About Peggy <ChevronDown size={15} aria-hidden="true" /></summary>
            <p>{PEGGY_STATUS}.</p>
            <p data-testid="peggy-compliance">{PEGGY_COMPLIANCE}</p>
            <p>{PEGGY_SLA}</p>
            <p>Save chat keeps a transcript copy on this device. Conversation access stays in page memory. Phone and voice remain in development.</p>
          </details>
        </div>

        <div className="peggy-compose-area">
          {prepared && !conversationStarted && <p className="peggy-context-note"><FileText size={16} aria-hidden="true" /><span>Prepared draft · nothing sent yet</span></p>}
          <form className="peggy-input" onSubmit={(event) => { event.preventDefault(); send(draft); }}>
            <textarea ref={inputRef} aria-label="Talk to Peggy" aria-describedby={composerHintId} placeholder="What are you considering?" rows={prepared && !conversationStarted ? 4 : 2} maxLength={4000}
              value={draft} onChange={(event) => setDraft(event.target.value)} disabled={streaming}
              onKeyDown={(event) => { if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !event.nativeEvent.isComposing) { event.preventDefault(); send(draft); } }} />
            <div className="peggy-compose-tools">
              <span id={composerHintId}>{draft.length > 3600 ? `${draft.length.toLocaleString()} / 4,000` : '⌘ / Ctrl + Enter to send'}</span>
              {streaming ? <button key="stop" type="button" className="peggy-stop" onClick={(event) => { event.preventDefault(); stopWaiting(); }}>Stop waiting</button> : <button key="send" type="submit" aria-label="Send" disabled={!draft.trim() || draft.trim().length > 4000}>Send <Send size={15} aria-hidden="true" /></button>}
            </div>
          </form>
          <p className="peggy-disclosure" data-testid="peggy-send-disclosure">By sending, your message is stored and processed by an AI service. <a href="/privacy">Privacy Policy</a>.</p>
        </div>
      </div>
    </>
  );
}
