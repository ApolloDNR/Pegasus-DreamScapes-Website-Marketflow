import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ZodIssue } from 'zod';
import { useIntakeRequest } from '@/lib/intake-idempotency';
import {
  BUYER_ASSET_TYPES, BUYER_STRATEGIES, BUYER_REHAB_EXCLUSIONS,
  BUYER_OCCUPANCY_EXCLUSIONS, US_STATE_CODES, buyerCriteriaV1Schema,
  buyerCriteriaLeadSubmissionV1Schema, buildBuyerCriteriaLeadSubmission,
  createEmptyBuyerCriteriaDraft, buyerGeographySummary,
  type BuyerCriteriaDraft, type BuyerCriteriaV1,
} from '@shared/buyer-criteria';

// Display copy only. The original enum values remain the submission contract.
const optionLabels: Record<string, string> = {
  single_family: 'Single-family home', duplex: 'Duplex', triplex: 'Triplex', fourplex: 'Fourplex',
  multifamily_5_plus: 'Multifamily, 5+ units', land: 'Land', mixed_use: 'Mixed-use', commercial: 'Commercial', other: 'Other',
  buy_and_hold: 'Buy & hold', renovate_resell: 'Renovate & resell', brrrr: 'BRRRR', development: 'Development', undecided: 'Undecided',
  turnkey: 'Turnkey', light_cosmetic: 'Light cosmetic work', moderate_repairs: 'Moderate repairs', heavy_repairs: 'Heavy repairs',
  fire_water_damage: 'Fire or water damage', unfinished_project: 'Unfinished project', ground_up: 'Ground-up construction',
  owner_occupied: 'Owner-occupied', tenant_occupied: 'Tenant-occupied', vacant: 'Vacant', partially_occupied: 'Partially occupied', unknown: 'Unknown occupancy',
  purchase_price: 'Purchase price', all_in: 'All-in budget', exploring: 'Exploring', within_30_days: 'Within 30 days',
  '31_90_days': '31–90 days', '3_6_months': '3–6 months', '6_plus_months': '6+ months',
  individual: 'Individual', entity: 'Company or other entity', principal: 'Principal', entity_representative: 'Entity representative', broker_agent: 'Broker or agent',
  cash: 'Cash', financing_preapproved: 'Financing preapproved', financing_needed: 'Financing needed', combination: 'Combination',
  state: 'Entire state or territory', county: 'County', city: 'City', zip: 'ZIP code',
};
const control = 'block w-full min-w-0 min-h-11 mt-2 rounded border border-[var(--border,#c9bead)] bg-[var(--surface,#fcfaf6)] text-[var(--text,#0b1d29)] px-3 py-2 scroll-mt-28 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent,#975735)]';
const scrollClearance = { scrollMarginTop: 'calc(var(--journey-nav-height, 88px) + var(--journey-wayfinder-row-height, 50px) + 28px)' };
const focusStyle = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent,#975735)]';
const groupStyle = 'min-w-0 space-y-5 border-t border-[var(--border,#c9bead)] pt-5';
const detailStyle = 'min-w-0 border-y border-[var(--border,#c9bead)] py-2';
const uncertainMessage = 'We couldn’t confirm your submission. Your entered details are still here. Please try again with the same details.';
// Read contact validators from the same schema as the adapter. Its three public
// effects add cross-field refinements/normalization; the underlying object owns
// the field rules. Checking contact and criteria separately reports both at once.
const contactSchema = buyerCriteriaLeadSubmissionV1Schema.innerType().innerType().innerType().pick({
  firstName: true, lastName: true, email: true, phone: true, message: true,
});
type Field = 'firstName' | 'lastName' | 'email' | 'phone' | 'message' | 'geography' | 'assetTypes' | 'budgetBasis' | 'budgetMin' | 'budgetMax' | 'strategies' | 'rehabExclusions' | 'occupancyExclusions' | 'purchaseHorizon' | 'closingDays' | 'entityType' | 'entityName' | 'role' | 'funding' | 'consentContact';
type FieldError = { field: Field; message: string };
type AreaError = { field: 'state' | 'name' | 'add'; message: string };

