import type React from 'react';

export type Route =
  | 'home'
  | 'sellers'
  | 'buyers'
  | 'dealfinders'
  | 'capital'
  | 'operators'
  | 'referral'
  | 'dealarchitecture'
  | 'investments'
  | 'development'
  | 'strategylab'
  | 'marketflow'
  | 'apollo'
  | 'ecosystem'
  | 'about'
  | 'contact'
  | 'peggy'
  | 'saved';

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

export type NavLink = { label: string; route: Route };
export type NavGroup = { label: string; items: NavLink[] };

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

export type Rich = 'path' | 'ladder' | 'surfaces' | 'engine' | 'faq' | 'buybox';

export type FormCfg = {
  role: string;
  intent: string;
  heading: React.ReactNode;
  lead: string;
  submit: string;
  third: { label: string; placeholder: string } | null;
  messageLabel: string;
  messagePlaceholder: string;
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
  forYou: string[];
  notFit: string[];
  splits?: { heading: string; copy: string; paths: SplitPath[]; founderPhoto?: boolean; peggyHint?: boolean };
  secondary?: { label: string; route: Route };
  faq?: FaqItem[];
  form: FormCfg;
};
