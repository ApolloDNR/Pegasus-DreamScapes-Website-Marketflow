import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { Menu, X, ArrowRight, Phone } from 'lucide-react';
import type { Route, Nav, Theme, NavLink } from './theme';
import { ThemeToggle, BrandMark } from './primitives';
import { NAV_LINKS } from './data';
import { urlFor } from './routes';

/* Master Blueprint v5.1 (§6, §31) locks the top navigation to the public
   relationship — How We Operate, Property Owners, Deal Partners, Our Work,
   About — with "Bring an Opportunity" as the primary nav button (routing to
   the /bring-an-opportunity intake desk). Supersedes issue #22 §5.1. */

export function NavBar({ go, route, theme, toggleTheme, scrolled }:
  { go: Nav; route: Route; theme: Theme; toggleTheme: () => void; scrolled: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
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
  useEffect(() => { setMenuOpen(false); }, [route, location]);
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

  const navigate = (item: NavLink) => {
    if (item.url) setLocation(item.url);
    else if (item.route) go(item.route);
  };
  const isActive = (item: NavLink) =>
    location === (item.url ?? (item.route ? urlFor(item.route) : ''));

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
            <span className={`pg-label !text-[7px] sm:!text-[9px] !tracking-[0.24em] sm:!tracking-[0.34em] ${overHero ? "text-[var(--accent-bright)]" : "text-[var(--accent-ink)]"} mt-1.5`}>Development &middot; Investments &middot; Systems</span>
          </div>
        </button>

        <div className="hidden min-[1340px]:flex items-center gap-5 min-[1500px]:gap-7 pg-label !text-[10px] !tracking-[0.2em]">
          {NAV_LINKS.map((item) => (
            <button key={item.label} type="button" onClick={() => navigate(item)}
              className={`pg-navlink inline-flex min-h-11 items-center px-1.5 transition-opacity hover:opacity-100 ${isActive(item) ? 'opacity-100 text-[var(--accent-bright)]' : 'opacity-80'}`}
              data-active={isActive(item) || undefined}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          <ThemeToggle theme={theme} onToggle={toggleTheme} light={overHero} />
          <button type="button" onClick={() => setLocation('/bring-an-opportunity')}
            className={`hidden sm:inline-flex ${overHero ? 'btn-solid-light' : 'btn-primary'} px-5 lg:px-6 py-3 pg-label !text-[10px] !tracking-[0.2em]`}>
            Bring an Opportunity
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
            <button type="button" onClick={() => { setMenuOpen(false); setLocation('/bring-an-opportunity'); }}
              className="btn-primary px-6 py-4 pg-label !text-[10px] !tracking-[0.2em] text-center inline-flex items-center justify-center gap-2.5 group">
              Bring an Opportunity <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="tel:9257448525"
              className="btn-line w-full px-6 py-4 pg-label !text-[10px] !tracking-[0.18em] text-center inline-flex items-center justify-center gap-2.5">
              <Phone className="w-3.5 h-3.5" strokeWidth={1.7} /> Call 925-744-8525
            </a>
          </div>

          <div className="mt-7 flex flex-col">
            {NAV_LINKS.map((item) => (
              <div key={item.label} className="nav-m-acc">
                <button type="button" className="nav-m-acc-trigger w-full"
                  onClick={() => { setMenuOpen(false); navigate(item); }}>
                  {item.label}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
