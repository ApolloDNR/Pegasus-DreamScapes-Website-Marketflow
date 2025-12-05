import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export interface PeggyContextData {
  page?: string;
  userRole?: string;
  dealId?: number;
  dealType?: 'capital' | 'wholesale' | 'retail';
  calculatorType?: string;
  calculatorInputs?: Record<string, any>;
  calculatorResults?: Record<string, any>;
}

interface PeggyContextValue {
  context: PeggyContextData;
  sessionId: string;
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  updateContext: (updates: Partial<PeggyContextData>) => void;
  setCalculatorData: (type: string, inputs: Record<string, any>, results: Record<string, any>) => void;
  setDealContext: (dealType: 'capital' | 'wholesale' | 'retail', dealId: number) => void;
  clearContext: () => void;
}

const PeggyContext = createContext<PeggyContextValue | undefined>(undefined);

function getPageFromPath(pathname: string): string {
  const path = pathname.toLowerCase();
  
  if (path === '/' || path === '/home') return 'home';
  if (path === '/about') return 'about';
  if (path === '/services') return 'services';
  if (path === '/sell') return 'sell';
  if (path === '/buy') return 'buy';
  if (path === '/invest') return 'invest';
  if (path === '/contact') return 'contact';
  
  if (path.includes('/calculator')) {
    if (path.includes('arv')) return 'calculator-arv';
    if (path.includes('roi')) return 'calculator-roi';
    if (path.includes('brrrr')) return 'calculator-brrrr';
    if (path.includes('cash-flow') || path.includes('cashflow')) return 'calculator-cashflow';
    if (path.includes('mao') || path.includes('wholesale')) return 'calculator-mao';
    return 'calculator';
  }
  
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

function getUserRole(user: any): string {
  if (!user) return 'guest';
  
  if (user.isStaff) return 'staff';
  if (user.roles?.includes('dreamscaper') || user.roles?.includes('operator')) return 'dreamscaper';
  if (user.roles?.includes('investor')) return 'investor';
  if (user.roles?.includes('wholesaler')) return 'wholesaler';
  if (user.roles?.includes('buyer')) return 'buyer';
  
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
  const { user } = useAuth();
  const [sessionId] = useState(generateSessionId);
  const [isOpen, setIsOpen] = useState(false);
  
  const [context, setContext] = useState<PeggyContextData>({
    page: getPageFromPath(location),
    userRole: getUserRole(user)
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
      userRole: getUserRole(user)
    }));
  }, [user]);
  
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
  
  const clearContext = useCallback(() => {
    setContext({
      page: getPageFromPath(location),
      userRole: getUserRole(user)
    });
  }, [location, user]);
  
  const value: PeggyContextValue = {
    context,
    sessionId,
    isOpen,
    openChat,
    closeChat,
    toggleChat,
    updateContext,
    setCalculatorData,
    setDealContext,
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
