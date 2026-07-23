import React from 'react';
import type { NavLink, Pillar, Category, AudienceKey, SplitPath, FaqItem, Route } from './theme';

/* ================================================================
   NAVIGATION
   Master Blueprint v5.1 (§6, §31) locks the top navigation to the public
   relationship — How We Operate, Property Owners, Deal Partners, Our Work,
   About — with "Bring an Opportunity" as the primary nav button (rendered
   separately in nav.tsx, routing to the /bring-an-opportunity intake desk).
   Strategy Lab / Peggy are utility actions; MarketFlow stays out of the
   primary nav until its pilot gates are met (§18). Supersedes issue #22 §5.1.
   ================================================================ */
export const NAV_LINKS: NavLink[] = [
  { label: 'How We Operate', route: 'dealstrategy' },
  { label: 'Property Owners', route: 'sellers' },
  { label: 'Deal Partners', route: 'dealfinders' },
  { label: 'Our Work', route: 'ourwork' },
  { label: 'About', route: 'about' },
];

/* ================================================================
   CREDIBILITY STATS
   ================================================================ */
export const STATS: { value: React.ReactNode; label: string; sub: string }[] = [
  { value: 'Deal by deal', label: 'How every property is read', sub: 'Underwritten on real numbers, not hope' },
  { value: '4 lanes', label: 'How Pegasus participates', sub: 'List, buy, partner, or route' },
  { value: '48 hours', label: 'First strategy read', sub: 'From intake to a written path' },
  { value: 'East Bay', label: 'Where we focus', sub: 'Contra Costa & Alameda County' },
];

/* ================================================================
   THREE DOORS - how to start
   ================================================================ */
export const DOORS3: {
  key: string;
  kicker: string;
  title: string;
  desc: string;
  best: string;
  cta: string;
  action: 'contact' | 'strategylab' | 'peggy';
  icon: string;
}[] = [
  {
    key: 'review',
    kicker: 'Start with a written read',
    title: 'Request a Property Review',
    desc: 'Tell us about the property or the situation. We read it and come back with a clear, written path forward.',
    best: 'Best when you have a specific property, a deadline, or a decision to make.',
    cta: 'Request a Property Review',
    action: 'contact',
    icon: 'compass',
  },
  {
    key: 'lab',
    kicker: 'Run the numbers yourself',
    title: 'Open the Strategy Lab',
    desc: 'Model a deal in minutes. See the all-in, the spread, and the recommended lane before you ever talk to anyone.',
    best: 'Best when you want to run the numbers privately and move at your own pace.',
    cta: 'Open Strategy Lab',
    action: 'strategylab',
    icon: 'calculator',
  },
  {
    key: 'peggy',
    kicker: 'Ask in plain language',
    title: 'Talk to Peggy',
    desc: 'Describe the deal in your own words. Peggy asks the right questions, frames the options, and routes you to the right lane.',
    best: 'Best when you are not sure where you fit yet.',
    cta: 'Talk to Peggy',
    action: 'peggy',
    icon: 'sparkles',
  },
];

/* ================================================================
   THREE PILLARS
   ================================================================ */
export const PILLARS3: Pillar[] = [
  {
    eyebrow: 'Pillar 01',
    tag: 'Investments',
    title: <>We acquire and<br />reposition real assets</>,
    lead: 'We find distressed, dated, and overlooked property, underwrite it on real numbers, and buy at a basis that holds. Then we reposition it and sell or hold on a plan set before we close.',
    points: [
      'Sourcing, negotiation, and deal structure handled by one team',
      'Underwriting on real numbers, not hope',
      'Capital partners on clearly defined terms',
    ],
    img: 'pegasus-before.png',
    imgAlt: 'A dated, overlooked East Bay property before Pegasus acquired and repositioned it',
    route: 'investments',
    cta: 'See how we invest',
  },
  {
    eyebrow: 'Pillar 02',
    tag: 'Development',
    title: <>We build the<br />finished product</>,
    lead: 'The people Apollo builds with came up in the trades: former general contractors, project managers, and crews who have run real jobsites. Every renovation and ground-up build is scoped to a real budget and draw schedule, executed alongside licensed GCs and subcontractors, and finished on schedule with the punch list closed.',
    points: [
      'Renovation and ground-up development',
      'Led by experienced GCs and project managers, built with licensed subcontractors',
      'A delivered product, not a project left open',
    ],
    img: 'pegasus-craft-blueprint.webp',
    imgAlt: 'Blueprints and renovation craftsmanship on a Pegasus development build',
    route: 'development',
    cta: 'See how we build',
  },
  {
    eyebrow: 'Pillar 03',
    tag: 'Systems',
    title: <>The tools that carry<br />the read forward</>,
    lead: 'Strategy Lab models the numbers before you commit. Peggy guides the intake and routes it. MarketFlow connects sellers, finders, capital partners, and operators through the same reviewed network.',
    points: [
      'Tools that underwrite and route deals',
      'A private network that routes deals and capital',
      'Consistent underwriting from first read to exit',
    ],
    img: 'pegasus-architecture.png',
    imgAlt: 'A precise scale model of a modern home on a studio table',
    route: 'ecosystem',
    cta: 'See the whole system',
  },
];

/* ================================================================
   DEAL STRATEGY ENGINE
   ================================================================ */
