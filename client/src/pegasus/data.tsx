import React from 'react';
import type { NavLink, Pillar, Category, AudienceKey, SplitPath, FaqItem, Route } from './theme';

/* ================================================================
   NAVIGATION
   The compact public spine keeps the highest-intent paths visible while the
   More directory makes the full firm, operating lanes, proof, and systems
   reachable from every page. NAV_LINKS remains the legacy flat contract used
   by older page-level tests and supporting blocks.
   ================================================================ */
export type PremiumNavigationItem = NavLink & { note?: string; badge?: string };
export type PremiumNavigationGroup = { label: string; items: PremiumNavigationItem[] };

const PREMIUM_PRIMARY_NAV: PremiumNavigationItem[] = [
  { label: 'How We Operate', route: 'dealstrategy' },
  { label: 'Property Owners', route: 'sellers' },
  { label: 'Deal Partners', route: 'dealfinders' },
  { label: 'Our Work', route: 'ourwork' },
  { label: 'About', route: 'about' },
];

const PREMIUM_MORE_NAV: PremiumNavigationGroup[] = [
  {
    label: 'Company & proof',
    items: [
      { label: 'Work With Apollo', route: 'apollo', note: 'Ask about current licensed-representation availability.' },
      { label: 'Pegasus Standard', url: '/pegasus-standard', note: 'The long-term development direction, clearly labeled.' },
      { label: 'Contact', route: 'contact', note: 'Start with a general question or ask for the right public route.' },
      { label: 'Peggy', route: 'peggy', note: 'AI-supported orientation and intake—not licensed advice.' },
    ],
  },
  {
    label: 'Operating lanes',
    items: [
      { label: 'Development', route: 'development', note: 'A framework for scope, budget, diligence, and delivery terms.' },
      { label: 'Capital Partners', route: 'capital', note: 'Private, project-specific relationships.' },
      { label: 'Buyers', route: 'buyers', note: 'Representation, diligence, and reviewed opportunity paths.' },
      { label: 'MarketFlow', route: 'marketflow', note: 'The controlled opportunity workspace and current access boundaries.' },
    ],
  },
  {
    label: 'Network & resources',
    items: [
      { label: 'Operators & Vendors', route: 'operators', note: 'Submit a profile for possible future-scope consideration.' },
      { label: 'Referral Partners', route: 'referral', note: 'Careful handoffs and written terms where lawful.' },
      { label: 'Pegasus Ecosystem', route: 'ecosystem', note: 'HQ, Peggy, Strategy Lab, MarketFlow, and the operating layers.' },
      { label: 'Strategy Lab', route: 'strategylab', note: 'Model visitor-entered assumptions with directional tools.' },
    ],
  },
];

