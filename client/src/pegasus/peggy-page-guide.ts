import { useEffect, useRef, useState } from 'react';
import { seoNameFor, isPrivateNoindexSpaPath } from '@shared/seo-routes';
import { normalizeSpaPath } from '@shared/spa-routes';
import { pageContextText, sanitizePeggyPageContext, type PeggyPageContext } from '@shared/peggy-page-context';

const EXCLUDED = 'form,input,textarea,select,[contenteditable]:not([contenteditable="false"]),[data-peggy-private],[hidden],[inert],[aria-hidden="true"],script,style,nav,[role="dialog"],.sr-only';
export type GuideSection = { element: HTMLElement; title: string; label: string; summary?: string };

function visible(element: HTMLElement, root: HTMLElement): boolean {
  if (element.closest(EXCLUDED)) return false;
  for (let current: HTMLElement | null = element; current && root.contains(current); current = current.parentElement) {
    const style = getComputedStyle(current);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (current.tagName === 'DETAILS' && !current.hasAttribute('open') && !current.querySelector('summary')?.contains(element)) return false;
  }
  return true;
}

export function readGuideSections(root: HTMLElement): GuideSection[] {
  return [...root.querySelectorAll<HTMLElement>('h1,h2')]
    .filter(element => visible(element, root))
    .map((element, index) => ({ element, title: pageContextText(element.textContent, 180), label: index === 0 && element.tagName === 'H1' ? 'Introduction' : pageContextText(element.textContent, 80), summary: pageContextText(element.dataset.peggySummary, 280) || undefined }))
    .filter(section => section.title).slice(0, 24);
}

function between(node: Node, section: GuideSection, next?: GuideSection): boolean {
  return Boolean(section.element.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING)
    && !section.element.contains(node)
    && (!next || Boolean(node.compareDocumentPosition(next.element) & Node.DOCUMENT_POSITION_FOLLOWING));
}

export function readSectionContext(root: HTMLElement, sections: GuideSection[], index: number, path: string): PeggyPageContext | null {
  path = normalizeSpaPath(path.split(/[?#]/, 1)[0]);
  const section = sections[index];
  if (!section || !root.contains(section.element)) return null;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const parts: string[] = [];
  let node: Node | null;
  let length = 0;
  while ((node = walker.nextNode()) && length < 1800) {
    const parent = node.parentElement;
    if (!parent || !between(node, section, sections[index + 1]) || !visible(parent, root)) continue;
    const text = pageContextText(node.textContent, 500);
    if (text) { parts.push(text); length += text.length + 1; }
  }
  return sanitizePeggyPageContext({ path, page: path === '/' ? 'Home' : (seoNameFor(path) || pageContextText(root.querySelector('h1')?.textContent, 100)), section: pageContextText(section.element.textContent, 180), excerpt: parts.join(' ') });
}

function activeSectionIndex(sections: GuideSection[]): number {
  const navigationHeight = document.querySelector('.site-nav')?.getBoundingClientRect().height ?? 0;
  const anchor = Math.max(navigationHeight + 76, Math.min(220, Math.max(130, innerHeight * 0.25)));
  let index = 0;
  sections.forEach((section, i) => { if (section.element.getBoundingClientRect().top <= anchor) index = i; });
  return index;
}

export function readPageSelection(root: HTMLElement): string {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || !selection.rangeCount) return '';
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return '';
  const ancestor = range.commonAncestorContainer instanceof HTMLElement ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
  if (!ancestor || !visible(ancestor, root)) return '';
  // A selection across a form or a hidden/private region is deliberately rejected.
  if ([...root.querySelectorAll(EXCLUDED)].some(element => range.intersectsNode(element))) return '';
  return pageContextText(selection.toString(), 800);
}

export function usePeggyPageGuide(pagePath: string, enabled: boolean) {
  const path = normalizeSpaPath(pagePath.split(/[?#]/, 1)[0] || '/');
  const [state, setState] = useState<{ path: string; sections: GuideSection[]; index: number; context: PeggyPageContext | null }>({ path, sections: [], index: 0, context: null });
  const [selection, setSelection] = useState<{ path: string; text: string } | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const sectionsRef = useRef<GuideSection[]>([]);

  useEffect(() => {
    setSelection(null);
    setState({ path, sections: [], index: 0, context: null });
    rootRef.current = null;
    sectionsRef.current = [];
    if (!enabled || isPrivateNoindexSpaPath(path)) return;
    const root = document.querySelector<HTMLElement>('[data-peggy-page]');
    if (!root) return;
    rootRef.current = root;
    let frame = 0;
    let lastIndex = -1;
    let timer: ReturnType<typeof setTimeout>;
    const update = (rebuild = false) => {
      if (rebuild) sectionsRef.current = readGuideSections(root);
      const sections = sectionsRef.current;
      const index = activeSectionIndex(sections);
      if (!rebuild && index === lastIndex) return;
      lastIndex = index;
      const context = readSectionContext(root, sections, index, path);
      setState(previous => previous.path === path && previous.index === index && previous.sections === sections && JSON.stringify(previous.context) === JSON.stringify(context) ? previous : { path, sections, index, context });
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => update()); };
    const rebuild = () => { clearTimeout(timer); timer = setTimeout(() => update(true), 120); };
    const onSelection = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('.peggy-panel,.peggy-tour,.peggy-selection-launcher')) return;
      const text = readPageSelection(root);
      setSelection(text ? { path, text } : null);
    };
    const onSelectionChange = () => {
      // Native mobile selection handles may not dispatch mouseup or keyup.
      // Keep a deliberate selection available when tapping its Ask action.
      const text = readPageSelection(root);
      if (text) setSelection({ path, text });
    };
    update(true);
    const observer = new MutationObserver(rebuild);
    observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'inert', 'aria-hidden', 'open'] });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', rebuild);
    document.addEventListener('mouseup', onSelection);
    document.addEventListener('keyup', onSelection);
    document.addEventListener('selectionchange', onSelectionChange);
    return () => {
      cancelAnimationFrame(frame); clearTimeout(timer); observer.disconnect();
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', rebuild);
      document.removeEventListener('mouseup', onSelection); document.removeEventListener('keyup', onSelection);
      document.removeEventListener('selectionchange', onSelectionChange);
    };
  }, [path, enabled]);

  const current = state.path === path ? state : { path, sections: [], index: 0, context: null };
  const snapshot = (index?: number) => {
    if (!rootRef.current) return null;
    const sections = index === undefined ? readGuideSections(rootRef.current) : sectionsRef.current;
    return readSectionContext(rootRef.current, sections, index ?? activeSectionIndex(sections), path);
  };
  return { ...current, selectedText: selection?.path === path ? selection.text : '', snapshot, clearSelection: () => setSelection(null) };
}
