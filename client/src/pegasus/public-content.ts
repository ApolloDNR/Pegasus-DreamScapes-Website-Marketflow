// Shared public labels and destinations. Blueprint v1.1, September 14, 2026.
export const PUBLIC_ACTIONS = {
  opportunity: { label: 'Bring an Opportunity', href: '/bring-an-opportunity' },
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
  { label: 'I own a property', note: 'Explore the next step for a property you own.', href: '/property-owners' },
  { label: 'I’m buying or selling', note: 'Work with Apollo on representation.', href: '/work-with-apollo' },
  { label: 'I have a deal or partnership', note: 'Bring an opportunity, project, or specialty.', href: '/deal-partners' },
] as const;
export const PUBLIC_CONTACT = {
  name: 'Apollo Duran', email: 'apollo@pegasusdreamscapes.com', phone: '925-744-8525', telephone: 'tel:9257448525',
} as const;
export const REPRESENTATION_NOTICE = 'Licensed representation may be available only through a separate written brokerage agreement. CA DRE #02333658 is listed under Duran Ramirez, Paolo Ariel; responsible broker: BMP Realty Inc DBA Keller Williams Realty-East Bay. Verify current status.';
export const SUBMISSION_NOTICE = 'Submission does not create representation, confidentiality, source protection, partnership, review, or a duty to respond.';
