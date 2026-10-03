import { useLayoutEffect, useState } from 'react';
import { isPrivateNoindexSpaPath } from '@shared/seo-routes';
import { readingTopInset, type GuideSection } from './peggy-page-guide';

export const INLINE_PEGGY_INVITATION = '[data-peggy-invitation]';
type InvitationState = { inline: HTMLElement | null; focused: 'launcher' | 'wayfinder' | null };

function rendered(element: HTMLElement): boolean {
  if (!element.isConnected || element.closest('[hidden],[inert],[aria-hidden="true"]')) return false;
  for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
    const style = getComputedStyle(ancestor);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    if (ancestor.tagName === 'DETAILS' && !ancestor.hasAttribute('open') && !ancestor.querySelector('summary')?.contains(element)) return false;
  }
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/** Only a wholly usable button can replace persistent access. No page text is read. */
function visibleInvitation(element: HTMLElement): boolean {
  if (!rendered(element)) return false;
  const viewport = window.visualViewport;
  const left = viewport?.offsetLeft ?? 0;
  const top = Math.max(viewport?.offsetTop ?? 0, readingTopInset());
  const right = left + (viewport?.width ?? window.innerWidth);
  let bottom = (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight);
  const cookieBar = document.querySelector<HTMLElement>('.pg-cookie-bar');
  if (cookieBar && rendered(cookieBar)) bottom = Math.min(bottom, cookieBar.getBoundingClientRect().top);
  const rect = element.getBoundingClientRect();
  return rect.top >= top && rect.bottom <= bottom && rect.left >= left && rect.right <= right;
}

export function usePeggyInvitationVisibility(path: string, sections: readonly GuideSection[], wayfinder: boolean) {
  const [state, setState] = useState<InvitationState>({ inline: null, focused: null });
  const root = sections[0]?.element.closest<HTMLElement>('[data-peggy-page]') ?? null;
  useLayoutEffect(() => {
    let frame = 0;
    const update = () => {
      const inline = root && !isPrivateNoindexSpaPath(path)
        ? [...root.querySelectorAll<HTMLElement>(INLINE_PEGGY_INVITATION)].find(visibleInvitation) ?? null : null;
      const active = document.activeElement instanceof HTMLElement && rendered(document.activeElement) ? document.activeElement : null;
      const focused = active?.matches('.peggy-fab') ? 'launcher' : active?.matches('.journey-wayfinder-ask') ? 'wayfinder' : null;
      setState(previous => previous.inline === inline && previous.focused === focused ? previous : { inline, focused });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; update(); }); };
    // Observe only the current reading surface and known chrome. There is no
    // document-wide mutation observer or idle polling, and scroll work is batched.
    const mutations = new MutationObserver(schedule);
    if (root) mutations.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'inert', 'aria-hidden', 'class', 'style', 'open'] });
    mutations.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    const resize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    [root, ...document.querySelectorAll<HTMLElement>('.site-nav,.journey-wayfinder-row,.pg-cookie-bar')].forEach(element => { if (element) resize?.observe(element); });
    update();
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    window.addEventListener('resize', schedule);
    root?.addEventListener('transitionend', schedule); root?.addEventListener('animationend', schedule);
    document.addEventListener('focusin', update); document.addEventListener('focusout', schedule);
    window.visualViewport?.addEventListener('resize', schedule); window.visualViewport?.addEventListener('scroll', schedule);
    return () => {
      cancelAnimationFrame(frame); mutations.disconnect(); resize?.disconnect();
      window.removeEventListener('scroll', schedule, true); window.removeEventListener('resize', schedule);
      root?.removeEventListener('transitionend', schedule); root?.removeEventListener('animationend', schedule);
      document.removeEventListener('focusin', update); document.removeEventListener('focusout', schedule);
      window.visualViewport?.removeEventListener('resize', schedule); window.visualViewport?.removeEventListener('scroll', schedule);
    };
  }, [path, root, wayfinder]);
  return state;
}
