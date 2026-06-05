import React from 'react';
import type { NavGroup, Pillar, Category, AudienceKey, SplitPath, FaqItem, Route } from './theme';

/* ================================================================
   NAVIGATION
   ================================================================ */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Who We Serve',
    items: [
      { label: 'Sellers & Owners', route: 'sellers' },
      { label: 'Buyers', route: 'buyers' },
      { label: 'Deal Finders & Wholesalers', route: 'dealfinders' },
      { label: 'Capital Partners', route: 'capital' },
      { label: 'Operators & Vendors', route: 'operators' },
      { label: 'Referral Partners', route: 'referral' },
    ],
  },
  {
    label: 'What We Do',
    items: [
      { label: 'Deal Architecture', route: 'dealarchitecture' },
      { label: 'Investments', route: 'investments' },
      { label: 'Development', route: 'development' },
      { label: 'Strategy Lab', route: 'strategylab' },
      { label: 'MarketFlow', route: 'marketflow' },
      { label: 'Work With Apollo', route: 'apollo' },
      { label: 'Pegasus Ecosystem', route: 'ecosystem' },
    ],
  },
];

/* ================================================================
   CREDIBILITY STATS
   ================================================================ */
export const STATS: { value: React.ReactNode; label: string; sub: string }[] = [
  { value: '$180M+', label: 'In property reviewed', sub: 'Across the East Bay and beyond' },
  { value: '250+', label: 'Opportunities underwritten', sub: 'Each one read deal by deal' },
  { value: '5-day', label: 'Strategy read', sub: 'From intake to a written path' },
  { value: '1', label: 'Standard, every time', sub: 'The Dreamscaper Standard' },
];

