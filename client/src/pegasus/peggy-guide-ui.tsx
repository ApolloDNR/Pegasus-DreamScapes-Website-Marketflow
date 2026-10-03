import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, Compass, X } from 'lucide-react';
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

function guideExcerpt(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= 280) return trimmed;
  const completeSentence = trimmed.slice(0, 280).match(/^.{40,}[.!?](?=\s|$)/)?.[0];
  if (completeSentence) return completeSentence;
  return `${trimmed.slice(0, 277).replace(/\s+\S*$/, '')}…`;
}

export function PeggyGuideWelcome({ context, summary, selectedText, onExplain, onTour, onNextStep }: { context: PeggyPageContext; summary?: string; selectedText: string; onExplain: () => void; onTour: () => void; onNextStep: () => void }) {
  const overview = guideExcerpt(summary || context.excerpt || 'Choose an explanation, explore the page, or prepare a question for Peggy.');
  return <section className="peggy-guide-welcome" aria-label="Explore with Peggy">
    <div className="peggy-at-a-glance">
      <span className="peggy-guide-label">Page guide</span>
      <h2>{selectedText ? 'Let’s unpack this.' : 'At a glance.'}</h2>
      {selectedText ? <blockquote>{selectedText}</blockquote> : <p data-testid="peggy-local-summary">{overview}</p>}
      <small className="peggy-guide-source">{selectedText ? 'Your selected passage' : summary ? 'A guide to this section' : context.excerpt ? 'From this section' : 'Explore this page'}<span>Nothing sent yet</span></small>
    </div>
    <button type="button" className="peggy-explain" onClick={onExplain}><span>{selectedText ? 'Explain my selection' : 'Explain this section'}</span><ArrowRight size={18} aria-hidden="true" /></button>
    <div className="peggy-guide-actions">
      <button type="button" onClick={onTour}><span>Show me around<small>A short walk through this page</small></span><ArrowRight size={17} aria-hidden="true" /></button>
      <button type="button" onClick={onNextStep}><span>Find my next step</span><ArrowRight size={17} aria-hidden="true" /></button>
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
  const detailsId = useId();
  const host = useRef<HTMLElement>(null);
  const compactQuery = '(max-width: 640px), (max-width: 1439px) and (max-height: 600px)';
  const [compact, setCompact] = useState(() => window.matchMedia(compactQuery).matches);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(compactQuery);
    const update = () => setCompact(media.matches);
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);
  useEffect(() => {
    const cookieBar = document.querySelector<HTMLElement>('.pg-cookie-bar');
    if (!cookieBar) return;
    const update = () => host.current?.style.setProperty('--peggy-cookie-height', `${Math.ceil(cookieBar.getBoundingClientRect().height)}px`);
    update();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(cookieBar);
    window.addEventListener('resize', update);
    return () => { observer?.disconnect(); window.removeEventListener('resize', update); };
  }, []);
  const excerpt = context?.excerpt ?? '';
  const firstSentence = excerpt.match(/^.{40,260}?[.!?](?:\s|$)/)?.[0]?.trim();
  const currentStep = <div className="peggy-tour-step" aria-live="polite" aria-atomic="true"><span>{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span><h2>{section.title}</h2></div>;
  return <aside ref={host} className="peggy-tour" data-compact={compact} aria-label="Peggy page guide" tabIndex={-1}>
    <header><span className="peggy-tour-seal"><PeggyMark size={27} /></span>{compact ? currentStep : <span>Peggy is showing you around</span>}<button type="button" onClick={onEnd} aria-label="End page tour"><X size={20} aria-hidden="true" /></button></header>
    <div className="peggy-tour-body">
      {!compact && <><PeggyTourTrail sections={sections} index={index} onMove={onMove} />{currentStep}</>}
      {compact && <button type="button" className="peggy-tour-details-toggle" aria-expanded={expanded} aria-controls={detailsId} onClick={() => setExpanded(!expanded)}>Section details and stops<ChevronDown size={16} aria-hidden="true" /></button>}
      <div id={detailsId} className="peggy-tour-details" hidden={compact && !expanded}>
        <p>{section.summary || firstSentence || (excerpt.length > 220 ? `${excerpt.slice(0, 217)}…` : excerpt) || 'Take a look at this section. You can ask Peggy to help explain it.'}</p>
        {compact && <PeggyTourTrail key={String(expanded)} sections={sections} index={index} onMove={onMove} />}
      </div>
      <div className="peggy-tour-actions">
        <div className="peggy-tour-controls"><button type="button" aria-label="Previous section" onClick={() => onMove(index - 1)} disabled={index === 0}><ArrowLeft size={18} aria-hidden="true" /></button><button type="button" className="peggy-tour-next" onClick={() => index < total - 1 ? onMove(index + 1) : onEnd()}>{index < total - 1 ? 'Next section' : 'Finish tour'}<ArrowRight size={18} aria-hidden="true" /></button></div>
        <button type="button" className="peggy-tour-ask" onClick={onAsk}>Ask about this</button>
      </div>
      <small>Page guide · no message sent</small>
    </div>
  </aside>;
}
