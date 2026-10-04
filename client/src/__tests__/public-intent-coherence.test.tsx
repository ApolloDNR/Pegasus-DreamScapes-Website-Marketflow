import React from 'react';
import { seoNameFor } from '@shared/seo-routes';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';
import { CATEGORIES } from '@/pegasus/data';
import { CategoryPage } from '@/pegasus/category-page';
import { WorkWithApolloPage } from '@/pegasus/pages';
import { PropertyOwnersPage } from '@/pegasus/property-owners';
import { DealPartnersPage } from '@/pegasus/deal-partners';
import { NavBar } from '@/pegasus/nav';
import { Footer } from '@/pegasus/footer';
import { AboutPageV6 } from '@/pegasus/about-v6';
import DealBlueprintPage from '@/pages/deal-blueprint';
import SubmitPropertyPage from '@/pages/submit-property';

const { apiRequest } = vi.hoisted(() => ({ apiRequest: vi.fn() }));
vi.mock('@/lib/queryClient', () => ({ apiRequest }));
vi.mock('@/lib/analytics', () => ({ trackEvent: vi.fn() }));
vi.mock('@/hooks/use-seo', () => ({ useSEO: vi.fn() }));

function mount(path: string, page: React.ReactNode) {
  window.history.replaceState({}, '', path);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><Router>{page}</Router></QueryClientProvider>);
}
const go = () => {};
const buyerRole = 'Buy a home (Buyer representation)';
const sellerRole = 'List my property (Seller representation)';

beforeEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
  apiRequest.mockReset();
  apiRequest.mockResolvedValue(new Response(JSON.stringify({ id: 'synthetic-review', status: 'New' }), { status: 201 }));
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: vi.fn().mockImplementation((query: string) => ({ matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); window.history.replaceState({}, '', '/'); });

