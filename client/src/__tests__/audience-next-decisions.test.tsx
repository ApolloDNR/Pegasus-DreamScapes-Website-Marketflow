import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'wouter';
import { HomePathways } from '@/pegasus/home-pathways';
import { PropertyOwnersPage } from '@/pegasus/property-owners';
import { DealPartnersPage } from '@/pegasus/deal-partners';
import { WorkWithApolloPage } from '@/pegasus/pages';
import { APOLLO_FORM } from '@/pegasus/forms';
import { SUBMISSION_NOTICE } from '@/pegasus/public-content';

const go = () => {};
function mount(path: string, page: React.ReactElement) {
  window.history.replaceState({}, '', path);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><Router>{page}</Router></QueryClientProvider>);
}
function closing(container: HTMLElement) {
  return within(container.querySelector<HTMLElement>('.ep-closing')!);
}
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); window.history.replaceState({}, '', '/'); });

// These fail if a path loses its learning outcome, an ending loses its actual
// destination, or exploratory/default context is silently declared as a choice.
describe('audience paths explain the next decision', () => {
  it('explains what each direct home path helps the visitor understand', async () => {
    mount('/', <HomePathways />);
    const paths = [
      { name: 'I own a property', outcome: 'Compare property options, the facts to gather, and what to discuss next.', href: '/property-owners' },
      { name: 'I’m buying or selling', outcome: 'Understand buyer and seller representation before asking Apollo about your plans.', href: '/work-with-apollo' },
      { name: 'I have a deal or partnership', outcome: 'Clarify your proposed role, what the deal needs, and the facts to bring.', href: '/deal-partners' },
    ];
    const user = userEvent.setup();
    for (const path of paths) {
      const link = screen.getByRole('link', { name: new RegExp(path.name) });
      expect(link).toHaveTextContent(path.outcome);
      expect(link).toHaveAttribute('href', path.href);
      await user.tab();
      expect(link).toHaveFocus();
    }
    expect(screen.getAllByRole('link')).toHaveLength(3);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(['', '?owner_situation=Unknown'])('keeps the owner ending neutral without a recognized choice: %s', query => {
    const { container } = mount(`/property-owners${query}`, <PropertyOwnersPage go={go} />);
    const ending = closing(container);
    expect(ending.getByText(/discuss the property as it stands or test your assumptions first/)).toBeVisible();
    expect(ending.getByRole('link', { name: 'Tell us about the property' })).toHaveAttribute('href', '/bring-an-opportunity?intent=property&ref=property-owners');
    expect(ending.getByRole('link', { name: 'Test assumptions in Strategy Lab' })).toHaveAttribute('href', '/strategy-lab');
    expect(ending.getAllByRole('link')).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: 'Explore the numbers first' })).toHaveLength(1);
    expect(ending.getByText(SUBMISSION_NOTICE)).toBeVisible();
  });

  it('carries the chosen owner situation through both ending routes, including a reload', () => {
    const { container } = mount('/property-owners', <PropertyOwnersPage go={go} />);
    fireEvent.click(screen.getByRole('button', { name: 'Inherited property' }));
    const ending = closing(container);
    expect(ending.getByRole('link', { name: 'Tell us about the property' })).toHaveAttribute('href', '/bring-an-opportunity?intent=property&ref=property-owners&owner_situation=Inherited%20property');
    expect(ending.getByRole('link', { name: 'Test assumptions in Strategy Lab' })).toHaveAttribute('href', '/strategy-lab?owner_situation=Inherited%20property');
    const path = window.location.pathname + window.location.search;
    cleanup();
    const reloaded = mount(path, <PropertyOwnersPage go={go} />);
    expect(closing(reloaded.container).getByRole('link', { name: 'Test assumptions in Strategy Lab' })).toHaveAttribute('href', '/strategy-lab?owner_situation=Inherited%20property');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('pairs the partner next decision with its contextual intake and the relevant role explanation', () => {
    const { container } = mount('/deal-partners?partner_need=Underwriting', <DealPartnersPage go={go} />);
    const ending = closing(container);
    expect(ending.getByText(/Decide which question needs resolving first/)).toBeVisible();
    const links = ending.getAllByRole('link');
    expect(links.map(link => link.getAttribute('href'))).toEqual([
      '/bring-an-opportunity?intent=deal-jv&ref=deal-partners&partner_need=Underwriting',
      '/how-we-operate#operating-roles',
    ]);
    expect(links[1]).toHaveAccessibleName('Explore the possible roles');
    expect(ending.getByText(SUBMISSION_NOTICE)).toBeVisible();
    expect(ending.getByText(/No response, buyer, written terms, distribution, funding, or closing is promised/)).toBeVisible();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('keeps representation as one form with its existing exploration link and unchanged terms', () => {
    const { container } = mount('/work-with-apollo?intent=buy', <WorkWithApolloPage go={go} />);
    const ending = within(container.querySelector<HTMLElement>('#apollo-lead')!);
    expect(ending.getByRole('heading', { name: 'Is representation your next step?' })).toBeVisible();
    expect(ending.getByText(APOLLO_FORM.lead)).toBeVisible();
    expect(ending.getByLabelText('I am a…')).toHaveValue('Buy a home (Buyer representation)');
    expect(ending.getByRole('button', { name: 'Request representation' })).toBeVisible();
    expect(container.querySelectorAll('form')).toHaveLength(1);
    expect(screen.getAllByRole('link', { name: 'Explore the buyer paths' })).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Explore the buyer paths' })).toHaveAttribute('href', '/buyers');
    expect(container.querySelector('.ep-closing')).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
});
