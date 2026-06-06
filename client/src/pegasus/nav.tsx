import React, { useEffect, useRef, useState, useId } from 'react';
import { ChevronDown, Menu, X, ConciergeBell, ArrowRight } from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/supabase-auth-context';
import type { Route, Nav, Theme, NavGroup, NavLink } from './theme';
import { NAV_GROUPS } from './data';
import { ThemeToggle, BrandMark } from './primitives';

function AccountControl({ go, route }: { go: Nav; route: Route }) {
  const { isAuthenticated, signOut } = useSupabaseAuth();
  return (
    <>
      <button type="button" onClick={() => go('saved')}
        className={`link-underline transition-colors hover:opacity-100 ${route === 'saved' ? 'text-[var(--accent-bright)]' : 'opacity-80'}`}>
        Saved
      </button>
      {isAuthenticated ? (
        <button type="button" onClick={() => signOut()}
          className="link-underline transition-colors hover:opacity-100 opacity-80">
          Sign out
        </button>
      ) : (
        <a href="/login" className="link-underline transition-colors hover:opacity-100 opacity-80">
          Sign in
        </a>
      )}
    </>
  );
}

function MobileAccount({ go, close }: { go: Nav; close: () => void }) {
  const { isAuthenticated, signOut } = useSupabaseAuth();
  const cls = 'py-2.5 text-left border-b border-[var(--line)] font-serif-display text-[1.55rem] leading-tight text-[var(--text)]';
  return (
    <>
      <button type="button" onClick={() => { close(); go('saved'); }} className={cls}>Saved</button>
      {isAuthenticated ? (
        <button type="button" onClick={() => { close(); signOut(); }} className={cls}>Sign out</button>
      ) : (
        <a href="/login" onClick={() => close()} className={cls}>Sign in</a>
      )}
    </>
  );
}

const NAV_SINGLE: NavLink[] = [
  { label: 'About', route: 'about' },
];

