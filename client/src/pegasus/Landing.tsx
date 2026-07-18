import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import './_group.css';
import type { Nav, Route, Theme, PeggyHandoff } from './theme';
import { CATEGORIES } from './data';
import { NavBar } from './nav';
import { Peggy } from './peggy';
import {
  CategoryPage, InvestmentsPage, DevelopmentPage,
  StrategyLabPage, MarketFlowPage, WorkWithApolloPage, EcosystemPage, PeggyPage,
  AboutPage, ContactPage, CapitalPage, Footer,
} from './pages';
import { HomePageV51 } from './home-v51';
import { OurWorkPage } from './our-work';
import { HowWeOperatePage } from './how-we-operate';
import { PropertyOwnersPage } from './property-owners';
import { DealPartnersPage } from './deal-partners';
import { SavedPage } from './Saved';
import { routeForUrl, urlFor } from './routes';
import { useSEO } from '@/hooks/use-seo';
import { useTheme } from '@/components/theme-provider';
import { seoFor, seoNameFor } from '@shared/seo-routes';

export function Landing() {
  const [location, setLocation] = useLocation();
  const route: Route = routeForUrl(location);
  // Per-route SEO from the canonical shared map (single source of truth shared
  // with the server-side crawler injection). useSEO re-applies the brand, so we
  // pass the bare page name.
  const seo = seoFor(location);
  useSEO({ title: seoNameFor(location), description: seo.description, image: seo.image, type: seo.type });
  // Theme is driven by the app-wide ThemeProvider so the chrome stays in sync
  // when navigating between the prototype shell and the standalone-shell pages
  // (which also consume the same provider). No local theme state.
  const { resolvedTheme, setTheme } = useTheme();
  const theme: Theme = resolvedTheme === 'dark' ? 'dark' : 'light';
  const [scrolled, setScrolled] = useState(false);
  const [peggyOpen, setPeggyOpen] = useState(false);
  const [peggyRole, setPeggyRole] = useState<string | null>(null);
  const [peggyHandoff, setPeggyHandoff] = useState<PeggyHandoff | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const go = useCallback<Nav>((r) => {
    setLocation(urlFor(r));
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [setLocation]);

  const toggleTheme = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [setTheme, theme]);
  const openPeggy = useCallback((role?: string) => {
    if (role) setPeggyRole(role);
    setPeggyOpen(true);
  }, []);
  const setPeggyPanel = useCallback((v: boolean) => {
    setPeggyOpen(v);
    if (!v) setPeggyRole(null);
  }, []);
  const toStrategyLab = useCallback(() => go('strategylab'), [go]);
  const toSubmit = useCallback((intent?: string) => {
    setLocation(intent ? `/submit?intent=${intent}` : '/submit');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [setLocation]);
  const onHandoffToReview = useCallback((h: PeggyHandoff) => {
    setPeggyHandoff(h);
    go('contact');
  }, [go]);

  // Reveal observer - re-run on route change so new page elements animate in
  useEffect(() => {
    observerRef.current?.disconnect();
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('draw-on-view')) entry.target.classList.add('is-drawn');
          else {
            entry.target.classList.remove('reveal-pending');
            entry.target.classList.add('animate-fade-in-up');
          }
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    observerRef.current = obs;
    const id = requestAnimationFrame(() => {
      document.querySelectorAll('.reveal, .draw-on-view').forEach((el) => {
        if (el.classList.contains('reveal') && !el.classList.contains('animate-fade-in-up')) el.classList.add('reveal-pending');
        obs.observe(el);
      });
    });
    return () => { cancelAnimationFrame(id); obs.disconnect(); };
  }, [route]);

  // Scroll progress + hero parallax + nav state
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        if (progressRef.current) progressRef.current.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
        if (parallaxRef.current && !reduce) parallaxRef.current.style.transform = `translateY(${y * 0.22}px)`;
        setScrolled(y > 40);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [route]);

  return (
    // overflow-x-clip (not -hidden): hidden makes this div a scroll container
    // and silently kills position:sticky for the whole prototype — including
    // the Deal Routing Board pin. clip clips without creating a scroller.
    <div className="pg-root min-h-screen antialiased selection:bg-[var(--accent)] selection:text-white overflow-x-clip"
      data-theme={theme === 'dark' ? 'dark' : undefined}>
      <div ref={progressRef} className="scroll-progress" />

      <NavBar go={go} route={route} theme={theme} toggleTheme={toggleTheme} scrolled={scrolled} />

      <main key={route} className="page-in">
        {/* v5.1 homepage (seven movements). The issue-#22 HomePage stays
            exported for reference but no longer mounts. */}
        {route === 'home' && <HomePageV51 go={go} openPeggy={openPeggy} />}
        {/* v5.1 §9/§10: bespoke owner + deal-partner pages replace the old
            CategoryPage lanes at the renamed canonical URLs. */}
        {route === 'sellers' && <PropertyOwnersPage go={go} />}
        {route === 'buyers' && <CategoryPage cat={CATEGORIES.buyers} go={go} openPeggy={openPeggy} />}
        {route === 'dealfinders' && <DealPartnersPage go={go} />}
        {route === 'capital' && <CapitalPage go={go} />}
        {route === 'operators' && <CategoryPage cat={CATEGORIES.operators} go={go} openPeggy={openPeggy} />}
        {route === 'referral' && <CategoryPage cat={CATEGORIES.referral} go={go} openPeggy={openPeggy} />}
        {/* v5.1 §8: How We Operate is the intellectual center. */}
        {route === 'dealstrategy' && <HowWeOperatePage go={go} />}
        {route === 'ourwork' && <OurWorkPage go={go} />}
        {route === 'investments' && <InvestmentsPage go={go} openPeggy={openPeggy} />}
        {route === 'development' && <DevelopmentPage go={go} />}
        {route === 'strategylab' && <StrategyLabPage go={go} openPeggy={openPeggy} />}
        {route === 'marketflow' && <MarketFlowPage go={go} />}
        {route === 'apollo' && <WorkWithApolloPage go={go} />}
        {route === 'ecosystem' && <EcosystemPage go={go} openPeggy={openPeggy} />}
        {route === 'about' && <AboutPage go={go} openPeggy={openPeggy} />}
        {route === 'contact' && <ContactPage handoff={peggyHandoff} />}
        {route === 'peggy' && <PeggyPage go={go} openPeggy={openPeggy} />}
        {route === 'saved' && <SavedPage go={go} />}
      </main>

      <Footer go={go} />

      <Peggy open={peggyOpen} setOpen={setPeggyPanel} toStrategyLab={toStrategyLab} onHandoffToReview={onHandoffToReview} go={go} toSubmit={toSubmit} initialRole={peggyRole} />
    </div>
  );
}

export default Landing;
