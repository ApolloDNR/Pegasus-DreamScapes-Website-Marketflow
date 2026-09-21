export const VIEWS = ['overview', 'assumptions', 'scenarios', 'risk', 'memo'] as const;
export type DeskView = typeof VIEWS[number];
export const SCENARIOS = ['base', 'conservative', 'upside'] as const;
export type ScenarioId = typeof SCENARIOS[number];
export const SCENARIO_NAMES: Record<ScenarioId, string> = { base: 'Base', conservative: 'Conservative', upside: 'Upside' };
export const STORAGE_KEY = 'pegasus.strategy-lab.v4';

export const OPTIONS = {
  propertyType: ['Single-family residence', 'Condo or townhome', '2–4 units', 'Small multifamily', 'Land or development site', 'Commercial or mixed-use'],
  situation: ['Value-add opportunity', 'Owner needs options', 'Inherited or estate property', 'Distressed or time-sensitive', 'Contract or sourced opportunity', 'Development or ADU potential'],
  occupancy: ['Unknown or needs review', 'Vacant', 'Owner occupied', 'Tenant occupied'],
  condition: ['Unknown or needs review', 'Turnkey', 'Light updates', 'Moderate renovation', 'Heavy renovation', 'Full reconstruction'],
  submitterRole: ['Exploring a property', 'Property owner', 'Deal partner or wholesaler', 'Investor or buyer', 'Agent or advisor', 'Capital partner'],
  objective: ['Compare the strongest modeled path', 'Explore net-value sensitivity', 'Prioritize certainty and timing', 'Preserve control or optionality', 'Explore capital or operating assumptions'],
  timing: ['Flexible', 'Within 90 days', 'Within 30 days', 'Time-sensitive'],
  titleStatus: ['Unreported', 'Concern reported', 'No known concern reported'],
  permitStatus: ['Unreported', 'Concern reported', 'No known concern reported'],
  financingStatus: ['Unreported', 'Not committed', 'Commitment reported'],
} as const;

export const DEFAULTS = {
  loanLtv: '75', loanRate: '7.5', loanTerm: '30', vacancy: '8', management: '8', closingReserve: '3',
  taxRate: '1.1', insurance: '150', hoa: '0',
} as const;
export const INITIAL_DRAFT = {
  address: '', city: '', propertyType: OPTIONS.propertyType[0] as string, situation: OPTIONS.situation[0] as string,
  occupancy: OPTIONS.occupancy[0] as string, condition: OPTIONS.condition[0] as string, submitterRole: OPTIONS.submitterRole[0] as string,
  acquisition: '', scope: '', arv: '', marketRent: '', sqft: '', beds: '', baths: '',
  ...Object.fromEntries(Object.entries(DEFAULTS).map(([key, value]) => [key, value])) as Record<keyof typeof DEFAULTS, string>,
  objective: OPTIONS.objective[0] as string, timing: OPTIONS.timing[0] as string,
  titleStatus: 'Unreported', permitStatus: 'Unreported', financingStatus: 'Unreported',
  illustrative: false, entered: [] as string[],
};
export type Draft = typeof INITIAL_DRAFT;
export type DraftField = Exclude<keyof Draft, 'illustrative' | 'entered'>;
export const NUMERIC_FIELDS = ['acquisition', 'scope', 'arv', 'marketRent', 'loanLtv', 'loanRate', 'loanTerm', 'vacancy', 'management', 'closingReserve', 'taxRate', 'insurance', 'hoa', 'sqft', 'beds', 'baths'] as const satisfies readonly DraftField[];
export type NumericField = typeof NUMERIC_FIELDS[number];
export type ScenarioPatch = Partial<Pick<Draft, NumericField>>;
export type PlanPhase = { id: string; label: string; months: string; after: string };
export type Workspace = {
  base: Draft;
  variants: Record<'conservative' | 'upside', ScenarioPatch>;
  activeScenario: ScenarioId;
  diligence: string[];
  phases: PlanPhase[];
};

export function emptyWorkspace(): Workspace {
  return {
    base: { ...INITIAL_DRAFT, entered: [] }, variants: { conservative: {}, upside: {} }, activeScenario: 'base', diligence: [],
    phases: [
      { id: 'diligence', label: 'Due diligence', months: '', after: '' },
      { id: 'permit', label: 'Design / permit', months: '', after: 'diligence' },
      { id: 'build', label: 'Construction', months: '', after: 'permit' },
      { id: 'stabilize', label: 'Stabilization', months: '', after: 'build' },
      { id: 'exit', label: 'Exit / refinance', months: '', after: 'stabilize' },
    ],
  };
}