export const ENGINE_INPUTS: { label: string; desc: string; icon: string }[] = [
  { label: 'Situation', desc: 'Probate, divorce, distress, tired rental, or a clean sale.', icon: 'compass' },
  { label: 'Property', desc: 'Condition, location, and what it could become.', icon: 'home' },
  { label: 'Motivation', desc: 'Speed, price, or certainty. What actually matters to you.', icon: 'target' },
  { label: 'Numbers', desc: 'All-in cost, after-repair value, and the spread.', icon: 'calculator' },
  { label: 'Capital', desc: 'Who funds it, on what terms, and at what risk.', icon: 'layers' },
  { label: 'Construction', desc: 'Scope, budget, and the timeline to deliver.', icon: 'hammer' },
  { label: 'Exit', desc: 'Sell, hold, refinance, or trade, decided up front.', icon: 'route' },
  { label: 'Risk', desc: 'What can go wrong, and what protects the downside.', icon: 'shield' },
];

export const ENGINE_OUTPUT = {
  label: 'Recommended Lane',
  desc: 'Every input resolves to one clear next step: the lane that fits the deal and the person in front of it.',
};

/* ================================================================
   HOW A DEAL MOVES - departments + two supporting pillars.
   Shows structure, not headcount.
   ================================================================ */
// Locked copy — docs/website-v1/COPY_DECK_V1.md §2 "Four Departments".
export const DEPARTMENTS: { stage: string; name: string; desc: string; icon: string }[] = [
  { stage: '01', name: 'Acquisitions', desc: 'Finds, reviews, structures, and secures opportunities.', icon: 'search' },
  { stage: '02', name: 'Development', desc: 'Scopes, renovates, repositions, builds, and manages execution.', icon: 'hammer' },
  { stage: '03', name: 'Dispositions', desc: 'Packages, markets, sells, assigns, lists, or connects the right exit.', icon: 'handshake' },
  { stage: '04', name: 'Asset Management', desc: 'Operates, protects, and compounds long-term holds.', icon: 'key' },
];

// Locked copy — COPY_DECK_V1.md §2 "Situation Router" (PRD homepage §6.2-2).
export const SITUATION_ROUTER: { key: string; title: string; desc: string; cta: string; href: string }[] = [
  { key: 'own', title: 'I own a property',
    desc: 'Distressed, inherited, occupied, vacant, behind on payments, unfinished, or simply complicated.',
    cta: 'Start Owner Review', href: '/bring-an-opportunity?intent=sell' },
  { key: 'found', title: 'I found a deal',
    desc: 'Wholesaler, agent, contractor, investor, or referral partner with an opportunity.',
    cta: 'Submit Deal', href: '/bring-an-opportunity?intent=deal-jv' },
  { key: 'buy', title: 'I want to buy',
    desc: 'Finished property, investment opportunity, or representation through Apollo/Keller Williams.',
    cta: 'Explore Buyer Lane', href: '/buyers' },
  { key: 'partner', title: 'I want to partner',
    desc: 'Capital, JV, vendor, operator, or project support.',
    cta: 'Partner With Pegasus', href: '/capital' },
  { key: 'strategy', title: 'I need a strategy',
    desc: 'Not sure whether to sell, hold, refinance, repair, list, partner, or exit.',
    cta: 'Request Strategy Review', href: '/strategy-lab' },
];

// PRD homepage §6.2-3 — the Deal Engine flow and example routes. Real HTML
// text, never baked into imagery (IMAGE_DIRECTION doctrine).
export const DEAL_ENGINE_FLOW = ['Submit', 'Review', 'Structure', 'Route', 'Execute', 'Exit / Hold'];
export const DEAL_ENGINE_ROUTES: { name: string; path: string }[] = [
  { name: 'Direct sale', path: 'Acquisitions → Dispositions' },
  { name: 'Value-add flip', path: 'Acquisitions → Development → Dispositions' },
  { name: 'Rental hold', path: 'Acquisitions → Development → Asset Management' },
  { name: 'Owner needs representation', path: 'Strategy Review → Work With Apollo / Keller Williams' },
  { name: 'Deal finder needs buyer', path: 'Acquisitions → Dispositions / MarketFlow' },
];

export const DEPT_PILLARS: { name: string; desc: string; icon: string }[] = [
  { name: 'Capital & Investor Relations', desc: 'Matches capital partners to specific projects on defined terms. Never a blind pool.', icon: 'layers' },
  { name: 'Finance & Legal', desc: 'Keeps the numbers, contracts, and disclosures straight from first read through exit.', icon: 'shield' },
];

/* ================================================================
   PRODUCT LADDER (naming is load-bearing)
   ================================================================ */
export const PRODUCTS: {
  step: string;
  name: string;
  kind: string;
  desc: string;
  cta: string;
  action: 'strategylab' | 'peggy' | 'contact';
  paid?: boolean;
}[] = [
  {
    step: '01',
    name: 'Strategy Lab',
    kind: 'Free · Self-serve',
    desc: 'A free underwriting console you run yourself. Enter the property and the numbers, then review strategy-tier ranges, the lanes that could fit, and the risks to weigh instantly.',
    cta: 'Open Strategy Lab',
    action: 'strategylab',
  },
  {
    step: '02',
    name: 'Property Read',
    kind: 'Free · Written',
    desc: 'Submit a property and Acquisitions returns a short, candid written read of the path and the risk within 48 hours.',
    cta: 'Request a Property Read',
    action: 'contact',
  },
  {
    step: '03',
    name: 'Deal Blueprint',
    kind: 'By request',
    desc: 'For deals that earn a full plan after a Property Read: scope, capital stack, construction approach, exit, and risk in one reviewed engagement. By review, not self-serve.',
    cta: 'Request Blueprint Review',
    action: 'contact',
  },
];

/* ================================================================
   MARKETFLOW - three lanes
   ================================================================ */
