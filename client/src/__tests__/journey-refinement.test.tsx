import React, { useState } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GuideInvite, ExplainWithPeggy, JourneyContinuation, JourneyWayfinder } from '@/pegasus/journey';
import { Peggy } from '@/pegasus/peggy';
import { ToolsPage } from '@/pegasus/tools';
import { HomePathways } from '@/pegasus/home-pathways';

const callbacks = { toStrategyLab: vi.fn(), onHandoffToReview: vi.fn(), go: vi.fn(), toSubmit: vi.fn() };
function PublicPage({ initialPrompt = null }: { initialPrompt?: string | null }) {
  const [open, setOpen] = useState(false);
  return <><main data-peggy-page><h1>Property introduction</h1><p>Public starting point.</p><GuideInvite /><h2>Repairs and scope</h2><p>Review the repair questions.</p><form><input defaultValue="PRIVATE FIELD" /></form><ExplainWithPeggy /><h2>Next steps</h2><p>Review before submitting.</p></main><Peggy {...callbacks} open={open} setOpen={setOpen} initialPrompt={initialPrompt} pagePath="/property-owners" /></>;
}
const input = () => screen.getByRole('textbox', { name: 'Talk to Peggy' });
beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
  vi.stubGlobal('fetch', vi.fn());
  HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal('scrollTo', vi.fn());
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
    fireEvent.click(within(tour).getByRole('button', { name:'Section details and stops' }));
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
  it.each(['Close', 'Escape', 'Finish'])('ends a page-started tour with %s in one action and focuses the current section', async (exit) => {
    render(<PublicPage />);
    const opener = screen.getByRole('button', { name:'Show me around' });
    opener.focus(); fireEvent.click(opener);
    const tour = await screen.findByRole('complementary', { name:'Peggy page guide' });
    fireEvent.click(within(tour).getByRole('button', { name:'Next section' }));
    if (exit === 'Finish') fireEvent.click(within(tour).getByRole('button', { name:'Next section' }));
    const currentHeading = screen.getByRole('main').querySelectorAll('h1,h2')[exit === 'Finish' ? 2 : 1];
    if (exit === 'Escape') fireEvent.keyDown(document, { key:'Escape' });
    else fireEvent.click(within(tour).getByRole('button', { name:exit === 'Finish' ? 'Finish tour' : 'End page tour' }));
    expect(screen.queryByRole('complementary', { name:'Peggy page guide' })).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name:'Peggy, the Pegasus intake concierge' })).not.toBeInTheDocument();
    await waitFor(() => expect(currentHeading).toHaveFocus());
    expect(currentHeading).toHaveClass('peggy-tour-return-focus');
    expect(opener).not.toHaveFocus();
    expect(fetch).not.toHaveBeenCalled();
    fireEvent.blur(currentHeading);
    expect(currentHeading).not.toHaveAttribute('tabindex');
    expect(currentHeading).not.toHaveClass('peggy-tour-return-focus');
  });
  it.each(['Close', 'Escape', 'Finish'])('restores an existing chat and its unsent draft after chat-started %s', async (exit) => {
    render(<PublicPage />);
    fireEvent.click(screen.getByRole('button', { name:/Talk to Peggy, the/ }));
    fireEvent.change(input(), { target:{ value:'My original question' } });
    fireEvent.click(screen.getByRole('checkbox', { name:'Page context included' }));
    const panel = screen.getByRole('dialog', { name:'Peggy, the Pegasus intake concierge' });
    fireEvent.click(within(panel).getByRole('button', { name:/Show me around/ }));
    const tour = await screen.findByRole('complementary', { name:'Peggy page guide' });
    if (exit === 'Finish') {
      fireEvent.click(within(tour).getByRole('button', { name:'Next section' }));
      fireEvent.click(within(tour).getByRole('button', { name:'Next section' }));
    }
    if (exit === 'Escape') fireEvent.keyDown(document, { key:'Escape' });
    else fireEvent.click(within(tour).getByRole('button', { name:exit === 'Finish' ? 'Finish tour' : 'End page tour' }));
    expect(screen.queryByRole('complementary', { name:'Peggy page guide' })).not.toBeInTheDocument();
    expect(input()).toHaveValue('My original question');
    expect(screen.getByRole('checkbox', { name:'Page context off' })).not.toBeChecked();
    await waitFor(() => expect(panel).toHaveFocus());
    expect(fetch).not.toHaveBeenCalled();
  });
  it('does not reopen a supplied chat prompt when starting a tour directly from the page', async () => {
    render(<PublicPage initialPrompt="Prepared property question" />);
    fireEvent.click(screen.getByRole('button', { name:/Talk to Peggy, the/ }));
    fireEvent.change(input(), { target:{ value:'My edited property question' } });
    fireEvent.click(screen.getByRole('button', { name:'Close' }));
    fireEvent.click(screen.getByRole('button', { name:'Show me around' }));
    const tour = await screen.findByRole('complementary', { name:'Peggy page guide' });
    expect(screen.queryByRole('dialog', { name:'Peggy, the Pegasus intake concierge' })).not.toBeInTheDocument();
    fireEvent.click(within(tour).getByRole('button', { name:'Ask about this' }));
    expect(input()).toHaveValue('My edited property question');
    expect(screen.getByRole('group', { name:'Review a suggested question' })).toBeVisible();
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each(['page', 'chat'])('opens a genuinely new supplied prompt during a %s-started tour without sending it', async (origin) => {
    const { rerender } = render(<PublicPage />);
    if (origin === 'chat') {
      fireEvent.click(screen.getByRole('button', { name:/Talk to Peggy, the/ }));
      fireEvent.click(within(screen.getByRole('dialog', { name:'Peggy, the Pegasus intake concierge' })).getByRole('button', { name:/Show me around/ }));
    } else fireEvent.click(screen.getByRole('button', { name:'Show me around' }));
    await screen.findByRole('complementary', { name:'Peggy page guide' });
    rerender(<PublicPage initialPrompt="New property request from the page" />);
    expect(screen.queryByRole('complementary', { name:'Peggy page guide' })).not.toBeInTheDocument();
    expect(input()).toHaveValue('New property request from the page');
    expect(screen.getByRole('checkbox', { name:'Page context off' })).not.toBeChecked();
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each(['keep', 'use'])('lets the visitor %s an edited draft when a new supplied prompt interrupts a tour', async (choice) => {
    const { rerender } = render(<PublicPage initialPrompt="Original property request" />);
    fireEvent.click(screen.getByRole('button', { name:/Talk to Peggy, the/ }));
    fireEvent.change(input(), { target:{ value:'My edited property question' } });
    fireEvent.click(document.querySelector('.peggy-location > summary')!);
    fireEvent.click(within(screen.getByRole('navigation', { name:'Peggy page outline' })).getByRole('button', { name:/Next steps/ }));
    await screen.findByRole('complementary', { name:'Peggy page guide' });
    rerender(<PublicPage initialPrompt="Different property and scenario" />);
    expect(screen.queryByRole('complementary', { name:'Peggy page guide' })).not.toBeInTheDocument();
    expect(input()).toHaveValue('My edited property question');
    const proposal = screen.getByRole('group', { name:'Review a suggested question' });
    expect(proposal).toHaveTextContent('Different property and scenario');
    expect(proposal).toHaveTextContent('Using this question starts a fresh chat. Nothing is sent yet.');
    fireEvent.click(within(proposal).getByRole('button', { name:choice === 'keep' ? 'Keep my draft' : 'Use this question' }));
    expect(input()).toHaveValue(choice === 'keep' ? 'My edited property question' : 'Different property and scenario');
    expect(screen.getByRole('checkbox', { name:'Page context off' })).not.toBeChecked();
    // Exiting another tour or reopening the same panel must not replay a
    // consumed request after the visitor chose to keep their own draft.
    fireEvent.click(within(screen.getByRole('navigation', { name:'Peggy page outline' })).getByRole('button', { name:/Next steps/ }));
    fireEvent.keyDown(document, { key:'Escape' });
    fireEvent.click(screen.getByRole('button', { name:'Close' }));
    fireEvent.click(screen.getByRole('button', { name:/Talk to Peggy, the/ }));
    expect(input()).toHaveValue(choice === 'keep' ? 'My edited property question' : 'Different property and scenario');
    expect(screen.queryByRole('group', { name:'Review a suggested question' })).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
  it('starts a fresh conversation only after accepting a new property request offered during a tour', async () => {
    let conversations = 0;
    const fetcher = vi.fn((url: unknown, _init?: RequestInit) => Promise.resolve(new Response(JSON.stringify(url === '/api/peggy/conversations' ? {id:++conversations,accessToken:`fixture-${conversations}`} : {response:`Property answer ${conversations}`}))));
    vi.stubGlobal('fetch', fetcher);
    const { rerender } = render(<PublicPage initialPrompt="Original property request" />);
    fireEvent.click(screen.getByRole('button', { name:/Talk to Peggy, the/ }));
    fireEvent.click(screen.getByRole('button', { name:'Send' }));
    await screen.findByText('Property answer 1');
    fireEvent.click(screen.getByRole('button', { name:'Explore this with Peggy' }));
    fireEvent.change(input(), { target:{ value:'Keep this edited follow-up' } });
    fireEvent.click(document.querySelector('.peggy-location > summary')!);
    fireEvent.click(within(screen.getByRole('navigation', { name:'Peggy page outline' })).getByRole('button', { name:/Next steps/ }));
    rerender(<PublicPage initialPrompt="Different property request" />);
    expect(input()).toHaveValue('Keep this edited follow-up');
    expect(screen.getByText('Property answer 1')).toBeVisible();
    expect(document.querySelector('.peggy-attached-context')).toHaveTextContent('Repairs and scope');
    expect(fetcher).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('button', { name:'Use this question' }));
    expect(input()).toHaveValue('Different property request');
    expect(screen.queryByText('Property answer 1')).not.toBeInTheDocument();
    expect(document.querySelector('.peggy-attached-context')).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name:'Page context off' })).not.toBeChecked();
    expect(fetcher).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('button', { name:'Send' }));
    await screen.findByText('Property answer 2');
    const secondChat = fetcher.mock.calls.filter(([url]) => url === '/api/peggy/chat')[1];
    expect(JSON.parse(String(secondChat?.[1]?.body))).toMatchObject({ conversationId:2, message:'Different property request', context:{surface:'public-peggy'} });
    expect(conversations).toBe(2);
  });
  it('returns a chat-started outline tour to the same conversation, attached source and draft', async () => {
    const fetcher = vi.fn((url: unknown, _init?: RequestInit) => Promise.resolve(new Response(JSON.stringify(url === '/api/peggy/conversations' ? {id:1,accessToken:'fixture'} : {response:'Existing conversation answer'}))));
    vi.stubGlobal('fetch', fetcher);
    render(<PublicPage />);
    fireEvent.click(screen.getByRole('button', { name:'Explore this with Peggy' }));
    fireEvent.click(screen.getByRole('button', { name:'Send' }));
    await screen.findByText('Existing conversation answer');
    fireEvent.click(screen.getByRole('button', { name:'Explore this with Peggy' }));
    expect(document.querySelector('.peggy-attached-context')).toHaveTextContent('Repairs and scope');
    fireEvent.change(input(), { target:{ value:'Unsent follow-up' } });
    fireEvent.click(document.querySelector('.peggy-location > summary')!);
    const outline = screen.getByRole('navigation', { name:'Peggy page outline' });
    fireEvent.click(within(outline).getByRole('button', { name:/Next steps/ }));
    const tour = await screen.findByRole('complementary', { name:'Peggy page guide' });
    expect(within(tour).getByRole('heading')).toHaveTextContent('Next steps');
    fireEvent.keyDown(document, { key:'Escape' });
    expect(input()).toHaveValue('Unsent follow-up');
    expect(screen.getByText('Existing conversation answer')).toBeVisible();
    expect(document.querySelector('.peggy-attached-context')).toHaveTextContent('Repairs and scope');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('keeps the phone tour compact until details are requested, with navigation and Ask always available', async () => {
    render(<PublicPage />);
    fireEvent.click(screen.getByRole('button', { name:'Show me around' }));
    const tour = await screen.findByRole('complementary', { name:'Peggy page guide' });
    const disclosure = within(tour).getByRole('button', { name:'Section details and stops' });
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    expect(within(tour).getByText('01 / 03')).toBeVisible();
    expect(within(tour).getByRole('heading')).toHaveTextContent('Property introduction');
    expect(within(tour).queryByRole('navigation', { name:'Page tour sections' })).not.toBeInTheDocument();
    expect(within(tour).getByText('Public starting point.')).not.toBeVisible();
    fireEvent.click(disclosure);
    expect(disclosure).toHaveAttribute('aria-expanded', 'true');
    expect(within(tour).getByRole('navigation', { name:'Page tour sections' })).toBeVisible();
    expect(within(tour).getByRole('button', { name:'End page tour' })).toBeVisible();
    expect(within(tour).getByRole('button', { name:'Next section' })).toBeVisible();
    expect(within(tour).getByRole('button', { name:'Ask about this' })).toBeVisible();
    fireEvent.click(disclosure);
    fireEvent.click(within(tour).getByRole('button', { name:'Next section' }));
    fireEvent.click(within(tour).getByRole('button', { name:'Ask about this' }));
    expect(input()).toHaveValue('Explain “Repairs and scope” in plain language. What should I notice here?');
    expect(document.querySelector('.peggy-attached-context')).toHaveTextContent('Repairs and scope');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('measures the visible consent bar so the compact tour can sit above it', async () => {
    render(<><div className="pg-cookie-bar">Consent choices</div><PublicPage /></>);
    fireEvent.click(screen.getByRole('button', { name:'Show me around' }));
    const tour = await screen.findByRole('complementary', { name:'Peggy page guide' });
    expect(tour.style.getPropertyValue('--peggy-cookie-height')).toBe('100px');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('keeps the wide tour explanation and every section stop immediately available', async () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches:false })));
    render(<PublicPage />);
    fireEvent.click(screen.getByRole('button', { name:'Show me around' }));
    const tour = await screen.findByRole('complementary', { name:'Peggy page guide' });
    expect(within(tour).queryByRole('button', { name:'Section details and stops' })).not.toBeInTheDocument();
    expect(within(tour).getByRole('navigation', { name:'Page tour sections' })).toBeVisible();
    expect(within(tour).getAllByRole('button', { name:/Go to section/ })).toHaveLength(3);
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
    const {rerender}=render(<JourneyContinuation path="/how-we-operate?ref=example" />);
    expect(screen.getByRole('link',{name:/See the work/})).toHaveAttribute('href','/our-work');
    for(const path of ['/property-owners?owner_situation=repairs','/property-owners','/our-work','/bring-an-opportunity','/saved','/strategy-lab','/marketplace/buyer']) {
      rerender(<JourneyContinuation path={path}/>);expect(screen.queryByRole('region')).not.toBeInTheDocument();
    }
  });
  it.each(['/work-with-apollo', '/buyers', '/about'])('does not repeat a large exploration panel after the terminal action on %s', (path) => {
    const {container}=render(<JourneyContinuation path={path} />);
    expect(container).toBeEmptyDOMElement();
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