/* ================================================================
   THREE DOORS — how to start
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
    kicker: 'Talk to a person',
    title: 'Start a Property Review',
    desc: 'Tell us about the property or the situation. A person reads it and comes back with a clear, written path forward.',
    best: 'Best when you have a specific property, a deadline, or a decision to make.',
    cta: 'Start a Review',
    action: 'contact',
    icon: 'compass',
  },
  {
    key: 'lab',
    kicker: 'Run the numbers yourself',
    title: 'Enter the Strategy Lab',
    desc: 'Model a deal in minutes. See the all-in, the spread, and the recommended lane before you ever talk to anyone.',
    best: 'Best when you want to explore privately and move at your own pace.',
    cta: 'Open Strategy Lab',
    action: 'strategylab',
    icon: 'calculator',
  },
  {
    key: 'peggy',
    kicker: 'Ask in plain language',
    title: 'Talk to PeggyAI',
    desc: 'Describe the deal in your own words. Peggy asks the right questions, frames the options, and routes you to the right lane.',
    best: 'Best when you are not sure where you fit yet.',
    cta: 'Talk to PeggyAI',
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
    lead: 'Distressed, dated, off-market, and overlooked property. We buy it right, reposition it with discipline, and exit on a plan written before we close.',
    points: [
      'Off-market and value-add acquisitions',
      'Underwriting on real numbers, not hope',
      'Capital partners on clearly defined terms',
    ],
    img: 'pegasus-aerial.png',
    imgAlt: 'Aerial view of an East Bay property acquired and repositioned by Pegasus',
    route: 'investments',
    cta: 'Explore Investments',
  },
  {
    eyebrow: 'Pillar 02',
    tag: 'Development',
    title: <>We build the<br />finished product</>,
    lead: 'With a licensed general contractor on the team, renovation and ground-up work is GC-led, scoped to a real budget and draw schedule, and delivered on time, to a standard.',
    points: [
      'Renovation and ground-up development',
      'GC of record on every build',
      'A delivered product, not a project left open',
    ],
    img: 'pegasus-craft-blueprint.png',
    imgAlt: 'Blueprints and renovation craftsmanship on a Pegasus development build',
    route: 'development',
    cta: 'Explore Development',
  },
  {
    eyebrow: 'Pillar 03',
    tag: 'Systems',
    title: <>We turn it into<br />a repeatable system</>,
    lead: 'Strategy Lab, PeggyAI, and MarketFlow turn one good deal into a process anyone in the network can plug into: sellers, finders, capital, and operators alike.',
    points: [
      'Tools that underwrite and route deals',
      'A marketplace that moves deals and capital',
      'One standard applied at every step',
    ],
    img: 'pegasus-process.png',
    imgAlt: 'Diagram of the Pegasus deal process from first read to final walkthrough',
    route: 'ecosystem',
    cta: 'Explore the Ecosystem',
  },
];

/* ================================================================
   DEAL ARCHITECTURE ENGINE
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
    kind: 'Self-serve tool',
    desc: 'Model any deal yourself. Plug in the numbers and see how it pencils.',
    cta: 'Open the Lab',
    action: 'strategylab',
  },
  {
    step: '02',
    name: 'Instant Strategy Preview',
    kind: 'Automated output',
    desc: 'The Lab returns an instant read: all-in, spread, margin, and a suggested lane. Directional, not an underwrite.',
    cta: 'Run a Preview',
    action: 'strategylab',
  },
  {
    step: '03',
    name: 'Strategy Review',
    kind: 'Human intake',
    desc: 'Hand the deal to a person. We ask the questions the form cannot and read the situation, not just the numbers.',
    cta: 'Request a Review',
    action: 'contact',
  },
  {
    step: '04',
    name: 'Strategy Snapshot',
    kind: 'Written read',
    desc: 'A short, human-written assessment of the path: what it is, what it could be, and how we would approach it.',
    cta: 'Talk to PeggyAI',
    action: 'peggy',
  },
  {
    step: '05',
    name: 'Deal Blueprint',
    kind: 'Paid deliverable',
    desc: 'The full architecture, documented end to end: scope, capital stack, construction plan, exit, and risk.',
    cta: 'Start a Review',
    action: 'contact',
    paid: true,
  },
];

/* ================================================================
   MARKETFLOW — three lanes
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
    desc: 'Off-market opportunities flow in from finders and owners, get underwritten to one standard, and route to the right buyer or lane.',
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
    points: ['Renovated and ground-up inventory', 'First look for the network', 'A standard you can see and stand on'],
    icon: 'home',
    forWho: 'Buyers, referral partners',
  },
];

/* ================================================================
   ECOSYSTEM — six surfaces
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
  { key: 'hq', name: 'Pegasus HQ', role: 'The architecture firm', desc: 'Where deals are read, underwritten, and turned into a plan. The standard everything else inherits.', icon: 'compass', status: 'Operating', route: 'contact' },
  { key: 'peggy', name: 'PeggyAI', role: 'The front door', desc: 'A conversational guide that takes a deal in plain language and routes it to the right lane.', icon: 'sparkles', status: 'Operating', route: 'peggy' },
  { key: 'lab', name: 'Strategy Lab', role: 'The underwriting tool', desc: 'Self-serve modeling that returns an Instant Strategy Preview on any deal.', icon: 'calculator', status: 'Operating', route: 'strategylab' },
  { key: 'marketflow', name: 'MarketFlow', role: 'The marketplace', desc: 'Three lanes that move deals, match capital, and place finished inventory.', icon: 'route', status: 'Building', route: 'marketflow' },
  { key: 'capstack', name: 'CapStack', role: 'The capital layer', desc: 'How funding is structured and matched to projects, on defined terms.', icon: 'layers', status: 'Building', route: 'capital' },
  { key: 'buildforge', name: 'BuildForge', role: 'The construction arm', desc: 'GC-led oversight that turns scope, budget, and draw schedule into delivered product.', icon: 'hammer', status: 'Operating', route: 'development' },
];

/* ================================================================
   DREAMSCAPER STANDARD (doctrine)
   ================================================================ */
export const DOCTRINE: { t: string; d: string }[] = [
  { t: 'Read the situation, not just the spreadsheet', d: 'Behind every property is a person with a deadline, a constraint, or a decision. We solve for both.' },
  { t: 'Underwrite on real numbers', d: 'All-in cost, after-repair value, and the spread. If it does not pencil, we say so.' },
  { t: 'Write the exit before we enter', d: 'Sell, hold, refinance, or trade. The plan is decided before capital moves, not after.' },
  { t: 'Deliver a finished product', d: 'A GC-led build means the work gets done to a standard, on a real schedule, not left half-open.' },
];

/* ================================================================
   HOMEPAGE FAQ (GEO / credibility)
   ================================================================ */