export const MARKETFLOW: {
  key: string;
  name: string;
  tag: string;
  desc: string;
  points: string[];
  icon: string;
  forWho: string;
}[] = [
  {
    key: 'exchange',
    name: 'Deal Exchange',
    tag: 'Where deals move',
    desc: 'Opportunities flow in from finders and owners, get underwritten deal by deal, and route to the right buyer or lane.',
    points: ['Vetted, underwritten opportunities', 'Clear terms for finders and sellers', 'No spray-and-pray blasts'],
    icon: 'route',
    forWho: 'Deal finders, sellers, buyers',
  },
  {
    key: 'capital',
    name: 'Capital Stack',
    tag: 'Where deals get funded',
    desc: 'Capital partners are matched to projects that fit their mandate, on defined terms with the work and risk laid out plainly.',
    points: ['Project-by-project participation', 'Terms and risk stated up front', 'No pooled funds, no promises of return'],
    icon: 'layers',
    forWho: 'Capital partners, operators',
  },
  {
    key: 'inventory',
    name: 'Inventory & Exits',
    tag: 'Where finished product lands',
    desc: 'Repositioned and newly built homes come to market, and to buyers and agents who want a delivered product, not a project.',
    points: ['Renovated and ground-up inventory', 'First look for the network', 'Delivered move-in ready, not left mid-project'],
    icon: 'home',
    forWho: 'Buyers, referral partners',
  },
];

/* ================================================================
   ECOSYSTEM - six surfaces
   ================================================================ */
export const ECOSYSTEM: {
  key: string;
  name: string;
  role: string;
  desc: string;
  icon: string;
  status: string;
  route?: Route;
}[] = [
  { key: 'hq', name: 'Pegasus HQ', role: 'The strategy firm', desc: 'Where deals are read, underwritten, and turned into a plan. The underwriting standard every other part follows.', icon: 'compass', status: 'Operating', route: 'contact' },
  { key: 'peggy', name: 'Peggy', role: 'The front door', desc: 'A conversational guide that takes a deal in plain language and routes it to the right lane.', icon: 'sparkles', status: 'Early access', route: 'peggy' },
  { key: 'lab', name: 'Strategy Lab', role: 'The underwriting tool', desc: 'Self-serve modeling that returns an Instant Strategy Preview on any deal.', icon: 'calculator', status: 'Operating', route: 'strategylab' },
  { key: 'marketflow', name: 'MarketFlow', role: 'The private routing layer', desc: 'Three reviewed lanes for opportunities, capital, and finished inventory.', icon: 'route', status: 'Building', route: 'marketflow' },
  { key: 'capstack', name: 'CapStack', role: 'The capital layer', desc: 'How funding is structured and matched to projects, on defined terms.', icon: 'layers', status: 'Building', route: 'capital' },
  { key: 'buildforge', name: 'BuildForge', role: 'The build layer', desc: 'Licensed contractors, engaged under project-specific agreements, turning scope, budget, and draw schedule into delivered product.', icon: 'hammer', status: 'Operating', route: 'development' },
];

/* ================================================================
   DREAMSCAPER STANDARD (doctrine)
   ================================================================ */
export const DOCTRINE: { t: string; d: string }[] = [
  { t: 'Read the situation, not just the spreadsheet', d: 'Behind every property is a person with a deadline, a constraint, or a decision. We solve for both.' },
  { t: 'Underwrite on real numbers', d: 'All-in cost, after-repair value, and the spread. If it does not pencil, we say so.' },
  { t: 'Write the exit before we enter', d: 'Sell, hold, refinance, or trade. The plan is decided before capital moves, not after.' },
  { t: 'Deliver a finished product', d: 'The build team finishes the work to one written finish standard, on a real schedule, not left half-open.' },
];

/* ================================================================
   DEVELOPMENT TEAM (capability band)
   ================================================================ */
export const DEV_TEAM: { t: string; d: string }[] = [
  { t: 'A team, not one hire', d: 'Former general contractors, project managers, and trades who have actually run jobsites, not a single person we depend on.' },
  { t: 'A deep bench', d: 'We work with a deep network of GCs and subcontractors, scaled to the project instead of limited to one crew.' },
  { t: 'Scoped before we build', d: 'Every project starts with a real budget and a draw schedule, so the plan is honest before the first hammer swings.' },
  { t: 'One finish standard', d: 'A single, written standard of completion, applied to every renovation and ground-up build, and delivered on a real timeline.' },
];

/* ================================================================
   HOMEPAGE FAQ (GEO / credibility)
   ================================================================ */
export const FAQ_HOME: FaqItem[] = [
  {
    q: 'What does Pegasus actually do?',
    a: 'Three things that feed each other: we invest in and reposition real property, Apollo and the build team renovate it to a finished, move-in-ready result, and we run the systems (Strategy Lab, Peggy, and MarketFlow) that run every deal through the same underwriting.',
  },
  {
    q: 'I just have one property. Is that too small?',
    a: 'No. A single property is exactly where most of our work starts. Request a Property Review or run it through the Strategy Lab and you will get a clear read on what it is and what it could become.',
  },
  {
    q: 'Do you guarantee returns to capital partners?',
    a: 'No. We never promise a return. Capital partners participate project by project on defined terms, with the work, the timeline, and the risk laid out plainly before anyone commits.',
  },
  {
    q: 'What is the difference between Strategy Lab and a Property Read?',
    a: 'Strategy Lab is the cockpit you can use right away. It helps you model assumptions and see possible lanes. A Property Read is Pegasus looking at the actual situation and writing back a clear next step.',
  },
  {
    q: 'Where do you operate?',
    a: 'We are rooted in the East Bay, California, through Keller Williams East Bay, and we look at opportunities that fit our buy box wherever they make sense.',
  },
];

/* ================================================================
   APOLLO
   ================================================================ */
