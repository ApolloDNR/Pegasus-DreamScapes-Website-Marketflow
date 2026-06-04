import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";

export interface PeggyContextData {
  page?: string;
  userRole?: string;
  dealId?: number;
  dealType?: 'capital' | 'wholesale' | 'retail';
  calculatorType?: string;
  calculatorInputs?: Record<string, any>;
  calculatorResults?: Record<string, any>;
  // Strategy Lab (Task #85): live snapshot the user is looking at + lab mode.
  labMode?: 'explain' | 'stress' | 'prepare';
  labAnalysis?: {
    address?: string | null;
    topLane?: string | null;
    topLaneLabel?: string | null;
    topLaneVerdict?: string | null;
    confidenceScore?: number | null;
    memoParagraph?: string | null;
    memoNextStep?: string | null;
    laneSummary?: Array<{ lane: string; label: string; verdict: string; headline: string }>;
    primaryMetric?: { label: string; value: string } | null;
    risks?: Array<{ severity: string; title: string; detail?: string }>;
    inputs?: Record<string, any>;
  };
}

interface PeggyContextValue {
  context: PeggyContextData;
  sessionId: string;
  isOpen: boolean;
  pendingPrompt: string | null;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  updateContext: (updates: Partial<PeggyContextData>) => void;
  setCalculatorData: (type: string, inputs: Record<string, any>, results: Record<string, any>) => void;
  setDealContext: (dealType: 'capital' | 'wholesale' | 'retail', dealId: number) => void;
  setPendingPrompt: (prompt: string | null) => void;
  consumePendingPrompt: () => string | null;
  clearContext: () => void;
}

const PeggyContext = createContext<PeggyContextValue | undefined>(undefined);

function getPageFromPath(pathname: string): string {
  const path = pathname.toLowerCase();
  
  if (path === '/' || path === '/home') return 'home';
  if (path === '/about') return 'about';
  if (path === '/deal-architecture') return 'deal-architecture';
  if (path === '/development' || path === '/services') return 'development';
  if (path === '/work-with-apollo') return 'work-with-apollo';
  if (path === '/connect') return 'connect';
  if (path === '/peggy-ai') return 'peggy-ai';
  if (path === '/ecosystem') return 'ecosystem';
  if (path === '/dreamscaper-standard') return 'dreamscaper-standard';
  if (path === '/submit' || path === '/sell') return 'submit';
  if (path === '/buy') return 'buy';
  if (path === '/capital' || path === '/invest') return 'capital';
  if (path === '/library' || path.startsWith('/library/') || path === '/resources' || path === '/education') return 'library';
  if (path === '/contact') return 'contact';
  
  if (path.includes('/calculator')) {
    if (path.includes('arv')) return 'calculator-arv';
    if (path.includes('roi')) return 'calculator-roi';
    if (path.includes('brrrr')) return 'calculator-brrrr';
    if (path.includes('cash-flow') || path.includes('cashflow')) return 'calculator-cashflow';
    if (path.includes('mao') || path.includes('wholesale')) return 'calculator-mao';
    if (path.includes('piti') || path.includes('mortgage')) return 'calculator-piti';
    if (path.includes('ownvsrent') || path.includes('rent')) return 'calculator-ownvsrent';
    if (path.includes('hardmoney') || path.includes('hard-money')) return 'calculator-hardmoney';
    return 'calculator';
  }
  
  if (path.includes('/marketflow')) {
    if (path.includes('/admin')) return 'marketflow-admin';
    if (path.includes('/wholesaler')) return 'marketflow-wholesaler';
    if (path.includes('/dreamscaper')) return 'marketflow-dreamscaper';
    if (path.includes('/investor')) return 'marketflow-investor';
    if (path.includes('/buyer')) return 'marketflow-buyer';
    if (path.includes('/deals/') && path.includes('/negotiate')) return 'marketflow-negotiate';
    if (path.includes('/deals/')) return 'marketflow-deal-detail';
    if (path.includes('/deals')) return 'marketflow-deals';
    if (path.includes('/capital/')) return 'marketflow-capital-detail';
    if (path.includes('/capital')) return 'marketflow-capital';
    if (path.includes('/properties/')) return 'marketflow-property-detail';
    if (path.includes('/properties')) return 'marketflow-properties';
    if (path.includes('/submit')) return 'marketflow-submit';
    if (path.includes('/offer-studio')) return 'offer-studio';
    if (path.includes('/community')) return 'marketflow-community';
    if (path.includes('/messages')) return 'marketflow-messages';
    if (path.includes('/analytics')) return 'marketflow-analytics';
    if (path.includes('/dashboard')) return 'marketflow-dashboard';
    if (path.includes('/calculators')) return 'marketflow-calculators';
    if (path.includes('/resources')) return 'marketflow-resources';
    return 'marketflow';
  }
  
  if (path.includes('/offer-studio')) return 'offer-studio';
  
  if (path.includes('/dealflow/hq')) {
    if (path.includes('leads')) return 'hq-leads';
    if (path.includes('deals')) return 'hq-deals';
    return 'hq-dashboard';
  }
  
  if (path.includes('/dealflow')) {
    if (path.includes('/office')) return 'dealflow-office';
    if (path.includes('/deals') || path.includes('/discover')) return 'dealflow-deals';
    if (path.includes('/community')) return 'dealflow-community';
    if (path.includes('/messages')) return 'dealflow-messages';
    if (path.includes('/project/')) return 'capital-project';
    if (path.includes('/wholesale/')) return 'wholesale-deal';
    if (path.includes('/retail/') || path.includes('/listing/')) return 'retail-listing';
    return 'dealflow';
  }
  
  return 'general';
}