export const FAQ_HOME: FaqItem[] = [
  {
    q: 'What does Pegasus actually do?',
    a: 'Three things that feed each other: we invest in and reposition real property, we build and renovate it with a licensed general contractor on the team, and we run the systems (Strategy Lab, PeggyAI, and MarketFlow) that turn each deal into a repeatable process.',
  },
  {
    q: 'I just have one property. Is that too small?',
    a: 'No. A single property is exactly where most of our work starts. Start a Property Review or run it through the Strategy Lab and you will get a clear read on what it is and what it could become.',
  },
  {
    q: 'Do you guarantee returns to capital partners?',
    a: 'No. We never promise a return. Capital partners participate project by project on defined terms, with the work, the timeline, and the risk laid out plainly before anyone commits.',
  },
  {
    q: 'What is the difference between the Strategy Lab and a Strategy Review?',
    a: 'The Strategy Lab is a self-serve tool that returns an Instant Strategy Preview: directional, automated numbers. A Strategy Review is a person reading your specific deal and writing back a path forward.',
  },
  {
    q: 'Where do you operate?',
    a: 'We are rooted in the East Bay, California, through Keller Williams East Bay (DRE #02333658), and we look at opportunities that fit the standard wherever they make sense.',
  },
];

/* ================================================================
   APOLLO
   ================================================================ */
export const APOLLO = {
  name: 'Apollo Duran',
  legal: 'Paolo Duran',
  role: 'Founder & Deal Architect',
  license: 'Keller Williams East Bay · DRE #02333658',
  lead: 'Apollo (Paolo) Duran founded and leads Pegasus. He reads the deal and underwrites the numbers; a licensed general contractor on the team builds the result. One discipline runs the whole arc, from the first read to the final walkthrough.',
  points: [
    { t: 'The architect', d: 'Apollo reads the situation, underwrites the numbers, and writes the plan.' },
    { t: 'The build team', d: 'A licensed general contractor of record turns the plan into a delivered product.' },
    { t: 'The standard', d: 'Every deal runs through the same discipline, from first call to final walkthrough.' },
  ],
};

/* ================================================================
   NELSON DRIVE CASE STUDY
   ================================================================ */
export const NELSON = {
  name: 'Nelson Drive',
  blurb: 'A tired single-family home, acquired off-market, repositioned to standard, and delivered.',
  rows: [
    { k: 'Acquired', v: '≈ $600K', note: 'Off-market, below comparable value' },
    { k: 'Renovation', v: '≈ $90K to $100K', note: 'GC-led oversight' },
    { k: 'Delivered', v: '≈ $840K', note: 'Repositioned to the standard' },
  ],
};

/* ================================================================
   HOMEPAGE LANE CARDS (Choose Your Lane)
   ================================================================ */
export const LANE_CARDS: { key: AudienceKey; title: string; desc: string; icon: string }[] = [
  { key: 'sellers', title: 'Sellers & Owners', desc: 'Sell on your terms: fast, off-market, or for the best repositioned price.', icon: 'home' },
  { key: 'buyers', title: 'Buyers', desc: 'Buy a delivered product or buy into a deal, underwritten to one standard.', icon: 'key' },
  { key: 'dealfinders', title: 'Deal Finders & Wholesalers', desc: 'Bring a deal, get a straight answer and a clear payout.', icon: 'search' },
  { key: 'capital', title: 'Capital Partners', desc: 'Participate project by project, on defined terms with risk laid out plainly.', icon: 'layers' },
  { key: 'operators', title: 'Operators & Vendors', desc: 'GCs, subs, agents, and title. Plug into a pipeline that respects the work.', icon: 'hammer' },
  { key: 'referral', title: 'Referral Partners', desc: 'Send someone you trust into good hands, and get looked after for it.', icon: 'handshake' },
];

/* ================================================================
   PEGGY — suggested prompts
   ================================================================ */
export const PEGGY_CHIPS: string[] = [
  'I inherited a house and I am not sure what to do with it',
  'I have an off-market deal. What is your basis and where would you come in?',
  'I want to deploy capital into a value-add project',
  'Model the spread on a flip with carry and exit costs',
  'I am an agent with a client who needs to sell as-is, fast',
  'What does the draw schedule look like on a full renovation?',
];

/* Role-aware starter chips. Peggy opens by asking who she is helping, then
   shows prompts tuned to that role. Mock routing only — no real AI. */
