import React, { useEffect, useRef, useState, useId } from 'react';
import { ChevronDown, Menu, X, ConciergeBell, ArrowRight, Phone } from 'lucide-react';
import type { Route, Nav, Theme, NavGroup, NavLink } from './theme';
import { NAV_GROUPS } from './data';
import { ThemeToggle, BrandMark } from './primitives';

const NAV_SINGLE: NavLink[] = [
  { label: 'About', route: 'about' },
];

/* High-intent destinations surfaced directly on mobile so they are never
   buried two levels deep inside a dropdown. */
const MOBILE_QUICK: NavLink[] = [
  { label: 'Strategy Lab', route: 'strategylab' },
  { label: 'MarketFlow', route: 'marketflow' },
  { label: 'Work With Apollo', route: 'apollo' },
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
        <div className="nav-dropdown-head">{group.label}</div>
        {group.items.map((i, idx) => (
          <button key={i.route} ref={(el) => { itemRefs.current[idx] = el; }} type="button" role="menuitem"
            tabIndex={open ? 0 : -1}
            onClick={() => choose(i.route)}
            onKeyDown={(e) => onItemKey(e, idx)}
            className={`nav-dropdown-item ${route === i.route ? 'is-active' : ''}`}>
            <span className="nav-dd-title">{i.label}</span>
            {i.desc && <span className="nav-dd-desc">{i.desc}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function NavBar({ go, route, theme, toggleTheme, scrolled, openPeggy }:
  { go: Nav; route: Route; theme: Theme; toggleTheme: () => void; scrolled: boolean; openPeggy: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(NAV_GROUPS[0]?.label ?? null);
  const toggleLock = useRef(0);
  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    // Guard against mobile ghost-clicks / synthesized duplicate taps that
    // would otherwise toggle the menu open then immediately closed.
    if (now - toggleLock.current < 320) return;
    toggleLock.current = now;
    setMenuOpen((o) => !o);
  };
  useEffect(() => { setMenuOpen(false); }, [route]);
  useEffect(() => {
    if (menuOpen) {
      setOpenGroup(NAV_GROUPS[0]?.label ?? null);
      document.body.classList.add('pg-menu-open');
    } else {
      document.body.classList.remove('pg-menu-open');
    }
    return () => document.body.classList.remove('pg-menu-open');
  }, [menuOpen]);
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
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          <ThemeToggle theme={theme} onToggle={toggleTheme} light={overHero} />
          <button type="button" onClick={() => go('submit')}
            className={`hidden sm:inline-flex ${overHero ? 'btn-solid-light' : 'btn-primary'} px-5 lg:px-6 py-3 pg-label !text-[10px] !tracking-[0.2em]`}>
            Submit a Property
          </button>
          <button type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}
            aria-controls="mobile-menu" onClick={toggleMenu} style={{ touchAction: 'manipulation' }}
            className="lg:hidden relative z-10 -mr-1 p-1">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div id="mobile-menu" aria-hidden={!menuOpen} {...(!menuOpen ? { inert: '' } : {})}
        className={`lg:hidden overflow-hidden bg-[var(--bg-2)] border-b border-[var(--line)] transition-[max-height,opacity] duration-500 ease-out ${menuOpen ? 'max-h-[100svh] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pt-1 pb-8 flex flex-col text-[var(--text)] max-h-[calc(100svh-74px)] overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-3 pt-3 pb-6 mb-2 border-b border-[var(--line)]">
            <button type="button" onClick={() => { setMenuOpen(false); go('submit'); }}
              className="btn-primary px-6 py-4 pg-label !text-[10px] !tracking-[0.2em] text-center inline-flex items-center justify-center gap-2.5 group">
              Submit a Property <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); openPeggy(); }}
              className="btn-line px-6 py-4 pg-label !text-[10px] !tracking-[0.2em] text-center inline-flex items-center justify-center gap-2.5">
              <ConciergeBell className="w-3.5 h-3.5" strokeWidth={1.7} /> Talk to PeggyAI
            </button>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {MOBILE_QUICK.map((l) => (
                <button key={l.route} type="button" onClick={() => { setMenuOpen(false); go(l.route); }}
                  className={`nav-m-quick ${route === l.route ? 'is-active' : ''}`}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          {NAV_GROUPS.map((g, gi) => {
            const isOpen = openGroup === g.label;
            const panelId = `mnav-panel-${gi}`;
            return (
              <div key={g.label} className="nav-m-acc">
                <button type="button" aria-expanded={isOpen} aria-controls={panelId}
                  onClick={() => setOpenGroup((cur) => (cur === g.label ? null : g.label))}
                  className="nav-m-acc-trigger w-full">
                  {g.label}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
                </button>
                <div id={panelId} aria-hidden={!isOpen} {...(!isOpen ? { inert: '' } : {})}
                  className={`nav-m-acc-panel ${isOpen ? 'is-open' : ''}`}>
                  <div className="flex flex-col gap-0.5 pb-4">
                    {g.items.map((i) => (
                      <button key={i.route} type="button" tabIndex={isOpen ? 0 : -1}
                        onClick={() => { setMenuOpen(false); go(i.route); }}
                        className={`nav-m-acc-item ${route === i.route ? 'is-active' : ''}`}>
                        {i.label}
                        {i.desc && <span className="nav-m-acc-desc">{i.desc}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          {NAV_SINGLE.map((l) => (
            <div key={l.route} className="nav-m-acc">
              <button type="button" onClick={() => { setMenuOpen(false); go(l.route); }} className="nav-m-acc-trigger w-full">
                {l.label}
              </button>
            </div>
          ))}
          <div className="pt-6 mt-2">
            <button type="button" onClick={() => { setMenuOpen(false); go('submit'); }}
              className="btn-primary w-full px-6 py-4 pg-label !text-[10px] !tracking-[0.2em] text-center inline-flex items-center justify-center gap-2.5 group">
              Submit a Property <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="tel:9257448525"
              className="btn-line mt-3 w-full px-6 py-4 pg-label !text-[10px] !tracking-[0.18em] text-center inline-flex items-center justify-center gap-2.5">
              <Phone className="w-3.5 h-3.5" strokeWidth={1.7} /> Call 925-744-8525
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
