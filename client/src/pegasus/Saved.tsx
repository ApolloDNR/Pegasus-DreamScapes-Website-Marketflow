import { ArrowRight, Trash2, ConciergeBell, LineChart } from 'lucide-react';
import type { Nav } from './theme';
import {
  useSavedStrategies,
  useSavedChats,
  deleteStrategy,
  deleteChat,
} from './savedStore';

const usd0 = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function SavedPage({ go }: { go: Nav }) {
  const strategyRows = useSavedStrategies();
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
            Pick up exactly where you left off. Reopen a saved underwriting model or revisit a
            conversation with Peggy, then carry it forward into a written review.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <div className="flex items-center gap-2.5 mb-7">
              <LineChart className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.8} />
              <h2 className="pg-label !text-[10px] !tracking-[0.2em]">Strategy Lab models</h2>
            </div>

            {strategyRows.length === 0 && (
              <div className="rounded-[3px] border border-dashed border-[var(--line)] p-8 text-center">
                <p className="text-[var(--text)]/60 mb-5">You have not saved a model yet.</p>
                <button type="button" onClick={() => go('strategylab')}
                  className="btn-line px-6 py-3 pg-label !text-[10px] inline-flex items-center gap-2.5 group">
                  Open Strategy Lab <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {strategyRows.map((s) => (
                <article key={s.id} className="rounded-[3px] border border-[var(--line)] bg-[var(--bg-2)] p-6 transition-shadow hover:shadow-lg">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-serif-display text-2xl leading-tight">{s.title}</h3>
                      <div className="pg-label !text-[8px] !tracking-[0.16em] text-[var(--text)]/45 mt-1.5">
                        {s.model.lane} · Saved {fmtDate(s.createdAt)}
                      </div>
                    </div>
                    <button type="button" aria-label="Delete saved model"
                      onClick={() => deleteStrategy(s.id)}
                      className="text-[var(--text)]/35 hover:text-[#c0573a] transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" strokeWidth={1.7} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 border-t border-[var(--line)] pt-4">
                    <div>
                      <div className="pg-label !text-[7px] !tracking-[0.12em] text-[var(--text)]/45 mb-1.5">All-in</div>
                      <div className="font-serif-display text-base sm:text-xl leading-none">{usd0(s.model.allIn)}</div>
                    </div>
                    <div>
                      <div className="pg-label !text-[7px] !tracking-[0.12em] text-[var(--text)]/45 mb-1.5">Net profit</div>
                      <div className="font-serif-display text-base sm:text-xl leading-none text-[var(--accent)]">{usd0(s.model.spread)}</div>
                    </div>
                    <div>
                      <div className="pg-label !text-[7px] !tracking-[0.12em] text-[var(--text)]/45 mb-1.5">Net margin</div>
                      <div className="font-serif-display text-base sm:text-xl leading-none text-[var(--accent)]">{s.model.margin.toFixed(1)}%</div>
                    </div>
                  </div>
                  <button type="button" onClick={() => go('strategylab')}
                    className="link-underline pg-label !text-[9px] !tracking-[0.16em] text-[var(--accent)] inline-flex items-center gap-2 mt-5">
                    Reopen in Strategy Lab <ArrowRight className="w-3 h-3" strokeWidth={2} />
                  </button>
                </article>
              ))}
            </div>
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
                const firstUser = c.transcript.find((t) => t.role === 'user');
                return (
                  <article key={c.id} className="rounded-[3px] border border-[var(--line)] bg-[var(--bg-2)] p-6 transition-shadow hover:shadow-lg">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-serif-display text-2xl leading-tight">{c.title}</h3>
                        <div className="pg-label !text-[8px] !tracking-[0.16em] text-[var(--text)]/45 mt-1.5">
                          {c.transcript.length} turns · Saved {fmtDate(c.createdAt)}
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
