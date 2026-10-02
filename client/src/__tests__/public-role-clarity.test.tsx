import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { DevelopmentPage } from '@/pegasus/pages';
import { ConnectChooser } from '@/pages/connect';
import { Footer } from '@/pegasus/footer';

afterEach(cleanup);

describe('public role clarity', () => {
  it('presents the contact card as opportunity and partnership intake rather than construction services', () => {
    render(<ConnectChooser />);
    const opening = document.querySelector('.ep-opening') as HTMLElement;
    expect(opening).toHaveTextContent('Property opportunities, development partnerships, and real estate operations in the East Bay.');
    expect(opening).not.toHaveTextContent('Residential construction');
    expect(opening).toHaveTextContent('Paolo Ariel “Apollo” Duran Ramirez');
  });

  it('frames development as an opportunity before the intake action and preserves provider qualifications', () => {
    render(<DevelopmentPage go={vi.fn()} />);
    const opening = document.querySelector('.ep-opening') as HTMLElement;
    expect(within(opening).getByRole('heading', { level: 1 })).toHaveTextContent('Explore a development opportunity.');
    expect(opening).toHaveTextContent('property or potential development partnership');
    expect(opening).toHaveTextContent('qualified providers, applicable licenses');
    expect(within(opening).getByRole('link', { name: 'Discuss an opportunity' })).toHaveAttribute('href', '/bring-an-opportunity?intent=explore');
    expect(screen.getByText(/This page does not claim an in-house construction team/)).toBeVisible();
  });

  it('keeps the formal licensed identity and responsible broker visible in the shared footer', () => {
    render(<Footer go={vi.fn()} />);
    const identity = screen.getByTestId('text-footer-identity');
    expect(identity).toHaveTextContent('Paolo Ariel “Apollo” Duran Ramirez');
    expect(identity).toHaveTextContent('DRE #02333658');
    expect(identity).toHaveTextContent('BMP Realty Inc DBA Keller Williams Realty-East Bay');
    expect(identity).toHaveTextContent('not a real estate brokerage');
    expect(identity.closest('details')).toBeNull();
  });
});
