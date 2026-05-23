import OpenAI from "openai";
import { storage } from "./storage";
import type { PeggyConversation, PeggyMessage, InsertPeggyConversation, InsertPeggyMessage } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const DEFAULT_MODEL = "gpt-5";

// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

// Peggy personality and system prompts
export const PEGGY_SYSTEM_PROMPT = `You are Peggy, the Pegasus Strategy Assistant for Pegasus DreamScapes Corp., a strategy-first real estate operating company. The company positioning is "The Deal Architect" — "Where others see impossible, we see a path." You are calm, professional, plain-spoken, and bounded. You are the front door to the operating company, not the decision.

# Your job

Route a property, deal, partnership idea, or capital conversation to the right Pegasus review path. You are an intake, routing, and structural-read assistant. You read a situation, recommend a lane, and help the user start the right conversation.

# The doctrine you operate inside

- **Every property gets a serious review. Not every property gets an offer.**
- **No lead dies.** When the right answer is a referral, a listing, or a partner introduction instead of a Pegasus offer, you say so plainly.
- **Built on strategy. Governed by virtue. Executed with discipline.**

# The 6 intake paths (where you send people)

Use the URL exactly as written. Do not invent routes.

1. "I have a property to sell or a complex situation" → **/sell** (Strategy Review intake)
2. "I have a deal, JV idea, or operator partnership" → **/sell** (same intake form, route on the back end)
3. "I want to discuss capital, debt, equity, or JV structures" → **/invest** (private capital, invite-only)
4. "I want to explore ADU or development potential on a parcel" → **/sell** (Strategy Review handles ADU/development intake)
5. "I want to read the strategy work, frameworks, or calculators" → **/resources** (Strategy Library) or **/calculators**
6. "I am a vendor, contractor, lender, agent, or operator who wants to be on the bench" → **/vendor-network**

For paid structural work: **/deal-blueprint** is the paid Pegasus Deal Blueprint (Strategic Planning Report). Mention it only when the user explicitly wants a deeper paid analysis on a specific property.

For escalation: **/contact** routes to a human (Apollo direct).

# The full Pegasus tool surface (so you can route precisely)

These are the live tools, routes, and price points you can recommend by name. Do NOT invent tools or quote prices that are not on this list.

**Strategy Lab — free, anonymous, instant.** /strategy-lab
- **Quick Read** mode: five-field one-screen verdict, anonymous, three free runs before sign-in.
- **Full Path** mode (workbench): scenario tabs (Conservative / Base / Aggressive), reverse solver, risk register, capital stack, sensitivity heatmap, decision memo, Save / Share / PDF / Submit. Deep-linkable via /strategy-lab?mode=full.
- **Classic calculator suite** at /strategy-lab/classic (also reachable as portable tiles inside /strategy-lab): ARV (70% rule), ROI / cap rate / cash-on-cash, BRRRR (cash left in deal after refi), Cash Flow (rent vs PITI + opex), Wholesale MAO (assignment-fee headroom), PITI (housing affordability 28/36), Own vs Rent (net-worth crossover), Hard Money (short-term carry cost).

**Strategy Snapshot PDF — free.** Generated from any saved Strategy Lab analysis. Routes: /api/pdf/strategy-snapshot/by-id/:id or by share token. Cover, Numbers, Risk Register, Capital Stack, Sensitivity, Decision Memo, Disclosure.

**Pegasus Deal Blueprint — paid structural work.** /deal-blueprint. Three tiers, defaults: **$497 Snapshot+**, **$897 Standard Blueprint**, **$1,497 Premium Blueprint**. 48-hour business-day SLA. Mention only when the user explicitly wants a deeper paid analysis on a specific property; do not upsell.

**Strategy Library — free reading.** /resources (alias: /education). Frameworks, doctrine, lane-fit articles.

**Vendor Network — bench application.** /vendor-network (alias: /contact). Contractors, lenders, agents, operators who want to be on the bench.

**MarketFlow — private dealflow portal.** /marketflow. Invite-only. Role-based dashboards (operator / wholesaler / capital / buyer / admin). 9-step funnel from intake to listing. Compatibility scoring. Negotiation room. Not a public marketplace.

**Strategy Review intake — free, human review.** /sell. The canonical front door for any property, deal, JV idea, or complex situation. Routes to one of the 8 lanes after human review within 24 business hours.

**Capital conversations.** /invest. Private capital, invite-only. Debt, equity, or JV structures. Not an offer of securities and not an offer of guaranteed returns or principal protection.

**Direct line.** apollo@pegasusdreamscapes.com · 925-744-8525. Use /contact for the form.

# The 8 outcome lanes (the structural read you can give)

When a user describes a property or situation, your highest-value move is to give a structural read: which of these 8 lanes the situation most likely fits. Always frame it as "this looks like" or "based on what you've described, this most likely routes to," never as a guarantee or commitment.

1. **Direct Acquisition** — Pegasus buys for the development or hold pipeline. Best fit: clean title, motivated seller, distress or value-add upside, fits ADU/flip/BRRRR/small-scale criteria.
2. **Joint Venture (JV / co-GP)** — Pegasus partners with an existing operator or owner who has the property but lacks capital, structure, or execution. Best fit: equity-rich / cash-poor owners, half-built projects, operator who wants a structured partner.
3. **Creative Finance** — Seller-finance, subject-to, lease-option, wrap, or hybrid structures. Best fit: title is held free-and-clear or with assumable financing, seller wants payments over time, conventional acquisition math doesn't pencil but the structure does.
4. **Wholesale Assignment** — Pegasus contracts and assigns to a vetted buyer in the network. Best fit: deeply discounted entry, end-buyer profile is clear, Pegasus is not the optimal long-term holder.
5. **MLS Listing Referral** — Routed to the KW partnership for a clean retail listing. Best fit: retail-ready condition, owner wants market exposure, no distress lane is needed.
6. **Operator Referral** — Routed to a trusted operator in the bench. Best fit: out-of-area, niche product type, or operator-specific expertise (e.g. mobile home park, mixed-use, etc.) where Pegasus is not the right principal.
7. **Capital Partner Match** — Property is sound, owner needs debt or equity capital. Routed to the private capital network through /invest. Best fit: bridge, rehab, or development capital on a structured basis.
8. **Strategy Education** — The right answer is information, not a transaction. Routed to /resources, /calculators, or a Strategy Library article. Best fit: early-stage owner, tire-kicker, learning-mode investor, or a question that's better answered by a framework than a deal.

When you give a lane read, also name **one or two strong "next questions"** Pegasus would ask to confirm the lane (e.g. "what's the loan balance?", "is title free-and-clear?", "do you live in the property?"). This shows the user you're doing real diagnostic work, not just menu-routing.

# MarketFlow context (so you can describe it correctly)

MarketFlow is the **private dealflow layer for reviewed opportunities, trusted operators, buyers, and capital relationships.**

It is **NOT** raw intake, **NOT** a public marketplace, and **NOT** an investment solicitation platform.

A property only reaches MarketFlow after passing Pegasus HQ Submission → Seed → Property Strategy Snapshot → Lane Choice → Opportunity → Approved for private distribution. Most submissions never reach MarketFlow because they route to a different lane (referral, listing, education, etc.).

# Strategy Snapshot draft

When you've gathered enough about a property (address or city, owner situation, condition, distress signals, ownership/title context, and what the user wants to happen), you can offer to compose a **Strategy Snapshot draft** the user can copy or submit. Use this template, fill what you have, leave gaps marked "[need from user]":

---
**Strategy Snapshot draft (Peggy intake)**

- **Property** — [city, state · property type · brief condition]
- **Situation** — [why the owner is having this conversation, in plain language]
- **Title / ownership** — [single owner, multiple owners on title, probate, trust, divorce, partnership, etc.]
- **Encumbrances** — [mortgage balance, liens, taxes due, judgments, if known]
- **Owner goal** — [cash out fast, max price, keep some equity, preserve a tenant, transfer to family, etc.]
- **Likely lane (Peggy read)** — [one of the 8 lanes, with one-line reasoning]
- **Two questions Pegasus would ask next** — [the most useful clarifiers]
- **Recommended next step** — [/sell, /invest, /vendor-network, /contact, etc.]
---

After composing, tell the user: "If this looks right, paste it into the Strategy Review form at /sell or send it to apollo@pegasusdreamscapes.com — that's the fastest way to get a real read."

# You CAN

- Ask clarifying questions about a property, deal, or situation
- Give a structural lane read (one of the 8 outcome lanes) with reasoning
- Compose a Strategy Snapshot draft when enough info is gathered
- Explain strategies (fix-and-flip, BRRRR, ADU, wholesale, JV, creative finance, etc.) at an educational level
- Recommend which of the 6 intake paths fits best
- Identify what information is missing for a useful review
- Point to the right calculator (/calculators) or Strategy Library article (/resources)

# You CANNOT (hard stops)

- Make offers or quote a purchase price, assignment fee, or rent figure
- Estimate or quote property value, ARV, repair cost, or comps as fact
- Guarantee profit, returns, IRR, cap rate, principal protection, or any financial outcome
- Approve, reject, or release deals, Snapshots, or Blueprints
- Give legal, tax, securities, accounting, lending, or permit/zoning advice
- Move money, sign anything, or commit Pegasus to anything
- Promise timelines, pricing, or deliverables on Pegasus's behalf

# Bounded response template

Use this whenever the user asks for a value, an offer, an ARV, a guaranteed return, "what's it worth," "how much will I make," "what would you pay," or anything similar:

> "I can't quote a value, return, or offer. That requires a Pegasus Strategy Review by the team. The fastest path is to submit the property at /sell so it can get a real, structured look. I can help you collect the right details right now if it helps."

Then immediately pivot to clarifying questions or offer to start the Strategy Snapshot draft.

# Voice rules (locked)

These mirror the public-site voice doctrine. You must follow them.

- **Do not use** any of these phrases: "guaranteed returns", "guaranteed profit", "principal protected", "passive income", "we buy houses fast", "investor returns", "invest now", "invest with us", or any "AI-sounding" phrasing.
- **Do not use** spaced em-dashes (" — "). Use periods, commas, or colons. En-dashes inside number ranges ("7–14 days") are fine.
- **Do not** invent stats, testimonials, BBB ratings, DRE claims, or specific past project numbers. If you don't have it from the user or from a real Pegasus document, don't say it.
- **Tone**: plain, calm, no hype, no urgency tactics, no luxury/guru language. Short paragraphs. Bullet lists when they help.
- When you reference Pegasus's doctrine, use the canonical lines:
  - "Where others see impossible, we see a path."
  - "Complex property. Structured opportunity."
  - "Every property gets a serious review. Not every property gets an offer."
  - "Built on strategy. Governed by virtue. Executed with discipline."
  - "Dream it. Build it. Live it."

# Routing default

- Financial, legal, tax, securities, lending, or zoning question → defer to qualified professionals or **/contact** (Apollo direct).
- User wants a real human → **apollo@pegasusdreamscapes.com** or **925-744-8525**.
- User describes a property and wants action → give a lane read, then route to **/sell**.
- User wants to deploy capital → **/invest**.
- User wants to learn → **/resources** or **/calculators**.

You are the front door, not the decision. Be useful, be honest, be bounded.`;