export function illustrativeDraft(): Draft {
  return { ...INITIAL_DRAFT, address: 'Illustrative example', condition: 'Moderate renovation', acquisition: '600000', scope: '105000', arv: '840000', marketRent: '4500', illustrative: true, entered: [] };
}

export function fieldOrigin(draft: Draft, key: DraftField): string {
  if (!draft[key].trim() && Object.hasOwn(DEFAULTS, key)) return `Model default used: ${DEFAULTS[key as keyof typeof DEFAULTS]}`;
  if (draft.entered.includes(key)) return 'Visitor entered';
  if (!draft[key].trim() || draft[key] === 'Unreported' || draft[key] === 'Unknown or needs review') return 'Not reported';
  if (draft.illustrative && !Object.hasOwn(DEFAULTS, key)) return 'Illustrative input';
  return Object.hasOwn(DEFAULTS, key) ? 'Model default' : 'Visitor entered';
}

function record(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function normalizedDraft(source: Record<string, unknown>): Draft {
  const result = { ...INITIAL_DRAFT, entered: [] as string[] };
  for (const key of Object.keys(INITIAL_DRAFT) as Array<keyof Draft>) {
    if (key === 'entered' || key === 'illustrative') continue;
    if (typeof source[key] !== 'string') continue;
    const value = source[key].slice(0, 180);
    const options: readonly string[] | undefined = OPTIONS[key as keyof typeof OPTIONS];
    if (!options || options.includes(value)) result[key] = value;
  }
  result.illustrative = source.illustrative === true;
  result.entered = Array.isArray(source.entered)
    ? source.entered.filter((key): key is DraftField => typeof key === 'string' && Object.hasOwn(INITIAL_DRAFT, key) && !['entered', 'illustrative'].includes(key)).slice(0, 50)
    : (Object.keys(INITIAL_DRAFT) as DraftField[]).filter(key => typeof source[key] === 'string' && (!Object.hasOwn(DEFAULTS, key) || source[key] !== DEFAULTS[key as keyof typeof DEFAULTS]));
  return result;
}

export function restoreDraft(raw: string): Workspace | null {
  if (raw.length > 100000) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!record(value)) return null;
    if (value.schemaVersion !== undefined && ![2, 3, 4].includes(value.schemaVersion as number)) return null;
    const workspace = emptyWorkspace();
    if (value.schemaVersion === 4) {
      if (!record(value.workspace) || !record(value.workspace.base)) return null;
      const source = value.workspace;
      workspace.base = normalizedDraft(source.base as Record<string, unknown>);
      if (SCENARIOS.includes(source.activeScenario as ScenarioId)) workspace.activeScenario = source.activeScenario as ScenarioId;
      if (record(source.variants)) for (const id of ['conservative', 'upside'] as const) {
        const variant = source.variants[id];
        if (record(variant)) for (const key of NUMERIC_FIELDS) if (typeof variant[key] === 'string') workspace.variants[id][key] = variant[key].slice(0, 180);
      }
      if (Array.isArray(source.diligence)) workspace.diligence = source.diligence.filter((item): item is string => typeof item === 'string' && item.length < 80).slice(0, 20);
      if (Array.isArray(source.phases)) workspace.phases = workspace.phases.map(phase => {
        const found: unknown = (source.phases as unknown[]).find(item => record(item) && item.id === phase.id);
        return record(found) ? { ...phase, months: typeof found.months === 'string' ? found.months.slice(0, 20) : '', after: typeof found.after === 'string' && (found.after === '' || workspace.phases.some(item => item.id === found.after)) ? found.after : phase.after } : phase;
      });
    } else {
      const source = (value.schemaVersion === 2 || value.schemaVersion === 3) && record(value.state) ? value.state : value;
      if (!['address', 'acquisition', 'arv', 'marketRent', 'scope'].some(key => typeof source[key] === 'string')) return null;
      workspace.base = normalizedDraft(source);
    }
    return workspace;
  } catch { return null; }
}

export function serializeDraft(workspace: Workspace, now = new Date()): string {
  return JSON.stringify({ schemaVersion: 4, savedAt: now.toISOString(), workspace });
}
