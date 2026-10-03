import React from 'react';
import {afterEach,beforeEach,describe,it,expect,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen,waitFor,within} from '@testing-library/react';
import {BuyerCriteriaForm} from '@/pegasus/buyer-criteria';
import {buildBuyerCriteriaLeadSubmission,createEmptyBuyerCriteriaDraft} from '@shared/buyer-criteria';
import SubmitPropertyPage from '@/pages/submit-property';
const {api}=vi.hoisted(()=>({api:vi.fn()}));
vi.mock('@/lib/queryClient',()=>({apiRequest:api}));
vi.mock('@/hooks/use-seo',()=>({useSEO:vi.fn()}));
vi.mock('@/lib/analytics',()=>({trackEvent:vi.fn()}));
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
function mount(ui:React.ReactElement){return render(<QueryClientProvider client={new QueryClient({defaultOptions:{mutations:{retry:false}}})}>{ui}</QueryClientProvider>);}
const readyDraft=()=>{const d=createEmptyBuyerCriteriaDraft();d.firstName='Synthetic';d.email='buyer@example.test';d.criteria.geography=[{country:'US',stateCode:'CA',kind:'state'}];d.criteria.assetTypes=['land'];d.criteria.purchaser.role='principal';d.consentContact=true;return d;};
beforeEach(()=>{sessionStorage.clear();api.mockReset();api.mockResolvedValue(new Response(JSON.stringify({id:17,stage:'new'}),{status:201}));window.history.replaceState(null,'','/');});
afterEach(()=>{cleanup();vi.restoreAllMocks();});

