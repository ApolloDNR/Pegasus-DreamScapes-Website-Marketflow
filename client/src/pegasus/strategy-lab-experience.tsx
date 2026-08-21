import React from 'react';
import { useLocation, useSearch } from 'wouter';
import {
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Gauge,
  Hammer,
  Landmark,
  MessageCircle,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import {
  runStrategyLab,
  type ConditionRating,
  type PropertyInput,
  type StrategySnapshot,
  type SubmitterRole,
} from '@shared/strategy-lab';
import type { CalcTabKey } from '@/components/strategy-lab/calculator-tools-panel';
import { useOptionalPeggyContext } from '@/contexts/peggy-context';
import type { Nav } from './theme';
import { IMG } from './primitives';
import { writeStrategyLabHandoff } from './strategy-lab-handoff';

const CalculatorToolsPanel = React.lazy(() =>
  import('@/components/strategy-lab/calculator-tools-panel').then((module) => ({
    default: module.CalculatorToolsPanel,
  })),
);

type LabStep = 'property' | 'basis' | 'strategy' | 'review';
type LabState = {
  address: string;
  propertyType: string;
  situation: string;
  occupancy: string;
  condition: string;
  submitterRole: string;
  acquisition: string;
  scope: string;
  arv: string;
  marketRent: string;
  loanLtv: string;
  loanRate: string;
  vacancy: string;
  objective: string;
  timing: string;
};

type NumericField = 'acquisition' | 'scope' | 'arv' | 'marketRent' | 'loanLtv' | 'loanRate' | 'vacancy';
type DraftEnvelope = { schemaVersion: 3; savedAt: string; state: LabState };

const STORAGE_KEY = 'pegasus.strategy-lab.v3';
const MONEY_LIMIT = 100_000_000;
const INITIAL: LabState = {
  address: '',
  propertyType: 'Single-family residence',
  situation: 'Value-add opportunity',
  occupancy: 'Vacant',
  condition: 'Moderate renovation',
  submitterRole: 'Exploring a property',
  acquisition: '',
  scope: '',
  arv: '',
  marketRent: '',
  loanLtv: '75',
  loanRate: '7.5',
  vacancy: '8',
  objective: 'Understand the strongest executable path',
  timing: 'Flexible',
};

const STEPS: Array<{ key: LabStep; num: string; label: string; hint: string }> = [
  { key: 'property', num: '01', label: 'Property', hint: 'Situation and facts' },
  { key: 'basis', num: '02', label: 'Basis', hint: 'Economics and assumptions' },
  { key: 'strategy', num: '03', label: 'Paths', hint: 'Nine executable routes' },
  { key: 'review', num: '04', label: 'Brief', hint: 'Decision record' },
];

const PROPERTY_TYPES = ['Single-family residence', 'Condo or townhome', '2–4 units', 'Small multifamily', 'Land or development site', 'Commercial or mixed-use'];
const SITUATIONS = ['Value-add opportunity', 'Owner needs options', 'Inherited or estate property', 'Distressed or time-sensitive', 'Contract or sourced opportunity', 'Development or ADU potential'];
const OCCUPANCIES = ['Vacant', 'Owner occupied', 'Tenant occupied', 'Unknown or needs review'];
const CONDITIONS = ['Turnkey', 'Light updates', 'Moderate renovation', 'Heavy renovation', 'Full reconstruction'];
const ROLES = ['Exploring a property', 'Property owner', 'Deal partner or wholesaler', 'Investor or buyer', 'Agent or advisor', 'Capital partner'];
const OBJECTIVES = ['Understand the strongest executable path', 'Maximize net value', 'Prioritize certainty and timing', 'Preserve control or optionality', 'Find a capital or operating partner'];
const TIMINGS = ['Flexible', 'Within 90 days', 'Within 30 days', 'Time-sensitive'];

const CALCULATOR_TABS: readonly CalcTabKey[] = [
  'arv',
  'roi',
  'brrrr',
  'cashflow',
  'wholesale',
  'piti',
  'ownvsrent',
  'hardmoney',
];

const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const money = (value: number) => USD.format(Number.isFinite(value) ? value : 0);

function laneDisplayName(lane: { lane: string; laneLabel: string } | undefined): string {
  if (!lane) return 'Needs more data';
  return lane.lane === 'listing_referral' ? 'Listing referral' : lane.laneLabel;
}

function parseNumber(value: string): number {
  const cleaned = value.replace(/[$,\s]/g, '');
  if (!cleaned || !/^-?\d*\.?\d*$/.test(cleaned)) return 0;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function numericError(key: NumericField, raw: string): string {
  if (!raw.trim()) return '';
  const value = parseNumber(raw);
  if (!/^-?[$,\d\s]*\.?\d*$/.test(raw) || !Number.isFinite(value)) return 'Enter a number using digits only.';
  if (value < 0) return 'Use a value of zero or more.';
  if (['loanLtv', 'loanRate', 'vacancy'].includes(key) && value > 100) return 'Use a percentage from 0 to 100.';
  if (!['loanLtv', 'loanRate', 'vacancy'].includes(key) && value > MONEY_LIMIT) return 'Use a value below $100,000,000.';
  return '';
}

function boundedNumericValue(key: NumericField, raw: string): number | undefined {
  if (!raw.trim() || numericError(key, raw)) return undefined;
  return parseNumber(raw);
}

function optionOr(value: unknown, options: string[], fallback: string): string {
  return typeof value === 'string' && options.includes(value) ? value : fallback;
}

function restoreDraft(raw: string): LabState | null {
  try {
    const candidate = JSON.parse(raw) as unknown;
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null;
    const record = candidate as Record<string, unknown>;
    const source = record.schemaVersion === 3 && record.state && typeof record.state === 'object' && !Array.isArray(record.state)
      ? record.state as Record<string, unknown>
      : record;
    const text = (key: keyof LabState, fallback = '') => {
      const value = source[key];
      return typeof value === 'string' ? value.slice(0, 180) : fallback;
    };
    return {
      address: text('address'),
      propertyType: optionOr(source.propertyType, PROPERTY_TYPES, INITIAL.propertyType),
      situation: optionOr(source.situation, SITUATIONS, INITIAL.situation),
      occupancy: optionOr(source.occupancy, OCCUPANCIES, INITIAL.occupancy),
      condition: optionOr(source.condition, CONDITIONS, INITIAL.condition),
      submitterRole: optionOr(source.submitterRole, ROLES, INITIAL.submitterRole),
      acquisition: text('acquisition'),
      scope: text('scope'),
      arv: text('arv'),
      marketRent: text('marketRent'),
      loanLtv: text('loanLtv', INITIAL.loanLtv),
      loanRate: text('loanRate', INITIAL.loanRate),
      vacancy: text('vacancy', INITIAL.vacancy),
      objective: optionOr(source.objective, OBJECTIVES, INITIAL.objective),
      timing: optionOr(source.timing, TIMINGS, INITIAL.timing),
    };
  } catch {
    return null;
  }
}

function conditionFrom(label: string): ConditionRating {
  return ({
    Turnkey: 'turnkey',
    'Light updates': 'light',
    'Moderate renovation': 'moderate',
    'Heavy renovation': 'heavy',
    'Full reconstruction': 'gut',
  } as Record<string, ConditionRating>)[label] ?? 'moderate';
}

function roleFrom(label: string): SubmitterRole {
  return ({
    'Property owner': 'owner_seller',
    'Deal partner or wholesaler': 'wholesaler',
    'Investor or buyer': 'investor_buyer',
    'Agent or advisor': 'agent',
    'Capital partner': 'capital_partner',
  } as Record<string, SubmitterRole>)[label] ?? 'unknown';
}

function occupancyFrom(label: string): PropertyInput['occupancyStatus'] {
  return ({
    Vacant: 'vacant',
    'Owner occupied': 'owner_occupied',
    'Tenant occupied': 'tenant_occupied',
    'Unknown or needs review': 'unknown',
  } as Record<string, PropertyInput['occupancyStatus']>)[label] ?? 'unknown';
}

function timingDays(label: string): number | undefined {
  return ({ 'Within 90 days': 90, 'Within 30 days': 30, 'Time-sensitive': 14 } as Record<string, number>)[label];
}

function propertyFrom(state: LabState): PropertyInput {
  const acquisition = boundedNumericValue('acquisition', state.acquisition) ?? 0;
  const scope = boundedNumericValue('scope', state.scope) ?? 0;
  const arv = boundedNumericValue('arv', state.arv) ?? 0;
  const rent = boundedNumericValue('marketRent', state.marketRent) ?? 0;
  const developmentPotential = state.situation.includes('Development') || state.propertyType.includes('Land');
  const ownerSubmitted = ['Owner needs options', 'Inherited or estate property', 'Distressed or time-sensitive'].includes(state.situation);
  return {
    address: state.address.trim().slice(0, 180) || undefined,
    askingPrice: acquisition,
    purchasePrice: acquisition || undefined,
    rehabBudget: scope || undefined,
    arvEstimate: arv || undefined,
    marketRent: rent || undefined,
    condition: conditionFrom(state.condition),
    occupancyStatus: occupancyFrom(state.occupancy),
    timelineDaysToClose: timingDays(state.timing),
    developmentPotential,
    submitterRole: roleFrom(state.submitterRole),
    dealStatus: ownerSubmitted ? 'owner_submitted' : state.situation.includes('Contract') ? 'wholesale' : 'unknown',
  };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="px-lab-label">{children}</span>;
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  error,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  error?: string;
  hint?: string;
}) {
  const id = React.useId();
  const messageId = `${id}-message`;
  return (
    <label className="px-lab-field">
      <FieldLabel>{label}</FieldLabel>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? messageId : undefined}
      />
      {(error || hint) && <small id={messageId} className={error ? 'is-error' : ''}>{error || hint}</small>}
    </label>
  );
}