// Identity block locked per COPY_DECK_V1.md §13 (issue #22).
export const APOLLO = {
  name: 'Paolo “Apollo” Duran',
  legal: 'Paolo Duran',
  role: 'Founder, Pegasus Dreamscapes Corp.',
  license: 'Licensed Real Estate Professional, Keller Williams East Bay · CA DRE #02333658',
  lead: 'Apollo (Paolo) Duran founded and leads Pegasus. He is a licensed real estate salesperson through Keller Williams Realty East Bay (DRE #02333658) and the strategist on every deal: he reads the situation, underwrites the numbers, and writes the plan. The build work is handled by licensed contractors brought on per project, not an in-house crew. The same underwriting runs from the first call to the final walkthrough.',
  points: [
    { t: 'The strategist', d: 'Apollo reads the situation, underwrites the numbers, and writes the plan.' },
    { t: 'The build team', d: 'Licensed general contractors and trades, brought on per project, turn the plan into a finished home.' },
    { t: 'The discipline', d: 'Every deal runs the same underwriting and the same build standard, from first call to final walkthrough.' },
  ],
};

/* ================================================================
   NELSON DRIVE CASE STUDY
   ================================================================ */
// Locked per COPY_DECK_V1.md §2/§14 (issue #22): real figures, framed as
// founder-led proof and lessons — never institutional scale.
export const NELSON = {
  name: 'Nelson Drive',
  location: 'Richmond / El Sobrante Area, CA',
  blurb: 'A dated East Bay residential property acquired, renovated, repositioned, and sold. The project shaped the Pegasus operating standard: underwrite honestly, scope carefully, manage the build, and understand the exit before entering.',
  rows: [
    { k: 'Basis', v: 'Acquired $600,000', note: 'Purchased for full renovation' },
    { k: 'Scope', v: 'Renovation ≈ $105,000', note: 'Managed with the build team' },
    { k: 'Exit', v: 'Sold $840,000', note: 'Sold to an owner-occupant' },
    { k: 'Status', v: 'Closed', note: 'Finished and delivered' },
  ],
};

/* ================================================================
   HOMEPAGE LANE CARDS (Choose Your Lane)
   ================================================================ */
export const LANE_CARDS: { key: AudienceKey; title: string; desc: string; icon: string; cta: string }[] = [
  { key: 'sellers', title: 'I need to sell a complex or stuck property', desc: 'Distressed, inherited, occupied, or stalled. Get a plain read and a real route, or a clean listing with Apollo.', icon: 'home', cta: 'Start a property review' },
  { key: 'buyers', title: 'I want to buy with an investor’s read', desc: 'Buy a finished home or buy into a deal, underwritten on real numbers before you commit.', icon: 'key', cta: 'See how buyers work with us' },
  { key: 'dealfinders', title: 'I have a deal to move', desc: 'Bring it once. Get a straight answer, written terms, and one buyer who actually closes.', icon: 'search', cta: 'Submit a deal' },
  { key: 'capital', title: 'I want to back specific deals', desc: 'Fund named projects on defined terms, with the risk and the downside laid out plainly. No blind pools.', icon: 'layers', cta: 'See how capital partners work' },
  { key: 'operators', title: 'I build or service the work', desc: 'GCs, subs, agents, and title partners join our bench and get matched to projects that fit their work.', icon: 'hammer', cta: 'Join the build bench' },
  { key: 'referral', title: 'I want to refer someone', desc: 'Send one name. We handle the relationship and put any referral fee in writing before anything moves.', icon: 'handshake', cta: 'Refer a contact' },
];

/* ================================================================
   PEGGY - suggested prompts
   ================================================================ */
export const PARTICIPATION_LANES: {
  key: string;
  title: string;
  desc: string;
  points: string[];
  icon: string;
  cta: string;
  href: string;
}[] = [
  {
    key: 'seller-representation',
    title: 'Ready to list',
    desc: 'Apollo can represent clean, ready-to-market sellers through Keller Williams Realty East Bay, with Pegasus-level pricing, prep, and timing discipline behind the listing.',
    points: ['Agency representation through KW East Bay', 'Pricing, prep, and launch strategy', 'Investor-minded read before you spend'],
    icon: 'home',
    cta: 'Work With Apollo',
    href: '/work-with-apollo',
  },
  {
    key: 'complex-owner',
    title: 'Complex owner situation',
    desc: 'Inherited, distressed, occupied, behind on work, or under a deadline? Submit the property and Pegasus will map the honest lane before anyone pushes a product.',
    points: ['Direct purchase, listing, JV, reposition, or pass', 'No offer until review and written terms', 'A written path within the launch standard'],
    icon: 'compass',
    cta: 'Submit Property',
    href: '/bring-an-opportunity?intent=sell',
  },
  {
    key: 'buyer-representation',
    title: 'Buyer or investor client',
    desc: 'Apollo can represent buyers who want a sharper read: buy-box discipline, diligence, and offer strategy informed by how operators actually underwrite property.',
    points: ['Buyer representation through KW East Bay', 'Value-add and finished-home thinking', 'A plain walk-away point before you overpay'],
    icon: 'key',
    cta: 'Work With Apollo',
    href: '/work-with-apollo',
  },
  {
    key: 'dealfinder-jv',
    title: 'Deal finder or wholesaler',
    desc: 'Bring the opportunity once. If it fits, Pegasus may buy it. If another buyer is the better route, we can JV or route through the network after written terms.',
    points: ['Source protection and written terms first', 'Direct acquisition when it fits the buy box', 'JV or MarketFlow routing when that is better'],
    icon: 'handshake',
    cta: 'Submit a Deal',
    href: '/bring-an-opportunity?intent=deal-jv',
  },
];