describe('buyer criteria visitor recovery',()=>{
 it('focuses the first invalid field only after its summary and inline error are committed',()=>{
  mount(<BuyerCriteriaForm/>);const first=screen.getByLabelText(/First name/);const observed: boolean[]=[];
  first.addEventListener('focus',()=>{observed.push(first.getAttribute('aria-invalid')==='true' && !!document.getElementById(first.getAttribute('aria-describedby')??'') && !!screen.queryByRole('alert'));});
  fireEvent.click(screen.getByRole('button',{name:'Share buying criteria'}));expect(observed).toEqual([true]);expect(first).toHaveFocus();
 });
 it('focuses a rejected target area only after the inline error is committed',()=>{
  mount(<BuyerCriteriaForm/>);const state=screen.getByLabelText('State or territory');const observed: boolean[]=[];
  state.addEventListener('focus',()=>{observed.push(state.getAttribute('aria-invalid')==='true' && !!document.getElementById(state.getAttribute('aria-describedby')??''));});
  fireEvent.click(screen.getByRole('button',{name:'Add target area'}));expect(observed).toEqual([true]);expect(state).toHaveFocus();
 });
 it('keeps an earlier group error in the scroll target when following its summary link',()=>{
  mount(<BuyerCriteriaForm/>);fireEvent.click(screen.getByRole('button',{name:'Share buying criteria'}));
  const property=screen.getByLabelText('Single-family home');const label=property.closest('label')!;const error=document.getElementById(property.getAttribute('aria-describedby')!)!;const scrolled:HTMLElement[]=[];
  label.scrollIntoView=function(){scrolled.push(this);};error.scrollIntoView=function(){scrolled.push(this);};
  fireEvent.click(within(screen.getByRole('alert')).getByRole('link',{name:'Choose at least one property type.'}));expect(property).toHaveFocus();expect(scrolled).toEqual([error]);
 });
 it('reserves both navigation rows when linking to the form or an invalid field',()=>{
  mount(<BuyerCriteriaForm/>);const margin='calc(var(--journey-nav-height, 88px) + var(--journey-wayfinder-row-height, 50px) + 28px)';
  expect(screen.getByRole('form',{name:'Buying criteria'})).toHaveStyle({scrollMarginTop:margin});expect(screen.getByLabelText(/First name/)).toHaveStyle({scrollMarginTop:margin});
 });
 it('organizes the form into numbered groups with readable choices and explicit required fields',()=>{
  mount(<BuyerCriteriaForm/>);
  for(const title of ['1. Contact details','2. Target property','3. Purchasing context']) expect(screen.getByRole('group',{name:title})).toBeVisible();
  expect(screen.getByLabelText(/First name/)).toBeRequired();expect(screen.getByLabelText(/^Email(?: \(|$)/)).toBeRequired();
  expect(screen.getByLabelText(/Your purchasing role/)).toBeRequired();
  expect(screen.getByLabelText('BRRRR')).toBeVisible();
  expect(screen.getByText(/Buy, renovate, rent, refinance, repeat/)).toBeVisible();
  expect(screen.getByLabelText('Multifamily, 5+ units')).toBeVisible();
  expect(screen.getByRole('option',{name:'All-in budget'})).toBeInTheDocument();
  expect(screen.getByRole('option',{name:'31–90 days'})).toBeInTheDocument();
  expect(screen.getByText(/Fields marked required must be completed/)).toBeVisible();
 });
 it('links every missing required field to a local message and focuses the first correction',()=>{
  mount(<BuyerCriteriaForm/>);fireEvent.click(screen.getByRole('button',{name:'Share buying criteria'}));
  const first=screen.getByLabelText(/First name/);expect(first).toHaveFocus();
  const cases=[[/First name/,'Enter your first name.'],[/^Email(?: \(|$)/,'Enter a valid email address.'],[/State or territory/,'Add at least one target area.'],['Single-family home','Choose at least one property type.'],[/Your purchasing role/,'Choose your purchasing role.'],[/Contact me about these criteria/,'Contact permission is required to submit buying criteria.']] as const;
  for(const [label,message] of cases){const input=screen.getByLabelText(label);expect(input).toHaveAttribute('aria-invalid','true');expect(input).toHaveAccessibleDescription(expect.stringContaining(message));const link=within(screen.getByRole('alert')).getByRole('link',{name:message});expect(link).toHaveAttribute('href',`#${input.id}`);}
  fireEvent.click(within(screen.getByRole('alert')).getByRole('link',{name:'Choose your purchasing role.'}));expect(screen.getByLabelText(/Your purchasing role/)).toHaveFocus();expect(api).not.toHaveBeenCalled();
 });
 it('identifies a malformed email without resetting the entered draft',()=>{
  const draft=readyDraft();draft.email='not-an-email';mount(<BuyerCriteriaForm initialDraft={draft}/>);fireEvent.click(screen.getByRole('button',{name:'Share buying criteria'}));
  expect(screen.getByLabelText(/^Email(?: \(|$)/)).toHaveFocus();expect(screen.getByLabelText(/^Email(?: \(|$)/)).toHaveAccessibleDescription('Enter a valid email address.');expect(screen.getByLabelText(/^Email(?: \(|$)/)).toHaveValue('not-an-email');expect(screen.getByLabelText(/First name/)).toHaveValue('Synthetic');
 });
 it('rejects malformed ZIPs and duplicate target areas before adding them',()=>{
  const change=vi.fn();mount(<BuyerCriteriaForm onDraftChange={change}/>);
  fireEvent.change(screen.getByLabelText(/State or territory/),{target:{value:'CA'}});fireEvent.change(screen.getByLabelText('Area type'),{target:{value:'zip'}});fireEvent.change(screen.getByLabelText('Five-digit ZIP'),{target:{value:'94x00'}});fireEvent.click(screen.getByRole('button',{name:'Add target area'}));
  expect(screen.getByLabelText('Five-digit ZIP')).toHaveFocus();expect(screen.getByLabelText('Five-digit ZIP')).toHaveAttribute('aria-invalid','true');expect(screen.getByLabelText('Five-digit ZIP')).toHaveAccessibleDescription('Enter a five-digit ZIP code using numbers only.');expect(change).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Five-digit ZIP'),{target:{value:'94501'}});fireEvent.click(screen.getByRole('button',{name:'Add target area'}));expect(screen.getByRole('button',{name:'Remove 94501, CA'})).toBeVisible();
  fireEvent.change(screen.getByLabelText('Five-digit ZIP'),{target:{value:'94501'}});fireEvent.click(screen.getByRole('button',{name:'Add target area'}));expect(screen.getByText('This target area is already on your list. Choose a different area or remove the existing one.')).toBeVisible();expect(screen.getAllByRole('button',{name:'Remove 94501, CA'})).toHaveLength(1);expect(change).toHaveBeenCalledTimes(1);
 });
 it('recognizes city duplicates regardless of surrounding spaces or capitalization',()=>{
  const draft=readyDraft();draft.criteria.geography=[{country:'US',stateCode:'CA',kind:'city',name:'Oakland'}];mount(<BuyerCriteriaForm initialDraft={draft}/>);
  fireEvent.change(screen.getByLabelText(/State or territory/),{target:{value:'CA'}});fireEvent.change(screen.getByLabelText('Area type'),{target:{value:'city'}});fireEvent.change(screen.getByLabelText('City name'),{target:{value:' oakland '}});fireEvent.click(screen.getByRole('button',{name:'Add target area'}));expect(screen.getByText(/This target area is already on your list/)).toBeVisible();expect(screen.getAllByRole('button',{name:/Remove Oakland, CA/})).toHaveLength(1);
 });
 it('explains contradictory budgets and strategies with links to their controls',()=>{
  const draft=readyDraft();draft.criteria.priceRange={currency:'USD',basis:'all_in',min:300000,max:200000};draft.criteria.strategies=['brrrr','undecided'];mount(<BuyerCriteriaForm initialDraft={draft}/>);fireEvent.click(screen.getByRole('button',{name:'Share buying criteria'}));
  expect(screen.getByLabelText(/Maximum/)).toHaveFocus();expect(screen.getByLabelText(/Maximum/)).toHaveAccessibleDescription('Enter a maximum budget at least as large as the minimum.');expect(screen.getByLabelText('BRRRR')).toHaveAttribute('aria-invalid','true');expect(screen.getByLabelText('BRRRR')).toHaveAccessibleDescription(expect.stringContaining('Choose Undecided on its own, or choose one or more specific strategies.'));expect(api).not.toHaveBeenCalled();
 });
 it('opens optional closing details when validation needs a correction there',()=>{
  const draft=readyDraft();draft.criteria.timing.closingDays=366;mount(<BuyerCriteriaForm initialDraft={draft}/>);const closing=screen.getByLabelText(/Target closing window/);const disclosure=closing.closest('details');expect(disclosure).not.toHaveAttribute('open');fireEvent.click(screen.getByRole('button',{name:'Share buying criteria'}));expect(disclosure).toHaveAttribute('open');expect(closing).toHaveFocus();expect(closing).toHaveAttribute('aria-invalid','true');expect(closing).toHaveAccessibleDescription('Enter a whole number of days from 1 to 365, or leave this blank.');
 });
 it('retains populated optional disclosures and sends the identical contract payload while closed',async()=>{
  let now=10000;vi.spyOn(Date,'now').mockImplementation(()=>now);const draft=readyDraft();mount(<BuyerCriteriaForm initialDraft={draft}/>);
  const exclusions=screen.getByText('Property exclusions (optional)').closest('details')!;expect(exclusions).not.toHaveAttribute('open');fireEvent.click(screen.getByText('Property exclusions (optional)'));fireEvent.click(screen.getByLabelText('Fire or water damage'));fireEvent.click(screen.getByText('Property exclusions (optional)'));expect(exclusions).not.toHaveAttribute('open');expect(within(exclusions).getByText('1 selected')).toBeVisible();
  const summary=screen.getByText('Entity & closing details (optional)');fireEvent.click(summary);fireEvent.change(screen.getByLabelText(/Entity name/),{target:{value:'Synthetic LLC'}});fireEvent.change(screen.getByLabelText(/Target closing window/),{target:{value:'30'}});fireEvent.click(summary);expect(summary.closest('details')).not.toHaveAttribute('open');expect(within(summary.closest('details')!).getByText('2 details added')).toBeVisible();
  draft.criteria.rehabExclusions=['fire_water_damage'];draft.criteria.purchaser.entityName='Synthetic LLC';draft.criteria.timing.closingDays=30;now+=4000;fireEvent.click(screen.getByRole('button',{name:'Share buying criteria'}));expect((await screen.findByText(/Reference: 17/)).closest('[data-peggy-private]')).not.toBeNull();expect(api.mock.calls[0][2]).toEqual({...buildBuyerCriteriaLeadSubmission(draft),hp_company:'',ts_elapsed_ms:4000});
 });
 it.each(['503: {"message":"PRIVATE provider error"}','Failed to fetch'])('shows a calm uncertain-outcome message after %s, preserving values and retry identity',async message=>{
  let now=10000;vi.spyOn(Date,'now').mockImplementation(()=>now);api.mockRejectedValueOnce(new Error(message));mount(<BuyerCriteriaForm initialDraft={readyDraft()}/>);now+=4000;fireEvent.click(screen.getByRole('button',{name:'Share buying criteria'}));const alert=await screen.findByRole('alert');expect(alert).toHaveTextContent('We couldn’t confirm your submission. Your entered details are still here. Please try again with the same details.');expect(alert).not.toHaveTextContent(/503|PRIVATE|Failed to fetch/);expect(screen.getByLabelText(/First name/)).toHaveValue('Synthetic');expect(screen.queryByText('Criteria received.')).not.toBeInTheDocument();const first=api.mock.calls[0];fireEvent.click(screen.getByRole('button',{name:'Share buying criteria'}));await screen.findByText(/Reference: 17/);expect(api.mock.calls[1][3]).toEqual(first[3]);
 });
});
describe('shared buyer criteria intake',()=>{
 it('starts with deliberately empty geography and role, independent unchecked permissions',()=>{mount(<BuyerCriteriaForm/>);expect(screen.getByLabelText(/your purchasing role/i)).toHaveValue('');expect(screen.getByLabelText(/contact me about these criteria/i)).not.toBeChecked();expect(screen.getByLabelText(/email me about potential property matches/i)).not.toBeChecked();fireEvent.click(screen.getByRole('button',{name:'Share buying criteria'}));expect(api).not.toHaveBeenCalled();expect(screen.getByRole('alert')).toBeVisible();});
 it('uses a real receipt and separate false alert permission, retains retry key after ambiguity',async()=>{let now=10000;vi.spyOn(Date,'now').mockImplementation(()=>now);api.mockRejectedValueOnce(new Error('Connection interrupted'));mount(<BuyerCriteriaForm initialDraft={readyDraft()}/>);now+=4000;fireEvent.click(screen.getByRole('button',{name:'Share buying criteria'}));await screen.findByRole('alert');const first=api.mock.calls[0];expect(first[1]).toBe('/api/leads');expect(first[2].leadData.buyerAlertConsent.emailOptIn).toBe(false);fireEvent.click(screen.getByRole('button',{name:'Share buying criteria'}));await screen.findByText(/Reference: 17/);expect(api.mock.calls[1][3]).toEqual(first[3]);expect(screen.queryByRole('button',{name:'Share buying criteria'})).not.toBeInTheDocument();});
 it('keeps one in-flight request after repeated click',async()=>{let finish!:(r:Response)=>void;api.mockImplementationOnce(()=>new Promise<Response>(r=>finish=r));let now=10000;vi.spyOn(Date,'now').mockImplementation(()=>now);mount(<BuyerCriteriaForm initialDraft={readyDraft()}/>);now+=4000;const b=screen.getByRole('button',{name:'Share buying criteria'});fireEvent.click(b);fireEvent.click(b);await waitFor(()=>expect(api).toHaveBeenCalledTimes(1));finish(new Response(JSON.stringify({id:17,stage:'new'}),{status:201}));await screen.findByText(/Reference: 17/);});
 it.each(['intent','type'])('routes %s=buyer to criteria with no property prefills',key=>{window.history.replaceState(null,'',`/?${key}=buyer&address=PRIVATE&owner_situation=probate&ref=strategy-lab`);mount(<SubmitPropertyPage/>);expect(screen.getByRole('form',{name:'Buying criteria'})).toBeVisible();expect(screen.queryByDisplayValue('PRIVATE')).not.toBeInTheDocument();expect(screen.queryByTestId('opportunity-intake-form')).not.toBeInTheDocument();fireEvent.change(screen.getByLabelText(/First name/),{target:{value:'Kept'}});fireEvent.click(screen.getByRole('button',{name:'Return to Start'}));fireEvent.click(screen.getByRole('button',{name:/Investor interest/}));fireEvent.click(screen.getByRole('button',{name:/Continue/}));expect(screen.getByLabelText(/First name/)).toHaveValue('Kept');});
});
it('preserves a late buyer receipt after Return to Start without another submission',async()=>{
 let now=10000;vi.spyOn(Date,'now').mockImplementation(()=>now);vi.spyOn(window,'scrollTo').mockImplementation(()=>{});sessionStorage.clear();window.history.replaceState(null,'','/?intent=buyer');
 let resolveFirst!:(r:Response)=>void;api.mockImplementationOnce(()=>new Promise<Response>(r=>resolveFirst=r));api.mockResolvedValue(new Response(JSON.stringify({id:102,stage:'new'}),{status:201}));
 render(<QueryClientProvider client={new QueryClient()}><SubmitPropertyPage/></QueryClientProvider>);
 fireEvent.change(screen.getByLabelText(/First name/),{target:{value:'Review'}});fireEvent.change(screen.getByLabelText(/^Email(?: \(|$)/),{target:{value:'review@example.test'}});fireEvent.change(screen.getByLabelText('State or territory'),{target:{value:'CA'}});fireEvent.click(screen.getByRole('button',{name:'Add target area'}));fireEvent.click(screen.getByLabelText('Land'));fireEvent.change(screen.getByLabelText(/Your purchasing role/),{target:{value:'principal'}});fireEvent.click(screen.getByLabelText(/Contact me about these criteria/));now+=4000;fireEvent.click(screen.getByRole('button',{name:'Share buying criteria'}));await waitFor(()=>expect(api).toHaveBeenCalledTimes(1));
 fireEvent.click(screen.getByRole('button',{name:'Return to Start'}));await act(async()=>{resolveFirst(new Response(JSON.stringify({id:101,stage:'new'}),{status:201}));});fireEvent.click(screen.getByRole('button',{name:/Continue/}));await screen.findByText(/Reference: 101/);expect(screen.queryByRole('button',{name:'Share buying criteria'})).not.toBeInTheDocument();expect(api).toHaveBeenCalledTimes(1);
});
it('retains pending state and the receipt through quick Return and Continue navigation',async()=>{
 let now=10000;vi.spyOn(Date,'now').mockImplementation(()=>now);vi.spyOn(window,'scrollTo').mockImplementation(()=>{});sessionStorage.clear();window.history.replaceState(null,'','/?intent=buyer');
 let resolveFirst!:(r:Response)=>void;api.mockImplementationOnce(()=>new Promise<Response>(r=>resolveFirst=r));api.mockResolvedValue(new Response(JSON.stringify({id:102,stage:'new'}),{status:201}));
 render(<QueryClientProvider client={new QueryClient()}><SubmitPropertyPage/></QueryClientProvider>);
 fireEvent.change(screen.getByLabelText(/First name/),{target:{value:'Review'}});fireEvent.change(screen.getByLabelText(/^Email(?: \(|$)/),{target:{value:'review@example.test'}});fireEvent.change(screen.getByLabelText('State or territory'),{target:{value:'CA'}});fireEvent.click(screen.getByRole('button',{name:'Add target area'}));fireEvent.click(screen.getByLabelText('Land'));fireEvent.change(screen.getByLabelText(/Your purchasing role/),{target:{value:'principal'}});fireEvent.click(screen.getByLabelText(/Contact me about these criteria/));now+=4000;fireEvent.click(screen.getByRole('button',{name:'Share buying criteria'}));await waitFor(()=>expect(api).toHaveBeenCalledTimes(1));
 fireEvent.click(screen.getByRole('button',{name:'Return to Start'}));fireEvent.click(screen.getByRole('button',{name:/Continue/}));expect(screen.getByRole('button',{name:'Recording…'})).toBeDisabled();await act(async()=>{resolveFirst(new Response(JSON.stringify({id:101,stage:'new'}),{status:201}));});await screen.findByText(/Reference: 101/);expect(screen.queryByRole('button',{name:'Share buying criteria'})).not.toBeInTheDocument();expect(api).toHaveBeenCalledTimes(1);
});
