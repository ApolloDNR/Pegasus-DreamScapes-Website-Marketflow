/** Public planning context only. These labels never authorize a role or service. */
export const PARTNER_NEED_LABELS = [
  'Seller access or negotiation',
  'Contract control',
  'Underwriting',
  'Buyer placement',
  'Capital planning',
  'Renovation execution',
  'Local operations',
  'Disposition or asset operations',
] as const;

export type PartnerNeed = (typeof PARTNER_NEED_LABELS)[number];

export function normalizePartnerNeed(raw: string | null): PartnerNeed | '' {
  if (!raw || raw.length > 160) return '';
  return PARTNER_NEED_LABELS.includes(raw as PartnerNeed) ? raw as PartnerNeed : '';
}