function NavDropdown({ group, route, go }: { group: NavGroup; route: Route; go: Nav }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const triggerId = useId();
  const menuId = useId();
  const active = group.items.some((i) => i.route === route);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      clearTimeout(closeTimer.current);
    };
  }, []);

  const openNow = () => { clearTimeout(closeTimer.current); setOpen(true); };
  const closeSoon = () => { closeTimer.current = setTimeout(() => setOpen(false), 110); };
  const closeToTrigger = () => { setOpen(false); triggerRef.current?.focus(); };
  const choose = (r: Route) => { setOpen(false); go(r); };
  const focusItem = (idx: number) => {
    const n = group.items.length;
    itemRefs.current[((idx % n) + n) % n]?.focus();
  };
  const openToFirst = () => { setOpen(true); requestAnimationFrame(() => focusItem(0)); };

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openToFirst();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => focusItem(group.items.length - 1));
    } else if (e.key === 'Escape' && open) {
      closeToTrigger();
    }
  };

  const onItemKey = (e: React.KeyboardEvent, idx: number) => {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); focusItem(idx + 1); break;
      case 'ArrowUp': e.preventDefault(); focusItem(idx - 1); break;
      case 'Home': e.preventDefault(); focusItem(0); break;
      case 'End': e.preventDefault(); focusItem(group.items.length - 1); break;
      case 'Escape': e.preventDefault(); closeToTrigger(); break;
      case 'Tab': setOpen(false); break;
      default: break;
    }
  };

  return (
    <div ref={wrapRef} className="nav-group" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button ref={triggerRef} id={triggerId} type="button" aria-haspopup="true" aria-expanded={open}
        aria-controls={menuId} onClick={() => setOpen((o) => !o)} onKeyDown={onTriggerKey}
        className={`link-underline inline-flex items-center gap-1.5 transition-colors hover:opacity-100 ${active || open ? 'text-[var(--accent-bright)]' : 'opacity-80'}`}>
        {group.label}
        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
      </button>
      <div id={menuId} className={`nav-dropdown ${open ? 'is-open' : ''}`} role="menu" aria-labelledby={triggerId} aria-hidden={!open}>
        {group.items.map((i, idx) => (
          <button key={i.route} ref={(el) => { itemRefs.current[idx] = el; }} type="button" role="menuitem"
            tabIndex={open ? 0 : -1}
            onClick={() => choose(i.route)}
            onKeyDown={(e) => onItemKey(e, idx)}
            className={`nav-dropdown-item ${route === i.route ? 'is-active' : ''}`}>
            {i.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function NavBar({ go, route, theme, toggleTheme, scrolled, openPeggy }:
  { go: Nav; route: Route; theme: Theme; toggleTheme: () => void; scrolled: boolean; openPeggy: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setMenuOpen(false); }, [route]);
  const overHero = !scrolled && !menuOpen;
  const text = overHero ? 'text-[var(--cream)]' : 'text-[var(--text)]';

  return (
    <nav className="fixed top-0 inset-x-0 z-40">
      <div className={`absolute inset-0 h-full pointer-events-none transition-all duration-500 ${menuOpen ? 'bg-[var(--bg-2)]' : overHero ? 'hero-scrim-top' : 'bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--line)]'}`} />
      <div className={`relative max-w-[1320px] mx-auto px-6 lg:px-12 flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-[74px]' : 'h-24'} ${text}`}>
        <button type="button" onClick={() => go('home')} className="flex items-center gap-3.5">
          <BrandMark boxClassName="w-12 h-12" onDark={overHero || theme === 'dark'} />
          <div className="hidden sm:flex flex-col leading-none text-left">
            <span className="font-serif-display text-[22px] tracking-[0.06em] leading-none">Pegasus DreamScapes</span>
            <span className="pg-label !text-[9px] !tracking-[0.34em] text-[var(--accent-bright)] mt-1.5">Deal Architecture</span>
          </div>
        </button>

        <div className="hidden lg:flex items-center gap-8 pg-label !text-[10px] !tracking-[0.2em]">
          {NAV_GROUPS.map((g) => (
            <NavDropdown key={g.label} group={g} route={route} go={go} />
          ))}
          {NAV_SINGLE.map((l) => (
            <button key={l.route} type="button" onClick={() => go(l.route)}
              className={`link-underline transition-colors hover:opacity-100 ${route === l.route ? 'text-[var(--accent-bright)]' : 'opacity-80'}`}>
              {l.label}
            </button>
          ))}
          <button type="button" onClick={() => go('peggy')}
            className={`link-underline inline-flex items-center gap-1.5 transition-colors hover:opacity-100 ${route === 'peggy' ? 'text-[var(--accent-bright)]' : 'opacity-80'}`}>
            <ConciergeBell className="w-3 h-3" strokeWidth={1.8} /> Talk to PeggyAI
          </button>
          <AccountControl go={go} route={route} />
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          <ThemeToggle theme={theme} onToggle={toggleTheme} light={overHero} />
          <button type="button" onClick={() => go('contact')}
            className={`hidden sm:inline-flex ${overHero ? 'btn-solid-light' : 'btn-primary'} px-5 lg:px-6 py-3 pg-label !text-[10px] !tracking-[0.2em]`}>
            Start a Review
          </button>
          <button type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}
            aria-controls="mobile-menu" onClick={() => setMenuOpen((o) => !o)} className="lg:hidden relative z-10">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div id="mobile-menu" aria-hidden={!menuOpen} {...(!menuOpen ? { inert: '' } : {})}
        className={`lg:hidden overflow-hidden bg-[var(--bg-2)] transition-[max-height,opacity] duration-500 ease-out ${menuOpen ? 'max-h-[920px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 py-6 flex flex-col gap-5 text-[var(--text)] max-h-[calc(100vh-74px)] overflow-y-auto">
          {NAV_GROUPS.map((g) => (
            <div key={g.label}>
              <div className="nav-m-group-label mb-1.5">{g.label}</div>
              <div className="flex flex-col">
                {g.items.map((i) => (
                  <button key={i.route} type="button" onClick={() => go(i.route)}
                    className={`py-2.5 text-left border-b border-[var(--line)] font-serif-display text-[1.55rem] leading-tight ${route === i.route ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                    {i.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {NAV_SINGLE.map((l) => (
            <button key={l.route} type="button" onClick={() => go(l.route)}
              className={`py-2.5 text-left border-b border-[var(--line)] font-serif-display text-[1.55rem] leading-tight ${route === l.route ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
              {l.label}
            </button>
          ))}
          <MobileAccount go={go} close={() => setMenuOpen(false)} />
          <button type="button" onClick={() => { setMenuOpen(false); openPeggy(); }}
            className="btn-line px-6 py-4 pg-label !text-[10px] !tracking-[0.2em] mt-1 text-center inline-flex items-center justify-center gap-2.5">
            <ConciergeBell className="w-3.5 h-3.5" strokeWidth={1.7} /> Talk to PeggyAI
          </button>
          <button type="button" onClick={() => go('contact')}
            className="btn-primary px-6 py-4 pg-label !text-[10px] !tracking-[0.2em] text-center inline-flex items-center justify-center gap-2.5 group">
            Start a Review <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </nav>
  );
}
