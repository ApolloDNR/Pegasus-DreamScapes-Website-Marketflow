import React, { useState } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GuideInvite, ExplainWithPeggy, JourneyContinuation, JourneyWayfinder } from '@/pegasus/journey';
import { Peggy } from '@/pegasus/peggy';
import { ToolsPage } from '@/pegasus/tools';
import { HomePathways } from '@/pegasus/home-pathways';

const callbacks = { toStrategyLab: vi.fn(), onHandoffToReview: vi.fn(), go: vi.fn(), toSubmit: vi.fn() };
function PublicPage() {
  const [open, setOpen] = useState(false);
  return <><main data-peggy-page><h1>Property introduction</h1><p>Public starting point.</p><GuideInvite /><h2>Repairs and scope</h2><p>Review the repair questions.</p><form><input defaultValue="PRIVATE FIELD" /></form><ExplainWithPeggy /><h2>Next steps</h2><p>Review before submitting.</p></main><Peggy {...callbacks} open={open} setOpen={setOpen} pagePath="/property-owners" /></>;
}
const input = () => screen.getByRole('textbox', { name: 'Talk to Peggy' });
beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
  vi.stubGlobal('fetch', vi.fn());
  HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top:700, left:0, right:800, bottom:800, width:800, height:100, x:0, y:700, toJSON:() => ({}) });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('the shared public journey', () => {
  it('keeps illustrated paths as direct links and responds to keyboard focus without a request', () => {
    render(<HomePathways />);
    const links = screen.getAllByRole('link');
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/property-owners', '/work-with-apollo', '/deal-partners']);
    fireEvent.focus(links[2]);
    expect(links[2].closest('.home-pathways')).toHaveAttribute('data-preview', '2');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('navigates the actual tour outline with the trail and keyboard, without sending context', async () => {
    render(<PublicPage />);
    fireEvent.click(screen.getByRole('button', { name:'Show me around' }));
    const tour = await screen.findByRole('complementary', { name:'Peggy page guide' });
    const trail = within(tour).getByRole('navigation', { name:'Page tour sections' });
    const last = within(trail).getByRole('button', { name:'Go to section 3: Next steps' });
    fireEvent.click(last);
    expect(last).toHaveAttribute('aria-current', 'step');
    expect(within(tour).getByRole('heading')).toHaveTextContent('Next steps');
    fireEvent.keyDown(last, { key:'ArrowLeft' });
    const middle = within(trail).getByRole('button', { name:'Go to section 2: Repairs and scope' });
    expect(middle).toHaveFocus();
    expect(middle).toHaveAttribute('aria-current', 'step');
    fireEvent.keyDown(middle, { key:'Home' });
    expect(within(trail).getByRole('button', { name:'Go to section 1: Introduction' })).toHaveFocus();
    expect(within(tour).getByRole('heading')).toHaveTextContent('Property introduction');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('starts a local tour from the page and restores focus when the guide closes', async () => {
    render(<PublicPage />);
    const opener = screen.getByRole('button', { name:'Show me around' });
    opener.focus(); fireEvent.click(opener);
    const tour = await screen.findByRole('complementary', { name:'Peggy page guide' });
    expect(within(tour).getByRole('heading')).toHaveTextContent('Property introduction');
    fireEvent.click(within(tour).getByRole('button', { name:'End page tour' }));
    fireEvent.click(screen.getByRole('button', { name:'Close' }));
    await waitFor(() => expect(opener).toHaveFocus());
    expect(fetch).not.toHaveBeenCalled();
  });
  it('offers a section question without losing the draft or sending private fields', async () => {
    const fetcher = vi.fn((url: unknown, _init?: RequestInit) => Promise.resolve(new Response(JSON.stringify(url === '/api/peggy/conversations' ? {id:1,accessToken:'fixture'} : {response:'Fixture answer'}))));
    vi.stubGlobal('fetch', fetcher);
    render(<PublicPage />);
    fireEvent.click(screen.getByRole('button', { name:/Talk to Peggy, the/ }));
    fireEvent.change(input(), {target:{value:'My original question'}});
    fireEvent.click(screen.getByRole('button', { name:'Explore this with Peggy' }));
    expect(input()).toHaveValue('My original question');
    expect(fetcher).not.toHaveBeenCalled();
    const proposal = screen.getByRole('group', { name:'Review a suggested question' });
    expect(proposal).toHaveTextContent('Repairs and scope');
    fireEvent.click(within(proposal).getByRole('button', {name:'Keep my draft'}));
    expect(input()).toHaveValue('My original question');
    fireEvent.click(screen.getByRole('button', { name:'Explore this with Peggy' }));
    fireEvent.click(screen.getByRole('button', {name:'Use this question'}));
    expect(input()).toHaveValue('Explain “Repairs and scope” in plain language. What should I notice here?');
    fireEvent.click(screen.getByRole('button', {name:'Send'}));
    await screen.findByText('Fixture answer');
    const body = JSON.parse(String(fetcher.mock.calls.find(([url]) => url === '/api/peggy/chat')?.[1]?.body));
    expect(body.context.currentView.section).toBe('Repairs and scope');
    expect(JSON.stringify(body)).not.toContain('PRIVATE FIELD');
  });
  it('does not let a proposed question race an in-flight response', async () => {
    let resolveReply!: (response: Response) => void;
    vi.stubGlobal('fetch', vi.fn((url: unknown) => url === '/api/peggy/conversations' ? Promise.resolve(new Response(JSON.stringify({id:1,accessToken:'fixture'}))) : new Promise<Response>(resolve => {resolveReply=resolve;})));
    render(<PublicPage />);
    fireEvent.click(screen.getByRole('button', { name:/Talk to Peggy, the/ }));
    fireEvent.change(input(), {target:{value:'First question'}}); fireEvent.click(screen.getByRole('button',{name:'Send'}));
    await waitFor(() => expect(resolveReply).toBeTypeOf('function'));
    fireEvent.click(screen.getByRole('button',{name:'Explore this with Peggy'}));
    expect(screen.getByRole('button',{name:'Use this question'})).toBeDisabled();
    await act(async () => resolveReply(new Response(JSON.stringify({response:'First answer'}))));
    expect(screen.getByRole('button',{name:'Use this question'})).toBeEnabled();
    fireEvent.click(screen.getByRole('button',{name:'Use this question'}));
    expect(input()).toHaveValue('Explain “Repairs and scope” in plain language. What should I notice here?');
  });
  it('provides all eight real calculator destinations and a saved-work task', () => {
    render(<ToolsPage />);
    fireEvent.click(screen.getByRole('button',{name:'Explore eight calculators'}));
    const links=within(screen.getByRole('region',{name:'Check a number'})).getAllByRole('link');
    expect(links.map(link=>link.getAttribute('href'))).toEqual(['arv','roi','brrrr','cashflow','wholesale','piti','ownvsrent','hardmoney'].map(tab=>`/strategy-lab?tool=calculators&tab=${tab}`));
    fireEvent.click(screen.getByRole('button',{name:/Continue my work/}));
    expect(screen.getByRole('link',{name:'View saved work'})).toHaveAttribute('href','/saved');
    expect(screen.getByRole('region',{name:'Continue my work'})).toHaveTextContent('does not mean it was submitted');
  });
  it('keeps curated continuation off intake, saved work and private routes', () => {
    const {rerender}=render(<JourneyContinuation path="/property-owners?owner_situation=repairs" />);
    expect(screen.getByRole('link',{name:/See the work/})).toHaveAttribute('href','/our-work');
    for(const path of ['/bring-an-opportunity','/saved','/strategy-lab','/marketplace/buyer']) {
      rerender(<JourneyContinuation path={path}/>);expect(screen.queryByRole('region')).not.toBeInTheDocument();
    }
  });
  it('dismisses the section outline with Escape and focuses the chosen heading', () => {
    const elements=[document.createElement('h1'),document.createElement('h2'),document.createElement('h2')];
    elements.forEach(element=>document.body.append(element));
    const sections=elements.map((element,index)=>({element,title:`Section ${index}`,label:`Section ${index}`}));
    render(<JourneyWayfinder path="/about" sections={sections} index={1} hidden={false} onAsk={vi.fn()} />);
    const toggle=screen.getByRole('button',{name:/Section 2 of 3/});fireEvent.click(toggle);
    fireEvent.keyDown(document,{key:'Escape'});expect(toggle).toHaveFocus();expect(toggle).toHaveAttribute('aria-expanded','false');
    fireEvent.click(toggle);fireEvent.click(screen.getByRole('button',{name:/03\s*Section 2/}));expect(elements[2]).toHaveFocus();
    elements.forEach(element=>element.remove());
  });
});
