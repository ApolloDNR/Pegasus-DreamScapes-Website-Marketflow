import { Trash2 } from 'lucide-react';
import { PageAction, PageOpening } from './experience-page';
import type { Nav } from './theme';
import { restoreDraft, STORAGE_KEY } from './intelligence-desk/state';
import {
  useSavedChats,
  deleteChat,
} from './savedStore';

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
    for (const key of [STORAGE_KEY, 'pegasus.strategy-lab.v3']) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const restored = restoreDraft(raw);
      if (!restored) continue;
      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed) || typeof parsed.savedAt !== 'string' || !Number.isFinite(Date.parse(parsed.savedAt))) continue;
      return { savedAt: parsed.savedAt, title: restored.base.address.replace(/\s+/g, ' ').trim().slice(0, 180) || 'Untitled property draft' };
    }
    return null;
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

  return <article className="experience-page ep-saved">
    <PageOpening title="Your saved work."><p>Resume a Strategy Lab draft or read a saved Peggy conversation. These records stay in this browser; saving does not submit them for review.</p></PageOpening>
    <section className="ep-section"><div className="experience-wrap ep-split">
      <div><h2>Strategy Lab draft</h2>{strategyDraft ? <div className="ep-rule"><h3>{strategyDraft.title}</h3><p className="ep-notice">Browser draft · Saved {fmtDate(strategyDraft.savedAt)}</p><p>Resume the exact visitor-entered state stored by the current Strategy Lab. The draft remains automated and unverified.</p><PageAction href="/strategy-lab">Resume in Strategy Lab</PageAction></div> : <div className="ep-rule"><p>No current Strategy Lab draft is saved in this browser.</p><PageAction href="/strategy-lab">Open Strategy Lab</PageAction></div>}</div>
      <div><h2>Peggy conversations</h2>{chatRows.length === 0 && <div className="ep-rule"><p>You have not saved a conversation yet.</p><PageAction href="/peggy" secondary>Talk to Peggy</PageAction></div>}
        {chatRows.map(chat => {
          const transcript = Array.isArray(chat.transcript) ? chat.transcript : [];
          return <article key={chat.id} className="ep-saved-chat ep-rule"><div><h3>{chat.title}</h3><button type="button" aria-label="Delete saved chat" onClick={() => deleteChat(chat.id)}><Trash2 size={19} aria-hidden="true" /></button></div><p className="ep-notice">{transcript.length} turns · Saved {fmtDate(chat.createdAt)}</p><details><summary>Review saved transcript</summary>{transcript.map((turn,index) => <div key={`${chat.id}-${index}`} className="ep-transcript-turn"><strong>{turn.role === 'user' ? 'You' : 'Peggy'}</strong><p>{turn.content}</p></div>)}</details></article>;
        })}
      </div>
    </div></section>
  </article>;
}
export default SavedPage;