export const PEGGY_CHIPS: string[] = [
  'I inherited a house and I am not sure what to do with it',
  'I have a deal. What is your basis and where would you come in?',
  'I want to deploy capital into a value-add project',
  'Model the spread on a flip with carry and exit costs',
  'I am an agent with a client who needs to sell as-is, fast',
  'What does the draw schedule look like on a full renovation?',
];

/* Role-aware starter chips. Peggy opens by asking who she is helping, then
   shows prompts tuned to that role, plus follow-up chips that persist through
   the conversation for that path. Draft routing only - no real AI. */
export const PEGGY_ROLES: { role: string; label: string; chips: string[]; followups: string[] }[] = [
  {
    role: 'seller', label: 'I want to sell a property',
    chips: [
      'My property is clean and ready. How do I list with Apollo?',
      'I inherited a house and I am not sure what to do with it',
      'I have a tired rental and a tenant. What are my options?',
    ],
    followups: [
      'Tell me about the property',
      'How fast can you close?',
      'What are my options here?',
    ],
  },
  {
    role: 'buyer', label: 'I want to buy with a strategy',
    chips: [
      'I want buyer representation for a home purchase',
      'I am an investor looking for the next value-add',
      'What is in the Pegasus inventory pipeline right now?',
    ],
    followups: [
      'What should I be looking for?',
      'Model the numbers in Strategy Lab',
      'How does buyer representation work?',
    ],
  },
  {
    role: 'dealfinder', label: 'I have a deal to submit',
    chips: [
      'I have a deal. Where would Pegasus come in?',
      'How do JV terms and assignment economics work here?',
      'Does my deal fit the Pegasus Buy Box?',
    ],
    followups: [
      'How do I submit the deal?',
      'What terms can I expect?',
      'Run the spread in Strategy Lab',
    ],
  },
  {
    role: 'explore', label: "I want to understand my property's options",
    chips: [
      'What could I do with a property I already own?',
      'Should I sell, rent, or reposition this property?',
      'Could this lot or house support an ADU?',
    ],
    followups: [
      'Walk me through the options',
      'Model the numbers in Strategy Lab',
      'I would rather talk to a person',
    ],
  },
  {
    role: 'capital', label: "I'm a capital partner",
    chips: [
      'I want to deploy capital into a value-add project',
      'How are capital conversations structured here?',
      'What does a typical project timeline look like?',
    ],
    followups: [
      'How are deals structured?',
      'What is the typical timeline?',
      'I would rather talk to a person',
    ],
  },
  {
    role: 'agent', label: "I'm an agent or vendor",
    chips: [
      'I am an agent with a client who needs to sell as-is, fast',
      'How does a referral relationship work with Pegasus?',
      'I am a vendor and want to join the network',
    ],
    followups: [
      'How do referrals work?',
      'How do I join the vendor network?',
      'I would rather talk to a person',
    ],
  },
  {
    role: 'unsure', label: "I'm not sure where to start",
    chips: [
      'I have a situation and I am not sure what it is yet',
      'Help me figure out which lane fits me',
      'Just tell me how Pegasus works',
    ],
    followups: [
      'Which lane fits my situation?',
      'What does this cost?',
      'I would rather talk to a person',
    ],
  },
];

/* Generic follow-up chips, used as a fallback when no role path is selected. */
export const PEGGY_FOLLOWUPS: string[] = [
  'Which lane fits my situation?',
  'What does this cost?',
  'Model the numbers in Strategy Lab',
  'I would rather talk to a person',
];

export const PEGGY_SLA = 'Peggy replies in the moment. For anything that needs the team, we respond within 48 hours.';

/* Honest launch status. Peggy is live for intake and orientation but still being
   widened, so every surface that shows the widget states it plainly (replit.md
   launch checklist: "Peggy shown with honest status wherever surfaced"). */
export const PEGGY_STATUS = 'Early access · in training';

/* Compliance note shown in the panel footer. Peggy is intake only - she never
   approves, prices, or advises. Publishing the guardrail is the credibility move. */
export const PEGGY_COMPLIANCE = 'Peggy is an AI intake assistant. She does not approve deals, make offers, or provide legal, tax, lending, or investment advice.';

/* ================================================================
   AUDIENCE CATEGORIES (six lanes)
   ================================================================ */
const sellerSplits: { heading: string; copy: string; paths: SplitPath[]; founderPhoto?: boolean; peggyHint?: boolean } = {
  heading: 'List it, or send it for review',
  copy: 'Ready to list, or facing something complicated? Each path is different. We will tell you which one fits before you commit to anything.',
  founderPhoto: true,
  peggyHint: true,
  paths: [
    { name: 'Traditional seller representation', desc: 'Clean and ready to list? Apollo represents you as your agent through Keller Williams Realty East Bay, with an investor’s read on price, prep, and timing. Standard listing agreement, full MLS exposure.', cta: 'List With Apollo', route: 'apollo' },
    { name: 'Distressed or complex property review', desc: 'Probate, foreclosure, divorce, a tired rental, an inherited home, an expired listing, or ADU upside? Send it for a property review. We evaluate your options, which may include a direct purchase, a reposition, or a listing, subject to underwriting.', cta: 'Request a Property Review', route: 'contact' },
  ],
};

