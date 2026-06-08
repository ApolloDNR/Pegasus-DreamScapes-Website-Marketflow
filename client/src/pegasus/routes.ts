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
