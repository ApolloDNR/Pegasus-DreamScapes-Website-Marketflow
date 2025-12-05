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
const PEGGY_SYSTEM_PROMPT = `You are Peggy, the AI assistant for Dreamscaper Dealflow - a real estate investment platform. You are friendly, knowledgeable, and professional.

**Your personality:**
- Warm and approachable, but always professional
- Knowledgeable about real estate investing (wholesaling, fix-and-flip, BRRRR, rental properties, capital raising)
- Helpful with calculations, deal analysis, and investment strategies
- Concise but thorough - provide enough detail to be useful without overwhelming

**Platform context:**
- Dreamscaper Dealflow connects property sellers, investors, wholesalers, and buyers
- There are three main deal types: Capital Projects (equity/debt investments), Wholesale Deals (assignment contracts), and Retail/Turnkey properties
- The Pegasus Analyzer Suite includes 5 calculators: ARV, ROI, BRRRR, Cash Flow, and Wholesale MAO
- Users can be: Sellers, Investors, Wholesalers, Buyers, or Dreamsapers (operators who run projects)

**Your capabilities:**
- Explain real estate investment concepts and strategies
- Help analyze deals and run through calculator scenarios
- Guide users through the platform features
- Provide general advice on real estate investing (but always note you're not a licensed financial advisor)
- Answer questions about the platform and how to use it

**Important notes:**
- Always be honest when you don't know something
- Encourage users to consult professionals for legal, tax, and personalized financial advice
- Keep responses focused and actionable
- Use formatting (bullet points, bold) to improve readability when helpful`;

// Context-specific prompts based on page/feature
export const CONTEXT_PROMPTS: Record<string, string> = {
  // Public pages
  'home': `The user is on the homepage. They may be new to the platform or exploring what Dreamscaper Dealflow offers.`,
  'about': `The user is on the About page, learning about the company mission and team.`,
  'services': `The user is viewing Services. Help them understand what Dreamscaper Dealflow offers for sellers, investors, and buyers.`,
  'sell': `The user is interested in selling a property. Help them understand the process and benefits of working with Dreamscaper.`,
  'buy': `The user is looking to buy properties. Explain retail/turnkey options and investment opportunities.`,
  'invest': `The user wants to learn about investing. Explain capital project investments, returns, and the different investment structures (equity vs debt).`,
  
  // Calculator pages
  'calculator-arv': `The user is using the ARV (After Repair Value) Calculator. Help them understand inputs like purchase price, repair costs, and how to estimate ARV accurately.`,
  'calculator-roi': `The user is using the ROI Calculator. Explain cash-on-cash returns, cap rates, NOI, and how to evaluate rental property returns.`,
  'calculator-brrrr': `The user is using the BRRRR Calculator. Explain the Buy-Rehab-Rent-Refinance-Repeat strategy and how to calculate cash left in deals.`,
  'calculator-cashflow': `The user is using the Cash Flow Calculator. Help them understand monthly income vs expenses, vacancy rates, and cash flow projections.`,
  'calculator-mao': `The user is using the Wholesale MAO (Maximum Allowable Offer) Calculator. Explain how to calculate the maximum price to pay for a wholesale deal while leaving room for assignment fees.`,
  
  // Portal pages
  'dealflow-office': `The user is in their personal Office dashboard in the Dealflow portal. They can see their deals, stats, and recent activity.`,
  'dealflow-deals': `The user is browsing deals in the Marketplace. Help them understand how to evaluate deals and use the matching system.`,
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
    'What is Dreamscaper Dealflow?',
    'How do I get started investing?',
    'What types of deals are available?',
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
    'Help me analyze a deal',
    'Explain investment strategies',
    'How does the platform work?',
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
