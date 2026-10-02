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

  // Eight select/deselect pairs perform sixteen full accessible-state checks.
  // Keep every assertion while bounding this exhaustive test independently of
  // the suite's one-second default, which was exceeded on a shared CI runner.
  it('describes each stable planner control with its visible everyday question', () => {
    const { container } = mount(<OpportunityPlan />);
    const plan = within(container);
    fireEvent.click(plan.getByRole('button', { name: 'More planning questions' }));
    expect(within(container.querySelector<HTMLElement>('.op-choices')!).getAllByRole('button')).toHaveLength(8);
    expect(plan.getByRole('button', { name: 'Can the property move forward?' })).toHaveAccessibleDescription('Control');
    expect(plan.getByRole('button', { name: 'Do the numbers make sense?' })).toHaveAccessibleDescription('Underwriting');
    expect(plan.getByRole('button', { name: 'Sell, refinance, or keep it?' })).toHaveAccessibleDescription('Disposition');
    const selector = plan.getByRole('button', { name: /^Choose a planning question/ });
    for (const [, name, href] of [
      ['control', 'Can the property move forward?', '/deal-partners'], ['underwriting', 'Do the numbers make sense?', '/strategy-lab'],
      ['buyer', 'Who is the potential buyer?', '/deal-partners'], ['capital', 'What would funding require?', '/strategy-lab'],
      ['development', 'What work needs to happen?', '/development'], ['local', 'What does the location change?', '/property-owners'],
      ['disposition', 'Sell, refinance, or keep it?', '/strategy-lab'], ['assetops', 'What would ownership involve?', '/strategy-lab'],
    ]) {
      const button = plan.getByRole('button', { name });
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-pressed', 'true');
      expect(selector).toHaveTextContent(name);
      expect(plan.getByRole('link')).toHaveAttribute('href', href);
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(plan.queryByRole('link')).not.toBeInTheDocument();
      expect(selector).toHaveTextContent('Choose a question');
    }
    fireEvent.click(plan.getByRole('button', { name: 'What would funding require?' }));
    expect(plan.getByText(/does not arrange funding or imply that capital is available/)).toBeInTheDocument();
  }, 5_000);

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