function criteriaError(issue: ZodIssue, draft: BuyerCriteriaDraft): FieldError {
  const [key, detail] = issue.path;
  switch (key) {
    case 'geography':
      return { field: 'geography', message: issue.message === 'Remove duplicate selections' ? 'Remove the duplicate target area.' : issue.code === 'too_big' ? 'Keep no more than 20 target areas. Remove an area before adding another.' : issue.path.includes('postalCode') ? 'Remove the invalid target area and add a five-digit ZIP code using numbers only.' : draft.criteria.geography.length === 0 ? 'Add at least one target area.' : 'Remove the invalid target area, then add it again with a state and a valid city, county or ZIP.' };
    case 'assetTypes': return { field: 'assetTypes', message: 'Choose at least one property type.' };
    case 'priceRange':
      if (detail === 'min') return { field: 'budgetMin', message: 'Enter a whole-dollar minimum from 0 to 1 trillion, or leave it blank.' };
      if (draft.criteria.priceRange.basis === 'undecided') return { field: 'budgetBasis', message: 'Choose a budget basis before entering an amount, or select Undecided again to clear the amounts.' };
      return { field: 'budgetMax', message: draft.criteria.priceRange.min !== null && draft.criteria.priceRange.max !== null && draft.criteria.priceRange.min > draft.criteria.priceRange.max ? 'Enter a maximum budget at least as large as the minimum.' : 'Enter a positive whole-dollar maximum up to 1 trillion, or choose Undecided.' };
    case 'strategies': return { field: 'strategies', message: draft.criteria.strategies.includes('undecided') && draft.criteria.strategies.length > 1 ? 'Choose Undecided on its own, or choose one or more specific strategies.' : 'Choose at least one strategy, or choose Undecided.' };
    case 'rehabExclusions': return { field: 'rehabExclusions', message: 'Review the renovation exclusions and remove repeated choices.' };
    case 'occupancyExclusions': return { field: 'occupancyExclusions', message: 'Review the occupancy exclusions and remove repeated choices.' };
    case 'timing': return detail === 'closingDays' ? { field: 'closingDays', message: 'Enter a whole number of days from 1 to 365, or leave this blank.' } : { field: 'purchaseHorizon', message: 'Choose your purchase timing, or choose Exploring.' };
    case 'purchaser':
      if (detail === 'entityName') return { field: 'entityName', message: 'Enter an entity name of up to 255 characters, or leave this blank.' };
      return detail === 'entityType' ? { field: 'entityType', message: 'Choose a purchasing entity, or choose Undecided.' } : { field: 'role', message: 'Choose your purchasing role.' };
    case 'funding': return { field: 'funding', message: 'Choose your funding approach, or choose Undecided.' };
    default: return { field: 'geography', message: 'Review your target property choices before sending.' };
  }
}

function validateDraft(draft: BuyerCriteriaDraft): FieldError[] {
  const errors: FieldError[] = [];
  const contact = contactSchema.safeParse({ firstName: draft.firstName, email: draft.email,
    ...(draft.lastName.trim() ? { lastName: draft.lastName } : {}),
    ...(draft.phone.trim() ? { phone: draft.phone } : {}),
    ...(draft.message.trim() ? { message: draft.message } : {}),
  });
  if (!contact.success) for (const issue of contact.error.issues) {
    const field = issue.path[0] as 'firstName' | 'lastName' | 'email' | 'phone' | 'message';
    const messages = { firstName: draft.firstName.trim() ? 'Use no more than 255 characters for your first name.' : 'Enter your first name.', lastName: 'Use no more than 255 characters for your last name.', email: 'Enter a valid email address.', phone: 'Use no more than 50 characters for your phone number.', message: 'Use no more than 2,000 characters for your additional details.' };
    errors.push({ field, message: messages[field] });
  }
  const criteria = buyerCriteriaV1Schema.safeParse(draft.criteria);
  if (!criteria.success) errors.push(...criteria.error.issues.map(issue => criteriaError(issue, draft)));
  if (!draft.consentContact) errors.push({ field: 'consentContact', message: 'Contact permission is required to submit buying criteria.' });
  const order: Field[] = ['firstName', 'lastName', 'email', 'phone', 'geography', 'assetTypes', 'budgetBasis', 'budgetMin', 'budgetMax', 'strategies', 'rehabExclusions', 'occupancyExclusions', 'purchaseHorizon', 'role', 'funding', 'entityType', 'entityName', 'closingDays', 'message', 'consentContact'];
  return errors.filter((error, index) => errors.findIndex(other => other.field === error.field) === index).sort((a, b) => order.indexOf(a.field) - order.indexOf(b.field));
}