interface RoleFlags {
  isAdmin: boolean;
  isDreamscaper: boolean;
  isInvestor: boolean;
  isWholesaler: boolean;
  isBuyer: boolean;
  isAuthenticated: boolean;
}

function getUserRole(flags: RoleFlags): string {
  if (!flags.isAuthenticated) return 'guest';
  
  if (flags.isAdmin) return 'staff';
  if (flags.isDreamscaper) return 'dreamscaper';
  if (flags.isInvestor) return 'investor';
  if (flags.isWholesaler) return 'wholesaler';
  if (flags.isBuyer) return 'buyer';
  
  return 'member';
}

function generateSessionId(): string {
  const stored = localStorage.getItem('peggy_session_id');
  if (stored) return stored;
  
  const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('peggy_session_id', newId);
  return newId;
}

interface PeggyProviderProps {
  children: ReactNode;
}

export function PeggyProvider({ children }: PeggyProviderProps) {
  const [location] = useLocation();
  const { isAuthenticated, isAdmin, isDreamscaper, isInvestor, isWholesaler, isBuyer } = useSupabaseAuth();
  const [sessionId] = useState(generateSessionId);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingPrompt, setPendingPromptState] = useState<string | null>(null);
  
  const roleFlags: RoleFlags = { isAuthenticated, isAdmin, isDreamscaper, isInvestor, isWholesaler, isBuyer };
  
  const [context, setContext] = useState<PeggyContextData>({
    page: getPageFromPath(location),
    userRole: getUserRole(roleFlags)
  });
  
  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen(prev => !prev), []);
  
  useEffect(() => {
    setContext(prev => ({
      ...prev,
      page: getPageFromPath(location)
    }));
  }, [location]);
  
  useEffect(() => {
    setContext(prev => ({
      ...prev,
      userRole: getUserRole(roleFlags)
    }));
  }, [isAuthenticated, isAdmin, isDreamscaper, isInvestor, isWholesaler, isBuyer]);
  
  const updateContext = useCallback((updates: Partial<PeggyContextData>) => {
    setContext(prev => ({ ...prev, ...updates }));
  }, []);
  
  const setCalculatorData = useCallback((
    type: string, 
    inputs: Record<string, any>, 
    results: Record<string, any>
  ) => {
    setContext(prev => ({
      ...prev,
      page: `calculator-${type}`,
      calculatorType: type,
      calculatorInputs: inputs,
      calculatorResults: results
    }));
  }, []);
  
  const setDealContext = useCallback((
    dealType: 'capital' | 'wholesale' | 'retail',
    dealId: number
  ) => {
    const pageMap = {
      capital: 'capital-project',
      wholesale: 'wholesale-deal',
      retail: 'retail-listing'
    };
    
    setContext(prev => ({
      ...prev,
      page: pageMap[dealType],
      dealType,
      dealId
    }));
  }, []);
  
  const setPendingPrompt = useCallback((prompt: string | null) => {
    setPendingPromptState(prompt);
  }, []);
  
  const consumePendingPrompt = useCallback((): string | null => {
    let value: string | null = null;
    setPendingPromptState((prev) => {
      value = prev;
      return null;
    });
    return value;
  }, []);
  
  const clearContext = useCallback(() => {
    setContext({
      page: getPageFromPath(location),
      userRole: getUserRole(roleFlags)
    });
  }, [location, isAuthenticated, isAdmin, isDreamscaper, isInvestor, isWholesaler, isBuyer]);
  
  const value: PeggyContextValue = {
    context,
    sessionId,
    isOpen,
    pendingPrompt,
    openChat,
    closeChat,
    toggleChat,
    updateContext,
    setCalculatorData,
    setDealContext,
    setPendingPrompt,
    consumePendingPrompt,
    clearContext
  };
  
  return (
    <PeggyContext.Provider value={value}>
      {children}
    </PeggyContext.Provider>
  );
}

export function usePeggyContext() {
  const context = useContext(PeggyContext);
  if (!context) {
    throw new Error('usePeggyContext must be used within a PeggyProvider');
  }
  return context;
}

export default PeggyContext;
