import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, ChevronDown, ConciergeBell, Menu, Phone, Search, X } from 'lucide-react';
import type { Route, Nav, Theme, NavLink } from './theme';
import { BrandMark } from './primitives';
import { PREMIUM_NAVIGATION } from './data';
import { urlFor } from './routes';
import { PRIMARY_LINKS, REAL_ESTATE_LINKS, PUBLIC_ACTIONS, PUBLIC_CONTACT } from './public-content';
import './experience.css';

type PremiumItem = NavLink & { note?: string; badge?: string };

export function NavBar({ go: _go, route, theme, toggleTheme, scrolled, openPeggy }:
  { go: Nav; route: Route; theme: Theme; toggleTheme: () => void; scrolled: boolean; openPeggy?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopMoreOpen, setDesktopMoreOpen] = useState(false);
  const [navigationQuery, setNavigationQuery] = useState('');
  const [location] = useLocation();

  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const desktopMoreRef = useRef<HTMLDivElement>(null);
  const desktopMoreButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const closeNavigation = () => {
    setMenuOpen(false);
    setDesktopMoreOpen(false);
    setNavigationQuery('');
  };
  const itemUrl = (item: PremiumItem) => item.url ?? (item.route ? urlFor(item.route) : '');
  const isActive = (item: PremiumItem) => {
    const href = itemUrl(item);
    if (!href) return false;
    return href === '/' ? location === href : location === href || location.startsWith(`${href}/`);
  };

  const toggleMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuOpen((open) => !open);
  };

  useEffect(() => {
    setMenuOpen(false);
    setDesktopMoreOpen(false);
    setNavigationQuery('');
  }, [route, location]);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const desktop = window.matchMedia('(min-width: 1100px)');
    const onResize = () => {
      if (desktop.matches) setMenuOpen(false);
      else setDesktopMoreOpen(false);
    };
    desktop.addEventListener('change', onResize);
    return () => desktop.removeEventListener('change', onResize);
  }, []);

  useEffect(() => {
    if (!desktopMoreOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!desktopMoreRef.current?.contains(event.target as Node)) {
        setDesktopMoreOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setDesktopMoreOpen(false);
      desktopMoreButtonRef.current?.focus();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [desktopMoreOpen]);

  useEffect(() => {
    if (!menuOpen) {
      document.body.classList.remove('pg-menu-open');
      navRef.current?.removeAttribute('inert');
      return;
    }
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    const background = Array.from(document.querySelectorAll<HTMLElement>('#main-content, footer')).filter(element => !element.hasAttribute('inert'));
    background.forEach(element => element.setAttribute('inert', ''));
    document.body.classList.add('pg-menu-open');
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : menuButtonRef.current;
    const selector = ['a[href]', 'button:not([disabled])', 'input:not([disabled])', 'select:not([disabled])', 'summary', '[tabindex]:not([tabindex="-1"])'].join(',');
    const focusables = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>(selector) ?? []).filter((item) => {
      const closedGroup = item.closest('details:not([open])');
      const style = window.getComputedStyle(item);
      return !item.closest('[hidden], [aria-hidden="true"], [inert]') && (!closedGroup || item.tagName === 'SUMMARY') && style.display !== 'none' && style.visibility !== 'hidden';
    });
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
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      background.forEach(element => element.removeAttribute('inert'));
      navRef.current?.removeAttribute('inert');
      (returnFocusRef.current?.isConnected ? returnFocusRef.current : menuButtonRef.current)?.focus();
      returnFocusRef.current = null;
    };
  }, [menuOpen]);

  const overHero = route === 'home' && !scrolled;
  const current = (href: string) => location === href || location.startsWith(`${href}/`);
  const estateActive = REAL_ESTATE_LINKS.some(item => current(item.href));
  const entries = [
    ...REAL_ESTATE_LINKS.map(item => ({ ...item, note: '' })),
    ...PRIMARY_LINKS.map(item => ({ ...item, note: '' })),
    ...[...PREMIUM_NAVIGATION.primary, ...PREMIUM_NAVIGATION.more.flatMap(group => group.items), ...PREMIUM_NAVIGATION.utilities].map(item => ({ label: item.label, href: itemUrl(item), note: item.note ?? '' })),
    { label: 'Saved work', href: '/saved', note: 'Browser saved Strategy Lab draft and Peggy transcripts' },
    { label: 'Property Review', href: '/deal-blueprint', note: 'Request a scoped review' },
  ];
  const allPages = entries.filter((item, index) => entries.findIndex(other => other.href === item.href) === index);
  const query = navigationQuery.trim().toLowerCase();
  const matches = allPages.filter(item => `${item.label} ${item.note} ${item.href}`.toLowerCase().includes(query));
  const clearNavigationSearch = () => {
    setNavigationQuery('');
    (desktopMoreOpen ? desktopMoreRef.current : menuRef.current)?.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
  };
  const searchControl = (id: string) => <div className="site-search">
    <Search aria-hidden="true" size={18} /><label className="sr-only" htmlFor={id}>Search navigation</label>
    <input id={id} type="search" autoComplete="off" placeholder="Find a page or tool" value={navigationQuery} onChange={event => setNavigationQuery(event.target.value)} />
    {navigationQuery && <button type="button" aria-label="Clear navigation search" onClick={clearNavigationSearch}><X aria-hidden="true" size={18} /></button>}
  </div>;
  const searchResults = <div className="site-search-results"><p role="status">{matches.length} {matches.length === 1 ? 'page' : 'pages'} found</p>
    {matches.map(item => <Link key={item.href} href={item.href} onClick={closeNavigation} aria-current={current(item.href) ? 'page' : undefined}>{item.label}<ArrowRight size={16} aria-hidden="true" /></Link>)}
    {!matches.length && <div><p>Try property, partners, or Strategy Lab.</p><button type="button" onClick={clearNavigationSearch}>Show all pages</button></div>}
  </div>;
  const estateLinks = REAL_ESTATE_LINKS.map(item => <Link key={item.href} href={item.href} onClick={closeNavigation} aria-current={current(item.href) ? 'page' : undefined}>{item.label}<ArrowRight aria-hidden="true" size={16} /></Link>);
  const themeControl = <button type="button" className="site-theme" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}><span>Appearance</span><span>{theme === 'dark' ? 'Dark' : 'Light'} mode</span></button>;

  return <>
    <nav ref={navRef} aria-label="Main navigation" className={`site-nav ${overHero ? 'site-nav-over-hero' : ''}`}>
      <div className="experience-wrap site-nav-inner">
        <Link href="/" aria-label="Pegasus Dreamscapes home" className="site-brand"><BrandMark boxClassName="site-brand-mark" onDark />
          <span><span className="site-wordmark">Pegasus Dreamscapes</span><span className="site-brand-caption">Development · Investments · Systems</span></span>
        </Link>
        <div className="site-desktop-links">
          <div ref={desktopMoreRef} className="site-estate" onBlur={event => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setDesktopMoreOpen(false); }}>
            <button ref={desktopMoreButtonRef} type="button" aria-expanded={desktopMoreOpen} aria-controls="desktop-real-estate" className="site-nav-link" data-active={estateActive || undefined}
              onClick={() => setDesktopMoreOpen(open => !open)} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); setDesktopMoreOpen(true); requestAnimationFrame(() => desktopMoreRef.current?.querySelector<HTMLAnchorElement>('a')?.focus()); } }}>
              Real Estate<ChevronDown aria-hidden="true" size={16} />
            </button>
            {desktopMoreOpen && <div id="desktop-real-estate" className="site-estate-panel">
              <div className="site-estate-links">{estateLinks}</div>
              <details className="site-directory"><summary><Search size={16} aria-hidden="true" />Search the site</summary>{searchControl('desktop-nav-search')}{query && searchResults}</details>
              {themeControl}
            </div>}
          </div>
          {PRIMARY_LINKS.map(item => <Link key={item.href} href={item.href} onClick={closeNavigation} className="site-nav-link" aria-current={current(item.href) ? 'page' : undefined}>{item.label}</Link>)}
        </div>
        <Link href={PUBLIC_ACTIONS.opportunity.href} className="experience-button site-header-action">{PUBLIC_ACTIONS.opportunity.label}<ArrowRight aria-hidden="true" size={16} /></Link>
        <button ref={menuButtonRef} type="button" className="site-menu-button" aria-label="Open menu" aria-expanded={menuOpen} aria-controls="site-mobile-menu" onClick={toggleMenu}><Menu aria-hidden="true" size={21} />Menu</button>
      </div>
    </nav>
    {menuOpen && <div ref={menuRef} id="site-mobile-menu" className="site-mobile-menu" role="dialog" aria-modal="true" aria-label="Primary navigation" tabIndex={-1}>
      <div className="site-mobile-top"><span>Menu</span><button type="button" data-menu-initial-focus onClick={() => setMenuOpen(false)} aria-label="Close menu"><X aria-hidden="true" size={23} />Close</button></div>
      <div className="site-mobile-body">
        <details className="site-mobile-estate" open={estateActive || undefined}><summary>Real Estate<ChevronDown aria-hidden="true" size={19} /></summary><div>{estateLinks}</div></details>
        {PRIMARY_LINKS.map(item => <Link key={item.href} href={item.href} onClick={closeNavigation} className="site-mobile-link" aria-current={current(item.href) ? 'page' : undefined}>{item.label}<ArrowRight aria-hidden="true" size={18} /></Link>)}
        <Link href={PUBLIC_ACTIONS.opportunity.href} onClick={closeNavigation} className="experience-button site-mobile-action">{PUBLIC_ACTIONS.opportunity.label}<ArrowRight aria-hidden="true" size={18} /></Link>
        {searchControl('mobile-nav-search')}{query && searchResults}
        {themeControl}
        <div className="site-mobile-contact"><a href={PUBLIC_CONTACT.telephone}><Phone aria-hidden="true" size={17} />{PUBLIC_CONTACT.phone}</a><button type="button" onClick={() => { closeNavigation(); openPeggy?.(); }}><ConciergeBell aria-hidden="true" size={17} />Talk to Peggy</button></div>
      </div>
    </div>}
  </>;
}
