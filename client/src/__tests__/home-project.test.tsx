import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { HomeProject } from '@/pegasus/home-project';

afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

describe('Nelson homepage photographic story', () => {
  it('returns to the original kitchen photographs after exploring another room', () => {
    render(<HomeProject />);
    const photographs = screen.getAllByRole('img');
    expect(photographs.map(image => image.getAttribute('src'))).toEqual([
      '/images/nelson/kitchen-before.webp', '/images/nelson/kitchen-after.webp',
    ]);
    expect(screen.getByRole('button', { name: 'Kitchen · Layout' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Living spaces · Connection' }));
    expect(screen.getByRole('status')).toHaveTextContent('dark paneling');
    expect(screen.getByRole('button', { name: 'Kitchen · Layout' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Kitchen · Layout' }));
    expect(screen.getByRole('status')).toHaveTextContent('moved the cooktop to a waterfall island');
    expect(screen.getAllByRole('img')).toEqual(photographs);
    expect(screen.getByRole('link', { name: 'Explore the kitchen' })).toHaveAttribute('href', '/projects/nelson-dr?from=home&story=kitchen#nelson-kitchen');
  });
});
