import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OpportunityPlan } from '@/pegasus/opportunity-plan';
import { PropertyOwnersPage } from '@/pegasus/property-owners';
import { ProjectGallery } from '@/pegasus/project-gallery';
import FAQ from '@/pages/faq';
import { FAQ_SECTIONS } from '@shared/faq-data';

vi.mock('@/hooks/use-seo', () => ({ useSEO: vi.fn() }));
afterEach(() => cleanup());

describe('public design interactions', () => {
  it('connects a development selection to context and a real next step, and lets the visitor clear it', () => {
    render(<OpportunityPlan />);
    const choice = screen.getByRole('button', { name: 'Development' });
    fireEvent.click(choice);
    expect(choice).toHaveAttribute('aria-pressed', 'true');
    expect(document.querySelector('.op-map-focus')).toHaveTextContent('Development');
    expect(document.querySelector('.op-map-node:not(.op-map-focus)')).toHaveTextContent('Local context');
    expect(screen.getByRole('link', { name: 'Explore project planning' })).toHaveAttribute('href', '/development');
    fireEvent.click(choice);
    expect(choice).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('keeps the mobile situation selector, desktop choice, answer, and intake prefill in sync', () => {
    render(<PropertyOwnersPage go={vi.fn()} />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Common owner situations' }), { target: { value: '2' } });
    expect(within(screen.getByRole('group', { name: 'Common owner situations' })).getByRole('button', { name: 'Inherited property' })).toHaveAttribute('aria-pressed', 'true');
    expect(document.getElementById('owner-path')).toHaveTextContent('probate or trust status');
    expect(screen.getByRole('link', { name: 'Start with this situation' })).toHaveAttribute('href', '/bring-an-opportunity?intent=property&owner_situation=Inherited%20property');
  });

  it('searches FAQ answers as well as questions, preserves question identity, and recovers from no results', () => {
    render(<FAQ />);
    const search = screen.getByRole('searchbox', { name: 'Search the answers' });
    fireEvent.change(search, { target: { value: 'diligence' } });
    const matches = FAQ_SECTIONS.flatMap((section) => section.items).filter((item) => /diligence/i.test(`${item.q} ${item.a}`));
    expect(screen.getByRole('status')).toHaveTextContent(`${matches.length} of`);
    expect(screen.getByTestId('faq-q-submitting-a-property-3')).toHaveTextContent('Do you guarantee an offer?');
    fireEvent.change(search, { target: { value: 'unmatched-phrase-987' } });
    expect(screen.getByRole('heading', { name: 'No matching answers.' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset search and filters' }));
    expect(search).toHaveValue('');
    expect(screen.getAllByTestId(/^faq-q-/)).toHaveLength(FAQ_SECTIONS.reduce((count, section) => count + section.items.length, 0));
  });

  it('opens the actual photo, supports next/previous keys and Escape, and returns focus to its trigger', async () => {
    const user = userEvent.setup();
    render(<ProjectGallery pairs={[{ title: 'The kitchen', before: '/before.webp', after: '/after.webp', beforeAlt: 'Kitchen before', afterAlt: 'Kitchen after', note: 'The documented kitchen.' }]} finishes={[]} />);
    const trigger = screen.getByRole('button', { name: 'Enlarge the kitchen, before' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('img', { name: 'Kitchen before' })).toHaveAttribute('src', '/before.webp');
    await user.keyboard('{ArrowRight}');
    expect(within(dialog).getByRole('img', { name: 'Kitchen after' })).toHaveAttribute('src', '/after.webp');
    await user.keyboard('{ArrowLeft}{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
