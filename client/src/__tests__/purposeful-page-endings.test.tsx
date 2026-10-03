import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { JourneyContinuation } from '@/pegasus/journey';
import { ToolsPage } from '@/pegasus/tools';
import { PageClosing } from '@/pegasus/experience-page';

afterEach(cleanup);
describe('Purposeful public page endings', () => {
  it('keeps tool guidance separate from the Property Review action', () => {
    render(<ToolsPage />);
    expect(screen.getAllByRole('button',{name:'Show me around'})).toHaveLength(1);
    expect(screen.getByRole('link',{name:'Request a Property Review'})).toHaveAttribute('href','/deal-blueprint');
  });
  it.each(['/work-with-apollo','/buyers','/capital','/marketflow','/vendor-network','/deal-partners','/development','/about','/projects/nelson-dr'])('keeps %s focused on its own terminal inquiry or action', path => {
    const {container}=render(<JourneyContinuation path={path} />);
    expect(container).toBeEmptyDOMElement();
  });
  it('offers optional related reading without another prominent task heading or assistant invitation', () => {
    render(<JourneyContinuation path="/faq" />);
    expect(screen.getByRole('navigation',{name:'Related reading'})).toBeVisible();
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('does not label ordinary contact navigation as a submission', () => {
    render(<PageClosing href="/contact" label="Contact Apollo" />);
    expect(screen.getByRole('link',{name:'Contact Apollo'})).toHaveAttribute('href','/contact');
    expect(screen.queryByText(/Submission does not create/)).not.toBeInTheDocument();
  });
  it('retains the submission boundary beside an intake action', () => {
    render(<PageClosing />);
    expect(screen.getByText(/Submission does not create/)).toBeVisible();
    expect(screen.getByText('What happens next')).toBeVisible();
  });
});
