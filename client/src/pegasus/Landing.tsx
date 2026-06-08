import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import './_group.css';
import type { Nav, Route, Theme, PeggyHandoff } from './theme';
import { CATEGORIES } from './data';
import { NavBar } from './nav';
import { Peggy } from './peggy';
import {
  HomePage, CategoryPage, DealArchitecturePage, InvestmentsPage, DevelopmentPage,
  StrategyLabPage, MarketFlowPage, WorkWithApolloPage, EcosystemPage, PeggyPage,
  AboutPage, ContactPage, Footer,
} from './pages';
import { SavedPage } from './Saved';
import { routeForUrl, urlFor } from './routes';
import { useSEO } from '@/hooks/use-seo';
import { seoFor, seoNameFor } from '@shared/seo-routes';

export function Landing() {
  const [location, setLocation] = useLocation();
  const route: Route = routeForUrl(location);
  // Per-route SEO from the canonical shared map (single source of truth shared
  // with the server-side crawler injection). useSEO re-applies the brand, so we
  // pass the bare page name.
  const seo = seoFor(location);
  useSEO({ title: seoNameFor(location), description: seo.description, image: seo.image, type: seo.type });
  const [theme, setTheme] = useState<Theme>('light');
  const [scrolled, setScrolled] = useState(false);
  const [peggyOpen, setPeggyOpen] = useState(false);
  const [peggyHandoff, setPeggyHandoff] = useState<PeggyHandoff | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const go = useCallback<Nav>((r) => {
    setLocation(urlFor(r));
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [setLocation]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  const openPeggy = useCallback(() => setPeggyOpen(true), []);
  const toStrategyLab = useCallback(() => go('strategylab'), [go]);
  const toSubmit = useCallback((intent?: string) => {
    setLocation(intent ? `/submit?intent=${intent}` : '/submit');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [setLocation]);
  const onHandoffToReview = useCallback((h: PeggyHandoff) => {
    setPeggyHandoff(h);
    go('contact');
  }, [go]);

  // Reveal observer — re-run on route change so new page elements animate in
  useEffect(() => {
    observerRef.current?.disconnect();
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('draw-on-view')) entry.target.classList.add('is-drawn');
          else entry.target.classList.add('animate-fade-in-up');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    observerRef.current = obs;
    const id = requestAnimationFrame(() => {
      document.querySelectorAll('.reveal, .draw-on-view').forEach((el) => {
        if (el.classList.contains('reveal') && !el.classList.contains('animate-fade-in-up')) el.classList.add('opacity-0');
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
    <div className="pg-root min-h-screen antialiased selection:bg-[var(--accent)] selection:text-white overflow-x-hidden"
      data-theme={theme === 'dark' ? 'dark' : undefined}>
      <div ref={progressRef} className="scroll-progress" />

      <NavBar go={go} route={route} theme={theme} toggleTheme={toggleTheme} scrolled={scrolled} openPeggy={openPeggy} />

      <main key={route} className="page-in">
        {route === 'home' && <HomePage go={go} theme={theme} parallaxRef={parallaxRef} openPeggy={openPeggy} />}
        {route === 'sellers' && <CategoryPage cat={CATEGORIES.sellers} go={go} openPeggy={openPeggy} />}
        {route === 'buyers' && <CategoryPage cat={CATEGORIES.buyers} go={go} openPeggy={openPeggy} />}
        {route === 'dealfinders' && <CategoryPage cat={CATEGORIES.dealfinders} go={go} openPeggy={openPeggy} />}
        {route === 'capital' && <CategoryPage cat={CATEGORIES.capital} go={go} openPeggy={openPeggy} />}
        {route === 'operators' && <CategoryPage cat={CATEGORIES.operators} go={go} openPeggy={openPeggy} />}
        {route === 'referral' && <CategoryPage cat={CATEGORIES.referral} go={go} openPeggy={openPeggy} />}
        {route === 'dealarchitecture' && <DealArchitecturePage go={go} openPeggy={openPeggy} />}
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

      <Footer go={go} openPeggy={openPeggy} />

      <Peggy open={peggyOpen} setOpen={setPeggyOpen} toStrategyLab={toStrategyLab} onHandoffToReview={onHandoffToReview} go={go} toSubmit={toSubmit} />
    </div>
  );
}

export default Landing;
