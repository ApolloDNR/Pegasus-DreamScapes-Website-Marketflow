import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { HomePageV51 } from '@/pegasus/home-v51';

afterEach(cleanup);
function renderHome() {
  const memory = memoryLocation({ path: '/', record: true });
  const result = render(<Router hook={memory.hook}><HomePageV51 go={() => {}} openPeggy={() => {}} /></Router>);
  return { ...result, history: memory.history as string[] };
}
describe('Blueprint v1.1 mounted homepage', () => {
  it('preserves the approved photograph and refined headline with exactly two arrival actions', () => {
    const { container } = renderHome();
    const arrival = within(container.querySelector<HTMLElement>('[data-hv="arrival"]')!);
    expect(arrival.getByTestId('approved-home-hero-image')).toHaveAttribute('src', '/images/hero/pegasus-v6-arrival.webp');
    expect(arrival.getByRole('heading', { level: 1 })).toHaveTextContent('Complex real estate, a clear way forward.');
    const actions = within(container.querySelector<HTMLElement>('.experience-arrival .experience-actions')!);
    expect(actions.getAllByRole('link').map(link => link.textContent)).toEqual(['Start a conversation', 'See Our Work']);
    expect(arrival.getByRole('link', { name: 'Explore Pegasus' })).toHaveAttribute('href', '#home-paths-title');
    expect(arrival.getByText(/Property strategy, renovation insight/)).toHaveTextContent('Led by Apollo Duran.');
    expect(arrival.getByText(/Architectural vision/)).toBeInTheDocument();
  });
  it('routes the arrival actions as normal links', () => {
    const { container, history } = renderHome();
    const arrival = within(container.querySelector<HTMLElement>('[data-hv="arrival"]')!);
    fireEvent.click(arrival.getByRole('link', { name: 'Start a conversation' }));
    expect(history.at(-1)).toBe('/bring-an-opportunity');
    fireEvent.click(arrival.getByRole('link', { name: 'See Our Work' }));
    expect(history.at(-1)).toBe('/our-work');
  });
  it('removes the repeated proof rail and keeps the six distinct sections', () => {
    const { container } = renderHome();
    expect(container.querySelector('.hv-hero-facts')).toBeNull();
    expect(Array.from(container.querySelectorAll<HTMLElement>('[data-hv]')).map(item => item.dataset.hv)).toEqual(['arrival', 'router', 'proof', 'founder', 'plan', 'final']);
  });
  it('provides three direct visitor links without a second activation', () => {
    const { container, history } = renderHome();
    const router = within(container.querySelector<HTMLElement>('[data-hv="router"]')!);
    const paths = router.getAllByRole('link');
    expect(paths.map(link => link.getAttribute('href'))).toEqual(['/property-owners', '/work-with-apollo', '/deal-partners']);
    expect(router.getAllByRole('button').map(button => button.textContent)).toEqual(['Want help choosing? Ask Peggy.']);
    expect(container.querySelector('.experience-paths button')).toBeNull();
    paths.forEach(link => fireEvent.click(link));
    expect(history.slice(-3)).toEqual(['/property-owners', '/work-with-apollo', '/deal-partners']);
  });
  it('uses real before and after imagery and sends economic detail to the canonical case study', () => {
    const { container } = renderHome();
    const proof = within(container.querySelector<HTMLElement>('[data-hv="proof"]')!);
    expect(proof.getAllByRole('img').map(img => img.getAttribute('src'))).toEqual(['/images/nelson/kitchen-before.webp', '/images/nelson/kitchen-after.webp']);
    expect(proof.getByRole('link', { name: 'Explore the kitchen' })).toHaveAttribute('href', '/projects/nelson-dr?from=home&story=kitchen#nelson-kitchen');
    expect(proof.queryByText(/\$|ROI|profit/)).not.toBeInTheDocument();
  });
  it('keeps method and specialist routes available without repeating their pitch on Home', () => {
    const { container } = renderHome();
    expect(container.querySelector('[data-hv="method"]')).toBeNull();
    expect(container.querySelector('[data-hv="partner"]')).toBeNull();
    expect(within(container).getByRole('link', { name: /I have a deal or partnership/ })).toHaveAttribute('href', '/deal-partners');
  });
  it('loads the optional eight-choice guide on demand and preserves toggling and the safe capital route', async () => {
    const { container } = renderHome();
    const section = within(container.querySelector<HTMLElement>('[data-hv="plan"]')!);
    expect(section.queryByTestId('opportunity-plan')).not.toBeInTheDocument();
    fireEvent.click(section.getByRole('button', { name: 'Open the planning guide' }));
    const plan = within(await section.findByTestId('opportunity-plan'));
    const desktopChoices = within(plan.getByRole('group', { name: 'What is your deal missing?' }));
    expect(desktopChoices.getAllByRole('button')).toHaveLength(3);
    const more = plan.getByRole('button', { name: 'More planning questions' });
    fireEvent.click(more);
    expect(more).toHaveAttribute('aria-expanded', 'true');
    expect(desktopChoices.getAllByRole('button')).toHaveLength(8);
    const capital = desktopChoices.getByRole('button', { name: 'What would funding require?' });
    fireEvent.click(capital);
    expect(capital).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(more);
    expect(more).toHaveAttribute('aria-expanded', 'false');
    expect(capital).toBeVisible();
    expect(plan.getByRole('link', { name: 'Model the assumptions' })).toHaveAttribute('href', '/strategy-lab?question=funding');
    expect(plan.getByText(/does not arrange funding or imply that capital is available/)).toBeInTheDocument();
    fireEvent.click(capital);
    expect(capital).toHaveAttribute('aria-pressed', 'false');
    expect(plan.queryByRole('link')).not.toBeInTheDocument();
  });
  it('identifies the real founder, separates representation, and offers direct human contact', () => {
    const { container } = renderHome();
    const founderElement = container.querySelector<HTMLElement>('[data-hv="founder"]')!;
    const founder = within(founderElement);
    expect(founder.getByRole('img')).toHaveAttribute('src', '/images/founder/apollo.webp');
    expect(founder.getByRole('heading')).toHaveTextContent('Apollo Duran');
    expect(founderElement).toHaveTextContent('CA DRE #02333658');
    expect(founderElement).toHaveTextContent('BMP Realty Inc DBA Keller Williams Realty-East Bay');
    expect(founderElement).not.toHaveTextContent(/sourced the deal|licensed general contractor/);
    expect(founder.getByRole('link', { name: 'Buy or sell with Apollo' })).toHaveAttribute('href', '/work-with-apollo');
    const final = within(container.querySelector<HTMLElement>('[data-hv="final"]')!);
    expect(final.getByRole('heading')).toHaveTextContent('Start with what you have.');
    expect(final.getByRole('link', { name: 'Contact Apollo' })).toHaveAttribute('href', '/contact');
    expect(final.getByText(/Submission does not create representation/)).toBeInTheDocument();
  });
});
