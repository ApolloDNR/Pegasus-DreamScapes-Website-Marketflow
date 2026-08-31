import { ArrowRight, Trash2, ConciergeBell, LineChart } from 'lucide-react';
import type { Nav } from './theme';
import {
  useSavedChats,
  deleteChat,
} from './savedStore';

const CURRENT_STRATEGY_DRAFT_KEY = 'pegasus.strategy-lab.v3';

type CurrentStrategyDraft = {
  savedAt: string;
  title: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readCurrentStrategyDraft(): CurrentStrategyDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CURRENT_STRATEGY_DRAFT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.schemaVersion !== 3 || !isRecord(parsed.state)) return null;
    if (typeof parsed.savedAt !== 'string' || !Number.isFinite(Date.parse(parsed.savedAt))) return null;
    const address = typeof parsed.state.address === 'string'
      ? parsed.state.address.replace(/\s+/g, ' ').trim().slice(0, 180)
      : '';
    return {
      savedAt: parsed.savedAt,
      title: address || 'Untitled property draft',
    };
  } catch {
    return null;
  }
}

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function SavedPage({ go }: { go: Nav }) {
  const strategyDraft = readCurrentStrategyDraft();
  const chatRows = useSavedChats();

  return (
    <section className="relative py-24 lg:py-28">
      <div aria-hidden="true" className="section-numeral absolute top-0 right-4 lg:right-12 text-[var(--line-soft)]">SAVED</div>
      <div className="relative max-w-[1320px] mx-auto px-6 lg:px-12">
        <div className="max-w-[760px] mb-16">
          <div className="pg-label !text-[9px] text-[var(--accent)] mb-4">Your workspace</div>
          <h1 className="font-serif-display text-[2.3rem] sm:text-[2.8rem] lg:text-[3.6rem] leading-[1.06] sm:leading-[1.04] mb-5">
            Your saved work.
          </h1>
          <p className="text-[var(--text)]/70 text-lg leading-relaxed">
            Resume the current Strategy Lab browser draft or review a saved Peggy transcript.
            These records stay in this browser; neither one means it was submitted or reviewed.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <div className="flex items-center gap-2.5 mb-7">
              <LineChart className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.8} />
              <h2 className="pg-label !text-[10px] !tracking-[0.2em]">Current Strategy Lab draft</h2>
            </div>

            {!strategyDraft && (
              <div className="rounded-[3px] border border-dashed border-[var(--line)] p-8 text-center">
                <p className="text-[var(--text)]/60 mb-5">No current Strategy Lab draft is saved in this browser.</p>
                <button type="button" onClick={() => go('strategylab')}
                  className="btn-line px-6 py-3 pg-label !text-[10px] inline-flex items-center gap-2.5 group">
                  Open Strategy Lab <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {strategyDraft && (
              <article className="rounded-[3px] border border-[var(--line)] bg-[var(--bg-2)] p-6 transition-shadow hover:shadow-lg">
                <h3 className="font-serif-display text-2xl leading-tight">{strategyDraft.title}</h3>
                <div className="pg-label !text-[8px] !tracking-[0.16em] text-[var(--text)]/45 mt-1.5">
                  Browser draft · Saved {fmtDate(strategyDraft.savedAt)}
                </div>
                <p className="text-[var(--text)]/65 text-sm leading-relaxed border-t border-[var(--line)] pt-4 mt-4">
                  Resume the exact visitor-entered state stored by the current Strategy Lab. The draft remains automated and unverified.
                </p>
                <button type="button" onClick={() => go('strategylab')}
                  className="link-underline pg-label !text-[9px] !tracking-[0.16em] text-[var(--accent)] inline-flex items-center gap-2 mt-5">
                  Resume in Strategy Lab <ArrowRight className="w-3 h-3" strokeWidth={2} />
                </button>
              </article>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2.5 mb-7">
              <ConciergeBell className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.8} />
              <h2 className="pg-label !text-[10px] !tracking-[0.2em]">Peggy conversations</h2>
            </div>

            {chatRows.length === 0 && (
              <div className="rounded-[3px] border border-dashed border-[var(--line)] p-8 text-center">
                <p className="text-[var(--text)]/60 mb-5">You have not saved a conversation yet.</p>
                <button type="button" onClick={() => go('peggy')}
                  className="btn-line px-6 py-3 pg-label !text-[10px] inline-flex items-center gap-2.5 group">
                  Talk to Peggy <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {chatRows.map((c) => {
                const transcript = Array.isArray(c.transcript) ? c.transcript : [];
                const firstUser = transcript.find((t) => t.role === 'user');
                return (
                  <article key={c.id} className="rounded-[3px] border border-[var(--line)] bg-[var(--bg-2)] p-6 transition-shadow hover:shadow-lg">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-serif-display text-2xl leading-tight">{c.title}</h3>
                        <div className="pg-label !text-[8px] !tracking-[0.16em] text-[var(--text)]/45 mt-1.5">
                          {transcript.length} turns · Saved {fmtDate(c.createdAt)}
                        </div>
                      </div>
                      <button type="button" aria-label="Delete saved chat"
                        onClick={() => deleteChat(c.id)}
                        className="text-[var(--text)]/35 hover:text-[#c0573a] transition-colors shrink-0">
                        <Trash2 className="w-4 h-4" strokeWidth={1.7} />
                      </button>
                    </div>
                    {firstUser && (
                      <p className="text-[var(--text)]/70 text-[0.95rem] leading-relaxed border-t border-[var(--line)] pt-4 line-clamp-3">
                        {firstUser.content}
                      </p>
                    )}
                    <details className="border-t border-[var(--line)] pt-4 mt-4">
                      <summary className="cursor-pointer pg-label !text-[9px] !tracking-[0.14em] text-[var(--accent)]">
                        Review saved transcript
                      </summary>
                      <div className="mt-4 space-y-3">
                        {transcript.map((turn, index) => (
                          <div key={`${c.id}-${index}`} className="text-sm leading-relaxed">
                            <strong className="block text-[10px] uppercase tracking-[0.12em] text-[var(--text)]/45">
                              {turn.role === 'user' ? 'You' : 'Peggy'}
                            </strong>
                            <p className="whitespace-pre-wrap text-[var(--text)]/70">{turn.content}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SavedPage;
