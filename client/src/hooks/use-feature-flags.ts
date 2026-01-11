/**
 * React hook for accessing feature flags
 * 
 * Usage:
 *   const { flags, isBeta, isFeatureEnabled } = useFeatureFlags();
 */

import { useMemo } from 'react';

// Environment detection for client-side
const getEnv = (): 'production' | 'staging' | 'development' => {
  const appEnv = import.meta.env.VITE_APP_ENV as string | undefined;
  
  if (appEnv === 'production') return 'production';
  if (appEnv === 'staging') return 'staging';
  
  return import.meta.env.MODE === 'production' ? 'production' : 'development';
};

const currentEnv = getEnv();

const flagDefinitions = {
  marketflowBeta: true,
  marketflowEnabled: true,
  negotiationRoomV2: { production: true, staging: true, development: true },
  offerStudioEnabled: { production: true, staging: true, development: true },
  capitalRaiseFormsV2: { production: false, staging: true, development: true },
  debtEquityHybridForms: { production: false, staging: true, development: true },
  documentUploads: { production: false, staging: true, development: true },
  underwritingTools: { production: false, staging: false, development: true },
  advancedAnalytics: { production: false, staging: true, development: true },
  peggyAIEnabled: true,
  peggyNegotiationAdvice: { production: true, staging: true, development: true },
  showDebugPanel: { production: false, staging: true, development: true },
  verboseLogging: { production: false, staging: true, development: true },
} as const;

type FlagKey = keyof typeof flagDefinitions;
type FlagValue = boolean | { production: boolean; staging: boolean; development: boolean };

function resolveFlag(value: FlagValue): boolean {
  if (typeof value === 'boolean') return value;
  return value[currentEnv];
}

const resolvedFlags: Record<FlagKey, boolean> = Object.fromEntries(
  Object.entries(flagDefinitions).map(([key, value]) => [key, resolveFlag(value as FlagValue)])
) as Record<FlagKey, boolean>;

export type FeatureFlags = typeof resolvedFlags;

export function useFeatureFlags() {
  return useMemo(() => ({
    flags: resolvedFlags,
    currentEnv,
    isProduction: currentEnv === 'production',
    isStaging: currentEnv === 'staging',
    isDevelopment: currentEnv === 'development',
    
    isBeta: (section: 'marketflow' | 'capital' | 'negotiation' | 'offers'): boolean => {
      switch (section) {
        case 'marketflow': return resolvedFlags.marketflowBeta;
        case 'capital': return !resolvedFlags.capitalRaiseFormsV2;
        case 'negotiation': return false;
        case 'offers': return false;
        default: return true;
      }
    },
    
    isFeatureEnabled: (feature: FlagKey): boolean => resolvedFlags[feature],
    
    getComingSoonFeatures: (): string[] => {
      const features: string[] = [];
      if (!resolvedFlags.capitalRaiseFormsV2) features.push('Advanced Capital Raise Forms');
      if (!resolvedFlags.debtEquityHybridForms) features.push('Debt/Equity/Hybrid Investment Structures');
      if (!resolvedFlags.documentUploads) features.push('Document Upload & Management');
      if (!resolvedFlags.underwritingTools) features.push('Underwriting Analysis Tools');
      if (!resolvedFlags.advancedAnalytics) features.push('Advanced Portfolio Analytics');
      return features;
    },
    
    getAvailableFeatures: (): string[] => [
      'Browse Wholesale Deals',
      'Browse Capital Raises',
      'Browse Listings',
      'View Deal Details',
      'Save Deals to Watchlist',
      'Accept Terms (Quick Offer)',
      'Counter Offers',
      'Negotiation Room with Chat',
      'Peggy AI Assistant',
      'Match Score Compatibility',
    ],
  }), []);
}

export { resolvedFlags as flags, currentEnv };