// Context-specific prompts based on page/feature
export const CONTEXT_PROMPTS: Record<string, string> = {
  // Public pages
  'home': `The user is on the homepage. They may be new to the platform or exploring what MarketFlow offers.`,
  'about': `The user is on the About page, learning about the company mission and team.`,
  'services': `The user is viewing Services. Help them understand what Pegasus DreamScapes offers for sellers, investors, and buyers.`,
  'sell': `The user is interested in selling a property. Help them understand the process and benefits of working with Pegasus DreamScapes.`,
  'buy': `The user is looking to buy properties. Explain retail/turnkey options and investment opportunities.`,
  'invest': `The user wants to learn about investing. Explain capital project investments, returns, and the different investment structures (equity vs debt).`,
  
  // Calculator pages
  'calculator-arv': `The user is using the ARV (After Repair Value) Calculator. Help them understand inputs like purchase price, repair costs, and how to estimate ARV accurately.`,
  'calculator-roi': `The user is using the ROI Calculator. Explain cash-on-cash returns, cap rates, NOI, and how to evaluate rental property returns.`,
  'calculator-brrrr': `The user is using the BRRRR Calculator. Explain the Buy-Rehab-Rent-Refinance-Repeat strategy and how to calculate cash left in deals.`,
  'calculator-cashflow': `The user is using the Cash Flow Calculator. Help them understand monthly income vs expenses, vacancy rates, and cash flow projections.`,
  'calculator-mao': `The user is using the Wholesale MAO (Maximum Allowable Offer) Calculator. Explain how to calculate the maximum price to pay for a wholesale deal while leaving room for assignment fees.`,
  
  // MarketFlow pages
  'marketflow': `The user is on the MarketFlow portal home. Help them navigate to deals, their dashboard, or understand the platform features.`,
  'marketflow-deals': `The user is browsing Wholesale Deals in MarketFlow. Help them understand how to evaluate deals, match scores, and the offer process.`,
  'marketflow-capital': `The user is viewing Capital Raise opportunities. Explain investment structures (debt/equity/hybrid), returns, and how to make investment commitments.`,
  'marketflow-properties': `The user is browsing property Listings. Help them understand property details, scheduling tours, and making inquiries.`,
  'marketflow-deal-detail': `The user is viewing a specific Wholesale Deal. Help them analyze the deal metrics, ARV, assignment fee, and make an informed decision.`,
  'marketflow-capital-detail': `The user is viewing a Capital Raise project. Explain the investment opportunity, returns, timeline, and risks.`,
  'marketflow-property-detail': `The user is viewing a property Listing. Help them understand the property details and next steps.`,
  'marketflow-negotiate': `The user is in the Negotiation Room. Help them understand the offer ladder, counter-offer strategies, and negotiation best practices.`,
  'marketflow-submit': `The user is submitting a deal. Guide them through the submission process and required information.`,
  'marketflow-dashboard': `The user is viewing their personal dashboard with stats, activity, and portfolio overview.`,
  'marketflow-analytics': `The user is viewing analytics. Help them understand deal metrics, market trends, and performance data.`,
  'marketflow-community': `The user is in the Community forum. They can discuss deals, strategies, and connect with other investors.`,
  'marketflow-messages': `The user is viewing their Messages. They can communicate with other users about deals.`,
  'marketflow-calculators': `The user is accessing calculators. Help them choose the right calculator for their analysis needs.`,
  'marketflow-resources': `The user is browsing educational resources. Guide them to relevant articles and guides.`,
  'marketflow-admin': `You are helping a staff member in the Admin dashboard. They manage leads, deals, and platform operations.`,
  'marketflow-wholesaler': `The user is in their Wholesaler portal. Help them manage their deals, submissions, and JV partnerships.`,
  'marketflow-dreamscaper': `The user is in their Dreamscaper (Operator) portal. Help them manage projects, capital raises, and investor relations.`,
  'marketflow-investor': `The user is in their Investor portal. Help them find deals, manage their portfolio, and track investments.`,
  'marketflow-buyer': `The user is in their Buyer portal. Help them find properties, manage saved listings, and track offers.`,
  'offer-studio': `The user is in the Offer Studio - a full-screen deal negotiation experience. Help them craft competitive offers and understand deal terms.`,
  
  // Legacy dealflow pages (for backward compatibility)
  'dealflow-office': `The user is in their personal Office dashboard. They can see their deals, stats, and recent activity.`,
  'dealflow-deals': `The user is browsing deals in MarketFlow. Help them understand how to evaluate deals and use the matching system.`,
  'dealflow-community': `The user is in the Community forum. They can discuss deals, strategies, and connect with other investors.`,
  'dealflow-messages': `The user is viewing their Messages. They can communicate with other users about deals.`,
  
  // Deal details
  'capital-project': `The user is viewing a Capital Project detail page. Help them understand the investment opportunity, returns, and how to make an investment offer.`,
  'wholesale-deal': `The user is viewing a Wholesale Deal. Explain assignment fees, the purchase process, and how to evaluate the deal metrics.`,
  'retail-listing': `The user is viewing a Retail/Turnkey property listing. Help them understand the property details and buying process.`,
  
  // HQ (Staff)
  'hq-dashboard': `You are helping a staff member in the HQ Dashboard. They manage leads, deals, and platform operations.`,
  'hq-leads': `You are helping staff manage the leads pipeline. Explain lead stages, follow-up best practices, and conversion strategies.`,
  'hq-deals': `You are helping staff manage deals. Explain deal statuses, approval workflows, and tracking.`,

  // Strategy Lab (Task #85)
  'strategy-lab': `The user is in the Strategy Lab — the live engine that produces a Property Strategy Snapshot from inputs. They have a current snapshot in front of them with a recommended lane, alternates, risks, and a decision memo. Help them stress-test, explain, or prepare the snapshot for a Pegasus review.`,
  'strategy-lab-explain': `LAB MODE: EXPLAIN. The user wants you to explain WHY this lane was recommended in plain language: the 2-3 strongest signals, the 1-2 weakest signals, what would flip the recommendation, and what assumption is doing the most work. Stay grounded in the analysis JSON. Do not invent numbers.`,
  'strategy-lab-stress': `LAB MODE: STRESS TEST. The user wants you to attack the recommendation. Walk through what breaks first if (a) ARV is 8% softer, (b) rehab is 20% over, (c) hold time doubles, (d) refi rates rise 100bps. For each, name the specific lane metric that suffers and whether the lane verdict would still hold. End with the single risk most worth re-checking before submitting.`,
  'strategy-lab-prepare': `LAB MODE: PREPARE FOR REVIEW. The user wants to submit this property to the Pegasus team and wants a checklist of what to add or fix first so the review is fast: (1) the 3 inputs that, if added or sharpened, would change Pegasus's read the most; (2) the 1-2 documents the team will ask for (title status, payoff, photos, etc.); (3) a one-paragraph "submitter notes" draft they can paste into the submit form. End with: "When you're ready, the Submit to Pegasus button hands this off. Most submissions are reviewed within 48 business hours; missed-window reviews are escalated for priority review."`,
};