export function BuyerCriteriaForm({ initialDraft, onDraftChange, referrer, initialReceipt = null, onReceipt, pending: parentPending, onPendingChange }: {
  pending?: boolean; onPendingChange?: (pending: boolean) => void; initialReceipt?: number | null; onReceipt?: (receipt: number) => void;
  initialDraft?: BuyerCriteriaDraft; onDraftChange?: (draft: BuyerCriteriaDraft) => void; referrer?: string;
}) {
  const [draft, setDraft] = useState<BuyerCriteriaDraft>(() => initialDraft ?? { ...createEmptyBuyerCriteriaDraft(), referredBy: referrer ?? '' });
  const [area, setArea] = useState({ stateCode: '', kind: 'state', name: '' });
  const [areaError, setAreaError] = useState<AreaError | null>(null);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [error, setError] = useState('');
  const [localReceipt, setReceipt] = useState<number | null>(null);
  const [localPending, setLocalPending] = useState(false);
  const receipt = initialReceipt ?? localReceipt, pending = parentPending ?? localPending;
  const setPending = (value: boolean) => { setLocalPending(value); onPendingChange?.(value); };
  const busy = useRef(false), start = useRef(Date.now()), success = useRef<HTMLDivElement>(null), errorRef = useRef<HTMLDivElement>(null);
  const focusAfterValidation = useRef<string | null>(null);
  const [hp, setHp] = useState('');
  const id = useId();
  const send = useIntakeRequest('pegasus-lane:buyer', '/api/leads');
  const change = (next: BuyerCriteriaDraft) => {
    setDraft(next); onDraftChange?.(next);
    if (errors.length) setErrors(validateDraft(next));
  };
  const criteria = (patch: Partial<BuyerCriteriaDraft['criteria']>) => change({ ...draft, criteria: { ...draft.criteria, ...patch } });
  useEffect(() => { if (receipt !== null) success.current?.focus(); }, [receipt]);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  const inputId = (field: Field) => `${id}-${field}`;
  const focusControl = (targetId: string) => {
    const element = document.getElementById(targetId);
    const disclosure = element?.closest('details');
    if (disclosure) disclosure.open = true;
    element?.focus({ preventScroll: true });
    // Position the label with its control, rather than letting native focus
    // center only the input underneath the fixed navigation rows.
    const label = element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement ? element.labels?.[0] : null;
    let target = label ?? element;
    // Group errors precede their first checkbox/select; keep that explanation
    // above the control in view as well as errors rendered below text fields.
    const errorId = element?.getAttribute('aria-describedby')?.split(' ').find(value => value.endsWith('-error'));
    const inlineError = errorId ? document.getElementById(errorId) : null;
    if (target && inlineError && target.compareDocumentPosition(inlineError) & Node.DOCUMENT_POSITION_PRECEDING) target = inlineError;
    if (target) {
      target.style.scrollMarginTop = scrollClearance.scrollMarginTop;
      target.scrollIntoView?.({ block: 'start', behavior: 'instant' });
    }
  };
  useLayoutEffect(() => {
    const target = focusAfterValidation.current;
    focusAfterValidation.current = null;
    // The summary changes form geometry. Wait for React to insert all error
    // content before measuring/scrolling, including repeated invalid submits.
    if (target) focusControl(target);
  }, [errors, areaError]);
  const fieldError = (field: Field) => errors.find(error => error.field === field);
  const errorNote = (field: Field) => fieldError(field) && <p id={`${inputId(field)}-error`} className="text-sm font-medium">{fieldError(field)!.message}</p>;
  const invalidProps = (field: Field, helpId?: string) => ({
    style: scrollClearance,
    'aria-invalid': !!fieldError(field),
    'aria-describedby': [fieldError(field) ? `${inputId(field)}-error` : '', helpId].filter(Boolean).join(' ') || undefined,
  });
  const field = (name: 'firstName' | 'lastName' | 'email' | 'phone', title: string, max: number, type = 'text') => <div className="min-w-0" key={name}>
    <label className="block" htmlFor={inputId(name)}>{title}</label>
    <input id={inputId(name)} className={control} type={type} required={name === 'firstName' || name === 'email'} maxLength={max} autoComplete={{ firstName: 'given-name', lastName: 'family-name', email: 'email', phone: 'tel' }[name]} value={draft[name]} {...invalidProps(name)} onChange={e => change({ ...draft, [name]: e.target.value })} />
    {errorNote(name)}
  </div>;
  const select = (name: Field, title: string, value: string, options: readonly string[], changeValue: (s: string) => void, empty?: string) => <div className="min-w-0">
    <label className="block" htmlFor={inputId(name)}>{title}</label>
    <select id={inputId(name)} className={control} value={value} required={name === 'role'} {...invalidProps(name)} onChange={e => changeValue(e.target.value)}>
      {empty && <option value="">{empty}</option>}{options.map(value => <option key={value} value={value}>{optionLabels[value] ?? value}</option>)}
    </select>{errorNote(name)}
  </div>;
  const checkboxes = (title: string, key: 'assetTypes' | 'strategies' | 'rehabExclusions' | 'occupancyExclusions', options: readonly string[]) => <fieldset className="min-w-0 space-y-2">
    <legend className="font-semibold mb-2">{title}</legend>
    {key === 'strategies' && <p id={`${id}-strategy-help`} className="text-sm">BRRRR: Buy, renovate, rent, refinance, repeat.</p>}
    {errorNote(key)}
    <div className="grid gap-x-5 gap-y-1 sm:grid-cols-2">{options.map((value, index) => <label key={value} className="flex min-h-11 items-center gap-3">
      <input id={index === 0 ? inputId(key) : `${inputId(key)}-${value}`} className={`shrink-0 scroll-mt-28 ${focusStyle}`} type="checkbox" {...invalidProps(key, key === 'strategies' ? `${id}-strategy-help` : undefined)} checked={(draft.criteria[key] as string[]).includes(value)} onChange={e => {
        let values = (draft.criteria[key] as string[]).filter(item => item !== value);
        if (e.target.checked) values.push(value);
        if (key === 'strategies') {
          if (value === 'undecided' && e.target.checked) values = ['undecided'];
          else if (value !== 'undecided') values = values.filter(item => item !== 'undecided');
        }
        criteria({ [key]: values } as Partial<BuyerCriteriaV1>);
      }} />{optionLabels[value]}</label>)}</div>
  </fieldset>;
  const updateArea = (next: typeof area) => { setArea(next); setAreaError(null); };
  const addArea = () => {
    let failure: AreaError | null = null;
    if (!area.stateCode) failure = { field: 'state', message: 'Choose a state or territory for this target area.' };
    else if (area.kind !== 'state' && !area.name.trim()) failure = { field: 'name', message: area.kind === 'zip' ? 'Enter a five-digit ZIP code using numbers only.' : `Enter the ${area.kind} name.` };
    const entry = { country: 'US', stateCode: area.stateCode, kind: area.kind, ...(area.kind === 'zip' ? { postalCode: area.name.trim() } : area.kind === 'state' ? {} : { name: area.name.trim() }) };
    const parsed = buyerCriteriaV1Schema.shape.geography.safeParse([...draft.criteria.geography, entry]);
    if (!failure && !parsed.success) {
      const issues = parsed.error.issues;
      failure = { field: area.kind === 'state' ? 'add' : 'name', message: issues.some(issue => issue.message === 'Remove duplicate selections') ? 'This target area is already on your list. Choose a different area or remove the existing one.' : issues.some(issue => issue.code === 'too_big' && issue.path.length === 0) ? 'Keep no more than 20 target areas. Remove an area before adding another.' : area.kind === 'zip' ? 'Enter a five-digit ZIP code using numbers only.' : 'Enter a valid city or county name of up to 100 characters.' };
    }
    if (failure) { focusAfterValidation.current = failure.field === 'state' ? inputId('geography') : `${id}-area-${failure.field}`; setAreaError(failure); return; }
    if (parsed.success) { criteria({ geography: parsed.data }); setArea({ ...area, name: '' }); setAreaError(null); }
  };
  const exclusionCount = draft.criteria.rehabExclusions.length + draft.criteria.occupancyExclusions.length;
  const detailCount = Number(draft.criteria.purchaser.entityType !== 'undecided') + Number(!!draft.criteria.purchaser.entityName) + Number(draft.criteria.timing.closingDays !== null);
  if (receipt !== null) return <div ref={success} tabIndex={-1} role="status" className="space-y-4"><h2 className="font-serif text-3xl">Criteria received.</h2><p>Reference: {receipt}</p><p>This records your criteria for possible consideration. It does not create representation, verified status, priority, alerts, or a guaranteed match.</p></div>;
  return <form style={scrollClearance} id="buyer-criteria" aria-label="Buying criteria" noValidate aria-busy={pending} className="min-w-0 space-y-6 scroll-mt-28" onSubmit={async e => {
    e.preventDefault(); if (busy.current || pending) return; setError('');
    const validation = validateDraft(draft); setErrors(validation);
    if (validation.length) { focusAfterValidation.current = inputId(validation[0].field); return; }
    const elapsed = Date.now() - start.current;
    if (elapsed < 3000) { setError('Please take a moment to review your criteria, then try again.'); return; }
    busy.current = true; setPending(true);
    try {
      const payload = buildBuyerCriteriaLeadSubmission(draft);
      const result = await send({ ...payload, hp_company: hp, ts_elapsed_ms: elapsed });
      setReceipt(result.id); onReceipt?.(result.id);
    } catch (err) {
      // Only known local retry guidance may pass through; HTTP/provider/receipt
      // failures are uncertain outcomes and must never leak a raw response.
      const localMessages = ['Your earlier submission may already be recorded. No edited inquiry was sent.', 'Your earlier submission is still being confirmed. Please wait before sending edited details.'];
      setError(err instanceof Error && localMessages.includes(err.message) ? `${err.message} Your entered details are still here.` : uncertainMessage);
    } finally { busy.current = false; setPending(false); }
  }}>
    <h2 className="font-serif text-3xl">Share your buying criteria</h2>
    <p>Tell us what fits. No bank statements or account numbers. These are self-reported criteria, not proof of capacity or a representation agreement.</p>
    <p className="text-sm">Fields marked required must be completed. You can leave optional details blank and keep Undecided or Exploring where offered.</p>
    {errors.length > 0 && <div role="alert" className="border-l-4 border-[var(--accent-ink,#975735)] pl-4 space-y-2">
      <p className="font-semibold">Please correct these details before sending:</p>
      <ul className="list-disc space-y-1 pl-5">{errors.map(({ field, message }) => <li key={field}><a className={`underline ${focusStyle}`} href={`#${inputId(field)}`} onClick={e => { e.preventDefault(); focusControl(inputId(field)); }}>{message}</a></li>)}</ul>
    </div>}
    {error && <div ref={errorRef} tabIndex={-1} role="alert" className="border-l-4 border-[var(--accent-ink,#975735)] pl-4">{error}</div>}
    <fieldset disabled={pending} className="min-w-0 space-y-8 disabled:opacity-70"><legend className="sr-only">Your buying criteria</legend>
      <fieldset className={groupStyle}><legend className="font-semibold pr-3">1. Contact details</legend>
        <div className="grid gap-5 sm:grid-cols-2">{field('firstName', 'First name (required)', 255)}{field('lastName', 'Last name (optional)', 255)}{field('email', 'Email (required)', 255, 'email')}{field('phone', 'Phone (optional)', 50, 'tel')}</div>
      </fieldset>
      <fieldset className={groupStyle}><legend className="font-semibold pr-3">2. Target property</legend>
        <fieldset className="min-w-0 space-y-4"><legend className="font-semibold mb-2">Target areas (required; choose at least one)</legend>
          <p className="text-sm">Choose an area below, then select Add target area. You can add up to 20.</p>
          {errorNote('geography')}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="min-w-0"><label htmlFor={inputId('geography')}>State or territory</label><select id={inputId('geography')} style={scrollClearance} className={control} value={area.stateCode} aria-invalid={!!fieldError('geography') || areaError?.field === 'state'} aria-describedby={[fieldError('geography') && `${inputId('geography')}-error`, areaError?.field === 'state' && `${id}-area-error`].filter(Boolean).join(' ') || undefined} onChange={e => updateArea({ ...area, stateCode: e.target.value })}><option value="">Choose a state</option>{US_STATE_CODES.map(value => <option key={value} value={value}>{value}</option>)}</select></div>
            <div className="min-w-0"><label htmlFor={`${id}-area-kind`}>Area type</label><select id={`${id}-area-kind`} className={control} value={area.kind} onChange={e => updateArea({ ...area, kind: e.target.value, name: '' })}>{['state', 'county', 'city', 'zip'].map(value => <option key={value} value={value}>{optionLabels[value]}</option>)}</select></div>
          </div>
          {area.kind !== 'state' && <div><label className="block" htmlFor={`${id}-area-name`}>{area.kind === 'zip' ? 'Five-digit ZIP' : area.kind === 'city' ? 'City name' : 'County name'}</label><input id={`${id}-area-name`} style={scrollClearance} className={control} inputMode={area.kind === 'zip' ? 'numeric' : 'text'} maxLength={area.kind === 'zip' ? 5 : 100} value={area.name} aria-invalid={areaError?.field === 'name'} aria-describedby={areaError?.field === 'name' ? `${id}-area-error` : undefined} onChange={e => updateArea({ ...area, name: e.target.value })} /></div>}
          {areaError && <p id={`${id}-area-error`} role="alert" className="text-sm font-medium">{areaError.message}</p>}
          <button id={`${id}-area-add`} style={scrollClearance} type="button" className={`min-h-11 rounded border border-[var(--accent-ink,#975735)] px-4 text-[var(--text,#0b1d29)] ${focusStyle}`} aria-invalid={areaError?.field === 'add'} aria-describedby={areaError?.field === 'add' ? `${id}-area-error` : undefined} onClick={addArea}>Add target area</button>
          {draft.criteria.geography.length > 0 && <ul className="space-y-2" aria-label="Selected target areas">{draft.criteria.geography.map((area, index) => <li key={index} className="flex items-center justify-between gap-3"><span className="min-w-0 break-words">{buyerGeographySummary([area])}</span><button type="button" className={`min-h-11 shrink-0 underline ${focusStyle}`} aria-label={`Remove ${buyerGeographySummary([area])}`} onClick={() => { criteria({ geography: draft.criteria.geography.filter((_, current) => current !== index) }); setAreaError(null); }}>Remove</button></li>)}</ul>}
        </fieldset>
        {checkboxes('Property types (required; choose at least one)', 'assetTypes', BUYER_ASSET_TYPES)}
        {select('budgetBasis', 'Budget basis', draft.criteria.priceRange.basis, ['undecided', 'purchase_price', 'all_in'], value => criteria({ priceRange: { currency: 'USD', basis: value as BuyerCriteriaV1['priceRange']['basis'], min: null, max: null } }))}
        {draft.criteria.priceRange.basis !== 'undecided' && <div className="grid gap-4 sm:grid-cols-2">{(['min', 'max'] as const).map(key => { const name = key === 'min' ? 'budgetMin' : 'budgetMax'; return <div className="min-w-0" key={key}><label htmlFor={inputId(name)}>{key === 'min' ? 'Minimum USD (optional)' : 'Maximum USD (required for this budget basis)'}</label><input id={inputId(name)} className={control} type="number" min={key === 'min' ? '0' : '1'} max="1000000000000" step="1" required={key === 'max'} value={draft.criteria.priceRange[key] ?? ''} {...invalidProps(name)} onChange={e => criteria({ priceRange: { ...draft.criteria.priceRange, [key]: e.target.value === '' ? null : Number(e.target.value) } })} />{errorNote(name)}</div>; })}</div>}
        {checkboxes('Strategies (choose at least one, or Undecided)', 'strategies', BUYER_STRATEGIES)}
        <details className={detailStyle}><summary className={`min-h-11 cursor-pointer py-3 ${focusStyle}`}><span>Property exclusions (optional)</span><span className="ml-2 text-sm">{exclusionCount ? `${exclusionCount} selected` : 'None selected'}</span></summary><div className="space-y-5 pb-4 pt-3">
          {checkboxes('Renovation conditions to exclude (optional)', 'rehabExclusions', BUYER_REHAB_EXCLUSIONS)}<p className="text-sm">No exclusions specified does not mean unlimited renovation capability.</p>{checkboxes('Property occupancy to exclude (optional)', 'occupancyExclusions', BUYER_OCCUPANCY_EXCLUSIONS)}
        </div></details>
      </fieldset>
      <fieldset className={groupStyle}><legend className="font-semibold pr-3">3. Purchasing context</legend>
        {select('purchaseHorizon', 'Purchase timing', draft.criteria.timing.purchaseHorizon, ['exploring', 'within_30_days', '31_90_days', '3_6_months', '6_plus_months'], value => criteria({ timing: { ...draft.criteria.timing, purchaseHorizon: value as BuyerCriteriaV1['timing']['purchaseHorizon'] } }))}
        {select('role', 'Your purchasing role (required)', draft.criteria.purchaser.role, ['principal', 'entity_representative', 'broker_agent', 'other'], value => criteria({ purchaser: { ...draft.criteria.purchaser, role: value as BuyerCriteriaV1['purchaser']['role'] } }), 'Choose your role')}
        {select('funding', 'Funding approach (self-reported)', draft.criteria.funding.status, ['undecided', 'cash', 'financing_preapproved', 'financing_needed', 'combination'], value => criteria({ funding: { selfReported: true, status: value as BuyerCriteriaV1['funding']['status'] } }))}
        <details className={detailStyle}><summary className={`min-h-11 cursor-pointer py-3 ${focusStyle}`}><span>Entity &amp; closing details (optional)</span><span className="ml-2 text-sm">{detailCount ? `${detailCount} ${detailCount === 1 ? 'detail' : 'details'} added` : 'None added'}</span></summary><div className="space-y-5 pb-4 pt-3">
          {select('entityType', 'Purchasing entity (optional)', draft.criteria.purchaser.entityType, ['undecided', 'individual', 'entity'], value => criteria({ purchaser: { ...draft.criteria.purchaser, entityType: value as BuyerCriteriaV1['purchaser']['entityType'] } }))}
          <div><label className="block" htmlFor={inputId('entityName')}>Entity name (optional, may be unformed)</label><input id={inputId('entityName')} className={control} maxLength={255} value={draft.criteria.purchaser.entityName ?? ''} {...invalidProps('entityName')} onChange={e => criteria({ purchaser: { ...draft.criteria.purchaser, entityName: e.target.value || null } })} />{errorNote('entityName')}</div>
          <div><label className="block" htmlFor={inputId('closingDays')}>Target closing window in days (optional, self-reported)</label><input id={inputId('closingDays')} className={control} type="number" min="1" max="365" step="1" value={draft.criteria.timing.closingDays ?? ''} {...invalidProps('closingDays')} onChange={e => criteria({ timing: { ...draft.criteria.timing, closingDays: e.target.value === '' ? null : Number(e.target.value) } })} />{errorNote('closingDays')}</div>
        </div></details>
        <div><label className="block" htmlFor={inputId('message')}>Anything else (optional)</label><textarea id={inputId('message')} className={control} maxLength={2000} value={draft.message} {...invalidProps('message')} onChange={e => change({ ...draft, message: e.target.value })} />{errorNote('message')}</div>
      </fieldset>
      <div className="space-y-4 border-t border-[var(--border,#c9bead)] pt-5">
        <p className="text-sm font-semibold">Contact permission (required)</p>
        <label className="flex min-h-11 gap-3 items-start"><input id={inputId('consentContact')} className={`mt-1 shrink-0 scroll-mt-28 ${focusStyle}`} type="checkbox" required {...invalidProps('consentContact')} checked={draft.consentContact} onChange={e => change({ ...draft, consentContact: e.target.checked })} />Contact me about these criteria. I understand submission does not establish representation or guarantee a match.</label>{errorNote('consentContact')}
        <label className="flex min-h-11 gap-3 items-start"><input className={`mt-1 shrink-0 ${focusStyle}`} type="checkbox" checked={draft.emailOptIn} onChange={e => change({ ...draft, emailOptIn: e.target.checked })} />Email me about potential property matches, if separately offered. Optional; this records a preference and does not activate alerts.</label>
        <p className="text-sm">Read our <a className="underline" href="/privacy">privacy policy</a>. Both choices are recorded with this submission.</p>
        <input type="text" name="hp_company" aria-hidden="true" tabIndex={-1} autoComplete="off" className="hidden" value={hp} onChange={e => setHp(e.target.value)} />
        <button type="submit" className="btn-copper min-h-11 px-6 py-3">{pending ? 'Recording…' : 'Share buying criteria'}</button>
      </div>
    </fieldset>
  </form>;
}
