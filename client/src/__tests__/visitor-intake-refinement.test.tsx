import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConnectChooser } from '@/pages/connect';
import { NavBar } from '@/pegasus/nav';
import { PremiumMarketFlow } from '@/pegasus/marketflow-experience';
import SubmitPropertyPage from '@/pages/submit-property';
const {api}=vi.hoisted(()=>({api:vi.fn()}));
vi.mock('@/lib/queryClient',()=>({apiRequest:api}));
vi.mock('@/lib/analytics',()=>({trackEvent:vi.fn(),trackCtaClick:vi.fn()}));
vi.mock('@/hooks/use-seo',()=>({useSEO:vi.fn()}));
const mountIntake=()=>render(<QueryClientProvider client={new QueryClient({defaultOptions:{mutations:{retry:false}}})}><SubmitPropertyPage/></QueryClientProvider>);
beforeEach(()=>{sessionStorage.clear();window.history.replaceState(null,'','/bring-an-opportunity?intent=property');vi.spyOn(window,'scrollTo').mockImplementation(()=>{});api.mockResolvedValue({status:201,redirected:false,json:async()=>({id:'audit-17',status:'New'})});});
afterEach(()=>{cleanup();vi.restoreAllMocks();api.mockReset();});
describe('visitor intake refinements',()=>{
 it('distinguishes representation and buyer-path links before a visitor chooses the destination',()=>{
  render(<ConnectChooser context="contact"/>);
  expect(screen.getByRole('link',{name:/Buy or sell with an agent/})).toHaveAttribute('href','/work-with-apollo');
  expect(screen.getByRole('link',{name:/Buyer paths & criteria/})).toHaveAttribute('href','/buyers');
 });
 it('finds the buyer directory by its criteria purpose without confusing it with representation',()=>{
  render(<NavBar route="home" go={vi.fn()} theme="light" toggleTheme={vi.fn()} scrolled={false}/>);
  fireEvent.click(screen.getByRole('button',{name:'Real Estate'}));
  fireEvent.click(screen.getByText('Search the site'));
  fireEvent.change(screen.getByRole('searchbox',{name:'Search navigation'}),{target:{value:'criteria'}});
  expect(screen.getByRole('link',{name:'Buyer paths & criteria'})).toHaveAttribute('href','/buyers');
 });
 it('sends availability readers to the existing unavailable-buybox status page',()=>{
  render(<PremiumMarketFlow go={vi.fn()}/>);
  expect(screen.getByRole('link',{name:'Buybox availability'})).toHaveAttribute('href','/marketflow/buyboxes');
 });
 it('keeps optional financial details closed until requested and retains values through Back and review',async()=>{
  mountIntake();
  const amounts=screen.getByText('Value and mortgage details (optional)').closest('details')!;
  expect(amounts).not.toHaveAttribute('open');
  expect(screen.getByText(/These property details are optional/)).toBeVisible();
  fireEvent.click(screen.getByText('Value and mortgage details (optional)'));
  fireEvent.change(screen.getByLabelText('Estimated value (if known)'),{target:{value:'650000'}});
  fireEvent.change(screen.getByLabelText('Estimated mortgage balance (if relevant)'),{target:{value:'250000'}});
  fireEvent.click(screen.getByText('Value and mortgage details (optional)'));
  expect(amounts).not.toHaveAttribute('open');
  fireEvent.click(screen.getByRole('button',{name:'Continue'}));
  fireEvent.click(screen.getByRole('button',{name:'Back'}));
  fireEvent.click(screen.getByText('Value and mortgage details (optional)'));
  expect(screen.getByLabelText('Estimated value (if known)')).toHaveValue('650000');
  expect(screen.getByLabelText('Estimated mortgage balance (if relevant)')).toHaveValue('250000');
  fireEvent.click(screen.getByRole('button',{name:'Continue'}));
  fireEvent.click(screen.getByRole('button',{name:'Just exploring'}));
  fireEvent.click(screen.getByRole('button',{name:'Continue'}));
  fireEvent.click(screen.getByRole('button',{name:'Not sure'}));
  fireEvent.click(screen.getByRole('button',{name:'Continue'}));
  fireEvent.change(screen.getByLabelText('Full name (required)'),{target:{value:'Audit Visitor'}});
  fireEvent.change(screen.getByLabelText('Email (required)'),{target:{value:'audit@example.invalid'}});
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button',{name:'Send inquiry'}));
  await screen.findByRole('heading',{name:'Received.'});
  expect(api.mock.calls[0][2]).toEqual(expect.objectContaining({estimatedValue:650000,estimatedDebt:250000}));
 });
 it('allows unknown property details to continue without opening the optional disclosure',()=>{
  mountIntake();
  expect(screen.getByText('Value and mortgage details (optional)').closest('details')).not.toHaveAttribute('open');
  fireEvent.click(screen.getByRole('button',{name:'Continue'}));
  expect(screen.getByTestId('intake-step-heading')).toHaveTextContent('The situation.');
 });
});