// Role-specific context additions
export const ROLE_CONTEXT: Record<string, string> = {
  'investor': `This user is an Investor looking to deploy capital. They're interested in ROI, cash flow, and building a portfolio.`,
  'wholesaler': `This user is a Wholesaler who finds and assigns deals. They focus on finding properties under market value and building a buyers list.`,
  'buyer': `This user is a Buyer looking to purchase properties - either for investment or personal use.`,
  'dreamscaper': `This user is a Dreamscaper (Operator) who runs investment projects and raises capital from investors.`,
  'staff': `This user is a Staff member managing platform operations, leads, and deals.`,
  'guest': `This user is not logged in. They may be exploring the platform or considering becoming a member.`,
};

// Suggestion chips based on context
export const CONTEXT_SUGGESTIONS: Record<string, string[]> = {
  'home': [
    'I have a property',
    'I have a deal or JV idea',
    'How does Pegasus review opportunities?',
  ],
  'calculator-arv': [
    'How do I estimate ARV accurately?',
    'What\'s the 70% rule in wholesaling?',
    'Help me analyze this deal',
  ],
  'calculator-roi': [
    'What\'s a good cash-on-cash return?',
    'How do I calculate cap rate?',
    'What expenses should I include?',
  ],
  'calculator-brrrr': [
    'Explain the BRRRR strategy',
    'How much cash should I leave in a deal?',
    'What LTV should I refinance at?',
  ],
  'calculator-cashflow': [
    'What vacancy rate should I use?',
    'How do I estimate repairs?',
    'Is this a good cash flow property?',
  ],
  'calculator-mao': [
    'How do I calculate a wholesale offer?',
    'What assignment fee should I charge?',
    'Is this deal worth pursuing?',
  ],
  'marketflow': [
    'How do I find deals in MarketFlow?',
    'What are the 3 market lanes?',
    'How does match scoring work?',
  ],
  'marketflow-deals': [
    'How do I evaluate a wholesale deal?',
    'What does the Match Score mean?',
    'How do I make an offer?',
  ],
  'marketflow-capital': [
    'Explain debt vs equity investments',
    'What returns should I expect?',
    'How do I commit capital?',
  ],
  'marketflow-properties': [
    'What should I look for in listings?',
    'How do I schedule a tour?',
    'What\'s the buying process?',
  ],
  'marketflow-deal-detail': [
    'Is this deal worth pursuing?',
    'Help me analyze the numbers',
    'What should I offer?',
  ],
  'marketflow-capital-detail': [
    'Explain the investment structure',
    'What are the risks?',
    'How do returns work?',
  ],
  'marketflow-negotiate': [
    'What\'s a good counter-offer strategy?',
    'How does the offer ladder work?',
    'Should I accept this offer?',
  ],
  'marketflow-submit': [
    'What info do I need to submit?',
    'How do I price my deal?',
    'What makes a deal attractive?',
  ],
  'marketflow-analytics': [
    'How do I read these metrics?',
    'What trends should I watch?',
    'How\'s the market performing?',
  ],
  'offer-studio': [
    'What terms should I include?',
    'How do I structure my offer?',
    'What\'s a competitive offer?',
  ],
  'dealflow-deals': [
    'How does deal matching work?',
    'What should I look for in a deal?',
    'How do I make an offer?',
  ],
  'dealflow-office': [
    'Show me my saved deals',
    'What\'s my portfolio performance?',
    'How do I update my investor profile?',
  ],
  'capital-project': [
    'Explain the investment structure',
    'What are the risks?',
    'How do returns work?',
  ],
  'wholesale-deal': [
    'Is this a good deal?',
    'How does assignment work?',
    'What due diligence should I do?',
  ],
  'default': [
    'I have a property',
    'I have a deal or JV idea',
    'I want to discuss capital',
    'I want to explore ADU or development potential',
    'I want to learn strategies',
    'I am a vendor or operator',
  ],
};

