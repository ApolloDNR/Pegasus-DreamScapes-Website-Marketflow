import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, ChevronDown } from 'lucide-react';
import type { GuideSection } from './peggy-page-guide';
import { PeggyMark } from './peggy-mark';
import './journey.css';

export const PEGGY_GUIDE_REQUEST = 'pegasus:guide-request';
export type PeggyGuideRequest = { mode: 'tour' | 'explain' | 'choose'; source: HTMLElement };

/** Local UI intent only. Never reads form values or makes a service request. */
export function requestPeggyGuide(mode: PeggyGuideRequest['mode'], source: HTMLElement) {
  window.dispatchEvent(new CustomEvent<PeggyGuideRequest>(PEGGY_GUIDE_REQUEST, { detail: { mode, source } }));
}

export function GuideInvite({ compact = false, choose = false }: { compact?: boolean; choose?: boolean }) {
  return <div className={`journey-invite${compact ? ' is-compact' : ''}`} data-peggy-private>
    <span className="journey-avatar"><PeggyMark size={30} /></span>
    <div>{!compact && <><strong>A little guidance?</strong><p>Peggy can walk you through this page.</p></>}
      <button type="button" onClick={event => requestPeggyGuide(choose ? 'choose' : 'tour', event.currentTarget)}>
        {choose ? 'Want help choosing? Ask Peggy.' : 'Show me around'}<ArrowRight size={17} aria-hidden="true" />
      </button>
    </div>
  </div>;
}

export function ExplainWithPeggy() {
  return <button type="button" className="journey-explain" data-peggy-private onClick={event => requestPeggyGuide('explain', event.currentTarget)}>
    <span className="journey-avatar"><PeggyMark size={21} /></span>Explore this with Peggy<ArrowRight size={16} aria-hidden="true" />
  </button>;
}

export function BeforeYouBegin() {
  return <details className="journey-before">
    <summary>What happens next<ChevronDown size={17} aria-hidden="true" /></summary>
    <ol><li><span>1</span>Share the basics</li><li><span>2</span>Review your summary</li><li><span>3</span>Choose to submit</li></ol>
    <p>You can review your information before sending it.</p>
  </details>;
}

