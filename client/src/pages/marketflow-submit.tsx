import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useDemoMode } from "@/contexts/demo-mode-context";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { WholesaleDealForm } from "@/components/wholesale-deal-form";
import { CapitalRaiseForm } from "@/components/capital-raise-form";
import { ListingForm } from "@/components/listing-form";
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
  Wrench,
  Handshake,
  PiggyBank,
  Home
} from "lucide-react";

export default function MarketflowSubmit() {
  const { user, isLoading, isWholesaler, isDreamscaper, userRole, isGuestMode } = useSupabaseAuth();
  const { isDemoMode } = useDemoMode();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isPegasus = userRole?.startsWith("pegasus_") || false;
  const canSubmit = isWholesaler || isDreamscaper;
  const isPreviewMode = isDemoMode || isGuestMode;

  // Anonymous and out-of-role users get the marketing-style gate
  // WITHOUT the authenticated MarketplaceLayout sidebar. Auditor flagged
  // the sidebar leaking to public visitors as the biggest visual whiplash.
  if (!user && !isPreviewMode) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-24">
        <LockedScreen reason="login" />
      </div>
    );
  }

  if (user && !canSubmit && !isPreviewMode) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-24">
        <LockedScreen reason="role" currentRole={userRole} />
      </div>
    );
  }

  return (
    <MarketplaceLayout>
      <AuthenticatedSubmitPage isPegasus={isPegasus} isPreviewMode={isPreviewMode} />
    </MarketplaceLayout>
  );
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

function AuthenticatedSubmitPage({ isPegasus, isPreviewMode = false }: { isPegasus: boolean; isPreviewMode?: boolean }) {
  const [submitType, setSubmitType] = useState<"wholesale" | "capital" | "listing">("wholesale");
  
  return (
    <div className="space-y-6">
      {isPreviewMode && (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="font-medium">Preview Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    You're viewing the submission forms in preview mode. Sign up as a Wholesaler to submit deals.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/signup">
                  <Button size="sm" data-testid="button-signup-preview">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Sign Up to Submit
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          {isPreviewMode && (
            <Badge variant="outline" className="gap-1 text-amber-600 border-amber-500/50">
              <Lock className="w-3 h-3" />
              Preview
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          {isPreviewMode 
            ? "Explore our deal submission process. Sign up to submit your own deals."
            : "Submit your deal for review. Approved deals will be listed in MarketFlow for investors to discover."}
        </p>
      </div>

      <Tabs value={submitType} onValueChange={(v) => setSubmitType(v as "wholesale" | "capital" | "listing")} className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3 mb-6">
          <TabsTrigger value="wholesale" className="gap-2" data-testid="tab-submit-wholesale">
            <Handshake className="w-4 h-4" />
            <span className="hidden sm:inline">Wholesale</span>
          </TabsTrigger>
          <TabsTrigger value="capital" className="gap-2" data-testid="tab-submit-capital">
            <PiggyBank className="w-4 h-4" />
            <span className="hidden sm:inline">Capital Raise</span>
          </TabsTrigger>
          <TabsTrigger value="listing" className="gap-2" data-testid="tab-submit-listing">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Listing</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wholesale">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <WholesaleDealForm onSuccess={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} />
            </div>
            <WholesaleSidebar isPegasus={isPegasus} />
          </div>
        </TabsContent>

        <TabsContent value="capital">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <CapitalRaiseForm onSuccess={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} />
            </div>
            <CapitalRaiseSidebar isPegasus={isPegasus} />
          </div>
        </TabsContent>

        <TabsContent value="listing">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <ListingForm onSuccess={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} />
            </div>
            <ListingSidebar isPegasus={isPegasus} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WholesaleSidebar({ isPegasus }: { isPegasus: boolean }) {
  return (
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
  );
}

function CapitalRaiseSidebar({ isPegasus }: { isPegasus: boolean }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-green-600" />
            Capital Raise Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Clear investment thesis and exit strategy</span>
            </li>
            <li className="flex items-start gap-3">
              <DollarSign className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Realistic projected returns with supporting data</span>
            </li>
            <li className="flex items-start gap-3">
              <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Operator track record and experience</span>
            </li>
            <li className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Proper deal structure and legal documentation</span>
            </li>
          </ul>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Investment Structures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-medium">Equity</p>
            <p className="text-muted-foreground text-xs">Ownership stake with profit sharing</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-medium">Debt</p>
            <p className="text-muted-foreground text-xs">Fixed interest loans with set terms</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-medium">Hybrid</p>
            <p className="text-muted-foreground text-xs">Combination of debt and equity</p>
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
              Featured placement to investors
            </p>
            <p className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              Verified operator badge
            </p>
            <p className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Priority capital matching
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ListingSidebar({ isPegasus }: { isPegasus: boolean }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Home className="w-5 h-5 text-green-600" />
            Listing Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Accurate property details and pricing</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>High-quality photos of the property</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Clear showing instructions</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Responsive contact information</span>
            </li>
          </ul>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Listing Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-medium">On Market</p>
            <p className="text-muted-foreground text-xs">Active MLS listings open to all buyers</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-medium">Off Market</p>
            <p className="text-muted-foreground text-xs">Exclusive listings for platform members</p>
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
              Featured listing placement
            </p>
            <p className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              Verified agent badge
            </p>
            <p className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Priority buyer matching
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
