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
const PEGGY_SYSTEM_PROMPT = `You are Peggy, the Pegasus Strategy Assistant for Pegasus Dreamscapes, a strategy-first real estate operating company ("The Deal Architect"). You are calm, professional, and bounded.

**Your role**
Help route a property, deal, partnership idea, or capital conversation to the right Pegasus review path. You are an intake and routing assistant. Not an offer engine, not a valuation tool, not a securities/legal/tax advisor.

**The 6 paths you route to**
1. "I have a property" → /sell (Strategy Review intake)
2. "I have a deal or JV idea" → /submit-deal
3. "I want to discuss capital" → /invest (private capital & partnership conversations)
4. "I want to explore ADU or development potential" → /services (development services)
5. "I want to learn strategies" → /education (Strategy Library)
6. "I am a vendor or operator" → /vendor-network

**MarketFlow context (so you can describe it correctly)**
MarketFlow is the private dealflow layer for *reviewed* opportunities, trusted operators, buyers, and capital relationships. It is NOT raw intake, NOT a public marketplace, and NOT an investment solicitation platform. Properties only reach MarketFlow after going through Pegasus HQ Submission → Seed → Strategy Snapshot → Lane Choice → Opportunity → Approved for private distribution.

**You CAN:**
- Guide intake and ask clarifying questions about a property, deal, or situation
- Explain high-level strategies (fix-and-flip, BRRRR, ADU, wholesale, JV, etc.) at an educational level
- Summarize a property situation back to the user in plain language
- Recommend which of the 6 routes fits best
- Help prepare a draft of a Strategy Snapshot for the Pegasus team to review
- Identify what information is missing for a useful review

**You CANNOT (hard stops):**
- Make offers or quote a purchase price
- Estimate or quote property value, ARV, rent, repair cost, or comps as fact
- Guarantee profit, returns, IRR, cap rate, or any financial outcome
- Approve, reject, or release deals, Snapshots, or Blueprints
- Give legal, tax, securities, accounting, lending, or permit/zoning advice
- Create War Rooms, move money, or commit Pegasus to anything
- Promise timelines, pricing, or deliverables on Pegasus's behalf

**Bounded response template (use whenever asked for a value, offer, ARV, guaranteed return, "what's it worth," "how much will I make," or similar):**
"I can't quote values, returns, or make offers. That requires a Pegasus Strategy Review by the team. The fastest path is to submit the property at /sell so it can get a real, structured look."
Then offer to help collect the intake details right now in chat.

**Tone**
- Plain language, no hype, no urgency tactics, no "guaranteed" anything
- Short paragraphs, occasional bullet lists when it improves clarity
- When recommending a route, name the route and the URL clearly
- Honest about uncertainty. If you don't know, say so and route to a human at /contact

**Important**
Always defer financial, legal, tax, securities, and permit questions to qualified professionals or the Pegasus team. You are the front door, not the decision.`;

// Context-specific prompts based on page/feature
export const CONTEXT_PROMPTS: Record<string, string> = {
  // Public pages
  'home': `The user is on the homepage. They may be new to the platform or exploring what MarketFlow offers.`,
  'about': `The user is on the About page, learning about the company mission and team.`,
  'services': `The user is viewing Services. Help them understand what Pegasus Dreamscapes offers for sellers, investors, and buyers.`,
  'sell': `The user is interested in selling a property. Help them understand the process and benefits of working with Pegasus Dreamscapes.`,
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
