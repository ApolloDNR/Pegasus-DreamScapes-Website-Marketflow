import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, ChevronDown, ConciergeBell, Menu, Phone, X } from 'lucide-react';
import type { Route, Nav, Theme, NavLink } from './theme';
import { ThemeToggle, BrandMark } from './primitives';
import { PREMIUM_NAVIGATION } from './data';
import { urlFor } from './routes';

type PremiumItem = NavLink & { note?: string; badge?: string };

export function NavBar({ go: _go, route, theme, toggleTheme, scrolled, openPeggy }:
  { go: Nav; route: Route; theme: Theme; toggleTheme: () => void; scrolled: boolean; openPeggy?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [location] = useLocation();
  const toggleLock = useRef(0);
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const closeNavigation = () => {
    setMenuOpen(false);
    setMoreOpen(false);
  };
  const itemUrl = (item: PremiumItem) => item.url ?? (item.route ? urlFor(item.route) : '');
  const isActive = (item: PremiumItem) => {
    const href = itemUrl(item);
    if (!href) return false;
    return href === '/' ? location === href : location === href || location.startsWith(`${href}/`);
  };
  const moreIsActive = PREMIUM_NAVIGATION.more.some((group) => group.items.some(isActive));
  const mobileProducts = PREMIUM_NAVIGATION.primary.filter((item) => item.route === 'strategylab' || item.route === 'marketflow');
  const mobileCorePages = PREMIUM_NAVIGATION.primary.filter((item) => item.route !== 'strategylab' && item.route !== 'marketflow');

  const toggleMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const now = Date.now();
    if (now - toggleLock.current < 320) return;
    toggleLock.current = now;
    setMoreOpen(false);
    setMenuOpen((open) => !open);
  };

  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [route, location]);

  useEffect(() => {
    if (!moreOpen) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!moreRef.current?.contains(target) && !moreButtonRef.current?.contains(target)) setMoreOpen(false);
    };
    const onFocus = (event: FocusEvent) => {
      const target = event.target as Node;
      if (!moreRef.current?.contains(target) && !moreButtonRef.current?.contains(target)) setMoreOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMoreOpen(false);
      moreButtonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('focusin', onFocus);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen]);

  useEffect(() => {
    if (!menuOpen) {
      document.body.classList.remove('pg-menu-open');
      navRef.current?.removeAttribute('inert');
      return;
    }
    document.body.classList.add('pg-menu-open');
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : menuButtonRef.current;
    const selector = ['a[href]', 'button:not([disabled])', 'input:not([disabled])', 'select:not([disabled])', '[tabindex]:not([tabindex="-1"])'].join(',');
    const focusables = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>(selector) ?? []).filter((item) => item.getAttribute('aria-hidden') !== 'true');
    (menuRef.current?.querySelector<HTMLElement>('[data-menu-initial-focus]') ?? focusables()[0] ?? menuRef.current)?.focus();
    navRef.current?.setAttribute('inert', '');
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setMenuOpen(false); return; }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) { event.preventDefault(); menuRef.current?.focus(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !menuRef.current?.contains(active))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (active === last || !menuRef.current?.contains(active))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('pg-menu-open');
      navRef.current?.removeAttribute('inert');
      (returnFocusRef.current?.isConnected ? returnFocusRef.current : menuButtonRef.current)?.focus();
      returnFocusRef.current = null;
    };
  }, [menuOpen]);

  const overHero = !scrolled && !menuOpen;
  const text = overHero ? 'text-[var(--cream)]' : 'text-[var(--text)]';
  const activeTone = overHero ? 'text-[var(--accent-bright)]' : 'text-[var(--accent-ink)]';

  return (
    <>
      <nav ref={navRef} className="fixed top-0 inset-x-0 z-40">
        <div className={`absolute inset-0 h-full pointer-events-none transition-all duration-500 ${menuOpen ? 'bg-[var(--bg-2)]' : overHero ? 'hero-scrim-top' : 'bg-[var(--bg)] border-b border-[var(--line)] shadow-[0_18px_44px_-36px_rgba(13,27,44,0.44)]'}`} />
        <div className={`relative max-w-[1440px] mx-auto px-6 lg:px-10 flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-[74px]' : 'h-24'} ${text}`}>
          <Link href="/" aria-label="Pegasus Dreamscapes home" className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <BrandMark boxClassName="w-10 h-10 sm:w-12 sm:h-12" onDark={overHero || theme === 'dark'} />
            <div className="hidden min-[360px]:flex min-[1180px]:hidden min-[1340px]:flex flex-col leading-none text-left min-w-0">
              <span className="font-serif-display text-[16px] sm:text-[22px] tracking-[0.04em] sm:tracking-[0.06em] leading-none whitespace-nowrap">Pegasus Dreamscapes</span>
              <span className={`pg-label !text-[7px] sm:!text-[9px] !tracking-[0.24em] sm:!tracking-[0.34em] ${overHero ? 'text-[var(--accent-bright)]' : 'text-[var(--accent-ink)]'} mt-1.5 whitespace-nowrap`}>Development &middot; Investments &middot; Systems</span>
            </div>
          </Link>

          <div className="hidden min-[1180px]:flex items-center gap-2 min-[1340px]:gap-3 min-[1500px]:gap-5 pg-label !text-[9px] !tracking-[0.16em]">
            {PREMIUM_NAVIGATION.primary.map((item) => (
              <Link key={item.label} href={itemUrl(item)} onClick={closeNavigation} aria-current={isActive(item) ? 'page' : undefined}
                className={`pg-navlink inline-flex min-h-11 shrink-0 items-center whitespace-nowrap px-1.5 transition-opacity hover:opacity-100 ${isActive(item) ? `opacity-100 ${activeTone}` : 'opacity-80'}`} data-active={isActive(item) || undefined}>
                {item.label}{item.badge && <span className="px-nav-badge">{item.badge}</span>}
              </Link>
            ))}
            <div className="relative">
              <button ref={moreButtonRef} type="button" aria-expanded={moreOpen} aria-controls="more-directory" onClick={() => setMoreOpen((open) => !open)}
                className={`pg-navlink inline-flex min-h-11 items-center gap-1.5 px-1.5 ${moreIsActive ? activeTone : 'opacity-80'}`} data-active={moreIsActive || undefined}>
                More <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {moreOpen && (
                <div id="more-directory" ref={moreRef} role="region" aria-label="More Pegasus pages" className="px-more-menu">
                  <div className="px-more-menu-head"><span>Explore Pegasus</span><p>The firm, operating lanes, proof, and systems in one directory.</p></div>
                  <div className="px-more-menu-grid">
                    {PREMIUM_NAVIGATION.more.map((group) => (
                      <section key={group.label}>
                        <h2>{group.label}</h2>
                        {group.items.map((item) => (
                          <Link key={item.label} href={itemUrl(item)} onClick={closeNavigation} aria-current={isActive(item) ? 'page' : undefined}>
                            <span><strong>{item.label}</strong>{item.badge && <em>{item.badge}</em>}</span>
                            {item.note && <small>{item.note}</small>}
                          </Link>
                        ))}
                      </section>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            <ThemeToggle theme={theme} onToggle={toggleTheme} light={overHero} />
            <Link href="/bring-an-opportunity" className={`pg-nav-cta hidden sm:inline-flex ${overHero ? 'pg-nav-cta-hero' : 'pg-nav-cta-scrolled'} px-5 lg:px-6 py-3 pg-label !text-[10px] !tracking-[0.2em] whitespace-nowrap`}>Bring an Opportunity</Link>
            <button ref={menuButtonRef} type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={toggleMenu} style={{ touchAction: 'manipulation' }} className="min-[1180px]:hidden relative z-10 -mr-2 p-2.5">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      <div ref={menuRef} id="mobile-menu" role="dialog" aria-modal={menuOpen ? 'true' : undefined} aria-label="Primary navigation" aria-hidden={!menuOpen} tabIndex={-1} {...(!menuOpen ? { inert: '' } : {})}
        style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }} className={`min-[1180px]:hidden fixed inset-0 z-[100] bg-[var(--bg-2)] transition-opacity duration-300 ease-out ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu" className="absolute right-6 top-6 z-10 inline-flex h-11 w-11 items-center justify-center text-[var(--text)]"><X className="h-6 w-6" /></button>
        <div className="h-full px-6 pt-24 pb-10 flex flex-col text-[var(--text)] overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-3">
            <Link href="/bring-an-opportunity" onClick={closeNavigation} data-menu-initial-focus className="btn-primary px-6 py-4 pg-label !text-[10px] !tracking-[0.2em] text-center inline-flex items-center justify-center gap-2.5 group">Bring an Opportunity <ArrowRight className="w-3.5 h-3.5" /></Link>
            <div className="grid grid-cols-2 gap-3">
              {mobileProducts.map((item) => (
                <Link key={item.label} href={itemUrl(item)} onClick={closeNavigation} aria-current={isActive(item) ? 'page' : undefined} className="btn-line px-4 py-4 pg-label !text-[9px] text-center">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-7 grid gap-3">
            <a href="tel:9257448525" className="btn-line w-full px-6 py-4 pg-label !text-[10px] text-center inline-flex items-center justify-center gap-2.5"><Phone className="w-3.5 h-3.5" /> Call 925-744-8525</a>
            <button type="button" onClick={() => { setMenuOpen(false); openPeggy?.(); }} className="btn-line w-full px-6 py-4 pg-label !text-[10px] text-center inline-flex items-center justify-center gap-2.5"><ConciergeBell className="w-3.5 h-3.5" /> Talk to Peggy</button>
          </div>

          <div className="nav-m-directory">
            <section>
              <h2>Core pages</h2>
              {mobileCorePages.map((item) => (
                <Link key={item.label} href={itemUrl(item)} onClick={closeNavigation} aria-current={isActive(item) ? 'page' : undefined} className="nav-m-directory-link">
                  <strong>{item.label}</strong>
                </Link>
              ))}
            </section>
            {PREMIUM_NAVIGATION.more.map((group) => (
              <section key={group.label}>
                <h2>{group.label}</h2>
                {group.items.map((item) => (
                  <Link key={item.label} href={itemUrl(item)} onClick={closeNavigation} aria-current={isActive(item) ? 'page' : undefined} className="nav-m-directory-link">
                    <strong>{item.label}</strong>
                    {item.note && <small>{item.note}</small>}
                  </Link>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
