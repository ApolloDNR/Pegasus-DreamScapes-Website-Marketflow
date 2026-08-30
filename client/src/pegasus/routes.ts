import type { Route } from './theme';
import { isKnownSpaPath, normalizeSpaPath } from '@shared/spa-routes';

// Maps the prototype's internal route keys to real wouter URLs and back.
// Master Blueprint v5.1 (§6) renames the public spine: the owner lane is
// /property-owners, the deal lane is /deal-partners, the operating story is
// /how-we-operate, and the proof surface is /our-work. Route KEYS are stable;
// only canonical URLs change. Old URLs 301 via App.tsx + server LEGACY_REDIRECTS
// and stay resolvable below (LEGACY_URL_ALIASES) for direct shell renders.
export const ROUTE_TO_URL: Record<Route, string> = {
  home: '/',
  sellers: '/property-owners',
  buyers: '/buyers',
  dealfinders: '/deal-partners',
  capital: '/capital',
  operators: '/operators',
  referral: '/referral',
  dealstrategy: '/how-we-operate',
  ourwork: '/our-work',
  investments: '/capital',
  development: '/development',
  strategylab: '/strategy-lab',
  marketflow: '/marketflow',
  apollo: '/work-with-apollo',
  ecosystem: '/ecosystem',
  about: '/about',
  contact: '/contact',
  peggy: '/peggy',
  saved: '/saved',
  submit: '/bring-an-opportunity',
  connect: '/connect',
};

// v5.1 renames — the old URLs still resolve to their pages when the shell is
// rendered at them directly (tests, stale in-app links). Public traffic gets a
// real 301 (server + App.tsx) before this map is ever consulted.
export const LEGACY_URL_ALIASES: Record<string, Route> = {
  '/sellers': 'sellers',
  '/dealfinders': 'dealfinders',
  '/deal-strategy': 'dealstrategy',
};

export const URL_TO_ROUTE: Record<string, Route> = Object.entries(ROUTE_TO_URL).reduce(
  (acc, [route, url]) => {
    // Multiple internal route keys may intentionally converge on one public
    // URL. Keep the first canonical owner rather than letting a retired key
    // replace it during reduction.
    if (!acc[url]) acc[url] = route as Route;
    return acc;
  },
  { ...LEGACY_URL_ALIASES } as Record<string, Route>,
);

// Website Spec v4 (Re-skin) restores the full public surface that the v3 Lean
// Launch Cut had temporarily demoted: the six "Who We Serve" audience lanes,
// Deal Strategy, Strategy Lab, MarketFlow, Represent With Apollo, and the
// public Peggy page all render the prototype shell again. Nothing is demoted
// out of the shell, so this list is intentionally empty. It stays an exported
// constant so the redirect-reversal guard test and the PEGASUS_URLS filter
// below keep a single source of truth.
export const REDIRECTED_URLS: string[] = ['/investments'];

// Every URL the prototype public shell owns. The canonical intake and `/connect` are
// deliberately excluded: they render canonical app-level pages (SubmitPage /
// ConnectPage), not the prototype shell, so they must fall through instead of
// painting a blank Pegasus shell. `go('submit')` / `go('connect')` still
// resolve via ROUTE_TO_URL. REDIRECTED_URLS are excluded so App.tsx's
// redirects take effect (see above).
export const PEGASUS_URLS: string[] = Array.from(new Set(
  Object.values(ROUTE_TO_URL).filter(
    (u) => u !== '/bring-an-opportunity' && u !== '/connect' && !REDIRECTED_URLS.includes(u),
  ),
));

export function urlFor(route: Route): string {
  return ROUTE_TO_URL[route] ?? '/';
}

export function routeForUrl(path: string): Route {
  return URL_TO_ROUTE[normalizeSpaPath(path)] ?? 'home';
}

export function isPegasusUrl(path: string): boolean {
  return PEGASUS_URLS.includes(normalizeSpaPath(path));
}

