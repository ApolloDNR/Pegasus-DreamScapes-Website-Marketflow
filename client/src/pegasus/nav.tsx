import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, ArrowRight, Phone } from 'lucide-react';
import type { Route, Nav, Theme } from './theme';
import { ThemeToggle, BrandMark } from './primitives';

export function NavBar({ go, route, theme, toggleTheme, scrolled }:
  { go: Nav; route: Route; theme: Theme; toggleTheme: () => void; scrolled: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
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
      document.body.classList.add('pg-menu-open');
    } else {
      document.body.classList.remove('pg-menu-open');
    }
    return () => document.body.classList.remove('pg-menu-open');
  }, [menuOpen]);
  const overHero = !scrolled && !menuOpen;
  const text = overHero ? 'text-[var(--cream)]' : 'text-[var(--text)]';

  return (
    <>
    <nav className="fixed top-0 inset-x-0 z-40">
      <div className={`absolute inset-0 h-full pointer-events-none transition-all duration-500 ${menuOpen ? 'bg-[var(--bg-2)]' : overHero ? 'hero-scrim-top' : 'bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--line)]'}`} />
      <div className={`relative max-w-[1320px] mx-auto px-6 lg:px-12 flex items-center justify-between transition-all duration-500 ${scrolled ? 'h-[74px]' : 'h-24'} ${text}`}>
        <button type="button" onClick={() => go('home')} className="flex items-center gap-3.5">
          <BrandMark boxClassName="w-12 h-12" onDark={overHero || theme === 'dark'} />
          <div className="hidden sm:flex flex-col leading-none text-left">
            <span className="font-serif-display text-[22px] tracking-[0.06em] leading-none">Pegasus DreamScapes</span>
            <span className="pg-label !text-[9px] !tracking-[0.34em] text-[var(--accent-bright)] mt-1.5">Deal Strategy</span>
          </div>
        </button>

        <div className="hidden lg:flex items-center gap-8 pg-label !text-[10px] !tracking-[0.2em]">
          <button type="button" onClick={() => go('connect')}
            className={`link-underline transition-colors hover:opacity-100 ${route === 'connect' ? 'text-[var(--accent-bright)]' : 'opacity-80'}`}>
            Connect
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
    </nav>

      <div id="mobile-menu" aria-hidden={!menuOpen} {...(!menuOpen ? { inert: '' } : {})}
        style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
        className={`lg:hidden fixed inset-0 z-30 bg-[var(--bg-2)] transition-opacity duration-300 ease-out ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="h-full px-6 pt-24 pb-10 flex flex-col text-[var(--text)] overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-3 pt-3">
            <button type="button" onClick={() => { setMenuOpen(false); go('submit'); }}
              className="btn-primary px-6 py-4 pg-label !text-[10px] !tracking-[0.2em] text-center inline-flex items-center justify-center gap-2.5 group">
              Submit a Property <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button type="button" onClick={() => { setMenuOpen(false); go('connect'); }}
              className="btn-line px-6 py-4 pg-label !text-[10px] !tracking-[0.18em] text-center inline-flex items-center justify-center gap-2.5">
              Connect
            </button>
            <a href="tel:9257448525"
              className="btn-line mt-1 w-full px-6 py-4 pg-label !text-[10px] !tracking-[0.18em] text-center inline-flex items-center justify-center gap-2.5">
              <Phone className="w-3.5 h-3.5" strokeWidth={1.7} /> Call 925-744-8525
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
