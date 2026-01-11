import { useState, useEffect } from 'react';
import { X, Construction, Rocket, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFeatureFlags } from '@/hooks/use-feature-flags';

interface BetaBannerProps {
  section?: 'marketflow' | 'capital' | 'negotiation' | 'offers';
  showFeatureLists?: boolean;
  dismissible?: boolean;
}

export function BetaBanner({ 
  section = 'marketflow', 
  showFeatureLists = false,
  dismissible = true 
}: BetaBannerProps) {
  const { isBeta, getAvailableFeatures, getComingSoonFeatures } = useFeatureFlags();
  const [isDismissed, setIsDismissed] = useState(false);
  
  useEffect(() => {
    const dismissed = localStorage.getItem(`beta-banner-dismissed-${section}`);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, [section]);
  
  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(`beta-banner-dismissed-${section}`, 'true');
  };
  
  if (!isBeta(section) || isDismissed) {
    return null;
  }
  
  const availableFeatures = getAvailableFeatures();
  const comingSoonFeatures = getComingSoonFeatures();
  
  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-b border-amber-500/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Construction className="w-5 h-5 text-amber-600" />
              <Badge variant="outline" className="bg-amber-500/20 text-amber-700 border-amber-500/30 font-semibold">
                BETA
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-semibold text-foreground">MarketFlow Beta</span>
              <span className="text-sm text-muted-foreground hidden sm:inline">—</span>
              <span className="text-sm text-muted-foreground">
                Some features may be limited while we finalize v1.
              </span>
            </div>
          </div>
          {dismissible && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0 h-8 w-8"
              onClick={handleDismiss}
              data-testid="button-dismiss-beta-banner"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {showFeatureLists && (
          <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-amber-500/20">
            <Card className="bg-background/50 border-green-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  Available Now
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-sm space-y-1">
                  {availableFeatures.slice(0, 6).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-background/50 border-amber-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-700">
                  <Clock className="w-4 h-4" />
                  Coming Next
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-sm space-y-1">
                  {comingSoonFeatures.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-1 h-1 rounded-full bg-amber-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export function BetaBadge({ className = '' }: { className?: string }) {
  const { isBeta } = useFeatureFlags();
  
  if (!isBeta('marketflow')) {
    return null;
  }
  
  return (
    <Badge 
      variant="outline" 
      className={`bg-amber-500/20 text-amber-700 border-amber-500/30 text-xs font-medium ${className}`}
    >
      BETA
    </Badge>
  );
}

export function ComingSoonOverlay({ feature }: { feature: string }) {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
      <div className="text-center p-6">
        <Rocket className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold text-lg mb-1">Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {feature} is currently under development and will be available soon.
        </p>
      </div>
    </div>
  );
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback 
}: { 
  feature: keyof ReturnType<typeof useFeatureFlags>['flags'];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { flags } = useFeatureFlags();
  
  if (flags[feature]) {
    return <>{children}</>;
  }
  
  return fallback ? <>{fallback}</> : null;
}
