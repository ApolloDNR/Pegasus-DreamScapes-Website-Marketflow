import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { HomeProject } from '@/pegasus/home-project';

afterEach(cleanup);

describe('Nelson homepage photograph notes', () => {
  it('changes the selected factual note while keeping both original photographs available', () => {
    render(<HomeProject />);
    const photographs = screen.getAllByRole('img');
    expect(photographs.map(image => image.getAttribute('src'))).toEqual([
      '/images/nelson/kitchen-before.webp', '/images/nelson/kitchen-after.webp',
    ]);
    expect(screen.getByRole('button', { name: 'Island cooktop' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Navy cabinetry' }));
    expect(screen.getByRole('status')).toHaveTextContent('Navy cabinetry replaces the dated galley-kitchen finish shown in the earlier photograph.');
    expect(screen.getByRole('button', { name: 'Island cooktop' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Statement hood' }));
    expect(screen.getByRole('status')).toHaveTextContent('The dark hood sits above the island cooktop in the finished kitchen.');
    expect(screen.getAllByRole('img')).toEqual(photographs);
    expect(screen.getByRole('link', { name: 'Explore the case study' })).toHaveAttribute('href', '/projects/nelson-dr');
  });
});
