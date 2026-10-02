import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSupabaseAuth } from "@/contexts/supabase-auth-context";
import { useDemoMode } from "@/contexts/demo-mode-context";
import { MarketplaceLayout } from "@/components/marketplace-layout";
import { useSEO } from "@/hooks/use-seo";
import { hasGovernedMarketflowAccess } from "@/lib/marketflow-access";
import { WholesaleDealForm } from "@/components/wholesale-deal-form";
import { ListingForm } from "@/components/listing-form";
import { Link } from "wouter";
import {
  ArrowRight,
  FileText,
  DollarSign,
  CheckCircle,
  Shield,
  Loader2,
  Crown,
  Target,
  Building2,
  Clock,
  Lock,
  AlertCircle,
  Wrench,
  Handshake,
  PiggyBank,
  Home
} from "lucide-react";

export default function MarketflowSubmit() {
  useSEO({
    title: "MarketFlow Submit",
    description: "Private MarketFlow submission surface.",
    noIndex: true,
  });
  const {
    user,
    profile,
    isLoading,
    isAuthenticated,
    isAdmin,
    isWholesaler,
    isDreamscaper,
    userRole,
    isGuestMode,
  } = useSupabaseAuth();
  const { isDemoMode } = useDemoMode();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isPegasus = userRole?.startsWith("pegasus_") || false;
  const hasGovernedAccess = hasGovernedMarketflowAccess({
    isAuthenticated,
    isGuestMode,
    isAdmin,
    profile,
    userRole,
  });
  const hasSubmissionRole = isWholesaler || isDreamscaper;
  const holdReason = isDemoMode || isGuestMode
    ? "preview"
    : !user
      ? "login"
      : !hasGovernedAccess
        ? "approval"
        : !hasSubmissionRole
          ? "role"
          : null;

  if (holdReason) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-24">
        <LockedScreen reason={holdReason} currentRole={userRole} />
      </div>
    );
  }

  return (
    <MarketplaceLayout>
      <AuthenticatedSubmitPage isPegasus={isPegasus} />
    </MarketplaceLayout>
  );
}

function LockedScreen({
  reason,
  currentRole,
}: {
  reason: "login" | "preview" | "approval" | "role";
  currentRole?: string | null;
}) {
  const explanation = reason === "login"
    ? "Signing in or creating a preview account does not unlock submissions. If you already have separately approved MarketFlow access, sign in to that account."
    : reason === "preview"
      ? "A preview role does not create private access. It is a walkthrough lens only and cannot view inventory or submit a record."
      : reason === "approval"
        ? "Your self-selected account role is declared interest only. It does not verify or approve you, and it does not grant MarketFlow inventory access or submission privileges."
        : "This governed account does not currently have a submission-capable operator role. Role and submission privileges are assigned separately.";

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-lg w-full">
        <Card className="border-2 border-dashed border-muted-foreground/30 bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-serif">Invitation and role approval required</CardTitle>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="outline" className="gap-1">
                <Wrench className="w-3 h-3" />
                Under Construction
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span className="font-medium">Private workspace unavailable</span>
              </div>
              <p className="text-muted-foreground">{explanation}</p>
              {currentRole ? (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span>Declared or assigned role:</span>
                  <Badge variant="secondary">{currentRole.replace(/_/g, " ")}</Badge>
                </div>
              ) : null}
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-left space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Controlled-pilot boundary
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                An access request records context for possible consideration only. It does
                not promise review, response, verification, approval, an invitation,
                inventory, or submission rights.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {reason === "login" ? (
                <a href="/login">
                  <Button variant="outline" className="w-full gap-2" data-testid="button-login-submit">
                    Sign in to an approved account
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              ) : null}
              <Link href="/marketflow/access">
                <Button className="w-full gap-2" data-testid="button-request-marketflow-access">
                  Record MarketFlow interest
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AuthenticatedSubmitPage({ isPegasus }: { isPegasus: boolean }) {
  const [submitType, setSubmitType] = useState<"wholesale" | "capital" | "listing">("wholesale");
  
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
          Submit a private record for possible consideration. Only a separately
          approved opportunity may later be made available to eligible MarketFlow participants.
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
            <span className="hidden sm:inline">Capital Info</span>
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
            <WholesaleSidebar />
          </div>
        </TabsContent>

        <TabsContent value="capital">
          <Card data-testid="capital-relationship-hold">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-primary" />
                Capital relationships begin privately
              </CardTitle>
              <CardDescription>
                MarketFlow is not accepting capital raise submissions through this form.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Pegasus does not publish user-created investment offerings or fundraising
                terms here. A capital conversation can begin only as a relationship inquiry;
                any project, diligence, eligibility, and written terms are handled separately.
              </p>
              <Link href="/capital#capital-introduction">
                <Button variant="outline" data-testid="button-capital-relationship-info">
                  Review the capital relationship process
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listing">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <ListingForm onSuccess={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} />
            </div>
            <ListingSidebar />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WholesaleSidebar() {
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
            <FileText className="w-5 h-5 text-primary" />
            Review sequence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">1</div>
            <div>
              <p className="font-medium">Record check</p>
              <p className="text-muted-foreground text-xs">Required fields and ownership context are checked</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">2</div>
            <div>
              <p className="font-medium">Fit assessment</p>
              <p className="text-muted-foreground text-xs">Numbers, title, access, and authorization may be verified</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">3</div>
            <div>
              <p className="font-medium">Outcome</p>
              <p className="text-muted-foreground text-xs">A status or next step is recorded when appropriate</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}

function ListingSidebar() {
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
            <p className="font-medium">Public listing</p>
            <p className="text-muted-foreground text-xs">Active listing distributed through its authorized listing channel</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-medium">Direct submission</p>
            <p className="text-muted-foreground text-xs">Private record shared only after review and authorization</p>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