const buyerSplits: { heading: string; copy: string; paths: SplitPath[]; founderPhoto?: boolean; peggyHint?: boolean } = {
  heading: 'Three ways to buy',
  copy: 'A finished home, an investment, or first look at what is coming. Pick the lane that fits and we will point you to the right inventory or the right person.',
  founderPhoto: true,
  peggyHint: true,
  paths: [
    { name: 'Buyer representation', desc: 'Want Apollo in your corner as your agent? Representation through Keller Williams Realty East Bay, with offers backed by real underwriting so you know what a home is actually worth.', cta: 'See how representation works', route: 'apollo' },
    { name: 'Investor buyer guidance', desc: 'Open to buying into a deal, not just a finished house? We frame the numbers and route you to the right project or capital lane, subject to review and a written agreement.', cta: 'Talk through a deal', route: 'contact' },
    { name: 'Inventory & first look', desc: 'Want the finished product or early access? Request access to MarketFlow to see reviewed inventory before it reaches the open market.', cta: 'See MarketFlow inventory', route: 'marketflow' },
  ],
};

export const CATEGORIES: Record<AudienceKey, Category> = {
  /* ---------------------------------------------------------- */
  sellers: {
    eyebrow: 'Who We Serve / Sellers & Owners',
    // COPY_DECK §5 locked hero (issue #22)
    title: <>Sell on your terms,<br />not the market&rsquo;s.</>,
    image: 'pegasus-exterior-light.png',
    heroScrimTop: true,
    layout: 'timeline',
    pointsLabel: 'What you get',
    lead: 'If the property is complicated, the answer does not have to be. Pegasus reviews the situation and helps identify whether the right path is a direct sale, partnership, listing, development strategy, or another structured exit.',
    points: [
      { t: 'List With Apollo', d: 'Clean and ready to market? Apollo represents you as your agent through Keller Williams Realty East Bay, with an investor’s read on price, prep, and timing.' },
      { t: 'Structure a complex situation', d: 'Distressed, inherited, occupied, or stalled? Send it for a review. We may evaluate it as an acquisition, a reposition, a JV, a stabilization plan, a listing, or a referral, subject to underwriting.' },
      { t: 'We handle the work', d: 'When selling as-is is the right lane, we can handle the cleanout, the prep, and the repairs so you do not have to.' },
      { t: 'Clear terms, a real timeline', d: 'Defined terms and a closing timeline that does not move on you at the last minute. Any offer is subject to review and a written agreement.' },
    ],
    rich: ['proof', 'faq'],
    quote: 'The plan comes from what you actually need, not a formula and not a pitch.',
    forYou: [
      'You own a clean, ready property and want an investor-minded agent to list it',
      'You own something distressed, inherited, occupied, or stalled and want a straight read on your options',
      'You value options over a single take-it-or-leave-it pitch',
    ],
    notFit: [
      'You want a guaranteed cash offer before anyone has reviewed the property or the numbers',
      'You are not open to either a listing or a structured review',
    ],
    splits: sellerSplits,
    secondary: { label: 'See how a property becomes a plan', route: 'dealstrategy' },
    faqAnchor: 'submitting-a-property',
    faq: [
      { q: 'Will you actually buy it, or just list it?', a: 'Both are on the table. We can buy directly, or, if it serves you better, reposition and sell it for more. The Review tells you which path wins for you.' },
      { q: 'What condition does it need to be in?', a: 'Any. Distressed, dated, occupied, or mid-project. Condition changes which path makes sense. A listing, an as-is purchase, or a reposition can all fit.' },
      { q: 'How fast can you close?', a: 'When speed is the priority, we structure for a fast, certain close. We will give you a real timeline up front, not a moving target.' },
    ],
    form: {
      role: 'Seller',
      intent: 'seller',
      heading: <>Tell us about the property</>,
      lead: 'Share what you are working with. We read it and come back with a clear path, within 48 hours.',
      submit: 'Request My Review',
      third: { label: 'Property address or city', placeholder: '1234 Nelson Dr, East Bay' },
      messageLabel: 'What is the situation?',
      messagePlaceholder: 'Inherited, tired rental, need to sell by a certain date...',
    },
  },

  /* ---------------------------------------------------------- */
  buyers: {
    eyebrow: 'Who We Serve / Buyers',
    // COPY_DECK §7 locked hero (issue #22)
    title: <>Buy with a strategy,<br />not just a search.</>,
    image: 'pegasus-interior-light.png',
    heroScrimTop: true,
    layout: 'grid',
    pointsLabel: 'How you buy',
    lead: 'Whether you are looking for a home, investment property, or reviewed opportunity, Apollo can help you think like an operator. Licensed buyer representation is provided through Keller Williams East Bay when applicable.',
    points: [
      { t: 'Investor-minded representation', d: 'Apollo can represent you as your buyer’s agent through Keller Williams Realty East Bay when agency is the right lane, with offers backed by real underwriting.' },
      { t: 'Buy-box guidance', d: 'We help you define what to chase and what to skip: location, condition, spread, and exit, so you are not bidding blind.' },
      { t: 'Diligence and value-add thinking', d: 'We read condition, scope, and upside the way an operator does, not just a listing sheet.' },
      { t: 'Offer strategy and portfolio positioning', d: 'Structure offers that win without overpaying, and think past the closing to how the asset fits a long-term portfolio.' },
    ],
    splits: buyerSplits,
    rich: ['marketflow', 'faq'],
    quote: 'A delivered product, not a project left open. That is what a buyer gets from us.',
    forYou: [
      'You want an investor-minded agent representing you on the buy side',
      'You want buy-box discipline, diligence, and a real read on value before you offer',
      'You are building a portfolio, not just buying one house',
    ],
    notFit: [
      'You want to be rushed into a decision before the numbers are clear',
      'You are looking exclusively for a fixer to renovate entirely on your own with no guidance',
    ],
    secondary: { label: 'See the work in MarketFlow', route: 'marketflow' },
    faqAnchor: 'working-with-pegasus',
    faq: [
      { q: 'How do I see what is available?', a: 'Start a Review or talk to Peggy and tell us what you are looking for. Network buyers get first look before inventory reaches the open market.' },
      { q: 'What does "buy into the deal" mean?', a: 'On select projects you can participate as a capital partner rather than an end buyer, funding the project on defined terms. We will route you to the Capital Partners lane if that fits.' },
    ],
    form: {
      role: 'Buyer',
      intent: 'buyer',
      heading: <>Tell us what you are looking for</>,
      lead: 'Whether it is a finished home or a deal to buy into, tell us the shape of it and we will point you to the right inventory or lane.',
      submit: 'Get on the buyer list',
      third: { label: 'Target area or budget', placeholder: 'East Bay, up to $900K' },
      messageLabel: 'What are you looking for?',
      messagePlaceholder: 'Move-in ready 3 bed, or open to a project to invest in...',
    },
  },

  /* ---------------------------------------------------------- */
  dealfinders: {
    eyebrow: 'Who We Serve / Deal Finders & Wholesalers',
    // COPY_DECK §6 locked hero + required source-attribution note (issue #22)
    title: <>Bring the deal.<br />Get a serious review.</>,
    image: 'pegasus-prop1.png',
    heroScrimTop: true,
    layout: 'ledger',
    pointsLabel: 'A straight read',
    lead: 'Pegasus works with deal finders, wholesalers, agents, contractors, and referral partners who come across real estate opportunities that need structure, execution, buyers, or capital. Source attribution is recorded at submission. Any JV, assignment, referral, or compensation structure must be agreed in writing before distribution.',
    points: [
      { t: 'A fast, honest read', d: 'Send the deal. We tell you quickly whether it works, at what number, and which path it fits.' },
      { t: 'Two paths for a deal', d: 'If it fits our buy box, we may buy or partner directly. If not, we may route it through our JV network or MarketFlow after written terms.' },
      { t: 'Source protection', d: 'We protect source attribution through documented submission records and written JV or compensation terms before distribution.' },
      { t: 'Buy box preview', d: 'Value-add SFR, East Bay ADU, estates and probate, and small multifamily. See the full buy box before you bring a deal.' },
    ],
    rich: ['buybox', 'faq'],
    quote: 'Bring us a deal that pencils and you get a straight answer fast: yes, no, or the number that works.',
    forYou: [
      'You source overlooked or distressed opportunities',
      'You want a buyer or partner who reviews honestly and moves on written terms',
      'You value clarity on the path over a vague maybe',
    ],
    notFit: [
      'You expect every deal to be purchased or compensated regardless of fit',
      'You are daisy-chaining a deal already shopped to every buyer in the county',
    ],
    secondary: { label: 'See where deals flow', route: 'marketflow' },
    faqAnchor: 'submitting-a-property',
    faq: [
      { q: 'How fast will I hear back?', a: 'Send the address and the numbers and you will get a real read quickly: yes, no, or "here is the number and the path that works."' },
      { q: 'How do payouts and JV terms work?', a: 'If we move forward, we put your role in writing first, whether that is an assignment, a JV, or another compensation structure. We do not distribute a deal before terms are documented, and not every deal is purchased or compensated.' },
      { q: 'How do you protect my deal?', a: 'We protect source attribution through documented submission records and written JV or compensation terms before distribution.' },
    ],
    form: {
      role: 'Deal Finder',
      intent: 'deal-finder',
      heading: <>Send us the deal</>,
      lead: 'Drop the address and the numbers. We will underwrite it to our standard and come back with a straight answer.',
      submit: 'Submit the Deal',
      third: { label: 'Deal address', placeholder: '1234 Nelson Dr, East Bay' },
      messageLabel: 'The numbers',
      messagePlaceholder: 'Asking, est. ARV, repairs, and your spread...',
    },
  },

  /* ---------------------------------------------------------- */
  capital: {
    eyebrow: 'Who We Serve / Capital Partners',
    // COPY_DECK §8 locked hero + required no-public-offering note (issue #22)
    title: <>Capital should<br />follow discipline.</>,
    image: 'pegasus-arch.png',
    layout: 'grid',
    pointsLabel: 'Eyes open',
    lead: 'Pegasus reviews capital relationships project-by-project. No public offering, no guaranteed returns, no pooled fund. Any capital relationship must be privately reviewed and documented appropriately.',
    points: [
      { t: 'Project by project', d: 'You choose what to back. No blind pools, no commitments you did not pick.' },
      { t: 'Defined terms', d: 'Structure, security, and timeline stated plainly in writing.' },
      { t: 'Underwriting you can read', d: 'The same numbers we used: all-in, after-repair value, and the spread.' },
      { t: 'Risk in plain sight', d: 'We tell you what can go wrong and what protects the downside.' },
    ],
    rich: ['stats', 'faq'],
    quote: 'Capital deserves the truth: real numbers, defined terms, and no promise we cannot keep.',
    forYou: [
      'You want to deploy capital into specific, vetted real estate projects',
      'You prefer defined terms and transparency over vague upside',
      'You understand real estate carries risk and want it stated honestly',
    ],
    notFit: [
      'You are looking for a guaranteed or fixed return, which we never promise',
      'You want a hands-off pooled fund product',
    ],
    secondary: { label: 'See the capital layer', route: 'ecosystem' },
    faqAnchor: 'marketflow-network',
    faq: [
      { q: 'Do you guarantee a return?', a: 'No. Real estate carries risk and we will never tell you otherwise. We show you the underwriting and the terms; the decision and the risk are yours.' },
      { q: 'How is my capital secured?', a: 'It varies by project and is always stated in writing before you commit: structure, security, and timeline laid out plainly.' },
      { q: 'What size projects?', a: 'From single-property repositions to ground-up builds. Tell us your mandate and we will only bring you what fits it.' },
    ],
    form: {
      role: 'Capital Partner',
      intent: 'capital-partner',
      heading: <>Let us understand your mandate</>,
      lead: 'Tell us what you are looking to deploy and how you think about risk. We will only bring you projects that fit. This is not an offer of securities.',
      submit: 'Start the Conversation',
      third: { label: 'Capital range (optional)', placeholder: '$100K to $500K per project' },
      messageLabel: 'Your mandate',
      messagePlaceholder: 'Project types, risk tolerance, timeline...',
    },
  },

  /* ---------------------------------------------------------- */
  operators: {
    eyebrow: 'Who We Serve / Operators & Vendors',
    // COPY_DECK §9 locked hero (issue #22)
    title: <>Join the Pegasus<br />operator bench.</>,
    image: 'pegasus-process.png',
    layout: 'ledger',
    pointsLabel: 'How we work',
    lead: 'Pegasus works with contractors, trades, designers, architects, photographers, inspectors, lenders, escrow/title partners, and other operators on a project-by-project basis.',
    points: [
      { t: 'Clear scope', d: 'You bid against a real plan, not a moving target.' },
      { t: 'Paid on terms', d: 'Defined payment schedules, honored as agreed.' },
      { t: 'Repeat volume', d: 'A pipeline of projects, not a one-off favor.' },
      { t: 'A standard to hit', d: 'You know exactly what "done" looks like before you start.' },
    ],
    rich: ['process', 'faq'],
    quote: 'The people Apollo builds with came up through the trades, so we know what good work costs, and we respect it.',
    forYou: [
      'You are a GC, sub, agent, lender, title, or inspection partner',
      'You deliver quality and want consistent, well-scoped work',
      'You want to be paid on clear terms without chasing',
    ],
    notFit: [
      'You cannot deliver to a defined standard or timeline',
      'You are looking for a single one-off job rather than an ongoing relationship',
    ],
    secondary: { label: 'See how we build', route: 'development' },
    faqAnchor: 'marketflow-network',
    faq: [
      { q: 'How do you scope work?', a: 'Every project comes with a real plan and budget. You bid against a defined scope, not a vague wish list.' },
      { q: 'How do payments work?', a: 'On a defined draw schedule agreed before work starts, and honored. The build team has run jobsites, so we understand cash flow.' },
    ],
    form: {
      role: 'Operator',
      intent: 'operator',
      heading: <>Tell us what you do</>,
      lead: 'Share your trade or service and where you work. We will reach out when a project fits.',
      submit: 'Join the Network',
      third: { label: 'Trade / service & area', placeholder: 'Licensed GC, East Bay' },
      messageLabel: 'About your work',
      messagePlaceholder: 'Capacity, specialties, licenses...',
    },
  },

  /* ---------------------------------------------------------- */
  referral: {
    eyebrow: 'Who We Serve / Referral Partners',
    // COPY_DECK §10 locked hero + required lawful-compensation note (issue #22)
    title: <>Send the situation.<br />Pegasus will handle it carefully.</>,
    image: 'nelson/nelson-exterior-1280.jpg',
    layout: 'timeline',
    pointsLabel: 'How it works',
    lead: 'For professionals and trusted contacts who know a property owner, investor, or situation that may need a structured path. Referral compensation, JV participation, or professional coordination is handled only where lawful, permitted, and agreed in writing.',
    points: [
      { t: 'Written terms before engagement', d: 'Where permitted by applicable licensing rules, the referral fee or JV split is agreed and documented before we make contact with anyone you send. What we agree is what you receive at close.' },
      { t: 'Your relationship stays intact', d: 'You keep the professional relationship. We solve the property or deal problem and hand it back to you cleanly.' },
      { t: 'An honest read', d: 'Your contact gets a straight read on their situation, including a clear "no" when that is the honest answer. Your reputation is safe.' },
      { t: 'You stay informed', d: 'We keep you in the loop through the process, not just at the end.' },
    ],
    rich: ['faq'],
    heroScrimTop: true,
    quote: 'A referral is a piece of your professional reputation. We treat it that way.',
    forYou: [
      'You are an agent, attorney, advisor, contractor, or trusted professional',
      'You encounter property owners, buyers, operators, or deal sources outside your own lane',
      'You want your contacts handled honestly, with written terms before anyone is engaged',
    ],
    notFit: [
      'You are looking to sell lead lists rather than refer real people in real situations',
      'You expect an outcome commitment before the situation is reviewed',
    ],
    secondary: { label: 'Understand our standard', route: 'about' },
    faqAnchor: 'working-with-pegasus',
    faq: [
      { q: 'How are referrals compensated?', a: 'In writing, before we engage your contact, and only where permitted by applicable licensing and compensation rules. The referral fee or JV split is agreed and documented first. Then we proceed. What we agree is what you receive.' },
      { q: 'What types of professionals refer to Pegasus?', a: 'Estate attorneys, real estate agents with clients outside their lane, financial advisors, contractors, CPAs, and others who encounter property situations they cannot fully service themselves.' },
      { q: 'What happens to my contact?', a: 'They get the same honest review anyone receives. If there is a path, we lay it out. If there is not, we say so plainly. Either way, your relationship with them is protected.' },
    ],
    form: {
      role: 'Referral Partner',
      intent: 'referral',
      heading: <>Submit a referral</>,
      lead: 'Introduce the person and the situation. We confirm terms in writing before we engage, then keep you in the loop.',
      submit: 'Submit a Referral',
      third: { label: 'Your profession', placeholder: 'Estate attorney · Real estate agent · Advisor' },
      messageLabel: 'About the referral',
      messagePlaceholder: 'Who they are, what situation they face, and your relationship to them...',
    },
  },
};
