import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { normalizeSpaPath } from '@shared/spa-routes';

// A route change is complete only once its own content has arrived. Focusing an
// outgoing heading during a lazy/exit transition can leave the new page at the
// old footer. Native Back/Forward and same-page filters retain their position.
export function NavigationContinuity() {
  const [location] = useLocation();
  const previous = useRef<string | null>(null);
  const historyNavigation = useRef(false);
  useEffect(() => {
    const onPop = () => { historyNavigation.current = true; };
    // Wouter emits these after programmatic history changes. A hash-only POP
    // must not suppress a later ordinary link's arrival.
    const onForward = () => { historyNavigation.current = false; };
    window.addEventListener('popstate', onPop);
    window.addEventListener('pushState', onForward);
    window.addEventListener('replaceState', onForward);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('pushState', onForward);
      window.removeEventListener('replaceState', onForward);
    };
  }, []);
  useEffect(() => {
    const path = normalizeSpaPath(location);
    const fromHistory = historyNavigation.current;
    historyNavigation.current = false;
    const changed = previous.current !== path;
    previous.current = path;
    if (fromHistory || !changed) return;
    let targetId = '';
    try { targetId = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
    let cancelled = false;
    let frame = 0;
    let settleFrame = 0;
    const observer = new MutationObserver(() => schedule());
    const cancel = () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(settleFrame);
      observer.disconnect();
    };
    const findTarget = () => {
      const surfaces = [...document.querySelectorAll<HTMLElement>('[data-navigation-path]')];
      const surface = surfaces.find(element => normalizeSpaPath(element.dataset.navigationPath || '') === path);
      if (surfaces.length && !surface) return null;
      const scope = surface ?? (!surfaces.length ? document.querySelector<HTMLElement>('main') : null);
      const target = targetId ? document.getElementById(targetId) : (scope?.querySelector<HTMLElement>('[data-navigation-target]') ?? scope?.querySelector<HTMLElement>('h1'));
      if (!target || (surface && !surface.contains(target))) return null;
      return target;
    };
    const arrive = () => {
      if (cancelled) return;
      const target = findTarget();
      if (!target) return;
      cancelAnimationFrame(settleFrame);
      // Finish after the destination's layout commits, not against a departing
      // shell. One later frame also lets menu/transition cleanup finish first.
      settleFrame = requestAnimationFrame(() => {
        if (cancelled) return;
        const target = findTarget();
        if (!target?.isConnected) return;
        observer.disconnect();
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        if (targetId || target.hasAttribute('data-navigation-target')) {
          const scrollTarget = target.closest<HTMLElement>('[data-navigation-section]') ?? target;
          const headerHeight = document.querySelector('.site-nav, nav')?.getBoundingClientRect().height ?? 88;
          const targetMargin = Number.parseFloat(getComputedStyle(scrollTarget).scrollMarginTop);
          const clearance = Math.max(headerHeight + 16, Number.isFinite(targetMargin) ? targetMargin : 0);
          window.scrollTo({ top: Math.max(0, scrollTarget.getBoundingClientRect().top + window.scrollY - clearance), behavior: 'instant' });
        } else window.scrollTo({ top: 0, behavior: 'instant' });
      });
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(arrive); };
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-navigation-path', 'data-navigation-target'] });
    schedule();
    // If a visitor starts reading/operating a slow-loading page, don't later
    // take their position or focus away when a deferred heading appears.
    window.addEventListener('pointerdown', cancel, { passive: true });
    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('touchstart', cancel, { passive: true });
    window.addEventListener('keydown', cancel);
    return () => {
      cancel();
      window.removeEventListener('pointerdown', cancel);
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchstart', cancel);
      window.removeEventListener('keydown', cancel);
    };
  }, [location]);
  return null;
}
