import type React from 'react';

export type Route =
  | 'home'
  | 'sellers'
  | 'buyers'
  | 'dealfinders'
  | 'capital'
  | 'operators'
  | 'referral'
  | 'dealstrategy'
  | 'ourwork'
  | 'investments'
  | 'development'
  | 'strategylab'
  | 'marketflow'
  | 'apollo'
  | 'ecosystem'
  | 'about'
  | 'contact'
  | 'peggy'
  | 'saved'
  | 'submit'
  | 'connect';

export type AudienceKey = 'sellers' | 'buyers' | 'dealfinders' | 'capital' | 'operators' | 'referral';

export type Theme = 'light' | 'dark';
export type Nav = (r: Route) => void;

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export type PeggyHandoff = {
  role?: string;
  third?: string;
  message?: string;
  transcript: ChatTurn[];
};

// Public Website v1 (issue #22) PRD §5.1: the top navigation is a flat,
// clean list. Items either resolve through the prototype route map (`route`)
// or navigate straight to a standalone app URL (`url`).
export type NavLink = { label: string; route?: Route; url?: string; desc?: string };

export type Pillar = {
  eyebrow: string;
  tag?: string;
  title: React.ReactNode;
  lead: string;
  points: string[];
  img: string;
  imgAlt?: string;
  route: Route;
  cta: string;
};

export type Rich = 'path' | 'ladder' | 'surfaces' | 'engine' | 'faq' | 'buybox' | 'proof' | 'marketflow' | 'stats' | 'process';

export type FormCfg = {
  role: string;
  intent: string;
  heading: React.ReactNode;
  lead: string;
  submit: string;
  third: {
    label: string;
    placeholder: string;
    kind?: 'context' | 'property-address';
  } | null;
  thirdRequired?: boolean;
  messageLabel: string;
  messagePlaceholder: string;
  messageRequired?: boolean;
  roleOptions?: string[];
};

export type SplitPath = { name: string; desc: string; cta: string; route: Route };

export type FaqItem = { q: string; a: string };

export type Category = {
  eyebrow: string;
  title: React.ReactNode;
  image: string;
  lead: string;
  points: { t: string; d: string }[];
  rich: Rich[];
  quote: string;
  layout?: 'timeline' | 'grid' | 'ledger';
  pointsLabel?: string;
  forYou: string[];
  notFit: string[];
  splits?: { heading: string; copy: string; paths: SplitPath[]; founderPhoto?: boolean; peggyHint?: boolean };
  secondary?: { label: string; route: Route };
  faq?: FaqItem[];
  faqAnchor?: string;
  heroScrimTop?: boolean;
  form: FormCfg;
};