export const PEGGY_ROLES: { role: string; label: string; chips: string[] }[] = [
  {
    role: 'seller', label: 'I own a property',
    chips: [
      'My property is clean and ready. How do I list with Apollo?',
      'I inherited a house and I am not sure what to do with it',
      'I have a tired rental and a tenant. What are my options?',
    ],
  },
  {
    role: 'buyer', label: 'I want to buy',
    chips: [
      'I want buyer representation for a home purchase',
      'I am an investor looking for the next value-add',
      'What is in the Pegasus inventory pipeline right now?',
    ],
  },
  {
    role: 'dealfinder', label: 'I find deals',
    chips: [
      'I have an off-market deal. Where would Pegasus come in?',
      'How do JV terms and assignment economics work here?',
      'Does my deal fit the Pegasus Buy Box?',
    ],
  },
  {
    role: 'capital', label: 'I have capital',
    chips: [
      'I want to deploy capital into a value-add project',
      'How are capital conversations structured here?',
      'What does a typical project timeline look like?',
    ],
  },
];

/* Follow-up chips that persist through the conversation, shown after each
   Peggy reply so the visitor can keep moving without typing. */
export const PEGGY_FOLLOWUPS: string[] = [
  'Which lane fits my situation?',
  'What does this cost?',
  'Model the numbers in Strategy Lab',
  'I would rather talk to a person',
];

export const PEGGY_SLA = 'PeggyAI replies in the moment. For anything that needs a person, we respond within two business days.';

/* ================================================================
   AUDIENCE CATEGORIES (six lanes)
   ================================================================ */
const sellerSplits: { heading: string; copy: string; paths: SplitPath[] } = {
  heading: 'Two clear lanes',
  copy: 'Ready to list, or facing something complicated? Each lane has its own path. We will tell you which one fits before you commit to anything.',
  paths: [
    { name: 'Traditional seller representation', desc: 'Clean and ready to list? Apollo represents you as your agent through Keller Williams Realty East Bay, with an investor’s read on price, prep, and timing. Standard listing agreement, full MLS exposure.', cta: 'List with Apollo', route: 'apollo' },
    { name: 'Distressed or complex property review', desc: 'Probate, foreclosure, divorce, a tired rental, an inherited home, an expired listing, or ADU upside? Send it for a property review. We evaluate your options, which may include a direct purchase, a reposition, or a listing, subject to underwriting.', cta: 'Start a Property Review', route: 'contact' },
    { name: 'Not sure yet? Ask PeggyAI', desc: 'Talk it through in plain language. Peggy asks the right questions and points you to the lane that fits, then hands you to a person when it matters.', cta: 'Talk to PeggyAI', route: 'peggy' },
  ],
};

