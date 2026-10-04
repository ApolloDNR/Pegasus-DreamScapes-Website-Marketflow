import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { HomeProject } from '@/pegasus/home-project';
import { ProjectGallery } from '@/pegasus/project-gallery';
import { NELSON_PAIRS } from '@/pegasus/nelson-gallery-data';
import NelsonDrPage from '@/pages/project-nelson-dr';
import { PageClosing } from '@/pegasus/experience-page';

afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });

describe('visitor-controlled photographic story', () => {
  it('changes the whole room story and sends visitors to the matching case-study anchor', () => {
    render(<HomeProject />);
    fireEvent.click(screen.getByRole('button', { name: 'Living spaces · Connection' }));
    expect(screen.getByRole('button', { name: 'Living spaces · Connection' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('img').map(i => i.getAttribute('src'))).toEqual(['/images/nelson/living-before.webp', '/images/nelson/living-after.webp']);
    expect(screen.getByRole('status')).toHaveTextContent('What changed');
    expect(screen.getByRole('status')).toHaveTextContent('What to consider');
    expect(screen.getByRole('link', { name: 'Explore the living spaces' })).toHaveAttribute('href', '/projects/nelson-dr?from=home&story=living#nelson-living');
    expect(new URLSearchParams(window.location.search).get('story')).toBe('living');
  });
  it('replaces an earlier home-section hash with the story anchor so refresh reopens the chosen room', () => {
    window.history.replaceState(null, '', '/#home-paths-title');
    render(<HomeProject />);
    fireEvent.click(screen.getByRole('button', { name: 'Living spaces · Connection' }));
    expect(window.location.hash).toBe('#home-proof-title');
  });
  it('restores a selected room on reload and keeps construction photographs accurately labeled', () => {
    window.history.replaceState(null, '', '/?story=bath');
    render(<HomeProject />);
    expect(screen.getByRole('button', { name: 'Primary bath · Scope' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('During construction · Primary bath')).toBeVisible();
    expect(screen.getAllByRole('img')[0]).toHaveAttribute('src', '/images/nelson/bath-before.webp');
  });
  it('treats unknown chapter input as the kitchen without inventing a destination', () => {
    window.history.replaceState(null, '', '/?story=unknown');
    render(<HomeProject />);
    expect(screen.getByRole('button', { name: 'Kitchen · Layout' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('link', { name: 'Explore the kitchen' })).toHaveAttribute('href', '/projects/nelson-dr?from=home&story=kitchen#nelson-kitchen');
  });
  it('exposes stable focusable room destinations and labels bath construction without claiming a before condition', () => {
    render(<ProjectGallery pairs={NELSON_PAIRS} finishes={[]} />);
    for (const id of ['nelson-kitchen', 'nelson-bath', 'nelson-living']) {
      const target = document.getElementById(id);
      expect(target).toHaveAttribute('tabindex', '-1');
      expect(target).toHaveAttribute('data-navigation-section');
    }
    expect(screen.getByRole('button', { name: 'Enlarge the primary bath, during construction' })).toBeInTheDocument();
  });
  it('returns a home-story arrival to the same chapter and preserves a direct owner inquiry', () => {
    window.history.replaceState(null, '', '/projects/nelson-dr?from=home&story=living#nelson-living');
    render(<NelsonDrPage />);
    expect(screen.getByRole('link', { name: 'Back to the home story' })).toHaveAttribute('href', '/?story=living#home-proof-title');
    expect(screen.getByRole('link', { name: 'Explore your property options' })).toHaveAttribute('href', '/property-owners');
    expect(screen.getByRole('link', { name: 'Discuss a property' })).toHaveAttribute('href', '/bring-an-opportunity?intent=property');
  });
  it('leaves the existing single-action closing structure unchanged when no second path is requested', () => {
    const { container } = render(<PageClosing />);
    expect(container.querySelector('.experience-actions')).toBeNull();
  });
  it('offers one optional onward path after the direct action without hiding submission boundaries', () => {
    render(<PageClosing title="Choose your next step." href="/bring-an-opportunity?intent=property" label="Discuss a property" secondaryAction={{ href: '/property-owners', label: 'Explore your property options' }} />);
    expect(screen.getAllByRole('link').map(i => i.getAttribute('href')).slice(0, 2)).toEqual(['/bring-an-opportunity?intent=property', '/property-owners']);
    expect(screen.getByText(/Submission does not create representation/)).toBeVisible();
  });
});
