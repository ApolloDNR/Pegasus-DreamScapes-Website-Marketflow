import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, Compass, FileText, Route, X } from 'lucide-react';
import type { PeggyPageContext } from '@shared/peggy-page-context';
import type { GuideSection } from './peggy-page-guide';
import { PeggyMark } from './peggy-mark';

export function PeggyLocation({ context, label, sections, onVisit }: { context: PeggyPageContext; label: string; sections: GuideSection[]; onVisit: (index: number) => void }) {
  return <details className="peggy-location">
    <summary><Compass size={19} aria-hidden="true" /><span><strong>{context.page}</strong><span aria-hidden="true"> / </span>{label}</span><ChevronDown size={15} aria-hidden="true" /></summary>
    <div className="peggy-location-content">
      <p className="peggy-section-label">Page context Peggy can use</p>
      <p>{context.excerpt || context.section}</p>
      <p className="peggy-small-note">Visible section text only. Form fields, saved records and other tabs aren’t read. Nothing is sent until you choose Send.</p>
      <nav aria-label="Peggy page outline">{sections.map((section, index) => <button key={index} type="button" onClick={() => onVisit(index)}><span>{String(index + 1).padStart(2, '0')}</span>{section.label}<ArrowRight size={14} aria-hidden="true" /></button>)}</nav>
    </div>
  </details>;
}

export function PeggyGuideWelcome({ context, selectedText, onExplain, onTour, onNextStep }: { context: PeggyPageContext; selectedText: string; onExplain: () => void; onTour: () => void; onNextStep: () => void }) {
  return <section className="peggy-guide-welcome" aria-label="Explore with Peggy">
    <div className="peggy-welcome"><h2>Let’s look at this<br />together.</h2><p>I can explain this section, show you around, or help you find your next step.</p></div>
    <div className="peggy-view-preview"><span>{selectedText ? 'Your selection' : 'You’re viewing'}</span><p>{selectedText ? `“${selectedText}”` : context.section}</p><small>Page context is ready when you send.</small></div>
    <button type="button" className="peggy-explain" onClick={onExplain}><FileText size={20} aria-hidden="true" /><span>{selectedText ? 'Explain my selection' : 'Explain this section'}</span><ArrowRight size={18} aria-hidden="true" /></button>
    <div className="peggy-guide-actions">
      <button type="button" onClick={onTour}><Compass size={21} aria-hidden="true" /><span>Show me around<small>A short walk through this page</small></span><ArrowRight size={17} aria-hidden="true" /></button>
      <button type="button" onClick={onNextStep}><Route size={21} aria-hidden="true" /><span>Find my next step</span><ArrowRight size={17} aria-hidden="true" /></button>
    </div>
  </section>;
}

export function PeggyTourTrail({ sections, index, onMove }: { sections: GuideSection[]; index: number; onMove: (index: number) => void }) {
  const host = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = host.current;
    const current = nav?.querySelector<HTMLElement>('[aria-current="step"]');
    if (nav && current) {
      nav.scrollLeft = Math.max(0, current.offsetLeft - nav.clientWidth / 2 + current.offsetWidth / 2);
      nav.scrollTop = Math.max(0, current.offsetTop - nav.clientHeight / 2 + current.offsetHeight / 2);
    }
  }, [index, sections.length]);
  return <nav className="peggy-tour-trail" aria-label="Page tour sections" ref={host}>
    {sections.map((section, stop) => <button key={stop} type="button" aria-label={`Go to section ${stop + 1}: ${section.label}`} aria-current={index === stop ? 'step' : undefined} data-before={stop < index} onClick={() => onMove(stop)} onKeyDown={event => {
      const target = event.key === 'ArrowRight' ? Math.min(stop + 1, sections.length - 1) : event.key === 'ArrowLeft' ? Math.max(0, stop - 1) : event.key === 'Home' ? 0 : event.key === 'End' ? sections.length - 1 : null;
      if (target === null) return;
      event.preventDefault();
      onMove(target);
      host.current?.querySelectorAll<HTMLButtonElement>('button')[target]?.focus({ preventScroll: true });
    }}><span>{stop + 1}</span><span className="peggy-tour-stop-label" aria-hidden="true">{section.label}</span></button>)}
  </nav>;
}

export function PeggyTour({ section, index, sections, context, onMove, onEnd, onAsk }: { section: GuideSection; index: number; sections: GuideSection[]; context: PeggyPageContext | null; onMove: (index: number) => void; onEnd: () => void; onAsk: () => void }) {
  const total = sections.length;
  const excerpt = context?.excerpt ?? '';
  const firstSentence = excerpt.match(/^.{40,260}?[.!?](?:\s|$)/)?.[0]?.trim();
  return <aside className="peggy-tour" aria-label="Peggy page guide" tabIndex={-1}>
    <header><span className="peggy-tour-seal"><PeggyMark size={27} /></span><span>Peggy is showing you around</span><button type="button" onClick={onEnd} aria-label="End page tour"><X size={20} aria-hidden="true" /></button></header>
    <div className="peggy-tour-body">
      <PeggyTourTrail sections={sections} index={index} onMove={onMove} />
      <div className="peggy-tour-step" aria-live="polite" aria-atomic="true"><span>{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span><h2>{section.title}</h2></div>
      <p>{section.summary || firstSentence || (excerpt.length > 220 ? `${excerpt.slice(0, 217)}…` : excerpt) || 'Take a look at this section. You can ask Peggy to help explain it.'}</p>
      <div className="peggy-tour-controls"><button type="button" aria-label="Previous section" onClick={() => onMove(index - 1)} disabled={index === 0}><ArrowLeft size={18} aria-hidden="true" /></button><button type="button" className="peggy-tour-next" onClick={() => index < total - 1 ? onMove(index + 1) : onEnd()}>{index < total - 1 ? 'Next section' : 'Finish tour'}<ArrowRight size={18} aria-hidden="true" /></button></div>
      <button type="button" className="peggy-tour-ask" onClick={onAsk}>Ask about this</button><small>Page guide · no message sent</small>
    </div>
  </aside>;
}