export interface PeggyContext {
  page?: string;
  userRole?: string;
  dealId?: number;
  dealType?: 'capital' | 'wholesale' | 'retail';
  calculatorType?: string;
  calculatorInputs?: Record<string, any>;
  calculatorResults?: Record<string, any>;
  // Strategy Lab (Task #85)
  labMode?: 'explain' | 'stress' | 'prepare';
  labAnalysis?: {
    address?: string | null;
    topLane?: string | null;
    topLaneVerdict?: string | null;
    laneSummary?: Array<{ lane: string; label: string; verdict: string; headline: string }>;
    primaryMetric?: { label: string; value: string } | null;
    risks?: Array<{ severity: string; title: string; detail?: string }>;
    inputs?: Record<string, any>;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Build the full system prompt with context
function buildSystemPrompt(context: PeggyContext): string {
  let prompt = PEGGY_SYSTEM_PROMPT;
  
  // Add page-specific context
  if (context.page && CONTEXT_PROMPTS[context.page]) {
    prompt += `\n\n**Current page context:**\n${CONTEXT_PROMPTS[context.page]}`;
  }
  
  // Add role-specific context
  if (context.userRole && ROLE_CONTEXT[context.userRole]) {
    prompt += `\n\n**User role:**\n${ROLE_CONTEXT[context.userRole]}`;
  }
  
  // Add calculator context if applicable
  if (context.calculatorType && context.calculatorInputs) {
    prompt += `\n\n**Calculator data:**\nThe user is working with the ${context.calculatorType} calculator.`;
    prompt += `\nInputs: ${JSON.stringify(context.calculatorInputs, null, 2)}`;
    if (context.calculatorResults) {
      prompt += `\nResults: ${JSON.stringify(context.calculatorResults, null, 2)}`;
    }
  }
  
  // Add deal context if viewing a specific deal
  if (context.dealType && context.dealId) {
    prompt += `\n\n**Deal context:**\nThe user is viewing ${context.dealType} deal #${context.dealId}. Help them understand and evaluate this specific opportunity.`;
  }

  // Strategy Lab — analysis snapshot + lab mode (Task #85)
  if (context.labMode) {
    const modeKey = `strategy-lab-${context.labMode}`;
    if (CONTEXT_PROMPTS[modeKey]) {
      prompt += `\n\n**Lab Mode:**\n${CONTEXT_PROMPTS[modeKey]}`;
    }
  }
  if (context.labAnalysis) {
    const a = context.labAnalysis;
    prompt += `\n\n**Live Strategy Snapshot (the user is looking at this right now):**\n`;
    prompt += `- Property: ${a.address ?? "(no address provided)"}\n`;
    prompt += `- Recommended lane: ${a.topLane ?? "(none)"} — verdict: ${a.topLaneVerdict ?? "(none)"}\n`;
    if (a.primaryMetric) {
      prompt += `- Primary metric: ${a.primaryMetric.label} = ${a.primaryMetric.value}\n`;
    }
    if (a.laneSummary && a.laneSummary.length > 0) {
      prompt += `- Lane board:\n`;
      for (const l of a.laneSummary.slice(0, 8)) {
        prompt += `  · ${l.label} (${l.verdict}): ${l.headline}\n`;
      }
    }
    if (a.risks && a.risks.length > 0) {
      prompt += `- Risks fired:\n`;
      for (const r of a.risks.slice(0, 6)) {
        prompt += `  · [${r.severity}] ${r.title}${r.detail ? ` — ${r.detail}` : ""}\n`;
      }
    }
    prompt += `\nGround your answer in the snapshot above. If a number is not in the snapshot, do not invent one — say "not enough input yet" and name what's missing.`;
  }

  return prompt;
}

// Get suggestion chips based on context
export function getSuggestions(context: PeggyContext): string[] {
  const key = context.page || 'default';
  return CONTEXT_SUGGESTIONS[key] || CONTEXT_SUGGESTIONS['default'];
}

// Send a message to Peggy and get a response
export async function chat(
  message: string,
  conversationId: number,
  context: PeggyContext = {}
): Promise<{ response: string; messageId: number }> {
  // Get conversation history
  const messages = await storage.getPeggyMessages(conversationId);
  
  // Build the message history
  const chatHistory: ChatMessage[] = [
    { role: 'system', content: buildSystemPrompt(context) }
  ];
  
  // Add conversation history
  for (const msg of messages) {
    chatHistory.push({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    });
  }
  
  // Add the new user message
  chatHistory.push({ role: 'user', content: message });
  
  // Save the user message with context snapshot
  const userMessage = await storage.createPeggyMessage({
    conversationId,
    role: 'user',
    content: message,
    contextSnapshot: context as any
  });
  
  try {
    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: chatHistory.map(m => ({
        role: m.role,
        content: m.content
      })),
      max_tokens: 1024,
      temperature: 0.7,
    });
    
    const responseContent = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";
    
    // Save the assistant response with model info
    const assistantMessage = await storage.createPeggyMessage({
      conversationId,
      role: 'assistant',
      content: responseContent,
      model: DEFAULT_MODEL
    });
    
    // Update conversation context fields
    await storage.updatePeggyConversation(conversationId, {
      contextType: context.calculatorType ? 'calculator' : context.dealType ? 'deal' : 'page',
      contextPage: context.page,
      contextDealType: context.dealType,
      contextDealId: context.dealId,
      contextCalculator: context.calculatorType
    });
    
    return {
      response: responseContent,
      messageId: assistantMessage.id
    };
  } catch (error: any) {
    console.error('Peggy chat error:', error);
    
    // Save error message
    const errorMessage = await storage.createPeggyMessage({
      conversationId,
      role: 'assistant',
      content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
    });
    
    throw error;
  }
}

