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
  connect: '/connect',
};

export const URL_TO_ROUTE: Record<string, Route> = Object.entries(ROUTE_TO_URL).reduce(
  (acc, [route, url]) => {
    acc[url] = route as Route;
    return acc;
  },
  {} as Record<string, Route>,
);

// Website Doctrine v3.0 (Lean Launch Cut) — URLs demoted out of the prototype
// shell for the lean launch. They stay in ROUTE_TO_URL / the Route union (so
// `go(...)` targets and route-map registration are unchanged and the pages can
// return later), but App.tsx redirects them instead of rendering the shell:
// the audience lanes collapse into /submit, the rest into / (or /connect for
// Work With Apollo). Keeping them out of PEGASUS_URLS lets those App.tsx
// redirects win over the prototype shell.
export const REDIRECTED_URLS: string[] = [
  '/sellers',
  '/buyers',
  '/dealfinders',
  '/operators',
  '/referral',
  '/strategy-lab',
  '/marketflow',
  '/peggy',
  '/deal-architecture',
  '/work-with-apollo',
];

// Every URL the prototype public shell owns. `/submit` and `/connect` are
// deliberately excluded: they render canonical app-level pages (SubmitPage /
// ConnectPage), not the prototype shell, so they must fall through instead of
// painting a blank Pegasus shell. `go('submit')` / `go('connect')` still
// resolve via ROUTE_TO_URL. REDIRECTED_URLS are excluded so App.tsx's
// redirects take effect (see above).
export const PEGASUS_URLS: string[] = Object.values(ROUTE_TO_URL).filter(
  (u) => u !== '/submit' && u !== '/connect' && !REDIRECTED_URLS.includes(u),
);

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

// Top-level URL segments that resolve to a real route in <Router> (App.tsx) —
// pegasus pages, standalone pages, functional/auth surfaces, and legacy
// redirects. Any path whose first segment is NOT in this set falls through to
// the catch-all NotFound (404) page. We use that to give the public 404 the
// unified premium chrome (dark navy hero → transparent nav) instead of the
// legacy global Navigation/Footer. Keep this in sync with the route table in
// App.tsx when adding/removing a top-level public route.
const KNOWN_TOP_SEGMENTS: Set<string> = new Set([
  // Pegasus prototype-owned public pages
  'sellers', 'buyers', 'dealfinders', 'capital', 'operators', 'referral',
  'deal-architecture', 'investments', 'development', 'strategy-lab',
  'marketflow', 'work-with-apollo', 'ecosystem', 'about', 'contact', 'peggy',
  'saved',
  // Standalone-chrome + functional public surfaces
  'submit', 'connect', 'projects', 'library', 'strategy-library',
  'vendor-network', 'faq', 'privacy', 'terms', 'disclosures', 'deal-blueprint',
  // Auth / app-internal surfaces (keep legacy chrome on their own 404s)
  'login', 'signup', 'admin', 'snapshot', 'dashboard', 'dealflow',
  'offer-studio', 'profile',
  // Legacy redirect entry points (App.tsx legacyRedirects)
  'sell', 'submit-deal', 'submit-property', 'services', 'resources', 'buy',
  'partner', 'invest', 'calculators', 'education', 'wholesale', 'hq', 'portal',
  'community', 'marketplace',
]);

// True when a path does not match any known top-level route and will therefore
// render the catch-all NotFound (404) page. The home path ('/') is always a
// real route, never a 404.
export function isNotFoundUrl(path: string): boolean {
  const p = cleanPath(path);
  if (p === '/' || p === '') return false;
  const seg = p.split('/').filter(Boolean)[0] ?? '';
  return !KNOWN_TOP_SEGMENTS.has(seg);
}