function SelectField({ label, value, onChange, options, hint }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  hint?: string;
}) {
  const id = React.useId();
  return (
    <label className="px-lab-field">
      <FieldLabel>{label}</FieldLabel>
      <select value={value} onChange={(event) => onChange(event.target.value)} aria-describedby={hint ? id : undefined}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
      {hint && <small id={id}>{hint}</small>}
    </label>
  );
}

function StepHeading({ title, copy }: { title: string; copy: string }) {
  return (
    <header className="px-lab-step-heading">
      <h2>{title}</h2>
      <p>{copy}</p>
    </header>
  );
}

function buildHandoff(state: LabState, snapshot: StrategySnapshot) {
  const top = snapshot.lanes[0];
  return {
    address: state.address,
    propertyType: state.propertyType,
    occupancy: state.occupancy,
    condition: state.condition,
    situation: state.situation,
    askingPrice: parseNumber(state.acquisition),
    rehabBudget: parseNumber(state.scope),
    arvEstimate: parseNumber(state.arv),
    marketRent: parseNumber(state.marketRent),
    topLaneLabel: top ? laneDisplayName(top) : undefined,
    topLaneVerdict: top?.verdictLabel,
    primaryMetric: top ? `${top.economics.primaryMetric}: ${top.economics.primaryValue}` : undefined,
    memoNextStep: snapshot.memo.nextStep,
    engineVersion: snapshot.engineVersion,
    generatedAt: snapshot.generatedAt,
  };
}

