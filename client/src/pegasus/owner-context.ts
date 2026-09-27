/** Explicit public choices, not evidence about the property. */
export const OWNER_SITUATIONS = [
  'Significant repairs', 'Vacant property', 'Inherited property', 'Unfinished construction',
  'Tenant or occupancy issues', 'Code or permit concerns', 'Time-sensitive sale',
  'ADU or development potential', 'A listing that is not working',
] as const;

const INTAKE_SITUATIONS: Record<string, string> = {
  'Significant repairs': 'Major repairs', 'Vacant property': 'Vacant',
  'Inherited property': 'Inherited / probate', 'Unfinished construction': 'Unfinished project',
  'Tenant or occupancy issues': 'Tenant issue', 'Code or permit concerns': 'Other',
  'Time-sensitive sale': 'Other', 'ADU or development potential': 'Other',
  'A listing that is not working': 'Other',
};

export function normalizeOwnerSituation(raw: string | null): { situation: string; sourceLabel: string } {
  const label = (raw ?? '').slice(0, 160);
  const situation = Object.hasOwn(INTAKE_SITUATIONS, label) ? INTAKE_SITUATIONS[label] : '';
  return { situation, sourceLabel: situation ? label : '' };
}

export function ownerLabSituation(label: string): string {
  if (label === 'Inherited property') return 'Inherited or estate property';
  if (label === 'Time-sensitive sale') return 'Distressed or time-sensitive';
  if (label === 'ADU or development potential') return 'Development or ADU potential';
  return 'Owner needs options';
}
