import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, ArrowRight, Phone, ChevronDown } from 'lucide-react';
import type { Route, Nav, Theme } from './theme';
import { ThemeToggle, BrandMark } from './primitives';
import { NAV_GROUPS } from './data';

export function NavBar({ go, route, theme, toggleTheme, scrolled }:
  { go: Nav; route: Route; theme: Theme; toggleTheme: () => void; scrolled: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<number | null>(null);
  const [mAcc, setMAcc] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
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
  useEffect(() => { setMenuOpen(false); setOpenGroup(null); setMAcc(null); }, [route]);
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('pg-menu-open');
    } else {
      document.body.classList.remove('pg-menu-open');
    }
    return () => document.body.classList.remove('pg-menu-open');
  }, [menuOpen]);
  // Close the desktop dropdowns on Escape or an outside click (keyboard + mouse).
  useEffect(() => {
    if (openGroup === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenGroup(null); };
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenGroup(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [openGroup]);
  const overHero = !scrolled && !menuOpen;
  const text = overHero ? 'text-[var(--cream)]' : 'text-[var(--text)]';

  return (
    <>
    <nav className="fixed top-0 inset-x-0 z-40">
      <div
        className={`absolute inset-0 h-full pointer-events-none transition-all duration-500 ${
          menuOpen
            ? 'bg-[var(--bg-2)]'
            : overHero
              ? 'hero-scrim-top'
              : 'bg-[var(--bg)] border-b border-[var(--line)] shadow-[0_18px_44px_-36px_rgba(13,27,44,0.44)]'
        }`}
      />
      <div className={`relative max-w-[1320px] mx-auto px-6 lg:px-12 flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-[74px]' : 'h-24'} ${text}`}>
        <button type="button" onClick={() => go('home')} className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <BrandMark boxClassName="w-10 h-10 sm:w-12 sm:h-12" onDark={overHero || theme === 'dark'} />
          <div className="hidden min-[360px]:flex flex-col leading-none text-left min-w-0">
            <span className="font-serif-display text-[16px] sm:text-[22px] tracking-[0.04em] sm:tracking-[0.06em] leading-none whitespace-nowrap">Pegasus Dreamscapes</span>
            <span className="pg-label !text-[7px] sm:!text-[9px] !tracking-[0.24em] sm:!tracking-[0.34em] text-[var(--accent-bright)] mt-1.5">Deal Strategy</span>
          </div>
        </button>

        <div ref={navRef} className="hidden min-[1340px]:flex items-center gap-5 min-[1500px]:gap-7 pg-label !text-[10px] !tracking-[0.2em]">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label} className="nav-group"
              onMouseEnter={() => setOpenGroup(gi)}
              onMouseLeave={() => setOpenGroup((g) => (g === gi ? null : g))}>
              <button type="button"
                aria-haspopup="true"
                aria-expanded={openGroup === gi}
                aria-controls={`nav-dd-${gi}`}
                onClick={() => setOpenGroup((g) => (g === gi ? null : gi))}
                className={`inline-flex min-h-11 items-center gap-1.5 px-1.5 transition-opacity hover:opacity-100 ${openGroup === gi ? 'opacity-100 text-[var(--accent-bright)]' : 'opacity-80'}`}>
                {group.label}
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${openGroup === gi ? 'rotate-180' : ''}`} strokeWidth={2} />
              </button>
              <div id={`nav-dd-${gi}`} aria-label={group.label}
                className={`nav-dropdown ${openGroup === gi ? 'is-open' : ''}`}
                {...(openGroup === gi ? {} : { inert: '' })}>
                <div className="nav-dropdown-head">{group.label}</div>
                {group.items.map((item) => (
                  <button key={item.route} type="button"
                    onClick={() => { setOpenGroup(null); go(item.route); }}
                    className={`nav-dropdown-item ${route === item.route ? 'is-active' : ''}`}>
                    <span className="nav-dd-title">{item.label}</span>
                    {item.desc && <span className="nav-dd-desc">{item.desc}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button type="button" onClick={() => go('about')}
            className={`inline-flex min-h-11 items-center px-1.5 transition-opacity hover:opacity-100 ${route === 'about' ? 'opacity-100 text-[var(--accent-bright)]' : 'opacity-80'}`}>
            About
          </button>
          <button type="button" onClick={() => go('peggy')}
            className={`inline-flex min-h-11 items-center px-1.5 transition-opacity hover:opacity-100 ${route === 'peggy' ? 'opacity-100 text-[var(--accent-bright)]' : 'opacity-80'}`}>
            Talk to Peggy
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
            className="min-[1340px]:hidden relative z-10 -mr-2 p-2.5">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </nav>

      <div id="mobile-menu" aria-hidden={!menuOpen} {...(!menuOpen ? { inert: '' } : {})}
        style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
        className={`min-[1340px]:hidden fixed inset-0 z-30 bg-[var(--bg-2)] transition-opacity duration-300 ease-out ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="h-full px-6 pt-24 pb-10 flex flex-col text-[var(--text)] overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-3">
            <button type="button" onClick={() => { setMenuOpen(false); go('submit'); }}
              className="btn-primary px-6 py-4 pg-label !text-[10px] !tracking-[0.2em] text-center inline-flex items-center justify-center gap-2.5 group">
              Submit a Property <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="tel:9257448525"
              className="btn-line w-full px-6 py-4 pg-label !text-[10px] !tracking-[0.18em] text-center inline-flex items-center justify-center gap-2.5">
              <Phone className="w-3.5 h-3.5" strokeWidth={1.7} /> Call 925-744-8525
            </a>
          </div>

          <div className="mt-7 flex flex-col">
            {NAV_GROUPS.map((group, gi) => (
              <div key={group.label} className="nav-m-acc">
                <button type="button" className="nav-m-acc-trigger w-full"
                  aria-expanded={mAcc === gi} aria-controls={`nav-m-acc-${gi}`}
                  onClick={() => setMAcc((g) => (g === gi ? null : gi))}>
                  {group.label}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mAcc === gi ? 'rotate-180' : ''}`} strokeWidth={2} />
                </button>
                <div id={`nav-m-acc-${gi}`} className={`nav-m-acc-panel ${mAcc === gi ? 'is-open' : ''}`}
                  {...(mAcc === gi ? {} : { inert: '' })}>
                  <div className="pb-4 pt-1 flex flex-col gap-1.5">
                    {group.items.map((item) => (
                      <button key={item.route} type="button"
                        onClick={() => { setMenuOpen(false); go(item.route); }}
                        className={`nav-m-acc-item ${route === item.route ? 'is-active' : ''}`}>
                        {item.label}
                        {item.desc && <span className="nav-m-acc-desc">{item.desc}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div className="nav-m-acc">
              <button type="button" className="nav-m-acc-trigger w-full"
                onClick={() => { setMenuOpen(false); go('about'); }}>
                About
              </button>
            </div>
            <div className="nav-m-acc">
              <button type="button" className="nav-m-acc-trigger w-full"
                onClick={() => { setMenuOpen(false); go('peggy'); }}>
                Talk to Peggy
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
