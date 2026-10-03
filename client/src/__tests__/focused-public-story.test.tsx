import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { CATEGORIES } from '@/pegasus/data';
import { CategoryPage } from '@/pegasus/category-page';
import { DealPartnersPage } from '@/pegasus/deal-partners';
import { DevelopmentPage } from '@/pegasus/pages';
import { HowWeOperatePage } from '@/pegasus/how-we-operate';
import { AboutPageV6 } from '@/pegasus/about-v6';
import { HomePageV51 } from '@/pegasus/home-v51';
import { OurWorkPage } from '@/pegasus/our-work';
import { ProjectEvidence } from '@/pegasus/experience-page';
import NelsonDrPage from '@/pages/project-nelson-dr';
import DealBlueprintPage from '@/pages/deal-blueprint';
import PegasusStandardPage from '@/pages/pegasus-standard';

const noop = () => {};
afterEach(cleanup);
function mount(page: React.ReactElement, path = '/') {
  const memory = memoryLocation({ path, static: true });
  return render(<Router hook={memory.hook}>{page}</Router>);
}
function opening(container: HTMLElement) {
  return container.querySelector<HTMLElement>('.ep-intro')!;
}

// These rendered-copy contracts fail if the visitor's actual decision is replaced
// with capability claims, or if attribution/film boundaries disappear at entry.
describe('a concrete decision before the engagement boundaries', () => {
  it('orients the homepage around actual owner and partner decisions', () => {
    const { container } = mount(<HomePageV51 go={noop} openPeggy={noop} />);
    expect(container.querySelector('.experience-intro')).toHaveTextContent('purchase, renovation, sale, or hold');
    expect(container.querySelector('.experience-intro')).toHaveTextContent('Led by Apollo Duran.');
  });

  it('starts the buyer page with price, condition and costs before separate buyer lanes', () => {
    const { container } = mount(<CategoryPage cat={CATEGORIES.buyers} go={noop} openPeggy={noop} />, '/buyers');
    expect(opening(container).querySelector('p')).toHaveTextContent('purchase price, condition, renovation costs, and intended use');
    expect(opening(container)).toHaveTextContent('none promises inventory, service, access, or a response');
    expect(screen.getByRole('link', { name: /Possible buyer representation/ })).toHaveAttribute('href', '/work-with-apollo?intent=buy#apollo-paths');
  });

  it('asks partners for the property, control, unresolved decision and timing', () => {
    const { container } = mount(<DealPartnersPage go={noop} />, '/deal-partners');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Bring the property. Define the next decision.');
    expect(opening(container).querySelector('p')).toHaveTextContent('what you control, what you know, and where the deal is stuck');
    for (const name of ['The property.', 'Control and permissions.', 'The unresolved decision.', 'Timing.']) {
      expect(screen.getByRole('heading', { name })).toBeVisible();
    }
    expect(screen.getByText(/No response, buyer, written terms, distribution, funding, or closing is promised/)).toBeVisible();
  });

  it('connects a development concept to the decision before committing to work', () => {
    const { container } = mount(<DevelopmentPage go={noop} />, '/development');
    expect(opening(container).querySelector('p')).toHaveTextContent('condition, budget, permissions, and intended sale or hold');
    expect(opening(container)).toHaveTextContent('qualified providers, applicable licenses and permits');
  });

  it('makes the operating model start with the property decision', () => {
    const { container } = mount(<HowWeOperatePage go={noop} />, '/how-we-operate');
    expect(opening(container)).toHaveTextContent('condition, costs, timing, and sale or hold together');
    expect(screen.getByRole('group', { name: 'The five operating stages' }).querySelectorAll('button')).toHaveLength(5);
  });

  it('explains the specific question a Property Review can be requested to examine', () => {
    const { container } = mount(<DealBlueprintPage />, '/deal-blueprint');
    expect(opening(container).querySelector('p')).toHaveTextContent('A purchase, renovation, sale, or hold can turn on one unanswered question.');
    expect(opening(container)).toHaveTextContent('separately scoped written analysis');
    expect(opening(container)).toHaveTextContent('A request is not an order or acceptance.');
    expect(screen.getByText(/No service, work, review, or delivery is promised by this page/)).toBeVisible();
  });
});

describe('documented proof without invented project credit', () => {
  const roleBoundary = /The available record does not verify Pegasus[’']s or Apollo[’']s project role/;

  it('puts the attribution limit beside the homepage case-study invitation', () => {
    const { container } = mount(<HomePageV51 go={noop} openPeggy={noop} />);
    expect(container.querySelector('[data-hv="proof"]')).toHaveTextContent(roleBoundary);
  });

  it('puts the attribution limit in the Our Work opening and retains the legacy record anchor', () => {
    const { container } = mount(<OurWorkPage go={noop} />, '/our-work');
    expect(opening(container)).toHaveTextContent(roleBoundary);
    const anchor = container.querySelector('#published-work');
    expect(anchor).toBeInTheDocument();
    expect(anchor).not.toHaveAttribute('aria-hidden');
    expect(anchor).toHaveAccessibleName();
    expect(anchor?.closest('#project-record')).not.toBeNull();
    expect(container).toHaveTextContent('these figures do not establish profit or return');
  });

  it('makes the shared evidence invitation explicit about its attribution limit', () => {
    const { container } = mount(<ProjectEvidence />);
    expect(container).toHaveTextContent(roleBoundary);
    expect(screen.getByRole('link', { name: 'Explore the case study' })).toHaveAttribute('href', '/projects/nelson-dr');
  });

  it('states the attribution limit on arrival at Nelson and retains the old financial anchor', () => {
    const { container } = mount(<NelsonDrPage />, '/projects/nelson-dr');
    expect(opening(container)).toHaveTextContent(roleBoundary);
    const anchor = container.querySelector('#case-record');
    expect(anchor).toBeInTheDocument();
    expect(anchor).not.toHaveAttribute('aria-hidden');
    expect(anchor).toHaveAccessibleName();
    expect(anchor?.closest('#project-record')).not.toBeNull();
    expect(container).toHaveTextContent('does not assign those services to Pegasus or any individual without separate evidence');
    expect(container).toHaveTextContent('It is not net profit or return');
  });
});

describe('the existing architectural vision is discoverable from the founder story', () => {
  it('links About directly to the real concept-film section without changing its playback control', () => {
    const about = mount(<AboutPageV6 go={noop} />, '/about');
    const link = screen.getByRole('link', { name: 'Watch the architectural concept film' });
    expect(link).toHaveAttribute('href', '/pegasus-standard#architectural-film');
    expect(link.closest('.ep-section')).toHaveTextContent('Future vision, not current inventory or an active development.');
    about.unmount();
    const standard = mount(<PegasusStandardPage />, '/pegasus-standard');
    const film = standard.container.querySelector('#architectural-film')!;
    const video = within(film as HTMLElement).getByLabelText('Architectural vision film, a silent walk through a colonnade');
    expect(video).toHaveAttribute('controls');
    expect(video).not.toHaveAttribute('autoplay');
  });
});