// Public surfaces the prototype shell does NOT own, but which should still wear
// the pegasus NavBar/Footer chrome (instead of the legacy global chrome) so the
// public site reads as one coherent experience. Private MarketFlow auth and
// operator surfaces intentionally keep the legacy chrome; its public access
// and criteria pages belong to the premium public journey. Pages with a LIGHT top section
// are listed in STANDALONE_SOLID_NAV so the nav renders solid (not the
// transparent-over-dark-hero treatment) and stays legible.
const STANDALONE_DARK_HERO: string[] = [
  // Public Website v1 (issue #22): the labeled future-vision page, the
  // operating-model page, and the routed case-study summary.
  '/pegasus-standard',
  '/departments',
  '/case-study',
  '/connect',
  '/projects',
  '/vendor-network',
  '/privacy',
  '/terms',
  '/disclosures',
  '/faq',
  '/deal-blueprint',
  '/marketflow/buyboxes',
];

const STANDALONE_SOLID_NAV: string[] = [
  // v5.1 (§31): "Bring an Opportunity" is the primary public action; it is the
  // canonical URL of the multi-step intake desk. /submit-property 301s to it.
  '/bring-an-opportunity',
  '/submit-property',
  '/marketflow/access',
  '/marketflow/deals',
  '/strategy-lab/classic',
  // In-funnel destinations from /strategy-lab/classic on submit - keep them on
  // the unified chrome so users don't drop to the legacy site mid-conversion.
  '/strategy-lab/submitted',
  '/strategy-lab/blueprint-confirmed',
];

// Prefix-matched standalone routes. `/projects/...` detail/case-study pages
// use dark image heroes (transparent nav).
const STANDALONE_DARK_PREFIX: string[] = [
  '/projects/',
];
const STANDALONE_SOLID_PREFIX: string[] = [];
const STANDALONE_CHROME_PREFIX: string[] = [
  ...STANDALONE_DARK_PREFIX,
  ...STANDALONE_SOLID_PREFIX,
];

export function isStandaloneChromeUrl(path: string): boolean {
  const p = normalizeSpaPath(path);
  if (STANDALONE_DARK_HERO.includes(p)) return true;
  if (STANDALONE_SOLID_NAV.includes(p)) return true;
  return STANDALONE_CHROME_PREFIX.some((prefix) => p.startsWith(prefix));
}

export function isSolidNavUrl(path: string): boolean {
  const p = normalizeSpaPath(path);
  if (STANDALONE_SOLID_NAV.includes(p)) return true;
  return STANDALONE_SOLID_PREFIX.some((prefix) => p.startsWith(prefix));
}

const PRODUCT_SHELL_EXACT_PATHS = new Set([
  '/marketflow/wholesaler',
  '/marketflow/dreamscaper',
  '/marketflow/investor',
  '/marketflow/buyer',
  '/marketflow/buyer/saved',
  '/marketflow/buyer/offers',
  '/marketflow/admin',
  '/marketflow/discover',
  '/marketflow/calculators',
  '/marketflow/resources',
  '/marketflow/community',
  '/marketflow/messages',
  '/marketflow/deals',
  '/marketflow/capital',
  '/marketflow/properties',
  '/marketflow/submit',
  '/marketflow/dashboard',
  '/marketflow/my-deals',
  '/marketflow/analytics',
  '/marketflow/my-analytics',
]);

const PRODUCT_SHELL_PREFIXES = [
  '/dealflow/project/',
  '/marketflow/admin/',
  '/marketflow/deals/',
  '/marketflow/capital/',
  '/marketflow/listings/',
  '/marketflow/properties/',
  '/marketflow/negotiate/',
  '/marketflow/offer-studio/',
];

/** Routes whose page-level product layout owns its own chrome and main. */
export function isProductShellUrl(path: string): boolean {
  const pathname = normalizeSpaPath(path);
  return PRODUCT_SHELL_EXACT_PATHS.has(pathname) ||
    PRODUCT_SHELL_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// The exact/pattern registry is shared with the production HTML fallback, so
// the client chrome and HTTP status agree for invalid nested routes.
export function isNotFoundUrl(path: string): boolean {
  return !isKnownSpaPath(path);
}
