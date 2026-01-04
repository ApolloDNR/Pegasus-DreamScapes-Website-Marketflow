import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { WholesaleDealForm } from "@/components/wholesale-deal-form";
import { Link } from "wouter";
import {
  ArrowRight,
  FileText,
  DollarSign,
  CheckCircle,
  Users,
  Shield,
  TrendingUp,
  Loader2,
  Sparkles,
  Crown,
  Target,
  Building2,
  Clock,
  Award,
  Lock,
  AlertCircle,
  Wrench
} from "lucide-react";

export default function MarketflowSubmit() {
  return (
    <MarketplaceLayout>
      <SubmitPage />
    </MarketplaceLayout>
  );
}

function SubmitPage() {
  const { user, isLoading, isWholesaler, isDreamscaper, userRole } = useSupabaseAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const isPegasus = userRole?.startsWith("pegasus_") || false;
  const canSubmit = isWholesaler || isDreamscaper;
  
  if (!user) {
    return <LockedScreen reason="login" />;
  }
  
  if (!canSubmit) {
    return <LockedScreen reason="role" currentRole={userRole} />;
  }
  
  return <AuthenticatedSubmitPage isPegasus={isPegasus} />;
}

function LockedScreen({ reason, currentRole }: { reason: "login" | "role"; currentRole?: string | null }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-lg w-full">
        <Card className="border-2 border-dashed border-muted-foreground/30 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-serif">Verification Required</CardTitle>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="outline" className="gap-1">
                <Wrench className="w-3 h-3" />
                Under Construction
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {reason === "login" ? (
              <>
                <p className="text-muted-foreground">
                  Sign in to your account to submit deals to the MarketFlow platform.
                </p>
                <div className="space-y-3">
                  <a href="/api/login">
                    <Button className="w-full gap-2" data-testid="button-login-submit">
                      <ArrowRight className="w-4 h-4" />
                      Sign In to Continue
                    </Button>
                  </a>
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-primary hover:underline">
                      Apply to become a Wholesaler
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <span className="font-medium">Access Restricted</span>
                  </div>
                  <p className="text-muted-foreground">
                    Only verified <span className="font-semibold text-foreground">Dreamscapers</span> and{" "}
                    <span className="font-semibold text-foreground">Wholesalers</span> can submit deals to the MarketFlow platform.
                  </p>
                  {currentRole && (
                    <p className="text-sm text-muted-foreground">
                      Your current role: <Badge variant="secondary">{currentRole.replace(/_/g, " ")}</Badge>
                    </p>
                  )}
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 text-left space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    How to Get Verified
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Complete your profile with business information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Submit verification documents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Pass our quick screening process</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Link href="/partner">
                    <Button className="w-full gap-2" data-testid="button-apply-wholesaler">
                      <Sparkles className="w-4 h-4" />
                      Apply to Become a Wholesaler
                    </Button>
                  </Link>
                  <Link href="/marketflow/discover">
                    <Button variant="outline" className="w-full gap-2" data-testid="button-browse-deals">
                      Browse Available Deals
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AuthenticatedSubmitPage({ isPegasus }: { isPegasus: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-submit-deal-title">
            Submit a Deal
          </h1>
          {isPegasus && (
            <Badge variant="default" className="gap-1">
              <Crown className="w-3 h-3" />
              Pegasus
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Submit your deal for review. Approved deals will be listed in MarketFlow for investors to discover.
        </p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <WholesaleDealForm onSuccess={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                What We Look For
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Clear title or path to clear title</span>
                </li>
                <li className="flex items-start gap-3">
                  <DollarSign className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Minimum 70% rule spread or better</span>
                </li>
                <li className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Accurate repair estimates with photos</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Reasonable closing timeline</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Review Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">1</div>
                <div>
                  <p className="font-medium">Initial Review</p>
                  <p className="text-muted-foreground text-xs">Within 24 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">2</div>
                <div>
                  <p className="font-medium">Deep Analysis</p>
                  <p className="text-muted-foreground text-xs">1-2 business days</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">3</div>
                <div>
                  <p className="font-medium">Approval Decision</p>
                  <p className="text-muted-foreground text-xs">You'll be notified</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {isPegasus && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  Pegasus Privileges
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Priority listing placement
                </p>
                <p className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Verified Pegasus badge on deals
                </p>
                <p className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Expedited review process
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
