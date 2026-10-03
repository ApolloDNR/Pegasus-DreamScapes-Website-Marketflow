import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { PremiumStrategyLab } from '@/pegasus/strategy-lab-experience';
import { NavigationContinuity } from '@/components/navigation-continuity';

beforeEach(() => { window.history.replaceState(null, '', '/'); vi.spyOn(window, 'scrollTo').mockImplementation(() => {}); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('Destination-aware page arrival', () => {
  it('resets again when the destination is ready, rather than accepting the outgoing heading', async () => {
    const memory = memoryLocation({ path: '/first' });
    const Frame = ({ready}:{ready:boolean}) => <Router hook={memory.hook}><NavigationContinuity /><main data-navigation-path={ready ? '/tools' : '/first'}><h1>{ready ? 'Tools' : 'First page'}</h1></main></Router>;
    const view = render(<Frame ready={false} />);
    await waitFor(() => expect(screen.getByRole('heading')).toHaveFocus());
    act(() => memory.navigate('/tools'));
    vi.mocked(window.scrollTo).mockClear();
    await act(async () => { await new Promise(resolve => requestAnimationFrame(resolve)); });
    view.rerender(<Frame ready />);
    await waitFor(() => expect(screen.getByRole('heading',{name:'Tools'})).toHaveFocus());
    await waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith({top:0,behavior:'instant'}));
  });

  it('does not mistake a new forward navigation for a prior same-path hash popstate', async () => {
    const memory = memoryLocation({path:'/first'});
    render(<Router hook={memory.hook}><NavigationContinuity /><main><h1>Page</h1></main></Router>);
    await waitFor(() => expect(screen.getByRole('heading')).toHaveFocus());
    act(() => window.dispatchEvent(new PopStateEvent('popstate')));
    vi.mocked(window.scrollTo).mockClear();
    act(() => { window.dispatchEvent(new Event('pushState')); memory.navigate('/tools'); });
    await waitFor(() => expect(window.scrollTo).toHaveBeenCalledWith({top:0,behavior:'instant'}));
  });

  it('honors a route-owned destination target instead of resetting its heading', async () => {
    window.history.replaceState({}, '', '/strategy-lab?tool=calculators');
    const panel = document.createElement('section');
    panel.dataset.navigationTarget = '';
    panel.tabIndex = -1;
    panel.textContent = 'Target worksheet';
    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue({ top:640 } as DOMRect);
    const memory = memoryLocation({path:'/strategy-lab'});
    render(<Router hook={memory.hook}><NavigationContinuity /><nav>Navigation</nav><main data-navigation-path="/strategy-lab"><h1>Lab</h1></main></Router>);
    vi.spyOn(screen.getByRole('navigation'),'getBoundingClientRect').mockReturnValue({height:88} as DOMRect);
    await act(async () => { document.querySelector('main')!.append(panel); });
    await waitFor(() => expect(panel).toHaveFocus());
    expect(window.scrollTo).toHaveBeenCalledWith({top:536,behavior:'instant'});
  });

  it('keeps calculator deep-link focus when the real Lab and arrival manager mount together', async () => {
    window.localStorage.clear(); window.sessionStorage.clear();
    window.history.replaceState({}, '', '/strategy-lab?tool=calculators&tab=piti');
    Object.defineProperty(HTMLElement.prototype,'scrollIntoView',{configurable:true,value:vi.fn()});
    render(<Router><NavigationContinuity /><main data-navigation-path="/strategy-lab"><PremiumStrategyLab go={()=>{}} openPeggy={()=>{}} /></main></Router>);
    const panel=await screen.findByRole('region',{name:'Decision calculators'});
    await act(async () => { await new Promise(resolve=>setTimeout(resolve,80)); });
    expect(panel).toHaveFocus();
  });

  it('does not finish an abandoned destination after another navigation', async () => {
    const memory = memoryLocation({path:'/first'});
    const Frame = ({path}:{path:string}) => <Router hook={memory.hook}><NavigationContinuity /><main data-navigation-path={path}><h1>{path}</h1></main></Router>;
    const view = render(<Frame path="/first" />);
    await waitFor(() => expect(screen.getByRole('heading')).toHaveFocus());
    act(() => memory.navigate('/tools'));
    act(() => memory.navigate('/about'));
    view.rerender(<Frame path="/about" />);
    await waitFor(() => expect(screen.getByRole('heading',{name:'/about'})).toHaveFocus());
    vi.mocked(window.scrollTo).mockClear();
    view.rerender(<Frame path="/tools" />);
    await act(async () => { await new Promise(resolve=>setTimeout(resolve,40)); });
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