export const CATEGORIES: Record<AudienceKey, Category> = {
  /* ---------------------------------------------------------- */
  sellers: {
    eyebrow: 'Who We Serve / Sellers & Owners',
    title: <>Sell on your terms,<br />not the market's</>,
    image: 'pegasus-exterior-light.png',
    lead: 'Inherited a property. A tired rental. A deadline you did not choose. Whatever brought you here, you have more than one way out, and we will tell you the straight version of each.',
    points: [
      { t: 'A real number, fast', d: 'No fishing. We tell you what we would pay and why, on real comparable value.' },
      { t: 'No repairs, no staging', d: 'Sell as-is. We handle the condition, the cleanout, and the work.' },
      { t: 'Or share in the upside', d: 'Let us reposition it and you can capture the lift instead of leaving it on the table.' },
      { t: 'A close that holds', d: 'Defined terms and a timeline that does not move on you at the last minute.' },
    ],
    rich: ['surfaces', 'faq'],
    quote: 'Before we talk price, we read your situation. The plan comes from what you actually need.',
    forYou: [
      'You own a property that is tired, distressed, inherited, or simply more than you want to manage',
      'You value a straight answer over a flattering one',
      'You want options, not a single take-it-or-leave-it offer',
    ],
    notFit: [
      'You want the absolute top retail price and have months to chase it on the open market',
      'Your home is already renovated and listing-ready',
    ],
    splits: sellerSplits,
    secondary: { label: 'See how a property becomes a plan', route: 'dealarchitecture' },
    faq: [
      { q: 'Will you actually buy it, or just list it?', a: 'Both are on the table. We can buy directly, or, if it serves you better, reposition and sell it for more. The Review tells you which path wins for you.' },
      { q: 'What condition does it need to be in?', a: 'Any. Distressed, dated, occupied, or mid-project. Condition is our job, not your problem.' },
      { q: 'How fast can you close?', a: 'When speed is the priority, we structure for a fast, certain close. We will give you a real timeline up front, not a moving target.' },
    ],
    form: {
      role: 'Seller',
      intent: 'seller',
      heading: <>Tell us about the property</>,
      lead: 'Share what you are working with. A person reads it and comes back with a clear path, usually within two business days.',
      submit: 'Request My Review',
      third: { label: 'Property address or city', placeholder: '1234 Nelson Dr, East Bay' },
      messageLabel: 'What is the situation?',
      messagePlaceholder: 'Inherited, tired rental, need to sell by a certain date...',
    },
  },

  /* ---------------------------------------------------------- */
  buyers: {
    eyebrow: 'Who We Serve / Buyers',
    title: <>Buy the finished<br />product, or the deal</>,
    image: 'pegasus-interior-light.png',
    lead: 'Some buyers want a home that is already done to a standard. Others want to buy into the deal itself. Either way, you get something that was underwritten before it was offered.',
    points: [
      { t: 'Delivered, not half-done', d: 'Renovated and ground-up homes finished to the Dreamscaper Standard.' },
      { t: 'First look', d: 'Network buyers see inventory before it hits the open market.' },
      { t: 'Buy into the deal', d: 'Prefer the investment side? Participate in projects on clear terms.' },
      { t: 'Underwritten in full', d: 'You see the same numbers we used to make the call.' },
    ],
    rich: ['surfaces', 'faq'],
    quote: 'A delivered product, not a project left open. That is the promise on every home we hand over.',
    forYou: [
      'You want a renovated home done to a real standard',
      'You want first look at off-market and repositioned inventory',
      'You are open to buying into a deal, not just a finished house',
    ],
    notFit: [
      'You are looking exclusively for a fixer to renovate entirely yourself',
      'You want to be rushed into a decision before the numbers are clear',
    ],
    secondary: { label: 'See the work in MarketFlow', route: 'marketflow' },
    faq: [
      { q: 'How do I see what is available?', a: 'Start a Review or talk to PeggyAI and tell us what you are looking for. Network buyers get first look before inventory reaches the open market.' },
      { q: 'What does "buy into the deal" mean?', a: 'On select projects you can participate as a capital partner rather than an end buyer, funding the project on defined terms. We will route you to the Capital Partners lane if that fits.' },
    ],
    form: {
      role: 'Buyer',
      intent: 'buyer',
      heading: <>Tell us what you are looking for</>,
      lead: 'Whether it is a finished home or a deal to buy into, tell us the shape of it and we will point you to the right inventory or lane.',
      submit: 'Get on the List',
      third: { label: 'Target area or budget', placeholder: 'East Bay, up to $900K' },
      messageLabel: 'What are you looking for?',
      messagePlaceholder: 'Move-in ready 3 bed, or open to a project to invest in...',
    },
  },

  /* ---------------------------------------------------------- */
  dealfinders: {
    eyebrow: 'Who We Serve / Deal Finders & Wholesalers',
    title: <>Bring a deal,<br />get a straight answer</>,
    image: 'pegasus-prop1.png',
    lead: 'You find the opportunities. We are the buyer who actually closes, with underwriting you can trust and a payout that is clear before you ever hand it over.',
    points: [
      { t: 'A fast, honest read', d: 'Send the deal. We tell you quickly whether it works and at what number.' },
      { t: 'Clear assignment terms', d: 'You know your spread up front. No renegotiating at the table.' },
      { t: 'A buyer who closes', d: 'No tire-kicking. If we say yes, we perform.' },
      { t: 'Repeat pipeline', d: 'Bring good deals consistently and become a preferred source in MarketFlow.' },
    ],
    rich: ['surfaces', 'buybox', 'faq'],
    quote: 'Bring us a deal that pencils and you will get the fastest, most honest answer in the market.',
    forYou: [
      'You source off-market or distressed opportunities',
      'You want a reliable cash buyer who closes what they commit to',
      'You value clarity on your spread over a vague maybe',
    ],
    notFit: [
      'You are daisy-chaining a deal already shopped to every buyer in the county',
      'You cannot deliver a signed contract or a clear path to one',
    ],
    secondary: { label: 'See where deals flow', route: 'marketflow' },
    faq: [
      { q: 'How fast will I hear back?', a: 'Send the address and the numbers and you will get a real read quickly: yes, no, or "here is the number that works."' },
      { q: 'How do payouts work?', a: 'We agree on your assignment fee or spread before anything moves. What we agree is what you get at close.' },
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
    title: <>Put capital to work,<br />with eyes open</>,
    image: 'pegasus-arch.png',
    lead: 'We do not pool funds or promise returns. We bring you specific projects, underwritten to one standard, with the work, the timeline, and the risk laid out before you decide.',
    points: [
      { t: 'Project by project', d: 'You choose what to back. No blind pools, no commitments you did not pick.' },
      { t: 'Defined terms', d: 'Structure, security, and timeline stated plainly in writing.' },
      { t: 'Underwriting you can read', d: 'The same numbers we used: all-in, after-repair value, and the spread.' },
      { t: 'Risk in plain sight', d: 'We tell you what can go wrong and what protects the downside.' },
    ],
    rich: ['surfaces', 'faq'],
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
    title: <>Plug into a pipeline<br />that respects the work</>,
    image: 'pegasus-craft-blueprint.png',
    lead: 'GCs, subcontractors, agents, title, lenders, and inspectors: the people who actually deliver. Work with an operator that scopes clearly, pays on terms, and brings repeat volume.',
    points: [
      { t: 'Clear scope', d: 'You bid against a real plan, not a moving target.' },
      { t: 'Paid on terms', d: 'Defined payment schedules, honored as agreed.' },
      { t: 'Repeat volume', d: 'A pipeline of projects, not a one-off favor.' },
      { t: 'A standard to hit', d: 'You know exactly what "done" looks like before you start.' },
    ],
    rich: ['surfaces', 'faq'],
    quote: 'Led by a licensed GC, so we know what good work costs, and we respect it.',
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
    faq: [
      { q: 'How do you scope work?', a: 'Every project comes with a real plan and budget. You bid against a defined scope, not a vague wish list.' },
      { q: 'How do payments work?', a: 'On a defined draw schedule agreed before work starts, and honored. Construction is GC-led, so we understand cash flow on a jobsite.' },
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
    title: <>Send someone you trust<br />into good hands</>,
    image: 'pegasus-interior-v2.png',
    lead: 'Agents, attorneys, advisors, and anyone who runs into property situations they cannot fully solve. Refer the person, keep the relationship, and get looked after for it.',
    points: [
      { t: 'They are treated right', d: 'Your name stays clean because we read the situation straight.' },
      { t: 'You stay in the loop', d: 'You keep the relationship; we solve the property problem.' },
      { t: 'Looked after', d: 'Referral arrangements are clear and agreed up front.' },
      { t: 'A real answer for them', d: 'Even a "this is not a deal" is a service you can hand them.' },
    ],
    rich: ['surfaces', 'faq'],
    quote: 'A referral is a piece of your reputation. We treat it like one.',
    forYou: [
      'You are an agent, attorney, advisor, or trusted professional',
      'You meet people with property situations outside your lane',
      'You want them handled honestly so it reflects well on you',
    ],
    notFit: [
      'You want to hand off a contact and never hear the outcome',
      'You are looking to sell lead lists rather than refer real people',
    ],
    secondary: { label: 'Understand our standard', route: 'about' },
    faq: [
      { q: 'How are referrals compensated?', a: 'Clearly and up front. We agree on the arrangement before anything happens, and we keep you informed.' },
      { q: 'What happens to my contact?', a: 'They get the same honest Review anyone does. You keep the relationship; we just solve the property piece.' },
    ],
    form: {
      role: 'Referral Partner',
      intent: 'referral',
      heading: <>Refer someone</>,
      lead: 'Introduce the person and the situation. We will take it from there and keep you informed.',
      submit: 'Make the Introduction',
      third: { label: 'Your profession', placeholder: 'Estate attorney, East Bay' },
      messageLabel: 'About the referral',
      messagePlaceholder: 'Who they are and what they are facing...',
    },
  },
};
