import React, { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import './_group.css';
import type { Nav, Route, PeggyHandoff } from './theme';
import { NavBar } from './nav';
import { Footer } from './pages';
import { Peggy } from './peggy';
import { routeForUrl, urlFor } from './routes';
import { useTheme } from '@/components/theme-provider';

/**
 * PegasusStandaloneShell renders the prototype's NavBar + Footer + Peggy dock
 * around a standalone (non-prototype) public page — e.g. /submit — so the
 * whole public site wears ONE chrome instead of jarring users with the legacy
 * global nav/footer.
 *
 * The prototype design system is scoped under `.pg-root`. The chrome (NavBar,
 * Footer, Peggy) lives inside `.pg-root` wrappers so its CSS variables resolve,
 * but the page `children` render OUTSIDE `.pg-root` so shadcn-token pages
 * (Input/Select/Form) keep their own styling untouched. The NavBar is
 * `position: fixed` and the Footer paints its own background, so each wrapper
 * collapses to ~0 visible height and never leaks the `.pg-root` background.
 *
 * Theme is driven by the app-wide ThemeProvider (not a local useState like
 * Landing) so the chrome and the shadcn page body always share one light/dark
 * mode and the choice persists.
 */
export function PegasusStandaloneShell({
  children,
  solidNav = false,
}: {
  children: ReactNode;
  /** Force the solid (scrolled) nav treatment for pages with a light top. */
  solidNav?: boolean;
}) {
  const [location, setLocation] = useLocation();
  const route: Route = routeForUrl(location);
  const { resolvedTheme, setTheme } = useTheme();
  const theme: 'light' | 'dark' = resolvedTheme === 'dark' ? 'dark' : 'light';

  const [scrolled, setScrolled] = useState(false);
  const [peggyOpen, setPeggyOpen] = useState(false);
  const [peggyRole, setPeggyRole] = useState<string | null>(null);

  const go = useCallback<Nav>(
    (r) => {
      setLocation(urlFor(r));
      window.scrollTo({ top: 0, behavior: 'auto' });
    },
    [setLocation],
  );

  const toggleTheme = useCallback(
    () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    [setTheme, theme],
  );
  const setPeggyPanel = useCallback((v: boolean) => {
    setPeggyOpen(v);
    if (!v) setPeggyRole(null);
  }, []);
  const toStrategyLab = useCallback(() => go('strategylab'), [go]);
  const toSubmit = useCallback(
    (intent?: string) => {
      setLocation(intent ? `/submit?intent=${intent}` : '/submit');
      window.scrollTo({ top: 0, behavior: 'auto' });
    },
    [setLocation],
  );
  const onHandoffToReview = useCallback((_h: PeggyHandoff) => go('contact'), [go]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 40);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dataTheme = theme === 'dark' ? 'dark' : undefined;

  return (
    <>
      <div className="pg-root" data-theme={dataTheme}>
        <NavBar
          go={go}
          route={route}
          theme={theme}
          toggleTheme={toggleTheme}
          scrolled={solidNav || scrolled}
        />
      </div>

      {children}

      <div className="pg-root" data-theme={dataTheme}>
        <Footer go={go} />
        <Peggy
          open={peggyOpen}
          setOpen={setPeggyPanel}
          toStrategyLab={toStrategyLab}
          onHandoffToReview={onHandoffToReview}
          go={go}
          toSubmit={toSubmit}
          initialRole={peggyRole}
        />
      </div>
    </>
  );
}

export default PegasusStandaloneShell;