describe('buyer intent stays with the visitor', () => {
  it('gives the retained standalone buyer intake a page-level arrival heading', () => {
    mount('/bring-an-opportunity?intent=buyer', <SubmitPropertyPage />);
    expect(screen.getByRole('heading',{level:1,name:'Investor-interest request.'})).toBeVisible();
  });

  it('routes representation to the buyer choice and criteria to the form already on the page', () => {
    mount('/buyers', <CategoryPage cat={CATEGORIES.buyers} go={go} openPeggy={go} />);
    expect(screen.getByRole('link', { name: /Possible buyer representation/ })).toHaveAttribute('href', '/work-with-apollo?intent=buy#apollo-paths');
    const criteria = screen.getByRole('link', { name: /Investor buyer request/ });
    expect(criteria).toHaveAttribute('href', '#buyer-criteria');
    fireEvent.change(screen.getByLabelText(/First name/), { target: { value: 'Preserved' } });
    // A native anchor must not be intercepted by the SPA route handler.
    let interceptedByRouter = true;
    const stopNativeNavigation = (event: MouseEvent) => {
      interceptedByRouter = event.defaultPrevented;
      event.preventDefault(); // jsdom cannot complete native anchor navigation.
    };
    document.addEventListener('click', stopNativeNavigation, { once: true });
    fireEvent.click(criteria);
    expect(interceptedByRouter).toBe(false);
    expect(screen.getByLabelText(/First name/)).toHaveValue('Preserved');
  });

  it('brings the actual representation field into view when selecting a buying path', () => {
    mount('/work-with-apollo', <WorkWithApolloPage go={go} />);
    const role=screen.getByLabelText('I am a…');
    const scroll=vi.spyOn(role,'scrollIntoView');
    fireEvent.click(screen.getByTestId('apollo-selector-buy'));
    expect(scroll).toHaveBeenCalledWith({behavior:'auto',block:'center'});
    expect(role).toHaveFocus();
  });

  it('preselects buyer intent, synchronizes edits with the URL, and observes history intent', () => {
    mount('/work-with-apollo?intent=buy', <WorkWithApolloPage go={go} />);
    const role = screen.getByLabelText('I am a…');
    expect(role).toHaveValue(buyerRole);
    expect(screen.getByTestId('apollo-selector-buy')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.change(role, { target: { value: sellerRole } });
    expect(new URLSearchParams(window.location.search).get('intent')).toBe('sell');
    expect(screen.getByTestId('apollo-selector-sell')).toHaveAttribute('aria-pressed', 'true');
    act(() => { window.history.replaceState({}, '', '/work-with-apollo?intent=buy'); window.dispatchEvent(new PopStateEvent('popstate')); });
    expect(role).toHaveValue(buyerRole);
    fireEvent.click(screen.getByTestId('apollo-selector-sell'));
    expect(role).toHaveValue(sellerRole);
    expect(new URLSearchParams(window.location.search).get('intent')).toBe('sell');
  });

  it.each(['', '?intent=invalid'])('uses the documented seller default for an unrecognized arrival %s', query => {
    mount(`/work-with-apollo${query}`, <WorkWithApolloPage go={go} />);
    expect(screen.getByLabelText('I am a…')).toHaveValue(sellerRole);
  });
});

describe('page choices have consistent contextual exits', () => {
  it('does not turn an initial owner example into a declared situation, then carries an explicit choice everywhere', () => {
    mount('/property-owners', <PropertyOwnersPage go={go} />);
    for (const link of screen.getAllByRole('link', { name: 'Tell us about the property' })) expect(link.getAttribute('href')).not.toContain('owner_situation');
    fireEvent.click(screen.getByRole('button', { name: 'Inherited property' }));
    const contextual = screen.getByRole('link', { name: 'Start with this situation' }).getAttribute('href');
    for (const link of screen.getAllByRole('link', { name: 'Tell us about the property' })) expect(link).toHaveAttribute('href', contextual);
    expect(contextual).toContain('owner_situation=Inherited%20property');
    expect(contextual).toContain('ref=property-owners');
  });

  it('carries a selected partner need from every deal CTA, retaining a distinct neutral proposal chooser', () => {
    mount('/deal-partners?partner_need=Underwriting', <DealPartnersPage go={go} />);
    const contextual = screen.getByRole('link', { name: 'Bring this opportunity' }).getAttribute('href');
    for (const link of screen.getAllByRole('link', { name: 'Bring a deal' })) expect(link).toHaveAttribute('href', contextual);
    expect(contextual).toContain('partner_need=Underwriting');
    const proposal = screen.getByRole('link', { name: 'Choose a partnership request' });
    expect(proposal.getAttribute('href')).not.toContain('intent=partnership');
    expect(proposal.getAttribute('href')).toContain('partner_need=Underwriting');
  });

  it('preserves owner context on reload and ignores an invalid source choice', () => {
    mount('/property-owners?owner_situation=Vacant%20property', <PropertyOwnersPage go={go} />);
    for (const link of screen.getAllByRole('link', { name: 'Tell us about the property' })) expect(link.getAttribute('href')).toContain('owner_situation=Vacant%20property');
    cleanup();
    mount('/property-owners?owner_situation=Unknown', <PropertyOwnersPage go={go} />);
    for (const link of screen.getAllByRole('link', { name: 'Tell us about the property' })) expect(link.getAttribute('href')).not.toContain('owner_situation');
  });

  it('keeps proposal context visible without choosing a capital or other visitor role', () => {
    mount('/bring-an-opportunity?ref=deal-partners&partner_need=Underwriting', <SubmitPropertyPage />);
    expect(screen.getByText('From Deal Partners: Underwriting')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Deal Partners' })).toHaveAttribute('href', '/deal-partners?partner_need=Underwriting');
    expect(screen.getByRole('button', { name: /A property I own/ })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByText('Other ways to connect'));
    expect(screen.getByRole('button', { name: /A capital relationship/ })).toHaveAttribute('aria-pressed', 'false');
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it('does not declare the default partner example on general deal actions', () => {
    mount('/deal-partners', <DealPartnersPage go={go} />);
    for (const link of screen.getAllByRole('link', { name: 'Bring a deal' })) expect(link.getAttribute('href')).not.toContain('partner_need');
  });
});

describe('one Property Review request identity and a deterministic return', () => {
  it('uses Property Review for every main request action while explaining the legacy product name once', () => {
    mount('/deal-blueprint', <DealBlueprintPage />);
    const links = screen.getAllByRole('link', { name: 'Request a Property Review' });
    expect(links).toHaveLength(2);
    for (const link of links) expect(link).toHaveAttribute('href', '/bring-an-opportunity?intent=blueprint&ref=deal-blueprint');
    expect(screen.queryByRole('link', { name: /Request a Deal Blueprint/ })).not.toBeInTheDocument();
    expect(screen.getByText(/also called a Deal Blueprint/i)).toBeInTheDocument();
  });

  it('returns from Property Review to its Tools parent with a real link', () => {
    mount('/deal-blueprint', <DealBlueprintPage />);
    expect(screen.getByRole('link', { name: 'Back to Tools' })).toHaveAttribute('href', '/tools');
  });

  it.each(['intent', 'type'])('keeps legacy %s=blueprint visibly a request through review and the unchanged payload', async key => {
    mount(`/bring-an-opportunity?${key}=blueprint`, <SubmitPropertyPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Request a Property Review.');
    expect(screen.getByRole('link', { name: 'Back to Property Review' })).toHaveAttribute('href', '/deal-blueprint');
    expect(screen.getByText(/A request is not an order or acceptance/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(screen.getByRole('button', { name: /Just exploring/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(screen.getByRole('button', { name: /^Not sure/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    const summary = screen.getByText('Review your inquiry').closest('details')!;
    expect(summary).toHaveTextContent('Property Review request');
    fireEvent.change(screen.getByLabelText('Full name (required)'), { target: { value: 'Synthetic Review QA' } });
    fireEvent.change(screen.getByLabelText('Email (required)'), { target: { value: 'review@example.test' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Send inquiry' }));
    await waitFor(() => expect(apiRequest).toHaveBeenCalledTimes(1));
    expect(apiRequest.mock.calls[0][1]).toBe('/api/opportunities');
    expect(apiRequest.mock.calls[0][2]).toMatchObject({ leadSource: 'blueprint_request', visitorType: 'strategy_only', consentAccepted: true });
  });

  it('offers only allowlisted origin links, including the selected partner context', () => {
    mount('/bring-an-opportunity?intent=deal-jv&ref=deal-partners&partner_need=Underwriting', <SubmitPropertyPage />);
    expect(screen.getByRole('link', { name: 'Back to Deal Partners' })).toHaveAttribute('href', '/deal-partners?partner_need=Underwriting');
    cleanup();
    mount('/bring-an-opportunity?ref=https://evil.example', <SubmitPropertyPage />);
    expect(screen.getByRole('link', { name: 'Back to Pegasus' })).toHaveAttribute('href', '/');
  });
});

describe('public hierarchy and action names agree', () => {
  it.each(['/strategy-lab', '/strategy-lab?tool=calculators&tab=flip', '/saved', '/deal-blueprint'])('shows Tools as family context, never the current page, from %s', path => {
    mount(path, <NavBar go={go} route="tools" theme="light" toggleTheme={go} scrolled />);
    const link = screen.getByRole('link', { name: 'Tools' });
    expect(link).toHaveAttribute('data-active', 'true');
    expect(link).not.toHaveAttribute('aria-current');
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const mobile = within(screen.getByRole('dialog', { name: 'Primary navigation' })).getByRole('link', { name: 'Tools' });
    expect(mobile).toHaveAttribute('data-active', 'true');
    expect(mobile).not.toHaveAttribute('aria-current');
  });

  it('shows Our Work family on its case study and exact page state only on Our Work itself', () => {
    mount('/projects/nelson-dr', <NavBar go={go} route="ourwork" theme="light" toggleTheme={go} scrolled />);
    const link = screen.getByRole('link', { name: 'Our Work' });
    expect(link).toHaveAttribute('data-active', 'true');
    expect(link).not.toHaveAttribute('aria-current');
    act(() => { window.history.pushState({}, '', '/our-work'); });
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it.each(['/buyers','/capital','/operators','/referral','/vendor-network'])('keeps Real Estate family context on %s', path => {
    mount(path, <NavBar go={go} route="buyers" theme="light" toggleTheme={go} scrolled />);
    expect(screen.getByRole('button',{name:'Real Estate'})).toHaveAttribute('data-active','true');
    expect(screen.queryByRole('link',{current:'page'})).not.toBeInTheDocument();
  });

  it('keeps focus on the opener when choosing the page already open', () => {
    mount('/tools', <NavBar go={go} route="tools" theme="light" toggleTheme={go} scrolled openPeggy={go} />);
    const opener=screen.getByRole('button',{name:'Open menu'}); opener.focus(); fireEvent.click(opener);
    fireEvent.click(within(screen.getByRole('dialog',{name:'Primary navigation'})).getByRole('link',{name:'Tools'}));
    expect(opener).toHaveFocus();
  });
  it('keeps the registered Property Review title consistent with its public action', () => {
    expect(seoNameFor('/deal-blueprint')).toBe('Property Review');
  });

  it('does not return mobile menu focus to the previous-page opener after following a route', () => {
    mount('/about', <NavBar go={go} route="about" theme="light" toggleTheme={go} scrolled />);
    const opener = screen.getByRole('button', { name: 'Open menu' });
    opener.focus();
    fireEvent.click(opener);
    const restoreFocus = vi.spyOn(opener, 'focus');
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Primary navigation' })).getByRole('link', { name: 'Tools' }));
    expect(window.location.pathname).toBe('/tools');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(restoreFocus).not.toHaveBeenCalled();
  });

  it.each(['Close', 'Escape'])('returns mobile menu focus without scrolling when dismissed using %s', dismiss => {
    mount('/about', <NavBar go={go} route="about" theme="light" toggleTheme={go} scrolled />);
    const opener = screen.getByRole('button', { name: 'Open menu' });
    opener.focus();
    fireEvent.click(opener);
    const restoreFocus = vi.spyOn(opener, 'focus');
    if (dismiss === 'Escape') fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    else fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(opener).toHaveFocus();
    expect(restoreFocus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('removes duplicate Connect navigation and reserves Contact Apollo for the chooser', () => {
    mount('/about', <><AboutPageV6 go={go} /><Footer go={go} /></>);
    expect(screen.queryByRole('link', { name: 'Connect', hidden: true })).not.toBeInTheDocument();
    for (const link of screen.getAllByRole('link', { name: 'Start a conversation' })) expect(link).toHaveAttribute('href', '/bring-an-opportunity');
    for (const link of screen.getAllByRole('link', { name: 'Contact Apollo' })) expect(link).toHaveAttribute('href', '/contact');
  });
});