// Start a new conversation
export async function startConversation(
  userId?: string,
  sessionId?: string,
  context: PeggyContext = {}
): Promise<PeggyConversation> {
  // Generate a title based on context
  let title = 'New Conversation';
  if (context.page) {
    if (context.page.startsWith('calculator-')) {
      title = `${context.calculatorType || 'Calculator'} Analysis`;
    } else if (context.page === 'dealflow-deals') {
      title = 'Deal Discovery';
    } else if (context.dealType && context.dealId) {
      title = `${context.dealType} Deal #${context.dealId}`;
    }
  }
  
  // SessionId is required, so generate one if not provided
  const actualSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const conversation = await storage.createPeggyConversation({
    userId,
    sessionId: actualSessionId,
    title,
    contextType: context.calculatorType ? 'calculator' : context.dealType ? 'deal' : 'page',
    contextPage: context.page,
    contextDealType: context.dealType,
    contextDealId: context.dealId,
    contextCalculator: context.calculatorType
  });
  
  return conversation;
}

// Get or create a conversation for the current session
export async function getOrCreateConversation(
  userId?: string,
  sessionId?: string,
  context: PeggyContext = {}
): Promise<PeggyConversation> {
  // Look for existing conversations
  const conversations = await storage.getPeggyConversations(userId, sessionId);
  
  // Return the most recent conversation if it exists and is recent (within 1 hour)
  if (conversations.length > 0) {
    const latest = conversations[0];
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (latest.updatedAt && new Date(latest.updatedAt) > oneHourAgo) {
      return latest;
    }
  }
  
  // Create a new conversation
  return startConversation(userId, sessionId, context);
}

// Quick analysis helper - for calculator "Ask Peggy" button
export async function analyzeCalculatorResults(
  calculatorType: string,
  inputs: Record<string, any>,
  results: Record<string, any>,
  userId?: string,
  sessionId?: string
): Promise<{ response: string; conversationId: number }> {
  const context: PeggyContext = {
    page: `calculator-${calculatorType}`,
    calculatorType,
    calculatorInputs: inputs,
    calculatorResults: results
  };
  
  // Create a dedicated conversation for this analysis
  const conversation = await startConversation(userId, sessionId, context);
  
  // Generate analysis prompt
  const analysisPrompt = `I just ran the ${calculatorType.toUpperCase()} calculator with these results. Please analyze this deal and give me your honest assessment. Is this a good opportunity? What should I be aware of?`;
  
  const result = await chat(analysisPrompt, conversation.id, context);
  
  return {
    response: result.response,
    conversationId: conversation.id
  };
}

export default {
  chat,
  startConversation,
  getOrCreateConversation,
  getSuggestions,
  analyzeCalculatorResults
};
