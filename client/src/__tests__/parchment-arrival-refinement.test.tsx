import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { HomePageV51 } from '@/pegasus/home-v51';
import { OpportunityPlan } from '@/pegasus/opportunity-plan';
import { PropertyOwnersPage } from '@/pegasus/property-owners';

afterEach(cleanup);
function mount(ui: React.ReactNode, path = '/') {
  const memory = memoryLocation({ path, record: true });
  return render(<Router hook={memory.hook}>{ui}</Router>);
}

describe('Approved parchment arrival refinement', () => {
  it('welcomes an unfinished idea without changing the hero asset or six sections', () => {
    const { container } = mount(<HomePageV51 go={() => {}} openPeggy={() => {}} />);
    const arrival = within(container.querySelector<HTMLElement>('[data-hv="arrival"]')!);
    expect(arrival.getByRole('heading', { level: 1 })).toHaveTextContent('Complex real estate, a clear way forward.');
    expect(arrival.getByTestId('approved-home-hero-image')).toHaveAttribute('src', '/images/hero/pegasus-v6-arrival.webp');
    expect(Array.from(container.querySelectorAll<HTMLElement>('[data-hv]')).map(section => section.dataset.hv)).toEqual(['arrival', 'router', 'proof', 'founder', 'plan', 'final']);
    const invitation = within(container.querySelector<HTMLElement>('[data-hv="final"]')!);
    expect(invitation.getByText(/You don.t need a finished plan/)).toBeInTheDocument();
    expect(invitation.getByText(/Submission does not create representation/)).toBeInTheDocument();
  });

  it('describes each stable planner control with its visible everyday question', () => {
    const { container } = mount(<OpportunityPlan />);
    const plan = within(container);
    expect(plan.getAllByRole('button')).toHaveLength(8);
    expect(plan.getByRole('button', { name: 'Control' })).toHaveAccessibleDescription('Can the property move forward?');
    expect(plan.getByRole('button', { name: 'Underwriting' })).toHaveAccessibleDescription('Do the numbers make sense?');
    expect(plan.getByRole('button', { name: 'Disposition' })).toHaveAccessibleDescription('Sell, refinance, or keep it?');
    for (const [name, href] of [
      ['Control', '/deal-partners'], ['Underwriting', '/strategy-lab'],
      ['Buyer', '/deal-partners'], ['Capital', '/strategy-lab'],
      ['Development', '/development'], ['Local context', '/property-owners'],
      ['Disposition', '/strategy-lab'], ['Asset operations', '/strategy-lab'],
    ]) {
      const button = plan.getByRole('button', { name });
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(plan.getByRole('link')).toHaveAttribute('href', href);
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(plan.queryByRole('link')).not.toBeInTheDocument();
    }
    fireEvent.click(plan.getByRole('button', { name: 'Capital' }));
    expect(plan.getByText(/without implying funding/)).toBeInTheDocument();
  });

  it('balances the owner opening with real project evidence while preserving the property intake', () => {
    const { container } = mount(<PropertyOwnersPage go={() => {}} />, '/property-owners');
    const opening = within(container.querySelector<HTMLElement>('.ep-opening')!);
    expect(opening.getByRole('heading', { level: 1 })).toHaveTextContent('A clear next step for your property.');
    expect(opening.getByRole('img')).toHaveAttribute('src', '/images/nelson/nelson-exterior-1280.webp');
    // PageOpening uppercases captions; assert the factual label, not its casing.
    expect(opening.getByText(/Completed project/i)).toBeInTheDocument();
    expect(opening.getByRole('link', { name: 'Tell us about the property' })).toHaveAttribute('href', '/bring-an-opportunity?intent=property');
  });
});