export const PREMIUM_NAVIGATION = {
  primary: PREMIUM_PRIMARY_NAV,
  more: PREMIUM_MORE_NAV,
};

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
  { value: 'One record', label: 'Structured opportunity intake', sub: 'Receipt does not promise a review or response' },
  { value: '4 examples', label: 'Possible participation lanes', sub: 'Each depends on fit and written terms' },
  { value: 'Self-serve', label: 'Strategy Lab modeling', sub: 'Educational outputs based on your inputs' },
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
    desc: 'Tell us about the property or situation for possible consideration. No review, written read, or response time is promised.',
    best: 'Best when you have a specific property, a deadline, or a decision to make.',
    cta: 'Request a Property Review',
    action: 'contact',
    icon: 'compass',
  },
  {
    key: 'lab',
    kicker: 'Run the numbers yourself',
    title: 'Open the Strategy Lab',
    desc: 'Model assumptions privately and explore illustrative costs, spread, and possible lanes. Outputs are educational, not recommendations.',
    best: 'Best when you want to run the numbers privately and move at your own pace.',
    cta: 'Open Strategy Lab',
    action: 'strategylab',
    icon: 'calculator',
  },
  {
    key: 'peggy',
    kicker: 'Ask in plain language',
    title: 'Talk to Peggy',
    desc: 'Describe the situation in your own words. Peggy can explain public options and help create an intake record, but cannot promise routing.',
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
    title: <>How a possible acquisition<br />is evaluated</>,
    lead: 'This lane describes how a possible acquisition may be evaluated: basis, condition, improvement scope, risk, and exit. It is not a claim of current inventory or a promise to buy.',
    points: [
      'Property facts, access, and control established first',
      'Basis, scope, carry, exit, and downside modeled together',
      'Any capital or transaction terms documented separately',
    ],
    img: 'pegasus-before.png',
    imgAlt: 'A dated East Bay property illustrating a possible value-add starting point',
    route: 'investments',
    cta: 'Explore the acquisition framework',
  },
  {
    eyebrow: 'Pillar 02',
    tag: 'Development',
    title: <>Project controls<br />before the build</>,
    lead: 'This lane describes a possible project framework: documented scope, budget, schedule, qualified contractors, permits, change control, and completion criteria. Actual services and providers require project-specific diligence and agreements.',
    points: [
      'Renovation and ground-up scope concepts',
      'Applicable licenses, insurance, permits, and roles verified per scope',
      'Completion criteria and remedies defined in the signed agreement',
    ],
    img: 'pegasus-craft-blueprint.webp',
    imgAlt: 'Blueprints and renovation materials illustrating development planning',
    route: 'development',
    cta: 'Explore project controls',
  },
  {
    eyebrow: 'Pillar 03',
    tag: 'Systems',
    title: <>The tools that carry<br />the read forward</>,
    lead: 'Strategy Lab models user inputs. Peggy explains public paths and can create an intake record. MarketFlow is a controlled private pilot; access, inventory, matching, and transactions are conditional.',
    points: [
      'Tools for educational modeling and structured intake',
      'A controlled pilot with discretionary access',
      'Written terms govern any actual service or transaction',
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
  desc: 'Inputs may illustrate one or more possible lanes. They do not create a recommendation, review, or service commitment.',
};

/* ================================================================
   HOW A DEAL MOVES - departments + two supporting pillars.
   Shows structure, not headcount.
   ================================================================ */
// Locked copy — docs/website-v1/COPY_DECK_V1.md §2 "Four Departments".
export const DEPARTMENTS: { stage: string; name: string; desc: string; icon: string }[] = [
  { stage: '01', name: 'Acquisitions', desc: 'An accountability lane for possible intake, diligence, and transaction structure.', icon: 'search' },
  { stage: '02', name: 'Development', desc: 'An accountability lane for possible scope, budget, build, and completion terms.', icon: 'hammer' },
  { stage: '03', name: 'Dispositions', desc: 'An accountability lane for possible sale, assignment, listing, or introduction paths.', icon: 'handshake' },
  { stage: '04', name: 'Asset Management', desc: 'An accountability lane for possible long-term hold responsibilities.', icon: 'key' },
];

// Locked copy — COPY_DECK_V1.md §2 "Situation Router" (PRD homepage §6.2-2).
export const SITUATION_ROUTER: { key: string; title: string; desc: string; cta: string; href: string }[] = [
  { key: 'own', title: 'I own a property',
    desc: 'Distressed, inherited, occupied, vacant, behind on payments, unfinished, or simply complicated.',
    cta: 'Share Owner Context', href: '/bring-an-opportunity?intent=sell' },
  { key: 'found', title: 'I found a deal',
    desc: 'Wholesaler, agent, contractor, investor, or referral partner with an opportunity.',
    cta: 'Submit Deal', href: '/bring-an-opportunity?intent=deal-jv' },
  { key: 'buy', title: 'I want to buy',
    desc: 'A buyer request, educational modeling, or a question about current representation availability.',
    cta: 'Explore Buyer Lane', href: '/buyers' },
  { key: 'partner', title: 'I want to partner',
    desc: 'Capital, JV, vendor, operator, or project support.',
    cta: 'Explore Partnership Context', href: '/capital' },
  { key: 'strategy', title: 'I need a strategy',
    desc: 'Not sure whether to sell, hold, refinance, repair, list, partner, or exit.',
    cta: 'Open Strategy Lab', href: '/strategy-lab' },
];

// PRD homepage §6.2-3 — the Deal Engine flow and example routes. Real HTML
// text, never baked into imagery (IMAGE_DIRECTION doctrine).
export const DEAL_ENGINE_FLOW = ['Describe', 'Model', 'Compare', 'Identify', 'Document', 'Decide'];
export const DEAL_ENGINE_ROUTES: { name: string; path: string }[] = [
  { name: 'Possible direct sale', path: 'Property facts → diligence → written purchase terms' },
  { name: 'Value-add scenario', path: 'Basis → project controls → possible exit' },
  { name: 'Hold scenario', path: 'Basis → project controls → operating questions' },
  { name: 'Representation request', path: 'Verify availability → separate brokerage agreement' },
  { name: 'Deal submission', path: 'Source record → possible consideration → written terms' },
];

export const DEPT_PILLARS: { name: string; desc: string; icon: string }[] = [
  { name: 'Capital & Investor Relations', desc: 'Describes possible project-specific capital relationships; none are offered publicly.', icon: 'layers' },
  { name: 'Finance & Legal', desc: 'Identifies disciplines that require qualified professionals and transaction-specific documents.', icon: 'shield' },
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
    desc: 'A free educational modeling workspace. Enter your own property assumptions to see illustrative ranges, possible lanes, and risk prompts without receiving a valuation or recommendation.',
    cta: 'Open Strategy Lab',
    action: 'strategylab',
  },
  {
    step: '02',
    name: 'Property Read',
    kind: 'Free · Written',
    desc: 'Submit a property for possible consideration. No human review, written read, or response time is promised.',
    cta: 'Request a Property Read',
    action: 'contact',
  },
  {
    step: '03',
    name: 'Deal Blueprint',
    kind: 'By request',
    desc: 'A possible separately scoped analysis. Availability, author, contents, fee, timing, and limits require a written agreement.',
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
    tag: 'Private opportunity records',
    desc: 'The controlled pilot may hold opportunity records. Publication, review, matching, buyer availability, and transactions are not promised.',
    points: ['Private records, not public offers', 'Separate terms for any participant', 'No guaranteed distribution or match'],
    icon: 'route',
    forWho: 'Deal finders, sellers, buyers',
  },
  {
    key: 'capital',
    name: 'Capital Stack',
    tag: 'Project-specific capital context',
    desc: 'Any capital discussion must be project specific, privately reviewed, and documented by qualified professionals.',
    points: ['Project-by-project participation', 'Terms and risk stated up front', 'No pooled funds, no promises of return'],
    icon: 'layers',
    forWho: 'Capital partners, operators',
  },
  {
    key: 'inventory',
    name: 'Inventory & Exits',
    tag: 'Authorized property records',
    desc: 'The pilot may display authorized inventory records if any are available. This page does not promise inventory or early access.',
    points: ['Authorized records only', 'Access and visibility are discretionary', 'Condition and delivery verified per listing'],
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
  { key: 'hq', name: 'Pegasus HQ', role: 'The company layer', desc: 'Public information, intake records, and possible engagement paths.', icon: 'compass', status: 'Operating', route: 'contact' },
  { key: 'peggy', name: 'Peggy', role: 'The guided front door', desc: 'An early-access assistant that explains public paths and can help create an intake record.', icon: 'sparkles', status: 'Early access', route: 'peggy' },
  { key: 'lab', name: 'Strategy Lab', role: 'The educational modeling tool', desc: 'Self-serve modeling that generates an illustrative Strategy Preview from user-supplied inputs.', icon: 'calculator', status: 'Operating', route: 'strategylab' },
  { key: 'marketflow', name: 'MarketFlow', role: 'The private pilot', desc: 'A controlled-pilot workspace with discretionary access and no promised inventory or matching.', icon: 'route', status: 'Controlled pilot', route: 'marketflow' },
  { key: 'capstack', name: 'CapStack', role: 'A capital concept', desc: 'Educational framing for possible project-specific funding terms; not a public offering.', icon: 'layers', status: 'Concept', route: 'capital' },
  { key: 'buildforge', name: 'BuildForge', role: 'A build framework', desc: 'Example controls for scope, budget, qualified providers, draws, change orders, and completion.', icon: 'hammer', status: 'Framework', route: 'development' },
];

/* ================================================================
   DREAMSCAPER STANDARD (doctrine)
   ================================================================ */
export const DOCTRINE: { t: string; d: string }[] = [
  { t: 'Read the situation, not just the spreadsheet', d: 'A property request may include a deadline, constraint, or personal decision; responsible consideration starts with both facts and context.' },
  { t: 'Model complete inputs', d: 'Acquisition, improvements, carry, financing, disposition, and downside belong in the same scenario.' },
  { t: 'Write the intended exit first', d: 'A sell, hold, refinance, or trade scenario should be stated before capital or work is committed.' },
  { t: 'Define completion before work', d: 'Any project agreement should identify scope, schedule, completion criteria, remedies, and responsible providers.' },
];

/* ================================================================
   DEVELOPMENT TEAM (capability band)
   ================================================================ */
export const DEV_TEAM: { t: string; d: string }[] = [
  { t: 'Qualified roles by scope', d: 'A future project should identify the owner, contractor, designers, consultants, and other responsible parties in writing.' },
  { t: 'Capacity verified per project', d: 'Licenses, insurance, references, availability, and subcontractor roles should be checked for the actual scope.' },
  { t: 'Scope before work', d: 'A project agreement should set budget, draws, schedule, change control, and information requirements.' },
  { t: 'Completion defined in writing', d: 'Finish standards, inspection, acceptance, remedies, and handoff belong in the signed project documents.' },
];

/* ================================================================
   HOMEPAGE FAQ (GEO / credibility)
   ================================================================ */
export const FAQ_HOME: FaqItem[] = [
  {
    q: 'What does Pegasus actually do?',
    a: 'Pegasus publishes educational strategy tools, accepts structured opportunity requests, and describes possible property, representation, development, and partnership lanes. Availability and actual services are conditional.',
  },
  {
    q: 'I just have one property. Is that too small?',
    a: 'You may run self-service educational tools or submit one property for possible consideration. Neither path promises a human review, recommendation, or response.',
  },
  {
    q: 'Do you guarantee returns to capital partners?',
    a: 'No. This page is not an offering. Any future capital transaction would require project-specific diligence, risk disclosure, qualified advice, and signed documents; no project, return, or principal protection is promised.',
  },
  {
    q: 'What is the difference between Strategy Lab and a Property Read?',
    a: 'Strategy Lab models user inputs and illustrates possible lanes. A Property Read is a request for possible human consideration; no written response or timing is promised.',
  },
  {
    q: 'Where do you operate?',
    a: 'Pegasus is based in the East Bay, California. Licensed-representation availability is separate from Pegasus and must be verified through the applicable DRE license and brokerage agreement.',
  },
];

/* ================================================================
   APOLLO
   ================================================================ */
// Identity block locked per COPY_DECK_V1.md §13 (issue #22).
export const APOLLO = {
  name: 'Paolo “Apollo” Duran',
  legal: 'Duran Ramirez, Paolo Ariel (DRE license record)',
  role: 'Founder, Pegasus Dreamscapes Corp.',
  license: 'CA DRE #02333658 · license record name: Duran Ramirez, Paolo Ariel',
  broker: 'Responsible broker: BMP Realty Inc DBA Keller Williams Realty-East Bay',
  lead: 'This site uses Paolo “Apollo” Duran as the founder’s public-facing name. For license verification, CA DRE #02333658 is listed under Duran Ramirez, Paolo Ariel, with responsible broker BMP Realty Inc DBA Keller Williams Realty-East Bay. Verify current status before engagement. Licensed representation may be available only through a separate written brokerage agreement.',
  points: [
    { t: 'The founder', d: 'Paolo “Apollo” Duran leads Pegasus Dreamscapes Corp. as its public-facing founder.' },
    { t: 'Licensed work is separate', d: 'Any brokerage representation requires current license verification and its own written agreement.' },
    { t: 'Project roles are specific', d: 'Construction, design, consulting, and other roles require qualified providers named in project documents.' },
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
  blurb: 'A completed East Bay residential transformation documented at an approximate $600K acquisition, $105K improvement budget, $705K basis before other costs, and $840K sale. The $135K gross spread is not net profit or return.',
  rows: [
    { k: 'Basis', v: 'Acquired $600,000', note: 'Purchased for full renovation' },
    { k: 'Scope', v: 'Improvement budget ≈ $105,000', note: 'Public project-level figure' },
    { k: 'Exit', v: 'Sold $840,000', note: 'September 2025 record' },
    { k: 'Limits', v: 'Gross spread ≈ $135,000', note: 'Not net profit; other costs excluded' },
  ],
};

/* ================================================================
   HOMEPAGE LANE CARDS (Choose Your Lane)
   ================================================================ */
export const LANE_CARDS: { key: AudienceKey; title: string; desc: string; icon: string; cta: string }[] = [
  { key: 'sellers', title: 'I need to sell a complex or stuck property', desc: 'Record the situation for possible consideration, or ask about current licensed-representation availability.', icon: 'home', cta: 'Share the property' },
  { key: 'buyers', title: 'I want to frame a buyer request', desc: 'Explore educational buy-box questions, possible future records, or current licensed-representation availability.', icon: 'key', cta: 'Explore the buyer paths' },
  { key: 'dealfinders', title: 'I have a deal to submit', desc: 'Bring it once for possible consideration. No review, buyer, response, source protection, or transaction is promised.', icon: 'search', cta: 'Submit a deal' },
  { key: 'capital', title: 'I want to share a capital mandate', desc: 'Review the boundaries for possible private, project-specific discussions. This page is not an offering.', icon: 'layers', cta: 'Review capital boundaries' },
  { key: 'operators', title: 'I build or service projects', desc: 'Submit a profile for possible future-scope consideration; no approval, placement, work, or volume is promised.', icon: 'hammer', cta: 'Submit a vendor profile' },
  { key: 'referral', title: 'I want to introduce someone', desc: 'Share context only with permission. Any lawful compensation or coordination requires separate written terms and is not promised.', icon: 'handshake', cta: 'Share an introduction' },
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
    desc: 'Ask whether licensed seller representation is currently available. Any agency, pricing, preparation, or launch work requires current license verification and a written brokerage agreement.',
    points: ['Current availability verified first', 'Brokerage terms documented separately', 'No agency created by site use'],
    icon: 'home',
    cta: 'Work With Apollo',
    href: '/work-with-apollo',
  },
  {
    key: 'complex-owner',
    title: 'Complex owner situation',
    desc: 'Inherited, distressed, occupied, behind on work, or under a deadline? Submit context for possible consideration; no map, review, offer, or response is promised.',
    points: ['Possible lanes depend on the facts', 'No offer without diligence and written terms', 'No public response-time commitment'],
    icon: 'compass',
    cta: 'Submit Property',
    href: '/bring-an-opportunity?intent=sell',
  },
  {
    key: 'buyer-representation',
    title: 'Buyer or investor client',
    desc: 'Ask whether licensed buyer representation is currently available. Any search, diligence, pricing, or offer work requires a separate brokerage agreement.',
    points: ['Current availability verified first', 'Duties and scope stated in writing', 'No value or outcome promise'],
    icon: 'key',
    cta: 'Work With Apollo',
    href: '/work-with-apollo',
  },
  {
    key: 'dealfinder-jv',
    title: 'Deal finder or wholesaler',
    desc: 'Bring the opportunity once for possible consideration. A purchase, JV, distribution, buyer, or MarketFlow path is possible only after diligence and written terms.',
    points: ['Submission records source information but is not a protection agreement', 'Acquisition is discretionary', 'Distribution requires authorization and written terms'],
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

export const PEGGY_SLA = 'Peggy may respond in the session. Human review, follow-up, and response timing are not promised.';

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
  copy: 'Ready to list, or facing something complicated? You may request consideration or ask about representation availability. No path or response is promised.',
  founderPhoto: true,
  peggyHint: true,
  paths: [
    { name: 'Possible seller representation', desc: 'Ask about current licensed-representation availability. Agency, pricing, preparation, timing, MLS exposure, and fees require a separate written brokerage agreement.', cta: 'Ask About Representation', route: 'apollo' },
    { name: 'Complex property request', desc: 'Share a probate, foreclosure, divorce, rental, inherited-home, expired-listing, or development situation for possible consideration. Review and options are not promised.', cta: 'Share the Property', route: 'contact' },
  ],
};

const buyerSplits: { heading: string; copy: string; paths: SplitPath[]; founderPhoto?: boolean; peggyHint?: boolean } = {
  heading: 'Three separate buyer paths',
  copy: 'Licensed representation, investor-interest intake, and controlled-pilot access are separate requests with separate terms and no guaranteed inventory, match, service, or response.',
  founderPhoto: true,
  peggyHint: true,
  paths: [
    { name: 'Possible buyer representation', desc: 'Ask about current licensed-representation availability. Search, diligence, valuation, and offer duties require a separate written brokerage agreement.', cta: 'Request representation', href: '/work-with-apollo' },
    { name: 'Investor buyer request', desc: 'Submit an investor-interest mandate for possible consideration. This is not a representation request, capital application, MarketFlow account, or promise of a response.', cta: 'Submit investor interest', href: '/bring-an-opportunity?intent=buyer' },
    { name: 'MarketFlow controlled pilot', desc: 'Request discretionary controlled-pilot access. Approval, an account, inventory, review, matching, and transactions are not promised.', cta: 'Request pilot access', href: '/marketflow/access' },
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
    lead: 'If the property is complicated, record the facts in one place for possible consideration. Purchase, partnership, representation, development, referral, and other paths are conditional.',
    points: [
      { t: 'Ask about representation', d: 'Clean and ready to market? Ask about current licensed-representation availability; agency requires a separate written brokerage agreement.' },
      { t: 'Describe a complex situation', d: 'Distressed, inherited, occupied, or stalled? Record the facts and constraints for possible consideration. No review or path is promised.' },
      { t: 'Possible as-is path', d: 'Any cleanout, preparation, repair, or purchase responsibility must be stated in later written transaction terms.' },
      { t: 'Terms control the timeline', d: 'Any price, scope, contingency, or closing date exists only in an accepted written agreement.' },
    ],
    rich: ['proof', 'faq'],
    quote: 'Start with the owner’s constraints and the property facts—not a predetermined product.',
    forYou: [
      'You own a clean, ready property and want to ask about current seller-representation availability',
      'You own something distressed, inherited, occupied, or stalled and want to organize the facts and possible paths',
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
      { q: 'Will you actually buy it, or just list it?', a: 'Neither is promised. A purchase may be considered after diligence; representation may be available under a separate brokerage agreement.' },
      { q: 'What condition does it need to be in?', a: 'You may submit the current condition. Pegasus does not promise that any condition, property type, or situation will be reviewed or accepted.' },
      { q: 'How fast can you close?', a: 'There is no public closing timeline. Any timing depends on title, financing, diligence, counterparties, documents, and accepted terms.' },
    ],
    form: {
      role: 'Seller',
      intent: 'seller',
      heading: <>Tell us about the property</>,
      lead: 'Share what you are working with for possible consideration. No review, path, or response time is promised.',
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
    lead: 'Choose the lane that matches the request: licensed buyer representation, investor-interest intake, or discretionary access to the controlled MarketFlow pilot. These lanes are separate and none promises inventory, service, access, or a response.',
    points: [
      { t: 'Possible buyer representation', d: 'Availability, duties, search scope, fees, and brokerage relationship must be confirmed in a signed agreement.' },
      { t: 'Buy-box questions', d: 'Educational tools can help frame location, condition, cost, and exit assumptions without recommending a purchase.' },
      { t: 'Independent diligence', d: 'Condition, scope, title, financing, value, and specialist findings require qualified professionals.' },
      { t: 'Offer terms are specific', d: 'No offer strategy, acceptance, price, savings, or portfolio result is promised publicly.' },
    ],
    splits: buyerSplits,
    rich: ['marketflow', 'faq'],
    quote: 'A buyer decision should separate verified property facts from assumptions and future scope.',
    forYou: [
      'You want to ask about current buyer-representation availability',
      'You want to organize buy-box, diligence, cost, and value questions before deciding',
      'You want to submit an investor-interest mandate without requesting representation',
      'You want to request access to the controlled MarketFlow pilot',
    ],
    notFit: [
      'You want to be rushed into a decision before the numbers are clear',
      'You are looking exclusively for a fixer to renovate entirely on your own with no guidance',
    ],
    secondary: { label: 'See the work in MarketFlow', route: 'marketflow' },
    faqAnchor: 'working-with-pegasus',
    faq: [
      { q: 'How do I see what is available?', a: 'Public pages do not promise inventory. MarketFlow is a controlled pilot with discretionary access and no guaranteed first look or match.' },
      { q: 'What does "buy into the deal" mean?', a: 'A capital relationship would be a private, project-specific transaction requiring suitability review, qualified advice, and signed documents. None is offered by this page.' },
    ],
    form: {
      role: 'Buyer',
      intent: 'buyer',
      heading: <>Share an investor-interest request</>,
      lead: 'Describe the investor-interest mandate for possible consideration. This is not licensed representation, a MarketFlow signup, a capital application, or a promise of inventory, matching, review, or response.',
      submit: 'Submit investor interest',
      third: { label: 'Target area or budget', placeholder: 'East Bay, up to $900K' },
      messageLabel: 'What are you looking for?',
      messagePlaceholder: 'Move-in ready 3 bed, or open to a project to invest in...',
    },
  },

  /* ---------------------------------------------------------- */
  dealfinders: {
    eyebrow: 'Who We Serve / Deal Finders & Wholesalers',
    // COPY_DECK §6 locked hero + required source-attribution note (issue #22)
    title: <>Bring the facts.<br />Set the terms first.</>,
    image: 'pegasus-prop1.png',
    heroScrimTop: true,
    layout: 'ledger',
    pointsLabel: 'Submission boundaries',
    lead: 'Deal finders, wholesalers, agents, contractors, and referral partners may submit an opportunity for possible consideration. Source information is recorded at submission, but confidentiality, exclusivity, distribution, JV, assignment, referral, or compensation rights require separate written terms.',
    points: [
      { t: 'One structured submission', d: 'Send the facts once. Review, price feedback, a buyer, a path, and response timing are not promised.' },
      { t: 'Possible paths stay conditional', d: 'A purchase, partnership, authorized distribution, or MarketFlow record may be discussed only after diligence, capacity review, authorization, and written terms.' },
      { t: 'Source attribution record', d: 'Submission records source information but is not an NDA, exclusivity agreement, or compensation commitment.' },
      { t: 'Buy box preview', d: 'Value-add SFR, East Bay ADU, estates and probate, and small multifamily. See the full buy box before you bring a deal.' },
    ],
    rich: ['buybox', 'faq'],
    quote: 'Bring the facts once. Any review, price discussion, distribution, or transaction requires fit, capacity, and written terms.',
    forYou: [
      'You source overlooked or distressed opportunities',
      'You understand that a buyer, partner, review, and response are not promised',
      'You value clarity on the path over a vague maybe',
    ],
    notFit: [
      'You expect every deal to be purchased or compensated regardless of fit',
      'You are daisy-chaining a deal already shopped to every buyer in the county',
    ],
    secondary: { label: 'See where deals flow', route: 'marketflow' },
    faqAnchor: 'submitting-a-property',
    faq: [
      { q: 'How fast will I hear back?', a: 'There is no public review or response-time commitment. Keep the submission reference as proof of receipt.' },
      { q: 'How do payouts and JV terms work?', a: 'If we move forward, we put your role in writing first, whether that is an assignment, a JV, or another compensation structure. We do not distribute a deal before terms are documented, and not every deal is purchased or compensated.' },
      { q: 'How do you protect my deal?', a: 'The intake records submitted source information. Actual confidentiality, exclusivity, distribution, JV, and compensation rights require separate written terms.' },
    ],
    form: {
      role: 'Deal Finder',
      intent: 'deal-finder',
      heading: <>Send us the deal</>,
      lead: 'Share the address and numbers for possible consideration. No underwriting, answer, buyer, or response time is promised.',
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
    lead: 'Any possible capital relationship would be project specific, privately reviewed, and documented with qualified advisors. No public offering, return, principal protection, pooled fund, or opportunity is promised.',
    points: [
      { t: 'Project-specific only', d: 'This public page does not offer a blind pool, fund, security, project, or participation right.' },
      { t: 'Defined terms required', d: 'Any future transaction documents must state structure, security, priority, timeline, fees, conflicts, and remedies.' },
      { t: 'Independent diligence', d: 'Acquisition, improvement, carry, financing, disposition, tax, legal, and downside assumptions require verification.' },
      { t: 'Risk stays explicit', d: 'No return, principal protection, liquidity, timeline, or exit is promised.' },
    ],
    rich: ['stats', 'faq'],
    quote: 'Capital deserves the truth: real numbers, defined terms, and no promise we cannot keep.',
    forYou: [
      'You want to discuss possible project-specific real estate structures privately',
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
      { q: 'Do you guarantee a return?', a: 'No. This page is not an offering, and no return, principal protection, project, or opportunity is promised.' },
      { q: 'How is my capital secured?', a: 'No security is described publicly. If a transaction is offered, its documents must state structure, security, priority, risks, and remedies.' },
      { q: 'What size projects?', a: 'No current project range or inventory is promised. You may share a mandate for possible private consideration.' },
    ],
    form: {
      role: 'Capital Partner',
      intent: 'capital-partner',
      heading: <>Let us understand your mandate</>,
      lead: 'Share a mandate for possible private consideration. No project, match, review, response, or offering is promised.',
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
    title: <>Submit a vendor<br />profile.</>,
    image: 'pegasus-craft-blueprint.webp',
    layout: 'ledger',
    pointsLabel: 'How we work',
    lead: 'Contractors, trades, designers, architects, photographers, inspectors, lenders, escrow/title partners, and other operators may submit a vendor profile for possible future consideration.',
    points: [
      { t: 'Scope, if offered', d: 'A future project agreement should define deliverables, exclusions, and change control.' },
      { t: 'Payment terms, if offered', d: 'A future agreement should define invoices, draws, retainage, disputes, and remedies.' },
      { t: 'No volume promise', d: 'Application does not promise approval, placement, a project, repeat work, or revenue.' },
      { t: 'Completion criteria', d: 'A future agreement should define inspection, acceptance, handoff, and closeout.' },
    ],
    rich: ['process', 'faq'],
    quote: 'Credentials, scope, price, schedule, change control, and acceptance belong in the project documents.',
    forYou: [
      'You are a GC, sub, agent, lender, title, or inspection partner',
      'You can document credentials, work history, and current capacity',
      'You want future scopes and payment terms documented before work',
    ],
    notFit: [
      'You cannot deliver to a defined standard or timeline',
      'You expect an application to guarantee placement, a project, repeat work, or revenue',
    ],
    secondary: { label: 'See how we build', route: 'development' },
    faqAnchor: 'marketflow-network',
    faq: [
      { q: 'How do you scope work?', a: 'If a future opportunity is offered, the applicable agreement should define scope, price, schedule, changes, and completion.' },
      { q: 'How do payments work?', a: 'No payment or project is promised by applying. Any later agreement should define invoice, draw, retainage, dispute, and remedy terms.' },
    ],
    form: {
      role: 'Operator',
      intent: 'operator',
      heading: <>Tell us what you do</>,
      lead: 'Share your trade, service area, credentials, and capacity. Application does not promise review, approval, work, or follow-up.',
      submit: 'Submit Operator Profile',
      third: { label: 'Trade / service & area', placeholder: 'Licensed GC, East Bay' },
      messageLabel: 'About your work',
      messagePlaceholder: 'Capacity, specialties, licenses...',
    },
  },

  /* ---------------------------------------------------------- */
  referral: {
    eyebrow: 'Who We Serve / Referral Partners',
    // COPY_DECK §10 locked hero + required lawful-compensation note (issue #22)
    title: <>Share an introduction.<br />Set boundaries first.</>,
    image: 'nelson/nelson-exterior-1280.jpg',
    layout: 'timeline',
    pointsLabel: 'How it works',
    lead: 'For professionals and trusted contacts who know a property owner, investor, or situation that may need a structured path. Referral compensation, JV participation, or professional coordination is handled only where lawful, permitted, and agreed in writing.',
    points: [
      { t: 'Written terms before compensation', d: 'Any lawful referral or JV compensation requires eligibility review and a signed agreement; none is promised by submission.' },
      { t: 'Permission and roles', d: 'Confirm the contact permits the introduction and document each party’s role, privacy expectations, and boundaries.' },
      { t: 'No review promise', d: 'An introduction may receive no review, response, service, or transaction.' },
      { t: 'Updates depend on consent', d: 'Any status sharing depends on privacy, authorization, and the applicable written relationship.' },
    ],
    rich: ['faq'],
    heroScrimTop: true,
    quote: 'An introduction should begin with permission, limited context, clear roles, and lawful written terms.',
    forYou: [
      'You are an agent, attorney, advisor, contractor, or trusted professional',
      'You encounter property owners, buyers, operators, or deal sources outside your own lane',
      'You understand that engagement, updates, compensation, and outcomes are not promised',
    ],
    notFit: [
      'You are looking to sell lead lists rather than refer real people in real situations',
      'You expect an outcome commitment before the situation is reviewed',
    ],
    secondary: { label: 'Understand our standard', route: 'about' },
    faqAnchor: 'working-with-pegasus',
    faq: [
      { q: 'How are referrals compensated?', a: 'No compensation is promised. Any lawful fee or JV economics require eligibility review, required licenses or disclosures, and a signed agreement before services or distribution.' },
      { q: 'What types of professionals refer to Pegasus?', a: 'Estate attorneys, real estate agents with clients outside their lane, financial advisors, contractors, CPAs, and others who encounter property situations they cannot fully service themselves.' },
      { q: 'What happens to my contact?', a: 'An introduction creates no review, response, service, confidentiality, outcome, or relationship-protection guarantee. The contact controls whether to engage.' },
    ],
    form: {
      role: 'Referral Partner',
      intent: 'referral',
      heading: <>Submit a referral</>,
      lead: 'With the person’s permission, share limited context for possible consideration. No engagement, fee, update, or response is promised.',
      submit: 'Submit a Referral',
      third: { label: 'Your profession', placeholder: 'Estate attorney · Real estate agent · Advisor' },
      messageLabel: 'About the referral',
      messagePlaceholder: 'Who they are, what situation they face, and your relationship to them...',
    },
  },
};
