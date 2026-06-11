import type { Route } from './theme';

// Maps the prototype's internal route keys to real wouter URLs and back.
export const ROUTE_TO_URL: Record<Route, string> = {
  home: '/',
  sellers: '/sellers',
  buyers: '/buyers',
  dealfinders: '/dealfinders',
  capital: '/capital',
  operators: '/operators',
  referral: '/referral',
  dealarchitecture: '/deal-architecture',
  investments: '/investments',
  development: '/development',
  strategylab: '/strategy-lab',
  marketflow: '/marketflow',
  apollo: '/work-with-apollo',
  ecosystem: '/ecosystem',
  about: '/about',
  contact: '/contact',
  peggy: '/peggy',
  saved: '/saved',
  submit: '/submit',
};

export const URL_TO_ROUTE: Record<string, Route> = Object.entries(ROUTE_TO_URL).reduce(
  (acc, [route, url]) => {
    acc[url] = route as Route;
    return acc;
  },
  {} as Record<string, Route>,
);

// Every URL the prototype public shell owns. `/submit` is deliberately
// excluded: the prototype shell has no submit surface, so `/submit` must fall
// through to the canonical app-level SubmitPage instead of rendering a blank
// Pegasus shell. `go('submit')` still resolves to `/submit` via ROUTE_TO_URL.
export const PEGASUS_URLS: string[] = Object.values(ROUTE_TO_URL).filter((u) => u !== '/submit');

export function urlFor(route: Route): string {
  return ROUTE_TO_URL[route] ?? '/';
}

export function routeForUrl(path: string): Route {
  return URL_TO_ROUTE[path] ?? 'home';
}

export function isPegasusUrl(path: string): boolean {
  return PEGASUS_URLS.includes(path);
}

// Public surfaces the prototype shell does NOT own, but which should still wear
// the pegasus NavBar/Footer chrome (instead of the legacy global chrome) so the
// public site reads as one seamless experience. Admin and marketflow auth
// surfaces intentionally keep the legacy chrome. Pages with a LIGHT top section
// are listed in STANDALONE_SOLID_NAV so the nav renders solid (not the
// transparent-over-dark-hero treatment) and stays legible.
const STANDALONE_DARK_HERO: string[] = [
  '/submit',
  '/connect',
  '/projects',
  '/library',
  '/faq',
  '/vendor-network',
  '/privacy',
  '/terms',
  '/disclosures',
  '/deal-blueprint',
];

const STANDALONE_SOLID_NAV: string[] = [
  '/strategy-lab/classic',
  // In-funnel destinations from /strategy-lab/classic on submit — keep them on
  // the unified chrome so users don't drop to the legacy site mid-conversion.
  '/strategy-lab/submitted',
  '/strategy-lab/blueprint-confirmed',
  '/strategy-lab/library',
];

// Prefix-matched standalone routes. `/projects/...` detail/case-study pages
// use dark image heroes (transparent nav). `/library/...` article pages have a
// light top, so they need the solid nav treatment.
const STANDALONE_DARK_PREFIX: string[] = [
  '/projects/',
];
const STANDALONE_SOLID_PREFIX: string[] = [
  '/library/',
];
const STANDALONE_CHROME_PREFIX: string[] = [
  ...STANDALONE_DARK_PREFIX,
  ...STANDALONE_SOLID_PREFIX,
];

function cleanPath(path: string): string {
  return path.split('?')[0].split('#')[0];
}

export function isStandaloneChromeUrl(path: string): boolean {
  const p = cleanPath(path);
  if (STANDALONE_DARK_HERO.includes(p)) return true;
  if (STANDALONE_SOLID_NAV.includes(p)) return true;
  return STANDALONE_CHROME_PREFIX.some((prefix) => p.startsWith(prefix));
}

export function isSolidNavUrl(path: string): boolean {
  const p = cleanPath(path);
  if (STANDALONE_SOLID_NAV.includes(p)) return true;
  return STANDALONE_SOLID_PREFIX.some((prefix) => p.startsWith(prefix));
}
