import React, { useEffect, useRef, useId, useState, useCallback } from 'react';
import { X, Send, ArrowRight, Loader2, Bookmark, BookmarkCheck } from 'lucide-react';
import type { ChatTurn, PeggyHandoff, Nav } from './theme';
import { PEGGY_ROLES, PEGGY_FOLLOWUPS, PEGGY_SLA, PEGGY_COMPLIANCE, PEGGY_STATUS } from './data';
import { BrandMark } from './primitives';
import { addChat } from './savedStore';

const GREETING =
  "I’m Peggy, the Pegasus intake concierge. Tell me about a property, a deal, or what you’re weighing, in your own words. I’ll ask the right questions and point you to the lane that fits.";

const FALLBACK =
  "I can’t reach my brain at the moment. You can still get a fast read from a person: start a Review and someone writes back within 48 hours, or open the Strategy Lab to model the numbers yourself.";

type ChatMessage = { role: 'user' | 'assistant'; content: string };

type HandoffAction =
  | { action: 'strategylab' }
  | { action: 'review'; role?: string; area?: string; situation?: string };

const HANDOFF_RE = /\[\[HANDOFF\]\]([\s\S]*?)\[\[\/HANDOFF\]\]/;

function SaveChatButton({ turns }: { turns: ChatTurn[] }) {
  const [saved, setSaved] = useState(false);

  const firstUser = turns.find((t) => t.role === 'user')?.content ?? '';
  const title = firstUser ? firstUser.slice(0, 80) : 'PeggyAI conversation';

  const onClick = () => {
    if (saved) return;
    addChat(title, turns);
    setSaved(true);
  };

  return (
    <button type="button" onClick={onClick} disabled={saved}
      aria-label="Save this conversation"
      className="ml-auto inline-flex items-center gap-1.5 pg-label !text-[8px] !tracking-[0.16em] text-[var(--cream)]/70 hover:text-[var(--cream)] transition-colors disabled:opacity-70">
      {saved ? (
        <><BookmarkCheck className="w-3.5 h-3.5" strokeWidth={1.8} /> Saved</>
      ) : (
        <><Bookmark className="w-3.5 h-3.5" strokeWidth={1.8} /> Save chat</>
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
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  toStrategyLab: () => void;
  onHandoffToReview: (h: PeggyHandoff) => void;
  go: Nav;
  toSubmit: (intent?: string) => void;
  initialRole?: string | null;
}) {
  const panelId = useId();
  const fabRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const convIdRef = useRef<number | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', content: GREETING }]);
  const [draft, setDraft] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [errored, setErrored] = useState(false);
  const [pickedRole, setPickedRole] = useState<string | null>(null);

  // When the panel is opened from a page chip with a role already chosen,
  // skip the "who am I helping?" step and jump straight to that role's prompts.
  useEffect(() => {
    if (open && initialRole) setPickedRole(initialRole);
  }, [open, initialRole]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); fabRef.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => { document.removeEventListener('keydown', onKey); cancelAnimationFrame(id); };
  }, [open, setOpen]);

  // Keep the transcript scrolled to the latest turn.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streaming]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const close = () => { setOpen(false); fabRef.current?.focus(); };

  const transcriptTurns = useCallback(
    (msgs: ChatMessage[]): ChatTurn[] =>
      msgs
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
      if (!content || streaming) return;

      setErrored(false);
      setDraft('');

      const history = [...messages, { role: 'user' as const, content }];
      // Append an empty assistant turn we stream into.
      setMessages([...history, { role: 'assistant', content: '' }]);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // Ensure a conversation exists for this session before chatting.
        if (convIdRef.current == null) {
          const convRes = await fetch('/api/peggy/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context: { surface: 'public-peggy' } }),
            signal: controller.signal,
          });
          if (!convRes.ok) throw new Error(`Conversation failed: ${convRes.status}`);
          const conv = await convRes.json();
          convIdRef.current = conv?.id ?? conv?.conversation?.id ?? null;
          if (convIdRef.current == null) throw new Error('No conversation id');
        }

        const res = await fetch('/api/peggy/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: convIdRef.current,
            message: content,
            context: { surface: 'public-peggy' },
          }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`Peggy request failed: ${res.status}`);

        const data = (await res.json()) as { response?: string };
        const reply = (data.response ?? '').trim() || FALLBACK;
        setMessages((prev) => {
          const copy = prev.slice();
          copy[copy.length - 1] = { role: 'assistant', content: reply };
          return copy;
        });
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setErrored(true);
        setMessages((prev) => {
          const copy = prev.slice();
          copy[copy.length - 1] = { role: 'assistant', content: FALLBACK };
          return copy;
        });
      } finally {
        setStreaming(false);
        abortRef.current = null;
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [messages, streaming],
  );

  const conversationStarted = messages.some((m) => m.role === 'user');
  const last = messages[messages.length - 1];
  const lastAction = last?.role === 'assistant' ? splitHandoff(last.content).action : null;

  return (
    <>
      <button ref={fabRef} type="button" onClick={() => setOpen(!open)}
        aria-label={open ? 'Close PeggyAI' : 'Talk to PeggyAI, the Pegasus intake concierge'}
        aria-expanded={open} aria-controls={panelId}
        className={`peggy-fab ${open ? 'is-open' : ''}`}>
        {open ? <X className="w-5 h-5" strokeWidth={1.8} /> : <BrandMark boxClassName="w-8 h-8" onDark />}
        {!open && <span className="peggy-fab-label">Talk to PeggyAI</span>}
      </button>

      <div id={panelId} className={`peggy-panel ${open ? 'is-open' : ''}`} role="dialog" aria-modal="false"
        aria-label="PeggyAI, the Pegasus intake concierge" aria-hidden={!open} {...(!open ? { inert: '' } : {})}>
        <div className="peggy-head">
          <div className="peggy-avatar"><BrandMark boxClassName="w-full h-full" onDark /></div>
          <div className="leading-none">
            <div className="font-serif-display text-2xl text-[var(--cream)]">PeggyAI</div>
            <div className="pg-label !text-[8px] !tracking-[0.22em] text-[var(--accent-bright)] mt-1.5">Guided Intake Concierge</div>
            <div className="flex items-center gap-1.5 mt-1.5" data-testid="peggy-status">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-bright)]" aria-hidden="true" />
              <span className="pg-label !text-[8px] !tracking-[0.18em] normal-case text-[var(--cream)]/55">{PEGGY_STATUS}</span>
            </div>
          </div>
          {conversationStarted && <SaveChatButton turns={transcriptTurns(messages)} />}
          <button type="button" onClick={close} aria-label="Close" className="ml-3 text-[var(--cream)]/60 hover:text-[var(--cream)] transition-colors">
            <X className="w-5 h-5" strokeWidth={1.6} />
          </button>
        </div>

        <div ref={scrollRef} className="peggy-thread" aria-live="polite">
          {messages.map((m, i) => {
            const isAssistant = m.role === 'assistant';
            const { text } = splitHandoff(m.content);
            const isStreamingThis = isAssistant && streaming && i === messages.length - 1;
            if (isAssistant && !text && !isStreamingThis) return null;
            return (
              <div key={i} className={`peggy-bubble ${isAssistant ? 'is-peggy' : 'is-user'}`}>
                {text}
                {isStreamingThis && !text && (
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--cream)]/55" strokeWidth={2} />
                )}
                {isStreamingThis && text && <span className="peggy-caret" aria-hidden="true" />}
              </div>
            );
          })}

          {lastAction?.action === 'strategylab' && !streaming && (
            <button type="button" className="peggy-action" onClick={() => { toStrategyLab(); setOpen(false); }}>
              Open Strategy Lab <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.8} />
            </button>
          )}
          {lastAction?.action === 'review' && !streaming && (
            <button type="button" className="peggy-action" onClick={() => goReview(lastAction, messages)}>
              Start my Review <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.8} />
            </button>
          )}

          {!conversationStarted && !pickedRole && (
            <>
              <div className="pg-label !text-[8px] !tracking-[0.22em] text-[var(--cream)]/45 mt-1 mb-2.5">First, who am I helping?</div>
              <div className="flex flex-col gap-2">
                {PEGGY_ROLES.map((r) => (
                  <button key={r.role} type="button" onClick={() => setPickedRole(r.role)} className="peggy-chip text-left">{r.label}</button>
                ))}
              </div>
            </>
          )}

          {!conversationStarted && pickedRole && (
            <>
              <div className="pg-label !text-[8px] !tracking-[0.22em] text-[var(--cream)]/45 mt-1 mb-2.5">Try one of these, or just type</div>
              <div className="flex flex-col gap-2">
                {(PEGGY_ROLES.find((r) => r.role === pickedRole)?.chips ?? []).map((c) => (
                  <button key={c} type="button" onClick={() => send(c)} className="peggy-chip text-left">{c}</button>
                ))}
              </div>
            </>
          )}

          {conversationStarted && !streaming && !errored && (
            <div className="flex flex-wrap gap-2 mt-1">
              {(PEGGY_ROLES.find((r) => r.role === pickedRole)?.followups ?? PEGGY_FOLLOWUPS).map((c) => (
                <button key={c} type="button" onClick={() => send(c)} className="peggy-chip !py-1.5 !px-3 text-left">{c}</button>
              ))}
            </div>
          )}

          {errored && (
            <div className="flex flex-wrap gap-2 mt-1">
              <button type="button" className="peggy-action" onClick={() => goReview(null, messages)}>
                Start a Review <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.8} />
              </button>
              <button type="button" className="peggy-action is-ghost" onClick={() => { toStrategyLab(); setOpen(false); }}>
                Open Strategy Lab
              </button>
            </div>
          )}
        </div>

        <form className="peggy-input" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
          <input ref={inputRef} type="text" aria-label="Talk to PeggyAI" placeholder="Describe your deal..."
            value={draft} onChange={(e) => setDraft(e.target.value)} disabled={streaming} />
          <button type="submit" aria-label="Send" disabled={streaming || !draft.trim()}>
            {streaming ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> : <Send className="w-4 h-4" strokeWidth={1.7} />}
          </button>
        </form>
        <div className="px-5 pt-1 pb-2">
          <div className="pg-label !text-[8px] !tracking-[0.22em] text-[var(--cream)]/40 mb-2">Or go straight to</div>
          <div className="flex flex-wrap gap-2">
            <button type="button" data-testid="peggy-route-strategylab" className="peggy-chip !py-1.5 !px-3"
              onClick={() => { toStrategyLab(); setOpen(false); }}>Strategy Lab</button>
            <button type="button" data-testid="peggy-route-submit" className="peggy-chip !py-1.5 !px-3"
              onClick={() => { toSubmit(); setOpen(false); }}>Submit a Property</button>
            <button type="button" data-testid="peggy-route-apollo" className="peggy-chip !py-1.5 !px-3"
              onClick={() => { go('apollo'); setOpen(false); }}>Represent With Apollo</button>
            <button type="button" data-testid="peggy-route-marketflow" className="peggy-chip !py-1.5 !px-3"
              onClick={() => { go('marketflow'); setOpen(false); }}>MarketFlow</button>
          </div>
        </div>
        <div className="pg-label !text-[8px] !tracking-[0.14em] normal-case text-[var(--cream)]/45 px-5 pt-1 text-center" data-testid="peggy-compliance">
          {PEGGY_COMPLIANCE}
        </div>
        <div className="pg-label !text-[8px] !tracking-[0.14em] normal-case text-[var(--cream)]/35 px-5 pb-4 pt-2 text-center">
          {PEGGY_SLA}
        </div>
      </div>
    </>
  );
}