type Destination = {
  href: string; title: string; note: string; action: string;
  image?: { src: string; alt: string; width: number; height: number };
};
const destinations: Record<string, Destination> = {
  work: { href: '/our-work', title: 'See the work', note: 'Explore a completed project and the decisions behind it.', action: 'View Our Work', image: { src: '/images/nelson/kitchen-after.webp', alt: 'The completed Nelson Drive kitchen with navy cabinetry and a waterfall island', width: 1600, height: 996 } },
  process: { href: '/how-we-operate', title: 'How we operate', note: 'Understand the process from first conversation to handoff.', action: 'Explore the approach' },
  owners: { href: '/property-owners', title: 'Start with your property', note: 'Find the starting point that fits your situation.', action: 'Explore your options' },
  partners: { href: '/deal-partners', title: 'Find the missing piece', note: 'Explore the roles and questions around a potential partnership.', action: 'Explore partnership paths' },
  tools: { href: '/tools', title: 'Work through the details', note: 'Choose a tool to explore your own assumptions.', action: 'Find a useful tool' },
  about: { href: '/about', title: 'Meet Apollo', note: 'Get to know the person behind Pegasus Dreamscapes.', action: 'Meet the founder', image: { src: '/images/founder/apollo.webp', alt: 'Apollo Duran, founder of Pegasus Dreamscapes', width: 1100, height: 1375 } },
  representation: { href: '/work-with-apollo', title: 'Buy or sell with Apollo', note: 'Learn about licensed real estate representation.', action: 'Explore representation', image: { src: '/images/founder/apollo.webp', alt: 'Apollo Duran', width: 1100, height: 1375 } },
  faq: { href: '/faq', title: 'A few useful answers', note: 'Read common questions before starting a conversation.', action: 'Read the answers' },
};
// Deliberate whitelist: never add exploration chrome to a transaction or private workspace.
export const JOURNEY_ROUTES: Record<string, readonly string[]> = {
  '/': [], '/property-owners': [], '/deal-partners': ['process', 'work'],
  '/how-we-operate': ['work', 'tools'], '/our-work': [], '/development': ['work', 'process'],
  '/tools': ['process', 'faq'], '/about': ['work', 'process'], '/work-with-apollo': ['about', 'owners'],
  '/buyers': ['representation', 'tools'], '/operators': ['process', 'partners'], '/referral': ['partners', 'process'],
  '/capital': ['process', 'work'], '/ecosystem': ['process', 'partners'], '/marketflow': ['partners', 'process'],
  '/peggy': ['tools', 'faq'], '/faq': ['owners', 'tools'], '/projects': ['process', 'owners'],
  '/projects/nelson-dr': ['process', 'owners'], '/case-study': ['process', 'owners'],
  '/vendor-network': ['partners', 'process'], '/pegasus-standard': ['work', 'process'], '/departments': ['process', 'partners'],
};
export function journeyPath(path: string) { return path.split(/[?#]/, 1)[0].replace(/\/$/, '') || '/'; }

export function JourneyContinuation({ path }: { path: string }) {
  const id = useId();
  const next = JOURNEY_ROUTES[journeyPath(path)];
  if (!next?.length) return null;
  const primary = destinations[next[0]];
  return <section className="journey-continuation" aria-labelledby={id}>
    <div className="experience-wrap journey-continuation-grid">
      <div className="journey-continuation-intro"><h2 id={id}>A clear next step.</h2><p>Take a closer look, at your pace.</p><GuideInvite compact choose /></div>
      <div className="journey-destinations">
        <Link href={primary.href} className={`journey-destination-feature${primary.image ? ' has-image' : ''}`} aria-label={primary.title}>
          {primary.image && <span className="journey-destination-image"><img {...primary.image} loading="lazy" decoding="async" /></span>}
          <span className="journey-destination-copy"><strong>{primary.title}</strong><span className="journey-destination-note">{primary.note}</span><span className="journey-destination-action">{primary.action}<ArrowRight size={20} aria-hidden="true" /></span></span>
        </Link>
        <div className="journey-next-links">{next.slice(1).map(key => {
        const item = destinations[key];
        return <Link key={key} href={item.href}><strong>{item.title}</strong><span className="journey-next-note">{item.note}</span><ArrowRight size={20} aria-hidden="true" /></Link>;
      })}</div></div>
    </div>
  </section>;
}

export function JourneyWayfinder({ path, sections, index, hidden, onAsk }: {
  path: string; sections: GuideSection[]; index: number; hidden: boolean; onAsk: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const host = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => setExpanded(false), [path, hidden]);
  useEffect(() => {
    const navigation = document.querySelector<HTMLElement>('.site-nav');
    if (!navigation || typeof ResizeObserver === 'undefined') return;
    const update = () => document.documentElement.style.setProperty('--journey-nav-height', `${navigation.getBoundingClientRect().height}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(navigation);
    return () => { observer.disconnect(); document.documentElement.style.removeProperty('--journey-nav-height'); };
  }, []);
  useEffect(() => {
    const row = host.current?.querySelector<HTMLElement>('.journey-wayfinder-row');
    if (!row || typeof ResizeObserver === 'undefined') return;
    const update = () => document.documentElement.style.setProperty('--journey-wayfinder-row-height', `${row.getBoundingClientRect().height}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(row);
    return () => { observer.disconnect(); document.documentElement.style.removeProperty('--journey-wayfinder-row-height'); };
  }, [path, hidden, index, sections.length]);
  useEffect(() => {
    if (!expanded) return;
    const dismiss = (event: PointerEvent) => { if (event.target instanceof Node && !host.current?.contains(event.target)) setExpanded(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setExpanded(false); toggle.current?.focus(); } };
    document.addEventListener('pointerdown', dismiss); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape); };
  }, [expanded]);
  if (hidden || !Object.hasOwn(JOURNEY_ROUTES, journeyPath(path)) || sections.length < 3 || index === 0) return null;
  const visit = (section: GuideSection) => {
    setExpanded(false);
    section.element.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    const original = section.element.getAttribute('tabindex');
    section.element.setAttribute('tabindex', '-1'); section.element.focus({ preventScroll: true });
    section.element.addEventListener('blur', () => { if (original === null) section.element.removeAttribute('tabindex'); else section.element.setAttribute('tabindex', original); }, { once: true });
  };
  return <nav ref={host} className="journey-wayfinder" aria-label="Explore this page">
    <div className="experience-wrap journey-wayfinder-row">
      <button ref={toggle} type="button" className="journey-section-toggle" aria-label={`Show page sections. Section ${index + 1} of ${sections.length}: ${sections[index]?.label}`} aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(!expanded)}>
        <span className="journey-section-count">{`${index + 1} of ${sections.length}`}</span>
        <span className="journey-section-name">{sections[index]?.label}</span><ChevronDown size={16} aria-hidden="true" />
      </button>
      <button className="journey-wayfinder-ask" type="button" onClick={() => { setExpanded(false); onAsk(); }}><span className="journey-avatar"><PeggyMark size={23} /></span><span>Ask Peggy</span></button>
    </div>
    {expanded && <div id={id} className="journey-outline experience-wrap">{sections.map((section, i) => <button type="button" key={i} aria-current={i === index ? 'location' : undefined} onClick={() => visit(section)}><span>{String(i + 1).padStart(2, '0')}</span>{section.label}<ArrowRight size={16} aria-hidden="true" /></button>)}</div>}
  </nav>;
}
