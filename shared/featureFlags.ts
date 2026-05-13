/**
 * Feature Flags System for Pegasus DreamScapes
 * 
 * Controls feature availability across Production vs Development environments.
 * Features are disabled by default on Production and enabled on Development/Staging.
 * 
 * Usage:
 *   import { flags, isProduction, isBeta } from '@shared/featureFlags';
 *   
 *   if (flags.negotiationRoomV2) { ... }
 *   if (isBeta('marketflow')) { ... }
 */

// Environment detection - works on both server (process.env) and client (import.meta.env)
const getEnv = (): 'production' | 'staging' | 'development' => {
  // Check for explicit APP_ENV first
  const appEnv = typeof process !== 'undefined' 
    ? process.env.APP_ENV || process.env.NEXT_PUBLIC_APP_ENV
    : typeof import.meta !== 'undefined' 
      ? (import.meta as any).env?.VITE_APP_ENV 
      : undefined;
  
  if (appEnv === 'production') return 'production';
  if (appEnv === 'staging') return 'staging';
  
  // Fallback to NODE_ENV
  const nodeEnv = typeof process !== 'undefined' ? process.env.NODE_ENV : 'development';
  return nodeEnv === 'production' ? 'production' : 'development';
};

export const currentEnv = getEnv();
export const isProduction = currentEnv === 'production';
export const isStaging = currentEnv === 'staging';
export const isDevelopment = currentEnv === 'development';

/**
 * Feature flags configuration
 * 
 * Each flag can be:
 * - boolean: same value across all environments
 * - object: different values per environment { production, staging, development }
 */
const flagDefinitions = {
  // MarketFlow Beta Features
  marketflowBeta: true,                    // Show beta badge/banner (always on until launch)
  marketflowEnabled: true,                 // MarketFlow is accessible
  
  // Negotiation Features
  negotiationRoomV2: {
    production: true,                      // Enabled in production
    staging: true,
    development: true,
  },
  offerStudioEnabled: {
    production: true,
    staging: true,
    development: true,
  },
  
  // Capital Raise Features
  capitalRaiseFormsV2: {
    production: false,                     // Not ready for production
    staging: true,
    development: true,
  },
  debtEquityHybridForms: {
    production: false,
    staging: true,
    development: true,
  },
  
  // Advanced Features (Coming Soon)
  documentUploads: {
    production: false,
    staging: true,
    development: true,
  },
  underwritingTools: {
    production: false,
    staging: false,
    development: true,
  },
  advancedAnalytics: {
    production: false,
    staging: true,
    development: true,
  },
  
  // AI Features
  peggyAIEnabled: true,                    // Peggy AI is always available
  peggyNegotiationAdvice: {
    production: true,
    staging: true,
    development: true,
  },
  
  // Debug/Dev Tools
  showDebugPanel: {
    production: false,
    staging: true,
    development: true,
  },
  verboseLogging: {
    production: false,
    staging: true,
    development: true,
  },
} as const;

type FlagKey = keyof typeof flagDefinitions;
type FlagValue = boolean | { production: boolean; staging: boolean; development: boolean };

/**
 * Resolve a flag value based on current environment
 */
function resolveFlag(value: FlagValue): boolean {
  if (typeof value === 'boolean') return value;
  return value[currentEnv];
}

/**
 * Resolved feature flags for current environment
 */
export const flags: Record<FlagKey, boolean> = Object.fromEntries(
  Object.entries(flagDefinitions).map(([key, value]) => [key, resolveFlag(value as FlagValue)])
) as Record<FlagKey, boolean>;

/**
 * Check if a specific feature/section is in Beta mode
 */
export function isBeta(section: 'marketflow' | 'capital' | 'negotiation' | 'offers'): boolean {
  switch (section) {
    case 'marketflow':
      return flags.marketflowBeta;
    case 'capital':
      return !flags.capitalRaiseFormsV2;
    case 'negotiation':
      return false; // Negotiation is ready
    case 'offers':
      return false; // Offers are ready
    default:
      return true;
  }
}

/**
 * Get list of features that are "Coming Soon" for display
 */
export function getComingSoonFeatures(): string[] {
  const features: string[] = [];
  
  if (!flags.capitalRaiseFormsV2) {
    features.push('Advanced Capital Raise Forms');
  }
  if (!flags.debtEquityHybridForms) {
    features.push('Debt/Equity/Hybrid Investment Structures');
  }
  if (!flags.documentUploads) {
    features.push('Document Upload & Management');
  }
  if (!flags.underwritingTools) {
    features.push('Underwriting Analysis Tools');
  }
  if (!flags.advancedAnalytics) {
    features.push('Advanced Portfolio Analytics');
  }
  
  return features;
}

/**
 * Get list of features that are currently available
 */
export function getAvailableFeatures(): string[] {
  return [
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
  ];
}

/**
 * Feature gate component helper - returns true if feature should be shown
 */
export function isFeatureEnabled(feature: FlagKey): boolean {
  return flags[feature];
}

/**
 * Log current feature flag state (for debugging)
 */
export function logFlagState(): void {
  if (flags.verboseLogging) {
    console.log('[FeatureFlags] Environment:', currentEnv);
    console.log('[FeatureFlags] Flags:', flags);
  }
}
