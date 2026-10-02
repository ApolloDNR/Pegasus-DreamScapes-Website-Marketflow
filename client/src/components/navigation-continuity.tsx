import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { normalizeSpaPath } from '@shared/spa-routes';

// Leave Back/Forward to the browser. Ordinary path changes start at the page;
// local tabs, search parameters, and filters keep their reading position.
export function NavigationContinuity() {
  const [location] = useLocation();
  const previous = useRef<string | null>(null);
  const historyNavigation = useRef(false);
  useEffect(() => {
    const onPop = () => { historyNavigation.current = true; };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => {
    const path = normalizeSpaPath(location);
    const fromHistory = historyNavigation.current;
    historyNavigation.current = false;
    const changed = previous.current !== path;
    previous.current = path;
    if (fromHistory || !changed) return;
    const hash = window.location.hash;
    let targetId = '';
    try { targetId = decodeURIComponent(hash.slice(1)); } catch { return; }
    if (!targetId) window.scrollTo({ top: 0, behavior: 'instant' });
    const focusTarget = () => {
      const target = targetId ? document.getElementById(targetId) : document.querySelector<HTMLElement>('main h1');
      if (!target) return false;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      if (targetId) {
        const headerHeight = document.querySelector('nav')?.getBoundingClientRect().height ?? 88;
        window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight - 16), behavior: 'instant' });
      }
      return true;
    };
    const observer = new MutationObserver(() => { if (focusTarget()) observer.disconnect(); });
    const frame = requestAnimationFrame(() => {
      if (!focusTarget()) observer.observe(document.body, { childList: true, subtree: true });
    });
    const deadline = window.setTimeout(() => observer.disconnect(), 2500);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); clearTimeout(deadline); };
  }, [location]);
  return null;
}
