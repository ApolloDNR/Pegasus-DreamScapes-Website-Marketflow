// Shared public labels and destinations. Blueprint v1.1, September 14, 2026.
export const PUBLIC_ACTIONS = {
  opportunity: { label: 'Start a conversation', href: '/bring-an-opportunity' },
  work: { label: 'See Our Work', href: '/our-work' },
  lab: { label: 'Open Strategy Lab', href: '/strategy-lab' },
  tools: { label: 'Explore Tools', href: '/tools' },
  contact: { label: 'Contact Apollo', href: '/contact' },
} as const;
export const REAL_ESTATE_LINKS = [
  { label: 'Property owners', href: '/property-owners' },
  { label: 'Buy or sell with Apollo', href: '/work-with-apollo' },
  { label: 'Deal partners', href: '/deal-partners' },
  { label: 'Project planning', href: '/development' },
  { label: 'How we operate', href: '/how-we-operate' },
] as const;
export const PRIMARY_LINKS = [
  { label: 'Our Work', href: '/our-work' },
  { label: 'Tools', href: '/tools' },
  { label: 'About', href: '/about' },
] as const;
export const HOME_PATHS = [
  { label: 'I own a property', note: 'Compare property options, the facts to gather, and what to discuss next.', href: '/property-owners' },
  { label: 'I’m buying or selling', note: 'Understand buyer and seller representation before asking Apollo about your plans.', href: '/work-with-apollo' },
  { label: 'I have a deal or partnership', note: 'Clarify your proposed role, what the deal needs, and the facts to bring.', href: '/deal-partners' },
] as const;
export const PUBLIC_CONTACT = {
  name: 'Apollo Duran', email: 'apollo@pegasusdreamscapes.com', phone: '925-744-8525', telephone: 'tel:9257448525',
} as const;
export const REPRESENTATION_IDENTITY = 'Paolo Ariel “Apollo” Duran Ramirez · California real estate salesperson · CA DRE #02333658. Responsible broker: BMP Realty Inc DBA Keller Williams Realty-East Bay.';
export const REPRESENTATION_NOTICE = `${REPRESENTATION_IDENTITY} Verify current status. Licensed representation may be available only through a separate written brokerage agreement.`;
export const SUBMISSION_NOTICE = 'Submission does not create representation, confidentiality, source protection, partnership, review, or a duty to respond.';

// Public section membership is separate from exact current-page semantics.
const PUBLIC_ROUTE_PARENTS: Record<string, string> = {
  '/buyers': '/work-with-apollo',
  '/capital': '/deal-partners',
  '/operators': '/deal-partners',
  '/referral': '/deal-partners',
  '/vendor-network': '/deal-partners',
  '/strategy-lab': '/tools',
  '/saved': '/tools',
  '/deal-blueprint': '/tools',
  '/calculators': '/tools',
  '/projects': '/our-work',
  '/case-study': '/our-work',
};

export function publicNavigationState(location: string, href: string) {
  const path = location.split(/[?#]/, 1)[0].replace(/\/$/, '') || '/';
  const current = path === href;
  const parent = Object.entries(PUBLIC_ROUTE_PARENTS).find(([root]) => path === root || path.startsWith(`${root}/`))?.[1];
  return { current, active: current || parent === href };
}