export function PremiumStrategyLab({ go, openPeggy }: { go: Nav; openPeggy: () => void }) {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = React.useMemo(() => new URLSearchParams(search), [search]);
  const calculatorsRequested = params.get('tool') === 'calculators';
  const requestedTab = params.get('tab') as CalcTabKey | null;
  const initialInstrument = requestedTab && CALCULATOR_TABS.includes(requestedTab) ? requestedTab : 'arv';
  const [step, setStep] = React.useState<LabStep>(calculatorsRequested ? 'basis' : 'property');
  const [state, setState] = React.useState<LabState>(INITIAL);
  const [savedNote, setSavedNote] = React.useState('');
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [instrumentsOpen, setInstrumentsOpen] = React.useState(calculatorsRequested);
  const [instrument, setInstrument] = React.useState<CalcTabKey>(initialInstrument);
  const workspaceHeading = React.useRef<HTMLHeadingElement>(null);
  const workspaceRef = React.useRef<HTMLElement>(null);
  const instrumentsRef = React.useRef<HTMLElement>(null);
  const instrumentOpenSource = React.useRef<'deeplink' | 'user'>(calculatorsRequested ? 'deeplink' : 'user');
  const focusAfterStepChange = React.useRef(false);
  const peggy = useOptionalPeggyContext();

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem('pegasus.strategy-lab.v2');
      if (!stored) return;
      const restored = restoreDraft(stored);
      if (!restored) return;
      setState(restored);
      setSavedNote('Your private browser draft was restored.');
    } catch {
      // Storage can be unavailable in private or hardened browsing contexts.
    }
  }, []);

  React.useEffect(() => {
    if (!focusAfterStepChange.current) return;
    focusAfterStepChange.current = false;
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    workspaceRef.current?.scrollIntoView?.({
      block: 'start',
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
    window.requestAnimationFrame(() => workspaceHeading.current?.focus({ preventScroll: true }));
  }, [step]);

  React.useEffect(() => {
    if (!calculatorsRequested) return;
    if (!instrumentsOpen) instrumentOpenSource.current = 'deeplink';
    setInstrumentsOpen(true);
  }, [calculatorsRequested, instrumentsOpen]);

  React.useEffect(() => {
    if (!instrumentsOpen) return;
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const behavior = instrumentOpenSource.current === 'deeplink' || prefersReducedMotion ? 'auto' : 'smooth';
    const frame = window.requestAnimationFrame(() => {
      instrumentsRef.current?.scrollIntoView?.({ block: 'start', behavior });
      instrumentsRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [calculatorsRequested, instrumentsOpen]);

  const set = <K extends keyof LabState>(key: K, value: LabState[K]) => {
    setConfirmReset(false);
    setState((current) => ({ ...current, [key]: value }));
  };

  const errors = React.useMemo(() => ({
    acquisition: numericError('acquisition', state.acquisition),
    scope: numericError('scope', state.scope),
    arv: numericError('arv', state.arv),
    marketRent: numericError('marketRent', state.marketRent),
    loanLtv: numericError('loanLtv', state.loanLtv),
    loanRate: numericError('loanRate', state.loanRate),
    vacancy: numericError('vacancy', state.vacancy),
  }), [state.acquisition, state.scope, state.arv, state.marketRent, state.loanLtv, state.loanRate, state.vacancy]);

  const hasNumericErrors = Object.values(errors).some(Boolean);
  const property = React.useMemo(() => propertyFrom(state), [state]);
  const snapshot = React.useMemo(() => runStrategyLab(property, {
    loanLtvPct: boundedNumericValue('loanLtv', state.loanLtv) ?? 75,
    loanRatePct: boundedNumericValue('loanRate', state.loanRate) ?? 7.5,
    vacancyPctBase: boundedNumericValue('vacancy', state.vacancy) ?? 8,
  }), [property, state.loanLtv, state.loanRate, state.vacancy]);

  const acquisition = property.purchasePrice ?? 0;
  const scope = property.rehabBudget ?? 0;
  const arv = property.arvEstimate ?? 0;
  const marketRent = property.marketRent ?? 0;
  const hasDecisionBasis = acquisition > 0 && (arv > 0 || marketRent > 0) && !hasNumericErrors;
  const topLanes = hasDecisionBasis ? snapshot.lanes.slice(0, 3) : [];
  const topLane = topLanes[0];

  const openQuestions = React.useMemo(() => {
    const questions = [
      !state.address.trim() ? 'Confirm the property location.' : '',
      acquisition <= 0 ? 'Confirm acquisition price or current basis.' : '',
      arv <= 0 && marketRent <= 0 ? 'Add an exit value or market-rent assumption.' : '',
      scope <= 0 ? 'Confirm whether the property truly requires no improvement budget.' : '',
      ...(hasDecisionBasis ? topLanes.flatMap((lane) => lane.confidence.missingInputs.slice(0, 2)) : []),
      ...(hasDecisionBasis
        ? snapshot.risks.filter((risk) => ['blocker', 'high', 'watch'].includes(risk.severity)).map((risk) => risk.title)
        : []),
    ].filter(Boolean);
    return Array.from(new Set(questions)).slice(0, 6);
  }, [state.address, acquisition, arv, marketRent, scope, hasDecisionBasis, topLanes, snapshot.risks]);

  const readiness = hasDecisionBasis
    ? topLane?.verdict === 'needs_more_data' ? 'Core basis entered · evidence still required' : 'Directional paths are ready to compare'
    : acquisition > 0 ? 'Add exit evidence to complete the read' : 'Start with the property and basis';

  const currentIndex = STEPS.findIndex((item) => item.key === step);
  const moveToStep = (next: LabStep) => {
    if (next === step) return;
    focusAfterStepChange.current = true;
    setStep(next);
    setConfirmReset(false);
  };
  const nextStep = () => moveToStep(STEPS[Math.min(currentIndex + 1, STEPS.length - 1)].key);
  const previousStep = () => moveToStep(STEPS[Math.max(currentIndex - 1, 0)].key);

  const saveDraft = () => {
    try {
      const envelope: DraftEnvelope = { schemaVersion: 3, savedAt: new Date().toISOString(), state };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
      setSavedNote('Decision brief saved in this browser.');
    } catch {
      setSavedNote('This browser blocked local saving. Your current desk remains open.');
    }
  };

  const resetDraft = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setSavedNote('Select “Confirm clear” to remove this browser draft.');
      return;
    }
    setState(INITIAL);
    moveToStep('property');
    setConfirmReset(false);
    setSavedNote('Desk cleared.');
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem('pegasus.strategy-lab.v2');
    } catch {
      // The visible state is still safely reset if storage is unavailable.
    }
  };

  const discussWithPeggy = () => {
    if (!hasDecisionBasis) {
      setSavedNote('Add a valid basis and exit assumption before asking Peggy about a decision brief.');
      moveToStep('basis');
      return;
    }
    peggy?.updateContext({
      page: 'strategy-lab',
      labMode: 'explain',
      labAnalysis: {
        address: property.address ?? null,
        topLane: topLane?.lane ?? null,
        topLaneLabel: topLane?.laneLabel ?? null,
        topLaneVerdict: topLane?.verdictLabel ?? null,
        confidenceScore: topLane?.confidence.score ?? null,
        memoParagraph: snapshot.memo.paragraph,
        memoNextStep: snapshot.memo.nextStep,
        laneSummary: topLanes.map((lane) => ({
          lane: lane.lane,
          label: lane.laneLabel,
          verdict: lane.verdictLabel,
          headline: lane.headline,
        })),
        primaryMetric: topLane ? {
          label: topLane.economics.primaryMetric,
          value: topLane.economics.primaryValue,
        } : null,
        risks: snapshot.risks.slice(0, 5).map((risk) => ({
          severity: risk.severity,
          title: risk.title,
          detail: risk.detail,
        })),
        inputs: {
          askingPrice: acquisition,
          rehabBudget: scope,
          arvEstimate: arv,
          marketRent,
          condition: property.condition,
          occupancyStatus: property.occupancyStatus,
        },
      },
    });
    peggy?.setPendingPrompt(`Explain this Strategy Lab read for ${property.address || 'the property'}, including the leading path, sensitive assumptions, and what Pegasus would need to verify.`);
    openPeggy();
  };

  const carryToIntake = () => {
    if (!hasDecisionBasis) {
      setSavedNote('Add a valid basis and exit assumption before carrying a brief into intake.');
      moveToStep('basis');
      return;
    }
    writeStrategyLabHandoff(buildHandoff(state, snapshot));
    setLocation('/bring-an-opportunity?intent=property&ref=strategy-lab');
  };

  const chooseInstrument = (key: CalcTabKey) => {
    setInstrument(key);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tool', 'calculators');
      if (key === 'arv') url.searchParams.delete('tab');
      else url.searchParams.set('tab', key);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const openInstruments = () => {
    instrumentOpenSource.current = 'user';
    setInstrumentsOpen(true);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tool', 'calculators');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const closeInstruments = () => {
    setInstrumentsOpen(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('tool');
      url.searchParams.delete('tab');
      window.history.replaceState({}, '', url.toString());
    }
  };

  return (
    <div className="px-lab" data-testid="premium-strategy-lab">
      <section className="px-lab-masthead">
        <img src={IMG('pegasus-architecture.png')} alt="Architectural model and planning instruments on a Pegasus worktable" />
        <div className="px-lab-masthead-scrim" aria-hidden="true" />
        <div className="px-lab-masthead-inner">
          <div className="px-lab-masthead-copy">
            <p className="px-kicker">Pegasus Strategy Lab · Private working desk</p>
            <h1>Turn one property into a decision you can defend.</h1>
            <p>Build the facts once, compare nine executable paths through the Pegasus underwriting engine, and carry the same brief into Peggy or a written Property Read.</p>
          </div>
          <div className="px-lab-masthead-entry">
            <span><ShieldCheck aria-hidden="true" /> Directional, not an offer</span>
            <button type="button" onClick={openInstruments}>Open calculators <SlidersHorizontal aria-hidden="true" /></button>
          </div>
        </div>
      </section>

      <section ref={workspaceRef} className="px-lab-workspace" aria-labelledby="lab-workspace-title" data-testid="strategy-lab-workspace">
        <div className="px-lab-progress" aria-label="Strategy Lab steps">
          {STEPS.map((item, index) => (
            <button
              key={item.key}
              type="button"
              onClick={() => moveToStep(item.key)}
              aria-current={step === item.key ? 'step' : undefined}
              className={step === item.key ? 'is-current' : index < currentIndex ? 'is-complete' : ''}
            >
              <span>{item.num}</span>
              <strong>{item.label}</strong>
              <small>{item.hint}</small>
              {index < currentIndex && <Check aria-hidden="true" />}
            </button>
          ))}
        </div>

        <div className="px-lab-grid">
          <article className="px-lab-desk">
            <h2 id="lab-workspace-title" ref={workspaceHeading} tabIndex={-1} className="sr-only">Strategy Lab {STEPS[currentIndex].label} step</h2>

            {step === 'property' && (
              <div className="px-lab-step">
                <StepHeading title="Start with the situation, not a score." copy="These facts shape the underwriting memo, risk register, and which paths remain credible. The address stays in this browser unless you choose to carry the brief forward." />
                <div className="px-lab-form-grid">
                  <div className="px-lab-wide"><TextField label="Property address or city" value={state.address} onChange={(value) => set('address', value)} placeholder="East Bay property or city" /></div>
                  <SelectField label="Property type" value={state.propertyType} onChange={(value) => set('propertyType', value)} options={PROPERTY_TYPES} />
                  <SelectField label="Your position" value={state.submitterRole} onChange={(value) => set('submitterRole', value)} options={ROLES} hint="Changes how the written decision memo is framed." />
                  <SelectField label="Situation" value={state.situation} onChange={(value) => set('situation', value)} options={SITUATIONS} />
                  <SelectField label="Condition" value={state.condition} onChange={(value) => set('condition', value)} options={CONDITIONS} />
                  <SelectField label="Occupancy" value={state.occupancy} onChange={(value) => set('occupancy', value)} options={OCCUPANCIES} />
                  <SelectField label="Timing" value={state.timing} onChange={(value) => set('timing', value)} options={TIMINGS} />
                </div>
              </div>
            )}

            {step === 'basis' && (
              <div className="px-lab-step">
                <StepHeading title="Make every material assumption visible." copy="The engine uses the entered basis, condition, occupancy, financing, rent, and exit evidence. Empty inputs remain empty; the desk does not quietly invent property facts." />
                <div className="px-lab-form-grid">
                  <TextField label="Acquisition or current basis" value={state.acquisition} onChange={(value) => set('acquisition', value)} placeholder="$600,000" inputMode="decimal" error={errors.acquisition} />
                  <TextField label="Scope / improvement budget" value={state.scope} onChange={(value) => set('scope', value)} placeholder="$105,000" inputMode="decimal" error={errors.scope} />
                  <TextField label="Projected exit value" value={state.arv} onChange={(value) => set('arv', value)} placeholder="$840,000" inputMode="decimal" error={errors.arv} hint="Visitor-entered until supported by market evidence." />
                  <TextField label="Projected monthly market rent" value={state.marketRent} onChange={(value) => set('marketRent', value)} placeholder="$4,500" inputMode="decimal" error={errors.marketRent} hint="Optional, but required for hold-path economics." />
                </div>
                <details className="px-lab-assumptions">
                  <summary>Financing and operating assumptions <ChevronDown aria-hidden="true" /></summary>
                  <div className="px-lab-form-grid">
                    <TextField label="Modeled loan-to-value (%)" value={state.loanLtv} onChange={(value) => set('loanLtv', value)} inputMode="decimal" error={errors.loanLtv} />
                    <TextField label="Modeled loan rate (%)" value={state.loanRate} onChange={(value) => set('loanRate', value)} inputMode="decimal" error={errors.loanRate} />
                    <TextField label="Base vacancy (%)" value={state.vacancy} onChange={(value) => set('vacancy', value)} inputMode="decimal" error={errors.vacancy} />
                    <div className="px-lab-assumption-note">
                      <ShieldCheck aria-hidden="true" />
                      <p>
                        Planning defaults: 30-year amortization, 3% closing reserve, 8% of
                        collected rent for management, 8% for repairs, 5% for capital
                        reserves, 1.1% annual property tax, and $150 monthly insurance.
                        These are not financing terms, quotes, or property-specific facts.
                      </p>
                    </div>
                    <div className="px-lab-assumption-note">
                      <Gauge aria-hidden="true" />
                      <p>
                        Stress behavior: the stressed case reduces rent 5%, adds 2 points
                        of vacancy, raises repairs to 10%, and increases tax and insurance
                        10%. The downside case reduces rent 15%, adds 4 vacancy points,
                        raises repairs to 12% and capital reserves to 6%, and increases tax
                        and insurance 20%.
                      </p>
                    </div>
                  </div>
                </details>
                <div className="px-lab-ledger">
                  <div><span>Purchase assumption</span><strong>{!errors.acquisition && acquisition ? money(acquisition) : '—'}</strong><small>Visitor-entered</small></div>
                  <div><span>Improvement scope</span><strong>{!errors.scope && scope ? money(scope) : '—'}</strong><small>Visitor-entered</small></div>
                  <div><span>Modeled cash in</span><strong>{!hasNumericErrors && acquisition ? money(snapshot.totalCashIn) : '—'}</strong><small>Down payment + scope + reserve</small></div>
                  <div className="is-total"><span>Exit evidence</span><strong>{!errors.arv && arv ? money(arv) : !errors.marketRent && marketRent ? `${money(marketRent)}/mo` : 'Missing'}</strong><small>ARV or market rent</small></div>
                </div>
                <p className="sr-only" role="status">Basis assumptions updated. Modeled cash in is {!hasNumericErrors && acquisition ? money(snapshot.totalCashIn) : 'not available'}.</p>
              </div>
            )}

            {step === 'strategy' && (
              <div className="px-lab-step">
                <StepHeading title="Read the leading paths—and their weak points." copy="The engine ranks nine Pegasus paths from the same facts. No bare score is shown: the evidence, sensitivity, and missing inputs remain attached to each conclusion." />
                <div className="px-lab-form-grid px-lab-objective">
                  <div className="px-lab-wide"><SelectField label="Decision lens" value={state.objective} onChange={(value) => set('objective', value)} options={OBJECTIVES} hint="Used to frame the brief; it does not alter the underwriting math." /></div>
                </div>
                {!hasDecisionBasis ? (
                  <section className="px-lab-needs-inputs" role="status" aria-label="More inputs required">
                    <CircleAlert aria-hidden="true" />
                    <div>
                      <p className="px-lab-label">Decision brief not generated</p>
                      <h3>Add a valid basis and exit assumption.</h3>
                      <p>
                        Enter an acquisition or current basis plus either projected exit
                        value or monthly market rent. Resolve every numeric field marked
                        with an error before the Lab compares paths.
                      </p>
                      <button type="button" onClick={() => moveToStep('basis')}>
                        Complete the basis ledger <ArrowRight aria-hidden="true" />
                      </button>
                    </div>
                  </section>
                ) : (
                  <div className="px-lab-scenarios">
                    {topLanes.map((lane, index) => (
                      <details key={lane.lane} className={index === 0 ? 'is-leading' : ''} open={index === 0}>
                        <summary>
                          <span>{String(index + 1).padStart(2, '0')}</span>
                          <div><h3>{laneDisplayName(lane)}</h3><p>{lane.headline}</p></div>
                          <strong>{lane.verdictLabel}</strong>
                          <ChevronDown aria-hidden="true" />
                        </summary>
                        <div className="px-lab-scenario-evidence">
                          <div><span>{lane.economics.primaryMetric}</span><strong>{lane.economics.primaryValue}</strong></div>
                          <ul>
                            {lane.confidence.supportingFactors.slice(0, 2).map((factor) => <li key={factor}><Check aria-hidden="true" />{factor}</li>)}
                            {lane.confidence.sensitiveFactors.slice(0, 2).map((factor) => <li key={factor}><CircleAlert aria-hidden="true" />{factor}</li>)}
                            {lane.confidence.missingInputs.slice(0, 2).map((factor) => <li key={factor}><CircleAlert aria-hidden="true" />Needs: {factor}</li>)}
                          </ul>
                        </div>
                      </details>
                    ))}
                    <details className="px-lab-all-paths">
                      <summary>
                        <span>Complete comparison</span>
                        <strong>View all nine paths</strong>
                        <small>6 additional routes</small>
                        <ChevronDown aria-hidden="true" />
                      </summary>
                      <ol>
                        {snapshot.lanes.slice(3).map((lane, index) => (
                          <li key={lane.lane}>
                            <span>{String(index + 4).padStart(2, '0')}</span>
                            <div><strong>{laneDisplayName(lane)}</strong><small>{lane.headline}</small></div>
                            <em>{lane.verdictLabel}</em>
                          </li>
                        ))}
                      </ol>
                    </details>
                  </div>
                )}
              </div>
            )}

            {step === 'review' && (
              <div className="px-lab-step">
                <StepHeading title="A concise brief, with uncertainty left visible." copy="This record is generated from the same versioned engine used for the path comparison. It is planning material—not a valuation, approval, or recommendation." />
                {!hasDecisionBasis ? (
                  <section className="px-lab-needs-inputs" role="status" aria-label="Decision brief unavailable">
                    <CircleAlert aria-hidden="true" />
                    <div>
                      <p className="px-lab-label">Decision record held</p>
                      <h3>The Lab needs valid inputs before it can write a conclusion.</h3>
                      <p>
                        Add a positive acquisition or current basis and either an exit
                        value or market rent. Correct every numeric error before any path,
                        memo, stress case, Peggy handoff, or intake brief is generated.
                      </p>
                      <button type="button" onClick={() => moveToStep('basis')}>
                        Return to the basis ledger <ArrowRight aria-hidden="true" />
                      </button>
                    </div>
                  </section>
                ) : (
                  <>
                    <section className="px-lab-decision-record" aria-label="Decision brief">
                  <div>
                    <span>Recommendation</span>
                    <strong>{laneDisplayName(topLane)}</strong>
                    <small>{topLane?.verdictLabel ?? 'Needs more data'}</small>
                  </div>
                  <div>
                    <span>Evidence</span>
                    <strong>{topLane?.economics.primaryValue ?? 'Basis incomplete'}</strong>
                    <small>{topLane?.economics.primaryMetric ?? 'Add basis and exit evidence'}</small>
                  </div>
                  <div>
                    <span>Unresolved risk</span>
                    <strong>{openQuestions[0] ?? 'No core input gap identified'}</strong>
                    <small>{openQuestions.length > 1 ? `${openQuestions.length - 1} additional questions remain` : 'Pegasus diligence still applies'}</small>
                  </div>
                  <div>
                    <span>Next action</span>
                    <strong>{snapshot.memo.nextStep}</strong>
                    <small>Pegasus review before execution</small>
                  </div>
                </section>
                <details className="px-lab-method-note">
                  <summary>Read the full engine rationale <ChevronDown aria-hidden="true" /></summary>
                  <p>{snapshot.memo.paragraph}</p>
                </details>
                <div className="px-lab-review-grid">
                  <section>
                    <p className="px-lab-label">Leading path record</p>
                    <dl>
                      <div><dt>Current leading path</dt><dd>{laneDisplayName(topLane)}</dd></div>
                      <div><dt>Engine verdict</dt><dd>{topLane?.verdictLabel ?? 'Needs more data'}</dd></div>
                      <div><dt>{topLane?.economics.primaryMetric ?? 'Primary metric'}</dt><dd>{topLane?.economics.primaryValue ?? '—'}</dd></div>
                      <div><dt>Modeled cash in</dt><dd>{acquisition ? money(snapshot.totalCashIn) : 'Needs basis'}</dd></div>
                    </dl>
                  </section>
                  <section>
                    <p className="px-lab-label">Open questions</p>
                    {openQuestions.length ? <ul>{openQuestions.map((risk) => <li key={risk}><CircleAlert aria-hidden="true" />{risk}</li>)}</ul> : <p className="px-lab-complete"><Check aria-hidden="true" /> Core desk inputs are present. Pegasus diligence still applies.</p>}
                  </section>
                </div>
                {marketRent > 0 && (
                  <div className="px-lab-stress-table">
                    <header><Gauge aria-hidden="true" /><div><span>Rental stress read</span><strong>Base, stressed, and downside cases</strong></div></header>
                    <dl>
                      {(['base', 'stressed', 'worst'] as const).map((scenario) => (
                        <div key={scenario}>
                          <dt>{scenario === 'base' ? 'Base' : scenario === 'stressed' ? 'Stressed' : 'Downside'}</dt>
                          <dd>{money(snapshot.scenarios[scenario].annualCashFlow)} / year</dd>
                          <dd className="px-lab-stress-meta">DSCR {snapshot.scenarios[scenario].dscr.toFixed(2)}×</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
                <div className="px-lab-review-actions">
                  <button type="button" onClick={saveDraft}><Save aria-hidden="true" /> Save in this browser</button>
                  <button type="button" onClick={discussWithPeggy}><MessageCircle aria-hidden="true" /> Ask Peggy about this brief</button>
                  <button type="button" className="is-primary" onClick={carryToIntake}>
                    Request a written Property Read <ArrowRight aria-hidden="true" />
                  </button>
                </div>
                  </>
                )}
              </div>
            )}

            <footer className="px-lab-step-footer">
              <button type="button" onClick={previousStep} disabled={currentIndex === 0}>Previous</button>
              <p role="status">{savedNote}</p>
              {currentIndex < STEPS.length - 1 ? (
                <button type="button" className="is-next" onClick={nextStep}>Continue <ChevronRight aria-hidden="true" /></button>
              ) : (
                <button type="button" className={confirmReset ? 'is-confirm' : ''} onClick={resetDraft}><RotateCcw aria-hidden="true" /> {confirmReset ? 'Confirm clear' : 'Clear desk'}</button>
              )}
            </footer>
          </article>

          <aside className="px-lab-brief" aria-label="Live decision brief">
            <div className="px-lab-brief-head">
              <span>Live decision brief</span>
              <strong>{readiness}</strong>
            </div>
            <div className="px-lab-brief-property">
              <Building2 aria-hidden="true" />
              <div><strong>{state.address || 'Property not entered'}</strong><span>{state.propertyType} · {state.condition}</span></div>
            </div>
            <dl>
              <div><dt>Leading path</dt><dd>{hasDecisionBasis ? laneDisplayName(topLane) : 'Awaiting basis'}</dd></div>
              <div><dt>Verdict</dt><dd>{hasDecisionBasis ? topLane?.verdictLabel : 'Needs inputs'}</dd></div>
              <div><dt>Cash-in model</dt><dd>{hasDecisionBasis ? money(snapshot.totalCashIn) : '—'}</dd></div>
              <div><dt>Open questions</dt><dd>{openQuestions.length}</dd></div>
              <div><dt>Decision lens</dt><dd>{state.objective}</dd></div>
            </dl>
            <div className="px-lab-brief-rule" />
            <p>One record follows the property from first read to Peggy and the intake desk. Pegasus still verifies market support, title, occupancy, condition, capital, and written terms.</p>
            <button type="button" onClick={carryToIntake} disabled={!hasDecisionBasis}>Carry this brief into intake <ArrowRight aria-hidden="true" /></button>
          </aside>
        </div>
      </section>

      {instrumentsOpen && (
        <section
          className="px-lab-instruments"
          ref={instrumentsRef}
          aria-label="Decision calculators"
          tabIndex={-1}
        >
          <header>
            <div><p className="px-kicker">Decision calculators</p><h2>Open the worksheet your decision requires.</h2></div>
            <button type="button" onClick={closeInstruments}>Close calculators</button>
          </header>
          <div className="px-lab-instrument-detail">
            <React.Suspense fallback={<p role="status">Preparing the worksheet…</p>}>
              <CalculatorToolsPanel activeTab={instrument} setActiveTab={chooseInstrument} publicMode />
            </React.Suspense>
          </div>
        </section>
      )}

      <section className="px-lab-boundary" data-testid="text-strategy-disclaimer">
        <Hammer aria-hidden="true" />
        <div><p className="px-kicker">The operating boundary</p><h2>The Lab organizes a decision. It does not replace diligence.</h2></div>
        <p>Strategy Lab outputs are preliminary and directional. They are not legal, tax, lending, accounting, appraisal, engineering, securities, or construction advice. All outputs are subject to a written Pegasus read, market conditions, property condition, title, occupancy, and written agreements.</p>
      </section>
    </div>
  );
}
